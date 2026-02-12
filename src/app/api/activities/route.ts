import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ActivityModel } from "@/lib/models/activity";
import { activityCreateSchema } from "@/lib/validation";
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
  const activities = await ActivityModel.find({ workspaceId: session.workspaceId })
    .sort({ createdAt: -1 })
    .lean();
  const data = activities.map((item) => ({ id: item._id, ...item }));
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
  const parsed = activityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const id = `a-${crypto.randomUUID().slice(0, 8)}`;
  const created = await ActivityModel.create({
    _id: id,
    workspaceId: session.workspaceId,
    ...parsed.data,
  });

  return NextResponse.json({ success: true, data: serialize(created) });
}
