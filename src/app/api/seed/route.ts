import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ContactModel } from "@/lib/models/contact";
import { ProjectModel } from "@/lib/models/project";
import { InvoiceModel } from "@/lib/models/invoice";
import { ActivityModel } from "@/lib/models/activity";
import { contacts } from "@/data/contacts";
import { projects } from "@/data/projects";
import { invoices } from "@/data/invoices";

export async function POST(req: Request) {
  try {
    await requireRole(req, "Owner");
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  await Promise.all([
    ContactModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    InvoiceModel.deleteMany({}),
    ActivityModel.deleteMany({}),
  ]);

  await ContactModel.insertMany(contacts.map((item) => ({ _id: item.id, ...item })));
  await ProjectModel.insertMany(projects.map((item) => ({ _id: item.id, ...item })));
  await InvoiceModel.insertMany(invoices.map((item) => ({ _id: item.id, ...item })));

  return NextResponse.json({ success: true, data: { seeded: true } });
}
