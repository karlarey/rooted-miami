"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { seniorityLabels, stackLabels } from "@/data/pay";
import type { Opportunity } from "@/lib/opportunities";
import { benchmark } from "@/lib/pay-math";

const usd = (n: number) => `$${Math.round(n / 1000)}K`;
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const btnPrimary = "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50";
const btnOutline = "rounded-full border border-line px-4 py-2 text-sm font-medium text-muted hover:text-ink";

/** Engineer inbox: opportunities companies sent, with reply, pass and block (docs/messaging-contract.md rule 4). */
export default function MessagesPage() {
  const [items, setItems] = useState<Opportunity[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/opportunities?mine=1");
    if (res.status === 401) return setSignedOut(true);
    setItems(await res.json());
  }, []);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-sm text-muted">Companies that reached out. Every message comes with a role and a pay band.</p>
        </div>
        {!signedOut && (
          <button onClick={load} className={btnOutline}>
            Refresh
          </button>
        )}
      </div>

      {signedOut ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Link href="/login" className="font-semibold text-brand underline">
            Sign in
          </Link>{" "}
          to see messages from companies.
        </p>
      ) : items === null ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-6 text-muted shadow-card">
          No messages yet. Companies can reach you once you turn on{" "}
          <Link href="/sharing" className="underline">
            Companies can message me
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((o) => (
            <OpportunityCard key={o.id} o={o} onChange={load} />
          ))}
        </ul>
      )}
    </main>
  );
}

function OpportunityCard({ o, onChange }: { o: Opportunity; onChange: () => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const b = benchmark(o.stack, o.seniority);
  const open = o.status === "new" || o.status === "replied";

  async function send(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/opportunities/${o.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "engineer", body: draft }),
    });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error);
    setDraft("");
    onChange();
  }

  async function setStatus(status: "passed" | "blocked") {
    if (status === "blocked" && !confirm(`Block ${o.companyName}? They won't be able to find or message you again.`)) return;
    await fetch(`/api/opportunities/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChange();
  }

  return (
    <li className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{o.companyName}</p>
          <p className="mt-1 font-display text-lg font-semibold">{o.role}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            o.status === "new" ? "bg-accent-soft text-brand" : o.status === "replied" ? "bg-leaf-soft" : "bg-surface-2 text-muted"
          }`}
        >
          {o.status === "new" ? "New" : o.status === "replied" ? "Conversation open" : "Passed"}
        </span>
      </div>

      <p className="mt-2 text-sm">
        <span className="font-semibold">
          {usd(o.payMin)}–{usd(o.payMax)}
        </span>{" "}
        base · {o.workMode}
        {o.neighborhood ? ` · ${o.neighborhood}` : ""} · {seniorityLabels[o.seniority]} {stackLabels[o.stack]}
      </p>
      {b && (
        <p className="mt-1 text-xs text-muted">
          Miami market for this role: {usd(b.miamiLocal)} · Austin {usd(b.austin)}.{" "}
          <Link href="/negotiate" className="underline">
            Know your number
          </Link>
        </p>
      )}

      <div className="mt-4 space-y-2">
        <Bubble from="company" name={o.companyName} body={o.message} at={o.createdAt} />
        {o.thread.map((m) => (
          <Bubble key={m.id} from={m.from} name={m.from === "company" ? o.companyName : "You"} body={m.body} at={m.createdAt} />
        ))}
      </div>

      {open && (
        <form onSubmit={send} className="mt-4">
          <textarea
            rows={2}
            maxLength={1000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={o.status === "new" ? "Reply to open a conversation…" : "Write a message…"}
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm focus:border-leaf focus:outline-none"
          />
          {error && <p className="mt-1 text-sm text-coral">{error}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !draft.trim()} className={btnPrimary}>
              {busy ? "Sending…" : o.status === "new" ? "Reply" : "Send"}
            </button>
            {o.status === "new" && (
              <button type="button" onClick={() => setStatus("passed")} className={btnOutline}>
                Not right now
              </button>
            )}
            <button type="button" onClick={() => setStatus("blocked")} className={btnOutline}>
              Block
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {o.status === "new"
              ? "They only see your reply if you send one. Passing shows them “Not right now”."
              : "Share contact details only if you want to."}
          </p>
        </form>
      )}
    </li>
  );
}

function Bubble({ from, name, body, at }: { from: "company" | "engineer"; name: string; body: string; at: string }) {
  const mine = from === "engineer";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-on-primary" : "bg-surface-2"}`}>
        <p className={`text-xs ${mine ? "opacity-80" : "text-muted"}`}>
          {name} · {when(at)}
        </p>
        <p className="mt-0.5 whitespace-pre-wrap">{body}</p>
      </div>
    </div>
  );
}
