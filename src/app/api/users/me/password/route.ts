import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireSession, getActiveWorkspaceCookieName, getSessionCookieName } from "@/lib/auth";
import { userPasswordUpdateSchema } from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { UserModel } from "@/lib/models/user";

export async function PATCH(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = userPasswordUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();

  const user = await UserModel.findById(session.userId);
  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const isCurrentValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const isSamePassword = await verifyPassword(parsed.data.newPassword, user.passwordHash);
  if (isSamePassword) {
    return NextResponse.json(
      { success: false, error: "New password must be different from current password" },
      { status: 400 },
    );
  }

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  user.tokenVersion = (typeof user.tokenVersion === "number" ? user.tokenVersion : 0) + 1;
  await user.save();

  const response = NextResponse.json({
    success: true,
    data: {
      updated: true,
      updatedAt: user.updatedAt,
      forceLoggedOut: true,
    },
  });

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

  return response;
}
