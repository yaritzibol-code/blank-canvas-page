import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser, useStore, studentStats, materiaProgressPct, MATERIAS_DEF, getStudyDays } from "@/lib/store";
import { OnboardingModal } from "@/components/shared/OnboardingModal";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

interface MateriaItem {
  icon: string;
  name: string;
  pct: number;
  slug: string;
}

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const s: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "1.2rem",
    color: "#22375C",
  },
  card: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
    transition: "all 0.2s",
  },
};

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

function LiveCountdown({ fecha }: { fecha: string | null }) {
  const [cd, setCd] = useState(() => (fecha ? calcCountdown(fecha) : { d: 0, h: 0, m: 0, sec: 0 }));

  useEffect(() => {
    if (!fecha) return;
    setCd(calcCountdown(fecha));
    const t = setInterval(() => setCd(calcCountdown(fecha)), 1000);
    return () => clearInterval(t);
  }, [fecha]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const dateLabel = fecha
    ? new Date(`${fecha}T08:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div
      style={{
        background: "#3D5D91",
        color: "white",
        borderRadius: 16,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexShrink: 0,
      }}
    >
      <div>
        <strong
          style={{ display: "block", fontSize: "0.9rem", marginBottom: 2 }}
        >
          Próximo CIAAC
        </strong>
        {dateLabel && <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{dateLabel}</span>}
      </div>
      {fecha ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[
            { n: cd.d, l: "Días" },
            { n: cd.h, l: "Hrs" },
            { n: cd.m, l: "Min" },
            { n: cd.sec, l: "Seg" },
          ].map(({ n, l }) => (
            <div
              key={l}
              style={{
                textAlign: "center",
                background: "rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "6px 10px",
                minWidth: 44,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {l === "Días" ? cd.d : pad(n)}
              </span>
              <span
                style={{ fontSize: "0.6rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.85, padding: "14px 4px" }}>
          Configura tu fecha CIAAC en tu perfil
        </div>
      )}
    </div>
  );
}

function MateriaCard({ m }: { m: MateriaItem }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "white",
        borderRadius: 14,
        padding: 16,
        cursor: "pointer",
        border: `2px solid ${hov ? "#5A86CB" : "transparent"}`,
        transition: "all 0.2s",
        boxShadow: hov ? "0 8px 20px rgba(61,93,145,0.1)" : "0 2px 8px rgba(61,93,145,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ display: "flex", color: "#3D5D91" }}><Icon n={m.icon as never} size={20} /></span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#3D5D91",
            background: "rgba(61,93,145,0.08)",
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {m.pct}%
        </span>
      </div>
      <div
        style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", marginBottom: 8, lineHeight: 1.3 }}
      >
        {m.name}
      </div>
      <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
        <div
          style={{
            height: "100%",
            width: `${m.pct}%`,
            background: "linear-gradient(90deg, #3D5D91, #5A86CB)",
            borderRadius: 10,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[
          { label: "Material", path: `/dashboard/materias/${m.slug}` },
          { label: "Preguntas", path: `/dashboard/banco` },
          { label: "Flash", path: `/dashboard/flashcards` },
        ].map((btn) => (
          <Link
            key={btn.label}
            to={btn.path as "/dashboard"}
            style={{
              flex: 1, padding: "5px 0",
              border: "1px solid #F2DCDB", borderRadius: 6,
              fontSize: "0.7rem", fontWeight: 600, color: "#666",
              cursor: "pointer", background: "transparent",
              transition: "all 0.2s", textAlign: "center",
              textDecoration: "none", display: "block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3D5D91";
              e.currentTarget.style.color = "#3D5D91";
              e.currentTarget.style.background = "rgba(61,93,145,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#F2DCDB";
              e.currentTarget.style.color = "#666";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {btn.label}
          </Link>
        ))}
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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

  if (!user || !stats) return null;

  const firstName = user.nombre.split(" ")[0];
  const streak = stats.streak;
  const diasWord = streak === 1 ? "día" : "días";

  // Materia sugerida para "continuar": la de menor progreso con al menos 1 tema disponible,
  // o la primera si ninguna se ha tocado.
  const continueMateria =
    materias.slice().sort((a, b) => a.pct - b.pct).find((m) => m.pct < 100) ?? materias[0];
  const continueDesc = continueMateria
    ? continueMateria.pct === 0
      ? `${continueMateria.name} — empieza aquí`
      : `${continueMateria.name} — ${continueMateria.pct}% completado`
    : "Elige una materia para comenzar";
  const continuePath = continueMateria
    ? `/dashboard/materias/${continueMateria.slug}`
    : "/dashboard/materias";


  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "'Manrope', sans-serif" }}>

      {!user.onboardingDone && <OnboardingModal user={user} onDone={() => {}} />}

      {/* GREETING + COUNTDOWN */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "1.8rem",
              color: "#22375C",
              marginBottom: 4,
            }}
          >
            ¡{greeting}, <span style={{ color: "#6C0820" }}>{firstName}!</span>
          </h2>
          <p style={{ color: "#647DA0", fontSize: "0.9rem" }}>
            Llevas {streak} {diasWord} estudiando. ¡Pathy está muy orgullosa de ti!
          </p>
        </div>
        <LiveCountdown fecha={user.fechaCiaac} />
      </div>

      {/* PATHY WIDGET */}
      <div
        style={{
          background: "linear-gradient(135deg, #22375C, #2a2a4e)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ flexShrink: 0, display: "flex", color: "white" }}><Icon n="cloud" size={48} /></div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>
            ¡Modo Piloto activado, {firstName}!
          </h4>
          <p style={{ fontSize: "0.82rem", opacity: 0.7, lineHeight: 1.4, marginBottom: 10 }}>
            Llevas {streak} {diasWord} consecutivos estudiando. ¡Eres imparable! Sigue volando alto.
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {WEEK_DAYS.map((d, i) => (
              <div
                key={i}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i === todayIdx ? "#F2AEBC" : "rgba(61,93,145,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 700,
                  color: i === todayIdx ? "#6C0820" : "white",
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <span style={{ display: "flex", justifyContent: "center", color: "#F2AEBC" }}><Icon n="flame" size={30} /></span>
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#F2AEBC",
              lineHeight: 1,
              display: "block",
            }}
          >
            {streak}
          </span>
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{diasWord}</span>
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { icon: "chart", bg: "rgba(61,93,145,0.1)", value: `${stats.courseProgress}%`, label: "Progreso general" },
          { icon: "help", bg: "#F2DCDB", value: stats.answered.toLocaleString(), label: "Preguntas respondidas" },
          { icon: "check", bg: "rgba(52,168,83,0.1)", value: stats.avgScore !== null ? `${stats.avgScore}%` : "—", label: "Aciertos promedio" },
          { icon: "timer", bg: "rgba(255,152,0,0.1)", value: `${stats.studyHours}h`, label: "Tiempo de estudio" },
        ].map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
      >
        <h3 style={s.sectionTitle}>Accesos rápidos</h3>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}
      >
        <ActionCard
          primary
          icon="play"
          title="Continuar estudiando"
          desc={continueDesc}
          to={continuePath}
        />
        <ActionCard
          icon="help"
          title="Hacer cuestionario"
          desc={
            stats.quizCount > 0
              ? `${stats.quizCount} cuestionarios completados`
              : "Elige materia y cantidad de preguntas"
          }
          to="/dashboard/banco"
        />
        <ActionCard
          icon="sim"
          title="Examen simulado"
          desc={
            stats.simCount > 0
              ? `${stats.simCount} simulacros completados`
              : "Simula el CIAAC completo"
          }
          to="/simulador"
        />
      </div>

      {/* MATERIAS */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
      >
        <h3 style={s.sectionTitle}>Mis 12 materias</h3>
        <Link
          to="/dashboard/materias"
          style={{ fontSize: "0.82rem", color: "#3D5D91", textDecoration: "none", fontWeight: 600 }}
        >
          Ver todas →
        </Link>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}
      >
        {materias.map((m) => (
          <MateriaCard key={m.slug} m={m} />
        ))}
      </div>

    </div>
  );
}

function StatCard({
  icon, bg, value, label,
}: { icon: string; bg: string; value: string; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "white", borderRadius: 16, padding: 20,
        display: "flex", alignItems: "center", gap: 16,
        boxShadow: hov ? "0 8px 24px rgba(61,93,145,0.1)" : "0 2px 12px rgba(61,93,145,0.06)",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, background: bg, color: "#3D5D91",
        }}
      >
        <Icon n={icon as never} size={22} />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.5rem", fontWeight: 900,
            color: "#22375C", lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#647DA0", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function ActionCard({
  primary, icon, title, desc, to,
}: { primary?: boolean; icon: string; title: string; desc: string; to: string }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to as "/dashboard"}
      style={{ textDecoration: "none" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: primary ? (hov ? "#8a0a28" : "#6C0820") : "white",
          color: primary ? "white" : "#22375C",
          borderRadius: 16, padding: 20,
          display: "flex", alignItems: "center", gap: 16,
          cursor: "pointer",
          border: `2px solid ${primary ? "transparent" : hov ? "#3D5D91" : "transparent"}`,
          transition: "all 0.2s",
          boxShadow: hov ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 12px rgba(61,93,145,0.06)",
          transform: hov ? "translateY(-2px)" : "none",
          height: "100%",
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 12,
            background: primary ? "rgba(255,255,255,0.15)" : "#F2DCDB",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: primary ? "white" : "#6C0820",
          }}
        >
          <Icon n={icon as never} size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 2 }}>{title}</h3>
          <p style={{ fontSize: "0.78rem", color: primary ? "rgba(255,255,255,0.7)" : "#647DA0" }}>
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
