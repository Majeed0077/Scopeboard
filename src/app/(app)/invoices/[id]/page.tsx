"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useLocalData } from "@/lib/localDataStore";
import { useRole } from "@/lib/useRole";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const autoExport = searchParams?.get("export") === "pdf";
  const { invoices, contacts, projects } = useLocalData();
  const role = useRole();
  const isOwner = role === "owner";
  const invoiceId = params?.id ?? "";
  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Invoices", href: "/invoices" }, { label: "Not found" }]} />
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Invoice not found.
        </div>
        <Button asChild variant="outline">
          <Link href="/invoices">Back to invoices</Link>
        </Button>
      </div>
    );
  }

  const contact = contacts.find((item) => item.id === invoice.contactId);
  const project = projects.find((item) => item.id === invoice.projectId);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: invoice.invoiceNo },
        ]}
      />
      <InvoiceDetail
        invoice={invoice}
        contact={contact}
        project={project}
        isOwner={isOwner}
        autoExportPdf={autoExport}
      />
    </div>
  );
}
