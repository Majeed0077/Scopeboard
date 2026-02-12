import type { User } from "@/types";

// Legacy static users kept only for local fallback/testing.
// Runtime auth uses MongoDB users + JWT session.
export const users: User[] = [
  {
    id: "u-001",
    name: "ScopeBoard Owner",
    email: "owner@flowlane.local",
    passwordHash: "<seeded-in-db>",
    role: "owner",
    active: true,
  },
  {
    id: "u-002",
    name: "ScopeBoard Editor",
    email: "editor@flowlane.local",
    passwordHash: "<seeded-in-db>",
    role: "editor",
    active: true,
  },
];
