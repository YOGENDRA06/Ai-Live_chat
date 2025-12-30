import prisma from "../db/prisma";

export async function createConversation() {
  return prisma.conversation.create({
    data: {},
  });
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
  });
}
