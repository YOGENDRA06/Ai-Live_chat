import prisma from "../db/prisma";
import { Sender } from "@prisma/client";

export async function createMessage(
  conversationId: string,
  sender: Sender,
  text: string
) {
  return prisma.message.create({
    data: {
      conversationId,
      sender,
      text,
    },
  });
}

export async function getMessagesByConversation(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}
