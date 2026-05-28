import type { FormulaBlockData } from "../types";

// Basic LaTeX symbol substitution for readability without a full renderer
function renderLatex(latex: string): string {
  return latex
    .replace(/\\rho/g, "ρ")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\theta/g, "θ")
    .replace(/\\phi/g, "φ")
    .replace(/\\pi/g, "π")
    .replace(/\\mu/g, "μ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    .replace(/\{/g, "")
    .replace(/\}/g, "")
    .replace(/\\_/g, "_")
    .replace(/\\\^/g, "^")
    .trim();
}

export function FormulaBlock({ nombre, formula, formula_latex, variables, nota }: FormulaBlockData) {
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
          background: "rgba(108,8,32,0.07)",
          color: "#6C0820",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 16,
        }}
      >
        📐 Fórmula
      </div>

      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#1a1a2e",
          marginBottom: 16,
        }}
      >
        {nombre}
      </h3>

      {/* Simple readable formula (optional, shown above LaTeX) */}
      {formula && (
        <p
          style={{
            fontSize: "0.88rem",
            fontFamily: "'Courier New', monospace",
            color: "#5A86CB",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          {formula}
        </p>
      )}

      {/* Formula display */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #2d2d4e)",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <code
          style={{
            color: "#F2AEBC",
            fontSize: "1.3rem",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 700,
            letterSpacing: "0.03em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {renderLatex(formula_latex)}
        </code>
      </div>

      {/* Variables table */}
      {variables.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 8,
            }}
          >
            Variables
          </p>
          <div
            style={{
              border: "1px solid #F2DCDB",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {variables.map((v, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "10px 16px",
                  borderBottom: i < variables.length - 1 ? "1px solid #F2DCDB" : "none",
                  background: i % 2 === 0 ? "white" : "rgba(242,220,219,0.2)",
                }}
              >
                <code
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#3D5D91",
                    minWidth: 60,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {renderLatex(v.simbolo)}
                </code>
                <div style={{ flex: 1 }}>
                  {v.nombre && (
                    <p
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#888",
                        margin: "0 0 2px",
                      }}
                    >
                      {v.nombre}
                    </p>
                  )}
                  <span style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.4 }}>
                    {v.descripcion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual note */}
      {nota && (
        <div
          style={{
            background: "rgba(242,174,188,0.15)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "#6C0820",
            lineHeight: 1.5,
          }}
        >
          💡 {nota}
        </div>
      )}
    </div>
  );
}
