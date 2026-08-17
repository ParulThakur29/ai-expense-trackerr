import { createEmbedding } from "./embeddings.js";
import { getExpenseCollection } from "./vectorStore.js";

export async function retrieveExpenses(question, limit = 5) {
  const collection = await getExpenseCollection();

  console.log(`Searching expenses for: "${question}"`);

  // Convert the user's question into a vector
  const queryEmbedding = await createEmbedding(question);

  // Search Chroma for similar expenses
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
  });

  return results;
}