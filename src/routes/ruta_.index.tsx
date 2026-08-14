/**
 * Hub de Learning Paths — /ruta
 *
 * Selector de rutas al estilo de los demás módulos (una card por curso, como
 * las aeronaves en Manuales): nombre, blurb, cifras y el avance del usuario,
 * con CTA "Empezar" / "Continuar". El nav del dashboard apunta aquí.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { lpCompletedLessons, useRequireAuth, useStore } from "@/lib/store";
import { LP_COURSES } from "@/lib/lp/registry";

export const Route = createFileRoute("/ruta_/")({
  head: () => ({
    meta: [{ title: "Learning paths · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: RutaHubPage,
});

function RutaHubPage() {
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const userId = user?.id ?? "";
  const progreso = useStore(() =>
    LP_COURSES.map((c) => ({
      slug: c.slug,
      done: lpCompletedLessons(userId, c.temaPrefix).length,
    })),
  );

  if (!ready || !user) return <div className="min-h-screen" style={{ background: "#FBFAF7" }} />;

  return (
    <div className="min-h-screen" style={{ background: "#FBFAF7" }}>
      {/* Barra superior */}
      <div className="bg-ink-950">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-85"
            aria-label="Volver al dashboard"
          >
            <img
              src="/img/flightpath-logo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-cover"
            />
            <span className="font-display text-[18px] font-bold tracking-tight">
              Flight<span className="text-coral-300">Path</span>
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-[12.5px] font-bold text-white/85 transition-colors hover:bg-white/10"
          >
            ← Mi dashboard
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 160% at 85% -20%, #33527F 0%, #22375C 45%, #1B2B4A 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto flex max-w-[1080px] items-center gap-6 px-5 py-12 sm:px-8 lg:py-14">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-coral-300/70" />
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral-300">
                Learning paths
              </span>
            </div>
            <h1 className="font-display mt-4 text-[34px] leading-[1.02] tracking-tight text-white sm:text-[46px]">
              Elige tu{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  backgroundImage: "linear-gradient(92deg, #F2AEBC 10%, #7CA0D8 90%)",
                }}
              >
                ruta de aprendizaje
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-white/65">
              Cursos completos explicados paso a paso, con evaluación derivada únicamente de lo que
              cada lección enseña. Tu avance se guarda por ruta.
            </p>
          </div>
          <div className="hidden shrink-0 md:block" aria-hidden>
            <img
              src="/img/yaris-mini.png"
              alt=""
              width={180}
              height={180}
              className="h-auto w-[160px] drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)] lg:w-[180px]"
            />
          </div>
        </div>
      </section>

      {/* Selector de rutas */}
      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8">
        <div className="relative z-10 -mt-16 grid gap-4 md:grid-cols-2">
          {LP_COURSES.map((c) => {
            const done = progreso.find((p) => p.slug === c.slug)?.done ?? 0;
            const percent = Math.round((done / c.lessonCount) * 100);
            const empezado = done > 0;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => void navigate({ to: "/ruta/$curso", params: { curso: c.slug } })}
                className="group flex h-full flex-col rounded-3xl border border-ink/8 bg-white p-6 text-left shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-ink-950 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
                    {c.moduleCount} MÓDULOS
                  </span>
                  <span
                    className={`text-[11.5px] font-bold ${
                      percent === 100 ? "text-lapis" : empezado ? "text-coral-700" : "text-haze-400"
                    }`}
                  >
                    {percent === 100 ? "Completada" : empezado ? "En curso" : "Nueva"}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-[22px] leading-snug tracking-tight text-ink-950">
                  {c.nombre}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-haze-600">{c.descripcion}</p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-haze-500">
                    <span>{c.lessonCount} lecciones</span>
                    <span>{c.questionCount} preguntas derivadas</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, #6C0820, #E0879A)",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[12px] text-haze-500">
                      {done} de {c.lessonCount} lecciones · {percent}%
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-600 px-4 py-1.5 text-[12.5px] font-bold text-white transition-opacity group-hover:opacity-90">
                      {empezado ? "Continuar" : "Empezar"} <Icon n="arrow" size={13} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
