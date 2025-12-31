<script lang="ts">
  import { onMount, tick } from "svelte";

  type Message = {
    sender: "user" | "ai";
    text: string;
  };

  type Conversation = {
    id: string;
    title: string | null;
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  let conversations: Conversation[] = [];
  let activeConversationId: string | null = null;
  let messages: Message[] = [];
  let input = "";
  let loading = false;
  let messagesEnd: HTMLDivElement;

  /* ------------------ Utils ------------------ */

  async function scrollToBottom() {
    await tick();
    messagesEnd?.scrollIntoView({ behavior: "smooth" });
  }

  /* ------------------ Data loaders ------------------ */

  async function loadConversations() {
    const res = await fetch(`${API_BASE}/chat/conversations`);
    conversations = await res.ok ? await res.json() : [];
  }

  async function loadHistory(conversationId: string) {
    const res = await fetch(`${API_BASE}/chat/history/${conversationId}`);
    messages = res.ok ? await res.json() : [];
    scrollToBottom();
  }

  /* ------------------ Chat selection ------------------ */

  async function selectConversation(convo: Conversation) {
    activeConversationId = convo.id;
    localStorage.setItem("activeConversationId", convo.id);
    await loadHistory(convo.id);
  }

  function startNewChat() {
    activeConversationId = null;
    messages = [];
    localStorage.removeItem("activeConversationId");
  }

  /* ------------------ Send message ------------------ */

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    input = "";

    messages = [...messages, { sender: "user", text: userMessage }];
    loading = true;
    scrollToBottom();

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: activeConversationId,
        }),
      });

      const data = await res.json();

      // First message of a new chat creates a conversation
      if (!activeConversationId) {
        activeConversationId = data.sessionId;
        localStorage.setItem("activeConversationId", data.sessionId);
      }

      await loadConversations();

      messages = [...messages, { sender: "ai", text: data.reply }];
    } catch {
      messages = [
        ...messages,
        { sender: "ai", text: "Sorry, something went wrong." },
      ];
    } finally {
      loading = false;
      scrollToBottom();
    }
  }

  /* ------------------ Lifecycle ------------------ */

  onMount(async () => {
    await loadConversations();

    // Restore active chat only on refresh
    const storedId = localStorage.getItem("activeConversationId");
    if (storedId) {
      activeConversationId = storedId;
      await loadHistory(storedId);
    }
  });
</script>

<style>
  .layout {
    display: flex;
    height: 100vh;
    font-family: system-ui, sans-serif;
  }

  .sidebar {
    width: 260px;
    border-right: 1px solid #ddd;
    padding: 12px;
    background: #f8fafc;
  }

  .new-chat {
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .chat-item {
    padding: 8px;
    margin-bottom: 6px;
    border-radius: 4px;
    cursor: pointer;
  }

  .chat-item.active {
    background: #e0e7ff;
    font-weight: bold;
  }

  .chat {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .message {
    max-width: 75%;
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 12px;
  }

  .user {
    background: #2563eb;
    color: white;
    margin-left: auto;
  }

  .ai {
    background: #f1f5f9;
  }

  .input-box {
    display: flex;
    padding: 8px;
    border-top: 1px solid #ddd;
  }

  input {
    flex: 1;
    padding: 10px;
  }

  button.send {
    margin-left: 8px;
    padding: 10px 14px;
  }

  .empty {
    color: #64748b;
    font-style: italic;
  }
</style>

<div class="layout">
  <!-- Sidebar -->
  <div class="sidebar">
    <button class="new-chat" on:click={startNewChat}>
      + New Chat
    </button>

    {#each conversations as convo}
      <div
        class="chat-item {convo.id === activeConversationId ? 'active' : ''}"
        on:click={() => selectConversation(convo)}
      >
        {convo.title ?? "Untitled chat"}
      </div>
    {/each}
  </div>

  <!-- Chat panel -->
  <div class="chat">
    <div class="messages">
      {#if messages.length === 0}
        <div class="empty">
          Start a new chat by typing a message below.
        </div>
      {/if}

      {#each messages as msg}
        <div class="message {msg.sender}">
          {msg.text}
        </div>
      {/each}

      {#if loading}
        <div class="message ai">Agent is typing…</div>
      {/if}

      <div bind:this={messagesEnd}></div>
    </div>

    <div class="input-box">
      <input
        placeholder="Type your message..."
        bind:value={input}
        on:keydown={(e) => e.key === "Enter" && sendMessage()}
        disabled={loading}
      />
      <button class="send" on:click={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  </div>
</div>
