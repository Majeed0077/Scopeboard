import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { AuditModel } from "@/lib/models/audit";
import { requireSession } from "@/lib/auth";
import { adminUserUpdateSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";

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
  const body = await req.json();
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) {
    updates.passwordHash = await hashPassword(parsed.data.password);
    delete updates.password;
  }
  const updated = await UserModel.findByIdAndUpdate(params.id, updates, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  await AuditModel.create({
    _id: `aud-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    action: "User updated",
    entityType: "user",
    entityId: String(updated._id),
    meta: updated.email,
  });
  return NextResponse.json({
    success: true,
    data: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}
