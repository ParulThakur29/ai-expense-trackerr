import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Expense Tracker Backend is running",
  });
});

app.post("/expenses", (req, res) => {
  const { description, amount, category, date } = req.body;

  try {
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

    const expense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create expense",
    });
  }
});

app.get("/expenses", (req, res) => {
  try {
    const expenses = db
      .prepare("SELECT * FROM expenses ORDER BY id DESC")
      .all();

    res.json(expenses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch expenses",
    });
  }
});

app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { description, amount, category } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE expenses
      SET description = ?, amount = ?, category = ?
      WHERE id = ?
    `);

    stmt.run(
      description,
      amount,
      category,
      id
    );

    const expense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(id);

    res.json(expense);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update expense",
    });
  }
});

app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(
      "DELETE FROM expenses WHERE id = ?"
    ).run(id);

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete expense",
    });
  }
});

app.post("/ai/categorize", async (req, res) => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({
      error: "Description is required",
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content:
            "You are an expense categorization assistant. Choose the best category from: Food, Transport, Shopping, Bills, Entertainment, Other. Food includes restaurants, groceries, meals, coffee, snacks, burgers, pizza, McDonald's, Starbucks, etc. Transport includes Uber, taxi, fuel, metro, bus, train, parking, etc. Shopping includes clothes, electronics, Amazon purchases, gifts, etc. Bills includes electricity, internet, phone, rent, subscriptions, etc. Entertainment includes Netflix, movies, games, concerts, etc. Return ONLY the category name.",
        },
        {
          role: "user",
          content: `Categorize this expense: ${description}`,
        },
      ],

      temperature: 0,

      max_completion_tokens: 10,
    });

    const aiCategory =
      completion.choices[0].message.content.trim();

    const validCategories = [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Entertainment",
      "Other",
    ];

    const category = validCategories.includes(aiCategory)
      ? aiCategory
      : "Other";

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

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});