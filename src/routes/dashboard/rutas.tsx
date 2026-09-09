/**
 * Learning Paths — layout dentro del Dashboard Shell.
 * Sólo cambia el contenido central: sidebar, header y footer se conservan.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { adminOnly } from "@/components/shared/UnderConstruction";
import { LP_PROXIMAMENTE } from "@/lib/lp/registry";

export const Route = createFileRoute("/dashboard/rutas")({
  component: adminOnly(RutasLayout, "Learning paths", LP_PROXIMAMENTE),
});

function RutasLayout() {
  return (
    <div style={{ padding: "26px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <Outlet />
    </div>
  );
}
