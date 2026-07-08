/** Panel Admin — Banco de preguntas (PRD 9.6): carga CSV, CRUD y estados. */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  cancelBtnStyle,
  cardStyle,
  confirmBtnStyle,
  CONTENT_STATUS_COLOR,
  CONTENT_STATUS_LABEL,
  Flash,
  inputStyle,
  labelStyle,
  Modal,
  modalSubStyle,
  modalTitleStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
  useFlash,
} from "@/components/admin/AdminShell";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  importQuestionsCsv,
  MATERIAS_DEF,
  materiaBySlug,
  saveQuestion,
  useStore,
  type BankQuestion,
  type CsvImportResult,
  type QuestionStatus,
} from "@/lib/store";

export const Route = createFileRoute("/admin/banco")({
  component: AdminBancoPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
});

interface QForm {
  text: string;
  materia: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  cite: string;
  status: QuestionStatus;
}

const CSV_TEMPLATE =
  'Pregunta,Opción A,Opción B,Opción C,Respuesta correcta,Explicación\n' +
  '"¿Qué fuerza se opone al avance del avión en vuelo?",Resistencia,Sustentación,Empuje,Resistencia,"La resistencia (drag) actúa en dirección opuesta al movimiento del avión en el aire."\n' +
  '"¿Qué instrumento indica la altitud de presión?",Altímetro,Variómetro,Anemómetro,Altímetro,"El altímetro compara la presión estática exterior con una presión de referencia para indicar altitud."\n';

function AdminBancoPage() {
  const { q: searchQ } = Route.useSearch();
  const { flash, showFlash } = useFlash();
  const fileRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchQ ?? "");
  const [fMateria, setFMateria] = useState("todas");
  const [fEstado, setFEstado] = useState("todos");
  const [limit, setLimit] = useState(60);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<QForm | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Si llega ?q= (p. ej. desde Soporte), prefiltra la búsqueda.
  useEffect(() => {
    if (searchQ) setQuery(searchQ);
  }, [searchQ]);

  const questions = useStore(getQuestions);

  const total = questions.length;
  const publicadas = questions.filter((x) => x.status === "publicada").length;
  const borrador = questions.filter((x) => x.status === "borrador").length;
  const ocultas = questions.filter((x) => x.status === "oculta").length;
  const sinClasificar = questions.filter((x) => x.materia === "").length;

  const t = query.trim().toLowerCase();
  const filtered = questions
    .filter((x) => {
      if (fMateria === "sin" && x.materia !== "") return false;
      if (fMateria !== "todas" && fMateria !== "sin" && x.materia !== fMateria) return false;
      if (fEstado !== "todos" && x.status !== fEstado) return false;
      if (t && !(x.text.toLowerCase().includes(t) || x.id.toLowerCase().includes(t))) return false;
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  /* ───────── CSV ───────── */

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importQuestionsCsv(String(reader.result ?? ""));
      setImportResult(res);
      showFlash(`${res.imported} ${res.imported === 1 ? "pregunta importada" : "preguntas importadas"}`, res.imported === 0);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const blob = new Blob(["\ufeff" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-preguntas-flightpath.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───────── CRUD ───────── */

  const openNew = () => {
    setEditId(null);
    setForm({ text: "", materia: "", options: ["", "", ""], correctIndex: 0, explanation: "", cite: "", status: "borrador" });
    setFormErr(null);
  };

  const openEdit = (x: BankQuestion) => {
    setEditId(x.id);
    setForm({ text: x.text, materia: x.materia, options: [...x.options], correctIndex: x.correctIndex, explanation: x.explanation, cite: x.cite, status: x.status });
    setFormErr(null);
  };

  const saveForm = () => {
    if (!form) return;
    const opts = form.options.map((o) => o.trim());
    const kept = opts.filter((o) => o !== "");
    if (!form.text.trim()) return setFormErr("La pregunta necesita texto.");
    if (kept.length < 2) return setFormErr("Se requieren al menos 2 opciones con texto.");
    const correctText = opts[form.correctIndex];
    if (!correctText) return setFormErr("Marca como correcta una opción que tenga texto.");
    if (!form.explanation.trim()) return setFormErr("La explicación es obligatoria.");
    const correctIndex = kept.indexOf(correctText);

    if (editId) {
      const orig = questions.find((x) => x.id === editId);
      if (orig) {
        saveQuestion({ ...orig, text: form.text.trim(), materia: form.materia, options: kept, correctIndex, explanation: form.explanation.trim(), cite: form.cite.trim(), status: form.status });
      }
      showFlash("Pregunta actualizada");
    } else {
      createQuestion({ materia: form.materia, text: form.text.trim(), options: kept, correctIndex, explanation: form.explanation.trim(), cite: form.cite.trim(), status: form.status, source: "manual" });
      showFlash("Pregunta creada");
    }
    setForm(null);
    setEditId(null);
  };

  const toggleStatus = (x: BankQuestion) => {
    const next: QuestionStatus = x.status === "publicada" ? "oculta" : "publicada";
    saveQuestion({ ...x, status: next });
    showFlash(next === "publicada" ? "Pregunta publicada" : "Pregunta oculta");
  };

  const remove = (x: BankQuestion) => {
    if (window.confirm("¿Eliminar esta pregunta? Esta acción no se puede deshacer.")) {
      deleteQuestion(x.id);
      showFlash("Pregunta eliminada", true);
    }
  };

  const stats = [
    { lab: "Total", num: total, color: "#3D5D91" },
    { lab: "Publicadas", num: publicadas, color: "#2ecc71" },
    { lab: "Borrador", num: borrador, color: "#f39c12" },
    { lab: "Ocultas", num: ocultas, color: "#8DA1BE" },
    { lab: "Sin clasificar", num: sinClasificar, color: "#6C0820" },
  ];

  return (
    <AdminShell title="Banco de preguntas" active="banco">
      <Flash flash={flash} />
      <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onFile} style={{ display: "none" }} />

      {/* Header: stats + acciones */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.lab} style={{ ...cardStyle, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.num}</div>
            <div style={{ fontSize: ".7rem", color: "#647DA0", marginTop: 2 }}>{s.lab}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <button onClick={openNew} style={primaryBtnStyle}><Icon n="plus" size={15} /> Crear pregunta nueva</button>
        <button onClick={() => fileRef.current?.click()} style={secondaryBtnStyle}><Icon n="upload" size={15} /> Subir archivo (CSV)</button>
        <button onClick={downloadTemplate} style={{ background: "none", border: "none", color: "#3D5D91", fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 4px" }}>
          <Icon n="download" size={15} /> Descargar plantilla
        </button>
      </div>
      <p style={{ fontSize: ".74rem", color: "#8DA1BE", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon n="info" size={14} /> ¿Tu archivo está en Excel? Guárdalo como CSV (UTF-8) antes de subirlo.
      </p>

      {/* Resultado de importación */}
      {importResult && (
        <div style={{ background: importResult.errors.length > 0 ? "rgba(243,156,18,.06)" : "rgba(46,204,113,.06)", border: `2px solid ${importResult.errors.length > 0 ? "rgba(243,156,18,.25)" : "rgba(46,204,113,.25)"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: importResult.errors.length > 0 ? 8 : 0 }}>
            <Icon n={importResult.errors.length > 0 ? "alert" : "checkCircle"} size={18} color={importResult.errors.length > 0 ? "#f39c12" : "#2ecc71"} />
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#22375C" }}>
              {importResult.imported} {importResult.imported === 1 ? "pregunta importada" : "preguntas importadas"}
              {importResult.errors.length > 0 && ` · ${importResult.errors.length} ${importResult.errors.length === 1 ? "fila con error" : "filas con error"}`}
            </span>
            <button onClick={() => setImportResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#8DA1BE", padding: 2 }}><Icon n="close" size={15} /></button>
          </div>
          {importResult.errors.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto" }}>
              {importResult.errors.map((er, i) => (
                <div key={i} style={{ fontSize: ".76rem", color: "#a05252" }}>Fila {er.row}: {er.error}</div>
              ))}
            </div>
          )}
          {importResult.imported > 0 && (
            <p style={{ fontSize: ".74rem", color: "#647DA0", marginTop: 6 }}>Las preguntas importadas quedan en borrador y sin clasificar: asígnales materia y publícalas.</p>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8DA1BE" }}><Icon n="search" size={15} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por texto o ID de la pregunta..." style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <select value={fMateria} onChange={(e) => setFMateria(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 170 }}>
          <option value="todas">Materia: todas</option>
          {MATERIAS_DEF.map((m) => (
            <option key={m.slug} value={m.slug}>{m.name}</option>
          ))}
          <option value="sin">Sin clasificar</option>
        </select>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
          <option value="todos">Estado: todos</option>
          <option value="publicada">Publicada</option>
          <option value="borrador">Borrador</option>
          <option value="oculta">Oculta</option>
        </select>
      </div>

      <div style={{ fontSize: ".76rem", color: "#647DA0", marginBottom: 10 }}>{filtered.length} de {total} preguntas</div>

      {/* Lista */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE", padding: "24px 20px", textAlign: "center" }}>No hay preguntas que coincidan con los filtros.</p>
        )}
        {filtered.slice(0, limit).map((x, i) => (
          <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: i < Math.min(filtered.length, limit) - 1 ? "1px solid rgba(61,93,145,.06)" : undefined, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#22375C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.text}</div>
              <div style={{ fontSize: ".68rem", color: "#8DA1BE", marginTop: 1 }}>{x.options.length} opciones · {x.source === "import" ? "Importada" : x.source === "seed" ? "Semilla" : "Manual"}</div>
            </div>
            <Badge text={x.materia ? (materiaBySlug(x.materia)?.name ?? x.materia) : "Sin clasificar"} color={x.materia ? "#3D5D91" : "#6C0820"} />
            <Badge text={CONTENT_STATUS_LABEL[x.status] ?? x.status} color={CONTENT_STATUS_COLOR[x.status] ?? "#3D5D91"} />
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => openEdit(x)} title="Editar" style={{ padding: "6px 10px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon n="pencil" size={13} /> Editar
              </button>
              <button onClick={() => toggleStatus(x)} title={x.status === "publicada" ? "Ocultar" : "Publicar"} style={{ padding: "6px 10px", background: "white", color: x.status === "publicada" ? "#8DA1BE" : "#2ecc71", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon n={x.status === "publicada" ? "eyeOff" : "eye"} size={13} /> {x.status === "publicada" ? "Ocultar" : "Publicar"}
              </button>
              <button onClick={() => remove(x)} title="Eliminar" style={{ padding: "6px 10px", background: "white", color: "#e74c3c", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon n="trash" size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length > limit && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => setLimit((l) => l + 60)} style={secondaryBtnStyle}>Mostrar más ({filtered.length - limit} restantes)</button>
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal open={!!form} onClose={() => setForm(null)} maxWidth={560}>
        {form && (
          <>
            <h2 style={modalTitleStyle}><Icon n={editId ? "pencil" : "plus"} size={20} color="#6C0820" /> {editId ? "Editar pregunta" : "Crear pregunta nueva"}</h2>
            <p style={modalSubStyle}>La pregunta necesita texto, mínimo 2 opciones, una respuesta correcta marcada y explicación.</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Pregunta</label>
              <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Escribe la pregunta..." />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Materia</label>
              <select value={form.materia} onChange={(e) => setForm({ ...form, materia: e.target.value })} style={inputStyle}>
                <option value="">Sin clasificar</option>
                {MATERIAS_DEF.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Opciones (marca la correcta)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.options.map((op, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="correcta"
                      checked={form.correctIndex === i}
                      onChange={() => setForm({ ...form, correctIndex: i })}
                      style={{ accentColor: "#2ecc71", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                    />
                    <input
                      value={op}
                      onChange={(e) => {
                        const options = [...form.options];
                        options[i] = e.target.value;
                        setForm({ ...form, options });
                      }}
                      placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              {form.options.length < 4 && (
                <button onClick={() => setForm({ ...form, options: [...form.options, ""] })} style={{ marginTop: 8, background: "none", border: "none", color: "#3D5D91", fontSize: ".76rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
                  <Icon n="plus" size={13} /> Añadir 4ª opción
                </button>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Explicación</label>
              <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="¿Por qué es la respuesta correcta?" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Cita / fuente (opcional)</label>
              <input value={form.cite} onChange={(e) => setForm({ ...form, cite: e.target.value })} style={inputStyle} placeholder="Ej. RAC 61, cap. 3" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Estado</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QuestionStatus })} style={inputStyle}>
                <option value="borrador">Borrador</option>
                <option value="publicada">Publicada</option>
                <option value="oculta">Oculta</option>
              </select>
            </div>

            {formErr && (
              <div style={{ background: "rgba(231,76,60,.07)", border: "1px solid rgba(231,76,60,.25)", color: "#c0392b", borderRadius: 8, padding: "8px 12px", fontSize: ".78rem", fontWeight: 600, marginBottom: 14 }}>{formErr}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setForm(null)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={saveForm} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="check" size={16} /> Guardar pregunta</button>
            </div>
          </>
        )}
      </Modal>
    </AdminShell>
  );
}
