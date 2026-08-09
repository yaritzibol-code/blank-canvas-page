import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { FUENTES_SEO, fuenteSeoBySlug, type FuenteSeo } from "@/lib/seo/fuentes-seo";
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

/**
 * Cluster SEO /linea-aerea/$fuente — una guía pública por cada fuente del
 * temario del examen teórico de la convocatoria de línea aérea (ATP, PHAK,
 * Jeppesen, CPAM y OACI Anexo 10). Capta búsquedas huérfanas de altísima
 * intención ("qué es el CPAM", "jeppesen general airway manual en español").
 *
 * Contenido editorial en `@/lib/seo/fuentes-seo`; desgloses de capítulos de
 * `linea-aerea-meta` (los mismos de la app). Ver COMPLIANCE.md: se describe
 * el temario publicado, nunca se reproduce material de examen de terceros.
 */

const BASE = "https://flightpath.mx";
const START_HREF = "/register";
const BUY_HREF = `/register?next=${encodeURIComponent("/dashboard/planes?checkout=1")}`;

export const Route = createFileRoute("/linea-aerea_/$fuente")({
  loader: ({ params }) => {
    const fuente = fuenteSeoBySlug(params.fuente);
    if (!fuente) throw notFound();
    return { fuente };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Fuente del temario — FlightPath" }] };
    const { fuente } = loaderData;
    const canonical = `${BASE}/linea-aerea/${fuente.slug}`;
    const title = `${fuente.nombre}: qué es y cómo estudiarlo para la convocatoria | FlightPath`;
    const description = `${fuente.queEs} Qué entra en el examen teórico de la convocatoria de línea aérea, cómo practicarlo y preguntas de muestra con explicación.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${fuente.corto.toLowerCase()}, ${fuente.nombre.toLowerCase()}, que es el ${fuente.corto.toLowerCase()}, ${fuente.corto.toLowerCase()} examen, ${fuente.corto.toLowerCase()} convocatoria aeromexico, temario primer oficial`,
        },
        { property: "og:title", content: `${fuente.nombre} | FlightPath` },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${fuente.nombre} | FlightPath` },
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
                mainEntity: fuente.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Temario Línea Aérea",
                    item: `${BASE}/linea-aerea`,
                  },
                  { "@type": "ListItem", position: 3, name: fuente.corto, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: FuentePage,
});

/* ─────────────────────────── Secciones ─────────────────────────── */

function Hero({ fuente }: { fuente: FuenteSeo }) {
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
          <a href="/linea-aerea" className="hover:text-ink transition-colors">
            Temario Línea Aérea
          </a>
          <Icon n="chevR" className="w-3 h-3" />
          <span className="text-ink/70 font-semibold">{fuente.corto}</span>
        </nav>
        <div className="mt-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                Fuente del temario · Examen teórico de línea aérea
              </span>
            </div>
            <h1 className="font-display mt-6 text-[34px] sm:text-[46px] lg:text-[52px] leading-[1.02] tracking-tight text-ink">
              {fuente.nombre.split("—")[0].trim()}
              <span className="block text-coral-600 mt-1">qué es y cómo se estudia.</span>
            </h1>
            <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">{fuente.intro}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
                Practicar esta fuente
              </Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="/convocatoria-aeromexico">
                Ver la convocatoria completa
              </Btn>
            </div>
          </div>
          <div className="relative lg:h-[380px] flex items-center justify-center">
            <PathyBubble size={220} className="lg:absolute lg:right-6 lg:top-2" />
            <div className="hidden lg:block absolute left-0 bottom-6 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon
                  n={(fuente.icon as IconName) ?? "book"}
                  className="w-3.5 h-3.5 text-coral-400"
                />{" "}
                {fuente.corto}
              </div>
              <div className="text-white text-[14px] leading-snug">
                Una de las 5 fuentes
                <br />
                <span className="text-coral-400 font-semibold">del examen teórico.</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {FUENTES_SEO.map((f) => (
                  <span
                    key={f.slug}
                    className={`text-[10.5px] font-mono rounded-full px-2 py-0.5 border ${f.slug === fuente.slug ? "text-coral-400 border-coral-400/60" : "text-white/60 border-white/15"}`}
                  >
                    {f.corto}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueEs({ fuente }: { fuente: FuenteSeo }) {
  return (
    <section className="relative py-16 lg:py-20" id="que-es">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          <div className="rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-7 lg:p-8">
            <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
              <Icon n="book" className="w-4 h-4 text-coral-600" /> Qué es
            </div>
            <p className="text-[15px] text-ink/70 leading-relaxed">{fuente.queEs}</p>
          </div>
          <div className="rounded-3xl bg-ink shadow-navy p-7 lg:p-8">
            <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
              <Icon n="target" className="w-4 h-4 text-coral-400" /> Qué entra en la convocatoria
            </div>
            <p className="text-[15px] text-white/80 leading-relaxed">{fuente.enConvocatoria}</p>
            <div className="mt-5 pt-4 border-t border-white/10">
              <Coord light>FUENTE · TEMARIO PUBLICADO DE LA CONVOCATORIA</Coord>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bloques({ fuente }: { fuente: FuenteSeo }) {
  return (
    <section className="relative py-16 lg:py-20" id="bloques">
      <PlaneField count={12} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
        <SectionHead
          center
          eyebrow={fuente.bloquesTitulo}
          title={
            <>
              Lo que hay <span className="text-coral-600">adentro.</span>
            </>
          }
          sub={`Así se desglosa ${fuente.corto} para estudiarlo por bloques en FlightPath, cada uno con sus propias preguntas de práctica.`}
        />
        <div className="mt-12 grid sm:grid-cols-2 gap-3 max-w-[860px] mx-auto">
          {fuente.bloques.map((b, i) => (
            <div
              key={b.titulo}
              className="flex items-start gap-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-5 py-4"
            >
              <span className="w-8 h-8 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0 font-mono text-[12px] font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-0.5">
                <div className="text-[14.5px] font-semibold text-ink/85 leading-snug">
                  {b.titulo}
                </div>
                {b.detalle && <div className="text-[12.5px] text-ink/45 mt-0.5">{b.detalle}</div>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13.5px] text-ink/50 max-w-2xl mx-auto">
          {fuente.comoPractica}
        </p>
      </div>
    </section>
  );
}

function MateriasRelacionadas({ fuente }: { fuente: FuenteSeo }) {
  return (
    <section className="relative py-14 lg:py-16">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <div className="rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-7 lg:p-8">
          <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
            <Icon n="grid" className="w-4 h-4 text-coral-600" /> Materias con las que se practica en
            FlightPath
          </div>
          <div className="flex flex-wrap gap-2.5">
            {fuente.materias.map((m) => (
              <a
                key={m.slug}
                href={`/ciaac/${m.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-coral-300/50 bg-coral-50 px-3.5 py-1.5 text-[13px] font-semibold text-coral-700 hover:bg-coral-100 transition-colors"
              >
                {m.name} <Icon n="chevR" className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PreguntasMuestra({ fuente }: { fuente: FuenteSeo }) {
  const letters = ["A", "B", "C", "D"];
  return (
    <section className="relative py-16 lg:py-20" id="muestra">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas de muestra"
          title={
            <>
              Así se pregunta <span className="text-coral-600">{fuente.corto}.</span>
            </>
          }
          sub="Preguntas de demostración escritas para esta guía, al estilo del banco de FlightPath: enunciado, opciones y el porqué de la respuesta."
        />
        <div className="mt-12 space-y-6">
          {fuente.muestra.map((m, qi) => (
            <article
              key={m.q}
              className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <Coord>{`PREGUNTA ${String(qi + 1).padStart(2, "0")} · ${fuente.corto.toUpperCase()}`}</Coord>
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
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={BUY_HREF}>
            Comprar acceso al cuestionario
          </Btn>
          <Btn kind="light" size="lg" href={START_HREF}>
            Crear cuenta gratis
          </Btn>
        </div>
      </div>
    </section>
  );
}

function Faqs({ fuente }: { fuente: FuenteSeo }) {
  return (
    <section className="relative py-16 lg:py-20" id="faq">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Sobre {fuente.corto} <span className="text-coral-600">y el examen.</span>
            </>
          }
        />
        <div className="mt-10 space-y-3">
          {fuente.faqs.map((f) => (
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

function OtrasFuentes({ actual }: { actual: string }) {
  const otras = FUENTES_SEO.filter((f) => f.slug !== actual);
  return (
    <section className="relative py-14 lg:py-16">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="El resto del temario"
          title={
            <>
              Las otras <span className="text-coral-600">{otras.length} fuentes.</span>
            </>
          }
        />
        <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-[860px] mx-auto">
          {otras.map((f) => (
            <a
              key={f.slug}
              href={`/linea-aerea/${f.slug}`}
              className="group flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-4 py-3.5 hover:border-coral-300 hover:shadow-lift transition-all"
            >
              <span className="w-9 h-9 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0 group-hover:bg-coral-50 group-hover:text-coral-700 transition-colors">
                <Icon n={(f.icon as IconName) ?? "book"} className="w-[18px] h-[18px]" />
              </span>
              <span className="flex-1 text-[14px] font-semibold text-ink/80 leading-snug">
                {f.nombre}
              </span>
              <Icon
                n="chevR"
                className="w-4 h-4 text-ink/30 group-hover:text-coral-600 transition-colors"
              />
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Btn kind="light" size="md" href="/linea-aerea">
            Ver las 5 fuentes del temario
          </Btn>
        </div>
      </div>
    </section>
  );
}

function Aviso() {
  return (
    <section className="relative pb-14">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
          <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma independiente
          de preparación: no está afiliada a ASPA de México, a Aeroméxico ni a ninguna aerolínea o
          autoridad. Los manuales y marcas mencionados (FAA, Jeppesen, OACI) pertenecen a sus
          titulares y se citan únicamente para describir el temario publicado de la convocatoria; el
          banco de práctica de FlightPath es propio y desarrollado de forma independiente.
        </div>
      </div>
    </section>
  );
}

function FuentePage() {
  const { fuente } = Route.useLoaderData();

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
      <Hero fuente={fuente} />
      <QueEs fuente={fuente} />
      <Bloques fuente={fuente} />
      <MateriasRelacionadas fuente={fuente} />
      <PreguntasMuestra fuente={fuente} />
      <Faqs fuente={fuente} />
      <OtrasFuentes actual={fuente.slug} />
      <Aviso />
      <Footer />
    </div>
  );
}
