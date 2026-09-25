/**
 * Soporte → responderle a la alumna sobre su reporte de pregunta.
 *
 * La respuesta le llega como transmisión de radio (con la pregunta y el tipo
 * de reporte como contexto), queda anotada en el ticket y, si la admin quiere,
 * cambia el estado del ticket en el mismo paso.
 */
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  Badge,
  cancelBtnStyle,
  confirmBtnStyle,
  inputStyle,
  labelStyle,
  Modal,
  modalSubStyle,
  modalTitleStyle,
} from "@/components/admin/AdminShell";
import {
  enviarNotificacion,
  flushCloudWrites,
  getNotiLecturas,
  nowISO,
  updateReport,
  useStore,
  type NotiVeredicto,
  type Report,
  type ReportRespuesta,
} from "@/lib/store";
import { RadioTransmission } from "./RadioTransmission";
import { Chip, DuracionPicker, Punto } from "./controles";
import { fechaCorta, finDeVigencia, VEREDICTOS, type DuracionId } from "./opciones";

const TITULO: Record<NotiVeredicto, string> = {
  correcto: "¡Tenías razón!",
  incorrecto: "Revisamos tu reporte",
  info: "Necesitamos más detalle",
};

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
} as const;

function primerNombre(r: Report): string {
  return r.userName?.trim().split(/\s+/)[0] || "alumna";
}

export function ResponderReporteModal({
  r,
  open,
  onClose,
  onFlash,
}: {
  r: Report;
  open: boolean;
  onClose: () => void;
  onFlash: (msg: string, error?: boolean) => void;
}) {
  const nombre = primerNombre(r);
  const [veredicto, setVeredicto] = useState<NotiVeredicto | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [plantilla, setPlantilla] = useState("");
  const [cambiarEstado, setCambiarEstado] = useState(true);
  const [duracion, setDuracion] = useState<DuracionId>("2s");
  const [fecha, setFecha] = useState("");
  const [verPrevia, setVerPrevia] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const v = VEREDICTOS.find((x) => x.id === veredicto) ?? null;
  const fin = finDeVigencia(duracion, fecha);
  const listo = !!v && !!mensaje.trim() && !!fin && !enviando;

  const elegir = (id: NotiVeredicto) => {
    const nueva = VEREDICTOS.find((x) => x.id === id);
    if (!nueva) return;
    setVeredicto(id);
    // La plantilla sólo reemplaza lo escrito si la admin no lo ha editado.
    if (!mensaje.trim() || mensaje === plantilla) {
      const texto = nueva.plantilla(nombre);
      setMensaje(texto);
      setPlantilla(texto);
    }
  };

  const cerrar = () => {
    if (enviando) return;
    onClose();
  };

  const enviar = async () => {
    if (!v || !fin) return;
    setEnviando(true);
    const res = await enviarNotificacion({
      audience: "users",
      recipients: [r.userId],
      kind: "reporte",
      title: TITULO[v.id],
      body: mensaje,
      endsAt: fin,
      reportId: r.id,
      data: {
        veredicto: v.id,
        pregunta: r.pregunta?.text,
        reporteTipo: r.tipo,
      },
    });
    if (!res.ok) {
      setEnviando(false);
      onFlash(res.error, true);
      return;
    }
    const respuesta: ReportRespuesta = {
      fecha: nowISO(),
      veredicto: v.id,
      mensaje: mensaje.trim(),
      notificacionId: res.notificacion.id,
    };
    updateReport(r.id, {
      respuestas: [...(r.respuestas ?? []), respuesta],
      ...(cambiarEstado ? { estado: v.estado } : {}),
    });
    const ok = await flushCloudWrites(["reports"]);
    setEnviando(false);
    onFlash(
      ok
        ? `Respuesta enviada a ${nombre}`
        : `La respuesta le llegará a ${nombre}, pero el ticket no se pudo actualizar en la nube. Se reintentará.`,
      !ok,
    );
    setVeredicto(null);
    setMensaje("");
    setPlantilla("");
    setVerPrevia(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={cerrar} maxWidth={560}>
      <h3 style={modalTitleStyle}>
        <Icon n="radio" size={20} /> Responder a {r.userName || "la alumna"}
      </h3>
      <p style={modalSubStyle}>
        Le llega como transmisión de radio la próxima vez que entre, con su reporte como contexto.
      </p>

      <div
        style={{
          borderLeft: "3px solid #C7A052",
          background: "rgba(255,255,255,.04)",
          borderRadius: "0 8px 8px 0",
          padding: "9px 12px",
          marginBottom: 16,
          fontSize: ".78rem",
          color: "#B8C5DA",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#FFFFFF" }}>«{r.tipo}»</strong> · {r.mensaje}
        {r.pregunta?.text && (
          <div style={{ marginTop: 4, color: "#DCE4F0" }}>Pregunta: “{r.pregunta.text}”</div>
        )}
      </div>

      <div style={labelStyle}>¿Qué le respondes?</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {VEREDICTOS.map((x) => (
          <Chip key={x.id} activo={veredicto === x.id} color={x.color} onClick={() => elegir(x.id)}>
            <Punto color={x.color} /> {x.label}
          </Chip>
        ))}
      </div>

      <label style={labelStyle} htmlFor={`resp-${r.id}`}>
        Mensaje
      </label>
      <textarea
        id={`resp-${r.id}`}
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        rows={5}
        maxLength={600}
        placeholder="Elige una respuesta arriba para empezar con una plantilla, o escribe la tuya."
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
      />
      {veredicto === "incorrecto" && mensaje === plantilla && (
        <p style={{ margin: "6px 0 0", fontSize: ".74rem", color: "#E3C98A" }}>
          Completa la explicación: por qué la respuesta es correcta o dónde puede repasarlo.
        </p>
      )}

      <div style={{ ...labelStyle, marginTop: 14 }}>¿Cuánto tiempo le aparece?</div>
      <DuracionPicker
        valor={duracion}
        fecha={fecha}
        onValor={setDuracion}
        onFecha={setFecha}
        compacto
      />

      {v && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginTop: 14,
            fontSize: ".82rem",
            color: "#DCE4F0",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={cambiarEstado}
            onChange={(e) => setCambiarEstado(e.target.checked)}
            style={{ accentColor: "#C7A052", width: 16, height: 16 }}
          />
          Marcar el reporte como «{ESTADO_LABEL[v.estado]}»
        </label>
      )}

      <button
        type="button"
        aria-expanded={verPrevia}
        onClick={() => setVerPrevia((x) => !x)}
        style={{
          marginTop: 14,
          padding: 0,
          border: 0,
          background: "none",
          color: "#E3C98A",
          fontSize: ".8rem",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Manrope', sans-serif",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon n="eye" size={14} /> {verPrevia ? "Ocultar vista previa" : "Ver cómo le llega"}
      </button>
      {verPrevia && (
        <div style={{ marginTop: 10 }}>
          <RadioTransmission
            modo="preview"
            noti={{
              kind: "reporte",
              title: v ? TITULO[v.id] : "Revisamos tu reporte",
              body: mensaje.trim() || "Aquí va tu respuesta.",
              data: {
                veredicto: v?.id ?? "incorrecto",
                pregunta: r.pregunta?.text,
                reporteTipo: r.tipo,
              },
              createdAt: new Date().toISOString(),
            }}
            destinatario={nombre}
            onRecibido={() => setVerPrevia(false)}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button type="button" style={cancelBtnStyle} onClick={cerrar} disabled={enviando}>
          Cancelar
        </button>
        <button
          type="button"
          style={{
            ...confirmBtnStyle,
            opacity: listo ? 1 : 0.5,
            cursor: listo ? "pointer" : "not-allowed",
          }}
          disabled={!listo}
          onClick={() => void enviar()}
        >
          {enviando ? "Enviando…" : "Enviar respuesta"}
        </button>
      </div>
    </Modal>
  );
}

/** Respuestas ya enviadas en el ticket, con si la alumna ya la recibió. */
export function RespuestasDelReporte({ r }: { r: Report }) {
  const respuestas = r.respuestas ?? [];
  if (respuestas.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: ".66rem",
          fontWeight: 800,
          letterSpacing: ".06em",
          color: "#93A4BF",
          marginBottom: 6,
        }}
      >
        RESPUESTAS ENVIADAS
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {respuestas.map((resp, i) => (
          <RespuestaItem key={`${resp.fecha}-${i}`} r={r} resp={resp} />
        ))}
      </div>
    </div>
  );
}

function RespuestaItem({ r, resp }: { r: Report; resp: ReportRespuesta }) {
  const lectura = useStore(() =>
    resp.notificacionId
      ? (getNotiLecturas(resp.notificacionId).find((l) => l.userId === r.userId) ?? null)
      : null,
  );
  const v = VEREDICTOS.find((x) => x.id === resp.veredicto);
  return (
    <div
      style={{
        border: "1px solid rgba(159,195,245,.22)",
        background: "rgba(159,195,245,.06)",
        borderRadius: 8,
        padding: "9px 12px",
      }}
    >
      <div
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 5 }}
      >
        {v && <Badge text={v.label} color={v.color} />}
        <span style={{ fontSize: ".72rem", color: "#93A4BF" }}>{fechaCorta(resp.fecha)}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: ".72rem",
            fontWeight: 700,
            color: lectura ? "#7FD6A4" : "#93A4BF",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {lectura ? (
            <>
              <Icon n="check" size={12} /> Recibida · {fechaCorta(lectura.readAt)}
            </>
          ) : (
            "Aún no la ve"
          )}
        </span>
      </div>
      <div
        style={{ fontSize: ".82rem", color: "#DCE4F0", lineHeight: 1.55, whiteSpace: "pre-wrap" }}
      >
        {resp.mensaje}
      </div>
    </div>
  );
}
