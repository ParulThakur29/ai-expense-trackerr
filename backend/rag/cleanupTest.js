import { getExpenseCollection } from "./vectorStore.js";

const collection = await getExpenseCollection();

await collection.delete({
  ids: ["test-1"],
});

console.log("Test expense removed from Chroma.");