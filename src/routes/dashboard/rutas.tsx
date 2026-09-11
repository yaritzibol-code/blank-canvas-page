/**
 * Learning Paths — layout dentro del Dashboard Shell.
 * Sólo cambia el contenido central: sidebar, header y footer se conservan.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { adminOnly } from "@/components/shared/UnderConstruction";
import { maintenanceGate } from "@/components/shared/Maintenance";
import { learningPathsMaintenance } from "@/lib/feature-flags";
import { LP_PROXIMAMENTE } from "@/lib/lp/registry";

export const Route = createFileRoute("/dashboard/rutas")({
  component: maintenanceGate(
    adminOnly(RutasLayout, "Learning paths", LP_PROXIMAMENTE),
    learningPathsMaintenance,
    {
      titulo: "Learning Paths",
      intro: "Estamos preparando algo increíble.",
      cuerpo: "Estamos haciendo algunos ajustes para mejorar tu experiencia de estudio.",
      cierre:
        "Learning Paths estará disponible nuevamente muy pronto. Mientras tanto, puedes continuar explorando las demás herramientas de FlightPath.",
    },
  ),
});

function RutasLayout() {
  return (
    <div style={{ padding: "26px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <Outlet />
    </div>
  );
}
