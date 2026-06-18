import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SUBJECT_TEMAS, TEMA_REGISTRY, type TemaEntry } from "@/modules/data/registry";
import { BlockRenderer } from "@/modules/engine/BlockRenderer";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";

export const Route = createFileRoute("/dashboard/materias/$subjectId")({
  component: SubjectDetail,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const SUBJECT_META: Record<string, { icon: FPIconName; name: string }> = {
  aerodinamica: { icon: "plane", name: "Aerodinámica" },
  meteorologia: { icon: "cloud", name: "Meteorología" },
  "aeronaves-motores": { icon: "settings", name: "Aeronaves y Motores" },
  legislacion: { icon: "scale", name: "Legislación Aeronáutica" },
  medicina: { icon: "stethoscope", name: "Medicina de Aviación" },
  navegacion: { icon: "map", name: "Navegación Aérea" },
  "servicios-transito": { icon: "tower", name: "Servicios de Tránsito Aéreo" },
  comunicaciones: { icon: "radio", name: "Comunicaciones Aeronáuticas" },
  "manuales-ais": { icon: "doc", name: "Manuales de Información" },
  "factores-humanos": { icon: "brain", name: "Factores Humanos" },
  "seguridad-aerea": { icon: "shield", name: "Seguridad Aérea" },
  operaciones: { icon: "plane", name: "Operaciones Aeronáuticas" },
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
          borderBottom: "1px solid #E8EEF6",
          background: "#F4F7FB",
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: "0.62rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.16em", color: "#647DA0", fontWeight: 700, marginBottom: 4 }}>
          Temas disponibles
        </p>
        <p style={{ fontSize: "0.75rem", color: "#647DA0" }}>
          <span style={{ color: "#22375C", fontWeight: 700, fontFamily: DISPLAY }}>{temas.length}</span> temas cargados
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {bloqueNums.length === 0 && (
          <p style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#8DA1BE" }}>
            Contenido próximamente
          </p>
        )}
        {bloqueNums.map((bNum) => {
          const bloque = bloques[bNum];
          return (
            <div key={bNum}>
              <div
                style={{
                  padding: "10px 20px 6px",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  fontFamily: MONO,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#647DA0",
                }}
              >
                Bloque {bNum} · {bloque.titulo}
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
                      margin: "1px 10px",
                      padding: "10px 12px",
                      borderRadius: 10,
                      width: "calc(100% - 20px)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: isSelected ? "#FAEFEE" : "transparent",
                      textAlign: "left",
                      fontFamily: FONT,
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#F4F7FB"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
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
                        fontFamily: DISPLAY,
                        background: isSelected ? "#6C0820" : "#E8EEF6",
                        color: isSelected ? "white" : "#8DA1BE",
                      }}
                    >
                      {t.tema}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "#6C0820" : "#33527F",
                          lineHeight: 1.3,
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#8DA1BE", marginTop: 3, display: "flex", alignItems: "center", gap: 4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <Icon n="timer" size={11} />
                        {t.duracion_min} min
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid #E8EEF6", flexShrink: 0 }}>
        <Link
          to="/dashboard/materias"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#647DA0",
            fontSize: "0.78rem",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <Icon n="chevL" size={14} /> Todas las materias
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
  meta: { icon: FPIconName; name: string };
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
          color: "#647DA0",
          textAlign: "center",
          padding: 40,
        }}
      >
        <span style={{ width: 72, height: 72, borderRadius: 18, background: "#FAEFEE", border: "1px solid #F2AEBC", color: "#6C0820", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n={meta.icon} size={36} />
        </span>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: "#22375C", letterSpacing: "-0.02em" }}>{meta.name}</h2>
        <p style={{ fontSize: "0.9rem", maxWidth: 340, color: "#647DA0" }}>
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
      <span style={{ width: 86, height: 86, borderRadius: 22, background: "#FAEFEE", border: "1px solid #F2AEBC", color: "#6C0820", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon n={meta.icon} size={44} />
      </span>
      <div>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontSize: "1.8rem",
            color: "#22375C",
            marginBottom: 6,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {meta.name}
        </h2>
        <p style={{ fontSize: "0.92rem", color: "#647DA0", maxWidth: 380 }}>
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
              border: "1px solid #E8EEF6",
              borderRadius: 14,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              fontFamily: FONT,
              boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 8px 24px -12px rgba(15,26,51,0.12)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#F2AEBC";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(15,26,51,0.04), 0 14px 30px -14px rgba(108,8,32,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8EEF6";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,26,51,0.04), 0 8px 24px -12px rgba(15,26,51,0.12)";
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                fontFamily: MONO,
                color: "#647DA0",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                marginBottom: 6,
              }}
            >
              Bloque {t.bloque} · Tema {t.tema}
            </div>
            <div style={{ fontSize: "0.92rem", fontFamily: DISPLAY, color: "#22375C", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
              {t.title}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#8DA1BE", marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Icon n="timer" size={12} />
              {t.duracion_min} min
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
  const meta = SUBJECT_META[subjectId] ?? { icon: "book" as FPIconName, name: subjectId };
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
        fontFamily: FONT,
      }}
    >
      {/* ── TOPBAR ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #E8EEF6",
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
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FAEFEE",
              color: "#6C0820",
              padding: "5px 12px 5px 8px",
              borderRadius: 20,
              border: "1px solid rgba(108,8,32,0.12)",
              fontSize: "0.78rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#6C0820", color: "#F2AEBC", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n={meta.icon} size={13} />
            </span>
            {meta.name}
          </span>
          {selectedEntry && (
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: "1rem",
                color: "#22375C",
                fontWeight: 600,
                letterSpacing: "-0.01em",
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
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "white",
            border: "1px solid #E8EEF6",
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#3D5D91",
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          <Icon n="list" size={14} /> Temas
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
              borderBottom: "1px solid #E8EEF6",
              boxShadow: "0 24px 48px -20px rgba(15,26,51,0.22)",
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
            borderRight: "1px solid #E8EEF6",
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
            background: "#FBFAF7",
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
