import type { Section } from "@/types/section";
import { useWebsiteStore } from "@/store/websiteStore";
import { cn } from "@/lib/utils";
import { SectionToolbar } from "./SectionToolbar";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { FeatureSection } from "./FeatureSection";
import { CTASection } from "./CTASection";

/**
 * SectionRenderer — chọn component hiển thị theo section.type,
 * bọc trong khung có thể chọn (select) + toolbar AI Edit.
 */
export function SectionRenderer({ section }: { section: Section }) {
  const selectedSectionId = useWebsiteStore((s) => s.selectedSectionId);
  const isSelected = selectedSectionId === section.id;

  const content =
    section.type === "hero" ? (
      <HeroSection section={section} />
    ) : section.type === "about" ? (
      <AboutSection section={section} />
    ) : section.type === "feature" ? (
      <FeatureSection section={section} />
    ) : (
      <CTASection section={section} />
    );

  return (
    <section
      className={cn(
        "group relative scroll-mt-20 rounded-xl p-1 transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <SectionToolbar section={section} isSelected={isSelected} />
      {content}
    </section>
  );
}
