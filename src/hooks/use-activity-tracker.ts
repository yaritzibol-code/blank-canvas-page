/**
 * Monta el tracker de Activity Ratio una sola vez y reporta cada cambio de
 * pantalla del router.
 */
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { setActivityPlan, startActivityTracker, trackView } from "@/lib/activity-tracker";
import type { User } from "@/lib/store/types";

export function useActivityTracker(user: User | null | undefined): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => startActivityTracker(), []);

  useEffect(() => {
    setActivityPlan(user?.plan ?? null);
  }, [user?.plan]);

  useEffect(() => {
    trackView(pathname);
  }, [pathname]);
}
