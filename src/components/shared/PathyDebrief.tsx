/**
 * Informe de Pathy tras una sesión: ranking real (calculado con las respuestas
 * guardadas) + lectura de la IA. Si la IA no está disponible, el ranking real
 * se muestra igual.
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

const card: React.CSSProperties = {
  background: "linear-gradient(135deg,#F2DCDB,#fce4ec)",
  borderRadius: 16,
  padding: "18px 20px",
  width: "100%",
  maxWidth: 580,
  marginBottom: 20,
  fontSize: "0.88rem",
  color: "#4a4a4a",
  lineHeight: 1.65,
};

function SpotRow({ s }: { s: PathyWeakSpot }) {
  const color = s.pct < 60 ? "#c0392b" : s.pct < 80 ? "#b9770e" : "#1a7a4a";
  const body = (
    <>
      <span style={{ flex: 1, minWidth: 0 }}>
        {s.label}
        {s.muestraCorta && (
          <span style={{ color: "#8a6d3b", fontSize: "0.72rem" }}> · muestra corta</span>
        )}
      </span>
      <strong style={{ color, whiteSpace: "nowrap" }}>
        {s.pct}% ({s.correct}/{s.total})
      </strong>
    </>
  );
  const style: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.7)",
    marginBottom: 6,
    fontSize: "0.83rem",
    color: "#22375C",
    textDecoration: "none",
    minHeight: 44,
  };
  if (!s.to) return <div style={style}>{body}</div>;
  return (
    <Link to={s.to} search={s.search as never} style={style}>
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
    <div style={card}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <PathyMark size={30} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: "#6C0820" }}>Lectura de Pathy</strong>
          <div style={{ fontSize: "0.75rem", color: "#8a6a70" }}>
            Basada en las {wrong.length} preguntas que fallaste en esta sesión
          </div>
        </div>
      </div>

      {spots.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              color: "#6C0820",
              marginBottom: 6,
            }}
          >
            Lo que más costó
          </div>
          {spots.map((s) => (
            <SpotRow key={`${s.tipo}-${s.label}`} s={s} />
          ))}
        </div>
      )}

      {loading && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.75)",
            color: "#6C0820",
            fontWeight: 700,
            fontSize: "0.83rem",
          }}
        >
          <style>{`@keyframes pathySpin{to{transform:rotate(360deg)}}`}</style>
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2.5px solid rgba(108,8,32,0.2)",
              borderTopColor: "#6C0820",
              animation: "pathySpin .8s linear infinite",
              flexShrink: 0,
            }}
          />
          <span>
            Pathy está analizando tu resultado…
            <span style={{ display: "block", fontWeight: 500, color: "#7a6a70", fontSize: "0.76rem" }}>
              Revisando tus {wrong.length} errores y buscando el patrón. Tarda unos segundos.
            </span>
          </span>
        </div>
      )}

      {!loading && diagnostico && (
        <>
          <p style={{ margin: "0 0 10px" }}>{diagnostico}</p>
          {confusiones.length > 0 && (
            <ul style={{ margin: "0 0 10px", paddingLeft: 18 }}>
              {confusiones.map((c) => (
                <li key={c} style={{ marginBottom: 4 }}>
                  {c}
                </li>
              ))}
            </ul>
          )}
          {acciones.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  color: "#6C0820",
                  marginBottom: 4,
                }}
              >
                Tu plan de vuelo
              </div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {acciones.map((a) => (
                  <li key={a} style={{ marginBottom: 4 }}>
                    {a}
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}

      {!loading && !diagnostico && motivo === "sin_errores" && (
        <p style={{ margin: 0 }}>
          Sesión perfecta: no fallaste ninguna. Sube la dificultad con más preguntas o cambia de
          capítulo para seguir avanzando.
        </p>
      )}

      {!loading && !diagnostico && motivo && motivo !== "sin_errores" && (
        <p style={{ margin: 0, color: "#7a6a70" }}>
          {MOTIVO_TXT[motivo] ?? MOTIVO_TXT['error']}{" "}
          {motivo === "sin_pro" && (
            <Link to="/precios" style={{ color: "#6C0820", fontWeight: 700 }}>
              Ver planes
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
