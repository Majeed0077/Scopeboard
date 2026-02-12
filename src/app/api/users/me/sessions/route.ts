import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { requireSession, getActiveWorkspaceCookieName, getSessionCookieName } from "@/lib/auth";

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await UserModel.findById(session.userId);
  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  user.tokenVersion = (typeof user.tokenVersion === "number" ? user.tokenVersion : 0) + 1;
  await user.save();

  const response = NextResponse.json({ success: true, data: { loggedOutAll: true } });

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
