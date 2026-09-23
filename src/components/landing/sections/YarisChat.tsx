import { useState, useEffect } from "react";
import { PlaneField, SectionHead, Icon, IconName, Btn } from "../shared";

export function YarisChat() {
  type Scene = {
    type: string;
    header: string;
    title: string;
    opts?: string[];
    correct?: number;
    reply: { title: string; body: string; ref?: string; tags?: string[] };
  };
  const scenes: Scene[] = [
    {
      type: "question",
      header: "Meteorología · Pregunta 23 de 50",
      title: "¿Qué fenómeno causa la formación de nubes cumulonimbus?",
      opts: ["Evaporación", "Convección", "Subsidencia", "Radiación"],
      correct: 1,
      reply: {
        title: "¡Correcto! La respuesta es B) Convección.",
        body: "El aire cálido asciende, se enfría, se condensa y forma cumulonimbus — responsables de las tormentas eléctricas.",
        ref: "Meteorología para Pilotos · Cap. 5 · Pág. 142",
      },
    },
    {
      type: "mnemo",
      header: "Nemotecnia · Antes de cada vuelo",
      title: "Chequea tu estado con I-M-SAFE",
      reply: {
        title: "Nemotecnia: I-M-SAFE",
        body: "Illness · Medication · Stress · Alcohol · Fatigue · Emotion. Una palabra, seis chequeos antes de despegar.",
        tags: ["Checklist", "Factor humano"],
      },
    },
    {
      type: "real",
      header: "Ejemplo de la vida real",
      title: "Por qué los procedimientos no son opcionales",
      reply: {
        title: "Piénsalo así:",
        body: "Un procedimiento existe porque alguien aprendió algo por las malas. Seguirlo es respetar esa lección — es tu seguro de vida.",
        tags: ["Disciplina", "Criterio"],
      },
    },
    {
      type: "support",
      header: "Apoyo cuando lo necesitas",
      title: "¿Te sientes abrumada hoy?",
      reply: {
        title: "Respira. Tú puedes.",
        body: "Un mal día de estudio no define tu carrera. Toma 10 minutos, hidrátate y volvemos. Pathy y yo te esperamos aquí.",
        tags: ["Bienestar", "Pathy contigo"],
      },
    },
  ];
  const phaseDur = [1500, 1100, 1100, 3600];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (phase < 3) setPhase(phase + 1);
      else {
        setPhase(0);
        setIdx((idx + 1) % scenes.length);
      }
    }, phaseDur[phase]);
    return () => clearTimeout(id);
  }, [phase, playing, idx, scenes.length, phaseDur]);
  useEffect(() => {
    setPhase(0);
  }, [idx]);

  const sc = scenes[idx];
  const isQ = sc.type === "question";
  const showPick = phase >= 1,
    showTyping = phase === 2,
    showAnswer = phase >= 3;
  const letters = ["A", "B", "C", "D"];
  const bullets: { ic: IconName; t: string }[] = [
    { ic: "book", t: "Cita el libro, capítulo y página exactas." },
    { ic: "brain", t: "Explica con ejemplos de la vida real." },
    { ic: "spark", t: "Usa nemotecnias y mapas mentales." },
    { ic: "target", t: "Tips de estudio personalizados para ti." },
    { ic: "heart", t: "Apoyo emocional cuando más lo necesitas." },
  ];

  return (
    <section className="relative py-24 lg:py-32" id="yaris">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Conoce a Yaris"
          title={
            <>
              Tu tutor IA, <span className="text-burgundy">en acción.</span>
            </>
          }
          sub="Mira cómo Yaris responde, explica y te acompaña. No es un chatbot — es un copiloto que sabe cómo aprendes."
        />

        <div className="mt-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 space-y-7">
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-burgundy/5 border border-burgundy/10 grid place-items-center text-burgundy shrink-0">
                  <Icon n={b.ic} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink leading-tight">{b.t}</h4>
                  <p className="text-[13.5px] text-ink/45 mt-1 leading-relaxed">
                    Yaris entiende el contexto de tu estudio y te da la respuesta que necesitas en ese momento.
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Btn kind="navy" size="lg" icon="arrow" to="/register">
                Probar a Yaris gratis
              </Btn>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-10 rounded-[3rem] bg-burgundy/5 blur-3xl" />
            <div className="relative rounded-3xl bg-ink shadow-navy border border-white/5 overflow-hidden">
              <div className="bg-white/[0.03] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg overflow-hidden bg-burgundy ring-2 ring-white/10 shrink-0">
                    <img
                      src="/img/yaris-face.png"
                      alt="Yaris AI"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-white leading-none">Yaris AI</div>
                    <div className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-wider">
                      {sc.header}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-8 h-8 rounded-full bg-white/5 grid place-items-center text-white/60 hover:text-white transition-colors"
                >
                  <Icon n={playing ? "close" : "play"} className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 min-h-[460px] flex flex-col justify-end gap-5">
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 animate-flip">
                  <h4 className="text-[15px] text-white leading-snug">{sc.title}</h4>
                  {isQ && sc.opts && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {sc.opts.map((o, i) => (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-all ${showPick && i === sc.correct ? "bg-burgundy text-white border-burgundy shadow-coral" : "bg-white/[0.03] text-white/50 border-white/10"}`}
                        >
                          <span className="opacity-40 mr-1.5">{letters[i]}</span> {o}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showAnswer && (
                  <div className="rounded-2xl bg-burgundy/15 border border-burgundy/25 p-5 animate-flip-up shadow-navy">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-coral-400 mb-2">
                      <Icon n="spark" className="w-3.5 h-3.5" /> Explicación de Yaris
                    </div>
                    <h5 className="text-[14px] font-bold text-white mb-1.5">{sc.reply.title}</h5>
                    <p className="text-[13px] text-white/70 leading-relaxed">{sc.reply.body}</p>
                    {sc.reply.ref && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-white/40 flex items-center gap-1.5">
                        <Icon n="book" className="w-3 h-3" /> {sc.reply.ref}
                      </div>
                    )}
                    {sc.reply.tags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sc.reply.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40 border border-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showTyping && (
                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-[11px] text-white/30 font-mono animate-pulse-dot">
                      Yaris está escribiendo…
                    </span>
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/10 px-4 flex items-center text-[13px] text-white/20">
                    Pregúntale a Yaris…
                  </div>
                  <Btn kind="primary" size="sm" icon="arrow">
                    Siguiente
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
