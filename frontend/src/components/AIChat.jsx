import { useState } from "react";
import axios from "axios";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Utensils,
  Wallet,
  BarChart3,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000";

function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    {
      text: "How much did I spend on food?",
      icon: Utensils,
    },
    {
      text: "What is my total spending?",
      icon: Wallet,
    },
    {
      text: "Give me a spending summary",
      icon: BarChart3,
    },
  ];

  const sendMessage = async (messageText = question) => {
    const userQuestion = messageText.trim();

    if (!userQuestion || loading) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/ai/chat`,
        {
          question: userQuestion,
        }
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content: response.data.answer,
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content:
            "Sorry, I couldn't process your question right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI Expense Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500 blur-xl opacity-40 group-hover:opacity-70 transition-all duration-300" />

          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-all duration-300">
            <Bot size={28} />

            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-950" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[620px] max-h-[calc(100vh-48px)] bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div className="relative w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <Sparkles size={22} />

                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600" />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  AI Expense Assistant
                </h2>

                <p className="text-indigo-100 text-xs">
                  Your personal spending assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Welcome */}
            {messages.length === 0 && (
              <div className="text-center py-8">

                <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Bot
                    size={30}
                    className="text-indigo-400"
                  />
                </div>

                <h3 className="font-semibold text-lg">
                  Hey! I'm your AI assistant 👋
                </h3>

                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                  Ask me anything about your expenses and I'll find the relevant information for you.
                </p>

                <div className="mt-6 space-y-2 text-left">

                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-1">
                    Try asking
                  </p>

                  {quickQuestions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.text}
                        onClick={() => sendMessage(item.text)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon
                            size={17}
                            className="text-indigo-400"
                          />
                        </div>

                        <span className="text-sm text-slate-300">
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {message.role === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Bot
                      size={17}
                      className="text-indigo-400"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md"
                      : "bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Bot
                    size={17}
                    className="text-indigo-400"
                  />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">

                  <LoaderCircle
                    size={16}
                    className="animate-spin text-indigo-400"
                  />

                  <span className="text-sm text-slate-400">
                    AI is thinking...
                  </span>

                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500 transition"
            >

              <input
                type="text"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Ask about your expenses..."
                disabled={loading}
                className="flex-1 bg-transparent outline-none px-3 py-2 text-sm text-white placeholder:text-slate-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>

            </form>

            <p className="text-center text-[11px] text-slate-600 mt-2">
              Powered by your expense data
            </p>

          </div>
        </div>
      )}
    </>
  );
}

export default AIChat;