/**
 * Informe de Pathy tras una sesión: ranking real (calculado con las respuestas
 * guardadas) + lectura de la IA. Si la IA no está disponible, el ranking real
 * se muestra igual.
 *
 * Se muestra al terminar cuestionarios y simulacros, siempre dentro del marco
 * oscuro de la sesión (`QuestionFrame`); sus estilos viven en
 * `flightdeck.css` (`.fd-debrief*`).
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { pathyAnalysis } from "@/lib/pathy-ai.functions";
import { PathyMark } from "@/components/shared/PathyMark";
import { savePathyReport } from "@/lib/store/domain";
import { weakSpots, wrongAnswers } from "@/lib/store/pathy-errors";
import type { AttemptAnswer, PathyWeakSpot } from "@/lib/store/types";
import { isPaid, useSessionUser } from "@/lib/store";
import { consumeFree } from "@/lib/store/free-quota";

interface Lectura {
  diagnostico: string | null;
  confusiones: string[];
  acciones: string[];
  motivo?: string;
}

/**
 * Lecturas ya pedidas, por sesión respondida (el arreglo de respuestas de esa
 * sesión). El simulador desmonta el informe al entrar a "Revisar examen" y lo
 * vuelve a montar al regresar: sin esto cada vuelta pedía otra lectura a la IA
 * y guardaba un informe repetido en el historial. Una sesión nueva trae otro
 * arreglo, así que sí genera su propio informe aunque las respuestas coincidan.
 */
const lecturas = new WeakMap<AttemptAnswer[], Promise<Lectura>>();

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

  const spots = weakSpots(answers, 3);
  const wrong = wrongAnswers(answers);

  useEffect(() => {
    // Sin guardas por montaje: la caché de `lecturas` evita repetir la
    // petición y el informe (también con el doble montaje de StrictMode).
    if (!userId) return;
    let vivo = true;

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

    let pedido = lecturas.get(answers);
    const nueva = !pedido;
    if (!pedido) {
      pedido =
        wrong.length === 0
          ? Promise.resolve<Lectura>({
              diagnostico: null,
              confusiones: [],
              acciones: [],
              motivo: "sin_errores",
            })
          : run({
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
            }).then(
              (r): Lectura => {
                // Los análisis de cortesía del plan gratuito se descuentan al recibir
                // un diagnóstico real (el servidor lleva la cuenta autoritativa).
                if (r.diagnostico && sesionUser && !isPaid(sesionUser))
                  consumeFree(sesionUser, "pathy");
                return {
                  diagnostico: r.diagnostico,
                  confusiones: r.confusiones,
                  acciones: r.acciones,
                  motivo: r.motivo,
                };
              },
              (): Lectura => {
                // Un fallo no se recuerda: al volver a montar se reintenta.
                lecturas.delete(answers);
                return { diagnostico: null, confusiones: [], acciones: [], motivo: "error" };
              },
            );
      lecturas.set(answers, pedido);
    }

    void pedido.then((l) => {
      // El informe se guarda una sola vez por lectura, aunque se vuelva a montar.
      if (nueva) persist(l.diagnostico, l.confusiones, l.acciones, l.motivo);
      if (!vivo) return;
      setDiagnostico(l.diagnostico);
      setConfusiones(l.confusiones);
      setAcciones(l.acciones);
      setMotivo(l.motivo);
      setLoading(false);
    });
    return () => {
      vivo = false;
    };
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

      {spots.length > 0 && (
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
