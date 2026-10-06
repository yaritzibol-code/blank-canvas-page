/** Review entry only: never mounted by any production route or access gate. */
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { CiaacApprovedAircraftLearningPath } from "../../src/components/lp/CiaacApprovedAircraftLearningPath";
import { LearningPathExperience } from "../../src/components/lp/LearningPathExperience";
import { APPROVED_AIRCRAFT_CATALOG } from "../../src/lib/lp/ciaac-aircraft-approved/catalog";
import documentsJson from "../../src/lib/lp/ciaac-aircraft-approved/documents.json";
import type { HandbookLearningPathDocument } from "../../src/lib/lp/handbook-types";
import { REVIEW_USER_ID, resetLpJourney } from "./ciaac-review-journey-stub";
import "../../src/fonts.css";
import "../../src/styles.css";
import "./ciaac-portable-review.css";

const lessons = APPROVED_AIRCRAFT_CATALOG.lessons.slice(5, 10);
const documents = documentsJson as Record<string, HandbookLearningPathDocument>;
function readCode() {
  const code =
    window.location.hash.slice(1) ||
    new URLSearchParams(window.location.search).get("code") ||
    "AM06";
  return lessons.some((lesson) => lesson.code === code) ? code : "selector";
}

function Lesson({
  code,
  onBack,
  onYaris,
}: {
  code: string;
  onBack: () => void;
  onYaris: () => void;
}) {
  const lesson = lessons.find((candidate) => candidate.code === code)!;
  const document = documents[lesson.id];
  const [complete, setComplete] = useState(false);
  if (!document) return <p role="alert">El documento {code} no está incluido.</p>;
  return (
    <>
      <LearningPathExperience
        identity={{
          category: "CIAAC",
          subject: "Aeronaves y motores",
          chapter: "Itinerario aprobado",
          title: document.title,
          id: lesson.id,
          categoryId: "ciaac",
          subjectId: "aeronaves-y-motores",
          chapterId: lesson.id.split("/")[2],
        }}
        user={null}
        showBrandArtwork={true}
        appearance="conceptual"
        onBack={onBack}
        onYaris={onYaris}
      >
        <CiaacApprovedAircraftLearningPath
          document={document}
          userId={REVIEW_USER_ID}
          lpId={lesson.id}
          completed={complete}
          onComplete={() => setComplete(true)}
        />
        <output data-testid="completion-status" hidden>
          {complete ? "complete" : "incomplete"}
        </output>
      </LearningPathExperience>
    </>
  );
}

export function PortableReview() {
  const [code, setCode] = useState(readCode);
  const [epoch, setEpoch] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const changed = () => {
      setCode(readCode());
      setNotice("");
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const navigate = (next: string) => {
    window.location.hash = next;
    setCode(next);
    setNotice("");
  };
  const resetReview = () => {
    const lesson = lessons.find((candidate) => candidate.code === code);
    if (!lesson || !window.confirm(`¿Borrar solamente el avance de la revisión local ${code}?`))
      return;
    resetLpJourney(REVIEW_USER_ID, lesson.id);
    setEpoch((value) => value + 1);
    setNotice(`Revisión local ${code} reiniciada; no se modificó ninguna cuenta.`);
  };
  return (
    <>
      <aside className="review-banner" aria-label="Revisión local sin efectos en cuentas">
        <strong>REVISIÓN LOCAL · AM06–10 · SIN CUENTA NI RECOMPENSAS</strong>
        <p>
          Contenido y navegación nativos. El avance es de prueba en esta pestaña; no modifica
          planes, acceso, progreso real ni puntos FP. Los enlaces de fuentes solo salen a Internet
          si los abres.
        </p>
        <div>
          <label htmlFor="review-lesson">Revisar: </label>
          <select
            id="review-lesson"
            value={code}
            onChange={(event) => navigate(event.target.value)}
          >
            <option value="selector">Selector de recorridos</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.code}>
                {lesson.code} · {lesson.title}
              </option>
            ))}
          </select>
          <button type="button" disabled={code === "selector"} onClick={resetReview}>
            Borrar solo esta revisión
          </button>
        </div>
        {notice && <p role="status">{notice}</p>}
      </aside>
      {code === "selector" ? (
        <main className="review-selector">
          <h1>Recorridos para revisión local</h1>
          <p>Seleccionar aquí un recorrido no desbloquea contenido en FlightPath.</p>
          {lessons.map((lesson) => (
            <button key={lesson.id} type="button" onClick={() => navigate(lesson.code)}>
              {lesson.code} · {lesson.title}
            </button>
          ))}
        </main>
      ) : (
        <Lesson
          key={`${code}:${epoch}`}
          code={code}
          onBack={() => navigate("selector")}
          onYaris={() =>
            setNotice(
              "Yaris está desactivada en este paquete: no se abre una conversación ni se envía información.",
            )
          }
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<PortableReview />);
