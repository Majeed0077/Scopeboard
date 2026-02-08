"use client";

import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useLocalData } from "@/lib/localDataStore";

export function ContactsClient({ initialFilter }: { initialFilter?: string }) {
  const { contacts } = useLocalData();
  return <ContactsTable contacts={contacts} initialFilter={initialFilter} />;
}
