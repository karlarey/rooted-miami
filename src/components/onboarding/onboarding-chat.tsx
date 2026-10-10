"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useJourney } from "@/lib/use-journey";
import type { Profile } from "@/lib/types";
import { AnswerBar, type Answer } from "./answer-bar";
import { MyBubble, PanaAvatar, PanaBubble, TypingBubble } from "./bubbles";
import { BuildingPackage, PackageReveal } from "./package-reveal";
import {
  buildProfile,
  closingLines,
  introLines,
  line,
  nextStepIndex,
  steps,
  type Draft,
  type Line,
} from "./script";

interface Message {
  from: "pana" | "me";
  text: string;
}

const DONE = -1;
const BUILD_MS = 2400;

/** Typing time that feels like a friend texting: longer lines take longer. */
const typingDelay = (text: string) => Math.min(1500, 450 + text.length * 14);

export function OnboardingChat({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const { start } = useJourney();

  const [draft, setDraft] = useState<Draft>(() => (initialName ? { name: initialName } : {}));
  const [stepIdx, setStepIdx] = useState(() => nextStepIndex(0, draft));
  const [messages, setMessages] = useState<Message[]>([]);
  const [queue, setQueue] = useState<string[]>(() => [
    ...introLines(initialName),
    ...steps[stepIdx].say.map((l) => line(l, draft)),
  ]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const typing = queue.length > 0;
  const building = stepIdx === DONE && !typing && !profile;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Deliver El Pana's queued texts one at a time, with a typing pause.
  useEffect(() => {
    if (queue.length === 0) return;
    const t = setTimeout(() => {
      setMessages((m) => [...m, { from: "pana", text: queue[0] }]);
      setQueue((q) => q.slice(1));
    }, typingDelay(queue[0]));
    return () => clearTimeout(t);
  }, [queue]);

  // After the last text: a short "building" moment, then save and reveal.
  useEffect(() => {
    if (!building) return;
    const t = setTimeout(() => {
      const p = buildProfile(draft);
      start(p);
      setProfile(p);
    }, BUILD_MS);
    return () => clearTimeout(t);
  }, [building, draft, start]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const answer = (a: Answer) => {
    const step = steps[stepIdx];
    let next = draft;
    let mine = "";
    let reply: Line | undefined;

    if (a.kind === "choice") {
      next = a.choice.apply(draft);
      mine = a.choice.label;
      reply = a.choice.reply;
    } else if (a.kind === "other" && step.kind === "single" && step.other) {
      next = step.other.apply(draft, a.text);
      mine = a.text;
      reply = step.other.reply;
    } else if (a.kind === "multi" && step.kind === "multi") {
      next = step.apply(draft, a.values);
      mine = a.labels.join("  ");
      reply = step.reply;
    } else if (a.kind === "none" && step.kind === "multi") {
      next = step.apply(draft, []);
      mine = a.label;
      reply = step.none?.reply;
    } else if (a.kind === "text" && step.kind === "text") {
      next = step.apply(draft, a.text);
      mine = a.text;
      reply = step.reply;
    } else if (a.kind === "skip" && step.kind === "text") {
      mine = a.label;
      reply = step.skip?.reply;
    }

    const after = nextStepIndex(stepIdx + 1, next);
    const lines = [
      ...(reply ? [line(reply, next)] : []),
      ...(after === DONE ? closingLines(next) : steps[after].say.map((l) => line(l, next))),
    ];

    setMessages((m) => [...m, { from: "me", text: mine }]);
    setDraft(next);
    setStepIdx(after);
    setQueue(lines);
  };

  const progress = useMemo(() => {
    if (stepIdx === DONE) return 100;
    const visible = steps.filter((s) => !s.when || s.when(draft));
    const at = visible.indexOf(steps[stepIdx]);
    return Math.round((Math.max(at, 0) / visible.length) * 100);
  }, [stepIdx, draft]);

  if (profile) {
    return (
      <Shell>
        <PackageReveal profile={profile} onContinue={() => router.push("/journey")} />
      </Shell>
    );
  }

  if (building) {
    return (
      <Shell>
        <BuildingPackage name={draft.name ?? "you"} />
      </Shell>
    );
  }

  const step = stepIdx === DONE ? null : steps[stepIdx];

  return (
    <Shell>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 px-4 pt-3 pb-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/login" aria-label="Back to login" className="-ml-1 px-1 text-xl text-muted">
            ‹
          </Link>
          <PanaAvatar />
          <div className="min-w-0 flex-1">
            <p className="leading-tight font-semibold text-ink">El Pana</p>
            <p className="text-xs text-muted">{typing ? "typing…" : "your buddy in Miami"}</p>
          </div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">🌱 Character creation</span>
        </div>
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-coral transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 space-y-2 px-4 py-4" aria-live="polite">
        {messages.map((m, i) =>
          m.from === "pana" ? (
            <PanaBubble key={i} text={m.text} showAvatar={messages[i + 1]?.from !== "pana" && !(typing && i === messages.length - 1)} />
          ) : (
            <div key={i} className="pt-2 pb-1">
              <MyBubble text={m.text} />
            </div>
          ),
        )}
        {typing && <TypingBubble />}
        <div ref={bottomRef} className="h-2" />
      </div>

      {step && !typing && (
        <div className="sticky bottom-0 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <AnswerBar key={step.id} step={step} onAnswer={answer} />
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg">{children}</main>;
}
