/**
 * Estado único de la sesión adaptativa de "Estudiemos Juntos".
 *
 * Vive por encima de las rutas: la nube de Pathy sigue viva mientras la alumna
 * navega al cuestionario, al banco o al simulador. Se persiste en el navegador
 * para sobrevivir recargas. No toca el temporizador Pomodoro existente.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PlanActivity, StudySessionState } from "@/lib/estudiemos/types";

const KEY = "fp_estudiemos_session_v1";

function load(): StudySessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StudySessionState;
    if (!s || !Array.isArray(s.activities) || s.endedAt) return null;
    return s;
  } catch {
    return null;
  }
}

function save(s: StudySessionState | null) {
  if (typeof window === "undefined") return;
  try {
    if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* almacenamiento lleno o bloqueado: la sesión sigue en memoria */
  }
}

interface Ctx {
  session: StudySessionState | null;
  current: PlanActivity | null;
  next: PlanActivity | null;
  /** Milisegundos restantes (puede llegar a 0). */
  remainingMs: number;
  elapsedMin: number;
  totalMin: number;
  start: (s: Omit<StudySessionState, "startedAt" | "currentIndex" | "completedIds">) => void;
  completeCurrent: () => void;
  goTo: (index: number) => void;
  end: () => StudySessionState | null;
  clear: () => void;
}

const StudySessionCtx = createContext<Ctx | null>(null);

export function useStudySession(): Ctx {
  const ctx = useContext(StudySessionCtx);
  if (!ctx) throw new Error("useStudySession fuera de StudySessionProvider");
  return ctx;
}

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudySessionState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setSession(load());
  }, []);

  useEffect(() => {
    if (!session || session.endedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  const update = useCallback((next: StudySessionState | null) => {
    setSession(next);
    save(next);
  }, []);

  const start = useCallback<Ctx["start"]>(
    (s) => {
      update({ ...s, startedAt: Date.now(), currentIndex: 0, completedIds: [] });
    },
    [update],
  );

  const completeCurrent = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const actual = prev.activities[prev.currentIndex];
      const next: StudySessionState = {
        ...prev,
        completedIds: actual ? [...new Set([...prev.completedIds, actual.id])] : prev.completedIds,
        currentIndex: Math.min(prev.currentIndex + 1, prev.activities.length),
      };
      save(next);
      return next;
    });
  }, []);

  const goTo = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, currentIndex: Math.max(0, Math.min(index, prev.activities.length - 1)) };
      save(next);
      return next;
    });
  }, []);

  const end = useCallback<Ctx["end"]>(() => {
    let ended: StudySessionState | null = null;
    setSession((prev) => {
      if (!prev) return prev;
      ended = { ...prev, endedAt: Date.now() };
      save(null);
      return null;
    });
    return ended;
  }, []);

  const clear = useCallback(() => update(null), [update]);

  const value = useMemo<Ctx>(() => {
    const current = session?.activities[session.currentIndex] ?? null;
    const next = session?.activities[session.currentIndex + 1] ?? null;
    const elapsed = session ? Math.max(0, now - session.startedAt) : 0;
    const remainingMs = session ? Math.max(0, session.totalMs - elapsed) : 0;
    return {
      session,
      current,
      next,
      remainingMs,
      elapsedMin: Math.floor(elapsed / 60000),
      totalMin: session ? Math.round(session.totalMs / 60000) : 0,
      start,
      completeCurrent,
      goTo,
      end,
      clear,
    };
  }, [session, now, start, completeCurrent, goTo, end, clear]);

  return <StudySessionCtx.Provider value={value}>{children}</StudySessionCtx.Provider>;
}
