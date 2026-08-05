/**
 * Editor de la pregunta reportada, dentro del panel de Soporte.
 *
 * Lee la fila real de `content` (colección `questions`) por id — no la copia
 * del ticket — para que la admin edite exactamente lo que ven las alumnas.
 * Si la pregunta ya no existe en la nube, cae al snapshot guardado con el
 * reporte y lo muestra en solo lectura.
 */
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { supabase } from "@/integrations/supabase/client";
import { inputStyle, labelStyle } from "@/components/admin/AdminShell";
import type { ReportQuestionSnapshot } from "@/lib/store";

interface CloudQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  cite?: string;
  status?: string;
  materia?: string;
  fuente?: string;
  capitulo?: number;
  [k: string]: unknown;
}

export function QuestionEditModal({
  questionId,
  snapshot,
  onClose,
  onFlash,
}: {
  questionId: string;
  snapshot?: ReportQuestionSnapshot;
  onClose: () => void;
  onFlash: (msg: string, error?: boolean) => void;
}) {
  const [row, setRow] = useState<CloudQuestion | null>(null);
  const [missing, setMissing] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const { data } = await supabase
        .from("content")
        .select("data")
        .eq("collection", "questions")
        .eq("id", questionId)
        .maybeSingle();
      if (!vivo) return;
      const q = (data?.data ?? null) as CloudQuestion | null;
      if (q) {
        setRow({ ...q, options: [...(q.options ?? [])] });
      } else {
        setMissing(true);
        if (snapshot) {
          setRow({
            id: snapshot.id,
            text: snapshot.text,
            options: [...snapshot.options],
            correctIndex: snapshot.correctIndex,
            explanation: snapshot.explanation ?? "",
          });
        }
      }
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [questionId, snapshot]);

  const guardar = async () => {
    if (!row) return;
    setGuardando(true);
    const next = { ...row, updatedAt: new Date().toISOString() };
    const { error } = await supabase
      .from("content")
      .upsert({ collection: "questions", id: String(row.id), data: next });
    setGuardando(false);
    if (error) {
      onFlash("No se pudo guardar la pregunta", true);
      return;
    }
    onFlash("Pregunta actualizada");
    onClose();
  };

  const setField = (patch: Partial<CloudQuestion>) =>
    setRow((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar pregunta reportada"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,26,46,.55)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          width: "min(720px, 100%)",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "20px 20px 24px",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon n="help" size={18} color="#3D5D91" />
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#22375C", flex: 1 }}>
            Pregunta reportada
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6 }}
          >
            <Icon n="close" size={18} color="#647DA0" />
          </button>
        </div>

        <div style={{ fontSize: ".72rem", color: "#647DA0", marginBottom: 12 }}>
          ID: <strong style={{ color: "#22375C" }}>{questionId}</strong>
          {row?.materia ? ` · ${row.materia}` : ""}
          {row?.fuente ? ` · ${row.fuente}` : ""}
          {row?.capitulo ? ` · Cap. ${row.capitulo}` : ""}
        </div>

        {cargando && <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Cargando pregunta…</p>}

        {!cargando && !row && (
          <p style={{ fontSize: ".82rem", color: "#c0392b" }}>
            Esta pregunta ya no existe en el banco y el reporte no incluye una copia.
          </p>
        )}

        {!cargando && row && (
          <>
            {missing && (
              <div style={{ background: "#FFF4DE", border: "1px solid #E9CFA0", borderRadius: 10, padding: "9px 12px", fontSize: ".76rem", color: "#7a5a12", marginBottom: 12 }}>
                La pregunta ya no está en el banco: se muestra la copia guardada con el reporte.
                Al guardar se vuelve a publicar con este contenido.
              </div>
            )}

            {snapshot?.selectedIndex != null && snapshot.selectedIndex >= 0 && (
              <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 12 }}>
                Respuesta elegida al reportar:{" "}
                <strong style={{ color: "#22375C" }}>
                  {String.fromCharCode(65 + snapshot.selectedIndex)}
                </strong>
              </div>
            )}

            <label style={labelStyle}>Enunciado</label>
            <textarea
              value={row.text}
              onChange={(e) => setField({ text: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }}
            />

            <label style={labelStyle}>Opciones (marca la correcta)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {row.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="correcta"
                    checked={row.correctIndex === i}
                    onChange={() => setField({ correctIndex: i })}
                    aria-label={`Marcar opción ${String.fromCharCode(65 + i)} como correcta`}
                    style={{ width: 18, height: 18, accentColor: "#3D5D91" }}
                  />
                  <span style={{ fontSize: ".78rem", fontWeight: 800, color: "#647DA0", width: 16 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const options = [...row.options];
                      options[i] = e.target.value;
                      setField({ options });
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              ))}
            </div>

            <label style={labelStyle}>Explicación</label>
            <textarea
              value={row.explanation ?? ""}
              onChange={(e) => setField({ explanation: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }}
            />

            <label style={labelStyle}>Referencia</label>
            <input
              value={row.cite ?? ""}
              onChange={(e) => setField({ cite: e.target.value })}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Estado</label>
            <select
              value={row.status ?? "publicada"}
              onChange={(e) => setField({ status: e.target.value })}
              style={{ ...inputStyle, marginBottom: 18 }}
            >
              <option value="publicada">Publicada</option>
              <option value="borrador">Borrador</option>
              <option value="archivada">Archivada</option>
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={onClose}
                style={{ padding: "9px 16px", background: "white", color: "#647DA0", border: "2px solid #E3EAF4", borderRadius: 9, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void guardar()}
                disabled={guardando}
                style={{ padding: "9px 18px", background: "#3D5D91", color: "white", border: "none", borderRadius: 9, fontSize: ".78rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Icon n="check" size={14} /> {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
