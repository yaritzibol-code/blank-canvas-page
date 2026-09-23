/** Cinco pasos, uno por pantalla: cómo llegas hoy. Pathy decide cómo estudiamos. */
import { useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";
import type { StudyIntake, StudyMood, StudyTrack, StudyUrgency } from "@/lib/estudiemos/types";

const CARD: React.CSSProperties = {
  background: "var(--fd-panel, white)",
  borderRadius: "var(--fd-radius, 18px)",
  padding: "24px 22px",
  boxShadow: "0 2px 16px rgba(22,61,112,0.08)",
  fontFamily: "'Manrope', sans-serif",
};

function Option({
  selected,
  onClick,
  title,
  desc,
  icon,
  dot,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
  icon?: FPIconName;
  /** Punto de color (semáforo de urgencia). */
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "14px 16px",
        minHeight: 56,
        borderRadius: "var(--fd-radius, 14px)",
        cursor: "pointer",
        border: `1.5px solid ${selected ? "#163D70" : "#EEE1C5"}`,
        background: selected ? "var(--fd-panel-alt, rgba(22,61,112,0.07))" : "var(--fd-panel, white)",
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        gap: 12,
        alignItems: "center",
        width: "100%",
      }}
    >
      {icon && (
        <span style={{ display: "flex", color: selected ? "var(--fd-text, #163D70)" : "var(--fd-muted, #4A5872)", flexShrink: 0 }}>
          <Icon n={icon} size={22} />
        </span>
      )}
      {dot && (
        <span
          aria-hidden="true"
          style={{ width: 12, height: 12, borderRadius: 99, background: dot, flexShrink: 0, boxShadow: `0 0 0 4px ${dot}22` }}
        />
      )}
      <span>
        <span style={{ display: "block", fontWeight: 800, color: "var(--fd-text, #081A35)", fontSize: "0.92rem" }}>{title}</span>
        {desc && (
          <span style={{ display: "block", fontSize: "0.78rem", color: "var(--fd-muted, #4A5872)", lineHeight: 1.45 }}>{desc}</span>
        )}
      </span>
    </button>
  );
}

export function IntakeWizard({
  onDone,
  onCancel,
  loading,
}: {
  onDone: (intake: StudyIntake) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<StudyTrack | null>(null);
  const [tema, setTema] = useState("");
  const [mood, setMood] = useState<StudyMood | null>(null);
  const [urgency, setUrgency] = useState<StudyUrgency | null>(null);
  const [minutos, setMinutos] = useState("45");

  const titles = [
    "¿Para qué estás estudiando?",
    "¿Qué quieres estudiar hoy?",
    "¿Cómo te sientes para estudiar hoy?",
    "¿Qué tan urgente es?",
    "¿Cuánto tiempo quieres estudiar?",
  ];

  function finish() {
    const mins = Math.max(10, Math.min(240, Number(minutos) || 45));
    if (!track || !mood || !urgency) return;
    onDone({ track, tema: tema.trim(), mood, urgency, minutes: mins });
  }

  return (
    <div style={{ ...CARD, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <PathyMark size={34} float />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: ".06em", color: "var(--fd-muted, #4A5872)", textTransform: "uppercase" }}>
            Paso {step + 1} de 5
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.15rem", color: "var(--fd-text, #081A35)", margin: 0 }}>
            {titles[step]}
          </h2>
        </div>
      </div>

      <div style={{ height: 5, borderRadius: 4, background: "rgba(22,61,112,.1)", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ width: `${((step + 1) / 5) * 100}%`, height: "100%", background: "#163D70", transition: "width .25s" }} />
      </div>

      {step === 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <Option
            selected={track === "ciaac"}
            onClick={() => { setTrack("ciaac"); setStep(1); }}
            title="CIAAC"
            desc="Las 12 materias oficiales del examen."
            icon="plane"
          />
          <Option
            selected={track === "la"}
            onClick={() => { setTrack("la"); setStep(1); }}
            title="Línea Aérea"
            desc="Manuales del curso: ATP, Handbook, Jeppesen, Legislación y aeronaves."
            icon="tower"
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Escribe un tema, materia o concepto…"
            style={{
              width: "100%",
              padding: "13px 15px",
              borderRadius: "var(--fd-radius, 12px)",
              border: "1.5px solid #EEE1C5",
              fontSize: "0.92rem",
              fontFamily: "'Manrope', sans-serif",
              outline: "none",
              marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setStep(2)}
              disabled={!tema.trim()}
              style={{
                flex: "1 1 160px", minHeight: 46, borderRadius: "var(--fd-radius, 12px)", border: "none",
                background: tema.trim() ? "#081A35" : "rgba(8,26,53,.25)",
                color: "white", fontWeight: 700, fontSize: "0.86rem",
                cursor: tema.trim() ? "pointer" : "not-allowed", fontFamily: "'Manrope', sans-serif",
              }}
            >
              Continuar
            </button>
            <button
              onClick={() => { setTema(""); setStep(2); }}
              style={{
                flex: "1 1 160px", minHeight: 46, borderRadius: "var(--fd-radius, 12px)",
                border: "1.5px solid #163D70", background: "var(--fd-panel, white)", color: "var(--fd-text, #163D70)",
                fontWeight: 700, fontSize: "0.86rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}
            >
              Nada en específico
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 10 }}>
          {([
            { id: "cero", icon: "moon", label: "Cero ganas" },
            { id: "normal", icon: "cloud", label: "Normal" },
            { id: "ganas", icon: "sun", label: "Con ganas" },
            { id: "atope", icon: "flame", label: "A tope" },
          ] as { id: StudyMood; icon: FPIconName; label: string }[]).map((o) => (
            <Option
              key={o.id}
              selected={mood === o.id}
              onClick={() => { setMood(o.id); setStep(3); }}
              title={o.label}
              icon={o.icon}
            />
          ))}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gap: 10 }}>
          {([
            { id: "verde", dot: "#22a06b", label: "Nada urgente", desc: "Voy con calma." },
            { id: "amarillo", dot: "#e0b400", label: "Algo urgente", desc: "Quiero avanzar en serio." },
            { id: "naranja", dot: "#e07b39", label: "Bastante urgente", desc: "Ya se me viene encima." },
            { id: "rojo", dot: "#c0392b", label: "Urgentísimo", desc: "Necesito rendir ya." },
          ] as { id: StudyUrgency; dot: string; label: string; desc: string }[]).map((o) => (
            <Option
              key={o.id}
              selected={urgency === o.id}
              onClick={() => { setUrgency(o.id); setStep(4); }}
              title={o.label}
              desc={o.desc}
              dot={o.dot}
            />
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              min={10}
              max={240}
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
              style={{
                width: 96, padding: "12px 14px", borderRadius: "var(--fd-radius, 12px)", border: "1.5px solid #EEE1C5",
                fontSize: "1rem", textAlign: "center", fontFamily: "'Manrope', sans-serif", outline: "none",
              }}
            />
            <span style={{ fontSize: "0.88rem", color: "var(--fd-muted, #4A5872)", fontWeight: 600 }}>minutos</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {[15, 25, 45, 60, 120].map((m) => (
              <button
                key={m}
                onClick={() => setMinutos(String(m))}
                style={{
                  padding: "8px 15px", minHeight: 40, borderRadius: "var(--fd-radius, 20px)", cursor: "pointer",
                  border: `1.5px solid ${Number(minutos) === m ? "#163D70" : "#EEE1C5"}`,
                  background: Number(minutos) === m ? "rgba(22,61,112,.08)" : "var(--fd-panel, white)",
                  color: Number(minutos) === m ? "var(--fd-text, #163D70)" : "var(--fd-muted, #4A5872)",
                  fontWeight: 700, fontSize: "0.82rem", fontFamily: "'Manrope', sans-serif",
                }}
              >
                {m} min
              </button>
            ))}
          </div>
          <button
            onClick={finish}
            disabled={loading}
            style={{
              width: "100%", minHeight: 50, borderRadius: "var(--fd-radius, 12px)", border: "none",
              background: loading ? "rgba(122,92,30,.5)" : "#7A5C1E", color: "white",
              fontWeight: 800, fontSize: "0.92rem", cursor: loading ? "wait" : "pointer",
              fontFamily: "'Manrope', sans-serif", display: "inline-flex",
              alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? "Pathy está armando tu sesión…" : (<><Icon n="spark" size={17} color="#fff" /> Armar mi sesión con Pathy</>)}
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button
          onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
          style={{
            background: "none", border: "none", color: "var(--fd-muted, #4A5872)", fontWeight: 700,
            fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif", padding: 6,
          }}
        >
          ← {step === 0 ? "Cancelar" : "Atrás"}
        </button>
      </div>
    </div>
  );
}
