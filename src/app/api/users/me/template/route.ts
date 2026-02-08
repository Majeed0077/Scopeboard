import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { requireSession } from "@/lib/auth";

export async function GET(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const user = await UserModel.findById(session.userId).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: {
      template: user.invoiceEmailTemplate ?? "",
    },
  });
}

export async function PUT(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (typeof body?.template !== "string") {
    return NextResponse.json({ success: false, error: "Invalid template" }, { status: 400 });
  }
  await dbConnect();
  const updated = await UserModel.findByIdAndUpdate(
    session.userId,
    { invoiceEmailTemplate: body.template },
    { new: true },
  ).lean();
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: { template: updated.invoiceEmailTemplate ?? "" },
  });
}
