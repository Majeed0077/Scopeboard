"use client";

import { useParams } from "next/navigation";
import { ContactDetail } from "@/components/contacts/ContactDetail";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useLocalData } from "@/lib/localDataStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const params = useParams<{ id: string }>();
  const { contacts, projects, invoices } = useLocalData();
  const contact = contacts.find((item) => item.id === params.id);

  if (!contact) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Contacts", href: "/contacts" }, { label: "Not found" }]} />
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Contact not found.
        </div>
        <Button asChild variant="outline">
          <Link href="/contacts">Back to contacts</Link>
        </Button>
      </div>
    );
  }

  const contactProjects = projects.filter((project) => project.contactId === contact.id);
  const contactInvoices = invoices.filter((invoice) => invoice.contactId === contact.id);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Contacts", href: "/contacts" },
          { label: contact.name },
        ]}
      />
      <ContactDetail
        contact={contact}
        projects={contactProjects}
        invoices={contactInvoices}
      />
    </div>
  );
}
