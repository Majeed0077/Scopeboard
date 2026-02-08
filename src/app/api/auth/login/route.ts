import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const email = parsed.data.email.toLowerCase();
  const user = await UserModel.findOne({ email, isActive: true }).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
  }

  const match = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
  }

  const sessionToken = await createSessionToken({
    userId: String(user._id),
    role: user.role.toLowerCase() === "owner" ? "owner" : "editor",
    email: user.email,
    name: user.name,
  });

  const response = NextResponse.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() === "owner" ? "owner" : "editor",
    },
  });

  await logAuditEvent({
    actorId: String(user._id),
    actorRole: user.role,
    actorEmail: user.email,
    action: "auth.login",
    meta: `Login for ${user.email}`,
  });

  response.cookies.set(await getSessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
