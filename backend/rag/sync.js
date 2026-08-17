import { getExpenseCollection } from "./vectorStore.js";
import { createEmbedding } from "./embeddings.js";
import db from "../db.js";

export async function syncExpenseToChroma(expense) {
  const collection = await getExpenseCollection();

  const document = `
Description: ${expense.description}
Amount: ₹${expense.amount}
Category: ${expense.category}
Date: ${expense.date}
`;

  const embedding = await createEmbedding(document);

  await collection.upsert({
    ids: [String(expense.id)],
    embeddings: [embedding],
    documents: [document],
    metadatas: [
      {
        expenseId: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      },
    ],
  });

  console.log(`Expense #${expense.id} synced to Chroma.`);
}

export async function deleteExpenseFromChroma(expenseId) {
  const collection = await getExpenseCollection();

  await collection.delete({
    ids: [String(expenseId)],
  });

  console.log(`Expense #${expenseId} removed from Chroma.`);
}


// Sync ALL existing SQLite expenses to Chroma
export async function syncAllExpensesToChroma() {
  const expenses = db
    .prepare("SELECT * FROM expenses ORDER BY id ASC")
    .all();

  console.log(`Found ${expenses.length} expenses in SQLite.`);

  for (const expense of expenses) {
    await syncExpenseToChroma(expense);
  }

  console.log("All expenses synced to Chroma.");
}