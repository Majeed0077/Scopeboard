import { apiFetch } from "@/lib/apiClient";
import { AdminUsers } from "@/components/admin/AdminUsers";
import type { AdminUser } from "@/lib/api";

async function getUsers() {
  try {
    const data = await apiFetch<{ success: boolean; data: AdminUser[] }>(`/api/admin/users`);
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage access for Owners and Editors.
        </p>
      </div>
      <AdminUsers initialUsers={users} />
    </div>
  );
}
