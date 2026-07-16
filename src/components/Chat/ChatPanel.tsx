import { Bot } from "lucide-react";
import { useTaskStream } from "@/hooks/useTaskStream";
import { SectionProperties } from "@/components/Properties/SectionProperties";
import { MessageList } from "./MessageList";
import { PromptInput } from "./PromptInput";

/**
 * ChatPanel — Drawer chat ~30% màn hình.
 * Bao gồm: header agent + trạng thái section đang chọn + danh sách message + ô nhập prompt.
 */
export function ChatPanel({ deploymentId }: { deploymentId?: string }) {
  const { isStreaming, sendPrompt, cancel } = useTaskStream(deploymentId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">AI Agent</div>
          <div className="text-[11px] text-muted-foreground">Section Editor · website_builder</div>
        </div>
      </div>

      <SectionProperties />
      <MessageList />
      <PromptInput isStreaming={isStreaming} onSend={sendPrompt} onCancel={cancel} />
    </div>
  );
}
