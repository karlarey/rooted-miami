"use client";

import { useEffect, useRef, useState } from "react";
import { openingLine, type NegotiationInput } from "@/lib/pana/negotiation";
import type { ChatMessage } from "@/lib/pana/providers";

interface Bubble extends ChatMessage {
  coach?: boolean;
}

/** Role-play: El Pana plays a hiring manager; "coach me" switches to feedback. */
export function PracticeChat({ input }: { input: NegotiationInput }) {
  const greeting = (): Bubble[] => [{ role: "assistant", content: openingLine(input.situation) }];
  const [messages, setMessages] = useState<Bubble[]>(greeting);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Restart the scene when the situation changes (adjusting state during render).
  const [situation, setSituation] = useState(input.situation);
  if (situation !== input.situation) {
    setSituation(input.situation);
    setMessages(greeting());
  }

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(content: string) {
    if (busy || !content.trim()) return;
    const coach = /coach\s*me/i.test(content);
    const history: Bubble[] = [...messages, { role: "user", content: content.trim() }];
    setBusy(true);
    setMessages([...history, { role: "assistant", content: "", coach }]);
    try {
      const res = await fetch("/api/pana/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The opening line is UI-only (the system prompt knows it); providers expect the user to speak first.
        body: JSON.stringify({ ...input, messages: history.slice(1).map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) throw new Error(`Status ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply, coach }]);
      }
    } catch {
      setMessages([...history, { role: "assistant", content: "Ay, I lost signal. Try again in a sec?", coach }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text;
    setText("");
    send(t);
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-lg" aria-hidden>
          🤙
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">El Pana as your hiring manager</p>
          <p className="text-xs text-muted">Friendly but firm. Type &ldquo;coach me&rdquo; for tips. No real company, no promises.</p>
        </div>
        <button
          type="button"
          onClick={() => setMessages(greeting())}
          disabled={busy}
          className="rounded-full border border-line px-3 py-1 text-xs hover:border-coral disabled:opacity-50"
        >
          Restart
        </button>
      </div>

      <div ref={logRef} className="max-h-96 min-h-48 space-y-3 overflow-y-auto p-4" aria-live="polite" aria-label="Practice conversation">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-coral text-bg" : m.coach ? "border border-teal bg-teal-soft text-ink" : "bg-surface-2 text-ink"
              }`}
            >
              {m.role === "assistant" && (
                <span className="mb-0.5 block text-xs font-semibold text-muted">{m.coach ? "El Pana, coach" : "Hiring manager"}</span>
              )}
              {m.content || <span className="text-muted">typing…</span>}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-wrap gap-2 border-t border-line p-4">
        <label htmlFor="practice-input" className="sr-only">
          Your reply to the hiring manager
        </label>
        <input
          id="practice-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your reply…"
          className="min-w-0 flex-1 basis-48 rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-coral"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-full bg-coral px-4 py-2 text-sm font-medium text-bg disabled:opacity-50"
        >
          Send
        </button>
        <button
          type="button"
          disabled={busy || messages.length < 2}
          onClick={() => send("coach me")}
          className="rounded-full border border-teal px-4 py-2 text-sm font-medium text-teal disabled:opacity-50"
        >
          Coach me
        </button>
      </form>
    </div>
  );
}
