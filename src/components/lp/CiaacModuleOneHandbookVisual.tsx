import type { ReactNode } from "react";

function Diagram({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="ciaac-science-diagram">
      <svg viewBox="0 0 720 270" role="img" aria-label={title}>
        <title>{title}</title>
        <defs>
          <marker
            id="science-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10Z" fill="currentColor" />
          </marker>
        </defs>
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
const label = (x: number, y: number, text: string) => (
  <text x={x} y={y} textAnchor="middle">
    {text}
  </text>
);
function States() {
  return (
    <Diagram
      title="Sólido, líquido y gas en recipientes iguales"
      caption="Esquema cualitativo en condiciones ordinarias. Los puntos muestran distribución, no tamaño ni número real de moléculas."
    >
      {[70, 290, 510].map((x) => (
        <path
          key={x}
          d={`M${x} 60V205H${x + 150}V60`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      ))}
      <rect x="105" y="126" width="80" height="78" rx="3" fill="#e2b96f" />
      <path d="M291 143Q329 132 365 143T439 143V203H291Z" fill="#76bfcd" />
      {Array.from({ length: 20 }, (_, i) => (
        <circle
          key={i}
          cx={531 + (i % 5) * 26}
          cy={77 + Math.floor(i / 5) * 33}
          r="4"
          fill="#e2b96f"
        />
      ))}
      {label(145, 36, "Sólido")}
      {label(365, 36, "Líquido")}
      {label(585, 36, "Gas")}
      {label(145, 239, "Conserva su forma")}
      {label(365, 239, "Adopta la forma")}
      {label(585, 239, "Ocupa el espacio")}
    </Diagram>
  );
}
// Original illustrative profile. The gold band is magnified and varies along the chord;
// it is a region affected by viscosity, not a measured thickness or a streamline.
function Profile() {
  const surface = (t: number, side: number) => {
    const camber =
      t < 0.4 ? (0.035 / 0.16) * (0.8 * t - t * t) : (0.035 / 0.36) * (0.2 + 0.8 * t - t * t);
    const thickness =
      0.75 *
      (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t ** 2 + 0.2843 * t ** 3 - 0.1036 * t ** 4);
    return 140 - 530 * camber + side * 530 * thickness;
  };
  const points = (side: number, band = false, reverse = false) =>
    Array.from({ length: 121 }, (_, i) => {
      const t = (1 - Math.cos((Math.PI * (reverse ? 120 - i : i)) / 120)) / 2;
      return `${(105 + 530 * t - (band ? 3 * (1 - t) : 0)).toFixed(2)},${(surface(t, side) + (band ? side * (3 + 4 * Math.sqrt(t)) : 0)).toFixed(2)}`;
    });
  const airfoil = `M${points(-1).join(" L")} L${points(1, false, true).join(" L")} Z`;
  const band = `M${points(-1, true).join(" L")} Q645,140 635,147 L${points(1, true, true).join(" L")} Q96,140 102,137 Z`;
  return (
    <figure className="ciaac-science-diagram ciaac-boundary-wing">
      <svg
        viewBox="0 0 720 225"
        role="img"
        aria-label="Capa límite junto a las dos superficies de un perfil alar"
      >
        <title>La capa límite está junto a la superficie del ala</title>
        <desc>
          Perfil claro inmóvil, con ataque redondeado a la izquierda y salida fina a la derecha. La
          franja dorada ampliada representa la capa límite junto a ambas superficies. Las líneas
          azules son trayectorias esquemáticas del flujo exterior, no el borde de la capa límite. El
          grosor no está a escala.
        </desc>
        <defs>
          <linearGradient id="boundary-wing-white" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c8d8e5" />
          </linearGradient>
        </defs>
        {[-1, 1].flatMap((side) =>
          [27, 45, 63].map((offset, row) => {
            const track = Array.from({ length: 101 }, (_, i) => {
              const x = 18 + (684 * i) / 100;
              const deflection = (side < 0 ? 56 : 17) * Math.exp(-(((x - 285) / 220) ** 2));
              return `${x},${140 + side * (offset + deflection)}`;
            });
            return (
              <path
                key={`${side}-${row}`}
                data-outer-streamline="true"
                d={`M${track.join(" L")}`}
                fill="none"
                stroke="#62bdeb"
                strokeWidth="1.5"
                opacity={0.8 - row * 0.15}
              />
            );
          }),
        )}
        <path
          data-boundary-band="true"
          d={band}
          fill="#e6b959"
          fillOpacity="0.46"
          stroke="#e8bc66"
          strokeWidth="1"
        />
        <path
          data-profile-airfoil="true"
          d={airfoil}
          fill="url(#boundary-wing-white)"
          stroke="#eff6fc"
          strokeWidth="1.3"
        />
        <path d="M410 88 L455 39 H585" fill="none" stroke="#f1cb79" strokeWidth="1.7" />
        <circle cx="410" cy="88" r="4" fill="#f1cb79" />
        <text x="461" y="29" className="boundary-wing-label">
          Capa límite
        </text>
      </svg>
      <figcaption className="boundary-wing-explanation">
        <div>
          La franja dorada es la región donde la viscosidad reduce la velocidad del aire: cero en la
          pared respecto del ala; al alejarse, se aproxima al flujo exterior local. Azul: flujo
          exterior.
          <small>
            Esquema original de flujo adherido, ampliado y sin escala; no es CFD ni representa un
            grosor constante.
          </small>
        </div>
        <svg
          className="boundary-wing-detail"
          viewBox="0 0 270 122"
          role="img"
          aria-label="Detalle local ampliado: velocidad cero en la pared y creciente hacia el exterior"
        >
          <title>Velocidad respecto del ala, en un detalle local plano</title>
          <text x="8" y="16">
            Detalle local ampliado
          </text>
          <path data-surface="stationary" d="M8 94H262" stroke="#e7c77b" strokeWidth="3" />
          <path
            d="M24 94 C39 92 48 78 59 66 S93 45 120 38"
            fill="none"
            stroke="#f1cb79"
            strokeWidth="1.5"
          />
          <path
            data-speed="nearer"
            d="M24 79H47L42 76M47 79L42 82"
            fill="none"
            stroke="#83caf0"
            strokeWidth="1.6"
          />
          <path
            data-speed="farther"
            d="M24 60H72L67 57M72 60L67 63"
            fill="none"
            stroke="#83caf0"
            strokeWidth="1.6"
          />
          <path
            data-speed="exterior"
            d="M24 38H120L115 35M120 38L115 41"
            fill="none"
            stroke="#83caf0"
            strokeWidth="1.6"
          />
          <text x="133" y="42">
            V exterior local
          </text>
          <text x="133" y="85">
            V = 0
          </text>
          <text x="8" y="115">
            Pared fija · velocidad respecto del ala
          </text>
        </svg>
      </figcaption>
    </figure>
  );
}
function AirViscosity() {
  return (
    <figure className="ciaac-science-diagram ciaac-air-viscosity">
      <svg
        viewBox="0 0 720 195"
        role="img"
        aria-label="El aire fluye alrededor del ala; sus capas pueden moverse a distinta velocidad"
      >
        <title>Aire en movimiento y viscosidad</title>
        <desc>
          Un perfil claro tiene borde de ataque redondeado a la izquierda y salida fina a la
          derecha. Líneas azules muestran aire relativo fluyendo a su alrededor. Aparte, tres capas
          tienen flechas de distinta longitud: la viscosidad se opone a su deslizamiento relativo.
          Es una comparación conceptual, no un cálculo del flujo.
        </desc>
        <text x="25" y="25">
          Aire relativo →
        </text>
        {[-1, 1].flatMap((side) =>
          [16, 31].map((offset) => (
            <path
              key={`${side}-${offset}`}
              d={`M20 ${108 + side * offset} C85 ${108 + side * offset},100 ${108 + side * (offset + 35)},175 ${108 + side * (offset + 35)} S300 ${108 + side * offset},370 ${108 + side * offset}`}
              fill="none"
              stroke="#62bdeb"
              strokeWidth="1.7"
            />
          )),
        )}
        <path
          data-viscosity-airfoil="true"
          d="M80 110 C73 93 115 76 165 77 C230 77 300 101 347 117 C271 113 183 132 119 123 C96 120 83 116 80 110Z"
          fill="#e5eef5"
          stroke="#f6f9fc"
          strokeWidth="1.3"
        />
        <text x="115" y="190">
          Ala inmóvil
        </text>
        <path d="M407 32V173" stroke="#7798b2" opacity="0.35" />
        <text x="440" y="25">
          Capas a distinta velocidad
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M443 ${58 + i * 37}H690`} stroke="#79bbd8" strokeWidth="22" opacity="0.12" />
            <path
              data-layer-velocity={i}
              d={`M460 ${58 + i * 37}h${155 - i * 52}l-6 -4m6 4l-6 4`}
              stroke="#e7c77b"
              strokeWidth="2.5"
              fill="none"
            />
          </g>
        ))}
        <text x="440" y="171">
          Deslizamiento entre capas
        </text>
      </svg>
      <figcaption>
        Esquema original, sin escala. Las flechas comparan velocidades; la viscosidad se opone al
        deslizamiento relativo entre capas, no al movimiento uniforme de todo el aire.
      </figcaption>
    </figure>
  );
}
function AttachedFlowComparison() {
  return (
    <figure className="ciaac-science-diagram ciaac-boundary-profile">
      <svg
        viewBox="0 0 360 248"
        role="img"
        aria-label="Laminar y turbulento: dos flujos que pueden permanecer adheridos"
      >
        <title>Orden y mezcla dentro de la capa límite</title>
        <desc>
          Izquierda: capas laminares ordenadas. Derecha: fluctuaciones y mezcla turbulenta. En ambos
          casos el flujo medio va a la derecha y permanece junto a la superficie. Las líneas son
          esquemáticas, no trayectorias exactas ni una medida de espesor.
        </desc>
        <defs>
          <marker
            id="attached-flow-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M0 0 10 5 0 10Z" fill="#e2b96f" />
          </marker>
        </defs>
        {label(87, 24, "Laminar")}
        {label(273, 24, "Turbulento")}
        <path d="M180 40V197" stroke="#76bfcd" strokeOpacity="0.4" />
        {[75, 108, 141].map((y) => (
          <path
            key={y}
            data-regime="laminar"
            d={`M15 ${y}H157`}
            fill="none"
            stroke="#e2b96f"
            strokeWidth="2.5"
            markerEnd="url(#attached-flow-arrow)"
          />
        ))}
        {[75, 108, 141].map((y, i) => (
          <path
            key={y}
            data-regime="turbulent-attached"
            d={`M198 ${y}q14 ${i === 1 ? 18 : -14} 28 0t28 0t28 0t28 0h32`}
            fill="none"
            stroke={i === 1 ? "#76bfcd" : "#e2b96f"}
            strokeWidth="2.5"
            markerEnd="url(#attached-flow-arrow)"
          />
        ))}
        <path d="M10 165H164M196 165H350" stroke="currentColor" strokeWidth="4" />
        {label(87, 188, "Capas ordenadas")}
        {label(273, 188, "Mayor mezcla")}
        {label(180, 214, "Ambos pueden seguir adheridos")}
        {label(180, 234, "Flujo medio hacia la derecha →")}
      </svg>
      <figcaption>
        Compara el orden de las líneas: la mezcla cambia, pero ninguno de estos dos dibujos muestra
        separación. Esquema sin escala; no compara espesores.
      </figcaption>
    </figure>
  );
}
function Flow() {
  return (
    <Diagram
      title="Transición y separación son procesos distintos"
      caption="La mezcla turbulenta puede seguir adherida. El despegue de las líneas respecto de la superficie representa separación; no es consecuencia automática de la transición."
    >
      <path d="M45 215H675" stroke="currentColor" strokeWidth="5" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M55 ${180 - i * 24}H235Q265 ${170 - i * 24} 290 ${180 - i * 24}T350 ${180 - i * 24}T410 ${180 - i * 24}Q480 ${200 - i * 24} 545 ${135 - i * 24}T660 ${70 - i * 15}`}
          fill="none"
          stroke={i === 1 ? "#76bfcd" : "#e2b96f"}
          strokeWidth="3"
          markerEnd="url(#science-arrow)"
        />
      ))}
      {label(135, 38, "Laminar")}
      {label(350, 38, "Turbulento adherido")}
      {label(590, 38, "Separado")}
      {label(250, 247, "Transición")}
      {label(520, 247, "Separación")}
    </Diagram>
  );
}
function Pressure({ sum }: { sum: boolean }) {
  return (
    <Diagram
      title={
        sum
          ? "Presión total como suma en el modelo incompresible ideal"
          : "La presión dinámica depende del cuadrado de la velocidad"
      }
      caption={
        sum
          ? "Modelo incompresible ideal. La barra representa una suma de magnitudes, no tres regiones distintas del aire."
          : "Comparación relativa a igual densidad: duplicar V multiplica q por cuatro. No son valores de una operación real."
      }
    >
      {sum ? (
        <>
          <rect x="70" y="94" width="400" height="66" rx="4" fill="#76bfcd" />
          <rect x="470" y="94" width="180" height="66" rx="4" fill="#e2b96f" />
          <text x="270" y="134" textAnchor="middle" fill="#06243d">
            Estática ps
          </text>
          <text x="560" y="134" textAnchor="middle" fill="#06243d">
            Dinámica q
          </text>
          <path d="M70 183v16h580v-16" fill="none" stroke="currentColor" strokeWidth="2" />
          {label(360, 233, "Total pt = ps + q")}
          {label(360, 51, "Frenar idealmente el flujo hasta reposo")}
        </>
      ) : (
        <>
          {label(175, 48, "Velocidad V")}
          {label(510, 48, "Velocidad 2V")}
          <rect x="120" y="163" width="110" height="36" fill="#76bfcd" />
          <rect x="455" y="55" width="110" height="144" fill="#e2b96f" />
          {label(175, 234, "q")}
          {label(510, 234, "4q")}
          {label(340, 143, "q = ½ρV²")}
        </>
      )}
    </Diagram>
  );
}
function Density({ humidity }: { humidity: boolean }) {
  return (
    <Diagram
      title={
        humidity
          ? "Efecto del vapor a igual presión y temperatura"
          : "La densidad compara masa con volumen"
      }
      caption={
        humidity
          ? "A igual presión, temperatura y volumen, mayor proporción de vapor reemplaza parte del aire seco por moléculas de menor masa. Dorado: aire seco; azul: vapor de menor masa molecular. El tamaño de los puntos representa masa de forma simbólica, no tamaño molecular."
          : "Mismo volumen y misma composición. Más masa en el mismo volumen significa mayor densidad; los puntos son simbólicos."
      }
    >
      {[100, 450].map((x) => (
        <rect
          key={x}
          x={x}
          y="64"
          width="170"
          height="145"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      {Array.from({ length: humidity ? 12 : 8 }, (_, i) => (
        <circle
          key={`a${i}`}
          cx={128 + (i % 4) * 37}
          cy={90 + Math.floor(i / 4) * 37}
          r="7"
          fill="#e2b96f"
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <circle
          key={`b${i}`}
          cx={478 + (i % 4) * 37}
          cy={90 + Math.floor(i / 4) * 37}
          r={humidity && i % 3 === 0 ? 4 : 7}
          fill={humidity && i % 3 === 0 ? "#76bfcd" : "#e2b96f"}
        />
      ))}
      {label(185, 35, humidity ? "Aire seco" : "Menor masa")}
      {label(535, 35, humidity ? "Más vapor" : "Mayor masa")}
      {label(185, 243, humidity ? "Mayor densidad" : "Menor densidad")}
      {label(535, 243, humidity ? "Menor densidad" : "Mayor densidad")}
    </Diagram>
  );
}
export function CiaacModuleOneHandbookVisual({ lesson, group }: { lesson: number; group: number }) {
  if (lesson === 2 && group === 0)
    return (
      <figure className="ciaac-fluid-context">
        <img
          src="/lp/ciaac/module-one/fluid-states-context.png"
          alt="Un cubo sólido, agua dentro de un vaso y una cámara con un gas representado por puntos."
          width="1536"
          height="1024"
        />
        <div className="ciaac-fluid-labels">
          <span>Sólido</span>
          <span>Líquido</span>
          <span>Gas</span>
        </div>
        <figcaption>
          El sólido conserva su forma; el líquido adopta la del recipiente; el gas ocupa el espacio
          disponible. Los puntos del gas son una representación esquemática, no su tamaño ni
          cantidad reales.
        </figcaption>
      </figure>
    );
  if (lesson === 2 && group === 1) return <States />;
  if (lesson === 2 && group === 2) return <AirViscosity />;
  if (lesson === 3 && group === 0) return <Profile />;
  if (lesson === 3 && group === 1) return <AttachedFlowComparison />;
  if (lesson === 3 && group === 2) return <Flow />;
  if (lesson === 4 && (group === 0 || group === 2)) return <Pressure sum={group === 2} />;
  if (lesson === 5 && (group === 0 || group === 2)) return <Density humidity={group === 2} />;
  return null;
}
