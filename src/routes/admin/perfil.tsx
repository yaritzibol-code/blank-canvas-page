/** Panel Admin — Perfil de estudiante (PRD 9.4/9.5): datos y acciones reales. */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  AdminShell,
  ACCESS_COLOR,
  ACCESS_LABEL,
  cancelBtnStyle,
  cardHeadStyle,
  cardStyle,
  confirmBtnStyle,
  Flash,
  fmtDate,
  fmtDateTime,
  inputStyle,
  labelStyle,
  Modal,
  modalSubStyle,
  modalTitleStyle,
  scoreColor,
  timeAgo,
  useFlash,
  activityVisual,
} from "@/components/admin/AdminShell";
import {
  getAccessChanges,
  getStreak,
  getUserById,
  getUsers,
  logAccessChange,
  materiaPerformance,
  recentActivity,
  resetPassword,
  studentStats,
  updateUser,
  useStore,
  type User,
} from "@/lib/store";

export const Route = createFileRoute("/admin/perfil")({
  component: AdminPerfilPage,
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
});

type ModalType = "wa" | "extend" | "garantia" | "change" | "cancel" | "reset" | null;

const PLAN_BASICA = "Suscripción básica";
const PLAN_ANUAL = "Plan Anual — $10,000 MXN";
const PLAN_PRUEBA = "Acceso de prueba";

function AdminPerfilPage() {
  const { id } = Route.useSearch();

  const student: User | null = useStore(() => {
    const byId = id ? getUserById(id) : null;
    if (byId) return byId;
    return getUsers().find((u) => u.role === "student") ?? null;
  });

  const stats = useStore(() => (student ? studentStats(student.id) : null));
  const streak = useStore(() => (student ? getStreak(student.id) : 0));
  const perf = useStore(() => (student ? materiaPerformance(student.id) : []));
  const activity = useStore(() => (student ? recentActivity(student.id, 5) : []));
  const changes = useStore(() => (student ? getAccessChanges(student.id) : []));

  const [modal, setModal] = useState<ModalType>(null);
  const { flash, showFlash } = useFlash();
  const [notes, setNotes] = useState("");
  const [waMsg, setWaMsg] = useState("");
  const [extendDays, setExtendDays] = useState("30");
  const [extendReason, setExtendReason] = useState("Activación de garantía");
  const [garantiaDays, setGarantiaDays] = useState("30");
  const [newPlan, setNewPlan] = useState(PLAN_ANUAL);

  const firstName = student?.nombre.split(" ")[0] ?? "";

  // Precarga los datos editables cuando cambia el estudiante.
  useEffect(() => {
    if (!student) return;
    setNotes(student.notasInternas ?? "");
    setWaMsg(
      `Hola ${firstName}! Soy Yaris de FlightPath. ${streak > 0 ? `Vi que llevas ${streak} ${streak === 1 ? "día" : "días"} de racha — ¡sigue así!` : "Te extrañamos por la plataforma."} Estás cada vez más cerca de dominar el CIAAC.`,
    );
    setNewPlan(student.planNombre === PLAN_BASICA ? PLAN_BASICA : student.planNombre === PLAN_PRUEBA ? PLAN_PRUEBA : PLAN_ANUAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  /* ───────── Acciones reales ───────── */

  const doExtend = () => {
    if (!student) return;
    const days = Math.max(1, parseInt(extendDays, 10) || 0);
    const base = student.accessEnd ? new Date(student.accessEnd) : new Date();
    updateUser(student.id, {
      accessEnd: new Date(base.getTime() + days * 86400000).toISOString(),
      accessStatus: "extendido",
    });
    logAccessChange(student.id, "Extender acceso", `${days} días — ${extendReason}`);
    setModal(null);
    showFlash(`Acceso extendido ${days} días`);
  };

  const doGarantia = () => {
    if (!student) return;
    const days = Math.max(1, parseInt(garantiaDays, 10) || 30);
    const base = student.accessEnd ? new Date(student.accessEnd) : new Date();
    updateUser(student.id, {
      accessEnd: new Date(base.getTime() + days * 86400000).toISOString(),
      accessStatus: "extendido",
    });
    logAccessChange(student.id, "Garantía activada", `${days} días adicionales de acceso sin costo`);
    setModal(null);
    showFlash("Garantía activada correctamente");
  };

  const doChangePlan = () => {
    if (!student) return;
    let patch: Partial<User>;
    if (newPlan === PLAN_BASICA) {
      patch = { plan: "basica", planNombre: PLAN_BASICA, accessStatus: "activo", accessEnd: null };
    } else if (newPlan === PLAN_PRUEBA) {
      patch = { plan: "paga", planNombre: PLAN_PRUEBA, accessStatus: "prueba", accessEnd: new Date(Date.now() + 14 * 86400000).toISOString() };
    } else {
      patch = { plan: "paga", planNombre: "Plan Anual", accessStatus: "activo", accessEnd: new Date(Date.now() + 365 * 86400000).toISOString() };
    }
    updateUser(student.id, patch);
    logAccessChange(student.id, "Cambio de plan", newPlan);
    setModal(null);
    showFlash("Plan actualizado correctamente");
  };

  const doPauseToggle = () => {
    if (!student) return;
    const paused = student.accessStatus === "pausado";
    updateUser(student.id, { accessStatus: paused ? "activo" : "pausado" });
    logAccessChange(student.id, paused ? "Reactivar acceso" : "Pausar acceso", paused ? "Acceso reactivado por la administradora" : "Acceso pausado por la administradora");
    showFlash(paused ? "Acceso reactivado" : "Acceso pausado");
  };

  const doCancel = () => {
    if (!student) return;
    updateUser(student.id, { accessStatus: "cancelado" });
    logAccessChange(student.id, "Cancelar acceso", "Acceso cancelado por la administradora");
    setModal(null);
    showFlash("Acceso cancelado", true);
  };

  const doReset = () => {
    if (!student) return;
    const res = resetPassword(student.email, "flightpath123");
    if (res.ok) logAccessChange(student.id, "Reset de contraseña", "Contraseña temporal asignada");
    setModal(null);
    showFlash(res.ok ? "Contraseña temporal: flightpath123" : (res.error ?? "No se pudo restablecer la contraseña"), !res.ok);
  };

  const doWa = () => {
    if (!student) return;
    logAccessChange(student.id, "Mensaje WhatsApp", waMsg.slice(0, 80));
    setModal(null);
    showFlash("Mensaje registrado (el envío se activará con el proveedor de WhatsApp)");
  };

  const doSaveNotes = () => {
    if (!student) return;
    updateUser(student.id, { notasInternas: notes });
    showFlash("Nota guardada correctamente");
  };

  /* ───────── Render ───────── */

  if (!student) {
    return (
      <AdminShell title="Perfil de estudiante" active="estudiantes" backTo={{ label: "Estudiantes", to: "/admin/estudiantes" }} maxWidth={900}>
        <div style={cardStyle}>
          <p style={{ fontSize: ".86rem", color: "#647DA0" }}>No hay estudiantes registrados todavía.</p>
        </div>
      </AdminShell>
    );
  }

  const initials = student.nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const accessLabel = ACCESS_LABEL[student.accessStatus] ?? student.accessStatus;
  const accessColor = ACCESS_COLOR[student.accessStatus] ?? "#3D5D91";
  const isPaused = student.accessStatus === "pausado";

  const heroStats = [
    { num: `${stats?.courseProgress ?? 0}%`, lab: "Progreso" },
    { num: stats?.avgScore !== null && stats?.avgScore !== undefined ? `${stats.avgScore}%` : "—", lab: "Promedio" },
    { num: String(stats?.simCount ?? 0), lab: "Simuladores" },
  ];

  const infoFields = [
    { label: "Nombre", value: student.nombre },
    { label: "Correo", value: student.email },
    { label: "WhatsApp", value: student.whatsapp || "—" },
    { label: "Escuela", value: student.escuela || "—" },
    { label: "Perfil CIAAC", value: student.perfilCiaac || "—" },
    { label: "Fecha examen", value: student.fechaCiaac ? fmtDate(student.fechaCiaac) : "—" },
    { label: "Miembro desde", value: fmtDate(student.createdAt) },
    { label: "Último acceso", value: timeAgo(student.lastAccess) },
  ];

  const barColor = (avg: number | null) => {
    if (avg === null) return "#8DA1BE";
    if (avg >= 80) return "#2ecc71";
    if (avg >= 60) return "#f39c12";
    if (avg >= 40) return "#3D5D91";
    return "#e74c3c";
  };

  return (
    <AdminShell
      title={student.nombre}
      active="estudiantes"
      backTo={{ label: "Estudiantes", to: "/admin/estudiantes" }}
      maxWidth={900}
      actions={
        <>
          <button onClick={() => setModal("wa")} style={{ padding: "7px 14px", background: "#25D366", color: "white", border: "none", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon n="chat" size={16} /> Enviar WhatsApp
          </button>
          <button onClick={() => setModal("cancel")} style={{ padding: "7px 14px", background: "white", color: "#e74c3c", border: "2px solid #e74c3c", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
            Cancelar acceso
          </button>
        </>
      }
    >
      <Flash flash={flash} />

      {/* ───────── Modales ───────── */}
      <Modal open={modal === "wa"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="chat" size={20} color="#6C0820" /> Enviar WhatsApp</h2>
        <p style={modalSubStyle}>El mensaje llegará al {student.whatsapp || "número registrado"} de {firstName}.</p>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Mensaje</label>
          <textarea value={waMsg} onChange={(e) => setWaMsg(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={doWa} style={{ ...confirmBtnStyle, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="chat" size={16} /> Enviar</button>
        </div>
      </Modal>

      <Modal open={modal === "extend"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="calendar" size={20} color="#6C0820" /> Extender acceso</h2>
        <p style={modalSubStyle}>
          {student.accessEnd ? (<>El plan actual vence el <strong>{fmtDate(student.accessEnd)}</strong>.</>) : (<>El plan actual no tiene fecha de vencimiento; la extensión contará <strong>desde hoy</strong>.</>)}{" "}
          ¿Cuántos días adicionales quieres darle?
        </p>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Días adicionales</label>
          <input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min="1" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Motivo</label>
          <select value={extendReason} onChange={(e) => setExtendReason(e.target.value)} style={inputStyle}>
            <option>Activación de garantía</option>
            <option>Cortesía</option>
            <option>Error técnico</option>
            <option>Otro</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={doExtend} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="calendar" size={16} /> Extender acceso</button>
        </div>
      </Modal>

      <Modal open={modal === "garantia"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="alert" size={20} color="#6C0820" /> Activar garantía de mejora</h2>
        <p style={modalSubStyle}>Al activar la garantía, {firstName} recibirá <strong>{garantiaDays || "30"} días adicionales de acceso sin costo</strong>. El cambio quedará registrado en el historial.</p>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Días de extensión</label>
          <input type="number" value={garantiaDays} onChange={(e) => setGarantiaDays(e.target.value)} min="1" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={doGarantia} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="check" size={16} /> Activar garantía</button>
        </div>
      </Modal>

      <Modal open={modal === "change"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="refresh" size={20} color="#6C0820" /> Cambiar plan</h2>
        <p style={modalSubStyle}>Selecciona el nuevo plan para {student.nombre}. Plan actual: <strong>{student.planNombre}</strong>.</p>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nuevo plan</label>
          <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} style={inputStyle}>
            <option>{PLAN_BASICA}</option>
            <option>{PLAN_ANUAL}</option>
            <option>{PLAN_PRUEBA}</option>
          </select>
        </div>
        <div style={{ marginBottom: 14, padding: "10px 12px", background: "rgba(61,93,145,.05)", borderRadius: 8, fontSize: ".76rem", color: "#647DA0", lineHeight: 1.5 }}>
          Plan Anual: 365 días desde hoy · Acceso de prueba: 14 días · Suscripción básica: sin vencimiento.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={doChangePlan} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="refresh" size={16} /> Cambiar plan</button>
        </div>
      </Modal>

      <Modal open={modal === "cancel"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="alert" size={20} color="#6C0820" /> Cancelar acceso</h2>
        <p style={modalSubStyle}>¿Estás segura de que quieres cancelar el acceso de <strong>{student.nombre}</strong>? Esta acción desactivará su cuenta inmediatamente.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>No, volver</button>
          <button onClick={doCancel} style={{ ...confirmBtnStyle, background: "#e74c3c" }}>Sí, cancelar acceso</button>
        </div>
      </Modal>

      <Modal open={modal === "reset"} onClose={() => setModal(null)}>
        <h2 style={modalTitleStyle}><Icon n="lock" size={20} color="#6C0820" /> Resetear contraseña</h2>
        <p style={modalSubStyle}>Se asignará la contraseña temporal <strong>flightpath123</strong> a la cuenta <strong>{student.email}</strong>. Pídele que la cambie al entrar.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={doReset} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="lock" size={16} /> Resetear contraseña</button>
        </div>
      </Modal>

      {/* ───────── Hero ───────── */}
      <div style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 18, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, marginBottom: 22, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "radial-gradient(circle,rgba(90,134,203,.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "white", border: "3px solid rgba(255,255,255,.2)", flexShrink: 0, zIndex: 1 }}>{initials}</div>
        <div style={{ flex: 1, zIndex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", color: "white", fontWeight: 900, marginBottom: 3 }}>{student.nombre}</div>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)", marginBottom: 8 }}>{student.email}{student.whatsapp ? ` · ${student.whatsapp}` : ""}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: "#F2AEBC", color: "#6C0820", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="plane" size={13} /> {student.planNombre}</span>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="flame" size={13} /> {streak} {streak === 1 ? "día" : "días"} de racha</span>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: `${accessColor}33`, color: "white" }}>● {accessLabel}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, zIndex: 1, flexShrink: 0 }}>
          {heroStats.map((s) => (
            <div key={s.lab} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────── Plan card ───────── */}
      <div style={{ background: "linear-gradient(135deg,#3D5D91,#5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: 2, display: "flex", alignItems: "center", gap: 7 }}><Icon n="plane" size={17} /> {student.planNombre} — {accessLabel}</h3>
            <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.7)" }}>
              Desde el {fmtDate(student.accessStart)} · {student.accessEnd ? `Vence el ${fmtDate(student.accessEnd)}` : "Sin fecha de vencimiento"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setModal("extend")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "white", color: "#3D5D91", border: "none", display: "flex", alignItems: "center", gap: 6 }}><Icon n="calendar" size={15} /> Extender acceso</button>
            <button onClick={() => setModal("change")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 6 }}><Icon n="refresh" size={15} /> Cambiar plan</button>
            <button onClick={doPauseToggle} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon n={isPaused ? "play" : "pause"} size={15} /> {isPaused ? "Reactivar" : "Pausar"}
            </button>
            <button onClick={() => setModal("cancel")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "rgba(231,76,60,.2)", color: "#ffaaaa", border: "1px solid rgba(231,76,60,.3)", display: "flex", alignItems: "center", gap: 6 }}><Icon n="close" size={15} /> Cancelar</button>
          </div>
        </div>
      </div>

      {/* ───────── Garantía card ───────── */}
      <div style={{ background: "rgba(243,156,18,.06)", border: "2px solid rgba(243,156,18,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}><Icon n="alert" size={24} color="#f39c12" /></div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#8a6000", marginBottom: 3 }}>Garantía de mejora disponible</h4>
          <p style={{ fontSize: ".78rem", color: "#a07800", lineHeight: 1.5 }}>Si {firstName} completó su ruta de estudio pero no ha alcanzado el 80% en el simulador, la garantía de FlightPath te permite extenderle el acceso 30 días sin costo adicional.</p>
        </div>
        <button onClick={() => setModal("garantia")} style={{ padding: "8px 16px", background: "#f39c12", color: "white", border: "none", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}>Activar garantía</button>
      </div>

      {/* ───────── Quick actions ───────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {([
          { icon: "chat" as FPIconName, label: "WhatsApp", sub: "Enviar mensaje", action: () => setModal("wa" as ModalType), hoverColor: "#25D366" },
          { icon: "calendar" as FPIconName, label: "Extender", sub: "Más días de acceso", action: () => setModal("extend" as ModalType), hoverColor: "#3D5D91" },
          { icon: "lock" as FPIconName, label: "Contraseña", sub: "Resetear acceso", action: () => setModal("reset" as ModalType), hoverColor: "#3D5D91" },
        ]).map((qa) => (
          <button
            key={qa.label}
            onClick={qa.action}
            style={{ padding: "14px 10px", borderRadius: 12, border: "2px solid #F2DCDB", background: "white", cursor: "pointer", fontFamily: "'Manrope', sans-serif", textAlign: "center", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = qa.hoverColor; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(61,93,145,.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ marginBottom: 5, display: "flex", justifyContent: "center" }}><Icon n={qa.icon} size={22} color="#22375C" /></div>
            <div style={{ fontSize: ".76rem", fontWeight: 700, color: "#22375C" }}>{qa.label}</div>
            <div style={{ fontSize: ".66rem", color: "#8DA1BE", marginTop: 2 }}>{qa.sub}</div>
          </button>
        ))}
      </div>

      {/* ───────── Two col: Info + Activity ───────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18, marginBottom: 20 }}>
        {/* Info personal */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}><Icon n="user" size={15} /> Información personal</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {infoFields.map((f) => (
              <div key={f.label}>
                <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#8DA1BE", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".4px" }}>{f.label}</span>
                <div style={{ fontSize: ".86rem", color: "#22375C", fontWeight: 500, overflowWrap: "anywhere" }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={cardStyle}>
          <div style={{ ...cardHeadStyle, marginBottom: 4 }}><Icon n="clock" size={15} /> Actividad reciente</div>
          {activity.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: "#8DA1BE", marginTop: 10 }}>Sin actividad registrada todavía.</p>
          ) : (
            activity.map((a, i) => {
              const vis = activityVisual(a.kind);
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < activity.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: vis.bg }}><Icon n={vis.icon} size={16} color="#22375C" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#22375C", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                    <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{a.durationMin > 0 ? `${a.durationMin} min` : "—"}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: ".95rem", fontWeight: 900, color: scoreColor(a.score) }}>{a.score !== null ? `${a.score}%` : "—"}</div>
                    <div style={{ fontSize: ".68rem", color: "#8DA1BE" }}>{timeAgo(a.date)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ───────── Materias progress ───────── */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={cardHeadStyle}><Icon n="book" size={15} /> Progreso por materia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {perf.map((m) => (
            <div key={m.slug} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: ".75rem", color: "#22375C", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n={m.icon as FPIconName} size={14} color="#647DA0" /> {m.name}
              </span>
              <div style={{ flex: 1, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 10, background: barColor(m.avg), width: `${m.avg ?? 0}%`, transition: "width .6s ease" }} />
              </div>
              <span style={{ fontSize: ".72rem", fontWeight: 700, width: 34, textAlign: "right", flexShrink: 0, color: barColor(m.avg) }}>{m.avg !== null ? `${m.avg}%` : "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───────── Notas internas ───────── */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ ...cardHeadStyle, marginBottom: 12 }}><Icon n="pencil" size={15} /> Notas internas</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agrega notas sobre este estudiante..."
          style={{ width: "100%", minHeight: 100, border: "2px solid #F2DCDB", borderRadius: 10, padding: "12px 14px", fontSize: ".85rem", fontFamily: "'Manrope', sans-serif", color: "#22375C", outline: "none", resize: "vertical", lineHeight: 1.6 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: ".72rem", color: "#8DA1BE" }}>Solo tú puedes ver estas notas</span>
          <button onClick={doSaveNotes} style={{ padding: "7px 16px", background: "#3D5D91", color: "white", border: "none", borderRadius: 7, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 6 }}><Icon n="check" size={15} /> Guardar nota</button>
        </div>
      </div>

      {/* ───────── Historial de cambios ───────── */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={cardHeadStyle}><Icon n="list" size={15} /> Historial de cambios</div>
        {changes.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Sin cambios registrados.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {changes.map((c, i) => (
              <div key={c.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < changes.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined, flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ fontSize: ".72rem", color: "#8DA1BE", width: 160, flexShrink: 0 }}>{fmtDateTime(c.fecha)}</span>
                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#22375C" }}>{c.accion}</span>
                <span style={{ fontSize: ".78rem", color: "#647DA0", flex: 1, minWidth: 160 }}>{c.detalle}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
