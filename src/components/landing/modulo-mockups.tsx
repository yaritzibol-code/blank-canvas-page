/**
 * Mockups "cómo se ve" de cada módulo para las landings /modulos/$slug.
 *
 * Recreaciones en JSX del look real de cada módulo (mismo lenguaje visual que
 * los mockups del home: paneles ink, coral, floats y pulsos). Son ilustrativos
 * — los datos mostrados son de ejemplo, no de usuarios reales.
 */
import { Coord, Icon, Pill } from "@/components/landing/shared";

function Ventana({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-4 rounded-[32px]"
        style={{
          background: "radial-gradient(closest-side, rgba(124,160,216,0.16), transparent)",
        }}
      />
      <div className="relative rounded-3xl bg-ink shadow-navy p-5 lg:p-6 border border-white/5">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Coord light>{titulo}</Coord>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-coral-400/70" />
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function MockCiaac() {
  return (
    <Ventana titulo="BANCO · METEOROLOGÍA">
      <div className="flex items-center justify-between mb-3">
        <Pill tone="light">Pregunta 12 / 20</Pill>
        <span className="text-[11px] font-mono text-white/40">Aciertos 8/11</span>
      </div>
      <p className="text-[15px] text-white leading-snug">
        Una nube cumulonimbus madura se caracteriza principalmente por:
      </p>
      <div className="mt-4 space-y-2">
        {[
          ["A", "Corrientes descendentes únicamente", false],
          ["B", "Corrientes ascendentes y descendentes simultáneas", true],
          ["C", "Ausencia de turbulencia en su interior", false],
        ].map(([l, txt, sel], i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${sel ? "bg-coral-600/15 border-coral-400/60" : "bg-white/[0.03] border-white/10"}`}
          >
            <span
              className={`w-6 h-6 rounded-lg grid place-items-center text-[11px] font-bold font-mono shrink-0 ${sel ? "bg-coral-600 text-white" : "border border-white/20 text-white/55"}`}
            >
              {l as string}
            </span>
            <span className="text-[12.5px] text-white/85">{txt as string}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.06] border border-coral-400/25 px-4 py-3 animate-float-y-sm">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-coral-400 mb-1">
          <Icon n="check" className="w-3.5 h-3.5" /> Correcto · Por qué
        </div>
        <p className="text-[12px] text-white/70 leading-relaxed">
          En la etapa madura coexisten ascendentes y descendentes — de ahí su turbulencia severa y
          la regla de nunca atravesarla.
        </p>
      </div>
    </Ventana>
  );
}

export function MockRtari() {
  return (
    <Ventana titulo="ENTREVISTA · RTARI">
      <div className="flex items-center justify-between mb-3">
        <Pill tone="light">Sinodal B · Exigente</Pill>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-coral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse-dot" /> REC 06:12
        </span>
      </div>
      <div className="space-y-2.5">
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/40 font-bold mb-0.5">
            Sinodal
          </div>
          <p className="text-[12.5px] text-white/85">
            Tell me about a flight where the weather didn&apos;t cooperate. What did you decide?
          </p>
        </div>
        <div className="max-w-[85%] ml-auto rounded-2xl rounded-tr-md bg-coral-600/20 border border-coral-400/25 px-4 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-coral-300 font-bold mb-0.5">
            Tú
          </div>
          <p className="text-[12.5px] text-white/85">
            We diverted to our alternate after the ceiling dropped below minimums…
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/40 font-mono pl-1">
          <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-white/40" /> el sinodal
          está repreguntando…
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-white/40 mb-2">
          Debrief · áreas OACI
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["Pronunciación", 4],
            ["Estructura", 4],
            ["Vocabulario", 5],
            ["Fluidez", 4],
            ["Comprensión", 5],
            ["Interacción", 4],
          ].map(([a, n]) => (
            <span
              key={a as string}
              className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[10.5px] text-white/70"
            >
              {a as string} <span className="text-coral-400 font-bold">{n as number}</span>
            </span>
          ))}
        </div>
      </div>
    </Ventana>
  );
}

export function MockCompass() {
  const radar = [78, 62, 85, 70, 58, 74];
  const pts = radar
    .map((v, i) => {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = (v / 100) * 34;
      return `${40 + r * Math.cos(ang)},${40 + r * Math.sin(ang)}`;
    })
    .join(" ");
  return (
    <Ventana titulo="APTITUDES · SIMULACRO">
      <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
        <svg viewBox="0 0 80 80" className="w-32 h-32">
          {[34, 24, 14].map((r) => (
            <polygon
              key={r}
              points={Array.from({ length: 6 }, (_, i) => {
                const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return `${40 + r * Math.cos(ang)},${40 + r * Math.sin(ang)}`;
              }).join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
            />
          ))}
          <polygon
            points={pts}
            fill="rgba(242,174,188,0.25)"
            stroke="#F2AEBC"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        <div className="space-y-2">
          {[
            ["Slalom", 85, "↑"],
            ["Control", 78, "↑"],
            ["Multitarea", 58, "→"],
          ].map(([n, v, t]) => (
            <div key={n as string}>
              <div className="flex justify-between text-[11px] text-white/55 mb-1">
                <span>{n as string}</span>
                <span className="font-mono">
                  {v as number} <span className="text-coral-400">{t as string}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-coral-400/80"
                  style={{ width: `${v as number}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11.5px] text-white/70">
          <Icon n="compass" className="w-4 h-4 text-coral-400" /> Enfócate en{" "}
          <span className="text-white font-semibold">Multitarea</span>
        </div>
        <span className="text-[11px] font-mono text-white/40 animate-pulse-dot">NIVEL 3 →</span>
      </div>
    </Ventana>
  );
}

export function MockLineaAerea() {
  return (
    <Ventana titulo="LÍNEA AÉREA · ATP">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {["ATP", "PHAK", "JEPP", "CPAM", "ANX 10"].map((f, i) => (
          <span
            key={f}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${i === 0 ? "bg-coral-600 text-white" : "bg-white/[0.06] text-white/55 border border-white/10"}`}
          >
            {f}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {[
          ["Cap. 1 · Regulations", 92, true],
          ["Cap. 2 · Weather", 74, true],
          ["Cap. 3 · Wake Turbulence", 0, false],
        ].map(([c, v, done]) => (
          <div
            key={c as string}
            className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 flex items-center justify-between"
          >
            <span className="text-[12.5px] text-white/80">{c as string}</span>
            {done ? (
              <span className="text-[11px] font-mono text-coral-400">{v as number}%</span>
            ) : (
              <span className="text-[11px] font-mono text-white/35">Continuar →</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.06] border border-coral-400/25 px-4 py-3 animate-float-y-sm">
        <p className="text-[12px] text-white/80 leading-snug">
          La regla de <span className="text-coral-300 font-semibold">cabina estéril</span> aplica
          por debajo de…
        </p>
        <p className="text-[11px] text-white/45 mt-1">
          10,000 ft — solo comunicación esencial para la operación.
        </p>
      </div>
    </Ventana>
  );
}

export function MockManuales() {
  return (
    <Ventana titulo="AERONAVE · 737 MAX">
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {["Limitaciones", "Suplement.", "Desp.", "Vuelo", "Sistemas", "Motores"].map((c, i) => (
          <span
            key={c}
            className={`rounded-lg px-2 py-1.5 text-center text-[10px] font-bold ${i === 0 ? "bg-coral-600 text-white" : "bg-white/[0.06] text-white/50 border border-white/10"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <p className="text-[14px] text-white leading-snug">
        Máxima altitud de operación certificada:
      </p>
      <div className="mt-3 space-y-2">
        {[
          ["A", "37,000 ft", false],
          ["B", "41,000 ft", true],
        ].map(([l, txt, sel], i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${sel ? "bg-coral-600/15 border-coral-400/60" : "bg-white/[0.03] border-white/10"}`}
          >
            <span
              className={`w-6 h-6 rounded-lg grid place-items-center text-[11px] font-bold font-mono shrink-0 ${sel ? "bg-coral-600 text-white" : "border border-white/20 text-white/55"}`}
            >
              {l as string}
            </span>
            <span className="text-[12.5px] text-white/85 font-mono">{txt as string}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-white/40">
        <span>CAP. 01 · 34/250</span>
        <span className="text-coral-400 animate-pulse-dot">racha de limitaciones: 12 ✓</span>
      </div>
    </Ventana>
  );
}

export function MockBiblioteca() {
  return (
    <Ventana titulo="ANÁLISIS · ESTA SEMANA">
      <div className="space-y-2 mb-4">
        {[
          ["Meteorología", 84],
          ["Aerodinámica", 76],
          ["Navegación", 61],
        ].map(([m, v]) => (
          <div key={m as string}>
            <div className="flex justify-between text-[11px] text-white/55 mb-1">
              <span>{m as string}</span>
              <span className="font-mono">{v as number}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className={`h-full rounded-full ${(v as number) >= 80 ? "bg-coral-400/80" : "bg-white/30"}`}
                style={{ width: `${v as number}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 mb-3 animate-float-y-sm">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-coral-400 mb-1">
          <Icon n="spark" className="w-3.5 h-3.5" /> Pathy
        </div>
        <p className="text-[12px] text-white/75 leading-snug">
          Navegación te está costando puntos: te preparé 20 min de radioayudas para hoy.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/45">
        <Icon n="library" className="w-4 h-4 text-coral-400" /> 104 manuales en la biblioteca ·
        racha de 14 días
      </div>
    </Ventana>
  );
}

/** Mapa slug → mockup, para la ruta dinámica. */
export const MOCKUPS: Record<string, () => React.ReactNode> = {
  ciaac: MockCiaac,
  rtari: MockRtari,
  compass: MockCompass,
  "linea-aerea": MockLineaAerea,
  manuales: MockManuales,
  biblioteca: MockBiblioteca,
};
