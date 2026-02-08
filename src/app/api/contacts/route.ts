import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ContactModel } from "@/lib/models/contact";
import { contactCreateSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function serialize(doc: any) {
  const obj = doc.toObject();
  const { _id, __v, ...rest } = obj;
  return { id: _id, ...rest };
}

export async function GET(req: Request) {
  try {
    await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const contacts = await ContactModel.find().lean();
  const data = contacts.map((item) => ({ id: item._id, ...item }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();
  const parsed = contactCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const id = `c-${crypto.randomUUID().slice(0, 8)}`;
  const created = await ContactModel.create({ _id: id, ...parsed.data });
  await logAuditEvent({
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    action: "contacts.create",
    entityType: "contact",
    entityId: id,
    meta: created.name,
  });
  return NextResponse.json({ success: true, data: serialize(created) });
}
