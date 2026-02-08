import { Badge } from "@/components/ui/badge";
import {
  invoiceStatusLabel,
  invoiceVariant,
  milestoneStatusLabel,
  milestoneVariant,
  projectStatusLabel,
  projectVariant,
  stageLabel,
  stageVariant,
} from "@/lib/badges";
import type { ContactStage, InvoiceStatus, MilestoneStatus, ProjectStatus } from "@/types";

export function StageBadge({ stage }: { stage: ContactStage }) {
  return <Badge variant={stageVariant[stage]}>{stageLabel[stage]}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={projectVariant[status]}>{projectStatusLabel[status]}</Badge>;
}

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  return <Badge variant={milestoneVariant[status]}>{milestoneStatusLabel[status]}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={invoiceVariant[status]}>{invoiceStatusLabel[status]}</Badge>;
}
