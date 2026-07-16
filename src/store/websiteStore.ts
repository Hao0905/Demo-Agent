import { create } from "zustand";
import type { Section, SectionType, SectionUpdate } from "@/types/section";

/** Nội dung website mặc định khi mới vào demo. */
const INITIAL_SECTIONS: Section[] = [
  {
    id: "hero",
    type: "hero",
    title: "Tăng trưởng doanh thu với AI",
    heading: "Tăng trưởng doanh thu với AI",
    subheading: "Giải pháp thông minh giúp doanh nghiệp tối ưu vận hành và bứt phá doanh số.",
    content:
      "Ứng dụng AI giúp doanh nghiệp tối ưu vận hành, cá nhân hoá trải nghiệm khách hàng và tăng trưởng bền vững.",
    ctaLabel: "Bắt đầu miễn phí",
    ctaHref: "#",
  },
  {
    id: "about",
    type: "about",
    title: "Về chúng tôi",
    heading: "Về chúng tôi",
    content:
      "Chúng tôi là đội ngũ công nghệ đam mê xây dựng những sản phẩm AI thực dụng, giúp hàng nghìn doanh nghiệp chuyển đổi số thành công.",
    bullets: [
      "Hơn 5 năm kinh nghiệm trong AI & Data",
      "Đội ngũ 50+ kỹ sư và chuyên gia",
      "Phục vụ 1.000+ khách hàng trên toàn quốc",
    ],
  },
  {
    id: "feature",
    type: "feature",
    title: "Tính năng nổi bật",
    heading: "Tính năng nổi bật",
    content: "Mọi thứ bạn cần để vận hành doanh nghiệp thông minh trong một nền tảng duy nhất.",
    features: [
      { title: "Tự động hoá quy trình", description: "Giảm 80% thao tác thủ công nhờ workflow AI." },
      { title: "Phân tích dữ liệu", description: "Báo cáo realtime và dự báo xu hướng chính xác." },
      { title: "Cá nhân hoá khách hàng", description: "Gợi ý thông minh tăng tỷ lệ chuyển đổi." },
    ],
  },
  {
    id: "cta",
    type: "cta",
    title: "Sẵn sàng bứt phá cùng AI?",
    heading: "Sẵn sàng bứt phá cùng AI?",
    content: "Đăng ký hôm nay để nhận ưu đãi và tư vấn miễn phí từ chuyên gia của chúng tôi.",
    ctaLabel: "Đăng ký ngay",
    ctaHref: "#",
  },
];

interface WebsiteState {
  sections: Section[];
  selectedSectionId: string | null;
  selectSection: (id: string | null) => void;
  updateSection: (id: string, patch: Partial<Section>) => void;
  /** Ánh xạ SectionUpdate (từ Agent) → patch Section, giữ nguyên type/id. */
  applyUpdate: (update: SectionUpdate) => void;
  getSection: (id: string | null) => Section | undefined;
  reset: () => void;
}

/** Chuyển SectionUpdate thành Partial<Section>: heading ghi đè cả title (để chuẩn spec). */
function toPatch(update: SectionUpdate): Partial<Section> {
  const patch: Partial<Section> = {};
  if (update.heading !== undefined) {
    patch.heading = update.heading;
    patch.title = update.heading; // title là trường bắt buộc theo spec, đồng bộ với heading
  }
  if (update.subheading !== undefined) patch.subheading = update.subheading;
  if (update.content !== undefined) patch.content = update.content;
  if (update.ctaLabel !== undefined) patch.ctaLabel = update.ctaLabel;
  if (update.ctaHref !== undefined) patch.ctaHref = update.ctaHref;
  if (update.bullets !== undefined) patch.bullets = update.bullets;
  if (update.features !== undefined) patch.features = update.features;
  if (update.style !== undefined) patch.style = update.style;
  return patch;
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  sections: INITIAL_SECTIONS,
  selectedSectionId: null,

  selectSection: (id) => set({ selectedSectionId: id }),

  updateSection: (id, patch) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),

  applyUpdate: (update) => {
    const patch = toPatch(update);
    get().updateSection(update.sectionId, patch);
  },

  getSection: (id) => get().sections.find((s) => s.id === id),

  reset: () => set({ sections: INITIAL_SECTIONS, selectedSectionId: null }),
}));

export const SECTION_ORDER: SectionType[] = ["hero", "about", "feature", "cta"];
