/**
 * Onboarding inicial (PRD Flujo 2): al entrar por primera vez, el estudiante
 * registra escuela, WhatsApp y fecha CIAAC para personalizar la experiencia.
 */
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { updateUser } from "@/lib/store";
import type { User } from "@/lib/store";

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

export function OnboardingModal({ user, onDone }: { user: User; onDone: () => void }) {
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [escuela, setEscuela] = useState(user.escuela);
  const [fecha, setFecha] = useState(user.fechaCiaac ?? "");
  const [recordatorios, setRecordatorios] = useState(true);

  const finish = (skip = false) => {
    updateUser(user.id, {
      onboardingDone: true,
      ...(skip
        ? {}
        : {
            whatsapp: whatsapp.trim(),
            whatsappEstado: whatsapp.trim() ? "registrado" : "sin_numero",
            escuela: escuela.trim(),
            fechaCiaac: fecha || null,
            prefs: {
              ...user.prefs,
              toggles: { ...user.prefs.toggles, whatsapp: recordatorios },
            },
          }),
    });
    if (!skip && fecha) {
      try {
        localStorage.setItem("fp_exam_date", fecha);
        localStorage.setItem("fp_onboarding_done", "true");
      } catch {
        /* noop */
      }
    }
    onDone();
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #E3EAF5",
    fontSize: 14,
    fontFamily: FONT,
    color: INK,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  } as const;

  const labelStyle = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    color: INK,
    margin: "14px 0 6px",
  } as const;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(34,55,92,.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: "min(500px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 22,
          padding: "clamp(24px, 5vw, 36px)",
          boxShadow: "0 30px 80px rgba(34,55,92,.4)",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <Icon n="plane" size={28} color="#fff" />
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem,4vw,1.55rem)", color: INK, fontWeight: 800, margin: "0 0 6px" }}>
          ¡Bienvenido a bordo, {user.nombre.split(" ")[0]}! ✈️
        </h2>
        <p style={{ color: "#647DA0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Cuéntanos un poco de ti para personalizar tu preparación. Puedes editar todo después desde tu
          perfil.
        </p>

        <label style={labelStyle}>Escuela de aviación</label>
        <input
          value={escuela}
          onChange={(e) => setEscuela(e.target.value)}
          placeholder="Ej. Escuela de Aviación del Pacífico"
          style={inputStyle}
        />

        <label style={labelStyle}>WhatsApp (para recordatorios de estudio)</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+52 55 1234 5678"
          style={inputStyle}
        />

        <label style={labelStyle}>Fecha estimada o programada de tu CIAAC</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "16px 0 22px",
            fontSize: 13.5,
            color: "#4A5F80",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={recordatorios}
            onChange={(e) => setRecordatorios(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#3D5D91" }}
          />
          Quiero recibir recordatorios de estudio por WhatsApp
        </label>

        <button
          onClick={() => finish(false)}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 12,
            border: "none",
            background: "#6C0820",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Comenzar a estudiar
        </button>
        <button
          onClick={() => finish(true)}
          style={{
            width: "100%",
            padding: "10px 20px",
            marginTop: 8,
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: "#647DA0",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Completar después
        </button>
      </div>
    </div>
  );
}
