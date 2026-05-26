import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const MATERIAS = [
  { icon: "✈️", name: "Aerodinámica", pct: 78, slug: "aerodinamica" },
  { icon: "⚙️", name: "Aeronaves y Motores", pct: 55, slug: "aeronaves-motores" },
  { icon: "⚖️", name: "Legislación Aeronáutica", pct: 90, slug: "legislacion" },
  { icon: "🏥", name: "Medicina de Aviación", pct: 40, slug: "medicina" },
  { icon: "🌤️", name: "Meteorología", pct: 25, slug: "meteorologia" },
  { icon: "🗺️", name: "Navegación Aérea", pct: 60, slug: "navegacion" },
  { icon: "🛫", name: "Operaciones Aeronáuticas", pct: 15, slug: "operaciones" },
  { icon: "📻", name: "Comunicaciones Aeronáuticas", pct: 0, slug: "comunicaciones" },
  { icon: "📋", name: "Manuales de Información Aeronáutica", pct: 0, slug: "manuales-ais" },
  { icon: "🗼", name: "Servicios de Tránsito Aéreo", pct: 0, slug: "servicios-transito" },
  { icon: "🧠", name: "Factores Humanos", pct: 0, slug: "factores-humanos" },
  { icon: "🛡️", name: "Seguridad Aérea", pct: 0, slug: "seguridad-aerea" },
];

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const s: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.2rem",
    color: "#1a1a2e",
  },
  card: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
    transition: "all 0.2s",
  },
};

function LiveCountdown() {
  const EXAM_DATE = new Date("2026-08-17T08:00:00");

  const calc = () => {
    const diff = EXAM_DATE.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, sec: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      sec: Math.floor((diff % 60000) / 1000),
    };
  };

  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

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
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>17 de agosto, 2026</span>
      </div>
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
                fontFamily: "'Playfair Display', serif",
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
    </div>
  );
}

function MateriaCard({ m }: { m: typeof MATERIAS[0] }) {
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
        <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
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
        style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 8, lineHeight: 1.3 }}
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
          { label: "📖 Material", path: `/dashboard/materias/${m.slug}` },
          { label: "❓ Preguntas", path: `/dashboard/banco` },
          { label: "🃏 Flash", path: `/dashboard/flashcards` },
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
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>

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
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.8rem",
              color: "#1a1a2e",
              marginBottom: 4,
            }}
          >
            ¡{greeting}, <span style={{ color: "#6C0820" }}>María!</span> ✈️
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Llevas 14 días estudiando. ¡Pathy está muy orgullosa de ti!
          </p>
        </div>
        <LiveCountdown />
      </div>

      {/* PATHY WIDGET */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #2a2a4e)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: "3rem", flexShrink: 0 }}>☁️</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>
            ¡Modo Piloto activado, María! 🧢
          </h4>
          <p style={{ fontSize: "0.82rem", opacity: 0.7, lineHeight: 1.4, marginBottom: 10 }}>
            Llevas 14 días consecutivos estudiando. ¡Eres imparable! Sigue volando alto.
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
          <span style={{ fontSize: "2rem", display: "block" }}>🔥</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#F2AEBC",
              lineHeight: 1,
              display: "block",
            }}
          >
            14
          </span>
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>días</span>
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
        className="grid-cols-2 md:grid-cols-4"
      >
        {[
          { icon: "📊", bg: "rgba(61,93,145,0.1)", value: "42%", label: "Progreso general" },
          { icon: "❓", bg: "#F2DCDB", value: "1,240", label: "Preguntas respondidas" },
          { icon: "✅", bg: "rgba(52,168,83,0.1)", value: "74%", label: "Aciertos promedio" },
          { icon: "⏱️", bg: "rgba(255,152,0,0.1)", value: "23h", label: "Tiempo de estudio" },
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
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}
        className="grid-cols-1 md:grid-cols-3"
      >
        <ActionCard
          primary
          icon="▶️"
          title="Continuar estudiando"
          desc="Aerodinámica — Tema 4: Sustentación"
          to="/dashboard/materias/aerodinamica"
        />
        <ActionCard
          icon="❓"
          title="Hacer cuestionario"
          desc="Elige materia y cantidad de preguntas"
          to="/dashboard/banco"
        />
        <ActionCard
          icon="📝"
          title="Examen simulado"
          desc="310 preguntas · 5 horas · CIAAC real"
          to="/dashboard/simulador"
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
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MATERIAS.map((m) => (
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
          fontSize: "1.3rem", flexShrink: 0, background: bg,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem", fontWeight: 900,
            color: "#1a1a2e", lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{label}</div>
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
          color: primary ? "white" : "#1a1a2e",
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
            fontSize: "1.4rem", flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 2 }}>{title}</h3>
          <p style={{ fontSize: "0.78rem", color: primary ? "rgba(255,255,255,0.7)" : "#888" }}>
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
