import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import type { Interest, Neighborhood, Profile } from "@/lib/types";

/**
 * Pana's scripted onboarding ("character creation").
 * Deliberately not an LLM call: the demo has to work every single time.
 * Each step is one question; each answer can trigger a short reaction.
 */

export type Draft = Partial<Profile>;

/** A line Pana texts. Functions see the draft *after* the latest answer. */
export type Line = string | ((d: Draft) => string);

export interface Choice {
  label: string;
  apply: (d: Draft) => Draft;
  reply?: Line;
}

interface BaseStep {
  id: string;
  say: Line[];
  /** Skip the step when this returns false. */
  when?: (d: Draft) => boolean;
}

export interface SingleStep extends BaseStep {
  kind: "single";
  choices: Choice[];
  /** Optional "something else" chip that opens a text box. */
  other?: { label: string; placeholder: string; apply: (d: Draft, text: string) => Draft; reply?: Line };
}

export interface MultiStep extends BaseStep {
  kind: "multi";
  options: { label: string; value: Interest }[];
  /** Exclusive "none of these" chip. */
  none?: { label: string; reply?: Line };
  cta: string;
  apply: (d: Draft, values: Interest[]) => Draft;
  reply?: Line;
}

export interface TextStep extends BaseStep {
  kind: "text";
  placeholder: string;
  apply: (d: Draft, text: string) => Draft;
  reply?: Line;
  /** If set, the step can be skipped with this chip. */
  skip?: { label: string; reply?: Line };
}

export type Step = SingleStep | MultiStep | TextStep;

export const line = (l: Line, d: Draft) => (typeof l === "function" ? l(d) : l);

const firstName = (d: Draft) => (d.name ? `, ${d.name}` : "");

/** Short label for where someone came from, for use mid-sentence. */
const home = (d: Draft) => (d.movedFrom && d.movedFrom !== "somewhere else" ? d.movedFrom : "home");

const neighborhoods: Exclude<Neighborhood, "Citywide">[] = [
  "Brickell",
  "Downtown",
  "Wynwood",
  "Edgewater",
  "Little Havana",
  "Little Haiti",
  "Coconut Grove",
  "Coral Gables",
  "Key Biscayne",
  "Miami Beach",
  "Doral",
];

const hoodReplies: Partial<Record<Neighborhood, string>> = {
  Brickell: "Brickell, nice. The Metromover is right there and it's free. Use it.",
  Downtown: "Downtown! You're in the middle of everything, and the Metromover loop is basically your backyard.",
  Wynwood: "Wynwood 🎨 Murals, coffee, breweries. You picked a fun one.",
  Edgewater: "Edgewater, great pick. Bay views and the Baywalk for sunset runs.",
  "Little Havana": "Little Havana! Cafecito capital. The ventanitas on Calle Ocho are gonna know your order soon.",
  "Little Haiti": "Little Haiti 🇭🇹 Music, art and some of the best food in the city. Love it.",
  "Coconut Grove": "The Grove 🌳 Shady streets, sailboats, oldest neighborhood in Miami. Very chill.",
  "Coral Gables": "Coral Gables, elegant. Venetian Pool alone is worth it.",
  "Key Biscayne": "Key Biscayne?! Island life. Crandon Park is going to be your weekend.",
  "Miami Beach": "Miami Beach 🏖️ Sunrise on the sand before work hits different.",
  Doral: "Doral, good spot. Big Venezuelan community, so the arepas are elite.",
};

const officeChoices: Choice[] = [
  ...neighborhoods.map((n) => ({ label: n, apply: (d: Draft) => ({ ...d, worksIn: n }) })),
  { label: "Somewhere else", apply: (d: Draft) => ({ ...d, worksIn: "Citywide" as const }) },
];

export const interestOptions: { label: string; value: Interest }[] = [
  { label: "🎾 Tennis", value: "tennis" },
  { label: "🏓 Pickleball / padel", value: "racket" },
  { label: "🏃 Running", value: "running" },
  { label: "🚴 Cycling", value: "cycling" },
  { label: "🏄 Paddleboard / surf", value: "water" },
  { label: "🏖️ Beach days", value: "beach" },
  { label: "⚽ Team sports", value: "team-sports" },
  { label: "🍜 Trying new food", value: "food" },
  { label: "🎨 Museums & art", value: "culture" },
  { label: "💃 Live music & dancing", value: "music" },
  { label: "💻 Tech meetups", value: "tech" },
  { label: "🗺️ Exploring the city", value: "explore" },
];

const impactOptions: { label: string; value: Interest }[] = [
  { label: "🎓 Mentor students", value: "teaching" },
  { label: "🌊 Climate & the bay", value: "climate" },
  { label: "🤲 Help my neighbors", value: "community-service" },
];

const impactValues = impactOptions.map((o) => o.value);

const stackEmoji: Record<Stack, string> = {
  backend: "⚙️",
  frontend: "🎨",
  fullstack: "🧩",
  "data-ml": "📊",
  mobile: "📱",
  devops: "☁️",
  security: "🔐",
  product: "🧭",
};

function stackChoices(): Choice[] {
  return (Object.keys(stackLabels) as Stack[]).map((s) => ({
    label: `${stackEmoji[s]} ${stackLabels[s]}`,
    apply: (d: Draft) => ({ ...d, stack: s, role: d.role ?? roleForStack(s) }),
  }));
}

const seniorityReplies: Record<Seniority, string> = {
  junior: "Early days, love it. Miami's senior engineers are going to want to meet you.",
  mid: "Mid-level, the sweet spot. Lots of doors open from here.",
  senior: "Senior, nice. People here are going to want to learn from you.",
  staff: "Staff+! Miami needs more of you. Seriously.",
};

/** "Backend engineer", "Product manager"… for when we only know the stack. */
export function roleForStack(s: Stack): string {
  if (s === "product") return "Product manager";
  if (s === "data-ml") return "Data / ML engineer";
  if (s === "devops") return "Platform engineer";
  return `${stackLabels[s]} engineer`;
}

export function introLines(name?: string): string[] {
  return [
    `¡Bienvenido a Miami${name ? `, ${name}` : ""}! 👋`,
    "I'm Pana, your buddy in the city. (Pana = buddy, ask anyone from PR, Venezuela or the DR.)",
    "A few quick questions and I'll put together your welcome package. Takes like 3 minutes.",
  ];
}

export const steps: Step[] = [
  {
    id: "name",
    kind: "text",
    when: (d) => !d.name,
    say: ["First things first: what should I call you?"],
    placeholder: "Your first name",
    apply: (d, text) => ({ ...d, name: text }),
    reply: (d) => `Mucho gusto, ${d.name}! 🤝`,
  },
  {
    id: "movedFrom",
    kind: "single",
    when: (d) => !d.movedFrom,
    say: ["So where'd you move from?"],
    choices: [
      {
        label: "🗽 NYC",
        apply: (d) => ({ ...d, movedFrom: "New York City" }),
        reply: "NYC → Miami, a classic. You'll miss the subway, not gonna lie. The winters? Not so much 😅",
      },
      {
        label: "🌉 SF Bay Area",
        apply: (d) => ({ ...d, movedFrom: "SF Bay Area" }),
        reply: "From the Bay! Trading fog for 80° in January. Good trade.",
      },
      {
        label: "🌭 Chicago",
        apply: (d) => ({ ...d, movedFrom: "Chicago" }),
        reply: "Chicago! You've earned this weather. Seriously.",
      },
      {
        label: "🦞 Boston",
        apply: (d) => ({ ...d, movedFrom: "Boston" }),
        reply: "Boston → Miami. Wicked big change, I know 😄",
      },
      {
        label: "🌴 LA",
        apply: (d) => ({ ...d, movedFrom: "Los Angeles" }),
        reply: "LA! Same palm trees, way more Spanish, and you can actually walk to the beach here.",
      },
    ],
    other: {
      label: "📍 Somewhere else",
      placeholder: "City or country",
      apply: (d, text) => ({ ...d, movedFrom: text }),
      reply: (d) => `${d.movedFrom}, love it. Miami's full of people from everywhere, you'll fit right in.`,
    },
  },
  {
    id: "livesIn",
    kind: "single",
    say: ["And where are you living now?"],
    choices: [
      ...neighborhoods.map((n) => ({
        label: n,
        apply: (d: Draft) => ({ ...d, livesIn: n }),
        reply: hoodReplies[n],
      })),
      {
        label: "Not sure yet",
        apply: (d) => ({ ...d, livesIn: "Citywide" as const }),
        reply: "No stress. Picking the right neighborhood is literally one of your first quests.",
      },
    ],
  },
  {
    id: "worksFrom",
    kind: "single",
    say: ["How about work: office, remote, or a mix?"],
    choices: [
      {
        label: "🏢 Office",
        apply: (d) => ({ ...d, worksFrom: "office" }),
        reply: "Office, got it. Coworkers are great, but we're getting you people outside work too.",
      },
      {
        label: "🏠 Remote",
        apply: (d) => ({ ...d, worksFrom: "remote", worksIn: d.livesIn }),
        reply: "Remote, nice. Then we make sure your week has real people in it, not just Zoom tiles.",
      },
      {
        label: "🔀 Hybrid",
        apply: (d) => ({ ...d, worksFrom: "hybrid" }),
        reply: "Hybrid, best of both. Office days for the team, the rest for Miami.",
      },
    ],
  },
  {
    id: "worksIn",
    kind: "single",
    when: (d) => d.worksFrom !== "remote",
    say: ["Where's the office?"],
    choices: officeChoices,
  },
  {
    id: "stack",
    kind: "single",
    when: (d) => !d.stack,
    say: ["What kind of work do you do?"],
    choices: stackChoices(),
  },
  {
    id: "seniority",
    kind: "single",
    when: (d) => !d.seniority,
    say: ["And where are you in your career?"],
    choices: (["junior", "mid", "senior", "staff"] as Seniority[]).map((s) => ({
      label: seniorityLabels[s],
      apply: (d: Draft) => ({ ...d, seniority: s }),
      reply: seniorityReplies[s],
    })),
  },
  {
    id: "household",
    kind: "single",
    say: ["Did you come solo or with people?"],
    choices: [
      {
        label: "🙋 Just me",
        apply: (d) => ({ ...d, household: "alone" }),
        reply: "Solo, respect. That's exactly what I'm here for.",
      },
      {
        label: "💑 With my partner",
        apply: (d) => ({ ...d, household: "partner" }),
        reply: "Love that. Your partner gets a welcome too. They need their own people here as much as you do.",
      },
      {
        label: "👨‍👩‍👧 With my family",
        apply: (d) => ({ ...d, household: "family" }),
        reply: "¡Familia! You're gonna fit right in. Miami runs on family.",
      },
    ],
  },
  {
    id: "hasCar",
    kind: "single",
    say: ["Car or no car?"],
    choices: [
      {
        label: "🚗 I've got a car",
        apply: (d) => ({ ...d, hasCar: true }),
        reply: "Ok, but I'm still getting you on the Metromover at least once 😉",
      },
      {
        label: "🚶 No car (yet)",
        apply: (d) => ({ ...d, hasCar: false }),
        reply: "Bold! Miami's more car-free than people think: Metromover, Metrorail, Brightline, Freebee, Citi Bike. I got you.",
      },
    ],
  },
  {
    id: "interests",
    kind: "multi",
    say: ["Ok, now the fun part.", (d) => `What did you love doing back in ${home(d)}? Pick as many as you want.`],
    options: interestOptions,
    cta: "That's me",
    apply: (d, values) => ({ ...d, interests: values }),
    reply: "Perfect. Miami has a weekly version of basically all of that. Some of it on the beach 😎",
  },
  {
    id: "impact",
    kind: "multi",
    say: [
      "Real talk for a sec.",
      "A lot of people here could use what you know. Want to make an impact while you're here?",
    ],
    options: impactOptions,
    none: { label: "Not right now", reply: "Totally fair. The offer stands whenever you're ready." },
    cta: "Count me in",
    apply: (d, values) => ({
      ...d,
      interests: [...(d.interests ?? []).filter((i) => !impactValues.includes(i)), ...values],
    }),
    reply: (d) =>
      d.interests?.includes("teaching")
        ? "Dale 🙌 Some students at FIU and MDC are gonna be lucky to meet you."
        : "Dale 🙌 That's how Miami starts needing you back.",
  },
  {
    id: "missesMost",
    kind: "text",
    say: [(d) => `What do you miss most about ${home(d)}? Anything goes.`],
    placeholder: "e.g. running into friends on the street",
    apply: (d, text) => ({ ...d, missesMost: text }),
    reply: "Writing that down 📝 Let's find you the Miami version.",
    skip: { label: "Skip for now", reply: "All good, you can tell me later." },
  },
  {
    id: "languages",
    kind: "single",
    when: (d) => !d.languages?.length,
    say: ["¿Y tu español? How's your Spanish?"],
    choices: [
      {
        label: "🇪🇸 Fluent",
        apply: (d) => ({ ...d, languages: ["English", "Spanish"] }),
        reply: "¡Eso! You're gonna be fine here, mi pana.",
      },
      {
        label: "🤏 Un poquito",
        apply: (d) => ({ ...d, languages: ["English", "some Spanish"] }),
        reply: "Un poquito is a great start. You'll be saying \"dale\" by next week.",
      },
      {
        label: "🙈 Not yet",
        apply: (d) => ({ ...d, languages: ["English"] }),
        reply: "No pasa nada. Plenty of English here, and I'll teach you the essentials.",
      },
    ],
  },
  {
    id: "weekendHours",
    kind: "single",
    say: ["Last one, promise. How many free hours do you have on a typical weekend?"],
    choices: [2, 4, 6, 8].map((h) => ({
      label: h === 8 ? "8+ hrs" : `${h} hrs`,
      apply: (d: Draft) => ({ ...d, weekendHours: h }),
    })),
  },
];

export function closingLines(d: Draft): string[] {
  return [`Dale${firstName(d)}. Give me a sec, I'm putting your welcome package together…`];
}

/** Turn the conversation into a Profile for useJourney().start(). */
export function buildProfile(d: Draft): Profile {
  const livesIn = d.livesIn ?? "Citywide";
  return {
    name: d.name?.trim() || "Friend",
    movedFrom: d.movedFrom ?? "somewhere else",
    monthsInMiami: 0,
    role: d.role ?? (d.stack ? roleForStack(d.stack) : "Engineer"),
    livesIn,
    worksIn: d.worksIn ?? livesIn,
    worksFrom: d.worksFrom ?? "office",
    household: d.household ?? "alone",
    hasCar: d.hasCar ?? true,
    interests: d.interests?.length ? d.interests : ["explore"],
    missesMost: d.missesMost ?? "",
    weekendHours: d.weekendHours ?? 4,
    languages: d.languages ?? ["English"],
    ...(d.stack ? { stack: d.stack } : {}),
    ...(d.seniority ? { seniority: d.seniority } : {}),
    completedQuests: [],
  };
}

export function nextStepIndex(from: number, d: Draft): number {
  for (let i = from; i < steps.length; i++) {
    if (!steps[i].when || steps[i].when!(d)) return i;
  }
  return -1;
}

/* ── Optional first step: import from a LinkedIn PDF ─────────────────────── */

/** What /api/profile/import returns in `fields`. */
export type ImportedFields = Pick<Draft, "role" | "movedFrom" | "languages" | "stack" | "seniority"> & {
  skills: string[];
};

export const importOfferLines = [
  "Got a LinkedIn profile? Drop the PDF and I'll skip the boring questions.",
  "(On LinkedIn: your profile → More → Save to PDF.)",
];

/** "Backend engineer, senior, from New York City" (whatever parts we found). */
export function importSummary(f: ImportedFields): string {
  const role = f.role ?? (f.stack ? roleForStack(f.stack) : undefined);
  const parts = [
    role,
    f.seniority ? seniorityLabels[f.seniority].toLowerCase() : undefined,
    f.movedFrom ? `from ${f.movedFrom}` : undefined,
  ].filter(Boolean);
  return parts.join(", ");
}

export function importFoundLines(f: ImportedFields): string[] {
  const summary = importSummary(f);
  return [
    "Got it 👀",
    ...(f.skills.length ? [`I see ${f.skills.slice(0, 4).join(", ")}${f.skills.length > 4 ? " and more" : ""}.`] : []),
    `${summary.charAt(0).toUpperCase()}${summary.slice(1)}: did I get that right?`,
  ];
}

/** Fold confirmed imported fields into the draft (only the ones we got). */
export function applyImport(d: Draft, f: ImportedFields): Draft {
  const next: Draft = { ...d };
  if (f.role) next.role = f.role;
  if (f.stack) next.stack = f.stack;
  if (f.seniority) next.seniority = f.seniority;
  if (f.movedFrom) next.movedFrom = f.movedFrom;
  if (f.languages?.length) next.languages = f.languages;
  return next;
}
