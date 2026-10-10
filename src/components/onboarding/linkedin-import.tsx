"use client";

import { useId, useRef, useState } from "react";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import type { ImportedFields } from "./script";

const MAX_BYTES = 5 * 1024 * 1024;

const chip =
  "rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";
const chipIdle = "border-line bg-surface text-ink hover:border-coral";
const primary =
  "flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 text-base font-semibold text-bg transition active:scale-[0.98] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

export interface ImportSuccess {
  fields: ImportedFields;
  confidence: number;
  source: "heuristic" | "llm";
  /** What the user "sent" in the chat, e.g. the file name. */
  sent: string;
}

/** Upload a LinkedIn PDF, try the sample, or skip to the questions. */
export function ImportOffer({ onImported, onSkip }: { onImported: (r: ImportSuccess) => void; onSkip: () => void }) {
  const inputId = useId();
  const noteId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (request: () => Promise<Response>, sent: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await request();
      const data = (await res.json().catch(() => ({}))) as Partial<ImportSuccess> & { error?: string };
      if (!res.ok || !data.fields) throw new Error(data.error ?? "Something went wrong reading that PDF.");
      onImported({
        fields: { ...data.fields, skills: data.fields.skills ?? [] },
        confidence: data.confidence ?? 0,
        source: data.source ?? "heuristic",
        sent,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong reading that PDF.");
      setBusy(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") return setError("That isn't a PDF. Try LinkedIn's Save to PDF.");
    if (file.size > MAX_BYTES) return setError("That PDF is over 5 MB.");
    const body = new FormData();
    body.append("file", file);
    void send(() => fetch("/api/profile/import", { method: "POST", body }), `📄 ${file.name}`);
  };

  const sample = () =>
    void send(
      () =>
        fetch("/api/profile/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sample: true }),
        }),
      "📄 Sample profile",
    );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="peer sr-only"
        aria-describedby={noteId}
        disabled={busy}
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <label
        htmlFor={inputId}
        aria-disabled={busy}
        className={`${primary} cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        {busy ? "Reading your profile…" : "📄 Upload my LinkedIn PDF"}
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={`${chip} ${chipIdle} disabled:opacity-40`} onClick={sample}>
          ✨ Try with a sample profile
        </button>
        <button type="button" disabled={busy} className={`${chip} ${chipIdle} disabled:opacity-40`} onClick={onSkip}>
          Answer the questions instead
        </button>
      </div>

      <p id={noteId} className="flex items-start gap-1.5 text-xs text-muted">
        <span aria-hidden>🔒</span>
        <span>Read once, never stored. PDF only, up to 5 MB.</span>
      </p>

      <p role="status" aria-live="polite" className="text-sm">
        {busy && <span className="sr-only">Reading your profile…</span>}
        {error && <span className="text-coral">{error}</span>}
      </p>
    </div>
  );
}

/** "Did I get that right?" Confirm, or fix the fields before moving on. */
export function ImportConfirm({
  fields,
  onConfirm,
}: {
  fields: ImportedFields;
  onConfirm: (fields: ImportedFields, corrected: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${chip} border-teal bg-teal-soft text-ink`} onClick={() => onConfirm(fields, false)}>
          👍 Yep, that&apos;s me
        </button>
        <button type="button" className={`${chip} ${chipIdle}`} onClick={() => setEditing(true)}>
          ✏️ Let me fix something
        </button>
      </div>
    );
  }

  return <ImportEditForm fields={fields} onSave={(f) => onConfirm(f, true)} onCancel={() => setEditing(false)} />;
}

function ImportEditForm({
  fields,
  onSave,
  onCancel,
}: {
  fields: ImportedFields;
  onSave: (f: ImportedFields) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [role, setRole] = useState(fields.role ?? "");
  const [stack, setStack] = useState<Stack | "">(fields.stack ?? "");
  const [seniority, setSeniority] = useState<Seniority | "">(fields.seniority ?? "");
  const [movedFrom, setMovedFrom] = useState(fields.movedFrom ?? "");

  const field = "h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink focus:border-teal focus:outline-none";
  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...fields,
          role: role.trim() || undefined,
          stack: stack || undefined,
          seniority: seniority || undefined,
          movedFrom: movedFrom.trim() || undefined,
        });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label htmlFor={`${id}-role`} className={label}>
            Role
          </label>
          <input id={`${id}-role`} className={field} value={role} maxLength={60} onChange={(e) => setRole(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor={`${id}-stack`} className={label}>
            Kind of work
          </label>
          <select id={`${id}-stack`} className={field} value={stack} onChange={(e) => setStack(e.target.value as Stack | "")}>
            <option value="">Ask me later</option>
            {(Object.keys(stackLabels) as Stack[]).map((s) => (
              <option key={s} value={s}>
                {stackLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-seniority`} className={label}>
            Level
          </label>
          <select
            id={`${id}-seniority`}
            className={field}
            value={seniority}
            onChange={(e) => setSeniority(e.target.value as Seniority | "")}
          >
            <option value="">Ask me later</option>
            {(Object.keys(seniorityLabels) as Seniority[]).map((s) => (
              <option key={s} value={s}>
                {seniorityLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-from`} className={label}>
            Moved from
          </label>
          <input
            id={`${id}-from`}
            className={field}
            value={movedFrom}
            maxLength={60}
            placeholder="City or country"
            onChange={(e) => setMovedFrom(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to options"
          className="h-11 w-11 shrink-0 rounded-full border border-line bg-surface text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          onClick={onCancel}
        >
          ←
        </button>
        <button type="submit" className={primary}>
          That&apos;s better →
        </button>
      </div>
    </form>
  );
}
