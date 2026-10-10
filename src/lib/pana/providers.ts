import { GoogleGenAI } from "@google/genai";
import type { Trigger } from "./triggers";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Provider = "gemini" | "ollama" | "mock";

export function activeProvider(): Provider {
  const p = process.env.PANA_PROVIDER;
  if (p === "gemini" || p === "ollama" || p === "mock") return p;
  return process.env.GEMINI_API_KEY ? "gemini" : "mock";
}

/** Streams Pana's reply as plain text chunks from the configured provider. */
export async function* streamReply(
  system: string,
  messages: ChatMessage[],
  trigger?: Trigger,
): AsyncGenerator<string> {
  switch (activeProvider()) {
    case "gemini":
      try {
        yield* streamGeminiWithFallback(system, messages);
      } catch (err) {
        // Gemini is down for every model we tried: keep the conversation going
        // with the scripted replies instead of showing "offline".
        console.error("Pana: Gemini unavailable, using mock replies:", err);
        yield* streamMock(messages, trigger);
      }
      return;
    case "ollama":
      yield* streamOllama(system, messages);
      return;
    case "mock":
      yield* streamMock(messages, trigger);
      return;
  }
}

/**
 * Gemini sometimes answers 503 (overloaded) or 429 (rate limited). Retry
 * briefly, then try the backup model. Only retries before the first chunk,
 * so a reply is never sent twice.
 */
async function* streamGeminiWithFallback(system: string, messages: ChatMessage[]) {
  const models = [
    process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest",
  ];
  let lastError: unknown;
  for (const model of [...new Set(models)]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let started = false;
      try {
        for await (const chunk of streamGemini(system, messages, model)) {
          started = true;
          yield chunk;
        }
        return;
      } catch (err) {
        if (started) return; // stalled mid-reply: keep what was sent
        lastError = err;
        const status = (err as { status?: number }).status;
        // A hang or a non-transient error: go straight to the next model.
        if (err instanceof GeminiTimeout || (status !== undefined && status !== 429 && status < 500)) break;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

class GeminiTimeout extends Error {}

/** No first chunk within this long means Gemini is stuck: give up on this attempt. */
const FIRST_CHUNK_MS = 8000;
/** Once replying, a gap this long between chunks ends the reply. */
const NEXT_CHUNK_MS = 15000;

async function* streamGemini(system: string, messages: ChatMessage[], model: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const abort = new AbortController();
  const within = <T>(p: Promise<T>, ms: number) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        abort.abort();
        reject(new GeminiTimeout(`Gemini (${model}) sent nothing for ${ms}ms`));
      }, ms);
    });
    return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
  };

  const stream = await within(
    ai.models.generateContentStream({
      model,
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: { systemInstruction: system, abortSignal: abort.signal },
    }),
    FIRST_CHUNK_MS,
  );
  const it = stream[Symbol.asyncIterator]();
  let started = false;
  for (;;) {
    const { done, value } = await within(it.next(), started ? NEXT_CHUNK_MS : FIRST_CHUNK_MS);
    if (done) return;
    if (value.text) {
      started = true;
      yield value.text;
    }
  }
}

async function* streamOllama(system: string, messages: ChatMessage[]) {
  const res = await fetch(`${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.1:8b",
      stream: true,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Ollama returned ${res.status}`);

  // Ollama streams newline-delimited JSON objects.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line) as { message?: { content?: string } };
      if (data.message?.content) yield data.message.content;
    }
  }
}

const mockTriggerReplies: Record<Trigger, string> = {
  layoff:
    "Ay, pana, I'm sorry. That's a gut punch. Remember you're not starting over: your Saturday tennis crew and your mentor cohort are still here. Two people in the cohort work at Miami companies hiring for your stack. Want me to set up coffee with one of them this week?",
  lease:
    "Heads up: your lease renews in 60 days. Before you sign anything, want to compare a few neighborhoods near your tennis group and the Metrorail? I can line up a Saturday walk through Coconut Grove and Edgewater.",
  quiet:
    "Hey pana, haven't seen you in a few weeks. Everything ok? No pressure. There's an easy beach volleyball game Sunday morning, and your run club asked about you. Want to come?",
  "coworker-left":
    "Saying goodbye to a close friend is hard. Your Thursday crew is still here, and there's a newcomer dinner Friday where you'd be the one who knows the city now. Want me to save you a seat?",
};

async function* streamMock(messages: ChatMessage[], trigger?: Trigger) {
  const last = messages.at(-1)?.content.toLowerCase() ?? "";
  const reply = trigger
    ? mockTriggerReplies[trigger]
    : last.includes("tennis")
      ? "¡Dale! There's a Saturday tennis ladder at Crandon Park. It repeats every week, so it can become your ritual. Want me to add it to your side quests?"
      : "¡Bienvenido, pana! I'm Pana, your buddy in Miami. Tell me what you loved doing back home and I'll find your first side quest.";
  for (const word of reply.split(" ")) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 30));
  }
}
