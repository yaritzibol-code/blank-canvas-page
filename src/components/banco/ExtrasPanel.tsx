/**
 * Extras del cuestionario: material de estudio derivado del banco real.
 *
 *  - Flashcards generadas de las preguntas publicadas (pregunta → respuesta
 *    correcta + explicación oficial + fuente).
 *  - Audio-repaso / podcast: Yaris escribe el guion con el material curado y
 *    el navegador lo narra (Web Speech API), con controles reales.
 *  - Presentaciones: mazo de diapositivas armado con los puntos clave de cada
 *    materia o manual.
 *  - Yaris Materiales: chat con recuperación (RAG ligero) sobre el contenido
 *    curado del banco; cita las fuentes que usó.
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { getPublishedQuestions, useQuestionBank, materiaBySlug, useSessionUser, useStore, canUseAI, logYarisUse } from "@/lib/store";
import type { BankQuestion } from "@/lib/store";
import { useYarisAsk, toHistory } from "@/lib/yaris-ask";
import { LINEA_AEREA_QUIZZES } from "@/lib/store/linea-aerea-meta";
import { sanitizeHtml } from "@/lib/yaris-format";


type ExtraKind = "flashcards" | "audio" | "slides" | "ia";

const CARD_BORDER = "#F2DCDB";
const INK = "#22375C";
const MUTED = "#647DA0";
const BLUE = "#3D5D91";
const WINE = "#6C0820";

/* ─── Datos del material curado ──────────────────────── */

function bankFor(la: boolean): BankQuestion[] {
  const all = getPublishedQuestions();
  return la ? all.filter((q) => !!q.fuente) : all.filter((q) => !q.fuente);
}

interface Grupo {
  key: string;
  label: string;
  icon: FPIconName;
  questions: BankQuestion[];
}

function groupsFor(la: boolean, bank: BankQuestion[]): Grupo[] {
  if (la) {
    const byCode = new Map<string, BankQuestion[]>();
    bank.forEach((q) => {
      const code = q.fuente ?? "OTRO";
      byCode.set(code, [...(byCode.get(code) ?? []), q]);
    });
    return [...byCode.entries()]
      .map(([code, questions]) => {
        const meta = LINEA_AEREA_QUIZZES.find((m) => m.code === code);
        return {
          key: code,
          label: meta?.titulo ?? `Cuestionario ${code}`,
          icon: (meta?.icon ?? "doc") as FPIconName,
          questions,
        };
      })
      .sort((a, b) => b.questions.length - a.questions.length);
  }
  const bySlug = new Map<string, BankQuestion[]>();
  bank.forEach((q) => bySlug.set(q.materia, [...(bySlug.get(q.materia) ?? []), q]));
  return [...bySlug.entries()]
    .map(([slug, questions]) => {
      const def = materiaBySlug(slug);
      return {
        key: slug,
        label: def?.name ?? slug,
        icon: (def?.icon ?? "book") as FPIconName,
        questions,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ─── Recuperación ligera (RAG sobre el material curado) ── */

const STOP = new Set(["que", "de", "la", "el", "los", "las", "en", "por", "para", "una", "uno", "del", "con", "como", "se", "es", "al", "y", "o", "un", "cual", "cuales", "sobre", "me", "mi", "the", "of"]);

function terms(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function retrieve(bank: BankQuestion[], query: string, k = 6): BankQuestion[] {
  const qt = terms(query);
  if (qt.length === 0) return [];
  const scored = bank.map((q) => {
    const hay = terms(`${q.text} ${q.explanation} ${q.cite ?? ""}`);
    const set = new Set(hay);
    let score = 0;
    qt.forEach((t) => {
      if (set.has(t)) score += 2;
      else if (hay.some((h) => h.startsWith(t.slice(0, 5)))) score += 1;
    });
    return { q, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.q);
}

/* ─── UI compartida ──────────────────────────────────── */

function Modal({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.72)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto", fontFamily: "'Manrope', sans-serif" }}
    >
      <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: wide ? 860 : 640, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${CARD_BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.15rem", color: INK, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: "0.8rem", color: MUTED, margin: "4px 0 0" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: "transparent", border: "none", color: MUTED, fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function GrupoPicker({ grupos, value, onChange }: { grupos: Grupo[]; value: string; onChange: (k: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
      {grupos.map((g) => (
        <button
          key={g.key}
          onClick={() => onChange(g.key)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 20, cursor: "pointer",
            fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
            border: `1px solid ${value === g.key ? BLUE : CARD_BORDER}`,
            background: value === g.key ? BLUE : "white",
            color: value === g.key ? "white" : INK,
          }}
        >
          <Icon n={g.icon} size={14} /> {g.label.length > 34 ? `${g.label.slice(0, 34)}…` : g.label}
          <span style={{ opacity: 0.7 }}>({g.questions.length})</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Flashcards ─────────────────────────────────────── */

function Flashcards({ grupos, onClose }: { grupos: Grupo[]; onClose: () => void }) {
  const [key, setKey] = useState(grupos[0]?.key ?? "");
  const grupo = grupos.find((g) => g.key === key) ?? grupos[0];
  const cards = useMemo(() => (grupo ? [...grupo.questions].sort(() => Math.random() - 0.5).slice(0, 40) : []), [grupo]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const card = cards[i];

  function advance(sabida: boolean) {
    if (sabida) setKnown((k) => k + 1);
    setFlip(false);
    setI((n) => (n + 1 < cards.length ? n + 1 : 0));
  }

  return (
    <Modal title="Flashcards del material" subtitle="Generadas con las preguntas y explicaciones oficiales del banco." onClose={onClose}>
      <GrupoPicker grupos={grupos} value={key} onChange={(k) => { setKey(k); setI(0); setFlip(false); setKnown(0); }} />
      {!card ? (
        <p style={{ color: MUTED, fontSize: "0.9rem" }}>Todavía no hay material publicado para este bloque.</p>
      ) : (
        <>
          <div
            onClick={() => setFlip((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlip((f) => !f); } }}
            style={{
              minHeight: 210, borderRadius: 18, padding: 24, cursor: "pointer",
              border: `2px solid ${flip ? BLUE : CARD_BORDER}`,
              background: flip ? "rgba(61,93,145,0.05)" : "white",
              display: "flex", flexDirection: "column", justifyContent: "center", gap: 10,
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: flip ? BLUE : WINE }}>
              {flip ? "Respuesta" : "Pregunta"}
            </span>
            {flip ? (
              <div>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: INK, margin: "0 0 8px" }}>{card.options[card.correctIndex]}</p>
                <p style={{ fontSize: "0.88rem", color: MUTED, margin: 0 }}>{card.explanation}</p>
                {card.cite && <p style={{ fontSize: "0.75rem", color: BLUE, marginTop: 8 }}>Fuente: {card.cite}</p>}
              </div>
            ) : (
              <p style={{ fontSize: "1.02rem", color: INK, margin: 0 }}>{card.text}</p>
            )}
            <span style={{ fontSize: "0.72rem", color: MUTED }}>Toca la tarjeta para girarla</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", color: MUTED }}>
              Tarjeta {i + 1} de {cards.length} · dominadas: <strong style={{ color: BLUE }}>{known}</strong>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => advance(false)} style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${CARD_BORDER}`, background: "white", color: WINE, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.82rem" }}>Repasar después</button>
              <button onClick={() => advance(true)} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: BLUE, color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.82rem" }}>Ya la sé →</button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ─── Audio / podcast ────────────────────────────────── */

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  function speak(text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const chunks = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
    chunks.forEach((chunk, idx) => {
      const u = new SpeechSynthesisUtterance(chunk.trim());
      u.lang = "es-MX";
      u.rate = 1;
      if (idx === chunks.length - 1) u.onend = () => { setSpeaking(false); setPaused(false); };
      window.speechSynthesis.speak(u);
    });
    setSpeaking(true);
    setPaused(false);
  }
  function toggle() {
    if (!supported) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  }
  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }
  return { supported, speaking, paused, speak, toggle, stop };
}

function AudioRepaso({ grupos, la, onClose }: { grupos: Grupo[]; la: boolean; onClose: () => void }) {
  const [key, setKey] = useState(grupos[0]?.key ?? "");
  const grupo = grupos.find((g) => g.key === key) ?? grupos[0];
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const askYaris = useYarisAsk();
  const user = useSessionUser();
  const paid = canUseAI(user);
  const speech = useSpeech();

  async function generar() {
    if (!grupo || loading) return;
    setLoading(true);
    speech.stop();
    const material = grupo.questions
      .slice(0, 14)
      .map((q, n) => `${n + 1}. ${q.text} → ${q.options[q.correctIndex]}. ${q.explanation}`)
      .join("\n");
    const answer = await askYaris({
      history: [{
        role: "user",
        content:
          `Escribe el guion de un episodio de podcast de repaso de 3 a 4 minutos sobre "${grupo.label}" para pilotos que preparan ${la ? "el proceso de Línea Aérea" : "el examen CIAAC"}. ` +
          "Habla de tú, en español mexicano, en párrafos hablados (sin viñetas, sin markdown, sin encabezados) para que se pueda narrar en voz alta. " +
          "Empieza con una bienvenida breve, desarrolla los conceptos clave y cierra con tres puntos para recordar.\n\nMaterial curado del curso:\n" +
          material,
      }],
      ctx: { materiaName: grupo.label, resourceTitle: `Material curado — ${grupo.label}` },
    });
    if (user) logYarisUse(user.id, "Audio-repaso");
    setScript(answer.text.replace(/<[^>]+>/g, "").trim());
    setLoading(false);
  }

  return (
    <Modal title="Audio-repaso y podcast" subtitle="Yaris escribe el episodio con el material curado y tu dispositivo lo narra." onClose={() => { speech.stop(); onClose(); }} wide>
      <GrupoPicker grupos={grupos} value={key} onChange={(k) => { setKey(k); setScript(""); speech.stop(); }} />
      {!paid && (
        <p style={{ fontSize: "0.85rem", color: WINE, background: "rgba(108,8,32,0.06)", padding: 12, borderRadius: 10, marginBottom: 14 }}>
          El guion con IA es parte del acceso completo. Con el plan básico puedes leer el material en Flashcards y Presentaciones.
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={generar} disabled={loading} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: loading ? "#9fb3d4" : BLUE, color: "white", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon n="spark" size={16} /> {loading ? "Escribiendo el episodio…" : script ? "Generar otro episodio" : "Generar episodio"}
        </button>
        {script && speech.supported && (
          <>
            <button onClick={() => (speech.speaking ? speech.toggle() : speech.speak(script))} style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${CARD_BORDER}`, background: "white", color: INK, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem" }}>
              {speech.speaking ? (speech.paused ? "▶ Reanudar" : "⏸ Pausar") : "▶ Reproducir"}
            </button>
            <button onClick={speech.stop} style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${CARD_BORDER}`, background: "white", color: WINE, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem" }}>■ Detener</button>
          </>
        )}
      </div>
      {script && !speech.supported && (
        <p style={{ fontSize: "0.8rem", color: MUTED, marginBottom: 10 }}>Tu navegador no puede narrar el episodio; abajo tienes el guion completo para leerlo.</p>
      )}
      {script ? (
        <div style={{ background: "#f5f7fc", borderRadius: 14, padding: 18, fontSize: "0.9rem", lineHeight: 1.65, color: INK, whiteSpace: "pre-wrap" }}>{script}</div>
      ) : (
        <p style={{ fontSize: "0.86rem", color: MUTED }}>Elige un bloque y genera el episodio: Yaris arma el guion con las preguntas y explicaciones oficiales de ese material.</p>
      )}
    </Modal>
  );
}

/* ─── Presentaciones ─────────────────────────────────── */

interface Slide { titulo: string; puntos: string[]; fuente?: string }

function buildDeck(grupo: Grupo): Slide[] {
  const qs = grupo.questions.filter((q) => q.explanation.trim().length > 0);
  const slides: Slide[] = [
    {
      titulo: grupo.label,
      puntos: [
        `${grupo.questions.length} preguntas oficiales en este bloque.`,
        "Cada lámina resume conceptos evaluados y su explicación del curso.",
        "Úsala como repaso rápido antes del examen.",
      ],
    },
  ];
  for (let i = 0; i < qs.length && slides.length < 13; i += 3) {
    const trio = qs.slice(i, i + 3);
    slides.push({
      titulo: `Puntos clave ${slides.length}`,
      puntos: trio.map((q) => `${q.options[q.correctIndex]} — ${q.explanation}`),
      ...(trio[0].cite ? { fuente: trio[0].cite } : {}),
    });
  }
  slides.push({
    titulo: "Para llevar",
    puntos: [
      "Repite las láminas donde dudaste y conviértelas en flashcards.",
      "Practica el bloque en modo Aprendiendo con feedback inmediato.",
      "Cierra con un simulador cronometrado para medir el avance.",
    ],
  });
  return slides;
}

function Presentaciones({ grupos, onClose }: { grupos: Grupo[]; onClose: () => void }) {
  const [key, setKey] = useState(grupos[0]?.key ?? "");
  const grupo = grupos.find((g) => g.key === key) ?? grupos[0];
  const deck = useMemo(() => (grupo ? buildDeck(grupo) : []), [grupo]);
  const [i, setI] = useState(0);
  const slide = deck[i];

  return (
    <Modal title="Presentaciones del material" subtitle="Mazo de láminas armado con el contenido oficial de cada bloque." onClose={onClose} wide>
      <GrupoPicker grupos={grupos} value={key} onChange={(k) => { setKey(k); setI(0); }} />
      {!slide ? (
        <p style={{ color: MUTED, fontSize: "0.9rem" }}>Sin material publicado para este bloque.</p>
      ) : (
        <>
          <div style={{ borderRadius: 18, border: `2px solid ${CARD_BORDER}`, background: "linear-gradient(160deg,#ffffff,#f5f7fc)", padding: 26, minHeight: 260 }}>
            <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.25rem", color: INK, margin: "0 0 16px" }}>{slide.titulo}</h4>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {slide.puntos.map((p, n) => (
                <li key={n} style={{ fontSize: "0.9rem", color: INK, lineHeight: 1.55 }}>{p}</li>
              ))}
            </ul>
            {slide.fuente && <p style={{ fontSize: "0.74rem", color: BLUE, marginTop: 16 }}>Fuente: {slide.fuente}</p>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${CARD_BORDER}`, background: "white", color: i === 0 ? MUTED : INK, fontWeight: 700, cursor: i === 0 ? "default" : "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.82rem" }}>← Anterior</button>
            <span style={{ fontSize: "0.78rem", color: MUTED }}>Lámina {i + 1} de {deck.length}</span>
            <button onClick={() => setI((n) => Math.min(deck.length - 1, n + 1))} disabled={i === deck.length - 1} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: i === deck.length - 1 ? "#c9d4e6" : BLUE, color: "white", fontWeight: 700, cursor: i === deck.length - 1 ? "default" : "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.82rem" }}>Siguiente →</button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ─── Yaris entrenada en los materiales ──────────────── */

function IaMateriales({ bank, la, onClose }: { bank: BankQuestion[]; la: boolean; onClose: () => void }) {
  const askYaris = useYarisAsk();
  const user = useSessionUser();
  const [msgs, setMsgs] = useState<{ html: string; user: boolean; fuentes?: string[] }[]>([
    {
      html: `Soy <b>Yaris</b> y estoy leyendo el material curado de ${la ? "Línea Aérea" : "CIAAC"}: ${bank.length} preguntas con sus explicaciones y fuentes oficiales. Pregúntame lo que sea del temario.`,
      user: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  async function send(q?: string) {
    const text = (q ?? input).trim();
    if (!text || typing) return;
    const next = [...msgs, { html: escapeHtml(text), user: true }];
    setMsgs(next);
    setInput("");
    setTyping(true);

    const hits = retrieve(bank, text);
    const fuentes = [...new Set(hits.map((h) => h.cite).filter((c): c is string => !!c))].slice(0, 4);
    const material = hits
      .map((h, n) => `[${n + 1}] ${h.text}\nRespuesta correcta: ${h.options[h.correctIndex]}\nExplicación oficial: ${h.explanation}${h.cite ? `\nFuente: ${h.cite}` : ""}`)
      .join("\n\n");

    const answer = await askYaris({
      history: [
        ...toHistory(next.slice(-9).map((m) => ({ text: m.html, fromUser: m.user }))).slice(0, -1),
        {
          role: "user",
          content:
            material.length > 0
              ? `Pregunta del estudiante: ${text}\n\nMaterial curado del curso que puedes usar como base (cítalo cuando aplique):\n${material}`
              : `Pregunta del estudiante: ${text}\n\n(No encontré material curado directamente relacionado; responde con tu conocimiento aeronáutico y dilo con claridad.)`,
        },
      ],
      ctx: { resourceTitle: la ? "Materiales del curso de Línea Aérea" : "Materiales del curso CIAAC" },
    });
    if (user) logYarisUse(user.id, "Yaris Materiales");
    setTyping(false);
    setMsgs((p) => [...p, { html: answer.text, user: false, ...(fuentes.length > 0 ? { fuentes } : {}) }]);
  }

  return (
    <Modal title="Yaris entrenada en los materiales" subtitle="Busca en el material curado y responde citando las fuentes del curso." onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "48vh", overflowY: "auto", paddingRight: 4 }}>
        {msgs.map((m, n) => (
          <div key={n} style={{ alignSelf: m.user ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <div
              style={{
                padding: "11px 14px", borderRadius: 14,
                background: m.user ? BLUE : "#f5f7fc",
                color: m.user ? "white" : INK,
                fontSize: "0.88rem", lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.html) }}
            />
            {m.fuentes && m.fuentes.length > 0 && (
              <p style={{ fontSize: "0.72rem", color: BLUE, margin: "6px 2px 0" }}>Material consultado: {m.fuentes.join(" · ")}</p>
            )}
          </div>
        ))}
        {typing && <span style={{ fontSize: "0.82rem", color: MUTED }}>Yaris está revisando el material…</span>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
          placeholder="Ej. ¿Cómo se calcula la altitud de densidad?"
          aria-label="Pregunta sobre el material"
          style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: `1px solid ${CARD_BORDER}`, fontSize: "0.88rem", fontFamily: "'Manrope', sans-serif", color: INK }}
        />
        <button onClick={() => void send()} disabled={typing} style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: typing ? "#9fb3d4" : BLUE, color: "white", fontWeight: 700, cursor: typing ? "wait" : "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem" }}>Preguntar</button>
      </div>
    </Modal>
  );
}

/* ─── Panel ──────────────────────────────────────────── */

export function ExtrasPanel({ la = false }: { la?: boolean }) {
  const [open, setOpen] = useState<ExtraKind | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Se lee con `useStore` para que el conteo se recalcule cuando el banco
  // termina de sembrarse o de hidratarse desde la nube: con `useMemo` a secas
  // quedaba congelado en el estado del primer render y mostraba 0 preguntas.
  const bank = useStore(() => (mounted ? bankFor(la) : []));
  const grupos = useMemo(() => groupsFor(la, bank), [la, bank]);

  const items: { kind: ExtraKind; icon: FPIconName; title: string; desc: string }[] = [
    { kind: "flashcards", icon: "spark", title: "Flashcards", desc: "Tarjetas de repaso con la respuesta correcta, la explicación oficial y su fuente." },
    { kind: "audio", icon: "radio", title: "Audios y podcast", desc: "Episodios de repaso narrados, escritos por Yaris con el material curado." },
    { kind: "slides", icon: "doc", title: "Presentaciones", desc: "Láminas con los puntos clave de cada materia o manual del curso." },
    { kind: "ia", icon: "brain", title: "Yaris con los materiales", desc: "Pregúntale lo que sea: busca en el material curado y responde citando la fuente." },
  ];

  return (
    <div style={{ maxWidth: 820, width: "100%", marginBottom: 48 }}>
      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", marginBottom: 6, color: INK }}>
        Extras del cuestionario
      </h3>
      <p style={{ fontSize: "0.85rem", color: MUTED, marginBottom: 16 }}>
        Todo se arma con el mismo material curado del banco: {bank.length.toLocaleString()} preguntas con explicación y fuente.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
        {items.map((it) => (
          <button
            key={it.kind}
            onClick={() => setOpen(it.kind)}
            style={{
              textAlign: "left", background: "white", border: `1px solid ${CARD_BORDER}`,
              borderRadius: 16, padding: 18, cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              display: "flex", gap: 12, alignItems: "flex-start",
              boxShadow: "0 2px 10px rgba(61,93,145,0.05)",
            }}
          >
            <span style={{ display: "flex", color: BLUE, marginTop: 2 }}><Icon n={it.icon} size={22} /></span>
            <span>
              <span style={{ display: "block", fontWeight: 800, color: INK, fontSize: "0.95rem", marginBottom: 4 }}>{it.title}</span>
              <span style={{ display: "block", fontSize: "0.82rem", color: MUTED, lineHeight: 1.5 }}>{it.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {open === "flashcards" && <Flashcards grupos={grupos} onClose={() => setOpen(null)} />}
      {open === "audio" && <AudioRepaso grupos={grupos} la={la} onClose={() => setOpen(null)} />}
      {open === "slides" && <Presentaciones grupos={grupos} onClose={() => setOpen(null)} />}
      {open === "ia" && <IaMateriales bank={bank} la={la} onClose={() => setOpen(null)} />}
    </div>
  );
}
