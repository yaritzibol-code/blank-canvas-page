/**
 * Análisis de Pathy: el informe completo de la preparación de la estudiante.
 *
 * Todo lo que devuelve sale de datos reales del store (intentos de
 * cuestionario y simulador, días de estudio, bitácora, actividad y progreso de
 * temas). No hay texto motivacional inventado ni cifras de ejemplo: si no hay
 * datos, se dice que no los hay. Cada señal expone el dato que la sustenta
 * para que la estudiante pueda comprobarla.
 */
import {
  getActivity,
  getBitacora,
  getFlashStates,
  getQuizAttempts,
  getSimAttempts,
  getStreak,
  getStudyDays,
  getTemaProgress,
} from "./domain";
import { progresoPorRuta, estimatedReadiness, type RutaPerf } from "./analytics";
import { generoDe, adjetivo, type Genero } from "./genero";
import { todayKey } from "./db";
import type { BitacoraEntry, User } from "./types";

const DAY = 86400000;

export type SignalTone = "bien" | "ojo" | "riesgo" | "neutro";

export interface PathySignal {
  id: string;
  tono: SignalTone;
  titulo: string;
  /** Explicación en una o dos frases. */
  detalle: string;
  /** El número concreto que sostiene la señal ("62% de aciertos", "3 días"). */
  dato: string;
}

export interface PathyAccion {
  id: string;
  titulo: string;
  porque: string;
  /** Ruta interna a la que lleva el botón. */
  to: string;
  search?: Record<string, string | number>;
  cta: string;
}

export interface PathyMetric {
  /** Valor actual; null cuando aún no hay datos suficientes. */
  valor: number | null;
  /** Diferencia contra el periodo anterior comparable; null si no aplica. */
  delta: number | null;
  /** Tamaño de muestra que sostiene el valor. */
  muestra: number;
}

export interface PathyReport {
  /** Momento del cálculo, para mostrar "actualizado hace X". */
  generadoEn: string;
  saludo: string;
  /** Diagnóstico en una frase; el titular del informe. */
  titular: string;
  resumen: string;
  /** true cuando no hay ni un cuestionario ni un simulador respondido. */
  sinDatos: boolean;

  aciertos: PathyMetric;
  preparacion: PathyMetric;
  ritmo: {
    racha: number;
    diasActivos7: number;
    diasActivos30: number;
    minutos7: number;
    minutosPrevios7: number;
    preguntas7: number;
  };
  materias: {
    fuertes: RutaPerf[];
    debiles: RutaPerf[];
    sinPracticar: RutaPerf[];
  };
  lineaAerea: RutaPerf[];
  /** Misma clasificación que CIAAC, pero para los manuales de la convocatoria. */
  manuales: {
    fuertes: RutaPerf[];
    debiles: RutaPerf[];
    sinPracticar: RutaPerf[];
  };
  animo: {
    entradas: number;
    motivacion: number | null;
    concentracion: number | null;
    diasBajos14: number;
    temaRepetido: { tema: string; veces: number } | null;
  };
  senales: PathySignal[];
  plan: PathyAccion[];
}

/* ───────────────────────── utilidades ───────────────────────── */

const pct = (c: number, t: number) => (t > 0 ? Math.round((c / t) * 100) : null);

/** Aciertos y total respondido en la ventana [desde, hasta). */
function aciertosEntre(userId: string, desde: number, hasta: number) {
  let correct = 0;
  let total = 0;
  const dentro = (iso: string) => {
    const ts = new Date(iso).getTime();
    return ts >= desde && ts < hasta;
  };
  getQuizAttempts(userId)
    .filter((a) => dentro(a.date))
    .forEach((a) => {
      correct += a.correct;
      total += a.total;
    });
  getSimAttempts(userId)
    .filter((a) => dentro(a.date))
    .forEach((a) => {
      correct += a.correct;
      // Sólo lo que realmente contestó: las que dejó en blanco no son
      // "preguntas respondidas" aunque cuenten mal en la calificación.
      total += a.answered ?? a.total;
    });
  return { correct, total };
}

/** Segundos de estudio de los últimos `dias` días, terminando hace `offset` días. */
function segundosEstudio(userId: string, dias: number, offset = 0): { secs: number; activos: number } {
  const days = getStudyDays(userId);
  let secs = 0;
  let activos = 0;
  for (let i = offset; i < offset + dias; i++) {
    const d = new Date(Date.now() - i * DAY);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const v = days[key] ?? 0;
    secs += v;
    if (v > 0) activos++;
  }
  return { secs, activos };
}

function promedio(nums: number[]): number | null {
  const v = nums.filter((n) => n > 0);
  if (v.length === 0) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

function temaMasRepetido(entradas: BitacoraEntry[]): { tema: string; veces: number } | null {
  const counts = new Map<string, number>();
  entradas.forEach((e) => e.materias.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top && top[1] > 1 ? { tema: top[0], veces: top[1] } : null;
}

/* ───────────────────────── informe ───────────────────────── */

/** Umbral por debajo del cual una materia se considera débil. */
const UMBRAL_DEBIL = 60;
/** Umbral a partir del cual una materia se considera dominada. */
const UMBRAL_FUERTE = 80;
/** Días sin estudiar que encienden la alerta de constancia. */
const DIAS_INACTIVA = 3;

export function pathyReport(user: User): PathyReport {
  const userId = user.id;
  const g: Genero = generoDe(user);
  const nombre = user.nombre.split(" ")[0] || "piloto";
  const ahora = Date.now();

  const ruta = progresoPorRuta(userId);
  const conDatos = [...ruta.ciaac, ...ruta.lineaAerea, ...ruta.aeronave].filter((m) => m.avg !== null && m.answered > 0);
  const sinDatos = conDatos.length === 0;

  /* Aciertos: últimos 30 días contra los 30 anteriores. */
  const act = aciertosEntre(userId, ahora - 30 * DAY, ahora);
  const prev = aciertosEntre(userId, ahora - 60 * DAY, ahora - 30 * DAY);
  const actPct = pct(act.correct, act.total);
  const prevPct = pct(prev.correct, prev.total);
  const aciertos: PathyMetric = {
    valor: actPct,
    delta: actPct !== null && prevPct !== null ? actPct - prevPct : null,
    muestra: act.total,
  };

  const readiness = estimatedReadiness(userId);
  const preparacion: PathyMetric = {
    valor: readiness,
    delta: null,
    muestra: act.total + aciertosEntre(userId, 0, ahora - 30 * DAY).total,
  };

  const semana = segundosEstudio(userId, 7);
  const semanaPrevia = segundosEstudio(userId, 7, 7);
  const mes = segundosEstudio(userId, 30);
  const preguntas7 = aciertosEntre(userId, ahora - 7 * DAY, ahora).total;
  const ritmo = {
    racha: getStreak(userId),
    diasActivos7: semana.activos,
    diasActivos30: mes.activos,
    minutos7: Math.round(semana.secs / 60),
    minutosPrevios7: Math.round(semanaPrevia.secs / 60),
    preguntas7,
  };

  /* Materias: sólo se clasifica lo que tiene práctica real detrás. */
  const practicadas = ruta.ciaac.filter((m) => m.avg !== null && m.answered >= 5);
  const fuertes = practicadas.filter((m) => (m.avg ?? 0) >= UMBRAL_FUERTE).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  const debiles = practicadas.filter((m) => (m.avg ?? 100) < UMBRAL_DEBIL).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));
  const sinPracticar = ruta.ciaac.filter((m) => m.answered === 0);

  /* Manuales de Línea Aérea: misma clasificación que CIAAC. */
  const laPracticadas = ruta.lineaAerea.filter((m) => m.avg !== null && m.answered >= 5);
  const laFuertes = laPracticadas.filter((m) => (m.avg ?? 0) >= UMBRAL_FUERTE).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  const laDebiles = laPracticadas.filter((m) => (m.avg ?? 100) < UMBRAL_DEBIL).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));
  const laSinPracticar = ruta.lineaAerea.filter((m) => m.answered === 0);

  /* Ánimo: sólo lo que la estudiante escribió en su bitácora. */
  const bitacora = getBitacora(userId);
  const ultimas14 = bitacora.filter((e) => new Date(e.date).getTime() >= ahora - 14 * DAY);
  const animo = {
    entradas: ultimas14.length,
    motivacion: promedio(ultimas14.map((e) => e.motiv)),
    concentracion: promedio(ultimas14.map((e) => e.conc)),
    diasBajos14: ultimas14.filter((e) => e.emotionIcon === "alert" || e.emotionIcon === "cloud").length,
    temaRepetido: temaMasRepetido(ultimas14),
  };

  const senales = construirSenales({ g, ritmo, aciertos, debiles, fuertes, sinPracticar, animo, ruta, userId, sinDatos });
  const plan = construirPlan({ debiles, sinPracticar, ritmo, ruta, animo, sinDatos, user });

  return {
    generadoEn: new Date().toISOString(),
    saludo: `Hola, ${nombre}`,
    titular: construirTitular({ g, sinDatos, aciertos, debiles, fuertes, ritmo }),
    resumen: construirResumen({ nombre, sinDatos, aciertos, ritmo, debiles, fuertes, preparacion }),
    sinDatos,
    aciertos,
    preparacion,
    ritmo,
    materias: { fuertes, debiles, sinPracticar },
    lineaAerea: ruta.lineaAerea.filter((m) => m.answered > 0),
    manuales: { fuertes: laFuertes, debiles: laDebiles, sinPracticar: laSinPracticar },
    animo,
    senales,
    plan,
  };
}

function construirTitular(c: {
  g: Genero;
  sinDatos: boolean;
  aciertos: PathyMetric;
  debiles: RutaPerf[];
  fuertes: RutaPerf[];
  ritmo: PathyReport["ritmo"];
}): string {
  if (c.sinDatos) return "Aún no tengo con qué analizarte";
  if (c.ritmo.diasActivos7 === 0) return "Llevas una semana sin volar";
  if (c.debiles.length >= 3) return `${c.debiles.length} materias por debajo del ${UMBRAL_DEBIL}%`;
  if ((c.aciertos.delta ?? 0) >= 5) return "Vas mejorando y se nota";
  if ((c.aciertos.delta ?? 0) <= -5) return "Tu porcentaje bajó este mes";
  if (c.debiles.length > 0) return `${c.debiles[0].name} es tu punto débil`;
  if (c.fuertes.length >= 3) return `Vas ${adjetivo(c.g, "sólid")}: ${c.fuertes.length} materias dominadas`;
  return "Vuelo estable, sigue así";
}

function construirResumen(c: {
  nombre: string;
  sinDatos: boolean;
  aciertos: PathyMetric;
  ritmo: PathyReport["ritmo"];
  debiles: RutaPerf[];
  fuertes: RutaPerf[];
  preparacion: PathyMetric;
}): string {
  if (c.sinDatos) {
    return `${c.nombre}, todavía no has respondido cuestionarios ni simuladores, así que no tengo nada real que analizar. Haz uno corto y en cuanto termines aparece aquí tu diagnóstico completo: aciertos por materia, ritmo de estudio y qué atacar primero.`;
  }
  const partes: string[] = [];
  if (c.aciertos.valor !== null) {
    partes.push(
      `En los últimos 30 días respondiste ${c.aciertos.muestra} ${c.aciertos.muestra === 1 ? "pregunta" : "preguntas"} con ${c.aciertos.valor}% de aciertos${
        c.aciertos.delta !== null
          ? c.aciertos.delta > 0
            ? `, ${c.aciertos.delta} puntos más que el mes anterior`
            : c.aciertos.delta < 0
              ? `, ${Math.abs(c.aciertos.delta)} puntos menos que el mes anterior`
              : ", igual que el mes anterior"
          : ""
      }.`,
    );
  }
  partes.push(
    c.ritmo.diasActivos7 > 0
      ? `Estudiaste ${c.ritmo.diasActivos7} de los últimos 7 días (${c.ritmo.minutos7} min).`
      : "No registras estudio en los últimos 7 días.",
  );
  if (c.fuertes.length > 0) partes.push(`Dominas ${c.fuertes[0].name} (${c.fuertes[0].avg}%).`);
  if (c.debiles.length > 0)
    partes.push(`Lo que más te cuesta es ${c.debiles[0].name} (${c.debiles[0].avg}%).`);
  if (c.preparacion.valor !== null)
    partes.push(
      `Tu preparación estimada es ${c.preparacion.valor}%: mide tu desempeño en práctica, no garantiza el resultado del examen.`,
    );
  return partes.join(" ");
}

function construirSenales(c: {
  g: Genero;
  ritmo: PathyReport["ritmo"];
  aciertos: PathyMetric;
  debiles: RutaPerf[];
  fuertes: RutaPerf[];
  sinPracticar: RutaPerf[];
  animo: PathyReport["animo"];
  ruta: { ciaac: RutaPerf[]; lineaAerea: RutaPerf[] };
  userId: string;
  sinDatos: boolean;
}): PathySignal[] {
  const s: PathySignal[] = [];

  /* Constancia */
  if (c.ritmo.racha >= 7) {
    s.push({
      id: "racha",
      tono: "bien",
      titulo: "Tu constancia es tu mejor activo",
      detalle: "Llevas una racha larga. En preparación de examen, la frecuencia pesa más que las sesiones maratónicas.",
      dato: `${c.ritmo.racha} días seguidos`,
    });
  } else if (c.ritmo.diasActivos7 === 0) {
    s.push({
      id: "inactiva",
      tono: "riesgo",
      titulo: "Una semana sin estudiar",
      detalle: "El olvido se acelera después del tercer día sin repasar. Una sesión corta hoy vale más que un maratón el domingo.",
      dato: "0 de 7 días",
    });
  } else if (c.ritmo.diasActivos7 <= DIAS_INACTIVA) {
    s.push({
      id: "ritmo-bajo",
      tono: "ojo",
      titulo: "Ritmo irregular",
      detalle: "Estudiar salteado hace que cada sesión empiece repasando lo de la anterior. Subir a 5 días te rinde más aunque sean sesiones cortas.",
      dato: `${c.ritmo.diasActivos7} de 7 días`,
    });
  }

  /* Tiempo semanal contra la semana previa */
  if (c.ritmo.minutosPrevios7 > 0 && c.ritmo.minutos7 > 0) {
    const dif = c.ritmo.minutos7 - c.ritmo.minutosPrevios7;
    const cambio = Math.round((dif / c.ritmo.minutosPrevios7) * 100);
    if (cambio <= -30) {
      s.push({
        id: "tiempo-baja",
        tono: "ojo",
        titulo: "Bajaste el tiempo de estudio",
        detalle: "Esta semana dedicaste bastante menos que la anterior. Si fue algo puntual, ignórame; si no, ajusta la meta a algo que sí puedas sostener.",
        dato: `${c.ritmo.minutos7} min vs ${c.ritmo.minutosPrevios7} min`,
      });
    } else if (cambio >= 40) {
      s.push({
        id: "tiempo-sube",
        tono: "bien",
        titulo: "Subiste el ritmo",
        detalle: "Dedicaste bastante más tiempo que la semana pasada. Cuida que el aumento no venga con caída de aciertos: cansancio también se nota en el porcentaje.",
        dato: `${c.ritmo.minutos7} min vs ${c.ritmo.minutosPrevios7} min`,
      });
    }
  }

  /* Tendencia de aciertos */
  if (c.aciertos.delta !== null && c.aciertos.muestra >= 20) {
    if (c.aciertos.delta <= -5) {
      s.push({
        id: "aciertos-baja",
        tono: "riesgo",
        titulo: "Tu porcentaje de aciertos bajó",
        detalle: "Puede ser que estés practicando materias nuevas y más difíciles, o que estés respondiendo con prisa. Revisa las explicaciones de los errores antes de seguir avanzando.",
        dato: `${c.aciertos.delta} puntos vs el mes anterior`,
      });
    } else if (c.aciertos.delta >= 5) {
      s.push({
        id: "aciertos-sube",
        tono: "bien",
        titulo: "Estás mejorando de verdad",
        detalle: "La mejora está medida sobre preguntas reales, no sobre sensación. Mantén el mismo esquema de estudio que traes.",
        dato: `+${c.aciertos.delta} puntos vs el mes anterior`,
      });
    }
  }

  /* Materias débiles y no practicadas */
  if (c.debiles.length > 0) {
    const lista = c.debiles.slice(0, 3).map((m) => `${m.name} (${m.avg}%)`).join(", ");
    s.push({
      id: "debiles",
      tono: c.debiles.length >= 3 ? "riesgo" : "ojo",
      titulo: c.debiles.length === 1 ? "Una materia por debajo del umbral" : `${c.debiles.length} materias por debajo del umbral`,
      detalle: `Por debajo del ${UMBRAL_DEBIL}% conviene volver al material antes de seguir practicando: repetir preguntas sin leer la teoría fija los errores. Empieza por ${lista}.`,
      dato: `${c.debiles[0].avg}% en ${c.debiles[0].name}`,
    });
  }
  if (c.sinPracticar.length >= 3 && !c.sinDatos) {
    s.push({
      id: "sin-practicar",
      tono: "ojo",
      titulo: "Hay materias que no has tocado",
      detalle: `Tu promedio se ve mejor de lo que es porque sólo mide lo que has practicado. Faltan ${c.sinPracticar.map((m) => m.name).slice(0, 3).join(", ")}${c.sinPracticar.length > 3 ? " y otras" : ""}.`,
      dato: `${c.sinPracticar.length} de ${c.ruta.ciaac.length} materias sin práctica`,
    });
  }
  if (c.fuertes.length > 0) {
    s.push({
      id: "fuertes",
      tono: "bien",
      titulo: c.fuertes.length === 1 ? "Una materia dominada" : `${c.fuertes.length} materias dominadas`,
      detalle: `Arriba del ${UMBRAL_FUERTE}% ya no necesitas volumen, sólo repaso de mantenimiento. Invierte el tiempo que ahorras en lo que va abajo.`,
      dato: `${c.fuertes[0].name}: ${c.fuertes[0].avg}%`,
    });
  }

  /* Estado de ánimo declarado en la bitácora */
  if (c.animo.entradas >= 2) {
    if (c.animo.diasBajos14 >= 3) {
      s.push({
        id: "animo",
        tono: "ojo",
        titulo: "Varios días de frustración o ansiedad",
        detalle: "Lo registraste tú en la bitácora. No es un problema de capacidad: suele venir de sesiones demasiado largas o de atacar de frente la materia que peor llevas. Alterna con una que domines.",
        dato: `${c.animo.diasBajos14} de ${c.animo.entradas} entradas en 14 días`,
      });
    }
    if (c.animo.concentracion !== null && c.animo.concentracion <= 2.5) {
      s.push({
        id: "concentracion",
        tono: "ojo",
        titulo: "Te cuesta concentrarte",
        detalle: "Con esa concentración declarada, sesiones de 25 minutos con descanso rinden más que una hora seguida.",
        dato: `${c.animo.concentracion}/5 de concentración`,
      });
    }
    if (c.animo.temaRepetido) {
      s.push({
        id: "tema-repetido",
        tono: "neutro",
        titulo: "Un tema se repite en tu bitácora",
        detalle: `"${c.animo.temaRepetido.tema}" aparece varias veces como lo que más te costó. Vale la pena resolverlo con Yaris antes de que se vuelva un hueco fijo.`,
        dato: `${c.animo.temaRepetido.veces} menciones`,
      });
    }
  } else if (!c.sinDatos) {
    s.push({
      id: "sin-bitacora",
      tono: "neutro",
      titulo: "Sin bitácora no veo la mitad del cuadro",
      detalle: "Los números dicen qué fallaste, no por qué. Con dos o tres entradas puedo cruzar tu ánimo y tu concentración con el desempeño.",
      dato: `${c.animo.entradas} ${c.animo.entradas === 1 ? "entrada" : "entradas"} en 14 días`,
    });
  }

  /* Línea Aérea */
  const la = c.ruta.lineaAerea.filter((m) => m.answered > 0);
  if (la.length > 0) {
    const peor = la.reduce((a, b) => ((a.avg ?? 100) <= (b.avg ?? 100) ? a : b));
    if ((peor.avg ?? 100) < UMBRAL_DEBIL) {
      s.push({
        id: "la-debil",
        tono: "ojo",
        titulo: "Un manual de línea aérea va bajo",
        detalle: "En la convocatoria las preguntas salen directo del manual: cuando el porcentaje va bajo, casi siempre falta lectura, no práctica.",
        dato: `${peor.name}: ${peor.avg}%`,
      });
    }
  }

  const orden: Record<SignalTone, number> = { riesgo: 0, ojo: 1, bien: 2, neutro: 3 };
  return s.sort((a, b) => orden[a.tono] - orden[b.tono]);
}

function construirPlan(c: {
  debiles: RutaPerf[];
  sinPracticar: RutaPerf[];
  ritmo: PathyReport["ritmo"];
  ruta: { ciaac: RutaPerf[]; lineaAerea: RutaPerf[] };
  animo: PathyReport["animo"];
  sinDatos: boolean;
  user: User;
}): PathyAccion[] {
  const plan: PathyAccion[] = [];

  if (c.sinDatos) {
    plan.push({
      id: "primer-cuestionario",
      titulo: "Haz tu primer cuestionario",
      porque: "Con 20 preguntas ya puedo medir por materia y decirte por dónde empezar.",
      to: "/dashboard/banco",
      cta: "Ir a cuestionarios",
    });
    return plan;
  }

  if (c.debiles.length > 0) {
    const m = c.debiles[0];
    plan.push({
      id: `reforzar-${m.key}`,
      titulo: `Refuerza ${m.name}`,
      porque: `Es tu porcentaje más bajo (${m.avg}%) y es la que más puede subirte el promedio general.`,
      to: "/cuestionario",
      search: { materias: m.key, qty: 20 },
      cta: "Cuestionario de 20",
    });
  }

  if (c.sinPracticar.length > 0) {
    const m = c.sinPracticar[0];
    plan.push({
      id: `abrir-${m.key}`,
      titulo: `Estrena ${m.name}`,
      porque: "No la has practicado, así que hoy no cuenta en tu promedio ni sabes cómo la llevas.",
      to: "/cuestionario",
      search: { materias: m.key, qty: 20 },
      cta: "Primer cuestionario",
    });
  }

  if (c.ritmo.diasActivos7 <= DIAS_INACTIVA) {
    plan.push({
      id: "recordatorio",
      titulo: "Agenda un recordatorio diario",
      porque: `Sólo estudiaste ${c.ritmo.diasActivos7} de los últimos 7 días. Una hora fija sostiene la racha mejor que la fuerza de voluntad.`,
      to: "/dashboard/recordatorios",
      cta: "Configurar recordatorio",
    });
  }

  const la = c.ruta.lineaAerea.filter((m) => m.answered > 0);
  if (c.user.focoRuta === "linea-aerea" || la.length > 0) {
    const peor = la.length > 0 ? la.reduce((a, b) => ((a.avg ?? 100) <= (b.avg ?? 100) ? a : b)) : null;
    plan.push({
      id: "linea-aerea",
      titulo: peor ? `Repasa el manual de ${peor.name}` : "Practica los manuales de la convocatoria",
      porque: peor
        ? `Vas en ${peor.avg}% y las preguntas del proceso salen literal del manual.`
        : "Los cuestionarios por manual son la práctica más parecida al examen de ingreso.",
      to: "/dashboard/linea-aerea",
      cta: "Ir a Línea Aérea",
    });
  }

  if (c.animo.entradas < 2) {
    plan.push({
      id: "bitacora",
      titulo: "Escribe tu bitácora de hoy",
      porque: "Con tu ánimo y concentración puedo explicarte por qué bajan los aciertos, no sólo que bajaron.",
      to: "/dashboard/bitacora",
      cta: "Abrir bitácora",
    });
  }

  return plan.slice(0, 4);
}

/* ───────────────────────── métricas de apoyo ───────────────────────── */

/** Actividad de hoy: lo que alimenta el "en vivo" del encabezado. */
export function pathyPulso(userId: string): { eventosHoy: number; minutosHoy: number; ultimaActividad: string | null } {
  const hoy = todayKey();
  const days = getStudyDays(userId);
  const eventos = getActivity(userId).filter((a) => a.date.slice(0, 10) === hoy);
  const temas = getTemaProgress(userId).filter((t) => t.fecha.slice(0, 10) === hoy).length;
  const flash = getFlashStates(userId).filter((f) => f.updatedAt.slice(0, 10) === hoy).length;
  return {
    eventosHoy: eventos.length + temas + flash,
    minutosHoy: Math.round((days[hoy] ?? 0) / 60),
    ultimaActividad: getActivity(userId)[0]?.date ?? null,
  };
}
