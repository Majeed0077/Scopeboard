import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { hashPassword } from "@/lib/password";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  let authorized = false;
  try {
    await requireRole(req, "Owner");
    authorized = true;
  } catch {
    const seedSecret = req.headers.get("x-seed-secret");
    if (seedSecret && seedSecret === process.env.JWT_SECRET) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;
  const editorEmail = process.env.EDITOR_EMAIL;
  const editorPassword = process.env.EDITOR_PASSWORD;

  if (!ownerEmail || !ownerPassword || !editorEmail || !editorPassword) {
    return NextResponse.json(
      { success: false, error: "Missing seed env vars." },
      { status: 400 },
    );
  }

  await dbConnect();

  const ownerHash = await hashPassword(ownerPassword);
  const editorHash = await hashPassword(editorPassword);

  const owner = await UserModel.findOneAndUpdate(
    { email: ownerEmail.toLowerCase() },
    {
      email: ownerEmail.toLowerCase(),
      name: "Owner",
      role: "Owner",
      passwordHash: ownerHash,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const editor = await UserModel.findOneAndUpdate(
    { email: editorEmail.toLowerCase() },
    {
      email: editorEmail.toLowerCase(),
      name: "Editor",
      role: "Editor",
      passwordHash: editorHash,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({
    success: true,
    data: {
      owner: { id: owner._id, email: owner.email, role: owner.role },
      editor: { id: editor._id, email: editor.email, role: editor.role },
    },
  });
}
