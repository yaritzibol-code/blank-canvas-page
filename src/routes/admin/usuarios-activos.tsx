/** Panel Admin — Usuarios activos en tiempo real. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { AdminShell, Badge, cardHeadStyle, cardStyle } from "@/components/admin/AdminShell";
import {
  observarPresencia,
  presenciaActual,
  presenciaConectada,
  IDLE_MS,
  type PresenciaUsuario,
} from "@/lib/presence";
import { adminPresenciaReciente, type PresenciaRecienteRow } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/usuarios-activos")({
  component: UsuariosActivosPage,
});

function duracion(desdeIso: string, ahora: number): string {
  const min = Math.max(0, Math.round((ahora - new Date(desdeIso).getTime()) / 60000));
  if (min < 1) return "recién";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
}

function UsuariosActivosPage() {
  const [presencias, setPresencias] = useState<PresenciaUsuario[]>([]);
  const [conectado, setConectado] = useState(false);
  const [incluirInactivos, setIncluirInactivos] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ahora, setAhora] = useState(() => Date.now());
  const [respaldo, setRespaldo] = useState<PresenciaRecienteRow[]>([]);
  const [usandoRespaldo, setUsandoRespaldo] = useState(false);

  // Reloj local: los "hace X min" se refrescan sin depender de eventos.
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  // Canal compartido: la misma conexión que publica la presencia de esta
  // pestaña. Abrir un segundo canal con el mismo tema deja la lista vacía.
  useEffect(() => {
    const refrescar = () => {
      setPresencias(presenciaActual());
      setConectado(presenciaConectada());
    };
    const off = observarPresencia(refrescar);
    refrescar();
    // Respaldo por si el canal se reconecta sin emitir eventos.
    const id = window.setInterval(refrescar, 10_000);
    return () => {
      off();
      window.clearInterval(id);
    };
  }, []);


  // Respaldo: si el canal en vivo no reporta a nadie, se consultan las
  // sesiones con actividad reciente (`last_seen_at`) para no mostrar 0 falso.
  useEffect(() => {
    let cancel = false;
    const consultar = async () => {
      const r = await adminPresenciaReciente({ data: { minutes: 15 } });
      if (!cancel && !("error" in r)) setRespaldo(r);
    };
    void consultar();
    const id = window.setInterval(() => void consultar(), 60_000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, []);

  const lista: PresenciaUsuario[] = useMemo(() => {
    if (presencias.length > 0) return presencias;
    return respaldo.map((r) => ({
      userId: r.user_id,
      nombre: r.nombre || r.email || "Sin nombre",
      email: r.email ?? "",
      role: r.role,
      plan: r.plan,
      ruta: r.path ?? "/",
      pantalla: r.label ?? r.path ?? "—",
      actividad: `Última señal ${new Date(r.last_seen).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      desde: r.started_at,
      pestanas: 1,
      inactivo: ahora - new Date(r.last_seen).getTime() > IDLE_MS,
    })) as PresenciaUsuario[];
  }, [presencias, respaldo, ahora]);

  useEffect(() => {
    setUsandoRespaldo(presencias.length === 0 && respaldo.length > 0);
  }, [presencias, respaldo]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista
      .filter((p) => (incluirInactivos ? true : !p.inactivo))
      .filter((p) => !q || p.nombre.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [lista, incluirInactivos, busqueda]);

  const activos = lista.filter((p) => !p.inactivo).length;

  return (
    <AdminShell title="Usuarios activos" active="usuarios_activos">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: ".72rem", color: "#647DA0", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 700 }}>
            En la plataforma ahora
          </div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2.1rem", fontWeight: 900, color: "#2ecc71", lineHeight: 1.1, marginTop: 6 }}>
            {activos}
          </div>
          <div style={{ fontSize: ".76rem", color: "#647DA0", marginTop: 4 }}>
            {lista.length - activos} en reposo · {lista.reduce((n, p) => n + p.pestanas, 0)} pestañas
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: ".72rem", color: "#647DA0", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 700 }}>
            Conexión en vivo
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: conectado ? "#2ecc71" : "#f39c12" }} />
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#22375C" }}>
              {usandoRespaldo ? "Respaldo por actividad" : conectado ? "Escuchando" : "Conectando…"}
            </span>
          </div>
          <div style={{ fontSize: ".76rem", color: "#647DA0", marginTop: 6 }}>
            {usandoRespaldo
              ? "El canal en vivo no reportó a nadie; se muestran las sesiones con señal en los últimos 15 minutos."
              : "La lista se actualiza sola, sin recargar."}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <Icon n="users" size={15} color="#3D5D91" />
          <h3 style={{ fontSize: ".88rem", fontWeight: 800, color: "#22375C" }}>Quién está dentro</h3>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            aria-label="Buscar persona conectada"
            style={{
              flex: "1 1 220px",
              minHeight: 42,
              padding: "0 12px",
              borderRadius: 10,
              border: "1.5px solid #E3EAF5",
              fontSize: ".85rem",
              color: "#22375C",
              background: "#fff",
            }}
          />
          <button
            type="button"
            onClick={() => setIncluirInactivos((v) => !v)}
            style={{
              minHeight: 42,
              padding: "0 14px",
              borderRadius: 10,
              border: "1.5px solid #E3EAF5",
              background: incluirInactivos ? "#fff" : "#3D5D91",
              color: incluirInactivos ? "#3D5D91" : "#fff",
              fontSize: ".82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {incluirInactivos ? "Ver solo activos" : "Incluir en reposo"}
          </button>
        </div>

        {filtradas.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>
            Nadie conectado en este momento. En cuanto alguien entre a la plataforma aparecerá aquí.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {filtradas.map((p) => (
              <div
                key={p.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(61,93,145,.07)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    flexShrink: 0,
                    background: p.inactivo ? "#E3EAF5" : "rgba(46,204,113,.15)",
                    color: p.inactivo ? "#647DA0" : "#1e8449",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: ".9rem",
                  }}
                >
                  {(p.nombre || p.email || "?").charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#22375C" }}>{p.nombre}</span>
                    <Badge text={p.plan === "paga" ? "Pro" : "Básica"} color={p.plan === "paga" ? "#6C0820" : "#8DA1BE"} />
                    {p.role === "admin" && <Badge text="Admin" color="#3D5D91" />}
                    {p.pestanas > 1 && <Badge text={`${p.pestanas} pestañas`} color="#8DA1BE" />}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#8DA1BE", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.email}
                  </div>
                </div>

                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#22375C" }}>{p.pantalla}</div>
                  <div style={{ fontSize: ".72rem", color: "#647DA0" }}>
                    {p.actividad ? p.actividad : p.ruta}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Badge
                    text={p.inactivo ? "En reposo" : "Activa ahora"}
                    color={p.inactivo ? "#f39c12" : "#2ecc71"}
                  />
                  <div style={{ fontSize: ".7rem", color: "#8DA1BE", marginTop: 4 }}>
                    conectada {duracion(p.desde, ahora)}
                  </div>
                </div>

                <Link
                  to="/admin/perfil"
                  search={{ id: p.userId }}
                  style={{ fontSize: ".76rem", fontWeight: 700, color: "#3D5D91", textDecoration: "none", flexShrink: 0 }}
                >
                  Abrir perfil →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
