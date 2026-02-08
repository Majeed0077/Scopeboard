import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Best for solo founders and small teams.",
    features: ["Up to 3 users", "Basic workflow", "Email support"],
  },
  {
    name: "Growth",
    price: "$79",
    description: "For growing agencies that need structure.",
    features: ["Unlimited users", "Advanced workflows", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated support and custom SLAs.",
    features: ["SSO", "Audit log export", "Dedicated success manager"],
  },
];

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          This is a stub for future billing and plan management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="text-3xl font-semibold">{plan.price}</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Button variant="outline">Contact sales</Button>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Want to enable billing?{" "}
          <Link href="/admin/settings" className="text-foreground underline">
            Configure billing settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
