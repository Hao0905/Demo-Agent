import axios from "axios";
import type {
  AgentDeployment,
  ContinueTaskParams,
  SSEEvent,
  StreamHandlers,
  StreamTaskParams,
  TaskInfo,
  UploadedFile,
} from "@/types/task";
import type { SectionType, SectionUpdate } from "@/types/section";
import { firstSentence, sleep, uid } from "@/lib/utils";

// =========================================================================
// CONFIG & AUTH
// =========================================================================

/** API key lấy từ localStorage (FE self-serve) hoặc env. Gắn vào header X-API-Key. */
export function getApiKey(): string | null {
  if (typeof window !== "undefined") {
    const key = window.localStorage.getItem("agent-provider-api-key");
    if (key) return key;
  }
  return import.meta.env.VITE_AGENT_API_KEY ?? null;
}

/** Axios instance dùng cho các API non-streaming (agents, files, task info). */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_AGENT_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor gắn X-API-Key vào mọi request (bước Authentication trong docs).
apiClient.interceptors.request.use((config) => {
  const key = getApiKey();
  if (key) config.headers.set("X-API-Key", key);
  return config;
});

// =========================================================================
// MOCK DATA
// =========================================================================

const DEMO_USER_ID = "demo-user@local";

export const MOCK_AGENTS: AgentDeployment[] = [
  {
    deployment_id: "dep_website_builder_demo",
    agent_name: "website_builder",
    status: "running",
    model: "gemini-2.5-flash",
    replicas: 1,
  },
];

/** Agent thật có input/output schema khớp SectionUpdate — FE ưu tiên chọn agent này khi live. */
export const SECTION_EDITOR_AGENT_NAME = "section_editor";

// =========================================================================
// NON-STREAMING APIs (axios + mock fallback khi chưa có API key)
// =========================================================================

/** GET /agents/ — lấy danh sách agent + deployment_id. */
export async function getAgents(): Promise<AgentDeployment[]> {
  if (!getApiKey()) return MOCK_AGENTS; // demo mode
  const { data } = await apiClient.get<AgentDeployment[]>("/agents/");
  return data;
}

/** GET /task/info/{task_id} — chi tiết task (dùng khi poll thay vì stream). */
export async function getTaskInfo(taskId: string): Promise<TaskInfo> {
  if (!getApiKey()) {
    await sleep(200);
    return {
      task_id: taskId,
      context_id: null,
      state: "completed",
      status_message: "Mock task completed",
    };
  }
  const { data } = await apiClient.get<TaskInfo>(`/task/info/${taskId}`);
  return data;
}

/** POST /files/upload — upload logo / hình ảnh, trả về file_id để gửi kèm task. */
export async function uploadFile(file: File): Promise<UploadedFile> {
  if (!getApiKey()) {
    await sleep(500);
    return { file_id: uid("file"), filename: file.name, size: file.size };
  }
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<UploadedFile>("/files/upload", form);
  return data;
}

// =========================================================================
// MOCK CONTENT GENERATOR
// Giả lập output của sub-agent `section_editor` tuỳ theo prompt.
// =========================================================================

type ToneKey = "marketing" | "pro" | "casual";
type LangKey = "vi" | "en";

interface SectionCopy {
  heading: string;
  subheading?: string;
  content: string;
  ctaLabel?: string;
  bullets?: string[];
  features?: { title: string; description: string }[];
}

const COPY: Record<SectionType, Record<LangKey, Record<ToneKey, SectionCopy>>> = {
  hero: {
    vi: {
      marketing: {
        heading: "Tăng trưởng doanh thu với AI",
        subheading: "Giải pháp thông minh giúp doanh nghiệp tối ưu vận hành và bứt phá doanh số.",
        content:
          "Ứng dụng AI giúp doanh nghiệp tối ưu vận hành, cá nhân hoá trải nghiệm khách hàng và tăng trưởng bền vững.",
        ctaLabel: "Bắt đầu miễn phí",
      },
      pro: {
        heading: "Giải pháp doanh nghiệp ứng dụng AI",
        subheading: "Tối ưu quy trình, quản trị rủi ro và nâng cao hiệu suất vận hành.",
        content:
          "Chúng tôi cung cấp nền tảng AI giúp tổ chức tự động hoá quy trình, đảm bảo tuân thủ và tối ưu kết quả kinh doanh.",
        ctaLabel: "Liên hệ tư vấn",
      },
      casual: {
        heading: "Kinh doanh chưa bao giờ chill đến thế 🚀",
        subheading: "Để AI lo phần nặng — bạn chỉ cần sáng tạo!",
        content:
          "Tự động hoá mọi thứ, rút ngắn thời gian làm việc và tập trung vào những ý tưởng hay ho nhất.",
        ctaLabel: "Thử ngay nào!",
      },
    },
    en: {
      marketing: {
        heading: "Grow your revenue with AI",
        subheading: "Smart solutions to streamline operations and accelerate growth.",
        content:
          "Our AI platform helps businesses automate operations, personalize customer experience and grow sustainably.",
        ctaLabel: "Start free",
      },
      pro: {
        heading: "Enterprise-grade AI solutions",
        subheading: "Optimize processes, manage risk and elevate operational performance.",
        content:
          "We deliver an AI platform that enables organizations to automate workflows, ensure compliance and optimize business outcomes.",
        ctaLabel: "Contact sales",
      },
      casual: {
        heading: "Running a business? Let AI do the heavy lifting 🚀",
        subheading: "You bring the ideas — we bring the autopilot.",
        content: "Automate the boring stuff, ship faster and focus on what actually matters.",
        ctaLabel: "Try it now!",
      },
    },
  },
  about: {
    vi: {
      marketing: {
        heading: "Về chúng tôi",
        content:
          "Chúng tôi là đội ngũ công nghệ đam mê xây dựng những sản phẩm AI thực dụng, giúp hàng nghìn doanh nghiệp chuyển đổi số thành công.",
        bullets: [
          "Hơn 5 năm kinh nghiệm trong AI & Data",
          "Đội ngũ 50+ kỹ sư và chuyên gia",
          "Phục vụ 1.000+ khách hàng trên toàn quốc",
        ],
      },
      pro: {
        heading: "Tổng quan công ty",
        content:
          "Thành lập với sứ mệnh ứng dụng AI vào thực tiễn doanh nghiệp, chúng tôi cam kết mang lại giá trị đo lường được và bền vững.",
        bullets: [
          "Khung quản trị tuân thủ chuẩn quốc tế",
          "Mạng lưới đối tác chiến lược",
          "Đầu tư R&D liên tục",
        ],
      },
      casual: {
        heading: "Chuyện của chúng mình",
        content:
          "Một nhóm những người thích công nghệ và muốn làm cho kinh doanh dễ thở hơn bằng AI.",
        bullets: ["Yêu AI và dữ liệu", "Làm việc kiểu linh hoạt", "Khách hàng là bạn"],
      },
    },
    en: {
      marketing: {
        heading: "About us",
        content:
          "We are a tech team passionate about building practical AI products that help thousands of businesses succeed in their digital transformation.",
        bullets: ["5+ years in AI & Data", "50+ engineers and experts", "1,000+ customers nationwide"],
      },
      pro: {
        heading: "Company overview",
        content:
          "Founded with the mission of applying AI to real-world enterprise needs, we are committed to delivering measurable, sustainable value.",
        bullets: ["Internationally compliant governance", "Strategic partner network", "Continuous R&D investment"],
      },
      casual: {
        heading: "Our story",
        content: "A bunch of people who love tech and want to make business easier with AI.",
        bullets: ["Geeky about AI & data", "Flexible by design", "Customers are friends"],
      },
    },
  },
  feature: {
    vi: {
      marketing: {
        heading: "Tính năng nổi bật",
        content: "Mọi thứ bạn cần để vận hành doanh nghiệp thông minh trong một nền tảng duy nhất.",
        features: [
          { title: "Tự động hoá quy trình", description: "Giảm 80% thao tác thủ công nhờ workflow AI." },
          { title: "Phân tích dữ liệu", description: "Báo cáo realtime và dự báo xu hướng chính xác." },
          { title: "Cá nhân hoá khách hàng", description: "Gợi ý thông minh tăng tỷ lệ chuyển đổi." },
        ],
      },
      pro: {
        heading: "Khả năng nền tảng",
        content: "Các module lõi được thiết kế cho quy mô doanh nghiệp, bảo mật và mở rộng.",
        features: [
          { title: "Quản trị tập trung", description: "Điều hành nhiều chi nhánh trên một console." },
          { title: "Bảo mật & tuân thủ", description: "Mã hoá end-to-end, kiểm soát quyền chi tiết." },
          { title: "Khả năng mở rộng", description: "Kiến trúc cloud chịu tải cao, SLA 99.9%." },
        ],
      },
      casual: {
        heading: "Điểm nhấn xịn xò",
        content: "Những tính năng khiến bạn tự hỏi làm sao mình từng sống thiếu nó.",
        features: [
          { title: "Autopilot cho công việc", description: "Việc lặp đi lặp lại — để AI lo!" },
          { title: "Insight tức thì", description: "Số liệu dễ hiểu, nhìn là rõ." },
          { title: "Mỗi khách hàng một trải nghiệm", description: "Cá nhân hoá cực sâu." },
        ],
      },
    },
    en: {
      marketing: {
        heading: "Key features",
        content: "Everything you need to run a smart business in a single platform.",
        features: [
          { title: "Process automation", description: "Cut 80% of manual work with AI workflows." },
          { title: "Data analytics", description: "Realtime reports and accurate forecasting." },
          { title: "Customer personalization", description: "Smart recommendations that lift conversion." },
        ],
      },
      pro: {
        heading: "Platform capabilities",
        content: "Core modules built for enterprise scale, security and extensibility.",
        features: [
          { title: "Centralized governance", description: "Run multiple branches from one console." },
          { title: "Security & compliance", description: "End-to-end encryption, granular access control." },
          { title: "Scalability", description: "High-load cloud architecture, 99.9% SLA." },
        ],
      },
      casual: {
        heading: "Awesome highlights",
        content: "Features that make you wonder how you lived without them.",
        features: [
          { title: "Autopilot for work", description: "Repetitive stuff — let AI handle it!" },
          { title: "Instant insight", description: "Numbers that just make sense." },
          { title: "A experience per customer", description: "Deep personalization." },
        ],
      },
    },
  },
  cta: {
    vi: {
      marketing: {
        heading: "Sẵn sàng bứt phá cùng AI?",
        content: "Đăng ký hôm nay để nhận ưu đãi và tư vấn miễn phí từ chuyên gia của chúng tôi.",
        ctaLabel: "Đăng ký ngay",
      },
      pro: {
        heading: "Trao đổi với chuyên gia của chúng tôi",
        content: "Lên lịch tư vấn để khám phá giải pháp phù hợp với doanh nghiệp của bạn.",
        ctaLabel: "Đặt lịch tư vấn",
      },
      casual: {
        heading: "Sẵn sàng chơi lớn chưa? 😎",
        content: "Tham gia ngay để nhận ưu đãi cực hấp dẫn!",
        ctaLabel: "Cho tôi xem!",
      },
    },
    en: {
      marketing: {
        heading: "Ready to grow with AI?",
        content: "Sign up today for exclusive offers and a free consultation with our experts.",
        ctaLabel: "Sign up now",
      },
      pro: {
        heading: "Talk to our experts",
        content: "Book a consultation to find the right solution for your business.",
        ctaLabel: "Book a demo",
      },
      casual: {
        heading: "Ready to level up? 😎",
        content: "Join now for an awesome deal!",
        ctaLabel: "Show me!",
      },
    },
  },
};

function detectLang(prompt: string): LangKey {
  return /tiếng anh|english|dịch.{0,12}anh|translate/.test(prompt) ? "en" : "vi";
}

function detectTone(prompt: string): ToneKey {
  if (/trẻ tr|casual|vui|gen ?z|năng động|chill/.test(prompt)) return "casual";
  if (/chuyên nghiệp|professional|trang trọng|formal|corporate|tế nhị/.test(prompt)) return "pro";
  return "marketing";
}

function pickCopy(
  type: SectionType,
  lang: LangKey,
  tone: ToneKey,
  short: boolean,
): SectionCopy {
  const base = COPY[type][lang][tone] ?? COPY[type][lang].marketing;
  if (!short) return base;
  return {
    ...base,
    subheading: undefined,
    content: firstSentence(base.content),
    bullets: base.bullets?.slice(0, 2),
    features: base.features?.slice(0, 2),
  };
}

function buildArtifact(params: { prompt: string; sectionType?: SectionType; sectionId?: string }): SectionUpdate {
  const sectionType = params.sectionType ?? "hero";
  const sectionId = params.sectionId ?? sectionType;
  const lang = detectLang(params.prompt);
  const tone = detectTone(params.prompt);
  const short = /ngắn|shorter|concise|rút gọn|tóm tắt/.test(params.prompt);

  const copy = pickCopy(sectionType, lang, tone, short);
  return { sectionId, ...copy };
}

function buildAssistantText(
  sectionType: SectionType,
  lang: LangKey,
  tone: ToneKey,
  short: boolean,
): string {
  const labels: Record<SectionType, string> = {
    hero: "Hero",
    about: "About",
    feature: "Feature",
    cta: "CTA",
  };
  const toneLabel: Record<ToneKey, string> = {
    marketing: "marketing",
    pro: "chuyên nghiệp",
    casual: "trẻ trung",
  };
  const langLabel = lang === "en" ? "Tiếng Anh" : "Tiếng Việt";
  const shortNote = short ? " Nội dung đã được rút gọn súc tích." : "";
  return (
    `Đã cập nhật section ${labels[sectionType]} theo phong cách ${toneLabel[tone]} bằng ${langLabel}.${shortNote} ` +
    `Heading và nội dung đã được viết lại, giữ nguyên bố cục ban đầu của bạn. ` +
    `Preview bên trái sẽ phản ánh ngay thay đổi — hãy thử tiếp các gợi ý như “Ngắn gọn hơn” hoặc “Dịch sang tiếng Anh”.`
  );
}

interface MockStreamPlan {
  thinkingLines: string[];
  assistantText: string;
  artifact: SectionUpdate;
  task: TaskInfo;
}

function generateMockResponse(
  params: StreamTaskParams | ContinueTaskParams,
): MockStreamPlan {
  const prompt = "prompt" in params ? params.prompt : params.userInput;
  const sectionType = params.sectionType ?? "hero";
  const lang = detectLang(prompt);
  const tone = detectTone(prompt);
  const short = /ngắn|shorter|concise|rút gọn|tóm tắt/.test(prompt);

  return {
    thinkingLines: [
      `Phân tích nội dung hiện tại của section "${sectionType}"...`,
      `Áp dụng yêu cầu: "${prompt}" — giữ bố cục, chỉ chỉnh sửa text & hình ảnh.`,
    ],
    assistantText: buildAssistantText(sectionType, lang, tone, short),
    artifact: buildArtifact({ prompt, sectionType, sectionId: params.sectionId }),
    task: {
      task_id: uid("task"),
      context_id: uid("ctx"),
      state: "completed",
      status_message: "Mock streaming completed",
    },
  };
}

// =========================================================================
// MOCK SSE STREAMING
// Giả lập chuỗi: status_update → thinking → token... → artifact_update → final
// =========================================================================

type AnyStreamParams = StreamTaskParams | ContinueTaskParams;

function runMockStream(
  params: AnyStreamParams,
  handlers: StreamHandlers,
): () => void {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const at = (delay: number, fn: () => void): void => {
    timers.push(
      setTimeout(() => {
        if (!cancelled) fn();
      }, delay),
    );
  };

  const emit = (evt: SSEEvent): void => handlers.onEvent(evt);

  try {
    const { thinkingLines, assistantText, artifact, task } = generateMockResponse(params);
    let t = 60;

    // 1) status_update — task bắt đầu xử lý
    at(t, () => emit({ event: "status_update", data: { state: "working", final: false } }));

    // 2) thinking — reasoning trace của sub-agent
    for (const line of thinkingLines) {
      t += 200;
      at(t, () => emit({ event: "thinking", data: { author: "section_editor", delta: line } }));
    }

    // 3) token — typewriter effect (giữ nguyên khoảng trắng)
    t += 240;
    const tokens = assistantText.split(/(\s+)/).filter(Boolean);
    for (const tk of tokens) {
      const delay = 24 + Math.random() * 40;
      at(t, () => emit({ event: "token", data: { delta: tk } }));
      t += delay;
    }

    // 4) artifact_update — structured JSON, render khi last_chunk = true
    t += 120;
    at(t, () =>
      emit({
        event: "artifact_update",
        data: { content: JSON.stringify(artifact), last_chunk: true },
      }),
    );

    // 5) final — task hoàn thành
    t += 220;
    at(t, () => {
      emit({ event: "final", data: { content: assistantText, task } });
      handlers.onComplete?.(artifact);
    });
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
  }

  // Cleanup — huỷ toàn bộ timeout đang chờ
  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

// =========================================================================
// REAL SSE STREAMING
// POST /task/stream (và /task/continue/stream) qua fetch + parse SSE thủ công.
// Theo docs/agent/7.md mục 7.4. Fallback mock khi lỗi mạng trước khi nhận event.
// =========================================================================

/** Base URL API thật (env), fallback "/api" cho proxy dev nếu có. */
function getApiBase(): string {
  return import.meta.env.VITE_AGENT_API_URL ?? "/api";
}

/**
 * Agent có input_schema → task_message PHẢI là JSON string khớp schema
 * (verify bằng test: text tự do gây validation error).
 * `currentContent` là JSON string nội dung section (do useTaskStream build).
 */
function buildTaskMessage(params: StreamTaskParams): string {
  return JSON.stringify({
    sectionId: params.sectionId ?? params.sectionType ?? "hero",
    sectionType: params.sectionType ?? "hero",
    currentContent: params.currentContent ?? "{}",
    userPrompt: params.prompt,
  });
}

interface RealStreamConfig {
  endpoint: "/task/stream" | "/task/continue/stream";
  body: Record<string, unknown>;
}

/**
 * runRealStream — gọi API streaming thật, parse SSE, fallback mock khi lỗi kết nối.
 * Trả cancel fn (abort fetch + huỷ mock nếu đã fallback).
 */
function runRealStream(
  params: AnyStreamParams,
  config: RealStreamConfig,
  handlers: StreamHandlers,
): () => void {
  const controller = new AbortController();
  let mockCancel: (() => void) | null = null;
  let receivedEvent = false;
  let fallbackUsed = false;

  const emit = (evt: SSEEvent): void => {
    receivedEvent = true;
    handlers.onEvent(evt);
  };

  (async () => {
    try {
      const key = getApiKey();
      const res = await fetch(`${getApiBase()}${config.endpoint}`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "X-API-Key": key } : {}),
        },
        body: JSON.stringify(config.body),
      });
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const lines = chunk.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event:", "").trim() as SSEEvent["event"];
          try {
            const data = JSON.parse(dataLine.replace("data:", "").trim());
            // data từ API là dynamic — cast qua SSEEvent ở biên system.
            emit({ event, data } as SSEEvent);
          } catch {
            // data không phải JSON hợp lệ — bỏ qua event này.
          }
        }
      }
    } catch (err) {
      // Lỗi do abort (cancel) — không xử lý.
      if (controller.signal.aborted) return;
      // Lỗi mạng/trước khi nhận event nào → fallback mock (yêu cầu "offline fallback").
      if (!receivedEvent) {
        fallbackUsed = true;
        mockCancel = runMockStream(params, handlers);
        return;
      }
      // Lỗi giữa stream → báo error.
      handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return () => {
    controller.abort();
    if (fallbackUsed) mockCancel?.();
  };
}

// =========================================================================
// PUBLIC STREAMING APIs
// =========================================================================

/**
 * POST /task/stream — streaming SSE. Trả về hàm cleanup (abort).
 * Có API key → real; không key → mock (demo mode).
 */
export function streamTask(params: StreamTaskParams, handlers: StreamHandlers): () => void {
  if (!getApiKey()) return runMockStream(params, handlers);
  return runRealStream(
    params,
    {
      endpoint: "/task/stream",
      body: {
        deployment_id: params.deploymentId,
        user_id: params.userId,
        task_message: buildTaskMessage(params),
        ...(params.contextId ? { context_id: params.contextId } : {}),
      },
    },
    handlers,
  );
}

/** POST /task/continue/stream — tiếp tục hội thoại khi Agent cần input thêm. */
export function continueTask(params: ContinueTaskParams, handlers: StreamHandlers): () => void {
  if (!getApiKey()) return runMockStream(params, handlers);
  return runRealStream(
    params,
    {
      endpoint: "/task/continue/stream",
      body: {
        task_id: params.taskId,
        deployment_id: params.deploymentId,
        user_input: params.userInput,
      },
    },
    handlers,
  );
}

// =========================================================================
// HELPERS
// =========================================================================

/** Parse JSON từ artifact_update.content thành SectionUpdate (an toàn). */
export function parseSectionUpdate(raw: string): SectionUpdate | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SectionUpdate>;
    if (typeof parsed.sectionId === "string") return parsed as SectionUpdate;
    return null;
  } catch {
    return null;
  }
}

export { DEMO_USER_ID };
