import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/perfil")({
  component: PerfilPage,
});

const PATHY_STAGES = [
  { emoji: "🌸", name: "Pathy Misty",      req: "1–3 días de racha",     state: "done" },
  { emoji: "🌺", name: "Pathy Cherry",     req: "4–6 días de racha",     state: "done" },
  { emoji: "💙", name: "Pathy Silver Lake",req: "7–13 días de racha",    state: "done" },
  { emoji: "☁️", name: "Pathy Lapis",      req: "14–30 días · Llevas 14",state: "current" },
  { emoji: "🍷", name: "Pathy Burgundy",   req: "30+ días de racha",     state: "locked" },
];

const LOGROS = [
  { icon: "🚀", name: "Primer vuelo",    desc: "Primera sesión",       locked: false },
  { icon: "🔥", name: "Racha de 7",      desc: "7 días seguidos",      locked: false },
  { icon: "💯", name: "100 preguntas",   desc: "Respondidas",          locked: false },
  { icon: "🎯", name: "Simulador",       desc: "Primer simulacro",     locked: false },
  { icon: "📚", name: "Lector",          desc: "Abrió la biblioteca",  locked: false },
  { icon: "🃏", name: "Flashmaster",     desc: "50 flashcards",        locked: false },
  { icon: "⭐", name: "Racha de 30",     desc: "30 días seguidos",     locked: true  },
  { icon: "🏅", name: "80% en sim",      desc: "Aprobar simulador",    locked: true  },
  { icon: "✈️", name: "Listo pa' volar", desc: "100% del curso",       locked: true  },
];

const MATERIAS = [
  { name: "✈️ Aerodinámica",       pct: 84, color: "#2ecc71" },
  { name: "⚙️ Aeronaves y Motores",pct: 55, color: "#3D5D91" },
  { name: "⚖️ Legislación",        pct: 70, color: "#f39c12" },
  { name: "🏥 Medicina",           pct: 88, color: "#2ecc71" },
  { name: "🌤️ Meteorología",       pct: 35, color: "#e74c3c" },
  { name: "🗺️ Navegación Aérea",   pct: 20, color: "#e74c3c" },
  { name: "🗼 Tránsito Aéreo",     pct: 60, color: "#f39c12" },
  { name: "📻 Comunicaciones",     pct: 45, color: "#3D5D91" },
  { name: "📋 Manuales AIP",       pct: 50, color: "#3D5D91" },
  { name: "🧠 Factores Humanos",   pct: 75, color: "#3D5D91" },
  { name: "🛡️ Seguridad Aérea",    pct: 65, color: "#f39c12" },
  { name: "🛫 Operaciones",        pct: 40, color: "#3D5D91" },
];

interface Info {
  nombre: string;
  email: string;
  whatsapp: string;
  escuela: string;
  ciaac: string;
  perfil: string;
}

function PerfilPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [info, setInfo] = useState<Info>({
    nombre: "María González Ramírez",
    email: "maria.gonzalez@email.com",
    whatsapp: "+52 55 1234 5678",
    escuela: "Escuela de Aviación del Pacífico",
    ciaac: "17 de agosto, 2026",
    perfil: "Ala Fija — Piloto Aviador Comercial",
  });
  const [draft, setDraft] = useState<Info>(info);

  const startEdit = () => { setDraft(info); setEditing(true); };
  const saveEdit = () => { setInfo(draft); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const fieldStyle: React.CSSProperties = {
    fontSize: ".88rem", color: "#1a1a2e", fontWeight: 500,
    padding: "9px 12px", borderRadius: 8, width: "100%",
    fontFamily: "'Manrope', sans-serif",
  };
  const displayStyle: React.CSSProperties = { ...fieldStyle, background: "#f8f9ff", border: "2px solid #F2DCDB" };
  const inputStyle: React.CSSProperties = { ...fieldStyle, background: "white", border: "2px solid #3D5D91", outline: "none" };

  const InfoField = ({ label, field }: { label: string; field: keyof Info }) => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#888", marginBottom: 5, display: "block" }}>{label}</label>
      {editing
        ? <input value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))} style={inputStyle} />
        : <div style={displayStyle}>{info[field]}</div>
      }
    </div>
  );

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 860 }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>

      {/* Save flash */}
      {saved && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#2ecc71", color: "white", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", zIndex: 200, boxShadow: "0 4px 16px rgba(46,204,113,.4)" }}>
          ✅ ¡Perfil actualizado!
        </div>
      )}

      {/* Edit button row */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={editing ? saveEdit : startEdit}
          style={{
            padding: "8px 18px", borderRadius: 9, fontSize: ".84rem", fontWeight: 700, cursor: "pointer",
            fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 6,
            background: editing ? "#3D5D91" : "white",
            color: editing ? "white" : "#3D5D91",
            border: "2px solid #3D5D91",
            transition: "all .2s",
          }}
        >
          {editing ? "💾 Guardar cambios" : "✏️ Editar perfil"}
        </button>
      </div>

      {/* Profile hero */}
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", gap: 24, marginBottom: 24, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(circle,rgba(90,134,203,.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2rem", fontWeight: 900, color: "white", border: "3px solid rgba(255,255,255,.2)" }}>MG</div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#F2AEBC", border: "2px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", cursor: "pointer" }}>📷</div>
        </div>

        <div style={{ flex: 1, zIndex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", color: "white", fontWeight: 900, marginBottom: 4 }}>{info.nombre.split(" ").slice(0, 2).join(" ")}</div>
          <div style={{ fontSize: ".82rem", color: "rgba(255,255,255,.5)", marginBottom: 10 }}>{info.email} · +52 55 ••••••78 💬</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "#F2AEBC", color: "#6C0820" }}>✈ Plan Anual</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)" }}>🔥 14 días de racha</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)" }}>Miembro desde Feb 2026</span>
          </div>
        </div>

        <div style={{ fontSize: "3.5rem", zIndex: 1, flexShrink: 0, animation: "float 3s ease-in-out infinite" }}>☁️</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "🔥", val: "14",   label: "Días de racha" },
          { icon: "❓", val: "1,240",label: "Preguntas respondidas" },
          { icon: "📝", val: "3",    label: "Simuladores hechos" },
          { icon: "⏱️", val: "48h",  label: "Tiempo de estudio" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "#1a1a2e", lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: ".72rem", color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plan card */}
      <div style={{ background: "linear-gradient(135deg,#3D5D91,#5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: 4 }}>✈️ Plan Anual — FlightPath</h3>
          <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.75)" }}>Acceso completo hasta el 5 de febrero 2027 · Renovación automática</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button style={{ padding: "9px 18px", background: "white", color: "#3D5D91", border: "none", borderRadius: 8, fontSize: ".82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Ver plan</button>
          <button style={{ padding: "9px 18px", background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, fontSize: ".82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cerrar sesión</button>
        </div>
      </div>

      {/* Two col: Pathy evolution + Logros */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18, marginBottom: 24 }}>

        {/* Pathy evolution */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>☁️ Evolución de Pathy</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PATHY_STAGES.map((stage) => (
              <div
                key={stage.name}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
                  border: stage.state === "current" ? "2px solid #3D5D91" : "2px solid transparent",
                  background: stage.state === "current" ? "rgba(61,93,145,.04)" : undefined,
                  opacity: stage.state === "locked" ? 0.3 : stage.state === "done" ? 0.6 : 1,
                  transition: "all .2s",
                }}
              >
                <div style={{ fontSize: "1.8rem", width: 44, textAlign: "center", flexShrink: 0 }}>{stage.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{stage.name}</div>
                  <div style={{ fontSize: ".74rem", color: "#888" }}>{stage.req}</div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: ".68rem", fontWeight: 700, flexShrink: 0,
                  background: stage.state === "current" ? "#3D5D91" : stage.state === "done" ? "#2ecc71" : "#F2DCDB",
                  color: stage.state === "locked" ? "#aaa" : "white",
                }}>
                  {stage.state === "current" ? "Actual" : stage.state === "done" ? "✓ Obtenido" : "🔒 Bloqueado"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logros */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>🏆 Logros desbloqueados</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {LOGROS.map((l) => (
              <div
                key={l.name}
                style={{
                  textAlign: "center", padding: "12px 8px", borderRadius: 10, background: "#f8f9ff",
                  opacity: l.locked ? 0.35 : 1,
                  filter: l.locked ? "grayscale(1)" : undefined,
                }}
              >
                <div style={{ fontSize: "1.6rem", marginBottom: 4 }}>{l.icon}</div>
                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2, lineHeight: 1.2 }}>{l.name}</div>
                <div style={{ fontSize: ".62rem", color: "#aaa" }}>{l.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materias progress */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>📚 Progreso por materia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MATERIAS.map((m) => (
            <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: ".78rem", color: "#1a1a2e", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
              <div style={{ flex: 1, height: 8, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 10, background: m.color, width: `${m.pct}%`, transition: "width .6s ease" }} />
              </div>
              <span style={{ fontSize: ".74rem", fontWeight: 700, width: 36, textAlign: "right", flexShrink: 0, color: m.color }}>{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Información personal */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>👤 Información personal</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <InfoField label="Nombre completo"       field="nombre"   />
            <InfoField label="Correo electrónico"    field="email"    />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <InfoField label="WhatsApp"              field="whatsapp" />
            <InfoField label="Escuela de aviación"   field="escuela"  />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <InfoField label="Fecha estimada del CIAAC" field="ciaac"  />
            <InfoField label="Perfil"                    field="perfil" />
          </div>
        </div>
      </div>
    </div>
  );
}
