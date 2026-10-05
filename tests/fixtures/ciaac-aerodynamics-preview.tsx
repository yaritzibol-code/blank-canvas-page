/** Isolated local UI fixture. This is not a production route and never completes a real user's lesson. */
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { CiaacAerodynamicsLearningPath } from "../../src/components/lp/CiaacAerodynamicsLearningPath";
import { LearningPathExperience } from "../../src/components/lp/LearningPathExperience";
import { CIAAC_LEARNING_PATHS } from "../../src/lib/lp/ciaac-content";
import "../../src/fonts.css";
import "../../src/styles.css";

const lessons = Object.entries(CIAAC_LEARNING_PATHS);
function Preview() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("id");
  const [id, document] =
    lessons.find(([id]) => id === requested) ?? lessons.find(([, d]) => d.chapter === 2)!;
  const [complete, setComplete] = useState(false);
  return (
    <LearningPathExperience
      identity={{
        category: "CIAAC",
        subject: "Aerodinámica",
        chapter: `Módulo ${document.chapter} · ${document.chapter_name}`,
        title: document.name,
        id,
        categoryId: "ciaac",
        subjectId: "aerodinamica",
        chapterId: id.split("/")[2],
      }}
      user={null}
      showBrandArtwork={true}
      appearance="conceptual"
      onBack={() => history.back()}
      onYaris={() => {}}
    >
      <CiaacAerodynamicsLearningPath
        key={id}
        document={document}
        userId="ciaac-local-test"
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
