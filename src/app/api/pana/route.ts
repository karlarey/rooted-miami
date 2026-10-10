import { alex } from "@/data/alex";
import { panaSystemPrompt } from "@/lib/pana/prompt";
import { activeProvider, streamReply, type ChatMessage } from "@/lib/pana/providers";
import { likeMinded } from "@/lib/like-minded";
import { isTrigger, triggers } from "@/lib/pana/triggers";
import { levelFor } from "@/lib/progress";
import type { Profile } from "@/lib/types";

interface PanaRequest {
  messages: ChatMessage[];
  profile?: Profile;
  trigger?: string;
}

export async function POST(req: Request) {
  const { messages, profile = alex, trigger } = (await req.json()) as PanaRequest;
  const system = panaSystemPrompt(profile, levelFor(profile.completedQuests));

  // A risk moment: Pana reaches out first, before the decision to leave.
  const convo: ChatMessage[] = isTrigger(trigger)
    ? [
        ...messages,
        {
          role: "user",
          content: `[Event, not from ${profile.name}: ${triggers[trigger].event}] Write Pana's proactive text to ${profile.name}. Lead with care, then point to the communities, people and mentees they already have here, then one concrete next step.`,
        },
      ]
    : messages;

  const encoder = new TextEncoder();

  // Mock mode: answer "what are people like me doing?" from like-minded members.
  const last = messages.at(-1)?.content ?? "";
  if (!isTrigger(trigger) && activeProvider() === "mock" && /like me|others|people|recommend|ideas|what should/i.test(last)) {
    const picks = likeMinded(profile);
    const lines = picks.map((p) => `• ${p.quest.title}: ${p.reason}`).join("\n");
    const text = picks.length
      ? `Here's what people like you who stayed are doing, pana:\n${lines}\nWant me to add one to your quests?`
      : "I'm still getting to know people like you. Want to try a weekly ritual first?";
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamReply(system, convo, isTrigger(trigger) ? trigger : undefined)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("Pana provider error:", err);
        controller.enqueue(encoder.encode("\n[Pana is offline right now. Check the provider settings in .env.local.]"));
      }
      controller.close();
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
