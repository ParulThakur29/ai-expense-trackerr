import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import db from "./db.js";

import { answerExpenseQuestion } from "./rag/chat.js";

import {
  syncExpenseToChroma,
  deleteExpenseFromChroma,
} from "./rag/sync.js";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "AI Expense Tracker Backend is running",
  });
});

// ========================================
// CREATE EXPENSE
// ========================================

app.post("/expenses", async (req, res) => {
  const { description, amount, category, date } = req.body;

  if (!description || amount === undefined || !category || !date) {
    return res.status(400).json({
      error: "Description, amount, category and date are required",
    });
  }

  try {
    // 1. Save expense in SQLite
    const stmt = db.prepare(`
      INSERT INTO expenses
      (description, amount, category, date)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      description,
      amount,
      category,
      date
    );

    // 2. Get newly created expense
    const expense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(result.lastInsertRowid);

    // 3. Sync expense to Chroma
    await syncExpenseToChroma(expense);

    // 4. Send expense back to frontend
    res.status(201).json(expense);

  } catch (error) {
    console.error("Create expense error:", error);

    res.status(500).json({
      error: "Failed to create expense",
    });
  }
});

// ========================================
// GET ALL EXPENSES
// ========================================

app.get("/expenses", (req, res) => {
  try {
    const expenses = db
      .prepare("SELECT * FROM expenses ORDER BY id DESC")
      .all();

    res.json(expenses);

  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      error: "Failed to fetch expenses",
    });
  }
});

// ========================================
// UPDATE EXPENSE
// ========================================

app.put("/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { description, amount, category } = req.body;

  try {
    // 1. Update expense in SQLite
    const stmt = db.prepare(`
      UPDATE expenses
      SET description = ?, amount = ?, category = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      description,
      amount,
      category,
      id
    );

    // Check if expense exists
    if (result.changes === 0) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    // 2. Get updated expense
    const expense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(id);

    // 3. Sync updated expense to Chroma
    await syncExpenseToChroma(expense);

    // 4. Return updated expense
    res.json(expense);

  } catch (error) {
    console.error("Update expense error:", error);

    res.status(500).json({
      error: "Failed to update expense",
    });
  }
});

// ========================================
// DELETE EXPENSE
// ========================================

app.delete("/expenses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Delete from SQLite
    const result = db
      .prepare("DELETE FROM expenses WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    // 2. Delete same expense from Chroma
    await deleteExpenseFromChroma(id);

    res.json({
      message: "Expense deleted successfully",
    });

  } catch (error) {
    console.error("Delete expense error:", error);

    res.status(500).json({
      error: "Failed to delete expense",
    });
  }
});

// ========================================
// AI EXPENSE CATEGORIZATION
// ========================================

app.post("/ai/categorize", async (req, res) => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({
      error: "Description is required",
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are an expense categorization assistant.

Choose EXACTLY ONE category from:

Food
Transport
Shopping
Bills
Entertainment
Other

Examples:
- pizza, burger, restaurant, groceries, coffee, food -> Food
- Uber, Ola, taxi, fuel, petrol, metro, bus, train, parking -> Transport
- Amazon, clothes, shoes, electronics, phone, laptop, gifts -> Shopping
- electricity, internet, phone bill, rent, recharge, subscription -> Bills
- Netflix, movie, cinema, games, gaming, concert, Spotify -> Entertainment

Return ONLY the category name.
Do not explain your answer.
`,
        },
        {
          role: "user",
          content: `Categorize this expense: ${description}`,
        },
      ],

      temperature: 0,
      max_completion_tokens: 20,
    });

    const aiResponse =
      completion.choices[0].message.content
        .trim()
        .toLowerCase();

    const validCategories = [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Entertainment",
      "Other",
    ];

    // Try to find a valid category inside the AI response
    let category = validCategories.find((cat) =>
      aiResponse.includes(cat.toLowerCase())
    );

    // ========================================
    // FALLBACK KEYWORDS
    // ========================================

    if (!category) {
      const text = description.toLowerCase();

      if (
        /pizza|burger|restaurant|food|meal|coffee|cafe|grocery|groceries|snack|mcdonald|starbucks|dominos/.test(
          text
        )
      ) {
        category = "Food";

      } else if (
        /uber|ola|taxi|cab|fuel|petrol|diesel|metro|bus|train|parking|transport/.test(
          text
        )
      ) {
        category = "Transport";

      } else if (
        /amazon|flipkart|clothes|shoes|shopping|laptop|computer|phone|mobile|electronics|gift/.test(
          text
        )
      ) {
        category = "Shopping";

      } else if (
        /electricity|internet|wifi|phone bill|rent|bill|recharge|subscription/.test(
          text
        )
      ) {
        category = "Bills";

      } else if (
        /netflix|movie|cinema|game|gaming|concert|spotify/.test(
          text
        )
      ) {
        category = "Entertainment";

      } else {
        category = "Other";
      }
    }

    res.json({
      category,
    });

  } catch (error) {
    console.error("Groq error:", error);

    res.status(500).json({
      error: "AI categorization failed",
    });
  }
});

// ========================================
// RAG AI CHAT
// ========================================

app.post("/ai/chat", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      error: "Question is required",
    });
  }

  try {
    const answer = await answerExpenseQuestion(
      question.trim()
    );

    res.json({
      answer,
    });

  } catch (error) {
    console.error("RAG chat error:", error);

    res.status(500).json({
      error: "AI chat failed",
    });
  }
});

// ========================================
// START SERVER
// ========================================

app.listen(3000, () => {
  console.log(
    "Server running on http://localhost:3000"
  );
});