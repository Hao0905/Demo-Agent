import { useMemo } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { useWebsiteStore } from "@/store/websiteStore";
import { useChatStore } from "@/store/chatStore";
import { WebsiteCanvas } from "@/components/Canvas/WebsiteCanvas";
import { ChatPanel } from "@/components/Chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SECTION_EDITOR_AGENT_NAME, getApiKey } from "@/api/agent";

export default function Home() {
  const { data: agents, isLoading } = useAgents();
  const resetWebsite = useWebsiteStore((s) => s.reset);
  const resetChat = useChatStore((s) => s.reset);

  // Ưu tiên agent section_editor (có schema khớp FE), fallback running đầu tiên.
  const deploymentId = useMemo(() => {
    const editor = agents?.find(
      (a) => a.agent_name === SECTION_EDITOR_AGENT_NAME && a.status === "running",
    );
    if (editor) return editor.deployment_id;
    const running = agents?.find((a) => a.status === "running");
    return (running ?? agents?.[0])?.deployment_id;
  }, [agents]);
  const agent = agents?.find((a) => a.deployment_id === deploymentId) ?? null;
  const isLive = !!getApiKey();

  const handleReset = () => {
    resetWebsite();
    resetChat();
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ===== Header ===== */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Agent Provider Demo</h1>
            <p className="text-[11px] text-muted-foreground">
              AI Website Editor · {isLive ? "Live SSE" : "Demo (mock)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge variant="outline">Đang tải agent...</Badge>
          ) : agent ? (
            <Badge variant={agent.status === "running" ? "success" : "secondary"}>
              {agent.agent_name} · {agent.status}
            </Badge>
          ) : null}
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </header>

      {/* ===== Main: Canvas (~70%) + Chat Drawer (~30%) ===== */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full flex-col lg:flex-row">
          <section className="scrollbar-thin h-1/2 overflow-y-auto bg-muted/30 lg:h-full lg:flex-1">
            <WebsiteCanvas />
          </section>
          <aside className="h-1/2 overflow-hidden border-t bg-background lg:h-full lg:w-[400px] lg:border-l lg:border-t-0">
            <ChatPanel deploymentId={deploymentId} />
          </aside>
        </div>
      </main>
    </div>
  );
}
