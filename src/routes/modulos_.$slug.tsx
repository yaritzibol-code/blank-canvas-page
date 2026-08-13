import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { moduloBySlug, MODULOS_LANDING, type ModuloLanding } from "@/lib/seo/modulos-landing";
import { MOCKUPS } from "@/components/landing/modulo-mockups";
import {
  AeroBackdrop,
  Btn,
  Coord,
  CountUp,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  Reveal,
  SectionHead,
  type IconName,
} from "@/components/landing/shared";

/**
 * Landing de producto /modulos/$slug — "cómo se ve" cada módulo de FlightPath,
 * con mockup animado, features, qué incluye y FAQ. Intención de producto, no
 * de examen: la búsqueda de examen la capturan las guías (`guiaHref`), a las
 * que cada página enlaza. Contenido en `@/lib/seo/modulos-landing`.
 */

const BASE = "https://flightpath.mx";

export const Route = createFileRoute("/modulos_/$slug")({
  loader: ({ params }) => {
    const modulo = moduloBySlug(params.slug);
    if (!modulo) throw notFound();
    return { modulo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Módulos — FlightPath" }] };
    const { modulo } = loaderData;
    const canonical = `${BASE}/modulos/${modulo.slug}`;
    const title = `${modulo.nombre} — así se ve el módulo | FlightPath`;
    return {
      meta: [
        { title },
        { name: "description", content: modulo.descripcion },
        { name: "keywords", content: modulo.keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: modulo.descripcion },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: modulo.descripcion },
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
                mainEntity: modulo.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "WebPage",
                name: title,
                description: modulo.descripcion,
                inLanguage: "es-MX",
                url: canonical,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  { "@type": "ListItem", position: 2, name: modulo.nombre, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: ModuloPage,
});

function ModuloPage() {
  const { modulo } = Route.useLoaderData() as { modulo: ModuloLanding };
  const Mockup = MOCKUPS[modulo.slug];
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const otros = MODULOS_LANDING.filter((m) => m.slug !== modulo.slug).slice(0, 3);

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop />
      <Nav />
      <main>
        {/* Hero: pitch + mockup "así se ve" */}
        <section className="relative">
          <PlaneField count={20} />
          <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-14 lg:pb-20">
            <nav
              aria-label="Breadcrumb"
              className="text-[12.5px] text-ink/45 flex items-center gap-1.5 mb-6"
            >
              <a href="/" className="hover:text-ink transition-colors">
                Inicio
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <a href="/#ruta" className="hover:text-ink transition-colors">
                Módulos
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <span className="text-ink/70 font-semibold">{modulo.nombre}</span>
            </nav>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <Pill tone="coral">{modulo.pill}</Pill>
                  <Coord>MÓDULO · {modulo.nombre.toUpperCase()}</Coord>
                </div>
                <h1 className="font-display mt-5 text-[38px] sm:text-[50px] lg:text-[58px] leading-[1.0] tracking-tight text-ink">
                  {modulo.titulo}
                  <span className="block text-coral-600 mt-1">{modulo.tituloCoral}</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  {modulo.descripcion}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">
                    Comenzar gratis
                  </Btn>
                  <Btn kind="light" size="lg" href={modulo.guiaHref}>
                    {modulo.guiaLabel}
                  </Btn>
                </div>
              </div>
              <div className="relative animate-float-y-sm">{Mockup && <Mockup />}</div>
            </div>

            {/* Cifras del módulo */}
            <Reveal>
              <div className="mt-14 lg:mt-16 grid sm:grid-cols-3 gap-4">
                {modulo.stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5 flex items-center gap-4"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <div className="font-display text-[34px] lg:text-[40px] leading-none tracking-tight text-coral-600">
                      <CountUp value={s.n} />
                    </div>
                    <div className="text-[12.5px] font-semibold text-ink/55 leading-snug">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Cómo funciona: 3 pasos */}
        <section className="relative py-14 lg:py-18">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <Coord>CÓMO FUNCIONA · TRES PASOS</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 relative">
              <div
                aria-hidden
                className="hidden md:block absolute top-[34px] left-[12%] right-[12%] border-t-2 border-dashed border-ink/12"
              />
              {modulo.pasos.map((p, i) => (
                <Reveal key={p.t} delay={i * 140}>
                  <div className="relative rounded-2xl bg-white border border-ink/8 p-7 shadow-card hover-lift h-full">
                    <div className="w-[68px] h-[68px] rounded-2xl bg-ink text-white grid place-items-center mb-5 relative">
                      <span className="font-mono text-[15px] tracking-[0.14em]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {i === modulo.pasos.length - 1 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-coral-500 animate-pulse-dot" />
                      )}
                    </div>
                    <h3 className="font-display text-[19px] tracking-tight text-ink">{p.t}</h3>
                    <p className="text-[14px] text-ink/55 mt-2 leading-relaxed">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Qué hace el módulo"
              title={
                <>
                  Construido para que <span className="text-coral-600">sí funcione.</span>
                </>
              }
            />
            <div className="mt-12 grid sm:grid-cols-2 gap-4">
              {modulo.features.map((f, i) => (
                <Reveal key={f.t} delay={(i % 2) * 120}>
                  <div className="group rounded-2xl bg-white border border-ink/8 p-7 shadow-card hover-lift h-full">
                    <div className="w-12 h-12 rounded-xl bg-coral-50 grid place-items-center text-coral-600 group-hover:bg-coral-600 group-hover:text-white transition-colors mb-5">
                      <Icon n={f.icon as IconName} className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl tracking-tight text-ink">{f.t}</h3>
                    <p className="text-[14.5px] text-ink/55 mt-2 leading-relaxed">{f.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {modulo.incluye.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-ink/10 bg-white/80 px-3.5 py-1.5 text-[12.5px] font-semibold text-ink/65"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Detalle: el catálogo del módulo, pieza por pieza */}
        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-[32px] bg-ink shadow-navy px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
                <PlaneField count={14} color="255,255,255" />
                <div
                  aria-hidden
                  className="absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full animate-breathe"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(242,174,188,0.14), transparent)",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <Coord light>{modulo.detalle.eyebrow.toUpperCase()}</Coord>
                    <span className="flex-1 h-px bg-white/10" />
                  </div>
                  <h2 className="font-display mt-5 text-[30px] sm:text-[38px] lg:text-[44px] leading-[1.02] tracking-tight text-white max-w-3xl">
                    {modulo.detalle.titulo}{" "}
                    <span className="text-coral-300">{modulo.detalle.tituloCoral}</span>
                  </h2>
                  <p className="mt-4 text-[15.5px] text-white/55 leading-relaxed max-w-2xl">
                    {modulo.detalle.sub}
                  </p>
                  <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modulo.detalle.items.map((it, i) => (
                      <Reveal key={it.t} delay={Math.min(i, 8) * 70}>
                        <div className="group rounded-2xl bg-white/[0.05] border border-white/10 px-5 py-4 h-full hover:bg-white/[0.09] transition-colors">
                          {it.k && (
                            <div className="font-mono text-[10px] tracking-[0.18em] text-coral-300/80 mb-2">
                              {it.k}
                            </div>
                          )}
                          <div className="text-[15px] font-semibold text-white leading-snug">
                            {it.t}
                          </div>
                          {it.d && (
                            <p className="mt-1.5 text-[12.5px] text-white/45 leading-relaxed">
                              {it.d}
                            </p>
                          )}
                        </div>
                      </Reveal>
                    ))}
                  </div>
                  {modulo.detalle.nota && (
                    <div className="mt-8 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse-dot shrink-0" />
                      <span className="font-mono text-[10.5px] tracking-[0.16em] text-white/40">
                        {modulo.detalle.nota}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-14 lg:py-18" id="faq">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Preguntas frecuentes"
              title={
                <>
                  Antes de <span className="text-coral-600">entrar.</span>
                </>
              }
            />
            <div className="mt-10 space-y-3">
              {modulo.faqs.map((f) => (
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

        {/* Otros módulos */}
        <section className="relative py-12">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Coord>MÁS MÓDULOS DE LA PLATAFORMA</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {otros.map((m) => (
                <a
                  key={m.slug}
                  href={`/modulos/${m.slug}`}
                  className="group rounded-2xl bg-white/85 border border-ink/8 p-5 shadow-card hover-lift"
                >
                  <Pill tone="coral">{m.pill}</Pill>
                  <div className="font-display text-[17px] text-ink mt-3 tracking-tight">
                    {m.nombre}
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                    Más información <Icon n="chevR" className="w-3.5 h-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section className="relative py-16 lg:py-24">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <PathyBubble size={110} />
            </div>
            <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
              Pruébalo hoy,
              <span className="block text-coral-600">gratis y sin tarjeta.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
              La mejor forma de conocer el módulo es usarlo: crea tu cuenta y en dos minutos estás
              adentro.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Crear mi cuenta gratis
              </Btn>
              <Btn kind="light" size="lg" href="/precios">
                Ver precios
              </Btn>
            </div>
          </div>
        </section>

        {modulo.aviso && (
          <section className="relative pb-14">
            <div className="mx-auto max-w-[860px] px-6 lg:px-8">
              <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
                <strong className="text-ink/70">Aviso.</strong> {modulo.aviso}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
