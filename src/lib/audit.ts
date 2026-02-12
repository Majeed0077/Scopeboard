import { dbConnect } from "@/lib/db";
import { AuditModel } from "@/lib/models/audit";
import type { Role } from "@/lib/rbac";

export async function logAuditEvent(params: {
  workspaceId?: string;
  actorId?: string;
  actorRole?: Role | string;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: string;
}) {
  await dbConnect();
  const id = `aud-${crypto.randomUUID().slice(0, 8)}`;
  await AuditModel.create({
    _id: id,
    workspaceId: params.workspaceId ?? "default",
    createdAt: new Date().toISOString(),
    ...params,
  });
}
