/**
 * Vigila la actividad del usuario y desbloquea logros en cuanto se cumplen.
 * Muestra un aviso discreto por cada logro y una celebración especial cuando
 * se obtiene el logro máximo de FlightPath.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser, useStoreVersion } from "@/lib/store";
import { evaluarLogros, logroPorId } from "@/lib/logros/engine";
import { LOGRO_MAXIMO_ID } from "@/lib/logros/catalog";

export function LogroWatcher() {
  const user = useSessionUser();
  const version = useStoreVersion();
  const [cola, setCola] = useState<string[]>([]);
  const [maximo, setMaximo] = useState(false);

  useEffect(() => {
    if (!user) return;
    const nuevos = evaluarLogros(user.id);
    if (nuevos.length === 0) return;
    if (nuevos.includes(LOGRO_MAXIMO_ID)) setMaximo(true);
    setCola((q) => [...q, ...nuevos.filter((id) => id !== LOGRO_MAXIMO_ID)]);
  }, [user?.id, version]);

  useEffect(() => {
    if (cola.length === 0) return;
    const t = setTimeout(() => setCola((q) => q.slice(1)), 6000);
    return () => clearTimeout(t);
  }, [cola]);

  const actual = cola[0] ? logroPorId(cola[0]) : null;

  return (
    <>
      {actual && (
        <div
          role="status"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 4000,
            maxWidth: 320,
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "12px 14px",
            borderRadius: 14,
            background: "#22375C",
            color: "white",
            boxShadow: "0 12px 30px rgba(15,30,60,.3)",
          }}
        >
          <span style={{ color: "#F2D27A", display: "flex" }}>
            <Icon n={actual.icon as never} size={26} />
          </span>
          <span>
            <span style={{ display: "block", fontSize: ".64rem", opacity: 0.75, fontWeight: 700 }}>
              LOGRO DESBLOQUEADO
            </span>
            <span style={{ display: "block", fontSize: ".88rem", fontWeight: 800 }}>
              {actual.nombre}
            </span>
            <span style={{ display: "block", fontSize: ".72rem", opacity: 0.85 }}>
              {actual.desc}
            </span>
          </span>
        </div>
      )}

      {maximo && (
        <div
          role="dialog"
          aria-label="No es suerte, es preparación"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(10,18,35,.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              borderRadius: 22,
              padding: "34px 26px",
              textAlign: "center",
              color: "white",
              background: "linear-gradient(155deg,#22375C,#3D5D91 55%,#B08A34)",
              boxShadow: "0 30px 70px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", color: "#F2D27A" }}>
              <Icon n="trophy" size={64} />
            </div>
            <h2
              style={{
                margin: "14px 0 10px",
                fontSize: "1.4rem",
                letterSpacing: ".5px",
                fontWeight: 800,
              }}
            >
              NO ES SUERTE, ES PREPARACIÓN.
            </h2>
            <p style={{ fontSize: ".92rem", lineHeight: 1.7, opacity: 0.92 }}>
              Completaste tu ruta.
              <br />
              Demostraste constancia.
              <br />
              Pusiste a prueba tus conocimientos.
              <br />Y llegaste hasta aquí.
            </p>
            <p style={{ fontSize: "1rem", fontWeight: 800, marginTop: 12 }}>
              Estás preparado para despegar.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/dashboard/perfil"
                onClick={() => setMaximo(false)}
                style={{
                  background: "white",
                  color: "#22375C",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: ".84rem",
                  textDecoration: "none",
                }}
              >
                Ver en mi perfil
              </Link>
              <button
                onClick={() => setMaximo(false)}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "1px solid rgba(255,255,255,.5)",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: ".84rem",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
