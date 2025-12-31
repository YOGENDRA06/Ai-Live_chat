import { Sender } from "@prisma/client";
import {
  createConversation,
  getConversationById,
  updateConversationTitle,
} from "../repositories/conversation.repo";
import {
  createMessage,
  getMessagesByConversation,
} from "../repositories/message.repo";
import { generateReply } from "./llm.service";

function generateTitleFromMessage(message: string): string {
  return message
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

export async function handleUserMessage(
  message: string,
  sessionId?: string
) {
  let conversation;

  if (sessionId) {
    conversation = await getConversationById(sessionId);
  }

  if (!conversation) {
    const title = generateTitleFromMessage(message);
    conversation = await createConversation(title);
  }

  await createMessage(conversation.id, Sender.user, message);

  const messages = await getMessagesByConversation(conversation.id);

  const history = messages.map((m) => ({
    sender: m.sender,
    text: m.text,
  }));

  const aiReply = await generateReply(history, message);

  await createMessage(conversation.id, Sender.ai, aiReply);

  // If title is missing (edge case), set it from first message
  if (!conversation.title) {
    await updateConversationTitle(
      conversation.id,
      generateTitleFromMessage(message)
    );
  }

  return {
    reply: aiReply,
    sessionId: conversation.id,
  };
}
