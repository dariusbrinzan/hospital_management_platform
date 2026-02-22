"use client";

import { useEffect, useState, useRef } from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Message = {
  $id: string;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export function AppointmentMessageThread({
  appointmentId,
  appointmentLabel,
  isPatient,
}: {
  appointmentId: string;
  appointmentLabel: string;
  isPatient: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/messages`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare la încărcare");
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la încărcare");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [appointmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const payload: { body: string; sendAsRole?: string } = { body: text };
      if (!isPatient) payload.sendAsRole = "doctor";
      const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare la trimitere");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setBody("");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la trimitere");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dark-200 bg-dark-50 p-8 dark:border-dark-600 dark:bg-dark-800">
        <p className="text-dark-500">Se încarcă mesajele...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-dark-200 bg-white shadow-sm dark:border-dark-600 dark:bg-dark-800">
      <div className="border-b border-dark-200 px-4 py-3 dark:border-dark-600">
        <p className="text-14-semibold text-dark-800 dark:text-dark-100">{appointmentLabel}</p>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] max-h-[380px]">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-14-regular text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {messages.length === 0 && !error && (
            <p className="text-14-regular text-dark-500 text-center py-6">
              Niciun mesaj încă. Scrieți primul mesaj.
            </p>
          )}
          {messages.map((msg) => {
            const fromMe = (isPatient && msg.senderRole === "patient") || (!isPatient && msg.senderRole === "doctor");
            const isDoctor = msg.senderRole === "doctor";
            return (
              <div
                key={msg.$id}
                className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[82%] rounded-2xl px-4 py-2.5 ${
                    fromMe
                      ? "rounded-br-md bg-green-500 text-white dark:bg-green-600"
                      : isDoctor
                        ? "rounded-bl-md bg-blue-100 text-dark-800 dark:bg-blue-900/40 dark:text-dark-100"
                        : "rounded-bl-md bg-dark-100 text-dark-800 dark:bg-dark-700 dark:text-dark-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-11-semibold uppercase tracking-wide opacity-90">
                      {isDoctor ? "Medic" : "Pacient"}
                    </span>
                    <span className="text-12-regular opacity-90">{msg.senderName}</span>
                  </div>
                  <p className="text-14-regular whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                  <p className={`mt-1.5 text-11-regular ${fromMe ? "text-green-100" : "text-dark-500 dark:text-dark-400"}`}>
                    {formatDateTime(msg.createdAt).dateTime}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-dark-200 p-3 dark:border-dark-600 bg-dark-50/50 dark:bg-dark-800/50">
          <div className="flex gap-2 items-end">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isPatient ? "Scrieți mesajul către medic..." : "Răspundeți pacientului..."}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-dark-200 bg-white px-4 py-3 text-14-regular text-dark-800 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100"
              maxLength={4000}
            />
            <Button
              type="button"
              onClick={handleSend}
              disabled={!body.trim() || sending}
              className="shad-primary-btn self-end rounded-xl px-5"
            >
              {sending ? "Se trimite..." : "Trimite"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
