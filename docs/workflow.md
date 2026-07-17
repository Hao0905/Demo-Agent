# Workflow: AI Edit Section (Live mode)

Tài liệu tóm tắt luồng "AI Edit Section" theo code đã implement. Chế độ live gọi agent `section_editor` thật; khi không có API key / lỗi mạng thì fallback sang mock (cùng interface).

---

## 1. Tổng quan

```
User chọn section → nhập prompt
        │
        ▼
FE build input_schema → POST /task/stream (task_message = JSON string)
        │
        ▼
Agent section_editor xử lý → stream SSE
        │  ├─ status_update   (task_id, context_id, state)
        │  ├─ thinking        (optional)
        │  ├─ artifact_update  (JSON SectionUpdate, last_chunk=true)
        │  └─ final
        ▼
FE parse artifact → update Canvas + đổ message vào Chat
```

Agent dùng: **`section_editor`** (`deployment_id` lấy động qua `GET /agents/`, FE ưu tiên chọn agent có `agent_name === "section_editor"` và `status === "running"`).

---

## 2. Cách thực hiện (từ góc user)

1. Hover section trên Canvas (Hero / About / Feature / CTA) → bấm **AI Edit** → section được viền xanh (selected).
2. Gõ yêu cầu vào ô chat → Enter.
3. Chờ ~2-4 giây: nội dung section trên Canvas update + chat bubble hiện 1 câu tóm tắt.

---

## 3. Input

### 3.1. FE thu thập ([src/hooks/useTaskStream.ts](src/hooks/useTaskStream.ts) → `sendPrompt`)

| Trường | Nguồn |
|---|---|
| `sectionId` | id của section đang chọn |
| `sectionType` | type của section (`hero` / `about` / `feature` / `cta`) |
| `currentContent` | JSON string các field display: `{heading, subheading, content, ctaLabel, bullets, features}` |
| `userPrompt` | text user nhập |
| `deploymentId` | agent `section_editor` |
| `contextId` | сохраняется giữa các lượt edit (để agent nhớ website đang chỉnh) |

### 3.2. Agent input_schema (JSON string trong `task_message`)

Vì agent có `input_schema`, `task_message` **bắt buộc là JSON string** (text tự do sẽ gây validation error):

```json
{
  "sectionId": "hero",
  "sectionType": "hero",
  "currentContent": "{\"heading\":\"...\",\"content\":\"...\",\"ctaLabel\":\"...\"}",
  "userPrompt": "Tone chuyên nghiệp hơn"
}
```

---

## 4. Output

### 4.1. Agent output_schema (trả qua `artifact_update.content`)

```json
{
  "sectionId": "hero",
  "heading": "Giải pháp AI tối ưu hóa tăng trưởng doanh thu",
  "subheading": "",
  "content": "Ứng dụng trí tuệ nhân tạo giúp doanh nghiệp tối ưu vận hành...",
  "ctaLabel": "Trải nghiệm miễn phí",
  "bullets": [],
  "features": [],
  "message": "Đã cập nhật nội dung hero section với văn phong chuyên nghiệp."
}
```

Trường trả theo loại section (agent tự quyết định dựa `sectionType`):
- **hero** → `heading`, `subheading`, `content`, `ctaLabel`
- **about** → `heading`, `content`, `bullets[]`
- **feature** → `heading`, `content`, `features[]` (mỗi item: `{title, description}`)
- **cta** → `heading`, `content`, `ctaLabel`

`message` luôn có — dùng cho chat bubble, **không** apply vào section.

### 4.2. FE áp dụng ([src/store/websiteStore.ts](src/store/websiteStore.ts) → `applyUpdate`)

`toPatch()` ánh xạ các trường có mặt sang `Partial<Section>` (bỏ qua `message`), giữ nguyên `id`/`type` gốc. Canvas render lại qua React state.

---

## 5. API

### Endpoint

```
POST https://agent-provider.public.rke.ai.tmtco.org/task/stream
```

### Headers

```
Content-Type: application/json
X-API-Key: <API key>
```

### Body (`SendTaskRequest`)

```json
{
  "deployment_id": "13d071ae-d473-4f92-8b1b-95d0c6340cc7",
  "user_id": "demo-user@local",
  "task_message": "{\"sectionId\":\"hero\",\"sectionType\":\"hero\",\"currentContent\":\"...\",\"userPrompt\":\"...\"}",
  "context_id": "<uuid, tuỳ chọn — cho multi-turn>"
}
```

### Response: SSE stream

| Event | `data` chính | FE xử lý |
|---|---|---|
| `status_update` | `state`, `task_id`, `context_id`, `final` | capture `task_id` + `context_id` sớm |
| `thinking` | `author`, `delta` | hiển thị reasoning (optional) |
| `artifact_update` | `content` (JSON string), `last_chunk` | khi `last_chunk=true`: parse → update Canvas + chat message |
| `error` | `message` | báo lỗi |
| `final` | `content`, `task` | kết thúc stream, dọn trạng thái |

Lưu ý: `final.data.task` là object A2A (camelCase `id`/`contextId`/`status.state`) — **không** khớp type `TaskInfo`. FE lấy id từ `status_update`, không đọc `final.task`.

---

## 6. Tham chiếu code

| Bước | File |
|---|---|
| Thu thập input + điều phối SSE | [src/hooks/useTaskStream.ts](src/hooks/useTaskStream.ts) |
| Build `task_message` + gọi API thật + fallback mock | [src/api/agent.ts](src/api/agent.ts) (`streamTask`, `runRealStream`, `buildTaskMessage`) |
| Parse artifact JSON | [src/api/agent.ts](src/api/agent.ts) (`parseSectionUpdate`) |
| Áp dụng lên section | [src/store/websiteStore.ts](src/store/websiteStore.ts) (`applyUpdate`, `toPatch`) |
| State chat (message, contextId) | [src/store/chatStore.ts](src/store/chatStore.ts) |
| Chọn agent + mode indicator | [src/pages/Home.tsx](src/pages/Home.tsx) |
| Types | [src/types/task.ts](src/types/task.ts), [src/types/section.ts](src/types/section.ts) |
