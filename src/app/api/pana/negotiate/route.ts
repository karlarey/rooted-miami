import {
  isSeniority,
  isSituation,
  isStack,
  mockNegotiationReply,
  negotiationSystemPrompt,
  wantsCoach,
  type NegotiationInput,
} from "@/lib/pana/negotiation";
import { activeProvider, streamReply, type ChatMessage } from "@/lib/pana/providers";

/**
 * POST /api/pana/negotiate
 * Body: { messages: ChatMessage[], stack, seniority, situation, current? }
 * Streams plain text. Pana plays a hiring manager; if the last user
 * message contains "coach me" it replies as a coach instead.
 * Numbers are recomputed server-side from src/data/pay.ts.
 */

interface NegotiateRequest {
  messages?: unknown;
  stack?: unknown;
  seniority?: unknown;
  situation?: unknown;
  current?: unknown;
}

const MAX_MESSAGES = 30;
const MAX_CHARS = 2000;

function cleanMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    out.push({ role: m.role, content: m.content.slice(0, MAX_CHARS) });
  }
  return out;
}

export async function POST(req: Request) {
  let body: NegotiateRequest;
  try {
    body = (await req.json()) as NegotiateRequest;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = cleanMessages(body.messages);
  if (!messages || !messages.some((m) => m.role === "user")) {
    return Response.json({ error: "messages must include at least one user message" }, { status: 400 });
  }
  if (!isStack(body.stack) || !isSeniority(body.seniority) || !isSituation(body.situation)) {
    return Response.json({ error: "stack, seniority and situation are required" }, { status: 400 });
  }
  const current =
    typeof body.current === "number" && Number.isFinite(body.current) && body.current > 0 ? body.current : undefined;

  const input: NegotiationInput = { stack: body.stack, seniority: body.seniority, situation: body.situation, current };
  const mode = wantsCoach(messages) ? "coach" : "roleplay";
  const isMock = activeProvider() === "mock";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (isMock) {
          for (const word of mockNegotiationReply(input, messages, mode).split(" ")) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise((r) => setTimeout(r, 25));
          }
        } else {
          for await (const chunk of streamReply(negotiationSystemPrompt(input, mode), messages)) {
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (err) {
        console.error("Pana negotiate provider error:", err);
        controller.enqueue(encoder.encode("\n[Pana is offline right now. Check the provider settings in .env.local.]"));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Pana-Mode": mode },
  });
}
