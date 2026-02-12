import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ActivityModel } from "@/lib/models/activity";
import { activityUpdateSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";

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
  const activity = await ActivityModel.findOne({ _id: params.id, workspaceId: session.workspaceId });
  if (!activity) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: serialize(activity) });
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
  const parsed = activityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await ActivityModel.findOneAndUpdate(
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
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const deleted = await ActivityModel.findOneAndDelete({ _id: params.id, workspaceId: session.workspaceId });
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: { id: params.id } });
}
