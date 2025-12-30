import { Sender } from "@prisma/client";
import {
  createConversation,
  getConversationById,
} from "../repositories/conversation.repo";
import {
  createMessage,
  getMessagesByConversation,
} from "../repositories/message.repo";
import { generateReply } from "./llm.service";

export async function handleUserMessage(
  message: string,
  sessionId?: string
) {
  let conversation;

  // 1️⃣ Fetch existing conversation if sessionId provided
  if (sessionId) {
    conversation = await getConversationById(sessionId);
  }

  // 2️⃣ If no conversation found, create a new one
  if (!conversation) {
    conversation = await createConversation();
  }

  // 3️⃣ Save user message
  await createMessage(conversation.id, Sender.user, message);

  // 4️⃣ Fetch full conversation history
  const messages = await getMessagesByConversation(conversation.id);

  const history = messages.map((m) => ({
    sender: m.sender,
    text: m.text,
  }));

  // 5️⃣ Generate AI reply using LLM
  const aiReply = await generateReply(history, message);

  // 6️⃣ Save AI message
  await createMessage(conversation.id, Sender.ai, aiReply);

  // 7️⃣ Return response
  return {
    reply: aiReply,
    sessionId: conversation.id,
  };
}
