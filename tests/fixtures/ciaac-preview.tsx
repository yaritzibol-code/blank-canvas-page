/** Isolated local UI fixture. This is not a production route and never completes a real user's lesson. */
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { CiaacAircraftLearningPath } from "../../src/components/lp/CiaacAircraftLearningPath";
import { HandbookLearningPath } from "../../src/components/lp/HandbookLearningPath";
import { LearningPathExperience } from "../../src/components/lp/LearningPathExperience";
import { CIAAC_LEARNING_PATHS } from "../../src/lib/lp/ciaac-content";
import "../../src/fonts.css";
import "../../src/styles.css";

const lessons = Object.entries(CIAAC_LEARNING_PATHS);
function Preview() {
  const number = Math.max(
    1,
    Math.min(5, Number(new URLSearchParams(window.location.search).get("lesson")) || 1),
  );
  const [id, document] = lessons[number - 1];
  const [complete, setComplete] = useState(false);
  return (
    <LearningPathExperience
      identity={{
        category: "CIAAC",
        subject: "Aerodinámica",
        chapter: "Módulo 1 · Introducción y definiciones",
        title: document.name,
        id,
        categoryId: "ciaac",
        subjectId: "aerodinamica",
        chapterId: id.split("/")[2],
      }}
      user={null}
      showBrandArtwork={number === 1}
      appearance={number === 1 ? "conceptual" : undefined}
      onBack={() => history.back()}
      onYaris={() => {}}
    >
      {number === 1 ? (
        <CiaacAircraftLearningPath
          document={document}
          userId="ciaac-local-test"
          lpId={id}
          completed={complete}
          onComplete={() => {
            setComplete(true);
            window.dispatchEvent(new Event("ciaac-preview-complete"));
          }}
        />
      ) : (
        <HandbookLearningPath
          key={id}
          document={document}
          userId="ciaac-local-test"
          lpId={id}
          completed={complete}
          onComplete={() => {
            setComplete(true);
            window.dispatchEvent(new Event("ciaac-preview-complete"));
          }}
        />
      )}
      <output data-testid="completion-status" hidden>
        {complete ? "complete" : "incomplete"}
      </output>
    </LearningPathExperience>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
