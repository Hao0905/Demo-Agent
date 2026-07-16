### important: read @docs/7.md , @docs/8.md, @docs/9.md
xây dựng tính năng:
Chat với Agent
AI Edit Section
Render website với nội dung mới

Có thể chia thành các phần sau.

1. Authentication

FE cần lấy API Key và gắn vào mọi request.

headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY
}

Đây là bước bắt buộc trước khi gọi bất kỳ API nào.

2. Chat với Agent (Streaming)

Đây là phần quan trọng nhất.

Tài liệu đã cung cấp hàm

streamTask(...)

Luồng

User nhập prompt

↓

POST /task/stream

↓

SSE

↓

token
thinking
artifact
status
final

FE chỉ cần subscribe các event và render theo thời gian thực.

3. Xử lý các SSE Event

FE nên implement handler cho:

Event	FE xử lý
token	append chat
thinking	hiển thị reasoning (optional)
artifact_update	render JSON
status_update	loading
final	hoàn thành
error	báo lỗi

Đây là toàn bộ flow chat realtime.

4. AI Edit Section

Đây chính là use case của bạn.

FE gửi

{
  "sectionId": "...",
  "currentContent": "...",
  "prompt": "..."
}

Agent trả

{
    ...
}

FE chỉ cần

renderSection(sectionData)

để cập nhật UI.

5. Render website với nội dung mới

Tài liệu còn minh họa luôn hàm

renderSection(...)

FE sẽ

artifact_update

↓

JSON

↓

React State

↓

Component Render

không cần parse text.

6. Context nhiều lần edit

Nếu user edit liên tục

Hero

↓

Feature

↓

CTA

FE nên lưu

context_id

và gửi lại ở các request sau.

POST /task/stream

context_id

Agent sẽ nhớ website đang chỉnh.

7. Upload hình ảnh

Nếu prompt có

"thay ảnh"

"phân tích logo"


FE

POST /files/upload

↓

file_id

↓

task/stream

không gửi file trực tiếp.

8. Continue Chat

Nếu Agent hỏi thêm

Bạn muốn tone chuyên nghiệp hay trẻ trung?

FE sẽ nhận

input-required

sau đó gọi

POST /task/continue/stream

để tiếp tục hội thoại.

9. API FE sẽ dùng

Theo mục Danh sách API, với use case này FE chỉ cần khoảng 6 API.

API	Mục đích
POST /task/stream	Chat realtime
POST /task/continue/stream	Continue khi Agent hỏi thêm
GET /task/info/{task_id}	Poll nếu không dùng stream
POST /files/upload	Upload logo/hình ảnh
GET /agents/	Lấy deployment_id của Agent
GET /agents/{id}/status	Kiểm tra Agent đang Running

Các API này đều được mô tả trong phần Task API, File Upload và Agent Management.

10. Kiến trúc FE đề xuất
Canvas
   │
   │ chọn Section
   ▼
AI Chat Drawer
   │
   │ nhập Prompt
   ▼
POST /task/stream
   │
   ▼
SSE
   │
   ├── token
   ├── thinking
   ├── artifact_update
   └── final
            │
            ▼
Structured JSON
            │
            ▼
update React State
            │
            ▼
Render Website
Kết luận

Để triển khai tính năng "AI Edit Section → Render website với nội dung mới", FE chỉ cần tập trung vào các nhóm chức năng sau:

Xác thực và chọn Agent: lấy deployment_id, gửi X-API-Key.
Chat realtime: sử dụng POST /task/stream và xử lý các sự kiện SSE (token, artifact_update, final, ...).
Render theo structured output: đọc JSON từ artifact_update hoặc final để cập nhật trực tiếp state và giao diện, thay vì xử lý text tự do.
Quản lý ngữ cảnh: lưu context_id để các lần chỉnh sửa liên tiếp cùng thuộc một phiên làm việc.
Mở rộng: hỗ trợ files/upload cho hình ảnh/logo và task/continue/stream khi Agent cần hỏi thêm thông tin.