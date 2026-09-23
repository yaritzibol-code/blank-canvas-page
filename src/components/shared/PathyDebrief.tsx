/**
 * Informe de Pathy tras una sesión: ranking real (calculado con las respuestas
 * guardadas) + lectura de la IA. Si la IA no está disponible, el ranking real
 * se muestra igual.
 *
 * Se muestra al terminar cuestionarios y simulacros, siempre dentro del marco
 * oscuro de la sesión (`QuestionFrame`); sus estilos viven en
 * `flightdeck.css` (`.fd-debrief*`).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { pathyAnalysis } from "@/lib/pathy-ai.functions";
import { PathyMark } from "@/components/shared/PathyMark";
import { savePathyReport } from "@/lib/store/domain";
import { weakSpots, wrongAnswers } from "@/lib/store/pathy-errors";
import type { AttemptAnswer, PathyWeakSpot } from "@/lib/store/types";
import { isPaid, useSessionUser } from "@/lib/store";
import { consumeFree } from "@/lib/store/free-quota";

interface Props {
  userId: string;
  origen: "cuestionario" | "simulador";
  titulo: string;
  scorePct: number;
  answers: AttemptAnswer[];
}

const MOTIVO_TXT: Record<string, string> = {
  sin_pro: "La lectura detallada de Pathy es parte de FlightPath Pro.",
  limite: "Alcanzaste el límite de consultas de IA por ahora; tu marcador real sigue aquí.",
  error: "No pude conectarme con la IA en este momento, pero tu marcador real ya está calculado.",
};

function SpotRow({ s }: { s: PathyWeakSpot }) {
  const tier = s.pct < 60 ? "is-bajo" : s.pct < 80 ? "is-medio" : "is-alto";
  const body = (
    <>
      <span className="fd-debrief-spot-label">
        {s.label}
        {s.muestraCorta && <small> · muestra corta</small>}
      </span>
      <strong className={tier}>
        {s.pct}%{" "}
        <em>
          ({s.correct}/{s.total})
        </em>
      </strong>
    </>
  );
  if (!s.to) return <div className="fd-debrief-spot">{body}</div>;
  return (
    <Link to={s.to} search={s.search as never} className="fd-debrief-spot is-link">
      {body}
    </Link>
  );
}

export function PathyDebrief({ userId, origen, titulo, scorePct, answers }: Props) {
  const run = useServerFn(pathyAnalysis);
  const [loading, setLoading] = useState(true);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [confusiones, setConfusiones] = useState<string[]>([]);
  const [acciones, setAcciones] = useState<string[]>([]);
  const [motivo, setMotivo] = useState<string | undefined>();
  const sesionUser = useSessionUser();
  const doneRef = useRef(false);

  const spots = weakSpots(answers, 3);
  const wrong = wrongAnswers(answers);

  useEffect(() => {
    if (doneRef.current || !userId) return;
    doneRef.current = true;

    const persist = (
      d: string | null,
      c: string[],
      a: string[],
      m: string | undefined,
    ) => {
      savePathyReport({
        userId,
        origen,
        titulo,
        scorePct,
        answered: answers.length,
        wrong: wrong.length,
        puntos: spots,
        diagnostico: d,
        confusiones: c,
        acciones: a,
        ...(m ? { motivo: m } : {}),
      });
    };

    if (wrong.length === 0) {
      setLoading(false);
      setMotivo("sin_errores");
      persist(null, [], [], "sin_errores");
      return;
    }

    void run({
      data: {
        titulo,
        origen,
        scorePct,
        answered: answers.length,
        spots: spots.map((s) => ({
          label: s.label,
          pct: s.pct,
          correct: s.correct,
          total: s.total,
          muestraCorta: s.muestraCorta,
        })),
        wrong: wrong.slice(0, 40).map((w) => ({
          questionId: w.questionId,
          selectedIndex: w.selectedIndex,
          ...(w.materia ? { materia: w.materia } : {}),
          ...(w.fuente ? { fuente: w.fuente } : {}),
          ...(w.capitulo !== undefined ? { capitulo: w.capitulo } : {}),
          ...(w.capituloTitulo ? { capituloTitulo: w.capituloTitulo } : {}),
        })),
      },
    })
      .then((r) => {
        // Los análisis de cortesía del plan gratuito se descuentan al recibir
        // un diagnóstico real (el servidor lleva la cuenta autoritativa).
        if (r.diagnostico && sesionUser && !isPaid(sesionUser)) consumeFree(sesionUser, "pathy");
        setDiagnostico(r.diagnostico);
        setConfusiones(r.confusiones);
        setAcciones(r.acciones);
        setMotivo(r.motivo);
        persist(r.diagnostico, r.confusiones, r.acciones, r.motivo);
      })
      .catch(() => {
        setMotivo("error");
        persist(null, [], [], "error");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <section className="fd-debrief" aria-label="Lectura de Pathy">
      <header className="fd-debrief-head">
        <PathyMark size={34} />
        <div>
          <strong>Lectura de Pathy</strong>
          <small>
            {wrong.length === 0
              ? "Sin errores en esta sesión"
              : wrong.length === 1
                ? "Basada en la pregunta que fallaste en esta sesión"
                : `Basada en las ${wrong.length} preguntas que fallaste en esta sesión`}
          </small>
        </div>
      </header>

      {/* Sin errores no hay nada que "costó": se omite aunque haya ranking. */}
      {spots.length > 0 && wrong.length > 0 && (
        <div className="fd-debrief-block">
          <p className="fd-debrief-label">Lo que más costó</p>
          {spots.map((s) => (
            <SpotRow key={`${s.tipo}-${s.label}`} s={s} />
          ))}
        </div>
      )}

      {loading && (
        <div className="fd-debrief-loading" role="status" aria-live="polite">
          <span className="fd-debrief-spinner" aria-hidden="true" />
          <span>
            Pathy está analizando tu resultado…
            <small>
              Revisando tus {wrong.length} errores y buscando el patrón. Tarda unos segundos.
            </small>
          </span>
        </div>
      )}

      {!loading && diagnostico && (
        <div className="fd-debrief-reading">
          <p>{diagnostico}</p>
          {confusiones.length > 0 && (
            <ul>
              {confusiones.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          {acciones.length > 0 && (
            <>
              <p className="fd-debrief-label">Tu plan de vuelo</p>
              <ol className="fd-debrief-plan">
                {acciones.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {!loading && !diagnostico && motivo === "sin_errores" && (
        <p className="fd-debrief-note">
          Sesión perfecta: no fallaste ninguna. Sube la dificultad con más preguntas o cambia de
          capítulo para seguir avanzando.
        </p>
      )}

      {!loading && !diagnostico && motivo && motivo !== "sin_errores" && (
        <p className="fd-debrief-note is-muted">
          {MOTIVO_TXT[motivo] ?? MOTIVO_TXT["error"]}{" "}
          {motivo === "sin_pro" && <Link to="/precios">Ver planes</Link>}
        </p>
      )}
    </section>
  );
}
