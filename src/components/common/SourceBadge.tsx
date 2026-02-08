import { Badge } from "@/components/ui/badge";
import { sourceLabel, sourceVariant } from "@/lib/badges";
import type { ContactSource } from "@/types";

export function SourceBadge({ source }: { source: ContactSource }) {
  return <Badge variant={sourceVariant[source]}>{sourceLabel[source]}</Badge>;
}
