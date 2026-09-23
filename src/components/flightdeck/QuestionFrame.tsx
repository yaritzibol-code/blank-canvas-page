import type { ReactNode, CSSProperties } from "react";
import "./flightdeck.css";
/** Applies the new question cockpit while preserving the quiz engine, persistence and grading. */
export function QuestionFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="fd-shell fd-question-session"
      style={{ "--fd-world": 'url("/flightdeck/aeropuerto-MEX.jpg")' } as CSSProperties}
    >
      {children}
    </div>
  );
}
