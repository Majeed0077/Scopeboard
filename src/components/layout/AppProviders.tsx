"use client";

import { ActivityProvider } from "@/lib/activityStore";
import { LocalDataProvider } from "@/lib/localDataStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocalDataProvider>
      <ActivityProvider>{children}</ActivityProvider>
    </LocalDataProvider>
  );
}
