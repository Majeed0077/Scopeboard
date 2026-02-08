import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { hashPassword } from "@/lib/password";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const email = parsed.data.email.toLowerCase();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { success: false, error: "Email already in use." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const created = await UserModel.create({
    email,
    name: parsed.data.name,
    role: "Editor",
    passwordHash,
    isActive: true,
  });

  const sessionToken = await createSessionToken({
    userId: String(created._id),
    role: "editor",
    email: created.email,
    name: created.name,
  });

  const response = NextResponse.json({
    success: true,
    data: {
      id: created._id,
      name: created.name,
      email: created.email,
      role: "editor",
    },
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
