import "dotenv/config";
import { createEmbedding } from "./embeddings.js";
import { getExpenseCollection } from "./vectorStore.js";

console.log("Connecting to Chroma...");

const collection = await getExpenseCollection();

console.log("Connected to Chroma!");

const text = "Netflix subscription";

console.log("Creating embedding...");

const embedding = await createEmbedding(text);

console.log("Embedding created.");
console.log("Vector length:", embedding.length);

await collection.upsert({
  ids: ["test-1"],
  embeddings: [embedding],
  documents: [text],
  metadatas: [
    {
      category: "Entertainment",
      amount: 649,
    },
  ],
});

console.log("Expense stored in Chroma!");

const queryEmbedding = await createEmbedding(
  "Netflix payment"
);

console.log("Searching Chroma...");

const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 1,
});

console.log("\nSearch result:");
console.log("Documents:", results.documents);
console.log("Metadata:", results.metadatas);
console.log("Distances:", results.distances);