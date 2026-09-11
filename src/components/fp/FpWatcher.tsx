/**
 * Vigila la actividad y pide al servidor que otorgue los FlightPoints que
 * falten. Sólo celebra lo que el servidor confirmó, agrupado en un aviso.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser, useStoreVersion } from "@/lib/store";
import { sincronizarFP } from "@/lib/fp/client";
import { FP_ACTIVITY_LABEL, fpFormat, type FpNuevo } from "@/lib/fp/shared";

export function FpWatcher() {
  const user = useSessionUser();
  const version = useStoreVersion();
  const [lote, setLote] = useState<FpNuevo[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void sincronizarFP().then((nuevos) => {
        if (nuevos.length > 0) setLote(nuevos);
      });
    }, 3000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.id, version]);

  useEffect(() => {
    if (!lote) return;
    const t = setTimeout(() => setLote(null), 9000);
    return () => clearTimeout(t);
  }, [lote]);

  if (!lote || lote.length === 0) return null;
  const total = lote.reduce((s, n) => s + n.amount, 0);
  const detalle = lote.slice(0, 3);

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        right: 16,
        bottom: 90,
        zIndex: 4000,
        maxWidth: 330,
        padding: "14px 16px",
        borderRadius: 16,
        background: "linear-gradient(135deg,#12315C,#1E4E8C)",
        color: "white",
        boxShadow: "0 14px 34px rgba(15,30,60,.32)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#F2D27A", display: "flex" }}>
          <Icon n="star" size={24} />
        </span>
        <strong style={{ fontSize: "1.05rem" }}>+{fpFormat(total)} FlightPoints</strong>
      </div>
      <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", fontSize: ".78rem", opacity: 0.9 }}>
        {detalle.map((n, i) => (
          <li key={i}>
            +{n.amount} · {n.activity_label}
            {n.detail ? ` — ${n.detail}` : ""}
          </li>
        ))}
        {lote.length > detalle.length && <li>y {lote.length - detalle.length} más…</li>}
      </ul>
      <Link
        to="/dashboard/comunidad"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: ".76rem", color: "#F2D27A", fontWeight: 700 }}
        onClick={() => setLote(null)}
      >
        Ver Comunidad <Icon n="arrow" size={13} />
      </Link>
      <span style={{ display: "none" }}>{FP_ACTIVITY_LABEL["logro"]}</span>
    </div>
  );
}
