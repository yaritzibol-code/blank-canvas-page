/**
 * Portadas de las pruebas de COMPASS: una escena vectorial por prueba, con el
 * mismo lenguaje visual del juego (instrumentos, pantallas y luces de cabina).
 * Si existe arte ilustrado para la prueba (ver art.ts), se muestra ése.
 */
import { useId } from "react";
import type { CompassModuleId } from "@/modules/compass/types";
import { COMPASS_COVER_ART } from "./art";
import { AVION_PATH } from "./sprites";

const W = 320;
const H = 180;
const MONO = "'Geist Mono', 'JetBrains Mono', monospace";
const GOLD = "#E3C98A";
const AMBER = "#F3C969";
const GREEN = "#7FD6A4";
const RED = "#F0826E";
const SKY = "#8FD3F4";
const VIOLET = "#B9A6F5";

const TINTE: Record<CompassModuleId, string> = {
  control: "#143d70",
  slalom: "#0a1824",
  memoria: "#0f3552",
  calculo: "#1d2d4f",
  orientacion: "#123a66",
  multitarea: "#2a2412",
  logica: "#24195a",
};

export function ModuleCover({ id }: { id: CompassModuleId }) {
  const uid = `cxc${useId().replace(/[^\w-]/g, "")}`;
  const art = COMPASS_COVER_ART[id];
  if (art) {
    return <img className="cx-cover" src={art} alt="" loading="lazy" decoding="async" />;
  }
  const Escena = ESCENAS[id];
  return (
    <svg
      className="cx-cover"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.38" r="0.85">
          <stop offset="0" stopColor={TINTE[id]} />
          <stop offset="1" stopColor="#030a18" />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#02070f" stopOpacity={0} />
          <stop offset="1" stopColor="#02070f" stopOpacity={0.75} />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${uid}-bezel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a768a" />
          <stop offset="0.45" stopColor="#161e2b" />
          <stop offset="1" stopColor="#465267" />
        </linearGradient>
        <radialGradient id={`${uid}-face`} cx="0.5" cy="0.4" r="0.62">
          <stop offset="0" stopColor="#123361" />
          <stop offset="1" stopColor="#040d1d" />
        </radialGradient>
        <linearGradient id={`${uid}-plane`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aeb9ca" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#aeb9ca" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-bg)`} />
      <Rejilla />
      <Escena u={uid} />
      <rect width={W} height={H} fill={`url(#${uid}-vig)`} />
    </svg>
  );
}

function Rejilla() {
  const lineas = [];
  for (let x = 20; x < W; x += 20) lineas.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} />);
  for (let y = 20; y < H; y += 20) lineas.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} />);
  return (
    <g stroke="rgba(143,211,244,.05)" strokeWidth={1}>
      {lineas}
    </g>
  );
}

/** Marcas de carátula cada `paso` grados sobre un círculo. */
function Marcas({
  cx,
  cy,
  r,
  paso,
  mayor,
}: {
  cx: number;
  cy: number;
  r: number;
  paso: number;
  mayor: number;
}) {
  const out = [];
  for (let d = 0; d < 360; d += paso) {
    const esMayor = d % mayor === 0;
    out.push(
      <line
        key={d}
        x1={cx}
        y1={cy - r}
        x2={cx}
        y2={cy - r + (esMayor ? 7 : 4)}
        stroke={esMayor ? "#fff" : "rgba(255,255,255,.55)"}
        strokeWidth={esMayor ? 1.4 : 0.8}
        transform={`rotate(${d} ${cx} ${cy})`}
      />,
    );
  }
  return <>{out}</>;
}

function Avion({
  x,
  y,
  escala,
  rot = 0,
  u,
  relleno,
}: {
  x: number;
  y: number;
  escala: number;
  rot?: number;
  u: string;
  relleno?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${escala})`}>
      <path d={AVION_PATH} fill={relleno ?? `url(#${u}-plane)`} filter={`url(#${u}-glow)`} />
      {!relleno && (
        <>
          <circle cx={-20.2} cy={6} r={1.8} fill="#ff5a4f" />
          <circle cx={20.2} cy={6} r={1.8} fill="#5dffa0" />
          <rect x={-1.1} y={-12} width={2.2} height={25} fill={GOLD} />
        </>
      )}
    </g>
  );
}

function Lampara({ x, y, texto, on }: { x: number; y: number; texto: string; on: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={34}
        height={14}
        rx={3.5}
        fill={on ? "rgba(127,214,164,.2)" : "rgba(3,10,24,.8)"}
        stroke={on ? "rgba(127,214,164,.85)" : "rgba(143,163,194,.3)"}
      />
      <text
        x={x + 17}
        y={y + 10}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={7.5}
        fontWeight={700}
        fill={on ? "#dff7ea" : "rgba(143,163,194,.6)"}
      >
        {texto}
      </text>
    </g>
  );
}

function Lcd({
  x,
  y,
  w,
  h,
  etiqueta,
  valor,
  color,
  u,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  etiqueta: string;
  valor: string;
  color: string;
  u: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={7}
        fill="#04111c"
        stroke={color}
        strokeOpacity={0.35}
      />
      <text
        x={x + w / 2}
        y={y + 15}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={7.5}
        fontWeight={700}
        letterSpacing="0.18em"
        fill={color}
        fillOpacity={0.75}
      >
        {etiqueta}
      </text>
      <text
        x={x + w / 2}
        y={y + h - 12}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={19}
        fontWeight={700}
        fill={color}
        filter={`url(#${u}-glow)`}
      >
        {valor}
      </text>
    </g>
  );
}

/* ── Escenas ───────────────────────────────────────────────────────── */

function Control({ u }: { u: string }) {
  const cx = 160;
  const cy = 90;
  const R = 60;
  return (
    <g>
      <circle cx={cx} cy={cy} r={R + 6} fill={`url(#${u}-bezel)`} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${u}-face)`} />
      <clipPath id={`${u}-dial`}>
        <circle cx={cx} cy={cy} r={R} />
      </clipPath>
      <g clipPath={`url(#${u}-dial)`}>
        <rect x={cx - 11} y={cy - R} width={22} height={R * 2} fill="rgba(127,214,164,.12)" />
        <rect x={cx - R} y={cy - 11} width={R * 2} height={22} fill="rgba(127,214,164,.12)" />
        <rect
          x={cx - 11}
          y={cy - 11}
          width={22}
          height={22}
          fill="rgba(227,201,138,.2)"
          stroke={GOLD}
          strokeOpacity={0.8}
        />
      </g>
      <Marcas cx={cx} cy={cy} r={R - 1} paso={10} mayor={30} />
      {[-40, -27, -14, 14, 27, 40].map((o) => (
        <g key={o} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={0.9}>
          <circle cx={cx + o} cy={cy} r={1.9} />
          <circle cx={cx} cy={cy + o} r={1.9} />
        </g>
      ))}
      <g filter={`url(#${u}-glow)`} strokeLinecap="round" strokeWidth={3}>
        <line x1={cx + 17} y1={cy - R + 8} x2={cx + 17} y2={cy + R - 8} stroke={AMBER} />
        <line x1={cx - R + 8} y1={cy - 6} x2={cx + R - 8} y2={cy - 6} stroke={GREEN} />
        <circle cx={cx + 17} cy={cy - 6} r={4.2} fill={GOLD} stroke="#fff" strokeWidth={1.4} />
      </g>
      <Lampara x={14} y={14} texto="LOC" on={false} />
      <Lampara x={W - 48} y={14} texto="G/S" on />
      <g>
        <rect
          x={W - 48}
          y={H - 48}
          width={34}
          height={34}
          rx={8}
          fill="rgba(3,10,24,.8)"
          stroke="rgba(227,201,138,.3)"
        />
        <circle cx={W - 31 + 5} cy={H - 31 - 4} r={3.4} fill={SKY} />
        <circle
          cx={W - 31 + 8}
          cy={H - 31 - 6}
          r={5.5}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.3}
          filter={`url(#${u}-glow)`}
        />
      </g>
    </g>
  );
}

function Slalom({ u }: { u: string }) {
  const valla = (y: number, izq: number, der: number, color: string, proxima: boolean) => (
    <g>
      <g filter={`url(#${u}-glow)`} stroke={color} strokeWidth={2.6} strokeLinecap="round">
        <line x1={0} y1={y} x2={izq} y2={y} />
        <line x1={der} y1={y} x2={W} y2={y} />
      </g>
      <g stroke="rgba(255,255,255,.75)" strokeWidth={0.8}>
        <line x1={0} y1={y} x2={izq} y2={y} />
        <line x1={der} y1={y} x2={W} y2={y} />
      </g>
      {[izq, der].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={8} fill={color} opacity={0.35} />
          <circle cx={x} cy={y} r={3.2} fill="#fff" />
        </g>
      ))}
      <path
        d={`M${(izq + der) / 2 - 5} ${y + 2.5} L${(izq + der) / 2} ${y - 2.5} L${(izq + der) / 2 + 5} ${y + 2.5}`}
        fill="none"
        stroke={GREEN}
        strokeWidth={1.6}
      />
      {proxima && (
        <circle
          cx={(izq + der) / 2}
          cy={y}
          r={13}
          fill="none"
          stroke={GREEN}
          strokeOpacity={0.45}
          strokeWidth={1.2}
        />
      )}
    </g>
  );
  const pueblo = (cx: number, cy: number, n: number, seed: number) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 2.399 + seed) % (Math.PI * 2);
      const d = Math.sqrt((i + 1) / n) * 22;
      out.push(
        <circle
          key={i}
          cx={cx + Math.cos(a) * d}
          cy={cy + Math.sin(a) * d * 0.7}
          r={i % 5 === 0 ? 1.3 : 0.9}
          fill={i % 6 === 0 ? "#dcebff" : AMBER}
        />,
      );
    }
    return <g opacity={0.9}>{out}</g>;
  };
  return (
    <g>
      {[
        [40, 30, 70, 44, 0.3],
        [230, 120, 90, 50, -0.2],
        [120, 150, 60, 36, 0.15],
        [270, 30, 60, 40, 0.1],
      ].map(([x, y, w, h, r]) => (
        <rect
          key={`${x}-${y}`}
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          fill="rgba(30,62,50,.45)"
          stroke="rgba(0,0,0,.3)"
          transform={`rotate(${r * 57.3} ${x} ${y})`}
        />
      ))}
      <path
        d="M70 0 C 40 50, 110 80, 80 120 S 60 170, 90 180"
        fill="none"
        stroke="#0b2740"
        strokeWidth={11}
      />
      <path
        d="M70 0 C 40 50, 110 80, 80 120 S 60 170, 90 180"
        fill="none"
        stroke="rgba(143,211,244,.2)"
        strokeWidth={1.4}
      />
      {pueblo(262, 70, 34, 1)}
      {pueblo(36, 150, 26, 2.2)}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} fill="rgba(190,230,255,.8)">
          <circle cx={4} cy={i * 22 + 6} r={1.4} />
          <circle cx={W - 4} cy={i * 22 + 6} r={1.4} />
        </g>
      ))}
      <g stroke="rgba(210,230,255,.2)" strokeWidth={0.9}>
        <line x1={200} y1={30} x2={222} y2={30} />
        <line x1={60} y1={78} x2={86} y2={78} />
        <line x1={250} y1={100} x2={270} y2={100} />
      </g>
      {valla(44, 128, 186, GOLD, false)}
      {valla(100, 150, 202, RED, true)}
      <g transform="translate(14 12)">
        <Avion x={162} y={138} escala={0.78} u={u} relleno="rgba(0,0,0,.4)" />
      </g>
      <Avion x={162} y={138} escala={0.78} u={u} />
    </g>
  );
}

function Memoria({ u }: { u: string }) {
  return (
    <g>
      <text
        x={W / 2}
        y={36}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={8}
        fontWeight={700}
        letterSpacing="0.24em"
        fill="rgba(184,197,218,.75)"
      >
        MEMORIZA EL BLOQUE
      </text>
      <Lcd x={26} y={50} w={82} h={62} etiqueta="HDG" valor="275" color={SKY} u={u} />
      <Lcd x={119} y={50} w={82} h={62} etiqueta="FL" valor="180" color={SKY} u={u} />
      <Lcd x={212} y={50} w={82} h={62} etiqueta="SQK" valor="4721" color={SKY} u={u} />
      <rect x={26} y={128} width={268} height={5} rx={2.5} fill="rgba(255,255,255,.07)" />
      <rect x={26} y={128} width={176} height={5} rx={2.5} fill={GOLD} filter={`url(#${u}-glow)`} />
      <text
        x={W / 2}
        y={152}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={8}
        fill="rgba(143,163,194,.8)"
      >
        3.4 s
      </text>
    </g>
  );
}

function Calculo({ u }: { u: string }) {
  const cx = 112;
  const cy = 90;
  const numeros = (r: number, valores: string[], rot: number, tam: number, color: string) =>
    valores.map((v, i) => {
      const a = (i * 360) / valores.length + rot;
      return (
        <text
          key={v}
          x={cx}
          y={cy - r}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={tam}
          fontWeight={700}
          fill={color}
          transform={`rotate(${a} ${cx} ${cy})`}
        >
          {v}
        </text>
      );
    });
  return (
    <g>
      {/* Computadora de vuelo circular (tipo E6B) */}
      <circle cx={cx} cy={cy} r={70} fill={`url(#${u}-bezel)`} />
      <circle cx={cx} cy={cy} r={66} fill="#0a1426" />
      <Marcas cx={cx} cy={cy} r={65} paso={6} mayor={36} />
      {numeros(50, ["10", "12", "14", "16", "18", "20", "25", "30", "35", "40"], 0, 8.5, "#fff")}
      <g transform={`rotate(-22 ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={40}
          fill="#0f2242"
          stroke="rgba(227,201,138,.35)"
          strokeWidth={1}
        />
        <Marcas cx={cx} cy={cy} r={39} paso={12} mayor={36} />
        {numeros(26, ["60", "90", "120", "150", "180"], 0, 7, GOLD)}
      </g>
      <polygon
        points={`${cx - 5},${cy - 71} ${cx + 5},${cy - 71} ${cx},${cy - 62}`}
        fill={AMBER}
        filter={`url(#${u}-glow)`}
      />
      <circle cx={cx} cy={cy} r={5} fill="#0b1830" stroke={GOLD} strokeWidth={1.4} />
      {/* Pantalla del problema */}
      <rect
        x={200}
        y={42}
        width={104}
        height={96}
        rx={9}
        fill="#04111c"
        stroke="rgba(227,201,138,.35)"
      />
      <g fontFamily={MONO} fontWeight={700}>
        <text x={212} y={64} fontSize={10} fill="rgba(184,197,218,.85)">
          GS 240 KT
        </text>
        <text x={212} y={82} fontSize={10} fill="rgba(184,197,218,.85)">
          t 1:30 h
        </text>
        <line x1={212} y1={92} x2={292} y2={92} stroke="rgba(227,201,138,.3)" />
        <text x={212} y={122} fontSize={20} fill={GOLD} filter={`url(#${u}-glow)`}>
          D = ?
        </text>
      </g>
    </g>
  );
}

function Orientacion({ u }: { u: string }) {
  const cx = 92;
  const cy = 90;
  const rumbo = 35;
  return (
    <g>
      <circle cx={cx} cy={cy} r={64} fill={`url(#${u}-bezel)`} />
      <circle cx={cx} cy={cy} r={59} fill={`url(#${u}-face)`} />
      <g transform={`rotate(${-rumbo} ${cx} ${cy})`}>
        <Marcas cx={cx} cy={cy} r={58} paso={10} mayor={30} />
        {[
          [0, "N"],
          [90, "E"],
          [180, "S"],
          [270, "W"],
        ].map(([d, t]) => (
          <text
            key={t}
            x={cx}
            y={cy - 38}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={11}
            fontWeight={700}
            fill="#fff"
            transform={`rotate(${d} ${cx} ${cy})`}
          >
            {t}
          </text>
        ))}
      </g>
      <polygon
        points={`${cx - 5},${cy - 64} ${cx + 5},${cy - 64} ${cx},${cy - 53}`}
        fill={AMBER}
        filter={`url(#${u}-glow)`}
      />
      <Avion x={cx} y={cy} escala={0.7} u={u} relleno={GOLD} />
      {/* Mapa cenital */}
      <rect
        x={180}
        y={30}
        width={120}
        height={120}
        rx={10}
        fill="#061426"
        stroke="rgba(227,201,138,.3)"
      />
      <g stroke="rgba(143,211,244,.08)">
        {[200, 220, 240, 260, 280].map((x) => (
          <line key={`v${x}`} x1={x} y1={30} x2={x} y2={150} />
        ))}
        {[50, 70, 90, 110, 130].map((y) => (
          <line key={`h${y}`} x1={180} y1={y} x2={300} y2={y} />
        ))}
      </g>
      <circle
        cx={240}
        cy={90}
        r={36}
        fill="none"
        stroke="rgba(143,211,244,.22)"
        strokeDasharray="2 4"
      />
      <line x1={240} y1={90} x2={266} y2={65} stroke="rgba(227,201,138,.5)" strokeDasharray="3 3" />
      <g filter={`url(#${u}-glow)`}>
        <circle
          cx={240}
          cy={90}
          r={8}
          fill="none"
          stroke={SKY}
          strokeWidth={2}
          strokeDasharray="0.1 3"
          strokeLinecap="round"
        />
        <circle cx={240} cy={90} r={2.2} fill={SKY} />
      </g>
      <Avion x={266} y={65} escala={0.4} rot={rumbo} u={u} relleno={GOLD} />
      <g transform="translate(290 44)">
        <polygon points="0,-7 -3,-1 3,-1" fill="#fff" />
        <line x1={0} y1={-2} x2={0} y2={6} stroke="#b8c5da" strokeWidth={1.2} />
      </g>
    </g>
  );
}

function Multitarea({ u }: { u: string }) {
  const sistemas: [string, "ok" | "alerta" | "urgente"][] = [
    ["HYD", "ok"],
    ["ELEC", "alerta"],
    ["FUEL", "ok"],
    ["PRESS", "urgente"],
  ];
  return (
    <g>
      <Lcd
        x={22}
        y={22}
        w={140}
        h={56}
        etiqueta="RECIBIDO · SQK"
        valor="4721"
        color={GREEN}
        u={u}
      />
      <rect
        x={176}
        y={34}
        width={122}
        height={34}
        rx={8}
        fill="rgba(2,7,15,.85)"
        stroke={GOLD}
        strokeOpacity={0.7}
      />
      <text x={188} y={57} fontFamily={MONO} fontSize={15} fontWeight={700} fill={GOLD}>
        47
      </text>
      <rect x={210} y={43} width={1.6} height={17} fill={GOLD} />
      {sistemas.map(([nombre, estado], i) => {
        const x = 22 + i * 70;
        const color = estado === "ok" ? GREEN : estado === "alerta" ? AMBER : RED;
        const encendido = estado !== "ok";
        return (
          <g key={nombre}>
            <rect
              x={x}
              y={92}
              width={62}
              height={70}
              rx={8}
              fill={encendido ? color : "#0d1523"}
              fillOpacity={encendido ? 0.22 : 1}
              stroke={encendido ? color : "rgba(255,255,255,.1)"}
              strokeOpacity={encendido ? 0.85 : 1}
              filter={encendido ? `url(#${u}-glow)` : undefined}
            />
            <text
              x={x + 31}
              y={116}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={10}
              fontWeight={800}
              fill="#f4f6fa"
            >
              {nombre}
            </text>
            <rect
              x={x + 11}
              y={126}
              width={40}
              height={12}
              rx={3}
              fill={encendido ? color : "rgba(127,214,164,.1)"}
              stroke={color}
              strokeOpacity={0.6}
            />
            <text
              x={x + 31}
              y={135}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={6.5}
              fontWeight={800}
              fill={encendido ? "#1b1204" : GREEN}
            >
              {encendido ? "ALERTA" : "OK"}
            </text>
            {encendido && (
              <rect
                x={x + 8}
                y={150}
                width={estado === "alerta" ? 34 : 14}
                height={3.5}
                rx={1.75}
                fill={color}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

const FIGURA: Record<string, string> = {
  circulo: "M12 4a8 8 0 1 0 0.01 0Z",
  cuadrado: "M4.5 4.5h15v15h-15Z",
  triangulo: "M12 3.5 20.5 19H3.5Z",
  rombo: "M12 2.5 21.5 12 12 21.5 2.5 12Z",
};
const FIGURA_COLOR: Record<string, string> = {
  circulo: SKY,
  cuadrado: GOLD,
  triangulo: RED,
  rombo: GREEN,
};

function Logica({ u }: { u: string }) {
  const celda = 30;
  const gap = 5;
  const lado = celda * 4 + gap * 3;
  const x0 = (W - lado) / 2;
  const y0 = (H - lado) / 2;
  const tablero: (string | null | "?")[][] = [
    ["circulo", null, "triangulo", "rombo"],
    [null, "rombo", "circulo", null],
    ["triangulo", "?", null, "circulo"],
    ["rombo", "circulo", null, "triangulo"],
  ];
  return (
    <g>
      <rect
        x={x0 - 9}
        y={y0 - 9}
        width={lado + 18}
        height={lado + 18}
        rx={12}
        fill="rgba(3,10,24,.6)"
        stroke="rgba(227,201,138,.18)"
      />
      {tablero.map((fila, r) =>
        fila.map((v, c) => {
          const x = x0 + c * (celda + gap);
          const y = y0 + r * (celda + gap);
          const hueco = v === "?";
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={celda}
                height={celda}
                rx={6}
                fill={v === null ? "rgba(3,10,24,.55)" : "#10284a"}
                stroke={hueco ? GOLD : "rgba(143,163,194,.2)"}
                strokeWidth={hueco ? 1.4 : 0.8}
                strokeDasharray={v === null ? "2 2" : undefined}
                filter={hueco ? `url(#${u}-glow)` : undefined}
              />
              {hueco && (
                <text
                  x={x + celda / 2}
                  y={y + celda / 2 + 7}
                  textAnchor="middle"
                  fontFamily="'Instrument Serif', serif"
                  fontStyle="italic"
                  fontSize={20}
                  fill={GOLD}
                >
                  ?
                </text>
              )}
              {v && !hueco && (
                <path
                  d={FIGURA[v]}
                  transform={`translate(${x + 5} ${y + 5}) scale(${(celda - 10) / 24})`}
                  fill={FIGURA_COLOR[v]}
                  filter={`url(#${u}-glow)`}
                />
              )}
            </g>
          );
        }),
      )}
      <g opacity={0.8}>
        <path
          d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4Z"
          transform={`translate(${x0 + lado + 26} ${y0 + 8}) scale(0.9)`}
          fill={VIOLET}
          filter={`url(#${u}-glow)`}
        />
        <path
          d={FIGURA.cuadrado}
          transform={`translate(${x0 - 50} ${y0 + lado - 30}) scale(0.9)`}
          fill={GOLD}
          filter={`url(#${u}-glow)`}
        />
      </g>
    </g>
  );
}

const ESCENAS: Record<CompassModuleId, (p: { u: string }) => React.ReactNode> = {
  control: Control,
  slalom: Slalom,
  memoria: Memoria,
  calculo: Calculo,
  orientacion: Orientacion,
  multitarea: Multitarea,
  logica: Logica,
};
