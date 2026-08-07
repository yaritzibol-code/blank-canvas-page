/**
 * Banco de preguntas de la entrevista RTARI.
 *
 * Es material de estudio, no un cuestionario: cada pregunta se abre para ver
 * la traducción y lo que debe contener una buena respuesta. Las que ya le
 * tocaron al alumno en alguna entrevista se marcan, para que sepa qué le falta
 * por practicar.
 */
import { useMemo, useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  RTARI_BLOQUES,
  RTARI_QUESTIONS,
  type RtariBloque,
  type RtariQuestion,
} from "@/modules/rtari/questions";

const NAVY = "#22375C";
const CORAL = "#6C0820";
const CREAM = "#FBFAF7";
const HAZE = "#647DA0";
const SALMON = "#F2DCDB";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

function QuestionRow({ q, vista }: { q: RtariQuestion; vista: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderTop: `1px solid ${NAVY}12` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 4px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.66rem",
            fontWeight: 700,
            color: vista ? CORAL : `${NAVY}55`,
            minWidth: 26,
            paddingTop: 3,
          }}
          title={vista ? "Ya te tocó en una entrevista" : undefined}
        >
          {String(q.n).padStart(2, "0")}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "0.92rem", color: NAVY, fontWeight: 600 }}>
            {q.en}
          </span>
          {!open && (
            <span
              style={{
                display: "block",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "0.84rem",
                color: HAZE,
                marginTop: 2,
              }}
            >
              {q.es}
            </span>
          )}
        </span>
        <span
          style={{
            color: `${NAVY}55`,
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform .15s",
            display: "flex",
            paddingTop: 3,
          }}
        >
          <Icon n="chevR" size={16} />
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 4px 16px 38px" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "0.92rem",
              color: HAZE,
              marginBottom: 10,
            }}
          >
            {q.es}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: `${NAVY}66`,
              marginBottom: 6,
            }}
          >
            Tu respuesta debe
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
            {q.tips.map((t) => (
              <li key={t} style={{ fontSize: "0.86rem", color: NAVY, lineHeight: 1.5 }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function QuestionBank({ vistas }: { vistas: Set<string> }) {
  const [bloque, setBloque] = useState<RtariBloque | "todos">("todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    return RTARI_QUESTIONS.filter((q) => {
      if (bloque !== "todos" && q.bloque !== bloque) return false;
      if (!texto) return true;
      return q.en.toLowerCase().includes(texto) || q.es.toLowerCase().includes(texto);
    });
  }, [bloque, busca]);

  const tabs: Array<{ key: RtariBloque | "todos"; label: string; icon: FPIconName }> = [
    { key: "todos", label: `Todas · ${RTARI_QUESTIONS.length}`, icon: "list" },
    ...RTARI_BLOQUES.map((b) => ({
      key: b.id as RtariBloque | "todos",
      label: b.nombre,
      icon: b.icon as FPIconName,
    })),
  ];

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}14`,
        borderRadius: 22,
        padding: "22px 24px 8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: `${NAVY}66`,
            }}
          >
            Banco de práctica
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "1.7rem",
              color: NAVY,
              margin: "4px 0 0",
            }}
          >
            Las {RTARI_QUESTIONS.length} preguntas personales
          </h2>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", color: `${NAVY}55` }}>
            <Icon n="search" size={16} />
          </span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pregunta…"
            aria-label="Buscar pregunta"
            style={{
              border: `1px solid ${NAVY}1A`,
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: "0.85rem",
              color: NAVY,
              minWidth: 200,
              background: CREAM,
              outline: "none",
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
        {tabs.map((t) => {
          const activo = bloque === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setBloque(t.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${activo ? "transparent" : `${NAVY}18`}`,
                background: activo ? NAVY : "transparent",
                color: activo ? "white" : NAVY,
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Icon n={t.icon} size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        {lista.length === 0 ? (
          <div
            style={{
              padding: "28px 4px",
              textAlign: "center",
              color: HAZE,
              fontFamily: SERIF,
              fontStyle: "italic",
            }}
          >
            Ninguna pregunta coincide con "{busca}".
          </div>
        ) : (
          lista.map((q) => <QuestionRow key={q.id} q={q} vista={vistas.has(q.id)} />)
        )}
      </div>

      <div
        style={{
          borderTop: `1px solid ${NAVY}12`,
          marginTop: 4,
          padding: "12px 4px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.76rem",
          color: HAZE,
        }}
      >
        <span style={{ display: "flex", color: CORAL }}>
          <Icon n="info" size={14} />
        </span>
        Las preguntas en <strong style={{ color: CORAL }}>vino</strong> ya te tocaron en alguna
        entrevista.
        <span
          style={{
            marginLeft: "auto",
            background: SALMON,
            color: CORAL,
            padding: "3px 10px",
            borderRadius: 999,
            fontFamily: MONO,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {vistas.size}/{RTARI_QUESTIONS.length} practicadas
        </span>
      </div>
    </div>
  );
}
