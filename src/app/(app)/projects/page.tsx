"use client";

import { ProjectsList } from "@/components/projects/ProjectsList";
import { useLocalData } from "@/lib/localDataStore";
import { useRole } from "@/lib/useRole";

export default function ProjectsPage() {
  const { projects } = useLocalData();
  const role = useRole();
  const isOwner = role === "owner";
  const budgetTierById = isOwner ? undefined : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects & Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Track delivery timelines, milestones, and pipeline movement in one place.
        </p>
      </div>
      <ProjectsList projects={projects} budgetTierById={budgetTierById} isOwner={isOwner} />
    </div>
  );
}
