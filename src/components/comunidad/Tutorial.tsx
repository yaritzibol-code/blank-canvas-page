/**
 * Tutorial interactivo de Comunidad.
 *
 * No es un popup: es un recorrido por la interfaz real. Cada paso oscurece la
 * pantalla y deja un "foco" sobre el elemento del que habla (el HUD, los
 * rankings, el periodo, el podio, tu zona privada). Los rankings siguen vivos
 * debajo; en los pasos marcados como interactivos se puede tocar el elemento
 * enfocado. Al final pregunta cómo quiere aparecer la persona: con su nombre y
 * foto, o anónima con su indicativo. Termina con una celebración discreta.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/fp-icon";
import { Confetti } from "@/components/shared/Confetti";
import { getFpRulesPublic } from "@/lib/fp/fp.functions";
import { FP_TOP_N, fpFormat, type FpReglaPublica } from "@/lib/fp/shared";
import { partesCallsign } from "@/lib/fp/callsign";
import { Avatar, Callsign, Insignia, iniciales, reducedMotion } from "./pieces";

type Privacidad = "nombre" | "folio";

export interface TutorialYo {
  nombre: string;
  avatarUrl: string | null;
  callsign: string;
  privacidad: Privacidad;
  privacidadElegida: boolean;
  tutorialVisto: boolean;
}

interface Paso {
  id: string;
  /** Selector del elemento que se enfoca; sin selector el paso va centrado. */
  target?: string;
  titulo: string;
  cuerpo: ReactNode;
  /** Si el elemento enfocado se puede usar durante el paso. */
  interactivo?: boolean;
  tipo?: "inicio" | "reglas" | "privacidad" | "final";
}

const PAD = 10;

/* ───────────────────────── Medición del foco ───────────────────────── */

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useFoco(selector: string | undefined, paso: number): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    const medir = () => {
      const b = el.getBoundingClientRect();
      setRect({
        top: b.top - PAD,
        left: b.left - PAD,
        width: b.width + PAD * 2,
        height: b.height + PAD * 2,
      });
    };
    // Mientras dura el desplazamiento suave el rectángulo cambia: se sigue con rAF.
    let raf = 0;
    const t0 = performance.now();
    const seguir = () => {
      medir();
      if (performance.now() - t0 < 1000) raf = requestAnimationFrame(seguir);
    };
    raf = requestAnimationFrame(seguir);
    window.addEventListener("scroll", medir, true);
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", medir, true);
      window.removeEventListener("resize", medir);
    };
  }, [selector, paso]);
  return rect;
}

/* ───────────────────────── Tablero de salidas (split-flap) ───────────────────────── */

const FLAP_LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FLAP_DIGITOS = "0123456789";
/** Las letras giran entre letras y los dígitos entre dígitos, como un panel real. */
const flapChar = (objetivo: string, paso: number) => {
  const pool = /\d/.test(objetivo) ? FLAP_DIGITOS : FLAP_LETRAS;
  return pool[paso % pool.length]!;
};

/** Revela el texto letra a letra como un panel de aeropuerto. */
export function SplitFlap({ texto, retraso = 0 }: { texto: string; retraso?: number }) {
  const [estado, setEstado] = useState<{ chars: string[]; rolling: boolean[] }>(() => ({
    chars: texto.split("").map((c) => (c === " " || c === "#" ? c : " ")),
    rolling: texto.split("").map(() => true),
  }));
  useEffect(() => {
    const letras = texto.split("");
    if (reducedMotion()) {
      setEstado({ chars: letras, rolling: letras.map(() => false) });
      return;
    }
    let raf = 0;
    let t0 = 0;
    const fin = 380 + letras.length * 85;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const el = t - t0 - retraso;
      const chars = letras.map((c, i) => {
        if (c === " " || c === "#") return c;
        if (el < 0) return " ";
        if (el >= 380 + i * 85) return c;
        return flapChar(c, Math.floor(el / 42 + i * 3));
      });
      const rolling = letras.map((c, i) => c !== " " && c !== "#" && el < 380 + i * 85);
      setEstado({ chars, rolling });
      if (el < fin) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [texto, retraso]);
  return (
    <span className="cm-flap" aria-label={texto}>
      {estado.chars.map((c, i) => (
        <span key={i} data-rolling={estado.rolling[i] ? "true" : "false"} aria-hidden="true">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

/* ───────────────────────── Componente ───────────────────────── */

export function Tutorial({
  esAdmin,
  yo,
  hayZona,
  onPrivacidad,
  onCerrar,
  reglasIniciales,
}: {
  esAdmin: boolean;
  yo: TutorialYo;
  hayZona: boolean;
  onPrivacidad: (p: Privacidad) => Promise<unknown> | void;
  onCerrar: (r: { completo: boolean; noMostrar: boolean }) => void;
  /** Reglas ya cargadas (vistas previas); si faltan se piden al servidor. */
  reglasIniciales?: FpReglaPublica[];
}) {
  const [paso, setPaso] = useState(0);
  const [reglas, setReglas] = useState<FpReglaPublica[] | null>(reglasIniciales ?? null);
  const [eleccion, setEleccion] = useState<Privacidad>(yo.privacidad);
  const [guardando, setGuardando] = useState(false);
  const [noMostrar, setNoMostrar] = useState(false);
  const [montado, setMontado] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardH, setCardH] = useState(320);
  const [vw, setVw] = useState(1024);
  const [vh, setVh] = useState(768);

  useEffect(() => {
    setMontado(true);
    const f = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    if (reglasIniciales) return;
    void getFpRulesPublic()
      .then((r) => setReglas(r))
      .catch(() => setReglas([]));
  }, [reglasIniciales]);

  const pasos = useMemo<Paso[]>(() => {
    const lista: Paso[] = [
      {
        id: "inicio",
        tipo: "inicio",
        titulo: "Bienvenido a la Comunidad",
        cuerpo: (
          <>
            <p>
              Este es el tablero de FlightPath. Aquí se reconoce el estudio real de cada piloto en
              formación: no es un foro ni un chat, son rankings abiertos que se mueven con tu
              actividad.
            </p>
            <p>
              El recorrido dura un minuto y te muestra cómo funciona todo directamente sobre la
              pantalla.
            </p>
          </>
        ),
      },
      {
        id: "hud",
        target: '[data-tour="hud"]',
        titulo: "Tu tablero de vuelo",
        cuerpo: (
          <p>
            Arriba ves tu posición en el ranking activo, tus FlightPoints, tu racha actual y tus
            logros. Se actualiza solo cada vez que estudias: no hay que reclamar nada.
          </p>
        ),
      },
      {
        id: "rankings",
        target: '[data-tour="rankings"]',
        interactivo: true,
        titulo: "Cinco rankings, un solo tablero",
        cuerpo: (
          <>
            <p>
              <strong>Top General</strong> suma todo. <strong>Top CIAAC</strong> y{" "}
              <strong>Top Línea Aérea</strong> separan por programa.{" "}
              <strong>Racha más larga</strong> premia la constancia y <strong>Más logros</strong> el
              avance dentro de la plataforma.
            </p>
            <p className="cm-muted">Puedes tocar cualquiera ahora mismo para cambiar la tabla.</p>
          </>
        ),
      },
      {
        id: "periodo",
        target: '[data-tour="periodo"]',
        interactivo: true,
        titulo: "Esta semana, este mes o histórico",
        cuerpo: (
          <p>
            Los rankings de FlightPoints se reinician cada semana y cada mes (hora de México), así
            siempre hay una carrera abierta. Racha y logros son históricos por naturaleza y no usan
            periodo.
          </p>
        ),
      },
      {
        id: "podio",
        target: '[data-tour="podio"]',
        titulo: "Cómo se ordena el ranking",
        cuerpo: (
          <p>
            Manda el valor más alto. En caso de empate gana quien tiene más actividades válidas y,
            si sigue el empate, quien llegó primero. Se publican las primeras {FP_TOP_N} posiciones;
            el resto queda en privado.
          </p>
        ),
      },
      {
        id: "zona",
        target: hayZona ? '[data-tour="zona"]' : '[data-tour="tabla"]',
        titulo: "Tu zona privada",
        cuerpo: hayZona ? (
          <p>
            Como estás fuera del Top {FP_TOP_N}, aquí ves dos posiciones arriba y dos abajo de la
            tuya, y cuántos FP te faltan para subir un lugar. Nadie más ve esta parte.
          </p>
        ) : (
          <p>
            Cuando estés fuera del Top {FP_TOP_N}, debajo de la tabla aparecerá tu zona privada: dos
            posiciones arriba, dos abajo y cuántos FP te faltan para subir. Sólo tú la ves.
          </p>
        ),
      },
      {
        id: "reglas",
        tipo: "reglas",
        titulo: "Así se ganan los FlightPoints",
        cuerpo: (
          <p>
            Cada punto sale de actividad confirmada por el servidor. No hay compras ni atajos, y
            repetir un cuestionario que ya dominas no vuelve a pagar.
          </p>
        ),
      },
    ];
    if (esAdmin) {
      lista.push({
        id: "admin",
        titulo: "Tu cuenta administrativa",
        cuerpo: (
          <p>
            Como administración ves toda la Comunidad, pero no participas en los rankings. Desde el
            panel admin puedes ligar cualquier indicativo con el alumno real.
          </p>
        ),
      });
    } else {
      lista.push({
        id: "privacidad",
        tipo: "privacidad",
        titulo: yo.privacidadElegida
          ? "¿Cómo quieres seguir apareciendo?"
          : "¿Cómo quieres aparecer?",
        cuerpo: (
          <p>
            Tu indicativo es único, es tuyo para siempre y sólo el equipo de FlightPath sabe a quién
            pertenece. Puedes cambiar esta decisión cuando quieras desde tu ficha de piloto.
          </p>
        ),
      });
    }
    lista.push({
      id: "final",
      tipo: "final",
      titulo: "Listo, piloto",
      cuerpo: (
        <p>
          Ya conoces el tablero. Cada sesión de estudio mueve tu posición y los rankings están
          abiertos siempre: nos vemos en la tabla.
        </p>
      ),
    });
    return lista;
  }, [esAdmin, hayZona, yo.privacidadElegida]);

  const actual = pasos[Math.min(paso, pasos.length - 1)]!;
  const total = pasos.length;
  const rect = useFoco(actual.target, paso);
  const centrado = !actual.target || !rect;
  const esUltimo = paso === total - 1;
  const idxPrivacidad = pasos.findIndex((p) => p.tipo === "privacidad");

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, [paso, centrado]);

  const siguiente = useCallback(async () => {
    if (actual.tipo === "privacidad") {
      setGuardando(true);
      try {
        await onPrivacidad(eleccion);
      } finally {
        setGuardando(false);
      }
    }
    if (esUltimo) onCerrar({ completo: true, noMostrar });
    else setPaso((p) => Math.min(total - 1, p + 1));
  }, [actual.tipo, eleccion, esUltimo, noMostrar, onCerrar, onPrivacidad, total]);

  const atras = useCallback(() => setPaso((p) => Math.max(0, p - 1)), []);

  /** Saltar: si aún no eligió privacidad, va directo a esa pregunta; si ya, cierra. */
  const saltar = useCallback(() => {
    if (!esAdmin && !yo.privacidadElegida && idxPrivacidad >= 0 && paso < idxPrivacidad)
      setPaso(idxPrivacidad);
    else onCerrar({ completo: false, noMostrar });
  }, [esAdmin, idxPrivacidad, noMostrar, onCerrar, paso, yo.privacidadElegida]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") saltar();
      // La elección de privacidad se confirma sólo con el botón, nunca por accidente.
      if (e.key === "ArrowRight" && actual.tipo !== "privacidad") void siguiente();
      if (e.key === "ArrowLeft") atras();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actual.tipo, atras, saltar, siguiente]);

  if (!montado) return null;

  /* Posición de la tarjeta junto al foco (o como hoja inferior en teléfono). */
  const movil = vw < 820;
  const cardW = Math.min(440, vw - 24);
  let cardStyle: React.CSSProperties = {};
  if (!centrado && rect) {
    if (movil) {
      cardStyle = { left: 12, right: 12, bottom: 12, width: "auto" };
    } else {
      const abajo = rect.top + rect.height + 16;
      const cabeArriba = rect.top - 16 - cardH >= 12;
      const cabeAbajo = abajo + cardH <= vh - 12;
      const top = cabeAbajo
        ? abajo
        : cabeArriba
          ? rect.top - 16 - cardH
          : Math.max(12, vh - cardH - 12);
      const left = Math.min(Math.max(12, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 12);
      cardStyle = { top, left, width: cardW };
    }
  }

  const tarjeta = (
    <div
      ref={cardRef}
      className="cm-tour-card cm-root"
      style={cardStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-tour-titulo"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="cm-tour-step">
            Paso {paso + 1} de {total}
          </span>
          <button
            type="button"
            onClick={saltar}
            className="cm-btn cm-btn-ghost"
            style={{ height: 30, padding: "0 10px" }}
          >
            {esUltimo ? "Cerrar" : "Saltar"}
            <Icon n="close" size={14} />
          </button>
        </div>

        <RutaProgreso paso={paso} total={total} />

        {actual.tipo === "inicio" && (
          <div className="mt-4 mb-2 flex justify-center">
            <img
              src="/img/pathy-cloud.png"
              alt=""
              width={120}
              height={120}
              className="animate-float-y"
              style={{ width: 120, height: 120 }}
            />
          </div>
        )}

        <h2 id="cm-tour-titulo" className="cm-display cm-ink mt-4 text-[22px] leading-tight">
          {actual.titulo}
        </h2>
        <div className="cm-ink-2 mt-2.5 grid gap-2 text-[14px] leading-relaxed">
          {actual.cuerpo}
        </div>

        {actual.tipo === "reglas" && <Reglas reglas={reglas} />}

        {actual.tipo === "privacidad" && (
          <ElegirPrivacidad yo={yo} eleccion={eleccion} onChange={setEleccion} />
        )}

        {actual.tipo === "final" && yo.tutorialVisto && (
          <label className="cm-muted mt-4 flex cursor-pointer items-center gap-2 text-[12.5px]">
            <input
              type="checkbox"
              checked={noMostrar}
              onChange={(e) => setNoMostrar(e.target.checked)}
              style={{ accentColor: "#6C0820", width: 15, height: 15 }}
            />
            No volver a mostrar este recorrido al entrar
          </label>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={atras}
            disabled={paso === 0}
            className="cm-btn cm-btn-ghost"
          >
            <Icon n="chevL" size={15} /> Atrás
          </button>
          <button
            type="button"
            onClick={() => void siguiente()}
            disabled={guardando}
            className="cm-btn cm-btn-primary"
          >
            {guardando
              ? "Guardando"
              : actual.tipo === "inicio"
                ? "Empezar recorrido"
                : actual.tipo === "privacidad"
                  ? "Confirmar"
                  : esUltimo
                    ? "Ver rankings"
                    : "Siguiente"}
            {!guardando && <Icon n={esUltimo ? "check" : "chevR"} size={15} />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      <Sombras rect={centrado ? null : rect} vw={vw} vh={vh} />
      {!centrado && rect && (
        <>
          <span
            className="cm-tour-ring"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            aria-hidden="true"
          />
          {!actual.interactivo && (
            <span
              className="cm-tour-block"
              style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
              aria-hidden="true"
            />
          )}
        </>
      )}
      {centrado ? <div className="cm-tour-center">{tarjeta}</div> : tarjeta}
      {actual.tipo === "final" && <Confetti count={120} duration={3800} />}
    </>,
    document.body,
  );
}

/* ───────────────────────── Piezas del tutorial ───────────────────────── */

/** Cuatro sombras alrededor del foco: el hueco deja pasar los toques al elemento real. */
function Sombras({ rect, vw, vh }: { rect: Rect | null; vw: number; vh: number }) {
  if (!rect) return <div className="cm-tour-dim" style={{ inset: 0 }} aria-hidden="true" />;
  const bottom = rect.top + rect.height;
  const right = rect.left + rect.width;
  return (
    <>
      <div
        className="cm-tour-dim"
        style={{ top: 0, left: 0, width: vw, height: Math.max(0, rect.top) }}
        aria-hidden="true"
      />
      <div
        className="cm-tour-dim"
        style={{ top: bottom, left: 0, width: vw, height: Math.max(0, vh - bottom) }}
        aria-hidden="true"
      />
      <div
        className="cm-tour-dim"
        style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
        aria-hidden="true"
      />
      <div
        className="cm-tour-dim"
        style={{ top: rect.top, left: right, width: Math.max(0, vw - right), height: rect.height }}
        aria-hidden="true"
      />
    </>
  );
}

/** Progreso como plan de vuelo: puntos de ruta y un avión que avanza. */
function RutaProgreso({ paso, total }: { paso: number; total: number }) {
  const pct = total > 1 ? (paso / (total - 1)) * 100 : 100;
  return (
    <div className="cm-tour-path" aria-hidden="true">
      <span className="cm-tour-path-line" />
      <span className="cm-tour-path-fill" style={{ width: `${pct}%` }} />
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="cm-tour-dot"
          data-done={i <= paso ? "true" : "false"}
          style={{ left: `${(i / (total - 1)) * 100}%` }}
        />
      ))}
      <span className="cm-tour-plane" style={{ left: `${pct}%` }}>
        <Icon n="plane" size={16} sw={2} />
      </span>
    </div>
  );
}

function Reglas({ reglas }: { reglas: FpReglaPublica[] | null }) {
  if (reglas === null) {
    return (
      <div className="mt-4 grid gap-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="cm-skel" style={{ height: 36 }} />
        ))}
      </div>
    );
  }
  if (reglas.length === 0) {
    return (
      <p className="cm-muted mt-4 text-[13px]">
        Las reglas vigentes se publican desde el panel del equipo.
      </p>
    );
  }
  const grupos = new Map<string, FpReglaPublica[]>();
  reglas.forEach((r) => grupos.set(r.categoria, [...(grupos.get(r.categoria) ?? []), r]));
  let i = 0;
  return (
    <div className="mt-4 grid gap-3" style={{ maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
      {[...grupos.entries()].map(([cat, lista]) => (
        <div key={cat} className="grid gap-1.5">
          <span className="cm-tour-step">{etiquetaCategoria(cat)}</span>
          {lista.map((r) => (
            <div key={r.key} className="cm-rule-chip" style={{ ["--i" as string]: i++ }}>
              <span className="cm-ink truncate font-semibold">{r.label}</span>
              <span
                className="cm-display whitespace-nowrap"
                style={{ color: "#6C0820", fontWeight: 700 }}
              >
                +{fpFormat(r.fp)} FP
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function etiquetaCategoria(cat: string): string {
  const mapa: Record<string, string> = {
    material: "Materiales",
    learning_path: "Learning Paths",
    materia: "Materias",
    cuestionario: "Cuestionarios",
    flashcards: "Flashcards",
    pathy: "Estudia con Pathy",
    racha: "Rachas",
    logro: "Logros",
    logros: "Logros",
    tiempo: "Tiempo de estudio",
    bonus: "Bonos",
  };
  return mapa[cat] ?? cat.replace(/_/g, " ");
}

function ElegirPrivacidad({
  yo,
  eleccion,
  onChange,
}: {
  yo: TutorialYo;
  eleccion: Privacidad;
  onChange: (p: Privacidad) => void;
}) {
  const cs = partesCallsign(yo.callsign);
  return (
    <div className="mt-4 grid gap-2.5">
      <button
        type="button"
        className="cm-priv-opt"
        aria-pressed={eleccion === "nombre"}
        onClick={() => onChange("nombre")}
      >
        <span className="flex items-center gap-2 text-[13px] font-bold">
          <Icon n="eye" size={15} /> Con mi nombre y foto
        </span>
        <span className="cm-preview">
          <Avatar
            nombre={yo.nombre}
            anonimo={false}
            callsign={yo.callsign}
            avatarUrl={yo.avatarUrl}
            size={40}
          />
          <span className="cm-ink truncate text-[14px] font-bold">
            {yo.nombre || iniciales(yo.nombre)}
          </span>
          <span className="cm-you-tag" style={{ background: "#6C0820" }}>
            Tú
          </span>
        </span>
      </button>
      <button
        type="button"
        className="cm-priv-opt"
        aria-pressed={eleccion === "folio"}
        onClick={() => onChange("folio")}
      >
        <span className="flex items-center gap-2 text-[13px] font-bold">
          <Icon n="eyeOff" size={15} /> Anónimo, con mi indicativo
        </span>
        <span className="cm-preview">
          <Insignia callsign={yo.callsign} size={40} />
          <span className="cm-ink truncate text-[14px] font-bold">
            <SplitFlap texto={cs.nombre} retraso={150} />
            {cs.numero && (
              <span className="cm-callsign-num">
                <SplitFlap texto={cs.numero} retraso={650} />
              </span>
            )}
          </span>
          <span className="cm-you-tag" style={{ background: "#6C0820" }}>
            Tú
          </span>
        </span>
        <span className="cm-muted text-[12px]">
          Tu indicativo: <Callsign texto={yo.callsign} className="cm-ink font-semibold" />
        </span>
      </button>
    </div>
  );
}
