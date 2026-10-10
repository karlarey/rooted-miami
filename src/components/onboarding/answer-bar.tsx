"use client";

import { useState } from "react";
import type { Interest } from "@/lib/types";
import type { Choice, MultiStep, SingleStep, Step, TextStep } from "./script";

/** What the user tapped or typed, handed back to the chat. */
export type Answer =
  | { kind: "choice"; choice: Choice }
  | { kind: "other"; text: string }
  | { kind: "multi"; values: Interest[]; labels: string[] }
  | { kind: "none"; label: string }
  | { kind: "text"; text: string }
  | { kind: "skip"; label: string };

const chip =
  "rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf";
const chipIdle = "border-line bg-surface text-ink hover:border-brand";
const chipOn = "border-leaf bg-leaf-soft text-ink";

export function AnswerBar({ step, onAnswer }: { step: Step; onAnswer: (a: Answer) => void }) {
  // Keyed by step id in the parent, so local state resets for each question.
  if (step.kind === "single") return <SingleAnswer step={step} onAnswer={onAnswer} />;
  if (step.kind === "multi") return <MultiAnswer step={step} onAnswer={onAnswer} />;
  return <TextAnswer step={step} onAnswer={onAnswer} />;
}

function SingleAnswer({ step, onAnswer }: { step: SingleStep; onAnswer: (a: Answer) => void }) {
  const [typing, setTyping] = useState(false);

  if (typing && step.other) {
    return (
      <TextBox
        placeholder={step.other.placeholder}
        onSubmit={(text) => onAnswer({ kind: "other", text })}
        onCancel={() => setTyping(false)}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {step.choices.map((choice) => (
        <button key={choice.label} type="button" className={`${chip} ${chipIdle}`} onClick={() => onAnswer({ kind: "choice", choice })}>
          {choice.label}
        </button>
      ))}
      {step.other && (
        <button type="button" className={`${chip} ${chipIdle}`} onClick={() => setTyping(true)}>
          {step.other.label}
        </button>
      )}
    </div>
  );
}

function MultiAnswer({ step, onAnswer }: { step: MultiStep; onAnswer: (a: Answer) => void }) {
  const [picked, setPicked] = useState<Interest[]>([]);
  const toggle = (v: Interest) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {step.options.map((o) => {
          const on = picked.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className={`${chip} ${on ? chipOn : chipIdle}`}
              onClick={() => toggle(o.value)}
            >
              {o.label}
              {on && <span className="ml-1 text-leaf">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={picked.length === 0}
          className="flex-1 rounded-full bg-primary px-5 py-3 text-base font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-40"
          onClick={() =>
            onAnswer({
              kind: "multi",
              values: picked,
              labels: step.options.filter((o) => picked.includes(o.value)).map((o) => o.label),
            })
          }
        >
          {step.cta}
          {picked.length > 0 && ` (${picked.length})`} →
        </button>
        {step.none && (
          <button
            type="button"
            className={`${chip} ${chipIdle} py-3`}
            onClick={() => onAnswer({ kind: "none", label: step.none!.label })}
          >
            {step.none.label}
          </button>
        )}
      </div>
    </div>
  );
}

function TextAnswer({ step, onAnswer }: { step: TextStep; onAnswer: (a: Answer) => void }) {
  return (
    <div className="space-y-2">
      <TextBox placeholder={step.placeholder} onSubmit={(text) => onAnswer({ kind: "text", text })} />
      {step.skip && (
        <button
          type="button"
          className={`${chip} ${chipIdle}`}
          onClick={() => onAnswer({ kind: "skip", label: step.skip!.label })}
        >
          {step.skip.label}
        </button>
      )}
    </div>
  );
}

function TextBox({
  placeholder,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState("");
  const text = value.trim();

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text) onSubmit(text);
      }}
    >
      {onCancel && (
        <button
          type="button"
          aria-label="Back to options"
          className="h-11 w-11 shrink-0 rounded-full border border-line bg-surface text-muted"
          onClick={onCancel}
        >
          ←
        </button>
      )}
      <input
        autoFocus
        value={value}
        maxLength={140}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-leaf focus:outline-none"
      />
      <button
        type="submit"
        disabled={!text}
        aria-label="Send"
        className="h-11 w-11 shrink-0 rounded-full bg-primary text-lg font-bold text-on-primary transition active:scale-95 disabled:opacity-40"
      >
        ↑
      </button>
    </form>
  );
}
