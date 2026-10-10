"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useJourney } from "@/lib/use-journey";
import type { Profile } from "@/lib/types";
import { AnswerBar, type Answer } from "./answer-bar";
import { MyBubble, PanaAvatar, PanaBubble, TypingBubble } from "./bubbles";
import { ImportConfirm, ImportOffer, type ImportSuccess } from "./linkedin-import";
import { BuildingPackage, PackageReveal } from "./package-reveal";
import {
  applyImport,
  buildProfile,
  closingLines,
  importFoundLines,
  importOfferLines,
  importSummary,
  introLines,
  line,
  nextStepIndex,
  steps,
  type Draft,
  type ImportedFields,
  type Line,
} from "./script";

/** "import": El Pana offers the LinkedIn shortcut. "confirm": did I get that right? "chat": the questions. */
type Phase = "import" | "confirm" | "chat";

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
  const [phase, setPhase] = useState<Phase>("import");
  const [imported, setImported] = useState<ImportedFields | null>(null);
  const [queue, setQueue] = useState<string[]>(() => [...introLines(initialName), ...importOfferLines]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const typing = queue.length > 0;
  const building = phase === "chat" && stepIdx === DONE && !typing && !profile;
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

  /** Leave the import phase and continue with whichever questions are still open. */
  const continueToQuestions = (next: Draft, mine: string, lead: string[]) => {
    const at = nextStepIndex(0, next);
    setMessages((m) => [...m, { from: "me", text: mine }]);
    setDraft(next);
    setStepIdx(at);
    setPhase("chat");
    setQueue([...lead, ...(at === DONE ? closingLines(next) : steps[at].say.map((l) => line(l, next)))]);
  };

  const skipImport = () =>
    continueToQuestions(draft, "Answer the questions instead", ["No problem, let's do it the classic way."]);

  const onImported = (r: ImportSuccess) => {
    if (!importSummary(r.fields)) {
      continueToQuestions(draft, r.sent, ["Hmm, I couldn't make much of that one. No worries, I'll just ask you instead."]);
      return;
    }
    setMessages((m) => [...m, { from: "me", text: r.sent }]);
    setImported(r.fields);
    setPhase("confirm");
    setQueue(importFoundLines(r.fields));
  };

  const confirmImport = (fields: ImportedFields, corrected: boolean) => {
    const next = applyImport(draft, fields);
    const summary = importSummary(fields);
    continueToQuestions(next, corrected ? (summary ? `Actually: ${summary}` : "Let me just answer") : "Yep, that's me", [
      corrected ? "Thanks for fixing that 🙏" : "¡Dale! 🙌",
      "I'll skip what I already know. Just the personal stuff now: the part LinkedIn can't tell me.",
    ]);
  };

  const progress = useMemo(() => {
    if (phase !== "chat") return 0;
    if (stepIdx === DONE) return 100;
    const visible = steps.filter((s) => !s.when || s.when(draft));
    const at = visible.indexOf(steps[stepIdx]);
    return Math.round((Math.max(at, 0) / visible.length) * 100);
  }, [phase, stepIdx, draft]);

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

  const step = phase !== "chat" || stepIdx === DONE ? null : steps[stepIdx];

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

      {!typing && (phase !== "chat" || step) && (
        <div className="sticky bottom-0 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          {phase === "import" && <ImportOffer onImported={onImported} onSkip={skipImport} />}
          {phase === "confirm" && imported && <ImportConfirm fields={imported} onConfirm={confirmImport} />}
          {phase === "chat" && step && <AnswerBar key={step.id} step={step} onAnswer={answer} />}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg">{children}</main>;
}
