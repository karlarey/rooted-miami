import { GoogleGenAI } from "@google/genai";

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

/** Streams El Pana's reply as plain text chunks from the configured provider. */
export async function* streamReply(system: string, messages: ChatMessage[]): AsyncGenerator<string> {
  switch (activeProvider()) {
    case "gemini":
      yield* streamGemini(system, messages);
      return;
    case "ollama":
      yield* streamOllama(system, messages);
      return;
    case "mock":
      yield* streamMock(messages);
      return;
  }
}

async function* streamGemini(system: string, messages: ChatMessage[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    config: { systemInstruction: system },
  });
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
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

async function* streamMock(messages: ChatMessage[]) {
  const last = messages.at(-1)?.content.toLowerCase() ?? "";
  const reply = last.includes("tennis")
    ? "¡Dale! There's a Saturday tennis ladder at Crandon Park. It repeats every week, so it can become your ritual. Want me to add it to your side quests?"
    : "¡Bienvenido, pana! I'm El Pana, your buddy in Miami. Tell me what you loved doing back home and I'll find your first side quest.";
  for (const word of reply.split(" ")) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 30));
  }
}
