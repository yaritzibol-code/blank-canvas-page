import { useState, useEffect } from "react";
import { Icon, IconName } from "../shared";

export function PathyPhone() {
  const msgs: { ic: IconName; t: string; time: string }[] = [
    {
      ic: "book",
      t: "Hora de estudiar. Te dejé lista una sesión de 15 min de Meteorología. ¿Despegamos?",
      time: "7:00 p.m.",
    },
    {
      ic: "flame",
      t: "¡No pierdas tu racha de 14 días! Te faltan solo 12 min para cerrar el día.",
      time: "9:30 p.m.",
    },
    {
      ic: "chart",
      t: "Tu análisis de esta semana: subiste 8% en Aerodinámica. ¡Vas increíble, sigue así!",
      time: "Dom 6:00 p.m.",
    },
    {
      ic: "plane",
      t: "Faltan 23 días para tu CIAAC. Hoy toca Navegación — yo te acompaño paso a paso.",
      time: "6:15 a.m.",
    },
  ];
  const [n, setN] = useState(1);
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (typing) id = setTimeout(() => setTyping(false), 1400);
    else
      id = setTimeout(() => {
        setN((v) => (v % msgs.length) + 1);
        setTyping(true);
      }, 2400);
    return () => clearTimeout(id);
  }, [typing, msgs.length]);
  const visible = msgs.slice(Math.max(0, n - 3), n);

  return (
    <div className="relative mx-auto w-[272px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-cherry/25 blur-3xl" />
      <div className="relative rounded-[2.4rem] bg-ink p-2.5 shadow-navy ring-1 ring-white/10">
        <div
          className="relative rounded-[1.9rem] overflow-hidden h-[486px] flex flex-col"
          style={{ background: "linear-gradient(180deg,#EEE1C5 0%, #FBF7EC 40%, #EAF0FA 100%)" }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-ink z-20" />
          <div className="relative z-10 bg-lapis text-white px-3.5 pt-7 pb-3 flex items-center gap-2.5 shadow-md">
            <Icon n="chevD" className="w-4 h-4 rotate-90 text-white/70" />
            <span className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0 bg-ink">
              <img
                src="/img/pathy-small.png"
                alt="Avatar de Pathy, copiloto de estudio"
                className="w-full h-full object-cover scale-110"
              />
            </span>
            <div className="leading-tight">
              <div className="text-[13.5px] font-bold flex items-center gap-1.5">Pathy</div>
              <div className="text-[10.5px] text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cherry animate-pulse-dot" /> tu
                copiloto · en línea
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-white/70">
              <Icon n="audio" className="w-4 h-4" />
              <Icon n="radio" className="w-4 h-4" />
            </div>
          </div>
          <div className="relative flex-1 px-3 py-4 flex flex-col justify-end gap-2.5 overflow-hidden">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9.5px] uppercase tracking-[0.16em] font-bold text-ink/35 bg-white/60 rounded-full px-2.5 py-1">
              Recordatorios de Pathy
            </div>
            {visible.map((m, i) => (
              <div key={`${n}-${i}`} className="flex items-end gap-2 animate-flip">
                <span className="w-6 h-6 rounded-full bg-burgundy grid place-items-center shrink-0">
                  <Icon n={m.ic} className="w-3 h-3 text-white" sw={2} />
                </span>
                <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-card">
                  <p className="text-[12.5px] text-ink/85 leading-snug">{m.t}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-ink/35">
                    {m.time}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-silver"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 13l3.5 3.5L11 9" />
                      <path d="M11 16l1 1L22 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2 animate-flip">
                <span className="w-6 h-6 rounded-full bg-burgundy grid place-items-center shrink-0">
                  <Icon n="spark" className="w-3 h-3 text-white" />
                </span>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-card flex items-center gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-burgundy/55 animate-pulse-dot"
                      style={{ animationDelay: `${d * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative z-10 px-3 py-2.5 bg-white/70 backdrop-blur flex items-center gap-2">
            <div className="flex-1 h-9 rounded-full bg-white border border-ink/10 flex items-center px-3.5 text-[12px] text-ink/35">
              Mensaje a Pathy…
            </div>
            <span className="w-9 h-9 rounded-full bg-burgundy text-white grid place-items-center shrink-0">
              <Icon n="audio" className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-burgundy text-white text-[11px] font-bold rounded-full px-2.5 py-1 shadow-navy animate-float-y-sm">
        1 nuevo
      </div>
    </div>
  );
}
