/** Learning Path lists keep their reading width; an individual path uses the full viewport. */
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/rutas")({
  component: RutasLayout,
});

function RutasLayout() {
  const location = useLocation();
  const isPathPage = /^\/dashboard\/rutas\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/.test(location.pathname);
  return (
    <div style={isPathPage
      ? { width: "100%", minWidth: 0 }
      : { padding: "26px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <Outlet />
    </div>
  );
}
