import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ContactModel } from "@/lib/models/contact";
import { contactUpdateSchema } from "@/lib/validation";
import { requireRole, requireSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function serialize(doc: any) {
  const obj = doc.toObject();
  const { _id, __v, ...rest } = obj;
  return { id: _id, ...rest };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const contact = await ContactModel.findById(params.id);
  if (!contact) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: serialize(contact) });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();
  const parsed = contactUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const updated = await ContactModel.findByIdAndUpdate(params.id, parsed.data, { new: true });
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  await logAuditEvent({
    actorId: session.userId,
    actorRole: session.role,
    actorEmail: session.email,
    action: "contacts.update",
    entityType: "contact",
    entityId: params.id,
  });
  return NextResponse.json({ success: true, data: serialize(updated) });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireRole(req, "Owner");
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  await dbConnect();
  const deleted = await ContactModel.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  await logAuditEvent({
    actorId: "system",
    actorRole: "owner",
    action: "contacts.delete",
    entityType: "contact",
    entityId: params.id,
  });
  return NextResponse.json({ success: true, data: { id: params.id } });
}
