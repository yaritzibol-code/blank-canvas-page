/** Categoría → materias (CIAAC) o módulos (Línea Aérea). */
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LpBreadcrumbs, LpCard, LpGrid, LpHeader } from "@/components/lp/nav";
import { CATEGORY_STYLE } from "./index";
import type { FPIconName } from "@/components/ui/fp-icon";
import { lpCategory, subjectLpCount } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { subjectProgress } from "@/lib/store/lp-nav";

export const Route = createFileRoute("/dashboard/rutas/$categoria/")({
  head: () => ({
    meta: [{ title: "Learning paths · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoriaPage,
});

const SUBJECT_ICONS: FPIconName[] = ["book", "compass", "cloud", "gauge", "radio", "map", "wind", "tower", "shield", "globe", "brain", "doc"];

function CategoriaPage() {
  const { categoria } = Route.useParams();
  const user = useSessionUser();
  const userId = user?.id ?? "";
  const cat = lpCategory(categoria);

  const avance = useStore(() =>
    cat ? cat.subjects.map((s) => ({ id: s.id, ...subjectProgress(userId, s) })) : [],
  );

  if (!cat) return <Navigate to="/dashboard/rutas" />;

  const accent = CATEGORY_STYLE[cat.id]?.accent ?? "var(--primary)";

  return (
    <>
      <LpBreadcrumbs
        items={[{ label: "Learning Paths", to: "/dashboard/rutas" }, { label: cat.titulo }]}
      />
      <LpHeader eyebrow={cat.subjectLabel} title={cat.titulo} />
      <LpGrid>
        {cat.subjects.map((s, i) => {
          const p = avance.find((a) => a.id === s.id);
          const slug = s.id.split("/")[1];
          return (
            <LpCard
              key={s.id}
              to="/dashboard/rutas/$categoria/$materia"
              params={{ categoria: cat.id, materia: slug }}
              title={s.titulo}
              icon={SUBJECT_ICONS[i % SUBJECT_ICONS.length]}
              accent={accent}
              meta={`${s.containers.length} ${s.containerLabel.toLowerCase()} · ${subjectLpCount(s)} learning paths${
                p && p.done ? ` · ${p.done} completados` : ""
              }`}
              percent={p?.percent ?? 0}
              right={<span />}
            />
          );
        })}
      </LpGrid>
    </>
  );
}
