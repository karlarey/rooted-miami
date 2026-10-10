import { quests } from "@/data/quests";
import { levelFor } from "@/lib/progress";
import type { CheckIn, Interest, LevelId, Neighborhood, Profile, Quest } from "@/lib/types";

/**
 * SIMULATED DATA. Not real people, not real results.
 *
 * ~150 synthetic members generated deterministically (seeded PRNG) so the
 * city dashboard can show what Rooted *would* measure. Every number derived
 * from these members is an illustration of the measurement, never an outcome.
 * In production these records come from the backend (profiles, Pana's
 * monthly check-ins, quest completions, mentorship records).
 */

export const SYNTHETIC_SEED = 20261010;
export const SYNTHETIC_MEMBER_COUNT = 150;
/** Months the simulated program has been running. Members join across this window. */
export const PROGRAM_MONTHS = 18;

export type Shock = "layoff" | "rent-jump" | "friends-left";

export interface Mentee {
  id: string;
  school: "FIU" | "MDC" | "UM";
  graduated: boolean;
  /** Only meaningful once graduated. */
  stillInMiami: boolean;
  outcome: "none" | "internship" | "job";
}

export interface SyntheticMember {
  id: string;
  profile: Profile;
  level: LevelId;
  /** Program month (0-based) the member joined Rooted. */
  joinedMonth: number;
  /** Months since joining that the member has been observed. */
  monthsTracked: number;
  /** Monthly check-ins; `month` is months since joining. */
  checkIns: CheckIn[];
  /** Recurring community quests the member joined. */
  communities: string[];
  /** Months of recurring ritual attendance. */
  ritualMonths: number;
  /** Communities this member started (guest to host). */
  communitiesCreated: number;
  newcomersWelcomed: number;
  volunteerHours: number;
  shock?: { kind: Shock; month: number };
  /** Month (since joining) the member left Miami, if they did. */
  leftMonth?: number;
  mentees: Mentee[];
  foundedStartup: boolean;
  localHires: number;
}

/* ---------- seeded PRNG (mulberry32) ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const noise = (rng: Rng, amp: number) => (rng() * 2 - 1) * amp;

/* ---------- profile vocab ---------- */

const firstNames = [
  "Alex", "Priya", "Marcus", "Sofia", "Daniel", "Mei", "Jordan", "Camila", "Ethan", "Aisha",
  "Lucas", "Valentina", "Noah", "Hana", "Mateo", "Grace", "Omar", "Isabela", "Ryan", "Nadia",
  "Diego", "Chloe", "Kwame", "Lucia", "Sam", "Ana", "Tariq", "Elena", "Ben", "Yuki",
];
const origins = [
  "New York City", "San Francisco", "Chicago", "Boston", "Seattle", "Austin", "Los Angeles",
  "Toronto", "Washington DC", "Atlanta", "Bogotá", "São Paulo", "Mexico City", "London", "Buenos Aires",
];
const roles = [
  "Backend engineer", "Frontend engineer", "Full-stack engineer", "Data engineer", "ML engineer",
  "Mobile engineer", "Site reliability engineer", "Engineering manager", "Product engineer",
];
const homes: Neighborhood[] = [
  "Brickell", "Downtown", "Wynwood", "Edgewater", "Little Havana", "Coconut Grove",
  "Coral Gables", "Miami Beach", "Doral", "Little Haiti",
];
const allInterests: Interest[] = [
  "tennis", "racket", "running", "cycling", "water", "beach", "team-sports", "food",
  "culture", "music", "tech", "teaching", "climate", "community-service", "explore",
];
const missesList = [
  "Walking out the door and running into people",
  "Friends who'd show up on short notice",
  "A team to play with every week",
  "Feeling like the city needed me",
  "Seasons, honestly",
];
const shocks: Shock[] = ["layoff", "rent-jump", "friends-left"];
const schools: Mentee["school"][] = ["FIU", "MDC", "UM"];

/* ---------- quest helpers ---------- */

const byId = new Map(quests.map((q) => [q.id, q]));
const isRitual = (q: Quest) => q.item === "community" && q.recurring && q.level !== "grove";
const VOLUNTEER_QUESTS = new Set(["waterkeeper-cleanup", "food-bank-shift", "habitat-build", "nonprofit-skills", "code-art-workshop"]);

/** Quest order roughly follows level progression, nudged by interests. */
function questPath(rng: Rng, interests: Interest[], engagement: number): string[] {
  const fits = (q: Quest) => q.interests.some((i) => interests.includes(i));
  const rituals = quests.filter(isRitual);
  const ritual = rituals.find(fits) ?? pick(rng, rituals);

  const rest = quests.filter((q) => q.id !== ritual.id);
  const tier = (lvl: LevelId) =>
    shuffle(rng, rest.filter((q) => q.level === lvl)).sort((a, b) => Number(fits(b)) - Number(fits(a)));

  const seed = tier("seed");
  const sprout = tier("sprout");
  const rooted = tier("rooted");
  const grove = tier("grove");

  // Engaged members find purpose (mentoring/volunteering) earlier.
  const purposeFirst = engagement > 0.45 ? sprout.filter((q) => q.item === "purpose") : [];
  const sproutRest = sprout.filter((q) => !purposeFirst.includes(q));

  return [
    ritual.id,
    ...seed.slice(0, 3).map((q) => q.id),
    ...purposeFirst.slice(0, 1).map((q) => q.id),
    ...sproutRest.slice(0, 3).map((q) => q.id),
    ...rooted.map((q) => q.id),
    ...sproutRest.slice(3, 5).map((q) => q.id),
    ...grove.map((q) => q.id),
    ...purposeFirst.slice(1).map((q) => q.id),
    ...sproutRest.slice(5).map((q) => q.id),
    ...seed.slice(3).map((q) => q.id),
  ];
}

/* ---------- generator ---------- */

function makeMember(rng: Rng, index: number): SyntheticMember {
  const joinedMonth = Math.floor((index / SYNTHETIC_MEMBER_COUNT) * PROGRAM_MONTHS * 0.95 + rng() * 1.5) % PROGRAM_MONTHS;
  const tenure = PROGRAM_MONTHS - joinedMonth; // 1..18
  const engagement = Math.pow(rng(), 0.8);
  const baseIntent = 3 + rng() * 3;
  const baseBelonging = rng() * 0.25; // a few arrive with some ties already
  const interests = shuffle(rng, allInterests).slice(0, int(rng, 3, 5));

  const shock =
    tenure >= 3 && rng() < 0.32 ? { kind: pick(rng, shocks), month: int(rng, 2, Math.max(2, tenure - 1)) } : undefined;

  // Monthly check-ins until the member leaves or the program "now".
  const checkIns: CheckIn[] = [];
  let leftMonth: number | undefined;
  for (let m = 0; m < tenure; m++) {
    const growth = engagement * (1 - Math.exp(-m / 4));
    const dip =
      shock && m >= shock.month ? 3 * (1 - 0.65 * engagement) * Math.exp(-(m - shock.month) / 2) : 0;
    const progress = clamp(baseBelonging + growth - dip / 6, 0, 1);
    const intent = Math.round(clamp(baseIntent + 5 * growth - dip + noise(rng, 0.8), 0, 10));

    checkIns.push({
      month: m,
      intentToStay: intent,
      lifeSatisfaction: Math.round(clamp(5 + 3.2 * progress - dip / 2 + noise(rng, 0.8), 0, 10)),
      peopleOutsideWork: Math.max(0, Math.round(progress * 7 + noise(rng, 1))),
      belonging: Math.round(clamp(1 + 3.6 * progress + noise(rng, 0.5), 1, 5)),
      miamian: progress > 0.6 ? "yes" : progress > 0.28 ? "not-yet" : "no",
    });

    let leaveP = intent <= 3 ? 0.07 : intent <= 5 ? 0.025 : 0.004;
    if (shock && m === shock.month) leaveP += 0.3 * (1 - engagement);
    if (m > 0 && rng() < leaveP) {
      leftMonth = m;
      break;
    }
  }
  const activeMonths = leftMonth ?? tenure;

  // Quests completed scale with engagement and time in the program.
  const path = questPath(rng, interests, engagement);
  const nQuests = clamp(Math.round((1 + 15 * engagement) * Math.min(1, (activeMonths + 1) / 14) + noise(rng, 1)), 1, path.length);
  const completed = path.slice(0, nQuests);
  const done = completed.map((id) => byId.get(id)!).filter(Boolean);
  const has = (id: string) => completed.includes(id);

  const communities = done.filter(isRitual).map((q) => q.id);
  const ritualMonths = communities.length
    ? Math.max(1, Math.round(activeMonths * (0.4 + 0.6 * engagement) - rng() * 2))
    : 0;

  const communitiesCreated = has("start-a-group") ? (rng() < 0.2 ? 2 : 1) : 0;
  const newcomersWelcomed =
    (has("welcome-a-newcomer") ? int(rng, 1, 3) : 0) + (has("host-newcomer-dinner") ? int(rng, 3, 6) : 0);

  // Mentorship: 2 hrs/month per mentee (docs/concept.md, Path A).
  const mentees: Mentee[] = [];
  if (has("first-mentee-coffee")) {
    const n = engagement > 0.7 && rng() < 0.5 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const hired = has("hire-a-mentee") && k === 0;
      const graduated = hired || rng() < 0.45;
      const prepped = has("mock-interview");
      const outcome: Mentee["outcome"] = hired
        ? "job"
        : graduated && rng() < (prepped ? 0.55 : 0.35)
          ? "job"
          : rng() < (prepped ? 0.4 : 0.25)
            ? "internship"
            : "none";
      mentees.push({
        id: `m${index}-${k}`,
        school: pick(rng, schools),
        graduated,
        stillInMiami: graduated ? rng() < (outcome === "job" ? 0.9 : 0.55) : true,
        outcome,
      });
    }
  }
  const mentoringMonths = mentees.length ? Math.max(1, Math.round(activeMonths / 2)) : 0;
  const volunteerHours =
    mentees.length * mentoringMonths * 2 +
    done
      .filter((q) => VOLUNTEER_QUESTS.has(q.id))
      .reduce((h, q) => h + (q.timeMinutes / 60) * (q.recurring ? Math.max(1, Math.round(activeMonths / 3)) : 1), 0);

  const level = levelFor(completed);
  const foundedStartup = (level === "grove" && rng() < 0.12) || rng() < 0.015;
  const localHires = (has("hire-a-mentee") ? 1 : 0) + (foundedStartup ? int(rng, 1, 4) : 0);

  const profile: Profile = {
    name: `${pick(rng, firstNames)} ${String.fromCharCode(65 + int(rng, 0, 25))}.`,
    movedFrom: pick(rng, origins),
    monthsInMiami: activeMonths + int(rng, 0, 3),
    role: pick(rng, roles),
    livesIn: pick(rng, homes),
    worksIn: pick(rng, ["Brickell", "Downtown", "Wynwood", "Coral Gables", "Doral"] as Neighborhood[]),
    worksFrom: pick(rng, ["office", "remote", "hybrid"] as const),
    household: rng() < 0.62 ? "alone" : rng() < 0.75 ? "partner" : "family",
    hasCar: rng() < 0.7,
    interests,
    missesMost: pick(rng, missesList),
    weekendHours: int(rng, 3, 12),
    languages: rng() < 0.4 ? ["English", "Spanish"] : ["English"],
    completedQuests: completed,
  };

  return {
    id: `sim-${String(index + 1).padStart(3, "0")}`,
    profile,
    level,
    joinedMonth,
    monthsTracked: activeMonths,
    checkIns,
    communities,
    ritualMonths,
    communitiesCreated,
    newcomersWelcomed,
    volunteerHours: Math.round(volunteerHours),
    // Only count a shock the member actually lived through while observed.
    shock: shock && shock.month <= (leftMonth ?? tenure - 1) ? shock : undefined,
    leftMonth,
    mentees,
    foundedStartup,
    localHires,
  };
}

export function generateSyntheticMembers(count = SYNTHETIC_MEMBER_COUNT, seed = SYNTHETIC_SEED): SyntheticMember[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => makeMember(rng, i));
}

/** The default simulated cohort (deterministic: same seed, same members). */
export const syntheticMembers: SyntheticMember[] = generateSyntheticMembers();
