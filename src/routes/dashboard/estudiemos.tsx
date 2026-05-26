import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PathySVG, pad, TECH_DATA } from "../../contexts/StudyTimerContext";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: EstudemosJuntosPage,
});

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type ExamPhase = "sin_definir" | "fase1" | "fase2" | "fase3" | "fase4" | "fase5";
type PrepLevel = "base" | "consolidando" | "listo_sim" | "listo_examen";
type RecoType =
  | "materia" | "cuestionario" | "flashcards"
  | "sim_parcial" | "sim_completo"
  | "recuperacion" | "repaso_final" | "resistencia";
type FlowStep = "home" | "preview" | "sesion" | "completado";
type ActivityType = "calentamiento" | "vuelo" | "descanso" | "debriefing";
type ActivitySubtype = "contenido" | "flashcards" | "ciaac" | "explicaselo" | "descarga";

interface MateriaData {
  slug: string; name: string; icon: string;
  pct: number; avg: number; lastStudied: Date | null;
}
interface SimuladorData {
  fecha: Date; score: number; completed: boolean; duracionMin: number;
}
interface StudentProfile {
  name: string;
  materias: MateriaData[];
  clases: { vistas: number; total: number };
  flashcards: { done: number; total: number };
  cuestionarios: { done: number; avgScore: number };
  simuladores: SimuladorData[];
}
interface TechLabel { name: string; icon: string; desc: string; }
interface Recommendation {
  type: RecoType; subject?: MateriaData;
  title: string; pathyMessage: string; reason: string;
  durationMin: number; urgency: "alta" | "media" | "baja";
}
interface MissionActivity {
  id: string; type: ActivityType; subtype?: ActivitySubtype;
  duration: number; title: string; desc: string;
  icon: string; pathyMsg: string; technique?: TechLabel;
}

/* ══════════════════════════════════════════════════════════
   MOCK PROFILE  (mirrors future Supabase schema)
══════════════════════════════════════════════════════════ */
const ago = (n: number): Date => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const MOCK_PROFILE: StudentProfile = {
  name: "María",
  materias: [
    { slug: "aerodinamica",       name: "Aerodinámica",                icon: "✈️", pct: 78, avg: 81, lastStudied: ago(1)  },
    { slug: "aeronaves-motores",  name: "Aeronaves y Motores",         icon: "⚙️", pct: 55, avg: 70, lastStudied: ago(3)  },
    { slug: "legislacion",        name: "Legislación Aeronáutica",     icon: "⚖️", pct: 90, avg: 88, lastStudied: ago(2)  },
    { slug: "medicina",           name: "Medicina de Aviación",        icon: "🏥", pct: 40, avg: 62, lastStudied: ago(9)  },
    { slug: "meteorologia",       name: "Meteorología",                icon: "🌤️", pct: 25, avg: 58, lastStudied: ago(8)  },
    { slug: "navegacion",         name: "Navegación Aérea",            icon: "🗺️", pct: 60, avg: 74, lastStudied: ago(4)  },
    { slug: "operaciones",        name: "Operaciones Aeronáuticas",    icon: "🛫", pct: 15, avg: 50, lastStudied: ago(14) },
    { slug: "comunicaciones",     name: "Comunicaciones",              icon: "📻", pct: 0,  avg: 0,  lastStudied: null    },
    { slug: "manuales-ais",       name: "Manuales AIS",                icon: "📋", pct: 0,  avg: 0,  lastStudied: null    },
    { slug: "servicios-transito", name: "Servicios de Tránsito",       icon: "🗼", pct: 0,  avg: 0,  lastStudied: null    },
    { slug: "factores-humanos",   name: "Factores Humanos",            icon: "🧠", pct: 0,  avg: 0,  lastStudied: null    },
    { slug: "seguridad-aerea",    name: "Seguridad Aérea",             icon: "🛡️", pct: 0,  avg: 0,  lastStudied: null    },
  ],
  clases: { vistas: 18, total: 48 },
  flashcards: { done: 120, total: 310 },
  cuestionarios: { done: 8, avgScore: 68 },
  simuladores: [{ fecha: ago(5), score: 63, completed: true, duracionMin: 280 }],
};

/* ── Activity content (swap for Supabase in V2) ── */
const FLASHCARDS = [
  { q: "¿Cuál es la clasificación de nubes altas según la OACI?",  a: "Cirrus (Ci), Cirrocumulus (Cc) y Cirrostratus (Cs). Se forman por encima de los 6,000 m en latitudes medias." },
  { q: "¿Qué es un METAR y con qué frecuencia se emite?",          a: "Mensaje de Observación Meteorológica de Aeródromo. Se emite cada 30 minutos (horarios :20 y :50 UTC en México)." },
  { q: "¿Qué fenómeno indica TS en un TAF?",                       a: "Tormenta eléctrica (Thunderstorm). Implica condiciones IMC severas: turbulencia, granizo, cizalladura y visibilidad reducida." },
  { q: "¿Qué es la inversión de temperatura?",                     a: "Condición en la que la temperatura aumenta con la altitud. Favorece niebla, smog y acumulación de contaminantes." },
  { q: "Define CAVOK y sus condiciones.",                           a: "Ceiling And Visibility OK. Visibilidad ≥10 km, sin nubes debajo de 5,000 ft, sin CB y sin fenómenos significativos." },
];
const CIAAC_QUESTIONS = [
  { q: "Un piloto observa cumulonimbus con cimas que superan los 40,000 ft. ¿Cuál es la acción MÁS SEGURA?", opts: ["Sobrevolar el CB a 1,000 ft por encima de la cima", "Rodear el CB a una distancia mínima de 20 NM", "Atravesar la base del CB a velocidad reducida", "Descender bajo la base del CB para evitar granizo"], correct: 1, exp: "Los cumulonimbus deben rodearse a mínimo 20 NM. Sobrevolarlos es imposible para la mayoría de aeronaves de aviación general." },
  { q: "¿Qué condiciones favorecen la formación de niebla por radiación?", opts: ["Viento fuerte, cielo despejado y alta humedad", "Viento en calma, cielo despejado, alta humedad y superficie fría", "Frente cálido activo con lluvias moderadas", "Inversión de temperatura en los niveles medios"], correct: 1, exp: "La niebla por radiación se forma con cielo despejado, viento en calma, alta humedad y superficie fría. El viento la disipa." },
  { q: "¿Qué indica una presión QNH de 1013 hPa en el altímetro?", opts: ["El avión está en la altitud de presión estándar", "La presión al nivel del aeródromo es estándar ISA", "La presión al nivel del mar coincide con ISA", "El QNH es siempre igual al QFE"], correct: 2, exp: "QNH es la presión ajustada al nivel del mar. Cuando es 1013 hPa coincide con la atmósfera estándar ISA." },
];
const PATHY_QUESTIONS = [
  "Bien, empecemos. ¿Qué es exactamente un frente frío? Descríbelo con tus propias palabras.",
  "¿Qué nubes y fenómenos meteorológicos PRECEDEN al paso de un frente frío?",
  "¿Qué pasa DESPUÉS de que el frente cruzó el aeródromo? ¿Cómo cambian el viento, temperatura y visibilidad?",
  "Último reto: si ves en un TAF 'BECMG FM1200 VRB05KT TSRA BKN015CB', ¿qué le dirías al comandante?",
];

/* ══════════════════════════════════════════════════════════
   ENGINE — Pure functions (V2: swap for AI/FSRS)
══════════════════════════════════════════════════════════ */
function daysSince(date: Date | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}
function eAvgPct(p: StudentProfile)   { return p.materias.reduce((s, m) => s + m.pct, 0) / p.materias.length; }
function eAvgScore(p: StudentProfile) { const a = p.materias.filter(m => m.avg > 0); return a.length ? a.reduce((s, m) => s + m.avg, 0) / a.length : 0; }
function eClasesPct(p: StudentProfile){ return (p.clases.vistas / p.clases.total) * 100; }
function eFlashPct(p: StudentProfile) { return (p.flashcards.done / p.flashcards.total) * 100; }
function eSimFactor(p: StudentProfile){ return Math.min(100, p.simuladores.filter(s => s.completed).length * 25); }

// Composite CIAAC readiness (0–100)
function computeRuta(p: StudentProfile): number {
  return (
    eAvgPct(p)   * 0.35 +
    eClasesPct(p)* 0.20 +
    p.cuestionarios.avgScore * 0.20 +
    eFlashPct(p) * 0.15 +
    eSimFactor(p)* 0.10
  );
}
function getPrepLevel(p: StudentProfile): PrepLevel {
  const r = computeRuta(p), sims = p.simuladores.filter(s => s.completed).length;
  if (r >= 75 && sims >= 2) return "listo_examen";
  if (r >= 55 && eAvgScore(p) >= 70) return "listo_sim";
  if (r >= 28) return "consolidando";
  return "base";
}
function lastSim(p: StudentProfile): SimuladorData | null {
  if (!p.simuladores.length) return null;
  return [...p.simuladores].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0];
}
function canFullSim(p: StudentProfile, phase: ExamPhase): boolean {
  if (phase === "fase1" || phase === "fase2" || phase === "fase5") return false;
  if (eAvgPct(p) < 70 || eAvgScore(p) < 70) return false;
  const ls = lastSim(p);
  return !(ls && daysSince(ls.fecha) < 7);
}

function getRecommendation(p: StudentProfile, phase: ExamPhase): Recommendation {
  const ls = lastSim(p);

  if (phase === "fase5") return {
    type: "repaso_final", title: "Repaso Final Pre-Examen",
    pathyMessage: "Piloto, faltan menos de 3 días para tu CIAAC. Sin aprendizaje nuevo. Solo consolidamos lo que ya sabes y descansamos bien.",
    reason: "Modo pre-examen activado", durationMin: 45, urgency: "alta",
  };

  if (ls && daysSince(ls.fecha) < 3) {
    const weak = [...p.materias].filter(m => m.pct > 0).sort((a, b) => a.avg - b.avg)[0];
    return {
      type: "recuperacion", subject: weak,
      title: `Misión de recuperación — ${weak?.name ?? "Materias débiles"}`,
      pathyMessage: `Piloto, completaste tu simulador con ${ls.score}%. Todavía no recomiendo otro. Primero revisemos los errores detectados — detecté debilidad en ${weak?.name ?? "varias materias"}.`,
      reason: `Post-simulador (${ls.score}%) · hace ${daysSince(ls.fecha)} día${daysSince(ls.fecha) !== 1 ? "s" : ""}`,
      durationMin: 60, urgency: "alta",
    };
  }

  const abandoned = p.materias
    .filter(m => m.pct > 0 && daysSince(m.lastStudied) >= 7)
    .sort((a, b) => daysSince(b.lastStudied) - daysSince(a.lastStudied))[0];
  if (abandoned) return {
    type: "materia", subject: abandoned,
    title: `Sesión de recuperación — ${abandoned.name}`,
    pathyMessage: `Piloto, llevas ${daysSince(abandoned.lastStudied)} días sin estudiar ${abandoned.name}. La memoria se desvanece sin repaso activo. Hoy volvemos a ella.`,
    reason: `Sin estudiar por ${daysSince(abandoned.lastStudied)} días`,
    durationMin: 55, urgency: "alta",
  };

  const weakM = p.materias.filter(m => m.pct < 50).sort((a, b) => a.pct - b.pct)[0];
  if (weakM) return {
    type: "materia", subject: weakM,
    title: weakM.pct === 0 ? `Comenzar ${weakM.name}` : `Avanzar en ${weakM.name}`,
    pathyMessage: weakM.pct === 0
      ? `Piloto, todavía no has iniciado ${weakM.name}. Esta materia tiene peso en el CIAAC. Hoy damos el primer vuelo.`
      : `Piloto, ${weakM.name} está al ${weakM.pct}% — necesita más atención para llegar preparado al CIAAC.`,
    reason: weakM.pct === 0 ? "Materia sin iniciar" : `${weakM.pct}% completado`,
    durationMin: 55, urgency: weakM.pct === 0 ? "alta" : "media",
  };

  if (phase === "fase4") {
    if (canFullSim(p, phase)) return {
      type: "sim_completo", title: "Simulador CIAAC Completo",
      pathyMessage: "Piloto, ya estás listo para un simulador CIAAC completo. 310 preguntas, 5 horas, sin pausas. Lo más parecido al examen real.",
      reason: "Fase 4: entrenar el examen", durationMin: 300, urgency: "alta",
    };
    return {
      type: "cuestionario", title: "Cuestionario Intensivo Mixto",
      pathyMessage: "Piloto, en estas últimas semanas cada pregunta cuenta. Hoy hacemos un cuestionario mixto focalizando tus áreas más débiles.",
      reason: "Fase 4: repaso dirigido", durationMin: 65, urgency: "media",
    };
  }

  if (phase === "fase3") {
    if (!p.simuladores.length && eAvgScore(p) >= 65) return {
      type: "sim_parcial", title: "Primer Simulador Parcial",
      pathyMessage: "Piloto, ya estás listo para tu primer simulador parcial. Es momento de medirte y ver dónde estás.",
      reason: "Fase 3: es momento de medirse", durationMin: 80, urgency: "media",
    };
    return {
      type: "cuestionario", title: "Cuestionario de Consolidación",
      pathyMessage: "Piloto, en esta fase consolidamos con cuestionarios mixtos para identificar tus áreas de mejora antes de los simuladores.",
      reason: "Fase 3: consolidación", durationMin: 60, urgency: "media",
    };
  }

  const ap = eAvgPct(p), as_ = eAvgScore(p);
  if (as_ >= 70 && ap >= 55) {
    const toConsolidate = p.materias.find(m => m.pct > 50 && m.avg < 75);
    if (toConsolidate) return {
      type: "flashcards", subject: toConsolidate,
      title: `Consolidar ${toConsolidate.name} con Flashcards`,
      pathyMessage: `Piloto, ${toConsolidate.name} tiene buen avance pero el promedio de ${Math.round(toConsolidate.avg)}% puede mejorar. Las flashcards son la herramienta ideal ahora.`,
      reason: `${Math.round(toConsolidate.avg)}% de aciertos — puede mejorar`, durationMin: 45, urgency: "media",
    };
  }

  if (ap >= 60 && as_ >= 65) return {
    type: "resistencia", title: "Sesión de Resistencia Mental",
    pathyMessage: "Piloto, tu base académica va bien. Hoy entrenamos resistencia: mantener foco durante horas es tan importante como el conocimiento en el CIAAC.",
    reason: "Base sólida — momento de entrenar resistencia", durationMin: 90, urgency: "baja",
  };

  const next = [...p.materias].sort((a, b) => a.pct - b.pct)[0];
  return {
    type: "materia", subject: next,
    title: `Estudiar ${next.name}`,
    pathyMessage: `Piloto, la prioridad es completar las materias. ${next.pct === 0 ? `${next.name} todavía no ha sido iniciada.` : `${next.name} necesita más progreso.`} Aprendamos juntos.`,
    reason: next.pct === 0 ? "Materia sin iniciar" : `${next.pct}% completado`,
    durationMin: 50, urgency: next.pct === 0 ? "alta" : "media",
  };
}

/* ── Study techniques as secondary tools ── */
const TECH: Record<string, TechLabel> = {
  libre:    { name: TECH_DATA[5].title, icon: TECH_DATA[5].icon, desc: "Volcado libre sin restricciones" },
  lectura:  { name: TECH_DATA[4].title, icon: TECH_DATA[4].icon, desc: "Lectura activa con pausas de síntesis" },
  flash:    { name: TECH_DATA[3].title, icon: TECH_DATA[3].icon, desc: "Sprint de recuperación activa" },
  ultra:    { name: TECH_DATA[2].title, icon: TECH_DATA[2].icon, desc: "Bloque de foco profundo 90 min" },
  pomodoro: { name: TECH_DATA[0].title, icon: TECH_DATA[0].icon, desc: "25 min foco + descanso activo" },
  fiftytwo: { name: TECH_DATA[1].title, icon: TECH_DATA[1].icon, desc: "52 min trabajo + 17 pausa profunda" },
};

function mkA(
  type: ActivityType, sub: ActivitySubtype | undefined,
  dur: number, title: string, desc: string,
  icon: string, msg: string, tech?: TechLabel
): MissionActivity {
  return { id: `${type}-${sub ?? "x"}-${Math.random().toString(36).slice(2)}`, type, subtype: sub, duration: dur, title, desc, icon, pathyMsg: msg, technique: tech };
}

function buildMission(rec: Recommendation): MissionActivity[] {
  const sn = rec.subject?.name ?? "la materia";
  switch (rec.type) {
    case "repaso_final": return [
      mkA("calentamiento","descarga",10,"Activación Mental","Escribe todo lo que recuerdas de tus temas más difíciles. Sin mirar nada.","🧠","Últimos días antes del CIAAC. Solo activamos lo que ya tienes dentro.",TECH.libre),
      mkA("vuelo","flashcards",20,"Flashcards Esenciales","Repasa los conceptos clave. Solo lo que ya sabes.","🃏","Nada nuevo. Solo reafirmamos lo consolidado.",TECH.flash),
      mkA("descanso",undefined,5,"Escala","Descansa. Confía en lo que estudiaste.","✈️","5 minutos de pausa real."),
      mkA("vuelo","ciaac",10,"10 Preguntas Clave","Solo tus temas más débiles. Para confirmar que ya los dominas.","✈️","Sin estrés. Estas preguntas son para confirmar.",TECH.pomodoro),
      mkA("debriefing",undefined,5,"Cierre Pre-Examen","¿Qué llevas mañana? Escribe tus 3 puntos más sólidos.","📋","Cierra con confianza. Ya hiciste el trabajo."),
    ];
    case "recuperacion": return [
      mkA("calentamiento","descarga",10,"Análisis del Simulador","Escribe qué recuerdas del simulador y qué sientes que falló.","🧠",`Tu simulador mostró áreas de mejora en ${sn}. Reconócelas sin juzgarte.`,TECH.libre),
      mkA("vuelo","contenido",20,`Revisión — ${sn}`,`Repasa el material clave de ${sn} que falló en el simulador.`,"📖","Lectura dirigida. No es volver a empezar — es reforzar los puntos específicos.",TECH.lectura),
      mkA("descanso",undefined,5,"Escala","Pausa activa antes del cuestionario.","✈️","Descansa. El siguiente bloque es activo."),
      mkA("vuelo","ciaac",20,`Cuestionario — ${sn}`,`Preguntas focalizadas en ${sn}.`,"✈️","Modo corrección. Cada error que enfrentas hoy es uno menos en el examen.",TECH.ultra),
      mkA("vuelo","flashcards",15,"Flashcards de Refuerzo","Consolida los conceptos con tarjetas.","🃏","La recuperación activa es la herramienta más poderosa para corregir errores.",TECH.flash),
      mkA("debriefing",undefined,10,"Plan de Recuperación","¿Qué entendí diferente hoy? ¿Qué quedó más claro?","📋","¿Cuánto avanzaste en la recuperación? Sé honesto."),
    ];
    case "sim_completo": return [
      mkA("calentamiento","descarga",20,"Preparación Mental CIAAC","Activa todo tu conocimiento. 20 minutos de volcado mental.","🧠","Modo CIAAC. 300 minutos de entrenamiento comienzan aquí.",TECH.libre),
      mkA("vuelo","contenido",40,"Repaso General","Repasa tus apuntes de las materias clave.","📖","Último repaso antes del simulacro. Lectura activa con pausas cada 15 min.",TECH.lectura),
      mkA("descanso",undefined,15,"Escala 1 — 15 min","Sal a caminar. No toques el celular.","✈️","El CIAAC real no tiene esta pausa — aquí sí la tienes."),
      mkA("vuelo","ciaac",50,"Bloque CIAAC","Simulacro de preguntas tipo examen real.","✈️","Condiciones de examen. Una sola oportunidad por pregunta.",TECH.ultra),
      mkA("descanso",undefined,15,"Escala 2","Pausa larga. Come algo ligero.","✈️","Tu glucosa cerebral necesita reponerse."),
      mkA("vuelo","flashcards",30,"Flashcards Intensivas","Recuperación activa de conceptos.","🃏","El conocimiento se consolida con recuperación activa.",TECH.flash),
      mkA("descanso",undefined,15,"Escala 3","Último descanso antes del debriefing.","✈️","Queda lo más valioso: el análisis."),
      mkA("vuelo","explicaselo",30,"Explícaselo a Pathy","Enséñame lo que aprendiste hoy. Yo pregunto.","🤖","Si puedes explicarlo, lo sabes. Esta es la prueba final.",TECH.fiftytwo),
      mkA("debriefing",undefined,25,"Debriefing CIAAC Completo","Análisis: fortalezas, debilidades, plan de mañana.","📋","El simulador más valioso termina con el análisis más profundo."),
    ];
    case "sim_parcial": return [
      mkA("calentamiento","descarga",10,"Pre-Simulador","Activa tu conocimiento de tus materias más avanzadas.","🧠","Primer simulador parcial. Mide dónde estás sin juzgarte.",TECH.libre),
      mkA("vuelo","ciaac",30,"Simulacro Parcial","Preguntas tipo CIAAC de tus materias más avanzadas.","✈️","Condiciones de simulacro. Descubre tus puntos de mejora.",TECH.ultra),
      mkA("descanso",undefined,10,"Escala","Procesa los resultados. Pausa activa.","✈️","Respira antes de la revisión."),
      mkA("vuelo","flashcards",20,"Refuerzo Post-Simulacro","Consolida los conceptos que fallaron.","🃏","La recuperación activa después del simulacro potencia el aprendizaje.",TECH.flash),
      mkA("debriefing",undefined,10,"Análisis de Resultados","¿Qué aprendí? ¿Qué materia necesita más trabajo?","📋","Tu primer análisis post-simulacro. El más valioso."),
    ];
    case "flashcards": return [
      mkA("calentamiento","descarga",8,"Activación Rápida",`¿Qué recuerdas de ${sn}? Escríbelo antes de empezar.`,"🧠","Rápido calentamiento. Activa lo que ya sabes antes de las tarjetas.",TECH.libre),
      mkA("vuelo","flashcards",25,"Flashcards — Primera Ronda",`Tarjetas de ${sn}. Intenta recordar antes de revelar.`,"🃏","La recuperación activa es la técnica #1 para el CIAAC.",TECH.flash),
      mkA("descanso",undefined,5,"Escala","Pausa breve.","✈️","Tu cerebro consolida durante el descanso."),
      mkA("vuelo","flashcards",20,"Segunda Ronda","Las que te costaron en la primera ronda.","🃏","El esfuerzo es donde se forma la memoria.",TECH.flash),
      mkA("debriefing",undefined,7,"Cierre","¿Qué tarjetas dominé? ¿Cuáles debo repetir?","📋","¿Qué va a la bitácora?"),
    ];
    case "resistencia": return [
      mkA("calentamiento","descarga",15,"Descarga de Cabina","Escribe sin parar por 15 minutos todo lo que sabes.","🧠","Sesión de resistencia. El CIAAC dura 5 horas — entrenamos para eso.",TECH.libre),
      mkA("vuelo","contenido",30,"Bloque de Contenido","Lectura activa profunda de tus materias más débiles.","📖","Primer bloque largo. Pausa cada 15 min para sintetizar.",TECH.fiftytwo),
      mkA("descanso",undefined,10,"Escala 1","10 minutos reales. Levántate y camina.","✈️","Escala activa. El movimiento consolida la memoria."),
      mkA("vuelo","ciaac",25,"Cuestionario Mixto","Preguntas de distintas materias. Condiciones de examen.","✈️","Mezcla de materias — igual que el CIAAC real.",TECH.ultra),
      mkA("descanso",undefined,10,"Escala 2","Segunda pausa activa.","✈️","Resiste la incomodidad — es parte del entrenamiento."),
      mkA("vuelo","explicaselo",20,"Explícaselo a Pathy","Enséñame el concepto que más te costó hoy.","🤖","Enseñar es la prueba definitiva.",TECH.pomodoro),
      mkA("debriefing",undefined,10,"Debriefing de Resistencia","¿Cuánto tiempo mantuve el foco? ¿Cuándo empecé a dispersarme?","📋","La conciencia de tu resistencia es clave para mejorarla."),
    ];
    case "cuestionario": return [
      mkA("calentamiento","descarga",10,"Descarga de Cabina",`Escribe todo lo que sabes de ${sn} antes de empezar.`,"🧠","Activamos la memoria antes de las preguntas.",TECH.libre),
      mkA("vuelo","ciaac",25,`Cuestionario — ${sn}`,"Preguntas tipo CIAAC. Una oportunidad por pregunta.","✈️","Modo cuestionario. Confía en lo que estudiaste.",TECH.ultra),
      mkA("descanso",undefined,5,"Escala","Respira antes de la segunda vuelta.","✈️","Pausa activa."),
      mkA("vuelo","ciaac",15,"Segunda Vuelta","Preguntas enfocadas en los conceptos que fallaron.","✈️","Los errores son información, no fracasos.",TECH.pomodoro),
      mkA("debriefing",undefined,10,"Análisis","¿Qué patrones de error veo? ¿Qué necesito repasar?","📋","El cuestionario sin análisis es la mitad del trabajo."),
    ];
    case "materia":
    default: return [
      mkA("calentamiento","descarga",10,"Descarga de Cabina",`¿Qué ya sabes de ${sn}? Escríbelo todo sin filtro.`,"🧠",`Antes de estudiar ${sn}, activa lo que ya tienes en la cabeza.`,TECH.libre),
      mkA("vuelo","contenido",25,`Estudio — ${sn}`,`Lee activamente el material de ${sn}. Pausa cada 10 min para resumir.`,"📖","Lectura activa: pausa, resume, conecta. No leer para pasar el ojo — leer para retener.",TECH.lectura),
      mkA("descanso",undefined,5,"Escala Técnica","Levántate, toma agua, respira.","✈️","Tu cerebro consolida lo que acaba de absorber. Honra la pausa."),
      mkA("vuelo","flashcards",15,"Flashcards",`Tarjetas clave de ${sn}.`,"🃏","Recuperación activa. La tensión de no saber la respuesta es donde se forma la memoria.",TECH.flash),
      mkA("debriefing",undefined,10,"Debriefing","¿Qué aprendí? ¿Qué fue difícil? ¿Qué repaso mañana?","📋","Aterriza el vuelo de hoy. Esto va a tu bitácora."),
    ];
  }
}

/* ── UI constants ── */
const PREP_INFO: Record<PrepLevel, { dot: string; label: string; color: string; bg: string; border: string }> = {
  base:         { dot: "🔴", label: "Construyendo Base",       color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
  consolidando: { dot: "🟡", label: "Consolidando",            color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
  listo_sim:    { dot: "🟢", label: "Listo para Simuladores",  color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  listo_examen: { dot: "✈️", label: "Listo para Presentar",    color: "#3D5D91", bg: "#e8eef7", border: "#93c5fd" },
};
const EXAM_OPTS: { value: ExamPhase; label: string; desc: string }[] = [
  { value: "sin_definir", label: "No definida",        desc: "Recomendaciones basadas en tu progreso" },
  { value: "fase1",       label: "Más de 8 semanas",   desc: "Foco total en aprender materias" },
  { value: "fase2",       label: "4 a 8 semanas",      desc: "Consolidar y practicar" },
  { value: "fase3",       label: "2 a 4 semanas",      desc: "Medirse con simuladores" },
  { value: "fase4",       label: "Menos de 2 semanas", desc: "Entrenar el examen real" },
  { value: "fase5",       label: "Últimos 3 días",     desc: "Solo repaso y descanso" },
];
function actColor(a: MissionActivity): string {
  if (a.type === "calentamiento") return "#b45309";
  if (a.type === "debriefing")    return "#7c3aed";
  if (a.type === "descanso")      return "#059669";
  if (a.subtype === "ciaac")      return "#d97706";
  if (a.subtype === "explicaselo")return "#3D5D91";
  if (a.subtype === "flashcards") return "#db2777";
  return "#3D5D91";
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
function EstudemosJuntosPage() {
  const profile = MOCK_PROFILE;

  const [examPhase, setExamPhase] = useState<ExamPhase>("sin_definir");
  useEffect(() => {
    const stored = localStorage.getItem("fp_exam_phase") as ExamPhase | null;
    if (stored) setExamPhase(stored);
  }, []);
  const updatePhase = (p: ExamPhase) => { setExamPhase(p); localStorage.setItem("fp_exam_phase", p); };

  const rec = getRecommendation(profile, examPhase);
  const prepLevel = getPrepLevel(profile);

  const [flowStep, setFlowStep] = useState<FlowStep>("home");
  const [mission, setMission]   = useState<MissionActivity[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  const [actIdx, setActIdx]     = useState(0);
  const [actSecs, setActSecs]   = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const totalElapsedRef = useRef(0);
  const actTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef      = useRef<HTMLDivElement | null>(null);

  const [dcText, setDcText]           = useState("");
  const [fcIdx, setFcIdx]             = useState(0);
  const [fcFlipped, setFcFlipped]     = useState(false);
  const [fcCorrect, setFcCorrect]     = useState<boolean[]>([]);
  const [ciaacQ, setCiaacQ]           = useState(0);
  const [ciaacAnswer, setCiaacAnswer] = useState<number | null>(null);
  const [ciaacResults, setCiaacResults] = useState<{ correct: boolean }[]>([]);
  const [pathyStep, setPathyStep]     = useState(0);
  const [pathyInput, setPathyInput]   = useState("");
  const [pathyResponses, setPathyResponses] = useState<string[]>([]);
  const [debriefing, setDebriefing]   = useState({ aprendiste: "", dificil: "", repasar: "" });
  const [showFatigue, setShowFatigue] = useState(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (flowStep !== "sesion") return;
    const iv = setInterval(() => {
      if ((Date.now() - lastActivityRef.current) / 1000 > 300 && !isPaused) setShowFatigue(true);
    }, 30_000);
    return () => clearInterval(iv);
  }, [flowStep, isPaused]);

  useEffect(() => {
    if (flowStep !== "sesion" || isPaused) {
      clearInterval(actTimerRef.current!); actTimerRef.current = null; return;
    }
    actTimerRef.current = setInterval(() => {
      setActSecs(s => s + 1);
      totalElapsedRef.current += 1;
      setTotalElapsed(totalElapsedRef.current);
    }, 1000);
    return () => clearInterval(actTimerRef.current!);
  }, [flowStep, isPaused, actIdx]);

  useEffect(() => {
    setActSecs(0); setFcIdx(0); setFcFlipped(false);
    setCiaacQ(0); setCiaacAnswer(null);
    setPathyStep(0); setPathyInput(""); setPathyResponses([]);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [actIdx]);

  function startMission() { setMission(buildMission(rec)); setActIdx(0); setActSecs(0); setFlowStep("preview"); }
  function startSession() { setIsPaused(false); setFlowStep("sesion"); }
  function advanceActivity() { if (actIdx >= mission.length - 1) setFlowStep("completado"); else setActIdx(i => i + 1); }
  function endSession() { clearInterval(actTimerRef.current!); setFlowStep("completado"); }
  function resetAll() {
    setFlowStep("home"); setMission([]); setActIdx(0); setActSecs(0);
    totalElapsedRef.current = 0; setTotalElapsed(0);
    setDcText(""); setFcCorrect([]); setCiaacResults([]);
    setDebriefing({ aprendiste: "", dificil: "", repasar: "" }); setShowFatigue(false);
  }

  const currentAct = mission[actIdx];
  const actPct     = currentAct ? Math.min(100, (actSecs / (currentAct.duration * 60)) * 100) : 0;
  const actMinRem  = currentAct ? Math.max(0, currentAct.duration * 60 - actSecs) : 0;

  if (flowStep === "home")    return <HomeScreen profile={profile} rec={rec} prepLevel={prepLevel} examPhase={examPhase} showConfig={showConfig} setShowConfig={setShowConfig} updatePhase={updatePhase} onStart={startMission} />;
  if (flowStep === "preview") return <PreviewScreen mission={mission} rec={rec} onStart={startSession} onBack={() => setFlowStep("home")} />;
  if (flowStep === "sesion" && currentAct) return (
    <>
      {showFatigue && <FatigueAlert onDismiss={() => { setShowFatigue(false); lastActivityRef.current = Date.now(); }} />}
      <SesionScreen
        mission={mission} actIdx={actIdx} currentAct={currentAct}
        actSecs={actSecs} actPct={actPct} actMinRem={actMinRem}
        isPaused={isPaused} setIsPaused={setIsPaused} totalElapsed={totalElapsed}
        dcText={dcText} setDcText={setDcText}
        fcIdx={fcIdx} setFcIdx={setFcIdx} fcFlipped={fcFlipped} setFcFlipped={setFcFlipped}
        fcCorrect={fcCorrect} setFcCorrect={setFcCorrect}
        ciaacQ={ciaacQ} setCiaacQ={setCiaacQ}
        ciaacAnswer={ciaacAnswer} setCiaacAnswer={setCiaacAnswer}
        ciaacResults={ciaacResults} setCiaacResults={setCiaacResults}
        pathyStep={pathyStep} setPathyStep={setPathyStep}
        pathyInput={pathyInput} setPathyInput={setPathyInput}
        pathyResponses={pathyResponses} setPathyResponses={setPathyResponses}
        debriefing={debriefing} setDebriefing={setDebriefing}
        contentRef={contentRef} onNext={advanceActivity} onEnd={endSession}
        onActivity={() => { lastActivityRef.current = Date.now(); }}
      />
    </>
  );
  return <CompletadoScreen mission={mission} totalElapsed={totalElapsed} rec={rec} debriefing={debriefing} ciaacResults={ciaacResults} fcCorrect={fcCorrect} onRestart={resetAll} />;
}

/* ══════════════════════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════════════════════ */
function HomeScreen({ profile, rec, prepLevel, examPhase, showConfig, setShowConfig, updatePhase, onStart }: {
  profile: StudentProfile; rec: Recommendation; prepLevel: PrepLevel;
  examPhase: ExamPhase; showConfig: boolean;
  setShowConfig: (v: boolean) => void; updatePhase: (p: ExamPhase) => void; onStart: () => void;
}) {
  const pi = PREP_INFO[prepLevel];
  const phaseLabel = EXAM_OPTS.find(o => o.value === examPhase)?.label ?? "No definida";

  const rutaScore  = Math.round(computeRuta(profile));
  const materiasPct = Math.round(eAvgPct(profile));
  const clasesPct  = Math.round(eClasesPct(profile));
  const flashPct   = Math.round(eFlashPct(profile));
  const simPct     = Math.round(eSimFactor(profile));
  const quizScore  = profile.cuestionarios.avgScore;

  const UC = { alta: { bg: "#fef2f2", color: "#dc2626", br: "rgba(220,38,38,.15)" }, media: { bg: "#fffbeb", color: "#d97706", br: "rgba(217,119,6,.15)" }, baja: { bg: "#f0fdf4", color: "#16a34a", br: "rgba(22,163,74,.15)" } }[rec.urgency];
  const urgIcon = rec.urgency === "alta" ? "⚠️" : rec.urgency === "media" ? "📌" : "💡";

  const pillar = (label: string, pct: number, color: string, icon: string) => (
    <div key={label} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10.5 }}>
        <span style={{ color: "#888", fontWeight: 600 }}>{icon} {label}</span>
        <span style={{ fontWeight: 700, color }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(61,93,145,.1)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: color, transition: "width .6s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 760, margin: "0 auto" }}>

      {/* ── Ruta CIAAC ── */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0d1f38 100%)", borderRadius: 20, padding: "24px 26px", marginBottom: 20, color: "white", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.4)", marginBottom: 5 }}>🗺️ Ruta CIAAC</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>
              {rutaScore}<span style={{ fontSize: "1rem", fontWeight: 400, color: "rgba(255,255,255,.5)" }}>%</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.4)", marginLeft: 10 }}>preparación integral</span>
            </div>
          </div>
          <div style={{ background: pi.bg, border: `1px solid ${pi.border}`, borderRadius: 10, padding: "7px 12px", textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: pi.color, letterSpacing: ".06em" }}>Nivel</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: pi.color }}>{pi.dot} {pi.label}</div>
          </div>
        </div>

        {/* Master progress bar */}
        <div style={{ height: 8, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${rutaScore}%`, background: "linear-gradient(90deg, #3D5D91, #5A86CB, #F2AEBC)", transition: "width .6s ease" }} />
        </div>

        {/* 5 pillars */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {pillar("Materias",      materiasPct, "#5A86CB", "📚")}
          {pillar("Clases",        clasesPct,   "#F2AEBC", "🎬")}
          {pillar("Cuestionarios", quizScore,   "#d97706", "❓")}
          {pillar("Flashcards",    flashPct,    "#db2777", "🃏")}
          {pillar("Simuladores",   simPct,      "#4ade80", "🎯")}
        </div>
      </div>

      {/* ── Exam phase pill + config ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: showConfig ? "#1a1a2e" : "white", border: `1.5px solid ${showConfig ? "#1a1a2e" : "rgba(61,93,145,.15)"}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .18s" }}>
          <span style={{ fontSize: 13 }}>📅</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: showConfig ? "white" : "#555" }}>
            {examPhase === "sin_definir" ? "Definir fecha de examen" : `Examen: ${phaseLabel}`}
          </span>
          <span style={{ fontSize: 10, color: showConfig ? "rgba(255,255,255,.4)" : "#bbb" }}>{showConfig ? "▲" : "▼"}</span>
        </button>
        {examPhase === "sin_definir" && (
          <span style={{ fontSize: 11.5, color: "#aaa", fontStyle: "italic" }}>
            Pathy usa tu progreso · la fecha acelera las recomendaciones
          </span>
        )}
      </div>

      {showConfig && (
        <div style={{ background: "#1a1a2e", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>¿Cuándo presentas el CIAAC?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {EXAM_OPTS.map(opt => (
              <button key={opt.value} onClick={() => { updatePhase(opt.value); setShowConfig(false); }}
                style={{ border: `${examPhase === opt.value ? 2 : 1}px solid ${examPhase === opt.value ? "#5A86CB" : "rgba(255,255,255,.1)"}`, borderRadius: 10, padding: "11px 14px", background: examPhase === opt.value ? "rgba(90,134,203,.15)" : "rgba(255,255,255,.03)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: examPhase === opt.value ? "#5A86CB" : "rgba(255,255,255,.8)" }}>{opt.label}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pathy recommendation card ── */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 20, padding: "26px 26px 22px", marginBottom: 20, boxShadow: "0 4px 24px rgba(61,93,145,.07)" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "#aaa", marginBottom: 18 }}>👩🏻‍✈️ Pathy recomienda hoy</div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}>
            <PathySVG size={76} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15.5, color: "#1a1a2e", lineHeight: 1.7, fontWeight: 500, marginBottom: 14 }}>{rec.pathyMessage}</p>
            <div style={{ background: UC.bg, border: `1px solid ${UC.br}`, borderRadius: 10, padding: "9px 13px", display: "flex", gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{urgIcon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: UC.color, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 1 }}>
                  {rec.urgency === "alta" ? "Prioridad alta" : rec.urgency === "media" ? "Recomendado hoy" : "Sugerencia"}
                </div>
                <div style={{ fontSize: 12.5, color: "#555" }}>{rec.reason}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission preview strip */}
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0d1f38)", borderRadius: 14, padding: "15px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.35)", marginBottom: 3 }}>Misión de hoy</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "white" }}>{rec.title}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginBottom: 1 }}>Duración est.</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#5A86CB" }}>~{rec.durationMin} min</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {rec.subject && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#F2AEBC", background: "rgba(242,174,188,.1)", border: "1px solid rgba(242,174,188,.2)", borderRadius: 99, padding: "2px 9px" }}>
                {rec.subject.icon} {rec.subject.name}
              </span>
            )}
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.45)", background: "rgba(255,255,255,.05)", borderRadius: 99, padding: "2px 9px" }}>
              {rec.type === "materia" ? "📖 Contenido" : rec.type === "cuestionario" ? "✈️ Cuestionario" : rec.type === "flashcards" ? "🃏 Flashcards" : rec.type === "sim_parcial" ? "🎯 Simulador parcial" : rec.type === "sim_completo" ? "✈️ Simulador CIAAC" : rec.type === "recuperacion" ? "🔧 Recuperación" : rec.type === "resistencia" ? "💪 Resistencia" : "📚 Repaso final"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Materias mini grid ── */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(61,93,145,.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa" }}>Estado de materias</div>
          <div style={{ fontSize: 11.5, color: "#888" }}>
            {profile.materias.filter(m => m.pct === 0).length > 0 ? `${profile.materias.filter(m => m.pct === 0).length} sin iniciar` : "Todas iniciadas ✓"}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {profile.materias.map(m => {
            const isTarget   = rec.subject?.slug === m.slug;
            const isAbandoned = m.pct > 0 && daysSince(m.lastStudied) >= 7;
            const barColor   = m.pct === 0 ? "transparent" : m.pct < 50 ? "#d97706" : m.pct < 80 ? "#3D5D91" : "#16a34a";
            return (
              <div key={m.slug} title={`${m.name}: ${m.pct}% · Promedio: ${m.avg}%`}
                style={{ borderRadius: 10, padding: "9px 10px", background: isTarget ? "rgba(61,93,145,.06)" : "#fafbfd", border: `${isTarget ? 2 : 1}px solid ${isTarget ? "#3D5D91" : "rgba(61,93,145,.08)"}` }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{m.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: 5 }}>
                  {m.name.length > 14 ? m.name.slice(0, 12) + "…" : m.name}
                </div>
                <div style={{ height: 3, background: "rgba(61,93,145,.1)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${m.pct}%`, background: barColor }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9 }}>
                  <span style={{ color: "#bbb" }}>{m.pct}%</span>
                  {isAbandoned && <span style={{ color: "#ef4444" }}>⚠</span>}
                  {isTarget && <span style={{ color: "#3D5D91", fontWeight: 700 }}>HOY</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <button onClick={onStart}
        style={{ width: "100%", background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 14, padding: "17px", fontSize: 16.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 6px 24px rgba(61,93,145,.3)", transition: "opacity .2s" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = ".92"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
        <PathySVG size={28} overlay />
        🚀 Comenzar misión
      </button>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "#ccc", marginTop: 8 }}>
        Pathy preparó esta misión basándose en tu progreso actual
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PREVIEW SCREEN
══════════════════════════════════════════════════════════ */
function PreviewScreen({ mission, rec, onStart, onBack }: { mission: MissionActivity[]; rec: Recommendation; onStart: () => void; onBack: () => void; }) {
  const totalMin = mission.reduce((s, a) => s + a.duration, 0);
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0d1f38 100%)", borderRadius: 18, padding: "24px 28px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}><PathySVG size={60} overlay /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>✈️ Misión preparada</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 5 }}>{rec.title}</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>{mission.length} actividades · {totalMin} minutos</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          {[
            { label: "Actividades", v: mission.length, icon: "📋" },
            { label: "Minutos", v: totalMin, icon: "⏱️" },
            { label: "Descansos", v: mission.filter(a => a.type === "descanso").length, icon: "✈️" },
            { label: "Prioridad", v: rec.urgency === "alta" ? "Alta" : rec.urgency === "media" ? "Media" : "Baja", icon: rec.urgency === "alta" ? "🔴" : rec.urgency === "media" ? "🟡" : "🟢" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "white" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#aaa", marginBottom: 16 }}>Itinerario de vuelo</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {mission.map((act, i) => {
            const color = actColor(act); const isLast = i === mission.length - 1;
            return (
              <div key={act.id} style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 4 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 32 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}15`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{act.icon}</div>
                  {!isLast && <div style={{ width: 2, flex: 1, minHeight: 12, background: "rgba(61,93,145,.08)", margin: "4px 0" }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{act.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}12`, padding: "2px 8px", borderRadius: 99 }}>{act.duration} min</span>
                    {act.technique && <span style={{ fontSize: 10, color: "#888", background: "#f5f7fc", border: "1px solid rgba(61,93,145,.1)", borderRadius: 99, padding: "2px 7px" }}>{act.technique.icon} {act.technique.name}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#888", marginTop: 3, lineHeight: 1.5 }}>{act.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack}
          style={{ padding: "14px 20px", background: "white", border: "1.5px solid rgba(61,93,145,.15)", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(61,93,145,.15)"; e.currentTarget.style.color = "#888"; }}>
          ← Volver
        </button>
        <button onClick={onStart}
          style={{ flex: 1, background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(61,93,145,.3)" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Iniciar misión ✈️
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FATIGUE ALERT
══════════════════════════════════════════════════════════ */
function FatigueAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "28px 26px 24px", maxWidth: 380, margin: "0 20px", boxShadow: "0 24px 60px rgba(0,0,0,.3)", textAlign: "center" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", display: "inline-block", marginBottom: 14 }}><PathySVG size={64} /></div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>Piloto, detecté señales de fatiga</div>
        <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, marginBottom: 20 }}>Llevas un tiempo sin interactuar. Tu cerebro necesita un descanso real — eso también es parte del entrenamiento.</p>
        <button onClick={onDismiss}
          style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "white", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Tomar descanso y continuar
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SESION SCREEN
══════════════════════════════════════════════════════════ */
interface SesionProps {
  mission: MissionActivity[]; actIdx: number; currentAct: MissionActivity;
  actSecs: number; actPct: number; actMinRem: number;
  isPaused: boolean; setIsPaused: (v: boolean) => void; totalElapsed: number;
  dcText: string; setDcText: (v: string) => void;
  fcIdx: number; setFcIdx: (n: number) => void;
  fcFlipped: boolean; setFcFlipped: (v: boolean) => void;
  fcCorrect: boolean[]; setFcCorrect: (v: boolean[]) => void;
  ciaacQ: number; setCiaacQ: (n: number) => void;
  ciaacAnswer: number | null; setCiaacAnswer: (v: number | null) => void;
  ciaacResults: { correct: boolean }[]; setCiaacResults: (v: { correct: boolean }[]) => void;
  pathyStep: number; setPathyStep: (n: number) => void;
  pathyInput: string; setPathyInput: (v: string) => void;
  pathyResponses: string[]; setPathyResponses: (v: string[]) => void;
  debriefing: { aprendiste: string; dificil: string; repasar: string };
  setDebriefing: (v: { aprendiste: string; dificil: string; repasar: string }) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onNext: () => void; onEnd: () => void; onActivity: () => void;
}

function SesionScreen(props: SesionProps) {
  const { mission, actIdx, currentAct, actSecs, actPct, actMinRem, isPaused, setIsPaused, totalElapsed, contentRef, onNext, onEnd, onActivity } = props;
  const color = actColor(currentAct); const isLast = actIdx === mission.length - 1;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }} onPointerDown={onActivity}>
      <div>
        <div style={{ background: "white", border: `2px solid ${color}25`, borderTop: `4px solid ${color}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 28 }}>{currentAct.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color }}> Actividad {actIdx + 1}/{mission.length}</div>
                {currentAct.technique && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#888", background: "#f5f7fc", border: "1px solid rgba(61,93,145,.1)", borderRadius: 99, padding: "1px 7px" }}>
                    {currentAct.technique.icon} {currentAct.technique.name}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: "#1a1a2e" }}>{currentAct.title}</div>
            </div>
            <button onClick={() => setIsPaused(!isPaused)}
              style={{ border: `1px solid ${isPaused ? "#d97706" : "rgba(61,93,145,.2)"}`, borderRadius: 10, padding: "8px 14px", background: isPaused ? "#fffbeb" : "white", color: isPaused ? "#d97706" : "#888", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              {isPaused ? <>▶ Reanudar</> : <>⏸ Pausar</>}
            </button>
          </div>
          <div style={{ height: 5, background: "rgba(61,93,145,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", background: color, borderRadius: 99, width: `${actPct}%`, transition: "width 1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#aaa" }}>
            <span>{pad(Math.floor(actSecs / 60))}:{pad(actSecs % 60)} transcurridos</span>
            <span style={{ color: actMinRem < 60 ? "#d97706" : "#aaa", fontWeight: actMinRem < 60 ? 700 : 400 }}>{pad(Math.floor(actMinRem / 60))}:{pad(actMinRem % 60)} restantes</span>
          </div>
        </div>

        <div ref={contentRef} style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
          <ActivityView {...props} />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={onEnd}
            style={{ padding: "13px 18px", background: "white", border: "1.5px solid rgba(220,38,38,.2)", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Finalizar sesión
          </button>
          <button onClick={onNext}
            style={{ flex: 1, background: isLast ? "linear-gradient(135deg, #7c3aed, #a855f7)" : `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${color}35` }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            {isLast ? "Completar misión ✈️" : `Siguiente: ${mission[actIdx + 1]?.title} →`}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0d1f38)", borderRadius: 14, padding: "16px 18px", color: "white" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}><PathySVG size={38} overlay /></div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>Pathy dice</div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", lineHeight: 1.65 }}>{currentAct.pathyMsg}</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 12 }}>Sesión de hoy</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: "#888" }}>Tiempo total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3D5D91" }}>{pad(Math.floor(totalElapsed / 60))}:{pad(totalElapsed % 60)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "#888" }}>Progreso</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3D5D91" }}>{actIdx + 1}/{mission.length}</span>
          </div>
          <div style={{ height: 4, background: "rgba(61,93,145,.08)", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#3D5D91", borderRadius: 99, width: `${((actIdx + 1) / mission.length) * 100}%`, transition: "width .4s ease" }} />
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 12 }}>Plan de misión</div>
          {mission.map((act, i) => {
            const c = actColor(act); const isDone = i < actIdx; const isCur = i === actIdx;
            return (
              <div key={act.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: i < mission.length - 1 ? "1px solid rgba(61,93,145,.05)" : "none", opacity: isDone ? 0.4 : 1 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isCur ? c : isDone ? "#4ade80" : "rgba(61,93,145,.15)"}`, background: isDone ? "#4ade8018" : isCur ? `${c}12` : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                  {isDone ? "✓" : act.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isCur ? 700 : 500, color: isCur ? c : isDone ? "#aaa" : "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{act.title}</div>
                </div>
                <span style={{ fontSize: 10.5, color: "#ccc", flexShrink: 0 }}>{act.duration}m</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Activity view router ── */
function ActivityView(props: SesionProps) {
  const { currentAct } = props;
  if (currentAct.subtype === "descarga" || currentAct.type === "calentamiento") return <CalentamientoView {...props} />;
  if (currentAct.subtype === "flashcards") return <FlashcardsView {...props} />;
  if (currentAct.subtype === "ciaac")      return <CIAACView {...props} />;
  if (currentAct.subtype === "explicaselo")return <ExplicaseloView {...props} />;
  if (currentAct.type === "descanso")      return <DescansoView {...props} />;
  if (currentAct.type === "debriefing")    return <DebriefingView {...props} />;
  return <ContenidoView {...props} />;
}

/* ── Calentamiento ── */
function CalentamientoView({ dcText, setDcText, currentAct }: SesionProps) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>🧠 {currentAct.title}</div>
      <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, marginBottom: 14 }}>{currentAct.desc} Sin filtros, sin orden — deja que fluya.</p>
      <textarea value={dcText} onChange={e => setDcText(e.target.value)}
        placeholder="Escribe aquí todo lo que recuerdas..."
        style={{ width: "100%", minHeight: 200, border: "1.5px solid rgba(61,93,145,.15)", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "vertical", background: "#fafbfd", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
        onFocus={e => { e.target.style.borderColor = "#3D5D91"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(61,93,145,.15)"; }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#ccc" }}>
        <span>Sin límite — escribe todo</span>
        <span>{dcText.split(/\s+/).filter(Boolean).length} palabras</span>
      </div>
    </div>
  );
}

/* ── Contenido ── */
function ContenidoView({ currentAct }: SesionProps) {
  const topics = [
    { title: "Frentes atmosféricos", items: ["Frente frío: avance rápido, Cb, chubascos", "Frente cálido: avance lento, As/Ns, lluvia continua", "Frente ocluido: frío alcanza al cálido, lluvia prolongada"] },
    { title: "Tipos de nubes OACI",  items: ["Altas (>6,000m): Ci, Cc, Cs", "Medias (2,000–6,000m): Ac, As", "Bajas (<2,000m): St, Sc, Ns", "Desarrollo vertical: Cu, Cb"] },
    { title: "METAR/TAF — Claves CIAAC", items: ["CAVOK: vis≥10km, sin nubes<5,000ft, sin Wx sig", "TSRA: Tormenta + lluvia (indicador crítico)", "BKN/OVC: >5 octas — condición IMC", "BECMG/TEMPO: cambios previstos en TAF"] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {topics.map((t, i) => (
        <div key={i} style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#3D5D91", color: "white", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            {t.title}
          </div>
          {t.items.map((item, j) => (
            <div key={j} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: j < t.items.length - 1 ? "1px solid rgba(61,93,145,.06)" : "none" }}>
              <span style={{ color: "#3D5D91", fontWeight: 700, flexShrink: 0, fontSize: 13 }}>→</span>
              <span style={{ fontSize: 13.5, color: "#444", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "13px 15px", fontSize: 13, color: "#92400e" }}>
        💡 <strong>Tip de Pathy:</strong> Después de cada sección, cierra los ojos y recuerda los 3 puntos más importantes. La recuperación activa triplica la retención.
      </div>
    </div>
  );
}

/* ── Flashcards ── */
function FlashcardsView({ fcIdx, setFcIdx, fcFlipped, setFcFlipped, fcCorrect, setFcCorrect, onNext }: SesionProps) {
  const card = FLASHCARDS[fcIdx];
  const correctCount = fcCorrect.filter(Boolean).length;
  function handleAnswer(correct: boolean) {
    setFcCorrect([...fcCorrect, correct]);
    if (fcIdx < FLASHCARDS.length - 1) { setFcIdx(fcIdx + 1); setFcFlipped(false); }
    else onNext();
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {[{ label: "Tarjeta", v: `${fcIdx + 1}/${FLASHCARDS.length}`, icon: "🃏", c: "#1a1a2e" }, { label: "Correctas", v: String(correctCount), icon: "✅", c: "#16a34a" }].map(s => (
          <div key={s.label} style={{ flex: 1, background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div><div style={{ fontSize: 11, color: "#aaa" }}>{s.label}</div><div style={{ fontWeight: 700, color: s.c }}>{s.v}</div></div>
          </div>
        ))}
      </div>
      <div onClick={() => setFcFlipped(!fcFlipped)}
        style={{ background: fcFlipped ? "linear-gradient(135deg, #1a1a2e, #0d1f38)" : "white", border: `2px solid ${fcFlipped ? "rgba(90,134,203,.3)" : "rgba(61,93,145,.12)"}`, borderRadius: 16, padding: "28px 24px", minHeight: 180, cursor: "pointer", boxShadow: "0 4px 20px rgba(61,93,145,.1)", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: fcFlipped ? "rgba(255,255,255,.35)" : "#aaa", marginBottom: 16 }}>
          {fcFlipped ? "✓ Respuesta" : "❓ Pregunta"} · toca para {fcFlipped ? "ocultar" : "revelar"}
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: fcFlipped ? "rgba(255,255,255,.85)" : "#1a1a2e", fontWeight: fcFlipped ? 400 : 600 }}>
          {fcFlipped ? card.a : card.q}
        </p>
      </div>
      {fcFlipped && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleAnswer(false)} style={{ flex: 1, border: "2px solid #fca5a5", borderRadius: 12, padding: "13px", background: "#fef2f2", color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✗ No lo sabía</button>
          <button onClick={() => handleAnswer(true)}  style={{ flex: 1, border: "2px solid #86efac", borderRadius: 12, padding: "13px", background: "#f0fdf4", color: "#16a34a", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✓ Lo sabía</button>
        </div>
      )}
      {!fcFlipped && <div style={{ textAlign: "center", fontSize: 12.5, color: "#ccc" }}>Toca la tarjeta para ver la respuesta</div>}
    </div>
  );
}

/* ── CIAAC ── */
function CIAACView({ ciaacQ, setCiaacQ, ciaacAnswer, setCiaacAnswer, ciaacResults, setCiaacResults, onNext }: SesionProps) {
  const q = CIAAC_QUESTIONS[ciaacQ]; const answered = ciaacAnswer !== null; const isCorrect = ciaacAnswer === q.correct;
  function handleSelect(idx: number) {
    if (answered) return;
    setCiaacAnswer(idx); setCiaacResults([...ciaacResults, { correct: idx === q.correct }]);
  }
  function handleNext() {
    if (ciaacQ < CIAAC_QUESTIONS.length - 1) { setCiaacQ(ciaacQ + 1); setCiaacAnswer(null); }
    else onNext();
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: "rgba(61,93,145,.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#d97706", borderRadius: 99, width: `${((ciaacQ + 1) / CIAAC_QUESTIONS.length) * 100}%`, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706", flexShrink: 0 }}>{ciaacQ + 1}/{CIAAC_QUESTIONS.length}</span>
      </div>
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#d97706", marginBottom: 10 }}>✈ Pregunta CIAAC</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.65 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.opts.map((opt, i) => {
          let bg = "white", border = "1.5px solid rgba(61,93,145,.12)", color = "#444";
          if (answered) {
            if (i === q.correct) { bg = "#f0fdf4"; border = "2px solid #4ade80"; color = "#166534"; }
            else if (i === ciaacAnswer && !isCorrect) { bg = "#fef2f2"; border = "2px solid #f87171"; color = "#dc2626"; }
          }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              style={{ border, borderRadius: 12, padding: "13px 16px", background: bg, color, cursor: answered ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: "left", transition: "all .2s", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, flexShrink: 0, width: 20 }}>{["A","B","C","D"][i]}.</span>
              <span style={{ lineHeight: 1.5 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ background: isCorrect ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, color: isCorrect ? "#166534" : "#dc2626", marginBottom: 6 }}>{isCorrect ? "✓ ¡Correcto!" : "✗ Incorrecto"}</div>
          <p style={{ fontSize: 13, color: isCorrect ? "#166534" : "#991b1b", lineHeight: 1.65 }}>{q.exp}</p>
        </div>
      )}
      {answered && (
        <button onClick={handleNext}
          style={{ background: "#d97706", color: "white", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {ciaacQ < CIAAC_QUESTIONS.length - 1 ? "Siguiente pregunta →" : "Completar ✓"}
        </button>
      )}
    </div>
  );
}

/* ── Explícaselo a Pathy ── */
function ExplicaseloView({ pathyStep, setPathyStep, pathyInput, setPathyInput, pathyResponses, setPathyResponses, onNext }: SesionProps) {
  const q = PATHY_QUESTIONS[pathyStep]; const done = pathyStep >= PATHY_QUESTIONS.length;
  function submit() {
    const text = pathyInput.trim(); if (!text) return;
    setPathyResponses([...pathyResponses, text]); setPathyInput("");
    if (pathyStep < PATHY_QUESTIONS.length - 1) setPathyStep(pathyStep + 1);
    else setPathyStep(PATHY_QUESTIONS.length);
  }
  if (done) return (
    <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "28px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
      <div style={{ animation: "fp-float 2.5s ease-in-out infinite", display: "inline-block", marginBottom: 16 }}><PathySVG size={72} /></div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>¡Excelente explicación, piloto!</div>
      <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, marginBottom: 20 }}>Respondiste {pathyResponses.length} preguntas de Pathy. La capacidad de explicar es la prueba definitiva de que lo dominas para el CIAAC.</p>
      <button onClick={onNext} style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", color: "white", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Continuar →</button>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {PATHY_QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < pathyStep ? "#3D5D91" : i === pathyStep ? "#5A86CB" : "rgba(61,93,145,.1)" }} />
        ))}
      </div>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0d1f38)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}><PathySVG size={48} overlay /></div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Pathy pregunta ({pathyStep + 1}/{PATHY_QUESTIONS.length})</div>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.85)", lineHeight: 1.65 }}>{q}</p>
        </div>
      </div>
      {pathyResponses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pathyResponses.map((r, i) => (
            <div key={i} style={{ background: "#f8f9fc", border: "1px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: "#444", lineHeight: 1.6, opacity: 0.65 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginRight: 8 }}>Tu respuesta {i + 1}:</span>{r}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
        <textarea value={pathyInput} onChange={e => setPathyInput(e.target.value)} placeholder="Explícale a Pathy con tus propias palabras..." rows={5}
          style={{ width: "100%", border: "none", padding: "16px 18px", fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "none", background: "transparent", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(61,93,145,.08)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={submit} style={{ background: "#3D5D91", color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Enviar →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Descanso ── */
function DescansoView({ actMinRem }: SesionProps) {
  const tips = ["Levántate y camina 2 minutos — activa la circulación.","Toma agua. La hidratación mejora la concentración hasta un 20%.","Mira a 6 metros de distancia 30 segundos — descansa tus ojos.","Respira: 4 seg inhala, 7 retienes, 8 exhalas.","Estira cuello y hombros — la postura afecta tu concentración."];
  const tip = tips[Math.floor(Date.now() / 10000) % tips.length];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "white", border: "1px solid rgba(5,150,105,.2)", borderRadius: 16, padding: "28px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(5,150,105,.08)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", fontWeight: 700, color: "#059669", letterSpacing: -2, lineHeight: 1 }}>{pad(Math.floor(actMinRem / 60))}:{pad(actMinRem % 60)}</div>
        <div style={{ fontSize: 13, color: "#059669", opacity: .65, marginTop: 6, letterSpacing: ".08em" }}>ESCALA TÉCNICA — DESCANSA</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #059669, #10b981)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}><PathySVG size={44} overlay /></div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Pathy recomienda</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.9)", lineHeight: 1.65, fontWeight: 500 }}>{tip}</p>
        </div>
      </div>
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "13px 15px", fontSize: 13, color: "#166534", lineHeight: 1.65 }}>
        Las escalas no son tiempo perdido — son cuando tu cerebro consolida lo aprendido. Honra la pausa.
      </div>
    </div>
  );
}

/* ── Debriefing ── */
function DebriefingView({ debriefing, setDebriefing, onNext }: SesionProps) {
  const questions = [
    { key: "aprendiste" as const, label: "¿Qué aprendiste hoy?", placeholder: "Los conceptos, ideas o conexiones que se quedaron contigo..." },
    { key: "dificil"   as const, label: "¿Qué fue difícil o quedó sin entender?", placeholder: "Lo que se me resistió, lo que me generó duda..." },
    { key: "repasar"   as const, label: "¿Qué necesito repasar mañana?", placeholder: "Los temas específicos que debo reforzar en la próxima sesión..." },
  ];
  const allFilled = debriefing.aprendiste && debriefing.dificil && debriefing.repasar;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}><PathySVG size={44} overlay /></div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Debriefing — Cierre de vuelo</div>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)", lineHeight: 1.65 }}>Este es el momento más importante de la sesión. La reflexión post-vuelo consolida lo que aprendiste y define tu próxima misión.</p>
        </div>
      </div>
      {questions.map(q => (
        <div key={q.key} style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>{q.label}</label>
          <textarea value={debriefing[q.key]} onChange={e => setDebriefing({ ...debriefing, [q.key]: e.target.value })} placeholder={q.placeholder} rows={3}
            style={{ width: "100%", border: "1.5px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "none", background: "#fafbfd", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#7c3aed"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(61,93,145,.12)"; }}
          />
        </div>
      ))}
      <button onClick={onNext} disabled={!allFilled}
        style={{ background: allFilled ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(61,93,145,.1)", color: allFilled ? "white" : "#aaa", border: "none", borderRadius: 12, padding: "14px", fontSize: 14.5, fontWeight: 700, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
        {allFilled ? "Guardar en bitácora y aterrizar ✈️" : "Completa las 3 preguntas para continuar"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPLETADO SCREEN
══════════════════════════════════════════════════════════ */
function CompletadoScreen({ mission, totalElapsed, rec, debriefing, ciaacResults, fcCorrect, onRestart }: {
  mission: MissionActivity[]; totalElapsed: number; rec: Recommendation;
  debriefing: { aprendiste: string; dificil: string; repasar: string };
  ciaacResults: { correct: boolean }[]; fcCorrect: boolean[]; onRestart: () => void;
}) {
  const vuelos    = mission.filter(a => a.type === "vuelo").length;
  const ciaacScore = ciaacResults.length > 0 ? Math.round((ciaacResults.filter(r => r.correct).length / ciaacResults.length) * 100) : null;
  const fcScore   = fcCorrect.length > 0 ? Math.round((fcCorrect.filter(Boolean).length / fcCorrect.length) * 100) : null;
  const isSim     = rec.type === "sim_completo" || rec.type === "sim_parcial";
  const showRecovery = ciaacScore !== null && ciaacScore < 80;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0d1f38 100%)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, color: "white", textAlign: "center" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", display: "inline-block", marginBottom: 16 }}><PathySVG size={80} overlay /></div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}>¡Aterrizaje exitoso! ✈️</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>
          Completaste {vuelos} vuelo{vuelos !== 1 ? "s" : ""} de estudio · {pad(Math.floor(totalElapsed / 60))}:{pad(totalElapsed % 60)} de sesión
        </p>
        <div style={{ display: "flex", gap: 1, marginTop: 24, background: "rgba(255,255,255,.05)", borderRadius: 12, overflow: "hidden" }}>
          {[
            { label: "Minutos", v: `${Math.floor(totalElapsed / 60)}`, icon: "⏱️" },
            ciaacScore !== null ? { label: "CIAAC", v: `${ciaacScore}%`, icon: "✈️" } : null,
            fcScore !== null    ? { label: "Flashcards", v: `${fcScore}%`, icon: "🃏" } : null,
            { label: "Vuelos", v: String(vuelos), icon: "📚" },
          ].filter(Boolean).map((s, i, arr) => (
            <div key={i} style={{ flex: 1, padding: "16px 8px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{s!.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "white", marginTop: 4 }}>{s!.v}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{s!.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery plan after simulator */}
      {isSim && showRecovery && (
        <div style={{ background: "white", border: "1px solid rgba(217,119,6,.2)", borderRadius: 16, padding: "20px 22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}><PathySVG size={48} /></div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Plan de recuperación generado</div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                Tu score fue {ciaacScore}% — por debajo del 80% requerido. Pathy identificó las áreas de mejora y preparará la próxima misión de recuperación.
              </p>
            </div>
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>🔧 Próxima misión recomendada</div>
            {[
              { icon: "📖", text: "Revisar material de los temas con errores" },
              { icon: "✈️", text: "20 preguntas focalizadas en los conceptos fallidos" },
              { icon: "🃏", text: "Flashcards de refuerzo" },
              { icon: "📋", text: "Cuestionario de validación" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i < 3 ? "1px solid rgba(217,119,6,.1)" : "none" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "#78350f" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debriefing summary */}
      {(debriefing.aprendiste || debriefing.dificil || debriefing.repasar) && (
        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 16, padding: "20px 22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>📋 Tu bitácora de vuelo</div>
          {[{ label: "Aprendiste", text: debriefing.aprendiste, color: "#3D5D91" }, { label: "Fue difícil", text: debriefing.dificil, color: "#d97706" }, { label: "Repasar mañana", text: debriefing.repasar, color: "#7c3aed" }].filter(r => r.text).map(r => (
            <div key={r.label} style={{ padding: "12px 0", borderBottom: "1px solid rgba(61,93,145,.07)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: r.color, marginBottom: 5 }}>{r.label}</div>
              <p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12.5, color: "#166534", fontWeight: 500 }}>
            ✓ Guardado en tu Bitácora de vuelo
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onRestart}
          style={{ flex: 1, background: "white", border: "2px solid #3D5D91", borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#3D5D91" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e8eef7"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
          ✈️ Nueva misión
        </button>
        <button onClick={() => { window.location.href = "/dashboard/banco"; }}
          style={{ flex: 1, background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 6px 20px rgba(61,93,145,.3)" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          Ir al Banco de Preguntas →
        </button>
      </div>
    </div>
  );
}
