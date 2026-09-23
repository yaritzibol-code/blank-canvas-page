/* "Ponme a prueba" (PRD 6.10) — Yaris comprueba lo aprendido.
   Se conserva tal cual del módulo anterior; ahora vive como recurso propio. */
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { pickPracticeQuestion, type BankQuestion } from "@/lib/store";
import { useYarisAsk, toHistory } from "@/lib/yaris-ask";
import { sanitizeHtml } from "@/lib/yaris-format";

export type PruebaMode = "preguntas" | "explica" | "nemo";

const PRUEBA_TITLES: Record<PruebaMode, string> = {
  preguntas: "Hazme preguntas",
  explica: "Explícamelo fácil",
  nemo: "Dame una nemotecnia",
};

export function PruebaModal({ mode, onClose }: { mode: PruebaMode; onClose: (interactions: number) => void }) {
  const [question, setQuestion] = useState<BankQuestion | null>(() => (mode === "preguntas" ? pickPracticeQuestion() : null));
  const [answered, setAnswered] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const askYaris = useYarisAsk();
  const [interactions, setInteractions] = useState(0);
  const [msgs, setMsgs] = useState<{ html: string; isUser: boolean }[]>(() => [
    {
      html: mode === "explica"
        ? "Dime el tema que quieres que te explique fácil (por ejemplo: METAR, fuerzas en vuelo, espacio aéreo…)."
        : "Dime el concepto que te cuesta y te ayudo a construir una nemotecnia para recordarlo.",
      isUser: false,
    },
  ]);

  function answer(idx: number) {
    if (answered !== null) return;
    setAnswered(idx);
    setInteractions((i) => i + 1);
  }

  function nextQuestion() {
    setQuestion(pickPracticeQuestion());
    setAnswered(null);
  }

  async function send() {
    const t = input.trim();
    if (!t || typing) return;
    const next = [...msgs, { html: t, isUser: true }];
    setMsgs(next);
    setInput("");
    setTyping(true);
    setInteractions((i) => i + 1);
    const answerYaris = await askYaris({
      history: toHistory(next.map((m) => ({ text: m.html, fromUser: m.isUser }))),
      ctx: {},
    });
    setTyping(false);
    setMsgs((m) => [...m, { html: answerYaris.text, isUser: false }]);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(interactions); }}
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: "max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))" }}
    >
      <div style={{ background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 20px)", padding: "clamp(18px, 5vw, 28px)", width: "min(480px, 100%)", maxHeight: "calc(100dvh - 24px)", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", color: "var(--fd-text, #081A35)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon n="spark" size={20} color="var(--fd-text, #163D70)" /> {PRUEBA_TITLES[mode]}
          </h2>
          <button
            onClick={() => onClose(interactions)}
            style={{ background: "rgba(22,61,112,.08)", border: "none", color: "var(--fd-text, #163D70)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
          ><Icon n="close" size={15} /></button>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--fd-muted, #4A5872)", margin: "0 0 16px" }}>Yaris comprueba si realmente entendiste</p>

        {mode === "preguntas" ? (
          question === null ? (
            <p style={{ fontSize: "0.86rem", color: "var(--fd-muted, #4A5872)", lineHeight: 1.6 }}>
              Aún no hay preguntas publicadas para practicar. Vuelve más tarde.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--fd-text, #081A35)", lineHeight: 1.55, marginBottom: 12 }}>{question.text}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {question.options.map((opt, idx) => {
                  const isCorrect = idx === question.correctIndex;
                  const isChosen = answered === idx;
                  const showState = answered !== null;
                  return (
                    <button
                      key={idx}
                      onClick={() => answer(idx)}
                      style={{
                        padding: "11px 14px",
                        borderRadius: "var(--fd-radius, 10px)",
                        textAlign: "left",
                        cursor: answered === null ? "pointer" : "default",
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: "0.84rem",
                        color: "var(--fd-text, #081A35)",
                        border: `2px solid ${showState && isCorrect ? "#2ecc71" : showState && isChosen ? "#e74c3c" : "#EEE1C5"}`,
                        background: showState && isCorrect ? "rgba(46,204,113,.08)" : showState && isChosen ? "rgba(231,76,60,.06)" : "var(--fd-panel, white)",
                        transition: "all .15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered !== null && (
                <div style={{ background: "var(--fd-panel, #f8f9ff)", borderRadius: "var(--fd-radius, 12px)", padding: "12px 14px", marginBottom: 14 }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: answered === question.correctIndex ? "#1a7a4a" : "var(--fd-gold, #7A5C1E)", marginBottom: 4 }}>
                    {answered === question.correctIndex ? "¡Correcto!" : `Casi. La respuesta correcta es: "${question.options[question.correctIndex]}"`}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--fd-muted, #555)", lineHeight: 1.6, margin: 0 }}>{question.explanation}</p>
                  {question.cite && <p style={{ fontSize: "0.72rem", color: "var(--fd-muted, #7E90AD)", margin: "6px 0 0" }}>{question.cite}</p>}
                </div>
              )}
              {answered !== null && (
                <button
                  onClick={nextQuestion}
                  style={{ width: "100%", padding: 11, background: "#163D70", color: "white", border: "none", borderRadius: "var(--fd-radius, 10px)", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                >
                  Otra pregunta
                </button>
              )}
            </div>
          )
        ) : (
          <div>
            <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: m.isUser ? "row-reverse" : "row" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.isUser ? "#163D70" : "var(--fd-panel, #EEE1C5)", display: "flex", alignItems: "center", justifyContent: "center", color: m.isUser ? "white" : "var(--fd-text, #081A35)", flexShrink: 0 }}>
                    {m.isUser ? <Icon n="user" size={13} /> : <YarisAvatar size={20} />}
                  </div>
                  <div style={{ maxWidth: "84%", padding: "8px 12px", borderRadius: m.isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: m.isUser ? "#163D70" : "var(--fd-panel, #f0f4ff)", color: m.isUser ? "white" : "var(--fd-text, #081A35)", fontSize: "0.82rem", lineHeight: 1.55 }}>
                    {m.isUser ? m.html : <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.html) }} />}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={mode === "explica" ? "Escribe el tema…" : "Escribe el concepto…"}
                style={{ flex: 1, border: "1px solid var(--fd-border, #EEE1C5)", borderRadius: "var(--fd-radius, 18px)", padding: "8px 12px", fontSize: "0.82rem", fontFamily: "'Manrope', sans-serif", outline: "none" }}
              />
              <button
                onClick={send}
                style={{ width: 34, height: 34, background: "#163D70", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              ><Icon n="send" size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
