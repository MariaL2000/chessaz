"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChessChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content:
        "Hello! 👋 Welcome to Chessaz. I am your bilingual AI assistant. How can I help you today with chess courses, strategies, or learning how to sell your lessons as a coach?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Filtramos el mensaje de bienvenida para no enviarlo como prompt inicial al API
      const apiMessages = [...messages, userMessage].filter(
        (m) => m.id !== "welcome-message",
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.body) throw new Error("No response body received.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              accumulatedContent += JSON.parse(line.slice(2));
            } catch {
              accumulatedContent += line.slice(3, -1).replace(/\\n/g, "\n");
            }
          } else if (!line.includes(":") && line.length > 0) {
            accumulatedContent += line;
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulatedContent } : m,
          ),
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans flex flex-col items-end">
      {/* Ventana del Chat - Totalmente Responsiva */}
      {isOpen && (
        <div
          className="mb-3 sm:mb-4 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300 h-[520px] sm:h-[560px] max-h-[calc(100vh-100px)] border backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border-custom)",
          }}
        >
          {/* Header */}
          <div
            className="p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-sm"
            style={{ backgroundColor: "var(--color-blue)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-2xl shadow-inner flex items-center justify-center"
                style={{
                  backgroundColor: "var(--color-bg-beige)",
                  color: "var(--color-gold)",
                }}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs sm:text-sm uppercase tracking-wider leading-none text-white">
                  Chessaz Assistant
                </span>
                <span
                  className="text-[11px] mt-1 font-medium flex items-center gap-1.5"
                  style={{ color: "var(--color-gold-light)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Bilingual AI • Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
            style={{ backgroundColor: "var(--color-bg-beige)" }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88% sm:max-w-[82%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-sm border whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-none text-white border-transparent"
                      : "rounded-tl-none border-[var(--color-border-custom)]"
                  }`}
                  style={{
                    backgroundColor:
                      m.role === "user"
                        ? "var(--color-blue)"
                        : "var(--color-bg-card)",
                    color:
                      m.role === "user" ? "#FFFFFF" : "var(--color-text-main)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1.5 p-3 items-center w-max rounded-2xl bg-white/60 border border-[var(--color-border-custom)] shadow-sm">
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--color-gold)" }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"
                  style={{ backgroundColor: "var(--color-gold)" }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"
                  style={{ backgroundColor: "var(--color-gold)" }}
                />
              </div>
            )}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={sendMessage}
            className="p-3 sm:p-4 border-t shrink-0"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border-custom)",
            }}
          >
            <div
              className="flex items-center gap-2 p-1.5 rounded-2xl border transition-all shadow-inner focus-within:ring-2"
              style={{
                backgroundColor: "var(--color-bg-beige)",
                borderColor: "var(--color-border-custom)",
              }}
            >
              <input
                type="text"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about chess, courses or teaching..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm outline-none font-medium"
                style={{ color: "var(--color-text-main)" }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 shadow-md"
                style={{ backgroundColor: "var(--color-gold)" }}
              >
                <Send className="w-4 h-4" />
                <span className="hidden xs:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón Flotante Moderno con Icono de Interrogación Animado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 py-3.5 px-4 sm:px-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border backdrop-blur-md"
        style={{
          backgroundColor: "var(--color-blue)",
          borderColor: "var(--color-gold)",
          color: "#FFFFFF",
        }}
        aria-label="Toggle chat assistant"
      >
        <div
          className="p-2 rounded-xl flex items-center justify-center shadow-md transition-transform duration-500 group-hover:rotate-12"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "#FFFFFF",
          }}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <HelpCircle className="w-5 h-5 animate-pulse" />
          )}
        </div>
        <div className="flex flex-col items-start pr-1">
          <span className="font-extrabold text-xs sm:text-sm tracking-wide leading-tight">
            {isOpen ? "Close Chat" : "Need help?"}
          </span>
          {!isOpen && (
            <span
              className="text-[10px] font-semibold tracking-wider uppercase opacity-90"
              style={{ color: "var(--color-gold-light)" }}
            >
              Chat with AI
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
