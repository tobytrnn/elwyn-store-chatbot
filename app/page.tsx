"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, welcome to Elwyn. I’m your support assistant. Ask me about shipping, returns, sizing, or products.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I couldn’t generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 md:px-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Elwyn Support</h1>
            <p className="text-sm text-white/60">
              AI assistant for customer service
            </p>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 md:block">
            Online
          </div>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-sm text-white/70">
              Ask about shipping, returns, sizing, payment, or product info.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg md:max-w-[75%] ${
                        isUser
                          ? "bg-white text-black"
                          : "border border-white/10 bg-neutral-900 text-white"
                      }`}
                    >
                      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                        {isUser ? "You" : "Elwyn Bot"}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg md:max-w-[75%]">
                    <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                      Elwyn Bot
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/60 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/60 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-neutral-950/60 p-4 md:p-5">
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/40">
                  Press Enter to send, Shift + Enter for a new line
                </p>

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}