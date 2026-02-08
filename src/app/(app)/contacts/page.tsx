import { ContactsClient } from "@/components/contacts/ContactsClient";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const initialFilter = searchParams?.filter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-sm text-muted-foreground">
          Keep the relationship history and next steps in one place.
        </p>
      </div>
      <ContactsClient initialFilter={initialFilter} />
    </div>
  );
}
