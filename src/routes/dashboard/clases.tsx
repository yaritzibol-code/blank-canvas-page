import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/dashboard/clases")({
  component: ClasesPage,
});

type Screen = "materias" | "videos" | "player";

interface Video {
  title: string;
  dur: string;
  done?: boolean;
  prog?: number;
  locked?: boolean;
  desc: string;
  topics: string[];
}

interface Materia {
  name: string;
  icon: string;
  color: string;
  total: string;
  watchedCount: number;
  totalCount: number;
  progressPct: number;
  videos: Video[];
}

const MATERIAS: Materia[] = [
  {
    name: "Aerodinámica", icon: "✈️",
    color: "linear-gradient(135deg,#667eea,#764ba2)",
    total: "8 clases · 2h 14min", watchedCount: 8, totalCount: 8, progressPct: 100,
    videos: [
      { title: "Introducción a la Aerodinámica", dur: "14:22", done: true, desc: "Qué es la aerodinámica, su importancia en aviación y conceptos básicos de fluidos.", topics: ["Fluidos", "Capa límite", "Presión"] },
      { title: "Fuerzas que actúan en vuelo", dur: "18:32", prog: 35, desc: "Las 4 fuerzas fundamentales: sustentación, peso, empuje y resistencia.", topics: ["Sustentación", "Peso", "Empuje", "Resistencia"] },
      { title: "Principio de Bernoulli y sustentación", dur: "20:15", desc: "Cómo el principio de Bernoulli explica la generación de sustentación en el ala.", topics: ["Bernoulli", "Extradós", "Intradós"] },
      { title: "Perfiles aerodinámicos", dur: "16:48", locked: true, desc: "Tipos de perfiles alares y sus características aerodinámicas.", topics: ["Perfil alar", "Cuerda", "Espesor"] },
      { title: "Mandos de la aeronave", dur: "22:10", locked: true, desc: "Superficies de control primarias y secundarias y cómo afectan el vuelo.", topics: ["Alerones", "Elevador", "Timón", "Flaps"] },
      { title: "Estabilidad y control", dur: "19:30", locked: true, desc: "Tipos de estabilidad y cómo mantener la aeronave en equilibrio.", topics: ["Estabilidad estática", "Estabilidad dinámica", "CG"] },
      { title: "Maniobras y factor de carga", dur: "17:45", locked: true, desc: "Cálculo del factor de carga en virajes, ascensos y descensos.", topics: ["Factor de carga", "Viraje", "Desplome"] },
      { title: "Motor crítico", dur: "15:20", locked: true, desc: "Por qué en aeronaves multimotor existe un motor crítico y sus implicaciones.", topics: ["Motor crítico", "P-factor", "Contra-rotating"] },
    ],
  },
  {
    name: "Aeronaves y Motores", icon: "⚙️",
    color: "linear-gradient(135deg,#f093fb,#f5576c)",
    total: "9 clases · 2h 48min", watchedCount: 5, totalCount: 9, progressPct: 55,
    videos: [
      { title: "Clasificación de aeronaves", dur: "12:30", done: true, desc: "Tipos de aeronaves según peso, alas, motores y tren de aterrizaje.", topics: ["Clasificación", "Tipos de alas", "Tipos de motores"] },
      { title: "Estructuras de la aeronave", dur: "18:45", done: true, desc: "Componentes estructurales: fuselaje, alas, empenaje y sus funciones.", topics: ["Fuselaje", "Ala", "Empenaje"] },
      { title: "Motor alternativo — Ciclo Otto", dur: "22:15", done: true, desc: "Funcionamiento del motor de pistón, ciclo Otto y sistemas principales.", topics: ["Ciclo Otto", "4 tiempos", "Ignición", "Carburador"] },
      { title: "Motor alternativo — Sistemas", dur: "20:10", done: true, desc: "Sistemas de combustible, lubricación, enfriamiento y escape.", topics: ["Combustible", "Lubricación", "Enfriamiento"] },
      { title: "Motor alternativo — Hélices", dur: "16:30", done: true, desc: "Tipos de hélices, paso fijo y paso variable, eficiencia propulsiva.", topics: ["Hélice", "Paso fijo", "Paso variable", "RPM"] },
      { title: "Motor a reacción", dur: "24:00", locked: true, desc: "Ciclo Brayton, tipos de turbinas y sistemas del motor a reacción.", topics: ["Ciclo Brayton", "Turborreactor", "Turbofan"] },
      { title: "Sistemas de la aeronave", dur: "21:15", locked: true, desc: "Sistemas hidráulico, neumático, eléctrico y de presurización.", topics: ["Hidráulico", "Neumático", "Eléctrico", "Presurización"] },
      { title: "Tren de aterrizaje", dur: "14:20", locked: true, desc: "Tipos de tren, operación y sistemas de frenos.", topics: ["Tren triciclo", "Frenos", "ABS aeronáutico"] },
      { title: "Instrumentos de vuelo", dur: "19:45", locked: true, desc: "Six-pack, instrumentos de presión estática y giroscópicos.", topics: ["Six-pack", "Altímetro", "VSI", "Horizonte artificial"] },
    ],
  },
  {
    name: "Meteorología", icon: "🌤️",
    color: "linear-gradient(135deg,#4facfe,#00f2fe)",
    total: "6 clases · 1h 58min", watchedCount: 2, totalCount: 6, progressPct: 35,
    videos: [
      { title: "La atmósfera y sus capas", dur: "16:20", done: true, desc: "Composición de la atmósfera, capas y sus características.", topics: ["Troposfera", "Estratosfera", "Tropopausa"] },
      { title: "Temperatura y presión atmosférica", dur: "18:40", done: true, desc: "Escalas de temperatura, variaciones y sistemas de presión.", topics: ["ISA", "QNH", "QNE", "Isobaras"] },
      { title: "Nubes — Clasificación y Formación", dur: "22:15", prog: 35, desc: "Tipos de nubes, cómo se forman y su impacto en la aviación.", topics: ["Nubes bajas", "Nubes medias", "Nubes altas", "Cumulonimbus"] },
      { title: "Vientos y fenómenos atmosféricos", dur: "20:10", locked: true, desc: "Tipos de viento, Wind Shear, turbulencia y sus efectos en vuelo.", topics: ["Wind Shear", "Turbulencia", "Coriolis", "Jet stream"] },
      { title: "METAR y TAF — Lectura e interpretación", dur: "24:30", locked: true, desc: "Cómo leer e interpretar reportes meteorológicos aeronáuticos.", topics: ["METAR", "TAF", "SIGMET", "PIREP"] },
      { title: "Tormentas y formación de hielo", dur: "16:45", locked: true, desc: "Tipos de tormentas, engelamiento y cómo afectan la seguridad del vuelo.", topics: ["Tormentas", "Hielo estructural", "CBs", "PIREP"] },
    ],
  },
  {
    name: "Navegación Aérea", icon: "🗺️",
    color: "linear-gradient(135deg,#43e97b,#38f9d7)",
    total: "7 clases · 2h 22min", watchedCount: 0, totalCount: 7, progressPct: 0,
    videos: [
      { title: "Coordenadas y carta aeronáutica", dur: "18:30", desc: "Sistema de coordenadas geográficas y uso de cartas aeronáuticas.", topics: ["Latitud", "Longitud", "Carta WAC", "Carta seccional"] },
      { title: "Magnetismo y variación", dur: "16:20", desc: "Magnetismo terrestre, variación magnética y declinación.", topics: ["Rumbo verdadero", "Rumbo magnético", "Variación"] },
      { title: "Radionavegación — VOR y ADF", dur: "22:10", desc: "Funcionamiento e interpretación del VOR, ADF y DME.", topics: ["VOR", "ADF", "DME", "HSI"] },
      { title: "ILS y aproximaciones", dur: "20:45", desc: "Sistema de aterrizaje por instrumentos y sus componentes.", topics: ["ILS", "Localizador", "Senda de planeo", "DH"] },
      { title: "Computador CR-3", dur: "19:30", desc: "Uso del computador de navegación CR-3 para cálculos de vuelo.", topics: ["CR-3", "Deriva", "Viento", "TAS"] },
      { title: "Planificación de vuelo y NavLog", dur: "21:15", desc: "Cómo planificar un vuelo y completar un NavLog correctamente.", topics: ["NavLog", "Plan de vuelo", "OACI", "Combustible"] },
      { title: "GPS y navegación moderna", dur: "24:00", desc: "Sistemas GPS, RNAV y su aplicación en aviación general.", topics: ["GPS", "RNAV", "GNSS", "ADS-B"] },
    ],
  },
  {
    name: "Legislación Aeronáutica", icon: "⚖️",
    color: "linear-gradient(135deg,#fa709a,#fee140)",
    total: "5 clases · 1h 45min", watchedCount: 0, totalCount: 5, progressPct: 0,
    videos: [
      { title: "Jerarquía de normas aeronáuticas", dur: "14:20", desc: "Estructura legal de la aviación civil en México.", topics: ["AFAC", "SENEAM", "OACI", "Convenio de Chicago"] },
      { title: "Ley de Aviación Civil", dur: "22:30", desc: "Artículos más importantes de la Ley de Aviación Civil mexicana.", topics: ["Ley de Aviación Civil", "Licencias", "Certificados"] },
      { title: "Reglamento de Tránsito Aéreo", dur: "20:15", desc: "Reglas VFR e IFR, espacio aéreo y procedimientos.", topics: ["VFR", "IFR", "VMC", "IMC"] },
      { title: "ROAC — Reglamento de Operación", dur: "18:40", desc: "Reglamento de Operación de Aeronaves Civiles y sus implicaciones.", topics: ["ROAC", "Mantenimiento", "Documentos"] },
      { title: "Circulares Obligatorias", dur: "9:55", desc: "Las COs más relevantes para el examen CIAAC.", topics: ["CO-AV", "CO-SA", "Obligaciones del piloto"] },
    ],
  },
  {
    name: "Medicina de Aviación", icon: "🏥",
    color: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    total: "6 clases · 1h 52min", watchedCount: 5, totalCount: 6, progressPct: 80,
    videos: [
      { title: "Fisiología del vuelo — Introducción", dur: "14:30", done: true, desc: "Divisiones fisiológicas y leyes de los gases aplicadas a la aviación.", topics: ["Leyes de los gases", "Zonas fisiológicas", "Boyle", "Dalton"] },
      { title: "Hipoxia — Tipos y síntomas", dur: "20:15", done: true, desc: "Qué es la hipoxia, tipos, síntomas y tiempo de consciencia útil.", topics: ["Hipoxia", "TCU", "Hiperventilación", "Oxígeno"] },
      { title: "Barotraumas y aeroembolismo", dur: "16:40", done: true, desc: "Barosinusitis, barotitis, barodontalgia y maniobra de Valsalva.", topics: ["Barotraumas", "Barotitis", "Valsalva", "Aeroembolismo"] },
      { title: "Desorientación espacial e ilusiones", dur: "18:20", done: true, desc: "Tipos de ilusiones vestibulares y visuales en vuelo.", topics: ["Ilusiones", "Leans", "Graveyard spiral", "Somatogravic"] },
      { title: "Fatiga y factor humano", dur: "22:10", done: true, desc: "Tipos de fatiga, efectos en el rendimiento y cómo manejarla.", topics: ["Fatiga aguda", "Fatiga crónica", "Sueño", "Alcohol"] },
      { title: "Medicina preventiva y certificación médica", dur: "20:05", locked: true, desc: "Certificación médica clase I, II y III y sus requisitos.", topics: ["Certificación médica", "Clase I", "Clase II", "Licencia"] },
    ],
  },
];

const CONTINUE_MATERIA = 2;
const CONTINUE_VIDEO = 2;

function fmtProg(pct: number, dur: string): string {
  const parts = dur.split(":").map(Number);
  const totalSec = parts[0] * 60 + (parts[1] ?? 0);
  const elapsed = Math.round((pct / 100) * totalSec);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ClasesPage() {
  const [screen, setScreen] = useState<Screen>("materias");
  const [materiaIdx, setMateriaIdx] = useState(0);
  const [videoIdx, setVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [hoverCard, setHoverCard] = useState<number | null>(null);
  const [hoverVideo, setHoverVideo] = useState<number | null>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speeds = ["1x", "1.25x", "1.5x", "1.75x", "2x"];

  useEffect(() => {
    if (screen !== "player") {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      setIsPlaying(false);
    }
  }, [screen]);

  useEffect(() => {
    if (isPlaying) {
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
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying]);

  const showMaterias = () => { setScreen("materias"); setIsPlaying(false); };

  const showVideos = (idx: number) => {
    setMateriaIdx(idx);
    setScreen("videos");
    setIsPlaying(false);
  };

  const showPlayer = (mIdx: number, vIdx: number) => {
    const v = MATERIAS[mIdx].videos[vIdx];
    setMateriaIdx(mIdx);
    setVideoIdx(vIdx);
    setPlayProgress(v.prog ?? (v.done ? 100 : 0));
    setSpeedIdx(0);
    setIsPlaying(false);
    setScreen("player");
  };

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    setPlayProgress(Math.max(0, Math.min(100, pct)));
  };

  const prevVideo = () => { if (videoIdx > 0) showPlayer(materiaIdx, videoIdx - 1); };
  const nextVideo = () => {
    const m = MATERIAS[materiaIdx];
    if (videoIdx < m.videos.length - 1 && !m.videos[videoIdx + 1].locked)
      showPlayer(materiaIdx, videoIdx + 1);
  };
  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % speeds.length);

  const mat = MATERIAS[materiaIdx];
  const vid = mat.videos[videoIdx];

  // ── PLAYER ──────────────────────────────────────────────────────────────────
  if (screen === "player") {
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1a1a2e", overflow: "hidden", minWidth: 0 }}>
            {/* Placeholder */}
            <div style={{ width: "100%", background: "black", aspectRatio: "16/9", maxHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ fontSize: "4rem" }}>{mat.icon}</div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", textAlign: "center", padding: "0 20px" }}>{vid.title}</div>
                <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>Haz clic en ▶ para reproducir</div>
              </div>
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
                  <button onClick={prevVideo} style={vcBtnStyle}>⏮</button>
                  <button onClick={() => setIsPlaying((p) => !p)} style={vcBtnStyle}>{isPlaying ? "⏸" : "▶"}</button>
                  <button onClick={nextVideo} style={vcBtnStyle}>⏭</button>
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
                  <button onClick={showMaterias} style={vcBtnStyle} title="Cerrar">✕</button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "white", marginBottom: 6 }}>{vid.title}</div>
              <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.4)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>🎬 Clase {videoIdx + 1} de {mat.videos.length}</span>
                <span>·</span>
                <span>⏱ {vid.dur}</span>
                <span>·</span>
                <span>{mat.icon} {mat.name}</span>
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
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{mat.icon} {mat.name}</h3>
              <p style={{ fontSize: ".72rem", color: "#888" }}>{mat.total}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {mat.videos.map((pv, i) => {
                const isActive = i === videoIdx;
                const isLocked = pv.locked;
                const isDone = pv.done;
                return (
                  <div
                    key={i}
                    onClick={() => !isLocked && showPlayer(materiaIdx, i)}
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
                      color: isActive || isDone ? "white" : isLocked ? "#ccc" : "#888",
                    }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".8rem", fontWeight: isActive ? 700 : 600, color: isActive ? "#3D5D91" : "#1a1a2e", lineHeight: 1.3, marginBottom: 2 }}>{pv.title}</div>
                      <div style={{ fontSize: ".7rem", color: "#aaa" }}>⏱ {pv.dur}</div>
                    </div>
                    <span style={{ fontSize: ".85rem", flexShrink: 0 }}>{isLocked ? "🔒" : isDone ? "✅" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── VIDEOS LIST ──────────────────────────────────────────────────────────────
  if (screen === "videos") {
    const currentMat = MATERIAS[materiaIdx];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button
            onClick={showMaterias}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "7px 14px", fontSize: ".82rem", fontWeight: 700, color: "#888", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#888"; }}
          >
            ← Materias
          </button>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>
            {currentMat.icon} {currentMat.name}
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
                key={i}
                onClick={() => !isLocked && showPlayer(materiaIdx, i)}
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
                <div style={{ width: 100, height: 64, borderRadius: 10, background: currentMat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, position: "relative" }}>
                  <span>{currentMat.icon}</span>
                  {!isLocked && (
                    <div style={{ position: "absolute", width: 28, height: 28, background: "rgba(255,255,255,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>▶</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 3 }}>{i + 1}. {v.title}</div>
                  <div style={{ fontSize: ".74rem", color: "#888", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>⏱ {v.dur}</span>
                    {isDone && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "rgba(46,204,113,.1)", color: "#1a7a4a" }}>✅ Vista</span>}
                    {inProg && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "rgba(61,93,145,.08)", color: "#3D5D91" }}>▶ En progreso</span>}
                    {isLocked && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "#F2DCDB", color: "#aaa" }}>🔒 Bloqueada</span>}
                    {!isDone && !inProg && !isLocked && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: ".65rem", fontWeight: 700, background: "#F2DCDB", color: "#888" }}>Sin ver</span>}
                  </div>
                  {(isDone || inProg) && (
                    <div style={{ height: 3, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 10, background: isDone ? "#2ecc71" : "#3D5D91", width: `${isDone ? 100 : v.prog ?? 35}%` }} />
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: ".78rem", color: "#aaa", fontWeight: 600 }}>{v.dur}</div>
                  <div style={{ fontSize: "1rem", marginTop: 2 }}>{isLocked ? "🔒" : isDone ? "✅" : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── MATERIAS GRID ────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", color: "#1a1a2e", marginBottom: 6 }}>
          Clases <span style={{ color: "#6C0820" }}>Grabadas</span>
        </h1>
        <p style={{ fontSize: ".9rem", color: "#888" }}>Aprende a tu ritmo con videos explicados por Yaris, organizados por materia y tema.</p>
      </div>

      {/* Próximamente banner */}
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
        <span style={{ fontSize: "1.4rem" }}>🎬</span>
        <div>
          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#6C0820", margin: 0 }}>
            Clases grabadas — Próximamente
          </p>
          <p style={{ fontSize: "0.78rem", color: "#888", margin: "2px 0 0" }}>
            Estamos grabando los videos. ¡Muy pronto disponibles!
          </p>
        </div>
      </div>

      {/* Continue watching — disabled */}
      <div
        style={{ background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, marginBottom: 28, cursor: "not-allowed", opacity: 0.5, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 8, right: 12, background: "#F2AEBC", color: "#6C0820", fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
          Próximamente
        </div>
        <div style={{ width: 80, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#4facfe,#00f2fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0, position: "relative" }}>
          🌤️
          <div style={{ position: "absolute", width: 28, height: 28, background: "rgba(255,255,255,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem" }}>▶</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: ".68rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>▶ Continuar viendo</div>
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

      {/* Grid — disabled until content is ready */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {MATERIAS.map((mat, i) => (
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
            <div style={{ height: 110, background: mat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative" }}>
              <span>{mat.icon}</span>
              <div style={{ position: "absolute", background: "rgba(0,0,0,0.45)", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.5px" }}>
                PRÓXIMAMENTE
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{mat.name}</div>
              <div style={{ fontSize: ".74rem", color: "#888", marginBottom: 10 }}>{mat.total}</div>
              <div style={{ height: 4, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: "0%" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "#aaa" }}>
                <span>Próximamente disponible</span>
                <span>{mat.totalCount} clases</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const vcBtnStyle: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(255,255,255,.8)",
  fontSize: "1.1rem", cursor: "pointer", padding: 4,
};
