export type Role = "owner" | "editor";

export type Permission =
  | "contacts:create"
  | "contacts:edit"
  | "contacts:archive"
  | "contacts:restore"
  | "contacts:delete"
  | "projects:create"
  | "projects:edit"
  | "projects:archive"
  | "projects:restore"
  | "projects:delete"
  | "milestones:update"
  | "crm:move_stage"
  | "invoices:create"
  | "invoices:edit_draft"
  | "invoices:view_basic"
  | "invoices:view_amounts"
  | "invoices:archive"
  | "invoices:restore"
  | "invoices:mark_paid"
  | "invoices:delete"
  | "followups:update"
  | "finance:view_sensitive"
  | "system:reset"
  | "users:manage";

const allPermissions: Permission[] = [
  "contacts:create",
  "contacts:edit",
  "contacts:archive",
  "contacts:restore",
  "contacts:delete",
  "projects:create",
  "projects:edit",
  "projects:archive",
  "projects:restore",
  "projects:delete",
  "milestones:update",
  "crm:move_stage",
  "invoices:create",
  "invoices:edit_draft",
  "invoices:view_basic",
  "invoices:view_amounts",
  "invoices:archive",
  "invoices:restore",
  "invoices:mark_paid",
  "invoices:delete",
  "followups:update",
  "finance:view_sensitive",
  "system:reset",
  "users:manage",
];

export const rolePermissions: Record<Role, Permission[]> = {
  owner: allPermissions,
  editor: [
    "contacts:create",
    "contacts:edit",
    "contacts:archive",
    "contacts:restore",
    "projects:create",
    "projects:edit",
    "projects:archive",
    "projects:restore",
    "milestones:update",
    "crm:move_stage",
    "invoices:create",
    "invoices:edit_draft",
    "invoices:view_basic",
    "invoices:archive",
    "invoices:restore",
    "followups:update",
  ],
};

export function hasPermission(role: Role, permission: Permission) {
  if (role === "owner") return true;
  return rolePermissions[role].includes(permission);
}

export function isRole(value: string | undefined | null): value is Role {
  return value === "owner" || value === "editor";
}

export function getRole(req: Request): Role {
  const role = req.headers.get("x-user-role")?.toLowerCase();
  return role === "owner" ? "owner" : "editor";
}

export function sanitizeInvoiceForRole<T extends Record<string, unknown>>(invoice: T, role: Role) {
  if (role === "owner") return invoice;
  const {
    amount,
    currency,
    paidDate,
    lineItems,
    payments,
    ...rest
  } = invoice;
  return rest;
}

export function assertCanWriteInvoiceFields(payload: Record<string, unknown>, role: Role) {
  if (role === "owner") return;
  const blocked = ["amount", "currency", "paidDate", "lineItems", "payments", "status"];
  const hasBlocked = blocked.some((field) => field in payload);
  if (hasBlocked) {
    throw new Error("Editor cannot modify finance fields.");
  }
}

export function sanitizeProjectForRole<T extends Record<string, unknown>>(project: T, role: Role) {
  if (role === "owner") return project;
  const { budgetAmount, currency, ...rest } = project;
  return rest;
}

export function assertCanWriteProjectFinanceFields(payload: Record<string, unknown>, role: Role) {
  if (role === "owner") return;
  const blocked = ["budgetAmount", "currency", "budget"];
  const hasBlocked = blocked.some((field) => field in payload);
  if (hasBlocked) {
    throw new Error("Editor cannot modify budget fields.");
  }
}
