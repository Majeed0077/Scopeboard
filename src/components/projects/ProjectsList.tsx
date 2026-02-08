"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectStatusBadge } from "@/components/common/StatusBadge";
import { formatMoney, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { Can } from "@/components/common/PermissionGate";

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export function ProjectsList({
  projects,
  budgetTierById,
  isOwner,
}: {
  projects: Project[];
  budgetTierById?: Record<string, "Low" | "Medium" | "High">;
  isOwner: boolean;
}) {
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [visibility, setVisibility] = useState<"active" | "archived">("active");

  const filtered = useMemo(() => {
    const byStatus = status === "all" ? projects : projects.filter((project) => project.status === status);
    return byStatus.filter((project) =>
      visibility === "archived" ? project.archived : !project.archived,
    );
  }, [projects, status, visibility]);

  return (
    <div className="space-y-4">
      <div className="glass flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
        <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Can permission="projects:delete">
          <Select
            value={visibility}
            onValueChange={(value) => setVisibility(value as "active" | "archived")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Can>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Start a project to track milestones and budgets."
          />
        ) : (
          filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-xl border bg-background p-5 shadow-sm transition hover:bg-muted/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{project.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(project.dueDate)}
                  </p>
                </div>
                <ProjectStatusBadge status={project.status} />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Budget{" "}
                {isOwner
                  ? formatMoney(project.budgetAmount, project.currency)
                  : budgetTierById?.[project.id] ?? "Hidden"}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
