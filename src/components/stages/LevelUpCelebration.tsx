"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { levelOrder, levels } from "@/lib/levels";
import type { LevelId } from "@/lib/types";
import { stageCopy } from "./copy";

export interface LevelUpCelebrationProps {
  /** The level just reached. */
  level: LevelId;
  /** Called on close button, backdrop click, "See your path" link, or Esc. */
  onClose: () => void;
}

/** Leaves/sparkles that drift up behind the emoji. Positions are fixed so render is deterministic. */
const confetti = [
  { left: "12%", delay: "0ms", char: "🍃" },
  { left: "28%", delay: "180ms", char: "✨" },
  { left: "46%", delay: "90ms", char: "🌺" },
  { left: "64%", delay: "260ms", char: "✨" },
  { left: "82%", delay: "140ms", char: "🍃" },
];

const styles = `
@keyframes rooted-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes rooted-pop {
  from { opacity: 0; transform: translateY(16px) scale(.96) }
  to { opacity: 1; transform: none }
}
@keyframes rooted-grow {
  0% { transform: scale(.3) translateY(20px); opacity: 0 }
  60% { transform: scale(1.15) translateY(-4px); opacity: 1 }
  100% { transform: scale(1) }
}
@keyframes rooted-sway {
  0%, 100% { transform: rotate(-3deg) }
  50% { transform: rotate(3deg) }
}
@keyframes rooted-rise {
  0% { transform: translateY(0) scale(.6); opacity: 0 }
  20% { opacity: 1 }
  100% { transform: translateY(-120px) scale(1); opacity: 0 }
}
.rooted-backdrop { animation: rooted-fade 200ms ease-out both }
.rooted-card { animation: rooted-pop 320ms cubic-bezier(.2,.8,.2,1) both }
.rooted-emoji { animation: rooted-grow 700ms 120ms cubic-bezier(.2,.8,.2,1) both }
.rooted-emoji-inner { display: inline-block; transform-origin: 50% 90%; animation: rooted-sway 3s 900ms ease-in-out infinite }
.rooted-confetti { animation: rooted-rise 1.6s ease-out both }
@media (prefers-reduced-motion: reduce) {
  .rooted-backdrop, .rooted-card, .rooted-emoji, .rooted-emoji-inner { animation: none }
  .rooted-confetti { display: none }
}
`;

export function LevelUpCelebration({ level, onClose }: LevelUpCelebrationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const info = levels[level];
  const copy = stageCopy[level];
  const step = levelOrder.indexOf(level) + 1;

  // Keep the latest onClose without re-running the focus effect when the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Focus the primary action, trap Tab inside, close on Esc, restore focus on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <style>{styles}</style>
      <div aria-hidden className="rooted-backdrop absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="rooted-card relative w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface p-6 text-center shadow-xl"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-leaf-soft to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-20 h-0">
          {confetti.map((c) => (
            <span
              key={c.left}
              className="rooted-confetti absolute text-lg"
              style={{ left: c.left, animationDelay: c.delay }}
            >
              {c.char}
            </span>
          ))}
        </div>

        <p className="relative text-xs font-semibold uppercase tracking-widest text-leaf">
          ¡Felicidades! · Stage {step} of {levelOrder.length}
        </p>
        <div aria-hidden className="rooted-emoji relative mx-auto mt-4 grid size-24 place-items-center rounded-full bg-accent-soft">
          <span className="rooted-emoji-inner text-5xl">{info.emoji}</span>
        </div>

        <h2 id={titleId} className="relative mt-4 text-2xl font-bold text-ink">
          {copy.celebrateTitle}
        </h2>
        <p id={bodyId} className="relative mt-2 text-base text-ink">
          {copy.celebrateBody}
        </p>
        <p className="relative mt-1 text-sm text-muted">
          {info.emoji} {info.name} · {info.milestone}
        </p>
        <p className="relative mt-4 rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink">{copy.celebrateNext}</p>

        <div className="relative mt-6 flex flex-col gap-2">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-surface outline-offset-2 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand"
          >
            ¡Vamos! Keep going
          </button>
          <Link
            href="/stages"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-medium text-leaf outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-leaf"
          >
            See your path
          </Link>
        </div>
      </div>
    </div>
  );
}
