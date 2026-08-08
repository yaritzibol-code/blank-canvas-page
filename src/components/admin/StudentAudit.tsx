/**
 * Auditoría de un solo estudiante, para incrustar en su perfil admin.
 *
 * Replica lo que muestran `/admin/auditoria` y `/admin/yaris-chats`, pero
 * filtrado a un `userId`: cuestionarios y simuladores respondidos (CIAAC por
 * materia, Línea Aérea por manual y capítulo, con detalle pregunta por
 * pregunta) y la bitácora de conversaciones con Yaris.
 */
import { useCallback, useEffect, useState } from "react";
import {
  adminAttemptQuestions,
  adminAttemptsAudit,
  adminYarisLogs,
  adminYarisUsage,
  type AuditAnswer,
  type AuditAttempt,
  type AuditQuestion,
  type YarisLogRow,
  type YarisUsageSummary,
} from "@/lib/audit.functions";
import { cardStyle, inputStyle } from "@/components/admin/AdminShell";
import { MATERIAS_DEF } from "@/lib/store";
import { ALL_MANUAL_QUIZZES, isAeronaveFuente } from "@/lib/store/linea-aerea-meta";
import { adminRtariGrabaciones, type AdminRtariGrabacion } from "@/lib/admin.functions";
import { sanitizeHtml, yarisToHtml } from "@/lib/yaris-format";

const MUTED = "#647DA0";
const INK = "#22375C";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

const TONOS: Record<string, string> = { formal: "Formal", normal: "Normal", amiga: "Amiga Yaris" };

const materiaName = (slug: string | null | undefined) =>
  !slug ? "Sin materia" : (MATERIAS_DEF.find((m) => m.slug === slug)?.name ?? slug);
const fuenteName = (code: string) =>
  ALL_MANUAL_QUIZZES.find((q) => q.code === code)?.titulo ?? code;

function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function pctColor(p: number): string {
  if (p >= 80) return "#2ecc71";
  if (p >= 60) return "#f39c12";
  return "#c0392b";
}

interface Bucket { key: string; label: string; sub?: string; correct: number; total: number }

function agrupar(answers: AuditAnswer[], track: "ciaac" | "la" | "ac"): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const a of answers) {
    const esAC = isAeronaveFuente(a.fuente);
    const esLA = Boolean(a.fuente) && !esAC;
    const suTrack = esAC ? "ac" : esLA ? "la" : "ciaac";
    if (suTrack !== track) continue;
    const conFuente = esLA || esAC;
    const key = conFuente ? `${a.fuente}·${a.capitulo ?? 0}` : (a.materia || "sin-materia");
    const label = conFuente ? fuenteName(a.fuente!) : materiaName(a.materia);
    const sub = conFuente
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
  const ac = agrupar(attempt.answers, "ac");

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
      {ac.length > 0 && (
        <section>
          <h4 style={{ fontFamily: DISPLAY, fontSize: ".8rem", color: INK, marginBottom: 7 }}>Manuales de Aeronave — por manual y capítulo</h4>
          <BucketList buckets={ac} />
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
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4, flexWrap: "wrap" }}>
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

/* ─────────────────────────── Cuestionarios ─────────────────────────── */

function Cuestionarios({ userId, days }: { userId: string; days: number }) {
  const [rows, setRows] = useState<AuditAttempt[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const res = await adminAttemptsAudit({ data: { days, userId, limit: 300 } });
    if ("error" in res) setError(res.error);
    else setRows(res.rows);
    setCargando(false);
  }, [days, userId]);

  useEffect(() => { void cargar(); }, [cargar]);

  const todas = rows.flatMap((r) => r.answers);
  const ciaac = agrupar(todas, "ciaac");
  const la = agrupar(todas, "la");

  if (cargando) return <p style={{ fontSize: ".82rem", color: MUTED }}>Cargando intentos…</p>;
  if (error) return <p style={{ fontSize: ".82rem", color: "#c0392b" }}>{error}</p>;
  if (rows.length === 0) {
    return <p style={{ fontSize: ".82rem", color: MUTED }}>Sin cuestionarios ni simuladores en este periodo.</p>;
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12 }}>
          <h4 style={{ fontFamily: DISPLAY, fontSize: ".82rem", color: INK, marginBottom: 8 }}>CIAAC — por materia</h4>
          {ciaac.length === 0
            ? <p style={{ fontSize: ".78rem", color: MUTED }}>Sin respuestas de CIAAC.</p>
            : <BucketList buckets={ciaac} />}
        </div>
        <div style={{ background: "#F7F9FC", borderRadius: 12, padding: 12 }}>
          <h4 style={{ fontFamily: DISPLAY, fontSize: ".82rem", color: INK, marginBottom: 8 }}>Línea Aérea — por manual y capítulo</h4>
          {la.length === 0
            ? <p style={{ fontSize: ".78rem", color: MUTED }}>Sin respuestas de Línea Aérea.</p>
            : <BucketList buckets={la} />}
        </div>
      </div>

      <div style={{ fontSize: ".76rem", color: MUTED, marginBottom: 8 }}>
        {rows.length} intentos · {todas.length} respuestas auditables
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ border: "1px solid #E8EEF6", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: ".72rem", fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: r.track === "la" ? "rgba(108,8,32,.1)" : "rgba(61,93,145,.1)", color: r.track === "la" ? "#6C0820" : "#3D5D91" }}>
                {r.track === "la" ? "Línea Aérea" : r.track === "mixto" ? "Mixto" : "CIAAC"}
              </span>
              <span style={{ fontSize: ".8rem", color: INK, fontWeight: 700, flex: "1 1 160px" }}>
                {r.kind === "sim" ? "Simulador" : r.titulo || "Cuestionario"}
              </span>
              <span style={{ fontSize: ".75rem", color: MUTED }}>{fecha(r.date)}</span>
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
      </div>
    </>
  );
}

/* ───────────────────────── Conversaciones ───────────────────────── */

/** Resumen de en qué usó Yaris la estudiante durante el periodo. */
function ResumenYaris({ userId, days }: { userId: string; days: number }) {
  const [sum, setSum] = useState<YarisUsageSummary | null>(null);

  useEffect(() => {
    let vivo = true;
    void adminYarisUsage({ data: { userId, days } }).then((res) => {
      if (vivo && !("error" in res)) setSum(res);
    });
    return () => { vivo = false; };
  }, [userId, days]);

  if (!sum) return null;

  const chip = (label: string, valor: string | number) => (
    <div key={label} style={{ border: "1px solid #E8EEF6", borderRadius: 10, padding: "8px 12px", minWidth: 120 }}>
      <div style={{ fontSize: ".68rem", color: MUTED, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: ".95rem", color: INK, fontWeight: 800, fontFamily: DISPLAY }}>{valor}</div>
    </div>
  );

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {chip("Intercambios", sum.conversaciones)}
        {chip("Llamadas al modelo", sum.llamadas)}
        {chip("Modo socrático", sum.socratico)}
        {chip("Tokens", sum.tokens.toLocaleString("es-MX"))}
        {chip("Errores", sum.errores)}
        {chip("Último uso", sum.ultimo ? fecha(sum.ultimo) : "—")}
      </div>
      {sum.porSeccion.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {sum.porSeccion.map((s) => (
            <span key={s.seccion} style={{ fontSize: ".72rem", fontWeight: 700, color: "#3D5D91", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 20, padding: "4px 10px" }}>
              {s.seccion} · {s.total}
            </span>
          ))}
        </div>
      )}
      {sum.sinTranscripcion > 0 && (
        <p style={{ fontSize: ".74rem", color: MUTED }}>
          {sum.sinTranscripcion} usos de IA sin transcripción (anteriores a la bitácora o de análisis de Pathy).
        </p>
      )}
    </div>
  );
}

function Conversaciones({ userId, days }: { userId: string; days: number }) {
  const [rows, setRows] = useState<YarisLogRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const res = await adminYarisLogs({ data: { days, userId, limit: 200 } });
    if ("error" in res) setError(res.error);
    else setRows(res.rows);
    setCargando(false);
  }, [days, userId]);

  useEffect(() => { void cargar(); }, [cargar]);

  if (error) return <p style={{ fontSize: ".82rem", color: "#c0392b" }}>{error}</p>;

  return (
    <>
      <ResumenYaris userId={userId} days={days} />
      {cargando && <p style={{ fontSize: ".82rem", color: MUTED }}>Cargando conversaciones…</p>}
      {!cargando && rows.length === 0 && (
        <p style={{ fontSize: ".82rem", color: MUTED }}>Sin conversaciones con Yaris en este periodo.</p>
      )}
      <div style={{ fontSize: ".76rem", color: MUTED, marginBottom: 8 }}>{rows.length} intercambios</div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ border: "1px solid #E8EEF6", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: ".72rem", color: MUTED }}>{materiaName(r.materia)}</span>
              <span style={{ fontSize: ".72rem", fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: "rgba(242,174,188,.22)", color: "#6C0820" }}>
                {TONOS[r.tono ?? "normal"] ?? r.tono}
              </span>
              {r.pre_answer && <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#3D5D91" }}>modo socrático</span>}
              {!r.success && <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#c0392b" }}>error: {r.error_message}</span>}
              <span style={{ fontSize: ".72rem", color: MUTED, marginLeft: "auto" }}>{fecha(r.created_at)}</span>
              <span style={{ fontSize: ".7rem", color: "#A9B8CE" }}>
                {r.tokens_in + r.tokens_out} tokens · {Math.round(r.latency_ms / 100) / 10}s
              </span>
            </div>

            <div style={{ background: "#6C0820", color: "white", borderRadius: "12px 12px 12px 4px", padding: "9px 13px", fontSize: ".83rem", lineHeight: 1.5, marginBottom: 8 }}>
              {r.pregunta || "—"}
            </div>
            <div
              style={{
                background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: "12px 12px 4px 12px",
                padding: "9px 13px", fontSize: ".83rem", color: INK, lineHeight: 1.5,
                maxHeight: abierto === r.id ? "none" : 150, overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(yarisToHtml(r.respuesta || "—")) }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setAbierto(abierto === r.id ? null : r.id)}
                style={{ padding: "6px 12px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".73rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                {abierto === r.id ? "Ver menos" : "Ver completo"}
              </button>
              {r.question_text && (
                <details style={{ fontSize: ".75rem", color: MUTED }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, color: "#3D5D91" }}>Reactivo en contexto</summary>
                  <div style={{ marginTop: 6, maxWidth: 720, fontFamily: DISPLAY }}>{r.question_text}</div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Bloque de auditoría (cuestionarios + Yaris) para el perfil del estudiante. */
export function StudentAudit({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"quiz" | "yaris" | "rtari">("quiz");
  const [days, setDays] = useState(90);

  const tabStyle = (on: boolean) => ({
    padding: "7px 14px",
    borderRadius: 20,
    border: on ? "none" : "2px solid #F2DCDB",
    background: on ? "#3D5D91" : "white",
    color: on ? "white" : "#3D5D91",
    fontSize: ".76rem",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "'Manrope', sans-serif",
  });

  return (
    <div style={{ ...cardStyle, marginBottom: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontFamily: DISPLAY, fontSize: ".95rem", color: INK, marginRight: "auto" }}>
          Auditoría del estudiante
        </h3>
        <button onClick={() => setTab("quiz")} style={tabStyle(tab === "quiz")}>Cuestionarios</button>
        <button onClick={() => setTab("yaris")} style={tabStyle(tab === "yaris")}>Conversaciones con Yaris</button>
        <button onClick={() => setTab("rtari")} style={tabStyle(tab === "rtari")}>Entrevistas RTARI</button>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>
      {tab === "quiz" ? (
        <Cuestionarios userId={userId} days={days} />
      ) : tab === "yaris" ? (
        <Conversaciones userId={userId} days={days} />
      ) : (
        <EntrevistasRtari userId={userId} />
      )}
    </div>
  );
}

/* ── Entrevistas RTARI: minutos, costo y audio para escuchar ── */

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function EntrevistasRtari({ userId }: { userId: string }) {
  const [filas, setFilas] = useState<AdminRtariGrabacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setCargando(true);
    void adminRtariGrabaciones({ data: { userId } }).then((r) => {
      if (cancel) return;
      if ("error" in r) setError(r.error);
      else {
        setFilas(r);
        setError(null);
      }
      setCargando(false);
    });
    return () => {
      cancel = true;
    };
  }, [userId]);

  if (cargando) return <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Cargando entrevistas…</p>;
  if (error) return <p style={{ fontSize: ".85rem", color: "#e74c3c" }}>{error}</p>;
  if (filas.length === 0)
    return <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Este alumno no ha hecho entrevistas RTARI.</p>;

  const minutos = filas.reduce((a, f) => a + f.duration_sec, 0) / 60;
  const costo = filas.reduce((a, f) => a + (f.cost_usd ?? 0), 0);

  return (
    <div>
      <p style={{ fontSize: ".8rem", color: "#647DA0", marginTop: 0 }}>
        {filas.length} entrevistas · {minutos.toFixed(1)} minutos hablados · costo real de voz{" "}
        {costo > 0 ? `US$${costo.toFixed(2)}` : "sin registro"}
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {filas.map((f) => (
          <div key={f.id} style={{ border: "2px solid #F2DCDB", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: ".8rem", color: "#22375C" }}>
              <strong>{new Date(f.created_at).toLocaleString("es-MX")}</strong>
              <span>· {mmss(f.duration_sec)}</span>
              <span>· {f.preguntas} preguntas</span>
              {f.nivel && <span>· {f.nivel}</span>}
              {f.voice && <span>· voz {f.voice}</span>}
              {f.nivel_global != null && <span>· OACI {f.nivel_global}</span>}
              {f.cost_usd != null && <span>· US${f.cost_usd.toFixed(3)}</span>}
            </div>
            {f.audio_url ? (
              <audio
                controls
                preload="none"
                src={f.audio_url}
                style={{ width: "100%", marginTop: 10 }}
              />
            ) : (
              <p style={{ fontSize: ".78rem", color: "#647DA0", margin: "8px 0 0" }}>
                Sin audio guardado para esta entrevista.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
