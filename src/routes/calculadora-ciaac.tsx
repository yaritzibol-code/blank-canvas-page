import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MATERIAS_DEF, SIM_TOTAL_QS } from "@/lib/store/materias";
import { ICONO_MATERIA } from "@/lib/seo/materias-iconos";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  PlaneField,
  SectionHead,
  type IconName,
} from "./index";
import { PROXIMO_CIAAC } from "@/lib/convocatoria";

/**
 * Calculadora pública de horas de estudio para el CIAAC — el asset linkeable
 * del plan SEO: fecha de examen + disponibilidad → plan de horas por materia,
 * ponderado con el mismo reparto del simulador (`MATERIAS_DEF`). Todo corre
 * en el cliente; no pide cuenta ni datos.
 */

const CANONICAL = "https://flightpath.mx/calculadora-ciaac";
const START_HREF = "/register";

/** Punto de partida → horas totales de estudio recomendadas (referencia). */
const NIVELES = [
  { id: "cero", label: "Empiezo desde cero", horas: 150 },
  { id: "avance", label: "Ya llevo avance", horas: 100 },
  { id: "repaso", label: "Solo repaso final", horas: 60 },
] as const;

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuántas horas de estudio se necesitan para el CIAAC?",
    a: "Depende de tu punto de partida. Como referencia, esta calculadora usa 150 horas si empiezas desde cero, 100 si ya llevas avance y 60 para un repaso final — repartidas entre las 12 materias según su peso en el examen. Tu número real lo afinas practicando: el análisis por materia de FlightPath te dice dónde necesitas más o menos.",
  },
  {
    q: "¿Cómo se reparten las horas entre las 12 materias?",
    a: `Proporcionalmente al peso de cada materia en el examen: en el simulador de ${SIM_TOTAL_QS} preguntas, materias como Aerodinámica o Meteorología aportan 30 preguntas y pesan más que las de 20. A ese reparto súmale tu factor personal: más horas a la materia donde más fallas.`,
  },
  {
    q: "¿Cuándo debería empezar a estudiar?",
    a: "Hoy. La constancia le gana al maratón: 2–3 horas diarias durante 8–10 semanas rinden más que desvelos de última hora. Si la calculadora te marca que no alcanzas con tu ritmo actual, sube las horas por día o prioriza las materias de mayor peso.",
  },
];

export const Route = createFileRoute("/calculadora-ciaac")({
  component: CalculadoraPage,
  head: () => ({
    meta: [
      { title: "Calculadora CIAAC: ¿cuántas horas de estudio te quedan? | FlightPath" },
      {
        name: "description",
        content:
          "Pon tu fecha de examen y tu disponibilidad: la calculadora te dice cuántas horas de estudio te quedan y cómo repartirlas entre las 12 materias del CIAAC, con el peso real de cada una. Gratis y sin cuenta.",
      },
      {
        name: "keywords",
        content:
          "calculadora CIAAC, cuantas horas estudiar CIAAC, plan de estudio CIAAC, cuanto tiempo estudiar piloto comercial, plan de estudio examen CIAAC por materia",
      },
      { property: "og:title", content: "¿Cuántas horas de estudio te quedan para tu CIAAC?" },
      {
        property: "og:description",
        content:
          "Fecha de examen + tu disponibilidad → tu plan de horas por materia, con el peso real del examen. Gratis y sin cuenta.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "¿Cuántas horas de estudio te quedan para tu CIAAC?" },
      {
        name: "twitter:description",
        content: "Calcula tu plan de horas por materia para el examen CIAAC. Gratis y sin cuenta.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Calculadora de horas de estudio para el CIAAC",
              url: CANONICAL,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              inLanguage: "es-MX",
              offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
              provider: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: "https://flightpath.mx/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Calculadora de estudio CIAAC",
                  item: CANONICAL,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

/* ─────────────────────────── Lógica ─────────────────────────── */

function fmtHoras(h: number): string {
  const rounded = Math.round(h * 2) / 2;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** yyyy-mm-dd local de una fecha. */
function isoDia(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ─────────────────────────── Página ─────────────────────────── */

function Calculadora() {
  // La fecha "hoy" se fija en el cliente para no desincronizar el SSR.
  const [hoy, setHoy] = useState<Date | null>(null);
  useEffect(() => {
    setHoy(new Date());
  }, []);

  const defaultFecha = useMemo(() => {
    // Si la aplicación registrada ya pasó, propone un horizonte sano de 8
    // semanas en lugar de una fecha caduca.
    const conv = new Date(PROXIMO_CIAAC);
    if (conv.getTime() > Date.now()) return isoDia(conv);
    const f = new Date();
    f.setDate(f.getDate() + 56);
    return isoDia(f);
  }, []);

  const [fecha, setFecha] = useState<string>(defaultFecha);
  const [horasDia, setHorasDia] = useState(3);
  const [diasSemana, setDiasSemana] = useState(6);
  const [nivel, setNivel] = useState<(typeof NIVELES)[number]["id"]>("cero");
  const [copiado, setCopiado] = useState(false);

  const r = useMemo(() => {
    if (!hoy || !fecha) return null;
    const examen = new Date(`${fecha}T08:00:00`);
    const msDia = 86400000;
    const inicio = new Date(isoDia(hoy) + "T00:00:00");
    const dias = Math.max(0, Math.round((examen.getTime() - inicio.getTime()) / msDia));
    const objetivo = NIVELES.find((n) => n.id === nivel)?.horas ?? 150;
    const disponibles = Math.round(dias * (diasSemana / 7) * horasDia);
    const ritmoNecesario = dias > 0 ? objetivo / (dias * (diasSemana / 7)) : Infinity;
    return { dias, objetivo, disponibles, ritmoNecesario };
  }, [hoy, fecha, horasDia, diasSemana, nivel]);

  const alcanza = r ? r.disponibles >= r.objetivo : false;

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(CANONICAL);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard no disponible: el botón simplemente no confirma */
    }
  };

  return (
    <section className="relative pb-6" id="calculadora">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="rounded-[28px] bg-white border border-ink/8 shadow-lift overflow-hidden">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            {/* Controles */}
            <div className="p-7 lg:p-9 border-b lg:border-b-0 lg:border-r border-ink/8">
              <Coord>PLAN DE VUELO · DATOS</Coord>
              <div className="mt-5 space-y-6">
                <label className="block">
                  <span className="text-[13px] font-bold text-ink/70">¿Cuándo es tu examen?</span>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="mt-2 w-full h-12 rounded-xl border border-ink/15 bg-white px-4 text-[15px] text-ink focus:outline-none focus:border-coral-600"
                  />
                  <span className="mt-1.5 block text-[12px] text-ink/40">
                    Precargada: la convocatoria CIAAC del 17 de agosto de 2026.
                  </span>
                </label>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink/70">
                      Horas de estudio al día
                    </span>
                    <span className="font-display text-[18px] text-coral-600">{horasDia} h</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={horasDia}
                    onChange={(e) => setHorasDia(Number(e.target.value))}
                    className="mt-3 w-full accent-coral-600"
                    aria-label="Horas de estudio al día"
                  />
                </div>

                <div>
                  <span className="text-[13px] font-bold text-ink/70">
                    Días de estudio por semana
                  </span>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {[5, 6, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiasSemana(d)}
                        className={`h-11 rounded-xl border text-[14px] font-semibold transition-all ${diasSemana === d ? "border-coral-600 bg-coral-50 text-coral-700" : "border-ink/12 text-ink/60 hover:border-ink/30"}`}
                      >
                        {d} días
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[13px] font-bold text-ink/70">¿Desde dónde arrancas?</span>
                  <div className="mt-2.5 space-y-2">
                    {NIVELES.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNivel(n.id)}
                        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${nivel === n.id ? "border-coral-600 bg-coral-50" : "border-ink/12 hover:border-ink/30"}`}
                      >
                        <span
                          className={`text-[14px] font-semibold ${nivel === n.id ? "text-coral-700" : "text-ink/70"}`}
                        >
                          {n.label}
                        </span>
                        <span className="text-[12.5px] font-mono text-ink/45">≈ {n.horas} h</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="p-7 lg:p-9 bg-ink text-white relative overflow-hidden">
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(closest-side, rgba(242,174,188,0.18), transparent)",
                }}
              />
              <div className="relative">
                <Coord light>PLAN DE VUELO · RESULTADO</Coord>
                {!r ? (
                  <p className="mt-6 text-white/60 text-[14px]">Cargando tu plan…</p>
                ) : r.dias <= 0 ? (
                  <div className="mt-6">
                    <div className="font-display text-3xl">Esa fecha ya pasó ✈</div>
                    <p className="mt-3 text-white/65 text-[14.5px] leading-relaxed">
                      Elige la fecha de tu próximo examen para armar el plan. Si vas por la
                      siguiente convocatoria, este es el mejor día para empezar: hoy.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 grid grid-cols-3 gap-4">
                      {[
                        [String(r.dias), "días al examen"],
                        [`${r.disponibles} h`, "tendrás disponibles"],
                        [`${r.objetivo} h`, "objetivo sugerido"],
                      ].map(([v, l]) => (
                        <div key={l} className="border-t-2 border-coral-400/40 pt-2.5">
                          <div className="font-display text-[26px] lg:text-[32px] leading-none">
                            {v}
                          </div>
                          <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/50 font-bold mt-1.5">
                            {l}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-6 rounded-2xl px-4 py-3.5 border ${alcanza ? "bg-emerald-500/10 border-emerald-400/40" : "bg-coral-600/15 border-coral-400/50"}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon
                          n={alcanza ? "check" : "alarm"}
                          className={`w-4 h-4 mt-0.5 shrink-0 ${alcanza ? "text-emerald-400" : "text-coral-400"}`}
                          sw={2.2}
                        />
                        <p className="text-[13.5px] leading-relaxed text-white/85">
                          {alcanza
                            ? `Te alcanza: con ${horasDia} h al día, ${diasSemana} días a la semana, cubres tu objetivo con margen. La clave ahora es la constancia.`
                            : `Vas justo: para llegar a ${r.objetivo} h necesitas ≈ ${r.ritmoNecesario === Infinity ? "—" : fmtHoras(r.ritmoNecesario)} h por día de estudio. Sube el ritmo o prioriza las materias de mayor peso.`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-white/50 mb-3">
                        Tu reparto por materia (peso real del examen)
                      </div>
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        {MATERIAS_DEF.map((m) => {
                          const horas = (r.objetivo * m.simTotal) / SIM_TOTAL_QS;
                          const pct = (m.simTotal / SIM_TOTAL_QS) * 100;
                          return (
                            <a
                              key={m.slug}
                              href={`/ciaac/${m.slug}`}
                              className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.06] transition-colors"
                            >
                              <span className="w-7 h-7 rounded-lg bg-white/[0.08] grid place-items-center shrink-0 text-white/70">
                                <Icon
                                  n={(ICONO_MATERIA[m.slug] ?? "book") as IconName}
                                  className="w-3.5 h-3.5"
                                />
                              </span>
                              <span className="flex-1 text-[13px] text-white/80 leading-tight group-hover:text-white transition-colors">
                                {m.name}
                              </span>
                              <span className="hidden sm:block w-20 h-1.5 rounded-full bg-white/10 overflow-hidden shrink-0">
                                <span
                                  className="block h-full rounded-full bg-coral-400"
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                              <span className="font-mono text-[12.5px] text-coral-300 w-12 text-right shrink-0">
                                {fmtHoras(horas)} h
                              </span>
                            </a>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-[11.5px] text-white/40 leading-relaxed">
                        Cada materia enlaza a su guía: qué evalúa, temas frecuentes y preguntas de
                        muestra. Ajusta el reparto con tus materias débiles.
                      </p>
                    </div>
                  </>
                )}

                <div className="mt-7 flex flex-wrap gap-2.5">
                  <Btn kind="primary" size="md" icon="arrow" to="/register">
                    Armar mi plan en FlightPath
                  </Btn>
                  <Btn kind="outlineLight" size="md" onClick={copiarLink}>
                    {copiado ? "¡Enlace copiado!" : "Compartir calculadora"}
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-ink/40 max-w-2xl mx-auto">
          Método: horas objetivo según tu punto de partida (150 / 100 / 60 h de referencia),
          repartidas entre las 12 materias con el mismo peso que tienen en el simulador de{" "}
          {SIM_TOTAL_QS} preguntas. Es una guía de planeación, no una garantía de resultado.
        </p>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-16 lg:pt-24 pb-12">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                Herramienta gratuita · Sin cuenta
              </span>
            </div>
            <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
              ¿Cuántas horas de estudio
              <span className="block text-coral-600 mt-1">te quedan para tu CIAAC?</span>
            </h1>
            <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
              Pon tu fecha de examen y tu disponibilidad real. La calculadora te dice si te alcanza
              — y cómo repartir las horas entre las 12 materias, con el peso que cada una tiene en
              el examen.
            </p>
          </div>
          <div className="relative hidden lg:flex items-center justify-center">
            <PathyBubble size={210} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Faqs() {
  return (
    <section className="relative py-16 lg:py-20" id="faq">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Horas, ritmo <span className="text-coral-600">y plan.</span>
            </>
          }
        />
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15.5px] font-semibold text-ink">
                <h3 style={{ margin: 0, font: "inherit" }}>{f.q}</h3>
                <span className="text-coral-600 shrink-0 transition-transform group-open:rotate-180">
                  <Icon n="chevD" className="w-4 h-4" />
                </span>
              </summary>
              <p className="mt-4 text-[14.5px] text-ink/60 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CierreCta() {
  return (
    <section className="relative py-16 lg:py-24">
      <PlaneField count={12} />
      <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
          Las horas son la mitad.
          <span className="block text-coral-600">La otra mitad es practicar bien.</span>
        </h2>
        <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
          En FlightPath tu plan se ajusta solo: practicas por materia, el análisis detecta tus
          huecos y cada sesión ataca lo que más te sube el promedio.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
            Empezar gratis
          </Btn>
          <Btn kind="light" size="lg" href="/ciaac">
            Conocer el examen CIAAC
          </Btn>
        </div>
      </div>
    </section>
  );
}

function CalculadoraPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop />
      <Nav />
      <Hero />
      <Calculadora />
      <Faqs />
      <CierreCta />
      <Footer />
    </div>
  );
}
