"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useLocalData } from "@/lib/localDataStore";
import { useRole } from "@/lib/useRole";
import { Button } from "@/components/ui/button";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const { projects, milestones } = useLocalData();
  const role = useRole();
  const isOwner = role === "owner";
  const projectId = params?.id ?? "";
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Not found" }]} />
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Project not found.
        </div>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const projectMilestones = milestones.filter((item) => item.projectId === project.id);
  const budgetTier = !isOwner
    ? project.budgetAmount > 75000
      ? "High"
      : project.budgetAmount > 35000
        ? "Medium"
        : "Low"
    : undefined;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />
      <ProjectDetail
        project={project}
        milestones={projectMilestones}
        budgetTier={budgetTier}
        isOwner={isOwner}
      />
    </div>
  );
}
