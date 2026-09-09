/** Contenedor → sus Learning Paths, con candado por progresión y por plan. */
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { LpBreadcrumbs, LpGrid, LpHeader, LpStepCard } from "@/components/lp/nav";
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
      <LpHeader
        eyebrow="Learning paths"
        title={cont.titulo}
        subtitle="Sigue la secuencia del temario: cada tema se abre al completar el anterior."
      />
      <LpGrid single>
        {cont.learningPaths.map((l, i) => {
          const a = accesos.find((x) => x.id === l.id);
          const bloqueado = !a?.allowed;
          const slug = l.id.split("/")[3];
          return (
            <LpStepCard
              key={l.id}
              n={l.orden}
              connector={i > 0}
              to="/dashboard/rutas/$categoria/$materia/$contenedor/$lp"
              params={{ categoria, materia, contenedor, lp: slug }}
              title={l.titulo}
              status={a?.status ?? "no_iniciado"}
              locked={bloqueado}
              meta={
                bloqueado
                  ? a?.lock === "plan"
                    ? "Disponible con FlightPath Pro"
                    : "Completa el learning path anterior para abrirlo"
                  : `Paso ${a?.posicion} de ${a?.total} en ${subject.titulo}`
              }
              onClick={
                bloqueado && a?.lock === "plan"
                  ? () => void navigate({ to: "/dashboard/planes" })
                  : undefined
              }
            />
          );
        })}
      </LpGrid>
    </>
  );
}
