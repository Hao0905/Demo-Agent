import { Layers, X } from "lucide-react";
import { SECTION_LABELS } from "@/types/section";
import { useWebsiteStore } from "@/store/websiteStore";
import { Badge } from "@/components/ui/badge";

/**
 * SectionProperties — thanh hiển thị section đang được chọn để AI chỉnh.
 * Thể hiện phần tử "Properties" trong kiến trúc FE.
 */
export function SectionProperties() {
  const section = useWebsiteStore((s) =>
    s.sections.find((x) => x.id === s.selectedSectionId) ?? null,
  );
  const selectSection = useWebsiteStore((s) => s.selectSection);

  if (!section) {
    return (
      <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <Layers className="h-4 w-4" />
        Chưa chọn section — hover Canvas rồi bấm “AI Edit”.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{SECTION_LABELS[section.type]}</span>
        <Badge variant="secondary" className="text-[10px]">
          đang chỉnh
        </Badge>
      </div>
      <button
        type="button"
        onClick={() => selectSection(null)}
        className="text-muted-foreground transition-colors hover:text-foreground"
        title="Bỏ chọn"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
