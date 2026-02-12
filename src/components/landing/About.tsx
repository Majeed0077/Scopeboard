const workflow = [
  {
    title: "Capture",
    description: "Lead enters with source, owner, and next follow-up in one move.",
  },
  {
    title: "Convert",
    description: "Pipeline handoff creates project context without duplicate entry.",
  },
  {
    title: "Deliver",
    description: "Milestones, files, and status updates stay attached to the same thread.",
  },
  {
    title: "Collect",
    description: "Invoices and payment tracking remain role-safe and visible when needed.",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <div className="rounded-3xl border bg-card/60 p-6 md:p-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              One operating loop from first message to final payment.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              ScopeBoard gives agencies a predictable system. No jumping between tools, no hidden ownership,
              and no mystery about what should happen next.
            </p>
          </div>

          <div className="space-y-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-xl border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-base font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

