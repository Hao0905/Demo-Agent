import type { SectionType } from "./section";

// ===== Chat =====
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

// ===== Task state =====
export type TaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed";

export interface TaskInfo {
  task_id: string;
  context_id?: string | null;
  state: TaskState;
  status_message?: string | null;
}

// ===== Agent =====
export type AgentStatus =
  | "pending"
  | "creating"
  | "running"
  | "stopped"
  | "failed"
  | "deleted";

export interface AgentDeployment {
  deployment_id: string;
  agent_name: string;
  status: AgentStatus;
  model?: string | null;
  replicas: number;
}

export interface UploadedFile {
  file_id: string;
  filename: string;
  size?: number;
}

// ===== SSE events (discriminated union — không dùng `any`) =====
export interface TokenData {
  delta: string;
}
export interface ThinkingData {
  author: string;
  delta: string;
}
export interface ArtifactData {
  content: string;
  last_chunk: boolean;
}
export interface StatusData {
  state: TaskState;
  final?: boolean;
}
export interface ErrorData {
  code: string;
  message: string;
}
export interface FinalData {
  content: string;
  task: TaskInfo;
}

export type SSEEvent =
  | { event: "token"; data: TokenData }
  | { event: "thinking"; data: ThinkingData }
  | { event: "artifact_update"; data: ArtifactData }
  | { event: "status_update"; data: StatusData }
  | { event: "error"; data: ErrorData }
  | { event: "final"; data: FinalData };

export type SSEEventHandler = (evt: SSEEvent) => void;

// ===== API params =====
export interface StreamTaskParams {
  deploymentId: string;
  userId: string;
  prompt: string;
  sectionId?: string;
  sectionType?: SectionType;
  currentContent?: string;
  contextId?: string | null;
}

export interface ContinueTaskParams {
  taskId: string;
  deploymentId: string;
  userInput: string;
  sectionId?: string;
  sectionType?: SectionType;
  currentContent?: string;
}

export interface StreamHandlers {
  onEvent: SSEEventHandler;
  onError?: (err: Error) => void;
  onComplete?: (artifact: import("./section").SectionUpdate) => void;
}
