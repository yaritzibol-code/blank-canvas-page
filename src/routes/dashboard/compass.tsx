/**
 * Pilot Aptitude Trainer — hub del módulo "Compass" de FlightPath.
 *
 * Seis ejercicios procedurales (Control, Slalom, Memoria, Cálculo,
 * Orientación, Multitarea) con práctica por niveles, examen de formato fijo y
 * simulacro compacto. Todo determinista por seed, con scoring versionado en el
 * cliente y tendencias que sólo comparan sesiones comparables.
 *
 * Aviso permanente (ver `COMPLIANCE.md`): entrenamiento independiente. Los
 * ejercicios son originales, no provienen de EPST/COMPASS ni de ninguna
 * aerolínea, y el score no equivale a una calificación oficial.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import {
  compassModuleStats,
  compassProfile,
  getCompassSessions,
  saveCompassSession,
  useSessionUser,
  useStore,
  uid,
  type CompassSessionRecord,
} from "@/lib/store";
import {
  buildRunConfig,
  COMPASS_MODULE_MAP,
  COMPASS_MODULES,
  SIMULACRO_COMPACTO,
  SIMULACRO_MIN_APROX,
  type CompassModuleDef,
} from "@/modules/compass/config";
import { CUTE_FAMILIAS, CUTE_HISTORIA, CUTE_OPERADORES } from "@/modules/compass/cute";
import { newSeed, deriveSeed } from "@/modules/compass/rng";
import type {
  CompassMode,
  CompassModuleId,
  CompassResult,
  CompassRunConfig,
} from "@/modules/compass/types";
import { ControlGame } from "@/components/compass/ControlGame";
import { SlalomGame } from "@/components/compass/SlalomGame";
import { MemoriaGame } from "@/components/compass/MemoriaGame";
import { CalculoGame } from "@/components/compass/CalculoGame";
import { OrientacionGame } from "@/components/compass/OrientacionGame";
import { MultitareaGame } from "@/components/compass/MultitareaGame";
import { RadarChart } from "@/components/compass/RadarChart";
import {
  CButton,
  CCard,
  Eyebrow,
  MetricChip,
  ScoreRing,
  CORAL,
  CREAM,
  HAZE,
  MONO,
  NAVY,
  ROSE,
  SALMON,
  SANS,
  SERIF,
} from "@/components/compass/ui";

export const Route = createFileRoute("/dashboard/compass")({
  component: CompassPage,
});

const GAME: Record<
  CompassModuleId,
  (p: {
    cfg: CompassRunConfig;
    onFinish: (r: CompassResult) => void;
    onQuit: () => void;
  }) => React.ReactNode
> = {
  control: ControlGame,
  slalom: SlalomGame,
  memoria: MemoriaGame,
  calculo: CalculoGame,
  orientacion: OrientacionGame,
  multitarea: MultitareaGame,
};

type Fase =
  | { t: "hub" }
  | { t: "briefing"; moduleId: CompassModuleId; mode: CompassMode }
  | { t: "run"; cfg: CompassRunConfig }
  | { t: "debrief"; record: CompassSessionRecord; tendencia: number | null }
  | { t: "sim-intro" }
  | { t: "sim-inter"; nextIdx: number }
  | { t: "sim-final"; records: CompassSessionRecord[] };

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function fmtDur(sec: number): string {
  if (sec >= 90) return `${Math.round(sec / 60)} min`;
  return `${sec} s`;
}

const MODO_LABEL: Record<CompassMode, string> = {
  practica: "Práctica",
  examen: "Examen",
  simulacro: "Simulacro",
};

function CompassPage() {
  const user = useSessionUser();
  const [fase, setFase] = useState<Fase>({ t: "hub" });
  const [nivel, setNivel] = useState(1);
  // Estado del simulacro en curso (fuera del render de cada juego).
  const simRef = useRef<{ id: string; seed: number; records: CompassSessionRecord[] }>({
    id: "",
    seed: 0,
    records: [],
  });

  const profile = useStore(() => (user ? compassProfile(user.id) : null));
  const sessions = useStore(() => (user ? getCompassSessions(user.id) : []));
  const statsByModule = useStore(() => {
    if (!user) return null;
    return Object.fromEntries(
      COMPASS_MODULES.map((m) => [m.id, compassModuleStats(user.id, m.id)]),
    ) as Record<CompassModuleId, ReturnType<typeof compassModuleStats>>;
  });

  if (!user || !profile || !statsByModule) return null;

  /* ── Acciones ── */

  const abrirBriefing = (moduleId: CompassModuleId, mode: CompassMode) => {
    setNivel(statsByModule[moduleId].nivelSugerido);
    setFase({ t: "briefing", moduleId, mode });
  };

  const empezar = (moduleId: CompassModuleId, mode: CompassMode, level: number) => {
    setFase({ t: "run", cfg: buildRunConfig(moduleId, mode, level, newSeed()) });
  };

  const empezarSimulacro = () => {
    simRef.current = { id: uid("sim"), seed: newSeed(), records: [] };
    const b = SIMULACRO_COMPACTO[0];
    setFase({
      t: "run",
      cfg: buildRunConfig(b.moduleId, "simulacro", b.level, deriveSeed(simRef.current.seed, 0)),
    });
  };

  const alTerminar = (cfg: CompassRunConfig, r: CompassResult) => {
    const record = saveCompassSession({
      userId: user.id,
      mode: cfg.mode,
      level: cfg.level,
      seed: cfg.seed,
      result: r,
      simulacroId: cfg.mode === "simulacro" ? simRef.current.id : undefined,
    });
    if (cfg.mode !== "simulacro") {
      // La tendencia se lee DESPUÉS de guardar: compara esta sesión contra la
      // mediana de las 3 previas comparables.
      const tendencia = compassModuleStats(user.id, cfg.moduleId).tendencia;
      setFase({ t: "debrief", record, tendencia });
      return;
    }
    simRef.current.records.push(record);
    const nextIdx = simRef.current.records.length;
    if (nextIdx >= SIMULACRO_COMPACTO.length) {
      setFase({ t: "sim-final", records: simRef.current.records });
    } else {
      setFase({ t: "sim-inter", nextIdx });
    }
  };

  const continuarSimulacro = (idx: number) => {
    const b = SIMULACRO_COMPACTO[idx];
    setFase({
      t: "run",
      cfg: buildRunConfig(b.moduleId, "simulacro", b.level, deriveSeed(simRef.current.seed, idx)),
    });
  };

  /* ── Vistas ── */

  if (fase.t === "run") {
    const Game = GAME[fase.cfg.moduleId];
    return (
      <div style={{ fontFamily: SANS }}>
        <Game
          cfg={fase.cfg}
          onFinish={(r) => alTerminar(fase.cfg, r)}
          onQuit={() => setFase({ t: "hub" })}
        />
      </div>
    );
  }

  if (fase.t === "briefing") {
    const def = COMPASS_MODULE_MAP[fase.moduleId];
    const esPractica = fase.mode === "practica";
    return (
      <div style={{ fontFamily: SANS, maxWidth: 720, margin: "0 auto" }}>
        <BriefingView
          def={def}
          mode={fase.mode}
          nivel={nivel}
          setNivel={setNivel}
          onBack={() => setFase({ t: "hub" })}
          onStart={() => empezar(fase.moduleId, fase.mode, esPractica ? nivel : def.examenNivel)}
        />
      </div>
    );
  }

  if (fase.t === "debrief") {
    return (
      <div style={{ fontFamily: SANS, maxWidth: 780, margin: "0 auto" }}>
        <DebriefView
          record={fase.record}
          tendencia={fase.tendencia}
          onRepeat={() => empezar(fase.record.moduleId, fase.record.mode, fase.record.level)}
          onHub={() => setFase({ t: "hub" })}
        />
      </div>
    );
  }

  if (fase.t === "sim-intro") {
    return (
      <div style={{ fontFamily: SANS, maxWidth: 720, margin: "0 auto" }}>
        <SimIntroView onBack={() => setFase({ t: "hub" })} onStart={empezarSimulacro} />
      </div>
    );
  }

  if (fase.t === "sim-inter") {
    const next = SIMULACRO_COMPACTO[fase.nextIdx];
    const def = COMPASS_MODULE_MAP[next.moduleId];
    return (
      <div style={{ fontFamily: SANS, maxWidth: 640, margin: "0 auto" }}>
        <CCard style={{ textAlign: "center", padding: "40px 28px" }}>
          <Eyebrow>
            Simulacro · módulo {fase.nextIdx + 1} de {SIMULACRO_COMPACTO.length}
          </Eyebrow>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "2rem",
              color: NAVY,
              marginBottom: 8,
            }}
          >
            Siguiente: <em style={{ color: CORAL }}>{def.nombre}</em>
          </div>
          <p
            style={{
              color: HAZE,
              fontSize: "0.92rem",
              maxWidth: 460,
              margin: "0 auto 8px",
              lineHeight: 1.55,
            }}
          >
            {def.aptitud}.{" "}
            {next.items > 0 ? `${next.items} reactivos.` : `${fmtDur(next.durationSec)} continuos.`}
          </p>
          <p
            style={{
              color: HAZE,
              fontSize: "0.8rem",
              maxWidth: 460,
              margin: "0 auto 20px",
              lineHeight: 1.5,
            }}
          >
            {def.controlesDesktop}
          </p>
          <CButton onClick={() => continuarSimulacro(fase.nextIdx)}>Continuar</CButton>
        </CCard>
      </div>
    );
  }

  if (fase.t === "sim-final") {
    return (
      <div style={{ fontFamily: SANS, maxWidth: 820, margin: "0 auto" }}>
        <SimFinalView records={fase.records} onHub={() => setFase({ t: "hub" })} />
      </div>
    );
  }

  /* ── Hub ── */
  const ultimas = sessions.slice(0, 8);
  const debilDef = profile.debil ? COMPASS_MODULE_MAP[profile.debil] : null;

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1240, margin: "0 auto" }}>
      <ModuleHeader
        eyebrow="Entrenamiento · Aptitudes de selección"
        title="Pilot"
        accent="Aptitude"
        tail=" Trainer"
        subtitle={
          <>
            Entrena las familias de aptitud que miden los screenings en línea de piloto — los de
            tipo COMPASS y los de tipo CUT-E/AON: coordinación, seguimiento, memoria, cálculo,
            orientación y multitarea. Ejercicios originales e infinitos por diseño — imposibles de
            memorizar.
          </>
        }
        aside={
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: CORAL,
              background: `${ROSE}33`,
              border: `1px solid ${ROSE}`,
              padding: "6px 12px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            Teclado · Mouse · Touch
          </span>
        }
      />

      {/* KPIs + Radar */}
      <div
        className="fp-compass-top"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <KpiMini label="Sesiones" value={String(profile.sesionesTotales)} />
            <KpiMini label="Minutos entrenados" value={String(profile.minutosTotales)} />
            <KpiMini
              label="Tu punto débil"
              value={debilDef?.nombre ?? "—"}
              sub={debilDef ? "Con tus datos actuales" : "Aún sin datos"}
            />
          </div>

          {/* Simulacro compacto */}
          <div
            style={{
              background: NAVY,
              color: "white",
              borderRadius: 22,
              padding: "24px 26px",
              position: "relative",
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div
              aria-hidden="true"
              style={{ position: "absolute", right: -20, bottom: -24, opacity: 0.1 }}
            >
              <Icon n="compass" size={150} />
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: ROSE,
                  marginBottom: 8,
                }}
              >
                Batería completa · ~{SIMULACRO_MIN_APROX} min
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: "1.7rem",
                  lineHeight: 1.15,
                }}
              >
                Simulacro compacto: los seis módulos en secuencia
              </div>
              <p
                style={{
                  marginTop: 8,
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.72)",
                  maxWidth: 520,
                  lineHeight: 1.5,
                }}
              >
                Sin pausas largas y con debrief hasta el final, como en un screening real. Tu perfil
                de aptitudes se actualiza con los seis resultados.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <CButton onClick={() => setFase({ t: "sim-intro" })} style={{ background: CORAL }}>
                Iniciar simulacro
              </CButton>
            </div>
          </div>
        </div>

        <CCard
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 14px",
          }}
        >
          <Eyebrow style={{ alignSelf: "flex-start" }}>Perfil de aptitudes</Eyebrow>
          <RadarChart scores={profile.porModulo} />
          <div style={{ fontSize: "0.72rem", color: HAZE, textAlign: "center", lineHeight: 1.45 }}>
            Mediana de tus últimas 3 sesiones por módulo. Compara contra ti, no contra un corte
            oficial.
          </div>
        </CCard>
      </div>

      {/* Módulos */}
      <Eyebrow style={{ marginBottom: 12 }}>Los seis módulos</Eyebrow>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 30,
        }}
      >
        {COMPASS_MODULES.map((def) => (
          <ModuleCard
            key={def.id}
            def={def}
            stats={statsByModule[def.id]}
            debil={profile.debil === def.id && profile.sesionesTotales > 0}
            onPractica={() => abrirBriefing(def.id, "practica")}
            onExamen={() => abrirBriefing(def.id, "examen")}
          />
        ))}
      </div>

      {/* Contexto: cómo se arma una batería de screening en línea */}
      <CuteContexto />

      {/* Aptitudes cubiertas en otros módulos de FlightPath */}
      <Eyebrow style={{ marginBottom: 12 }}>Las otras familias, donde ya viven</Eyebrow>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <CrossLink
          icon="radio"
          titulo="Inglés aeronáutico"
          sub="Entrevista hablada con evaluación OACI — módulo Inglés"
          to="/dashboard/rtari"
        />
        <CrossLink
          icon="help"
          titulo="Conocimiento técnico"
          sub="Tu banco CIAAC y Línea Aérea cubren la teoría"
          to="/dashboard/banco"
        />
        <CrossLink
          icon="book"
          titulo="Razonamiento verbal y lógico"
          sub="En pista de espera — llegará con banco revisado"
        />
      </div>

      {/* Historial */}
      {ultimas.length > 0 && (
        <CCard style={{ marginBottom: 26, padding: "20px 22px" }}>
          <Eyebrow>Bitácora reciente</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ultimas.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 2px",
                  borderBottom: `1px solid ${NAVY}0C`,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.68rem",
                    color: HAZE,
                    width: 52,
                    flexShrink: 0,
                  }}
                >
                  {fmtFecha(s.date)}
                </span>
                <span
                  style={{ fontWeight: 700, color: NAVY, fontSize: "0.85rem", flex: "1 1 120px" }}
                >
                  {COMPASS_MODULE_MAP[s.moduleId].nombre}
                </span>
                <ChipMini>{MODO_LABEL[s.mode]}</ChipMini>
                <ChipMini>N{s.level}</ChipMini>
                <ChipMini>{s.input}</ChipMini>
                {s.interruptions > 0 && (
                  <ChipMini tono="alerta">{s.interruptions} interrup.</ChipMini>
                )}
                <span
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "1.2rem",
                    color: s.score >= 75 ? "#0B7A49" : s.score >= 45 ? NAVY : "#A13333",
                    marginLeft: "auto",
                  }}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </CCard>
      )}

      {/* Disclaimer de no afiliación (compliance) */}
      <div
        style={{
          background: CREAM,
          border: `1px solid ${NAVY}14`,
          borderRadius: 14,
          padding: "14px 18px",
          fontSize: "0.74rem",
          color: HAZE,
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        <strong style={{ color: NAVY }}>Entrenamiento independiente.</strong> Los ejercicios de este
        módulo son originales de FlightPath, se generan proceduralmente y entrenan familias de
        habilidades presentes en distintos procesos de selección de pilotos. Ninguno proviene ni
        reproduce las pruebas de esas baterías: los nombres de CUT-E/AON, COMPASS y de las empresas
        que las aplican se citan sólo para describir el panorama de evaluación. FlightPath no está
        afiliada, autorizada ni respaldada por AON/cut-e, EPST/COMPASS, ninguna aerolínea ni
        autoridad aeronáutica. Los scores son métricas de entrenamiento sobre tu propio historial:
        no equivalen a una calificación oficial ni garantizan resultados en ningún proceso.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .fp-compass-top { grid-template-columns: 1fr !important; }
          .fp-cute-intro { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Contexto CUT-E / AON ───────────────────────────────────────────── */

/**
 * Ficha de referencia sobre la batería CUT-E (hoy AON): de dónde viene, qué
 * familia mide cada bloque y con qué ejercicio propio se entrena esa familia.
 *
 * Es contexto de estudio, no contenido de examen: ningún ejercicio del módulo
 * proviene de esa batería (ver `COMPLIANCE.md` §5 y el aviso al pie del hub).
 */
function CuteContexto() {
  return (
    <section style={{ marginBottom: 30 }}>
      <Eyebrow style={{ marginBottom: 12 }}>Contra qué te vas a medir</Eyebrow>

      {/* Qué es la batería */}
      <CCard style={{ padding: "24px 26px", marginBottom: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.85fr)",
            gap: 26,
            alignItems: "start",
          }}
          className="fp-cute-intro"
        >
          <div>
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.75rem",
                lineHeight: 1.12,
                color: NAVY,
                marginBottom: 10,
              }}
            >
              La batería CUT-E, hoy AON
            </h2>
            <p style={{ fontSize: "0.88rem", color: HAZE, lineHeight: 1.6, marginBottom: 14 }}>
              Es el formato que domina el screening en línea de pilotos: pruebas cortas, reglas de
              una frase y estética de videojuego. Esa sencillez es el disfraz — miden velocidad y
              precisión al mismo tiempo, y filtran duro. Saber cómo está armada la batería vale
              tanto como entrenar: ninguna de estas pruebas te va a explicar en el momento qué está
              midiendo.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CUTE_HISTORIA.map((h) => (
                <div key={h.año} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.62rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: CORAL,
                      background: `${SALMON}99`,
                      borderRadius: 999,
                      padding: "4px 9px",
                      flexShrink: 0,
                      minWidth: 78,
                      textAlign: "center",
                    }}
                  >
                    {h.año}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: NAVY, lineHeight: 1.55 }}>
                    {h.texto}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quién la usa */}
          <div
            style={{
              background: CREAM,
              border: `1px solid ${NAVY}12`,
              borderRadius: 16,
              padding: "18px 18px 16px",
            }}
          >
            <Eyebrow style={{ marginBottom: 10 }}>Quién la usa</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {CUTE_OPERADORES.map((o) => (
                <span
                  key={o}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: NAVY,
                    background: "white",
                    border: `1px solid ${NAVY}14`,
                    borderRadius: 999,
                    padding: "5px 10px",
                  }}
                >
                  {o}
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.72rem", color: HAZE, lineHeight: 1.5 }}>
              Aerolíneas y escuelas que la han usado para seleccionar pilotos, según la información
              pública de cada proceso. La lista no es exhaustiva y cambia: cada empresa decide sus
              pruebas y puede cambiarlas sin aviso — confirma siempre en la convocatoria vigente.
            </p>
          </div>
        </div>
      </CCard>

      {/* Familias de la batería ↔ módulos propios */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {CUTE_FAMILIAS.map((f) => (
          <CCard key={f.familia} style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <h3
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: "1.25rem",
                  color: NAVY,
                  lineHeight: 1.1,
                }}
              >
                {f.familia}
              </h3>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: f.modulos.length > 0 ? "#0B7A49" : HAZE,
                  whiteSpace: "nowrap",
                }}
              >
                {f.modulos.length > 0 ? "Entrenable" : "Próximamente"}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: HAZE, lineHeight: 1.55, marginBottom: 12 }}>
              {f.queMide}
            </p>

            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.56rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: `${NAVY}80`,
                marginBottom: 6,
              }}
            >
              Pruebas del bloque
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {f.pruebas.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: "0.7rem",
                    color: HAZE,
                    background: CREAM,
                    border: `1px solid ${NAVY}10`,
                    borderRadius: 8,
                    padding: "4px 8px",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>

            <div
              style={{
                borderTop: `1px solid ${NAVY}0F`,
                paddingTop: 11,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {f.modulos.length > 0 ? (
                <>
                  <span style={{ fontSize: "0.74rem", color: HAZE }}>Lo entrenas en</span>
                  {f.modulos.map((id) => (
                    <span
                      key={id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: CORAL,
                        background: `${SALMON}80`,
                        borderRadius: 999,
                        padding: "4px 10px",
                      }}
                    >
                      <Icon n={COMPASS_MODULE_MAP[id].icon} size={12} />
                      {COMPASS_MODULE_MAP[id].nombre}
                    </span>
                  ))}
                </>
              ) : (
                <span style={{ fontSize: "0.74rem", color: HAZE }}>{f.pendiente}</span>
              )}
            </div>
          </CCard>
        ))}
      </div>
    </section>
  );
}

/* ── Piezas del hub ─────────────────────────────────────────────────── */

function KpiMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <CCard style={{ padding: "16px 18px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.56rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: `${NAVY}80`,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "1.9rem",
          lineHeight: 1,
          color: NAVY,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.7rem", color: HAZE, marginTop: 4 }}>{sub}</div>}
    </CCard>
  );
}

function ChipMini({ children, tono }: { children: React.ReactNode; tono?: "alerta" }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: "0.58rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: tono === "alerta" ? "#8A6100" : HAZE,
        background: tono === "alerta" ? "#FFF6E0" : CREAM,
        border: `1px solid ${NAVY}12`,
        padding: "3px 8px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function TendenciaChip({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const up = delta > 0;
  const flat = delta === 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: MONO,
        fontSize: "0.66rem",
        fontWeight: 800,
        color: flat ? HAZE : up ? "#0B7A49" : "#A13333",
      }}
      title="Contra la mediana de tus 3 sesiones previas comparables"
    >
      {flat ? "=" : up ? "▲" : "▼"} {flat ? "" : Math.abs(delta)}
    </span>
  );
}

function ModuleCard({
  def,
  stats,
  debil,
  onPractica,
  onExamen,
}: {
  def: CompassModuleDef;
  stats: ReturnType<typeof compassModuleStats>;
  debil: boolean;
  onPractica: () => void;
  onExamen: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "white",
        border: `1px solid ${debil ? ROSE : `${NAVY}14`}`,
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 12px 30px rgba(34,55,92,0.08)" : "0 1px 0 rgba(34,55,92,0.03)",
      }}
    >
      <div
        style={{
          padding: "20px 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: CREAM,
                color: NAVY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon n={def.icon} size={19} />
            </span>
            {debil && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  color: CORAL,
                  background: `${ROSE}44`,
                  padding: "3px 8px",
                  borderRadius: 999,
                }}
              >
                Enfócate aquí
              </span>
            )}
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            {stats.ultimoScore !== null && (
              <>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "1.6rem",
                    color: NAVY,
                  }}
                >
                  {stats.ultimoScore}
                </span>
                <TendenciaChip delta={stats.tendencia} />
              </>
            )}
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "1.3rem",
              color: NAVY,
              lineHeight: 1.1,
            }}
          >
            {def.nombre}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: HAZE,
              marginTop: 4,
            }}
          >
            {def.aptitud}
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", color: `${NAVY}99`, lineHeight: 1.5, margin: 0 }}>
          {def.descripcion}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
          <ChipMini>
            {stats.sesiones} {stats.sesiones === 1 ? "sesión" : "sesiones"}
          </ChipMini>
          {stats.mejorScore !== null && <ChipMini>Mejor {stats.mejorScore}</ChipMini>}
          <ChipMini>Nivel sug. {stats.nivelSugerido}</ChipMini>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 20px 18px" }}>
        <button onClick={onPractica} style={cardBtn(true)}>
          Práctica
        </button>
        <button onClick={onExamen} style={cardBtn(false)}>
          Examen{" "}
          {def.examenItems > 0
            ? `${def.examenItems}/${Math.round(def.examenSec / 60)}′`
            : `${Math.round(def.examenSec / 60)}′`}
        </button>
      </div>
    </div>
  );
}

function cardBtn(primary: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: primary ? "none" : `1px solid ${NAVY}1F`,
    background: primary ? NAVY : "transparent",
    color: primary ? "white" : NAVY,
    fontFamily: MONO,
    fontSize: "0.62rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    minHeight: 40,
  };
}

function CrossLink({
  icon,
  titulo,
  sub,
  to,
}: {
  icon: React.ComponentProps<typeof Icon>["n"];
  titulo: string;
  sub: string;
  to?: string;
}) {
  const inner = (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}12`,
        borderRadius: 14,
        padding: "13px 15px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: to ? 1 : 0.62,
        height: "100%",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: CREAM,
          color: NAVY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon n={icon} size={17} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: NAVY }}>
          {titulo}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "0.78rem",
            color: HAZE,
            marginTop: 1,
          }}
        >
          {sub}
        </span>
      </span>
      {to && (
        <span style={{ marginLeft: "auto", color: `${NAVY}44`, display: "flex", flexShrink: 0 }}>
          <Icon n="chevR" size={16} />
        </span>
      )}
    </div>
  );
  if (!to) return inner;
  return (
    <Link to={to as "/dashboard"} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}

/* ── Briefing ───────────────────────────────────────────────────────── */

function BriefingView({
  def,
  mode,
  nivel,
  setNivel,
  onBack,
  onStart,
}: {
  def: CompassModuleDef;
  mode: CompassMode;
  nivel: number;
  setNivel: (n: number) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const esPractica = mode === "practica";
  return (
    <>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: HAZE,
          fontFamily: MONO,
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon n="chevL" size={14} /> Volver al hub
      </button>
      <CCard style={{ padding: "30px 28px" }}>
        <Eyebrow>
          Briefing · {def.nombre} · {esPractica ? "práctica" : "examen de módulo"}
        </Eyebrow>
        <h2
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "2rem",
            color: NAVY,
            margin: "0 0 10px",
            lineHeight: 1.1,
          }}
        >
          {def.aptitud}
        </h2>
        <p style={{ color: `${NAVY}99`, fontSize: "0.94rem", lineHeight: 1.6, maxWidth: 560 }}>
          {def.descripcion}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            margin: "18px 0",
          }}
        >
          <div
            style={{
              background: CREAM,
              borderRadius: 14,
              padding: "14px 16px",
              border: `1px solid ${NAVY}0F`,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: HAZE,
                marginBottom: 6,
              }}
            >
              En computadora
            </div>
            <div style={{ fontSize: "0.82rem", color: NAVY, lineHeight: 1.5 }}>
              {def.controlesDesktop}
            </div>
          </div>
          <div
            style={{
              background: CREAM,
              borderRadius: 14,
              padding: "14px 16px",
              border: `1px solid ${NAVY}0F`,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: HAZE,
                marginBottom: 6,
              }}
            >
              En móvil
            </div>
            <div style={{ fontSize: "0.82rem", color: NAVY, lineHeight: 1.5 }}>
              {def.controlesMovil}
            </div>
          </div>
        </div>

        <div
          style={{
            background: `${ROSE}22`,
            border: `1px solid ${ROSE}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.58rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: CORAL,
              marginBottom: 8,
            }}
          >
            Errores que cuestan puntos
          </div>
          <ul
            style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {def.erroresComunes.map((e) => (
              <li key={e} style={{ fontSize: "0.82rem", color: NAVY, lineHeight: 1.5 }}>
                {e}
              </li>
            ))}
          </ul>
        </div>

        {esPractica ? (
          <div style={{ marginBottom: 20 }}>
            <Eyebrow>Nivel de dificultad</Eyebrow>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNivel(n)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    border: `1px solid ${n === nivel ? "transparent" : `${NAVY}1F`}`,
                    background: n === nivel ? NAVY : "transparent",
                    color: n === nivel ? "white" : NAVY,
                    fontFamily: MONO,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "0.74rem", color: HAZE, marginTop: 8 }}>
              {def.practicaItems > 0
                ? `Bloque de ${def.practicaItems} reactivos con feedback inmediato.`
                : `Bloque continuo de ${fmtDur(def.practicaSec)} con feedback al final.`}
            </div>
          </div>
        ) : (
          <div
            style={{
              marginBottom: 20,
              fontSize: "0.82rem",
              color: NAVY,
              background: CREAM,
              borderRadius: 14,
              padding: "12px 16px",
              border: `1px solid ${NAVY}0F`,
              lineHeight: 1.55,
            }}
          >
            Formato fijo de referencia:{" "}
            <strong>
              {def.examenItems > 0
                ? `${def.examenItems} reactivos en ${Math.round(def.examenSec / 60)} minutos`
                : `${Math.round(def.examenSec / 60)} minutos continuos`}
            </strong>{" "}
            al nivel {def.examenNivel}, sin feedback durante la prueba. Busca un lugar sin
            interrupciones.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <CButton variant="ghost" onClick={onBack}>
            Cancelar
          </CButton>
          <CButton onClick={onStart}>{esPractica ? "Empezar práctica" : "Empezar examen"}</CButton>
        </div>
      </CCard>
    </>
  );
}

/* ── Debrief ────────────────────────────────────────────────────────── */

function DebriefView({
  record,
  tendencia,
  onRepeat,
  onHub,
}: {
  record: CompassSessionRecord;
  tendencia: number | null;
  onRepeat: () => void;
  onHub: () => void;
}) {
  const def = COMPASS_MODULE_MAP[record.moduleId];
  return (
    <>
      <CCard style={{ padding: "30px 28px", marginBottom: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <ScoreRing score={record.score} />
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <Eyebrow>
              Debrief · {def.nombre} · {MODO_LABEL[record.mode]} · Nivel {record.level}
            </Eyebrow>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.7rem",
                color: NAVY,
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              {record.score >= 75
                ? "Sesión sólida, en ruta."
                : record.score >= 45
                  ? "Base estable, hay margen claro."
                  : "Sesión de aprendizaje: aquí está el mapa."}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <ChipMini>{record.input}</ChipMini>
              <ChipMini>{fmtDur(record.durationSec)}</ChipMini>
              {tendencia !== null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <TendenciaChip delta={tendencia} />
                  <span style={{ fontSize: "0.7rem", color: HAZE }}>vs tus 3 sesiones previas</span>
                </span>
              )}
              {record.interruptions > 0 && (
                <ChipMini tono="alerta">
                  {record.interruptions}{" "}
                  {record.interruptions === 1 ? "interrupción" : "interrupciones"}
                </ChipMini>
              )}
            </div>
          </div>
        </div>
      </CCard>

      <CCard style={{ padding: "24px 26px", marginBottom: 14 }}>
        <Eyebrow>Qué se midió</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 10,
          }}
        >
          {record.metrics.map((m) => (
            <MetricChip key={m.key} m={m} />
          ))}
        </div>
      </CCard>

      <CCard style={{ padding: "22px 26px", marginBottom: 18, borderLeft: `3px solid ${CORAL}` }}>
        <Eyebrow style={{ color: CORAL }}>Siguiente paso</Eyebrow>
        <p style={{ margin: 0, fontSize: "0.94rem", color: NAVY, lineHeight: 1.6 }}>
          {record.advice}
        </p>
      </CCard>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <CButton variant="ghost" onClick={onHub}>
          Volver al hub
        </CButton>
        <CButton onClick={onRepeat}>Repetir sesión</CButton>
      </div>
    </>
  );
}

/* ── Simulacro ──────────────────────────────────────────────────────── */

function SimIntroView({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: HAZE,
          fontFamily: MONO,
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon n="chevL" size={14} /> Volver al hub
      </button>
      <CCard style={{ padding: "30px 28px" }}>
        <Eyebrow>Simulacro compacto · ~{SIMULACRO_MIN_APROX} minutos</Eyebrow>
        <h2
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "2rem",
            color: NAVY,
            margin: "0 0 10px",
            lineHeight: 1.1,
          }}
        >
          Los seis módulos, <em style={{ color: CORAL }}>sin descanso</em>
        </h2>
        <p style={{ color: `${NAVY}99`, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 560 }}>
          La secuencia corre completa y el debrief llega hasta el final, como en un proceso real.
          Cada módulo guarda su sesión y actualiza tu perfil. Si sales a la mitad, el simulacro se
          cancela.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "18px 0 22px" }}>
          {SIMULACRO_COMPACTO.map((b, i) => {
            const def = COMPASS_MODULE_MAP[b.moduleId];
            return (
              <div
                key={b.moduleId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: CREAM,
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: `1px solid ${NAVY}0C`,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: HAZE,
                    width: 18,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: "flex", color: NAVY }}>
                  <Icon n={def.icon} size={16} />
                </span>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: "0.85rem", flex: 1 }}>
                  {def.nombre}
                </span>
                <span style={{ fontFamily: MONO, fontSize: "0.64rem", color: HAZE }}>
                  {b.items > 0 ? `${b.items} reactivos` : fmtDur(b.durationSec)}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <CButton variant="ghost" onClick={onBack}>
            Cancelar
          </CButton>
          <CButton onClick={onStart}>Despegar</CButton>
        </div>
      </CCard>
    </>
  );
}

function SimFinalView({ records, onHub }: { records: CompassSessionRecord[]; onHub: () => void }) {
  const promedio = Math.round(
    records.reduce((a, r) => a + r.score, 0) / Math.max(1, records.length),
  );
  const scores = useMemo(() => {
    const out = {} as Record<CompassModuleId, number | null>;
    COMPASS_MODULES.forEach((m) => {
      out[m.id] = records.find((r) => r.moduleId === m.id)?.score ?? null;
    });
    return out;
  }, [records]);
  const peor = [...records].sort((a, b) => a.score - b.score)[0];

  return (
    <>
      <CCard style={{ padding: "30px 28px", marginBottom: 14 }}>
        <div
          className="fp-simfinal"
          style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}
        >
          <ScoreRing score={promedio} size={168} label="Promedio" />
          <div style={{ flex: "1 1 240px" }}>
            <Eyebrow>Simulacro completado · perfil integral</Eyebrow>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.9rem",
                color: NAVY,
                lineHeight: 1.12,
                marginBottom: 10,
              }}
            >
              Así rinde tu batería completa hoy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {records.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.64rem",
                      fontWeight: 700,
                      color: HAZE,
                      width: 92,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {COMPASS_MODULE_MAP[r.moduleId].nombre}
                  </span>
                  <div style={{ flex: 1, height: 4, background: SALMON, borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${r.score}%`,
                        height: "100%",
                        background: r.score >= 75 ? "#12B26B" : r.score >= 45 ? NAVY : "#C24545",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: "1rem",
                      color: NAVY,
                      width: 30,
                      textAlign: "right",
                    }}
                  >
                    {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 1 280px", minWidth: 240 }}>
            <RadarChart scores={scores} size={280} />
          </div>
        </div>
      </CCard>

      {peor && (
        <CCard style={{ padding: "22px 26px", marginBottom: 18, borderLeft: `3px solid ${CORAL}` }}>
          <Eyebrow style={{ color: CORAL }}>Tu siguiente sesión</Eyebrow>
          <p style={{ margin: 0, fontSize: "0.94rem", color: NAVY, lineHeight: 1.6 }}>
            El módulo que más te costó fue{" "}
            <strong>{COMPASS_MODULE_MAP[peor.moduleId].nombre}</strong> ({peor.score}).{" "}
            {peor.advice}
          </p>
        </CCard>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CButton onClick={onHub}>Volver al hub</CButton>
      </div>
    </>
  );
}
