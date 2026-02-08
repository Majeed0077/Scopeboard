import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  Layers,
  Users,
  Zap,
  ShieldCheck,
  Feather,
} from "lucide-react";

const features = [
  {
    title: "Today-first workflow",
    description: "Start each day with a prioritized list of follow-ups and milestones.",
    icon: CalendarCheck,
  },
  {
    title: "Pipeline clarity",
    description: "Move leads across stages with full context and next actions.",
    icon: Layers,
  },
  {
    title: "Client continuity",
    description: "Keep contacts, projects, notes, and invoices in one thread.",
    icon: Users,
  },
  {
    title: "Fast capture",
    description: "Quick Add enforces next follow-up so nothing slips.",
    icon: Zap,
  },
  {
    title: "Owner-only finance",
    description: "Sensitive totals and payments are protected by role.",
    icon: ShieldCheck,
  },
  {
    title: "Lightweight by design",
    description: "No clutter, just the essentials for agency execution.",
    icon: Feather,
  },
];

export function Features() {
  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-2xl font-semibold">Services & features</h2>
        <span className="text-sm text-muted-foreground">Built for daily execution</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="glass">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background/80">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
