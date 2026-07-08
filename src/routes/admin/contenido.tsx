/** Panel Admin — Clases y materiales (PRD 9.7). */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  cancelBtnStyle,
  cardHeadStyle,
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
  useFlash,
} from "@/components/admin/AdminShell";
import {
  deleteClase,
  deleteMaterial,
  getClases,
  getMateriales,
  MATERIAS_DEF,
  materiaBySlug,
  nowISO,
  saveClase,
  saveMaterial,
  uid,
  useStore,
  type Clase,
  type ContentStatus,
  type Material,
} from "@/lib/store";

export const Route = createFileRoute("/admin/contenido")({
  component: AdminContenidoPage,
});

interface ClaseForm {
  titulo: string;
  descripcion: string;
  materia: string;
  duracionMin: string;
  orden: string;
  videoUrl: string;
  status: ContentStatus;
}

interface MaterialForm {
  titulo: string;
  autor: string;
  materia: string;
  badge: string;
  pages: string;
  fileUrl: string;
  descargable: boolean;
  imprimible: boolean;
  muestraGratis: boolean;
  status: ContentStatus;
}

const rowBtn = (color: string): React.CSSProperties => ({
  padding: "6px 10px",
  background: "white",
  color,
  border: "2px solid #F2DCDB",
  borderRadius: 8,
  fontSize: ".72rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
});

function AdminContenidoPage() {
  const { flash, showFlash } = useFlash();

  const clases = useStore(getClases);
  const materiales = useStore(getMateriales);

  const [fMateriaClases, setFMateriaClases] = useState("todas");

  const [claseId, setClaseId] = useState<string | null>(null);
  const [claseForm, setClaseForm] = useState<ClaseForm | null>(null);
  const [claseErr, setClaseErr] = useState<string | null>(null);

  const [matId, setMatId] = useState<string | null>(null);
  const [matForm, setMatForm] = useState<MaterialForm | null>(null);
  const [matErr, setMatErr] = useState<string | null>(null);

  /* ───────── Clases ───────── */

  const orderedClases = clases
    .filter((c) => fMateriaClases === "todas" || c.materia === fMateriaClases)
    .sort((a, b) => {
      const ia = MATERIAS_DEF.findIndex((m) => m.slug === a.materia);
      const ib = MATERIAS_DEF.findIndex((m) => m.slug === b.materia);
      if (ia !== ib) return ia - ib;
      return a.orden - b.orden;
    });

  const openNewClase = () => {
    setClaseId(null);
    setClaseForm({ titulo: "", descripcion: "", materia: MATERIAS_DEF[0].slug, duracionMin: "30", orden: "1", videoUrl: "", status: "borrador" });
    setClaseErr(null);
  };

  const openEditClase = (c: Clase) => {
    setClaseId(c.id);
    setClaseForm({ titulo: c.titulo, descripcion: c.descripcion, materia: c.materia, duracionMin: String(c.duracionMin), orden: String(c.orden), videoUrl: c.videoUrl, status: c.status });
    setClaseErr(null);
  };

  const saveClaseForm = () => {
    if (!claseForm) return;
    if (!claseForm.titulo.trim()) return setClaseErr("La clase necesita un título.");
    if (!claseForm.materia) return setClaseErr("Selecciona la materia.");
    const orig = claseId ? clases.find((c) => c.id === claseId) : null;
    saveClase({
      id: orig?.id ?? uid("clase"),
      materia: claseForm.materia,
      titulo: claseForm.titulo.trim(),
      descripcion: claseForm.descripcion.trim(),
      duracionMin: Math.max(0, parseInt(claseForm.duracionMin, 10) || 0),
      orden: Math.max(1, parseInt(claseForm.orden, 10) || 1),
      videoUrl: claseForm.videoUrl.trim(),
      status: claseForm.status,
      createdAt: orig?.createdAt ?? nowISO(),
      updatedAt: nowISO(),
    });
    setClaseForm(null);
    setClaseId(null);
    showFlash(orig ? "Clase actualizada" : "Clase agregada");
  };

  const toggleClase = (c: Clase) => {
    const next: ContentStatus = c.status === "publicada" ? "oculta" : "publicada";
    saveClase({ ...c, status: next });
    showFlash(next === "publicada" ? "Clase publicada" : "Clase oculta");
  };

  const removeClase = (c: Clase) => {
    if (window.confirm(`¿Eliminar la clase "${c.titulo}"? Esta acción no se puede deshacer.`)) {
      deleteClase(c.id);
      showFlash("Clase eliminada", true);
    }
  };

  /* ───────── Materiales ───────── */

  const openNewMat = () => {
    setMatId(null);
    setMatForm({ titulo: "", autor: "", materia: "", badge: "", pages: "0", fileUrl: "", descargable: true, imprimible: false, muestraGratis: false, status: "borrador" });
    setMatErr(null);
  };

  const openEditMat = (m: Material) => {
    setMatId(m.id);
    setMatForm({ titulo: m.titulo, autor: m.autor, materia: m.materia, badge: m.badge, pages: String(m.pages), fileUrl: m.fileUrl, descargable: m.descargable, imprimible: m.imprimible, muestraGratis: m.muestraGratis, status: m.status });
    setMatErr(null);
  };

  const saveMatForm = () => {
    if (!matForm) return;
    if (!matForm.titulo.trim()) return setMatErr("El material necesita un título.");
    const orig = matId ? materiales.find((m) => m.id === matId) : null;
    saveMaterial({
      id: orig?.id ?? uid("mat"),
      titulo: matForm.titulo.trim(),
      autor: matForm.autor.trim(),
      materia: matForm.materia,
      tags: orig?.tags ?? [],
      badge: matForm.badge.trim(),
      badgeColor: orig?.badgeColor ?? "#3D5D91",
      emoji: orig?.emoji ?? "doc",
      gradient: orig?.gradient ?? "linear-gradient(135deg,#667eea,#764ba2)",
      pages: Math.max(0, parseInt(matForm.pages, 10) || 0),
      fileUrl: matForm.fileUrl.trim(),
      descargable: matForm.descargable,
      imprimible: matForm.imprimible,
      muestraGratis: matForm.muestraGratis,
      status: matForm.status,
      createdAt: orig?.createdAt ?? nowISO(),
      updatedAt: nowISO(),
    });
    setMatForm(null);
    setMatId(null);
    showFlash(orig ? "Material actualizado" : "Material agregado");
  };

  const toggleMat = (m: Material) => {
    const next: ContentStatus = m.status === "publicada" ? "oculta" : "publicada";
    saveMaterial({ ...m, status: next });
    showFlash(next === "publicada" ? "Material publicado" : "Material oculto");
  };

  const removeMat = (m: Material) => {
    if (window.confirm(`¿Eliminar el material "${m.titulo}"? Esta acción no se puede deshacer.`)) {
      deleteMaterial(m.id);
      showFlash("Material eliminado", true);
    }
  };

  return (
    <AdminShell title="Clases y materiales" active="contenido">
      <Flash flash={flash} />

      {/* Nota informativa */}
      <div style={{ background: "rgba(61,93,145,.05)", border: "1px solid rgba(61,93,145,.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon n="info" size={16} color="#3D5D91" />
        <span style={{ fontSize: ".76rem", color: "#647DA0", lineHeight: 1.5 }}>
          Las clases publicadas aparecen a los estudiantes con desbloqueo progresivo; el estudiante básico solo ve la primera de cada materia.
        </span>
      </div>

      {/* ───────── CLASES ───────── */}
      <div style={{ ...cardStyle, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ ...cardHeadStyle, marginBottom: 0 }}><Icon n="play" size={15} /> Clases grabadas ({clases.length})</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select value={fMateriaClases} onChange={(e) => setFMateriaClases(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160, padding: "7px 11px" }}>
              <option value="todas">Materia: todas</option>
              {MATERIAS_DEF.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
            </select>
            <button onClick={openNewClase} style={primaryBtnStyle}><Icon n="plus" size={15} /> Agregar clase</button>
          </div>
        </div>

        {orderedClases.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>No hay clases {fMateriaClases !== "todas" ? "en esta materia" : "registradas"} todavía.</p>
        ) : (
          orderedClases.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < orderedClases.length - 1 ? "1px solid rgba(61,93,145,.06)" : undefined, flexWrap: "wrap" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: c.videoUrl ? "rgba(61,93,145,.1)" : "rgba(141,161,190,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title={c.videoUrl ? "Con video" : "Sin video"}>
                <Icon n="play" size={15} color={c.videoUrl ? "#3D5D91" : "#8DA1BE"} />
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <div style={{ fontSize: ".84rem", fontWeight: 700, color: "#22375C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.titulo}</div>
                <div style={{ fontSize: ".7rem", color: "#647DA0" }}>
                  {materiaBySlug(c.materia)?.name ?? c.materia} · {c.duracionMin} min · Orden {c.orden}{c.videoUrl ? "" : " · Sin video"}
                </div>
              </div>
              <Badge text={CONTENT_STATUS_LABEL[c.status] ?? c.status} color={CONTENT_STATUS_COLOR[c.status] ?? "#3D5D91"} />
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEditClase(c)} style={rowBtn("#3D5D91")}><Icon n="pencil" size={13} /> Editar</button>
                <button onClick={() => toggleClase(c)} style={rowBtn(c.status === "publicada" ? "#8DA1BE" : "#2ecc71")}>
                  <Icon n={c.status === "publicada" ? "eyeOff" : "eye"} size={13} /> {c.status === "publicada" ? "Ocultar" : "Publicar"}
                </button>
                <button onClick={() => removeClase(c)} style={rowBtn("#e74c3c")}><Icon n="trash" size={13} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ───────── MATERIALES ───────── */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ ...cardHeadStyle, marginBottom: 0 }}><Icon n="library" size={15} /> Materiales de biblioteca ({materiales.length})</div>
          <button onClick={openNewMat} style={{ ...primaryBtnStyle, marginLeft: "auto" }}><Icon n="plus" size={15} /> Agregar material</button>
        </div>

        {materiales.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>No hay materiales registrados todavía.</p>
        ) : (
          materiales.map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < materiales.length - 1 ? "1px solid rgba(61,93,145,.06)" : undefined, flexWrap: "wrap" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: m.gradient || "rgba(61,93,145,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon n="doc" size={15} color="white" />
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <div style={{ fontSize: ".84rem", fontWeight: 700, color: "#22375C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.titulo}</div>
                <div style={{ fontSize: ".7rem", color: "#647DA0" }}>
                  {m.autor || "Sin autor"} · {m.materia ? (materiaBySlug(m.materia)?.name ?? m.materia) : "General"}{m.pages > 0 ? ` · ${m.pages} págs.` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} title={`${m.descargable ? "Descargable" : "No descargable"} · ${m.imprimible ? "Imprimible" : "No imprimible"}`}>
                <Icon n="download" size={14} color={m.descargable ? "#2ecc71" : "#D9E1EC"} />
                <Icon n="doc" size={14} color={m.imprimible ? "#2ecc71" : "#D9E1EC"} />
              </div>
              {m.badge && <Badge text={m.badge} color={m.badgeColor || "#3D5D91"} />}
              {m.muestraGratis && <Badge text="Muestra" color="#6C0820" />}
              <Badge text={CONTENT_STATUS_LABEL[m.status] ?? m.status} color={CONTENT_STATUS_COLOR[m.status] ?? "#3D5D91"} />
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEditMat(m)} style={rowBtn("#3D5D91")}><Icon n="pencil" size={13} /> Editar</button>
                <button onClick={() => toggleMat(m)} style={rowBtn(m.status === "publicada" ? "#8DA1BE" : "#2ecc71")}>
                  <Icon n={m.status === "publicada" ? "eyeOff" : "eye"} size={13} /> {m.status === "publicada" ? "Ocultar" : "Publicar"}
                </button>
                <button onClick={() => removeMat(m)} style={rowBtn("#e74c3c")}><Icon n="trash" size={13} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ───────── Modal clase ───────── */}
      <Modal open={!!claseForm} onClose={() => setClaseForm(null)} maxWidth={520}>
        {claseForm && (
          <>
            <h2 style={modalTitleStyle}><Icon n={claseId ? "pencil" : "plus"} size={20} color="#6C0820" /> {claseId ? "Editar clase" : "Agregar clase"}</h2>
            <p style={modalSubStyle}>Las clases se muestran a los estudiantes en el orden indicado dentro de cada materia.</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Título</label>
              <input value={claseForm.titulo} onChange={(e) => setClaseForm({ ...claseForm, titulo: e.target.value })} style={inputStyle} placeholder="Ej. Fuerzas aerodinámicas básicas" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea value={claseForm.descripcion} onChange={(e) => setClaseForm({ ...claseForm, descripcion: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Materia</label>
                <select value={claseForm.materia} onChange={(e) => setClaseForm({ ...claseForm, materia: e.target.value })} style={inputStyle}>
                  {MATERIAS_DEF.map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={claseForm.status} onChange={(e) => setClaseForm({ ...claseForm, status: e.target.value as ContentStatus })} style={inputStyle}>
                  <option value="borrador">Borrador</option>
                  <option value="publicada">Publicada</option>
                  <option value="oculta">Oculta</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Duración (min)</label>
                <input type="number" min="0" value={claseForm.duracionMin} onChange={(e) => setClaseForm({ ...claseForm, duracionMin: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Orden</label>
                <input type="number" min="1" value={claseForm.orden} onChange={(e) => setClaseForm({ ...claseForm, orden: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Video</label>
              <input value={claseForm.videoUrl} onChange={(e) => setClaseForm({ ...claseForm, videoUrl: e.target.value })} style={inputStyle} placeholder="URL de video (YouTube, Vimeo o .mp4)" />
            </div>

            {claseErr && (
              <div style={{ background: "rgba(231,76,60,.07)", border: "1px solid rgba(231,76,60,.25)", color: "#c0392b", borderRadius: 8, padding: "8px 12px", fontSize: ".78rem", fontWeight: 600, marginBottom: 14 }}>{claseErr}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setClaseForm(null)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={saveClaseForm} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="check" size={16} /> Guardar clase</button>
            </div>
          </>
        )}
      </Modal>

      {/* ───────── Modal material ───────── */}
      <Modal open={!!matForm} onClose={() => setMatForm(null)} maxWidth={520}>
        {matForm && (
          <>
            <h2 style={modalTitleStyle}><Icon n={matId ? "pencil" : "plus"} size={20} color="#6C0820" /> {matId ? "Editar material" : "Agregar material"}</h2>
            <p style={modalSubStyle}>Los materiales publicados aparecen en la Biblioteca; los marcados como muestra son visibles con la suscripción básica.</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Título</label>
              <input value={matForm.titulo} onChange={(e) => setMatForm({ ...matForm, titulo: e.target.value })} style={inputStyle} placeholder="Ej. Manual de Meteorología Aeronáutica" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Autor</label>
                <input value={matForm.autor} onChange={(e) => setMatForm({ ...matForm, autor: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Materia</label>
                <select value={matForm.materia} onChange={(e) => setMatForm({ ...matForm, materia: e.target.value })} style={inputStyle}>
                  <option value="">General</option>
                  {MATERIAS_DEF.map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Badge (etiqueta)</label>
                <input value={matForm.badge} onChange={(e) => setMatForm({ ...matForm, badge: e.target.value })} style={inputStyle} placeholder="Ej. Esencial" />
              </div>
              <div>
                <label style={labelStyle}>Páginas</label>
                <input type="number" min="0" value={matForm.pages} onChange={(e) => setMatForm({ ...matForm, pages: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Archivo</label>
              <input value={matForm.fileUrl} onChange={(e) => setMatForm({ ...matForm, fileUrl: e.target.value })} style={inputStyle} placeholder="URL del PDF" />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              {([
                ["descargable", "Descargable"],
                ["imprimible", "Imprimible"],
                ["muestraGratis", "Muestra gratis"],
              ] as const).map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#22375C", fontWeight: 600, cursor: "pointer" }}>
                  <input type="checkbox" checked={matForm[k]} onChange={(e) => setMatForm({ ...matForm, [k]: e.target.checked })} style={{ accentColor: "#3D5D91", width: 15, height: 15 }} />
                  {l}
                </label>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Estado</label>
              <select value={matForm.status} onChange={(e) => setMatForm({ ...matForm, status: e.target.value as ContentStatus })} style={inputStyle}>
                <option value="borrador">Borrador</option>
                <option value="publicada">Publicada</option>
                <option value="oculta">Oculta</option>
              </select>
            </div>

            {matErr && (
              <div style={{ background: "rgba(231,76,60,.07)", border: "1px solid rgba(231,76,60,.25)", color: "#c0392b", borderRadius: 8, padding: "8px 12px", fontSize: ".78rem", fontWeight: 600, marginBottom: 14 }}>{matErr}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setMatForm(null)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={saveMatForm} style={{ ...confirmBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon n="check" size={16} /> Guardar material</button>
            </div>
          </>
        )}
      </Modal>
    </AdminShell>
  );
}
