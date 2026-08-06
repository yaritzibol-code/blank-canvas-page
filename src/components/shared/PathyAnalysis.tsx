/**
 * Análisis de Pathy — el informe completo de la preparación.
 *
 * Sólo pinta lo que `pathyReport()` calcula a partir de datos reales: cada
 * señal muestra el dato que la sostiene y cada acción del plan explica por qué
 * la propone. Se rehace en cada render del store, así que refleja el último
 * cuestionario o la última entrada de bitácora sin recargar.
 */
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { PathyBubble } from "@/routes/index";
import type { PathyReport, PathySignal, SignalTone, RutaPerf } from "@/lib/store";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import type { LiveDataState } from "@/hooks/use-live-data";

const NAVY = "#22375C";
const HAZE = "#647DA0";
const MIST = "#8DA1BE";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const TONE: Record<SignalTone, { color: string; bg: string; icon: string; label: string }> = {
  riesgo: { color: "#B3261E", bg: "rgba(179,38,30,.08)", icon: "alert", label: "Atiende esto" },
  ojo: { color: "#8A6000", bg: "rgba(243,156,18,.1)", icon: "eye", label: "Ojo" },
  bien: { color: "#1A7A4A", bg: "rgba(46,204,113,.1)", icon: "checkCircle", label: "Vas bien" },
  neutro: { color: "#3D5D91", bg: "rgba(61,93,145,.08)", icon: "info", label: "Dato" },
};

const scoreColor = (avg: number | null) =>
  avg === null ? MIST : avg >= 80 ? "#2ecc71" : avg >= 60 ? "#f39c12" : "#e74c3c";

function Metric({
  label,
  value,
  suffix = "",
  delta,
  nota,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  delta?: number | null;
  nota: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: "1px solid #E8EEF6", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".16em", textTransform: "uppercase", color: MIST }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.9rem", fontWeight: 900, color: NAVY, lineHeight: 1 }}>
          {value === null ? "—" : `${value}${suffix}`}
        </span>
        {delta !== null && delta !== undefined && delta !== 0 && (
          <span style={{ fontSize: ".76rem", fontWeight: 800, color: delta > 0 ? "#1A7A4A" : "#B3261E" }}>
            {delta > 0 ? `+${delta}` : delta} pts
          </span>
        )}
      </div>
      <div style={{ fontSize: ".72rem", color: HAZE, lineHeight: 1.45 }}>{nota}</div>
    </div>
  );
}

function SignalCard({ s }: { s: PathySignal }) {
  const t = TONE[s.tono];
  return (
    <div style={{ background: "white", border: "1px solid #E8EEF6", borderLeft: `4px solid ${t.color}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, background: t.bg, color: t.color, fontSize: ".64rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>
          <Icon n={t.icon as never} size={12} /> {t.label}
        </span>
        <span style={{ fontSize: ".88rem", fontWeight: 700, color: NAVY }}>{s.titulo}</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: ".7rem", fontWeight: 700, color: t.color, whiteSpace: "nowrap" }}>{s.dato}</span>
      </div>
      <p style={{ fontSize: ".82rem", color: HAZE, lineHeight: 1.55 }}>{s.detalle}</p>
    </div>
  );
}

function BarraMateria({ m }: { m: RutaPerf }) {
  const color = scoreColor(m.avg);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span title={m.name} style={{ fontSize: ".78rem", color: NAVY, flex: "1 1 auto", minWidth: 0, display: "inline-flex", alignItems: "center", gap: 7 }}>
        <Icon n={m.icon as never} size={15} />
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
      </span>
      <div style={{ width: 90, flexShrink: 0, height: 7, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 10, background: color, width: `${m.avg ?? 0}%` }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: ".72rem", fontWeight: 700, width: 34, textAlign: "right", flexShrink: 0, color }}>
        {m.avg === null ? "—" : `${m.avg}%`}
      </span>
    </div>
  );
}

function Bloque({ titulo, icon, children }: { titulo: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #E8EEF6", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: ".72rem", fontWeight: 800, color: HAZE, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 7 }}>
        <Icon n={icon as never} size={14} /> {titulo}
      </div>
      {children}
    </div>
  );
}

export function PathyAnalysis({ report, live }: { report: PathyReport; live?: LiveDataState }) {
  const { ritmo, materias, animo } = report;

  return (
    <section style={{ marginBottom: 28 }}>
      {/* Diagnóstico */}
      <div
        style={{
          background: "linear-gradient(135deg,#22375C,#2a2a4e)",
          borderRadius: 20,
          padding: "24px 26px",
          marginBottom: 16,
          display: "flex",
          gap: 22,
          alignItems: "flex-start",
          flexWrap: "wrap",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, background: "radial-gradient(circle,rgba(242,174,188,.16) 0%,transparent 70%)", borderRadius: "50%" }} />
        <div style={{ flexShrink: 0, zIndex: 1 }}><PathyBubble size={96} /></div>
        <div style={{ flex: 1, minWidth: 260, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#F2AEBC" }}>
              Análisis de Pathy
            </span>
            {live && <LiveIndicator state={live} compact />}
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "1.35rem", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 8 }}>
            {report.saludo} — {report.titular}.
          </h2>
          <p style={{ fontSize: ".88rem", color: "rgba(255,255,255,.72)", lineHeight: 1.6 }}>{report.resumen}</p>
        </div>
      </div>

      {/* Métricas duras */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
        <Metric
          label="Aciertos · 30 días"
          value={report.aciertos.valor}
          suffix="%"
          delta={report.aciertos.delta}
          nota={report.aciertos.muestra > 0 ? `Sobre ${report.aciertos.muestra} preguntas respondidas` : "Sin preguntas en los últimos 30 días"}
        />
        <Metric
          label="Preparación estimada"
          value={report.preparacion.valor}
          suffix="%"
          nota="Cuestionarios y simulador; el simulador pesa doble. No garantiza aprobación."
        />
        <Metric
          label="Constancia · 7 días"
          value={ritmo.diasActivos7}
          suffix=" / 7"
          nota={`${ritmo.minutos7} min esta semana · ${ritmo.preguntas7} preguntas · racha de ${ritmo.racha}`}
        />
        <Metric
          label="Constancia · 30 días"
          value={ritmo.diasActivos30}
          suffix=" / 30"
          nota="Días con estudio registrado en el último mes"
        />
      </div>

      {/* Señales */}
      {report.senales.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {report.senales.map((s) => (
            <SignalCard key={s.id} s={s} />
          ))}
        </div>
      )}

      {/* Desglose */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 }}>
        <Bloque titulo="Materias del CIAAC" icon="help">
          {materias.debiles.length === 0 && materias.fuertes.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: MIST, lineHeight: 1.5 }}>
              Aún no hay suficiente práctica para clasificar materias. Necesito al menos 5 preguntas respondidas por materia.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {materias.debiles.length > 0 && (
                <div>
                  <div style={{ fontSize: ".7rem", fontWeight: 800, color: "#B3261E", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Por reforzar</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {materias.debiles.map((m) => <BarraMateria key={m.key} m={m} />)}
                  </div>
                </div>
              )}
              {materias.fuertes.length > 0 && (
                <div>
                  <div style={{ fontSize: ".7rem", fontWeight: 800, color: "#1A7A4A", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Dominadas</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {materias.fuertes.map((m) => <BarraMateria key={m.key} m={m} />)}
                  </div>
                </div>
              )}
              {materias.sinPracticar.length > 0 && (
                <div style={{ fontSize: ".76rem", color: MIST, lineHeight: 1.5, paddingTop: 4, borderTop: "1px dashed #E8EEF6" }}>
                  Sin practicar todavía: {materias.sinPracticar.map((m) => m.name).join(", ")}.
                </div>
              )}
            </div>
          )}
        </Bloque>

        <Bloque titulo="Manuales de Línea Aérea" icon="plane">
          {report.lineaAerea.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: MIST, lineHeight: 1.5 }}>
              Todavía no has practicado los cuestionarios por manual de la convocatoria.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {report.manuales.debiles.length > 0 && (
                <div>
                  <div style={{ fontSize: ".7rem", fontWeight: 800, color: "#B3261E", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Por reforzar</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {report.manuales.debiles.map((m) => <BarraMateria key={m.key} m={m} />)}
                  </div>
                </div>
              )}
              {report.manuales.fuertes.length > 0 && (
                <div>
                  <div style={{ fontSize: ".7rem", fontWeight: 800, color: "#1A7A4A", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Dominados</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {report.manuales.fuertes.map((m) => <BarraMateria key={m.key} m={m} />)}
                  </div>
                </div>
              )}
              {report.manuales.debiles.length === 0 && report.manuales.fuertes.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.lineaAerea.map((m) => <BarraMateria key={m.key} m={m} />)}
                </div>
              )}
              {report.manuales.sinPracticar.length > 0 && (
                <div style={{ fontSize: ".76rem", color: MIST, lineHeight: 1.5, paddingTop: 4, borderTop: "1px dashed #E8EEF6" }}>
                  Sin practicar todavía: {report.manuales.sinPracticar.map((m) => m.name).join(", ")}.
                </div>
              )}
            </div>
          )}
        </Bloque>


        <Bloque titulo="Cómo lo estás viviendo" icon="heart">
          {animo.entradas === 0 ? (
            <p style={{ fontSize: ".82rem", color: MIST, lineHeight: 1.5 }}>
              Sin entradas de bitácora en las últimas 2 semanas. Los números dicen qué fallaste; tu bitácora dice por qué.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Motivación", val: animo.motivacion },
                  { label: "Concentración", val: animo.concentracion },
                ].map((x) => (
                  <div key={x.label}>
                    <div style={{ fontFamily: DISPLAY, fontSize: "1.35rem", fontWeight: 900, color: NAVY, lineHeight: 1 }}>
                      {x.val === null ? "—" : `${x.val}/5`}
                    </div>
                    <div style={{ fontSize: ".7rem", color: MIST }}>{x.label}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: "1.35rem", fontWeight: 900, color: animo.diasBajos14 >= 3 ? "#B3261E" : NAVY, lineHeight: 1 }}>
                    {animo.diasBajos14}
                  </div>
                  <div style={{ fontSize: ".7rem", color: MIST }}>Días difíciles</div>
                </div>
              </div>
              <div style={{ fontSize: ".78rem", color: HAZE, lineHeight: 1.5 }}>
                {animo.entradas} {animo.entradas === 1 ? "entrada" : "entradas"} en 14 días
                {animo.temaRepetido ? ` · "${animo.temaRepetido.tema}" se repite ${animo.temaRepetido.veces} veces` : ""}.
              </div>
            </div>
          )}
        </Bloque>
      </div>

      {/* Plan de acción */}
      {report.plan.length > 0 && (
        <div style={{ background: "#FAFBFF", border: "1px solid #E8EEF6", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: ".72rem", fontWeight: 800, color: HAZE, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Icon n="target" size={14} /> Tu plan de esta semana
          </div>
          <p style={{ fontSize: ".8rem", color: MIST, marginBottom: 14 }}>
            Ordenado por lo que más te sube el promedio, no por lo que más te gusta.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {report.plan.map((a, i) => (
              <div key={a.id} style={{ background: "white", border: "1px solid #E8EEF6", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#22375C", color: "white", fontSize: ".68rem", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: MONO }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: ".88rem", fontWeight: 700, color: NAVY }}>{a.titulo}</span>
                </div>
                <p style={{ fontSize: ".78rem", color: HAZE, lineHeight: 1.5, flex: 1 }}>{a.porque}</p>
                <Link
                  to={a.to as "/dashboard"}
                  {...(a.search ? { search: a.search as never } : {})}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 14px", borderRadius: 9, background: "#6C0820", color: "white",
                    fontSize: ".82rem", fontWeight: 700, textDecoration: "none",
                  }}
                >
                  {a.cta} <Icon n="arrow" size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
