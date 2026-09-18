/**
 * Learning Path individual: contenido, posición en la secuencia, estado y
 * avance anterior/siguiente. La progresión se valida también aquí: si el
 * Learning Path todavía está bloqueado, la URL no lo abre.
 */
import { useEffect } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import {
  APPLICABLE_REGULATIONS_LP_ID,
  ApplicableRegulationsPath,
} from "@/components/lp/ApplicableRegulationsPath";
import { AtpLearningPath } from "@/components/lp/AtpLearningPath";
import { HandbookLearningPath } from "@/components/lp/HandbookLearningPath";
import { JeppesenLearningPath } from "@/components/lp/JeppesenLearningPath";
import { LegislationLearningPath } from "@/components/lp/LegislationLearningPath";
import {
  LpActionBar,
  LpBreadcrumbs,
  LpEmptyState,
  LpHeader,
  LpProgressBar,
  LpStatusPill,
  lpButtonStyle,
} from "@/components/lp/nav";
import { lpCategory, lpContainer, lpSubject } from "@/lib/lp/taxonomy";
import { ATP_LEARNING_PATHS } from "@/lib/lp/atp-content.generated";
import { ANNEX10_LEARNING_PATHS } from "@/lib/lp/annex10-content.generated";
import { HANDBOOK_LEARNING_PATHS } from "@/lib/lp/handbook-content.generated";
import { JEPPESEN_LEARNING_PATHS } from "@/lib/lp/jeppesen-content.generated";
import { LEGISLATION_LEARNING_PATHS } from "@/lib/lp/legislation-content.generated";
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
        <LpEmptyState
          icon="lock"
          title={item.titulo}
          description={
            acceso.lock === "plan"
              ? "Este learning path está incluido en FlightPath Pro."
              : "Completa el learning path anterior de la secuencia para abrir este."
          }
          action={
            <Link
              to={
                acceso.lock === "plan"
                  ? "/dashboard/planes"
                  : "/dashboard/rutas/$categoria/$materia/$contenedor"
              }
              params={acceso.lock === "plan" ? undefined : { categoria, materia, contenedor }}
              style={{ ...lpButtonStyle("primary"), textDecoration: "none" }}
            >
              {acceso.lock === "plan" ? "Ver planes" : "Volver al listado"}
            </Link>
          }
        />
      </>
    );
  }

  const vecinos = estado?.vecinos;
  const completado = acceso?.status === "completado";
  const atpDocument = ATP_LEARNING_PATHS[item.id];
  const handbookDocument = HANDBOOK_LEARNING_PATHS[item.id];
  const jeppesenDocument = JEPPESEN_LEARNING_PATHS[item.id];
  const legislationDocument = LEGISLATION_LEARNING_PATHS[item.id];
  const annex10Document = ANNEX10_LEARNING_PATHS[item.id];
  const isHandbook = subject.id === "linea-aerea/handbook";
  const isJeppesen = subject.id === "linea-aerea/jeppesen";
  const isLegislation = subject.id === "linea-aerea/legislacion";
  const isAnnex10 = subject.id === "linea-aerea/anexo-10-volumen-ii";
  const isNativeSubject = isHandbook || isJeppesen || isLegislation || isAnnex10;
  const hasNativeContent =
    item.id === APPLICABLE_REGULATIONS_LP_ID ||
    Boolean(atpDocument) ||
    Boolean(handbookDocument) ||
    Boolean(jeppesenDocument) ||
    Boolean(legislationDocument) ||
    Boolean(annex10Document);

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

      <div
        style={{
          marginBottom: 22,
          padding: 16,
          borderRadius: 18,
          border: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <LpProgressBar percent={estado?.progreso.percent ?? 0} />
        <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 8 }}>
          {estado?.progreso.done} de {estado?.progreso.total} completados en {subject.titulo}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        {item.id === APPLICABLE_REGULATIONS_LP_ID && user ? (
          <ApplicableRegulationsPath
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : atpDocument && user ? (
          <AtpLearningPath
            document={atpDocument}
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : handbookDocument && user ? (
          <HandbookLearningPath
            document={handbookDocument}
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : jeppesenDocument && user ? (
          <JeppesenLearningPath
            document={jeppesenDocument}
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : legislationDocument && user ? (
          <LegislationLearningPath
            document={legislationDocument}
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : annex10Document && user ? (
          <LegislationLearningPath
            document={annex10Document}
            userId={user.id}
            lpId={item.id}
            completed={completado}
            onComplete={() => completeLp(user.id, item, subject.titulo)}
          />
        ) : (
          <LpEmptyState
            icon="spark"
            title="Contenido en preparación"
            description={
              isNativeSubject
                ? `Falta el HTML fuente de “${item.titulo}”. Este tema permanece bloqueado dentro de la secuencia hasta integrar su recorrido nativo.`
                : `Este learning path ya está creado dentro de la secuencia de ${cont.titulo}. Su material de estudio se cargará aquí.`
            }
          />
        )}
      </div>

      <LpActionBar>
        <div>
          {vecinos?.prev && (
            <button
              type="button"
              onClick={() => irA(vecinos.prev!.id)}
              style={lpButtonStyle("ghost")}
              aria-label={`Anterior: ${vecinos.prev.titulo}`}
            >
              <Icon n="chevL" size={15} /> Anterior
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {!hasNativeContent && !isNativeSubject && !completado && user && (
            <button
              type="button"
              onClick={() => completeLp(user.id, item, subject.titulo)}
              style={lpButtonStyle("primary")}
            >
              <Icon n="check" size={15} /> Marcar como completado
            </button>
          )}

          <button
            type="button"
            disabled={!completado || !vecinos?.next}
            onClick={() => vecinos?.next && irA(vecinos.next.id)}
            style={lpButtonStyle(completado && vecinos?.next ? "primary" : "disabled")}
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
      </LpActionBar>
    </>
  );
}
