import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import type { ChatRole } from "@/types/task";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import { LoadingIndicator } from "./LoadingIndicator";

function MessageBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground",
        )}
      >
        {content || "..."}
      </div>
    </div>
  );
}

/** MessageList — hiển thị lịch sử chat + reasoning + loading trong lúc stream. */
export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const thinking = useChatStore((s) => s.thinking);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống khi có nội dung mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
        <Bot className="h-10 w-10 text-primary" />
        <p className="max-w-[220px] text-sm">
          Chọn một section trên Canvas (nút <span className="font-medium text-foreground">AI Edit</span>),
          sau đó nhập yêu cầu để AI viết lại nội dung.
        </p>
      </div>
    );
  }

  const last = messages.at(-1);
  const showThinkingDots =
    isStreaming && last?.role === "assistant" && last.content === "";

  return (
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} />
      ))}

      {/* Reasoning trace (event `thinking`) */}
      {isStreaming && thinking.length > 0 && (
        <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="mb-1 font-semibold uppercase tracking-wide">Reasoning</div>
          <ul className="space-y-1">
            {thinking.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {showThinkingDots && <LoadingIndicator label="Thinking" />}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
