import { useState, useEffect, ReactNode } from "react";
import { PlaneField, SectionHead, Icon, Logo, Coord, Btn } from "../shared";

export function Showcase() {
  const students = [
    {
      name: "Andre",
      init: "AS",
      prog: 68,
      missMin: 45,
      missDone: 20,
      subj: "Meteorología",
      desc: "Formación de nubes y fenómenos",
      time: "Hoy · 7:00 PM",
      sim: "Navegación VOR",
      focus: "Meteorología",
      streak: 14,
      acc: 74,
    },
    {
      name: "María",
      init: "MG",
      prog: 42,
      missMin: 60,
      missDone: 38,
      subj: "Aerodinámica",
      desc: "Sustentación y resistencia",
      time: "Hoy · 9:00 PM",
      sim: "Aproximación ILS",
      focus: "Aerodinámica",
      streak: 8,
      acc: 81,
    },
    {
      name: "Diego",
      init: "DR",
      prog: 85,
      missMin: 30,
      missDone: 30,
      subj: "Navegación",
      desc: "Cartas y radioayudas",
      time: "Mañana · 6:00 AM",
      sim: "Ruta VFR",
      focus: "Reglamentación",
      streak: 23,
      acc: 88,
    },
    {
      name: "Sofía",
      init: "SP",
      prog: 57,
      missMin: 45,
      missDone: 12,
      subj: "Reglamentación",
      desc: "Espacio aéreo y reglas",
      time: "Hoy · 8:30 PM",
      sim: "Emergencias",
      focus: "Sistemas",
      streak: 5,
      acc: 69,
    },
  ];
  const [si, setSi] = useState(0);
  const [scan, setScan] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setScan(true);
      setTimeout(() => setSi((v) => (v + 1) % students.length), 1100);
      setTimeout(() => setScan(false), 1550);
    }, 7200);
    return () => clearInterval(id);
  }, [students.length]);
  const s = students[si];
  const C = 97.4;
  
  const Fade = ({
    k,
    children,
    className = "",
  }: {
    k: ReactNode;
    children: ReactNode;
    className?: string;
  }) => (
    <span
      key={String(k)}
      className={`inline-block ${className}`}
      style={{ animation: "softIn 0.85s ease both" }}
    >
      {children}
    </span>
  );

  return (
    <section className="relative py-16 sm:py-24 lg:py-32" id="como-funciona">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Tu cabina de estudio"
          title={
            <>
              Una cabina de estudio <span className="text-coral-600">para toda tu carrera.</span>
            </>
          }
          sub="Estudia, practica, resuelve dudas y sigue tu progreso en cada etapa — del CIAAC a tu aeronave — sin cambiar de aplicación."
        />
        <div className="mt-7 flex justify-center">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-burgundy/15 bg-white/70 backdrop-blur px-4 py-2 text-center shadow-card">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-burgundy animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-burgundy" />
            </span>
            <span className="text-[12.5px] font-semibold text-ink/70">
              Análisis personalizado para cada alumno —
            </span>
            <Fade k={s.name} className="text-[12.5px] font-bold text-burgundy">
              {s.name}
            </Fade>
          </div>
        </div>

        <div className="mt-8 relative rounded-[28px] border border-ink/8 bg-white/70 backdrop-blur-sm shadow-lift p-4 lg:p-6 overflow-hidden">
          <div
            className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${scan ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(90,134,203,0.14), transparent)",
                animation: scan ? "scanSweep 1.4s ease-in-out" : "none",
              }}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-ink text-white px-3.5 py-1.5 text-[11.5px] font-semibold shadow-navy">
              <span className="w-1.5 h-1.5 rounded-full bg-cherry animate-pulse-dot" /> Analizando
              perfil de {students[si % students.length].name}…
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-2 lg:px-3 py-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="hidden sm:inline text-[12px] text-ink/40 font-mono">
                / <Fade k={s.name}>{s.name.toLowerCase()}</Fade>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">
                <Coord>HDG 047° · GS 142kt</Coord>
              </span>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-haze-100 grid place-items-center text-ink/50">
                  <Icon n="bell" className="w-4 h-4" />
                </span>
                <span className="w-8 h-8 rounded-full bg-ink grid place-items-center text-white text-[12px] font-bold font-display">
                  <Fade k={s.init}>{s.init}</Fade>
                </span>
              </div>
            </div>
          </div>

          <div className="px-2 lg:px-3 mb-5">
            <h3 className="font-display text-3xl lg:text-4xl tracking-tight text-ink">
              ¡Hola,{" "}
              <Fade k={s.name} className="text-burgundy">
                {s.name}
              </Fade>
              !
            </h3>
            <p className="text-[15px] text-ink/50 mt-1">
              Tu ruta se recalcula con cada sesión — esto es lo que te toca hoy.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:row-span-2 relative overflow-hidden rounded-2xl bg-ink p-6 shadow-navy hover-lift">
              <div
                className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full"
                style={{
                  background: "radial-gradient(closest-side, rgba(124,160,216,0.22), transparent)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-bold mb-7">
                  <Icon n="shield" className="w-4 h-4 text-coral-400" /> Tu progreso general
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth="2.8"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="#C7A052"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        strokeDashoffset={C * (1 - s.prog / 100)}
                        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[42px] leading-none text-white">
                          <Fade k={s.prog}>{s.prog}%</Fade>
                        </div>
                        <div className="text-[11px] text-white/45 uppercase tracking-[0.15em] mt-1">
                          completado
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-bold">
                      Racha
                    </div>
                    <div className="font-display text-xl text-white">
                      <Fade k={s.streak}>{s.streak}</Fade>{" "}
                      <span className="text-[12px] text-white/55">días</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-bold">
                      Aciertos
                    </div>
                    <div className="font-display text-xl text-white">
                      <Fade k={s.acc}>{s.acc}%</Fade>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-white border border-ink/8 p-6 shadow-card hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                    <Icon n="target" className="w-4 h-4 text-coral-600" /> Misión del día ·
                    personalizada
                  </div>
                  <p className="text-[14px] text-ink/55">Hoy enfócate en</p>
                  <div className="font-display text-3xl text-coral-600 tracking-tight my-0.5">
                    <Fade k={s.focus}>{s.focus}</Fade>
                  </div>
                  <p className="text-[13.5px] text-ink/50">
                    Tu punto más débil esta semana. {s.missMin} min recomendados.
                  </p>
                  <div className="mt-5">
                    <div className="flex justify-between text-[12px] text-ink/45 mb-1.5">
                      <span className="font-mono">
                        {s.missDone} / {s.missMin} min
                      </span>
                      <span>{Math.round((s.missDone / s.missMin) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-haze-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-coral-600"
                        style={{
                          width: `${Math.round((s.missDone / s.missMin) * 100)}%`,
                          transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-ink grid place-items-center shadow-navy">
                  <Icon n="target" className="w-9 h-9 text-coral-400" sw={1.4} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card hover-lift">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="book" className="w-4 h-4 text-coral-600" /> Próxima sesión
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-haze-100 grid place-items-center text-lapis">
                  <Icon n="compass" className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-ink text-[15px]">
                    <Fade k={s.subj}>{s.subj}</Fade>
                  </div>
                  <div className="text-[12.5px] text-ink/45">{s.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[12.5px] text-coral-700 font-medium">
                <Icon n="clock" className="w-3.5 h-3.5" /> {s.time}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card hover-lift">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="plane" className="w-4 h-4 text-coral-600" /> Simulador rápido
              </div>
              <div className="text-[12.5px] text-ink/45">Última sesión</div>
              <div className="font-semibold text-ink text-[15px] mb-4">
                <Fade k={s.sim}>{s.sim}</Fade>
              </div>
              <Btn kind="soft" size="sm" icon="arrow" className="w-full">
                Continuar simulador
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
