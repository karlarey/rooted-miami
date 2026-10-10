import { levels, packageItems } from "@/lib/levels";
import { welcomePackage } from "@/lib/recommend";
import type { Profile } from "@/lib/types";
import { PanaAvatar } from "./bubbles";

const order = ["community", "purpose", "identity", "career", "practical"] as const;

/** Brief "building" moment between the last answer and the reveal. */
export function BuildingPackage({ name }: { name: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center" role="status">
      <div className="animate-pulse motion-reduce:animate-none">
        <PanaAvatar size="lg" />
      </div>
      <p className="mt-6 text-lg font-semibold text-ink">Building your welcome package…</p>
      <p className="mt-1 text-sm text-muted">Matching {name} with Miami, one side quest at a time.</p>
      <ul className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2">
        {order.map((item, i) => (
          <li
            key={item}
            className="animate-pulse rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink motion-reduce:animate-none"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <span aria-hidden>{packageItems[item].emoji}</span> {packageItems[item].name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PackageReveal({ profile, onContinue }: { profile: Profile; onContinue: () => void }) {
  const pkg = welcomePackage(profile, "seed").sort(
    (a, b) => order.indexOf(a.quest.item) - order.indexOf(b.quest.item),
  );
  const seed = levels.seed;

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-8">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">Your welcome package</p>
      <h1 className="mt-1 text-3xl leading-tight font-bold text-ink">¡Bienvenido a Miami, {profile.name}!</h1>
      <p className="mt-2 text-muted">
        Here&apos;s where your journey starts. Do these for real, out in the city, then tell Pana how it went.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
        <span className="text-3xl" aria-hidden>
          {seed.emoji}
        </span>
        <div>
          <p className="font-semibold text-ink">
            Level 1 · {seed.name} <span className="font-normal text-muted">· {seed.milestone}</span>
          </p>
          <p className="text-sm text-muted">Next: {seed.earnedBy.toLowerCase()}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {pkg.map(({ quest, reasons }) => {
          const item = packageItems[quest.item];
          return (
            <li key={quest.id} className="rounded-2xl border border-line bg-surface shadow-card p-4">
              <p className="text-xs font-semibold tracking-wide text-leaf uppercase">
                <span aria-hidden>{item.emoji}</span> {item.name}
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">{quest.title}</p>
              <p className="mt-1 text-sm text-muted">{quest.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {quest.place && <Tag>📍 {quest.place}</Tag>}
                <Tag>⏱ {quest.timeMinutes < 60 ? `${quest.timeMinutes} min` : `${Math.round(quest.timeMinutes / 60)} hr`}</Tag>
                {quest.carFree && <Tag>🚇 Car-free</Tag>}
                {quest.recurring && <Tag>🔁 Weekly</Tag>}
              </div>
              {reasons[0] && (
                <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-xs text-ink">
                  <span className="font-semibold">Why you:</span> {reasons[0]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 -mx-4 mt-6 bg-bg/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-on-primary transition active:scale-[0.98]"
        >
          Start my journey →
        </button>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface-2 px-2.5 py-1 text-muted">{children}</span>;
}
