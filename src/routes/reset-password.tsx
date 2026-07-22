import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updateCurrentPassword } from "@/lib/store";
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

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = supa();
    if (!s) { setReady(true); return; }
    // Supabase v2 processes the recovery hash automatically; wait for a session.
    let cancelled = false;
    const sub = s.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
      setReady(true);
    });
    void s.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) setHasSession(true);
      setReady(true);
    });
    return () => { cancelled = true; sub.data.subscription.unsubscribe(); };
  }, []);

  async function handleSubmit() {
    setError(null);
    if (pw.length < 8) return setError("Mínimo 8 caracteres.");
    if (pw !== pw2) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    const res = await updateCurrentPassword(pw);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "No pudimos actualizar la contraseña.");
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 1200);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(34,55,92,.08)" }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", color: "#22375C", marginBottom: 8 }}>Restablecer contraseña</h1>
        <p style={{ fontSize: ".85rem", color: "#647DA0", marginBottom: 20 }}>Escribe una nueva contraseña para tu cuenta.</p>

        {!ready && <p style={{ fontSize: ".85rem", color: "#647DA0" }}>Cargando…</p>}

        {ready && !hasSession && (
          <div>
            <p style={{ fontSize: ".85rem", color: "#e74c3c", fontWeight: 600 }}>
              El enlace no es válido o expiró. Solicita uno nuevo desde iniciar sesión.
            </p>
            <button onClick={() => navigate({ to: "/login" })}
              style={{ marginTop: 16, width: "100%", padding: "12px 16px", background: "#3D5D91", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
              Volver a iniciar sesión
            </button>
          </div>
        )}

        {ready && hasSession && !done && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="password" placeholder="Nueva contraseña" value={pw} onChange={(e) => setPw(e.target.value)}
              style={{ padding: "12px 16px", border: "1.5px solid #E8EEF6", borderRadius: 12, fontSize: ".9rem" }} />
            <input type="password" placeholder="Confirma la contraseña" value={pw2} onChange={(e) => setPw2(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              style={{ padding: "12px 16px", border: "1.5px solid #E8EEF6", borderRadius: 12, fontSize: ".9rem" }} />
            {error && <p style={{ fontSize: ".78rem", color: "#e74c3c", fontWeight: 600 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: "12px 16px", background: loading ? "#8DA1BE" : "#3D5D91", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
              {loading ? "Guardando…" : "Actualizar contraseña"}
            </button>
          </div>
        )}

        {done && (
          <p style={{ fontSize: ".9rem", color: "#2ecc71", fontWeight: 600 }}>
            ✓ Contraseña actualizada. Redirigiendo a iniciar sesión…
          </p>
        )}
      </div>
    </div>
  );
}
