import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { AuditModel } from "@/lib/models/audit";
import { requireRole, requireSession } from "@/lib/auth";
import { adminUserCreateSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";

export async function GET(req: Request) {
  try {
    await requireRole(req, "Owner");
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  await dbConnect();
  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  const data = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession(req);
    if (session.role !== "owner") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = adminUserCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const exists = await UserModel.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (exists) {
    return NextResponse.json({ success: false, error: "Email already exists." }, { status: 409 });
  }
  const passwordHash = await hashPassword(parsed.data.password);
  const created = await UserModel.create({
    email: parsed.data.email.toLowerCase(),
    name: parsed.data.name,
    role: parsed.data.role,
    passwordHash,
    isActive: true,
  });
  await AuditModel.create({
    _id: `aud-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    action: "User created",
    entityType: "user",
    entityId: String(created._id),
    meta: created.email,
  });
  return NextResponse.json({
    success: true,
    data: {
      id: created._id,
      name: created.name,
      email: created.email,
      role: created.role,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    },
  });
}
