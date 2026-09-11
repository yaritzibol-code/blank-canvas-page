/**
 * FlightPoints — motor de recompensas (sólo servidor).
 *
 * Regla de oro: el navegador NUNCA dice cuántos puntos vale algo. El servidor
 * lee la actividad real ya sincronizada del usuario (`user_state`), la vuelve a
 * derivar en "eventos" con una llave única y determinista, y crea una
 * transacción por evento que todavía no exista. Por eso el sistema es
 * idempotente: correrlo mil veces no duplica un solo punto, y sirve igual para
 * recompensar en caliente que para hacer el backfill histórico.
 */
import { LP_CATEGORIES, findLp, subjectSequence } from "@/lib/lp/taxonomy";
import { diaMx, sumaDias, type FpProgram } from "./shared";

type Row = Record<string, unknown>;

/* ───────────────────────── Reglas ───────────────────────── */

export interface FpRule {
  key: string;
  label: string;
  categoria: string;
  value: Record<string, number>;
  enabled: boolean;
}

export type RuleMap = Map<string, FpRule>;

function fpDe(rules: RuleMap, key: string): number | null {
  const r = rules.get(key);
  if (!r || !r.enabled) return null;
  const fp = Number(r.value?.["fp"] ?? 0);
  return Number.isFinite(fp) && fp > 0 ? Math.round(fp) : null;
}

function num(rules: RuleMap, key: string, campo: string, fallback: number): number {
  const v = Number(rules.get(key)?.value?.[campo]);
  return Number.isFinite(v) ? v : fallback;
}

/* ───────────────────────── Evento candidato ───────────────────────── */

export interface FpEvento {
  eventKey: string;
  ruleKey: string;
  kind: "base" | "bonus" | "racha" | "logro";
  amount: number;
  program: FpProgram | null;
  activityType: string;
  activityId: string | null;
  activityLabel: string;
  detail: string | null;
  occurredAt: string;
  /** Cuando algo huele a farming: se registra en 0 y se levanta alerta. */
  sospecha?: string;
}

/* ───────────────────────── Clasificación de programa ───────────────────────── */

const CIAAC_SLUGS = new Set(
  (LP_CATEGORIES.find((c) => c.id === "ciaac")?.subjects ?? []).map((s) => s.id.split("/")[1]),
);

/** Fuentes del módulo Aeronaves (B737): quedan fuera del sistema de FP. */
const FUENTES_EXCLUIDAS = new Set(["B737MAX", "B737", "737"]);

function esB737(texto: string | undefined | null): boolean {
  if (!texto) return false;
  return /737/i.test(texto);
}

function programaDeQuiz(a: Row): FpProgram | null {
  const answers = (a["answers"] as Row[] | undefined) ?? [];
  const fuentes = new Set(
    answers.map((r) => String(r["fuente"] ?? "").toUpperCase()).filter(Boolean),
  );
  if ([...fuentes].some((f) => FUENTES_EXCLUIDAS.has(f))) return null;
  if (esB737(a["titulo"] as string)) return null;
  if (fuentes.size > 0) return "LINEA_AEREA";
  const materias = (a["materias"] as string[] | undefined) ?? [];
  if (materias.some((m) => CIAAC_SLUGS.has(m))) return "CIAAC";
  if (materias.length > 0) return "LINEA_AEREA";
  return "GENERAL";
}

function programaDeLp(lpId: string): FpProgram | null {
  if (lpId.startsWith("ciaac/")) return "CIAAC";
  if (lpId.startsWith("linea-aerea/")) return "LINEA_AEREA";
  return null;
}

/* ───────────────────────── Derivación de eventos ───────────────────────── */

interface Estado {
  activity: Row[];
  quizzes: Row[];
  sims: Row[];
  temas: Row[];
  flash: Row[];
  logros: Row[];
  studyDays: Record<string, number>;
}

export function derivarEventos(estado: Estado, rules: RuleMap): FpEvento[] {
  const out: FpEvento[] = [];

  /* ── Materiales y temas de módulo (tema_progress sin prefijo lp:) ── */
  const fpMaterial = fpDe(rules, "material_completado");
  const completadosLp: { id: string; fecha: string }[] = [];
  estado.temas.forEach((t) => {
    if (!t["completado"]) return;
    const temaId = String(t["temaId"] ?? "");
    const fecha = String(t["fecha"] ?? new Date().toISOString());
    if (temaId.startsWith("lp:")) {
      completadosLp.push({ id: temaId.slice(3), fecha });
      return;
    }
    if (!fpMaterial || esB737(temaId)) return;
    out.push({
      eventKey: `material:${temaId}`,
      ruleKey: "material_completado",
      kind: "base",
      amount: fpMaterial,
      program: temaId.startsWith("linea-aerea") ? "LINEA_AEREA" : "CIAAC",
      activityType: "material",
      activityId: temaId,
      activityLabel: "Material completado",
      detail: temaId,
      occurredAt: fecha,
    });
  });

  /* ── Learning Paths ── */
  const fpLp = fpDe(rules, "learning_path");
  const hechos = new Map(completadosLp.map((c) => [c.id, c.fecha]));
  completadosLp.forEach(({ id, fecha }) => {
    const programa = programaDeLp(id);
    if (!fpLp || !programa) return;
    const info = findLp(id);
    out.push({
      eventKey: `lp:${id}`,
      ruleKey: "learning_path",
      kind: "base",
      amount: fpLp,
      program: programa,
      activityType: "learning_path",
      activityId: id,
      activityLabel: "Learning Path completado",
      detail: info ? `${info.subject.titulo} · ${info.item.titulo}` : id,
      occurredAt: fecha,
    });
  });

  /* ── Materia completa (todos los Learning Paths de la materia) ── */
  const fpMateria = fpDe(rules, "materia_completa");
  if (fpMateria) {
    LP_CATEGORIES.forEach((cat) => {
      const programa = programaDeLp(`${cat.id}/x`);
      if (!programa) return;
      cat.subjects.forEach((subject) => {
        const seq = subjectSequence(subject);
        if (seq.length === 0) return;
        const fechas = seq.map(({ item }) => hechos.get(item.id));
        if (fechas.some((f) => !f)) return;
        const ultima = fechas.map(String).sort().at(-1)!;
        out.push({
          eventKey: `materia:${subject.id}`,
          ruleKey: "materia_completa",
          kind: "base",
          amount: fpMateria,
          program: programa,
          activityType: "materia",
          activityId: subject.id,
          activityLabel: "Materia completa",
          detail: subject.titulo,
          occurredAt: ultima,
        });
      });
    });
  }

  /* ── Cuestionarios (escalón por tamaño + bonus por acierto) ── */
  const escalones = ["quiz_100", "quiz_50", "quiz_40", "quiz_30", "quiz_20", "quiz_10"];
  const porDiaQuiz = new Map<string, number>();
  [...estado.quizzes]
    .sort((a, b) => String(a["date"]).localeCompare(String(b["date"])))
    .forEach((q) => {
      const programa = programaDeQuiz(q);
      if (!programa) return;
      const total = Number(q["total"] ?? 0);
      const correct = Number(q["correct"] ?? 0);
      const id = String(q["id"] ?? "");
      const fecha = String(q["date"] ?? new Date().toISOString());
      if (!id || total <= 0) return;

      const escalon = escalones.find((k) => {
        const r = rules.get(k);
        return r?.enabled && total >= num(rules, k, "min", Infinity);
      });
      const base = escalon ? fpDe(rules, escalon) : null;
      if (!base || !escalon) return;

      // Anti-farming: menos de 2 segundos por pregunta no es un cuestionario real.
      const segundos = Number(q["durationMin"] ?? 0) * 60;
      const dia = diaMx(fecha);
      const enElDia = (porDiaQuiz.get(dia) ?? 0) + 1;
      porDiaQuiz.set(dia, enElDia);
      const sospecha =
        segundos > 0 && segundos < total * 2
          ? "Cuestionario resuelto demasiado rápido"
          : enElDia > 20
            ? "Más de 20 cuestionarios premiados en un día"
            : undefined;

      out.push({
        eventKey: `quiz:${id}`,
        ruleKey: escalon,
        kind: "base",
        amount: sospecha ? 0 : base,
        program: programa,
        activityType: "cuestionario",
        activityId: id,
        activityLabel: "Cuestionario completado",
        detail: `${total} preguntas · ${Math.round((correct / total) * 100)}%`,
        occurredAt: fecha,
        sospecha,
      });
      if (sospecha) return;

      const pct = (correct / total) * 100;
      const bonusKey = pct >= num(rules, "quiz_bonus_100", "pct", 100) ? "quiz_bonus_100" : pct >= num(rules, "quiz_bonus_90", "pct", 90) ? "quiz_bonus_90" : null;
      const bonus = bonusKey ? fpDe(rules, bonusKey) : null;
      if (bonusKey && bonus) {
        out.push({
          eventKey: `quizbonus:${id}`,
          ruleKey: bonusKey,
          kind: "bonus",
          amount: bonus,
          program: programa,
          activityType: "cuestionario",
          activityId: id,
          activityLabel: bonusKey === "quiz_bonus_100" ? "Bonus: 100% de aciertos" : "Bonus: 90% o más",
          detail: `${Math.round(pct)}% de aciertos`,
          occurredAt: fecha,
        });
      }
    });

  /* ── Simuladores: cuentan como cuestionario CIAAC ── */
  estado.sims.forEach((s) => {
    const total = Number(s["total"] ?? 0);
    const id = String(s["id"] ?? "");
    if (!id || total <= 0) return;
    const escalon = escalones.find((k) => {
      const r = rules.get(k);
      return r?.enabled && total >= num(rules, k, "min", Infinity);
    });
    const base = escalon ? fpDe(rules, escalon) : null;
    if (!base || !escalon) return;
    out.push({
      eventKey: `sim:${id}`,
      ruleKey: escalon,
      kind: "base",
      amount: base,
      program: "CIAAC",
      activityType: "cuestionario",
      activityId: id,
      activityLabel: "Simulador completado",
      detail: `${total} preguntas · ${Math.round(Number(s["scorePct"] ?? 0))}%`,
      occurredAt: String(s["date"] ?? new Date().toISOString()),
    });
  });

  /* ── Flashcards ── */
  const fpFlash = fpDe(rules, "flash_sesion");
  const fpFlash50 = fpDe(rules, "flash_50");
  const minCards = num(rules, "flash_sesion", "min_cards", 10);
  const min50 = num(rules, "flash_50", "min_cards", 50);
  estado.flash.forEach((s) => {
    const total = Number(s["total"] ?? 0);
    const id = String(s["id"] ?? "");
    const fecha = String(s["date"] ?? new Date().toISOString());
    const materia = String(s["materia"] ?? "");
    if (!id || esB737(materia)) return;
    const programa: FpProgram = CIAAC_SLUGS.has(materia) ? "CIAAC" : "GENERAL";
    if (fpFlash && total >= minCards) {
      out.push({
        eventKey: `flash:${id}`,
        ruleKey: "flash_sesion",
        kind: "base",
        amount: fpFlash,
        program: programa,
        activityType: "flashcards",
        activityId: id,
        activityLabel: "Sesión de Flashcards",
        detail: `${total} tarjetas`,
        occurredAt: fecha,
      });
    }
    if (fpFlash50 && total >= min50) {
      out.push({
        eventKey: `flash50:${id}`,
        ruleKey: "flash_50",
        kind: "bonus",
        amount: fpFlash50,
        program: programa,
        activityType: "flashcards",
        activityId: id,
        activityLabel: "50 flashcards en una sesión",
        detail: `${total} tarjetas`,
        occurredAt: fecha,
      });
    }
  });

  /* ── Estudio con Pathy y estudio real ── */
  const fpPathy = fpDe(rules, "pathy_sesion");
  const minPathy = num(rules, "pathy_sesion", "min_minutos", 5);
  const fp30 = fpDe(rules, "estudio_30min");
  const min30 = num(rules, "estudio_30min", "min_minutos", 30);
  estado.activity.forEach((a) => {
    const kind = String(a["kind"] ?? "");
    if (kind !== "pathy_session") return;
    const minutos = Number(a["durationMin"] ?? 0);
    const id = String(a["id"] ?? "");
    const fecha = String(a["date"] ?? new Date().toISOString());
    if (!id) return;
    if (fpPathy && minutos >= minPathy) {
      out.push({
        eventKey: `pathy:${id}`,
        ruleKey: "pathy_sesion",
        kind: "base",
        amount: fpPathy,
        program: "GENERAL",
        activityType: "pathy",
        activityId: id,
        activityLabel: "Sesión con Pathy",
        detail: `${minutos} min`,
        occurredAt: fecha,
      });
    }
    if (fp30 && minutos >= min30) {
      out.push({
        eventKey: `pathy30:${id}`,
        ruleKey: "estudio_30min",
        kind: "bonus",
        amount: fp30,
        program: "GENERAL",
        activityType: "pathy",
        activityId: id,
        activityLabel: "30 minutos de estudio real",
        detail: `${minutos} min`,
        occurredAt: fecha,
      });
    }
  });

  /* ── Rachas: una recompensa por tramo consecutivo, identificada por su día inicial ── */
  const rachas = tramosDeRacha(estado);
  [
    { key: "racha_3", dias: num(rules, "racha_3", "dias", 3), label: "Racha de 3 días" },
    { key: "racha_7", dias: num(rules, "racha_7", "dias", 7), label: "Racha de 7 días" },
  ].forEach(({ key, dias, label }) => {
    const fp = fpDe(rules, key);
    if (!fp) return;
    rachas.forEach((tramo) => {
      if (tramo.largo < dias) return;
      out.push({
        eventKey: `${key}:${tramo.inicio}`,
        ruleKey: key,
        kind: "racha",
        amount: fp,
        program: "GENERAL",
        activityType: "racha",
        activityId: tramo.inicio,
        activityLabel: label,
        detail: `Desde ${tramo.inicio}`,
        occurredAt: `${sumaDias(tramo.inicio, dias - 1)}T12:00:00.000Z`,
      });
    });
  });

  /* ── Logros ── */
  const fpLogro = fpDe(rules, "logro");
  if (fpLogro) {
    estado.logros.forEach((l) => {
      const logroId = String(l["logroId"] ?? "");
      if (!logroId) return;
      out.push({
        eventKey: `logro:${logroId}`,
        ruleKey: "logro",
        kind: "logro",
        amount: fpLogro,
        program: "GENERAL",
        activityType: "logro",
        activityId: logroId,
        activityLabel: "Logro desbloqueado",
        detail: logroId,
        occurredAt: String(l["at"] ?? new Date().toISOString()),
      });
    });
  }

  return out;
}

/** Tramos consecutivos de días con estudio real (mismo criterio que la racha visible). */
export function tramosDeRacha(estado: Estado): { inicio: string; largo: number }[] {
  const activos = new Set<string>();
  Object.entries(estado.studyDays ?? {}).forEach(([d, secs]) => {
    if (Number(secs) >= 60) activos.add(d);
  });
  estado.activity.forEach((a) => {
    if (String(a["kind"]) !== "login") activos.add(String(a["date"] ?? "").slice(0, 10));
  });
  const dias = [...activos].filter(Boolean).sort();
  const tramos: { inicio: string; largo: number }[] = [];
  let inicio: string | null = null;
  let largo = 0;
  dias.forEach((d, i) => {
    const prev = dias[i - 1];
    if (prev && sumaDias(prev, 1) === d) {
      largo++;
    } else {
      if (inicio) tramos.push({ inicio, largo });
      inicio = d;
      largo = 1;
    }
  });
  if (inicio) tramos.push({ inicio, largo });
  return tramos;
}

/** Racha actual (termina hoy o ayer) y racha máxima, en horario de México. */
export function rachasDe(estado: Estado): { actual: number; max: number } {
  const tramos = tramosDeRacha(estado);
  const hoy = diaMx(new Date());
  const ayer = sumaDias(hoy, -1);
  let actual = 0;
  tramos.forEach((t) => {
    const fin = sumaDias(t.inicio, t.largo - 1);
    if (fin === hoy || fin === ayer) actual = t.largo;
  });
  return { actual, max: tramos.reduce((m, t) => Math.max(m, t.largo), 0) };
}

export type { Estado as FpEstado };
