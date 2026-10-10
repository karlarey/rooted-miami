import { and, asc, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { opportunity, threadMessage } from "@/db/schema";
import { benchmark, competitiveness, type CompetitivenessRisk } from "@/lib/pay-math";
import type { Seniority, Stack } from "@/data/pay";
import { talentCards, type TalentCard } from "@/data/talent-visibility";
import { realTalentCards } from "@/lib/real-talent";
import type { WorkMode } from "@/lib/sharing";

/**
 * Company → engineer opportunities (docs/messaging-contract.md), server side,
 * stored in the database (opportunity + thread_message tables).
 */

export type OpportunityStatus = "new" | "replied" | "passed" | "blocked";

export interface ThreadMessage {
  id: string;
  from: "company" | "engineer";
  body: string;
  createdAt: string;
}

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
  /** The direct thread after the engineer replies, oldest first. */
  thread: ThreadMessage[];
}

export type NewOpportunity = Pick<
  Opportunity,
  "companyId" | "companyName" | "engineerId" | "role" | "stack" | "seniority" | "payMin" | "payMax" | "workMode" | "neighborhood" | "message"
>;

/** New threads a company may start per rolling week (contract rule 5). */
export const WEEKLY_THREAD_LIMIT = 20;
export const MESSAGE_MAX = 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Real accounts first (they respect openToMessages, paused and hiddenFrom), then simulated members. */
export async function findCard(engineerId: string, companyName?: string): Promise<TalentCard | undefined> {
  if (engineerId.startsWith("user:")) return (await realTalentCards(companyName)).find((c) => c.engineerId === engineerId);
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

type Row = typeof opportunity.$inferSelect;
type MessageRow = typeof threadMessage.$inferSelect;

function toOpportunity(r: Row, thread: MessageRow[] = []): Opportunity {
  return {
    id: r.id,
    companyId: r.companyId,
    companyName: r.companyName,
    engineerId: r.engineerId,
    engineerHeadline: r.engineerHeadline,
    role: r.role,
    stack: r.stack as Stack,
    seniority: r.seniority as Seniority,
    payMin: r.payMin,
    payMax: r.payMax,
    workMode: r.workMode as WorkMode,
    neighborhood: r.neighborhood ?? undefined,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    status: r.status as OpportunityStatus,
    payRisk: (r.payRisk as CompetitivenessRisk | null) ?? null,
    thread: thread.map((m) => ({ id: m.id, from: m.from as ThreadMessage["from"], body: m.body, createdAt: m.createdAt.toISOString() })),
  };
}

/** Validates and stores a first message. Throws OpportunityError with a user-facing reason. */
export async function createOpportunity(input: NewOpportunity): Promise<Opportunity> {
  const card = await findCard(String(input.engineerId ?? ""), input.companyName);
  // Only open + opted-in engineers exist on the company side (rules 1 and 6).
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
  const recent = await db
    .select()
    .from(opportunity)
    .where(and(eq(opportunity.companyId, input.companyId), gt(opportunity.createdAt, new Date(Date.now() - WEEK_MS))));
  if (recent.length >= WEEKLY_THREAD_LIMIT)
    throw new OpportunityError(`You've started ${WEEKLY_THREAD_LIMIT} new conversations this week. That's the limit.`, 429);
  if (recent.some((o) => o.engineerId === card.engineerId && o.status !== "passed"))
    throw new OpportunityError("You already have an open conversation with this engineer.", 409);
  // A blocked company can never reach this engineer again (rule 4).
  const [blocked] = await db
    .select({ id: opportunity.id })
    .from(opportunity)
    .where(and(eq(opportunity.companyId, input.companyId), eq(opportunity.engineerId, card.engineerId), eq(opportunity.status, "blocked")))
    .limit(1);
  if (blocked) throw new OpportunityError("This engineer isn't open to messages right now.", 404);

  const b = benchmark(input.stack, input.seniority);
  const row: Row = {
    id: newId("op"),
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
    neighborhood: input.neighborhood || null,
    message,
    status: "new",
    payRisk: b ? competitiveness(b, payMax).risk : null,
    createdAt: new Date(),
  };
  await db.insert(opportunity).values(row);
  return toOpportunity(row);
}

export async function listOpportunities(f: { companyId?: string; engineerId?: string; status?: string } = {}): Promise<Opportunity[]> {
  const where = [
    f.companyId ? eq(opportunity.companyId, f.companyId) : undefined,
    f.engineerId ? eq(opportunity.engineerId, f.engineerId) : undefined,
    f.status ? eq(opportunity.status, f.status) : undefined,
    // Engineers don't see companies they blocked.
    f.engineerId ? ne(opportunity.status, "blocked") : undefined,
  ].filter((w) => w !== undefined);
  const rows = await db
    .select()
    .from(opportunity)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(opportunity.createdAt));
  if (rows.length === 0) return [];
  const messages = await db
    .select()
    .from(threadMessage)
    .where(inArray(threadMessage.opportunityId, rows.map((r) => r.id)))
    .orderBy(asc(threadMessage.createdAt));
  return rows.map((r) => toOpportunity(r, messages.filter((m) => m.opportunityId === r.id)));
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const [row] = await db.select().from(opportunity).where(eq(opportunity.id, id)).limit(1);
  if (!row) throw new OpportunityError("Opportunity not found.", 404);
  const messages = await db.select().from(threadMessage).where(eq(threadMessage.opportunityId, id)).orderBy(asc(threadMessage.createdAt));
  return toOpportunity(row, messages);
}

/** Engineer side: pass or block (rule 4). Replying goes through addMessage. */
export async function setStatus(id: string, status: OpportunityStatus): Promise<Opportunity> {
  if (!["passed", "blocked"].includes(status)) throw new OpportunityError("Status must be passed or blocked.");
  await getOpportunity(id);
  await db.update(opportunity).set({ status }).where(eq(opportunity.id, id));
  return getOpportunity(id);
}

/**
 * Adds a message to the thread. The engineer's first reply opens the thread
 * (status "replied"); the company can only write once it's open.
 */
export async function addMessage(id: string, from: ThreadMessage["from"], text: string): Promise<Opportunity> {
  const o = await getOpportunity(id);
  const body = String(text ?? "").trim();
  if (!body) throw new OpportunityError("Write a message first.");
  if (body.length > MESSAGE_MAX) throw new OpportunityError(`Keep it under ${MESSAGE_MAX} characters.`);
  if (o.status === "passed" || o.status === "blocked") throw new OpportunityError("This conversation is closed.", 409);
  if (from === "company" && o.status !== "replied")
    throw new OpportunityError("You can write again once the engineer replies.", 409);

  await db.insert(threadMessage).values({ id: newId("msg"), opportunityId: id, from, body, createdAt: new Date() });
  if (from === "engineer" && o.status === "new") await db.update(opportunity).set({ status: "replied" }).where(eq(opportunity.id, id));
  return getOpportunity(id);
}
