// ===== Domain types cho Website Builder =====

export type SectionType = "hero" | "about" | "feature" | "cta";

export interface FeatureItem {
  title: string;
  description: string;
}

export interface SectionStyle {
  alignment?: "left" | "center" | "right";
  accentColor?: string;
}

/**
 * Section — đơn vị nội dung của website demo.
 * Theo spec: id, type, title, content là bắt buộc.
 * Các trường tuỳ chọn (heading, features, ...) phục vụ render phong phú.
 */
export interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  // ---- display fields (optional) ----
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  features?: FeatureItem[];
  bullets?: string[];
  style?: SectionStyle;
}

/**
 * SectionUpdate — payload Agent trả về qua sự kiện `artifact_update`.
 * Ánh xạ (map) sang Partial<Section> khi apply vào state.
 */
export interface SectionUpdate {
  sectionId: string;
  heading?: string;
  content?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bullets?: string[];
  features?: FeatureItem[];
  style?: SectionStyle;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  about: "About",
  feature: "Feature",
  cta: "CTA",
};
