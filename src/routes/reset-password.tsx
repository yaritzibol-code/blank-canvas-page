import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updateCurrentPassword, resetPassword, cloudEnabled } from "@/lib/store";
import { supa } from "@/lib/store/cloud";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Restablecer contraseña · FlightPath" },
      { name: "description", content: "Define una nueva contraseña para tu cuenta." },
    ],
  }),
});

/**
 * Página PÚBLICA (sin guard de sesión):
 *  - "checking":  llegó con token de recuperación; espera a que el SDK lo procese.
 *  - "form":      hay sesión (de recuperación o normal) → definir contraseña nueva.
 *  - "request":   sin sesión y sin token → solicitar el enlace por correo.
 *  - "invalid":   el enlace venía con error o expiró.
 *  - "done":      contraseña actualizada.
 */
type Mode = "checking" | "form" | "request" | "invalid" | "done";

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1.5px solid #E8EEF6",
  borderRadius: 12,
  fontSize: ".9rem",
  width: "100%",
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px 16px",
  background: disabled ? "#8DA1BE" : "#3D5D91",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: disabled ? "default" : "pointer",
});

function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Lee los parámetros ANTES de tocar el cliente: el SDK limpia el hash de la
    // URL en cuanto procesa los tokens de recuperación.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const errorDesc = hash.get("error_description") ?? query.get("error_description");
    const hasError = !!(hash.get("error") ?? query.get("error") ?? errorDesc);
    const hasRecoveryToken =
      hash.get("type") === "recovery" || !!hash.get("access_token") || !!query.get("code") || !!query.get("token_hash");

    const s = supa();
    if (!s) {
      // Modo local (sin Lovable Cloud): no hay correos; restablecimiento directo.
      setMode("request");
      return;
    }

    if (hasError) {
      setLinkError(errorDesc ? errorDesc.replace(/\+/g, " ") : null);
      setMode("invalid");
      return;
    }

    let cancelled = false;
    let settled = false;
    const settle = (m: Mode) => {
      if (cancelled || settled) return;
      settled = true;
      setMode(m);
    };

    const sub = s.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) settle("form");
    });
    // getSession espera a que el SDK termine de procesar el hash de la URL.
    void s.auth.getSession().then(({ data }) => {
      if (data.session) settle("form");
      else if (!hasRecoveryToken) settle("request");
      // Con token pendiente, deja correr el listener (o el timeout).
    });
    const timeout = setTimeout(() => settle(hasRecoveryToken ? "invalid" : "request"), 10000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(34,55,92,.08)" }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", color: "#22375C", marginBottom: 8 }}>Restablecer contraseña</h1>

        {mode === "checking" && (
          <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Verificando tu enlace…</p>
        )}

        {mode === "invalid" && (
          <div>
            <p style={{ fontSize: ".85rem", color: "#e74c3c", fontWeight: 600 }}>
              {linkError ?? "El enlace no es válido o expiró."}
            </p>
            <p style={{ fontSize: ".82rem", color: "#647DA0", marginTop: 8 }}>
              Solicita un enlace nuevo aquí abajo y revisa tu correo.
            </p>
            <button onClick={() => setMode("request")} style={{ ...buttonStyle(false), marginTop: 16 }}>
              Solicitar enlace nuevo
            </button>
          </div>
        )}

        {mode === "request" && <RequestLinkForm />}
        {mode === "form" && <NewPasswordForm onDone={() => setMode("done")} />}

        {mode === "done" && (
          <p style={{ fontSize: ".9rem", color: "#2ecc71", fontWeight: 600 }}>
            ✓ Contraseña actualizada. Entrando a tu cuenta…
          </p>
        )}
      </div>
    </div>
  );
}

/** Sin sesión ni token: pedir el enlace de recuperación (accesible siempre). */
function RequestLinkForm() {
  const cloud = cloudEnabled();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState(""); // solo modo local (sin correo)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setOkMsg(null);
    setLoading(true);
    const res = await resetPassword(email, pw);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "No pudimos procesar la solicitud.");
    setOkMsg(res.info ?? "Listo. Ya puedes iniciar sesión con tu nueva contraseña.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: ".85rem", color: "#647DA0" }}>
        {cloud
          ? "Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva."
          : "Escribe tu correo y tu nueva contraseña."}
      </p>
      <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      {!cloud && (
        <input type="password" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={pw} onChange={(e) => setPw(e.target.value)} style={inputStyle} />
      )}
      {error && <p style={{ fontSize: ".78rem", color: "#e74c3c", fontWeight: 600 }}>{error}</p>}
      {okMsg && <p style={{ fontSize: ".78rem", color: "#2ecc71", fontWeight: 600 }}>{okMsg}</p>}
      <button onClick={handleSubmit} disabled={loading} style={buttonStyle(loading)}>
        {loading ? "Enviando…" : cloud ? "Enviar enlace" : "Actualizar contraseña"}
      </button>
      <a href="/login" style={{ fontSize: ".8rem", color: "#3D5D91", fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
        ← Volver a iniciar sesión
      </a>
    </div>
  );
}

/** Con sesión (de recuperación o normal): definir la contraseña nueva. */
function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (pw.length < 8) return setError("Mínimo 8 caracteres.");
    if (pw !== pw2) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    const res = await updateCurrentPassword(pw);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "No pudimos actualizar la contraseña.");
    onDone();
    // Recarga completa: restaura y espeja la sesión ya autenticada.
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Escribe una nueva contraseña para tu cuenta.</p>
      <input type="password" placeholder="Nueva contraseña" value={pw} onChange={(e) => setPw(e.target.value)} style={inputStyle} />
      <input
        type="password"
        placeholder="Confirma la contraseña"
        value={pw2}
        onChange={(e) => setPw2(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        style={inputStyle}
      />
      {error && <p style={{ fontSize: ".78rem", color: "#e74c3c", fontWeight: 600 }}>{error}</p>}
      <button onClick={handleSubmit} disabled={loading} style={buttonStyle(loading)}>
        {loading ? "Guardando…" : "Actualizar contraseña"}
      </button>
    </div>
  );
}
