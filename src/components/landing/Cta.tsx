import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl border bg-card/70 p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ScopeBoard</p>
            <h3 className="mt-2 text-2xl font-semibold md:text-3xl">
              Replace workflow chaos with one clear operating system.
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Start with your current team, import your active work, and move to a calmer execution flow this week.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button className="gap-2">
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

