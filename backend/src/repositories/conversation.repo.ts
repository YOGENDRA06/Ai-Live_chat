import prisma from "../db/prisma";

export async function createConversation(title?: string) {
  return prisma.conversation.create({
    data: {
      title,
    },
  });
}
11
export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
  });
}

export async function listConversations() {
  return prisma.conversation.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateConversationTitle(
  id: string,
  title: string
) {
  return prisma.conversation.update({
    where: { id },
    data: { title },
  });
}
