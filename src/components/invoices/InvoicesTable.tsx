"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Contact, Invoice, InvoiceStatus, Project } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceStatusBadge } from "@/components/common/StatusBadge";
import { formatMoney, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { Can } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";

const statusOptions: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "unpaid", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

export function InvoicesTable({
  invoices,
  contacts,
  projects,
  initialFilter,
  initialStatus,
  isOwner,
}: {
  invoices: Invoice[];
  contacts: Contact[];
  projects: Project[];
  initialFilter?: string;
  initialStatus?: InvoiceStatus | "all";
  isOwner: boolean;
}) {
  const [status, setStatus] = useState<InvoiceStatus | "all">(
    initialStatus ?? "all",
  );
  const [visibility, setVisibility] = useState<"active" | "archived">("active");

  const filtered = useMemo(() => {
    const base =
      status === "all" ? invoices : invoices.filter((invoice) => invoice.status === status);
    const byVisibility =
      visibility === "archived"
        ? base.filter((invoice) => invoice.archived)
        : base.filter((invoice) => !invoice.archived);
    if (initialFilter === "thisMonthPaid") {
      const now = new Date();
      return byVisibility.filter((invoice) =>
        invoice.payments.some((payment) => {
          const paid = new Date(payment.paidAt);
          return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
        }),
      );
    }
    return byVisibility;
  }, [invoices, status, initialFilter, visibility]);

  const totals = useMemo(() => {
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
    return { unpaid, overdue };
  }, [invoices, isOwner]);

  return (
    <div className="space-y-4">
      <div className="glass flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
        <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Can permission="invoices:delete">
          <Select
            value={visibility}
            onValueChange={(value) => setVisibility(value as "active" | "archived")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Can>
      </div>

      {isOwner && totals ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Total unpaid{" "}
            <span className="font-semibold text-foreground">
              {formatMoney(totals.unpaid, "USD")}
            </span>
          </span>
          <span>
            Total overdue{" "}
            <span className="font-semibold text-foreground">
              {formatMoney(totals.overdue, "USD")}
            </span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Amounts are hidden for Editors.
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create an invoice to track receivables and payments."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                {isOwner && <TableHead className="text-right">Amount</TableHead>}
                {isOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invoice) => {
                const contact = contacts.find((item) => item.id === invoice.contactId);
                const project = projects.find((item) => item.id === invoice.projectId);
                const total = isOwner
                  ? invoice.lineItems.reduce((acc, item) => acc + item.qty * item.rate, 0)
                  : 0;
                return (
                  <TableRow
                    key={invoice.id}
                    className={`hover:bg-muted/40 ${
                      invoice.status === "overdue" ? "border-l-4 border-rose-400" : ""
                    }`}
                  >
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium">
                        {invoice.invoiceNo}
                      </Link>
                    </TableCell>
                    <TableCell>{contact?.company ?? "—"}</TableCell>
                    <TableCell>{project?.title ?? "—"}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {formatMoney(total, invoice.currency)}
                    </TableCell>
                  )}
                  {isOwner && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          window.open(`/invoices/${invoice.id}?export=pdf`, "_blank");
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
