/** Contenedor → sus Learning Paths, con candado por progresión y por plan. */
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { LpBreadcrumbs, LpCard, LpGrid, LpHeader, LpStatusPill } from "@/components/lp/nav";
import { lpCategory, lpContainer, lpSubject } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { lpAccess } from "@/lib/store/lp-nav";

export const Route = createFileRoute("/dashboard/rutas/$categoria/$materia/$contenedor/")({
  head: () => ({
    meta: [{ title: "Learning paths · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: ContenedorPage,
});

function ContenedorPage() {
  const { categoria, materia, contenedor } = Route.useParams();
  const navigate = useNavigate();
  const user = useSessionUser();
  const cat = lpCategory(categoria);
  const subject = lpSubject(categoria, materia);
  const cont = lpContainer(categoria, materia, contenedor);

  const accesos = useStore(() =>
    subject && cont
      ? cont.learningPaths.map((l) => ({ id: l.id, ...lpAccess(user, subject, l.id) }))
      : [],
  );

  if (!cat || !subject || !cont) return <Navigate to="/dashboard/rutas" />;

  return (
    <>
      <LpBreadcrumbs
        items={[
          { label: "Learning Paths", to: "/dashboard/rutas" },
          { label: cat.titulo, to: "/dashboard/rutas/$categoria", params: { categoria } },
          {
            label: subject.titulo,
            to: "/dashboard/rutas/$categoria/$materia",
            params: { categoria, materia },
          },
          { label: cont.titulo },
        ]}
      />
      <LpHeader eyebrow="Learning paths" title={cont.titulo} />
      <LpGrid>
        {cont.learningPaths.map((l) => {
          const a = accesos.find((x) => x.id === l.id);
          const bloqueado = !a?.allowed;
          const slug = l.id.split("/")[3];
          return (
            <LpCard
              key={l.id}
              to={bloqueado ? undefined : "/dashboard/rutas/$categoria/$materia/$contenedor/$lp"}
              params={{ categoria, materia, contenedor, lp: slug }}
              title={`${String(l.orden).padStart(2, "0")} · ${l.titulo}`}
              meta={
                bloqueado
                  ? a?.lock === "plan"
                    ? "Disponible con FlightPath Pro"
                    : "Completa el learning path anterior para abrirlo"
                  : `Paso ${a?.posicion} de ${a?.total} en ${subject.titulo}`
              }
              disabled={bloqueado}
              onClick={
                bloqueado && a?.lock === "plan"
                  ? () => void navigate({ to: "/dashboard/planes" })
                  : undefined
              }
              right={
                bloqueado ? (
                  <Icon n="lock" size={15} />
                ) : (
                  <LpStatusPill status={a?.status ?? "no_iniciado"} />
                )
              }
            />
          );
        })}
      </LpGrid>
    </>
  );
}
