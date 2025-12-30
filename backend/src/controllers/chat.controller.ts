import { Request, Response } from "express";
import { handleUserMessage } from "../services/chat.service";
import { getMessagesByConversation } from "../repositories/message.repo";

export async function postChatMessage(req: Request, res: Response) {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const result = await handleUserMessage(message.trim(), sessionId);
    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}

export async function getChatHistory(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const messages = await getMessagesByConversation(sessionId);

    res.json(
      messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }))
    );
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({
      error: "Could not fetch chat history",
    });
  }
}
