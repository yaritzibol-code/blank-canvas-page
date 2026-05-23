import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";

type Tab = "register" | "login";

const PERKS = [
  { icon: "🆓", text: "Comienza gratis — sin tarjeta de crédito" },
  { icon: "📚", text: "Accede a la biblioteca completa del CIAAC" },
  { icon: "❓", text: "Practica con el banco de preguntas" },
  { icon: "🤖", text: "Pregúntale a Yaris, tu tutor IA" },
  { icon: "☁️", text: "Pathy te guía desde el primer día" },
];

const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1000);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Free badge */}
      <div style={{
        background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
        color: "white",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: "1.5rem" }}>🎉</span>
        <div>
          <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: 2 }}>
            Empieza gratis hoy
          </strong>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.4, opacity: 0.9 }}>
            Sin tarjeta de crédito. Accede al contenido gratuito de inmediato.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
          Nombre completo
        </label>
        <input
          type="text"
          placeholder="Ej. María González"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
          onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="tu@correo.com"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
          onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            required
            style={{ ...inputStyle, paddingRight: 44 }}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
            onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex",
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
          Usa letras, números y símbolos para mayor seguridad.
        </span>
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          defaultChecked
          style={{ width: 18, height: 18, marginTop: 2, accentColor: "#3D5D91", flexShrink: 0 }}
        />
        <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.4 }}>
          Quiero recibir promociones, tips de estudio y novedades de FlightPath por correo. ✉️
        </span>
      </label>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          required
          style={{ width: 18, height: 18, marginTop: 2, accentColor: "#3D5D91", flexShrink: 0 }}
        />
        <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.4 }}>
          Acepto los{" "}
          <a href="#" style={{ color: "#3D5D91", fontWeight: 600, textDecoration: "none" }}>
            Términos y condiciones
          </a>{" "}
          y el{" "}
          <a href="#" style={{ color: "#3D5D91", fontWeight: 600, textDecoration: "none" }}>
            Aviso de privacidad
          </a>
          .
        </span>
      </label>

      <Divider />

      <GoogleButton />

      <SubmitButton loading={loading}>Crear cuenta gratis →</SubmitButton>

      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#aaa", marginTop: 4 }}>
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{ color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
        >
          Inicia sesión aquí
        </button>
      </p>
    </form>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1000);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="tu@correo.com"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
          onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            placeholder="Tu contraseña"
            required
            style={{ ...inputStyle, paddingRight: 44 }}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
            onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex",
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <a href="#" style={{ fontSize: "0.8rem", color: "#3D5D91", fontWeight: 600, textDecoration: "none" }}>
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <SubmitButton loading={loading}>Iniciar sesión →</SubmitButton>

      <Divider />

      <GoogleButton />

      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#aaa", marginTop: 4 }}>
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{ color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
        >
          Regístrate gratis
        </button>
      </p>
    </form>
  );
}

/* ─── Shared small components ──────────────────────────── */

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "2px solid #F2DCDB",
  borderRadius: 10,
  fontSize: "0.9rem",
  fontFamily: "'DM Sans', sans-serif",
  color: "#1a1a2e",
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
};

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ccc", fontSize: "0.8rem" }}>
      <span style={{ flex: 1, height: 1, background: "#F2DCDB", display: "block" }} />
      o
      <span style={{ flex: 1, height: 1, background: "#F2DCDB", display: "block" }} />
    </div>
  );
}

function GoogleButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: 12,
        border: `2px solid ${hovered ? "#5A86CB" : "#F2DCDB"}`,
        borderRadius: 10,
        background: hovered ? "#f8f9ff" : "white",
        fontSize: "0.9rem", fontWeight: 600, color: "#1a1a2e",
        cursor: "pointer", transition: "all 0.2s",
        fontFamily: "'DM Sans', sans-serif",
        width: "100%",
      }}
    >
      {GOOGLE_SVG}
      Continuar con Google
    </button>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 14,
        background: loading ? "#aaa" : hovered ? "#8a0a28" : "#6C0820",
        color: "white", border: "none", borderRadius: 10,
        fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transform: hovered && !loading ? "translateY(-2px)" : "none",
        boxShadow: hovered && !loading ? "0 8px 24px rgba(108,8,32,0.3)" : "none",
      }}
    >
      {loading ? "✈️ Un momento..." : children}
    </button>
  );
}

/* ─── Main AuthPage component ──────────────────────────── */
export function AuthPage({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "linear-gradient(135deg, #f8f0f5 0%, #e8f0fa 50%, #f0e8f5 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* NAVBAR */}
      <nav style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(61,93,145,0.1)",
        padding: "0 5%",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <Link to="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.5rem", color: "#3D5D91", fontWeight: 700,
          textDecoration: "none",
        }}>
          <div style={{
            width: 38, height: 38, background: "#3D5D91", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "1rem", fontWeight: 700,
          }}>
            F✈
          </div>
          Flight<span style={{ color: "#6C0820" }}>Path</span>
        </Link>
        <Link to="/" style={{ fontSize: "0.85rem", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          ← Volver al inicio
        </Link>
      </nav>

      {/* MAIN */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 60,
      }}>
        {/* LEFT — PATHY */}
        <div style={{ maxWidth: 380, textAlign: "center" }}
          className="hidden md:block">
          <span style={{
            fontSize: "6rem",
            animation: "fp-float 3s ease-in-out infinite",
            marginBottom: 16,
            display: "block",
          }}>
            ☁️
          </span>
          <style>{`
            @keyframes fp-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            color: "#1a1a2e",
            marginBottom: 12,
          }}>
            ¡Bienvenido a<br />
            <span style={{ color: "#6C0820" }}>FlightPath!</span>
          </h2>
          <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 32 }}>
            Tu copiloto Pathy ya está listo para acompañarte en cada paso hacia el CIAAC.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
            {PERKS.map((perk) => (
              <div key={perk.text} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "white", borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 2px 12px rgba(61,93,145,0.08)",
              }}>
                <div style={{
                  width: 36, height: 36, background: "#F2DCDB", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", flexShrink: 0,
                }}>
                  {perk.icon}
                </div>
                <span style={{ fontSize: "0.85rem", color: "#555", fontWeight: 500 }}>
                  {perk.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — CARD */}
        <div style={{
          background: "white",
          borderRadius: 24,
          padding: 40,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(61,93,145,0.12)",
        }}>
          {/* TABS */}
          <div style={{
            display: "flex",
            background: "#F2DCDB",
            borderRadius: 12,
            padding: 4,
            marginBottom: 32,
          }}>
            {(["register", "login"] as Tab[]).map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: 10,
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: 9,
                  transition: "all 0.2s",
                  color: tab === t ? "#3D5D91" : "#888",
                  border: "none",
                  background: tab === t ? "white" : "transparent",
                  boxShadow: tab === t ? "0 2px 8px rgba(61,93,145,0.15)" : "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {i === 0 ? "Crear cuenta" : "Iniciar sesión"}
              </button>
            ))}
          </div>

          {/* FORM */}
          {tab === "register" ? (
            <RegisterForm onSwitch={() => setTab("login")} />
          ) : (
            <LoginForm onSwitch={() => setTab("register")} />
          )}
        </div>
      </div>
    </div>
  );
}
