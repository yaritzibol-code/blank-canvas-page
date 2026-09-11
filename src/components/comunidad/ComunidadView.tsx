/**
 * Vista de Comunidad: sólo presentación.
 *
 * Recibe todo ya calculado (rankings, posición propia, resumen de FlightPoints)
 * y las acciones que puede disparar la persona. La carga de datos vive en la
 * ruta; separar las dos cosas permite previsualizar el tablero con datos de
 * muestra y mantiene la vista libre de llamadas al servidor.
 */
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { Eyebrow } from "@/components/landing/shared";
import {
  Avatar,
  Backdrop,
  BoardSkeleton,
  Callsign,
  Fila,
  HudTile,
  Insignia,
  Numero,
  PeriodSwitch,
  Podium,
  RankingSelector,
  Ring,
  Tarjeta,
  rankingDe,
} from "./pieces";
import {
  FP_ACTIVITY_LABEL,
  FP_RANKINGS,
  fpFormat,
  type FpPeriodo,
  type FpRankingId,
  type FpRankingRow,
  type FpResumen,
} from "@/lib/fp/shared";

const PERIODO_TITULO: Record<FpPeriodo, string> = {
  semana: "esta semana",
  mes: "este mes",
  historico: "de siempre",
};

/** Orden fijo del desglose de FlightPoints. */
const ORDEN_DESGLOSE = [
  "learning_path",
  "cuestionario",
  "flashcards",
  "material",
  "pathy",
  "racha",
  "logro",
];

/** Indicativo de respaldo mientras el servidor asigna el real. */
const CALLSIGN_PROVISIONAL = "Cirro Vega #0000";

export interface PosicionRanking {
  metric: string;
  posicion: number | null;
  valor: number;
  total: number;
  faltan: number | null;
}

export interface ComunidadDatos {
  nombre: string;
  miFoto: string | null;
  metric: FpRankingId;
  periodo: FpPeriodo;
  top: FpRankingRow[];
  yo: FpRankingRow[];
  totalParticipantes: number;
  miPosicion: number | null;
  miValor: number | null;
  faltan: number | null;
  posicionArriba: number | null;
  esAdmin: boolean;
  resumen: FpResumen | null;
  posiciones: PosicionRanking[];
  cargando: boolean;
}

export interface ComunidadAcciones {
  onMetric: (id: FpRankingId) => void;
  onPeriodo: (p: FpPeriodo) => void;
  onPrivacidad: (p: "nombre" | "folio") => Promise<unknown> | void;
  onAbrirTutorial: () => void;
}

export function ComunidadView(props: ComunidadDatos & ComunidadAcciones) {
  const {
    nombre,
    miFoto,
    metric,
    periodo,
    top,
    yo,
    totalParticipantes,
    miPosicion,
    miValor,
    faltan,
    posicionArriba,
    esAdmin,
    resumen,
    posiciones,
    cargando,
    onMetric,
    onPeriodo,
    onPrivacidad,
    onAbrirTutorial,
  } = props;

  const ranking = rankingDe(metric);
  const periodoEfectivo: FpPeriodo = ranking.usaFp ? periodo : "historico";
  const callsign = resumen?.callsign ?? "";
  const anonimo = (resumen?.privacidad ?? "folio") !== "nombre";
  const podio = top.slice(0, 3);
  const resto = top.slice(3);
  const arribaValor = miValor !== null && faltan !== null ? miValor + faltan : null;
  const ratioObjetivo =
    miPosicion === 1
      ? 1
      : arribaValor && arribaValor > 0 && miValor !== null
        ? miValor / arribaValor
        : miPosicion
          ? 1
          : 0;

  const por = resumen?.porActividad ?? [];
  const desglose = ORDEN_DESGLOSE.map((tipo) => ({
    tipo,
    fp: por.find((a) => a.tipo === tipo)?.fp ?? 0,
  }));
  const maxDesglose = Math.max(1, ...desglose.map((l) => l.fp));

  return (
    <div className="cm-root grid gap-5 sm:gap-6">
      <Backdrop />

      {/* ── Encabezado: reconocimiento + HUD personal ── */}
      <section className="cm-hero cm-rise p-5 sm:p-7 lg:p-8" data-tour="hud">
        <div className="cm-hero-grid" aria-hidden="true" />
        <span
          className="cm-hero-glow"
          style={{ right: -120, top: -160, background: "#F2AEBC" }}
          aria-hidden="true"
        />
        <span
          className="cm-hero-glow"
          style={{ left: -160, bottom: -220, background: "#5A86CB", animationDelay: "-3s" }}
          aria-hidden="true"
        />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-end">
          <div className="min-w-0">
            <Eyebrow light>Mi progreso · Comunidad</Eyebrow>
            <h1 className="cm-display mt-4 text-[34px] leading-[1.02] text-white sm:text-[44px] lg:text-[50px]">
              Los que van al frente
              <span className="block" style={{ color: "#F2AEBC" }}>
                {PERIODO_TITULO[periodoEfectivo]}.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/70 sm:text-[15.5px]">
              Rankings abiertos, siempre. Cada punto sale de actividad real: Learning Paths,
              cuestionarios, flashcards, sesiones con Pathy, rachas y logros. Aquí reconocemos a
              quienes están dando lo mejor de sí.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button type="button" onClick={onAbrirTutorial} className="cm-btn cm-btn-light">
                <Icon n="help" size={15} /> ¿Cómo funciona?
              </button>
              {esAdmin ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-semibold text-white/75">
                  <Icon n="shield" size={13} /> Cuenta administrativa: ves todo, no participas
                </span>
              ) : (
                callsign && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-semibold text-white/85">
                    {anonimo ? (
                      <Insignia callsign={callsign} size={18} />
                    ) : (
                      <Icon n="eye" size={13} />
                    )}
                    Apareces como{" "}
                    {anonimo ? (
                      <Callsign texto={callsign} className="text-white" />
                    ) : (
                      <span className="text-white">{nombre}</span>
                    )}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="cm-hud">
            <HudTile
              label="Posición"
              valor={miPosicion ? `#${miPosicion}` : "Sin posición"}
              sufijo={ranking.corto}
              icono="flag"
              i={0}
            />
            <HudTile
              label="FlightPoints"
              valor={resumen?.total ?? 0}
              sufijo="FP"
              icono="spark"
              i={1}
            />
            <HudTile
              label="Racha"
              valor={resumen?.rachaActual ?? 0}
              sufijo="días"
              icono="flame"
              i={2}
              flama
            />
            <HudTile label="Logros" valor={resumen?.logros ?? 0} icono="trophy" i={3} />
          </div>
        </div>
      </section>

      {/* ── Selector de rankings ── */}
      <section data-tour="rankings">
        <RankingSelector metric={metric} onChange={onMetric} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* ── Tabla ── */}
        <section
          className="cm-card cm-rise p-4 sm:p-6"
          data-tour="tabla"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="cm-rank-icon" style={{ ["--cm-acento" as string]: ranking.acento }}>
              <Icon n={ranking.icono as FPIconName} size={18} sw={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="cm-display cm-ink text-[20px] leading-tight sm:text-[22px]">
                {ranking.label}
              </h2>
              <p className="cm-muted text-[12.5px]">
                {ranking.ayuda}
                {totalParticipantes > 0 && (
                  <>
                    {" "}
                    · {totalParticipantes}{" "}
                    {totalParticipantes === 1 ? "participante" : "participantes"}
                  </>
                )}
              </p>
            </div>
            <div data-tour="periodo">
              {ranking.usaFp ? (
                <PeriodSwitch periodo={periodo} onChange={onPeriodo} />
              ) : (
                <span
                  className="cm-card-2 cm-muted inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold"
                  style={{ borderRadius: 999 }}
                >
                  <Icon n="clock" size={13} /> Histórico
                </span>
              )}
            </div>
          </div>

          {cargando ? (
            <BoardSkeleton />
          ) : top.length === 0 ? (
            <div className="cm-card-2 cm-pop grid place-items-center gap-2 px-6 py-12 text-center">
              <Insignia callsign={callsign || CALLSIGN_PROVISIONAL} size={52} />
              <p className="cm-display cm-ink text-[17px]">
                Todavía no hay actividad en este ranking.
              </p>
              <p className="cm-muted max-w-sm text-[13px]">
                Estudia hoy y estrena el tablero: la primera sesión válida ya cuenta.
              </p>
            </div>
          ) : (
            <div key={`${metric}-${periodoEfectivo}`} className="cm-swap grid gap-5">
              <div data-tour="podio">
                <Podium filas={podio} unidad={ranking.unidad} acento={ranking.acento} />
              </div>

              {resto.length > 0 && (
                <div className="grid gap-1.5">
                  {resto.map((r, i) => (
                    <Fila
                      key={r.userId}
                      r={r}
                      unidad={ranking.unidad}
                      acento={ranking.acento}
                      i={i}
                    />
                  ))}
                </div>
              )}

              {!esAdmin && yo.length > 0 && (
                <div
                  className="grid gap-2 border-t border-dashed pt-4"
                  style={{ borderColor: "var(--cm-border-strong)" }}
                  data-tour="zona"
                >
                  <div className="flex items-center gap-2">
                    <Icon n="lock" size={13} className="cm-muted" />
                    <p className="cm-tour-step">Tu zona del ranking · sólo tú la ves</p>
                  </div>
                  {yo.map((r, i) => (
                    <Fila
                      key={r.userId}
                      r={r}
                      unidad={ranking.unidad}
                      acento={ranking.acento}
                      i={i}
                    />
                  ))}
                  {ranking.usaFp && faltan !== null && posicionArriba !== null && (
                    <p
                      className="cm-pop mt-1 rounded-xl px-3.5 py-2.5 text-[13px] font-bold"
                      style={{
                        color: ranking.acento,
                        background: `color-mix(in srgb, ${ranking.acento} 9%, var(--cm-card))`,
                        border: `1px solid color-mix(in srgb, ${ranking.acento} 30%, transparent)`,
                      }}
                    >
                      Te faltan {fpFormat(faltan)} FP para alcanzar al #{posicionArriba}.
                    </p>
                  )}
                </div>
              )}

              {!esAdmin && miPosicion === null && (
                <p className="cm-card-2 cm-muted px-4 py-3 text-[13px]">
                  Aún no apareces en este ranking. En cuanto sumes actividad válida
                  {ranking.usaFp ? " en este periodo" : ""} verás tu posición aquí.
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Ficha de piloto ── */}
        <aside className="grid gap-4" data-tour="piloto">
          <section className="cm-card cm-rise overflow-hidden" style={{ animationDelay: "220ms" }}>
            <div className="cm-hero p-4" style={{ borderRadius: 0, boxShadow: "none" }}>
              <div className="cm-hero-grid" aria-hidden="true" />
              <div className="relative flex items-center gap-3.5">
                <span
                  className="inline-block rounded-full"
                  style={{ boxShadow: "0 0 0 3px rgba(255,255,255,.18)" }}
                >
                  <Avatar
                    nombre={nombre}
                    anonimo={anonimo && !esAdmin}
                    callsign={callsign || CALLSIGN_PROVISIONAL}
                    avatarUrl={miFoto}
                    size={56}
                  />
                </span>
                <div className="min-w-0">
                  <p className="cm-hud-label">Ficha de piloto</p>
                  <p className="cm-display truncate text-[18px] text-white">{nombre}</p>
                  {callsign && (
                    <p className="truncate text-[12px] text-white/70">
                      Indicativo:{" "}
                      <Callsign texto={callsign} className="font-semibold text-white/90" />
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4">
              {!esAdmin && (
                <div className="grid gap-2" data-tour="privacidad">
                  <p className="cm-tour-step">Cómo apareces en los rankings</p>
                  <div className="cm-priv">
                    <button
                      type="button"
                      className="cm-priv-opt"
                      aria-pressed={anonimo}
                      onClick={() => void onPrivacidad("folio")}
                    >
                      <span className="flex items-center gap-1.5 text-[12.5px] font-bold">
                        <Icon n="eyeOff" size={14} /> Anónimo
                      </span>
                      <span className="cm-muted text-[11px]">Sólo tu indicativo e insignia.</span>
                    </button>
                    <button
                      type="button"
                      className="cm-priv-opt"
                      aria-pressed={!anonimo}
                      onClick={() => void onPrivacidad("nombre")}
                    >
                      <span className="flex items-center gap-1.5 text-[12.5px] font-bold">
                        <Icon n="eye" size={14} /> Nombre y foto
                      </span>
                      <span className="cm-muted text-[11px]">Tu nombre y tu foto de perfil.</span>
                    </button>
                  </div>
                  <p className="cm-muted-2 text-[11px] leading-snug">
                    Nadie ve tu correo ni tu actividad detallada: sólo el valor del ranking.
                  </p>
                </div>
              )}

              {!esAdmin && (
                <div className="cm-card-2 flex items-center gap-3.5 p-3.5">
                  <Ring ratio={ratioObjetivo} color={ranking.acento} size={78}>
                    <span className="cm-display cm-ink text-[15px] leading-none">
                      {miPosicion ? `#${miPosicion}` : "—"}
                    </span>
                  </Ring>
                  <div className="min-w-0 text-[13px] leading-snug">
                    {miPosicion === null ? (
                      <>
                        <p className="cm-ink font-bold">Aún sin posición en {ranking.corto}.</p>
                        <p className="cm-muted">Tu primera actividad válida te pone en la tabla.</p>
                      </>
                    ) : miPosicion === 1 ? (
                      <>
                        <p className="cm-ink font-bold">Vas al frente.</p>
                        <p className="cm-muted">Sostén la constancia para quedarte arriba.</p>
                      </>
                    ) : faltan !== null && posicionArriba !== null ? (
                      <>
                        <p className="cm-ink font-bold">
                          Te faltan <Numero valor={faltan} /> FP para el #{posicionArriba}.
                        </p>
                        <p className="cm-muted">
                          Llevas {fpFormat(miValor ?? 0)} {ranking.unidad} en {ranking.corto}.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="cm-ink font-bold">
                          Posición #{miPosicion} de {totalParticipantes}.
                        </p>
                        <p className="cm-muted">
                          {fpFormat(miValor ?? 0)} {ranking.unidad} en {ranking.label}.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {esAdmin && (
                <p className="cm-card-2 cm-muted px-3.5 py-3 text-[12.5px] leading-snug">
                  Como cuenta administrativa no apareces en los rankings de alumnos. Desde el panel
                  admin puedes ligar cada indicativo con su alumno.
                </p>
              )}
            </div>
          </section>

          <Tarjeta
            titulo="Tu posición en cada ranking"
            icono="flag"
            className="cm-rise"
            tour="posiciones"
          >
            <div className="cm-stagger grid gap-1.5">
              {FP_RANKINGS.map((r, i) => {
                const p = posiciones.find((x) => x.metric === r.id);
                return (
                  <div
                    key={r.id}
                    className="cm-card-2 flex items-center gap-2.5 px-3 py-2"
                    style={{ ["--i" as string]: i, borderRadius: 12 }}
                  >
                    <span
                      className="cm-rank-icon"
                      style={{
                        ["--cm-acento" as string]: r.acento,
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                      }}
                    >
                      <Icon n={r.icono as FPIconName} size={14} sw={1.9} />
                    </span>
                    <span className="cm-ink flex-1 truncate text-[13px] font-bold">{r.label}</span>
                    <span className="cm-muted whitespace-nowrap text-[11.5px]">
                      {fpFormat(p?.valor ?? 0)} {r.unidad}
                    </span>
                    <span
                      className="cm-display min-w-[44px] text-right text-[14px]"
                      style={{ color: r.acento, fontWeight: 700 }}
                    >
                      {p?.posicion ? `#${p.posicion}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Tarjeta>

          <Tarjeta
            titulo="De dónde vienen tus FlightPoints"
            icono="spark"
            className="cm-rise"
            tour="desglose"
            aside={
              <span
                className="cm-display text-[15px]"
                style={{ color: "var(--cm-coral)", fontWeight: 700 }}
              >
                {fpFormat(resumen?.total ?? 0)} FP
              </span>
            }
          >
            <div className="grid gap-2.5">
              {desglose.map((a, i) => (
                <div key={a.tipo} className="grid gap-1">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="cm-ink font-semibold">
                      {FP_ACTIVITY_LABEL[a.tipo] ?? a.tipo}
                    </span>
                    <span className="cm-muted font-bold">{fpFormat(a.fp)} FP</span>
                  </div>
                  <div className="cm-bar">
                    <span
                      style={{
                        width: `${Math.max(a.fp > 0 ? 4 : 0, (a.fp / maxDesglose) * 100)}%`,
                        background: `linear-gradient(90deg, var(--cm-ink-2), ${ranking.acento})`,
                        ["--d" as string]: `${i * 70 + 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>
        </aside>
      </div>
    </div>
  );
}
