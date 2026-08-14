import { useEffect, useState } from "react";
import axios from "axios";
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  MoreHorizontal,
  Trash2,
  Pencil,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:3000";

const categories = [
  {
    name: "Food",
    color: "#f97316",
    icon: Utensils,
  },
  {
    name: "Transport",
    color: "#3b82f6",
    icon: Car,
  },
  {
    name: "Shopping",
    color: "#ec4899",
    icon: ShoppingBag,
  },
  {
    name: "Bills",
    color: "#eab308",
    icon: Receipt,
  },
  {
    name: "Entertainment",
    color: "#a855f7",
    icon: Film,
  },
  {
    name: "Other",
    color: "#64748b",
    icon: MoreHorizontal,
  },
];

function App() {
  const [expenses, setExpenses] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();

    if (!description || !amount) {
      return;
    }

    try {
      await axios.post(`${API_URL}/expenses`, {
        description,
        amount: Number(amount),
        category,
        date: new Date().toISOString().split("T")[0],
      });

      setDescription("");
      setAmount("");
      setCategory("Food");
      setAiMessage("");

      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const suggestCategory = async () => {
    if (!description.trim()) {
      setAiMessage("Enter a description first.");
      return;
    }

    setAiLoading(true);
    setAiMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/ai/categorize`,
        {
          description,
        }
      );

      setCategory(response.data.category);

      setAiMessage(
        `AI suggests: ${response.data.category}`
      );
    } catch (error) {
      console.error("AI categorization error:", error);

      setAiMessage(
        "AI suggestion failed. Choose a category manually."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditAmount(expense.amount);
    setEditCategory(expense.category);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription("");
    setEditAmount("");
    setEditCategory("Food");
  };

  const updateExpense = async (id) => {
    if (!editDescription || !editAmount) {
      return;
    }

    try {
      await axios.put(`${API_URL}/expenses/${id}`, {
        description: editDescription,
        amount: Number(editAmount),
        category: editCategory,
      });

      cancelEditing();
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All" ||
      expense.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const chartData = categories
    .map((cat) => ({
      name: cat.name,
      value: expenses
        .filter((expense) => expense.category === cat.name)
        .reduce(
          (total, expense) => total + Number(expense.amount),
          0
        ),
      color: cat.color,
    }))
    .filter((item) => item.value > 0);

  const getCategory = (name) => {
    return (
      categories.find((cat) => cat.name === name) ||
      categories[categories.length - 1]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('/src/assets/bg.jpg')",
        }}
      />

      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-indigo-950/90" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
                Personal Finance
              </p>

              <h1 className="text-4xl font-bold mt-2">
                AI Expense Tracker
              </h1>

              <p className="text-slate-400 mt-2">
                Track your spending. Understand your money.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl">
            <p className="text-indigo-100 text-sm font-medium">
              Total Spent
            </p>

            <h2 className="text-5xl font-bold mt-3">
              ₹{totalSpent.toFixed(2)}
            </h2>

            <p className="text-indigo-100 mt-4">
              Across {expenses.length} expense
              {expenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Spending Breakdown
            </h2>

            {chartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toFixed(2)}`
                      }
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                No expenses yet
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Add Expense
            </h2>

            <form onSubmit={addExpense} className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setAiMessage("");
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={suggestCategory}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl py-3 font-semibold transition"
              >
                <Sparkles size={18} />

                {aiLoading
                  ? "AI Thinking..."
                  : "Suggest Category with AI"}
              </button>

              {aiMessage && (
                <p className="text-sm text-purple-300">
                  {aiMessage}
                </p>
              )}

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold transition"
              >
                Add Expense
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Recent Expenses
                </h2>

                <span className="text-sm text-slate-500">
                  {filteredExpenses.length} of {expenses.length}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                />

                <select
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value)
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Categories</option>

                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No matching expenses found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const cat = getCategory(expense.category);
                  const Icon = cat.icon;
                  const isEditing = editingId === expense.id;

                  if (isEditing) {
                    return (
                      <div
                        key={expense.id}
                        className="bg-slate-800/80 border border-indigo-500/50 rounded-2xl p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) =>
                              setEditDescription(e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                          />

                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) =>
                              setEditAmount(e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                          />

                          <select
                            value={editCategory}
                            onChange={(e) =>
                              setEditCategory(e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                          >
                            {categories.map((cat) => (
                              <option
                                key={cat.name}
                                value={cat.name}
                              >
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                          >
                            <X size={16} />
                            Cancel
                          </button>

                          <button
                            onClick={() =>
                              updateExpense(expense.id)
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 transition"
                          >
                            <Check size={16} />
                            Save
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={expense.id}
                      className="group flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        <div>
                          <p className="font-medium">
                            {expense.description}
                          </p>

                          <p className="text-sm text-slate-500">
                            {expense.category} • {expense.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-semibold">
                          ₹{Number(expense.amount).toFixed(2)}
                        </p>

                        <button
                          onClick={() =>
                            startEditing(expense)
                          }
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition"
                          title="Edit expense"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            deleteExpense(expense.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                          title="Delete expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;