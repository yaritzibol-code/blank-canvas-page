/**
 * AdminShell — layout compartido del Panel Admin (sidebar + topbar).
 * Extraído de admin/perfil.tsx: mismo lenguaje visual para todas las
 * páginas del panel. Incluye el guard de rol admin.
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { logout, useRequireAuth } from "@/lib/store";
import { useLiveData } from "@/hooks/use-live-data";
import { LiveIndicator } from "@/components/shared/LiveIndicator";

export type AdminNavKey =
  | "resumen"
  | "estudiantes"
  | "accesos"
  | "analitica"
  | "banco"
  | "contenido"
  | "soporte"
  | "whatsapp"
  | "configuracion"
  | "operaciones"
  | "operaciones_stripe"
  | "operaciones_yaris"
  | "operaciones_disputas"
  | "usuarios_activos"
  | "auditoria"
  | "yaris_chats"
  | "activity_ratio"
  | "gamificacion";

interface NavItem {
  icon: FPIconName;
  label: string;
  key?: AdminNavKey;
  path?: string;
  action?: "logout";
}

const ADMIN_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Panel",
    items: [
      { icon: "chart", label: "Resumen", key: "resumen", path: "/admin" },
      { icon: "users", label: "Estudiantes", key: "estudiantes", path: "/admin/estudiantes" },
      { icon: "shield", label: "Accesos y membresías", key: "accesos", path: "/admin/accesos" },
      { icon: "stats", label: "Analítica general", key: "analitica", path: "/admin/analitica" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { icon: "chart", label: "Panel de control", key: "operaciones", path: "/admin/operaciones" },
      {
        icon: "users",
        label: "Usuarios activos",
        key: "usuarios_activos",
        path: "/admin/usuarios-activos",
      },
      {
        icon: "stats",
        label: "Activity Ratio",
        key: "activity_ratio",
        path: "/admin/activity-ratio",
      },
      {
        icon: "help",
        label: "Eventos de Stripe",
        key: "operaciones_stripe",
        path: "/admin/operaciones/stripe",
      },
      {
        icon: "shield",
        label: "Disputas y evidencias",
        key: "operaciones_disputas",
        path: "/admin/operaciones/disputas",
      },
      {
        icon: "chat",
        label: "Yaris & IA",
        key: "operaciones_yaris",
        path: "/admin/operaciones/yaris",
      },
      {
        icon: "doc",
        label: "Auditoría de cuestionarios",
        key: "auditoria",
        path: "/admin/auditoria",
      },
      {
        icon: "chat",
        label: "Conversaciones con Yaris",
        key: "yaris_chats",
        path: "/admin/yaris-chats",
      },
      {
        icon: "trophy",
        label: "Gamificación",
        key: "gamificacion",
        path: "/admin/gamificacion",
      },
    ],
  },
  {
    label: "Contenido",
    items: [
      { icon: "help", label: "Banco de preguntas", key: "banco", path: "/admin/banco" },
      { icon: "play", label: "Clases y materiales", key: "contenido", path: "/admin/contenido" },
    ],
  },
  {
    label: "Comunicación",
    items: [
      { icon: "headset", label: "Soporte y feedback", key: "soporte", path: "/admin/soporte" },
      { icon: "chat", label: "WhatsApp y recordatorios", key: "whatsapp", path: "/admin/whatsapp" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      {
        icon: "settings",
        label: "Configuración interna",
        key: "configuracion",
        path: "/admin/configuracion",
      },
      { icon: "eye", label: "Ver como estudiante", path: "/dashboard" },
      { icon: "close", label: "Cerrar sesión", action: "logout" },
    ],
  },
];

export function AdminShell({
  title,
  active,
  backTo,
  actions,
  maxWidth = 1100,
  children,
}: {
  title: string;
  active: AdminNavKey;
  backTo?: { label: string; to: string };
  actions?: ReactNode;
  maxWidth?: number;
  children: ReactNode;
}) {
  const { user, ready } = useRequireAuth("admin");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const live = useLiveData(ready);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#050F22" }} />;

  const adminName = user?.nombre?.trim() || "Administradora";
  const firstName = adminName.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase() || "A";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const itemBase = (isActive: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "9px 16px",
    color: isActive ? "#FFFFFF" : "rgba(213,222,236,.72)",
    textDecoration: "none",
    fontSize: ".82rem",
    fontWeight: 500,
    borderLeft: `3px solid ${isActive ? "#C7A052" : "transparent"}`,
    background: isActive ? "rgba(199,160,82,.14)" : "transparent",
    transition: "all .2s",
  });

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        minHeight: "100vh",
        background: "#050F22",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#081A35",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          flexDirection: "column",
          zIndex: 200,
          display: sidebarOpen ? "flex" : undefined,
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div
          style={{
            padding: "18px 16px",
            borderBottom: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src="/img/flightpath-logo.png"
            alt="Logo de FlightPath"
            width={30}
            height={30}
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              objectFit: "cover",
              flexShrink: 0,
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.1rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            Flight<span style={{ color: "#C7A052" }}>Path</span>
          </span>
          <span
            style={{
              background: "rgba(199,160,82,.14)",
              color: "#E2C990",
              fontSize: ".6rem",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 6,
              border: "1px solid rgba(199,160,82,.28)",
              textTransform: "uppercase",
              letterSpacing: ".5px",
              marginLeft: "auto",
            }}
          >
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {ADMIN_NAV.map((sec) => (
            <div key={sec.label}>
              <div
                style={{
                  padding: "8px 16px",
                  fontSize: ".6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "rgba(255,255,255,.3)",
                  marginTop: 6,
                }}
              >
                {sec.label}
              </div>
              {sec.items.map((item) =>
                item.action === "logout" ? (
                  <button
                    key={item.label}
                    onClick={handleLogout}
                    style={{
                      ...itemBase(false),
                      width: "100%",
                      border: "none",
                      borderLeft: "3px solid transparent",
                      cursor: "pointer",
                       fontFamily: "'Manrope', sans-serif",
                       background: "transparent",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon n={item.icon} size={16} />
                    </span>
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.path as "/dashboard"}
                    style={itemBase(!!item.key && item.key === active)}
                  >
                    <span
                      style={{
                        width: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon n={item.icon} size={16} />
                    </span>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#C7A052",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: ".75rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ fontSize: ".8rem", fontWeight: 700, color: "white" }}>{firstName}</div>
            <div style={{ fontSize: ".66rem", color: "#C7A052" }}>Administradora</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
        className="md:ml-[220px]"
      >
        {/* Topbar */}
        <div
          style={{
            height: 58,
            background: "rgba(5,15,34,.92)",
            borderBottom: "1px solid rgba(199,160,82,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 3,
              }}
              className="md:hidden"
            >
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                 background: "#081A35",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                 background: "#081A35",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                 background: "#081A35",
                  borderRadius: 2,
                }}
              />
            </button>
            {backTo && (
              <Link
                to={backTo.to as "/dashboard"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#93A4BF",
                  fontSize: ".8rem",
                  textDecoration: "none",
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(199,160,82,.22)",
                  transition: "all .2s",
                  whiteSpace: "nowrap",
                }}
              >
                ← {backTo.label}
              </Link>
            )}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "1.45rem",
                fontWeight: 400,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <LiveIndicator state={live} />
            {actions}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "clamp(18px, 2.2vw, 32px)", maxWidth, width: "100%", margin: "0 auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Estilos compartidos del panel ───────────────────────── */

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  border: "1px solid rgba(199,160,82,.22)",
  borderRadius: 8,
  fontSize: ".86rem",
  fontFamily: "'Manrope', sans-serif",
  outline: "none",
  color: "#FFFFFF",
  background: "#0A1B33",
};

export const labelStyle: CSSProperties = {
  fontSize: ".75rem",
  fontWeight: 700,
  color: "#FFFFFF",
  marginBottom: 5,
  display: "block",
};

export const cancelBtnStyle: CSSProperties = {
  flex: 1,
  padding: 10,
  background: "#0A1B33",
  color: "#93A4BF",
  border: "2px solid rgba(199,160,82,.28)",
  borderRadius: 8,
  fontSize: ".84rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
};

export const confirmBtnStyle: CSSProperties = {
  flex: 2,
  padding: 10,
  background: "#C7A052",
  color: "#0B1220",
  border: "none",
  borderRadius: 8,
  fontSize: ".84rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
};

export const primaryBtnStyle: CSSProperties = {
  padding: "8px 16px",
  background: "#C7A052",
  color: "#0B1220",
  border: "none",
  borderRadius: 8,
  fontSize: ".8rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export const secondaryBtnStyle: CSSProperties = {
  padding: "8px 16px",
  background: "#0A1B33",
  color: "#B8C5DA",
  border: "2px solid rgba(199,160,82,.28)",
  borderRadius: 8,
  fontSize: ".8rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export const cardStyle: CSSProperties = {
  background: "#0A1B33",
  borderRadius: 8,
  padding: "18px 20px",
  border: "1px solid rgba(199,160,82,.22)",
  boxShadow: "0 12px 32px -28px rgba(8,26,53,.45)",
};

export const cardHeadStyle: CSSProperties = {
  fontSize: ".74rem",
  fontWeight: 700,
  color: "#93A4BF",
  textTransform: "uppercase",
  letterSpacing: ".5px",
  marginBottom: 14,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

export const modalTitleStyle: CSSProperties = {
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontSize: "1.2rem",
  marginBottom: 6,
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#FFFFFF",
};

export const modalSubStyle: CSSProperties = {
  fontSize: ".84rem",
  color: "#93A4BF",
  marginBottom: 18,
  lineHeight: 1.5,
};

/* ───────────────────────── Componentes compartidos ───────────────────────── */

export function Badge({ text, color, bg }: { text: string; color: string; bg?: string }) {
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: ".7rem",
        fontWeight: 700,
        color,
        background: bg ?? `${color}1c`,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  maxWidth = 440,
  children,
}: {
  open: boolean;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0A1B33",
          borderRadius: 16,
          padding: 26,
          maxWidth,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface FlashMsg {
  msg: string;
  error?: boolean;
}

export function useFlash(): {
  flash: FlashMsg | null;
  showFlash: (msg: string, error?: boolean) => void;
} {
  const [flash, setFlash] = useState<FlashMsg | null>(null);
  const showFlash = (msg: string, error = false) => {
    setFlash({ msg, error });
    setTimeout(() => setFlash(null), 3200);
  };
  return { flash, showFlash };
}

export function Flash({ flash }: { flash: FlashMsg | null }) {
  if (!flash) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        right: 24,
        background: flash.error ? "#e74c3c" : "#2ecc71",
        color: "white",
        padding: "10px 18px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: ".85rem",
        zIndex: 400,
        boxShadow: "0 4px 16px rgba(0,0,0,.2)",
        maxWidth: 380,
      }}
    >
      {flash.msg}
    </div>
  );
}

/* ───────────────────────── Helpers de formato ───────────────────────── */

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(iso)} · ${hh}:${mm}`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (t >= startToday) return "Hoy";
  if (t >= startToday - 86400000) return "Ayer";
  const days = Math.ceil((startToday - t) / 86400000);
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? "Hace 1 semana" : `Hace ${w} semanas`;
  }
  return fmtDate(iso);
}

/* ───────────────────────── Colores de estado ───────────────────────── */

export const ACCESS_LABEL: Record<string, string> = {
  activo: "Activo",
  vencido: "Vencido",
  pausado: "Pausado",
  extendido: "Extendido",
  prueba: "Prueba",
  cancelado: "Cancelado",
};

export const ACCESS_COLOR: Record<string, string> = {
  activo: "#2ecc71",
  vencido: "#e74c3c",
  pausado: "#f39c12",
  extendido: "#C7A052",
  prueba: "#8e6cc0",
  cancelado: "#e74c3c",
};

export function generalStateColor(state: string): string {
  switch (state) {
    case "En riesgo de abandono":
      return "#e74c3c";
    case "Acceso vencido":
      return "#e74c3c";
    case "Inactivo":
      return "#f39c12";
    case "Necesita apoyo":
      return "#f39c12";
    case "Cerca del CIAAC":
      return "#6C0820";
    case "Acceso de prueba":
      return "#8e6cc0";
    case "Eliminación pendiente":
      return "#93A4BF";
    case "Buen avance":
      return "#2ecc71";
    default:
      return "#C7A052"; // "Activo" y otros
  }
}

export const CONTENT_STATUS_COLOR: Record<string, string> = {
  borrador: "#f39c12",
  publicada: "#2ecc71",
  oculta: "#93A4BF",
};

export const CONTENT_STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  oculta: "Oculta",
};

export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "#93A4BF";
  if (score >= 70) return "#2ecc71";
  if (score >= 50) return "#f39c12";
  return "#e74c3c";
}

/** Icono y fondo para eventos de actividad (kind de ActivityEvent). */
export function activityVisual(kind: string): { icon: FPIconName; bg: string } {
  switch (kind) {
    case "quiz":
      return { icon: "help", bg: "rgba(61,93,145,.08)" };
    case "simulador":
      return { icon: "sim", bg: "rgba(108,8,32,.08)" };
    case "flashcards":
      return { icon: "cards", bg: "rgba(90,134,203,.1)" };
    case "clase":
      return { icon: "play", bg: "rgba(90,134,203,.1)" };
    case "tema":
      return { icon: "book", bg: "rgba(61,93,145,.08)" };
    case "bitacora":
      return { icon: "doc", bg: "rgba(243,156,18,.1)" };
    case "biblioteca":
      return { icon: "library", bg: "rgba(61,93,145,.08)" };
    case "compass":
      return { icon: "compass", bg: "rgba(108,8,32,.08)" };
    case "pathy_session":
    case "yaris":
      return { icon: "chat", bg: "rgba(108,8,32,.08)" };
    case "login":
      return { icon: "user", bg: "rgba(141,161,190,.12)" };
    default:
      return { icon: "bolt", bg: "rgba(61,93,145,.08)" };
  }
}
