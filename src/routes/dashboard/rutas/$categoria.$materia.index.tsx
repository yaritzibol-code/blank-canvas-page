/** Materia/módulo → sus contenedores (módulos, chapters, bloques, documentos). */
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LpBreadcrumbs, LpCard, LpContinueCard, LpGrid, LpHeader } from "@/components/lp/nav";
import { CATEGORY_STYLE } from "./index";
import { hasAvailableCiaacContent } from "@/lib/lp/ciaac-availability";
import { legacyAircraftSubject, lpCategory, lpSubject } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { getLpCompleted, getLpStarted, subjectContinue, subjectProgress } from "@/lib/store/lp-nav";

export const Route = createFileRoute("/dashboard/rutas/$categoria/$materia/")({
  head: () => ({
    meta: [{ title: "Learning paths · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: MateriaPage,
});

function MateriaPage() {
  const { categoria, materia } = Route.useParams();
  const user = useSessionUser();
  const userId = user?.id ?? "";
  const cat = lpCategory(categoria);
  const subject = lpSubject(categoria, materia);
  const legacy = subject?.id === "ciaac/aeronaves-y-motores" ? legacyAircraftSubject() : undefined;

  const estado = useStore(() => {
    if (!subject) return null;
    const completed = new Set(getLpCompleted(userId));
    const started = new Set(getLpStarted(userId));
    const siguiente = subjectContinue(userId, subject);
    return {
      progreso: subjectProgress(userId, subject),
      siguiente,
      porContenedor: subject.containers.map((c) => ({
        id: c.id,
        done: c.learningPaths.filter((l) => completed.has(l.id)).length,
      })),
      legacy:
        legacy &&
        legacy.containers.some((container) =>
          container.learningPaths.some((item) => completed.has(item.id) || started.has(item.id)),
        )
          ? legacy.containers.map((container) => ({
              container,
              done: container.learningPaths.filter((item) => completed.has(item.id)).length,
            }))
          : [],
    };
  });

  if (!cat || !subject) return <Navigate to="/dashboard/rutas" />;

  const siguiente = estado?.siguiente ?? null;
  const sig = siguiente ? siguiente.id.split("/") : null;
  const accent = CATEGORY_STYLE[cat.id]?.accent ?? "var(--primary)";

  return (
    <>
      <LpBreadcrumbs
        items={[
          { label: "Learning Paths", to: "/dashboard/rutas" },
          { label: cat.titulo, to: "/dashboard/rutas/$categoria", params: { categoria } },
          { label: subject.titulo },
        ]}
      />
      <LpHeader
        eyebrow={subject.containerLabel}
        title={subject.titulo}
        subtitle={
          estado
            ? `${estado.progreso.done} de ${estado.progreso.total} learning paths completados`
            : undefined
        }
      />

      {sig && siguiente && (
        <LpContinueCard
          to="/dashboard/rutas/$categoria/$materia/$contenedor/$lp"
          params={{ categoria, materia, contenedor: sig[2], lp: sig[3] }}
          titulo={siguiente.titulo}
          contexto={subject.titulo}
        />
      )}

      <LpGrid>
        {subject.containers.map((c) => {
          const slug = c.id.split("/")[2];
          const done = estado?.porContenedor.find((x) => x.id === c.id)?.done ?? 0;
          const total = c.learningPaths.length;
          return (
            <LpCard
              key={c.id}
              to="/dashboard/rutas/$categoria/$materia/$contenedor"
              params={{ categoria, materia, contenedor: slug }}
              title={c.titulo}
              disabled={!hasAvailableCiaacContent(c.id)}
              lockReason={!hasAvailableCiaacContent(c.id) ? "En preparación" : undefined}
              icon="list"
              accent={accent}
              meta={`${total} learning paths · ${done} completados`}
              percent={total ? Math.round((done / total) * 100) : 0}
              status={done === 0 ? "no_iniciado" : done === total ? "completado" : "en_progreso"}
            />
          );
        })}
      </LpGrid>

      {!!estado?.legacy.length && (
        <section aria-label="Recorridos anteriores" style={{ marginTop: "2rem" }}>
          <LpHeader
            eyebrow="Tu historial"
            title="Recorridos anteriores"
            subtitle="Tu avance anterior sigue guardado. Los 19 recorridos reorganizados tienen su propio progreso."
          />
          <LpGrid>
            {estado.legacy.map(({ container, done }) => (
              <LpCard
                key={container.id}
                to="/dashboard/rutas/$categoria/$materia/$contenedor"
                params={{ categoria, materia, contenedor: container.id.split("/")[2] }}
                title={container.titulo}
                icon="list"
                accent={accent}
                meta={`${done} de ${container.learningPaths.length} completados · Versión anterior`}
                percent={Math.round((done / container.learningPaths.length) * 100)}
                status={
                  done === 0
                    ? "no_iniciado"
                    : done === container.learningPaths.length
                      ? "completado"
                      : "en_progreso"
                }
              />
            ))}
          </LpGrid>
        </section>
      )}
    </>
  );
}
