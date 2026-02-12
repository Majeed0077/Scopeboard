import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/models/user";
import { requireSession } from "@/lib/auth";
import { userProfileUpdateSchema } from "@/lib/validation";

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
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.toLowerCase?.() === "owner" ? "owner" : "editor",
      avatarUrl: user.avatarUrl ?? "",
      timezone: user.timezone ?? "UTC",
      language: user.language ?? "en",
      defaultLandingPage: user.defaultLandingPage ?? "today",
      compactMode: Boolean(user.compactMode),
      keyboardShortcuts: user.keyboardShortcuts !== false,
      signature: user.signature ?? "",
      notificationPrefs: {
        inviteEmail: user.notificationPrefs?.inviteEmail !== false,
        inviteInApp: user.notificationPrefs?.inviteInApp !== false,
        taskDueEmail: user.notificationPrefs?.taskDueEmail !== false,
        taskDueInApp: user.notificationPrefs?.taskDueInApp !== false,
        mentionEmail: user.notificationPrefs?.mentionEmail !== false,
        mentionInApp: user.notificationPrefs?.mentionInApp !== false,
        invoiceEmail: user.notificationPrefs?.invoiceEmail !== false,
        invoiceInApp: user.notificationPrefs?.invoiceInApp !== false,
      },
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

export async function PATCH(req: Request) {
  let session;
  try {
    session = await requireSession(req);
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = userProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const updated = await UserModel.findByIdAndUpdate(
    session.userId,
    {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl } : {}),
      ...(parsed.data.timezone !== undefined ? { timezone: parsed.data.timezone } : {}),
      ...(parsed.data.language !== undefined ? { language: parsed.data.language } : {}),
      ...(parsed.data.defaultLandingPage !== undefined ? { defaultLandingPage: parsed.data.defaultLandingPage } : {}),
      ...(parsed.data.compactMode !== undefined ? { compactMode: parsed.data.compactMode } : {}),
      ...(parsed.data.keyboardShortcuts !== undefined ? { keyboardShortcuts: parsed.data.keyboardShortcuts } : {}),
      ...(parsed.data.signature !== undefined ? { signature: parsed.data.signature } : {}),
      ...(parsed.data.notificationPrefs !== undefined
        ? {
            notificationPrefs: {
              inviteEmail: parsed.data.notificationPrefs.inviteEmail ?? true,
              inviteInApp: parsed.data.notificationPrefs.inviteInApp ?? true,
              taskDueEmail: parsed.data.notificationPrefs.taskDueEmail ?? true,
              taskDueInApp: parsed.data.notificationPrefs.taskDueInApp ?? true,
              mentionEmail: parsed.data.notificationPrefs.mentionEmail ?? true,
              mentionInApp: parsed.data.notificationPrefs.mentionInApp ?? true,
              invoiceEmail: parsed.data.notificationPrefs.invoiceEmail ?? true,
              invoiceInApp: parsed.data.notificationPrefs.invoiceInApp ?? true,
            },
          }
        : {}),
    },
    { new: true },
  ).lean();
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role?.toLowerCase?.() === "owner" ? "owner" : "editor",
      avatarUrl: updated.avatarUrl ?? "",
      timezone: updated.timezone ?? "UTC",
      language: updated.language ?? "en",
      defaultLandingPage: updated.defaultLandingPage ?? "today",
      compactMode: Boolean(updated.compactMode),
      keyboardShortcuts: updated.keyboardShortcuts !== false,
      signature: updated.signature ?? "",
      notificationPrefs: {
        inviteEmail: updated.notificationPrefs?.inviteEmail !== false,
        inviteInApp: updated.notificationPrefs?.inviteInApp !== false,
        taskDueEmail: updated.notificationPrefs?.taskDueEmail !== false,
        taskDueInApp: updated.notificationPrefs?.taskDueInApp !== false,
        mentionEmail: updated.notificationPrefs?.mentionEmail !== false,
        mentionInApp: updated.notificationPrefs?.mentionInApp !== false,
        invoiceEmail: updated.notificationPrefs?.invoiceEmail !== false,
        invoiceInApp: updated.notificationPrefs?.invoiceInApp !== false,
      },
      lastLoginAt: updated.lastLoginAt ?? null,
      updatedAt: updated.updatedAt,
    },
  });
}
