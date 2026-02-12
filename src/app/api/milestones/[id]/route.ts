import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { MilestoneModel } from "@/lib/models/milestone";
import { milestoneUpdateSchema } from "@/lib/validation";
import { requireRole, requireSession } from "@/lib/auth";

function serialize(doc: any) {
  const obj = doc.toObject();
  const { _id, __v, ...rest } = obj;
  return { id: _id, ...rest };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const milestone = await MilestoneModel.findOne({ _id: params.id, workspaceId: session.workspaceId });
  if (!milestone) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serialize(milestone) });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const parsed = milestoneUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await MilestoneModel.findOneAndUpdate(
    { _id: params.id, workspaceId: session.workspaceId },
    parsed.data,
    { new: true },
  );
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serialize(updated) });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireRole(req, "Owner");
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const deleted = await MilestoneModel.findOneAndDelete({ _id: params.id, workspaceId: session.workspaceId });
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { id: params.id } });
}
