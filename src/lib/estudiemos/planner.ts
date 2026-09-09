/**
 * Planificador determinista de "Estudiemos Juntos".
 *
 * Toma el catálogo de recursos reales y lo ordena con señales duras del
 * progreso de la alumna (intentos, aciertos por materia/capítulo, temas
 * completados, flashcards por repasar), más su ánimo, urgencia y minutos.
 * Nunca inventa contenido: sólo prioriza, ordena, asigna tiempos y breaks.
 */
import {
  getFlashStates,
  getQuizAttempts,
  getSimAttempts,
  getTemaProgress,
  materiaPerformance,
  materiaProgressPct,
} from "@/lib/store";
import { MATERIAS_DEF } from "@/lib/store/materias";
import { buildCatalog } from "./catalog";
import type { PlanActivity, ResourceCandidate, StudyIntake } from "./types";

const MOOD_LABEL: Record<StudyIntake["mood"], string> = {
  cero: "con cero ganas",
  normal: "en modo normal",
  ganas: "con ganas",
  atope: "a tope",
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface Signals {
  ciaac: Record<string, { avg: number; answered: number; progreso: number }>;
  la: Record<string, { correct: number; total: number }>;
  flashRepasar: number;
  daysSinceSim: number | null;
}

function readSignals(userId: string): Signals {
  const ciaac: Signals["ciaac"] = {};
  const perf = materiaPerformance(userId, "todo");
  MATERIAS_DEF.forEach((m) => {
    const p = perf.find((x) => x.slug === m.slug);
    ciaac[m.slug] = {
      avg: p?.avg ?? 0,
      answered: p?.answered ?? 0,
      progreso: materiaProgressPct(userId, m.slug),
    };
  });

  const la: Signals["la"] = {};
  getQuizAttempts(userId).forEach((a) => {
    (a.answers ?? []).forEach((r) => {
      const fuente = (r.fuente ?? "").toUpperCase();
      if (!fuente) return;
      const keys = [fuente, r.capitulo ? `${fuente}:${r.capitulo}` : null].filter(Boolean) as string[];
      keys.forEach((k) => {
        const cur = la[k] ?? { correct: 0, total: 0 };
        cur.total += 1;
        if (r.selectedIndex === r.correctIndex) cur.correct += 1;
        la[k] = cur;
      });
    });
  });

  const flashRepasar = getFlashStates(userId).filter((f) => f.state === "repasar").length;

  const sims = getSimAttempts(userId);
  const last = sims.length
    ? sims.map((s) => new Date(s.date).getTime()).sort((a, b) => b - a)[0]
    : null;
  const daysSinceSim = last ? Math.floor((Date.now() - last) / 86400000) : null;

  // Los temas completados bajan la prioridad de su Learning Path.
  const done = new Set(getTemaProgress(userId).filter((t) => t.completado).map((t) => t.temaId));
  Object.keys(ciaac).forEach((slug) => {
    const hechos = [...done].filter((id) => id.startsWith(`${slug}-`)).length;
    if (hechos > 0 && ciaac[slug].progreso === 0) ciaac[slug].progreso = 1;
  });

  return { ciaac, la, flashRepasar, daysSinceSim };
}

function scoreCandidate(c: ResourceCandidate, s: Signals, intake: StudyIntake): number {
  let score = 50;

  if (c.kind === "learning_path") {
    const slug = c.id.slice(3);
    const prog = s.ciaac[slug]?.progreso ?? 0;
    if (prog >= 100) return -100;
    score += 25 + (100 - prog) * 0.2;
  }

  if (c.kind === "cuestionario") {
    if (intake.track === "ciaac") {
      const slug = c.id.slice(5);
      const st = s.ciaac[slug];
      if (!st || st.answered === 0) score += 30;
      else score += (100 - st.avg) * 0.6;
    } else {
      const key = c.id.slice(5);
      const st = s.la[key] ?? s.la[key.split(":")[0]];
      if (!st || st.total === 0) score += 28;
      else score += (100 - (st.correct / st.total) * 100) * 0.6;
    }
  }

  if (c.kind === "flashcards") score += Math.min(40, s.flashRepasar * 3);

  if (c.kind === "banco") score += 5;

  if (c.kind === "simulador") {
    const puedeCompleto = intake.minutes >= 45 && intake.mood !== "cero";
    const urgente = intake.urgency === "naranja" || intake.urgency === "rojo";
    const hace = s.daysSinceSim;
    if (!puedeCompleto) return -100;
    score += urgente ? 45 : 10;
    if (hace === null) score += 15;
    else if (hace < 3) score -= 40;
  }

  if (c.kind === "prueba") {
    score += intake.mood === "cero" ? 35 : 8;
  }

  // Ánimo: con cero ganas se prefieren actividades cortas; a tope, las largas.
  if (intake.mood === "cero") score += c.minutes <= 10 ? 15 : -10;
  if (intake.mood === "atope") score += c.minutes >= 15 ? 10 : 0;

  return score;
}

/** Minutos de break según la duración total pedida. */
function breakPlan(minutes: number): { every: number; length: number } | null {
  if (minutes <= 25) return null;
  if (minutes <= 60) return { every: 30, length: 5 };
  return { every: 45, length: 8 };
}

export interface BuiltPlan {
  activities: PlanActivity[];
  intro: string;
  /** Los candidatos que se consideraron (para la capa opcional de IA). */
  considered: ResourceCandidate[];
}

export function buildStudyPlan(
  userId: string,
  intake: StudyIntake,
  opts: { allowLocked: boolean; nombre?: string },
): BuiltPlan {
  const catalog = buildCatalog({ track: intake.track, allowLocked: opts.allowLocked });
  const signals = readSignals(userId);

  const q = norm(intake.tema.trim());
  const scored = catalog.map((c) => ({ ...c, score: scoreCandidate(c, signals, intake) }));

  let pool = scored.filter((c) => c.score > -50);
  if (q.length >= 3) {
    const words = q.split(/\s+/).filter((w) => w.length >= 3);
    const matches = pool.filter((c) => words.some((w) => norm(c.keywords).includes(w)));
    if (matches.length > 0) {
      pool = matches.map((c) => ({ ...c, score: c.score + 1000 }));
      const prueba = scored.find((c) => c.kind === "prueba");
      if (prueba && !pool.some((c) => c.kind === "prueba")) pool.push(prueba);
    }
  }

  pool.sort((a, b) => b.score - a.score);

  // Selección voraz con variedad: cada repetición del mismo tipo pesa menos.
  const picked: ResourceCandidate[] = [];
  const usedKind: Record<string, number> = {};
  let restante = intake.minutes;
  const remaining = [...pool];

  while (restante >= 8 && remaining.length > 0 && picked.length < 8) {
    remaining.sort(
      (a, b) => b.score - (usedKind[b.kind] ?? 0) * 22 - (a.score - (usedKind[a.kind] ?? 0) * 22),
    );
    const next = remaining.shift();
    if (!next) break;
    const minutes = Math.min(next.minutes, Math.max(8, restante));
    picked.push({ ...next, minutes });
    usedKind[next.kind] = (usedKind[next.kind] ?? 0) + 1;
    restante -= minutes;
  }

  if (picked.length === 0 && pool.length > 0) {
    picked.push({ ...pool[0], minutes: intake.minutes });
  }

  // Breaks: nunca cortan una actividad, entran entre una y la siguiente.
  const bp = breakPlan(intake.minutes);
  const activities: PlanActivity[] = [];
  let acumulado = 0;
  let desdeUltimoBreak = 0;
  picked.forEach((a, i) => {
    activities.push({
      id: a.id,
      kind: a.kind,
      titulo: a.titulo,
      detalle: a.detalle,
      icon: a.icon,
      minutes: a.minutes,
      ...(a.to ? { to: a.to } : {}),
      ...(a.search ? { search: a.search } : {}),
    });
    acumulado += a.minutes;
    desdeUltimoBreak += a.minutes;
    const esUltima = i === picked.length - 1;
    if (bp && !esUltima && desdeUltimoBreak >= bp.every) {
      activities.push({
        id: `break:${acumulado}`,
        kind: "break",
        titulo: "Break",
        detalle: "Estírate, toma agua y respira. Pathy te espera.",
        icon: "clock",
        minutes: bp.length,
      });
      desdeUltimoBreak = 0;
    }
  });

  const nombre = opts.nombre ? `, ${opts.nombre}` : "";
  const foco = intake.tema.trim()
    ? `Le entramos a ${intake.tema.trim()}`
    : picked[0]
      ? `Hoy empezamos con ${picked[0].titulo}`
      : "Armé algo ligero para hoy";
  const intro = `Listo${nombre}: vienes ${MOOD_LABEL[intake.mood]} y tenemos ${intake.minutes} minutos. ${foco}. Los tiempos son aproximados, tú marcas el ritmo.`;

  return { activities, intro, considered: pool.slice(0, 24) };
}
