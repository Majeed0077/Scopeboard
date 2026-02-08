"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { useLocalData } from "@/lib/localDataStore";
import { useRole } from "@/lib/useRole";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { parseISO, isSameMonth } from "date-fns";

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const filterParam = searchParams.get("filter") ?? undefined;
  const initialStatus =
    statusParam === "unpaid" || statusParam === "overdue" || statusParam === "paid"
      ? (statusParam as "unpaid" | "overdue" | "paid")
      : undefined;
  const { invoices, contacts, projects } = useLocalData();
  const role = useRole();
  const isOwner = role === "owner";
  const ownerSummary = useMemo(() => {
    if (!isOwner) return null;
    const unpaid = invoices
      .filter((invoice) => invoice.status === "unpaid")
      .reduce(
        (acc, invoice) =>
          acc + invoice.lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0),
        0,
      );
    const overdue = invoices
      .filter((invoice) => invoice.status === "overdue")
      .reduce(
        (acc, invoice) =>
          acc + invoice.lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0),
        0,
      );
    const thisMonthPaid = invoices
      .flatMap((invoice) => invoice.payments)
      .filter((payment) => isSameMonth(parseISO(payment.paidAt), new Date()))
      .reduce((acc, payment) => acc + payment.amount, 0);
    return { unpaid, overdue, thisMonthPaid };
  }, [invoices, isOwner]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Track billing status and incoming payments.
        </p>
      </div>
      {ownerSummary ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="glass p-4">
            <p className="text-xs text-muted-foreground">Total unpaid</p>
            <p className="text-lg font-semibold">{formatMoney(ownerSummary.unpaid, "USD")}</p>
          </Card>
          <Card className="glass p-4">
            <p className="text-xs text-muted-foreground">Total overdue</p>
            <p className="text-lg font-semibold">{formatMoney(ownerSummary.overdue, "USD")}</p>
          </Card>
          <Card className="glass p-4">
            <p className="text-xs text-muted-foreground">Paid this month</p>
            <p className="text-lg font-semibold">
              {formatMoney(ownerSummary.thisMonthPaid, "USD")}
            </p>
          </Card>
        </div>
      ) : null}
      <InvoicesTable
        invoices={invoices}
        contacts={contacts}
        projects={projects}
        initialStatus={initialStatus}
        initialFilter={filterParam}
        isOwner={isOwner}
      />
    </div>
  );
}
