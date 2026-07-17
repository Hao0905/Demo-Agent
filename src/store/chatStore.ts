import { create } from "zustand";
import type { ChatMessage } from "@/types/task";
import { uid } from "@/lib/utils";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  /** Dòng reasoning (event `thinking`) hiển thị trong lúc Agent xử lý. */
  thinking: string[];
  /** id của message assistant đang được stream (để append token vào). */
  streamingMessageId: string | null;
  /** context_id giúp Agent nhớ website đang chỉnh qua nhiều lượt edit. */
  contextId: string | null;
  taskId: string | null;
  error: string | null;

  addUserMessage: (content: string) => string;
  beginAssistant: () => string;
  appendDelta: (delta: string) => void;
  /** Set nguyên content của message assistant đang stream (cho agent structured-output không emit token). */
  setAssistantContent: (content: string) => void;
  finishAssistant: () => void;
  addThinking: (line: string) => void;
  clearThinking: () => void;
  setStreaming: (v: boolean) => void;
  setContextId: (id: string | null) => void;
  setTaskId: (id: string | null) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  thinking: [],
  streamingMessageId: null,
  contextId: null,
  taskId: null,
  error: null,

  addUserMessage: (content) => {
    const id = uid("msg");
    const msg: ChatMessage = { id, role: "user", content, createdAt: Date.now() };
    set((state) => ({ messages: [...state.messages, msg] }));
    return id;
  },

  beginAssistant: () => {
    const id = uid("msg");
    const msg: ChatMessage = { id, role: "assistant", content: "", createdAt: Date.now() };
    set((state) => ({ messages: [...state.messages, msg], streamingMessageId: id }));
    return id;
  },

  appendDelta: (delta) =>
    set((state) => {
      const id = state.streamingMessageId;
      if (!id) return state;
      return {
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, content: m.content + delta } : m,
        ),
      };
    }),

  setAssistantContent: (content) =>
    set((state) => {
      const id = state.streamingMessageId;
      if (!id) return state;
      return {
        messages: state.messages.map((m) => (m.id === id ? { ...m, content } : m)),
      };
    }),

  finishAssistant: () => set({ streamingMessageId: null }),

  addThinking: (line) => set((state) => ({ thinking: [...state.thinking, line] })),
  clearThinking: () => set({ thinking: [] }),

  setStreaming: (v) => set({ isStreaming: v }),
  setContextId: (id) => set({ contextId: id }),
  setTaskId: (id) => set({ taskId: id }),
  setError: (msg) => set({ error: msg }),

  reset: () =>
    set({
      messages: [],
      isStreaming: false,
      thinking: [],
      streamingMessageId: null,
      contextId: null,
      taskId: null,
      error: null,
    }),
}));
