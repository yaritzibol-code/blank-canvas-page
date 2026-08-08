/** Panel Admin — Lista de estudiantes (PRD 9.3). */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  ACCESS_COLOR,
  ACCESS_LABEL,
  cardStyle,
  fmtDate,
  generalStateColor,
  inputStyle,
  timeAgo,
} from "@/components/admin/AdminShell";
import {
  courseProgress,
  estimatedReadiness,
  getStreak,
  getUsers,
  isStudentActive,
  materiaPerformance,
  MATERIAS_DEF,
  studentGeneralState,
  logAccessChange,
  updateUser,
  useStore,
  type User,
} from "@/lib/store";
import { PLANES, planById, planIdDe, type PlanId } from "@/lib/pricing";

export const Route = createFileRoute("/admin/estudiantes")({
  component: AdminEstudiantesPage,
});

const thStyle: CSSProperties = {
  padding: "10px 9px",
  fontSize: ".66rem",
  fontWeight: 700,
  color: "#8DA1BE",
  textTransform: "uppercase",
  letterSpacing: ".6px",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid rgba(61,93,145,.1)",
};

const tdStyle: CSSProperties = {
  padding: "12px 9px",
  fontSize: ".8rem",
  color: "#22375C",
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(61,93,145,.05)",
  whiteSpace: "nowrap",
};

const PAGE_SIZE = 10;

/**
 * Permite arrastrar la tabla con el mouse para desplazarla en horizontal,
 * además de la barra de scroll nativa.
 */
function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false, startX = 0, startLeft = 0;
    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, select, input, a")) return;
      down = true; startX = e.pageX; startLeft = el.scrollLeft;
      el.style.cursor = "grabbing"; el.style.userSelect = "none";
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      e.preventDefault();
      el.scrollLeft = startLeft - (e.pageX - startX);
    };
    const onUp = () => {
      down = false; el.style.cursor = "grab"; el.style.userSelect = "";
    };
    el.style.cursor = "grab";
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);
  return ref;
}

function AdminEstudiantesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [fEstado, setFEstado] = useState("todos");
  const [fPlan, setFPlan] = useState("todos");
  const [fMateriaDebil, setFMateriaDebil] = useState("todas");
  const [orden, setOrden] = useState("acceso");
  const [soloInactivos, setSoloInactivos] = useState(false);
  const [proxCiaac, setProxCiaac] = useState(false);
  const [page, setPage] = useState(0);
  const scrollRef = useDragScroll<HTMLDivElement>();

  const rows = useStore(() =>
    getUsers()
      .filter((u) => u.role === "student")
      .map((u) => {
        const perf = materiaPerformance(u.id).filter((m) => m.avg !== null);
        const weak = perf.length > 0 ? perf.reduce((a, b) => ((a.avg ?? 100) <= (b.avg ?? 100) ? a : b)) : null;
        return {
          u,
          streak: getStreak(u.id),
          progress: courseProgress(u.id),
          readiness: estimatedReadiness(u.id),
          state: studentGeneralState(u),
          active: isStudentActive(u),
          weakSlug: weak?.slug ?? null,
        };
      }),
  );

  useEffect(() => { setPage(0); }, [query, fEstado, fPlan, fMateriaDebil, orden, soloInactivos, proxCiaac]);

  const q = query.trim().toLowerCase();
  const filtered = rows
    .filter((r) => {
      if (q && !(
        r.u.nombre.toLowerCase().includes(q) ||
        r.u.email.toLowerCase().includes(q) ||
        r.u.escuela.toLowerCase().includes(q)
      )) return false;
      if (fEstado !== "todos" && r.u.accessStatus !== fEstado) return false;
      if (fPlan !== "todos" && r.u.plan !== fPlan) return false;
      if (fMateriaDebil !== "todas" && r.weakSlug !== fMateriaDebil) return false;
      if (soloInactivos && r.active) return false;
      if (proxCiaac) {
        if (!r.u.fechaCiaac) return false;
        const days = (new Date(`${r.u.fechaCiaac}T12:00:00`).getTime() - Date.now()) / 86400000;
        if (days < 0 || days > 30) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === "nombre") return a.u.nombre.localeCompare(b.u.nombre);
      if (orden === "avance") return a.progress - b.progress;
      if (orden === "preparacion") return (a.readiness ?? 101) - (b.readiness ?? 101);
      return b.u.lastAccess.localeCompare(a.u.lastAccess); // último acceso
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const visibles = useMemo(
    () => filtered.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered.map((r) => r.u.id).join(","), pageSafe],
  );

  return (
    <AdminShell title="Estudiantes" active="estudiantes">
      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8DA1BE" }}>
            <Icon n="search" size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o escuela..."
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="todos">Membresía: todas</option>
          {Object.entries(ACCESS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={fPlan} onChange={(e) => setFPlan(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
          <option value="todos">Plan: todos</option>
          <option value="paga">Pro (de paga)</option>
          <option value="basica">Básica (gratis)</option>
        </select>
        <select value={fMateriaDebil} onChange={(e) => setFMateriaDebil(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="todas">Materia débil: todas</option>
          {MATERIAS_DEF.map((m) => (
            <option key={m.slug} value={m.slug}>{m.name}</option>
          ))}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="acceso">Orden: último acceso</option>
          <option value="nombre">Orden: nombre A–Z</option>
          <option value="avance">Orden: menor avance</option>
          <option value="preparacion">Orden: menor preparación</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#22375C", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={soloInactivos} onChange={(e) => setSoloInactivos(e.target.checked)} style={{ accentColor: "#3D5D91", width: 15, height: 15 }} />
          Solo inactivos
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#22375C", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={proxCiaac} onChange={(e) => setProxCiaac(e.target.checked)} style={{ accentColor: "#3D5D91", width: 15, height: 15 }} />
          Próximos al CIAAC (30 días)
        </label>
      </div>

      <div style={{ fontSize: ".76rem", color: "#647DA0", marginBottom: 10 }}>
        Mostrando {visibles.length} de {filtered.length} estudiantes filtrados ({rows.length} en total)
      </div>

      {/* Tabla */}
      <div ref={scrollRef} style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1040, tableLayout: "auto" }}>
          <thead>
            <tr>
              <th style={thStyle}>Estudiante</th>
              <th style={thStyle}>WhatsApp</th>
              <th style={thStyle}>Escuela</th>
              <th style={thStyle}>Fecha CIAAC</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Membresía</th>
              <th style={thStyle}>Último acceso</th>
              <th style={thStyle}>Racha</th>
              <th style={thStyle}>Avance</th>
              <th style={thStyle}>Preparación</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle} />
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr>
                <td colSpan={12} style={{ ...tdStyle, textAlign: "center", color: "#8DA1BE", padding: "26px 12px" }}>
                  No hay estudiantes que coincidan con los filtros.
                </td>
              </tr>
            )}
            {visibles.map((r) => (
              <tr key={r.u.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{r.u.nombre}</div>
                  <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{r.u.email}</div>
                </td>
                <td style={tdStyle}>{r.u.whatsapp || "—"}</td>
                <td style={{ ...tdStyle, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{r.u.escuela || "—"}</td>
                <td style={tdStyle}>{r.u.fechaCiaac ? fmtDate(r.u.fechaCiaac) : "—"}</td>
                <td style={tdStyle}><PlanSelect user={r.u} /></td>
                <td style={tdStyle}>
                  <Badge text={ACCESS_LABEL[r.u.accessStatus] ?? r.u.accessStatus} color={ACCESS_COLOR[r.u.accessStatus] ?? "#3D5D91"} />
                </td>
                <td style={tdStyle}>{timeAgo(r.u.lastAccess)}</td>
                <td style={tdStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                    <Icon n="flame" size={14} color={r.streak > 0 ? "#f39c12" : "#8DA1BE"} /> {r.streak}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 56, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 10, background: "#3D5D91", width: `${r.progress}%` }} />
                    </div>
                    <span style={{ fontSize: ".74rem", fontWeight: 700 }}>{r.progress}%</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{r.readiness !== null ? `${r.readiness}%` : "—"}</td>
                <td style={tdStyle}>
                  <Badge text={r.state} color={generalStateColor(r.state)} />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate({ to: "/admin/perfil", search: { id: r.u.id } })}
                    style={{ padding: "6px 12px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".74rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", whiteSpace: "nowrap" }}
                  >
                    Abrir perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={pageSafe === 0}
            style={pagerBtn(pageSafe === 0)}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: ".78rem", color: "#647DA0", fontWeight: 700 }}>
            Página {pageSafe + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageSafe >= totalPages - 1}
            style={pagerBtn(pageSafe >= totalPages - 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </AdminShell>
  );
}

function pagerBtn(disabled: boolean): CSSProperties {
  return {
    padding: "7px 14px",
    background: "white",
    color: disabled ? "#B7C4D6" : "#3D5D91",
    border: "2px solid #F2DCDB",
    borderRadius: 8,
    fontSize: ".76rem",
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
    fontFamily: "'Manrope', sans-serif",
  };
}

/**
 * Cambia el plan del estudiante desde la propia lista.
 *
 * El cambio aplica el mismo parche que el modal del perfil (nivel de acceso,
 * nombre del plan y vencimiento) y queda registrado en el historial de accesos.
 */
function PlanSelect({ user }: { user: User }) {
  const actual = planIdDe(user);
  const cambiar = (id: PlanId) => {
    if (id === actual) return;
    const def = planById(id);
    updateUser(user.id, {
      plan: def.tier,
      planNombre: def.nombre,
      accessStatus: def.id === "prueba" ? "prueba" : "activo",
      accessEnd: def.dias === null ? null : new Date(Date.now() + def.dias * 86400000).toISOString(),
    });
    logAccessChange(user.id, "Cambio de plan", `${def.nombre} — desde la lista de estudiantes`);
  };
  return (
    <select
      value={actual}
      onChange={(e) => cambiar(e.target.value as PlanId)}
      title={`Plan actual: ${user.planNombre}`}
      style={{
        border: "2px solid #F2DCDB", borderRadius: 8, padding: "5px 8px",
        fontSize: ".76rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
        color: user.plan === "paga" ? "#3D5D91" : "#647DA0", background: "white",
        outline: "none", cursor: "pointer", maxWidth: 150,
      }}
    >
      {PLANES.map((p) => (
        <option key={p.id} value={p.id}>{p.nombre}</option>
      ))}
    </select>
  );
}
