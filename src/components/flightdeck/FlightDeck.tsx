import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  CaretDoubleRight,
  GearSix,
  GlobeHemisphereWest,
  Person,
  SignOut,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { cloudEnabled, getReminders, studentStats, useSessionUser, useStore } from "@/lib/store";
import { getFlightPoints } from "@/lib/fp/fp.functions";
import { ACCOUNT_SECTIONS, ASSETS, destinationForPath, SETTINGS_SECTIONS } from "./destinations";
import "./flightdeck.css";
import { ModuleBriefing, hasBriefing } from "./ModuleBriefing";

export function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"],dialog')
  );
}
export function LaunchButton({
  children,
  subtitle,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="fd-launch" onClick={onClick} disabled={disabled} data-primary-action>
      <span>
        <strong>{children}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
      <CaretDoubleRight size={22} weight="bold" />
    </button>
  );
}

export function FlightDeck({
  children,
  onYaris,
  onLogout,
  immersive = false,
}: {
  children: ReactNode;
  onYaris: () => void;
  onLogout: () => void;
  immersive?: boolean;
}) {
  const user = useSessionUser();
  const location = useLocation();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [notices, setNotices] = useState(false),
    [account, setAccount] = useState(false);
  const hub = /^\/dashboard\/?$/.test(location.pathname);
  const screen = location.pathname.split("/")[2] ?? "";
  const briefing =
    !hub && hasBriefing(screen) && location.pathname.split("/").filter(Boolean).length === 2;
  const dest = destinationForPath(location.pathname);
  const settings = SETTINGS_SECTIONS.some((s) => location.pathname === s.path);
  const sections = dest?.sections ?? (settings ? SETTINGS_SECTIONS : ACCOUNT_SECTIONS);
  const active = sections.findIndex(
    (s) => location.pathname === s.path || location.pathname.startsWith(s.path + "/"),
  );
  const stats = useStore(() => (user ? studentStats(user.id) : null));
  const reminders = useStore(() => (user ? getReminders(user.id).filter((r) => r.enabled) : []));
  const points = useQuery({
    queryKey: ["flightdeck-points", user?.id],
    queryFn: () => getFlightPoints(),
    enabled: !!user && cloudEnabled(),
    staleTime: 60_000,
    retry: false,
  });
  const initials =
    user?.nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? "";
  useEffect(() => {
    setNotices(false);
    setAccount(false);
  }, [location.pathname]);
  useEffect(() => {
    if (immersive) return;
    const handler = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isTyping(event.target) ||
        document.querySelector('[role="dialog"],dialog[open]')
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (notices || account) {
          setNotices(false);
          setAccount(false);
        } else if (!hub) void navigate({ to: "/dashboard" });
      }
      if (
        (event.key.toLowerCase() === "q" || event.key.toLowerCase() === "e") &&
        sections.length > 1 &&
        !hub
      ) {
        event.preventDefault();
        const step = event.key.toLowerCase() === "q" ? -1 : 1;
        void navigate({
          to: sections[(Math.max(active, 0) + step + sections.length) % sections.length]
            .path as "/dashboard",
        });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [hub, immersive, active, sections, navigate, notices, account]);
  if (immersive) return <div className="fd-immersive">{children}</div>;
  return (
    <div
      ref={root}
      className={"fd-shell" + (hub ? " fd-is-hub" : "")}
      data-destination={dest?.code ?? "SPACE"}
      style={
        {
          "--fd-world": `url("${ASSETS}${hub || !dest ? "cielo-vialactea-16x9.jpg" : `aeropuerto-${dest.code}.jpg`}")`,
        } as React.CSSProperties
      }
    >
      <a className="fd-skip" href="#flightdeck-main">
        Saltar al contenido
      </a>
      <header className="fd-topbar">
        {hub ? (
          <>
            <Link to="/dashboard" className="fd-brand" aria-label="FlightPath, Director">
              <img src={ASSETS + "logo-flightpath.png"} alt="FlightPath" />
            </Link>
            <nav className="fd-hub-nav" aria-label="Principal">
              <Link to="/dashboard" aria-current="page">
                Director
              </Link>
              <Link to="/dashboard/configuracion">
                <GearSix size={16} weight="duotone" />
                Configuración
              </Link>
              <Link to="/dashboard/perfil">
                <Person size={16} weight="duotone" />
                Mi perfil
              </Link>
            </nav>
          </>
        ) : (
          <>
            <Link className="fd-hub-link" to="/dashboard">
              <GlobeHemisphereWest size={28} weight="duotone" />
              <ArrowLeft size={13} />
              <span>HUB</span>
              <kbd>ESC</kbd>
            </Link>
            <div className="fd-module-code">
              <strong>{dest?.name ?? (settings ? "Configuración" : "Mi perfil")}</strong>
              <small>{dest ? `${dest.code} · ${dest.city}` : "FLIGHTPATH · TU CABINA"}</small>
            </div>
            <nav className="fd-tabs" aria-label="Secciones del módulo">
              {sections.map((s, i) => (
                <Link
                  key={s.path}
                  to={s.path as "/dashboard"}
                  aria-current={active === i ? "page" : undefined}
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </>
        )}
        <div className="fd-user-controls">
          <div className="fd-popover-anchor">
            <button
              className="fd-icon-button"
              aria-label="Recordatorios y notificaciones"
              aria-expanded={notices}
              onClick={() => {
                setNotices(!notices);
                setAccount(false);
              }}
            >
              <Bell size={22} weight="duotone" />
              {reminders.length > 0 && <span className="fd-count">{reminders.length}</span>}
            </button>
            {notices && (
              <section className="fd-popover" aria-label="Tus recordatorios">
                <div className="fd-popover-title">
                  <span>Recordatorios</span>
                  <button aria-label="Cerrar recordatorios" onClick={() => setNotices(false)}>
                    <X size={18} />
                  </button>
                </div>
                {reminders.length ? (
                  reminders.slice(0, 4).map((r) => (
                    <Link key={r.id} to="/dashboard/recordatorios">
                      <strong>{r.titulo}</strong>
                      <small>
                        {r.hora} · {r.sub}
                      </small>
                    </Link>
                  ))
                ) : (
                  <p>No tienes recordatorios activos. Programa tu próximo vuelo.</p>
                )}
                <Link to="/dashboard/recordatorios">Ver todos los recordatorios</Link>
              </section>
            )}
          </div>
          {hub && (
            <div className="fd-pilot-name">
              <strong>{user?.nombre}</strong>
              <small>
                {user?.planNombre} · {stats?.streak ?? 0} días de racha
              </small>
            </div>
          )}
          <Link to="/dashboard/analisis" className="fd-level">
            <Sparkle size={15} weight="fill" />
            <strong>{stats?.readiness ?? "—"}</strong>
            <small>
              Preparación<em>CORTE CIAAC · 80</em>
            </small>
          </Link>
          <Link to="/dashboard/comunidad" className="fd-points">
            <Sparkle size={16} />
            {points.data ? points.data.total.toLocaleString("es-MX") : "—"} FP
          </Link>
          <div className="fd-popover-anchor">
            <button
              className="fd-avatar"
              onClick={() => {
                setAccount(!account);
                setNotices(false);
              }}
              aria-label="Abrir menú de cuenta"
              aria-expanded={account}
            >
              {initials}
            </button>
            {account && (
              <nav className="fd-popover" aria-label="Cuenta">
                {ACCOUNT_SECTIONS.map((s) => (
                  <Link key={s.path} to={s.path as "/dashboard"}>
                    <s.icon size={18} weight="duotone" />
                    {s.label}
                  </Link>
                ))}
                <Link to="/dashboard/configuracion">
                  <GearSix size={18} />
                  Configuración
                </Link>
                {user?.role === "admin" && <Link to="/admin">Panel de administración</Link>}
                <button onClick={onLogout}>
                  <SignOut size={18} />
                  Cerrar sesión
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>
      <main
        id="flightdeck-main"
        className={hub ? "fd-hub-main" : "fd-content"}
        data-screen={screen}
        tabIndex={-1}
      >
        {briefing ? (
          <div className="fd-workspace-layout">
            <ModuleBriefing screen={screen} />
            <div className="fd-workspace-content">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      {!hub && (
        <footer className="fd-bottom">
          <span>
            <kbd>ESC</kbd> Volver al hub <kbd>Q / E</kbd> Cambiar sección
          </span>
          <button onClick={onYaris}>
            <img src={ASSETS + "pathy.png"} alt="" />
            <small>PATHY</small>
            <span>Un paso a la vez. Tu próximo vuelo empieza aquí.</span>
          </button>
        </footer>
      )}
      {hub && (
        <nav className="fd-mobile-tabs" aria-label="Navegación móvil">
          <Link to="/dashboard" aria-current="page">
            <GlobeHemisphereWest size={22} weight="duotone" />
            Director
          </Link>
          <Link to="/dashboard/banco">
            <CaretDoubleRight size={22} />
            Continuar
          </Link>
          <Link to="/dashboard/configuracion">
            <GearSix size={22} weight="duotone" />
            Configuración
          </Link>
        </nav>
      )}
    </div>
  );
}
