/** Learning Path lists keep their reading width; an individual path uses the full viewport. */
import { createFileRoute, Link, Outlet, useLocation, useParams } from "@tanstack/react-router";

import { LpEmptyState, lpButtonStyle } from "@/components/lp/nav";
import {
  ciaacAdminVerificationFailed,
  useCiaacAdminVerification,
} from "@/lib/lp/ciaac-admin-verification";
import {
  CIAAC_STUDENT_ACCESS_PAUSED,
  isCiaacStudentAccessPaused,
} from "@/lib/lp/ciaac-student-availability";
import { isAuthSettled, useSessionUser, useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard/rutas")({
  component: RutasLayout,
});

function RutasLayout() {
  const location = useLocation();
  const { categoria } = useParams({ strict: false });
  const user = useSessionUser();
  const settled = useStore(isAuthSettled);
  useCiaacAdminVerification(
    user?.id ?? null,
    settled && CIAAC_STUDENT_ACCESS_PAUSED && (!categoria || categoria === "ciaac"),
  );
  // Gate the entire subtree before mounting any lesson, effects or journey writes.
  if (isCiaacStudentAccessPaused(settled ? user : null, categoria ?? "")) {
    return (
      <div
        style={{
          padding: "26px 24px 60px",
          maxWidth: 1000,
          margin: "0 auto",
          color: "var(--muted-foreground)",
        }}
      >
        <LpEmptyState
          icon="lock"
          title="Aún no disponible"
          description={
            user && ciaacAdminVerificationFailed(user.id)
              ? "No se pudo verificar el acceso. Puedes recargar la página para intentarlo de nuevo. Tu avance guardado se conserva."
              : "Los Learning Paths CIAAC aún no están disponibles. Tu avance guardado se conserva."
          }
          action={
            <Link
              to="/dashboard/rutas"
              style={{ ...lpButtonStyle("ghost"), textDecoration: "none" }}
            >
              Volver a Learning Paths
            </Link>
          }
        />
      </div>
    );
  }
  const isPathPage = /^\/dashboard\/rutas\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/.test(location.pathname);
  return (
    <div
      style={
        isPathPage
          ? { width: "100%", minWidth: 0 }
          : { padding: "26px 24px 60px", maxWidth: 1000, margin: "0 auto" }
      }
    >
      <Outlet />
    </div>
  );
}
