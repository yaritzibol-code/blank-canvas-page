/**
 * Reportar problema (PRD §6.17): función transversal. El reporte captura
 * contexto (sección, recurso) y llega al Panel Admin → Soporte y feedback.
 */
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { submitReport } from "@/lib/store";
import type { ReportQuestionSnapshot, User } from "@/lib/store";

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#081A35";

export const REPORT_TYPES = [
  "Error técnico",
  "Problema de acceso",
  "Problema con video",
  "Problema con PDF o descarga",
  "Pregunta mal redactada",
  "Respuesta incorrecta",
  "Explicación confusa",
  "Material incorrecto o incompleto",
  "Problema con recordatorios",
  "Problema con Yaris",
  "Problema con Pathy",
  "Sugerencia de mejora",
  "Comentario general",
];

export interface ReportProblemModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  /** Sección desde la que se reporta (ej. "Cuestionarios"). */
  seccion: string;
  /** Recurso relacionado (id de pregunta, clase, material...). */
  recurso?: string;
  /** Tipo preseleccionado. */
  tipoInicial?: string;
  /** Copia del reactivo reportado: viaja con el ticket al panel admin. */
  pregunta?: ReportQuestionSnapshot;
}

export function ReportProblemModal({
  open,
  onClose,
  user,
  seccion,
  recurso = "",
  tipoInicial,
  pregunta,
}: ReportProblemModalProps) {
  const [tipo, setTipo] = useState(tipoInicial ?? REPORT_TYPES[0]);
  const [mensaje, setMensaje] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = () => {
    if (!mensaje.trim()) return;
    submitReport({
      userId: user?.id ?? "anon",
      userName: user?.nombre ?? "Invitado",
      userEmail: user?.email ?? "",
      tipo,
      seccion,
      recurso: recurso || pregunta?.id || "",
      pregunta,
      mensaje: mensaje.trim(),
    });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMensaje("");
      onClose();
    }, 1800);
  };


  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 6,
    border: "1.5px solid rgba(199,160,82,.22)",
    fontSize: 14,
    fontFamily: FONT,
    color: "#FFFFFF",
    outline: "none",
    background: "rgba(255,255,255,.04)",
  } as const;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(3,8,15,.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          background: "rgba(255,255,255,.04)",
          borderRadius: 8,
          padding: "clamp(22px, 5vw, 32px)",
          boxShadow: "0 30px 80px rgba(3,8,15,.72)",
        }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: 60,
                height: 60,
                margin: "0 auto 14px",
                borderRadius: "50%",
                background: "rgba(46,204,113,.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon n="checkCircle" size={30} color="#2ecc71" />
            </div>
            <h3 style={{ fontFamily: DISPLAY, color: "#FFFFFF", margin: "0 0 6px", fontSize: "1.2rem" }}>
              ¡Reporte enviado!
            </h3>
            <p style={{ color: "#B8C5DA", fontSize: 14, margin: 0 }}>
              Gracias por avisarnos. Lo revisaremos y daremos seguimiento desde el equipo FlightPath.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Icon n="alert" size={20} color="var(--fd-gold, #7A5C1E)" />
              <h3 style={{ fontFamily: DISPLAY, color: "#FFFFFF", margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                Reportar problema
              </h3>
            </div>
            <p style={{ color: "#B8C5DA", fontSize: 13.5, margin: "0 0 18px" }}>
              Sección: <b style={{ color: "#FFFFFF" }}>{seccion}</b>
              {recurso ? (
                <>
                  {" · "}Recurso: <b style={{ color: "#FFFFFF" }}>{recurso}</b>
                </>
              ) : null}
            </p>

            {pregunta ? (
              <div
                style={{
                  border: "1px solid rgba(199,160,82,.18)",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 6,
                  padding: "12px 14px",
                  margin: "0 0 16px",
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", color: "#B8C5DA" }}>
                  PREGUNTA REPORTADA
                </div>
                <p style={{ margin: "6px 0 0", color: "#FFFFFF", fontSize: 13.5, lineHeight: 1.5 }}>
                  {pregunta.text.length > 240 ? `${pregunta.text.slice(0, 240)}…` : pregunta.text}
                </p>
              </div>
            ) : null}



            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
              Tipo de reporte
            </label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }}>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
              Describe el problema
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              placeholder="Cuéntanos qué pasó o qué debería mejorar..."
              style={{ ...inputStyle, resize: "vertical", marginBottom: 18 }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: "1.5px solid rgba(199,160,82,.22)",
                  background: "rgba(255,255,255,.04)",
                  color: "#B8C5DA",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!mensaje.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: mensaje.trim() ? "linear-gradient(180deg,#C7A052,#8A6A25)" : "rgba(255,255,255,.12)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: mensaje.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT,
                }}
              >
                Enviar reporte
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
