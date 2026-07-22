import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { PlaneField } from "@/components/shared/PlaneField";
import {
  useSessionUser,
  useStore,
  updateUser,
  logout,
  studentStats,
  materiaPerformance,
  getActivity,
  getSimAttempts,
} from "@/lib/store";
import type { User, StudentStats } from "@/lib/store";

export const Route = createFileRoute("/dashboard/perfil")({
  component: PerfilPage,
});

const PATHY_STAGES_DEF = [
  { emoji: "spark",  name: "Pathy Misty",       max: 3,        req: "1–3 días de racha" },
  { emoji: "star",   name: "Pathy Cherry",      max: 6,        req: "4–6 días de racha" },
  { emoji: "heart",  name: "Pathy Silver Lake", max: 13,       req: "7–13 días de racha" },
  { emoji: "cloud",  name: "Pathy Lapis",       max: 30,       req: "14–30 días de racha" },
  { emoji: "trophy", name: "Pathy Burgundy",    max: Infinity, req: "30+ días de racha" },
];

function pathyStages(streak: number) {
  const idx = PATHY_STAGES_DEF.findIndex((s) => streak <= s.max);
  const cur = idx === -1 ? PATHY_STAGES_DEF.length - 1 : idx;
  return PATHY_STAGES_DEF.map((s, i) => ({
    emoji: s.emoji,
    name: s.name,
    req: i === cur ? `${s.req} · Llevas ${streak}` : s.req,
    state: i < cur ? "done" : i === cur ? "current" : "locked",
  }));
}

function buildLogros(stats: StudentStats, hasBiblioteca: boolean, sim80: boolean) {
  return [
    { icon: "rocket",      name: "Primer vuelo",    desc: "Primera sesión",       locked: stats.temasDone < 1 },
    { icon: "flame",       name: "Racha de 7",      desc: "7 días seguidos",      locked: stats.streak < 7 },
    { icon: "checkCircle", name: "100 preguntas",   desc: "Respondidas",          locked: stats.answered < 100 },
    { icon: "target",      name: "Simulador",       desc: "Primer simulacro",     locked: stats.simCount < 1 },
    { icon: "book",        name: "Lector",          desc: "Abrió la biblioteca",  locked: !hasBiblioteca },
    { icon: "cards",       name: "Flashmaster",     desc: "50 flashcards",        locked: stats.flashDominadas < 10 },
    { icon: "star",        name: "Racha de 30",     desc: "30 días seguidos",     locked: stats.streak < 30 },
    { icon: "medal",       name: "80% en sim",      desc: "Aprobar simulador",    locked: !sim80 },
    { icon: "plane",       name: "Listo pa' volar", desc: "100% del curso",       locked: stats.readiness === null || stats.readiness < 80 },
  ];
}

const colorFor = (avg: number | null) =>
  avg === null ? "#3D5D91" : avg >= 70 ? "#2ecc71" : avg >= 50 ? "#f39c12" : "#e74c3c";

const fmtFechaCiaac = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "—";

const maskPhone = (p: string) => {
  const t = p.trim();
  if (!t) return "";
  return `${t.slice(0, 6)} ••••••${t.slice(-2)}`;
};

const initialsOf = (nombre: string) => {
  const parts = nombre.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

interface Info {
  nombre: string;
  email: string;
  whatsapp: string;
  escuela: string;
  ciaac: string;
  perfil: string;
}

const buildInfo = (u: User | null): Info => ({
  nombre: u?.nombre ?? "",
  email: u?.email ?? "",
  whatsapp: u?.whatsapp ?? "",
  escuela: u?.escuela ?? "",
  ciaac: u ? fmtFechaCiaac(u.fechaCiaac) : "—",
  perfil: u?.perfilCiaac || "—",
});

function PerfilPage() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const stats = useStore(() => (user ? studentStats(user.id) : null));
  const materiasPerf = useStore(() => (user ? materiaPerformance(user.id) : []));
  const hasBiblioteca = useStore(() =>
    user ? getActivity(user.id).some((a) => a.kind === "biblioteca") : false,
  );
  const sim80 = useStore(() =>
    user ? getSimAttempts(user.id).some((a) => a.scorePct >= 80) : false,
  );

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [info, setInfo] = useState<Info>(() => buildInfo(user));
  const [draft, setDraft] = useState<Info>(info);

  if (!user || !stats) return null;

  const startEdit = () => {
    // En edición, la fecha CIAAC se maneja como "YYYY-MM-DD" (input type="date").
    setDraft({ ...buildInfo(user), ciaac: user.fechaCiaac ?? "" });
    setEditing(true);
  };
  const saveEdit = () => {
    updateUser(user.id, {
      nombre: draft.nombre.trim() || user.nombre,
      whatsapp: draft.whatsapp.trim(),
      escuela: draft.escuela.trim(),
      fechaCiaac: draft.ciaac || null,
    });
    setInfo({ ...draft, nombre: draft.nombre.trim() || user.nombre, ciaac: fmtFechaCiaac(draft.ciaac || null) });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stages = pathyStages(stats.streak);
  const logros = buildLogros(stats, hasBiblioteca, sim80);

  const memberSince = (() => {
    const d = new Date(user.createdAt).toLocaleDateString("es-MX", { month: "short", year: "numeric" });
    return d.charAt(0).toUpperCase() + d.slice(1);
  })();

  const verPlan = () => {
    navigate({ to: "/" });
    setTimeout(() => {
      document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  const cerrarSesion = () => {
    logout();
    navigate({ to: "/login" });
  };

  const fieldStyle: React.CSSProperties = {
    fontSize: ".88rem", color: "#22375C", fontWeight: 500,
    padding: "9px 12px", borderRadius: 8, width: "100%",
    fontFamily: "'Manrope', sans-serif",
  };
  const displayStyle: React.CSSProperties = { ...fieldStyle, background: "#f8f9ff", border: "2px solid #F2DCDB" };
  const inputStyle: React.CSSProperties = { ...fieldStyle, background: "white", border: "2px solid #3D5D91", outline: "none" };

  const infoField = (label: string, field: keyof Info, type: "text" | "date" = "text") => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#647DA0", marginBottom: 5, display: "block" }}>{label}</label>
      {editing
        ? <input type={type} value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))} style={inputStyle} />
        : <div style={displayStyle}>{info[field]}</div>
      }
    </div>
  );

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 860 }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>

      {/* Save flash */}
      {saved && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#2ecc71", color: "white", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", zIndex: 200, boxShadow: "0 4px 16px rgba(46,204,113,.4)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon n="check" size={16} /> ¡Perfil actualizado!
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
          {editing ? <><Icon n="download" size={15} /> Guardar cambios</> : <><Icon n="pencil" size={15} /> Editar perfil</>}
        </button>
      </div>

      {/* Profile hero */}
      <div style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", gap: 24, marginBottom: 24, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(circle,rgba(90,134,203,.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2rem", fontWeight: 900, color: "white", border: "3px solid rgba(255,255,255,.2)" }}>{initialsOf(info.nombre)}</div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#F2AEBC", border: "2px solid #22375C", display: "flex", alignItems: "center", justifyContent: "center", color: "#6C0820", cursor: "pointer" }}><Icon n="edit" size={13} /></div>
        </div>

        <div style={{ flex: 1, zIndex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", color: "white", fontWeight: 900, marginBottom: 4 }}>{info.nombre.split(" ").slice(0, 2).join(" ")}</div>
          <div style={{ fontSize: ".82rem", color: "rgba(255,255,255,.5)", marginBottom: 10 }}>{info.email}{user.whatsapp ? ` · ${maskPhone(user.whatsapp)}` : ""}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "#F2AEBC", color: "#6C0820", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="plane" size={13} /> {user.planNombre}</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="flame" size={13} /> {stats.streak} {stats.streak === 1 ? "día" : "días"} de racha</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)" }}>Miembro desde {memberSince}</span>
          </div>
        </div>

        <div style={{ zIndex: 1, flexShrink: 0, animation: "float 3s ease-in-out infinite", color: "rgba(255,255,255,.9)" }}><Icon n="cloud" size={56} /></div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "flame", val: String(stats.streak), label: "Días de racha" },
          { icon: "help",  val: stats.answered.toLocaleString(), label: "Preguntas respondidas" },
          { icon: "doc",   val: String(stats.simCount), label: "Simuladores hechos" },
          { icon: "timer", val: `${stats.studyHours}h`, label: "Tiempo de estudio" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", textAlign: "center" }}>
            <div style={{ marginBottom: 6, display: "flex", justifyContent: "center", color: "#3D5D91" }}><Icon n={s.icon as never} size={22} /></div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "#22375C", lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plan card */}
      <div style={{ background: "linear-gradient(135deg,#3D5D91,#5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n="plane" size={18} /> {user.planNombre} — FlightPath</h3>
          <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.75)" }}>
            {user.accessEnd
              ? `Acceso completo hasta el ${new Date(user.accessEnd).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`
              : "Acceso básico — actualiza tu plan"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={verPlan} style={{ padding: "9px 18px", background: "white", color: "#3D5D91", border: "none", borderRadius: 8, fontSize: ".82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Ver plan</button>
          <button onClick={cerrarSesion} style={{ padding: "9px 18px", background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, fontSize: ".82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cerrar sesión</button>
        </div>
      </div>

      {/* Two col: Pathy evolution + Logros */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18, marginBottom: 24 }}>

        {/* Pathy evolution */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n="cloud" size={15} /> Evolución de Pathy</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stages.map((stage) => (
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
                <div style={{ width: 44, display: "flex", justifyContent: "center", flexShrink: 0, color: "#22375C" }}><Icon n={stage.emoji as never} size={26} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{stage.name}</div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0" }}>{stage.req}</div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: ".68rem", fontWeight: 700, flexShrink: 0,
                  background: stage.state === "current" ? "#3D5D91" : stage.state === "done" ? "#2ecc71" : "#F2DCDB",
                  color: stage.state === "locked" ? "#8DA1BE" : "white",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  {stage.state === "current" ? "Actual" : stage.state === "done" ? <><Icon n="check" size={12} /> Obtenido</> : <><Icon n="lock" size={12} /> Bloqueado</>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logros */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n="trophy" size={15} /> Logros desbloqueados</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
            {logros.map((l) => (
              <div
                key={l.name}
                style={{
                  textAlign: "center", padding: "12px 8px", borderRadius: 10, background: "#f8f9ff",
                  opacity: l.locked ? 0.35 : 1,
                  filter: l.locked ? "grayscale(1)" : undefined,
                }}
              >
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center", color: "#3D5D91" }}><Icon n={l.icon as never} size={26} /></div>
                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#22375C", marginBottom: 2, lineHeight: 1.2 }}>{l.name}</div>
                <div style={{ fontSize: ".62rem", color: "#8DA1BE" }}>{l.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materias progress */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n="book" size={15} /> Progreso por materia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {materiasPerf.map((m) => {
            const color = colorFor(m.avg);
            return (
              <div key={m.slug} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: ".78rem", color: "#22375C", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n={m.icon as never} size={16} /> {m.name}</span>
                <div style={{ flex: 1, height: 8, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 10, background: color, width: `${m.avg ?? 0}%`, transition: "width .6s ease" }} />
                </div>
                <span style={{ fontSize: ".74rem", fontWeight: 700, width: 36, textAlign: "right", flexShrink: 0, color }}>{m.avg === null ? "—" : `${m.avg}%`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información personal */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon n="user" size={15} /> Información personal</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {infoField("Nombre completo", "nombre")}
            {infoField("Correo electrónico", "email")}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {infoField("WhatsApp", "whatsapp")}
            {infoField("Escuela de aviación", "escuela")}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {infoField("Fecha estimada del CIAAC", "ciaac", "date")}
            {infoField("Perfil", "perfil")}
          </div>
        </div>
      </div>
    </div>
  );
}
