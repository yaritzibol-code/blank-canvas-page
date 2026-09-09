/**
 * Sección de Logros dentro del perfil: destacados, progreso general y el
 * catálogo completo agrupado por categoría. Los datos vienen del motor
 * (`@/lib/logros/engine`), nunca de valores inventados en la vista.
 */
import { useMemo, useState } from "react";
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

export function LogrosPanel({ userId }: { userId: string }) {
  const version = useStoreVersion();
  const [editando, setEditando] = useState(false);
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

  const destacadosItems = destacados
    .map((id) => logros.find((l) => l.id === id))
    .filter((l): l is LogroEstado => !!l && l.desbloqueado);

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
            onClick={() => setEditando((v) => !v)}
            style={{
              background: editando ? "#3D5D91" : "transparent",
              color: editando ? "white" : "#3D5D91",
              border: "1px solid #3D5D91",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: ".74rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {editando ? "Listo" : "Elegir"}
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
        {editando && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: ".72rem", color: "#647DA0", marginBottom: 8 }}>
              Toca hasta {MAX_DESTACADOS} logros desbloqueados para destacarlos.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
                gap: 8,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {logros
                .filter((l) => l.desbloqueado)
                .map((l) => (
                  <Badge key={l.id} l={l} onClick={() => toggleDestacado(l.id)} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Catálogo */}
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

        {LOGRO_CATEGORIAS.map((cat) => {
          const items = logros.filter((l) => l.categoria === cat);
          const hechos = items.filter((l) => l.desbloqueado).length;
          return (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: ".74rem",
                  fontWeight: 800,
                  color: "#22375C",
                  marginBottom: 8,
                }}
              >
                {cat}{" "}
                <span style={{ color: "#8DA1BE", fontWeight: 600 }}>
                  {hechos}/{items.length}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                  gap: 10,
                }}
              >
                {items.map((l) => (
                  <Badge key={l.id} l={l} seleccionable={false} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
