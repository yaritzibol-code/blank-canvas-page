/**
 * Datos en vivo desde la nube.
 *
 * La hidratación desde Supabase sólo corría al iniciar sesión, así que la app
 * mostraba la foto de ese momento: lo que la estudiante hacía en otro
 * dispositivo, o lo que la administradora cambiaba, no aparecía hasta recargar.
 * Este hook relee la parte viva (perfiles, estado por usuario, reportes y
 * configuración) en intervalo, al volver a la pestaña y a petición.
 *
 * Sin nube el store local ya notifica cada escritura en el momento, así que el
 * hook se declara inactivo y no monta ningún temporizador.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { cloudSessionActive, refreshCloudData } from "@/lib/store";

/**
 * Pantallas que no toleran que les cambien los datos debajo (una entrevista de
 * voz en curso, por ejemplo) pueden congelar el refresco mientras duran: cada
 * relectura de la nube re-renderiza el tablero completo y se sentía como si la
 * página se recargara sola.
 */
let pausas = 0;
const oyentes = new Set<() => void>();

export function pausarLiveData(): () => void {
  pausas++;
  oyentes.forEach((f) => f());
  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    pausas = Math.max(0, pausas - 1);
    oyentes.forEach((f) => f());
  };
}

function useLiveDataPausado(): boolean {
  const [pausado, setPausado] = useState(() => pausas > 0);
  useEffect(() => {
    const f = () => setPausado(pausas > 0);
    oyentes.add(f);
    f();
    return () => {
      oyentes.delete(f);
    };
  }, []);
  return pausado;
}

export interface LiveDataState {
  /** false en modo local: no hay nada que refrescar. */
  enabled: boolean;
  busy: boolean;
  /** Segundos desde la última lectura correcta. */
  agoSecs: number;
  refresh: () => void;
}

export function useLiveData(active: boolean, intervalMs = 20000): LiveDataState {
  const pausado = useLiveDataPausado();
  const enabled = active && !pausado && cloudSessionActive();
  const [lastAt, setLastAt] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const busyRef = useRef(false);

  const refresh = useCallback(() => {
    if (!enabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    void refreshCloudData().then((ok) => {
      busyRef.current = false;
      setBusy(false);
      if (ok) setLastAt(Date.now());
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const poll = setInterval(refresh, intervalMs);
    // El reloj del indicador sólo alimenta un texto ("hace 35s"): a 1s obligaba
    // a re-renderizar el tablero entero cada segundo.
    const tick = setInterval(() => setNow(Date.now()), 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [enabled, refresh, intervalMs]);

  return { enabled, busy, agoSecs: Math.max(0, Math.round((now - lastAt) / 1000)), refresh };
}

/** "Al día" / "hace 35s" / "hace 2 min" para el indicador. */
export function liveLabel(s: LiveDataState): string {
  if (s.busy) return "Actualizando…";
  if (s.agoSecs < 5) return "Al día";
  return `hace ${s.agoSecs < 60 ? `${s.agoSecs}s` : `${Math.round(s.agoSecs / 60)} min`}`;
}
