import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/invoice";
import { invoiceCreateSchema } from "@/lib/validation";
import { assertCanWriteInvoiceFields, sanitizeInvoiceForRole } from "@/lib/rbac";
import { requireSession } from "@/lib/auth";

function serialize(doc: any) {
  const obj = doc.toObject();
  const { _id, __v, ...rest } = obj;
  return { id: _id, ...rest };
}

export async function GET(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const invoices = await InvoiceModel.find().lean();
  const data = invoices.map((item) =>
    sanitizeInvoiceForRole({ id: item._id, ...item }, session.role),
  );
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
  const parsed = invoiceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    assertCanWriteInvoiceFields(parsed.data as Record<string, unknown>, session.role);
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
  const id = `i-${crypto.randomUUID().slice(0, 8)}`;
  const created = await InvoiceModel.create({ _id: id, ...parsed.data });
  const serialized = serialize(created);
  return NextResponse.json({
    success: true,
    data: sanitizeInvoiceForRole(serialized, session.role),
  });
}
