import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { register, login, resetPassword, getSessionUser, ensureSeeded } from "@/lib/store";
import { lovable } from "@/integrations/lovable";

async function signInWithGoogle(setError: (m: string) => void) {
  try {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { setError(res.error.message || "No pudimos iniciar sesión con Google."); return; }
    if (res.redirected) return;
    window.location.href = "/dashboard";
  } catch (e) {
    setError(e instanceof Error ? e.message : "Error al iniciar sesión con Google.");
  }
}

type Tab = "register" | "login";

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const INK = "#22375C";

/* ── Clean single-stroke line icons ── */
type IconName = "gift" | "library" | "help" | "spark" | "cloud" | "check" | "arrow" | "back";
function Icon({ n, size = 18, sw = 1.6, color = "currentColor" }: { n: IconName; size?: number; sw?: number; color?: string }) {
  const p = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g: Record<IconName, React.ReactNode> = {
    gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" {...p} /><path d="M4 13h16M12 9v11M12 9S10.5 4.5 8.5 5.2 8.8 9 12 9zM12 9s1.5-4.5 3.5-3.8S15.2 9 12 9z" {...p} /></>,
    library: <path d="M5 4v16M9 4v16M14 6l5 14M5 4h4M14 6l4-1" {...p} />,
    help: <><circle cx="12" cy="12" r="9" {...p} /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6v.4" {...p} /><circle cx="12" cy="17" r="0.6" fill={color} stroke="none" /></>,
    spark: <path d="M12 3l1.6 5.8L19 11l-5.4 1.6L12 19l-1.6-6.4L5 11l5.4-2.2L12 3z" {...p} />,
    cloud: <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18H7z" {...p} />,
    check: <path d="M5 12l4 4 10-10" {...p} />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    back: <path d="M19 12H5M11 6l-6 6 6 6" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ display: "block" }}>{g[n]}</svg>;
}

function PlaneMark({ size = 38 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, background: "#3D5D91", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} aria-hidden="true">
        <path d="M7 21V5h10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12.5h7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M15.5 4.5l3.5 1-1 3.5" fill="none" stroke="#F2AEBC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const PERKS: { icon: IconName; text: string }[] = [
  { icon: "gift", text: "Comienza gratis — sin tarjeta de crédito" },
  { icon: "library", text: "Accede a la biblioteca completa del CIAAC" },
  { icon: "help", text: "Practica con el banco de preguntas" },
  { icon: "spark", text: "Pregúntale a Yaris, tu tutor IA" },
  { icon: "cloud", text: "Pathy te guía desde el primer día" },
];

const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const errorTextStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "#e74c3c",
  fontWeight: 600,
  textAlign: "center",
  lineHeight: 1.4,
};

const googleMsgStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#647DA0",
  textAlign: "center",
  lineHeight: 1.4,
};

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleMsg, setGoogleMsg] = useState(false);

  async function handleRegister() {
    if (loading) return;
    setError(null);
    if (!terms) {
      setError("Debes aceptar los Términos y condiciones y el Aviso de privacidad.");
      return;
    }
    setLoading(true);
    const res = await register({ nombre, email, password, marketingOptIn: marketing });
    if (!res.ok) {
      setLoading(false);
      setError(res.error ?? "No pudimos crear tu cuenta. Inténtalo de nuevo.");
      return;
    }
    if (res.info) {
      // La nube pide confirmar el correo antes de entrar.
      setLoading(false);
      setError(res.info);
      return;
    }
    setTimeout(() => { window.location.href = "/dashboard"; }, 400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Free badge */}
      <div style={{
        background: INK,
        color: "white",
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(242,174,188,0.18)", color: "#F2AEBC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon n="gift" size={20} />
        </span>
        <div>
          <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: 2, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>
            Empieza gratis hoy
          </strong>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.4, opacity: 0.78 }}>
            Sin tarjeta de crédito. Accede al contenido gratuito de inmediato.
          </p>
        </div>
      </div>

      <Field label="Nombre completo">
        <input type="text" placeholder="Ej. María González" required style={inputStyle}
          value={nombre} onChange={(e) => setNombre(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
      </Field>

      <Field label="Correo electrónico">
        <input type="email" placeholder="tu@correo.com" required style={inputStyle}
          value={email} onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
      </Field>

      <Field label="Contraseña" hint="Usa letras, números y símbolos para mayor seguridad.">
        <div style={{ position: "relative" }}>
          <input type={showPw ? "text" : "password"} placeholder="Mínimo 8 caracteres" required style={{ ...inputStyle, paddingRight: 44 }}
            value={password} onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8DA1BE", display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, accentColor: "#6C0820", flexShrink: 0 }} />
        <span style={{ fontSize: "0.82rem", color: "#647DA0", lineHeight: 1.4 }}>
          Quiero recibir promociones, tips de estudio y novedades de FlightPath por correo.
        </span>
      </label>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, accentColor: "#6C0820", flexShrink: 0 }} />
        <span style={{ fontSize: "0.82rem", color: "#647DA0", lineHeight: 1.4 }}>
          Acepto los{" "}
          <Link to="/legal" style={{ color: "#3D5D91", fontWeight: 600, textDecoration: "none" }}>Términos y condiciones</Link>{" "}
          y el{" "}
          <Link to="/legal" style={{ color: "#3D5D91", fontWeight: 600, textDecoration: "none" }}>Aviso de privacidad</Link>.
        </span>
      </label>

      <Divider />
      <GoogleButton onClick={() => signInWithGoogle((m) => setError(m))} />
      {error && <p style={errorTextStyle}>{error}</p>}
      <SubmitButton loading={loading} onClick={handleRegister}>Crear cuenta gratis</SubmitButton>

      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8DA1BE", marginTop: 4 }}>
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={onSwitch}
          style={{ color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleMsg, setGoogleMsg] = useState(false);

  // Flujo MVP de "¿Olvidaste tu contraseña?"
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPw, setResetPw] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetOk, setResetOk] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function handleLogin() {
    if (loading) return;
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    if (!res.ok) {
      setLoading(false);
      setError(res.error ?? "No pudimos iniciar sesión. Inténtalo de nuevo.");
      return;
    }
    setTimeout(() => { window.location.href = "/dashboard"; }, 400);
  }

  async function handleReset() {
    setResetError(null);
    setResetOk(false);
    setResetMsg(null);
    const res = await resetPassword(resetEmail, resetPw);
    if (!res.ok) {
      setResetError(res.error ?? "No pudimos actualizar la contraseña.");
      return;
    }
    if (res.info) setResetMsg(res.info);
    setResetOk(true);
    setResetPw("");
  }

  if (showReset) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Correo electrónico">
          <input type="email" placeholder="tu@correo.com" style={inputStyle}
            value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
        </Field>

        <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
          <input type="password" placeholder="Tu nueva contraseña" style={inputStyle}
            value={resetPw} onChange={(e) => setResetPw(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
        </Field>

        {resetError && <p style={errorTextStyle}>{resetError}</p>}
        {resetOk && (
          <p style={{ ...errorTextStyle, color: "#2ecc71" }}>{resetMsg ?? "Contraseña actualizada, inicia sesión."}</p>
        )}
        <SubmitButton loading={false} onClick={handleReset}>Actualizar contraseña</SubmitButton>

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8DA1BE", marginTop: 4 }}>
          <button type="button" onClick={() => setShowReset(false)}
            style={{ color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>
            ← Volver a iniciar sesión
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Correo electrónico">
        <input type="email" placeholder="tu@correo.com" style={inputStyle}
          value={email} onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
      </Field>

      <Field label="Contraseña">
        <div style={{ position: "relative" }}>
          <input type={showPw ? "text" : "password"} placeholder="Tu contraseña" style={{ ...inputStyle, paddingRight: 44 }}
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")} onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8DA1BE", display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <div style={{ textAlign: "right" }}>
        <button type="button"
          onClick={() => { setShowReset(true); setResetEmail(email); setResetError(null); setResetOk(false); }}
          style={{ fontSize: "0.8rem", color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <p style={errorTextStyle}>{error}</p>}
      <SubmitButton loading={loading} onClick={handleLogin}>Iniciar sesión</SubmitButton>
      <Divider />
      <GoogleButton onClick={() => setGoogleMsg(true)} />
      {googleMsg && <p style={googleMsgStyle}>Disponible próximamente — usa tu correo</p>}

      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8DA1BE", marginTop: 4 }}>
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={onSwitch}
          style={{ color: "#3D5D91", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>
          Regístrate gratis
        </button>
      </p>
    </div>
  );
}

/* ─── Shared small components ──────────────────────────── */

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1.5px solid #E8EEF6",
  borderRadius: 12,
  fontSize: "0.9rem",
  fontFamily: FONT,
  color: INK,
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
  background: "#FBFAF7",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#647DA0", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: "0.75rem", color: "#8DA1BE" }}>{hint}</span>}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#B9C8DD", fontSize: "0.78rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>
      <span style={{ flex: 1, height: 1, background: "#E8EEF6", display: "block" }} />
      o
      <span style={{ flex: 1, height: 1, background: "#E8EEF6", display: "block" }} />
    </div>
  );
}

function GoogleButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 12,
        border: `1.5px solid ${hovered ? "#B9C8DD" : "#E8EEF6"}`, borderRadius: 12,
        background: hovered ? "#F4F7FB" : "white",
        fontSize: "0.9rem", fontWeight: 600, color: INK,
        cursor: "pointer", transition: "all 0.2s", fontFamily: FONT, width: "100%",
      }}>
      {GOOGLE_SVG}
      Continuar con Google
    </button>
  );
}

function SubmitButton({ children, loading, onClick }: { children: React.ReactNode; loading: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={loading} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: 14,
        background: loading ? "#8DA1BE" : hovered ? "#4A0517" : "#6C0820",
        color: "white", border: "none", borderRadius: 12,
        fontSize: "0.95rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s", fontFamily: FONT,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transform: hovered && !loading ? "translateY(-2px)" : "none",
        boxShadow: hovered && !loading ? "0 14px 30px -14px rgba(108,8,32,0.45)" : "none",
      }}>
      {loading ? "Un momento…" : <>{children}<Icon n="arrow" size={17} /></>}
    </button>
  );
}

/* ─── Main AuthPage component ──────────────────────────── */
export function AuthPage({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  // Si ya hay sesión activa, directo al dashboard.
  useEffect(() => {
    ensureSeeded();
    if (getSessionUser()) window.location.href = "/dashboard";
  }, []);

  return (
    <div style={{
      fontFamily: FONT,
      background: "linear-gradient(180deg, #FBFAF7 0%, #F4F7FB 55%, #FCFBF8 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* NAVBAR */}
      <nav style={{
        background: "rgba(250,248,244,0.72)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
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
          fontFamily: DISPLAY, fontSize: "1.3rem", color: INK, fontWeight: 600,
          textDecoration: "none", letterSpacing: "-0.02em",
        }}>
          <PlaneMark size={36} />
          Flight<span style={{ color: "#6C0820" }}>Path</span>
        </Link>
        <Link to="/" style={{ fontSize: "0.82rem", color: "#647DA0", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
          <Icon n="back" size={16} /> Volver al inicio
        </Link>
      </nav>

      {/* MAIN */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px", gap: 60,
      }}>
        {/* LEFT — PATHY */}
        <div style={{ maxWidth: 380, textAlign: "center" }} className="hidden md:block">
          <div style={{ width: 150, height: 150, margin: "0 auto 20px", borderRadius: "50%", overflow: "hidden", boxShadow: "0 20px 50px -24px rgba(15,26,51,0.55)", animation: "fp-float 3.5s ease-in-out infinite", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(242,174,188,0.3), transparent 70%)", transform: "scale(1.3)", filter: "blur(8px)" }} />
            <img src="/assets/pathy-cloud.png" alt="Pathy, tu copiloto de estudio" style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)" }} />
          </div>
          <style>{`@keyframes fp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "1.8rem", color: INK, marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            ¡Bienvenido a<br />
            <span style={{ color: "#6C0820" }}>FlightPath!</span>
          </h2>
          <p style={{ color: "#647DA0", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 28 }}>
            Tu copiloto Pathy ya está listo para acompañarte en cada paso hacia el CIAAC.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
            {PERKS.map((perk) => (
              <div key={perk.text} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "white", borderRadius: 14, padding: "12px 16px",
                boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 8px 24px -12px rgba(15,26,51,0.12)",
                border: "1px solid #E8EEF6",
              }}>
                <div style={{
                  width: 36, height: 36, background: "#FAEFEE", color: "#6C0820", borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon n={perk.icon} size={18} />
                </div>
                <span style={{ fontSize: "0.85rem", color: "#33527F", fontWeight: 500 }}>
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
          boxShadow: "0 2px 4px rgba(15,26,51,0.04), 0 24px 48px -20px rgba(15,26,51,0.22)",
          border: "1px solid #E8EEF6",
        }}>
          {/* TABS */}
          <div style={{
            display: "flex", background: "#F4F7FB", borderRadius: 12, padding: 4, marginBottom: 32,
            border: "1px solid #E8EEF6",
          }}>
            {(["register", "login"] as Tab[]).map((t, i) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: 10, textAlign: "center",
                  fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", borderRadius: 9,
                  transition: "all 0.2s",
                  color: tab === t ? "#22375C" : "#8DA1BE",
                  border: "none",
                  background: tab === t ? "white" : "transparent",
                  boxShadow: tab === t ? "0 2px 8px rgba(61,93,145,0.15)" : "none",
                  fontFamily: FONT,
                }}>
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
