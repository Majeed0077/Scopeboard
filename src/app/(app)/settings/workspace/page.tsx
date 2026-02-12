import { apiFetch } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";
import { AdminUsers } from "@/components/admin/AdminUsers";
import type { AdminInvite, AdminUser, WorkspaceInfo } from "@/lib/api";
import { redirect } from "next/navigation";

async function getUsers() {
  try {
    const data = await apiFetch<{ success: boolean; data: AdminUser[] }>("/api/admin/users");
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getInvites() {
  try {
    const data = await apiFetch<{ success: boolean; data: AdminInvite[] }>("/api/admin/invites");
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getActiveWorkspace() {
  try {
    const data = await apiFetch<{ success: boolean; data: WorkspaceInfo[] }>("/api/workspaces");
    const items = data.data ?? [];
    const active = items.find((item) => item.isActive);
    return active ?? null;
  } catch {
    return null;
  }
}

export default async function WorkspaceSettingsPage() {
  const [users, invites, user, activeWorkspace] = await Promise.all([
    getUsers(),
    getInvites(),
    getCurrentUser(),
    getActiveWorkspace(),
  ]);

  if (!user) {
    redirect("/signin");
  }

  const canManage = user.role === "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">Manage team profile, invites, and member access.</p>
      </div>
      <AdminUsers
        initialUsers={users}
        initialInvites={invites}
        canManage={canManage}
        activeWorkspaceId={activeWorkspace?.id ?? ""}
        initialWorkspaceName={activeWorkspace?.name ?? "My Workspace"}
        initialWorkspaceLogo={activeWorkspace?.logoUrl ?? ""}
        activeWorkspaceIsPersonal={Boolean(activeWorkspace?.isPersonal)}
      />
    </div>
  );
}
