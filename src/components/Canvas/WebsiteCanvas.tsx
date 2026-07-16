import { useWebsiteStore } from "@/store/websiteStore";
import { SectionRenderer } from "@/components/SectionRenderer";

/**
 * WebsiteCanvas — bản preview của website demo (Hero → About → Feature → CTA).
 * Chiếm ~70% màn hình, render trực tiếp từ state websiteStore.
 */
export function WebsiteCanvas() {
  const sections = useWebsiteStore((s) => s.sections);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="space-y-16">
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
