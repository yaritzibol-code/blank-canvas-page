import type { ReactNode } from "react";
import type { CiaacActivity as CiaacActivityDefinition } from "@/lib/lp/ciaac-content-types";
import { ciaacResponseReady, type CiaacActivityProgress } from "@/lib/lp/ciaac-progress";

export function CiaacActivity({
  activity,
  progress,
  onChange,
  children,
}: {
  activity: CiaacActivityDefinition;
  progress: CiaacActivityProgress;
  onChange: (value: CiaacActivityProgress) => void;
  children: ReactNode;
}) {
  const response = (index: number, value: string) => {
    const responses = [...progress.responses];
    responses[index] = value;
    onChange({ ...progress, responses, reflected: false });
  };
  const hasWrittenAnswer = Boolean(progress.responses[0]?.trim());
  return (
    <section className="ciaac-activity">
      <style>{styles}</style>
      <header className="hb-heading">
        <span className="hb-pill">Practica lo que entendiste</span>
        <h2>{activity.title}</h2>
        <p>{activity.instruction}</p>
      </header>
      {activity.kind === "fill_blank" && (
        <fieldset className="hb-card ciaac-response">
          <legend>Completa con el término estudiado</legend>
          {[
            "La aeronave se sostiene por reacciones del…",
            "El avión comienza a… con propósito de despegar",
            "En el helicóptero empiezan a girar las… del rotor",
          ].map((label, index) => (
            <label key={label}>
              {label}
              <input
                value={progress.responses[index] ?? ""}
                onChange={(event) => response(index, event.target.value)}
                autoComplete="off"
              />
            </label>
          ))}
          <p>
            Usa el término exacto de la definición, una palabra en cada espacio. El criterio de
            tiempo de vuelo es el de OACI estudiado aquí.
          </p>
          {activity.items.every((_, index) => Boolean(progress.responses[index]?.trim())) &&
            !ciaacResponseReady(activity, progress) && (
              <p role="status">
                Revisa los términos de las definiciones antes de continuar: qué produce la
                sustentación, qué comienza a hacer el avión y qué parte del rotor gira.
              </p>
            )}
        </fieldset>
      )}
      {activity.kind === "calculation" && (
        <div className="hb-card ciaac-response">
          <div
            className="ciaac-equation"
            aria-label="Presión total 100 menos presión estática 80 igual a presión dinámica"
          >
            100 − 80 = q
          </div>
          <label>
            Tu resultado, en las mismas unidades
            <input
              inputMode="decimal"
              type="number"
              value={progress.responses[0] ?? ""}
              onChange={(event) => response(0, event.target.value)}
            />
          </label>
          <p>
            Explica después por qué puedes restar estas magnitudes bajo el modelo incompresible
            ideal.
          </p>
        </div>
      )}
      {activity.kind === "diagram_label" && (
        <figure className="hb-card ciaac-label-diagram">
          <svg
            viewBox="0 0 640 220"
            role="img"
            aria-label="A indica presión local del flujo exterior. B indica la magnitud calculada con densidad y velocidad exteriores. C indica el punto frontal de estancamiento ideal."
          >
            <defs>
              <marker
                id="ciaac-air-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0 10 5 0 10" fill="currentColor" />
              </marker>
            </defs>
            {[72, 110, 148].map((y) => (
              <path
                key={y}
                d={`M40 ${y} H225`}
                stroke="currentColor"
                strokeWidth="3"
                markerEnd="url(#ciaac-air-arrow)"
              />
            ))}
            <path d="M285 100 H555 V155 H285" fill="none" stroke="currentColor" strokeWidth="6" />
            <circle cx="285" cy="127" r="8" fill="var(--primary)" />
            <text x="60" y="35">
              A · Presión local
            </text>
            <text x="45" y="200">
              B · Magnitud ½ρV²
            </text>
            <text x="330" y="62">
              C · Estancamiento ideal
            </text>
            <path d="M335 70 292 116" stroke="currentColor" fill="none" />
          </svg>
          <figcaption>
            Esquema conceptual, sin escala. A y B usan las condiciones del flujo exterior; C frena
            el flujo idealmente. Asigna ps, q y pt.
          </figcaption>
        </figure>
      )}
      {activity.kind === "short_answer" && (
        <div className="hb-card ciaac-response">
          <label>
            Tu explicación
            <textarea
              rows={4}
              value={progress.responses[0] ?? ""}
              onChange={(event) => response(0, event.target.value)}
              placeholder="Identifica el error y explica qué condición falta…"
            />
          </label>
          <button
            type="button"
            disabled={!hasWrittenAnswer}
            onClick={() => onChange({ ...progress, revealed: true })}
          >
            Comparar con una explicación
          </button>
          {progress.revealed && (
            <div className="ciaac-model-answer">
              <p>{Array.isArray(activity.answer) ? activity.answer.join(" ") : activity.answer}</p>
              <label className="ciaac-reflect">
                <input
                  type="checkbox"
                  checked={progress.reflected}
                  onChange={(event) => onChange({ ...progress, reflected: event.target.checked })}
                />
                Comparé mi explicación y corregí lo necesario.
              </label>
              <small>
                Esta es una autoevaluación guiada; tu texto no se califica automáticamente.
              </small>
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

const styles = `
.ciaac-activity{display:grid;gap:20px;min-width:0}.ciaac-response{display:grid;gap:18px}.ciaac-response legend{font-weight:700;padding:0 8px}.ciaac-response label{display:grid;gap:8px;font-weight:650}.ciaac-response input:not([type=checkbox]),.ciaac-response textarea{font:inherit;color:var(--foreground);background:var(--background);border:1px solid var(--border);border-radius:12px;padding:12px;width:100%;box-sizing:border-box}.ciaac-response input:focus-visible,.ciaac-response textarea:focus-visible,.ciaac-response button:focus-visible{outline:3px solid var(--primary);outline-offset:3px}.ciaac-response button{background:var(--primary);color:var(--primary-foreground);padding:12px 18px;border:0;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;justify-self:start}.ciaac-response button:disabled{opacity:.5;cursor:not-allowed}.ciaac-model-answer{border-top:1px solid var(--border);padding-top:18px}.ciaac-response .ciaac-reflect{display:flex;align-items:flex-start;gap:10px;font-weight:500}.ciaac-reflect input{margin-top:5px;width:18px;height:18px;accent-color:var(--primary)}.ciaac-equation{font-size:clamp(24px,6vw,42px);font-weight:750;text-align:center}.ciaac-label-diagram svg{display:block;width:100%;height:auto;color:#163d70;background:#f9fbfd;border-radius:12px}.ciaac-label-diagram text{font:16px system-ui}.ciaac-label-diagram figcaption{font-size:14px;line-height:1.6;color:var(--lp-muted,var(--muted-foreground))}
`;
