"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Milestone, MilestoneStatus, Project, ProjectStatus } from "@/types";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestoneStatusBadge } from "@/components/common/StatusBadge";
import { hasPermission } from "@/lib/rbac";
import { useRole } from "@/lib/useRole";
import { DisableIfNoPermission, Can } from "@/components/common/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { useActivity } from "@/lib/activityStore";
import { useLocalData } from "@/lib/localDataStore";
import { FileImage, FileSpreadsheet, FileText } from "lucide-react";
import { api } from "@/lib/api";

const milestoneStatusOptions: { value: MilestoneStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "waiting_client", label: "Waiting on Client" },
  { value: "done", label: "Done" },
];

const projectStatusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

function parseLinks(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      try {
        new URL(line);
        return true;
      } catch {
        return false;
      }
    });
}

export function ProjectDetail({
  project,
  milestones,
  budgetTier,
  isOwner,
}: {
  project: Project;
  milestones: Milestone[];
  budgetTier?: "Low" | "Medium" | "High";
  isOwner: boolean;
}) {
  const [currentProject, setCurrentProject] = useState(project);
  const [items, setItems] = useState<Milestone[]>(milestones);
  const [drafts, setDrafts] = useState<
    { id: string; title: string; amount: number; currency: string }[]
  >([]);
  const [archived, setArchived] = useState(project.archived);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneCurrency, setMilestoneCurrency] = useState("USD");
  const [milestoneStatus, setMilestoneStatus] = useState<MilestoneStatus>("pending");

  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editStatus, setEditStatus] = useState<ProjectStatus>(project.status);
  const [editStartDate, setEditStartDate] = useState(project.startDate.slice(0, 10));
  const [editDueDate, setEditDueDate] = useState(project.dueDate.slice(0, 10));
  const [editBudgetAmount, setEditBudgetAmount] = useState(String(project.budgetAmount ?? 0));
  const [editCurrency, setEditCurrency] = useState(project.currency ?? "USD");
  const [editNotes, setEditNotes] = useState(project.notes ?? "");
  const [editLinksText, setEditLinksText] = useState((project.links ?? []).join("\n"));

  const role = useRole();
  const { addActivity } = useActivity();
  const { setProjects, setMilestones, setInvoices } = useLocalData();
  const canEditProject = hasPermission(role, "projects:edit");

  const projectLinks = currentProject.links ?? [];
  const visibleLinks = projectLinks.slice(0, 3);
  const remainingLinks = projectLinks.length - visibleLinks.length;

  useEffect(() => {
    setItems(milestones);
  }, [milestones]);

  useEffect(() => {
    setCurrentProject(project);
    setArchived(project.archived);
    setEditTitle(project.title);
    setEditStatus(project.status);
    setEditStartDate(project.startDate.slice(0, 10));
    setEditDueDate(project.dueDate.slice(0, 10));
    setEditBudgetAmount(String(project.budgetAmount ?? 0));
    setEditCurrency(project.currency ?? "USD");
    setEditNotes(project.notes ?? "");
    setEditLinksText((project.links ?? []).join("\n"));
    setIsEditing(false);
  }, [project]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => a.order - b.order);
  }, [items]);

  const formatLinkLabel = (value: string, index: number) => {
    try {
      const url = new URL(value);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return `Link ${index + 1}`;
    }
  };

  const formatAttachmentLabel = (value: string, index: number) => {
    if (!value) return `Attachment ${index + 1}`;
    try {
      const url = new URL(value);
      const last = url.pathname.split("/").filter(Boolean).pop();
      return last ? decodeURIComponent(last) : `Attachment ${index + 1}`;
    } catch {
      return `Attachment ${index + 1}`;
    }
  };

  const attachmentIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-3.5 w-3.5" />;
    if (type.includes("sheet") || type.includes("excel")) {
      return <FileSpreadsheet className="h-3.5 w-3.5" />;
    }
    return <FileText className="h-3.5 w-3.5" />;
  };

  async function saveProjectEdits() {
    if (!editTitle.trim()) {
      toast.error("Project title is required.");
      return;
    }

    const payload: Partial<Project> = {
      title: editTitle.trim(),
      status: editStatus,
      startDate: new Date(editStartDate || currentProject.startDate).toISOString(),
      dueDate: new Date(editDueDate || currentProject.dueDate).toISOString(),
      notes: editNotes.trim() || undefined,
      links: parseLinks(editLinksText),
    };

    if (isOwner) {
      payload.budgetAmount = Number(editBudgetAmount || 0);
      payload.currency = editCurrency;
    }

    setEditLoading(true);
    try {
      const updated = await api.updateProject(currentProject.id, payload);
      setCurrentProject(updated);
      setArchived(updated.archived);
      setProjects((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setIsEditing(false);
      toast.success("Project updated.");
      addActivity({
        entityType: "project",
        entityId: currentProject.id,
        action: "Project updated",
      });
    } catch {
      toast.error("Unable to update project.");
    } finally {
      setEditLoading(false);
    }
  }

  async function updateStatus(id: string, status: MilestoneStatus) {
    if (!hasPermission(role, "milestones:update")) {
      toast.error("Only the owner can do this.");
      return;
    }
    try {
      await api.updateMilestone(id, { status });
      setItems((prev) =>
        prev.map((milestone) =>
          milestone.id === id ? { ...milestone, status } : milestone,
        ),
      );
      setMilestones((prev) =>
        prev.map((milestone) =>
          milestone.id === id ? { ...milestone, status } : milestone,
        ),
      );
      toast.success("Milestone updated.");
      addActivity({
        entityType: "project",
        entityId: currentProject.id,
        action: "Milestone status updated",
        meta: `Milestone ${id} set to ${status.replace("_", " ")}`,
      });
    } catch {
      toast.error("Unable to update milestone.");
    }
  }

  async function createDraft(milestone: Milestone) {
    if (!hasPermission(role, "invoices:create")) {
      toast.error("Only the owner can do this.");
      return;
    }
    if (!currentProject.contactId) {
      toast.error("Add a client to this project before creating invoices.");
      return;
    }
    const invoiceNo = `VF-${new Date().getFullYear()}-${Math.random().toString(10).slice(2, 6)}`;
    try {
      const created = await api.createInvoice({
        invoiceNo,
        contactId: currentProject.contactId,
        projectId: currentProject.id,
        status: "unpaid",
        issueDate: new Date().toISOString(),
        dueDate: milestone.dueDate,
        lineItems: [],
        payments: [],
        archived: false,
      });
      setDrafts((prev) => [
        ...prev,
        {
          id: created.id,
          title: milestone.title,
          amount: milestone.amount,
          currency: milestone.currency,
        },
      ]);
      setInvoices((prev) => [created, ...prev]);
      toast.success("Invoice draft created.");
      addActivity({
        entityType: "project",
        entityId: currentProject.id,
        action: "Invoice draft created",
        meta: milestone.title,
      });
    } catch {
      toast.error("Unable to create invoice draft.");
    }
  }

  async function handleCreateMilestone() {
    if (!milestoneTitle.trim()) {
      toast.error("Milestone title is required.");
      return;
    }
    const nextOrder = items.length ? Math.max(...items.map((item) => item.order)) + 1 : 1;
    const payload: Partial<Milestone> = {
      projectId: currentProject.id,
      title: milestoneTitle.trim(),
      status: milestoneStatus,
      dueDate: milestoneDue ? new Date(milestoneDue).toISOString() : undefined,
      amount: milestoneAmount ? Number(milestoneAmount) : 0,
      currency: milestoneCurrency,
      order: nextOrder,
    };
    try {
      const created = await api.createMilestone(payload);
      setItems((prev) => [...prev, created]);
      setMilestones((prev) => [...prev, created]);
      toast.success("Milestone added.");
      addActivity({
        entityType: "project",
        entityId: currentProject.id,
        action: "Milestone created",
        meta: created.title,
      });
      setShowMilestoneForm(false);
      setMilestoneTitle("");
      setMilestoneDue("");
      setMilestoneAmount("");
      setMilestoneCurrency("USD");
      setMilestoneStatus("pending");
    } catch {
      toast.error("Unable to create milestone.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Project</p>
          <h1 className="text-2xl font-semibold">{currentProject.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Start {formatDate(currentProject.startDate)}</span>
            <span>-</span>
            <span>Due {formatDate(currentProject.dueDate)}</span>
            <span>-</span>
            <span>
              {isOwner
                ? formatMoney(currentProject.budgetAmount ?? 0, currentProject.currency ?? "USD")
                : budgetTier
                  ? `${budgetTier} budget`
                  : "Budget hidden"}
            </span>
            {archived ? (
              <>
                <span>-</span>
                <Badge variant="secondary">Archived</Badge>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DisableIfNoPermission permission="projects:edit">
            <Button variant="outline" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? "Cancel edit" : "Edit project"}
            </Button>
          </DisableIfNoPermission>
          <DisableIfNoPermission permission="projects:archive">
            <Button
              variant="outline"
              onClick={() => {
                const next = !archived;
                api
                  .updateProject(currentProject.id, { archived: next })
                  .then((updated) => {
                    setArchived(next);
                    setCurrentProject(updated);
                    setProjects((prev) =>
                      prev.map((item) =>
                        item.id === currentProject.id ? { ...item, archived: next } : item,
                      ),
                    );
                    toast.success(next ? "Archived." : "Restored.");
                    addActivity({
                      entityType: "project",
                      entityId: currentProject.id,
                      action: next ? "Project archived" : "Project restored",
                    });
                  })
                  .catch(() => toast.error("Unable to update project."));
              }}
            >
              {archived ? "Restore" : "Archive"}
            </Button>
          </DisableIfNoPermission>
          <Can permission="projects:delete">
            <Button
              variant="destructive"
              onClick={() => {
                api
                  .deleteProject(currentProject.id)
                  .then(() => {
                    setProjects((prev) => prev.filter((item) => item.id !== currentProject.id));
                    toast.success("Deleted.");
                  })
                  .catch(() => toast.error("Unable to delete project."));
              }}
            >
              Delete
            </Button>
          </Can>
        </div>
      </div>

      {isEditing ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Edit project</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={editStatus} onValueChange={(value) => setEditStatus(value as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Start date</label>
              <Input type="date" value={editStartDate} onChange={(event) => setEditStartDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Due date</label>
              <Input type="date" value={editDueDate} onChange={(event) => setEditDueDate(event.target.value)} />
            </div>
            {isOwner ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Budget amount</label>
                  <Input
                    type="number"
                    min={0}
                    value={editBudgetAmount}
                    onChange={(event) => setEditBudgetAmount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Currency</label>
                  <Input value={editCurrency} onChange={(event) => setEditCurrency(event.target.value.toUpperCase())} />
                </div>
              </>
            ) : null}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea rows={5} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Links (one URL per line)</label>
              <Textarea rows={4} value={editLinksText} onChange={(event) => setEditLinksText(event.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={saveProjectEdits} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold">Project details</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{currentProject.notes || "No description yet."}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {visibleLinks.length === 0 ? (
              <span>No links yet.</span>
            ) : (
              <>
                {visibleLinks.map((link, index) => (
                  <a
                    key={`${link}-${index}`}
                    className="rounded-full border px-3 py-1 hover:bg-muted/40"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatLinkLabel(link, index)}
                  </a>
                ))}
                {remainingLinks > 0 ? <span>+{remainingLinks} more</span> : null}
              </>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Attachments</p>
            {currentProject.attachments && currentProject.attachments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentProject.attachments.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-muted/40"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {attachmentIcon(item.type ?? "")}
                    {item.name || formatAttachmentLabel(item.url, index)}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">-</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Milestones</h2>
          <DisableIfNoPermission permission="milestones:update">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMilestoneForm((prev) => !prev)}
            >
              {showMilestoneForm ? "Cancel" : "Add milestone"}
            </Button>
          </DisableIfNoPermission>
        </div>
        {showMilestoneForm ? (
          <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Milestone title</label>
              <Input
                placeholder="e.g. First draft delivery"
                value={milestoneTitle}
                onChange={(event) => setMilestoneTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Due date</label>
              <Input
                type="date"
                value={milestoneDue}
                onChange={(event) => setMilestoneDue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={milestoneStatus}
                onValueChange={(value) => setMilestoneStatus(value as MilestoneStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {milestoneStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={milestoneAmount}
                onChange={(event) => setMilestoneAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <Input
                placeholder="USD"
                value={milestoneCurrency}
                onChange={(event) => setMilestoneCurrency(event.target.value.toUpperCase())}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleCreateMilestone}>Save milestone</Button>
            </div>
          </div>
        ) : null}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No milestones defined.
            </div>
          ) : (
            sorted.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{milestone.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(milestone.dueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <MilestoneStatusBadge status={milestone.status} />
                  <Select
                    value={milestone.status}
                    onValueChange={(value) =>
                      updateStatus(milestone.id, value as MilestoneStatus)
                    }
                    disabled={!hasPermission(role, "milestones:update")}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {milestoneStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DisableIfNoPermission permission="invoices:create">
                    <Button variant="outline" onClick={() => createDraft(milestone)}>
                      Create invoice draft
                    </Button>
                  </DisableIfNoPermission>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-sm font-semibold">Invoice Drafts</h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No drafts yet. Create one from a milestone.
          </p>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm"
            >
              <span>{draft.title}</span>
              <span className="text-muted-foreground">
                {formatMoney(draft.amount, draft.currency)}
              </span>
            </div>
          ))
        )}
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Activity</h2>
        <ActivityTimeline entityType="project" entityId={currentProject.id} />
      </div>
    </div>
  );
}
