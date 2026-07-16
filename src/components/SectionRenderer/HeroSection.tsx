import { ArrowRight, Sparkles } from "lucide-react";
import type { Section } from "@/types/section";
import { Button } from "@/components/ui/button";

/** Hero — banner đầu trang với heading lớn + CTA. */
export function HeroSection({ section }: { section: Section }) {
  const heading = section.heading ?? section.title;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-8 py-16 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> AI Website Builder
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{heading}</h1>
        {section.subheading && (
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-white/90">
            {section.subheading}
          </p>
        )}
        <p className="mx-auto mt-3 max-w-2xl text-base text-white/75">{section.content}</p>
        {section.ctaLabel && (
          <Button
            size="lg"
            className="mt-8 bg-white text-indigo-700 hover:bg-white/90"
          >
            {section.ctaLabel} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
