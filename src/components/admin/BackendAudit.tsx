/**
 * Auditoría de conexiones del panel admin.
 *
 * Contrasta lo que muestra el panel (store hidratado desde la nube) contra
 * los conteos reales que devuelve la base de datos vía `admin_platform_stats`.
 * Si algo no cuadra, la admin lo ve aquí en lugar de asumir que el tablero
 * está al día.
 */
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { supabase } from "@/integrations/supabase/client";
import { cardHeadStyle, cardStyle } from "@/components/admin/AdminShell";

interface PlatformStats {
  total_users: number;
  admins: number;
  reports_open: number;
  reminders_last_24h: number;
  reminders_failed_24h: number;
  rag_chunks: number;
}

export function BackendAudit({ localUsers, localReports }: { localUsers: number; localReports: number }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const { data, error: err } = await supabase.rpc("admin_platform_stats");
      if (!vivo) return;
      if (err || !data) setError(err?.message ?? "Sin respuesta de la base de datos");
      else setStats(data as unknown as PlatformStats);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const rows: { lab: string; real: string; local?: string; ok?: boolean }[] = stats
    ? [
        { lab: "Perfiles en la base", real: String(stats.total_users), local: String(localUsers), ok: stats.total_users === localUsers },
        { lab: "Administradoras", real: String(stats.admins) },
        { lab: "Reportes abiertos", real: String(stats.reports_open), local: String(localReports), ok: stats.reports_open === localReports },
        { lab: "Recordatorios (24 h)", real: `${stats.reminders_last_24h} · ${stats.reminders_failed_24h} fallidos`, ok: stats.reminders_failed_24h === 0 },
        { lab: "Fragmentos RAG de Yaris", real: String(stats.rag_chunks), ok: stats.rag_chunks > 0 },
      ]
    : [];

  return (
    <div style={{ ...cardStyle, marginBottom: 20 }}>
      <div style={cardHeadStyle}>
        <Icon n="chart" size={16} color="#3D5D91" />
        <h3 style={{ fontSize: ".88rem", fontWeight: 800, color: "#22375C" }}>Auditoría de conexiones</h3>
      </div>

      {cargando && <p style={{ fontSize: ".8rem", color: "#8DA1BE" }}>Consultando la base de datos…</p>}
      {error && <p style={{ fontSize: ".8rem", color: "#c0392b" }}>No se pudo leer la base: {error}</p>}

      {stats && (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((r) => (
            <div key={r.lab} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".78rem", borderBottom: "1px solid #F0F4FA", paddingBottom: 7 }}>
              <span style={{ flex: 1, color: "#647DA0" }}>{r.lab}</span>
              <strong style={{ color: "#22375C" }}>{r.real}</strong>
              {r.local !== undefined && (
                <span style={{ color: "#8DA1BE" }}>panel: {r.local}</span>
              )}
              {r.ok !== undefined && (
                <Icon n={r.ok ? "checkCircle" : "alert"} size={15} color={r.ok ? "#2ecc71" : "#f39c12"} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
