import type { Seniority, Stack } from "@/data/pay";
import { talentPool, type TalentProfile } from "@/data/talent-pool";
import type { WorkMode } from "@/lib/sharing";
import { isOpenAndVisible } from "@/lib/talent";
import type { LevelId } from "@/lib/types";

/**
 * SIMULATED DATA. What each opted-in engineer in the synthetic pool chose to
 * share with companies (EngineerVisibility.shared in docs/messaging-contract.md).
 *
 * Derived per engineer from a hash of their id, separate from the pool's own
 * PRNG, so the pool and every aggregate built on it stay exactly the same.
 * Only engineers who are open AND opted in get a record; nobody else is ever
 * reachable from the company side.
 */

/** A Talent Finder card: only fields the engineer chose to share. Never contact info. */
export interface TalentCard {
  engineerId: string;
  headline: string;
  stack: Stack;
  seniority: Seniority;
  skills: string[];
  neighborhood: string;
  workModes: WorkMode[];
  /* Community badges the engineer chose to show. Never wellbeing or intent-to-stay. */
  level: LevelId;
  yearsInMiami: number;
  mentorsStudents: boolean;
  aiTrained: boolean;
  shippedProjects: number;
  languages: string[];
}

const skillBank: Record<Stack, string[]> = {
  backend: ["Go", "Python", "Node.js", "PostgreSQL", "Kafka", "AWS", "Java", "gRPC", "Redis", "Payments APIs"],
  fullstack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "GraphQL", "AWS", "Tailwind", "Python"],
  frontend: ["React", "TypeScript", "Next.js", "Accessibility", "Design systems", "Vue", "Testing Library", "Figma"],
  "data-ml": ["Python", "PyTorch", "SQL", "dbt", "LLMs", "Spark", "Snowflake", "MLOps", "Forecasting"],
  mobile: ["Swift", "Kotlin", "React Native", "Flutter", "iOS", "Android", "Mobile CI"],
  devops: ["Kubernetes", "Terraform", "AWS", "GCP", "CI/CD", "Observability", "Linux", "Docker"],
  security: ["AppSec", "Cloud security", "Threat modeling", "SOC 2", "Pen testing", "IAM", "Incident response"],
  product: ["Roadmapping", "Discovery", "Fintech", "B2B SaaS", "Analytics", "Growth", "AI products"],
};

/** FNV-1a: stable 32-bit hash of a string. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seeded(id: string) {
  let a = hash(id);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const stackWord: Record<Stack, string> = {
  backend: "backend engineer",
  fullstack: "full-stack engineer",
  frontend: "frontend engineer",
  "data-ml": "data / ML engineer",
  mobile: "mobile engineer",
  devops: "DevOps engineer",
  security: "security engineer",
  product: "product manager",
};

function toCard(t: TalentProfile): TalentCard {
  const rng = seeded(t.id);
  const bank = [...skillBank[t.stack]];
  const skills: string[] = [];
  const n = 3 + Math.floor(rng() * 3);
  while (skills.length < n && bank.length) skills.push(bank.splice(Math.floor(rng() * bank.length), 1)[0]);
  if (t.aiTrained && !skills.includes("LLMs")) skills.push("AI builds");

  const r = rng();
  const workModes: WorkMode[] = r < 0.45 ? ["hybrid", "office"] : r < 0.8 ? ["hybrid", "remote"] : ["hybrid", "office", "remote"];

  return {
    engineerId: t.id,
    // shareName is off for every simulated engineer: companies see a role, not a person.
    headline: `${cap(t.seniority)} ${stackWord[t.stack]}, ${t.neighborhood}`,
    stack: t.stack,
    seniority: t.seniority,
    skills,
    neighborhood: t.neighborhood,
    workModes,
    level: t.level,
    yearsInMiami: t.yearsInMiami,
    mentorsStudents: t.mentorsStudents,
    aiTrained: t.aiTrained,
    shippedProjects: t.shippedProjects,
    languages: t.languages,
  };
}

/** Every engineer reachable from Talent Finder: open to opportunities AND opted in. */
export const talentCards: TalentCard[] = talentPool.filter(isOpenAndVisible).map(toCard);

export const allSkills: string[] = [...new Set(Object.values(skillBank).flat())].sort();
