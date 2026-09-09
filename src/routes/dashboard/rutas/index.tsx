/**
 * ¿Qué quieres estudiar hoy? — primera pantalla de Learning Paths.
 * Muestra las tres categorías y, si hay avance, el punto de continuidad.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { LpBreadcrumbs, LpCard, LpGrid, LpHeader } from "@/components/lp/nav";
import { LP_CATEGORIES, B737_CATEGORY, subjectLpCount } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { getLpCompleted, subjectContinue } from "@/lib/store/lp-nav";

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

  const continuar = useStore(() => {
    if (!userId) return null;
    const completed = new Set(getLpCompleted(userId));
    for (const cat of LP_CATEGORIES) {
      for (const subject of cat.subjects) {
        const done = subject.containers
          .flatMap((c) => c.learningPaths)
          .filter((l) => completed.has(l.id)).length;
        if (done === 0) continue;
        const item = subjectContinue(userId, subject);
        if (!item) continue;
        const [, materia, contenedor, lp] = item.id.split("/");
        return {
          categoria: cat.id,
          materia,
          contenedor,
          lp,
          titulo: item.titulo,
          subject: subject.titulo,
        };
      }
    }
    return null;
  });

  return (
    <>
      <LpBreadcrumbs items={[{ label: "Learning Paths" }]} />
      <LpHeader
        title="¿Qué quieres estudiar hoy?"
        subtitle="Elige el área y avanza en el orden del temario."
      />

      {continuar && (
        <Link
          to="/dashboard/rutas/$categoria/$materia/$contenedor/$lp"
          params={{
            categoria: continuar.categoria,
            materia: continuar.materia,
            contenedor: continuar.contenedor,
            lp: continuar.lp,
          }}
          style={{
            display: "block",
            marginBottom: 20,
            padding: "16px 18px",
            borderRadius: 16,
            background: "hsl(var(--primary) / 0.08)",
            border: "1px solid hsl(var(--primary) / 0.25)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--primary))" }}>
            Continuar estudiando
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 4 }}>{continuar.titulo}</div>
          <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
            {continuar.subject}
          </div>
        </Link>
      )}

      <LpGrid>
        {LP_CATEGORIES.map((cat) => (
          <LpCard
            key={cat.id}
            to="/dashboard/rutas/$categoria"
            params={{ categoria: cat.id }}
            title={cat.titulo}
            meta={`${cat.subjects.length} ${cat.subjectLabel.toLowerCase()} · ${cat.subjects.reduce(
              (n, s) => n + subjectLpCount(s),
              0,
            )} learning paths`}
          />
        ))}
        <LpCard
          to="/ruta/$curso"
          params={{ curso: B737_CATEGORY.curso }}
          title={B737_CATEGORY.titulo}
          meta={B737_CATEGORY.descripcion}
        />
      </LpGrid>
    </>
  );
}
