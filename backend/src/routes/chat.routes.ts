import { Router } from "express";
import {
  postChatMessage,
  getChatHistory,
  getConversations,
} from "../controllers/chat.controller";

const router = Router();

router.post("/message", postChatMessage);
router.get("/history/:sessionId", getChatHistory);
router.get("/conversations", getConversations);

export default router;
