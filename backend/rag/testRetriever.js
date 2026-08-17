import "dotenv/config";

import { retrieveExpenses } from "./retriever.js";

const question = "Where did I spend money?";

const results = await retrieveExpenses(question, 5);

console.log("\n===== RETRIEVED EXPENSES =====");

console.log("Documents:");
console.log(results.documents);

console.log("\nMetadata:");
console.log(results.metadatas);

console.log("\nDistances:");
console.log(results.distances);