"use client";

import * as React from "react";
import type { Contact, Invoice, Milestone, Project } from "@/types";
import { useRole } from "@/lib/useRole";
import { api } from "@/lib/api";

type LocalData = {
  contacts: Contact[];
  projects: Project[];
  milestones: Milestone[];
  invoices: Invoice[];
};

type LocalDataContextValue = LocalData & {
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
};

const LocalDataContext = React.createContext<LocalDataContextValue | null>(null);

export function LocalDataProvider({ children }: { children: React.ReactNode }) {
  const role = useRole();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [contactsData, projectsData, invoicesData, milestonesData] = await Promise.all([
          api.getContacts(),
          api.getProjects(),
          api.getInvoices(),
          api.getMilestones(),
        ]);
        if (!active) return;
        setContacts(contactsData ?? []);
        setProjects(projectsData ?? []);
        setInvoices(invoicesData ?? []);
        setMilestones(milestonesData ?? []);
      } catch {
        if (!active) return;
        setContacts([]);
        setProjects([]);
        setInvoices([]);
        setMilestones([]);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <LocalDataContext.Provider
      value={{ contacts, projects, milestones, invoices, setContacts, setProjects, setMilestones, setInvoices }}
    >
      {children}
    </LocalDataContext.Provider>
  );
}

export function useLocalData() {
  const ctx = React.useContext(LocalDataContext);
  if (!ctx) {
    throw new Error("useLocalData must be used within LocalDataProvider");
  }
  return ctx;
}
