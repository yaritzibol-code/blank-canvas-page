import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SUBJECT_TEMAS, TEMA_REGISTRY, type TemaEntry } from "@/modules/data/registry";
import { BlockRenderer } from "@/modules/engine/BlockRenderer";

export const Route = createFileRoute("/dashboard/materias/$subjectId")({
  component: SubjectDetail,
});

const SUBJECT_META: Record<string, { icon: string; name: string }> = {
  aerodinamica: { icon: "✈️", name: "Aerodinámica" },
  meteorologia: { icon: "🌤️", name: "Meteorología" },
  "aeronaves-motores": { icon: "⚙️", name: "Aeronaves y Motores" },
  legislacion: { icon: "⚖️", name: "Legislación Aeronáutica" },
  medicina: { icon: "🏥", name: "Medicina de Aviación" },
  navegacion: { icon: "🗺️", name: "Navegación Aérea" },
  "servicios-transito": { icon: "🗼", name: "Servicios de Tránsito Aéreo" },
  comunicaciones: { icon: "📻", name: "Comunicaciones Aeronáuticas" },
  "manuales-ais": { icon: "📋", name: "Manuales de Información" },
  "factores-humanos": { icon: "🧠", name: "Factores Humanos" },
  "seguridad-aerea": { icon: "🛡️", name: "Seguridad Aérea" },
  operaciones: { icon: "🛫", name: "Operaciones Aeronáuticas" },
};

function groupByBloque(temas: TemaEntry[]) {
  const map: Record<number, { titulo: string; temas: TemaEntry[] }> = {};
  for (const t of temas) {
    if (!map[t.bloque]) map[t.bloque] = { titulo: t.bloque_titulo, temas: [] };
    map[t.bloque].temas.push(t);
  }
  return map;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

function Sidebar({
  subjectId,
  temas,
  selectedTemaId,
  onSelect,
}: {
  subjectId: string;
  temas: TemaEntry[];
  selectedTemaId: string | null;
  onSelect: (id: string) => void;
}) {
  const bloques = groupByBloque(temas);
  const bloqueNums = Object.keys(bloques)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #F2DCDB",
          background: "#f8f9ff",
          flexShrink: 0,
        }}
      >
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
          Temas disponibles
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#888" }}>
          <span style={{ color: "#3D5D91", fontWeight: 700 }}>{temas.length}</span> temas cargados
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {bloqueNums.length === 0 && (
          <p style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#aaa" }}>
            Contenido próximamente
          </p>
        )}
        {bloqueNums.map((bNum) => {
          const bloque = bloques[bNum];
          return (
            <div key={bNum}>
              <div
                style={{
                  padding: "8px 20px 4px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#5A86CB",
                }}
              >
                Bloque {bNum}: {bloque.titulo}
              </div>
              {bloque.temas.map((t) => {
                const isSelected = t.id === selectedTemaId;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 20px",
                      width: "100%",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      borderLeft: isSelected ? "3px solid #3D5D91" : "3px solid transparent",
                      background: isSelected ? "rgba(61,93,145,0.07)" : "transparent",
                      textAlign: "left",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        background: isSelected ? "#3D5D91" : "#eee",
                        color: isSelected ? "white" : "#999",
                      }}
                    >
                      {t.tema}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "#3D5D91" : "#333",
                          lineHeight: 1.3,
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>
                        ⏱ {t.duracion_min} min
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid #F2DCDB", flexShrink: 0 }}>
        <Link
          to="/dashboard/materias"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#888",
            fontSize: "0.78rem",
            textDecoration: "none",
          }}
        >
          ← Todas las materias
        </Link>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */

function EmptyState({
  meta,
  temas,
  subjectId,
  onSelect,
}: {
  meta: { icon: string; name: string };
  temas: TemaEntry[];
  subjectId: string;
  onSelect: (id: string) => void;
}) {
  if (temas.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 16,
          color: "#aaa",
          textAlign: "center",
          padding: 40,
        }}
      >
        <span style={{ fontSize: "3rem" }}>{meta.icon}</span>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#3D5D91" }}>{meta.name}</h2>
        <p style={{ fontSize: "0.9rem", maxWidth: 340 }}>
          Los temas de esta materia están en preparación. ¡Pronto estarán disponibles!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 20,
        textAlign: "center",
        padding: 40,
      }}
    >
      <span style={{ fontSize: "4rem" }}>{meta.icon}</span>
      <div>
        <h2
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#1a1a2e",
            marginBottom: 8,
          }}
        >
          {meta.name}
        </h2>
        <p style={{ fontSize: "0.92rem", color: "#888", maxWidth: 360 }}>
          Selecciona un tema del panel izquierdo para comenzar a estudiar.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          width: "100%",
          maxWidth: 640,
          marginTop: 8,
        }}
      >
        {temas.slice(0, 4).map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              padding: "14px 16px",
              background: "white",
              border: "2px solid #F2DCDB",
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              fontFamily: "'Manrope', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3D5D91";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(61,93,145,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#F2DCDB";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#5A86CB",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
              }}
            >
              Bloque {t.bloque} · Tema {t.tema}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>
              {t.title}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 6 }}>
              ⏱ {t.duracion_min} min
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const meta = SUBJECT_META[subjectId] ?? { icon: "📚", name: subjectId };
  const temas = SUBJECT_TEMAS[subjectId] ?? [];

  const [selectedTemaId, setSelectedTemaId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Read ?tema= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const temaParam = params.get("tema");
    if (temaParam && TEMA_REGISTRY[temaParam]) {
      setSelectedTemaId(temaParam);
    } else if (temas.length > 0) {
      setSelectedTemaId(temas[0].id);
    }
  }, [subjectId]);

  function handleSelectTema(id: string) {
    setSelectedTemaId(id);
    setMobileSidebarOpen(false);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("tema", id);
    window.history.pushState({}, "", url.toString());
  }

  const selectedTema = selectedTemaId ? TEMA_REGISTRY[selectedTemaId] : null;
  const selectedEntry = temas.find((t) => t.id === selectedTemaId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {/* ── TOPBAR ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(61,93,145,0.08)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              background: "#F2DCDB",
              color: "#6C0820",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "0.78rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {meta.icon} {meta.name}
          </span>
          {selectedEntry && (
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "1rem",
                color: "#1a1a2e",
                fontWeight: 700,
              }}
              className="hidden sm:block"
            >
              Bloque {selectedEntry.bloque} · Tema {selectedEntry.tema}
            </span>
          )}
        </div>

        {/* Mobile sidebar toggle */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          style={{
            background: "none",
            border: "1px solid #F2DCDB",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: "0.8rem",
            color: "#3D5D91",
            cursor: "pointer",
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          📋 Temas
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "white",
              maxHeight: "70vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              borderBottom: "2px solid #F2DCDB",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}
          >
            <Sidebar
              subjectId={subjectId}
              temas={temas}
              selectedTemaId={selectedTemaId}
              onSelect={handleSelectTema}
            />
          </div>
        )}

        {/* Desktop sidebar */}
        <div
          className="hidden md:flex"
          style={{
            width: 280,
            background: "white",
            borderRight: "1px solid rgba(61,93,145,0.08)",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Sidebar
            subjectId={subjectId}
            temas={temas}
            selectedTemaId={selectedTemaId}
            onSelect={handleSelectTema}
          />
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f5f7fc",
          }}
        >
          {selectedTema ? (
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
              <BlockRenderer
                tema={selectedTema}
                progreso={0}
                onComplete={(dif) => {
                  console.log("tema completado, dificultad:", dif);
                }}
              />
            </div>
          ) : (
            <EmptyState
              meta={meta}
              temas={temas}
              subjectId={subjectId}
              onSelect={handleSelectTema}
            />
          )}
        </div>
      </div>
    </div>
  );
}
