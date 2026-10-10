export function PanaAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-2xl" : "h-8 w-8 text-base";
  return (
    <span
      aria-hidden
      className={`${dims} inline-flex shrink-0 items-center justify-center rounded-full bg-teal-soft ring-1 ring-line`}
    >
      🌴
    </span>
  );
}

export function PanaBubble({ text, showAvatar }: { text: string; showAvatar: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 shrink-0">{showAvatar && <PanaAvatar />}</div>
      <p className="max-w-[80%] rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-2.5 text-[15px] leading-snug text-ink shadow-sm">
        {text}
      </p>
    </div>
  );
}

export function MyBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-teal px-4 py-2.5 text-[15px] leading-snug font-medium text-bg">
        {text}
      </p>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="El Pana is typing">
      <div className="w-8 shrink-0">
        <PanaAvatar />
      </div>
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
