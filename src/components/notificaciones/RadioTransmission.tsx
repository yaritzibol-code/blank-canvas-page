/**
 * Transmisión de radio: el pop-up con el que llega una notificación del equipo
 * FlightPath. La alumna la ve en la cabina (RadioWatcher) y la admin, tal cual,
 * como vista previa mientras la escribe.
 */
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import type { Notificacion } from "@/lib/store";
import { tonoDeNotificacion } from "./opciones";
import "./radio.css";

export type RadioNoti = Pick<Notificacion, "kind" | "title" | "body" | "data" | "createdAt">;
type Fase = "sintonizando" | "hablando" | "fin";

/** Hora "zulú" de la transmisión, como en la frecuencia (14:32Z). */
function horaZulu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}Z`;
}

function prefiereMenosMovimiento(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Barras del osciloscopio con alturas y ritmos "orgánicos" (fijos por render). */
const BARRAS = Array.from({ length: 30 }, (_, i) => {
  const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  return {
    amp: (0.35 + r * 0.65).toFixed(2),
    dur: `${(0.45 + ((i * 7) % 5) * 0.08).toFixed(2)}s`,
    delay: `${(-r * 0.6).toFixed(2)}s`,
  };
});

export function RadioTransmission({
  noti,
  destinatario,
  posicion,
  onRecibido,
  modo = "popup",
}: {
  noti: RadioNoti;
  /** Nombre de pila de la alumna (o "Todas las alumnas" en la vista previa). */
  destinatario: string;
  posicion?: { actual: number; total: number };
  onRecibido: () => void;
  /** "preview": en línea, sin fondo ni diálogo (panel admin). */
  modo?: "popup" | "preview";
}) {
  const reducido = useMemo(prefiereMenosMovimiento, []);
  const [fase, setFase] = useState<Fase>(reducido ? "fin" : "sintonizando");
  const [escritos, setEscritos] = useState(reducido ? noti.body.length : 0);
  const [saliendo, setSaliendo] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const recibidoRef = useRef(onRecibido);
  recibidoRef.current = onRecibido;
  const tituloId = useId();
  const cuerpoId = useId();

  const { tono, etiqueta } = tonoDeNotificacion(noti);
  const de =
    noti.data.remitente?.trim() ||
    (noti.kind === "reporte" ? "Soporte FlightPath" : "Torre FlightPath");

  // Sintoniza (estática) y luego "habla": el texto sale como teletipo.
  useEffect(() => {
    if (reducido) return;
    const t = setTimeout(() => setFase("hablando"), 650);
    return () => clearTimeout(t);
  }, [reducido]);

  useEffect(() => {
    if (fase !== "hablando") return;
    const total = noti.body.length;
    const duracion = Math.min(3200, Math.max(900, total * 26));
    const inicio = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(total, Math.floor(((t - inicio) / duracion) * total));
      setEscritos(k);
      if (k < total) raf = requestAnimationFrame(paso);
      else setFase("fin");
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [fase, noti.body]);

  // Como diálogo nativo: fondo inerte, foco dentro y Esc = "Recibido".
  useEffect(() => {
    if (modo !== "popup") return;
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    botonRef.current?.focus({ preventScroll: true });
    return () => {
      if (d?.open) d.close();
    };
  }, [modo]);

  const mostrarTodo = () => {
    setEscritos(noti.body.length);
    setFase("fin");
  };

  const recibir = () => {
    if (saliendo) return;
    if (reducido) {
      recibidoRef.current();
      return;
    }
    setSaliendo(true);
    setTimeout(() => recibidoRef.current(), 260);
  };

  const tarjeta = (
    <article
      className={`fd-radio fd-radio--${tono} is-${fase}${saliendo ? " is-leaving" : ""}`}
      aria-labelledby={tituloId}
      aria-describedby={cuerpoId}
    >
      <div className="fd-radio-static" aria-hidden="true" />
      <header className="fd-radio-head">
        <span className="fd-radio-led" aria-hidden="true" />
        <span className="fd-radio-status">
          {fase === "sintonizando"
            ? "Sintonizando…"
            : fase === "hablando"
              ? "Transmisión entrante"
              : "Fin de transmisión"}
        </span>
        <span className="fd-radio-freq" aria-hidden="true">
          Freq 118.70
        </span>
      </header>

      <div className="fd-radio-scope" aria-hidden="true">
        {BARRAS.map((b, i) => (
          <i
            key={i}
            style={
              {
                "--amp": b.amp,
                animationDuration: b.dur,
                animationDelay: b.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="fd-radio-from">
        <div className="fd-radio-pathy" aria-hidden="true">
          <span className="fd-radio-ring" />
          <span className="fd-radio-ring" />
          <img src="/img/pathy-cloud.png" alt="" draggable={false} />
        </div>
        <div className="fd-radio-id">
          <p className="fd-radio-callsign" id={noti.title ? undefined : tituloId}>
            <span>{de}</span>
            <Icon n="arrow" size={13} />
            <span>{destinatario}</span>
          </p>
          <p className="fd-radio-meta">
            <span className="fd-radio-tag">{etiqueta}</span>
            <span>{horaZulu(noti.createdAt)}</span>
          </p>
        </div>
      </div>

      {noti.kind === "reporte" && (noti.data.pregunta || noti.data.reporteTipo) && (
        <div className="fd-radio-context">
          Sobre tu reporte
          {noti.data.reporteTipo ? (
            <>
              {" "}
              <strong>«{noti.data.reporteTipo}»</strong>
            </>
          ) : null}
          {noti.data.pregunta ? <q>{noti.data.pregunta}</q> : null}
        </div>
      )}

      {noti.title && (
        <h2 className="fd-radio-title" id={tituloId}>
          {noti.title}
        </h2>
      )}

      <p className="fd-radio-body">
        <span className="sr-only" id={cuerpoId}>
          {noti.body}
        </span>
        <span className="fd-radio-ghost" aria-hidden="true">
          {noti.body}
        </span>
        <span className="fd-radio-typed" aria-hidden="true">
          {/* Terminada, se ve completa aunque el texto cambie (vista previa). */}
          {fase === "fin" ? noti.body : noti.body.slice(0, escritos)}
          {fase !== "fin" && <span className="fd-radio-caret" />}
        </span>
      </p>

      <footer className="fd-radio-foot">
        {posicion && posicion.total > 1 && (
          <span className="fd-radio-count">
            Mensaje {posicion.actual} de {posicion.total}
          </span>
        )}
        {fase !== "fin" && (
          <button type="button" className="fd-radio-skip" onClick={mostrarTodo}>
            Mostrar todo
          </button>
        )}
        <button type="button" ref={botonRef} className="fd-radio-roger" onClick={recibir}>
          <Icon n="check" size={16} /> Recibido
        </button>
      </footer>
    </article>
  );

  if (modo === "preview") return tarjeta;
  return (
    <dialog
      ref={dialogRef}
      className="fd-radio-dialog"
      aria-labelledby={tituloId}
      aria-describedby={cuerpoId}
      onCancel={(e) => {
        e.preventDefault();
        recibir();
      }}
    >
      {tarjeta}
    </dialog>
  );
}
