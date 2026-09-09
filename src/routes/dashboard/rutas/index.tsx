/**
 * ¿Qué quieres estudiar hoy? — primera pantalla de Learning Paths.
 * Muestra las tres categorías y, si hay avance, el punto de continuidad.
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  LpBreadcrumbs,
  LpCategoryCard,
  LpContinueCard,
  LpGrid,
  LpHeader,
} from "@/components/lp/nav";
import type { FPIconName } from "@/components/ui/fp-icon";
import { LP_CATEGORIES, B737_CATEGORY, subjectLpCount } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { getLpCompleted, subjectContinue } from "@/lib/store/lp-nav";

export const CATEGORY_STYLE: Record<string, { icon: FPIconName; accent: string }> = {
  ciaac: { icon: "graduation", accent: "var(--primary)" },
  "linea-aerea": { icon: "plane", accent: "var(--fp-silver)" },
  b737: { icon: "gauge", accent: "var(--fp-burgundy)" },
};

export const Route = createFileRoute("/dashboard/rutas/")({
  head: () => ({
    meta: [
      { title: "Learning paths · FlightPath" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RutasIndex,
});

function RutasIndex() {
  const user = useSessionUser();
  const userId = user?.id ?? "";

  const estado = useStore(() => {
    if (!userId) return { continuar: null, percent: {} as Record<string, number> };
    const completed = new Set(getLpCompleted(userId));
    const percent: Record<string, number> = {};
    let continuar: {
      categoria: string;
      materia: string;
      contenedor: string;
      lp: string;
      titulo: string;
      subject: string;
    } | null = null;

    for (const cat of LP_CATEGORIES) {
      let done = 0;
      let total = 0;
      for (const subject of cat.subjects) {
        const paths = subject.containers.flatMap((c) => c.learningPaths);
        total += paths.length;
        const sDone = paths.filter((l) => completed.has(l.id)).length;
        done += sDone;
        if (!continuar && sDone > 0) {
          const item = subjectContinue(userId, subject);
          if (item) {
            const [, materia, contenedor, lp] = item.id.split("/");
            continuar = {
              categoria: cat.id,
              materia,
              contenedor,
              lp,
              titulo: item.titulo,
              subject: subject.titulo,
            };
          }
        }
      }
      percent[cat.id] = total ? Math.round((done / total) * 100) : 0;
    }
    return { continuar, percent };
  });

  const continuar = estado?.continuar ?? null;

  return (
    <>
      <LpBreadcrumbs items={[{ label: "Learning Paths" }]} />
      <LpHeader
        title="¿Qué quieres estudiar hoy?"
        subtitle="Elige el área y avanza en el orden del temario."
      />

      {continuar && (
        <LpContinueCard
          to="/dashboard/rutas/$categoria/$materia/$contenedor/$lp"
          params={{
            categoria: continuar.categoria,
            materia: continuar.materia,
            contenedor: continuar.contenedor,
            lp: continuar.lp,
          }}
          titulo={continuar.titulo}
          contexto={continuar.subject}
        />
      )}

      <LpGrid>
        {LP_CATEGORIES.map((cat) => {
          const s = CATEGORY_STYLE[cat.id] ?? { icon: "book", accent: "var(--primary)" };
          return (
            <LpCategoryCard
              key={cat.id}
              to="/dashboard/rutas/$categoria"
              params={{ categoria: cat.id }}
              title={cat.titulo}
              icon={s.icon}
              accent={s.accent}
              percent={estado?.percent[cat.id] ?? 0}
              meta={`${cat.subjects.length} ${cat.subjectLabel.toLowerCase()} · ${cat.subjects.reduce(
                (n, sub) => n + subjectLpCount(sub),
                0,
              )} learning paths`}
            />
          );
        })}
        <LpCategoryCard
          to="/ruta/$curso"
          params={{ curso: B737_CATEGORY.curso }}
          title={B737_CATEGORY.titulo}
          icon={CATEGORY_STYLE.b737.icon}
          accent={CATEGORY_STYLE.b737.accent}
          descripcion={B737_CATEGORY.descripcion}
          meta="Ruta técnica"
        />
      </LpGrid>
    </>
  );
}
