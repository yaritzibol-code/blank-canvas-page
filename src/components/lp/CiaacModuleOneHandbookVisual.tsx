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
function Profile() {
  return (
    <Diagram
      title="Velocidad relativa a la pared dentro de la capa límite"
      caption="Perfil esquemático junto a una pared fija. La velocidad aumenta desde cero en la pared hasta acercarse a la del flujo exterior local."
    >
      <path d="M75 220H655" stroke="currentColor" strokeWidth="6" />
      {[1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M170 ${205 - i * 35}h${[15, 80, 155, 225, 250][i]}`}
          stroke="#e2b96f"
          strokeWidth="3"
          markerEnd="url(#science-arrow)"
        />
      ))}
      <circle cx="170" cy="220" r="5" fill="#76bfcd" />
      <path
        d="M170 220Q170 175 280 133T420 65"
        fill="none"
        stroke="#76bfcd"
        strokeWidth="3"
        strokeDasharray="7 5"
      />
      {label(545, 64, "Flujo exterior local")}
      {label(545, 165, "Capa límite")}
      {label(370, 251, "Pared · velocidad relativa ≈ 0")}
    </Diagram>
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
  if (lesson === 3 && group === 0) return <Profile />;
  if (lesson === 3 && group === 2) return <Flow />;
  if (lesson === 4 && (group === 0 || group === 2)) return <Pressure sum={group === 2} />;
  if (lesson === 5 && (group === 0 || group === 2)) return <Density humidity={group === 2} />;
  return null;
}
