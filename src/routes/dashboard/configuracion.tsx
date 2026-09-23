import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import {
  useSessionUser,
  updateUser,
  changePassword,
  logout,
  requestAccountDeletion,
  defaultPrefs,
  flushCloudWrites,

} from "@/lib/store";
import type { UserPrefs } from "@/lib/store";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";
import { YARIS_TONOS, type YarisTono } from "@/components/shared/OnboardingModal";

/** Longitud de respuesta de Yaris (solo se elige aquí, no en el onboarding). */
export type YarisLargo = "corta" | "normal" | "detallada";
const YARIS_LARGOS_UI: { key: YarisLargo; label: string; desc: string }[] = [
  { key: "corta", label: "Corta", desc: "Al grano: 2 o 3 líneas con lo esencial" },
  { key: "normal", label: "Normal", desc: "Veredicto, fundamento y un tip para recordarlo" },
  { key: "detallada", label: "Detallada", desc: "Explicación a fondo, con ejemplos y errores comunes" },
];

import { YarisAvatar } from "@/components/shared/YarisAvatar";

export const Route = createFileRoute("/dashboard/configuracion")({
  component: ConfiguracionPage,
});

type ModalType = "password" | "phone" | "logout" | "delete" | "nombre" | "escuela" | "ciaac" | null;

const maskPhone = (p: string) => {
  const t = p.trim();
  if (!t) return "";
  return `${t.slice(0, 6)} ••••••${t.slice(-2)}`;
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: "var(--fd-radius, 12px)", cursor: "pointer",
        position: "relative", background: on ? "#163D70" : "#ddd",
        transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18, background: "var(--fd-panel, white)",
        borderRadius: "50%", top: 3, left: on ? 23 : 3,
        transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)",
      }} />
    </div>
  );
}

function detectDevice(): { device: string; browser: string } | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (!ua) return null;
  let device = "Escritorio";
  if (/iPad/i.test(ua)) device = "iPad";
  else if (/iPhone/i.test(ua)) device = "iPhone";
  else if (/Android/i.test(ua)) device = /Mobile/i.test(ua) ? "Android" : "Tablet Android";
  else if (/Macintosh/i.test(ua)) device = "Mac";
  else if (/Windows/i.test(ua)) device = "Windows";
  else if (/Linux/i.test(ua)) device = "Linux";
  let browser = "Navegador";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  return { device, browser };
}

function ActiveSessionRow({ onLogoutAll }: { onLogoutAll: () => void }) {
  const [info, setInfo] = useState<{ device: string; browser: string } | null>(null);
  useEffect(() => { setInfo(detectDevice()); }, []);
  if (!info) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 20, display: "flex", justifyContent: "center", color: "var(--fd-text, #081A35)" }}><Icon n="home" size={18} /></span>
        <div>
          <div style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--fd-text, #081A35)", marginBottom: 2 }}>Sesiones activas</div>
          <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>{info.device} · {info.browser} · Activo ahora</div>
        </div>
      </div>
      <button
        onClick={onLogoutAll}
        style={{ padding: "5px 12px", background: "var(--fd-panel, white)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 7, fontSize: ".75rem", fontWeight: 700, color: "var(--fd-muted, #4A5872)", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function SectionHeader({ icon, iconBg, title, desc, badge }: { icon: string; iconBg: string; title: string; desc: string; badge?: string }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(22,61,112,.06)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--fd-radius, 10px)", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--fd-text, #081A35)" }}><Icon n={icon as never} size={20} /></div>
      <div>
        <div style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--fd-text, #081A35)", marginBottom: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {title}
          {badge && (
            <span style={{ padding: "2px 9px", borderRadius: "var(--fd-radius, 20px)", fontSize: ".64rem", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", background: "#FDF3D6", color: "#856404", border: "1px solid #F0DFAE" }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>{desc}</div>
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
        padding: "14px 20px", borderBottom: "1px solid rgba(22,61,112,.04)",
        gap: 16, cursor: onClick ? "pointer" : "default",
        transition: "background .2s",
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = danger ? "rgba(231,76,60,.03)" : "var(--fd-panel-alt, #fafbff)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0, color: danger ? "#e74c3c" : "var(--fd-text, #081A35)" }}><Icon n={icon as never} size={18} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: ".86rem", fontWeight: 600, color: danger ? "#e74c3c" : "var(--fd-text, #081A35)", marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: ".74rem", color: danger ? "rgba(231,76,60,.7)" : "var(--fd-muted, #4A5872)" }}>{sub}</div>
        </div>
      </div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

function ConfiguracionPage() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const [toggles, setToggles] = useState<UserPrefs["toggles"]>(() => user?.prefs.toggles ?? defaultPrefs().toggles);
  const [theme, setThemeState] = useState<UserPrefs["theme"]>(() => user?.prefs.theme ?? "claro");
  const [textSize, setTextSizeState] = useState<UserPrefs["textSize"]>(() => user?.prefs.textSize ?? "Normal");
  const [modal, setModal] = useState<ModalType>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const [reportOpen, setReportOpen] = useState(false);

  // Modal states
  const [pwdActual, setPwdActual] = useState("");
  const [pwdNueva, setPwdNueva] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [phone, setPhone] = useState(() => user?.whatsapp ?? "");
  const [nombreDraft, setNombreDraft] = useState(() => user?.nombre ?? "");
  const [escuelaDraft, setEscuelaDraft] = useState(() => user?.escuela ?? "");
  const [ciaacDraft, setCiaacDraft] = useState(() => user?.fechaCiaac ?? "");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [yarisTono, setYarisTonoState] = useState<YarisTono>(() => user?.yarisTono ?? "normal");
  const [yarisLargo, setYarisLargoState] = useState<YarisLargo>(() => user?.yarisLargo ?? "normal");
  const [guardandoYaris, setGuardandoYaris] = useState(false);
  // Hay cambios pendientes mientras lo elegido difiera de lo ya guardado.
  const yarisSucio =
    yarisTono !== (user?.yarisTono ?? "normal") || yarisLargo !== (user?.yarisLargo ?? "normal");

  /**
   * Guarda tono y longitud y espera a que la nube los tenga: Yaris lee estas
   * preferencias del perfil en el servidor, así que sin el flush el siguiente
   * mensaje todavía saldría con la personalidad anterior.
   */
  async function guardarYaris() {
    if (!user || guardandoYaris) return;
    setGuardandoYaris(true);
    updateUser(user.id, { yarisTono, yarisLargo });
    try {
      await flushCloudWrites();
    } catch {
      /* el debounce reintenta en la siguiente escritura */
    }
    setGuardandoYaris(false);
    showFlash("Listo: Yaris ya te responde con esa personalidad y longitud.");
  }


  if (!user) return null;

  const persistPrefs = (patch: Partial<UserPrefs>) => {
    updateUser(user.id, { prefs: { theme, textSize, toggles, ...patch } });
  };

  const toggle = (key: keyof UserPrefs["toggles"]) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    persistPrefs({ toggles: next });
  };

  const setTheme = (t: UserPrefs["theme"]) => {
    setThemeState(t);
    persistPrefs({ theme: t });
  };

  const setTextSize = (t: UserPrefs["textSize"]) => {
    setTextSizeState(t);
    persistPrefs({ textSize: t });
  };

  // Todo aviso se retira solo a los 10 s: antes algunos se quedaban fijos.
  const showFlash = (msg: string) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 10000);
  };

  const closeModal = () => {
    setModal(null);
    setPwdActual(""); setPwdNueva(""); setPwdConfirm("");
    setPwdError(null);
    setDeleteConfirm("");
  };

  const savePassword = async () => {
    setPwdError(null);
    if (!pwdNueva || pwdNueva !== pwdConfirm) {
      setPwdError("Las contraseñas nuevas no coinciden.");
      return;
    }
    const res = await changePassword(user.id, pwdActual, pwdNueva);
    if (!res.ok) {
      setPwdError(res.error ?? "No pudimos actualizar la contraseña.");
      return;
    }
    closeModal();
    showFlash("Contraseña actualizada");
  };

  const savePhone = () => {
    updateUser(user.id, { whatsapp: phone.trim(), whatsappEstado: "registrado" });
    closeModal();
    showFlash("Número de WhatsApp actualizado");
  };

  const masked = maskPhone(user.whatsapp);

  const THEMES: { id: "claro" | "oscuro" | "sistema"; icon: string; label: string }[] = [
    { id: "claro", icon: "sun", label: "Claro" },
    { id: "oscuro", icon: "moon", label: "Oscuro" },
    { id: "sistema", icon: "settings", label: "Sistema" },
  ];

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 700 }}>
      <style>{`
        .cfg-row-hover:hover { background: #fafbff; }
        .danger-row-hover:hover { background: rgba(231,76,60,.03); }
        .theme-btn-sel { border-color: #163D70 !important; background: rgba(22,61,112,.06) !important; }
        .theme-btn:hover { border-color: #163D70; }
        .close-btn:hover { background: rgba(255,255,255,.08) !important; }
      `}</style>

      <ModuleHeader
        eyebrow="Cuenta · Configuración"
        title="Ajusta tu"
        accent="cabina"
        tail="."
        subtitle="Datos de la cuenta, avisos, apariencia y seguridad."
        planes={6}
      />

      {/* Flash */}
      {flash && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#2ecc71", color: "white", padding: "10px 18px", borderRadius: "var(--fd-radius, 10px)", fontWeight: 700, fontSize: ".85rem", zIndex: 400 }}>
          {flash}
        </div>
      )}

      {/* ── PERFIL ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", marginBottom: 20 }}>
        <SectionHeader icon="user" iconBg="rgba(22,61,112,.1)" title="Perfil" desc="Actualiza tus datos personales" />
        <ConfigRow
          icon="user" label="Nombre" sub={user.nombre || "Sin nombre"}
          onClick={() => { setNombreDraft(user.nombre); setModal("nombre"); }}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
        <ConfigRow
          icon="chat" label="WhatsApp" sub={masked || "Sin número"}
          onClick={() => { setPhone(user.whatsapp); setModal("phone"); }}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
        <ConfigRow
          icon="plane" label="Escuela de aviación" sub={user.escuela || "Sin escuela"}
          onClick={() => { setEscuelaDraft(user.escuela); setModal("escuela"); }}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
        <ConfigRow
          icon="target" label="Fecha estimada del CIAAC"
          sub={user.fechaCiaac ? new Date(`${user.fechaCiaac}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "Sin fecha"}
          onClick={() => { setCiaacDraft(user.fechaCiaac ?? ""); setModal("ciaac"); }}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
      </div>

      {/* ── NOTIFICACIONES ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", marginBottom: 20 }}>
        <SectionHeader icon="bell" iconBg="rgba(37,211,102,.1)" title="Notificaciones" desc="Gestiona cómo y cuándo te avisamos" badge="Construyendo" />
        <div style={{ padding: "12px 20px", background: "var(--fd-panel, #FDFAF0)", borderBottom: "1px solid rgba(22,61,112,.06)", fontSize: ".78rem", color: "#856404", lineHeight: 1.55 }}>
          Estamos construyendo el envío de avisos. Puedes dejar aquí tus preferencias —se guardan en tu cuenta— pero
          todavía no salen recordatorios automáticos.
        </div>
        <ConfigRow icon="chat" label="Recordatorios por WhatsApp" sub={masked ? `Te mandamos tus recordatorios directo al ${masked}` : "Agrega tu número para recibir recordatorios"} right={<Toggle on={toggles.whatsapp} onToggle={() => toggle("whatsapp")} />} />
        <ConfigRow icon="flame" label="Alerta de racha en riesgo" sub="Aviso por WhatsApp si no has estudiado en el día" right={<Toggle on={toggles.racha} onToggle={() => toggle("racha")} />} />
        <ConfigRow icon="sim" label="Recordatorio del simulador semanal" sub="Cada domingo a las 10:00 AM" right={<Toggle on={toggles.simulador} onToggle={() => toggle("simulador")} />} />
        <ConfigRow icon="book" label="Recordatorio de bitácora" sub="Pathy te pregunta cómo estuvo tu día al terminar de estudiar" right={<Toggle on={toggles.bitacora} onToggle={() => toggle("bitacora")} />} />
        <ConfigRow
          icon="settings" label="Gestionar todos los recordatorios" sub="Horarios, días y tipos de aviso"
          onClick={() => navigate({ to: "/dashboard/recordatorios" })}
          right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>}
        />
      </div>

      {/* ── APARIENCIA ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", marginBottom: 20 }}>
        <SectionHeader icon="spark" iconBg="rgba(22,61,112,.1)" title="Apariencia" desc="Personaliza cómo se ve FlightPath" />

        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 20, display: "flex", justifyContent: "center", color: "var(--fd-text, #081A35)" }}><Icon n="moon" size={18} /></span>
            <div>
              <div style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--fd-text, #081A35)", marginBottom: 2 }}>Tema de la aplicación</div>
              <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>Elige entre claro, oscuro o el del sistema</div>
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
                flex: 1, padding: 12, borderRadius: "var(--fd-radius, 10px)",
                border: `2px solid ${theme === t.id ? "#163D70" : "#EEE1C5"}`,
                cursor: "pointer", textAlign: "center" as const, transition: "all .2s",
                background: theme === t.id ? "rgba(22,61,112,.06)" : "var(--fd-panel, white)",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              <div style={{ marginBottom: 4, display: "flex", justifyContent: "center", color: "var(--fd-text, #081A35)" }}><Icon n={t.icon as never} size={22} /></div>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "var(--fd-text, #081A35)" }}>{t.label}</div>
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(22,61,112,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(22,61,112,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 20, display: "flex", justifyContent: "center", color: "var(--fd-text, #081A35)" }}><Icon n="doc" size={18} /></span>
              <div>
                <div style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--fd-text, #081A35)", marginBottom: 2 }}>Tamaño de texto</div>
                <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>Para leer más cómodamente</div>
              </div>
            </div>
            <select
              value={textSize}
              onChange={(e) => setTextSize(e.target.value as UserPrefs["textSize"])}
              style={{ border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, padding: "6px 12px", fontSize: ".82rem", fontFamily: "'Manrope', sans-serif", color: "var(--fd-text, #081A35)", outline: "none", cursor: "pointer", background: "var(--fd-panel, white)" }}
            >
              <option>Normal</option>
              <option>Grande</option>
              <option>Muy grande</option>
            </select>
          </div>
          <ConfigRow icon="spark" label="Animaciones de Pathy" sub="Desactiva si prefieres menos movimiento" right={<Toggle on={toggles.pathy} onToggle={() => toggle("pathy")} />} />
          <ConfigRow
            icon="compass"
            label="Recorrido de Pathy"
            sub="Vuelve a ver el tour rápido por los destinos de tu cabina"
            onClick={() => navigate({ to: "/dashboard", search: { tour: 1 } as never })}
            right={<Icon n="chevR" size={16} />}
          />

          {/* Personalidad de Yaris IA */}
          <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(22,61,112,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 20, display: "flex", justifyContent: "center" }}><YarisAvatar size={20} /></span>
              <div>
                <div style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--fd-text, #081A35)", marginBottom: 2 }}>Personalidad de Yaris</div>
                <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>Cambia cómo te habla tu tutora IA, no su rigor técnico</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {YARIS_TONOS.map((t) => {
                const activo = yarisTono === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setYarisTonoState(t.key);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "100%",
                      padding: "12px 14px", borderRadius: "var(--fd-radius, 10px)", cursor: "pointer",
                      border: `2px solid ${activo ? "#163D70" : "#EEE1C5"}`,
                      background: activo ? "rgba(22,61,112,.06)" : "var(--fd-panel, white)",
                      fontFamily: "'Manrope', sans-serif", minHeight: 44,
                    }}
                    aria-pressed={activo}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${activo ? "#163D70" : "#C9D6E8"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {activo && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#163D70" }} />}
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: ".84rem", fontWeight: 700, color: "var(--fd-text, #081A35)" }}>{t.label}</span>
                      <span style={{ display: "block", fontSize: ".74rem", color: "var(--fd-muted, #4A5872)", marginTop: 2 }}>{t.ejemplo}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Longitud de respuesta de Yaris */}
          <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(22,61,112,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 20, display: "flex", justifyContent: "center", color: "var(--fd-text, #081A35)" }}><Icon n="chat" size={18} /></span>
              <div>
                <div style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--fd-text, #081A35)", marginBottom: 2 }}>Longitud de respuesta</div>
                <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>Qué tanto se extiende Yaris al explicarte</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {YARIS_LARGOS_UI.map((l) => {
                const activo = yarisLargo === l.key;
                return (
                  <button
                    key={l.key}
                    onClick={() => {
                      setYarisLargoState(l.key);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "100%",
                      padding: "12px 14px", borderRadius: "var(--fd-radius, 10px)", cursor: "pointer",
                      border: `2px solid ${activo ? "#163D70" : "#EEE1C5"}`,
                      background: activo ? "rgba(22,61,112,.06)" : "var(--fd-panel, white)",
                      fontFamily: "'Manrope', sans-serif", minHeight: 44,
                    }}
                    aria-pressed={activo}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${activo ? "#163D70" : "#C9D6E8"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {activo && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#163D70" }} />}
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: ".84rem", fontWeight: 700, color: "var(--fd-text, #081A35)" }}>{l.label}</span>
                      <span style={{ display: "block", fontSize: ".74rem", color: "var(--fd-muted, #4A5872)", marginTop: 2 }}>{l.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Guardar: aplica tono y longitud de inmediato, en este equipo y en la nube */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => void guardarYaris()}
                disabled={!yarisSucio || guardandoYaris}
                style={{
                  padding: "12px 20px", borderRadius: "var(--fd-radius, 10px)", border: "none", minHeight: 44,
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: ".86rem",
                  color: "white", cursor: !yarisSucio || guardandoYaris ? "not-allowed" : "pointer",
                  background: !yarisSucio || guardandoYaris ? "#C9D6E8" : "#163D70",
                }}
              >
                {guardandoYaris ? "Guardando…" : "Guardar cambios de Yaris"}
              </button>
              {yarisSucio && !guardandoYaris && (
                <span style={{ fontSize: ".76rem", color: "var(--fd-gold, #7A5C1E)", fontWeight: 600 }}>
                  Tienes cambios sin guardar
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── SEGURIDAD ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", marginBottom: 20 }}>
        <SectionHeader icon="lock" iconBg="rgba(122,92,30,.08)" title="Seguridad" desc="Gestiona el acceso a tu cuenta" />
        <ConfigRow icon="lock" label="Cambiar contraseña" sub="Última actualización: hace 3 meses" onClick={() => setModal("password")} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="chat" label="Cambiar número de WhatsApp" sub={masked || "Sin número registrado"} onClick={() => { setPhone(user.whatsapp); setModal("phone"); }} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ActiveSessionRow onLogoutAll={async () => {
          await logout();
          showFlash("Sesión cerrada");
        }} />
      </div>

      {/* ── AYUDA ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", marginBottom: 20 }}>
        <SectionHeader icon="help" iconBg="rgba(22,61,112,.08)" title="Ayuda y soporte" desc="Estamos aquí para ayudarte" />
        <ConfigRow icon="book" label="Centro de ayuda" sub="Preguntas frecuentes y tutoriales" onClick={() => navigate({ to: "/legal" })} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="star" label="Enviar sugerencia o feedback" sub="Ayúdanos a mejorar FlightPath" onClick={() => setReportOpen(true)} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
        <ConfigRow icon="doc" label="Términos y privacidad" sub="Política de uso y datos" onClick={() => navigate({ to: "/legal" })} right={<span style={{ fontSize: ".75rem", color: "#ccc" }}>›</span>} />
      </div>

      {/* ── ZONA DE RIESGO ── */}
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", overflow: "hidden", boxShadow: "0 2px 10px rgba(22,61,112,.06)", border: "2px solid rgba(231,76,60,.1)", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(231,76,60,.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--fd-radius, 10px)", background: "rgba(231,76,60,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e74c3c" }}><Icon n="alert" size={20} /></div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#e74c3c", marginBottom: 2 }}>Zona de riesgo</div>
            <div style={{ fontSize: ".74rem", color: "var(--fd-muted, #4A5872)" }}>Acciones irreversibles — piénsalo bien</div>
          </div>
        </div>
        <ConfigRow icon="arrow" label="Cerrar sesión" sub="Salir de tu cuenta en este dispositivo" onClick={() => setModal("logout")} danger right={<span style={{ fontSize: ".75rem", color: "#e74c3c" }}>›</span>} />
        <ConfigRow icon="trash" label="Eliminar mi cuenta" sub="Borra todos tus datos permanentemente" onClick={() => setModal("delete")} danger right={<span style={{ fontSize: ".75rem", color: "#e74c3c" }}>›</span>} />
      </div>

      {/* Version */}
      <div style={{ textAlign: "center" as const, padding: 16, fontSize: ".76rem", color: "#bbb" }}>
        FlightPath v1.0.0 · Hecho con <Icon n="heart" size={13} color="var(--fd-gold, #7A5C1E)" style={{ display: "inline-block", verticalAlign: "middle" }} /> por Yaritzi Bolaños<br />
        <span style={{ fontSize: ".68rem" }}>© 2026 FlightPath · Todos los derechos reservados</span>
      </div>

      {/* Reporte / sugerencia */}
      <ReportProblemModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        user={user}
        seccion="Configuración"
        tipoInicial="Sugerencia de mejora"
      />

      {/* ── MODALS ── */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 18px)", padding: 28, maxWidth: 420, width: "100%" }}>

            {/* Modal Contraseña */}
            {modal === "password" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="lock" size={20} color="var(--fd-text, #081A35)" /> Cambiar contraseña</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>Ingresa tu contraseña actual y la nueva.</p>
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
                      style={{ padding: "10px 14px", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", width: "100%" }}
                    />
                  ))}
                </div>
                {pwdError && (
                  <p style={{ fontSize: ".78rem", color: "#e74c3c", fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{pwdError}</p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={savePassword} style={{ flex: 2, padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Guardar</button>
                </div>
              </>
            )}

            {/* Modal Teléfono */}
            {modal === "phone" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="chat" size={20} color="var(--fd-text, #081A35)" /> Cambiar WhatsApp</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>Ingresa tu nuevo número de WhatsApp. Aquí recibirás tus recordatorios de estudio.</p>
                <input
                  type="tel"
                  value={phone}
                  placeholder="+52 55 1234 5678"
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={savePhone} style={{ flex: 2, padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Guardar</button>
                </div>
              </>
            )}

            {/* Modal Logout */}
            {modal === "logout" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="arrow" size={20} color="var(--fd-text, #081A35)" /> ¿Cerrar sesión?</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>Tendrás que volver a iniciar sesión la próxima vez que entres a FlightPath.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button onClick={() => { closeModal(); logout(); navigate({ to: "/" }); }} style={{ flex: 2, padding: 11, background: "#e74c3c", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cerrar sesión</button>
                </div>
              </>
            )}

            {/* Modal Delete */}
            {modal === "delete" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="trash" size={20} color="#e74c3c" /> Eliminar cuenta</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 8, lineHeight: 1.5 }}>Tu cuenta se desactivará y tendrás <strong>30 días</strong> para recuperarla iniciando sesión de nuevo. Pasado ese plazo se borrarán <strong>permanentemente</strong> todos tus datos, progreso, bitácora y acceso a FlightPath.</p>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 12 }}>Escribe <strong>ELIMINAR</strong> para confirmar.</p>
                <input
                  type="text"
                  placeholder="Escribe ELIMINAR"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e74c3c", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button
                    onClick={() => { if (deleteConfirm === "ELIMINAR") { closeModal(); requestAccountDeletion(user.id); navigate({ to: "/" }); } }}
                    disabled={deleteConfirm !== "ELIMINAR"}
                    style={{ flex: 2, padding: 11, background: deleteConfirm === "ELIMINAR" ? "#e74c3c" : "#ddd", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: deleteConfirm === "ELIMINAR" ? "pointer" : "not-allowed", fontFamily: "'Manrope', sans-serif", transition: "background .2s" }}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </>
            )}

            {/* Modal Nombre */}
            {modal === "nombre" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="user" size={20} color="var(--fd-text, #081A35)" /> Cambiar nombre</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>Así aparecerás en toda la plataforma.</p>
                <input
                  type="text"
                  value={nombreDraft}
                  placeholder="Nombre completo"
                  onChange={(e) => setNombreDraft(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button
                    onClick={() => {
                      const t = nombreDraft.trim();
                      if (!t) return;
                      updateUser(user.id, { nombre: t });
                      closeModal();
                      showFlash("Nombre actualizado");
                    }}
                    style={{ flex: 2, padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}

            {/* Modal Escuela */}
            {modal === "escuela" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="plane" size={20} color="var(--fd-text, #081A35)" /> Escuela de aviación</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>Institución donde estudias o presentas el CIAAC.</p>
                <input
                  type="text"
                  value={escuelaDraft}
                  placeholder="Nombre de la escuela"
                  onChange={(e) => setEscuelaDraft(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button
                    onClick={() => {
                      updateUser(user.id, { escuela: escuelaDraft.trim() });
                      closeModal();
                      showFlash("Escuela actualizada");
                    }}
                    style={{ flex: 2, padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}

            {/* Modal Fecha CIAAC */}
            {modal === "ciaac" && (
              <>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Icon n="target" size={20} color="var(--fd-text, #081A35)" /> Fecha del CIAAC</h2>
                <p style={{ fontSize: ".85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20, lineHeight: 1.5 }}>La usaremos para el contador de despegue en tu tablero.</p>
                <input
                  type="date"
                  value={ciaacDraft}
                  onChange={(e) => setCiaacDraft(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 8, fontSize: ".86rem", fontFamily: "'Manrope', sans-serif", outline: "none", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: 11, background: "var(--fd-panel, white)", color: "var(--fd-muted, #4A5872)", border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Cancelar</button>
                  <button
                    onClick={() => {
                      updateUser(user.id, { fechaCiaac: ciaacDraft || null });
                      closeModal();
                      showFlash("Fecha actualizada");
                    }}
                    style={{ flex: 2, padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: 9, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    Guardar
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
