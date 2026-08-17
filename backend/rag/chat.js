import Groq from "groq-sdk";
import { retrieveExpenses } from "./retriever.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function answerExpenseQuestion(question) {
  // 1. Retrieve relevant expenses from ChromaDB
  const results = await retrieveExpenses(question, 5);

  const documents = results.documents?.[0] || [];
  const metadata = results.metadatas?.[0] || [];

  // 2. Build context for Groq
  const context = metadata
    .map((expense) => {
      return `
Description: ${expense.description}
Amount: ₹${expense.amount}
Category: ${expense.category}
Date: ${expense.date}
`;
    })
    .join("\n");

  // 3. Ask Groq to answer using retrieved context
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content: `
You are an AI assistant for an Expense Tracker.

Answer the user's question using only the expense information provided.

Rules:
- Use only the provided expense context.
- Do not invent expenses or information.
- If the information is not available, clearly say you don't have enough information.
- Keep the answer simple and useful.
- Perform calculations when appropriate.
- For questions asking "how much", calculate the total from the relevant expenses.
        `,
      },
      {
        role: "user",
        content: `
User question:
${question}

Relevant expense information:
${context}
        `,
      },
    ],
  });

  return completion.choices[0].message.content;
}