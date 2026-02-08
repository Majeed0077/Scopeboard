"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/rbac";

type UserPayload = {
  role: Role;
  name: string;
  email: string;
  id: string;
};

export function useRole() {
  const [role, setRole] = useState<Role>("editor");

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { success?: boolean; data?: UserPayload | null } | null) => {
        if (!mounted || !data?.success || !data.data) return;
        setRole(data.data.role);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  return role;
}
