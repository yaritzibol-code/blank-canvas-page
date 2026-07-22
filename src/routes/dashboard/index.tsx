import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser, useStore, studentStats, materiaProgressPct, MATERIAS_DEF, getStudyDays } from "@/lib/store";
import { OnboardingModal } from "@/components/shared/OnboardingModal";
import { DataSyncBanner } from "@/components/shared/DataSyncBanner";
import { PlaneField } from "@/components/shared/PlaneField";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

/* ── Palette (existing tokens, unchanged) ── */
const NAVY = "#22375C";
const INK = "#1E2A4A"; // slightly deeper navy, same family
const LAPIS = "#3D5D91";
const CREAM = "#FBFAF7";
const CORAL = "#6C0820";
const ROSE = "#F2AEBC";
const SALMON = "#F2DCDB";
const HAZE = "#647DA0";

const SERIF = "'Instrument Serif', serif";
const SANS = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

interface MateriaItem {
  icon: string;
  name: string;
  pct: number;
  slug: string;
}

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

/* ── Live countdown state ── */
function calcCountdown(fecha: string) {
  const diff = new Date(`${fecha}T08:00:00`).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, sec: 0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    sec: Math.floor((diff % 60000) / 1000),
  };
}

function useCountdown(fecha: string | null) {
  const [cd, setCd] = useState(() => (fecha ? calcCountdown(fecha) : { d: 0, h: 0, m: 0, sec: 0 }));
  useEffect(() => {
    if (!fecha) return;
    setCd(calcCountdown(fecha));
    const t = setInterval(() => setCd(calcCountdown(fecha)), 1000);
    return () => clearInterval(t);
  }, [fecha]);
  return cd;
}

/* ── Countdown card (editorial cabina) ── */
function CountdownCard({ fecha }: { fecha: string | null }) {
  const cd = useCountdown(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateLabel = fecha
    ? new Date(`${fecha}T08:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
    : null;
  // Progress along the timeline (assume 90 days max)
  const totalWindow = 90;
  const remaining = Math.min(cd.d, totalWindow);
  const pct = fecha ? Math.max(6, Math.min(94, ((totalWindow - remaining) / totalWindow) * 100)) : 40;

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}1A`,
        borderRadius: 24,
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxShadow: "0 1px 0 rgba(34,55,92,0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: `${NAVY}99`,
          }}
        >
          Tiempo para despegue
        </span>
        <span
          style={{
            background: `${ROSE}33`,
            color: CORAL,
            fontSize: "0.6rem",
            padding: "3px 8px",
            borderRadius: 999,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: MONO,
          }}
        >
          Próximo vuelo
        </span>
      </div>

      {fecha ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, color: NAVY, flexWrap: "wrap" }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.6rem", lineHeight: 1 }}>{cd.d}</span>
          <span style={{ fontFamily: SANS, fontSize: "0.9rem", opacity: 0.4, marginRight: 6 }}>d</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.6rem", lineHeight: 1 }}>{pad(cd.h)}</span>
          <span style={{ fontFamily: SANS, fontSize: "0.9rem", opacity: 0.4, marginRight: 6 }}>h</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.6rem", lineHeight: 1 }}>{pad(cd.m)}</span>
          <span style={{ fontFamily: SANS, fontSize: "0.9rem", opacity: 0.4 }}>m</span>
        </div>
      ) : (
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.5rem", color: NAVY, lineHeight: 1.2 }}>
          Configura tu fecha CIAAC en tu perfil
        </div>
      )}

      {dateLabel && (
        <div style={{ fontFamily: MONO, fontSize: "0.66rem", color: HAZE, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 10 }}>
          Examen · {dateLabel}
        </div>
      )}

      {/* Timeline motif */}
      <div style={{ marginTop: 22, position: "relative", height: 12 }}>
        <div style={{ position: "absolute", inset: "50% 0 0 0", height: 1, background: `${NAVY}1A` }} />
        <div style={{ position: "absolute", left: 0, top: "50%", width: 8, height: 8, transform: "translate(-1px,-50%)", borderRadius: "50%", background: NAVY }} />
        <div style={{ position: "absolute", right: 0, top: "50%", width: 8, height: 8, transform: "translate(1px,-50%)", borderRadius: "50%", background: ROSE }} />
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%) rotate(-45deg)", color: CORAL }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ── Streak card (dark KPI, cabina flag) ── */
function StreakCard({ streak, studyDays, todayIdx }: { streak: number; studyDays: Record<string, number>; todayIdx: number }) {
  const diasWord = streak === 1 ? "día" : "días";
  return (
    <div
      style={{
        background: NAVY,
        color: "white",
        borderRadius: 20,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        minHeight: 168,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ position: "absolute", right: -8, bottom: -8, opacity: 0.08, color: "white" }} aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, opacity: 0.55 }}>
          Modo Piloto · Racha
        </span>
        <span style={{ display: "flex", color: ROSE }}><Icon n="flame" size={18} /></span>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.4rem", lineHeight: 1 }}>{streak}</span>
          <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: ROSE, fontWeight: 700 }}>{diasWord}</span>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
          {WEEK_DAYS.map((d, i) => {
            const dayDate = new Date();
            const diff = i - todayIdx;
            dayDate.setDate(dayDate.getDate() + diff);
            const key = dayDate.toISOString().slice(0, 10);
            const studied = (studyDays[key] ?? 0) > 0;
            const isToday = i === todayIdx;
            return (
              <div
                key={i}
                title={studied ? `${Math.round((studyDays[key] ?? 0) / 60)} min` : "Sin actividad"}
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: isToday ? ROSE : studied ? "rgba(242,174,188,0.45)" : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.58rem", fontWeight: 800,
                  color: isToday ? CORAL : "white",
                  fontFamily: MONO,
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── KPI card (white, big serif number, small badge) ── */
function KpiCard({ label, value, badge, progress }: { label: string; value: string; badge?: string; progress?: number }) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}14`,
        borderRadius: 20,
        padding: "20px 22px",
        minHeight: 168,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span
          style={{
            fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.2em",
            textTransform: "uppercase", fontWeight: 700, color: `${NAVY}80`,
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            style={{
              fontFamily: MONO, fontSize: "0.58rem", padding: "3px 8px",
              background: CREAM, border: `1px solid ${NAVY}14`, borderRadius: 999,
              letterSpacing: "0.08em", color: HAZE, fontWeight: 700,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3rem", lineHeight: 1, color: INK }}>{value}</div>
        {progress !== undefined && (
          <div style={{ marginTop: 12, height: 3, background: SALMON, borderRadius: 999 }}>
            <div style={{ width: `${Math.min(100, progress)}%`, height: "100%", background: NAVY, borderRadius: 999 }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Quick access row (list style) ── */
function QuickRow({ icon, title, sub, to, primary }: { icon: string; title: string; sub: string; to: string; primary?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to as "/dashboard"}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          background: "white",
          border: `1px solid ${hov ? ROSE : NAVY + "14"}`,
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: primary ? CORAL : CREAM,
              color: primary ? "white" : NAVY,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon n={icon as never} size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: "0.86rem", fontWeight: 700, color: NAVY }}>{title}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "0.78rem", color: HAZE, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
          </div>
        </div>
        <span style={{ color: hov ? CORAL : `${NAVY}33`, transform: hov ? "translateX(3px)" : "none", transition: "transform 0.15s, color 0.15s", display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  );
}

/* ── Materia card (editorial with dark or sky header) ── */
function MateriaCard({ m, variant, live }: { m: MateriaItem; variant: "dark" | "rose" | "plain"; live?: boolean }) {
  const [hov, setHov] = useState(false);
  const headerBg = variant === "dark" ? NAVY : variant === "rose" ? ROSE : "white";
  const headerFg = variant === "dark" ? "white" : variant === "rose" ? NAVY : NAVY;
  const eyebrow = variant === "dark" ? "Nivel principal" : variant === "rose" ? "Fundamentos" : "Módulo";
  const eyebrowColor = variant === "dark" ? ROSE : variant === "rose" ? CORAL : HAZE;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "white",
        border: `1px solid ${NAVY}14`,
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 12px 30px rgba(34,55,92,0.08)" : "0 1px 0 rgba(34,55,92,0.03)",
      }}
    >
      <div
        style={{
          background: headerBg,
          color: headerFg,
          padding: "22px 20px 20px",
          minHeight: 132,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {live && (
          <span
            style={{
              position: "absolute", left: 16, bottom: 14,
              fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.2em",
              textTransform: "uppercase", fontWeight: 800,
              padding: "3px 8px", borderRadius: 999,
              background: CORAL, color: "white",
            }}
          >
            En vivo
          </span>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.2em",
              textTransform: "uppercase", fontWeight: 700, color: eyebrowColor,
            }}
          >
            {eyebrow}
          </span>
          <span style={{ display: "flex", color: variant === "dark" ? "rgba(255,255,255,0.7)" : NAVY, opacity: variant === "plain" ? 0.6 : 1 }}>
            <Icon n={m.icon as never} size={20} />
          </span>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.35rem", lineHeight: 1.15, paddingRight: 40 }}>
          {m.name}
        </div>
      </div>

      <div style={{ padding: "16px 20px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: HAZE, fontWeight: 700 }}>
            Progreso
          </span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.05rem", color: NAVY }}>{m.pct}%</span>
        </div>
        <div style={{ height: 3, background: SALMON, borderRadius: 999, marginBottom: 14 }}>
          <div style={{ width: `${m.pct}%`, height: "100%", background: NAVY, borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Material", path: `/dashboard/materias/${m.slug}` },
            { label: "Preguntas", path: `/dashboard/banco` },
            { label: "Flash", path: `/dashboard/flashcards` },
          ].map((btn) => (
            <Link
              key={btn.label}
              to={btn.path as "/dashboard"}
              style={{
                flex: 1, padding: "7px 0",
                border: `1px solid ${NAVY}14`, borderRadius: 8,
                fontFamily: MONO, fontSize: "0.62rem", fontWeight: 700, color: NAVY,
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", background: "transparent",
                transition: "all 0.15s", textAlign: "center",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = CREAM;
                e.currentTarget.style.borderColor = `${NAVY}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = `${NAVY}14`;
              }}
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardHome() {
  const user = useSessionUser();
  const stats = useStore(() => (user ? studentStats(user.id) : null));
  const materias = useStore<MateriaItem[]>(() =>
    MATERIAS_DEF.map((m) => ({
      icon: m.icon,
      name: m.name,
      pct: user ? materiaProgressPct(user.id, m.slug) : 0,
      slug: m.slug,
    })),
  );
  const studyDays = useStore(() => (user ? getStudyDays(user.id) : {}));

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

  if (!user || !stats) return null;

  const firstName = (user.nombre?.trim().split(/\s+/)[0]) || "piloto";
  const streak = stats.streak;
  const diasWord = streak === 1 ? "día" : "días";

  const continueMateria =
    materias.slice().sort((a, b) => a.pct - b.pct).find((m) => m.pct < 100) ?? materias[0];
  const continueSub = continueMateria
    ? continueMateria.pct === 0
      ? `${continueMateria.name} — empieza aquí`
      : `${continueMateria.name} — ${continueMateria.pct}% completado`
    : "Elige una materia para comenzar";
  const continuePath = continueMateria
    ? `/dashboard/materias/${continueMateria.slug}`
    : "/dashboard/materias";

  // Featured materias for the top of the grid
  const inProgress = materias.filter((m) => m.pct > 0 && m.pct < 100);
  const featured = (inProgress[0] ?? materias[0]);
  const secondary = (inProgress[1] ?? materias.find((m) => m.slug !== featured?.slug) ?? materias[1]);
  const rest = materias.filter((m) => m.slug !== featured?.slug && m.slug !== secondary?.slug);

  return (
    <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", fontFamily: SANS, isolation: "isolate" }}>
      {/* Ambient planes — same engine as la homepage */}
      <PlaneField count={14} color="34,55,92" />

      {/* Decorative flight trajectories */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", top: -40, right: -80, width: 620, height: 620, opacity: 0.08, color: NAVY, pointerEvents: "none", zIndex: 0 }}
        viewBox="0 0 400 400"
      >
        <path d="M0,200 Q150,50 400,200" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M0,250 Q200,100 400,250" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M0,300 Q220,160 400,300" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="6 6" />
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        <DataSyncBanner />
        {!user.onboardingDone && <OnboardingModal user={user} onDone={() => {}} />}

        {/* HERO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)",
            gap: 28,
            alignItems: "flex-end",
            marginBottom: 40,
          }}
          className="fp-hero-grid"
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.66rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: HAZE,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 22, height: 1, background: `${NAVY}55`, display: "block" }} />
              Cabina de estudio · Sesión de hoy
            </div>
            <h1
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2.6rem, 5.2vw, 4.6rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                color: NAVY,
                margin: 0,
              }}
            >
              {greeting}, <span style={{ color: CORAL }}>{firstName}.</span>
            </h1>
            <p
              style={{
                marginTop: 14,
                fontSize: "1.02rem",
                color: `${NAVY}99`,
                maxWidth: 520,
                lineHeight: 1.55,
              }}
            >
              {streak > 0
                ? `Llevas ${streak} ${diasWord} volando en ruta. Pathy está muy orgullosa de ti — hoy toca continuar con ${continueMateria?.name ?? "tu materia pendiente"}.`
                : "Aún no despegas esta semana. Una sesión corta hoy te vuelve a poner en ruta."}
            </p>
          </div>
          <CountdownCard fecha={user.fechaCiaac} />
        </div>

        {/* KPI ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 44,
          }}
        >
          <StreakCard streak={streak} studyDays={studyDays} todayIdx={todayIdx} />
          <KpiCard
            label="Progreso general"
            value={`${stats.courseProgress}%`}
            badge="Fase actual"
            progress={stats.courseProgress}
          />
          <KpiCard
            label="Preguntas resueltas"
            value={stats.answered.toLocaleString()}
            badge={stats.avgScore !== null ? `GS ${stats.avgScore}%` : "Sin datos"}
          />
          <KpiCard
            label="Tiempo en cabina"
            value={`${stats.studyHours}h`}
            badge="HDG 360"
          />
        </div>

        {/* QUICK ACCESS + FEATURED MATERIAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
            gap: 28,
            marginBottom: 44,
          }}
          className="fp-split-grid"
        >
          <div>
            <div
              style={{
                fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.28em",
                textTransform: "uppercase", fontWeight: 700, color: `${NAVY}66`,
                marginBottom: 14,
              }}
            >
              Accesos rápidos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <QuickRow
                primary
                icon="play"
                title="Continuar estudiando"
                sub={continueSub}
                to={continuePath}
              />
              <QuickRow
                icon="help"
                title="Hacer cuestionario"
                sub={
                  stats.quizCount > 0
                    ? `${stats.quizCount} cuestionarios completados`
                    : "Elige materia y cantidad"
                }
                to="/dashboard/banco"
              />
              <QuickRow
                icon="sim"
                title="Examen simulado"
                sub={
                  stats.simCount > 0
                    ? `${stats.simCount} simulacros completados`
                    : "Simula el CIAAC completo"
                }
                to="/simulador"
              />
              <QuickRow
                icon="cards"
                title="Flashcards del día"
                sub="Repaso rápido antes de despegar"
                to="/dashboard/flashcards"
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.28em",
                  textTransform: "uppercase", fontWeight: 700, color: `${NAVY}66`,
                }}
              >
                Plan de formación · Destacadas
              </div>
              <Link
                to="/dashboard/materias"
                style={{
                  fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.16em",
                  textTransform: "uppercase", fontWeight: 700, color: CORAL,
                  textDecoration: "underline", textDecorationColor: `${CORAL}55`,
                  textUnderlineOffset: 4,
                }}
              >
                Ver todas →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {featured && <MateriaCard m={featured} variant="dark" live />}
              {secondary && <MateriaCard m={secondary} variant="rose" />}
            </div>
          </div>
        </div>

        {/* MATERIAS GRID */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.28em",
                textTransform: "uppercase", fontWeight: 700, color: `${NAVY}66`,
              }}
            >
              Bitácora de materias
            </div>
            <h2
              style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: "2rem",
                color: NAVY, margin: "4px 0 0", lineHeight: 1.1,
              }}
            >
              Tus 12 materias en ruta
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {rest.map((m) => (
            <MateriaCard key={m.slug} m={m} variant="plain" />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .fp-hero-grid, .fp-split-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .fp-hero-grid h1 { font-size: 2.4rem !important; }
        }
      `}</style>
    </div>
  );
}
