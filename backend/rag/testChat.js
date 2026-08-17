import "dotenv/config";
import { answerExpenseQuestion } from "./chat.js";

const question = "How much did I spend on food?";

console.log("User:", question);
console.log("\nThinking...\n");

const answer = await answerExpenseQuestion(question);

console.log("AI:", answer);