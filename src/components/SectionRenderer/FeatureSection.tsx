import { Sparkles } from "lucide-react";
import type { Section } from "@/types/section";
import { Card, CardContent } from "@/components/ui/card";

/** Feature — lưới các thẻ tính năng. */
export function FeatureSection({ section }: { section: Section }) {
  const heading = section.heading ?? section.title;
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        <p className="mt-3 text-muted-foreground">{section.content}</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(section.features ?? []).map((feature, i) => (
          <Card key={i} className="border-muted transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
