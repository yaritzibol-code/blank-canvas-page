import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { useEffect, useState } from "react";
import { useRequireAuth, useSessionUser, useStore, getStreak, logout, studySnapshot } from "@/lib/store";
import { syncPlanIfStale } from "@/lib/plan-sync";

import { YarisChatModal } from "@/components/shared/YarisChatModal";
import { useLiveData } from "@/hooks/use-live-data";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { TimerProvider } from "@/contexts/StudyTimerContext";
import { usePresence } from "@/hooks/use-presence";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

/** Iniciales = primeras letras de nombre y primer apellido. */
function initialsOf(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/* ── Clean single-stroke line icons (shared FlightPath glyph set) ── */
type IconName =
  | "home" | "book" | "help" | "sim" | "clock" | "library" | "cards" | "play"
  | "doc" | "chart" | "bell" | "user" | "settings" | "flame" | "spark" | "building" | "plane"
  | "card" | "exit";

function Icon({ n, size = 18, sw = 1.6 }: { n: IconName; size?: number; sw?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g: Record<IconName, React.ReactNode> = {
    home: <path d="M4 11l8-7 8 7M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" {...p} />,
    book: <path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2V5zM7 18h11" {...p} />,
    help: <><circle cx="12" cy="12" r="9" {...p} /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6v.4" {...p} /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></>,
    sim: <><rect x="3" y="4" width="18" height="13" rx="2" {...p} /><path d="M8 21h8M12 17v4" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3.5 2" {...p} /></>,
    library: <path d="M5 4v16M9 4v16M14 6l5 14M5 4h4M14 6l4-1" {...p} />,
    cards: <><rect x="4" y="7" width="13" height="13" rx="2.5" {...p} /><path d="M8 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" {...p} /></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><path d="M10 9.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" /></>,
    doc: <path d="M7 3h7l5 5v13H7zM14 3v5h5" {...p} />,
    chart: <path d="M4 19V5M4 19h16M8 16v-4M12 16V9M16 16v-2" {...p} />,
    bell: <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" {...p} />,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 13H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" {...p} /></>,
    flame: <path d="M12 3s4.5 4 4.5 8.5A4.5 4.5 0 1 1 7.5 11.5c0-2 1-3 2-4-1 4 2.5 4 2.5 7.5 0-3.5 4-3.5 4-7.5 0-3.5-4-4-4-4z" {...p} />,
    spark: <path d="M12 3l1.6 5.8L19 11l-5.4 1.6L12 19l-1.6-6.4L5 11l5.4-2.2L12 3z" {...p} />,
    building: <><path d="M4 21V6l7-3v18M11 21h9V10l-9-3" {...p} /><path d="M14 11h2M14 14h2M14 17h2M7 8v.01M7 12v.01M7 16v.01" {...p} /></>,
    plane: <path d="M3.5 13l17-7.5L14 21l-2.5-7L3.5 13z" {...p} />,
    card: <><rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><path d="M3 10h18M6.5 15h3" {...p} /></>,
    exit: <path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ display: "block" }}>{g[n]}</svg>;
}

/** Marca real de FlightPath (la misma imagen que usa la landing). */
function PlaneMark({ size = 36 }: { size?: number; light?: boolean }) {
  return (
    <img
      src="/assets/flightpath-logo.png"
      alt="Logo de FlightPath"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0, display: "block" }}
    />
  );
}

const NAV_SECTIONS: { label: string; items: { icon: IconName; label: string; path: string; locked?: boolean; nuevo?: boolean }[] }[] = [
  {
    label: "Principal",
    items: [
      { icon: "home", label: "Inicio", path: "/dashboard" },
      { icon: "book", label: "Learning paths", path: "/dashboard/materias", locked: true },
      // El simulador CIAAC no es un módulo aparte: se inicia desde esta misma
      // sección (tarjeta "Simulador CIAAC" dentro de CIAAC).
      { icon: "help", label: "CIAAC", path: "/dashboard/banco" },
      { icon: "plane", label: "Línea Aérea", path: "/dashboard/linea-aerea", nuevo: true },
      { icon: "clock", label: "Estudiemos Juntos", path: "/dashboard/estudiemos", locked: true },
    ],
  },
  {
    label: "Recursos",
    items: [
      { icon: "library", label: "Biblioteca", path: "/dashboard/biblioteca" },
      { icon: "cards", label: "Flashcards", path: "/dashboard/flashcards", locked: true },
      { icon: "play", label: "Clases grabadas", path: "/dashboard/clases", locked: true },
      { icon: "doc", label: "Mi Bitácora", path: "/dashboard/bitacora" },
    ],
  },
  {
    label: "Mi progreso",
    items: [
      { icon: "chart", label: "Análisis", path: "/dashboard/analisis" },
      { icon: "bell", label: "Recordatorios", path: "/dashboard/recordatorios" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { icon: "user", label: "Mi perfil", path: "/dashboard/perfil" },
      { icon: "card", label: "Facturación", path: "/dashboard/facturacion" },
      { icon: "settings", label: "Configuración", path: "/dashboard/configuracion" },
    ],
  },
];

function Sidebar({ onClose, onYaris, onLogout }: { onClose?: () => void; onYaris?: () => void; onLogout?: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const user = useSessionUser();

  return (
    <div
      style={{
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#22375C",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Dentro de la app el logo lleva a Inicio; salir a la landing pública
            desde aquí sacaba a la estudiante de su sesión de estudio. */}
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <PlaneMark size={34} />
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: "1.2rem",
              color: "white",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Flight<span style={{ color: "#F2AEBC" }}>Path</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", lineHeight: 1,
            }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 0", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              style={{
                padding: "10px 22px 6px",
                fontSize: "0.62rem",
                fontWeight: 700,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.32)",
                marginTop: 6,
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? currentPath === "/dashboard" || currentPath === "/dashboard/"
                  : currentPath.startsWith(item.path);
              const showLock = item.locked && user?.role !== "admin";
              return (
                <Link
                  key={item.path}
                  to={item.path as "/dashboard"}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    margin: "1px 12px",
                    padding: "10px 12px",
                    borderRadius: 10,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.9)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 500,
                    transition: "all 0.2s",
                    background: isActive ? "rgba(108,8,32,0.55)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width: 20, display: "flex", justifyContent: "center", color: isActive ? "#ffffff" : "rgba(255,255,255,0.75)" }}>
                    <Icon n={item.icon} size={18} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {showLock && (
                    <span
                      title="En construcción — disponible próximamente"
                      aria-label="En construcción — disponible próximamente"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 9px", borderRadius: 20,
                        background: "linear-gradient(135deg, #F2AEBC, #E4708C)",
                        color: "#4A0616", fontSize: "0.58rem", fontWeight: 800,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.25), 0 4px 12px -4px rgba(228,112,140,0.8)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Icon n="building" size={11} sw={2} /> Pronto
                    </span>
                  )}
                  {item.nuevo && !showLock && (
                    <span
                      className="fp-badge-nuevo"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 9px", borderRadius: 20,
                        background: "linear-gradient(135deg, #38E58A, #12B26B)",
                        color: "#04301C", fontSize: "0.58rem", fontWeight: 800,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.3), 0 4px 14px -4px rgba(18,178,107,0.95)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{ width: 5, height: 5, borderRadius: 99, background: "#04301C", display: "inline-block" }}
                      />
                      Nuevo
                    </span>
                  )}

                </Link>
              );
            })}
          </div>
        ))}
        {user?.role === "admin" && (
          <div>
            <div
              style={{
                padding: "10px 22px 6px",
                fontSize: "0.62rem",
                fontWeight: 700,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(242,174,188,0.55)",
                marginTop: 6,
              }}
            >
              Administración
            </div>
            <Link
              to="/admin"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "1px 12px",
                padding: "10px 12px",
                borderRadius: 10,
                color: "white",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: "rgba(242,174,188,0.15)",
                border: "1px solid rgba(242,174,188,0.3)",
              }}
            >
              <span style={{ width: 20, display: "flex", justifyContent: "center", color: "#F2AEBC" }}>
                <Icon n="settings" size={18} />
              </span>
              Panel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36, height: 36, background: "#3D5D91", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
              fontFamily: DISPLAY,
            }}
          >
            {user ? initialsOf(user.nombre) : ""}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>
              {user ? user.nombre.split(" ").slice(0, 2).join(" ") : ""}
            </div>
            <div style={{ fontSize: "0.66rem", color: "#F2AEBC", fontWeight: 600, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {user?.planNombre ?? ""}
            </div>
          </div>
        </div>
        <button
          onClick={onYaris}
          style={{
            width: "100%", padding: "11px 12px",
            background: "#6C0820",
            color: "white", border: "none", borderRadius: 10,
            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
            fontFamily: FONT,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#4A0517"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#6C0820"; e.currentTarget.style.transform = "none"; }}
        >
          <YarisAvatar size={20} /> Pregúntale a Yaris
        </button>
        <button
          onClick={onLogout}
          style={{
            width: "100%", padding: "9px 12px", marginTop: 8,
            background: "transparent",
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10,
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s", fontFamily: FONT,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
        >
          <Icon n="exit" size={15} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { user, ready } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [yarisOpen, setYarisOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const streak = useStore(() => (user ? getStreak(user.id) : 0));
  // Franja superior: datos propios reales. Antes vivían aquí un contador
  // aleatorio de "pilotos estudiando" y dos textos fijos.
  const snapshot = useStore(() =>
    user ? studySnapshot(user.id) : { topMateria: null, avgSessionMin: null, sessions: 0 },
  );
  // Relee la nube mientras el dashboard está abierto: sin esto el progreso
  // hecho en otro dispositivo (o los cambios de la administradora) no
  // aparecían hasta recargar la página.
  const live = useLiveData(ready);
  // Presencia en vivo: la administradora ve quién está dentro y en qué pantalla.
  usePresence(user);
  const cerrarSesion = () => {
    logout();
    navigate({ to: "/login" });
  };

  // Cierra el sidebar móvil con Escape (a11y)
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Cierra el sidebar móvil al cambiar de ruta
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Sincroniza el plan con Stripe sólo si la última sincronización ya está
  // vieja: antes corría en cada montaje y saturaba el API de Stripe.
  useEffect(() => {
    if (!ready) return;
    void syncPlanIfStale();
  }, [ready]);


  const isSubjectDetail = /^\/dashboard\/materias\/.+/.test(location.pathname);

  const currentLabel =
    NAV_SECTIONS.flatMap((s) => s.items).find((i) =>
      i.path === "/dashboard"
        ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
        : location.pathname.startsWith(i.path)
    )?.label ?? "Dashboard";

  const now = new Date();
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} de ${
    ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][now.getMonth()]
  } ${now.getFullYear()}`;

  if (!ready) return <div style={{ minHeight: "100vh", background: "#F7F9FC" }} />;

  return (
    <TimerProvider>
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        background: "#FBFAF7",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 260, background: "#22375C",
          position: "fixed", top: 0, left: 0, bottom: 0,
          flexDirection: "column",
          zIndex: 100,
        }}
        className="hidden md:flex"
      >
        <Sidebar onYaris={() => setYarisOpen(true)} onLogout={cerrarSesion} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal={sidebarOpen ? true : undefined}
        aria-label="Menú de navegación"
        aria-hidden={!sidebarOpen}
        style={{
          width: 260, background: "#22375C",
          position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 200,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s",
        }}
        className="md:hidden flex flex-col"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} onYaris={() => { setSidebarOpen(false); setYarisOpen(true); }} onLogout={cerrarSesion} />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}
        className="md:ml-[260px]">

        {isSubjectDetail ? (
          <Outlet />
        ) : (
          <>
            {/* Topbar */}
            <div
              style={{
                background: "white",
                borderBottom: "1px solid rgba(61,93,145,0.08)",
                position: "sticky",
                top: 0,
                zIndex: 50,
              }}
              className="px-3 sm:px-4 md:px-8 h-[60px] md:h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3"
            >
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
                style={{
                  flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center",
                  cursor: "pointer", background: "none", border: "none",
                  minWidth: 44, minHeight: 44, borderRadius: 8,
                }}
                className="md:hidden flex shrink-0 -ml-1.5"
              >
                <span aria-hidden="true" style={{ display: "block", width: 22, height: 2, background: "#22375C", borderRadius: 2 }} />
                <span aria-hidden="true" style={{ display: "block", width: 22, height: 2, background: "#22375C", borderRadius: 2 }} />
                <span aria-hidden="true" style={{ display: "block", width: 22, height: 2, background: "#22375C", borderRadius: 2 }} />
              </button>
              <div className="min-w-0 md:col-start-2">
                <h1
                  style={{
                    fontFamily: DISPLAY,
                    color: "#22375C",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                  className="truncate text-[1.05rem] sm:text-[1.2rem] md:text-[1.3rem]"
                >
                  {currentLabel}
                </h1>
                <p
                  style={{ color: "#8DA1BE", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}
                  className="hidden sm:block truncate text-[0.7rem]"
                >
                  {dateStr}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-self-end">
                <span className="hidden lg:inline-flex"><LiveIndicator state={live} compact /></span>
                <div
                  style={{
                    background: "#FAEFEE", border: "1px solid rgba(108,8,32,0.12)", borderRadius: 20,
                    fontWeight: 600,
                    color: "#6C0820",
                    whiteSpace: "nowrap",
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[0.75rem] sm:text-[0.8rem]"
                  title={`${streak} días de racha`}
                >
                  <span style={{ display: "flex", color: "#6C0820" }}><Icon n="flame" size={14} /></span>
                  {streak}
                  <span className="hidden xs:inline sm:inline">d</span>
                </div>
                <div
                  style={{
                    background: "#3D5D91", borderRadius: "50%",
                    color: "white", fontWeight: 700,
                    flexShrink: 0, fontFamily: DISPLAY,
                  }}
                  className="hidden sm:flex items-center justify-center w-9 h-9 text-[0.8rem]"
                >
                  {user ? initialsOf(user.nombre) : ""}
                </div>
                <button
                  onClick={() => { logout(); navigate({ to: "/login" }); }}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  data-compact
                  style={{
                    borderRadius: "50%",
                    background: "white", border: "1px solid rgba(61,93,145,0.15)",
                    cursor: "pointer", color: "#22375C", flexShrink: 0,
                  }}
                  className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/></svg>
                </button>
              </div>
            </div>

            {/* Radar Bar — global across all dashboard pages */}
            <div
              style={{
                background: "#22375C", color: "white",
                fontFamily: FONT,
              }}
              className="px-3 sm:px-4 md:px-8 py-2 flex items-center justify-between gap-3 text-[12px] sm:text-[12.5px] font-medium"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#F2AEBC" }}>{streak}</span>
                <span className="truncate">{streak === 1 ? "día de racha" : "días de racha"}</span>
              </div>
              {(snapshot.topMateria || snapshot.avgSessionMin !== null) && (
                <div className="hidden md:flex items-center gap-2 opacity-85 min-w-0">
                  {snapshot.topMateria && (
                    <span className="truncate">Tu materia más practicada: <strong>{snapshot.topMateria}</strong></span>
                  )}
                  {snapshot.topMateria && snapshot.avgSessionMin !== null && (
                    <span style={{ opacity: .6 }}>|</span>
                  )}
                  {snapshot.avgSessionMin !== null && (
                    <span className="whitespace-nowrap">Promedio: <strong>{snapshot.avgSessionMin} min</strong></span>
                  )}
                </div>
              )}
            </div>


            {/* Content */}
            <div style={{ flex: 1 }} className="p-4 sm:p-6 md:p-8">
              <Outlet />
            </div>
          </>
        )}
      </div>

      <YarisChatModal open={yarisOpen} onClose={() => setYarisOpen(false)} user={user} />
    </div>
    </TimerProvider>
  );
}
