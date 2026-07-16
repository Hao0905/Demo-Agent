import { ArrowRight } from "lucide-react";
import type { Section } from "@/types/section";
import { Button } from "@/components/ui/button";

/** CTA — khối lời kêu gọi hành động cuối trang. */
export function CTASection({ section }: { section: Section }) {
  const heading = section.heading ?? section.title;
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-900 px-8 py-14 text-center text-white shadow-lg">
      <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
      <p className="mx-auto mt-3 max-w-xl text-zinc-300">{section.content}</p>
      {section.ctaLabel && (
        <Button
          size="lg"
          className="mt-6 bg-white text-zinc-900 hover:bg-zinc-200"
        >
          {section.ctaLabel} <ArrowRight />
        </Button>
      )}
    </div>
  );
}
