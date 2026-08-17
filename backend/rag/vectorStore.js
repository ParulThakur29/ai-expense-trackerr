import { ChromaClient } from "chromadb";

const chromaUrl =
  process.env.CHROMA_URL || "http://localhost:8000";

const client = new ChromaClient({
  path: chromaUrl,
});

const COLLECTION_NAME = "expenses";

export async function getExpenseCollection() {
  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: null,
  });

  return collection;
}