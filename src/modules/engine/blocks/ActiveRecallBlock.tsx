import { useState } from "react";
import type {
  ActiveRecallBlockData,
  ActiveRecallMatchData,
  ActiveRecallCompletarData,
  ActiveRecallOrdenarData,
  MatchItem,
  OrdenarItem,
} from "../types";

// ─── Match ────────────────────────────────────────────────────────────────────

function MatchActivity({ items }: { items: MatchItem[] }) {
  // Normalize both old (left/right) and new (concepto/descripcion) field names
  const normalized = items.map((item) => ({
    id: String(item.id),
    left: item.left ?? item.concepto ?? "",
    right: item.right ?? item.descripcion ?? "",
  }));

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  // leftId -> rightText (user connection)
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  // Shuffle right column once on mount
  const [rightCol] = useState<string[]>(() =>
    [...normalized].map((i) => i.right).sort(() => Math.random() - 0.5)
  );

  // Which right texts are already connected
  const usedRights = new Set(Object.values(connections));

  function clickLeft(id: string) {
    if (checked) return;
    setSelectedLeft((prev) => (prev === id ? null : id));
  }

  function clickRight(rightText: string) {
    if (checked || !selectedLeft || usedRights.has(rightText)) return;
    setConnections((prev) => ({ ...prev, [selectedLeft]: rightText }));
    setSelectedLeft(null);
  }

  function reset() {
    setConnections({});
    setSelectedLeft(null);
    setChecked(false);
  }

  const allConnected = Object.keys(connections).length === normalized.length;

  function isCorrect(id: string) {
    const correct = normalized.find((i) => i.id === id)?.right;
    return connections[id] === correct;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* Left column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {normalized.map((item) => {
            const connected = item.id in connections;
            const isSelected = selectedLeft === item.id;
            let borderColor = "#F2DCDB";
            if (checked) borderColor = isCorrect(item.id) ? "#2ecc71" : "#e74c3c";
            else if (isSelected) borderColor = "#3D5D91";
            else if (connected) borderColor = "#5A86CB";

            return (
              <button
                key={item.id}
                onClick={() => clickLeft(item.id)}
                disabled={checked}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: 10,
                  background: isSelected ? "rgba(61,93,145,0.08)" : connected ? "rgba(90,134,203,0.06)" : "white",
                  cursor: checked ? "default" : "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#1a1a2e",
                  textAlign: "left",
                  transition: "all 0.15s",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {checked && (
                  <span style={{ marginRight: 6 }}>{isCorrect(item.id) ? "✅" : "❌"}</span>
                )}
                {item.left}
              </button>
            );
          })}
        </div>

        {/* Arrow connector visual */}
        <div style={{ display: "flex", alignItems: "center", color: "#F2DCDB", fontSize: "1.2rem", paddingTop: 4 }}>
          ↔
        </div>

        {/* Right column (shuffled) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {rightCol.map((rightText) => {
            const isUsed = usedRights.has(rightText);
            return (
              <button
                key={rightText}
                onClick={() => clickRight(rightText)}
                disabled={checked || isUsed || !selectedLeft}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${isUsed ? "#5A86CB" : "#F2DCDB"}`,
                  borderRadius: 10,
                  background: isUsed ? "rgba(90,134,203,0.06)" : "white",
                  cursor: checked || isUsed || !selectedLeft ? "default" : "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "'DM Sans', sans-serif",
                  color: isUsed ? "#5A86CB" : "#1a1a2e",
                  textAlign: "left",
                  transition: "all 0.15s",
                  minHeight: 48,
                  opacity: !checked && selectedLeft && !isUsed ? 1 : isUsed ? 1 : 0.6,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isUsed && <span style={{ marginRight: 6, fontSize: "0.7rem" }}>✓</span>}
                {rightText}
              </button>
            );
          })}
        </div>
      </div>

      {selectedLeft && !checked && (
        <p style={{ fontSize: "0.78rem", color: "#5A86CB", textAlign: "center", marginBottom: 10 }}>
          Ahora selecciona el concepto correspondiente de la derecha →
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!checked ? (
          <button
            disabled={!allConnected}
            onClick={() => setChecked(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: allConnected ? "#3D5D91" : "#ddd",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: allConnected ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.2s",
            }}
          >
            Verificar respuestas
          </button>
        ) : (
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "transparent",
              color: "#3D5D91",
              border: "2px solid #3D5D91",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            🔄 Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Completar ────────────────────────────────────────────────────────────────

function CompletarActivity({ template, banco, respuestas }: ActiveRecallCompletarData) {
  const parts = template.split("___");
  const blanksCount = parts.length - 1;

  const [answers, setAnswers] = useState<(string | null)[]>(Array(blanksCount).fill(null));
  // tracks which bank word indexes are currently placed in a blank
  const [usedBankIdx, setUsedBankIdx] = useState<boolean[]>(Array(banco.length).fill(false));
  const [checked, setChecked] = useState(false);

  function clickBankWord(wordIdx: number) {
    if (checked || usedBankIdx[wordIdx]) return;
    const firstEmpty = answers.findIndex((a) => a === null);
    if (firstEmpty === -1) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[firstEmpty] = banco[wordIdx];
      return next;
    });
    setUsedBankIdx((prev) => {
      const next = [...prev];
      next[wordIdx] = true;
      return next;
    });
  }

  function clickBlank(blankIdx: number) {
    if (checked || answers[blankIdx] === null) return;
    const word = answers[blankIdx];
    // return first matching used bank word
    const bankIdx = banco.findIndex((w, i) => w === word && usedBankIdx[i]);
    setAnswers((prev) => {
      const next = [...prev];
      next[blankIdx] = null;
      return next;
    });
    if (bankIdx !== -1) {
      setUsedBankIdx((prev) => {
        const next = [...prev];
        next[bankIdx] = false;
        return next;
      });
    }
  }

  function reset() {
    setAnswers(Array(blanksCount).fill(null));
    setUsedBankIdx(Array(banco.length).fill(false));
    setChecked(false);
  }

  const allFilled = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === respuestas[i]).length;

  return (
    <div>
      {/* Template with blanks */}
      <div
        style={{
          background: "rgba(61,93,145,0.04)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          fontSize: "0.92rem",
          color: "#1a1a2e",
          lineHeight: 2,
        }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < blanksCount && (
              <button
                onClick={() => clickBlank(i)}
                disabled={checked}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 100,
                  padding: "2px 10px",
                  margin: "0 4px",
                  border: `2px solid ${
                    checked
                      ? answers[i] === respuestas[i]
                        ? "#2ecc71"
                        : "#e74c3c"
                      : answers[i]
                        ? "#5A86CB"
                        : "#F2DCDB"
                  }`,
                  borderRadius: 8,
                  background: checked
                    ? answers[i] === respuestas[i]
                      ? "rgba(46,204,113,0.1)"
                      : "rgba(231,76,60,0.08)"
                    : answers[i]
                      ? "rgba(90,134,203,0.08)"
                      : "rgba(242,220,219,0.3)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: answers[i] ? "#3D5D91" : "#ccc",
                  cursor: answers[i] && !checked ? "pointer" : "default",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                  verticalAlign: "middle",
                }}
              >
                {answers[i] ?? "___"}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 8,
        }}
      >
        Banco de palabras:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {banco.map((word, i) => (
          <button
            key={i}
            onClick={() => clickBankWord(i)}
            disabled={checked || usedBankIdx[i]}
            style={{
              padding: "6px 14px",
              border: "2px solid #F2DCDB",
              borderRadius: 20,
              background: usedBankIdx[i] ? "#F2DCDB" : "white",
              color: usedBankIdx[i] ? "#bbb" : "#1a1a2e",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: checked || usedBankIdx[i] ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: usedBankIdx[i] ? "line-through" : "none",
              transition: "all 0.15s",
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {checked && (
        <div
          style={{
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 12,
            background: score === blanksCount ? "rgba(46,204,113,0.1)" : "rgba(243,156,18,0.1)",
            border: `1px solid ${score === blanksCount ? "#2ecc71" : "#f39c12"}`,
            fontSize: "0.88rem",
            color: score === blanksCount ? "#1a7a4a" : "#8a5a00",
          }}
        >
          <strong>
            {score === blanksCount
              ? "✅ ¡Perfecto! Todos los espacios correctos."
              : `Acertaste ${score} de ${blanksCount}. Las respuestas correctas están marcadas.`}
          </strong>
          {score < blanksCount && (
            <p style={{ margin: "6px 0 0", fontSize: "0.82rem", opacity: 0.85 }}>
              Correctas: {respuestas.join(", ")}
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!checked ? (
          <button
            disabled={!allFilled}
            onClick={() => setChecked(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: allFilled ? "#3D5D91" : "#ddd",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: allFilled ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Verificar respuestas
          </button>
        ) : (
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "transparent",
              color: "#3D5D91",
              border: "2px solid #3D5D91",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            🔄 Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ordenar ──────────────────────────────────────────────────────────────────

function OrdenarActivity({ items }: { items: OrdenarItem[] }) {
  const [order, setOrder] = useState<OrdenarItem[]>(() =>
    [...items].sort(() => Math.random() - 0.5)
  );
  const [checked, setChecked] = useState(false);

  function moveUp(index: number) {
    if (index === 0 || checked) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    if (index === order.length - 1 || checked) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function reset() {
    setOrder([...items].sort(() => Math.random() - 0.5));
    setChecked(false);
  }

  const correctCount = order.filter((item, i) => item.orden === i + 1).length;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {order.map((item, i) => {
          const isCorrect = checked && item.orden === i + 1;
          const isWrong = checked && item.orden !== i + 1;
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: `2px solid ${isCorrect ? "#2ecc71" : isWrong ? "#e74c3c" : "#F2DCDB"}`,
                borderRadius: 10,
                background: isCorrect
                  ? "rgba(46,204,113,0.07)"
                  : isWrong
                    ? "rgba(231,76,60,0.06)"
                    : "white",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isCorrect ? "#2ecc71" : isWrong ? "#e74c3c" : "#F2DCDB",
                  color: isCorrect || isWrong ? "white" : "#888",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>

              <span style={{ flex: 1, fontSize: "0.88rem", color: "#1a1a2e", lineHeight: 1.4 }}>
                {item.texto}
              </span>

              {!checked && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    style={{
                      width: 26,
                      height: 22,
                      border: "1px solid #F2DCDB",
                      borderRadius: 4,
                      background: "white",
                      cursor: i === 0 ? "not-allowed" : "pointer",
                      color: i === 0 ? "#ddd" : "#3D5D91",
                      fontSize: "0.65rem",
                      fontFamily: "'DM Sans', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === order.length - 1}
                    style={{
                      width: 26,
                      height: 22,
                      border: "1px solid #F2DCDB",
                      borderRadius: 4,
                      background: "white",
                      cursor: i === order.length - 1 ? "not-allowed" : "pointer",
                      color: i === order.length - 1 ? "#ddd" : "#3D5D91",
                      fontSize: "0.65rem",
                      fontFamily: "'DM Sans', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ▼
                  </button>
                </div>
              )}

              {checked && (
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                  {isCorrect ? "✅" : "❌"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {checked && (
        <div
          style={{
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 12,
            background:
              correctCount === items.length
                ? "rgba(46,204,113,0.1)"
                : "rgba(243,156,18,0.1)",
            border: `1px solid ${correctCount === items.length ? "#2ecc71" : "#f39c12"}`,
            fontSize: "0.85rem",
            color: correctCount === items.length ? "#1a7a4a" : "#8a5a00",
          }}
        >
          <strong>
            {correctCount === items.length
              ? "✅ ¡Orden perfecto!"
              : `${correctCount} de ${items.length} en el lugar correcto.`}
          </strong>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "#3D5D91",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Verificar orden
          </button>
        ) : (
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "transparent",
              color: "#3D5D91",
              border: "2px solid #3D5D91",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            🔄 Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActiveRecallBlock(props: ActiveRecallBlockData) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 28,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#F2DCDB",
          color: "#6C0820",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 14,
        }}
      >
        ✏️ Actividad: Recuerdo Activo
      </div>

      <p
        style={{
          fontSize: "0.92rem",
          fontWeight: 600,
          color: "#1a1a2e",
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        {props.instruccion}
      </p>

      {props.tipo === "match" && <MatchActivity items={props.items} />}
      {props.tipo === "completar" && <CompletarActivity {...props} />}
      {props.tipo === "ordenar" && <OrdenarActivity items={props.items as OrdenarItem[]} />}
    </div>
  );
}
