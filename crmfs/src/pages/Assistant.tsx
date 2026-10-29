import { motion } from "framer-motion";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { AppLayout } from "@/AppLayout";
import { useState } from "react";

const suggestions = [
  "Summarize my pipeline performance this quarter",
  "Which deals are at risk of closing late?",
  "Draft a follow-up email for Acme Corp",
  "Show contacts I haven't engaged in 30 days",
];

const sampleConversation = [
  {
    role: "assistant" as const,
    content:
      "Hello Jane! I've analyzed your pipeline. You have 47 active deals worth $699K total. Three deals need immediate attention — would you like me to walk through them?",
  },
];

const Assistant = () => {
  const [messages, setMessages] = useState<{role: "user" | "assistant"; content: string}[]>(sampleConversation);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input },
      {
        role: "assistant" as const,
        content:
          "I'm analyzing your request. In a production environment, this would connect to an AI backend to provide real-time insights from your CRM data.",
      },
    ]);
    setInput("");
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen max-w-[800px] mx-auto px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight text-foreground">AI Assistant</h1>
              <p className="text-[13px] text-muted-foreground">
                Powered by your CRM data
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 mb-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground shadow-apple-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Suggestions */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2.5 mt-4"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="text-left px-4 py-3 rounded-xl bg-card border border-border text-[13px] text-foreground hover:bg-muted transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    {s}
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 p-1.5 rounded-2xl bg-card border border-border shadow-apple-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about your CRM..."
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Assistant;
