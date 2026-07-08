import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import {
  deleteReminder,
  getReminders,
  isPaid,
  nowISO,
  saveReminder as persistReminder,
  uid,
  updateUser,
  useSessionUser,
  useStore,
  type Reminder,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard/recordatorios")({
  component: RecordatoriosPage,
});

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const REMINDER_TYPES = [
  "Sesión de estudio diaria",
  "Hacer simulador",
  "Repasar flashcards",
  "Ver una clase grabada",
  "Reforzar materia específica",
  "Recordatorio de racha",
];

/** Icono y color suave por tipo de recordatorio. */
const TYPE_META: Record<string, { icon: string; bg: string; short: string }> = {
  "Sesión de estudio diaria":    { icon: "book",  bg: "rgba(61,93,145,.1)",  short: "Estudio" },
  "Hacer simulador":             { icon: "sim",   bg: "rgba(108,8,32,.08)",  short: "Simulador" },
  "Repasar flashcards":          { icon: "cards", bg: "rgba(90,134,203,.1)", short: "Repaso" },
  "Ver una clase grabada":       { icon: "play",  bg: "rgba(46,204,113,.1)", short: "Clase" },
  "Reforzar materia específica": { icon: "cloud", bg: "rgba(243,156,18,.1)", short: "Materia débil" },
  "Recordatorio de racha":       { icon: "flame", bg: "rgba(46,204,113,.1)", short: "Racha" },
  "Cuenta regresiva":            { icon: "calendar", bg: "rgba(61,93,145,.1)", short: "Cuenta regresiva" },
};
const DEFAULT_META = { icon: "bell", bg: "rgba(61,93,145,.1)", short: "Personalizado" };

function daysLabel(dias: boolean[]): string {
  if (dias.length >= 7 && dias.every(Boolean)) return "Todos los días";
  const sel = DAY_NAMES.filter((_, i) => dias[i]);
  return sel.length > 0 ? sel.join(", ") : "Sin días";
}

function hora12(h: string): string {
  const [hh, mm] = h.split(":").map(Number);
  if (Number.isNaN(hh)) return h;
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm ?? 0).padStart(2, "0")} ${ampm}`;
}

function maskPhone(p: string): string {
  const digits = (p || "").replace(/\D/g, "");
  if (digits.length < 6) return p || "Sin número";
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ••••••${digits.slice(-2)}`;
}

function computeCountdown(dateStr: string) {
  const target = new Date(dateStr + "T10:00:00");
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: "00", mins: "00" };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours: String(hours).padStart(2, "0"), mins: String(mins).padStart(2, "0") };
}

/** Overlay de candado (plan básico): visible pero bloqueado. */
function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50, borderRadius: 16,
      background: "rgba(245,247,252,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, textAlign: "center", padding: 20,
    }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(61,93,145,.3)" }}>
        <Icon n="lock" size={22} color="#fff" />
      </div>
      <button
        onClick={onUnlock}
        style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#6C0820", color: "white", fontSize: ".84rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
      >
        Desbloquear recordatorios
      </button>
    </div>
  );
}

function RecordatoriosPage() {
  const user = useSessionUser();
  const paid = isPaid(user);
  const reminders = useStore(() => (user ? getReminders(user.id) : []));

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showWhatsModal, setShowWhatsModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [examDate, setExamDate] = useState("2026-08-17");
  const [countdown, setCountdown] = useState(() => computeCountdown("2026-08-17"));
  const [reminderType, setReminderType] = useState("Sesión de estudio diaria");
  const [reminderTime, setReminderTime] = useState("19:00");
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]);
  const [whatsInput, setWhatsInput] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);

  const masked = maskPhone(user?.whatsapp ?? "");

  // Fecha inicial desde el perfil (fallback a la actual)
  useEffect(() => {
    if (user?.fechaCiaac) setExamDate(user.fechaCiaac);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.fechaCiaac]);

  useEffect(() => {
    setCountdown(computeCountdown(examDate));
    const interval = setInterval(() => setCountdown(computeCountdown(examDate)), 60000);
    return () => clearInterval(interval);
  }, [examDate]);

  const requirePaid = (fn: () => void) => {
    if (!paid) {
      setUpgradeOpen(true);
      return;
    }
    fn();
  };

  const toggleReminder = (r: Reminder) =>
    requirePaid(() => persistReminder({ ...r, enabled: !r.enabled }));

  const removeReminder = (id: string) => requirePaid(() => deleteReminder(id));

  const pauseAll = () =>
    requirePaid(() => reminders.forEach((r) => r.enabled && persistReminder({ ...r, enabled: false })));

  const toggleDay = (i: number) =>
    setSelectedDays((prev) => prev.map((d, idx) => idx === i ? !d : d));

  const openNewReminder = () =>
    requirePaid(() => {
      setEditingId(null);
      setReminderType("Sesión de estudio diaria");
      setReminderTime("19:00");
      setSelectedDays([true, true, true, true, true, true, true]);
      setShowReminderModal(true);
    });

  const openEditReminder = (r: Reminder) =>
    requirePaid(() => {
      setEditingId(r.id);
      setReminderType(r.tipo);
      setReminderTime(r.hora || "19:00");
      const dias = Array.from({ length: 7 }, (_, i) => !!r.dias?.[i]);
      setSelectedDays(dias);
      setShowReminderModal(true);
    });

  const saveReminder = () => {
    if (!user) return;
    const meta = TYPE_META[reminderType] ?? DEFAULT_META;
    const existing = editingId ? reminders.find((r) => r.id === editingId) : null;
    const rem: Reminder = {
      id: existing?.id ?? uid("rem"),
      userId: user.id,
      tipo: reminderType,
      titulo: reminderType,
      sub: `${daysLabel(selectedDays)} · ${hora12(reminderTime)}`,
      hora: reminderTime,
      dias: [...selectedDays],
      enabled: true,
      icon: meta.icon,
      iconBg: meta.bg,
      tags: [meta.short, hora12(reminderTime)],
      ultimoEnvio: existing?.ultimoEnvio ?? null,
      createdAt: existing?.createdAt ?? nowISO(),
    };
    persistReminder(rem);
    setEditingId(null);
    setShowReminderModal(false);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 3000);
  };

  const saveExamDate = () => {
    if (user) updateUser(user.id, { fechaCiaac: examDate });
    try {
      localStorage.setItem("fp_exam_date", examDate);
    } catch { /* noop */ }
    setShowDateModal(false);
  };

  const openWhatsModal = () => {
    setWhatsInput(user?.whatsapp ?? "");
    setShowWhatsModal(true);
  };

  const saveWhats = () => {
    const num = whatsInput.trim();
    if (user && num) updateUser(user.id, { whatsapp: num, whatsappEstado: "registrado" });
    setShowWhatsModal(false);
  };

  const closeModals = () => { setShowReminderModal(false); setShowDateModal(false); setShowWhatsModal(false); setEditingId(null); };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "2px solid #F2DCDB",
    borderRadius: 9, fontSize: ".88rem", fontFamily: "'Manrope', sans-serif", outline: "none",
    color: "#22375C", background: "white",
  };

  if (!user) return <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 720 }} />;

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 720 }}>

      {/* Modal backdrop */}
      {(showReminderModal || showDateModal || showWhatsModal) && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModals(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          {/* ── Reminder modal ── */}
          {showReminderModal && (
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, padding: 28, maxWidth: 460, width: "100%" }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="bell" size={22} color="#22375C" /> {editingId ? "Editar recordatorio" : "Nuevo recordatorio"}</h2>
              <p style={{ fontSize: ".84rem", color: "#647DA0", marginBottom: 22 }}>Configura cuándo quieres que te avisemos por WhatsApp</p>

              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: ".8rem", color: "#166534" }}>
                <Icon n="chat" size={16} color="#166534" /> <span>Este recordatorio llegará a tu WhatsApp al <strong>{masked}</strong></span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", marginBottom: 6, display: "block" }}>¿Para qué quieres el recordatorio?</label>
                <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} style={inputStyle}>
                  {!REMINDER_TYPES.includes(reminderType) && <option>{reminderType}</option>}
                  {REMINDER_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", marginBottom: 6, display: "block" }}>Hora</label>
                <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", marginBottom: 6, display: "block" }}>¿Qué días?</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {WEEK_DAYS.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      style={{
                        width: 38, height: 38, borderRadius: "50%",
                        border: `2px solid ${selectedDays[i] ? "#3D5D91" : "#F2DCDB"}`,
                        background: selectedDays[i] ? "#3D5D91" : "white",
                        color: selectedDays[i] ? "white" : "#647DA0",
                        fontSize: ".78rem", fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .2s", fontFamily: "'Manrope', sans-serif",
                      }}
                    >{d}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={closeModals} style={{ flex: 1, padding: 11, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                <button onClick={saveReminder} style={{ flex: 2, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Guardar recordatorio <Icon n="bell" size={16} /></button>
              </div>
            </div>
          )}

          {/* ── Date modal ── */}
          {showDateModal && (
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, padding: 28, maxWidth: 460, width: "100%" }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="plane" size={22} color="#22375C" /> Fecha del examen CIAAC</h2>
              <p style={{ fontSize: ".84rem", color: "#647DA0", marginBottom: 22 }}>¿Cuándo tienes programado tu examen?</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", marginBottom: 6, display: "block" }}>Fecha del examen</label>
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowDateModal(false)} style={{ flex: 1, padding: 11, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                <button onClick={saveExamDate} style={{ flex: 2, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Guardar fecha <Icon n="plane" size={16} /></button>
              </div>
            </div>
          )}

          {/* ── WhatsApp modal ── */}
          {showWhatsModal && (
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, padding: 28, maxWidth: 460, width: "100%" }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="chat" size={22} color="#22375C" /> Cambiar número de WhatsApp</h2>
              <p style={{ fontSize: ".84rem", color: "#647DA0", marginBottom: 22 }}>A este número te enviaremos tus recordatorios de estudio.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", marginBottom: 6, display: "block" }}>Número de WhatsApp</label>
                <input type="tel" value={whatsInput} onChange={(e) => setWhatsInput(e.target.value)} placeholder="+52 55 1234 5678" style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowWhatsModal(false)} style={{ flex: 1, padding: 11, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                <button onClick={saveWhats} style={{ flex: 2, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Guardar número <Icon n="chat" size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save flash */}
      {saveFlash && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#2ecc71", color: "white", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", zIndex: 200, boxShadow: "0 4px 16px rgba(46,204,113,.4)", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon n="check" size={16} /> ¡Recordatorio guardado!
        </div>
      )}

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", color: "#22375C", marginBottom: 4 }}>
            Mis <span style={{ color: "#6C0820" }}>Recordatorios</span>
          </h1>
          <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Configura avisos por WhatsApp para no perder tu racha.</p>
        </div>
        <button
          onClick={openNewReminder}
          style={{ padding: "9px 18px", background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 6 }}
        >
          + Nuevo recordatorio
        </button>
      </div>

      {/* Contenido gateable (PRD: visible pero bloqueado para básica) */}
      <div style={{ position: "relative" }}>

        {/* Countdown card */}
        <div style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 18, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, marginBottom: 24, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(242,174,188,.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ flexShrink: 0, zIndex: 1, color: "white" }}><Icon n="plane" size={42} /></div>
          <div style={{ flex: 1, zIndex: 1, minWidth: 200 }}>
            <div style={{ fontSize: ".7rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icon n="clock" size={14} /> Cuenta regresiva</div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", color: "white", marginBottom: 10 }}>
              Examen CIAAC — {new Date(examDate + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {[{ val: countdown.days, lab: "días" }, { val: countdown.hours, lab: "horas" }, { val: countdown.mins, lab: "min" }].map((u, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} style={{ fontSize: "1.4rem", color: "rgba(255,255,255,.3)", paddingTop: 4 }}>:</span>}
                  <div key={u.lab} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{u.val}</div>
                    <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.5)", textTransform: "uppercase" }}>{u.lab}</div>
                  </div>
                </>
              ))}
            </div>
          </div>
          <button
            onClick={() => requirePaid(() => setShowDateModal(true))}
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.8)", padding: "6px 14px", borderRadius: 8, fontSize: ".76rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif", zIndex: 1, whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Icon n="edit" size={14} /> Cambiar fecha
          </button>
        </div>

        {/* WhatsApp banner */}
        <div style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0, color: "white" }}><Icon n="chat" size={30} /></div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: ".88rem", fontWeight: 700, color: "white", marginBottom: 3 }}>Recordatorios por WhatsApp</div>
            <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.85)", lineHeight: 1.5 }}>Te mandaremos tus recordatorios directo a WhatsApp para que no se te pase ninguna sesión de estudio. ¡Sin descargar apps extra!</div>
          </div>
          <div style={{ flexShrink: 0, background: "rgba(255,255,255,.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.7)", marginBottom: 2 }}>Número registrado</div>
            <div style={{ fontSize: ".88rem", fontWeight: 700, color: "white" }}>{masked}</div>
            <div onClick={() => requirePaid(openWhatsModal)} style={{ fontSize: ".68rem", color: "rgba(255,255,255,.7)", marginTop: 2, cursor: "pointer", textDecoration: "underline" }}>Cambiar número</div>
          </div>
        </div>

        {/* Reminders list */}
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="bell" size={15} /> Mis recordatorios</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {reminders.map((r) => (
            <div
              key={r.id}
              style={{
                background: "white", borderRadius: 14, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 2px 8px rgba(61,93,145,.05)",
                border: "2px solid transparent",
                opacity: r.enabled ? 1 : 0.5,
                transition: "opacity .2s",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: r.iconBg, color: "#22375C" }}><Icon n={r.icon as never} size={20} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{r.titulo}</div>
                <div style={{ fontSize: ".75rem", color: "#647DA0" }}>{r.sub}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                  {r.tags.map((tag) => (
                    <span key={tag} style={{ padding: "2px 9px", borderRadius: 10, fontSize: ".68rem", fontWeight: 600, background: "#F2DCDB", color: "#6C0820" }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => openEditReminder(r)}
                  style={{ background: "none", border: "1px solid #F2DCDB", borderRadius: 7, padding: "5px 8px", fontSize: ".75rem", color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all .2s", display: "inline-flex", alignItems: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#647DA0"; }}
                ><Icon n="edit" size={15} /></button>
                <button
                  onClick={() => removeReminder(r.id)}
                  style={{ background: "none", border: "1px solid #F2DCDB", borderRadius: 7, padding: "5px 8px", fontSize: ".75rem", color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all .2s", display: "inline-flex", alignItems: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6C0820"; e.currentTarget.style.color = "#6C0820"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#647DA0"; }}
                ><Icon n="trash" size={15} /></button>
                {/* Toggle */}
                <div
                  onClick={() => toggleReminder(r)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative",
                    background: r.enabled ? "#3D5D91" : "#ddd",
                    transition: "background .2s", flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: "absolute", width: 18, height: 18, background: "white", borderRadius: "50%",
                    top: 3, left: r.enabled ? 23 : 3, transition: "left .2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                  }} />
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <div
            onClick={openNewReminder}
            style={{ background: "white", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(61,93,145,.05)", border: "2px dashed #F2DCDB", cursor: "pointer", color: "#8DA1BE", fontSize: ".88rem", fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; (e.currentTarget as HTMLElement).style.color = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; (e.currentTarget as HTMLElement).style.color = "#8DA1BE"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#6C0820" }}><Icon n="plus" size={20} /></div>
            <span>Agregar nuevo recordatorio</span>
          </div>

          {/* Pausar todos */}
          {reminders.some((r) => r.enabled) && (
            <button
              onClick={pauseAll}
              style={{ background: "none", border: "none", color: "#8DA1BE", fontSize: ".76rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", textDecoration: "underline", alignSelf: "flex-start", padding: 0 }}
            >
              Pausar todos
            </button>
          )}
        </div>

        {/* Pathy tips */}
        <div style={{ background: "linear-gradient(135deg,#F2DCDB,#fce4ec)", borderRadius: 14, padding: 18, marginBottom: 24 }}>
          <h3 style={{ fontSize: ".88rem", fontWeight: 700, color: "#6C0820", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="cloud" size={18} /> Consejos de Pathy para mantener tu racha</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Estudia siempre a la misma hora — tu cerebro lo convertirá en hábito automático en 21 días.",
              "30 minutos diarios constantes son más efectivos que 3 horas esporádicas. La consistencia es la clave.",
              "Pon tu teléfono donde lo veas cuando llegues del trabajo/escuela — ese será tu recordatorio visual.",
              "Si un día no puedes estudiar mucho, haz aunque sea 5 flashcards — lo importante es no romper la racha.",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: ".82rem", color: "#555", lineHeight: 1.5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C0820", flexShrink: 0, marginTop: 6 }} />
                {tip}
              </div>
            ))}
          </div>
        </div>

        {!paid && <LockOverlay onUnlock={() => setUpgradeOpen(true)} />}
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Recordatorios por WhatsApp"
        benefit="Recibe avisos de estudio, simulador y racha directo en tu WhatsApp para no perder el ritmo."
        userId={user.id}
      />
    </div>
  );
}
