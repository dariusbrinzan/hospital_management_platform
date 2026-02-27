"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatContext } from "@/lib/chatbot-rules";

type Message = { role: "user" | "bot"; text: string };

const WELCOME_MESSAGES: Record<string, string> = {
  patient:
    "Bună! Sunt asistentul eHealth. Întreabă-mă despre: programare nouă, programări (anulare, reprogramare), istoric medical, rețete, analize medicale, calendar, profil (alergii, vaccinări), hartă spital, mesaje, raportare problemă, notificări sau descărcare PDF/raport consultație. Cu ce te pot ajuta?",
  doctor:
    "Bună! Sunt asistentul eHealth pentru medici. Poți întreba despre: programări (adăugare consultație, anulare), calendar, pacienți (detalii, contact, analize), consultații și rapoarte PDF, rețete emise, imagistică (ordonare investigații), rezultate analize, videoconferință, mesaje, profil sau statistici. Cu ce te pot ajuta?",
  admin:
    "Bună! Sunt asistentul eHealth pentru administrare. Poți întreba despre: programări, pacienți, urgențe, medici de gardă și plată gărzi (350 lei), spitalizări, medicamente, imagistică, import analize, rapoarte (grafice, PDF/CSV), raportări probleme, logistică (consumabile, transport intern) sau statistici. Cu ce te pot ajuta?",
  guest:
    "Bună! Sunt asistentul eHealth. Autentifică-te pentru a primi informații personalizate.",
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ChatContext | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat-context")
      .then((r) => r.json())
      .then((data) => {
        if (data.role || data.name) setContext(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context }),
      });
      const data = await res.json();
      const reply = data.reply || "Nu am putut răspunde. Încearcă din nou.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "A apărut o eroare. Încearcă din nou." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        aria-label={open ? "Închide chat" : "Deschide chat"}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-dark-200 bg-green-500 px-4 py-3">
            <span className="text-15-semibold text-white">Asistent eHealth</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-white/90 hover:bg-white/20"
              aria-label="Închide"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-80 min-h-64 flex-col gap-3 overflow-y-auto p-4"
          >
            {messages.length === 0 ? (
              <div className="rounded-lg bg-gray-100 px-3 py-2 text-14-regular text-dark-700">
                {WELCOME_MESSAGES[context?.role || "guest"]}
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-14-regular ${
                      m.role === "user"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-dark-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3 py-2 text-14-regular text-dark-500 animate-pulse">
                  Se gândește...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-dark-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrie întrebarea..."
                className="flex-1 rounded-xl border border-dark-200 px-3 py-2 text-14-regular placeholder:text-dark-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-green-500 px-4 py-2 text-14-medium text-white transition hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500"
              >
                Trimite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
