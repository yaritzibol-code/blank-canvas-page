/** Hook: garantiza que el banco de preguntas esté descargado de la nube. */
import { useEffect, useState } from "react";
import { ensureQuestions, questionsLoaded } from "./questions-cloud";

export function useQuestionBank(): boolean {
  const [ready, setReady] = useState(questionsLoaded());
  useEffect(() => {
    let alive = true;
    void ensureQuestions().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}
