/**
 * Informe de vuelo: la pantalla con la que termina un cuestionario o el
 * simulador.
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

/** Umbral a partir del cual una materia cuenta como dominada en un cuestionario. */
const DOMINADO = 70;

type Tier = "alto" | "medio" | "bajo";

function tierOf(pct: number, alto: number, medio: number): Tier {
  return pct >= alto ? "alto" : pct >= medio ? "medio" : "bajo";
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

/**
 * Calificación en dos partes para el dial: entero grande y decimales chicos
 * ("79" + ".68"). Sin decimales, el entero redondeado como en los cuestionarios.
 */
function partes(value: number, decimales: boolean): [string, string] {
  if (!decimales) return [String(Math.round(value)), ""];
  const [entero, fraccion] = value
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .split(".");
  return [entero, fraccion ? `.${fraccion}` : ""];
}

/**
 * Anima el número del marcador al entrar. Durante la animación sólo avanza
 * el entero (nunca pasa la marca de aprobación antes de tiempo) y al final
 * queda el valor exacto; con movimiento reducido llega directo.
 */
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
      onUpdate: (v) => setValue(Math.floor(v)),
      onComplete: () => setValue(target),
    });
    return () => controls.stop();
  }, [target, reduced]);
  return value;
}

/** Dial de la cabina: anillo con el porcentaje y, si aplica, la marca para aprobar. */
function ScoreDial({
  pct,
  correct,
  base,
  answered,
  tier,
  label,
  decimales,
  marca,
}: {
  pct: number;
  correct: number;
  base: number;
  answered: number;
  tier: Tier;
  label: string;
  decimales: boolean;
  marca?: number;
}) {
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
  const offset = length * (1 - (filled ? Math.min(pct, 100) : 0) / 100);
  // Sin respuestas no hay porcentaje que juzgar: el dial queda neutro.
  const vacio = answered === 0;
  const [entero, fraccion] = partes(shown, decimales);

  return (
    <div className={"fd-results-dial is-" + (vacio ? "vacio" : tier)}>
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
        {marca !== undefined && (
          <line
            className="fd-results-dial-marca"
            x1="100"
            y1="1"
            x2="100"
            y2="23"
            transform={`rotate(${marca * 3.6} 100 100)`}
          />
        )}
      </svg>
      <div className="fd-results-dial-value">
        <strong>
          {vacio ? "—" : entero}
          {!vacio && <em>{fraccion}%</em>}
        </strong>
        <small>{label}</small>
        <span>{vacio ? "Sin respuestas" : `${correct} de ${base}`}</span>
      </div>
    </div>
  );
}

export function QuizResults({
  modo,
  eyebrow = "ATERRIZAJE · SESIÓN COMPLETADA",
  titulo = (
    <>
      ¡Sesión <em>completada!</em>
    </>
  ),
  verdict,
  pilotName,
  scorePct,
  decimales = false,
  scoreLabel = "ACIERTOS",
  base,
  umbral = DOMINADO,
  medio = 50,
  marca,
  correct,
  answered,
  total,
  seconds,
  materias,
  exitTo,
  onRestart,
  restartLabel = "Repetir sesión",
  onReview,
  reviewLabel = "Revisar cuestionario",
  debrief,
  extra,
}: {
  /** "APRENDIENDO · TODAS LAS MATERIAS": de dónde salió la sesión. */
  modo: string;
  eyebrow?: string;
  titulo?: ReactNode;
  /** Lectura del resultado; por omisión, la de un cuestionario. */
  verdict?: string;
  /** Nombre de pila para el saludo; vacío si no se conoce. */
  pilotName: string;
  scorePct: number;
  /** Calificación con decimales (el simulador: 247 de 310 = 79.68 %). */
  decimales?: boolean;
  scoreLabel?: string;
  /** Sobre cuántas se califica; por omisión, las respondidas. */
  base?: number;
  /** Porcentaje que cuenta como dominado / aprobado (menta en el dial). */
  umbral?: number;
  /** Desde aquí el tono es dorado; debajo, coral. */
  medio?: number;
  /** Marca en el dial (p. ej. el 80 % para aprobar el examen). */
  marca?: number;
  correct: number;
  answered: number;
  total: number;
  /** Duración de la sesión, congelada al terminar. */
  seconds: number;
  materias: MateriaResult[];
  /** Módulo al que vuelve "Cuestionarios". */
  exitTo: "/dashboard/banco" | "/dashboard/linea-aerea";
  onRestart: () => void;
  restartLabel?: string;
  /** Abre la revisión solo lectura del intento recién terminado. */
  onReview?: () => void;
  reviewLabel?: string;
  /** Lectura de Pathy (`PathyDebrief`). */
  debrief: ReactNode;
  /** Bloque adicional bajo el rendimiento (p. ej. las preguntas para repasar). */
  extra?: ReactNode;
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
            <p className="fd-eyebrow">{eyebrow}</p>
            <h1 id="fd-results-title">{titulo}</h1>
            <p className="fd-results-lead">
              {pilotName ? `${pilotName}, aquí` : "Aquí"} está tu informe de vuelo.{" "}
              {verdict ?? veredicto(scorePct, answered)}
            </p>
          </div>
          <ScoreDial
            pct={scorePct}
            correct={correct}
            base={base ?? answered}
            answered={answered}
            tier={tierOf(scorePct, umbral, medio)}
            label={scoreLabel}
            decimales={decimales}
            marca={marca}
          />
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
                {ordenadas.map((m) => (
                  <li key={m.slug} className={"is-" + tierOf(m.pct, umbral, medio)}>
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
                      <em>{m.pct >= umbral ? "Dominado" : "Reforzar"}</em>
                    </span>
                    <span className="fd-results-bar" aria-hidden="true">
                      <i style={{ width: `${Math.max(m.pct, 2)}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {debrief}
        </div>

        {extra}

        <nav className="fd-results-actions" aria-label="Qué sigue">
          {onReview && (
            <button type="button" className="fd-results-ghost" onClick={onReview}>
              <Icon n="doc" size={16} />
              {reviewLabel}
            </button>
          )}
          <button type="button" className="fd-results-ghost" onClick={onRestart}>
            <ArrowCounterClockwise size={17} weight="bold" />
            {restartLabel}
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

export interface RepasoItem {
  /** Posición en el examen (1 = primera pregunta). */
  numero: number;
  materia: string;
  texto: string;
  /** "B · Texto de la opción", o null si la dejó en blanco. */
  tuRespuesta: string | null;
  correcta: string;
  explicacion?: string;
  cita?: string;
}

/**
 * Preguntas para repasar: las primeras que falló, con su respuesta, la
 * correcta y la explicación, y la entrada a la revisión completa.
 */
export function RepasoPanel({
  items,
  falladas,
  onRevisar,
}: {
  items: RepasoItem[];
  /** Total de preguntas falladas o en blanco. */
  falladas: number;
  onRevisar: () => void;
}) {
  return (
    <section className="fd-results-panel fd-results-repaso" aria-labelledby="fd-results-repaso">
      <header className="fd-results-repaso-head">
        <p className="fd-eyebrow" id="fd-results-repaso">
          PARA REPASAR
        </p>
        <small>
          {falladas === 0
            ? "Sin errores en este examen"
            : `${items.length} de ${falladas} ${falladas === 1 ? "pregunta fallada" : "preguntas falladas"}`}
        </small>
      </header>
      {items.length === 0 ? (
        <p className="fd-results-empty">
          No fallaste ninguna. Aun así puedes revisar el examen completo pregunta por pregunta.
        </p>
      ) : (
        <ol className="fd-results-repaso-list">
          {items.map((it) => (
            <li key={it.numero}>
              <small>
                PREGUNTA {it.numero} · {it.materia.toUpperCase()}
              </small>
              <p className="fd-results-repaso-q">{it.texto}</p>
              <dl>
                <div className="is-err">
                  <dt>Tu respuesta</dt>
                  <dd>{it.tuRespuesta ?? "Sin responder"}</dd>
                </div>
                <div className="is-ok">
                  <dt>Correcta</dt>
                  <dd>{it.correcta}</dd>
                </div>
              </dl>
              {it.explicacion && (
                <p className="fd-results-repaso-exp">
                  {it.explicacion}
                  {it.cita && <cite>{it.cita}</cite>}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      <button type="button" className="fd-results-ghost" onClick={onRevisar}>
        Revisar el examen completo
        <Icon n="chevR" size={15} />
      </button>
    </section>
  );
}
