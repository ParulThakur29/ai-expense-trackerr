import "dotenv/config";
import { createEmbedding } from "./embeddings.js";

const text = "Netflix subscription";

console.log("Creating embedding for:", text);

const embedding = await createEmbedding(text);

console.log("Embedding created successfully!");
console.log("Vector length:", embedding.length);
console.log("First 10 values:", embedding.slice(0, 10));