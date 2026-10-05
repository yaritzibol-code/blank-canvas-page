import { useEffect, useRef, useState } from "react";
import "./boundary-flow-media.css";

type FlowMode = "laminar" | "turbulent";
const CHORD = 420;
const LEADING = 150;
const CENTER = 165;

// NACA 2412-inspired schematic: rounded leading edge, closed sharp trailing edge.
export function boundarySurface(x: number, side: number) {
  const t = Math.max(0, Math.min(1, (x - LEADING) / CHORD));
  const camber =
    t < 0.4 ? (0.02 / 0.16) * (0.8 * t - t * t) : (0.02 / 0.36) * (0.2 + 0.8 * t - t * t);
  const thickness =
    0.6 * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t ** 2 + 0.2843 * t ** 3 - 0.1036 * t ** 4);
  return CENTER - CHORD * camber + side * CHORD * thickness;
}
const outline =
  [
    ...Array.from({ length: 101 }, (_, i) => [
      LEADING + (CHORD * (1 - Math.cos((Math.PI * i) / 100))) / 2,
      boundarySurface(LEADING + (CHORD * (1 - Math.cos((Math.PI * i) / 100))) / 2, -1),
    ]),
    ...Array.from({ length: 100 }, (_, i) => [
      LEADING + (CHORD * (1 - Math.cos((Math.PI * (99 - i)) / 100))) / 2,
      boundarySurface(LEADING + (CHORD * (1 - Math.cos((Math.PI * (99 - i)) / 100))) / 2, 1),
    ]),
  ]
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ") + " Z";

/** Illustrative trajectories, not CFD. Positive mean x speed in both attached modes. */
export function boundaryParticle(index: number, seconds: number, mode: FlowMode) {
  const row = index % 5;
  const side = index % 2 ? 1 : -1;
  const speed = 28 + row * 12;
  const x = 28 + ((Math.floor(index / 5) * 59 + seconds * speed) % 690);
  const offset = 7 + row * 11;
  const envelope = Math.max(0, Math.sin(Math.PI * Math.max(0, Math.min(1, (x - 100) / 540))));
  const mixing =
    mode === "turbulent"
      ? envelope *
        (3 * Math.sin(x * 0.043 + seconds * 2.1 + index) +
          1.8 * Math.sin(x * 0.091 - seconds * 1.4 + index * 2))
      : 0;
  return { x, y: boundarySurface(x, side) + side * (offset + mixing) };
}

export function BoundaryFlowMedia() {
  const [mode, setMode] = useState<FlowMode>("laminar");
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const elapsed = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) elapsed.current += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      setSeconds(elapsed.current);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);
  return (
    <section className="boundary-media" aria-label="Observa el flujo junto al ala">
      <header>
        <span className="hb-overline">Observa y compara</span>
        <h3>El aire sigue al perfil</h3>
      </header>
      <div className="boundary-controls" role="group" aria-label="Estado de la capa límite">
        <button type="button" aria-pressed={mode === "laminar"} onClick={() => setMode("laminar")}>
          Laminar
        </button>
        <button
          type="button"
          aria-pressed={mode === "turbulent"}
          onClick={() => setMode("turbulent")}
        >
          Turbulento adherido
        </button>
        <button type="button" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
          {playing ? "Pausar animación" : "Reproducir animación"}
        </button>
      </div>
      <svg
        className="boundary-scene"
        viewBox="0 0 760 345"
        role="img"
        aria-labelledby="boundary-title boundary-desc"
        data-playing={playing}
        data-time={seconds.toFixed(3)}
      >
        <title id="boundary-title">
          {mode === "laminar" ? "Flujo laminar adherido" : "Flujo turbulento adherido"}
        </title>
        <desc id="boundary-desc">
          Perfil inmóvil con borde de ataque redondeado a la izquierda y borde de salida fino a la
          derecha. Partículas de izquierda a derecha; en turbulento hay mezcla transversal pequeña y
          el flujo medio sigue adherido. Un detalle plano muestra velocidad cero en la pared y
          creciente hacia el flujo exterior.
        </desc>
        <text x="28" y="32" className="boundary-label">
          Aire relativo →
        </text>
        <text x="28" y="54" className="boundary-small">
          {mode === "laminar" ? "Capas ordenadas" : "Mezcla transversal · flujo medio adherido"}
        </text>
        {Array.from({ length: 120 }, (_, i) => {
          const p = boundaryParticle(i, seconds, mode);
          return (
            <circle
              key={i}
              data-particle={i}
              cx={p.x}
              cy={p.y}
              r={2.4}
              fill={mode === "turbulent" && i % 3 ? "#f18578" : "#e7c77b"}
              opacity={0.85}
            />
          );
        })}
        <path data-airfoil="true" d={outline} fill="#233e65" stroke="#e7c77b" strokeWidth="2" />
        <text x="150" y="250" className="boundary-small">
          Ataque redondeado
        </text>
        <text x="495" y="250" className="boundary-small">
          Salida fina
        </text>
        <g transform="translate(28 265)">
          <text className="boundary-small">Esquema original</text>
          <text y="20" className="boundary-small">
            Capa ampliada · sin escala · no es CFD
          </text>
          <text y="40" className="boundary-small">
            Ambos estados pueden permanecer adheridos.
          </text>
        </g>
        <g transform="translate(455 265)">
          <text className="boundary-small">Detalle local plano · velocidad media</text>
          <path d="M 0 60 H 255" stroke="#e7c77b" strokeWidth="3" />
          <path d="M 14 60 Q 40 57 61 45 T 117 17" stroke="#f18578" fill="none" strokeWidth="2" />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M 14 ${45 - i * 14} h ${43 + i * 24} l -5 -3 m 5 3 l -5 3`}
              stroke="#dfeafa"
              fill="none"
            />
          ))}
          <text x="133" y="20" className="boundary-small">
            u ≈ Ue
          </text>
          <text x="133" y="51" className="boundary-small">
            u = 0 en pared
          </text>
        </g>
      </svg>
      <p aria-live="polite">
        {mode === "laminar"
          ? "Las partículas avanzan en capas ordenadas, con poca mezcla transversal."
          : "Las fluctuaciones mezclan aire y redistribuyen cantidad de movimiento entre capas. Turbulencia no significa separación."}
      </p>
      {reduced && (
        <small>
          Movimiento reducido: la animación empieza en pausa. Puedes reproducirla si lo deseas.
        </small>
      )}
      <details>
        <summary>Cómo leer el esquema</summary>
        <p>
          El ala permanece fija. Las trayectorias y el grosor están exagerados para observar el
          movimiento; no predicen fuerzas ni velocidades reales. Ue es la velocidad del flujo
          exterior local. La mezcla puede ayudar al flujo a resistir un gradiente adverso de
          presión, pero no garantiza que siga adherido. Separación es cuando el flujo deja de seguir
          la superficie.
        </p>
      </details>
    </section>
  );
}

export function BoundaryFlowVideo() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  return (
    <section
      className="boundary-media boundary-video"
      aria-label="Video original de la capa límite"
    >
      <h3>Ahora observa una superficie real</h3>
      <p>
        En el video de surparamotor, observa la dirección de los hilos y dónde el flujo deja de
        seguir la superficie al cambiar las condiciones de vuelo. Los hilos muestran adherencia y
        separación; un flujo turbulento también puede estar adherido. Por sí solos no distinguen
        flujo laminar de turbulento.
      </p>
      {videoLoaded ? (
        <iframe
          title="LA CAPA LÍMITE Y LA PÉRDIDA · surparamotor"
          src="https://www.youtube-nocookie.com/embed/OT0ynzPtoVE?autoplay=0&controls=1&rel=0"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button className="boundary-load" type="button" onClick={() => setVideoLoaded(true)}>
          Cargar video original · 2:03
        </button>
      )}
      <small>
        Al cargar se conecta con YouTube. Reproducción y pantalla completa a tu elección.
      </small>
      <a
        href="https://www.youtube.com/watch?v=OT0ynzPtoVE"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver el original en YouTube si el reproductor no está disponible ↗
      </a>
      <small>
        Video: surparamotor, «LA CAPA LÍMITE Y LA PÉRDIDA». Fundamentos y referencias del tema al
        pie.
      </small>
    </section>
  );
}
