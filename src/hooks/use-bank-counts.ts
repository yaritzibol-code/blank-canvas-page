/**
 * Conteo vivo del banco por manual y capítulo (`get_bank_counts`).
 *
 * Los catálogos de `linea-aerea-meta.ts` traen un total de referencia por
 * capítulo; este hook lo sustituye por lo que hay hoy en la nube, para que los
 * selectores de capítulos muestren cifras reales y dejen deshabilitados los
 * capítulos del temario que aún no tienen reactivos. Sin nube (o sin filas)
 * devuelve `undefined` y la UI se queda con el catálogo.
 */
import { useEffect, useState } from "react";
import { fetchBankCounts, type BankCount } from "@/lib/store";
import { fetchAtpFixedWingCounts } from "@/lib/store/questions-cloud";

export function useBankCounts(): BankCount[] | undefined {
  const [counts, setCounts] = useState<BankCount[] | undefined>();
  useEffect(() => {
    let vivo = true;
    void fetchBankCounts().then((rows) => {
      if (vivo && rows.length > 0) setCounts(rows);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return counts;
}

/** undefined = pendiente; null = error; [] = ningún reactivo disponible. */
export function useAtpFixedWingCounts(enabled: boolean): BankCount[] | null | undefined {
  const [counts, setCounts] = useState<BankCount[] | null>();
  useEffect(() => {
    if (!enabled || counts !== undefined) return;
    let alive = true;
    void fetchAtpFixedWingCounts().then(
      (rows) => { if (alive) setCounts(rows); },
      () => { if (alive) setCounts(null); },
    );
    return () => { alive = false; };
  }, [enabled, counts]);
  return counts;
}
