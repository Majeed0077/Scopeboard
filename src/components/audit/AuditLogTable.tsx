"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AuditEvent = {
  id: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: string;
  createdAt: string;
};

const entityOptions = [
  { value: "all", label: "All entities" },
  { value: "contact", label: "Contacts" },
  { value: "project", label: "Projects" },
  { value: "invoice", label: "Invoices" },
  { value: "milestone", label: "Milestones" },
  { value: "system", label: "System" },
];

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
];

export function AuditLogTable({ items }: { items: AuditEvent[] }) {
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("all");
  const [role, setRole] = useState("all");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (entity !== "all" && item.entityType !== entity) return false;
      if (role !== "all" && item.actorRole !== role) return false;
      if (!term) return true;
      return (
        item.action.toLowerCase().includes(term) ||
        (item.meta ?? "").toLowerCase().includes(term) ||
        (item.actorEmail ?? "").toLowerCase().includes(term) ||
        (item.entityId ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, query, entity, role]);

  return (
    <div className="space-y-4">
      <Card className="glass flex flex-wrap items-center gap-3 px-4 py-3">
        <Input
          className="h-9 w-[240px]"
          placeholder="Search actions, actors, entities..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            {entityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} results</span>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No audit events yet"
          description="Owner-only audit events will appear here."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.action}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{item.actorEmail ?? "System"}</span>
                      {item.actorRole ? (
                        <Badge variant="secondary" className="mt-1 w-fit">
                          {item.actorRole}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.entityType ?? "-"}
                    {item.entityId ? ` · ${item.entityId}` : ""}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.meta ?? "-"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
