/**
 * Panel Admin — Auditoría de cuestionarios.
 *
 * Muestra qué respondió cada estudiante, separado en dos rutas de estudio:
 * CIAAC se agrupa por materia y Línea Aérea por manual y capítulo. Cada
 * intento se puede abrir para revisar pregunta por pregunta.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell, cardStyle, inputStyle } from "@/components/admin/AdminShell";
import {
  adminAttemptQuestions,
  adminAttemptsAudit,
  type AuditAnswer,
  type AuditAttempt,
  type AuditQuestion,
} from "@/lib/audit.functions";
import { MATERIAS_DEF } from "@/lib/store";
import { ALL_MANUAL_QUIZZES } from "@/lib/store/linea-aerea-meta";

export const Route = createFileRoute("/admin/auditoria")({
  component: AuditoriaPage,
});

const MUTED = "#647DA0";
const INK = "#22375C";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

const materiaName = (slug: string) =>
  MATERIAS_DEF.find((m) => m.slug === slug)?.name ?? slug ?? "Sin materia";
const fuenteName = (code: string) =>
  ALL_MANUAL_QUIZZES.find((q) => q.code === code)?.titulo ?? code;

function fecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function pctColor(p: number): string {
  if (p >= 80) return "#2ecc71";
  if (p >= 60) return "#f39c12";
  return "#c0392b";
}

interface Bucket { key: string; label: string; sub?: string; correct: number; total: number }

/** Agrupa las respuestas: CIAAC por materia, Línea Aérea por manual + capítulo. */
function agrupar(answers: AuditAnswer[], track: "ciaac" | "la"): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const a of answers) {
    const esLA = Boolean(a.fuente);
    if ((track === "la") !== esLA) continue;
    const key = esLA ? `${a.fuente}·${a.capitulo ?? 0}` : (a.materia || "sin-materia");
    const label = esLA ? fuenteName(a.fuente!) : materiaName(a.materia);
    const sub = esLA
      ? `Cap. ${a.capitulo ?? "—"}${a.capituloTitulo ? ` — ${a.capituloTitulo}` : ""}`
      : undefined;
    const cur = map.get(key) ?? { key, label, ...(sub ? { sub } : {}), correct: 0, total: 0 };
    cur.total++;
    if (a.selectedIndex === a.correctIndex) cur.correct++;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function BucketList({ buckets }: { buckets: Bucket[] }) {
  if (buckets.length === 0) return null;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {buckets.map((b) => {
        const pct = b.total > 0 ? Math.round((b.correct * 100) / b.total) : 0;
        return (
          <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".78rem" }}>
            <span style={{ flex: 1, color: INK }}>
              <strong>{b.label}</strong>
              {b.sub && <span style={{ color: MUTED }}> · {b.sub}</span>}
            </span>
            <div style={{ width: 90, height: 6, background: "#EEF2F8", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pctColor(pct), borderRadius: 10 }} />
            </div>
            <span style={{ width: 78, textAlign: "right", color: MUTED }}>
              {b.correct}/{b.total} · <strong style={{ color: pctColor(pct) }}>{pct}%</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Detalle({ attempt }: { attempt: AuditAttempt }) {
  const [questions, setQuestions] = useState<Record<string, AuditQuestion> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const res = await adminAttemptQuestions({ data: { ids: attempt.answers.map((a) => a.questionId) } });
      if (!vivo) return;
      if ("error" in res) setError(res.error);
      else setQuestions(Object.fromEntries(res.questions.map((q) => [q.id, q])));
    })();
    return () => { vivo = false; };
  }, [attempt.id, attempt.answers]);

  const ciaac = agrupar(attempt.answers, "ciaac");
  const la = agrupar(attempt.answers, "la");

  return (
    <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 14, marginTop: 10, display: "grid", gap: 14 }}>
      {ciaac.length > 0 && (
        <section>
          <h4 style={{ fontFamily: DISPLAY, fontSize: ".8rem", color: INK, marginBottom: 7 }}>CIAAC — por materia</h4>
          <BucketList buckets={ciaac} />
        </section>
      )}
      {la.length > 0 && (
        <section>
          <h4 style={{ fontFamily: DISPLAY, fontSize: ".8rem", color: INK, marginBottom: 7 }}>Línea Aérea — por manual y capítulo</h4>
          <BucketList buckets={la} />
        </section>
      )}

      <section>
        <h4 style={{ fontFamily: DISPLAY, fontSize: ".8rem", color: INK, marginBottom: 7 }}>
          Respuestas ({attempt.answers.length})
        </h4>
        {error && <p style={{ fontSize: ".78rem", color: "#c0392b" }}>{error}</p>}
        {!questions && !error && <p style={{ fontSize: ".78rem", color: MUTED }}>Cargando reactivos…</p>}
        <div style={{ display: "grid", gap: 8 }}>
          {attempt.answers.map((a, i) => {
            const q = questions?.[a.questionId];
            const ok = a.selectedIndex === a.correctIndex;
            const blank = a.selectedIndex < 0;
            return (
              <div key={`${a.questionId}-${i}`} style={{ background: "white", border: "1px solid #E8EEF6", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: ".7rem", fontWeight: 800, color: blank ? "#8DA1BE" : ok ? "#2ecc71" : "#c0392b" }}>
                    {blank ? "EN BLANCO" : ok ? "CORRECTA" : "INCORRECTA"}
                  </span>
                  <span style={{ fontSize: ".7rem", color: MUTED }}>
                    {a.fuente
                      ? `${fuenteName(a.fuente)} · Cap. ${a.capitulo ?? "—"}${a.capituloTitulo ? ` — ${a.capituloTitulo}` : ""}`
                      : materiaName(a.materia)}
                  </span>
                  <span style={{ fontSize: ".68rem", color: "#A9B8CE", marginLeft: "auto" }}>{a.questionId}</span>
                </div>
                <div style={{ fontSize: ".82rem", color: INK, marginBottom: 6 }}>{q?.text ?? "—"}</div>
                {q && q.options.length > 0 && (
                  <div style={{ display: "grid", gap: 3 }}>
                    {q.options.map((opt, oi) => {
                      const elegida = oi === a.selectedIndex;
                      const correcta = oi === a.correctIndex;
                      return (
                        <div
                          key={oi}
                          style={{
                            fontSize: ".76rem",
                            padding: "4px 8px",
                            borderRadius: 7,
                            color: correcta ? "#1e8449" : elegida ? "#c0392b" : MUTED,
                            background: correcta ? "rgba(46,204,113,.1)" : elegida ? "rgba(192,57,43,.08)" : "transparent",
                            fontWeight: correcta || elegida ? 700 : 500,
                          }}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {elegida && " ← respondió"}
                          {correcta && " ✓"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AuditoriaPage() {
  const [rows, setRows] = useState<AuditAttempt[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [track, setTrack] = useState("todos");
  const [kind, setKind] = useState("todos");
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const res = await adminAttemptsAudit({ data: { days, track, limit: 400 } });
    if ("error" in res) setError(res.error);
    else setRows(res.rows);
    setCargando(false);
  }, [days, track]);

  useEffect(() => { void cargar(); }, [cargar]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== "todos" && r.kind !== kind) return false;
      if (!needle) return true;
      return (
        (r.nombre ?? "").toLowerCase().includes(needle) ||
        (r.email ?? "").toLowerCase().includes(needle) ||
        (r.titulo ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, kind, q]);

  // Resumen global de las respuestas visibles, separado por ruta de estudio.
  const todas = useMemo(() => filtered.flatMap((r) => r.answers), [filtered]);
  const resumenCiaac = useMemo(() => agrupar(todas, "ciaac"), [todas]);
  const resumenLa = useMemo(() => agrupar(todas, "la"), [todas]);

  return (
    <AdminShell title="Auditoría de cuestionarios" active="auditoria">
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar estudiante o cuestionario…"
          style={{ ...inputStyle, flex: "1 1 220px", minWidth: 180 }}
        />
        <select value={track} onChange={(e) => setTrack(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="todos">Ruta: todas</option>
          <option value="ciaac">CIAAC (materias)</option>
          <option value="la">Línea Aérea (capítulos)</option>
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
          <option value="todos">Tipo: todos</option>
          <option value="quiz">Cuestionarios</option>
          <option value="sim">Simuladores</option>
        </select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {cargando && <p style={{ fontSize: ".82rem", color: MUTED }}>Cargando intentos…</p>}
      {error && <p style={{ fontSize: ".82rem", color: "#c0392b" }}>{error}</p>}

      {!cargando && !error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ fontFamily: DISPLAY, fontSize: ".9rem", color: INK, marginBottom: 10 }}>CIAAC — desempeño por materia</h3>
              {resumenCiaac.length === 0
                ? <p style={{ fontSize: ".78rem", color: MUTED }}>Sin respuestas de CIAAC en este periodo.</p>
                : <BucketList buckets={resumenCiaac} />}
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontFamily: DISPLAY, fontSize: ".9rem", color: INK, marginBottom: 10 }}>Línea Aérea — desempeño por capítulo</h3>
              {resumenLa.length === 0
                ? <p style={{ fontSize: ".78rem", color: MUTED }}>Sin respuestas de Línea Aérea en este periodo.</p>
                : <BucketList buckets={resumenLa} />}
            </div>
          </div>

          <div style={{ fontSize: ".76rem", color: MUTED, marginBottom: 10 }}>
            {filtered.length} intentos · {todas.length} respuestas auditables
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((r) => (
              <div key={`${r.userId}-${r.id}`} style={cardStyle}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: "1 1 220px", minWidth: 180 }}>
                    <div style={{ fontWeight: 800, color: INK, fontSize: ".86rem" }}>{r.nombre || r.email || r.userId.slice(0, 8)}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{r.email}</div>
                  </div>
                  <span style={{ fontSize: ".72rem", fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: r.track === "la" ? "rgba(108,8,32,.1)" : "rgba(61,93,145,.1)", color: r.track === "la" ? "#6C0820" : "#3D5D91" }}>
                    {r.track === "la" ? "Línea Aérea" : r.track === "mixto" ? "Mixto" : "CIAAC"}
                  </span>
                  <span style={{ fontSize: ".76rem", color: INK, fontWeight: 700 }}>
                    {r.kind === "sim" ? "Simulador" : r.titulo || "Cuestionario"}
                  </span>
                  <span style={{ fontSize: ".76rem", color: MUTED }}>{fecha(r.date)}</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 800, color: pctColor(r.pct) }}>
                    {r.correct}/{r.total} · {r.pct}%
                  </span>
                  <button
                    onClick={() => setAbierto(abierto === r.id ? null : r.id)}
                    style={{ padding: "7px 13px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".74rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    {abierto === r.id ? "Ocultar detalle" : "Ver preguntas"}
                  </button>
                </div>
                {abierto === r.id && <Detalle attempt={r} />}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ ...cardStyle, textAlign: "center", color: MUTED, fontSize: ".82rem" }}>
                No hay intentos con estos filtros.
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
