import Link from "next/link";
import { ArrowRight, ShieldCheck, Timer, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const statChips = [
  { label: "Lead to task capture", value: "< 20s" },
  { label: "Missed follow-ups", value: "-42%" },
  { label: "Status visibility", value: "Realtime" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-[8%] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-14 pt-16 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <Workflow className="h-3.5 w-3.5" />
              Agency operations workspace
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
                Run leads, delivery, and invoices in one calm system.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                ScopeBoard replaces scattered docs and boards with one execution layer for your team.
                Capture instantly, assign clearly, and ship work without status chaos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button className="gap-2">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline">Sign in</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {statChips.map((item) => (
                <div key={item.label} className="rounded-xl border bg-card/80 p-3">
                  <p className="text-lg font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card/70 p-5 shadow-lg backdrop-blur">
            <div className="rounded-xl border bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Today command board</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    Live
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Role-safe
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border bg-background px-3 py-2 text-sm">
                  Follow up: Aether Capital - due today
                </div>
                <div className="rounded-lg border bg-background px-3 py-2 text-sm">
                  Milestone review: Vanta Labs - 3 tasks blocked
                </div>
                <div className="rounded-lg border bg-background px-3 py-2 text-sm">
                  Invoice draft pending: Studio North - $3,200
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">Open projects</p>
                <p className="mt-1 text-2xl font-semibold">14</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">Follow-ups due</p>
                <p className="mt-1 text-2xl font-semibold">9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

