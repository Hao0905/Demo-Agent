import { useState } from "react";
import { Send, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/** Các gợi ý prompt nhanh — bấm để gửi ngay. */
const QUICK_PROMPTS = [
  "Viết theo phong cách marketing",
  "Ngắn gọn hơn",
  "Dịch sang tiếng Anh",
  "Tone chuyên nghiệp",
  "Tone trẻ trung",
];

interface PromptInputProps {
  isStreaming: boolean;
  onSend: (prompt: string) => void;
  onCancel: () => void;
}

/** PromptInput — textarea + nút Send/Stop + chip gợi ý prompt. */
export function PromptInput({ isStreaming, onSend, onCancel }: PromptInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t bg-background p-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isStreaming}
            onClick={() => onSend(q)}
            className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Nhập yêu cầu cho AI... (Enter để gửi, Shift+Enter xuống dòng)"
          className="min-h-[44px] resize-none"
        />
        {isStreaming ? (
          <Button variant="destructive" size="icon" onClick={onCancel} title="Dừng">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={submit} disabled={!value.trim()} title="Gửi">
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
