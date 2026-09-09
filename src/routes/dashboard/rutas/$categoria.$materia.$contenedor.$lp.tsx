/**
 * Learning Path individual: contenedor navegable. El contenido educativo se
 * cargará después; aquí viven la posición en la secuencia, el estado y el
 * avance anterior/siguiente. La progresión se valida también aquí: si el
 * Learning Path todavía está bloqueado, la URL no lo abre.
 */
import { useEffect } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { LpBreadcrumbs, LpHeader, LpProgressBar, LpStatusPill } from "@/components/lp/nav";
import { lpCategory, lpContainer, lpSubject } from "@/lib/lp/taxonomy";
import { useSessionUser, useStore } from "@/lib/store";
import { completeLp, lpAccess, lpNeighbors, startLp, subjectProgress } from "@/lib/store/lp-nav";

export const Route = createFileRoute("/dashboard/rutas/$categoria/$materia/$contenedor/$lp")({
  head: () => ({
    meta: [{ title: "Learning path · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: LearningPathPage,
});

function LearningPathPage() {
  const { categoria, materia, contenedor, lp } = Route.useParams();
  const navigate = useNavigate();
  const user = useSessionUser();
  const cat = lpCategory(categoria);
  const subject = lpSubject(categoria, materia);
  const cont = lpContainer(categoria, materia, contenedor);
  const item = cont?.learningPaths.find((l) => l.id.split("/")[3] === lp) ?? null;

  const estado = useStore(() =>
    subject && item
      ? {
          acceso: lpAccess(user, subject, item.id),
          vecinos: lpNeighbors(subject, item.id),
          progreso: subjectProgress(user?.id ?? "", subject),
        }
      : null,
  );

  const allowed = estado?.acceso.allowed ?? false;
  const userId = user?.id ?? "";
  const itemId = item?.id;

  useEffect(() => {
    if (allowed && userId && itemId) startLp(userId, itemId);
  }, [allowed, userId, itemId]);

  if (!cat || !subject || !cont || !item) return <Navigate to="/dashboard/rutas" />;

  const acceso = estado?.acceso;

  // Guard de progresión: bloqueado también por URL directa.
  if (acceso && !acceso.allowed) {
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
            {
              label: cont.titulo,
              to: "/dashboard/rutas/$categoria/$materia/$contenedor",
              params: { categoria, materia, contenedor },
            },
            { label: item.titulo },
          ]}
        />
        <div
          style={{
            padding: 28,
            borderRadius: 18,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            textAlign: "center",
          }}
        >
          <Icon n="lock" size={26} />
          <h1 style={{ fontSize: 20, margin: "12px 0 6px" }}>{item.titulo}</h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 14.5, margin: "0 0 18px" }}>
            {acceso.lock === "plan"
              ? "Este learning path está incluido en FlightPath Pro."
              : "Completa el learning path anterior de la secuencia para abrir este."}
          </p>
          <Link
            to={
              acceso.lock === "plan"
                ? "/dashboard/planes"
                : "/dashboard/rutas/$categoria/$materia/$contenedor"
            }
            params={acceso.lock === "plan" ? undefined : { categoria, materia, contenedor }}
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 12,
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {acceso.lock === "plan" ? "Ver planes" : "Volver al listado"}
          </Link>
        </div>
      </>
    );
  }

  const vecinos = estado?.vecinos;
  const completado = acceso?.status === "completado";

  const irA = (id: string) => {
    const [, mat, conte, slug] = id.split("/");
    void navigate({
      to: "/dashboard/rutas/$categoria/$materia/$contenedor/$lp",
      params: { categoria, materia: mat, contenedor: conte, lp: slug },
    });
  };

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
          {
            label: cont.titulo,
            to: "/dashboard/rutas/$categoria/$materia/$contenedor",
            params: { categoria, materia, contenedor },
          },
          { label: item.titulo },
        ]}
      />
      <LpHeader
        eyebrow={`Paso ${acceso?.posicion} de ${acceso?.total} · ${subject.titulo}`}
        title={item.titulo}
        right={<LpStatusPill status={acceso?.status ?? "en_progreso"} />}
      />

      <div style={{ marginBottom: 22 }}>
        <LpProgressBar percent={estado?.progreso.percent ?? 0} />
        <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginTop: 8 }}>
          {estado?.progreso.done} de {estado?.progreso.total} completados en {subject.titulo}
        </div>
      </div>

      <div
        style={{
          padding: 26,
          borderRadius: 18,
          border: "1px dashed hsl(var(--border))",
          background: "hsl(var(--card))",
          marginBottom: 22,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Contenido en preparación</div>
        <p style={{ margin: 0, fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
          Este learning path ya está creado dentro de la secuencia de {cont.titulo}. Su material de
          estudio se cargará aquí.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {vecinos?.prev && (
          <button
            type="button"
            onClick={() => irA(vecinos.prev!.id)}
            style={btn("ghost")}
            aria-label={`Anterior: ${vecinos.prev.titulo}`}
          >
            <Icon n="chevL" size={15} /> Anterior
          </button>
        )}

        {!completado && user && (
          <button
            type="button"
            onClick={() => completeLp(user.id, item, subject.titulo)}
            style={btn("primary")}
          >
            <Icon n="check" size={15} /> Marcar como completado
          </button>
        )}

        <button
          type="button"
          disabled={!completado || !vecinos?.next}
          onClick={() => vecinos?.next && irA(vecinos.next.id)}
          style={{
            ...btn(completado && vecinos?.next ? "primary" : "ghost"),
            opacity: completado && vecinos?.next ? 1 : 0.5,
            cursor: completado && vecinos?.next ? "pointer" : "not-allowed",
          }}
          title={
            completado
              ? vecinos?.next
                ? vecinos.next.titulo
                : "Terminaste esta materia"
              : "Completa este learning path para avanzar"
          }
        >
          Siguiente <Icon n="chevR" size={15} />
        </button>
      </div>
    </>
  );
}

function btn(kind: "primary" | "ghost"): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    border: kind === "primary" ? "none" : "1px solid hsl(var(--border))",
    background: kind === "primary" ? "hsl(var(--primary))" : "transparent",
    color: kind === "primary" ? "hsl(var(--primary-foreground))" : "inherit",
  };
}
