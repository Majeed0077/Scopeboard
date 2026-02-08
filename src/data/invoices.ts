import type { Invoice } from "@/types";

export const invoices: Invoice[] = [
  {
    id: "i-001",
    invoiceNo: "VF-2026-014",
    contactId: "c-005",
    projectId: "p-001",
    status: "paid",
    issueDate: "2026-01-16",
    dueDate: "2026-01-30",
    currency: "USD",
    archived: false,
    lineItems: [
      {
        title: "Discovery sprint",
        qty: 1,
        rate: 18000,
      },
    ],
    payments: [
      {
        amount: 18000,
        method: "wire",
        paidAt: "2026-01-27",
        note: "Received via HSBC",
      },
    ],
  },
  {
    id: "i-002",
    invoiceNo: "VF-2026-018",
    contactId: "c-003",
    projectId: "p-002",
    status: "overdue",
    issueDate: "2026-01-20",
    dueDate: "2026-02-03",
    currency: "USD",
    archived: false,
    lineItems: [
      {
        title: "Retainer month 1",
        qty: 1,
        rate: 18000,
      },
    ],
    payments: [],
  },
  {
    id: "i-003",
    invoiceNo: "VF-2026-021",
    contactId: "c-002",
    projectId: "p-004",
    status: "unpaid",
    issueDate: "2026-02-01",
    dueDate: "2026-02-15",
    currency: "USD",
    archived: true,
    lineItems: [
      {
        title: "Product discovery",
        qty: 1,
        rate: 24000,
      },
    ],
    payments: [],
  },
  {
    id: "i-004",
    invoiceNo: "VF-2026-025",
    contactId: "c-005",
    projectId: "p-001",
    status: "paid",
    issueDate: "2026-02-02",
    dueDate: "2026-02-16",
    currency: "USD",
    archived: false,
    lineItems: [
      {
        title: "MVP wireframes",
        qty: 1,
        rate: 24000,
      },
    ],
    payments: [
      {
        amount: 24000,
        method: "ach",
        paidAt: "2026-02-04",
        note: "Auto-processed",
      },
    ],
  },
];
