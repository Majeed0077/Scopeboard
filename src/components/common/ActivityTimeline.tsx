"use client";

import { useMemo } from "react";
import { formatDate } from "@/lib/format";
import { useActivity } from "@/lib/activityStore";

export function ActivityTimeline({
  entityType,
  entityId,
}: {
  entityType: "contact" | "project" | "invoice" | "milestone";
  entityId: string;
}) {
  const { getByEntity } = useActivity();
  const items = useMemo(() => getByEntity(entityType, entityId), [getByEntity, entityType, entityId]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border bg-background p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.action}</span>
            <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
          </div>
          {item.meta && <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>}
        </div>
      ))}
    </div>
  );
}
