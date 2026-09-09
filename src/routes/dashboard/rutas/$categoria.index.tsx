/** Categoría → materias (CIAAC) o módulos (Línea Aérea). */
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LpBreadcrumbs, LpCard, LpGrid, LpHeader } from "@/components/lp/nav";
import { lpCategory, subjectLpCount } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { subjectProgress } from "@/lib/store/lp-nav";

export const Route = createFileRoute("/dashboard/rutas/$categoria/")({
  head: () => ({
    meta: [{ title: "Learning paths · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoriaPage,
});

function CategoriaPage() {
  const { categoria } = Route.useParams();
  const user = useSessionUser();
  const userId = user?.id ?? "";
  const cat = lpCategory(categoria);

  const avance = useStore(() =>
    cat ? cat.subjects.map((s) => ({ id: s.id, ...subjectProgress(userId, s) })) : [],
  );

  if (!cat) return <Navigate to="/dashboard/rutas" />;

  return (
    <>
      <LpBreadcrumbs
        items={[{ label: "Learning Paths", to: "/dashboard/rutas" }, { label: cat.titulo }]}
      />
      <LpHeader eyebrow={cat.subjectLabel} title={cat.titulo} />
      <LpGrid>
        {cat.subjects.map((s) => {
          const p = avance.find((a) => a.id === s.id);
          const slug = s.id.split("/")[1];
          return (
            <LpCard
              key={s.id}
              to="/dashboard/rutas/$categoria/$materia"
              params={{ categoria: cat.id, materia: slug }}
              title={s.titulo}
              meta={`${s.containers.length} ${s.containerLabel.toLowerCase()} · ${subjectLpCount(s)} learning paths${
                p && p.done ? ` · ${p.done} completados` : ""
              }`}
              percent={p?.percent ?? 0}
            />
          );
        })}
      </LpGrid>
    </>
  );
}
