/** Hooks: piden a la nube solo el lote del banco que la pantalla necesita. */
import { useEffect, useMemo, useState } from "react";
import {
  ensureQuestions,
  ensureQuestionsByIds,
  fetchBankCounts,
  scopeLoaded,
  type BankCount,
  type BankScope,
} from "./questions-cloud";

/**
 * `ready` sólo se enciende cuando llegó **este** lote. Antes se caía a un
 * `questionsLoaded()` global: bastaba con que otra pantalla hubiera bajado
 * cualquier lote para dar por listo un capítulo que aún no existía en
 * memoria, y la pantalla se quedaba sin preguntas.
 *
 * `maxAgeMs`: si el lote se bajó hace más de ese tiempo se vuelve a pedir
 * antes de dar la pantalla por lista. Lo usan los cuestionarios y el
 * simulador para que una pregunta corregida en el panel admin llegue a la
 * siguiente sesión sin tener que recargar la página.
 */
export function useQuestionBank(scope: BankScope = {}, maxAgeMs = Infinity): boolean {
  const key = JSON.stringify(scope);
  const stable = useMemo(() => JSON.parse(key) as BankScope, [key]);
  const [ready, setReady] = useState(() => scopeLoaded(stable, maxAgeMs));
  useEffect(() => {
    let alive = true;
    const fresh = scopeLoaded(stable, maxAgeMs);
    setReady(fresh);
    void ensureQuestions(stable, !fresh && scopeLoaded(stable)).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [stable, maxAgeMs]);
  return ready;
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
