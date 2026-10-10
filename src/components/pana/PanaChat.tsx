"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/pana/providers";
import { triggers, type Trigger } from "@/lib/pana/triggers";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  /** Show the "simulate a risk moment" controls (demo mode). */
  showRiskMoments?: boolean;
}

export function PanaChat({ profile, showRiskMoments = true }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `¡Wepa, ${profile.name}! I'm Pana, your buddy in Miami. Ask me anything, or tell me how your week's going.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(history: ChatMessage[], trigger?: Trigger) {
    setBusy(true);
    setMessages([...history, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/pana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The greeting is UI-only; providers expect the conversation to start with the user.
        body: JSON.stringify({ messages: history.slice(1), profile, trigger }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([...history, { role: "assistant", content: "Ay, I lost signal. Try again in a sec?" }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    send([...messages, { role: "user", content: text }]);
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-line bg-surface shadow-card" aria-label="Chat with Pana">
      <header className="flex items-center gap-3 border-b border-line p-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-lg text-on-primary" aria-hidden>
          🤙
        </span>
        <div>
          <p className="font-semibold">Pana</p>
          <p className="text-xs text-muted">Your buddy in Miami · chat or text</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-primary text-on-primary" : "bg-surface-2 text-ink"
              }`}
            >
              {m.content || <span className="text-muted">Pana is typing…</span>}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {showRiskMoments && (
        <div className="border-t border-line px-4 pt-3">
          <p className="text-xs text-muted">Demo: simulate a risk moment. Pana reaches out first.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(triggers) as Trigger[]).map((t) => (
              <button
                key={t}
                disabled={busy}
                onClick={() => send(messages, t)}
                className="rounded-full border border-line px-3 py-1 text-xs hover:border-brand hover:text-brand disabled:opacity-50"
              >
                {triggers[t].emoji} {triggers[t].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 p-4">
        <label htmlFor="pana-input" className="sr-only">
          Message Pana
        </label>
        <input
          id="pana-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Text Pana…"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
