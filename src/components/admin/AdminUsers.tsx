"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, type AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminUsers({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Owner" | "Editor">("Editor");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const canCreate = useMemo(() => {
    return name.trim() && email.trim() && password.trim().length >= 8;
  }, [name, email, password]);

  async function refresh() {
    try {
      const list = await api.getUsers();
      setUsers(list);
    } catch {
      toast.error("Unable to load users.");
    }
  }

  async function handleCreate() {
    if (!canCreate) return;
    setLoading(true);
    try {
      const created = await api.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        password: password.trim(),
      });
      setUsers((prev) => [created, ...prev]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Editor");
      toast.success("User created.");
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to create user.");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, payload: Partial<AdminUser> & { password?: string }) {
    try {
      const updated = await api.updateUser(id, payload);
      setUsers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success("User updated.");
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to update user.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass space-y-4 p-5">
        <div>
          <h2 className="text-sm font-semibold">Invite team member</h2>
          <p className="text-xs text-muted-foreground">
            Create a login for a new teammate. Password can be changed later.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            placeholder="Temp password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select value={role} onValueChange={(value) => setRole(value as "Owner" | "Editor")}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner">Owner</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Minimum 8 characters for password.</p>
          <Button onClick={handleCreate} disabled={!canCreate || loading}>
            {loading ? "Creating..." : "Create user"}
          </Button>
        </div>
      </Card>

      {users.length === 0 ? (
        <EmptyState title="No users yet" description="Invite your first team member." />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUser(user.id, { role: value as "Owner" | "Editor" })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "secondary" : "outline"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
