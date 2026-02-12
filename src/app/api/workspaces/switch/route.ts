import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireSession, getActiveWorkspaceCookieName } from "@/lib/auth";
import { UserModel } from "@/lib/models/user";
import { WorkspaceMembershipModel } from "@/lib/models/workspaceMembership";

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  if (!workspaceId) {
    return NextResponse.json({ success: false, error: "workspaceId is required." }, { status: 400 });
  }

  await dbConnect();
  const user = await UserModel.findById(session.userId).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (workspaceId !== user.workspaceId) {
    const membership = await WorkspaceMembershipModel.findOne({
      userId: session.userId,
      workspaceId,
      isActive: true,
    }).lean();
    if (!membership) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  }

  const response = NextResponse.json({ success: true, data: { workspaceId } });
  response.cookies.set(await getActiveWorkspaceCookieName(), workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
