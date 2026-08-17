import "dotenv/config";
import Database from "better-sqlite3";

import { createEmbedding } from "./embeddings.js";
import { getExpenseCollection } from "./vectorStore.js";

// Open the database that currently contains your expenses
const db = new Database("expenses-backup.db");

const collection = await getExpenseCollection();

const expenses = db.prepare(`
  SELECT
    id,
    description,
    amount,
    category,
    date,
    created_at
  FROM expenses
`).all();

console.log(`Found ${expenses.length} expenses in SQLite.`);

if (expenses.length === 0) {
  console.log("No expenses to ingest.");
  db.close();
  process.exit(0);
}

for (const expense of expenses) {
  const text = `
Description: ${expense.description}
Amount: ₹${expense.amount}
Category: ${expense.category}
Date: ${expense.date}
`.trim();

  console.log(`Creating embedding for expense #${expense.id}...`);

  const embedding = await createEmbedding(text);

  await collection.upsert({
    ids: [`expense-${expense.id}`],
    embeddings: [embedding],
    documents: [text],
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

  console.log(`Stored expense #${expense.id} in Chroma.`);
}

db.close();

console.log("✅ All expenses successfully ingested into Chroma.");