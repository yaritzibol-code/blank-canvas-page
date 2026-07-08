import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  MATERIAS_DEF,
  claseLockState,
  getClaseProgress,
  getClases,
  getConfig,
  logActivity,
  nowISO,
  upsertClaseProgress,
  useSessionUser,
  useStore,
  type Clase,
} from "@/lib/store";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";

export const Route = createFileRoute("/dashboard/clases")({
  component: ClasesPage,
});

type Screen = "materias" | "videos" | "player";

interface Video {
  id: string;
  title: string;
  dur: string;
  durSecs: number;
  done?: boolean;
  prog?: number;
  locked?: boolean;
  lockKind?: "previo" | "plan" | null;
  desc: string;
  topics: string[];
  videoUrl: string;
}

interface Materia {
  slug: string;
  name: string;
  icon: string;
  color: string;
  total: string;
  watchedCount: number;
  totalCount: number;
  progressPct: number;
  videos: Video[];
}

/** Gradientes por materia (visual, valores del diseño; cíclicos para el resto). */
const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];
const GRADIENT_BY_SLUG: Record<string, string> = {
  aerodinamica: GRADIENTS[0],
  "aeronaves-motores": GRADIENTS[1],
  meteorologia: GRADIENTS[2],
  navegacion: GRADIENTS[3],
  legislacion: GRADIENTS[4],
  medicina: GRADIENTS[5],
};

/** Mock visual del grid deshabilitado (solo cuando no hay ninguna clase publicada). */
const FALLBACK_MATERIAS = [
  { name: "Aerodinámica", icon: "plane", color: "linear-gradient(135deg,#667eea,#764ba2)", total: "8 clases · 2h 14min", totalCount: 8 },
  { name: "Aeronaves y Motores", icon: "settings", color: "linear-gradient(135deg,#f093fb,#f5576c)", total: "9 clases · 2h 48min", totalCount: 9 },
  { name: "Meteorología", icon: "cloud", color: "linear-gradient(135deg,#4facfe,#00f2fe)", total: "6 clases · 1h 58min", totalCount: 6 },
  { name: "Navegación Aérea", icon: "map", color: "linear-gradient(135deg,#43e97b,#38f9d7)", total: "7 clases · 2h 22min", totalCount: 7 },
  { name: "Legislación Aeronáutica", icon: "scale", color: "linear-gradient(135deg,#fa709a,#fee140)", total: "5 clases · 1h 45min", totalCount: 5 },
  { name: "Medicina de Aviación", icon: "stethoscope", color: "linear-gradient(135deg,#a18cd1,#fbc2eb)", total: "6 clases · 1h 52min", totalCount: 6 },
];

function fmtDur(min: number): string {
  return `${min}:00`;
}

function fmtTotalLabel(clases: Clase[]): string {
  const totalMin = clases.reduce((s, c) => s + c.duracionMin, 0);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${clases.length} clases · ${h > 0 ? `${h}h ${m}min` : `${m} min`}`;
}

function fmtProg(pct: number, dur: string): string {
  const parts = dur.split(":").map(Number);
  const totalSec = parts[0] * 60 + (parts[1] ?? 0);
  const elapsed = Math.round((pct / 100) * totalSec);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Autodetección de embeds YouTube/Vimeo. */
function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function ClasesPage() {
  const user = useSessionUser();
  const [screen, setScreen] = useState<Screen>("materias");
  const [materiaIdx, setMateriaIdx] = useState(0);
  const [videoIdx, setVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [hoverCard, setHoverCard] = useState<number | null>(null);
  const [hoverVideo, setHoverVideo] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tracking real de visualización (PRD: no basta adelantar al final)
  const watchedSecsRef = useRef(0);
  const persistCounterRef = useRef(0);
  const completedLoggedRef = useRef(false);
  const lastVideoTimeRef = useRef(0);
  const activeClaseRef = useRef<{ id: string; titulo: string; durSecs: number } | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const speeds = ["1x", "1.25x", "1.5x", "1.75x", "2x"];

  // Materias reales desde el store (solo clases publicadas, ordenadas por `orden`)
  const materias = useStore<Materia[]>(() => {
    const published = getClases().filter((c) => c.status === "publicada");
    const progOf = new Map((user ? getClaseProgress(user.id) : []).map((p) => [p.claseId, p]));
    return MATERIAS_DEF.map((def, i) => {
      const clases = published
        .filter((c) => c.materia === def.slug)
        .sort((a, b) => a.orden - b.orden);
      const videos: Video[] = clases.map((c) => {
        const p = progOf.get(c.id);
        const lock = claseLockState(user, def.slug, c.id);
        return {
          id: c.id,
          title: c.titulo,
          dur: fmtDur(c.duracionMin),
          durSecs: Math.max(1, c.duracionMin * 60),
          done: p?.completada ?? false,
          prog: p && !p.completada && p.pctVisto > 0 ? p.pctVisto : undefined,
          locked: lock !== "open",
          lockKind: lock === "open" ? null : lock === "locked_plan" ? "plan" : "previo",
          desc: c.descripcion,
          topics: [],
          videoUrl: c.videoUrl,
        };
      });
      const watchedCount = videos.filter((v) => v.done).length;
      return {
        slug: def.slug,
        name: def.name,
        icon: def.icon,
        color: GRADIENT_BY_SLUG[def.slug] ?? GRADIENTS[i % GRADIENTS.length],
        total: fmtTotalLabel(clases),
        watchedCount,
        totalCount: videos.length,
        progressPct: videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0,
        videos,
      };
    });
  });

  const anyPublished = materias.some((m) => m.totalCount > 0);

  // "Continuar viendo": progreso real más reciente en una clase publicada accesible
  let continueTarget: { mi: number; vi: number; video: Video; materia: Materia; pct: number } | null = null;
  if (user) {
    const inProg = getClaseProgress(user.id)
      .filter((p) => p.pctVisto > 0 && !p.completada)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    outer: for (const p of inProg) {
      for (let mi = 0; mi < materias.length; mi++) {
        const vi = materias[mi].videos.findIndex((v) => v.id === p.claseId && !v.locked);
        if (vi >= 0) {
          continueTarget = { mi, vi, video: materias[mi].videos[vi], materia: materias[mi], pct: p.pctVisto };
          break outer;
        }
      }
    }
  }

  const mat = materias[materiaIdx];
  const vid = mat?.videos[videoIdx];
  const playerMode: "placeholder" | "iframe" | "video" =
    !vid || vid.videoUrl === "" ? "placeholder" : embedUrl(vid.videoUrl) ? "iframe" : "video";

  /* ── Persistencia del progreso real ── */
  const persistProgress = () => {
    const a = activeClaseRef.current;
    if (!a || !user) return;
    const watched = Math.round(watchedSecsRef.current);
    if (watched <= 0) return;
    const pct = Math.min(100, Math.round((watched / a.durSecs) * 100));
    const completada = completedLoggedRef.current || pct >= getConfig().pctMinimoClase;
    upsertClaseProgress({
      userId: user.id,
      claseId: a.id,
      pctVisto: pct,
      tiempoVistoSecs: watched,
      completada,
      updatedAt: nowISO(),
    });
    if (completada && !completedLoggedRef.current) {
      completedLoggedRef.current = true;
      logActivity({
        userId: user.id,
        kind: "clase",
        label: "Clase — " + a.titulo,
        durationMin: Math.round(watched / 60),
      });
    }
  };
  const persistRef = useRef(persistProgress);
  persistRef.current = persistProgress;

  const addWatched = (secs: number) => {
    watchedSecsRef.current += secs;
    persistCounterRef.current += secs;
    if (persistCounterRef.current >= 10) {
      persistCounterRef.current = 0;
      persistRef.current();
    }
  };

  // Persistir al desmontar la página
  useEffect(() => () => { persistRef.current(); }, []);

  useEffect(() => {
    if (screen !== "player") {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
      setIsPlaying(false);
      persistRef.current();
      activeClaseRef.current = null;
    }
  }, [screen]);

  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    if (!isPlaying || screen !== "player") return;

    // Timer simulado (solo placeholder, visual como hoy)
    if (playerMode === "placeholder") {
      playIntervalRef.current = setInterval(() => {
        setPlayProgress((p) => {
          if (p >= 100) {
            clearInterval(playIntervalRef.current!);
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, parseFloat((p + 0.1).toFixed(1)));
        });
      }, 100);
    }
    // Conteo real de segundos (placeholder e iframe; <video> usa timeupdate)
    if (playerMode !== "video") {
      watchIntervalRef.current = setInterval(() => {
        addWatched(1);
        if (playerMode === "iframe") {
          const a = activeClaseRef.current;
          if (a) setPlayProgress(Math.min(100, Math.round((watchedSecsRef.current / a.durSecs) * 100)));
        }
      }, 1000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, playerMode, screen]);

  const showMaterias = () => { setScreen("materias"); setIsPlaying(false); };

  const showVideos = (idx: number) => {
    setMateriaIdx(idx);
    setScreen("videos");
    setIsPlaying(false);
  };

  const showPlayer = (mIdx: number, vIdx: number) => {
    const m = materias[mIdx];
    const v = m?.videos[vIdx];
    if (!m || !v) return;
    if (v.locked) {
      if (v.lockKind === "plan") setUpgradeOpen(true);
      return;
    }
    // Cierra el tracking de la clase anterior antes de abrir la nueva
    persistRef.current();
    const p = user ? getClaseProgress(user.id).find((x) => x.claseId === v.id) : undefined;
    watchedSecsRef.current = p?.tiempoVistoSecs ?? 0;
    persistCounterRef.current = 0;
    completedLoggedRef.current = p?.completada ?? false;
    lastVideoTimeRef.current = 0;
    activeClaseRef.current = { id: v.id, titulo: v.title, durSecs: v.durSecs };
    setMateriaIdx(mIdx);
    setVideoIdx(vIdx);
    setPlayProgress(p?.completada ? 100 : (p?.pctVisto ?? 0));
    setSpeedIdx(0);
    setIsPlaying(false);
    setScreen("player");
  };

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clamped = Math.max(0, Math.min(100, pct));
    if (playerMode === "video" && videoElRef.current && videoElRef.current.duration > 0) {
      videoElRef.current.currentTime = (clamped / 100) * videoElRef.current.duration;
      lastVideoTimeRef.current = videoElRef.current.currentTime;
    }
    setPlayProgress(clamped);
  };

  const togglePlay = () => {
    if (playerMode === "video" && videoElRef.current) {
      if (videoElRef.current.paused) void videoElRef.current.play();
      else videoElRef.current.pause();
      return;
    }
    setIsPlaying((p) => !p);
  };

  const onVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const t = el.currentTime;
    const diff = t - lastVideoTimeRef.current;
    // Solo reproducción efectiva: difs pequeñas entre updates; saltos grandes = seeks
    if (diff > 0 && diff <= 1.5) addWatched(diff);
    lastVideoTimeRef.current = t;
    if (el.duration > 0) setPlayProgress(Math.min(100, (t / el.duration) * 100));
  };

  const prevVideo = () => { if (videoIdx > 0) showPlayer(materiaIdx, videoIdx - 1); };
  const nextVideo = () => {
    if (!mat) return;
    if (videoIdx < mat.videos.length - 1 && !mat.videos[videoIdx + 1].locked)
      showPlayer(materiaIdx, videoIdx + 1);
  };
  const cycleSpeed = () =>
    setSpeedIdx((i) => {
      const next = (i + 1) % speeds.length;
      if (videoElRef.current) videoElRef.current.playbackRate = parseFloat(speeds[next]);
      return next;
    });

  // ── PLAYER ──────────────────────────────────────────────────────────────────
  if (screen === "player" && mat && vid) {
    const embed = embedUrl(vid.videoUrl);
    return (
      <>
        <style>{`
          @media (max-width: 640px) {
            .player-wrap { flex-direction: column !important; height: auto !important; }
            .player-playlist { width: 100% !important; height: 280px; border-left: none !important; border-top: 1px solid #F2DCDB; }
          }
        `}</style>
        <div
          className="player-wrap"
          style={{ margin: "-32px", display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}
        >
          {/* Video side */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#22375C", overflow: "hidden", minWidth: 0 }}>
            {/* Video / embed / placeholder */}
            <div style={{ width: "100%", background: "black", aspectRatio: "16/9", maxHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {playerMode === "video" ? (
                <video
                  ref={videoElRef}
                  src={vid.videoUrl}
                  controls
                  onTimeUpdate={onVideoTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onSeeking={() => { lastVideoTimeRef.current = videoElRef.current?.currentTime ?? 0; }}
                  style={{ width: "100%", height: "100%", background: "black" }}
                />
              ) : playerMode === "iframe" && embed ? (
                <iframe
                  src={embed}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#22375C,#2a2a4e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ display: "flex", color: "white" }}><Icon n={mat.icon as never} size={64} /></div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", textAlign: "center", padding: "0 20px" }}>{vid.title}</div>
                  <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", gap: 4 }}>Haz clic en <Icon n="play" size={14} /> para reproducir</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ background: "rgba(0,0,0,.8)", padding: "10px 16px", flexShrink: 0 }}>
              <div
                onClick={scrub}
                style={{ height: 4, background: "rgba(255,255,255,.2)", borderRadius: 10, marginBottom: 10, cursor: "pointer", overflow: "hidden" }}
              >
                <div style={{ height: "100%", background: "#F2AEBC", width: `${playProgress}%`, borderRadius: 10, transition: "width .1s" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={prevVideo} style={vcBtnStyle}><Icon n="chevL" size={18} /></button>
                  <button onClick={togglePlay} style={vcBtnStyle}>{isPlaying ? <Icon n="pause" size={18} /> : <Icon n="play" size={18} />}</button>
                  <button onClick={nextVideo} style={vcBtnStyle}><Icon n="chevR" size={18} /></button>
                  <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>
                    {fmtProg(playProgress, vid.dur)} / {vid.dur}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={cycleSpeed}
                    style={{ background: "rgba(255,255,255,.1)", border: "none", color: "white", borderRadius: 6, padding: "3px 8px", fontSize: ".75rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    {speeds[speedIdx]}
                  </button>
                  <button onClick={() => setReportOpen(true)} style={vcBtnStyle} title="Reportar problema"><Icon n="alert" size={16} /></button>
                  <button onClick={showMaterias} style={vcBtnStyle} title="Cerrar"><Icon n="close" size={18} /></button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "white", marginBottom: 6 }}>{vid.title}</div>
              <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.4)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="play" size={13} /> Clase {videoIdx + 1} de {mat.videos.length}</span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="clock" size={13} /> {vid.dur}</span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n={mat.icon as never} size={13} /> {mat.name}</span>
              </div>
              <div style={{ fontSize: ".84rem", color: "rgba(255,255,255,.65)", lineHeight: 1.6, marginBottom: 14 }}>{vid.desc}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {vid.topics.map((t) => (
                  <span key={t} style={{ padding: "4px 12px", background: "rgba(255,255,255,.06)", borderRadius: 20, fontSize: ".74rem", color: "rgba(255,255,255,.6)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Playlist side */}
          <div className="player-playlist" style={{ width: 300, flexShrink: 0, background: "white", borderLeft: "1px solid rgba(61,93,145,.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #F2DCDB", background: "#f8f9ff" }}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "#22375C", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}><Icon n={mat.icon as never} size={16} /> {mat.name}</h3>
              <p style={{ fontSize: ".72rem", color: "#647DA0" }}>{mat.total}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {mat.videos.map((pv, i) => {
                const isActive = i === videoIdx;
                const isLocked = pv.locked;
                const isDone = pv.done;
                return (
                  <div
                    key={pv.id}
                    onClick={() => {
                      if (pv.lockKind === "plan") setUpgradeOpen(true);
                      else if (!isLocked) showPlayer(materiaIdx, i);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      borderLeft: `3px solid ${isActive ? "#3D5D91" : "transparent"}`,
                      background: isActive ? "rgba(61,93,145,.06)" : undefined,
                      opacity: isLocked ? 0.4 : 1,
                      transition: "background .2s",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".72rem", fontWeight: 700,
                      background: isActive ? "#3D5D91" : isDone ? "#2ecc71" : isLocked ? "#eee" : "#F2DCDB",
                      color: isActive || isDone ? "white" : isLocked ? "#ccc" : "#647DA0",
                    }}>
                      {isDone ? <Icon n="check" size={15} /> : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".8rem", fontWeight: isActive ? 700 : 600, color: isActive ? "#3D5D91" : "#22375C", lineHeight: 1.3, marginBottom: 2 }}>{pv.title}</div>
                      <div style={{ fontSize: ".7rem", color: "#8DA1BE", display: "flex", alignItems: "center", gap: 4 }}><Icon n="clock" size={12} /> {pv.dur}</div>
                    </div>
                    <span style={{ flexShrink: 0, display: "flex", color: isLocked ? "#8DA1BE" : "#2ecc71" }}>{isLocked ? <Icon n="lock" size={14} /> : isDone ? <Icon n="checkCircle" size={14} /> : null}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          feature="Clases grabadas completas"
          userId={user?.id}
        />
        <ReportProblemModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          user={user}
          seccion="Clases grabadas"
          recurso={vid.id}
          tipoInicial="Problema con video"
        />
      </>
    );
  }

  // ── VIDEOS LIST ──────────────────────────────────────────────────────────────
  if (screen === "videos" && mat) {
    const currentMat = mat;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button
            onClick={showMaterias}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "7px 14px", fontSize: ".82rem", fontWeight: 700, color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#647DA0"; }}
          >
            ← Materias
          </button>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon n={currentMat.icon as never} size={22} /> {currentMat.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {currentMat.videos.map((v, i) => {
            const isLocked = v.locked;
            const isDone = v.done;
            const inProg = (v.prog ?? 0) > 0 && !isDone;
            const isHover = hoverVideo === i;
            return (
              <div
                key={v.id}
                onClick={() => {
                  if (v.lockKind === "plan") setUpgradeOpen(true);
                  else if (!isLocked) showPlayer(materiaIdx, i);
                }}
                onMouseEnter={() => !isLocked && setHoverVideo(i)}
                onMouseLeave={() => setHoverVideo(null)}
                style={{
                  background: "white", borderRadius: 14, padding: 16,
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(61,93,145,.05)",
                  border: `2px solid ${isHover ? "#5A86CB" : "transparent"}`,
                  opacity: isLocked ? 0.5 : 1,
                  transition: "all .2s",
                }}
              >
                <div style={{ width: 100, height: 64, borderRadius: 10, background: currentMat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", color: "white" }}>
                  <span style={{ display: "flex" }}><Icon n={currentMat.icon as never} size={26} /></span>
                  {!isLocked && (
                    <div style={{ position: "absolute", width: 28, height: 28, background: "rgba(255,255,255,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5D91", boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}><Icon n="play" size={14} /></div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#22375C", marginBottom: 3 }}>{i + 1}. {v.title}</div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="clock" size={12} /> {v.dur}</span>
                    {isDone && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "rgba(46,204,113,.1)", color: "#1a7a4a", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="checkCircle" size={11} /> Vista</span>}
                    {inProg && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "rgba(61,93,145,.08)", color: "#3D5D91", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="play" size={11} /> En progreso</span>}
                    {isLocked && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "#F2DCDB", color: "#8DA1BE", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="lock" size={11} /> Bloqueada</span>}
                    {!isDone && !inProg && !isLocked && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "#F2DCDB", color: "#647DA0" }}>Sin ver</span>}
                  </div>
                  {(isDone || inProg) && (
                    <div style={{ height: 3, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 10, background: isDone ? "#2ecc71" : "#3D5D91", width: `${isDone ? 100 : v.prog ?? 0}%` }} />
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: ".78rem", color: "#8DA1BE", fontWeight: 600 }}>{v.dur}</div>
                  <div style={{ marginTop: 2, display: "flex", justifyContent: "flex-end", color: isLocked ? "#8DA1BE" : "#2ecc71" }}>{isLocked ? <Icon n="lock" size={16} /> : isDone ? <Icon n="checkCircle" size={16} /> : null}</div>
                </div>
              </div>
            );
          })}
        </div>

        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          feature="Clases grabadas completas"
          userId={user?.id}
        />
      </div>
    );
  }

  // ── MATERIAS GRID ────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", color: "#22375C", marginBottom: 6 }}>
          Clases <span style={{ color: "#6C0820" }}>Grabadas</span>
        </h1>
        <p style={{ fontSize: ".9rem", color: "#647DA0" }}>Aprende a tu ritmo con videos explicados por Yaris, organizados por materia y tema.</p>
      </div>

      {/* Próximamente banner (solo si aún no hay clases publicadas) */}
      {!anyPublished && (
        <div style={{
          background: "linear-gradient(135deg, #F2DCDB, #fce4ec)",
          border: "1.5px solid #F2AEBC",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}>
          <span style={{ display: "flex", color: "#6C0820" }}><Icon n="play" size={22} /></span>
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#6C0820", margin: 0 }}>
              Clases grabadas — Próximamente
            </p>
            <p style={{ fontSize: "0.78rem", color: "#647DA0", margin: "2px 0 0" }}>
              Estamos grabando los videos. ¡Muy pronto disponibles!
            </p>
          </div>
        </div>
      )}

      {/* Continue watching */}
      {continueTarget ? (
        <div
          onClick={() => showPlayer(continueTarget!.mi, continueTarget!.vi)}
          style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, marginBottom: 28, cursor: "pointer", position: "relative", overflow: "hidden" }}
        >
          <div style={{ width: 80, height: 56, borderRadius: 10, background: continueTarget.materia.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", color: "white" }}>
            <Icon n={continueTarget.materia.icon as never} size={28} />
            <div style={{ position: "absolute", width: 28, height: 28, background: "rgba(255,255,255,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5D91" }}><Icon n="play" size={15} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: ".68rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}><Icon n="play" size={12} /> Continuar viendo</div>
            <div style={{ fontSize: ".95rem", fontWeight: 700, color: "white", marginBottom: 4 }}>{continueTarget.materia.name} · {continueTarget.video.title}</div>
            <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.5)" }}>Clase {continueTarget.vi + 1} de {continueTarget.materia.videos.length} · Llevas {fmtProg(continueTarget.pct, continueTarget.video.dur)} de {continueTarget.video.dur}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#F2AEBC", width: `${continueTarget.pct}%` }} />
              </div>
              <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>{continueTarget.pct}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, marginBottom: 28, cursor: "not-allowed", opacity: 0.5, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 8, right: 12, background: "#F2AEBC", color: "#6C0820", fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
            Próximamente
          </div>
          <div style={{ width: 80, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#4facfe,#00f2fe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", color: "white" }}>
            <Icon n="cloud" size={28} />
            <div style={{ position: "absolute", width: 28, height: 28, background: "rgba(255,255,255,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5D91" }}><Icon n="play" size={15} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: ".68rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}><Icon n="play" size={12} /> Continuar viendo</div>
            <div style={{ fontSize: ".95rem", fontWeight: 700, color: "white", marginBottom: 4 }}>Meteorología · Nubes — Clasificación y Formación</div>
            <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.5)" }}>Clase 3 de 6 · Llevas 8:24 de 22:15</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#F2AEBC", width: "35%" }} />
              </div>
              <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>35%</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {anyPublished ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {materias.map((m, i) => {
            const active = m.totalCount > 0;
            const isHover = hoverCard === i && active;
            return (
              <div
                key={m.slug}
                onClick={() => active && showVideos(i)}
                onMouseEnter={() => active && setHoverCard(i)}
                onMouseLeave={() => setHoverCard(null)}
                style={{
                  background: "white", borderRadius: 16, overflow: "hidden",
                  cursor: active ? "pointer" : "not-allowed", opacity: active ? 1 : 0.55,
                  boxShadow: isHover ? "0 8px 24px rgba(61,93,145,.12)" : "0 2px 10px rgba(61,93,145,.06)",
                  border: isHover ? "2px solid #5A86CB" : "2px solid transparent",
                  transform: isHover ? "translateY(-3px)" : "none",
                  transition: "all .25s",
                  position: "relative",
                }}
              >
                <div style={{ height: 110, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "white" }}>
                  <span style={{ display: "flex" }}><Icon n={m.icon as never} size={44} /></span>
                  {!active && (
                    <div style={{ position: "absolute", background: "rgba(0,0,0,0.45)", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.5px" }}>
                      PRÓXIMAMENTE
                    </div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#22375C", marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 10 }}>{active ? m.total : "Próximamente"}</div>
                  <div style={{ height: 4, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: `${active ? m.progressPct : 0}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "#8DA1BE" }}>
                    {active ? (
                      <>
                        <span>{m.watchedCount}/{m.totalCount} clases vistas</span>
                        <span>{m.progressPct}%</span>
                      </>
                    ) : (
                      <span>Próximamente disponible</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {FALLBACK_MATERIAS.map((fm, i) => (
            <div
              key={i}
              style={{
                background: "white", borderRadius: 16, overflow: "hidden",
                cursor: "not-allowed", opacity: 0.55,
                boxShadow: "0 2px 10px rgba(61,93,145,.06)",
                border: "2px solid transparent",
                position: "relative",
              }}
            >
              <div style={{ height: 110, background: fm.color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "white" }}>
                <span style={{ display: "flex" }}><Icon n={fm.icon as never} size={44} /></span>
                <div style={{ position: "absolute", background: "rgba(0,0,0,0.45)", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.5px" }}>
                  PRÓXIMAMENTE
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#22375C", marginBottom: 4 }}>{fm.name}</div>
                <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 10 }}>{fm.total}</div>
                <div style={{ height: 4, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: "0%" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "#8DA1BE" }}>
                  <span>Próximamente disponible</span>
                  <span>{fm.totalCount} clases</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const vcBtnStyle: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(255,255,255,.8)",
  fontSize: "1.1rem", cursor: "pointer", padding: 4,
};
