import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { MATERIAS_DEF, SIM_TOTAL_QS, materiaBySlug, type MateriaDef } from "@/lib/store/materias";
import { materiaSeoBySlug, type MateriaSeo } from "@/lib/seo/materias-seo";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  SectionHead,
  type IconName,
} from "@/components/landing/shared";
import { ICONO_MATERIA } from "@/lib/seo/materias-iconos";

/**
 * Cluster SEO /ciaac/$materia — una guía pública por cada una de las 12
 * materias del CIAAC. Capta búsquedas long-tail ("preguntas de meteorología
 * CIAAC", "temario aerodinámica piloto comercial") y lleva al registro.
 *
 * El contenido editorial vive en `@/lib/seo/materias-seo`; las cifras salen
 * de `MATERIAS_DEF` (mismas que usa la app). Las preguntas de muestra son
 * originales — ver COMPLIANCE.md.
 */

const BASE = "https://flightpath.mx";

/** Materias piloto del schema Course (medir en GSC antes de extender a las 12). */
const COURSE_PILOT_SLUGS = new Set(["aerodinamica", "meteorologia", "navegacion"]);
const START_HREF = "/register";

/** FAQs de la página, generadas desde los mismos datos que se renderizan. */
function buildFaqs(def: MateriaDef, seo: MateriaSeo): { q: string; a: string }[] {
  const pct = Math.round((def.simTotal / SIM_TOTAL_QS) * 100);
  return [
    {
      q: `¿Cuántas preguntas de ${def.name} tiene el examen CIAAC?`,
      a: `En el simulador de FlightPath — que reproduce el formato del examen con ${SIM_TOTAL_QS} preguntas y la ponderación por materia — ${def.name} aporta ${def.simTotal} preguntas, alrededor del ${pct}% del examen.`,
    },
    {
      q: `¿Qué temas de ${def.name} se preguntan más?`,
      a: `Los temas con más presencia en la práctica son: ${seo.temas.join("; ")}.`,
    },
    {
      q: `¿Cómo estudiar ${def.name} para el CIAAC?`,
      a: `${seo.comoEstudiar} En FlightPath practicas ${def.name} con preguntas explicadas, simulacros cronometrados y análisis de tus fallas por tema — puedes empezar gratis.`,
    },
  ];
}

export const Route = createFileRoute("/ciaac_/$materia")({
  loader: ({ params }) => {
    const def = materiaBySlug(params.materia);
    const seo = materiaSeoBySlug(params.materia);
    if (!def || !seo) throw notFound();
    return { def, seo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Materia CIAAC — FlightPath" }] };
    const { def, seo } = loaderData;
    const canonical = `${BASE}/ciaac/${def.slug}`;
    const title = `${def.name} — Guía CIAAC: temas, peso en el examen y preguntas de muestra | FlightPath`;
    const description = `Qué evalúa ${def.name} en el examen CIAAC, los temas que más se preguntan, su peso en el simulador (${def.simTotal} de ${SIM_TOTAL_QS} preguntas) y preguntas de muestra con explicación.`;
    const faqs = buildFaqs(def, seo);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${def.name.toLowerCase()} CIAAC, preguntas de ${def.name.toLowerCase()} CIAAC, temario ${def.name.toLowerCase()} piloto comercial, examen CIAAC ${def.name.toLowerCase()}, ${def.name.toLowerCase()} piloto aviador comercial`,
        },
        { property: "og:title", content: `${def.name} para el examen CIAAC | FlightPath` },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${def.name} para el examen CIAAC | FlightPath` },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              // Piloto de rich results de curso (F-15 del audit SEO): solo en
              // tres materias mientras se mide el impacto en Search Console.
              ...(COURSE_PILOT_SLUGS.has(def.slug)
                ? [
                    {
                      "@type": "Course",
                      name: `${def.name} para el examen CIAAC — curso de práctica`,
                      description,
                      inLanguage: "es-MX",
                      url: canonical,
                      provider: {
                        "@type": "Organization",
                        name: "FlightPath",
                        url: "https://flightpath.mx/",
                      },
                      offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "MXN",
                        category: "Free",
                        url: canonical,
                      },
                      hasCourseInstance: {
                        "@type": "CourseInstance",
                        courseMode: "online",
                        courseWorkload: "PT12H",
                      },
                    },
                  ]
                : []),
              {
                "@type": "Quiz",
                name: `Preguntas de muestra de ${def.name} — CIAAC`,
                about: { "@type": "Thing", name: `${def.name} (examen CIAAC)` },
                educationalLevel: "Piloto Aviador Comercial",
                inLanguage: "es-MX",
                hasPart: seo.muestra.map((m) => ({
                  "@type": "Question",
                  eduQuestionType: "Multiple choice",
                  learningResourceType: "Practice problem",
                  name: m.q,
                  suggestedAnswer: m.opts
                    .filter((_, i) => i !== m.correct)
                    .map((o) => ({ "@type": "Answer", text: o })),
                  acceptedAnswer: { "@type": "Answer", text: `${m.opts[m.correct]}. ${m.exp}` },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  { "@type": "ListItem", position: 2, name: "Examen CIAAC", item: `${BASE}/ciaac` },
                  { "@type": "ListItem", position: 3, name: def.name, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: MateriaPage,
});

/* ─────────────────────────── Secciones ─────────────────────────── */

function Hero({ def, seo }: { def: MateriaDef; seo: MateriaSeo }) {
  const pct = Math.round((def.simTotal / SIM_TOTAL_QS) * 100);
  return (
    <section className="relative">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-14 lg:pt-20 pb-16 lg:pb-20">
        <nav
          aria-label="Breadcrumb"
          className="text-[12.5px] text-ink/45 flex items-center gap-1.5 flex-wrap"
        >
          <a href="/" className="hover:text-ink transition-colors">
            Inicio
          </a>
          <Icon n="chevR" className="w-3 h-3" />
          <a href="/ciaac" className="hover:text-ink transition-colors">
            Examen CIAAC
          </a>
          <Icon n="chevR" className="w-3 h-3" />
          <span className="text-ink/70 font-semibold">{def.name}</span>
        </nav>
        <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                Guía de materia · Examen CIAAC
              </span>
            </div>
            <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
              {def.name}:
              <span className="block text-coral-600 mt-1">así se pregunta en el CIAAC.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              {seo.gancho}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
                Practicar esta materia gratis
              </Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="#muestra">
                Ver preguntas de muestra
              </Btn>
            </div>
          </div>
          <div className="relative lg:h-[400px] flex items-center justify-center">
            <PathyBubble size={230} className="lg:absolute lg:right-4 lg:top-2" />
            <div className="hidden lg:block absolute left-0 bottom-6 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon
                  n={ICONO_MATERIA[def.slug] ?? "book"}
                  className="w-3.5 h-3.5 text-coral-400"
                />{" "}
                Peso en el examen
              </div>
              <div className="text-white text-[14px] leading-snug">
                {def.simTotal} de {SIM_TOTAL_QS} preguntas,
                <br />
                <span className="text-coral-400 font-semibold">≈ {pct}% del simulador.</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-coral-400"
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueEvalua({ def, seo }: { def: MateriaDef; seo: MateriaSeo }) {
  return (
    <section className="relative py-16 lg:py-20" id="que-evalua">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <SectionHead
            eyebrow="La materia"
            title={
              <>
                Qué evalúa <span className="text-coral-600">{def.name}.</span>
              </>
            }
            sub={seo.queEvalua}
          />
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="target" className="w-4 h-4 text-coral-600" /> Peso en el examen
              </div>
              <p className="text-[14.5px] text-ink/70 leading-relaxed">
                En el simulador de FlightPath — que reproduce el formato del examen con{" "}
                {SIM_TOTAL_QS} preguntas y la ponderación por materia — <strong>{def.name}</strong>{" "}
                aporta <strong>{def.simTotal} preguntas</strong>, alrededor del{" "}
                {Math.round((def.simTotal / SIM_TOTAL_QS) * 100)}% del examen.
              </p>
            </div>
            <div className="rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="spark" className="w-4 h-4 text-coral-600" /> Cómo estudiarla
              </div>
              <p className="text-[14.5px] text-ink/70 leading-relaxed">{seo.comoEstudiar}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemasFrecuentes({ def, seo }: { def: MateriaDef; seo: MateriaSeo }) {
  return (
    <section className="relative py-16 lg:py-20" id="temas">
      <PlaneField count={12} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
        <SectionHead
          center
          eyebrow="Temario"
          title={
            <>
              Los temas que <span className="text-coral-600">más se preguntan.</span>
            </>
          }
          sub={`Estos son los frentes de ${def.name} con más presencia en la práctica. Si el tiempo aprieta, empieza por aquí.`}
        />
        <div className="mt-12 space-y-3 max-w-[760px] mx-auto">
          {seo.temas.map((t, i) => (
            <div
              key={t}
              className="flex items-start gap-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-5 py-4"
            >
              <span className="w-8 h-8 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0 font-mono text-[12px] font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] text-ink/75 leading-relaxed pt-1">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreguntasMuestra({ def, seo }: { def: MateriaDef; seo: MateriaSeo }) {
  const letters = ["A", "B", "C", "D"];
  return (
    <section className="relative py-16 lg:py-24" id="muestra">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas de muestra"
          title={
            <>
              Así se siente <span className="text-coral-600">el banco.</span>
            </>
          }
          sub={`Tres preguntas de ${def.name} al estilo FlightPath: enunciado, opciones y la explicación que te dice por qué. En la plataforma, cada una viene con su fuente.`}
        />
        <div className="mt-12 space-y-6">
          {seo.muestra.map((m, qi) => (
            <article
              key={m.q}
              className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <Coord>{`PREGUNTA ${String(qi + 1).padStart(2, "0")} · ${def.name.toUpperCase()}`}</Coord>
                <Pill tone="coral">Muestra</Pill>
              </div>
              <h3 className="font-display mt-4 text-[19px] lg:text-[21px] text-ink leading-snug tracking-tight">
                {m.q}
              </h3>
              <div className="mt-5 grid gap-2.5">
                {m.opts.map((o, i) => {
                  const ok = i === m.correct;
                  return (
                    <div
                      key={o}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${ok ? "border-emerald-500 bg-emerald-50" : "border-ink/8 opacity-70"}`}
                    >
                      <span
                        className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-bold ${ok ? "bg-emerald-500 text-white" : "bg-ink/5 text-ink/55"}`}
                      >
                        {ok ? <Icon n="check" className="w-4 h-4" sw={2.4} /> : letters[i]}
                      </span>
                      <span className="text-[14px] text-ink/85">{o}</span>
                      {ok && (
                        <span className="ml-auto text-[10px] uppercase tracking-[0.14em] font-bold text-emerald-600 shrink-0">
                          Correcta
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl bg-misty/40 border border-cherry/40 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-burgundy mb-1.5">
                  Por qué
                </div>
                <p className="text-[14px] text-ink/75 leading-relaxed">{m.exp}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-ink/45 max-w-xl mx-auto">
          Preguntas de demostración escritas para esta guía. El banco completo — con {def.simTotal}{" "}
          preguntas de {def.name} solo en el simulador y muchas más en la práctica por materia —
          vive dentro de la plataforma.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
            Practicar {def.name} gratis
          </Btn>
          <Btn kind="light" size="lg" href="/calculadora-ciaac">
            ¿Cuántas horas te quedan? Calcúlalo
          </Btn>
        </div>
      </div>
    </section>
  );
}

function Faqs({ def, seo }: { def: MateriaDef; seo: MateriaSeo }) {
  const faqs = buildFaqs(def, seo);
  return (
    <section className="relative py-16 lg:py-20" id="faq">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Sobre {def.name} <span className="text-coral-600">en el CIAAC.</span>
            </>
          }
        />
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
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

function OtrasMaterias({ actual }: { actual: string }) {
  const otras = MATERIAS_DEF.filter((m) => m.slug !== actual);
  return (
    <section className="relative py-16 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="El resto del temario"
          title={
            <>
              Las otras <span className="text-coral-600">{otras.length} materias.</span>
            </>
          }
          sub="El CIAAC se aprueba cubriendo el temario completo. Sigue con la materia que tengas más floja."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {otras.map((m) => (
            <a
              key={m.slug}
              href={`/ciaac/${m.slug}`}
              className="group flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-4 py-3.5 hover:border-coral-300 hover:shadow-lift transition-all"
            >
              <span className="w-9 h-9 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0 group-hover:bg-coral-50 group-hover:text-coral-700 transition-colors">
                <Icon
                  n={(ICONO_MATERIA[m.slug] ?? "book") as IconName}
                  className="w-[18px] h-[18px]"
                />
              </span>
              <span className="flex-1 text-[14px] font-semibold text-ink/80 leading-snug">
                {m.name}
              </span>
              <Icon
                n="chevR"
                className="w-4 h-4 text-ink/30 group-hover:text-coral-600 transition-colors"
              />
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Btn kind="light" size="md" href="/ciaac">
            Ver la guía completa del examen CIAAC
          </Btn>
        </div>
      </div>
    </section>
  );
}

function Aviso() {
  return (
    <section className="relative pb-14">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
          <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma independiente
          de preparación: no está afiliada a la AFAC ni al CIAAC, no aplica el examen oficial y sus
          preguntas de práctica son propias, desarrolladas de forma independiente sobre el temario
          publicado. Consulta siempre convocatorias y requisitos en las fuentes oficiales.
        </div>
      </div>
    </section>
  );
}

function CierreCta({ def }: { def: MateriaDef }) {
  return (
    <section className="relative py-16 lg:py-24">
      <PlaneField count={12} />
      <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center relative z-10">
        <div className="flex justify-center mb-8">
          <PathyBubble size={110} />
        </div>
        <h2 className="font-display text-[30px] lg:text-[42px] text-ink leading-tight">
          {def.name} no se aprueba leyendo.
          <span className="block text-coral-600">Se aprueba practicando.</span>
        </h2>
        <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[540px] mx-auto">
          Crea tu cuenta gratis, responde tu primer cuestionario de {def.name} y descubre en veinte
          preguntas dónde estás parado.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
            Empezar gratis
          </Btn>
        </div>
      </div>
    </section>
  );
}

function MateriaPage() {
  const { def, seo } = Route.useLoaderData();

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
      <Hero def={def} seo={seo} />
      <QueEvalua def={def} seo={seo} />
      <TemasFrecuentes def={def} seo={seo} />
      <PreguntasMuestra def={def} seo={seo} />
      <Faqs def={def} seo={seo} />
      <OtrasMaterias actual={def.slug} />
      <Aviso />
      <CierreCta def={def} />
      <Footer />
    </div>
  );
}
