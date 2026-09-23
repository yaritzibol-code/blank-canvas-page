/**
 * Recorrido de Pathy: el primer vuelo por la cabina (6 pasos).
 *
 * 1. Bienvenida: qué es FlightPath, en dos líneas.
 * 2–6. Pathy recorre los cinco destinos del Director. En cada paso el globo
 *    gira hacia el destino (el Director cambia su `selected`) y un reflector
 *    enmarca la tarjeta del destino, que muestra sus submódulos; la burbuja de
 *    Pathy los nombra y explica para qué sirve el módulo.
 *
 * Se monta en `<body>` con un portal: así ningún ancestro del hub (transform,
 * filter, isolation) altera el posicionamiento fijo del reflector ni de la
 * burbuja. El reflector es un solo elemento con una sombra enorme: el hueco es
 * la tarjeta y la sombra oscurece todo lo demás.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variants,
} from "motion/react";
import { AirplaneTakeoff, ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { trackAbandon, trackMilestone } from "@/lib/activity-tracker";
import { ASSETS, DESTINATIONS } from "./destinations";

/** Bienvenida + un paso por destino del Director. */
export const TOUR_STEPS = DESTINATIONS.length + 1;

/** Lo que Pathy cuenta de cada destino, en primera persona y en una línea. */
const PATHY_LINES: Record<string, string> = {
  LAX: "Tu base teórica: rutas paso a paso, repaso con flashcards, clases grabadas y sesiones de estudio guiadas conmigo.",
  MEX: "Practica con los bancos reales del CIAAC y de línea aérea, o mide tu ritmo en un reto contra el reloj.",
  BOG: "Entrena el inglés aeronáutico con entrevistas por voz y las aptitudes de piloto que evalúa COMPASS.",
  MIA: "Manuales oficiales y material de consulta, ordenados para que siempre los tengas a la mano.",
  GRU: "Cada sesión suma. Sube en el ranking y celebra tus avances con otros pilotos.",
};

/** "Learning Paths, Flashcards y Clases grabadas". */
function listaDe(items: string[]) {
  return new Intl.ListFormat("es", { style: "long", type: "conjunction" }).format(items);
}

const CARD = '[data-tour="destination-card"]';
const ANCHOR = '[data-tour="submodules"]';
/** Aire alrededor de la tarjeta dentro del reflector. */
const SPOT_PAD = 10;
/** Separación entre el reflector y la burbuja (deja sitio a la flecha). */
const GAP = 26;
const MARGIN = 16;
/** Lo que Pathy asoma por encima de la burbuja: no debe quedar fuera de pantalla. */
const PEEK = 34;

const SPRING: Transition = { type: "spring", stiffness: 170, damping: 26, mass: 0.9 };
const SOFT: Transition = { type: "spring", stiffness: 260, damping: 30 };

type Rect = { x: number; y: number; w: number; h: number };
type Side = "right" | "left" | "top" | "bottom" | "dock";

function toRect(el: Element): Rect {
  const b = el.getBoundingClientRect();
  return {
    x: Math.round(b.left),
    y: Math.round(b.top),
    w: Math.round(b.width),
    h: Math.round(b.height),
  };
}

function sameRect(a: Rect | null, b: Rect | null) {
  return !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/**
 * Sigue la tarjeta del destino: su posición cambia al hacer scroll (en móvil
 * vive al final de la página) y su alto cambia con los submódulos de cada
 * destino. También devuelve el ancla de la flecha: la lista de submódulos.
 */
function useTarget(active: boolean, step: number, reduced: boolean) {
  const [target, setTarget] = useState<{ card: Rect; anchor: Rect } | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      setTarget(null);
      return;
    }
    const card = document.querySelector(CARD);
    if (!card) {
      setTarget(null);
      return;
    }
    const measure = () => {
      const next = toRect(card);
      const anchorEl = card.querySelector(ANCHOR);
      const anchor =
        anchorEl && anchorEl.getBoundingClientRect().height > 0 ? toRect(anchorEl) : next;
      setTarget((prev) =>
        prev && sameRect(prev.card, next) && sameRect(prev.anchor, anchor)
          ? prev
          : { card: next, anchor },
      );
    };
    const b = card.getBoundingClientRect();
    if (b.top < 0 || b.bottom > window.innerHeight) {
      card.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    // Cubre movimientos que no avisan: el banner de sincronización que empuja
    // la tarjeta o el contenido que cambia de destino a destino.
    const poll = window.setInterval(measure, 250);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(poll);
    };
  }, [active, step, reduced]);

  return target;
}

function useViewport() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

/**
 * Coloca la burbuja junto al reflector: derecha, izquierda, arriba o abajo.
 * Sin tarjeta a la vista se acopla abajo, al centro, sin flecha.
 */
function placeBubble(
  spot: Rect | null,
  anchor: Rect | null,
  bubble: { w: number; h: number },
  vw: number,
  vh: number,
): { x: number; y: number; side: Side; arrow: number } {
  const clampX = (x: number) => Math.max(MARGIN, Math.min(vw - bubble.w - MARGIN, x));
  const clampY = (y: number) => Math.max(MARGIN + PEEK, Math.min(vh - bubble.h - MARGIN, y));
  if (!spot || !anchor)
    return {
      x: clampX((vw - bubble.w) / 2),
      y: clampY(vh - bubble.h - MARGIN * 2),
      side: "dock",
      arrow: 0,
    };
  const anchorY = anchor.y + anchor.h / 2;
  const anchorX = anchor.x + anchor.w / 2;
  const arrowOn = (pos: number, start: number, size: number) =>
    Math.max(28, Math.min(size - 28, pos - start));

  if (spot.x + spot.w + GAP + bubble.w + MARGIN <= vw) {
    const y = clampY(anchorY - bubble.h / 2);
    return { x: spot.x + spot.w + GAP, y, side: "right", arrow: arrowOn(anchorY, y, bubble.h) };
  }
  if (spot.x - GAP - bubble.w >= MARGIN) {
    const y = clampY(anchorY - bubble.h / 2);
    return { x: spot.x - GAP - bubble.w, y, side: "left", arrow: arrowOn(anchorY, y, bubble.h) };
  }
  const x = clampX(anchorX - bubble.w / 2);
  if (spot.y - GAP - bubble.h >= MARGIN + PEEK) {
    return { x, y: spot.y - GAP - bubble.h, side: "top", arrow: arrowOn(anchorX, x, bubble.w) };
  }
  if (spot.y + spot.h + GAP + bubble.h + MARGIN <= vh) {
    return { x, y: spot.y + spot.h + GAP, side: "bottom", arrow: arrowOn(anchorX, x, bubble.w) };
  }
  // Pantallas muy bajas: la burbuja se acopla en el lado contrario a los
  // submódulos para no taparlos.
  return {
    x,
    y: anchorY > vh / 2 ? MARGIN + PEEK : vh - bubble.h - MARGIN,
    side: "dock",
    arrow: 0,
  };
}

export function PathyTour({
  welcomeTitle,
  finishLabel,
  reduced,
  onSelect,
  onClose,
}: {
  /** "Bienvenido a FlightPath" (o "Bienvenida…", según el perfil). */
  welcomeTitle: string;
  /** Texto del último botón: "Preparar mi cabina" o "¡A despegar!". */
  finishLabel: string;
  reduced: boolean;
  /** Lleva el Director (y su globo) al destino indicado. */
  onSelect: (index: number) => void;
  /** `completed` es falso si la persona saltó el recorrido. */
  onClose: (completed: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [closing, setClosing] = useState<boolean | null>(null);
  const viewport = useViewport();
  // Sigue activo mientras se desvanece al cerrar, para que el reflector no desaparezca de golpe.
  const target = useTarget(step > 0, step, reduced);
  /** Panel vivo: la tarjeta de bienvenida o la burbuja (cambia tras la salida animada). */
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [bubbleSize, setBubbleSize] = useState({ w: 380, h: 280 });
  const stepRef = useRef(step);
  stepRef.current = step;
  const doneRef = useRef(false);

  // El portal se crea tras hidratar para no desajustar el HTML del servidor.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    trackMilestone("tour_inicio");
    return () => {
      if (!doneRef.current) trackAbandon("tour_abandonado", { paso: stepRef.current + 1 });
    };
  }, []);

  // Mientras dura el recorrido el fondo no se desplaza a mano; el scroll
  // programático que acerca la tarjeta en móvil sigue funcionando.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (step > 0) onSelect(step - 1);
  }, [step, onSelect]);

  // Tamaño real de la burbuja para colocarla sin salirse de la pantalla.
  useLayoutEffect(() => {
    const el = panel;
    if (!el || !el.classList.contains("fd-tour-bubble")) return;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      setBubbleSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [panel]);

  // El foco acompaña al botón principal de cada paso.
  useEffect(() => {
    if (!panel) return;
    const id = window.setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(id);
  }, [step, panel]);

  const finish = useCallback((completed: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    trackMilestone(completed ? "tour_completado" : "tour_omitido", { paso: stepRef.current + 1 });
    setClosing(completed);
  }, []);

  const go = useCallback(
    (delta: 1 | -1) => {
      if (closing !== null) return;
      const next = step + delta;
      if (next < 0) return;
      if (next >= TOUR_STEPS) {
        finish(true);
        return;
      }
      setDir(delta);
      setStep(next);
    },
    [closing, finish, step],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (closing !== null) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        finish(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        go(-1);
      } else if (event.key === "Tab") {
        // Foco atrapado en la burbuja: el resto de la cabina está en pausa.
        const focusables = panel?.querySelectorAll<HTMLElement>("button:not(:disabled)");
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!panel?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [closing, finish, go, panel]);

  if (!mounted || typeof document === "undefined") return null;

  const destination = step > 0 ? DESTINATIONS[step - 1] : null;
  const last = step === TOUR_STEPS - 1;
  const spot = target
    ? {
        x: target.card.x - SPOT_PAD,
        y: target.card.y - SPOT_PAD,
        w: target.card.w + SPOT_PAD * 2,
        h: target.card.h + SPOT_PAD * 2,
      }
    : null;
  const placement = viewport.w
    ? placeBubble(spot, target?.anchor ?? null, bubbleSize, viewport.w, viewport.h)
    : null;

  /** Pista de 6 tramos; el avión se desliza al tramo actual (sólo en la burbuja). */
  const progress = (glide: boolean) => (
    <div className="fd-tour-progress" aria-hidden="true">
      {Array.from({ length: TOUR_STEPS }, (_, i) => (
        <span key={i} className={i < step ? "is-done" : i === step ? "is-current" : undefined}>
          {i === step &&
            (glide ? (
              <motion.i layoutId="fd-tour-plane" transition={SOFT}>
                <AirplaneTakeoff size={11} weight="fill" />
              </motion.i>
            ) : (
              <i>
                <AirplaneTakeoff size={11} weight="fill" />
              </i>
            ))}
        </span>
      ))}
    </div>
  );

  return createPortal(
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <motion.div
        className={"fd-modal-theme fd-tour" + (reduced ? " is-reduced" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fd-tour-title"
        aria-describedby="fd-tour-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing === null ? 1 : 0 }}
        transition={{ duration: closing === null ? 0.35 : 0.3, ease: "easeOut" }}
        onAnimationComplete={() => {
          if (closing !== null) onClose(closing);
        }}
      >
        {/* Nada de la cabina responde mientras Pathy habla. */}
        <div className="fd-tour-catcher" aria-hidden="true" />

        <AnimatePresence>
          {step === 0 && (
            <motion.div
              key="backdrop"
              className="fd-tour-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.45 } }}
            />
          )}
        </AnimatePresence>

        {spot && (
          <motion.div
            className="fd-tour-spot"
            aria-hidden="true"
            // El reflector nace del tamaño de la pantalla y se cierra sobre la
            // tarjeta: se siente como un iris que enfoca el destino.
            initial={{ x: 0, y: 0, width: viewport.w, height: viewport.h, borderRadius: 0 }}
            animate={{ x: spot.x, y: spot.y, width: spot.w, height: spot.h, borderRadius: 20 }}
            transition={SPRING}
          />
        )}

        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 ? (
            <div className="fd-tour-center" key="welcome">
              <motion.section
                ref={setPanel}
                className="fd-tour-welcome"
                initial={{ opacity: 0, y: 28, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: -14,
                  scale: 0.9,
                  transition: { duration: 0.28, ease: "easeIn" },
                }}
                transition={{ ...SOFT, delay: 0.12 }}
              >
                {/* El flotado (CSS) y la entrada con rebote (motion) viven en capas distintas. */}
                <div className="fd-tour-pathy-hero" aria-hidden="true">
                  <span className="fd-tour-halo" />
                  <span className="fd-tour-float">
                    <motion.img
                      src={ASSETS + "pathy.png"}
                      alt=""
                      initial={{ y: 40, scale: 0.6, rotate: -8, opacity: 0 }}
                      animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 210, damping: 14, delay: 0.3 }}
                    />
                  </span>
                </div>
                <motion.div
                  className="fd-tour-stagger"
                  initial="hidden"
                  animate="shown"
                  variants={{
                    shown: { transition: { staggerChildren: 0.06, delayChildren: 0.32 } },
                  }}
                >
                  <motion.p className="fd-eyebrow" variants={rise}>
                    PATHY · TU COPILOTO DE ESTUDIO
                  </motion.p>
                  <motion.h2 id="fd-tour-title" variants={rise}>
                    {welcomeTitle}
                  </motion.h2>
                  <motion.p id="fd-tour-body" className="fd-tour-lead" variants={rise}>
                    FlightPath es tu cabina de preparación para volar: los bancos reales del CIAAC y
                    de línea aérea, learning paths, aptitudes e inglés aeronáutico, en un solo
                    lugar.
                  </motion.p>
                  <motion.p className="fd-tour-meta" variants={rise}>
                    Te muestro la cabina en {TOUR_STEPS} pasos · menos de un minuto
                  </motion.p>
                  <motion.div className="fd-tour-welcome-actions" variants={rise}>
                    <button ref={primaryRef} className="fd-tour-primary" onClick={() => go(1)}>
                      <span>Comenzar recorrido</span>
                      <ArrowRight size={18} weight="bold" />
                    </button>
                    <button className="fd-tour-text" onClick={() => finish(false)}>
                      Ahora no
                    </button>
                  </motion.div>
                </motion.div>
                {progress(false)}
              </motion.section>
            </div>
          ) : (
            destination &&
            placement && (
              <motion.section
                key="bubble"
                ref={setPanel}
                className={"fd-tour-bubble is-" + placement.side}
                style={{ left: 0, top: 0 }}
                initial={{
                  opacity: 0,
                  x: placement.x + (placement.side === "left" ? -18 : 18),
                  y: placement.y,
                }}
                animate={{ opacity: 1, x: placement.x, y: placement.y }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ ...SPRING, opacity: { duration: 0.3, delay: 0.25 } }}
              >
                {placement.side !== "dock" && (
                  <motion.span
                    className="fd-tour-arrow"
                    aria-hidden="true"
                    // El rombo se centra en el borde que mira al reflector.
                    animate={
                      placement.side === "right" || placement.side === "left"
                        ? {
                            top: placement.arrow,
                            left: placement.side === "right" ? 0 : bubbleSize.w,
                          }
                        : {
                            left: placement.arrow,
                            top: placement.side === "bottom" ? 0 : bubbleSize.h,
                          }
                    }
                    transition={SPRING}
                  />
                )}
                {/* Pathy asoma por la esquina y da un saltito en cada destino. */}
                <span className="fd-tour-pathy" aria-hidden="true">
                  <motion.img
                    key={step}
                    src={ASSETS + "pathy.png"}
                    alt=""
                    initial={{ y: 0, rotate: 0 }}
                    animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                </span>
                <button
                  className="fd-tour-close"
                  aria-label="Saltar recorrido"
                  onClick={() => finish(false)}
                >
                  <X size={16} weight="bold" />
                </button>

                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={destination.code}
                    className="fd-tour-copy"
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="leave"
                    aria-live="polite"
                  >
                    <p className="fd-eyebrow">
                      {String(step + 1).padStart(2, "0")} / {String(TOUR_STEPS).padStart(2, "0")} ·
                      DESTINO {destination.code}
                    </p>
                    <h2 id="fd-tour-title">{destination.name}</h2>
                    <p id="fd-tour-body" className="fd-tour-lead">
                      {PATHY_LINES[destination.code] ?? destination.description}
                    </p>
                    {/* Los submódulos reales se iluminan uno a uno en la tarjeta (ver `data-touring`);
                        aquí Pathy los nombra, también para lectores de pantalla. */}
                    <p className="fd-tour-label">
                      {destination.sections.length === 1
                        ? "1 submódulo"
                        : `${destination.sections.length} submódulos`}
                    </p>
                    <p className="fd-tour-modules">
                      {listaDe(destination.sections.map((s) => s.label))}.
                    </p>
                  </motion.div>
                </AnimatePresence>

                <footer className="fd-tour-footer">
                  {progress(true)}
                  <div className="fd-tour-nav">
                    <button
                      className="fd-tour-ghost"
                      onClick={() => go(-1)}
                      aria-label="Paso anterior"
                    >
                      <ArrowLeft size={16} weight="bold" />
                    </button>
                    <button
                      ref={primaryRef}
                      className="fd-tour-primary is-compact"
                      onClick={() => go(1)}
                    >
                      <span>{last ? finishLabel : "Siguiente"}</span>
                      {last ? (
                        <AirplaneTakeoff size={17} weight="fill" />
                      ) : (
                        <ArrowRight size={16} weight="bold" />
                      )}
                    </button>
                  </div>
                </footer>
              </motion.section>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>,
    document.body,
  );
}

const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: SOFT },
};

const slide: Variants = {
  enter: (dir: 1 | -1) => ({ opacity: 0, x: 22 * dir }),
  center: { opacity: 1, x: 0, transition: { duration: 0.26, ease: "easeOut" } },
  leave: (dir: 1 | -1) => ({
    opacity: 0,
    x: -16 * dir,
    transition: { duration: 0.14, ease: "easeIn" },
  }),
};
