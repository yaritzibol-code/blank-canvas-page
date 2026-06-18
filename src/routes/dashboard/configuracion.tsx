import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/configuracion")({
  component: ConfiguracionPage,
});

type ModalType = "password" | "phone" | "logout" | "delete" | null;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        position: "relative", background: on ? "#3D5D91" : "#ddd",
        transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18, background: "white",
        borderRadius: "50%", top: 3, left: on ? 23 : 3,
        transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)",
      }} />
    </div>
  );
}

function SectionHeader({ icon, iconBg, title, desc }: { icon: string; iconBg: string; title: string; desc: string }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(61,93,145,.06)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: ".74rem", color: "#888" }}>{desc}</div>
      </div>
    </div>
  );
}

function ConfigRow({
  icon, label, sub, right, onClick, danger = false,
}: {
  icon: string; label: string; sub: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "1px solid rgba(61,93,145,.04)",
        gap: 16, cursor: onClick ? "pointer" : "default",
        transition: "background .2s",
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = danger ? "rgba(231,76,60,.03)" : "#fafbff"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" as const, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: ".86rem", fontWeight: 600, color: danger ? "#e74c3c" : "#1a1a2e", marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: ".74rem", color: danger ? "rgba(231,76,60,.7)" : "#888" }}>{sub}</div>
        </div>
      </div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

function ConfiguracionPage() {
  const navigate = useNavigate();
  const [toggles, setToggles] = useState({
    whatsapp: true,
    racha: true,
    simulador: true,
    bitacora: true,
    pathy: true,
  });
  const [theme, setTheme] = useState<"claro" | "oscuro" | "sistema">("claro");
  const [textSize, setTextSize] = useState("Normal");
  const [modal, setModal] = useState<ModalType>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Modal states
  const [pwdActual, setPwdActual] = useState("");
  const [pwdNueva, setPwdNueva] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [phone, setPhone] = useState("+52 55 1234 5678");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const toggle = (key: keyof typeof toggles) =>
    setToggles((t) => ({ ...t, [key]: !t[key] }));

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  };

  const closeModal = () => {
    setModal(null);
    setPwdActual(""); setPwdNueva(""); setPwdConfirm("");
    setDeleteConfirm("");
  };

  const THEMES: { id: "claro" | "oscuro" | "sistema"; icon: string; label: string }[] = [
    { id: "claro", icon: "☀️", label: "Claro" },
    { id: "oscuro", icon: "🌙", label: "Oscuro" },
    { id: "sistema", icon: "📱", label: "Sistema" },
  ];

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 700 }}>
      <style>{`
        .cfg-row-hover:hover { background: #fafbff; }
        .danger-row-hover:hover { background: rgba(231,76,60,.03); }
        .theme-btn-sel { border-color: #3D5D91 !important; background: rgba(61,93,145,.06) !important; }
        .theme-btn:hover { border-color: #3D5D91; }
        .close-btn:hover { background: rgba(255,255,255,.08) !important; }
      `}</style>

      {/* Flash */}
      {flash && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#2ecc71", color: "white", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", zIndex: 400 }}>
          {flash}
        </div>
      )}

      {/* ── NOTIFICACIONES ── */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
        <SectionHeader icon="🔔" iconBg="rgba(37,211,102,.1)" title="Notificaciones" desc="Gestiona cómo y cuándo te avisamos" />
        <ConfigRow icon="💬" label="Recordatorios por WhatsApp" sub="Te mandamos tus recordatorios directo al +52 55 ••••••78" right={<Toggle on={toggles.whatsapp} onToggle={() => toggle("whatsapp")} />} />
        <ConfigRow icon="🔥" label="Alerta de racha en riesgo" sub="Aviso por WhatsApp si no has estudiado en el día" right={<Toggle on={toggles.racha} onToggle={() => toggle("racha")} />} />
        <ConfigRow icon="📝" label="Recordatorio del simulador semanal" sub="Cada domingo a las 10:00 AM" right={<Toggle on={toggles.simulador} onToggle={() => toggle("simulador")} />} />
        <ConfigRow icon="📓" label="Recordatorio de bitácora" sub="Pathy te pregunta cómo estuvo tu día al terminar de estudiar" right={<Toggle on={toggles.bitacora} onToggle={() => toggle("bitacora")} />} />
        <ConfigRow
          icon="⚙️" label="Gestionar todos los recordatorios" sub="Horarios, días y tipos de aviso"
          onClick={() => navigate({ to: "/dashboard/recordatorios" })}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
      </div>

      {/* ── APARIENCIA ── */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
        <SectionHeader icon="🎨" iconBg="rgba(61,93,145,.1)" title="Apariencia" desc="Personaliza cómo se ve FlightPath" />

        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" as const }}>🌗</span>
            <div>
              <div style={{ fontSize: ".86rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>Tema de la aplicación</div>
              <div style={{ fontSize: ".74rem", color: "#888" }}>Elige entre claro, oscuro o el del sistema</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 20px 14px" }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-btn ${theme === t.id ? "theme-btn-sel" : ""}`}
              onClick={() => setTheme(t.id)}
              style={{
                flex: 1, padding: 12, borderRadius: 10,
                border: `2px solid ${theme === t.id ? "#3D5D91" : "#F2DCDB"}`,
                cursor: "pointer", textAlign: "center" as const, transition: "all .2s",
                background: theme === t.id ? "rgba(61,93,145,.06)" : "white",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#1a1a2e" }}>{t.label}</div>
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(61,93,145,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(61,93,145,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" as const }}>🔤</span>
              <div>
                <div style={{ fontSize: ".86rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>Tamaño de texto</div>
                <div style={{ fontSize: ".74rem", color: "#888" }}>Para leer más cómodamente</div>
              </div>
            </div>
            <select
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
              style={{ border: "2px solid #F2DCDB", borderRadius: 8, padding: "6px 12px", fontSize: ".82rem", fontFamily: "'Manrope', sans-serif", color: "#1a1a2e", outline: "none", cursor: "pointer", background: "white" }}
            >
              <option>Normal</option>
              <option>Grande</option>
              <option>Muy grande</option>
            </select>
          </div>
          <ConfigRow icon="✨" label="Animaciones de Pathy" sub="Desactiva si prefieres menos movimiento" right={<Toggle on={toggles.pathy} onToggle={() => toggle("pathy")} />} />
        </div>
      </div>

      {/* ── SEGURIDAD ── */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
        <SectionHeader icon="🔒" iconBg="rgba(108,8,32,.08)" title="Seguridad" desc="Gestiona el acceso a tu cuenta" />
        <ConfigRow icon="🔑" label="Cambiar contraseña" sub="Última actualización: hace 3 meses" onClick={() => setModal("password")} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="💬" label="Cambiar número de WhatsApp" sub="+52 55 ••••••78" onClick={() => setModal("phone")} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" as const }}>📱</span>
            <div>
              <div style={{ fontSize: ".86rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>Sesiones activas</div>
              <div style={{ fontSize: ".74rem", color: "#888" }}>iPhone 14 · México City · Activo ahora</div>
            </div>
          </div>
          <button
            onClick={() => showFlash("✅ Todas las sesiones cerradas")}
            style={{ padding: "5px 12px", background: "white", border: "2px solid #F2DCDB", borderRadius: 7, fontSize: ".75rem", fontWeight: 700, color: "#888", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
          >
            Cerrar todo
          </button>
        </div>
      </div>

      {/* ── AYUDA ── */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
        <SectionHeader icon="❓" iconBg="rgba(61,93,145,.08)" title="Ayuda y soporte" desc="Estamos aquí para ayudarte" />
        <ConfigRow icon="📖" label="Centro de ayuda" sub="Preguntas frecuentes y tutoriales" onClick={() => {}} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="⭐" label="Enviar sugerencia o feedback" sub="Ayúdanos a mejorar FlightPath" onClick={() => {}} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="📄" label="Términos y privacidad" sub="Política de uso y datos" onClick={() => {}} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
      </div>

      {/* ── ZONA DE RIESGO ── */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(61,93,145,.06)", border: "2px solid rgba(231,76,60,.1)", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(231,76,60,.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(231,76,60,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>⚠️</div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#e74c3c", marginBottom: 2 }}>Zona de riesgo</div>
            <div style={{ fontSize: ".74rem", color: "#888" }}>Acciones irreversibles — piénsalo bien</div>
          </div>
        </div>
        <ConfigRow icon="🚪" label="Cerrar sesión" sub="Salir de tu cuenta en este dispositivo" onClick={() => setModal("logout")} danger right={<span style={{ fontSize: ".75rem", color: "#e74c3c" }}>›</span>} />
        <ConfigRow icon="🗑️" label="Eliminar mi cuenta" sub="Borra todos tus datos permanentemente" onClick={() => setModal("delete")} danger right={<span style={{ fontSize: ".75rem", color: "#e74c3c" }}>›</span>} />
      </div>

      {/* Version */}
      <div style={{ textAlign: "center" as const, padding: 16, fontSize: ".76rem", color: "#bbb" }}>
        FlightPath v1.0.0 · Hecho con 💙 por Yaritzi Bolaños<br />
        <span style={{ fontSize: ".68rem" }}>© 2026 FlightPath · Todos los derechos reservados</span>
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, padding: 28, maxWidth: 420, width: "100%" }}>

            {/* Modal Contraseña */}
            {modal === "password" && (
              <>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", marginBottom: 6 }}>🔑 Cambiar contraseña</h2>
                <p style={{ fontSize: ".85rem", color: "#888", marginBottom: 20, lineHeight: 1.5 }}>Ingresa tu contraseña actual y la nueva.</p>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 16 }}>
                  {[
                    { placeholder: "Contraseña actual", value: pwdActual, set: setPwdActual },
                    { placeholder: "Nueva contraseña", value: pwdNueva, set: setPwdNueva },
                    { placeholder: "Confirmar nueva contraseña", value: pwdConfirm, set: setPwdConfirm },
                  ].map((f) => (
                    <input
                      key={f.placeholder}
                      type="password"
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      style={{ padding: "10px 14px", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", width: "100%" }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "white", color: "#888", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={() => { closeModal(); showFlash("✅ Contraseña actualizada"); }} style={{ flex: 2, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Guardar</button>
                </div>
              </>
            )}

            {/* Modal Teléfono */}
            {modal === "phone" && (
              <>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", marginBottom: 6 }}>💬 Cambiar WhatsApp</h2>
                <p style={{ fontSize: ".85rem", color: "#888", marginBottom: 20, lineHeight: 1.5 }}>Ingresa tu nuevo número de WhatsApp. Aquí recibirás tus recordatorios de estudio.</p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "white", color: "#888", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={() => { closeModal(); showFlash("✅ Número de WhatsApp actualizado"); }} style={{ flex: 2, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Guardar</button>
                </div>
              </>
            )}

            {/* Modal Logout */}
            {modal === "logout" && (
              <>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", marginBottom: 6 }}>🚪 ¿Cerrar sesión?</h2>
                <p style={{ fontSize: ".85rem", color: "#888", marginBottom: 20, lineHeight: 1.5 }}>Tendrás que volver a iniciar sesión la próxima vez que entres a FlightPath.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "white", color: "#888", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={() => { closeModal(); navigate({ to: "/" }); }} style={{ flex: 2, padding: 11, background: "#e74c3c", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cerrar sesión</button>
                </div>
              </>
            )}

            {/* Modal Delete */}
            {modal === "delete" && (
              <>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", marginBottom: 6 }}>🗑️ Eliminar cuenta</h2>
                <p style={{ fontSize: ".85rem", color: "#888", marginBottom: 8, lineHeight: 1.5 }}>Esta acción es <strong>permanente e irreversible</strong>. Se borrarán todos tus datos, progreso, bitácora y acceso a FlightPath.</p>
                <p style={{ fontSize: ".85rem", color: "#888", marginBottom: 12 }}>Escribe <strong>ELIMINAR</strong> para confirmar.</p>
                <input
                  type="text"
                  placeholder="Escribe ELIMINAR"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e74c3c", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "white", color: "#888", border: "2px solid #F2DCDB", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button
                    onClick={() => { if (deleteConfirm === "ELIMINAR") { closeModal(); navigate({ to: "/" }); } }}
                    disabled={deleteConfirm !== "ELIMINAR"}
                    style={{ flex: 2, padding: 11, background: deleteConfirm === "ELIMINAR" ? "#e74c3c" : "#ddd", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: deleteConfirm === "ELIMINAR" ? "pointer" : "not-allowed", fontFamily: "'Manrope', sans-serif", transition: "background .2s" }}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
