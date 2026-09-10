/**
 * Cobertura de láminas por módulo.
 *
 * Cruza cuántas preguntas piden una figura contra cuántas de esas figuras
 * existen realmente en su bucket, para que un hueco (como el del Embraer 190,
 * donde las imágenes estaban subidas pero sin ligar) se vea de inmediato.
 */
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { supabase } from "@/integrations/supabase/client";
import { cardHeadStyle, cardStyle } from "@/components/admin/AdminShell";

interface Row {
  fuente: string;
  bucket: string;
  preguntas: number;
  con_lamina: number;
  laminas_distintas: number;
  laminas_existentes: number;
}

const NOMBRE: Record<string, string> = {
  CIAAC: "Banco CIAAC",
  ATP: "ATP",
  JEPP: "Jeppesen",
  PHAK: "PHAK",
  LAOF: "Embraer 190",
  B737MAX: "Boeing 737 MAX",
  LEG: "Legislación",
  ANX10: "Anexo 10",
};

export function LaminasAudit() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const { data, error: err } = await supabase.rpc("admin_lamina_cobertura");
      if (!vivo) return;
      if (err) setError(err.message);
      else setRows((data ?? []) as unknown as Row[]);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const conLaminas = (rows ?? []).filter((r) => Number(r.con_lamina) > 0);

  return (
    <div style={{ ...cardStyle, marginBottom: 20 }}>
      <div style={cardHeadStyle}>
        <Icon n="book" size={16} color="#3D5D91" />
        <h3 style={{ fontSize: ".88rem", fontWeight: 800, color: "#22375C" }}>Láminas de las preguntas</h3>
      </div>

      {!rows && !error && <p style={{ fontSize: ".8rem", color: "#8DA1BE" }}>Revisando módulos…</p>}
      {error && <p style={{ fontSize: ".8rem", color: "#c0392b" }}>No se pudo revisar: {error}</p>}

      {rows && conLaminas.length === 0 && (
        <p style={{ fontSize: ".8rem", color: "#8DA1BE" }}>Ningún módulo tiene preguntas con figura.</p>
      )}

      {conLaminas.map((r) => {
        const distintas = Number(r.laminas_distintas);
        const existentes = Number(r.laminas_existentes);
        const faltan = distintas - existentes;
        return (
          <div
            key={r.fuente}
            style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".78rem", borderBottom: "1px solid #F0F4FA", paddingBottom: 7, marginBottom: 7 }}
          >
            <span style={{ flex: 1, color: "#647DA0" }}>{NOMBRE[r.fuente] ?? r.fuente}</span>
            <span style={{ color: "#8DA1BE" }}>{Number(r.con_lamina)} preguntas con figura</span>
            <strong style={{ color: faltan === 0 ? "#22375C" : "#c0392b" }}>
              {existentes} / {distintas} imágenes
            </strong>
            <Icon n={faltan === 0 ? "checkCircle" : "alert"} size={15} color={faltan === 0 ? "#2ecc71" : "#f39c12"} />
          </div>
        );
      })}

      {rows && conLaminas.some((r) => Number(r.laminas_distintas) > Number(r.laminas_existentes)) && (
        <p style={{ fontSize: ".74rem", color: "#8DA1BE", marginTop: 6 }}>
          Los módulos en rojo tienen preguntas que piden una figura que todavía no se ha subido.
        </p>
      )}
    </div>
  );
}
