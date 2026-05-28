import { useState } from "react";
import type { FlashcardsBlockData } from "../types";

export function FlashcardsBlock({ cards }: FlashcardsBlockData) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function goTo(index: number) {
    setFlipped(false);
    // Small delay so the unflip animation finishes before swapping content
    setTimeout(() => setCurrent(index), 150);
  }

  function prev() {
    if (current > 0) goTo(current - 1);
  }

  function next() {
    if (current < cards.length - 1) goTo(current + 1);
  }

  const card = cards[current];

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
          background: "rgba(90,134,203,0.1)",
          color: "#5A86CB",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 6,
        }}
      >
        🃏 Flashcards de repaso
      </div>

      <p style={{ fontSize: "0.83rem", color: "#999", marginBottom: 16 }}>
        Toca la tarjeta para ver la respuesta
      </p>

      {/* 3D flip card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: "1000px", height: 200, cursor: "pointer", marginBottom: 16 }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — question */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 28px",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              textAlign: "center",
              background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
              color: "white",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                opacity: 0.7,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
              }}
            >
              Pregunta {current + 1} / {cards.length}
            </span>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {card.pregunta}
            </p>
            <span style={{ fontSize: "0.7rem", opacity: 0.55, marginTop: 16 }}>
              👆 toca para voltear
            </span>
          </div>

          {/* Back — answer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 28px",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              textAlign: "center",
              background: "linear-gradient(135deg, #6C0820, #9a0c2e)",
              color: "white",
              transform: "rotateY(180deg)",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                opacity: 0.7,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
              }}
            >
              Respuesta
            </span>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{card.respuesta}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          onClick={prev}
          disabled={current === 0}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "2px solid #F2DCDB",
            background: "white",
            cursor: current === 0 ? "not-allowed" : "pointer",
            color: current === 0 ? "#ddd" : "#3D5D91",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          ‹
        </button>

        {/* Dot indicators */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === current ? "#3D5D91" : "#F2DCDB",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === cards.length - 1}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "2px solid #F2DCDB",
            background: "white",
            cursor: current === cards.length - 1 ? "not-allowed" : "pointer",
            color: current === cards.length - 1 ? "#ddd" : "#3D5D91",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#bbb" }}>
        {current + 1} de {cards.length} tarjetas
      </p>
    </div>
  );
}
