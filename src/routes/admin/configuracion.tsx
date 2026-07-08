/** Panel Admin — Configuración interna (PRD 9.12). */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  cardHeadStyle,
  cardStyle,
  Flash,
  inputStyle,
  labelStyle,
  primaryBtnStyle,
  useFlash,
} from "@/components/admin/AdminShell";
import { getConfig, saveConfig, type InternalConfig } from "@/lib/store";

export const Route = createFileRoute("/admin/configuracion")({
  component: AdminConfiguracionPage,
});

function AdminConfiguracionPage() {
  const { flash, showFlash } = useFlash();
  const [cfg, setCfg] = useState<InternalConfig>(() => getConfig());

  // Recarga la configuración persistida al montar en cliente (post-seed).
  useEffect(() => {
    setCfg(getConfig());
  }, []);

  const set = <K extends keyof InternalConfig>(k: K, v: InternalConfig[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  const setNum = (k: "simuladorPreguntas" | "simuladorHoras" | "pctMinimoClase") => (v: string) =>
    set(k, Math.max(0, parseInt(v, 10) || 0));

  const save = () => {
    saveConfig(cfg);
    showFlash("Configuración guardada");
  };

  return (
    <AdminShell title="Configuración interna" active="configuracion" maxWidth={900}>
      <Flash flash={flash} />

      {/* Identidad */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}><Icon n="plane" size={15} /> Identidad de la plataforma</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre de la plataforma</label>
            <input value={cfg.nombrePlataforma} onChange={(e) => set("nombrePlataforma", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Slogan</label>
            <input value={cfg.slogan} onChange={(e) => set("slogan", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo de contacto</label>
            <input type="email" value={cfg.contactoEmail} onChange={(e) => set("contactoEmail", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp de soporte</label>
            <input value={cfg.whatsappSoporte} onChange={(e) => set("whatsappSoporte", e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}><Icon n="chat" size={15} /> Mensajes automáticos</div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Mensaje de bienvenida</label>
          <textarea value={cfg.mensajeBienvenida} onChange={(e) => set("mensajeBienvenida", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div>
          <label style={labelStyle}>Mensaje de conversión (upgrade)</label>
          <textarea value={cfg.mensajeConversion} onChange={(e) => set("mensajeConversion", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>

      {/* Parámetros */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}><Icon n="settings" size={15} /> Parámetros de operación</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <label style={labelStyle}>Precio del plan anual</label>
            <input value={cfg.precioPlanAnual} onChange={(e) => set("precioPlanAnual", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Proveedor de WhatsApp</label>
            <input value={cfg.proveedorWhatsApp} onChange={(e) => set("proveedorWhatsApp", e.target.value)} style={inputStyle} placeholder="Pendiente de integración" />
          </div>
          <div>
            <label style={labelStyle}>Preguntas del simulador</label>
            <input type="number" min="1" value={cfg.simuladorPreguntas} onChange={(e) => setNum("simuladorPreguntas")(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Horas del simulador</label>
            <input type="number" min="1" value={cfg.simuladorHoras} onChange={(e) => setNum("simuladorHoras")(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>% mínimo de clase vista</label>
            <input type="number" min="0" max="100" value={cfg.pctMinimoClase} onChange={(e) => setNum("pctMinimoClase")(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
        <button onClick={save} style={{ ...primaryBtnStyle, padding: "10px 22px" }}>
          <Icon n="check" size={16} /> Guardar configuración
        </button>
      </div>

      {/* Documentos legales */}
      <div style={cardStyle}>
        <div style={cardHeadStyle}><Icon n="doc" size={15} /> Documentos legales</div>
        <p style={{ fontSize: ".82rem", color: "#647DA0", marginBottom: 10, lineHeight: 1.5 }}>
          Los avisos de privacidad, términos y condiciones publicados a los estudiantes viven en la sección legal pública.
        </p>
        <Link to="/legal" style={{ fontSize: ".8rem", fontWeight: 700, color: "#3D5D91", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon n="eye" size={15} /> Ver avisos publicados →
        </Link>
      </div>
    </AdminShell>
  );
}
