import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ContactModel } from "@/lib/models/contact";
import { ProjectModel } from "@/lib/models/project";
import { InvoiceModel } from "@/lib/models/invoice";
import { requireSession } from "@/lib/auth";
import { sanitizeInvoiceForRole } from "@/lib/rbac";

export async function GET(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({
      success: true,
      data: { contacts: [], projects: [], invoices: [] },
    });
  }
  await dbConnect();
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [contacts, projects, invoices] = await Promise.all([
    ContactModel.find({ $or: [{ name: regex }, { company: regex }] }).limit(20).lean(),
    ProjectModel.find({ $or: [{ title: regex }, { clientName: regex }] }).limit(20).lean(),
    InvoiceModel.find({ invoiceNo: regex }).limit(20).lean(),
  ]);
  const sanitizedInvoices = invoices.map((item) =>
    sanitizeInvoiceForRole({ id: item._id, ...item }, session.role),
  );
  return NextResponse.json({
    success: true,
    data: {
      contacts: contacts.map((item) => ({ id: item._id, ...item })),
      projects: projects.map((item) => ({ id: item._id, ...item })),
      invoices: sanitizedInvoices,
    },
  });
}
