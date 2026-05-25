import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react";

/* ── TECH DATA (exported so EstudemosPage can use it) ── */
export const TECH_DATA = [
  { work: 25, brk: 5,  cycles: 4, name: "🍅 Pomodoro",       icon: "🍅", title: "Pomodoro",        desc: "25 min de enfoque + 5 de descanso. Clásico y comprobado para retención.",            badge: "25+5 min · 4 ciclos",  bg: "#e8eef7", fg: "#2a4068", accent: "#3D5D91" },
  { work: 52, brk: 17, cycles: 3, name: "⚡ 52/17",           icon: "⚡", title: "52/17",            desc: "52 min de trabajo profundo + 17 de pausa activa. Para materias densas.",            badge: "52+17 min · 3 ciclos", bg: "#e8f0fb", fg: "#1a4a8a", accent: "#5A86CB" },
  { work: 90, brk: 20, cycles: 2, name: "🎯 Ultradian",       icon: "🎯", title: "Bloque Ultradian", desc: "90 min siguiendo tu ritmo biológico. Para simulacros completos del CIAAC.",         badge: "90+20 min · 2 ciclos", bg: "#fceef0", fg: "#6C0820", accent: "#6C0820" },
  { work: 15, brk: 5,  cycles: 6, name: "🃏 Flashcards",      icon: "🃏", title: "Sprint Flashcards",desc: "15 min de repaso rápido. Perfecto la noche antes del examen.",                      badge: "15 min · 6 rondas",    bg: "#fdf0f3", fg: "#8a2040", accent: "#F2AEBC" },
  { work: 45, brk: 10, cycles: 3, name: "📖 Lectura Activa",  icon: "📖", title: "Lectura Activa",   desc: "45 min de lectura + pausa para resumir. Para reglamentos y manuales.",              badge: "45+10 min · 3 ciclos", bg: "#eafaf3", fg: "#145a3e", accent: "#22a06b" },
  { work: 30, brk: 10, cycles: 4, name: "✍️ Escritura Libre", icon: "✍️", title: "Escritura Libre",  desc: "30 min escribiendo sin parar todo lo que sabes. Volcado mental.",                   badge: "30+10 min · 4 ciclos", bg: "#fdf3ea", fg: "#8a4a10", accent: "#e07b39" },
];

export function pad(n: number) { return String(n).padStart(2, "0"); }

/* ── PATHY SVG (exported so EstudemosPage can use it too) ── */
export function PathySVG({ size = 64, overlay = false, smiling = true }: { size?: number; overlay?: boolean; smiling?: boolean }) {
  const cloud = overlay ? "rgba(255,255,255,.2)" : "#e8eef7";
  const hat   = overlay ? "rgba(255,255,255,.9)" : "#3D5D91";
  const brim  = overlay ? "rgba(255,255,255,.5)" : "#5A86CB";
  const mouth = smiling ? "M25 41 Q30 45 35 41" : "M25 44 Q30 40 35 44";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ display: "block" }}>
      <ellipse cx="30" cy="42" rx="22" ry="13" fill={cloud} />
      <circle cx="18" cy="40" r="10" fill={cloud} />
      <circle cx="30" cy="36" r="12" fill={cloud} />
      <circle cx="42" cy="39" r="9"  fill={cloud} />
      <rect x="14" y="17" width="32" height="8" rx="4"   fill={hat}  />
      <rect x="20" y="15" width="20" height="5" rx="2.5" fill={brim} />
      {!overlay && <rect x="16" y="24" width="28" height="3" rx="1.5" fill="#6C0820" opacity=".6" />}
      <circle cx="24" cy="35" r="3.5" fill="white" />
      <circle cx="36" cy="35" r="3.5" fill="white" />
      <circle cx="25" cy="35" r="2"   fill="#2a4068" />
      <circle cx="37" cy="35" r="2"   fill="#2a4068" />
      <path d={mouth} stroke="#2a4068" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {!overlay && <><circle cx="18" cy="40" r="3" fill="#F2AEBC" opacity=".5" /><circle cx="42" cy="40" r="3" fill="#F2AEBC" opacity=".5" /></>}
    </svg>
  );
}

/* ── CONTEXT TYPES ── */
interface TimerState {
  rem: number; isWork: boolean; curCycle: number; running: boolean;
  workSecs: number; breakSecs: number; totalCycles: number; techIdx: number;
  visible: boolean; smiling: boolean; timerLabel: string; floatLabel: string;
}
interface TimerCtx extends TimerState {
  toast: string | null;
  selectTech: (idx: number) => void;
  startSession: (floatLabel: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  toggleFloat: () => void;
  closeFloat: () => void;
}

const INIT: TimerState = {
  rem: 25 * 60, isWork: true, curCycle: 0, running: false,
  workSecs: 25 * 60, breakSecs: 5 * 60, totalCycles: 4, techIdx: 0,
  visible: false, smiling: true,
  timerLabel: "🍅 Pomodoro seleccionado · ¡Dale play para arrancar!",
  floatLabel: "Meteorología · Pomodoro",
};

const TimerCtx = createContext<TimerCtx>(null!);
export const useTimer = () => useContext(TimerCtx);

/* ── PROVIDER ── */
export function TimerProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<TimerState>(INIT);
  const [toast, setToast] = useState<string | null>(null);

  // Live mutable ref — interval always reads from here (no stale closures)
  const T = useRef({ ...INIT });
  const ivRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<() => void>(() => {});

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2800); }

  function startIv() {
    clearInterval(ivRef.current!);
    ivRef.current = setInterval(() => tickRef.current(), 1000);
  }

  /* tick — runs every second */
  function tick() {
    const t = T.current;
    if (t.rem <= 0) {
      clearInterval(ivRef.current!); ivRef.current = null;
      if (t.isWork) {
        t.isWork = false; t.rem = t.breakSecs;
        setS(p => ({ ...p, isWork: false, rem: t.breakSecs, smiling: false, timerLabel: "💚 Descanso activo" }));
        showToast("¡Buen trabajo! Descansa ☕");
      } else {
        t.isWork = true; t.curCycle = Math.min(t.curCycle + 1, t.totalCycles - 1); t.rem = t.workSecs;
        setS(p => ({ ...p, isWork: true, curCycle: t.curCycle, rem: t.workSecs, smiling: true, timerLabel: "🔴 Sesión activa" }));
        showToast("¡De vuelta al trabajo! 💪");
      }
      if (t.running) startIv();
      return;
    }
    t.rem--;
    setS(p => ({ ...p, rem: t.rem }));
  }
  tickRef.current = tick; // always up-to-date

  /* actions */
  function selectTech(idx: number) {
    const d = TECH_DATA[idx];
    clearInterval(ivRef.current!); ivRef.current = null;
    const upd = { running: false, isWork: true, curCycle: 0, workSecs: d.work * 60, breakSecs: d.brk * 60, totalCycles: d.cycles, techIdx: idx, rem: d.work * 60 };
    Object.assign(T.current, upd);
    setS(p => ({ ...p, ...upd, smiling: true, timerLabel: d.name + " seleccionado · ¡Dale play para arrancar!" }));
    showToast(d.name + " seleccionada ✓");
  }

  function startSession(floatLabel: string) {
    T.current.running = true; T.current.visible = true;
    T.current.rem = T.current.workSecs; T.current.isWork = true; T.current.curCycle = 0;
    setS(p => ({ ...p, running: true, visible: true, rem: T.current.workSecs, isWork: true, curCycle: 0, smiling: true, timerLabel: "🔴 Sesión activa", floatLabel }));
    startIv();
  }

  function toggleTimer() {
    T.current.running = !T.current.running;
    const r = T.current.running;
    setS(p => ({ ...p, running: r, timerLabel: r ? "🔴 Sesión activa" : "⏸ En pausa" }));
    if (r) startIv(); else { clearInterval(ivRef.current!); ivRef.current = null; }
  }

  function resetTimer() {
    clearInterval(ivRef.current!); ivRef.current = null;
    const t = T.current;
    t.running = false; t.isWork = true; t.curCycle = 0; t.rem = t.workSecs;
    setS(p => ({ ...p, running: false, isWork: true, curCycle: 0, rem: t.workSecs, smiling: true, timerLabel: TECH_DATA[t.techIdx].name + " seleccionado · ¡Dale play!" }));
  }

  function skipPhase() {
    const t = T.current;
    clearInterval(ivRef.current!); ivRef.current = null;
    if (t.isWork) {
      t.isWork = false; t.rem = t.breakSecs;
      setS(p => ({ ...p, isWork: false, rem: t.breakSecs, smiling: false, timerLabel: "💚 Descanso activo" }));
      showToast("¡Buen trabajo! Descansa ☕");
    } else {
      t.isWork = true; t.curCycle = Math.min(t.curCycle + 1, t.totalCycles - 1); t.rem = t.workSecs;
      setS(p => ({ ...p, isWork: true, curCycle: t.curCycle, rem: t.workSecs, smiling: true, timerLabel: "🔴 Sesión activa" }));
      showToast("¡De vuelta al trabajo! 💪");
    }
    if (t.running) startIv();
  }

  function toggleFloat() {
    T.current.running = !T.current.running;
    const r = T.current.running;
    setS(p => ({ ...p, running: r }));
    if (r) startIv(); else { clearInterval(ivRef.current!); ivRef.current = null; }
  }

  function closeFloat() {
    clearInterval(ivRef.current!); ivRef.current = null;
    T.current.running = false; T.current.visible = false;
    setS(p => ({ ...p, running: false, visible: false, timerLabel: "⏸ Timer cerrado" }));
    showToast("Timer cerrado · Tu progreso se guardó 💾");
  }

  useEffect(() => () => { clearInterval(ivRef.current!); }, []);

  return (
    <TimerCtx.Provider value={{ ...s, toast, selectTech, startSession, toggleTimer, resetTimer, skipPhase, toggleFloat, closeFloat }}>
      {children}

      {/* ── FLOATING TIMER (persists across all dashboard routes) ── */}
      {s.visible && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#3D5D91", borderRadius: 18, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, zIndex: 250, minWidth: 240, boxShadow: "0 8px 32px rgba(61,93,145,.35)", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ animation: "fp-float 2s ease-in-out infinite", flexShrink: 0 }}>
            <PathySVG size={38} overlay smiling={s.smiling} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: -.5, lineHeight: 1 }}>
              {pad(Math.floor(s.rem / 60))}:{pad(s.rem % 60)}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "fp-pulse 1.5s ease infinite" }} />
              {s.floatLabel}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button onClick={toggleFloat} title={s.running ? "Pausar" : "Reanudar"}
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.running
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
            </button>
            <button onClick={closeFloat} title="Cerrar timer"
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST (persists across all dashboard routes) ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: s.visible ? 110 : 30, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", color: "white", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 400, transition: "bottom .3s" }}>
          {toast}
        </div>
      )}
    </TimerCtx.Provider>
  );
}
