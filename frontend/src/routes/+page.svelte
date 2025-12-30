<script lang="ts">
  import { onMount, tick } from "svelte";

  type Message = {
    sender: "user" | "ai";
    text: string;
  };

  let messages: Message[] = [];
  let input = "";
  let loading = false;
  let sessionId: string | null = null;
  let messagesEnd: HTMLDivElement;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  async function scrollToBottom() {
    await tick();
    messagesEnd?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadHistory() {
    if (!sessionId) return;

    try {
      const res = await fetch(
        `${API_BASE}/chat/history/${sessionId}`
      );

      if (!res.ok) return;

      const data: Message[] = await res.json();
      messages = data;
      scrollToBottom();
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  }

  onMount(async () => {
    sessionId = localStorage.getItem("sessionId");
    await loadHistory();
  });

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();

      sessionId = data.sessionId;
      localStorage.setItem("sessionId", sessionId);

      messages = [...messages, { sender: "ai", text: data.reply }];
    } catch (err) {
      messages = [
        ...messages,
        {
          sender: "ai",
          text: "Sorry, something went wrong. Please try again.",
        },
      ];
    } finally {
      loading = false;
      scrollToBottom();
    }
  }
</script>

<style>
  .chat-container {
    max-width: 600px;
    margin: 40px auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 80vh;
    font-family: system-ui, sans-serif;
  }

  .header {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
    text-align: center;
    background: #f8fafc;
  }

  .messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #ffffff;
  }

  .message {
    margin-bottom: 12px;
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 12px;
    line-height: 1.4;
    font-size: 14px;
  }

  .user {
    align-self: flex-end;
    background: #2563eb;
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 0;
  }

  .ai {
    align-self: flex-start;
    background: #f1f5f9;
    border-bottom-left-radius: 0;
  }

  .input-box {
    display: flex;
    border-top: 1px solid #ddd;
    padding: 8px;
    background: #fafafa;
  }

  input {
    flex: 1;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    margin-left: 8px;
    padding: 10px 16px;
    font-size: 14px;
    border: none;
    background: #2563eb;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .typing {
    font-style: italic;
    color: #64748b;
    font-size: 13px;
  }
</style>

<div class="chat-container">
  <div class="header">AI Support Chat</div>

  <div class="messages">
    {#each messages as msg}
      <div class="message {msg.sender}">
        {msg.text}
      </div>
    {/each}

    {#if loading}
      <div class="message ai typing">Agent is typing…</div>
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
    <button on:click={sendMessage} disabled={loading}>
      Send
    </button>
  </div>
</div>
