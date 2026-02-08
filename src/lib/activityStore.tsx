"use client";

import * as React from "react";
import type { Activity } from "@/types";
import { api } from "@/lib/api";

type ActivityContextValue = {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "createdAt"> & { createdAt?: string }) => void;
  getByEntity: (entityType: Activity["entityType"], entityId: string) => Activity[];
};

const ActivityContext = React.createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    let active = true;
    api
      .getActivities()
      .then((data) => {
        if (!active) return;
        setActivities(data ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const addActivity = React.useCallback(
    (activity: Omit<Activity, "id" | "createdAt"> & { createdAt?: string }) => {
      const entry = {
        createdAt: activity.createdAt ?? new Date().toISOString(),
        ...activity,
      };
      api
        .createActivity(entry)
        .then((created) => {
          setActivities((prev) => [created, ...prev]);
        })
        .catch(() => undefined);
    },
    [],
  );

  const getByEntity = React.useCallback(
    (entityType: Activity["entityType"], entityId: string) =>
      activities.filter(
        (activity) =>
          activity.entityType === entityType && activity.entityId === entityId,
      ),
    [activities],
  );

  return (
    <ActivityContext.Provider value={{ activities, addActivity, getByEntity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = React.useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within ActivityProvider");
  }
  return ctx;
}
