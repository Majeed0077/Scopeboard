import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AuditModel } from "@/lib/models/audit";
import { requireRole, requireSession } from "@/lib/auth";
import { auditCreateSchema } from "@/lib/validation";

function serialize(doc: any) {
  const obj = doc.toObject();
  const { _id, __v, ...rest } = obj;
  return { id: _id, ...rest };
}

export async function GET(req: Request) {
  try {
    await requireRole(req, "Owner");
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  await dbConnect();
  const items = await AuditModel.find().sort({ createdAt: -1 }).limit(200).lean();
  const data = items.map((item) => ({ id: item._id, ...item }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = auditCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const id = `aud-${crypto.randomUUID().slice(0, 8)}`;
  const created = await AuditModel.create({
    _id: id,
    createdAt: new Date().toISOString(),
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    ...parsed.data,
  });
  return NextResponse.json({ success: true, data: serialize(created) });
}
