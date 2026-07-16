import { Sparkles } from "lucide-react";
import type { Section } from "@/types/section";
import { SECTION_LABELS } from "@/types/section";
import { Button } from "@/components/ui/button";
import { useWebsiteStore } from "@/store/websiteStore";

/**
 * SectionToolbar — thanh công cụ hover trên mỗi section.
 * Chứa nút "✨ AI Edit"; click sẽ chọn section đó để AI chỉnh sửa.
 */
export function SectionToolbar({
  section,
  isSelected,
}: {
  section: Section;
  isSelected: boolean;
}) {
  const selectSection = useWebsiteStore((s) => s.selectSection);

  return (
    <div
      data-selected={isSelected}
      className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 data-[selected=true]:opacity-100"
    >
      <span className="rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
        {SECTION_LABELS[section.type]}
      </span>
      <Button
        size="sm"
        variant={isSelected ? "default" : "secondary"}
        onClick={() => selectSection(section.id)}
        className="shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5" /> AI Edit
      </Button>
    </div>
  );
}
