"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission, type Permission } from "@/lib/rbac";
import { useRole } from "@/lib/useRole";

export function MaskIfNoPermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const role = useRole();
  if (hasPermission(role, permission)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Owner only
          </span>
        </TooltipTrigger>
        <TooltipContent>Owner only</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
