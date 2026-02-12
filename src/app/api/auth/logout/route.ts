import { NextResponse } from "next/server";
import { getActiveWorkspaceCookieName, getSessionCookieName, getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  const response = NextResponse.json({ success: true });

  response.cookies.set(await getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  response.cookies.set(await getActiveWorkspaceCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  if (session) {
    await logAuditEvent({
      actorId: session.userId,
      actorRole: session.role,
      actorEmail: session.email,
      action: "auth.logout",
      meta: `Logout for ${session.email}`,
      workspaceId: session.workspaceId,
    });
  }
  return response;
}
