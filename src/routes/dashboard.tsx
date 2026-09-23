import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRequireAuth, logout } from "@/lib/store";
import { syncPlanIfStale } from "@/lib/plan-sync";
import { YarisChatModal } from "@/components/shared/YarisChatModal";
import { useLiveData } from "@/hooks/use-live-data";
import { TimerProvider } from "@/contexts/StudyTimerContext";
import { StudySessionProvider } from "@/contexts/StudySessionContext";
import { LogroWatcher } from "@/components/logros/LogroWatcher";
import { FpWatcher } from "@/components/fp/FpWatcher";
import { PathyCloud } from "@/components/estudiemos/PathyCloud";
import { rememberLearningPathOrigin, restoreLearningPathScroll } from "@/lib/lp/contextual-return";
import { FlightDeck } from "@/components/flightdeck/FlightDeck";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { user, ready } = useRequireAuth();
  const [yarisOpen, setYarisOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useLiveData(ready);
  const isSubjectDetail = /^\/dashboard\/materias\/.+/.test(location.pathname);
  const isLearningPath = /^\/dashboard\/rutas\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/.test(
    location.pathname,
  );
  useEffect(() => {
    if (ready) void syncPlanIfStale();
  }, [ready]);
  useEffect(() => {
    if (ready && !isLearningPath) restoreLearningPathScroll();
  }, [ready, isLearningPath, location.pathname]);
  if (!ready)
    return (
      <div className="fd-loading" role="status">
        Preparando tu cabina…
      </div>
    );
  return (
    <TimerProvider>
      <StudySessionProvider>
        <div
          onClickCapture={(event) => {
            if (isLearningPath) return;
            const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
            if (anchor) rememberLearningPathOrigin(anchor.href);
          }}
        >
          <FlightDeck
            onYaris={() => setYarisOpen(true)}
            onLogout={() => {
              logout();
              void navigate({ to: "/login" });
            }}
            immersive={isSubjectDetail || isLearningPath}
          >
            <Outlet />
          </FlightDeck>
          <div className="fd-modal-theme">
            <YarisChatModal open={yarisOpen} onClose={() => setYarisOpen(false)} user={user} />
            <PathyCloud />
            <LogroWatcher />
            <FpWatcher />
          </div>
        </div>
      </StudySessionProvider>
    </TimerProvider>
  );
}
