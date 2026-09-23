import { SectionHead, Icon, Pill, Btn } from "../shared";
import { PRO_MONTHLY_FALLBACK, PRO_ANNUAL_FALLBACK, mesesAhorrados } from "@/lib/pricing";

export function Pricing() {
  const ahorroMeses = mesesAhorrados(PRO_MONTHLY_FALLBACK, PRO_ANNUAL_FALLBACK);

  return (
    <section id="precios" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Precios"
          title={
            <>
              Empieza gratis. <span className="text-coral-600">Vuela Pro.</span>
            </>
          }
          sub="FlightPath Basic es gratuito con funciones esenciales. FlightPath Pro desbloquea toda la plataforma."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white border border-ink/8 p-8 lg:p-10 shadow-card">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500">
              FlightPath Basic
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-6xl tracking-tight text-ink">bash</span>
              <span className="text-ink/45 text-sm">MXN</span>
            </div>
            <p className="text-[14px] text-ink/55 mt-3">
              Crea tu cuenta y conoce la plataforma con funciones limitadas y básicas.
            </p>
            <Btn kind="light" size="lg" icon="arrow" className="w-full mt-7" to="/register">
              Crear cuenta gratis
            </Btn>
            <div className="mt-8 space-y-3">
              {[
                { b: "10 preguntas de práctica por materia" },
                { b: "1 simulador al mes" },
                { b: "Muestra de la biblioteca" },
                { b: "Primer tema de cada materia", soon: true },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon n="check" className="w-4 h-4 text-haze-400 mt-0.5 shrink-0" sw={2.2} />
                  <span className="text-[14px] text-ink/65">
                    {f.b}
                    {f.soon && (
                      <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.1em] font-bold text-haze-500 bg-haze-500/10 rounded-full px-2 py-0.5">
                        Próximamente
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-ink p-8 lg:p-10 shadow-navy overflow-hidden">
            <div
              className="absolute -top-12 -right-12 w-52 h-52 rounded-full"
              style={{
                background: "radial-gradient(closest-side, rgba(199,160,82,0.20), transparent)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400">
                  FlightPath Pro
                </div>
                <Pill tone="light">Acceso completo</Pill>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-white">
                  ${PRO_MONTHLY_FALLBACK.amount.toLocaleString("es-MX")}
                </span>
                <span className="text-white/50 text-sm">{PRO_MONTHLY_FALLBACK.currency} / mes</span>
              </div>
              <div className="mt-2 text-[13px] text-white/55">
                o ${PRO_ANNUAL_FALLBACK.amount.toLocaleString("es-MX")}{" "}
                {PRO_ANNUAL_FALLBACK.currency} al año
                {ahorroMeses > 0 && (
                  <span className="text-coral-400 font-semibold">
                    {" "}
                    — te ahorras {ahorroMeses} meses
                  </span>
                )}
              </div>
              <div className="mt-3 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-white/35 mb-2">
                  Desbloquea hoy mismo
                </div>
                <div className="space-y-2">
                  {[
                    "Banco CIAAC 2,800+ explicado",
                    "Simulador real de 310 preguntas",
                    "Aptitudes COMPASS (Slalom, Memoria…)",
                    "RTARI Inglés por voz ilimitado",
                    "100+ manuales en biblioteca",
                    "Tutor Yaris AI 24/7 sin límites",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon n="check" className="w-3.5 h-3.5 text-coral-400 shrink-0" sw={2.5} />
                      <span className="text-[12.5px] text-white/75">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Btn kind="primary" size="lg" icon="arrow" className="w-full mt-6" to="/register">
                Comenzar con Pro
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
