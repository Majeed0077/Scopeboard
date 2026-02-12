import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { dbConnect } from "@/lib/db";
import { TeamInviteModel } from "@/lib/models/teamInvite";
import { AuditModel } from "@/lib/models/audit";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession(req);
    if (session.role !== "owner") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const invite = await TeamInviteModel.findOneAndUpdate(
    { _id: params.id, workspaceId: session.workspaceId, status: "pending" },
    { $set: { status: "revoked" } },
    { new: true },
  ).lean();

  if (!invite) {
    return NextResponse.json({ success: false, error: "Invite not found." }, { status: 404 });
  }

  await AuditModel.create({
    _id: `aud-${randomUUID().slice(0, 8)}`,
    workspaceId: session.workspaceId,
    createdAt: new Date().toISOString(),
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    action: "Team invite revoked",
    entityType: "invite",
    entityId: String(invite._id),
    meta: invite.email,
  });

  return NextResponse.json({ success: true, data: { id: String(invite._id), status: "revoked" } });
}
