/**
 * Explícale a Yaris — mini evaluación guiada.
 *
 * La alumna elige (o Yaris sugiere) un tema, Yaris plantea el reto, la alumna
 * explica con sus palabras y Yaris analiza, repregunta y cierra con feedback.
 */
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Icon } from "@/components/ui/fp-icon";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { sanitizeHtml, yarisToHtml } from "@/lib/yaris-format";
import { explicaleAYaris, type PruebaResumen } from "@/lib/prueba.functions";
import { buildReferences, pickSurpriseTopic } from "@/lib/prueba/topics";
import { logActivity, logYarisUse, useSessionUser } from "@/lib/store";

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

interface Turno {
  role: "user" | "assistant";
  content: string;
}

/** Dictado por voz sólo si el navegador ya lo trae (sin arquitectura extra). */
function getSpeech(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => SpeechRecognitionLike)
    | null;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function ExplicaleAYaris({ onSalir }: { onSalir: () => void }) {
  const user = useSessionUser();
  const ask = useServerFn(explicaleAYaris);

  const [tema, setTema] = useState("");
  const [activo, setActivo] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const [resumen, setResumen] = useState<PruebaResumen | null>(null);
  const [escuchando, setEscuchando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);
  const inicioMs = useRef<number>(Date.now());

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turnos.length, pensando, resumen]);

  useEffect(() => () => recRef.current?.stop(), []);

  async function pedir(temaActual: string, history: Turno[]) {
    setPensando(true);
    setError(null);
    try {
      const res = await ask({
        data: {
          tema: temaActual,
          turno: history.filter((t) => t.role === "user").length,
          history,
          referencias: buildReferences(temaActual),
        },
      });
      setTurnos([...history, { role: "assistant", content: res.reply }]);
      if (res.cerrar && res.resumen) {
        setResumen(res.resumen);
        if (user) {
          const mins = Math.max(1, Math.round((Date.now() - inicioMs.current) / 60000));
          logActivity({
            userId: user.id,
            kind: "yaris",
            label: `Ponme a Prueba — Explícale a Yaris: ${temaActual}`,
            score: res.resumen.dominio,
            durationMin: mins,
          });
          logYarisUse(user.id, "Ponme a Prueba");
        }
      }
    } catch {
      setError("No pude conectarme con Yaris. Inténtalo otra vez en un momento.");
    } finally {
      setPensando(false);
    }
  }

  async function comenzar(t: string) {
    const limpio = t.trim();
    if (!limpio || pensando) return;
    inicioMs.current = Date.now();
    setActivo(limpio);
    setResumen(null);
    setTurnos([]);
    await pedir(limpio, []);
  }

  async function responder() {
    const t = input.trim();
    if (!t || !activo || pensando || resumen) return;
    const next: Turno[] = [...turnos, { role: "user", content: t }];
    setTurnos(next);
    setInput("");
    await pedir(activo, next);
  }

  function dictar() {
    const Rec = getSpeech();
    if (!Rec) return;
    if (escuchando) {
      recRef.current?.stop();
      return;
    }
    const rec = new Rec();
    recRef.current = rec;
    rec.lang = "es-MX";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const texto = Array.from({ length: e.results.length }, (_, i) => e.results[i]![0]!.transcript)
        .join(" ")
        .trim();
      setInput((prev) => (prev ? `${prev} ${texto}` : texto));
    };
    rec.onend = () => setEscuchando(false);
    rec.onerror = () => setEscuchando(false);
    rec.start();
    setEscuchando(true);
  }

  const puedeVoz = Boolean(getSpeech());

  /* ── Paso 1: elegir tema ───────────────────────────────────────────── */
  if (!activo) {
    return (
      <div style={{ fontFamily: FONT }}>
        <button onClick={onSalir} style={linkBack}>← Volver a Ponme a Prueba</button>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <YarisAvatar size={44} />
            <div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "1.35rem", color: "#22375C", margin: 0 }}>
                Explícale a Yaris
              </h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#647DA0" }}>
                A ver, cuéntame qué tanto lo entendiste.
              </p>
            </div>
          </div>

          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#22375C", margin: "22px 0 10px" }}>
            ¿Qué quieres explicarle a Yaris?
          </p>
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && comenzar(tema)}
            placeholder="Escribe un tema..."
            style={{
              width: "100%", border: "2px solid #F2DCDB", borderRadius: 14, padding: "13px 16px",
              fontSize: "0.95rem", fontFamily: FONT, outline: "none", color: "#22375C",
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button
              onClick={() => comenzar(tema)}
              disabled={!tema.trim() || pensando}
              style={{ ...btnPrimary, opacity: tema.trim() ? 1 : 0.5 }}
            >
              Comenzar
            </button>
            <button
              onClick={() => user && comenzar(pickSurpriseTopic(user.id))}
              disabled={pensando}
              style={btnGhost}
            >
              <Icon n="spark" size={15} /> Sorpréndeme
            </button>
          </div>
          {pensando && <p style={{ fontSize: "0.82rem", color: "#647DA0", marginTop: 14 }}>Yaris está preparando tu reto…</p>}
          {error && <p style={{ fontSize: "0.82rem", color: "#6C0820", marginTop: 14 }}>{error}</p>}
        </div>
      </div>
    );
  }

  /* ── Paso 2: la evaluación ─────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: FONT }}>
      <button onClick={onSalir} style={linkBack}>← Volver a Ponme a Prueba</button>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <YarisAvatar size={36} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: "1.05rem", color: "#22375C" }}>
              Explícale a Yaris
            </p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#647DA0" }}>Tema: {activo}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
          {turnos.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, flexDirection: t.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ flexShrink: 0 }}>
                {t.role === "user" ? (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3D5D91", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon n="user" size={14} />
                  </div>
                ) : (
                  <YarisAvatar size={28} />
                )}
              </div>
              <div
                style={{
                  maxWidth: "84%", padding: "10px 14px", fontSize: "0.88rem", lineHeight: 1.6,
                  borderRadius: t.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  background: t.role === "user" ? "#3D5D91" : "#f0f4ff",
                  color: t.role === "user" ? "white" : "#22375C",
                }}
              >
                {t.role === "user" ? t.content : (
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(yarisToHtml(t.content)) }} />
                )}
              </div>
            </div>
          ))}
          {pensando && (
            <p style={{ fontSize: "0.8rem", color: "#647DA0", margin: 0 }}>Yaris está revisando tu explicación…</p>
          )}
          <div ref={finRef} />
        </div>

        {error && <p style={{ fontSize: "0.82rem", color: "#6C0820", marginTop: 12 }}>{error}</p>}

        {resumen ? (
          <ResumenCard resumen={resumen} onOtro={() => { setActivo(null); setTema(""); setTurnos([]); setResumen(null); }} />
        ) : (
          <div style={{ marginTop: 16 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) responder(); }}
              placeholder="Explícalo con tus propias palabras…"
              rows={3}
              style={{
                width: "100%", border: "2px solid #F2DCDB", borderRadius: 14, padding: "12px 14px",
                fontSize: "0.9rem", fontFamily: FONT, outline: "none", resize: "vertical", color: "#22375C",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={responder} disabled={!input.trim() || pensando} style={{ ...btnPrimary, opacity: input.trim() && !pensando ? 1 : 0.5 }}>
                <Icon n="send" size={15} /> Enviar respuesta
              </button>
              {puedeVoz && (
                <button onClick={dictar} style={{ ...btnGhost, borderColor: escuchando ? "#e74c3c" : "#F2DCDB", color: escuchando ? "#6C0820" : "#3D5D91" }}>
                  <Icon n="audio" size={15} /> {escuchando ? "Escuchando… toca para parar" : "Responder con voz"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumenCard({ resumen, onOtro }: { resumen: PruebaResumen; onOtro: () => void }) {
  const titulo =
    resumen.veredicto === "entendido" ? "Lo entendiste"
      : resumen.veredicto === "parcial" ? "Vas por buen camino"
        : "Conviene reforzarlo";
  return (
    <div style={{ marginTop: 18, background: "#f8f9ff", borderRadius: 16, padding: 18 }}>
      <p style={{ fontFamily: DISPLAY, fontSize: "1.05rem", color: "#22375C", margin: "0 0 10px" }}>{titulo}</p>
      {resumen.entendiste && <Bloque label="Lo que dominas" texto={resumen.entendiste} />}
      {resumen.reforzar && <Bloque label="Para reforzar" texto={resumen.reforzar} />}
      {resumen.recomienda && <Bloque label="Yaris recomienda" texto={resumen.recomienda} />}
      <p style={{ fontSize: "0.72rem", color: "#8DA1BE", margin: "10px 0 14px" }}>
        Dominio estimado: {resumen.dominio}%
      </p>
      <button onClick={onOtro} style={btnPrimary}>Explicar otro tema</button>
    </div>
  );
}

function Bloque({ label, texto }: { label: string; texto: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: "0.74rem", fontWeight: 800, color: "#3D5D91", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: "0.86rem", color: "#22375C", lineHeight: 1.6, margin: 0 }}>{texto}</p>
    </div>
  );
}

const card: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 24,
  border: "1px solid #EEF1F7",
  boxShadow: "0 10px 30px rgba(34,55,92,.06)",
};

const btnPrimary: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  background: "#3D5D91", color: "white", border: "none", borderRadius: 12,
  padding: "12px 20px", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: FONT,
};

const btnGhost: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 12,
  padding: "10px 18px", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: FONT,
};

const linkBack: CSSProperties = {
  background: "none", border: "none", color: "#3D5D91", fontWeight: 700, fontSize: "0.82rem",
  cursor: "pointer", padding: 0, marginBottom: 14, fontFamily: FONT,
};
