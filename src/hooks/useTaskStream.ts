import { useCallback, useEffect, useRef } from "react";
import { streamTask, parseSectionUpdate, DEMO_USER_ID, MOCK_AGENTS } from "@/api/agent";
import type { SSEEvent } from "@/types/task";
import { useChatStore } from "@/store/chatStore";
import { useWebsiteStore } from "@/store/websiteStore";

const FALLBACK_DEPLOYMENT_ID = MOCK_AGENTS[0]?.deployment_id ?? "dep_website_builder_demo";

/**
 * useTaskStream — orchestrator phía FE cho luồng "AI Edit Section".
 *
 * Phân phối các sự kiện SSE:
 *   token          → append vào message assistant (typewriter)
 *   thinking       → hiển thị reasoning (tùy chọn)
 *   artifact_update→ parse JSON + cập nhật Section trên Canvas ngay lập tức
 *   status_update  → chuyển trạng thái loading
 *   final          → lưu context_id/task_id, kết thúc stream
 *   error          → báo lỗi
 */
export function useTaskStream(deploymentId?: string) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const cancelRef = useRef<null | (() => void)>(null);

  const handleEvent = useCallback((evt: SSEEvent) => {
    const chat = useChatStore.getState();
    const website = useWebsiteStore.getState();

    switch (evt.event) {
      case "token":
        chat.appendDelta(evt.data.delta);
        break;

      case "thinking":
        chat.addThinking(evt.data.delta);
        break;

      case "status_update":
        // API thật gửi task_id + context_id ngay ở status_update đầu tiên — capture sớm.
        if (evt.data.task_id) chat.setTaskId(evt.data.task_id);
        if (evt.data.context_id) chat.setContextId(evt.data.context_id);
        break;

      case "artifact_update":
        // Chỉ render structured JSON khi last_chunk = true (theo docs).
        if (evt.data.last_chunk) {
          const update = parseSectionUpdate(evt.data.content);
          if (update) {
            website.applyUpdate(update);
            // Agent structured-output không emit token → đổ message vào chat bubble.
            if (update.message) chat.setAssistantContent(update.message);
          }
        }
        break;

      case "error":
        chat.setError(evt.data.message);
        chat.finishAssistant();
        chat.clearThinking();
        chat.setStreaming(false);
        break;

      case "final":
        // task_id/context_id đã capture từ status_update; không đọc final.task (shape A2A khác).
        chat.finishAssistant();
        chat.clearThinking();
        chat.setStreaming(false);
        break;
    }
  }, []);

  const sendPrompt = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      const chat = useChatStore.getState();
      const website = useWebsiteStore.getState();
      if (chat.isStreaming) return; // tránh stream chồng chéo

      // Section đang chọn — quyết định nội dung Agent sẽ chỉnh.
      const selected = website.getSection(website.selectedSectionId) ?? null;

      // Chuẩn bị state trước khi gọi API
      chat.addUserMessage(trimmed);
      chat.setError(null);
      chat.clearThinking();
      chat.setStreaming(true);
      chat.beginAssistant();

      cancelRef.current = streamTask(
        {
          deploymentId: deploymentId ?? FALLBACK_DEPLOYMENT_ID,
          userId: DEMO_USER_ID,
          prompt: trimmed,
          sectionId: selected?.id,
          sectionType: selected?.type,
          // currentContent = JSON string các field display → agent đủ ngữ cảnh edit.
          currentContent: selected
            ? JSON.stringify({
                heading: selected.heading,
                subheading: selected.subheading,
                content: selected.content,
                ctaLabel: selected.ctaLabel,
                bullets: selected.bullets,
                features: selected.features,
              })
            : undefined,
          contextId: chat.contextId,
        },
        {
          onEvent: handleEvent,
          onError: (err) => {
            const c = useChatStore.getState();
            c.setError(err.message);
            c.finishAssistant();
            c.clearThinking();
            c.setStreaming(false);
          },
        },
      );
    },
    [deploymentId, handleEvent],
  );

  const cancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    const c = useChatStore.getState();
    c.finishAssistant();
    c.clearThinking();
    c.setStreaming(false);
  }, []);

  // Cleanup khi unmount: huỷ stream đang chạy
  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  return { isStreaming, sendPrompt, cancel };
}
