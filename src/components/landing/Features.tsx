import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  Layers,
  Users,
  Zap,
  ShieldCheck,
  Handshake,
} from "lucide-react";

const features = [
  {
    title: "Today execution lane",
    description: "See what must move today across leads, milestones, and invoices.",
    icon: CalendarCheck,
    outcome: "No blind spots",
  },
  {
    title: "Pipeline to delivery",
    description: "Move from lead stage to active project without context switching.",
    icon: Layers,
    outcome: "Faster handoff",
  },
  {
    title: "Client memory",
    description: "Contacts, notes, files, and invoices stay linked for every account.",
    icon: Users,
    outcome: "Zero context loss",
  },
  {
    title: "Quick Add capture",
    description: "Add leads instantly with required follow-up so nothing slips.",
    icon: Zap,
    outcome: "More follow-through",
  },
  {
    title: "Permission-safe finance",
    description: "Owner-only totals, guarded actions, and role-aware visibility.",
    icon: ShieldCheck,
    outcome: "Safer ops",
  },
  {
    title: "Team collaboration",
    description: "Shared workspaces with clear roles, invites, and activity history.",
    icon: Handshake,
    outcome: "Aligned team",
  },
];

export function Features() {
  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Why teams switch</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Built for operators, not demo screenshots.</h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Every block is tuned for agency delivery speed, team accountability, and calmer day to day execution.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="group border bg-card/70 transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background/70">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-600 dark:text-cyan-400">
                  {feature.outcome}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

