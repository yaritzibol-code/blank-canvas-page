/**
 * Sección de Logros dentro del perfil: resumen compacto en la página y
 * catálogo completo en un modal. Los datos vienen del motor
 * (`@/lib/logros/engine`), nunca de valores inventados en la vista.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/fp-icon";
import { useStoreVersion } from "@/lib/store";
import {
  listarLogros,
  getDestacados,
  setDestacados,
  MAX_DESTACADOS,
} from "@/lib/logros/engine";
import { LOGRO_CATEGORIAS, LOGRO_MAXIMO_ID } from "@/lib/logros/catalog";
import type { LogroEstado } from "@/lib/logros/types";

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "";

const card = {
  background: "white",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 10px rgba(61,93,145,.06)",
  marginBottom: 24,
} as const;

const titulo = {
  fontSize: ".78rem",
  fontWeight: 700,
  color: "#647DA0",
  textTransform: "uppercase",
  letterSpacing: ".5px",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
} as const;

function Badge({
  l,
  onClick,
  seleccionable,
}: {
  l: LogroEstado;
  onClick?: () => void;
  seleccionable?: boolean;
}) {
  const esMax = l.id === LOGRO_MAXIMO_ID;
  const oculto = !l.desbloqueado && l.secreto;
  const bloqueado = !l.desbloqueado;
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      title={oculto ? "Algunos logros se ganan. Este se demuestra." : l.desc}
      style={{
        textAlign: "center",
        padding: "14px 10px",
        borderRadius: 12,
        cursor: onClick ? "pointer" : "default",
        background:
          esMax && l.desbloqueado
            ? "linear-gradient(150deg,#22375C,#3D5D91 60%,#B08A34)"
            : bloqueado
              ? "#f5f7fc"
              : "#f8f9ff",
        border:
          l.destacado && seleccionable !== false
            ? "2px solid #3D5D91"
            : "1px solid rgba(61,93,145,.10)",
        opacity: bloqueado ? 0.5 : 1,
        filter: bloqueado && !esMax ? "grayscale(1)" : undefined,
        color: esMax && l.desbloqueado ? "white" : undefined,
      }}
    >
      <div
        style={{
          marginBottom: 6,
          display: "flex",
          justifyContent: "center",
          color: esMax && l.desbloqueado ? "#F2D27A" : "#3D5D91",
        }}
      >
        <Icon n={(oculto ? "help" : l.icon) as never} size={26} />
      </div>
      <div
        style={{
          fontSize: ".72rem",
          fontWeight: 700,
          color: esMax && l.desbloqueado ? "white" : "#22375C",
          lineHeight: 1.2,
          marginBottom: 3,
        }}
      >
        {oculto ? "???" : l.nombre}
      </div>
      <div
        style={{
          fontSize: ".62rem",
          color: esMax && l.desbloqueado ? "rgba(255,255,255,.8)" : "#8DA1BE",
          lineHeight: 1.3,
        }}
      >
        {oculto ? "Algunos logros se ganan. Este se demuestra." : l.desc}
      </div>
      {l.desbloqueado && l.fecha && (
        <div
          style={{
            fontSize: ".58rem",
            marginTop: 5,
            color: esMax ? "rgba(255,255,255,.75)" : "#A9B8CE",
            fontWeight: 600,
          }}
        >
          {fmt(l.fecha)}
        </div>
      )}
    </div>
  );
}

function useModalClose(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function LogroCatalogoModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const version = useStoreVersion();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const backdropRef = useRef<HTMLDivElement>(null);

  const logros = useMemo(() => listarLogros(userId), [userId, version]);
  const destacados = useMemo(() => getDestacados(userId), [userId, version]);

  const total = logros.length;
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;
  const pct = Math.round((desbloqueados / total) * 100);

  const toggleDestacado = (id: string) => {
    const actual = getDestacados(userId);
    const next = actual.includes(id)
      ? actual.filter((x) => x !== id)
      : actual.length >= MAX_DESTACADOS
        ? actual
        : [...actual, id];
    setDestacados(userId, next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logros;
    return logros.filter(
      (l) =>
        l.nombre.toLowerCase().includes(q) ||
        l.desc.toLowerCase().includes(q) ||
        l.categoria.toLowerCase().includes(q),
    );
  }, [logros, query]);

  const porCategoria = useMemo(() => {
    return LOGRO_CATEGORIAS.map((cat) => ({
      cat,
      items: filtered.filter((l) => l.categoria === cat),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  useModalClose(onClose);

  const toggleCat = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const modal = (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(34,55,92,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logros-titulo"
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 860,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(34,55,92,.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #eef2fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div id="logros-titulo" style={titulo}>
              <Icon n="trophy" size={15} /> Catálogo de logros
            </div>
            <div style={{ fontSize: ".82rem", color: "#647DA0", marginTop: 4 }}>
              {desbloqueados} / {total} desbloqueados · {pct}% completado
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #F2DCDB",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#647DA0",
            }}
          >
            <Icon n="close" size={16} />
          </button>
        </div>

        {/* Búsqueda y progreso */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2fa" }}>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: "#eef2fa",
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "linear-gradient(90deg,#3D5D91,#6B8FD1)",
                transition: "width .4s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f8f9ff",
              border: "1px solid #F2DCDB",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            <Icon n="search" size={16} color="#8DA1BE" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar logro…"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: ".88rem",
                color: "#22375C",
                outline: "none",
                fontFamily: "'Manrope', sans-serif",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  fontSize: ".7rem",
                  color: "#647DA0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Acordeones */}
        <div
          style={{
            overflowY: "auto",
            padding: "12px 20px 20px",
            flex: 1,
          }}
        >
          {porCategoria.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#8DA1BE", fontSize: ".9rem" }}>
              No encontramos logros que coincidan con tu búsqueda.
            </div>
          ) : (
            porCategoria.map(({ cat, items }) => {
              const hechos = items.filter((l) => l.desbloqueado).length;
              const isOpen = !!expanded[cat];
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <button
                    onClick={() => toggleCat(cat)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #F2DCDB",
                      background: isOpen ? "rgba(61,93,145,.06)" : "white",
                      cursor: "pointer",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".78rem",
                        fontWeight: 800,
                        color: "#22375C",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <Icon n={isOpen ? "chevronDown" : "chevronRight"} size={14} />
                      {cat}
                    </span>
                    <span
                      style={{
                        fontSize: ".72rem",
                        fontWeight: 700,
                        color: hechos === items.length ? "#2ecc71" : "#8DA1BE",
                      }}
                    >
                      {hechos}/{items.length}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                        gap: 10,
                        padding: "10px 0 6px",
                      }}
                    >
                      {items.map((l) => (
                        <Badge
                          key={l.id}
                          l={l}
                          onClick={l.desbloqueado ? () => toggleDestacado(l.id) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #eef2fa",
            fontSize: ".72rem",
            color: "#647DA0",
            textAlign: "center",
          }}
        >
          Toca un logro desbloqueado para destacarlo (máximo {MAX_DESTACADOS}).
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function LogrosPanel({ userId }: { userId: string }) {
  const version = useStoreVersion();
  const [modalAbierto, setModalAbierto] = useState(false);
  const logros = useMemo(() => listarLogros(userId), [userId, version]);
  const destacados = useMemo(() => getDestacados(userId), [userId, version]);

  const total = logros.length;
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;
  const pct = Math.round((desbloqueados / total) * 100);

  const destacadosItems = destacados
    .map((id) => logros.find((l) => l.id === id))
    .filter((l): l is LogroEstado => !!l && l.desbloqueado);

  const recientes = useMemo(() => {
    return logros
      .filter((l) => l.desbloqueado && l.fecha)
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""))
      .slice(0, 6);
  }, [logros]);

  return (
    <>
      {/* Logros destacados */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={titulo}>
            <Icon n="star" size={15} /> Logros destacados
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            style={{
              background: "transparent",
              color: "#3D5D91",
              border: "1px solid #3D5D91",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: ".74rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Elegir
          </button>
        </div>
        {destacadosItems.length === 0 ? (
          <div style={{ fontSize: ".8rem", color: "#8DA1BE" }}>
            Todavía no eliges destacados. Puedes mostrar hasta {MAX_DESTACADOS} de tus logros.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 10,
            }}
          >
            {destacadosItems.map((l) => (
              <Badge key={l.id} l={l} seleccionable={false} />
            ))}
          </div>
        )}
      </div>

      {/* Resumen compacto */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div style={titulo}>
            <Icon n="trophy" size={15} /> Logros
          </div>
          <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#22375C" }}>
            {desbloqueados} / {total} desbloqueados
          </div>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: "#eef2fa",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "linear-gradient(90deg,#3D5D91,#6B8FD1)",
              transition: "width .4s ease",
            }}
          />
        </div>

        {recientes.length > 0 && (
          <>
            <div
              style={{
                fontSize: ".74rem",
                fontWeight: 800,
                color: "#22375C",
                marginBottom: 10,
              }}
            >
              Últimos desbloqueados
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {recientes.map((l) => (
                <Badge key={l.id} l={l} seleccionable={false} />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => setModalAbierto(true)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#3D5D91",
            color: "white",
            fontSize: ".86rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Manrope', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon n="trophy" size={16} /> Ver todos los logros
        </button>
      </div>

      {modalAbierto && <LogroCatalogoModal userId={userId} onClose={() => setModalAbierto(false)} />}
    </>
  );
}
