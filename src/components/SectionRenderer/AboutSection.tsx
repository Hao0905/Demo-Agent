import { Check } from "lucide-react";
import type { Section } from "@/types/section";

/** About — giới thiệu + danh sách điểm nổi bật (bullets). */
export function AboutSection({ section }: { section: Section }) {
  const heading = section.heading ?? section.title;
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        <p className="mt-3 text-muted-foreground">{section.content}</p>
      </div>
      <ul className="space-y-3">
        {(section.bullets ?? []).map((bullet, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 p-3"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-sm">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
