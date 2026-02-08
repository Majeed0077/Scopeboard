"use client";

import type { Role } from "@/lib/rbac";

const ROLE_COOKIE = "vf_role";

export function setRoleCookie(role: Role) {
  document.cookie = `${ROLE_COOKIE}=${role}; path=/;`;
}

export function clearRoleCookie() {
  document.cookie = `${ROLE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getRoleFromCookie(): Role | null {
  const match = document.cookie.match(/(?:^|; )vf_role=([^;]+)/);
  return match ? (decodeURIComponent(match[1]) as Role) : null;
}
