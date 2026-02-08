import type {
  ContactSource,
  ContactStage,
  InvoiceStatus,
  MilestoneStatus,
  ProjectStatus,
} from "@/types";

export const stageLabel: Record<ContactStage, string> = {
  new: "New",
  contacted: "Contacted",
  meeting: "Meeting",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

export const milestoneStatusLabel: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
  waiting_client: "Waiting on Client",
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  overdue: "Overdue",
  paid: "Paid",
};

export const sourceLabel: Record<ContactSource, string> = {
  upwork: "Upwork",
  linkedin: "LinkedIn",
  referral: "Referral",
  website: "Website",
  local: "Local",
  partner: "Partner",
  event: "Event",
  other: "Other",
};

export const stageVariant: Record<
  ContactStage,
  "secondary" | "info" | "warning" | "success" | "danger" | "muted"
> = {
  new: "info",
  contacted: "secondary",
  meeting: "warning",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

export const projectVariant: Record<
  ProjectStatus,
  "secondary" | "warning" | "success" | "muted"
> = {
  planning: "secondary",
  active: "success",
  on_hold: "warning",
  completed: "muted",
};

export const milestoneVariant: Record<
  MilestoneStatus,
  "secondary" | "warning" | "success" | "danger"
> = {
  pending: "secondary",
  in_progress: "warning",
  blocked: "danger",
  done: "success",
  waiting_client: "warning",
};

export const invoiceVariant: Record<
  InvoiceStatus,
  "secondary" | "warning" | "success"
> = {
  unpaid: "secondary",
  overdue: "warning",
  paid: "success",
};

export const sourceVariant: Record<
  ContactSource,
  "secondary" | "info" | "success" | "muted"
> = {
  upwork: "info",
  linkedin: "secondary",
  referral: "success",
  website: "info",
  local: "muted",
  partner: "success",
  event: "muted",
  other: "muted",
};
