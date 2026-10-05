/** Local-only authored-content review. No production route, real account or server writes. */
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { CiaacApprovedAircraftLearningPath } from "../../src/components/lp/CiaacApprovedAircraftLearningPath";
import { LearningPathExperience } from "../../src/components/lp/LearningPathExperience";
import { APPROVED_AIRCRAFT_CATALOG } from "../../src/lib/lp/ciaac-aircraft-approved/catalog";
import documentsJson from "../../src/lib/lp/ciaac-aircraft-approved/documents.json";
import type { HandbookLearningPathDocument } from "../../src/lib/lp/handbook-types";
import "../../src/fonts.css";
import "../../src/styles.css";

const documents = documentsJson as Record<string, HandbookLearningPathDocument>;
function Preview() {
  const requested = new URLSearchParams(window.location.search).get("code") ?? "AM01";
  const lesson = APPROVED_AIRCRAFT_CATALOG.lessons.find(
    (candidate) => candidate.code === requested,
  );
  const document = lesson && documents[lesson.id];
  const [complete, setComplete] = useState(false);
  if (!lesson || !document) return <p role="status">Contenido pendiente de recibir y revisar.</p>;
  const id = lesson.id;
  return (
    <LearningPathExperience
      identity={{
        category: "CIAAC",
        subject: "Aeronaves y motores",
        chapter: "Itinerario aprobado",
        title: document.title,
        id,
        categoryId: "ciaac",
        subjectId: "aeronaves-y-motores",
        chapterId: id.split("/")[2],
      }}
      user={null}
      showBrandArtwork={true}
      appearance="conceptual"
      onBack={() => history.back()}
      onYaris={() => {}}
    >
      <CiaacApprovedAircraftLearningPath
        key={id}
        document={document}
        userId="ciaac-approved-local-review-only"
        lpId={id}
        completed={complete}
        onComplete={() => setComplete(true)}
      />
      <output data-testid="completion-status" hidden>
        {complete ? "complete" : "incomplete"}
      </output>
    </LearningPathExperience>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
