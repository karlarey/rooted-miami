import { GoogleGenAI } from "@google/genai";
import { activeProvider } from "./providers";

/**
 * One-shot, non-streaming completion that returns JSON text.
 * Used for structured extraction (e.g. profile import), not for Pana's chat voice.
 * Throws on any provider error or timeout; callers fall back to deterministic logic.
 * Returns null in mock mode.
 */
export async function completeJson(system: string, user: string, timeoutMs = 12_000): Promise<string | null> {
  const provider = activeProvider();
  if (provider === "mock") return null;

  const signal = AbortSignal.timeout(timeoutMs);

  if (provider === "gemini") {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
      contents: [{ role: "user", parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        temperature: 0,
        abortSignal: signal,
      },
    });
    return res.text ?? null;
  }

  const res = await fetch(`${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/chat`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.1:8b",
      stream: false,
      format: "json",
      options: { temperature: 0 },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content ?? null;
}

/** Parses JSON from a model reply, tolerating ```json fences. Throws if it isn't JSON. */
export function parseJsonReply(text: string): unknown {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(stripped);
}
