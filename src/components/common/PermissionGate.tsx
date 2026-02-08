"use client";

import * as React from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission, type Permission } from "@/lib/rbac";
import { useRole } from "@/lib/useRole";

export function Can({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const role = useRole();
  if (!hasPermission(role, permission)) return null;
  return <>{children}</>;
}

export function DisableIfNoPermission({
  permission,
  children,
  tooltip = "Owner only",
}: {
  permission: Permission;
  children: React.ReactElement;
  tooltip?: string;
}) {
  const role = useRole();
  const allowed = hasPermission(role, permission);

  if (allowed) return children;

  const child = children;
  const disabledProps = {
    ...child.props,
    disabled: true,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      toast.error("Only the owner can do this.");
    },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {Object.assign(React.cloneElement(child, disabledProps))}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
