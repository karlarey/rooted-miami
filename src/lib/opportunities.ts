import { benchmark, competitiveness, type CompetitivenessRisk } from "@/lib/pay-math";
import type { Seniority, Stack } from "@/data/pay";
import { talentCards, type TalentCard } from "@/data/talent-visibility";
import type { WorkMode } from "@/lib/sharing";

/**
 * Company → engineer opportunities (docs/messaging-contract.md), server side.
 *
 * Hackathon storage: an in-memory store on globalThis, so it survives dev hot
 * reloads but resets when the server restarts. Swap for a database later; the
 * shapes and validation rules stay the same.
 */

export type OpportunityStatus = "new" | "replied" | "passed" | "blocked";

export interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  engineerId: string;
  /** The engineer's public headline at send time, so the sent list reads well. */
  engineerHeadline: string;
  role: string;
  stack: Stack;
  seniority: Seniority;
  payMin: number;
  payMax: number;
  workMode: WorkMode;
  neighborhood?: string;
  message: string;
  createdAt: string;
  status: OpportunityStatus;
  /** Pay check at send time, from the same BLS-based math engineers see. */
  payRisk: CompetitivenessRisk | null;
}

export type NewOpportunity = Pick<
  Opportunity,
  "companyId" | "companyName" | "engineerId" | "role" | "stack" | "seniority" | "payMin" | "payMax" | "workMode" | "neighborhood" | "message"
>;

/** New threads a company may start per rolling week (contract rule 5). */
export const WEEKLY_THREAD_LIMIT = 20;
export const MESSAGE_MAX = 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const g = globalThis as unknown as { __rootedOpportunities?: Map<string, Opportunity> };
const store = (g.__rootedOpportunities ??= new Map<string, Opportunity>());

export function findCard(engineerId: string): TalentCard | undefined {
  return talentCards.find((c) => c.engineerId === engineerId);
}

export class OpportunityError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const workModes: WorkMode[] = ["office", "hybrid", "remote"];

/** Validates and stores a first message. Throws OpportunityError with a user-facing reason. */
export function createOpportunity(input: NewOpportunity): Opportunity {
  const card = findCard(input.engineerId);
  // Only open + opted-in engineers exist on the company side (rule 1).
  if (!card) throw new OpportunityError("This engineer isn't open to messages right now.", 404);

  // No band, no send (rule 2).
  const payMin = Math.round(Number(input.payMin));
  const payMax = Math.round(Number(input.payMax));
  if (!Number.isFinite(payMin) || !Number.isFinite(payMax) || payMin <= 0 || payMax <= 0)
    throw new OpportunityError("Add a pay band (min and max base salary in USD).");
  if (payMax < payMin) throw new OpportunityError("The top of the pay band must be at least the bottom.");
  if (!input.role?.trim()) throw new OpportunityError("Add the role title.");
  if (!workModes.includes(input.workMode)) throw new OpportunityError("Choose a work mode: office, hybrid or remote.");
  const message = String(input.message ?? "").trim();
  if (!message) throw new OpportunityError("Add a short note to the engineer.");
  if (message.length > MESSAGE_MAX) throw new OpportunityError(`Keep the note under ${MESSAGE_MAX} characters.`);

  // Rate limit (rule 5).
  const since = Date.now() - WEEK_MS;
  const recent = [...store.values()].filter((o) => o.companyId === input.companyId && Date.parse(o.createdAt) > since);
  if (recent.length >= WEEKLY_THREAD_LIMIT)
    throw new OpportunityError(`You've started ${WEEKLY_THREAD_LIMIT} new conversations this week. That's the limit.`, 429);
  if (recent.some((o) => o.engineerId === input.engineerId && o.status !== "passed"))
    throw new OpportunityError("You already have an open conversation with this engineer.", 409);

  const b = benchmark(input.stack, input.seniority);
  const opp: Opportunity = {
    id: `op_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    companyId: input.companyId,
    companyName: input.companyName,
    engineerId: card.engineerId,
    engineerHeadline: card.headline,
    role: input.role.trim(),
    stack: input.stack,
    seniority: input.seniority,
    payMin,
    payMax,
    workMode: input.workMode,
    neighborhood: input.neighborhood || undefined,
    message,
    createdAt: new Date().toISOString(),
    status: "new",
    payRisk: b ? competitiveness(b, payMax).risk : null,
  };
  store.set(opp.id, opp);
  return opp;
}

export function listOpportunities(f: { companyId?: string; engineerId?: string; status?: string } = {}): Opportunity[] {
  return [...store.values()]
    .filter(
      (o) =>
        (!f.companyId || o.companyId === f.companyId) &&
        (!f.engineerId || o.engineerId === f.engineerId) &&
        (!f.status || o.status === f.status),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Engineer side: reply, pass or block (rule 4). */
export function setStatus(id: string, status: OpportunityStatus): Opportunity {
  const o = store.get(id);
  if (!o) throw new OpportunityError("Opportunity not found.", 404);
  if (!["replied", "passed", "blocked"].includes(status)) throw new OpportunityError("Status must be replied, passed or blocked.");
  o.status = status;
  return o;
}
