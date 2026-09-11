/**
 * Estudiemos Juntos — sesión adaptativa guiada por Pathy.
 *
 * La alumna dice cómo llega (examen, tema, ánimo, urgencia, minutos) y Pathy
 * arma la sesión con los recursos que ya existen en FlightPath. Aquí no se
 * inventa contenido: sólo se prioriza, ordena y acompaña.
 */
import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Icon } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { IntakeWizard } from "@/components/estudiemos/IntakeWizard";
import { SessionAgenda } from "@/components/estudiemos/SessionAgenda";
import { BreakCard } from "@/components/estudiemos/BreakCard";
import { SessionSummary } from "@/components/estudiemos/SessionSummary";
import { LockedState } from "@/components/estudiemos/LockedState";
import { PruebaModal, type PruebaMode } from "@/components/estudiemos/PruebaModal";
import { useStudySession } from "@/contexts/StudySessionContext";
import { buildStudyPlan } from "@/lib/estudiemos/planner";
import { planStudySession } from "@/lib/estudiemos.functions";
import type { PlanActivity, StudyIntake, StudySessionState } from "@/lib/estudiemos/types";
import { isPaid, logActivity, logYarisUse, useSessionUser } from "@/lib/store";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: maintenanceGate(EstudiemosJuntosPage, studyTogetherMaintenance, {
    titulo: "Estudiemos Juntos",
    intro: "Estamos preparando tu próxima sesión de estudio.",
    cuerpo:
      "Estamos trabajando en algunos ajustes para que Estudiemos Juntos pueda acompañarte mejor durante tus sesiones.",
    cierre: "Muy pronto podrás volver a estudiar con nosotros.",
  }),
});

function VolverDashboard() {
  return (
    <Link
      to="/dashboard"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14,
        color: "#3D5D91", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      ← Volver al dashboard
    </Link>
  );
}

function EstudiemosJuntosPage() {
  const user = useSessionUser();
  const paid = isPaid(user);
  const navigate = useNavigate();
  const planIA = useServerFn(planStudySession);
  const { session, current, start, completeCurrent, goTo, end } = useStudySession();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pruebaMode, setPruebaMode] = useState<PruebaMode | null>(null);
  const [resumen, setResumen] = useState<{ session: StudySessionState; minutos: number } | null>(null);

  if (!user) return null;

  if (!paid) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px" }}>
        <VolverDashboard />
        <LockedState onUpgrade={() => setUpgradeOpen(true)} />
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          feature="Estudiemos Juntos"
          benefit="Pathy revisa tu progreso real y arma la sesión de hoy con los recursos que más te sirven."
          userId={user.id}
        />
      </div>
    );
  }

  async function crearSesion(intake: StudyIntake) {
    if (!user) return;
    setLoading(true);
    setResumen(null);
    const plan = buildStudyPlan(user.id, intake, {
      allowLocked: user.role === "admin",
      nombre: user.nombre?.split(" ")[0],
    });

    let activities: PlanActivity[] = plan.activities;
    let intro = plan.intro;

    try {
      const ia = await planIA({
        data: {
          track: intake.track,
          tema: intake.tema,
          mood: intake.mood,
          urgency: intake.urgency,
          minutes: intake.minutes,
          nombre: user.nombre?.split(" ")[0] ?? "",
          propuesta: plan.activities.filter((a) => a.kind !== "break").map((a) => a.id),
          candidatos: plan.considered.map((c) => ({
            id: c.id, titulo: c.titulo, detalle: c.detalle, minutes: c.minutes,
          })),
        },
      });
      if (ia?.intro) intro = ia.intro;
      if (ia?.order && ia.order.length >= 2) {
        const byId = new Map(plan.considered.map((c) => [c.id, c]));
        const breaks = plan.activities.filter((a) => a.kind === "break");
        const elegidas: PlanActivity[] = [];
        let restante = intake.minutes;
        ia.order.forEach((id) => {
          const c = byId.get(id);
          if (!c || restante < 8) return;
          const minutes = Math.min(c.minutes, Math.max(8, restante));
          restante -= minutes;
          elegidas.push({
            id: c.id, kind: c.kind, titulo: c.titulo, detalle: c.detalle,
            icon: c.icon, minutes,
            ...(c.to ? { to: c.to } : {}),
            ...(c.search ? { search: c.search } : {}),
          });
        });
        if (elegidas.length >= 2) {
          // Los breaks calculados se reinsertan a la mitad, sin cortar actividades.
          if (breaks.length > 0 && elegidas.length > 2) {
            const mitad = Math.ceil(elegidas.length / 2);
            elegidas.splice(mitad, 0, breaks[0]);
          }
          activities = elegidas;
        }
      }
    } catch (err) {
      console.error("Pathy no pudo reordenar la sesión", err);
    }

    start({
      intake,
      activities,
      intro,
      totalMs: intake.minutes * 60000,
    });
    logActivity({
      userId: user.id,
      kind: "pathy_session",
      label: `Estudiemos juntos · ${intake.track === "ciaac" ? "CIAAC" : "Línea Aérea"}`,
      durationMin: 0,
    });
    setLoading(false);
  }

  function abrirActividad(index: number) {
    if (!session || !user) return;
    goTo(index);
    const a = session.activities[index];
    if (!a) return;
    if (a.kind === "break") return;
    if (a.kind === "prueba") {
      logYarisUse(user.id, "Ponme a prueba");
      setPruebaMode("preguntas");
      return;
    }
    if (a.to) navigate({ to: a.to, search: (a.search ?? {}) as never } as never);
  }

  function terminar() {
    const ended = end();
    if (ended) {
      setResumen({ session: ended, minutos: Math.round((Date.now() - ended.startedAt) / 60000) });
      logActivity({
        userId: user!.id,
        kind: "pathy_session",
        label: "Estudiemos juntos · sesión terminada",
        durationMin: Math.round((Date.now() - ended.startedAt) / 60000),
      });
    }
  }

  const header = (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#22375C", margin: "0 0 4px" }}>
        Estudiemos juntos
      </h1>
      <p style={{ fontSize: "0.88rem", color: "#647DA0", margin: 0 }}>
        Tú eliges cómo llegas. Pathy decide cómo estudiamos.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px" }}>
      <VolverDashboard />
      {header}

      {resumen && !session && (
        <div style={{ marginBottom: 18 }}>
          <SessionSummary
            session={resumen.session}
            minutos={resumen.minutos}
            onNueva={() => setResumen(null)}
          />
        </div>
      )}

      {!session && !resumen && (
        <IntakeWizard
          onDone={crearSesion}
          onCancel={() => navigate({ to: "/dashboard" })}
          loading={loading}
        />
      )}

      {session && (
        <>
          <div
            style={{
              background: "linear-gradient(135deg,#F2DCDB,#fce4ec)",
              borderRadius: 18, padding: "18px 20px", marginBottom: 18,
              display: "flex", gap: 14, alignItems: "flex-start",
            }}
          >
            <PathyMark size={44} float />
            <p style={{ fontSize: "0.88rem", color: "#4a4a4a", lineHeight: 1.6, margin: 0 }}>{session.intro}</p>
          </div>

          {current?.kind === "break" && (
            <BreakCard minutes={current.minutes} onDone={completeCurrent} />
          )}

          <SessionAgenda
            activities={session.activities}
            currentIndex={session.currentIndex}
            completedIds={session.completedIds}
            onOpen={abrirActividad}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={completeCurrent}
              style={{
                flex: "1 1 180px", minHeight: 46, borderRadius: 12, border: "1.5px solid #3D5D91",
                background: "white", color: "#3D5D91", fontWeight: 700, fontSize: "0.85rem",
                cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              <Icon n="check" size={16} /> Marcar actual como hecha
            </button>
            <button
              onClick={terminar}
              style={{
                flex: "1 1 180px", minHeight: 46, borderRadius: 12, border: "none",
                background: "#6C0820", color: "white", fontWeight: 700, fontSize: "0.85rem",
                cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}
            >
              Terminar sesión
            </button>
          </div>
        </>
      )}

      {pruebaMode && (
        <PruebaModal
          mode={pruebaMode}
          onClose={(interactions) => {
            if (interactions >= 1) {
              logActivity({ userId: user.id, kind: "pathy_session", label: "Ponme a prueba", durationMin: 5 });
            }
            setPruebaMode(null);
          }}
        />
      )}
    </div>
  );
}
