import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a helpful customer support agent for a small e-commerce store.
Answer clearly, concisely, and professionally.
If you are unsure, say so politely.

Store Policies:
- Shipping: We ship worldwide. Delivery takes 5–7 business days.
- Returns: 30-day return policy for unused products.
- Refunds: Processed within 5 business days after return.
- Support hours: Monday to Friday, 9am–6pm IST.
`;

type HistoryMessage = {
  sender: "user" | "ai";
  text: string;
};

export async function generateReply(
  history: HistoryMessage[],
  userMessage: string
): Promise<string> {

  /**
   * ✅ MOCK MODE
   * Used for local testing when OpenAI credits are not available
   */
  if (process.env.USE_MOCK_LLM === "true") {
    return mockReply(userMessage);
  }

  /**
   * 🔵 REAL OPENAI MODE
   * Will work once credits/billing are enabled
   */
  try {
    const conversation = history
      .map((m) =>
        m.sender === "user"
          ? `User: ${m.text}`
          : `Agent: ${m.text}`
      )
      .join("\n");

    const input = `
${SYSTEM_PROMPT}

Conversation so far:
${conversation}

User: ${userMessage}
Agent:
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input,
      max_output_tokens: 300,
      temperature: 0.3,
    });

    return (
      response.output_text ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("LLM error:", error);
    return "Sorry, I'm having trouble responding right now. Please try again later.";
  }
}

/**
 * 🧪 MOCK RESPONSE LOGIC
 * Deterministic replies for testing without API calls
 */
function mockReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("return")) {
    return "We offer a 30-day return policy for unused products.";
  }

  if (msg.includes("refund")) {
    return "Refunds are processed within 5 business days after receiving the returned item.";
  }

  if (msg.includes("ship")) {
    return "Yes, we ship worldwide. Delivery usually takes 5–7 business days.";
  }

  if (msg.includes("support") || msg.includes("hours")) {
    return "Our support hours are Monday to Friday, 9am–6pm IST.";
  }

  return "Thanks for reaching out! Our support team will assist you shortly.";
}
