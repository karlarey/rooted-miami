export type Trigger = "layoff" | "lease" | "quiet" | "coworker-left";

export const triggers: Record<Trigger, { label: string; emoji: string; event: string }> = {
  layoff: {
    label: "Got laid off",
    emoji: "💼",
    event: "Alex was just laid off from their job. This is the moment people decide to leave Miami.",
  },
  lease: {
    label: "Lease renewal",
    emoji: "🏠",
    event: "Alex's lease renews in 60 days with a rent increase.",
  },
  quiet: {
    label: "3 weeks quiet",
    emoji: "🔕",
    event: "Alex hasn't completed a quest or shown up to their ritual in 3 weeks.",
  },
  "coworker-left": {
    label: "Close coworker left",
    emoji: "👋",
    event: "Alex's closest coworker just moved away from Miami.",
  },
};

export function isTrigger(value: unknown): value is Trigger {
  return typeof value === "string" && value in triggers;
}
