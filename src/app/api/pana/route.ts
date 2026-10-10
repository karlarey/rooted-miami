import { alex } from "@/data/alex";
import { panaSystemPrompt } from "@/lib/pana/prompt";
import { streamReply, type ChatMessage } from "@/lib/pana/providers";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  const system = panaSystemPrompt(alex, "seed");
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamReply(system, messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("El Pana provider error:", err);
        controller.enqueue(encoder.encode("\n[El Pana is offline right now. Check the provider settings in .env.local.]"));
      }
      controller.close();
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
