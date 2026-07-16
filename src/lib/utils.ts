import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** cn() — gộp classnames và giải quyết xung đột utility Tailwind (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Tạo id ngẫu nhiên (dùng cho message id, task_id mock...). */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Lấy câu đầu tiên của một đoạn text (dùng cho mock "rút gọn"). */
export function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : text).trim();
}
