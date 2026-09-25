/**
 * Panel Admin — Notificaciones.
 *
 * La admin escribe una "transmisión de radio" para todas las alumnas o para
 * las que elija, decide cuánto tiempo aparece y ve en vivo cómo le llegará.
 * Abajo, lo enviado: quién ya lo recibió, terminarlo antes o usarlo de nuevo.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  cardHeadStyle,
  cardStyle,
  cancelBtnStyle,
  confirmBtnStyle,
  Flash,
  inputStyle,
  labelStyle,
  Modal,
  modalSubStyle,
  modalTitleStyle,
  secondaryBtnStyle,
  timeAgo,
  useFlash,
} from "@/components/admin/AdminShell";
import { RadioTransmission } from "@/components/notificaciones/RadioTransmission";
import { Chip, DuracionPicker, Punto } from "@/components/notificaciones/controles";
import {
  fechaCorta,
  finDeVigencia,
  KIND_COLOR,
  KIND_LABEL,
  TIPOS,
  type DuracionId,
} from "@/components/notificaciones/opciones";
import {
  eliminarNotificacion,
  enviarNotificacion,
  estadoNotificacion,
  getNotiLecturas,
  getNotificaciones,
  getUsers,
  NOTIFICACIONES_NO_DISPONIBLES,
  notificacionesDisponibles,
  refreshNotificaciones,
  terminarNotificacion,
  useStore,
  type Notificacion,
  type NotiKind,
  type User,
} from "@/lib/store";

export const Route = createFileRoute("/admin/notificaciones")({
  component: AdminNotificacionesPage,
});

type Tipo = Exclude<NotiKind, "reporte">;

const MAX_TITULO = 80;
const MAX_MENSAJE = 600;

const PLANTILLAS: { label: string; tipo: Tipo; titulo: string; mensaje: string }[] = [
  {
    label: "Contenido nuevo",
    tipo: "aviso",
    titulo: "Nuevo contenido en FlightPath",
    mensaje: "Acabamos de agregar material nuevo para tu preparación. Entra y échale un vistazo.",
  },
  {
    label: "Recordatorio",
    tipo: "aviso",
    titulo: "Recordatorio",
    mensaje: "Te recordamos que ",
  },
  {
    label: "Mantenimiento",
    tipo: "importante",
    titulo: "Mantenimiento programado",
    mensaje:
      "La plataforma estará en mantenimiento unos minutos. Guarda tu avance antes; al volver todo seguirá donde lo dejaste.",
  },
  {
    label: "Felicitar",
    tipo: "logro",
    titulo: "¡Felicidades!",
    mensaje:
      "Vas increíble. Tu constancia se nota: sigue así, cada sesión te acerca a tu despegue.",
  },
];

/** Sin acentos ni mayúsculas, para buscar alumnas. */
function plano(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function nombreDe(u: User | undefined): string {
  return u?.nombre?.trim() || u?.email || "Alumna sin perfil";
}

function listaNombres(ids: string[], porId: Map<string, User>, max = 2): string {
  const nombres = ids.map((id) => nombreDe(porId.get(id)));
  if (nombres.length <= max) return nombres.join(" y ");
  return `${nombres.slice(0, max).join(", ")} y ${nombres.length - max} más`;
}

function AdminNotificacionesPage() {
  const { flash, showFlash } = useFlash();
  const usuarios = useStore(getUsers);
  const alumnas = useMemo(
    () =>
      usuarios
        .filter((u) => u.role !== "admin")
        .sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), "es")),
    [usuarios],
  );
  const porId = useMemo(() => new Map(usuarios.map((u) => [u.id, u])), [usuarios]);
  const lista = useStore(getNotificaciones);
  const disponible = useStore(notificacionesDisponibles);

  // No esperar al siguiente refresco en vivo (20 s) para ver lo enviado.
  useEffect(() => {
    void refreshNotificaciones();
  }, []);

  /* ── Composición ── */
  const [para, setPara] = useState<"all" | "users">("all");
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<Tipo>("aviso");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [duracion, setDuracion] = useState<DuracionId>("1s");
  const [fecha, setFecha] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const composerRef = useRef<HTMLDivElement>(null);

  const fin = finDeVigencia(duracion, fecha);
  const destinatarias = para === "all" ? alumnas.length : elegidas.length;
  const faltantes = [
    !mensaje.trim() && "escribir el mensaje",
    para === "users" && elegidas.length === 0 && "elegir al menos una alumna",
    !fin && "elegir una fecha futura",
  ].filter(Boolean) as string[];
  const listo = faltantes.length === 0 && disponible !== false;

  const resultados = useMemo(() => {
    const q = plano(busqueda.trim());
    const hits = q ? alumnas.filter((u) => plano(`${u.nombre} ${u.email}`).includes(q)) : alumnas;
    return hits.slice(0, 60);
  }, [alumnas, busqueda]);

  const alternar = (id: string) =>
    setElegidas((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const usarPlantilla = (p: (typeof PLANTILLAS)[number]) => {
    if (
      (titulo.trim() || mensaje.trim()) &&
      !window.confirm("¿Reemplazar lo que llevas escrito con la plantilla?")
    )
      return;
    setTipo(p.tipo);
    setTitulo(p.titulo);
    setMensaje(p.mensaje);
    setPreviewKey((k) => k + 1);
  };

  const reusar = (n: Notificacion) => {
    setPara(n.audience);
    setElegidas(n.recipients.filter((id) => porId.has(id)));
    if (n.kind !== "reporte") setTipo(n.kind);
    setTitulo(n.title);
    setMensaje(n.body);
    setPreviewKey((k) => k + 1);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const enviar = async () => {
    if (!fin) return;
    setEnviando(true);
    const res = await enviarNotificacion({
      audience: para,
      recipients: para === "all" ? [] : elegidas,
      kind: tipo,
      title: titulo,
      body: mensaje,
      endsAt: fin,
    });
    setEnviando(false);
    setConfirmar(false);
    if (!res.ok) {
      showFlash(res.error, true);
      return;
    }
    showFlash(
      para === "all"
        ? `Transmisión enviada a todas las alumnas`
        : `Transmisión enviada a ${destinatarias === 1 ? "1 alumna" : `${destinatarias} alumnas`}`,
    );
    setTitulo("");
    setMensaje("");
    setElegidas([]);
    setBusqueda("");
    setPara("all");
    setDuracion("1s");
    setFecha("");
  };

  const previewDestino =
    para === "all"
      ? "Todas las alumnas"
      : elegidas.length === 1
        ? nombreDe(porId.get(elegidas[0])).split(/\s+/)[0]
        : elegidas.length > 1
          ? `${elegidas.length} alumnas`
          : "Tu alumna";

  /* ── Lista ── */
  const [filtro, setFiltro] = useState<"activa" | "terminada" | "todas">("activa");
  const [accion, setAccion] = useState<{ tipo: "terminar" | "eliminar"; n: Notificacion } | null>(
    null,
  );
  const [trabajando, setTrabajando] = useState(false);
  const conteo = {
    activa: lista.filter((n) => estadoNotificacion(n) === "activa").length,
    terminada: lista.filter((n) => estadoNotificacion(n) === "terminada").length,
  };
  const visibles = lista.filter((n) => filtro === "todas" || estadoNotificacion(n) === filtro);

  const ejecutar = async () => {
    if (!accion) return;
    setTrabajando(true);
    const ok =
      accion.tipo === "terminar"
        ? await terminarNotificacion(accion.n.id)
        : await eliminarNotificacion(accion.n.id);
    setTrabajando(false);
    setAccion(null);
    showFlash(
      ok
        ? accion.tipo === "terminar"
          ? "La transmisión dejó de mostrarse"
          : "Transmisión eliminada"
        : "No se pudo completar. Revisa tu conexión e inténtalo de nuevo.",
      !ok,
    );
  };

  return (
    <AdminShell title="Notificaciones" active="notificaciones" maxWidth={1180}>
      <Flash flash={flash} />

      {disponible === false && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            marginBottom: 16,
            borderColor: "rgba(240,160,140,.5)",
            background: "rgba(240,160,140,.08)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: "#F0A08C", marginTop: 2 }}>
            <Icon n="alert" size={18} />
          </span>
          <div style={{ fontSize: ".84rem", lineHeight: 1.55, color: "#F6D2C8" }}>
            <strong style={{ color: "#FFFFFF" }}>Falta activar las notificaciones.</strong>{" "}
            {NOTIFICACIONES_NO_DISPONIBLES} En cuanto se aplique, este módulo funciona sin más
            cambios.
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        {/* ── Composición ── */}
        <div
          ref={composerRef}
          style={{ ...cardStyle, padding: "6px 20px 20px", scrollMarginTop: 76 }}
        >
          <Paso n={1} titulo="¿A quién le llega?">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
              <OpcionGrande
                activo={para === "all"}
                icon="users"
                titulo="Todas las alumnas"
                detalle={`${alumnas.length} ${alumnas.length === 1 ? "alumna" : "alumnas"}`}
                onClick={() => setPara("all")}
              />
              <OpcionGrande
                activo={para === "users"}
                icon="user"
                titulo="Alumnas específicas"
                detalle={
                  elegidas.length > 0
                    ? `${elegidas.length} ${elegidas.length === 1 ? "elegida" : "elegidas"}`
                    : "Elige una o varias"
                }
                onClick={() => setPara("users")}
              />
            </div>

            {para === "users" && (
              <div style={{ marginTop: 12 }}>
                {elegidas.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {elegidas.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => alternar(id)}
                        aria-label={`Quitar a ${nombreDe(porId.get(id))}`}
                        style={chipQuitarStyle}
                      >
                        {nombreDe(porId.get(id))} <Icon n="close" size={12} />
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#93A4BF",
                    }}
                  >
                    <Icon n="search" size={15} />
                  </span>
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Busca por nombre o correo…"
                    aria-label="Buscar alumnas"
                    style={{ ...inputStyle, paddingLeft: 34 }}
                  />
                </div>
                <div
                  role="group"
                  aria-label="Alumnas"
                  style={{
                    marginTop: 8,
                    maxHeight: 250,
                    overflowY: "auto",
                    border: "1px solid rgba(199,160,82,.16)",
                    borderRadius: 8,
                  }}
                >
                  {resultados.length === 0 && (
                    <p style={{ margin: 0, padding: 14, fontSize: ".8rem", color: "#93A4BF" }}>
                      Ninguna alumna coincide con “{busqueda.trim()}”.
                    </p>
                  )}
                  {resultados.map((u) => {
                    const sel = elegidas.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(255,255,255,.04)",
                          background: sel ? "rgba(199,160,82,.1)" : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => alternar(u.id)}
                          style={{ accentColor: "#C7A052", width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: ".84rem",
                              fontWeight: 700,
                              color: "#FFFFFF",
                            }}
                          >
                            {nombreDe(u)}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: ".72rem",
                              color: "#93A4BF",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u.email}
                          </span>
                        </span>
                        {u.plan === "paga" && <Badge text="Pro" color="#C7A052" />}
                      </label>
                    );
                  })}
                </div>
                {resultados.length === 60 && (
                  <p style={{ margin: "6px 0 0", fontSize: ".72rem", color: "#93A4BF" }}>
                    Se muestran 60. Escribe un nombre para encontrar a las demás.
                  </p>
                )}
              </div>
            )}
          </Paso>

          <Paso n={2} titulo="¿Qué tipo de mensaje es?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TIPOS.map((t) => (
                <Chip
                  key={t.id}
                  activo={tipo === t.id}
                  color={t.color}
                  onClick={() => setTipo(t.id)}
                >
                  <Punto color={t.color} /> {t.label}
                </Chip>
              ))}
            </div>
            <p style={ayudaStyle}>{TIPOS.find((t) => t.id === tipo)?.ayuda}</p>
          </Paso>

          <Paso n={3} titulo="Escribe el mensaje">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: ".74rem", color: "#93A4BF", marginRight: 2 }}>
                Empieza con una plantilla:
              </span>
              {PLANTILLAS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => usarPlantilla(p)}
                  style={plantillaStyle}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label style={labelStyle} htmlFor="noti-titulo">
              Título <span style={{ color: "#93A4BF", fontWeight: 500 }}>(opcional)</span>
            </label>
            <input
              id="noti-titulo"
              value={titulo}
              maxLength={MAX_TITULO}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Nuevo simulador disponible"
              style={inputStyle}
            />
            <label style={{ ...labelStyle, marginTop: 12 }} htmlFor="noti-mensaje">
              Mensaje
            </label>
            <textarea
              id="noti-mensaje"
              value={mensaje}
              maxLength={MAX_MENSAJE}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              placeholder="Lo que quieres que lean. Corto y claro funciona mejor."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
            />
            <div style={{ textAlign: "right", fontSize: ".7rem", color: "#93A4BF", marginTop: 4 }}>
              {mensaje.length}/{MAX_MENSAJE}
            </div>
          </Paso>

          <Paso n={4} titulo="¿Cuánto tiempo aparece?">
            <DuracionPicker
              valor={duracion}
              fecha={fecha}
              onValor={setDuracion}
              onFecha={setFecha}
            />
            <p style={ayudaStyle}>
              {fin ? (
                <>
                  Le aparece a cada alumna al entrar, hasta el{" "}
                  <strong style={{ color: "#fff" }}>{fechaCorta(fin)}</strong>. Sale una sola vez:
                  al tocar «Recibido» ya no le vuelve a aparecer.
                </>
              ) : (
                "Elige el día y la hora en que deja de aparecer."
              )}
            </p>
          </Paso>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid rgba(199,160,82,.14)",
            }}
          >
            <p
              style={{
                margin: 0,
                flex: "1 1 220px",
                fontSize: ".8rem",
                color: "#B8C5DA",
                lineHeight: 1.5,
              }}
            >
              {faltantes.length > 0 ? (
                <>Para enviar falta {faltantes.join(" y ")}.</>
              ) : (
                <>
                  Se envía a{" "}
                  <strong style={{ color: "#fff" }}>
                    {para === "all"
                      ? `todas las alumnas (${destinatarias})`
                      : destinatarias === 1
                        ? nombreDe(porId.get(elegidas[0]))
                        : `${destinatarias} alumnas`}
                  </strong>
                  .
                </>
              )}
            </p>
            <button
              type="button"
              disabled={!listo}
              onClick={() => setConfirmar(true)}
              style={{
                ...enviarStyle,
                opacity: listo ? 1 : 0.5,
                cursor: listo ? "pointer" : "not-allowed",
              }}
            >
              <Icon n="radio" size={17} /> Enviar transmisión
            </button>
          </div>
        </div>

        {/* ── Vista previa ── */}
        <aside className="lg:sticky lg:top-[76px]" style={{ ...cardStyle, padding: 16 }}>
          <div style={{ ...cardHeadStyle, marginBottom: 12 }}>
            <Icon n="eye" size={14} /> Así le llega a tu alumna
          </div>
          <RadioTransmission
            key={previewKey}
            modo="preview"
            noti={{
              kind: tipo,
              title: titulo.trim(),
              body: mensaje.trim() || "Escribe tu mensaje y aquí verás cómo le llega.",
              data: {},
              createdAt: new Date().toISOString(),
            }}
            destinatario={previewDestino}
            onRecibido={() => setPreviewKey((k) => k + 1)}
          />
          <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            style={{ ...secondaryBtnStyle, marginTop: 12, width: "100%", justifyContent: "center" }}
          >
            <Icon n="refresh" size={14} /> Repetir la animación
          </button>
        </aside>
      </div>

      {/* ── Enviadas ── */}
      <section style={{ marginTop: 28 }} aria-labelledby="noti-enviadas">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <h2
            id="noti-enviadas"
            style={{
              margin: 0,
              marginRight: "auto",
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: "1.5rem",
              color: "#FFFFFF",
            }}
          >
            Transmisiones enviadas
          </h2>
          <Chip activo={filtro === "activa"} onClick={() => setFiltro("activa")}>
            Activas · {conteo.activa}
          </Chip>
          <Chip activo={filtro === "terminada"} onClick={() => setFiltro("terminada")}>
            Terminadas · {conteo.terminada}
          </Chip>
          <Chip activo={filtro === "todas"} onClick={() => setFiltro("todas")}>
            Todas · {lista.length}
          </Chip>
        </div>

        {visibles.length === 0 && (
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              color: "#93A4BF",
              fontSize: ".84rem",
              padding: 24,
            }}
          >
            {disponible === null && lista.length === 0
              ? "Cargando transmisiones…"
              : filtro === "activa"
                ? "No hay transmisiones activas. Escribe una arriba y aparecerá aquí."
                : filtro === "terminada"
                  ? "Todavía no termina ninguna transmisión."
                  : "Aún no has enviado transmisiones."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visibles.map((n) => (
            <FilaTransmision
              key={n.id}
              n={n}
              alumnas={alumnas}
              porId={porId}
              onReusar={() => reusar(n)}
              onTerminar={() => setAccion({ tipo: "terminar", n })}
              onEliminar={() => setAccion({ tipo: "eliminar", n })}
            />
          ))}
        </div>
      </section>

      {/* ── Confirmaciones ── */}
      <Modal open={confirmar} onClose={() => !enviando && setConfirmar(false)} maxWidth={460}>
        <h3 style={modalTitleStyle}>
          <Icon n="radio" size={20} /> ¿Enviar esta transmisión?
        </h3>
        <p style={modalSubStyle}>
          Revisa que todo esté bien: una vez enviada, les aparece al entrar.
        </p>
        <dl style={{ margin: "0 0 18px", display: "grid", gap: 10, fontSize: ".84rem" }}>
          <Dato etiqueta="Para">
            {para === "all"
              ? `Todas las alumnas (${destinatarias})`
              : listaNombres(elegidas, porId, 3)}
          </Dato>
          <Dato etiqueta="Tipo">{KIND_LABEL[tipo]}</Dato>
          <Dato etiqueta="Aparece hasta">{fin ? fechaCorta(fin) : "—"}</Dato>
          <Dato etiqueta="Mensaje">
            <span style={{ whiteSpace: "pre-wrap" }}>
              {titulo.trim() && (
                <strong style={{ display: "block", color: "#fff" }}>{titulo.trim()}</strong>
              )}
              {mensaje.trim()}
            </span>
          </Dato>
        </dl>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            style={cancelBtnStyle}
            disabled={enviando}
            onClick={() => setConfirmar(false)}
          >
            Revisar
          </button>
          <button
            type="button"
            style={{ ...confirmBtnStyle, opacity: enviando ? 0.7 : 1 }}
            disabled={enviando}
            onClick={() => void enviar()}
          >
            {enviando ? "Enviando…" : "Enviar ahora"}
          </button>
        </div>
      </Modal>

      <Modal open={!!accion} onClose={() => !trabajando && setAccion(null)} maxWidth={420}>
        {accion && (
          <>
            <h3 style={modalTitleStyle}>
              {accion.tipo === "terminar"
                ? "¿Terminar la transmisión?"
                : "¿Eliminar la transmisión?"}
            </h3>
            <p style={modalSubStyle}>
              {accion.tipo === "terminar"
                ? "Deja de aparecerles desde ahora a las alumnas que aún no la reciben. Queda en la lista como terminada."
                : "Deja de aparecer y se borra de la lista junto con sus confirmaciones de recibido. No se puede deshacer."}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                style={cancelBtnStyle}
                disabled={trabajando}
                onClick={() => setAccion(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  ...confirmBtnStyle,
                  ...(accion.tipo === "eliminar" ? { background: "#E07A62", color: "#fff" } : {}),
                  opacity: trabajando ? 0.7 : 1,
                }}
                disabled={trabajando}
                onClick={() => void ejecutar()}
              >
                {trabajando
                  ? "Un momento…"
                  : accion.tipo === "terminar"
                    ? "Terminar ahora"
                    : "Eliminar"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </AdminShell>
  );
}

/* ───────────────────────── Piezas ───────────────────────── */

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <div
      style={{ padding: "16px 0", borderTop: n > 1 ? "1px solid rgba(199,160,82,.14)" : "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(199,160,82,.16)",
            color: "#E3C98A",
            fontSize: ".74rem",
            fontWeight: 800,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <h2 style={{ margin: 0, fontSize: ".95rem", fontWeight: 800, color: "#FFFFFF" }}>
          {titulo}
        </h2>
      </div>
      {children}
    </div>
  );
}

function OpcionGrande({
  activo,
  icon,
  titulo,
  detalle,
  onClick,
}: {
  activo: boolean;
  icon: FPIconName;
  titulo: string;
  detalle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: `1.5px solid ${activo ? "#C7A052" : "rgba(199,160,82,.22)"}`,
        background: activo ? "rgba(199,160,82,.13)" : "rgba(255,255,255,.02)",
        color: "#FFFFFF",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "'Manrope', sans-serif",
        transition: "all .15s",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: activo ? "#C7A052" : "rgba(199,160,82,.14)",
          color: activo ? "#081A35" : "#E3C98A",
          flexShrink: 0,
        }}
      >
        <Icon n={icon} size={18} />
      </span>
      <span>
        <span style={{ display: "block", fontSize: ".88rem", fontWeight: 800 }}>{titulo}</span>
        <span style={{ display: "block", fontSize: ".74rem", color: "#B8C5DA", marginTop: 2 }}>
          {detalle}
        </span>
      </span>
    </button>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10 }}>
      <dt style={{ color: "#93A4BF", fontWeight: 700 }}>{etiqueta}</dt>
      <dd
        style={{
          margin: 0,
          color: "#DCE4F0",
          lineHeight: 1.5,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </dd>
    </div>
  );
}

function FilaTransmision({
  n,
  alumnas,
  porId,
  onReusar,
  onTerminar,
  onEliminar,
}: {
  n: Notificacion;
  alumnas: User[];
  porId: Map<string, User>;
  onReusar: () => void;
  onTerminar: () => void;
  onEliminar: () => void;
}) {
  const lecturas = useStore(() => getNotiLecturas(n.id));
  const [verQuien, setVerQuien] = useState(false);
  const estado = estadoNotificacion(n);
  const color = KIND_COLOR[n.kind];

  const destinatarias = n.audience === "all" ? alumnas.map((u) => u.id) : n.recipients;
  const recibio = new Map(lecturas.map((l) => [l.userId, l.readAt]));
  const recibidas = destinatarias.filter((id) => recibio.has(id));
  const pendientes = destinatarias.filter((id) => !recibio.has(id));
  const total = destinatarias.length;
  const pct = total > 0 ? Math.round((recibidas.length / total) * 100) : 0;

  return (
    <article
      style={{
        ...cardStyle,
        borderLeft: `3px solid ${color}`,
        opacity: estado === "terminada" ? 0.82 : 1,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <Badge text={KIND_LABEL[n.kind]} color={color} />
            <Badge
              text={estado === "activa" ? "Activa" : "Terminada"}
              color={estado === "activa" ? "#7FD6A4" : "#93A4BF"}
            />
          </div>
          <h3 style={{ margin: 0, fontSize: ".95rem", fontWeight: 800, color: "#FFFFFF" }}>
            {n.title || n.body.split("\n")[0].slice(0, 80)}
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: ".82rem",
              color: "#B8C5DA",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {n.body}
          </p>
          {n.kind === "reporte" && n.data.pregunta && (
            <p style={{ margin: "6px 0 0", fontSize: ".74rem", color: "#93A4BF" }}>
              Sobre la pregunta: “{n.data.pregunta.slice(0, 120)}
              {n.data.pregunta.length > 120 ? "…" : ""}”
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {n.kind !== "reporte" && (
            <button type="button" onClick={onReusar} style={accionStyle}>
              <Icon n="refresh" size={13} /> Usar de nuevo
            </button>
          )}
          {estado === "activa" && (
            <button type="button" onClick={onTerminar} style={accionStyle}>
              <Icon n="pause" size={13} /> Terminar ahora
            </button>
          )}
          <button
            type="button"
            onClick={onEliminar}
            aria-label="Eliminar transmisión"
            title="Eliminar"
            style={{ ...accionStyle, color: "#F0A08C" }}
          >
            <Icon n="trash" size={13} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 16px",
          marginTop: 12,
          fontSize: ".74rem",
          color: "#93A4BF",
        }}
      >
        <span>
          <strong style={{ color: "#DCE4F0" }}>Para:</strong>{" "}
          {n.audience === "all" ? "Todas las alumnas" : listaNombres(n.recipients, porId)}
        </span>
        <span>
          <strong style={{ color: "#DCE4F0" }}>Enviada:</strong> {timeAgo(n.createdAt)} ·{" "}
          {fechaCorta(n.createdAt)}
        </span>
        <span>
          <strong style={{ color: "#DCE4F0" }}>
            {estado === "activa" ? "Aparece hasta:" : "Terminó:"}
          </strong>{" "}
          {n.endsAt ? fechaCorta(n.endsAt) : "Sin fecha de fin"}
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            role="progressbar"
            aria-label="Alumnas que ya la recibieron"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={recibidas.length}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }}
            />
          </div>
          <span style={{ fontSize: ".76rem", color: "#DCE4F0", whiteSpace: "nowrap" }}>
            Recibida por <strong>{recibidas.length}</strong> de {total}
          </span>
          {total > 0 && (
            <button
              type="button"
              aria-expanded={verQuien}
              onClick={() => setVerQuien((v) => !v)}
              style={{ ...accionStyle, padding: "4px 10px" }}
            >
              {verQuien ? "Ocultar" : "Ver quién"}
            </button>
          )}
        </div>
        {verQuien && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginTop: 10,
              fontSize: ".78rem",
            }}
          >
            <ListaNombres
              titulo={`Ya la recibieron (${recibidas.length})`}
              vacia="Nadie todavía."
              items={recibidas.map((id) => ({
                id,
                nombre: nombreDe(porId.get(id)),
                extra: fechaCorta(recibio.get(id) ?? ""),
              }))}
              color="#7FD6A4"
            />
            <ListaNombres
              titulo={`${estado === "activa" ? "Aún no la ven" : "No la vieron"} (${pendientes.length})`}
              vacia="Todas la recibieron."
              items={pendientes.map((id) => ({ id, nombre: nombreDe(porId.get(id)) }))}
              color="#93A4BF"
            />
          </div>
        )}
      </div>
    </article>
  );
}

function ListaNombres({
  titulo,
  vacia,
  items,
  color,
}: {
  titulo: string;
  vacia: string;
  items: { id: string; nombre: string; extra?: string }[];
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(199,160,82,.14)",
        borderRadius: 8,
        padding: "10px 12px",
        maxHeight: 200,
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: 800, color, marginBottom: 6 }}>{titulo}</div>
      {items.length === 0 ? (
        <div style={{ color: "#93A4BF" }}>{vacia}</div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
          {items.map((it) => (
            <li
              key={it.id}
              style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#DCE4F0" }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.nombre}
              </span>
              {it.extra && (
                <span style={{ color: "#93A4BF", whiteSpace: "nowrap" }}>{it.extra}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────── Estilos ───────────────────────── */

const ayudaStyle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: ".78rem",
  color: "#93A4BF",
  lineHeight: 1.55,
};

const plantillaStyle: CSSProperties = {
  padding: "5px 11px",
  borderRadius: 999,
  border: "1px dashed rgba(199,160,82,.4)",
  background: "transparent",
  color: "#E3C98A",
  fontSize: ".74rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
};

const chipQuitarStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  borderRadius: 999,
  border: "1px solid rgba(199,160,82,.45)",
  background: "rgba(199,160,82,.14)",
  color: "#FFFFFF",
  fontSize: ".76rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
};

const enviarStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 46,
  padding: "0 22px",
  border: "none",
  borderRadius: 8,
  background: "linear-gradient(180deg,#E3C98A,#C7A052)",
  color: "#081A35",
  fontSize: ".9rem",
  fontWeight: 800,
  fontFamily: "'Manrope', sans-serif",
  boxShadow: "0 12px 26px -14px #C7A052",
};

const accionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 11px",
  borderRadius: 7,
  border: "1px solid rgba(199,160,82,.28)",
  background: "#0A1B33",
  color: "#B8C5DA",
  fontSize: ".74rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
};
