import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireSession, getActiveWorkspaceCookieName } from "@/lib/auth";
import { WorkspaceModel } from "@/lib/models/workspace";
import { WorkspaceMembershipModel } from "@/lib/models/workspaceMembership";
import { TeamInviteModel } from "@/lib/models/teamInvite";
import { UserModel } from "@/lib/models/user";

function isOwnerRole(value: string | undefined | null) {
  return value === "owner" || value === "Owner";
}

async function canManageWorkspace(session: { userId: string; workspaceId: string; role: string }, workspaceId: string) {
  if (session.workspaceId === workspaceId && session.role === "owner") {
    return true;
  }

  const membership = await WorkspaceMembershipModel.findOne({
    userId: session.userId,
    workspaceId,
    isActive: true,
  }).lean();

  return Boolean(membership && isOwnerRole(String(membership.role)));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : undefined;

  if (!name && typeof logoUrl === "undefined") {
    return NextResponse.json({ success: false, error: "No changes provided." }, { status: 400 });
  }

  if (name && name.length < 2) {
    return NextResponse.json(
      { success: false, error: "Workspace name must be at least 2 characters." },
      { status: 400 },
    );
  }

  if (typeof logoUrl !== "undefined" && logoUrl.length > 0 && !logoUrl.startsWith("/uploads/")) {
    return NextResponse.json(
      { success: false, error: "Team logo must be an uploaded file URL." },
      { status: 400 },
    );
  }

  await dbConnect();

  const canManage = await canManageWorkspace(session, params.id);
  if (!canManage) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const setPayload: Record<string, unknown> = {};
  if (name) setPayload.name = name;
  if (typeof logoUrl !== "undefined") setPayload.logoUrl = logoUrl;

  const updated = await WorkspaceModel.findOneAndUpdate(
    { _id: params.id, isActive: true },
    { $set: setPayload },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ success: false, error: "Workspace not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: String(updated._id),
      name: updated.name,
      logoUrl: updated.logoUrl ?? "",
    },
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await UserModel.findById(session.userId).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const canManage = await canManageWorkspace(session, params.id);
  if (!canManage) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  if (String(user.workspaceId) === params.id) {
    return NextResponse.json(
      { success: false, error: "You cannot delete your personal workspace." },
      { status: 400 },
    );
  }

  const workspace = await WorkspaceModel.findOne({ _id: params.id, isActive: true }).lean();
  if (!workspace) {
    return NextResponse.json({ success: false, error: "Workspace not found." }, { status: 404 });
  }

  const directUsersCount = await UserModel.countDocuments({ workspaceId: params.id, isActive: true });
  if (directUsersCount > 0) {
    return NextResponse.json(
      { success: false, error: "Workspace has primary users. Move users before deleting." },
      { status: 400 },
    );
  }

  await WorkspaceModel.updateOne({ _id: params.id }, { $set: { isActive: false } });
  await WorkspaceMembershipModel.updateMany(
    { workspaceId: params.id },
    { $set: { isActive: false } },
  );
  await TeamInviteModel.updateMany(
    { workspaceId: params.id, status: "pending" },
    { $set: { status: "revoked" } },
  );

  const switchedWorkspaceId = String(user.workspaceId);
  const response = NextResponse.json({
    success: true,
    data: { id: params.id, switchedWorkspaceId },
  });

  response.cookies.set(await getActiveWorkspaceCookieName(), switchedWorkspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
