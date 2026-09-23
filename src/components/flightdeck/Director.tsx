import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CaretRight, Moon, AirplaneTakeoff, Sun, X } from "@phosphor-icons/react";
import {
  getSimAttempts,
  materiaPerformance,
  studentStats,
  updateUser,
  useSessionUser,
  useStore,
  type StudentStats,
} from "@/lib/store";
import { generoDe, porGenero } from "@/lib/store/genero";
import { OnboardingModal } from "@/components/shared/OnboardingModal";
import { DataSyncBanner } from "@/components/shared/DataSyncBanner";
import { ASSETS, DESTINATIONS, type Destination } from "./destinations";
import { Globe } from "./Globe";
import { isTyping } from "./FlightDeck";
import { PathyTour } from "./PathyTour";

function metric(index: number, stats: StudentStats | null) {
  if (!stats) return "Por explorar";
  if (index === 0) return `${stats.courseProgress}% completado`;
  if (index === 1)
    return stats.avgScore === null ? "Tu primer vuelo" : `${stats.avgScore}% aciertos`;
  return ["", "", "Inglés y aptitudes", "Manuales de vuelo", `${stats.streak} días de racha`][
    index
  ];
}
function routeStatus(index: number) {
  return ["A TIEMPO", "EMBARCANDO", "EMBARCANDO", "ABIERTO", "A TIEMPO"][index];
}
function ticketMetric(index: number, stats: StudentStats | null) {
  if (index === 0) return `${stats?.courseProgress ?? 0}%`;
  if (index === 1) return stats?.avgScore === null || stats?.avgScore === undefined ? "—" : `${stats.avgScore}%`;
  return ["", "", "68%", "40%", `#${Math.max(1, stats?.streak ?? 1)}`][index];
}
function sectionMetric(index: number) {
  return ["68% del temario", "32 para hoy", "Racha de 3", "12 pendientes"][index] ?? "Abrir ruta";
}
function Arrival({
  destination,
  onClose,
  reduced,
}: {
  destination: Destination;
  onClose: () => void;
  reduced: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const [landed, setLanded] = useState(reduced),
    [progress, setProgress] = useState(reduced ? 100 : 0);
  const [videoFailed, setVideoFailed] = useState(false);
  const skipped = useRef(false);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    if (reduced) return () => node?.close();
    const start = performance.now();
    const timer = window.setInterval(() => {
      const p = skipped.current ? 100 : Math.min(100, (performance.now() - start) / 33);
      setProgress(p);
      if (p === 100) {
        setLanded(true);
        clearInterval(timer);
      }
    }, 50);
    const play = window.setTimeout(() => {
      if (video.current) {
        video.current.playbackRate = 2.5;
        void video.current.play().catch(() => setVideoFailed(true));
      }
    }, 900);
    return () => {
      clearInterval(timer);
      clearTimeout(play);
      node?.close();
    };
  }, [reduced]);
  return (
    <dialog
      ref={dialog}
      className={"fd-arrival " + (landed ? "is-landed" : "is-diving")}
      aria-labelledby={landed ? "arrival-title" : undefined}
      aria-label={landed ? undefined : `Volando hacia ${destination.name}`}
      onCancel={onClose}
      style={{ backgroundImage: `url("${ASSETS}aeropuerto-${destination.code}.jpg")` }}
    >
      {!reduced && !videoFailed && (
        <video
          ref={video}
          src={ASSETS + `picada-${destination.code}.mp4`}
          poster={ASSETS + `aeropuerto-${destination.code}.jpg`}
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        />
      )}
      {!landed && (
        <>
          <div className="fd-dive-clouds fd-cloud-one" style={{ backgroundImage: `url("${ASSETS}picada-inicio-nubes.jpg")` }} />
          <div className="fd-dive-clouds fd-cloud-two" style={{ backgroundImage: `url("${ASSETS}picada-nubes-a.jpg")` }} />
          <div className="fd-dive-clouds fd-cloud-three" style={{ backgroundImage: `url("${ASSETS}picada-nubes-b.jpg")` }} />
          <div className="fd-descent-hud">
            <div><p>DESCENSO · {destination.code}</p><strong>{destination.name}</strong></div>
            <div><small>ALTITUD</small><strong>{Math.max(0, Math.round((100 - progress) * 358))}<em> km</em></strong></div>
            <span><i style={{ width: `${progress}%` }} /></span>
          </div>
        </>
      )}
      <button
        className="fd-arrival-close fd-icon-button"
        aria-label="Volver al Director"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      {landed && (
        <div className="fd-arrival-card fd-arrival-selector">
          <p className="fd-eyebrow">ATERRIZAJE · {destination.code} · {destination.city}</p>
          <div className="fd-arrival-title"><h2 id="arrival-title">{destination.name}</h2><strong>{metric(DESTINATIONS.indexOf(destination), null)}</strong></div>
          <p>¿A qué submódulo entras?</p>
          <div className="fd-submodules">
            {destination.sections.map((s, index) => (
              <Link to={s.path as "/dashboard"} key={s.path}>
                <s.icon size={23} weight="duotone" />
                <span>
                  <strong>{s.label}</strong>
                  <small>{s.description}</small>
                </span>
                <em>{sectionMetric(index)} ›</em>
              </Link>
            ))}
          </div>
          <button className="fd-text-button" onClick={onClose}>
            Volver al Director
          </button>
        </div>
      )}
    </dialog>
  );
}
export function Director() {
  const user = useSessionUser();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(1),
    [live, setLive] = useState(true),
    [flying, setFlying] = useState(false);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  /**
   * Primer inicio de sesión: primero el recorrido de Pathy por los destinos y
   * después el asistente que prepara la cabina (perfil). `?tour=1` repite el
   * recorrido cuando se quiera.
   */
  const [tourReplay, setTourReplay] = useState(false);
  const newPilot = !!user && !user.onboardingDone;
  const showTour = tourReplay || (newPilot && !user?.tourDone);
  /** Destino que estaba elegido antes del recorrido, para devolver el globo ahí. */
  const beforeTour = useRef<number | null>(null);
  const selectForTour = useCallback((index: number) => {
    if (beforeTour.current === null) beforeTour.current = selectedRef.current;
    setSelected(index);
  }, []);
  const closeTour = useCallback(() => {
    if (beforeTour.current !== null) setSelected(beforeTour.current);
    beforeTour.current = null;
    setTourReplay(false);
    // El foco vuelve al Director: las flechas ya mueven el globo.
    root.current?.focus({ preventScroll: true });
    if (user && !user.tourDone) updateUser(user.id, { tourDone: true });
    // Sin el parámetro, recargar no vuelve a lanzar el recorrido.
    // Ruta absoluta: con `to: "."` el router resolvía /dashboard/dashboard (404).
    if (new URLSearchParams(window.location.search).has("tour")) {
      void navigate({ to: "/dashboard", search: {}, replace: true });
    }
  }, [navigate, user]);
  const [clock, setClock] = useState<Date | null>(null),
    [reduced, setReduced] = useState(false);
  const [details, setDetails] = useState(false);
  const stats = useStore(() => (user ? studentStats(user.id) : null));
  const performance = useStore(() => (user ? materiaPerformance(user.id, "todo") : []));
  const lastSim = useStore(() =>
    user ? getSimAttempts(user.id).sort((a, b) => b.date.localeCompare(a.date))[0] : undefined,
  );
  const weak = [...performance]
    .filter((m) => m.avg !== null)
    .sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))[0];
  const destination = DESTINATIONS[selected];
  useEffect(() => {
    try {
      setLive(localStorage.getItem("fp.director.live") !== "false");
    } catch {
      /* restricted storage */
    }
    setClock(new Date());
    if (new URLSearchParams(window.location.search).get("tour") === "1") setTourReplay(true);
    const tick = setInterval(() => setClock(new Date()), 60000);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches || user?.prefs.toggles.pathy === false);
    update();
    media.addEventListener("change", update);
    return () => {
      clearInterval(tick);
      media.removeEventListener("change", update);
    };
  }, [user?.prefs.toggles.pathy]);
  useEffect(() => {
    const el = root.current;
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isTyping(event.target) ||
        flying ||
        document.querySelector('[role="dialog"],dialog[open]')
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setSelected((s) => (s + (event.key === "ArrowRight" ? 1 : 4)) % 5);
      }
      if (event.key === "Enter" && event.target === el) {
        event.preventDefault();
        setFlying(true);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [flying]);
  const days =
    user?.fechaCiaac && clock
      ? Math.ceil((new Date(user.fechaCiaac + "T08:00:00").getTime() - clock.getTime()) / 86400000)
      : null;
  const time = clock
    ? new Intl.DateTimeFormat("es-MX", {
        timeZone: destination.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(clock)
    : "—";
  return (
    <div
      className="fd-director"
      ref={root}
      data-touring={showTour || undefined}
      tabIndex={0}
      aria-label="Director de vuelo. Usa las flechas para elegir destino."
    >
      <div className="fd-sync">
        <DataSyncBanner />
      </div>
      <Globe selected={selected} onSelect={setSelected} live={live} reduced={reduced} />
      <section
        className={"fd-destination-card" + (details ? " is-expanded" : "")}
        aria-labelledby="destination-title"
        data-tour="destination-card"
      >
        <p className="fd-eyebrow">
          DESTINO · {destination.city} · {destination.code}
        </p>
        <h1 id="destination-title">{destination.name}</h1>
        <div className="fd-mobile-summary">
          <small>{selected === 1 ? "ÚLTIMO SIMULACRO" : "TU PROGRESO"}</small>
          <strong>
            {selected === 1
              ? lastSim
                ? Math.round(lastSim.scorePct)
                : "—"
              : `${stats?.courseProgress ?? 0}%`}
          </strong>
        </div>
        <p className="fd-destination-description">{destination.description}</p>
        <div className="fd-flight-stats">
          <div>
            <small>{selected === 1 ? "ÚLTIMO SIMULACRO" : "TU PROGRESO"}</small>
            <strong>
              <span className="fd-stat-diamond">◆</span>
              {selected === 1
                ? lastSim
                  ? Math.round(lastSim.scorePct)
                  : "—"
                : (stats?.courseProgress ?? 0)}
              <span>{selected === 1 ? "" : "%"}</span>
            </strong>
          </div>
          <div>
            <small>{selected === 1 ? "CORTE CIAAC" : "RACHA DE ESTUDIO"}</small>
            <strong>
              <span className="fd-stat-diamond">◆</span>
              {selected === 1 ? "80" : (stats?.streak ?? 0)}
              <span>{selected === 1 ? "" : " días"}</span>
            </strong>
          </div>
        </div>
        <p className="fd-eyebrow fd-submodule-label">SUBMÓDULOS · {destination.sections.length}</p>
        <div className="fd-submodules" data-tour="submodules">
          {destination.sections.map((s, index) => (
            <Link
              key={s.path}
              to={s.path as "/dashboard"}
              style={{ "--i": index } as React.CSSProperties}
            >
              <span className="fd-submodule-icon">
                <s.icon size={23} weight="duotone" />
              </span>
              <span>
                <strong>{s.label}</strong>
                <small>{s.description}</small>
              </span>
              <em>{sectionMetric(index)} ›</em>
            </Link>
          ))}
        </div>
        <button className="fd-takeoff" onClick={() => setFlying(true)}>
          <i className="fd-takeoff-ring" aria-hidden="true" /><i className="fd-takeoff-ring is-second" aria-hidden="true" />
          <i className="fd-takeoff-corner is-tl" aria-hidden="true" /><i className="fd-takeoff-corner is-tr" aria-hidden="true" />
          <i className="fd-takeoff-corner is-bl" aria-hidden="true" /><i className="fd-takeoff-corner is-br" aria-hidden="true" />
          <i className="fd-takeoff-sheen" aria-hidden="true" /><i className="fd-takeoff-runway" aria-hidden="true" />
          <span className="fd-takeoff-plane">
            <i className="fd-plane-trail" aria-hidden="true" /><i className="fd-plane-status" aria-hidden="true" />
            <AirplaneTakeoff size={29} weight="duotone" />
          </span>
          <span>
            <strong>Despegar</strong>
            <small>RUMBO A {destination.code}</small>
          </span>
          <span className="fd-takeoff-chevrons" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span>
        </button>
        <button
          className="fd-mobile-details"
          aria-expanded={details}
          onClick={() => setDetails(!details)}
        >
          {details ? "Menos detalles" : "Detalles"} <CaretRight size={16} />
        </button>
      </section>
      <aside className="fd-director-aside">
        <section className="fd-panel fd-contracts">
          <div className="fd-contract-heading">
            <img src={ASSETS + "pathy.png"} alt="Pathy" />
            <div>
              <p className="fd-eyebrow">CONTRATOS DE PATHY</p>
              <small>Se renuevan cada día</small>
            </div>
          </div>
          <Link to="/dashboard/banco">
            <strong>{weak ? `Refuerza ${weak.name}` : "Tu primera misión"}</strong><em>+60 FP</em>
            <p>
              {weak
                ? `Tu precisión es de ${weak.avg}%. Una práctica corta te ayuda a seguir avanzando.`
                : "Practica un cuestionario y descubre tus puntos fuertes."}
            </p>
          </Link>
          <Link to="/dashboard/rutas">
            <strong>Estrena Seguridad Aérea</strong><em>+40 FP</em>
            <p>{stats?.temasDone ?? 0} temas completados. Tu ruta te espera.</p>
          </Link>
          <Link to="/dashboard/bitacora">
            <strong>Escribe tu bitácora</strong><em>+20 FP</em>
            <p>Registra lo que aprendiste y cómo te sentiste hoy.</p>
          </Link>
        </section>
        <section className="fd-panel fd-countdown">
          <p className="fd-eyebrow">TEMPORADA CIAAC 2026</p>
          <h2>
            {days === null ? (
              "Elige tu fecha de vuelo"
            ) : days < 0 ? (
              "Tu próximo objetivo"
            ) : (
              <>
                <em>{days}</em> días para el examen
              </>
            )}
          </h2>
          {days === null || days < 0 ? (
            <Link to="/dashboard/perfil">
              Configurar mi fecha <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <progress
                max={100}
                value={stats?.readiness ?? 0}
                aria-label="Preparación para el examen"
              />
              <p>
                {stats?.readiness === null
                  ? "Tu preparación aparecerá después de practicar."
                  : `Preparación estimada ${stats?.readiness}%. Sigue construyendo tu camino.`}
              </p>
            </>
          )}
        </section>
        <p className="fd-globe-help">
          <kbd>Arrastra</kbd> girar el globo
          <br />
          <kbd>← →</kbd> cambiar destino
        </p>
      </aside>
      <div className="fd-live">
        <button
          role="switch"
          aria-checked={live}
          aria-label="Iluminación del globo en vivo"
          onClick={() => {
            setLive(!live);
            try {
              localStorage.setItem("fp.director.live", String(!live));
            } catch {
              /* preference remains in memory */
            }
          }}
        >
          <span className={"fd-switch " + (live ? "is-on" : "")} />
          <small>EN VIVO</small>
        </button>
        {live ? <Moon size={14} /> : <Sun size={14} />}
        <span>
          {destination.city} · {time}
        </span>
      </div>
      <nav className="fd-destinations" aria-label="Elegir destino">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.code}
            className={"fd-destination-chip" + (selected === i ? " is-active" : "")}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(2,7,15,.16),rgba(2,7,15,.95)),url("${ASSETS + d.photo}")`,
            }}
          >
            <small>{d.code}</small>
            <span>
              <span><small>MEX → {d.code}</small><strong>{d.name}</strong><em><b>●</b> {routeStatus(i)}</em></span>
              <span className="fd-ticket-stub"><small>P0{i + 1}</small><strong>{ticketMetric(i, stats)}</strong><em>/100</em></span>
            </span>
            <i className="fd-ticket-notch is-top" /><i className="fd-ticket-notch is-bottom" />
          </button>
        ))}
      </nav>
      {flying && (
        <Arrival destination={destination} onClose={() => setFlying(false)} reduced={reduced} />
      )}
      {showTour && (
        <PathyTour
          welcomeTitle={porGenero(
            generoDe(user),
            "Bienvenida a FlightPath",
            "Bienvenido a FlightPath",
            "Bienvenido a FlightPath",
          )}
          finishLabel={newPilot ? "Preparar mi cabina" : "¡A despegar!"}
          reduced={reduced}
          onSelect={selectForTour}
          onClose={closeTour}
        />
      )}
      {user && newPilot && !showTour && <OnboardingModal user={user} onDone={() => {}} />}
    </div>
  );
}
