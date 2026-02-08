export type ContactStage =
  | "new"
  | "contacted"
  | "meeting"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type ContactSource =
  | "upwork"
  | "linkedin"
  | "referral"
  | "website"
  | "local"
  | "partner"
  | "event"
  | "other";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export type MilestoneStatus = "pending" | "in_progress" | "blocked" | "done" | "waiting_client";

export type InvoiceStatus = "unpaid" | "overdue" | "paid";

export type ContactNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  source: ContactSource;
  sourceLabel?: string;
  stage: ContactStage;
  nextFollowUpAt: string;
  followUpCadence?: "none" | "weekly" | "monthly" | "custom";
  followUpIntervalDays?: number;
  tags: string[];
  notes: ContactNote[];
  archived: boolean;
};

export type Project = {
  id: string;
  contactId?: string;
  clientName?: string;
  title: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  budgetAmount: number;
  currency: string;
  notes?: string;
  attachments?: {
    id?: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  links: string[];
  archived: boolean;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  status: MilestoneStatus;
  dueDate: string;
  amount: number;
  currency: string;
  order: number;
};

export type InvoiceLineItem = {
  title: string;
  qty: number;
  rate: number;
};

export type InvoicePayment = {
  amount: number;
  method: string;
  paidAt: string;
  note?: string;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  contactId: string;
  projectId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
  archived: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "editor";
  active: boolean;
};

export type Activity = {
  id: string;
  entityType: "contact" | "project" | "invoice" | "milestone";
  entityId: string;
  action: string;
  meta?: string;
  createdAt: string;
};

export type AdminSettings = {
  orgName: string;
  timezone: string;
  logoUrl?: string;
  updatedAt?: string;
};
