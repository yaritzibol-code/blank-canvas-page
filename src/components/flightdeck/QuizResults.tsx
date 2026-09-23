/**
 * Informe de vuelo: la pantalla con la que termina un cuestionario.
 *
 * Es una pantalla propia, no una capa sobre la sesión: al terminar ya no
 * quedan a la vista el reloj, el combo ni los botones de la pregunta. Vive en
 * el mismo marco oscuro que la sesión (`QuestionFrame`) y usa sus mismos
 * tonos: menta para aciertos, coral para errores y dorado de marca.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { animate, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, ArrowLeft, GlobeHemisphereWest } from "@phosphor-icons/react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";

export interface MateriaResult {
  slug: string;
  name: string;
  icon: FPIconName;
  correct: number;
  total: number;
  pct: number;
}

/** Umbral a partir del cual una materia cuenta como dominada. */
const DOMINADO = 70;

type Tier = "alto" | "medio" | "bajo";

function tierOf(pct: number): Tier {
  return pct >= DOMINADO ? "alto" : pct >= 50 ? "medio" : "bajo";
}

function veredicto(pct: number, answered: number): string {
  if (answered === 0)
    return "Esta vez no respondiste preguntas. Cuando quieras, vuelve a despegar.";
  if (pct >= 90) return "Aterrizaje impecable. Estás volando con mucha precisión.";
  if (pct >= DOMINADO) return "Buen vuelo: dominas la mayoría de lo que practicaste.";
  if (pct >= 50) return "Vas por buen camino. Repasa lo marcado y vuelve a intentarlo.";
  return "Vuelo de práctica: cada error te dice qué repasar antes del siguiente despegue.";
}

/** "04:37" como el reloj de la sesión; "1 h 05 min" en sesiones largas. */
function duracion(seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (seconds >= 3600)
    return `${Math.floor(seconds / 3600)} h ${pad(Math.floor((seconds % 3600) / 60))} min`;
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

/** Anima el número del marcador al entrar; con movimiento reducido llega directo. */
function useCountUp(target: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, reduced]);
  return value;
}

/** Dial de la cabina: anillo con el porcentaje de aciertos. */
function ScoreDial({ pct, correct, answered }: { pct: number; correct: number; answered: number }) {
  const reduced = useReducedMotion() ?? false;
  const shown = useCountUp(pct, reduced);
  const [filled, setFilled] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);
  const r = 88;
  const length = 2 * Math.PI * r;
  const offset = length * (1 - (filled ? pct : 0) / 100);
  // Sin respuestas no hay porcentaje que juzgar: el dial queda neutro.
  const vacio = answered === 0;

  return (
    <div className={"fd-results-dial is-" + (vacio ? "vacio" : tierOf(pct))}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="4"
            x2="100"
            y2={i % 5 === 0 ? 12 : 9}
            transform={`rotate(${i * 9} 100 100)`}
          />
        ))}
        <circle className="fd-results-dial-track" cx="100" cy="100" r={r} />
        <circle
          className="fd-results-dial-arc"
          cx="100"
          cy="100"
          r={r}
          strokeDasharray={length}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="fd-results-dial-value">
        <strong>
          {vacio ? "—" : shown}
          {!vacio && <em>%</em>}
        </strong>
        <small>ACIERTOS</small>
        <span>{vacio ? "Sin respuestas" : `${correct} de ${answered}`}</span>
      </div>
    </div>
  );
}

export function QuizResults({
  modo,
  pilotName,
  scorePct,
  correct,
  answered,
  total,
  seconds,
  materias,
  exitTo,
  onRestart,
  debrief,
}: {
  /** "APRENDIENDO · TODAS LAS MATERIAS": de dónde salió la sesión. */
  modo: string;
  /** Nombre de pila para el saludo; vacío si no se conoce. */
  pilotName: string;
  scorePct: number;
  correct: number;
  answered: number;
  total: number;
  /** Duración de la sesión, congelada al terminar. */
  seconds: number;
  materias: MateriaResult[];
  /** Módulo al que vuelve "Cuestionarios". */
  exitTo: "/dashboard/banco" | "/dashboard/linea-aerea";
  onRestart: () => void;
  /** Lectura de Pathy (`PathyDebrief`). */
  debrief: ReactNode;
}) {
  const mainRef = useRef<HTMLElement>(null);
  const wrong = answered - correct;
  const ordenadas = [...materias].sort((a, b) => a.pct - b.pct);

  // Quien navega con teclado o lector de pantalla aterriza en el informe.
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, []);

  const stats: { label: string; value: string; tone?: "ok" | "err" }[] = [
    { label: "CORRECTAS", value: String(correct), tone: "ok" },
    { label: "INCORRECTAS", value: String(wrong), tone: "err" },
    { label: "PREGUNTAS", value: answered < total ? `${answered}/${total}` : String(total) },
    { label: "TIEMPO", value: duracion(seconds) },
  ];

  return (
    <div className="fd-results">
      <header className="fd-results-top">
        <Link to={exitTo} className="fd-results-back">
          <ArrowLeft size={15} weight="bold" />
          <span>Cuestionarios</span>
        </Link>
        <div className="fd-results-module">
          <strong>Informe de vuelo</strong>
          <small>{modo}</small>
        </div>
      </header>

      <main
        className="fd-results-main"
        ref={mainRef}
        tabIndex={-1}
        aria-labelledby="fd-results-title"
      >
        <section className="fd-results-hero">
          <div className="fd-results-copy">
            <p className="fd-eyebrow">ATERRIZAJE · SESIÓN COMPLETADA</p>
            <h1 id="fd-results-title">
              ¡Sesión <em>completada!</em>
            </h1>
            <p className="fd-results-lead">
              {pilotName ? `${pilotName}, aquí` : "Aquí"} está tu informe de vuelo.{" "}
              {veredicto(scorePct, answered)}
            </p>
          </div>
          <ScoreDial pct={scorePct} correct={correct} answered={answered} />
        </section>

        <dl className="fd-results-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <span className={"fd-stat-diamond" + (s.tone ? " is-" + s.tone : "")}>◆</span>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="fd-results-grid">
          <section className="fd-results-panel" aria-labelledby="fd-results-materias">
            <p className="fd-eyebrow" id="fd-results-materias">
              RENDIMIENTO POR MATERIA
            </p>
            {ordenadas.length === 0 ? (
              <p className="fd-results-empty">
                Responde al menos una pregunta para ver cómo te fue en cada materia.
              </p>
            ) : (
              <ul className="fd-results-materias">
                {ordenadas.map((m) => {
                  const tier = tierOf(m.pct);
                  return (
                    <li key={m.slug} className={"is-" + tier}>
                      <span className="fd-results-materia-icon">
                        <Icon n={m.icon} size={17} />
                      </span>
                      <span className="fd-results-materia-name">
                        <strong>{m.name}</strong>
                        <small>
                          {m.correct} de {m.total} correctas
                        </small>
                      </span>
                      <span className="fd-results-materia-score">
                        <b>{m.pct}%</b>
                        <em>{m.pct >= DOMINADO ? "Dominado" : "Reforzar"}</em>
                      </span>
                      <span className="fd-results-bar" aria-hidden="true">
                        <i style={{ width: `${Math.max(m.pct, 2)}%` }} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {debrief}
        </div>

        <nav className="fd-results-actions" aria-label="Qué sigue">
          <button type="button" className="fd-results-ghost" onClick={onRestart}>
            <ArrowCounterClockwise size={17} weight="bold" />
            Repetir sesión
          </button>
          <Link to="/dashboard" className="fd-results-primary">
            <GlobeHemisphereWest size={18} weight="duotone" />
            Ir al Director
          </Link>
        </nav>
      </main>
    </div>
  );
}
