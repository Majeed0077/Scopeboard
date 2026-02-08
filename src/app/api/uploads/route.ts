import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files");

  if (!files.length) {
    return NextResponse.json({ success: false, error: "No files uploaded." }, { status: 400 });
  }

  const uploaded = files
    .filter((file): file is File => file instanceof File)
    .map((file) => {
      const safeName = file.name.replace(/\s+/g, "-");
      const url = `/uploads/mock/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
      return {
        id: `att-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        url,
        type: file.type || "application/octet-stream",
        size: file.size,
      };
    });

  return NextResponse.json({ success: true, data: uploaded });
}

export async function DELETE(req: Request) {
  try {
    await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const url = body?.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ success: false, error: "Missing url." }, { status: 400 });
  }

  // Mock delete: in real storage, delete object by URL or key here.
  return NextResponse.json({ success: true, data: { url } });
}
