import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";
import type { User, YarisContext } from "@/lib/store";
import "./learning-path-experience.css";
import "./learning-path-content.css";

export interface LearningPathStageView {
  labels: string[];
  current: number;
  highest: number;
  done: boolean[];
  percent: number;
  onNavigate: (index: number) => void;
  onReset?: () => void;
}

const StageContext = createContext<((view: LearningPathStageView | null) => void) | null>(null);

/** Each existing stage engine publishes its real journey state; the shell never stores progress. */
export function useLearningPathStageView(view: LearningPathStageView) {
  const publish = useContext(StageContext);
  const navigate = useRef(view.onNavigate);
  const reset = useRef(view.onReset);
  navigate.current = view.onNavigate;
  reset.current = view.onReset;
  const stateKey = JSON.stringify([view.labels, view.current, view.highest, view.done, view.percent]);

  useEffect(() => {
    if (!publish) return;
    publish({
      ...view,
      onNavigate: (index) => navigate.current(index),
      onReset: view.onReset ? () => reset.current?.() : undefined,
    });
    return () => publish(null);
    // The callback refs keep navigation fresh without republishing on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publish, stateKey]);
}

export interface LearningPathIdentity {
  category: string;
  subject: string;
  chapter: string;
  title: string;
  id: string;
  categoryId: string;
  subjectId: string;
  chapterId: string;
}

export function LearningPathExperience({
  identity,
  user,
  onBack,
  onYaris,
  actions,
  subjectProgress,
  children,
}: {
  identity: LearningPathIdentity;
  user: User | null;
  onBack: () => void;
  onYaris: (context: YarisContext) => void;
  actions?: ReactNode;
  subjectProgress?: { done: number; total: number; percent: number };
  children: ReactNode;
}) {
  const [view, setView] = useState<LearningPathStageView | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [section, setSection] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const currentStage = view?.current ?? 0;

  useEffect(() => {
    setSection("");
    const root = contentRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>(
      ".ar-content h1, .ar-content h2, .ar-content h3, .atp-content h1, .atp-content h2, .atp-content h3, .hb-content h1, .hb-content h2, .hb-content h3, .jp-content h1, .jp-content h2, .jp-content h3, .law-main>main h1, .law-main>main h2, .law-main>main h3, .lp-course-content h1, .lp-course-content h2, .lp-course-content h3",
    ));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const heading = visible[0]?.target as HTMLElement | undefined;
      if (heading?.textContent?.trim()) setSection(heading.textContent.trim().slice(0, 180));
    }, { rootMargin: "-100px 0px -55% 0px", threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [currentStage]);

  const labels = view?.labels ?? [];
  const stage = labels[view?.current ?? 0] ?? "Recorrido";
  const contextLine = [identity.category, identity.subject, identity.chapter, identity.title,
    `Etapa ${view ? view.current + 1 : 1}: ${stage}`, section && `Sección: ${section}`]
    .filter(Boolean).join(" / ");
  const short = (value: string, max = 180) => value.slice(0, max);
  const studyContext: YarisContext = {
    materiaName: identity.subject,
    studyContext: contextLine.slice(0, 600),
    learningPathContext: {
      category: short(identity.category),
      course: short(identity.subject),
      chapter: short(identity.chapter),
      learningPath: short(identity.title),
      stage: short(stage),
      section: section ? short(section) : undefined,
      contentId: short(identity.id, 300),
      url: typeof window === "undefined" ? "" : short(window.location.href, 500),
    },
  };
  const reportResource = [
    `Learning Path: ${identity.id}`,
    `Categoría: ${identity.category} (${identity.categoryId})`,
    `Materia: ${identity.subject} (${identity.subjectId})`,
    `Capítulo: ${identity.chapter} (${identity.chapterId})`,
    `Etapa: ${view ? view.current + 1 : 1}/${labels.length} — ${stage}`,
    section && `Sección: ${section}`,
    `URL: ${typeof window === "undefined" ? "" : window.location.href}`,
  ].filter(Boolean).join(" | ");

  return (
    <StageContext.Provider value={setView}>
      <div className="lp-study">
        <svg className="lp-study-svg-filter" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
          <filter id="flightpath-learning-logo-dark" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="-.33 0 0 0 .98 -.535 0 0 0 .94 -.844 0 0 0 .9 0 0 0 1 0" />
          </filter>
        </svg>
        <header className="lp-study-header">
          <div className="lp-study-topline">
            <span className="lp-study-brand"><img src="/lp/visual/flightpath-logo.png" alt="FlightPath" /></span>
            <button type="button" className="lp-study-back" onClick={onBack}>← Regresar a Learning Paths</button>
            <div className="lp-study-actions">
              <button type="button" onClick={() => setReportOpen(true)}>Reportar contenido</button>
              <button type="button" onClick={() => onYaris(studyContext)}>Pregúntale a Yaris</button>
            </div>
          </div>
          <div className="lp-study-context" aria-label="Ubicación en Learning Paths">
            {[identity.category, identity.subject, identity.chapter, identity.title].map((part, index) =>
              <span key={`${index}-${part}`}>{index > 0 && <i aria-hidden="true"> / </i>}{part}</span>)}
            {subjectProgress && <span className="lp-study-subject-progress" title="Progreso de la materia">
              · {subjectProgress.done} de {subjectProgress.total} Learning Paths · {subjectProgress.percent}%
            </span>}
          </div>
          {view && (
            <div className="lp-study-progress">
              <div className="lp-study-progress-summary">
                <strong>{stage}</strong>
                <span>{view.done.filter(Boolean).length} de {labels.length} etapas · {view.percent}%</span>
                {view.onReset && <button type="button" onClick={view.onReset}>Reiniciar recorrido</button>}
              </div>
              <div className="lp-study-progress-track" role="progressbar" aria-label="Progreso del Learning Path" aria-valuemin={0} aria-valuemax={100} aria-valuenow={view.percent}>
                <span style={{ width: `${view.percent}%` }} />
              </div>
              <details className="lp-study-mobile-stages">
                <summary>Etapa {view.current + 1} de {labels.length} · Ver recorrido</summary>
                <StageList view={view} />
              </details>
              <nav className="lp-study-desktop-stages" aria-label="Etapas del Learning Path"><StageList view={view} /></nav>
            </div>
          )}
        </header>
        <div className="lp-study-content" ref={contentRef}>{children}</div>
        {actions && <footer className="lp-study-outer-actions">{actions}</footer>}
        <ReportProblemModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          user={user}
          seccion="Learning Paths"
          recurso={reportResource}
          tipoInicial="Material incorrecto o incompleto"
        />
      </div>
    </StageContext.Provider>
  );
}

function StageList({ view }: { view: LearningPathStageView }) {
  return <div className="lp-study-stage-list">{view.labels.map((label, index) => {
    const locked = index > view.highest;
    const current = index === view.current;
    const done = view.done[index] ?? false;
    return <button key={`${index}-${label}`} type="button" disabled={locked}
      aria-current={current ? "step" : undefined}
      aria-label={`Etapa ${index + 1}: ${label}. ${done ? "Completada" : current ? "Actual" : locked ? "Bloqueada" : "Disponible"}`}
      className={`lp-study-stage ${done ? "is-done" : ""} ${current ? "is-current" : ""}`}
      onClick={() => view.onNavigate(index)}>
      <span className="lp-study-stage-dot">{done ? "✓" : index + 1}</span>
      <span className="lp-study-stage-copy"><span className="lp-study-stage-label">{label}</span>
        <small>{done ? "Completada" : current ? "En ruta" : locked ? "Bloqueada" : "Disponible"}</small></span>
    </button>;
  })}</div>;
}
