import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TimerProvider } from "../contexts/StudyTimerContext";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { icon: "🏠", label: "Inicio", path: "/dashboard" },
      { icon: "📚", label: "Mis materias", path: "/dashboard/materias" },
      { icon: "❓", label: "Cuestionarios", path: "/dashboard/banco" },
      { icon: "📝", label: "Simulador CIAAC", path: "/simulador" },
      { icon: "⏱️", label: "Estudiemos Juntos", path: "/dashboard/estudiemos" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { icon: "📖", label: "Biblioteca", path: "/dashboard/biblioteca" },
      { icon: "🃏", label: "Flashcards", path: "/dashboard/flashcards" },
      { icon: "🎬", label: "Clases grabadas", path: "/dashboard/clases" },
      { icon: "📓", label: "Mi Bitácora", path: "/dashboard/bitacora" },
    ],
  },
  {
    label: "Mi progreso",
    items: [
      { icon: "📊", label: "Análisis", path: "/dashboard/analisis" },
      { icon: "🔔", label: "Recordatorios", path: "/dashboard/recordatorios" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { icon: "👤", label: "Mi perfil", path: "/dashboard/perfil" },
      { icon: "⚙️", label: "Configuración", path: "/dashboard/configuracion" },
    ],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#1a1a2e",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 36, height: 36, background: "#3D5D91", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "1rem", fontWeight: 700,
            }}
          >
            F✈
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            Flight<span style={{ color: "#F2AEBC" }}>Path</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              style={{
                padding: "8px 20px",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "rgba(255,255,255,0.3)",
                marginTop: 8,
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? currentPath === "/dashboard" || currentPath === "/dashboard/"
                  : currentPath.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path as "/dashboard"}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 20px",
                    color: isActive ? "white" : "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    borderLeft: `3px solid ${isActive ? "#F2AEBC" : "transparent"}`,
                    background: isActive ? "rgba(61,93,145,0.3)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
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
              color: "white", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
            }}
          >
            MG
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>
              María González
            </div>
            <div style={{ fontSize: "0.7rem", color: "#F2AEBC", fontWeight: 500 }}>
              ✈ Plan Anual
            </div>
          </div>
        </div>
        <button
          style={{
            width: "100%", padding: 10,
            background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
            color: "white", border: "none", borderRadius: 10,
            fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
        >
          🤖 Pregúntale a Yaris
        </button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [radarN, setRadarN] = useState(47);
  const location = useLocation();

  useEffect(() => {
    const iv = setInterval(() => setRadarN(n => Math.max(30, Math.min(80, n + Math.floor(Math.random() * 5) - 2))), 4000);
    return () => clearInterval(iv);
  }, []);

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

  return (
    <TimerProvider>
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f5f7fc",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 260, background: "#1a1a2e",
          position: "fixed", top: 0, left: 0, bottom: 0,
          flexDirection: "column",
          zIndex: 100,
        }}
        className="hidden md:flex"
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        style={{
          width: 260, background: "#1a1a2e",
          position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 200,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s",
        }}
        className="md:hidden flex flex-col"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
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
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 50,
              }}
              className="px-4 md:px-8"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    display: "flex", flexDirection: "column", gap: 5,
                    cursor: "pointer", background: "none", border: "none", padding: 4,
                  }}
                  className="md:hidden"
                >
                  <span style={{ display: "block", width: 22, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
                  <span style={{ display: "block", width: 22, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
                  <span style={{ display: "block", width: 22, height: 2, background: "#1a1a2e", borderRadius: 2 }} />
                </button>
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.3rem",
                      color: "#1a1a2e",
                      lineHeight: 1.2,
                    }}
                  >
                    {currentLabel}
                  </h1>
                  <p style={{ fontSize: "0.78rem", color: "#888" }}>{dateStr}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#F2DCDB", borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: "0.8rem", fontWeight: 700,
                    color: "#6C0820",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔥 14 días
                </div>
                <div
                  style={{
                    width: 36, height: 36,
                    background: "#3D5D91", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "0.85rem", fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  MG
                </div>
              </div>
            </div>

            {/* Radar Bar — global across all dashboard pages */}
            <div
              style={{
                background: "#3D5D91", color: "white",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 12.5, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                flexWrap: "wrap", gap: 4,
              }}
              className="px-4 md:px-8 py-2"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0, animation: "fp-pulse 1.5s ease infinite" }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>{radarN}</span>
                <span>pilotos estudiando ahora mismo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: .85 }} className="hidden sm:flex">
                <span>✈️ Materia más activa: <strong>Meteorología</strong></span>
                <span style={{ opacity: .6 }}>|</span>
                <span>Promedio de sesión: <strong>47 min</strong></span>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }} className="p-4 sm:p-6 md:p-8">
              <Outlet />
            </div>
          </>
        )}
      </div>
    </div>
    </TimerProvider>
  );
}
