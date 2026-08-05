/** Hooks: piden a la nube solo el lote del banco que la pantalla necesita. */
import { useEffect, useMemo, useState } from "react";
import {
  ensureQuestions,
  ensureQuestionsByIds,
  fetchBankCounts,
  questionsLoaded,
  type BankCount,
  type BankScope,
} from "./questions-cloud";

export function useQuestionBank(scope: BankScope = {}): boolean {
  const key = JSON.stringify(scope);
  const stable = useMemo(() => JSON.parse(key) as BankScope, [key]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    void ensureQuestions(stable).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [stable]);
  return ready || questionsLoaded();
}

/** Recupera por id las preguntas de una sesión que se retoma. */
export function useQuestionsByIds(ids: string[]): boolean {
  const key = ids.join(",");
  const [ready, setReady] = useState(ids.length === 0);
  useEffect(() => {
    let alive = true;
    if (!key) {
      setReady(true);
      return;
    }
    void ensureQuestionsByIds(key.split(",")).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [key]);
  return ready;
}

/** Conteos del banco por materia / manual / capítulo. */
export function useBankCounts(): BankCount[] {
  const [rows, setRows] = useState<BankCount[]>([]);
  useEffect(() => {
    let alive = true;
    void fetchBankCounts().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);
  return rows;
}
