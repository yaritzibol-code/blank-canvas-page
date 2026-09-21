import { useRef, useState, type KeyboardEvent } from "react";
import { QuizModalPortal } from "@/components/shared/QuizModalPortal";
import { Icon } from "@/components/ui/fp-icon";
import "./quiz-question-navigator.css";

const PAGE_SIZE = 40;

type Props = {
  total: number;
  currentIdx: number;
  highestVisitedIdx: number;
  results: (boolean | null)[];
  onSelect: (index: number) => void;
};

/** The plane follows the furthest reached question, even while reviewing an earlier one. */
export function QuizQuestionNavigator({ total, currentIdx, highestVisitedIdx, results, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const current = currentIdx + 1;
  const frontier = highestVisitedIdx + 1;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const progress = total > 0 ? Math.min(frontier / total, 1) : 0;
  const circumference = 2 * Math.PI * 29;
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const planeX = 40 + 29 * Math.cos(angle);
  const planeY = 40 + 29 * Math.sin(angle);
  const answeredCount = results.filter((result) => result !== null).length;
  const answeredPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  function openNavigator() {
    setPage(Math.floor(currentIdx / PAGE_SIZE));
    setOpen(true);
  }

  function selectQuestion(index: number) {
    if (!Number.isInteger(index) || index < 0 || index > highestVisitedIdx || index >= total) return;
    onSelect(index);
    setOpen(false);
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="fp-question-position">
      <button
        type="button"
        className="fp-question-indicator"
        title="Ver preguntas"
        aria-label={`Pregunta ${current} de ${total}. Avance máximo ${frontier}. Ver preguntas`}
        onClick={openNavigator}
      >
        <svg className="fp-question-indicator-art" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="29" fill="none" stroke="#AAB8C9" strokeWidth="1.25" />
          <circle
            cx="40" cy="40" r="29" fill="none" stroke="#B68A3D" strokeWidth="3.5"
            strokeLinecap="round" strokeDasharray={`${progress * circumference} ${circumference}`}
            transform="rotate(-90 40 40)"
            className="fp-question-indicator-progress"
          />
          <g transform={`translate(${planeX} ${planeY}) rotate(${progress * 360})`} fill="#102944" stroke="#fff" strokeWidth="0.6" strokeLinejoin="round">
            <path d="M8 0-2-2-5-6-7-6-5-1-10-1-12-3-13-3-12 0-13 3-12 3-10 1-5 1-7 6-5 6-2 2Z" />
          </g>
        </svg>
        <span className="fp-question-indicator-count">
          <strong>{current}</strong>
          <small>/ {total}</small>
        </span>
      </button>
      {currentIdx < highestVisitedIdx && (
        <button type="button" className="fp-question-return" onClick={() => onSelect(highestVisitedIdx)}>
          Volver a la {frontier}
        </button>
      )}

      {open && (
        <QuizModalPortal onClose={() => setOpen(false)}>
          <div className="fp-question-navigator-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}>
            <div
              ref={dialogRef}
              className="fp-question-navigator"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fp-question-navigator-title"
              onKeyDown={trapFocus}
            >
              <header className="fp-question-navigator-header">
                <h2 id="fp-question-navigator-title">Preguntas</h2>
                <button type="button" autoFocus data-navigator-close className="fp-question-navigator-close" onClick={() => setOpen(false)} aria-label="Cerrar navegador de preguntas">
                  <Icon n="close" size={20} />
                </button>
              </header>
              <div className="fp-question-navigator-progress-label">
                <span>{current} / {total}</span>
                <strong>{answeredPct}%</strong>
              </div>
              <div className="fp-question-navigator-progress-track" role="progressbar" aria-label="Preguntas respondidas" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={total}>
                <div style={{ width: `${answeredPct}%` }} />
              </div>
              {currentIdx < highestVisitedIdx && <p className="fp-question-navigator-frontier">Avance máximo: {frontier}</p>}
              <div className="fp-question-navigator-legend" aria-label="Estados de las preguntas">
                <span><i className="is-correct" />Respondida correcta</span>
                <span><i className="is-incorrect" />Respondida incorrecta</span>
                <span><i className="is-current" />Pregunta actual</span>
                <span><i className="is-frontier" />Avance máximo</span>
                <span><i className="is-available" />Disponible</span>
                <span><i className="is-locked" />Bloqueada</span>
              </div>
              <div className="fp-question-navigator-ranges" aria-label="Rangos de preguntas">
                {Array.from({ length: pageCount }, (_, range) => {
                  const first = range * PAGE_SIZE + 1;
                  const last = Math.min((range + 1) * PAGE_SIZE, total);
                  return <button key={range} type="button" aria-current={page === range ? "page" : undefined} onClick={() => setPage(range)}>{first}–{last}</button>;
                })}
              </div>
              <div className="fp-question-navigator-scroll">
                <div className="fp-question-navigator-grid" role="group" aria-label={`Preguntas ${start + 1} a ${end}`}>
                  {Array.from({ length: end - start }, (_, offset) => {
                    const index = start + offset;
                    const result = results[index];
                    const locked = index > highestVisitedIdx;
                    const currentQuestion = index === currentIdx;
                    const frontierQuestion = index === highestVisitedIdx;
                    const status = locked ? "bloqueada" : result === true ? "respondida correctamente" : result === false ? "respondida incorrectamente" : "disponible";
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`fp-question-navigator-number ${locked ? "is-locked" : result === true ? "is-correct" : result === false ? "is-incorrect" : "is-available"}${currentQuestion ? " is-current" : ""}${frontierQuestion ? " is-frontier" : ""}`}
                        disabled={locked}
                        aria-current={currentQuestion ? "step" : undefined}
                        aria-label={`Pregunta ${index + 1}, ${status}${frontierQuestion ? ", avance máximo" : ""}`}
                        onClick={() => selectQuestion(index)}
                      >{index + 1}</button>
                    );
                  })}
                </div>
              </div>
              <footer className="fp-question-navigator-footer">
                <button type="button" disabled={page === 0} aria-label="Rango anterior" onClick={() => setPage(page - 1)}><Icon n="chevL" size={20} /></button>
                <span>{start + 1} – {end} de {total}</span>
                <button type="button" disabled={page + 1 >= pageCount} aria-label="Rango siguiente" onClick={() => setPage(page + 1)}><Icon n="chevR" size={20} /></button>
              </footer>
            </div>
          </div>
        </QuizModalPortal>
      )}
    </div>
  );
}
