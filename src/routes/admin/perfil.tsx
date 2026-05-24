import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/perfil")({
  component: AdminPerfilPage,
});

type ModalType = "wa" | "extend" | "garantia" | "change" | "cancel" | "reset" | null;

const ADMIN_NAV = [
  { label: "Panel", items: [
    { icon: "📊", label: "Resumen",    path: "/admin" },
    { icon: "👥", label: "Estudiantes", path: "/admin/perfil", active: true },
  ]},
  { label: "Contenido", items: [
    { icon: "❓", label: "Banco de preguntas",     path: "/admin" },
    { icon: "🎬", label: "Clases y materiales",    path: "/admin" },
  ]},
  { label: "Comunicación", items: [
    { icon: "💬", label: "WhatsApp", path: "/admin" },
  ]},
  { label: "Cuenta", items: [
    { icon: "⚙️", label: "Configuración",    path: "/admin" },
    { icon: "👁️", label: "Ver como estudiante", path: "/dashboard" },
  ]},
];

const MATERIAS = [
  { n: "✈️ Aerodinámica",       p: 84, c: "#2ecc71" },
  { n: "⚙️ Aeronaves y Motores",p: 55, c: "#3D5D91" },
  { n: "⚖️ Legislación",        p: 70, c: "#f39c12" },
  { n: "🏥 Medicina de Aviación",p:88, c: "#2ecc71" },
  { n: "🌤️ Meteorología",       p: 35, c: "#e74c3c" },
  { n: "🗺️ Navegación Aérea",   p: 20, c: "#e74c3c" },
  { n: "🗼 Tránsito Aéreo",     p: 60, c: "#f39c12" },
  { n: "📻 Comunicaciones",     p: 45, c: "#3D5D91" },
  { n: "📋 Manuales AIP",       p: 50, c: "#3D5D91" },
  { n: "🧠 Factores Humanos",   p: 75, c: "#3D5D91" },
  { n: "🛡️ Seguridad Aérea",    p: 65, c: "#f39c12" },
  { n: "🛫 Operaciones",        p: 40, c: "#3D5D91" },
];

const ACTIVITY = [
  { icon: "❓", bg: "rgba(61,93,145,.08)",  title: "Cuestionario — Meteorología",      sub: "50 preguntas · Aprendiendo",    score: 82, sc: "#2ecc71", time: "Hoy" },
  { icon: "🃏", bg: "rgba(90,134,203,.1)",  title: "Flashcards — Fuerzas en vuelo",    sub: "8 tarjetas · 6 dominadas",      score: 75, sc: "#2ecc71", time: "Hoy" },
  { icon: "📝", bg: "rgba(108,8,32,.08)",   title: "Simulador CIAAC completo",         sub: "310 preguntas · 4h 32min",       score: 68, sc: "#f39c12", time: "Hace 2 días" },
  { icon: "❓", bg: "rgba(61,93,145,.08)",  title: "Cuestionario — Todas las materias",sub: "30 preguntas",                   score: 90, sc: "#2ecc71", time: "Hace 3 días" },
  { icon: "📝", bg: "rgba(108,8,32,.08)",   title: "Simulador CIAAC completo",         sub: "310 preguntas · 4h 18min",       score: 65, sc: "#f39c12", time: "Hace 7 días" },
];

function AdminPerfilPage() {
  const [modal, setModal] = useState<ModalType>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState(
    "- Tiene el CIAAC programado para el 17 de agosto 2026.\n- Le cuesta mucho Meteorología — especialmente METAR y TAF.\n- Muy constante, lleva 14 días seguidos de racha.\n- Pendiente: activar garantía si no mejora en el próximo simulador."
  );
  const [waMsg, setWaMsg] = useState(
    "Hola María! Soy Yaris de FlightPath 👋 Vi que llevas 14 días de racha — ¡eso es increíble! Sigue así, estás muy cerca de dominar el CIAAC. ✈️"
  );
  const [extendDays, setExtendDays] = useState("30");
  const [extendReason, setExtendReason] = useState("Activación de garantía");
  const [garantiaDays, setGarantiaDays] = useState("30");
  const [newPlan, setNewPlan] = useState("Plan Anual — $10,000 MXN");

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  };

  const handleModal = (action: string) => {
    setModal(null);
    if (action === "wa")       showFlash("✅ Mensaje enviado por WhatsApp");
    if (action === "extend")   showFlash(`✅ Acceso extendido ${extendDays} días`);
    if (action === "garantia") showFlash("✅ Garantía activada. María recibió un WhatsApp.");
    if (action === "change")   showFlash("✅ Plan actualizado correctamente");
    if (action === "cancel")   showFlash("Acceso cancelado");
    if (action === "reset")    showFlash("✅ Link de recuperación enviado");
    if (action === "note")     showFlash("✅ Nota guardada correctamente");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 13px", border: "2px solid #F2DCDB",
    borderRadius: 8, fontSize: ".86rem", fontFamily: "'DM Sans',sans-serif",
    outline: "none", color: "#1a1a2e", background: "white",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f5f7fc" }}>

      {/* Flash */}
      {flash && (
        <div style={{ position: "fixed", top: 72, right: 24, background: flash.includes("cancelado") ? "#e74c3c" : "#2ecc71", color: "white", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", zIndex: 400, boxShadow: "0 4px 16px rgba(0,0,0,.2)" }}>
          {flash}
        </div>
      )}

      {/* Modal backdrop */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 26, maxWidth: 440, width: "100%" }}>

            {modal === "wa" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>💬 Enviar WhatsApp</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18, lineHeight: 1.5 }}>El mensaje llegará al +52 55 1234 5678 de María González.</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 5, display: "block" }}>Mensaje</label>
                <textarea value={waMsg} onChange={(e) => setWaMsg(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
                <button onClick={() => handleModal("wa")} style={{ ...confirmBtnStyle, background: "#25D366" }}>💬 Enviar</button>
              </div>
            </>)}

            {modal === "extend" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>📅 Extender acceso</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18, lineHeight: 1.5 }}>El plan actual vence el <strong>5 de febrero 2027</strong>. ¿Cuántos días adicionales quieres darle?</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 5, display: "block" }}>Días adicionales</label>
                <input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min="1" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 5, display: "block" }}>Motivo</label>
                <select value={extendReason} onChange={(e) => setExtendReason(e.target.value)} style={inputStyle}>
                  <option>Activación de garantía</option>
                  <option>Cortesía</option>
                  <option>Error técnico</option>
                  <option>Otro</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
                <button onClick={() => handleModal("extend")} style={confirmBtnStyle}>📅 Extender acceso</button>
              </div>
            </>)}

            {modal === "garantia" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>⚠️ Activar garantía de mejora</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18, lineHeight: 1.5 }}>Al activar la garantía, María recibirá <strong>30 días adicionales de acceso sin costo</strong>. Se le enviará un WhatsApp notificándole.</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 5, display: "block" }}>Días de extensión</label>
                <input type="number" value={garantiaDays} onChange={(e) => setGarantiaDays(e.target.value)} min="1" style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
                <button onClick={() => handleModal("garantia")} style={confirmBtnStyle}>✅ Activar garantía</button>
              </div>
            </>)}

            {modal === "change" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>🔄 Cambiar plan</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18 }}>Selecciona el nuevo plan para María González.</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 5, display: "block" }}>Nuevo plan</label>
                <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} style={inputStyle}>
                  <option>Plan Anual — $10,000 MXN</option>
                  <option>Plan Semestral — $6,000 MXN</option>
                  <option>Plan Mensual — $1,500 MXN</option>
                  <option>Acceso gratuito (cortesía)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
                <button onClick={() => handleModal("change")} style={confirmBtnStyle}>🔄 Cambiar plan</button>
              </div>
            </>)}

            {modal === "cancel" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>⚠️ Cancelar acceso</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18, lineHeight: 1.5 }}>¿Estás segura de que quieres cancelar el acceso de <strong>María González</strong>? Esta acción desactivará su cuenta inmediatamente.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>No, volver</button>
                <button onClick={() => handleModal("cancel")} style={{ ...confirmBtnStyle, background: "#e74c3c" }}>Sí, cancelar acceso</button>
              </div>
            </>)}

            {modal === "reset" && (<>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: 6 }}>🔑 Resetear contraseña</h2>
              <p style={{ fontSize: ".84rem", color: "#888", marginBottom: 18, lineHeight: 1.5 }}>Se enviará un link de recuperación al correo <strong>maria.gonzalez@email.com</strong> y un aviso por WhatsApp.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={cancelBtnStyle}>Cancelar</button>
                <button onClick={() => handleModal("reset")} style={confirmBtnStyle}>🔑 Enviar link</button>
              </div>
            </>)}

          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ width: 220, background: "#1a1a2e", position: "fixed", top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column", zIndex: 200, transform: sidebarOpen ? "translateX(0)" : undefined }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#3D5D91", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: ".85rem" }}>F✈</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "white", fontWeight: 700 }}>Flight<span style={{ color: "#F2AEBC" }}>Path</span></span>
          <span style={{ background: "#6C0820", color: "white", fontSize: ".6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", letterSpacing: ".5px", marginLeft: "auto" }}>Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {ADMIN_NAV.map((sec) => (
            <div key={sec.label}>
              <div style={{ padding: "8px 16px", fontSize: ".6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,.3)", marginTop: 6 }}>{sec.label}</div>
              {sec.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.path as "/dashboard"}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, padding: "9px 16px",
                    color: item.active ? "white" : "rgba(255,255,255,.6)",
                    textDecoration: "none", fontSize: ".82rem", fontWeight: 500,
                    borderLeft: `3px solid ${item.active ? "#F2AEBC" : "transparent"}`,
                    background: item.active ? "rgba(61,93,145,.3)" : undefined,
                    transition: "all .2s",
                  }}
                >
                  <span style={{ fontSize: ".95rem", width: 18, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: "#6C0820", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: ".75rem", fontWeight: 700, flexShrink: 0 }}>Y</div>
          <div>
            <div style={{ fontSize: ".8rem", fontWeight: 700, color: "white" }}>Yaris</div>
            <div style={{ fontSize: ".66rem", color: "#F2AEBC" }}>Administradora</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="md:ml-[220px]">

        {/* Topbar */}
        <div style={{ height: 58, background: "white", borderBottom: "1px solid rgba(61,93,145,.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer", background: "none", border: "none", padding: 3 }} className="md:hidden">
              <span style={{ display: "block", width: 20, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
              <span style={{ display: "block", width: 20, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
              <span style={{ display: "block", width: 20, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
            </button>
            <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 5, color: "#888", fontSize: ".8rem", textDecoration: "none", padding: "5px 10px", borderRadius: 6, border: "1px solid #F2DCDB", transition: "all .2s" }}>← Estudiantes</Link>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", fontWeight: 700 }}>María González</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setModal("wa")} style={{ padding: "7px 14px", background: "#25D366", color: "white", border: "none", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>💬 Enviar WhatsApp</button>
            <button onClick={() => setModal("cancel")} style={{ padding: "7px 14px", background: "white", color: "#e74c3c", border: "2px solid #e74c3c", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancelar acceso</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", maxWidth: 900 }}>

          {/* Student hero */}
          <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", borderRadius: 18, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, marginBottom: 22, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "radial-gradient(circle,rgba(90,134,203,.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 900, color: "white", border: "3px solid rgba(255,255,255,.2)", flexShrink: 0, zIndex: 1 }}>MG</div>
            <div style={{ flex: 1, zIndex: 1, minWidth: 180 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "white", fontWeight: 900, marginBottom: 3 }}>María González Ramírez</div>
              <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)", marginBottom: 8 }}>maria.gonzalez@email.com · +52 55 1234 5678 💬</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: "#F2AEBC", color: "#6C0820" }}>✈ Plan Anual</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)" }}>🔥 14 días de racha</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 700, background: "rgba(46,204,113,.2)", color: "#7fffbe" }}>● Activa</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, zIndex: 1, flexShrink: 0 }}>
              {[{ num: "62%", lab: "Progreso" }, { num: "74%", lab: "Promedio" }, { num: "3", lab: "Simuladores" }].map((s) => (
                <div key={s.lab} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan card */}
          <div style={{ background: "linear-gradient(135deg,#3D5D91,#5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: 2 }}>✈️ Plan Anual — Activo</h3>
                <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.7)" }}>Desde el 5 de febrero 2026 · Vence el 5 de febrero 2027</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setModal("extend")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: "white", color: "#3D5D91", border: "none" }}>📅 Extender acceso</button>
                <button onClick={() => setModal("change")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}>🔄 Cambiar plan</button>
                <button onClick={() => setModal("cancel")} style={{ padding: "8px 14px", borderRadius: 8, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: "rgba(231,76,60,.2)", color: "#ffaaaa", border: "1px solid rgba(231,76,60,.3)" }}>✕ Cancelar</button>
              </div>
            </div>
          </div>

          {/* Garantía card */}
          <div style={{ background: "rgba(243,156,18,.06)", border: "2px solid rgba(243,156,18,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#8a6000", marginBottom: 3 }}>Garantía de mejora disponible</h4>
              <p style={{ fontSize: ".78rem", color: "#a07800", lineHeight: 1.5 }}>María completó su ruta de estudio pero no ha alcanzado el 80% en el simulador. Según la garantía de FlightPath, puedes extenderle el acceso sin costo adicional.</p>
            </div>
            <button onClick={() => setModal("garantia")} style={{ padding: "8px 16px", background: "#f39c12", color: "white", border: "none", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}>Activar garantía</button>
          </div>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { icon: "💬", label: "WhatsApp",   sub: "Enviar mensaje",       action: () => setModal("wa"),     hoverColor: "#25D366" },
              { icon: "📅", label: "Extender",    sub: "Más días de acceso",   action: () => setModal("extend"), hoverColor: "#3D5D91" },
              { icon: "🔑", label: "Contraseña",  sub: "Resetear acceso",      action: () => setModal("reset"),  hoverColor: "#3D5D91" },
            ].map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                style={{ padding: "14px 10px", borderRadius: 12, border: "2px solid #F2DCDB", background: "white", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "center", transition: "all .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = qa.hoverColor; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(61,93,145,.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: 5 }}>{qa.icon}</div>
                <div style={{ fontSize: ".76rem", fontWeight: 700, color: "#1a1a2e" }}>{qa.label}</div>
                <div style={{ fontSize: ".66rem", color: "#aaa", marginTop: 2 }}>{qa.sub}</div>
              </button>
            ))}
          </div>

          {/* Two col: Info + Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18, marginBottom: 20 }}>

            {/* Info personal */}
            <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>👤 Información personal</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Nombre",       value: "María González Ramírez" },
                  { label: "Correo",       value: "maria.gonzalez@email.com" },
                  { label: "WhatsApp",     value: "+52 55 1234 5678" },
                  { label: "Escuela",      value: "Esc. de Aviación del Pacífico" },
                  { label: "Perfil CIAAC", value: "Ala Fija — PAC" },
                  { label: "Fecha examen", value: "17 de agosto, 2026" },
                  { label: "Miembro desde",value: "5 de febrero, 2026" },
                  { label: "Último acceso",value: "Hoy, 10:24 AM" },
                ].map((f) => (
                  <div key={f.label}>
                    <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#aaa", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".4px" }}>{f.label}</span>
                    <div style={{ fontSize: ".86rem", color: "#1a1a2e", fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>🕐 Actividad reciente</div>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".85rem", flexShrink: 0, background: a.bg }}>{a.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                    <div style={{ fontSize: ".72rem", color: "#888" }}>{a.sub}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".95rem", fontWeight: 900, color: a.sc }}>{a.score}%</div>
                    <div style={{ fontSize: ".68rem", color: "#aaa" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materias progress */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>📚 Progreso por materia</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MATERIAS.map((m) => (
                <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: ".75rem", color: "#1a1a2e", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.n}</span>
                  <div style={{ flex: 1, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 10, background: m.c, width: `${m.p}%`, transition: "width .6s ease" }} />
                  </div>
                  <span style={{ fontSize: ".72rem", fontWeight: 700, width: 34, textAlign: "right", flexShrink: 0, color: m.c }}>{m.p}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notas internas */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>📝 Notas internas</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas sobre este estudiante..."
              style={{ width: "100%", minHeight: 100, border: "2px solid #F2DCDB", borderRadius: 10, padding: "12px 14px", fontSize: ".85rem", fontFamily: "'DM Sans',sans-serif", color: "#1a1a2e", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: ".72rem", color: "#aaa" }}>Solo tú puedes ver estas notas · Última edición: hoy</span>
              <button onClick={() => handleModal("note")} style={{ padding: "7px 16px", background: "#3D5D91", color: "white", border: "none", borderRadius: 7, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>💾 Guardar nota</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: 10, background: "white", color: "#888",
  border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".84rem",
  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
};
const confirmBtnStyle: React.CSSProperties = {
  flex: 2, padding: 10, background: "#3D5D91", color: "white",
  border: "none", borderRadius: 8, fontSize: ".84rem",
  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
};
