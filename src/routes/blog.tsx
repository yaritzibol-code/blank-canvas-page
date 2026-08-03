import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Eyebrow,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  type IconName,
} from "./index";

/**
 * Blog e historias — mismo sistema de diseño que la portada (Nav, Footer,
 * cielo animado y tarjetas). Los artículos están en preparación: se muestran
 * como "próximamente", sin inventar contenido que aún no existe.
 */

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog e historias — FlightPath" },
      { name: "description", content: "Guías de estudio para el CIAAC, historias de pilotos y novedades de la plataforma FlightPath." },
      { property: "og:title", content: "Blog e historias — FlightPath" },
      { property: "og:description", content: "Guías de estudio, historias de pilotos y novedades de FlightPath." },
      { property: "og:url", content: "https://flightpath.mx/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/blog" }],
  }),
});

const PROXIMOS: { tag: string; icon: IconName; t: string; sub: string }[] = [
  {
    tag: "Guía de estudio",
    icon: "compass",
    t: "Cómo organizar tus últimas 4 semanas antes del CIAAC",
    sub: "Un plan semana a semana para llegar al examen con el temario dominado y sin desvelos de pánico.",
  },
  {
    tag: "Historias",
    icon: "heart",
    t: "Historias de pilotos: de la primera sesión al examen aprobado",
    sub: "Las rutas reales de estudiantes de la primera generación FlightPath, contadas por ellos.",
  },
  {
    tag: "Materias",
    icon: "book",
    t: "Meteorología sin miedo: los 10 conceptos que más se preguntan",
    sub: "Nubes, frentes y vientos — lo que el examen pregunta una y otra vez, explicado claro.",
  },
  {
    tag: "Bienestar",
    icon: "flame",
    t: "Estudiar sin quemarte: rachas, descanso y constancia real",
    sub: "Cómo sostener el ritmo semanas enteras sin sacrificar sueño ni motivación.",
  },
];

function BlogPage() {
  useEffect(() => {
    document.body.classList.add("theme-hueso");
    return () => { document.body.classList.remove("theme-hueso"); };
  }, []);

  return (
    <>
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative">
          <PlaneField count={18} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-16 lg:pt-24 pb-14 lg:pb-16">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
              <div className="relative z-10">
                <Eyebrow>Blog de FlightPath</Eyebrow>
                <h1 className="font-display mt-5 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  Guías, historias<br /><span className="text-coral-600">y bitácoras de vuelo.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  Todo lo que aprendemos preparando pilotos para el CIAAC — técnicas de estudio,
                  materias difíciles y las historias de quienes ya van en ruta.
                </p>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <PathyBubble size={210} />
              </div>
            </div>
          </div>
        </section>

        {/* Artículos en preparación */}
        <section className="relative pb-20 lg:pb-24">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-7">
              <Coord>PRIMERA EDICIÓN · EN PREPARACIÓN</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {PROXIMOS.map((p) => (
                <article key={p.t} className="group relative rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-7 lg:p-8 overflow-hidden transition-all duration-300 hover:shadow-lift hover:-translate-y-1">
                  <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.25), transparent)" }} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Pill tone="coral"><Icon n={p.icon} className="w-3 h-3" />{p.tag}</Pill>
                      <span className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-haze-400">Próximamente</span>
                    </div>
                    <h2 className="font-display mt-4 text-[20px] lg:text-[22px] leading-snug tracking-tight text-ink">
                      {p.t}
                    </h2>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink/55">{p.sub}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8">
            <div className="relative rounded-[28px] bg-ink shadow-navy overflow-hidden p-9 lg:p-12 text-center">
              <div className="absolute -top-14 -right-10 w-56 h-56 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.22), transparent)" }} />
              <div className="relative">
                <h2 className="font-display text-3xl lg:text-[40px] leading-tight tracking-tight text-white">
                  Mientras escribimos,<br />tu preparación <span className="text-coral-400">no espera.</span>
                </h2>
                <p className="mt-4 text-[15px] text-white/60 max-w-md mx-auto leading-relaxed">
                  Los primeros artículos vienen en camino. Tu ruta al CIAAC puede empezar hoy.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">Únete a FlightPath</Btn>
                  <Btn kind="outlineLight" size="lg" href="/#historias">Ver las historias</Btn>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
