# Agent Provider Demo — AI Website Editor

Demo tích hợp **Agent Provider**: chat với Agent theo thời gian thực (SSE), dùng AI để chỉnh sửa từng section của website và render ngay nội dung mới.

Giao diện 3 vùng: **Canvas** (~70%) hiển thị website demo · **Chat Drawer** (~30%) nhập prompt · **Loading** trạng thái "Thinking...".

> Toàn bộ API đang được **mock bằng `Promise` + `setTimeout`** để chạy được ngay không cần backend. Khi sẵn sàng, chỉ cần bật API key là tự động gọi Agent Provider thật (xem mục [Kết nối Agent Provider thật](#-kết-nối-agent-provider-thật)).

---

## Công nghệ

| Nhóm | Thư viện |
|------|----------|
| Core | React 19, Vite 6, TypeScript 5 |
| Styling | TailwindCSS 3, shadcn/ui, Lucide React |
| Routing | React Router 7 |
| HTTP | Axios |
| State | Zustand (chat + website state) |
| Server state | TanStack Query (React Query) |

---

## Chạy dự án

```bash
npm install
npm run dev
```

Mở http://localhost:5173

Các script:

```bash
npm run dev        # dev server
npm run build      # typecheck (tsc -b) + build production
npm run preview    # xem bản build
```

---

## Cách dùng demo

1. Trên Canvas, **hover một section** (Hero / About / Feature / CTA) và bấm nút **✨ AI Edit** để chọn section.
2. Ở Chat Drawer, nhập yêu cầu hoặc bấm một chip gợi ý:
   - `Viết theo phong cách marketing`
   - `Ngắn gọn hơn`
   - `Dịch sang tiếng Anh`
   - `Tone chuyên nghiệp`
   - `Tone trẻ trung`
3. Xem Agent "thinking" → token hiện dần (typewriter) → Canvas **cập nhật nội dung ngay** khi nhận `artifact_update`.
4. Bấm **Reset** ở header để về nội dung ban đầu.

---

## Kiến trúc thư mục

```
src/
├── api/
│   └── agent.ts                 # API layer: streamTask, continueTask, uploadFile + mock SSE
├── components/
│   ├── Canvas/
│   │   └── WebsiteCanvas.tsx    # Bản preview website (~70% màn hình)
│   ├── SectionRenderer/
│   │   ├── SectionRenderer.tsx  # Chọn component theo section.type
│   │   ├── SectionToolbar.tsx   # Nút "✨ AI Edit" + tag section
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── FeatureSection.tsx
│   │   └── CTASection.tsx
│   ├── Chat/
│   │   ├── ChatPanel.tsx        # Drawer chat (~30% màn hình)
│   │   ├── MessageList.tsx      # Danh sách message + reasoning + loading
│   │   ├── PromptInput.tsx      # Textarea + Send/Stop + chip gợi ý
│   │   └── LoadingIndicator.tsx # "Thinking..."
│   ├── Properties/
│   │   └── SectionProperties.tsx# Trạng thái section đang chọn
│   └── ui/                      # shadcn/ui primitives (button, textarea, card, badge)
├── hooks/
│   ├── useTaskStream.ts         # Xử lý toàn bộ SSE event → cập nhật store
│   └── useAgents.ts             # TanStack Query: lấy danh sách agent
├── pages/
│   └── Home.tsx                 # Layout 3 vùng
├── store/
│   ├── chatStore.ts             # Zustand: messages, isStreaming, thinking, context_id
│   └── websiteStore.ts          # Zustand: sections[], selectedSectionId
├── types/
│   ├── section.ts               # Section, SectionUpdate, SectionType
│   └── task.ts                  # ChatMessage, SSEEvent (union), TaskInfo, AgentDeployment
├── lib/utils.ts                 # cn(), uid(), sleep(), firstSentence()
├── App.tsx                      # Routes
├── main.tsx                     # Providers (Router + QueryClient)
└── index.css                    # Tailwind + shadcn CSS variables
```

---

## Luồng "AI Edit Section → Render website"

```
User bấm [✨ AI Edit] trên Canvas
        │  (selectSection)
        ▼
User nhập prompt ở Chat Drawer
        │  useTaskStream.sendPrompt()
        ▼
streamTask()  →  POST /task/stream (mock SSE)
        │
        ▼  các sự kiện SSE:
  status_update   → bật "Thinking..."
  thinking        → hiển thị reasoning
  token           → append vào message assistant (typewriter)
  artifact_update → parse JSON → websiteStore.applyUpdate()
                                    │
                                    ▼
                    React state đổi → Canvas render nội dung mới
  final           → lưu context_id / task_id, kết thúc stream
```

Toàn bộ luồng điều phối nằm trong [`src/hooks/useTaskStream.ts`](src/hooks/useTaskStream.ts).

---

## Mock SSE hoạt động thế nào

[`src/api/agent.ts`](src/api/agent.ts) giả lập đúng chuỗi sự kiện của Agent Provider bằng `setTimeout`:

```
status_update → thinking → thinking → token → token → ... → artifact_update → final
```

- Mỗi `token` là một từ, emit cách nhau ~24–64ms → hiệu ứng typewriter giống ChatGPT.
- `artifact_update` mang JSON cấu trúc (theo `output_schema` của sub-agent `section_editor`):

```json
{
  "sectionId": "hero",
  "heading": "Tăng trưởng doanh thu với AI",
  "content": "Ứng dụng AI giúp doanh nghiệp tối ưu vận hành và tăng trưởng bền vững."
}
```

- Mock nhận diện ý định từ prompt: **dịch tiếng Anh**, **rút gọn**, đổi **tone** (marketing / chuyên nghiệp / trẻ trung) và sinh nội dung tương ứng cho từng section.

`streamTask()` trả về **hàm cleanup** (huỷ `setTimeout`/abort) — gọi khi unmount hoặc khi user bấm Stop.

---

## State management

| Store | Vai trò |
|-------|---------|
| `websiteStore` | Mảng `sections[]`, `selectedSectionId`, `applyUpdate(update)` ánh xạ `SectionUpdate → Section` |
| `chatStore` | `messages[]`, `isStreaming`, `thinking[]`, `streamingMessageId`, `contextId`, `taskId` |

Cả hai dùng Zustand. Hook `useTaskStream` đọc/ghi store qua `useChatStore.getState()` / `useWebsiteStore.getState()` để không phụ thuộc re-render.

---

## Kết nối Agent Provider thật

API layer đã viết sẵn nhánh thật (dùng Axios, gắn header `X-API-Key`). Khi có backend:

1. Cấu hình env (tạo file `.env.local`):

```bash
VITE_AGENT_API_URL=https://agent-provider.public.rke.ai.tmtco.org
VITE_AGENT_API_KEY=your-api-key-here
```

2. Hoặc nhập key runtime qua DevTools:

```js
localStorage.setItem("agent-provider-api-key", "your-api-key");
```

Khi có key, các hàm `getAgents()`, `getTaskInfo()`, `uploadFile()` sẽ gọi thật qua Axios (đã có interceptor gắn `X-API-Key`). Phần streaming (`streamTask`) hiện là mock — để bật streaming thật, thay phần mock trong `streamTask()` bằng fetch đọc SSE theo [docs/7.md](docs/7.md) mục 7.4.

---

## Danh sách API FE dùng (theo docs/9.md)

| API | Mục đích | File |
|-----|---------|------|
| `GET /agents/` | Lấy `deployment_id` của Agent | `useAgents.ts` |
| `POST /task/stream` | Chat realtime (SSE) | `agent.ts → streamTask` |
| `POST /task/continue/stream` | Tiếp tục khi Agent hỏi thêm | `agent.ts → continueTask` |
| `POST /files/upload` | Upload logo / hình ảnh | `agent.ts → uploadFile` |
| `GET /task/info/{id}` | Poll task (không stream) | `agent.ts → getTaskInfo` |

---

## Ghi chú

- Không dùng `any` — `SSEEvent` là **discriminated union`, type-safe khi `switch (event)`.
- TypeScript strict mode bật đầy đủ (`noUnusedLocals`, `noUnusedParameters`...).
- Responsive: mobile xếp dọc (Canvas trên, Chat dưới), `lg+` xếp ngang.
