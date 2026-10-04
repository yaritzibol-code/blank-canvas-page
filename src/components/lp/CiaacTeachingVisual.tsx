import { useId, useState } from "react";
import type { ReactNode } from "react";

/** Stage numbers follow the canonical CIAAC Module 1 review document. */
export interface CiaacTeachingVisualProps {
  lessonNumber: number;
  stageIndex?: number;
}

const INK = "#0f1833";
const BLUE = "#163D70";
const GOLD = "#C7A052";
const GREEN = "#26735b";
const PALE = "#e5edf7";

function Frame({
  title,
  prompt,
  children,
  note,
}: {
  title: string;
  prompt: string;
  children: ReactNode;
  note?: string;
}) {
  const id = useId();
  return (
    <section className="ciaac-visual" aria-labelledby={id}>
      <style>{styles}</style>
      <header className="cv-heading">
        <span className="cv-eyebrow">Laboratorio visual · Entender primero</span>
        <h3 id={id}>{title}</h3>
        <p>{prompt}</p>
      </header>
      {children}
      {note && <p className="cv-note">{note}</p>}
    </section>
  );
}

function Diagram({
  label,
  children,
  height = 260,
}: {
  label: string;
  children: ReactNode;
  height?: number;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="cv-diagram-group">
      <div
        id={`${id}-viewport`}
        className={`cv-diagram-viewport${expanded ? " is-expanded" : ""}`}
        role={expanded ? "region" : undefined}
        aria-label={expanded ? "Esquema ampliado, desplazable horizontalmente" : undefined}
        tabIndex={expanded ? 0 : undefined}
      >
        <svg className="cv-diagram" viewBox={`0 0 600 ${height}`} role="img" aria-labelledby={id}>
          <title id={id}>{label}</title>
          {children}
        </svg>
      </div>
      <button
        className="cv-zoom"
        type="button"
        aria-pressed={expanded}
        aria-controls={`${id}-viewport`}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Ajustar al ancho" : "Ampliar esquema"}
      </button>
    </div>
  );
}

function Arrow({
  x,
  y,
  length,
  color = BLUE,
  vertical = false,
}: {
  x: number;
  y: number;
  length: number;
  color?: string;
  vertical?: boolean;
}) {
  if (Math.abs(length) < 1) return <circle cx={x} cy={y} r="3" fill={color} />;
  const sign = Math.sign(length);
  return (
    <g
      transform={`translate(${x} ${y})${vertical ? " rotate(-90)" : ""}`}
      stroke={color}
      fill={color}
      strokeWidth="2.5"
    >
      <path d={`M0 0 H${length}`} />
      <path d={`M${length} 0 l${-7 * sign} -4 v8 Z`} strokeWidth="1" />
    </g>
  );
}

function Options<T extends string>({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: T;
  choices: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="cv-options" role="group" aria-label={label}>
      {choices.map((choice) => (
        <button
          type="button"
          key={choice.value}
          aria-pressed={value === choice.value}
          onClick={() => onChange(choice.value)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="cv-slider">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>{display}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="cv-range-ends" aria-hidden="true">
        <span>Menos</span>
        <span>Más</span>
      </div>
    </div>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return (
    <div className="cv-insight" aria-live="polite">
      {children}
    </div>
  );
}

function Prediction({
  question,
  choices,
  correct,
  explanation,
}: {
  question: string;
  choices: readonly string[];
  correct: number;
  explanation: string;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <fieldset className="cv-prediction">
      <legend>Primero, predice: {question}</legend>
      <div className="cv-options">
        {choices.map((choice, index) => (
          <button
            type="button"
            key={choice}
            aria-pressed={answer === index}
            onClick={() => setAnswer(index)}
          >
            {choice}
          </button>
        ))}
      </div>
      {answer !== null && (
        <p role="status">
          <strong>{answer === correct ? "Sí. " : "Observa la diferencia. "}</strong>
          {explanation}
        </p>
      )}
    </fieldset>
  );
}

function ParticleBox({
  x,
  y,
  width,
  height,
  count = 24,
  water = 0,
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  count?: number;
  water?: number;
  label?: string;
}) {
  const columns = Math.ceil(Math.sqrt((count * width) / height));
  const rows = Math.ceil(count / columns);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="9"
        fill="#fff"
        stroke="#90a5c8"
        strokeWidth="2"
      />
      {Array.from({ length: count }, (_, i) => {
        const cx = x + (((i % columns) + 0.5) * width) / columns;
        const cy = y + ((Math.floor(i / columns) + 0.5) * height) / rows;
        return i >= count - water ? (
          <path key={i} d={`M${cx} ${cy - 6}l6 6-6 6-6-6Z`} fill={GOLD} stroke="#7A5C1E" />
        ) : (
          <circle key={i} cx={cx} cy={cy} r="5" fill={BLUE} />
        );
      })}
      {label && (
        <text x={x + width / 2} y={y + height + 25} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

function AircraftDefinition() {
  const [vehicle, setVehicle] = useState("plane");
  const hovercraft = vehicle === "hovercraft";
  return (
    <Frame
      title="¿Contra qué reacciona el aire?"
      prompt="La forma o el motor no deciden la respuesta. Cambia el vehículo y observa cómo se sostiene."
      note="Esquemas de principio, no diseños de aeronaves. La definición estudiada excluye la reacción del aire contra la superficie terrestre."
    >
      <Options
        label="Vehículo"
        value={vehicle}
        onChange={setVehicle}
        choices={[
          { value: "plane", label: "Avión / planeador" },
          { value: "helicopter", label: "Helicóptero" },
          { value: "hovercraft", label: "Aerodeslizador" },
        ]}
      />
      <Diagram
        label={
          hovercraft
            ? "Un aerodeslizador se sostiene mediante un colchón de aire contra el suelo."
            : "Una aeronave puede sostenerse mediante reacciones del aire, sin depender de su reacción contra el suelo."
        }
      >
        <path d="M40 228H560" stroke="#90a5c8" strokeWidth="3" />
        <text x="545" y="248" textAnchor="end">
          Suelo
        </text>
        {vehicle === "plane" ? (
          <path d="M180 108Q225 70 345 112L440 126L200 132Q162 131 180 108Z" fill={INK} />
        ) : vehicle === "helicopter" ? (
          <g fill={INK}>
            <rect x="250" y="106" width="100" height="35" rx="17" />
            <path d="M300 106V83M205 83H395" stroke={INK} strokeWidth="5" />
            <path d="M346 117L414 105V123H345Z" />
          </g>
        ) : (
          <g>
            <rect x="206" y="162" width="188" height="33" rx="15" fill={INK} />
            <rect x="239" y="137" width="103" height="30" rx="10" fill={BLUE} />
            <path d="M215 198Q300 242 387 198" fill={PALE} stroke={GOLD} strokeWidth="3" />
          </g>
        )}
        <Arrow x={300} y={hovercraft ? 157 : 71} length={44} vertical color={GREEN} />
        {hovercraft ? (
          <g>
            <Arrow x={254} y={199} length={-26} vertical color={GOLD} />
            <Arrow x={342} y={199} length={-26} vertical color={GOLD} />
            <text x="300" y="111" textAnchor="middle">
              Colchón de aire contra el suelo
            </text>
          </g>
        ) : (
          <g>
            <Arrow x={232} y={156} length={-38} vertical color={GOLD} />
            <Arrow x={370} y={156} length={-38} vertical color={GOLD} />
            <text x="300" y="213" textAnchor="middle">
              Interacción con el aire de la atmósfera
            </text>
          </g>
        )}
      </Diagram>
      <Insight>
        <strong>{hovercraft ? "No entra en esta definición." : "Sí es aeronave."}</strong>{" "}
        {hovercraft
          ? "Su sostén depende de la reacción del aire contra el suelo."
          : "Sigue siendo aeronave también cuando está estacionada."}
      </Insight>
    </Frame>
  );
}

function FlightTime({ helicopter = false }: { helicopter?: boolean }) {
  const [type, setType] = useState(helicopter ? "helicopter" : "plane");
  const [phase, setPhase] = useState(0);
  const heli = type === "helicopter";
  const phases = heli
    ? [
        "Sistemas encendidos",
        "Rotor empieza a girar",
        "Despegue",
        "En el aire",
        "Aterrizaje",
        "Detenido, rotor girando",
        "Aeronave y rotor parados",
      ]
    : [
        "En plataforma",
        "Primer movimiento para despegar",
        "Carrera de despegue",
        "En el aire",
        "Aterrizaje",
        "Rodaje de llegada",
        "Detención final",
      ];
  const counting = phase >= 1 && phase < 6;
  return (
    <Frame
      title="Dos intervalos, una operación"
      prompt="¿El reloj ya cuenta antes de estar en el aire? Recorre los eventos y compara las dos barras."
      note="Tiempo de vuelo según la definición OACI estudiada en este módulo. No es una definición universal de «en vuelo». Eventos esquemáticos: las distancias no representan duraciones."
    >
      <Options
        label="Tipo de aeronave"
        value={type}
        onChange={(next) => {
          setType(next);
          setPhase(0);
        }}
        choices={[
          { value: "plane", label: "Avión" },
          { value: "helicopter", label: "Helicóptero" },
        ]}
      />
      <Diagram
        height={215}
        label={`Evento ${phase + 1}: ${phases[phase]}. ${phase === 0 ? "El cómputo no ha comenzado." : phase === 6 ? "El cómputo termina." : "El tiempo de vuelo está contando."} El intervalo en el aire es más corto.`}
      >
        <text x="30" y="31">
          Tiempo de vuelo OACI
        </text>
        <rect x="126.6" y="45" width="433.4" height="25" rx="8" fill="#d9e9e1" />
        <text x="345" y="63" textAnchor="middle" fill={GREEN}>
          Desde el evento de inicio hasta la detención final
        </text>
        <text x="30" y="103">
          Tiempo físicamente en el aire
        </text>
        <rect
          x={heli ? 213.2 : 256}
          y="118"
          width={heli ? 173.2 : 130.4}
          height="22"
          rx="7"
          fill={GOLD}
        />
        <text x="402" y="134">
          Hasta el aterrizaje
        </text>
        <path
          d={`M${40 + phase * 86.6} 41V168`}
          stroke={GOLD}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path d="M40 179H560" stroke="#b6c2d5" strokeWidth="3" />
        {phases.map((label, i) => (
          <g key={label}>
            <circle
              cx={40 + i * 86.6}
              cy="179"
              r={phase === i ? 11 : 5}
              fill={phase === i ? BLUE : "#90a5c8"}
            />
            <text
              x={40 + i * 86.6}
              y="205"
              textAnchor="middle"
              fontWeight={phase === i ? "700" : "400"}
            >
              {i + 1}
            </text>
          </g>
        ))}
      </Diagram>
      <div className="cv-events" role="group" aria-label="Eventos de la operación">
        {phases.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={phase === index}
            onClick={() => setPhase(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <Insight>
        <strong>
          {phase === 0
            ? "Todavía no cuenta."
            : counting
              ? "El cómputo está abierto."
              : "Aquí termina el cómputo."}
        </strong>{" "}
        {phase === 0
          ? "Encender sistemas no es el evento de inicio definido."
          : heli
            ? phase === 6
              ? "Ya se detuvieron la aeronave y las palas al terminar el vuelo."
              : "El rotor comenzó a girar para esta operación de vuelo; no necesitas esperar al despegue."
            : phase === 6
              ? "La aeronave quedó finalmente detenida al terminar el vuelo."
              : "El primer movimiento tuvo propósito de despegue. Una espera de rodaje o tocar pista no cierran el intervalo."}
      </Insight>
    </Frame>
  );
}

function MatterLab({ initial = "liquid" }: { initial?: string }) {
  const [state, setState] = useState(initial);
  const [width, setWidth] = useState(200);
  const liquidHeight = 15000 / width;
  return (
    <Frame
      title="Cambia el recipiente. ¿Qué conserva su forma?"
      prompt="Primero elige un estado. Después ensancha el recipiente, sin añadir ni quitar materia."
      note="Condiciones ordinarias; modelo molecular esquemático, no a escala. Líquidos y gases son fluidos. La cercanía de las partículas, por sí sola, no define un fluido."
    >
      <Options
        label="Estado de la materia"
        value={state}
        onChange={setState}
        choices={[
          { value: "solid", label: "Sólido" },
          { value: "liquid", label: "Líquido" },
          { value: "gas", label: "Gas" },
        ]}
      />
      <Diagram
        label={
          state === "solid"
            ? "El sólido conserva aproximadamente su forma y volumen."
            : state === "liquid"
              ? "El líquido conserva aproximadamente su volumen, cambia de forma y tiene una superficie libre horizontal."
              : "El gas ocupa todo el espacio disponible del recipiente."
        }
      >
        <rect
          x={300 - width / 2}
          y="25"
          width={width}
          height="195"
          rx="9"
          fill="#fff"
          stroke="#90a5c8"
          strokeWidth="2"
        />
        {state === "solid" && (
          <g>
            <rect x="247" y="113" width="106" height="106" rx="4" fill="#d3dce7" />
            {Array.from({ length: 36 }, (_, i) => (
              <circle
                key={i}
                cx={257 + (i % 6) * 17}
                cy={123 + Math.floor(i / 6) * 17}
                r="5"
                fill={INK}
              />
            ))}
          </g>
        )}
        {state === "liquid" && (
          <g>
            <rect
              x={301 - width / 2}
              y={220 - liquidHeight}
              width={width - 2}
              height={liquidHeight - 1}
              rx="3"
              fill="#dce9f8"
            />
            <path
              d={`M${301 - width / 2} ${220 - liquidHeight}h${width - 2}`}
              stroke={BLUE}
              strokeWidth="2"
            />
            {Array.from({ length: 60 }, (_, i) => {
              const cols = Math.floor(width / 16);
              return (
                <circle
                  key={i}
                  cx={308 - width / 2 + (i % cols) * 16}
                  cy={210 - Math.floor(i / cols) * 12}
                  r="4"
                  fill={BLUE}
                />
              );
            })}
          </g>
        )}
        {state === "gas" &&
          Array.from({ length: 24 }, (_, i) => (
            <circle
              key={i}
              cx={300 - width / 2 + 15 + (((i * 37) % 89) / 89) * (width - 30)}
              cy={41 + ((i * 59) % 163)}
              r="4.5"
              fill={BLUE}
            />
          ))}
        <text x="300" y="247" textAnchor="middle">
          {state === "solid"
            ? "Forma propia ≈ constante"
            : state === "liquid"
              ? "Mismo volumen · nueva forma"
              : "Ocupa todo el espacio disponible"}
        </text>
      </Diagram>
      <Slider
        label="Anchura del recipiente"
        value={width}
        min={160}
        max={330}
        step={5}
        display={`${Math.round(width / 2)} % del ancho de referencia`}
        onChange={setWidth}
      />
      <Insight>
        {state === "solid"
          ? "El sólido mantiene aproximadamente su forma. No significa que sea imposible deformarlo."
          : state === "liquid"
            ? "La superficie baja al ensanchar el recipiente: la misma cantidad de líquido ocupa un fondo mayor."
            : "Las mismas partículas se reparten en más espacio: el gas se expande y su densidad baja."}
      </Insight>
    </Frame>
  );
}

function FluidProperties() {
  const [property, setProperty] = useState("density");
  const [amount, setAmount] = useState(2);
  const volumeWidth = 280 / amount;
  return (
    <Frame
      title="Tres propiedades, tres preguntas distintas"
      prompt="No uses «espeso» para explicarlo todo. Elige una propiedad y cambia solo su comparación."
      note="Demostraciones cualitativas. La viscosidad no se deduce solo de densidad o velocidad de caída. Comprimir este gas ilustra un cambio de volumen, no mide un coeficiente de compresibilidad."
    >
      <Options
        label="Propiedad del fluido"
        value={property}
        onChange={(next) => {
          setProperty(next);
          setAmount(2);
        }}
        choices={[
          { value: "density", label: "Densidad" },
          { value: "viscosity", label: "Viscosidad" },
          { value: "compression", label: "Compresión del gas" },
        ]}
      />
      <Diagram
        label={
          property === "density"
            ? "A igual volumen y composición, más masa implica mayor densidad."
            : property === "viscosity"
              ? "Con el mismo gradiente de velocidad entre placas, una viscosidad mayor requiere mayor esfuerzo tangencial."
              : "La misma masa de gas ocupa un volumen menor al comprimirse."
        }
      >
        {property === "viscosity" ? (
          <g>
            <rect x="105" y="82" width="330" height="133" fill={PALE} />
            {[0, 1, 2, 3].map((i) => (
              <Arrow key={i} x={145} y={190 - 28 * i} length={15 + 25 * i} />
            ))}
            <path d="M105 78H435M105 219H435" stroke={INK} strokeWidth="7" />
            <Arrow x={330} y={51} length={amount * 42} color={GOLD} />
            <text x="106" y="32">
              Fuerza tangencial necesaria
            </text>
            <text x="447" y="120">
              Mismo
            </text>
            <text x="447" y="141">
              gradiente
            </text>
            <text x="300" y="248" textAnchor="middle">
              Placa inferior fija · deslizamiento entre capas
            </text>
          </g>
        ) : (
          <ParticleBox
            x={300 - (property === "density" ? 105 : volumeWidth / 2)}
            y={36}
            width={property === "density" ? 210 : volumeWidth}
            height={172}
            count={property === "density" ? amount * 12 : 24}
            label={
              property === "density"
                ? "Volumen fijo · misma composición"
                : "Misma masa · volumen variable"
            }
          />
        )}
      </Diagram>
      <Slider
        label={
          property === "density"
            ? "Masa en el mismo volumen"
            : property === "viscosity"
              ? "Viscosidad dinámica (comparación)"
              : "Compresión de la misma masa"
        }
        min={1}
        max={3}
        value={amount}
        display={amount === 1 ? "Baja" : amount === 2 ? "Media" : "Alta"}
        onChange={setAmount}
      />
      <Insight>
        <strong>
          {property === "density"
            ? "¿Cuánta masa hay por volumen?"
            : property === "viscosity"
              ? "¿Cuánto se resisten a deslizar las capas?"
              : "¿Puede cambiar el volumen de una masa fija?"}
        </strong>{" "}
        {property === "density"
          ? "Cambias masa; el tamaño de la caja permanece igual."
          : property === "viscosity"
            ? "Las flechas de velocidad no cambian. Lo que aumenta es el esfuerzo para mantener ese mismo deslizamiento."
            : "La cantidad de partículas no cambia. Al reducir el volumen, aumenta la densidad."}
      </Insight>
    </Frame>
  );
}

function BoundaryLayer({ reference = false }: { reference?: boolean }) {
  const [model, setModel] = useState("real");
  const [frame, setFrame] = useState("wing");
  const earth = reference && frame === "earth";
  const ideal = !reference && model === "ideal";
  const fractions = [0, 0.18, 0.5, 0.8, 1];
  return (
    <Frame
      title={
        reference ? "¿Velocidad cero respecto de qué?" : "Mira cómo cambia la velocidad al alejarte"
      }
      prompt={
        reference
          ? "Imagina una superficie que viaja hacia la izquierda a 50 m/s en aire quieto. Cambia el marco de referencia."
          : "Compara el aire real con una idealización sin efectos viscosos. Observa especialmente la flecha junto a la pared."
      }
      note={
        reference
          ? "Ejemplo de traslación uniforme. El aire junto a la pared comparte su velocidad; no está inmóvil respecto de todos los observadores."
          : "Perfil de velocidad ilustrativo en una posición fija. El flujo exterior local puede variar a lo largo del ala. El aire real tiene viscosidad, incluso sobre una superficie lisa."
      }
    >
      {reference ? (
        <Options
          label="Marco de referencia"
          value={frame}
          onChange={setFrame}
          choices={[
            { value: "wing", label: "Respecto del ala" },
            { value: "earth", label: "Respecto de la Tierra" },
          ]}
        />
      ) : (
        <Options
          label="Modelo del flujo"
          value={model}
          onChange={setModel}
          choices={[
            { value: "real", label: "Aire real · viscoso" },
            { value: "ideal", label: "Modelo ideal · sin viscosidad" },
          ]}
        />
      )}
      <Diagram
        label={
          earth
            ? "Respecto de la Tierra: pared y aire junto a ella viajan a menos 50 metros por segundo; lejos, el aire está quieto."
            : ideal
              ? "En el modelo inviscido no se impone el no deslizamiento y no se representa una capa límite viscosa."
              : "Respecto de la pared, la velocidad junto a ella es cero y aumenta hasta la del flujo exterior local."
        }
      >
        <rect x="48" y="68" width="405" height="139" rx="8" fill={ideal ? "#f5f6f9" : PALE} />
        <path d="M48 214H550" stroke={INK} strokeWidth="8" />
        {fractions.map((fraction, index) => {
          const speed = (ideal ? 1 : fraction) * 50 - (earth ? 50 : 0);
          return (
            <g key={fraction}>
              <Arrow x={240} y={214 - index * 35} length={speed * 2.4} />
              <text x="472" y={219 - index * 35}>
                {Math.round(speed)} m/s
              </text>
            </g>
          );
        })}
        <text x="49" y="35">
          Flujo exterior local
        </text>
        <text x="50" y="246">
          {earth ? "Pared: −50 m/s ←" : "Pared: 0 m/s en este marco"}
        </text>
        {!ideal && (
          <text x="63" y="145" fill={BLUE}>
            Capa límite
          </text>
        )}
      </Diagram>
      <Insight>
        <strong>
          {ideal
            ? "Una idealización no borra la viscosidad del aire."
            : "En la pared: velocidad del aire − velocidad de la pared ≈ 0."}
        </strong>{" "}
        {earth
          ? "El cero relativo se conserva, aunque ambas velocidades respecto de la Tierra sean −50 m/s."
          : ideal
            ? "Este modelo permite deslizamiento y omite la capa límite viscosa; sirve para contrastar, no para describir el contacto real."
            : "Esta es la condición de no deslizamiento. La velocidad cambia dentro de la capa límite."}
      </Insight>
    </Frame>
  );
}

function FlowRegimes({ transition = false }: { transition?: boolean }) {
  const [regime, setRegime] = useState("laminar");
  const [surface, setSurface] = useState("clean");
  const separated = !transition && regime === "separated";
  const turbulent = !transition && regime === "turbulent";
  const start = surface === "clean" ? 340 : 180;
  return (
    <Frame
      title={transition ? "La transición puede adelantarse" : "Turbulento no significa separado"}
      prompt={
        transition
          ? "Compara las superficies en condiciones semejantes. La marca de transición es una simplificación de una zona."
          : "Alterna los tres casos. Pregúntate si el flujo sigue la superficie y cómo se mezclan sus capas."
      }
      note={
        transition
          ? "Posiciones cualitativas, no una predicción. Suciedad, insectos, hielo o escarcha pueden alterar también la forma y degradar el desempeño. Esta comparación no justifica volar con contaminación."
          : "Líneas esquemáticas, no una simulación. Transición y separación son procesos diferentes; no se fija aquí una velocidad o ángulo de pérdida."
      }
    >
      {transition ? (
        <Options
          label="Estado de la superficie"
          value={surface}
          onChange={setSurface}
          choices={[
            { value: "clean", label: "Superficie limpia" },
            { value: "rough", label: "Superficie perturbada" },
          ]}
        />
      ) : (
        <Options
          label="Régimen del flujo"
          value={regime}
          onChange={setRegime}
          choices={[
            { value: "laminar", label: "Laminar adherido" },
            { value: "turbulent", label: "Turbulento adherido" },
            { value: "separated", label: "Separado" },
          ]}
        />
      )}
      <Diagram
        label={
          transition
            ? `La transición se representa ${surface === "clean" ? "más atrás" : "más adelante"} sobre la superficie; el flujo turbulento continúa adherido.`
            : separated
              ? "El flujo se aleja de la superficie y aparece una región de recirculación."
              : turbulent
                ? "Hay fluctuaciones y mezcla, pero el flujo sigue adherido a la superficie."
                : "Las capas se desplazan ordenadamente, siguiendo la superficie."
        }
      >
        <path d="M40 212Q135 160 267 183Q403 210 560 206V235H40Z" fill={INK} />
        {[0, 1, 2, 3].map((index) => {
          const y = 182 - index * 30;
          const points = Array.from({ length: 53 }, (_, i) => {
            const x = 40 + i * 10;
            const base = y - 26 * Math.sin((i / 52) * Math.PI);
            const wave =
              turbulent || (transition && x > start)
                ? Math.sin(i * 1.7 + index) * (index === 3 ? 2 : 5)
                : 0;
            const lift = separated && x > 270 ? (x - 270) * 0.27 : 0;
            return `${i ? "L" : "M"}${x},${base + wave - lift}`;
          }).join(" ");
          return (
            <path
              key={index}
              d={points}
              fill="none"
              stroke={turbulent || separated ? "#7A5C1E" : BLUE}
              strokeWidth="2.5"
            />
          );
        })}
        {separated && (
          <g>
            <path
              d="M350 184C320 155 400 145 425 172C443 198 375 206 365 180"
              fill="none"
              stroke={GOLD}
              strokeWidth="3"
            />
            <Arrow x={397} y={196} length={-25} color={GOLD} />
            <text x="365" y="126">
              Recirculación
            </text>
          </g>
        )}
        {transition && (
          <g>
            <path d={`M${start} 53V203`} stroke={GREEN} strokeWidth="2" strokeDasharray="5 5" />
            <text x={start} y="37" textAnchor="middle">
              Transición
            </text>
            {surface === "rough" &&
              [145, 156, 166].map((x) => <circle key={x} cx={x} cy="184" r="4" fill={GOLD} />)}
            <text x="82" y="250">
              Laminar
            </text>
            <text x="424" y="250">
              Turbulento adherido
            </text>
          </g>
        )}
        {!transition && (
          <text x="300" y="253" textAnchor="middle">
            {separated ? "Se aparta de la superficie" : "Sigue la superficie"}
          </text>
        )}
      </Diagram>
      <Insight>
        <strong>
          {transition
            ? "La rugosidad no es la causa necesaria de la capa límite."
            : separated
              ? "Separación: desprendimiento del flujo."
              : turbulent
                ? "Más mezcla entre capas; todavía adherido."
                : "Movimiento ordenado; poca mezcla transversal."}
        </strong>{" "}
        {transition
          ? "La viscosidad y el no deslizamiento ya actúan en una pared lisa. Las perturbaciones pueden modificar su desarrollo."
          : turbulent
            ? "En comparaciones equivalentes suele aumentar la fricción, pero puede retrasar la separación ante un gradiente de presión adverso."
            : separated
              ? "Puede existir separación con una capa límite laminar o turbulenta."
              : "Laminar describe la organización del flujo, no la ausencia de viscosidad."}
      </Insight>
    </Frame>
  );
}

function ForceArea() {
  const [area, setArea] = useState(2);
  const side = Math.sqrt(area) * 74;
  return (
    <Frame
      title="La misma fuerza, repartida en otra área"
      prompt="Antes de mover el control, predice: ¿se concentra más o menos la presión al reducir el área?"
      note="Ejemplo uniforme: fuerza normal total fija de 100 N. La presión estática es una propiedad local del aire, incluso cuando hay movimiento."
    >
      <Diagram
        label={`100 newtons repartidos sobre ${area} metros cuadrados producen ${100 / area} pascales.`}
      >
        <rect
          x={300 - side / 2}
          y={135 - side / 2}
          width={side}
          height={side}
          rx="8"
          fill={PALE}
          stroke={BLUE}
          strokeWidth="2"
        />
        {[-0.3, 0.3].flatMap((dx) =>
          [-0.3, 0.3].map((dy) => (
            <g key={`${dx}-${dy}`}>
              <circle cx={300 + dx * side} cy={135 + dy * side} r="8" fill={GOLD} />
              <circle cx={300 + dx * side} cy={135 + dy * side} r="2" fill={INK} />
            </g>
          )),
        )}
        <text x="300" y="245" textAnchor="middle">
          Fuerza perpendicular al área · vista de frente
        </text>
      </Diagram>
      <Slider
        label="Área que recibe la fuerza"
        value={area}
        min={1}
        max={4}
        display={`${area} m²`}
        onChange={setArea}
      />
      <Insight>
        <strong>{(100 / area).toFixed(1).replace(".", ",")} Pa</strong> = 100 N ÷ {area} m².{" "}
        {area === 1
          ? "La fuerza está más concentrada."
          : "La fuerza total se mantiene; al repartirla sobre más área, la presión disminuye."}
      </Insight>
    </Frame>
  );
}

function PressureLab({ totalFixed = false }: { totalFixed?: boolean }) {
  const [speed, setSpeed] = useState(20);
  const [comparison, setComparison] = useState(totalFixed ? "total" : "static");
  const density = 1.225;
  const dynamic = 0.5 * density * speed * speed;
  const staticPressure = comparison === "static" ? 101325 : 104000 - dynamic;
  const total = staticPressure + dynamic;
  const fmt = (value: number) => (value / 1000).toFixed(3).replace(".", ",");
  const maxQ = 3920;
  return (
    <Frame
      title="Dale velocidad al aire y observa q"
      prompt="Haz una predicción, cambia la velocidad y después abre la relación matemática. La velocidad es relativa a la aeronave."
      note="Modelo didáctico de baja velocidad con densidad fija de 1,225 kg/m³. No es un instrumento, un cálculo de velocidad indicada ni una herramienta operativa."
    >
      <Prediction
        question="si pasas de 20 a 40 m/s, ¿qué ocurre con q?"
        choices={["Se duplica", "Se multiplica por cuatro", "No cambia"]}
        correct={1}
        explanation="A igual densidad, duplicar la velocidad cuadruplica q. Prueba 20 y 40 m/s."
      />
      <Options
        label="Condición de la comparación"
        value={comparison}
        onChange={setComparison}
        choices={[
          { value: "static", label: "Misma presión estática" },
          { value: "total", label: "Misma presión total" },
        ]}
      />
      <Diagram
        height={175}
        label={`Velocidad ${speed} metros por segundo. Presión dinámica ${dynamic.toFixed(1)} pascales. La toma frontal ideal capta presión total, no presión dinámica sola.`}
      >
        {[45, 78, 112].map((y) => (
          <Arrow key={y} x={45} y={y} length={speed * 2.1} />
        ))}
        <path d="M255 72H407V122H461M255 92H387V139H461" fill="none" stroke={INK} strokeWidth="5" />
        <text x="290" y="42">
          Entrada frontal ideal
        </text>
        <text x="481" y="135" fill={BLUE}>
          pt
        </text>
        <circle cx="173" cy="146" r="5" fill={GREEN} />
        <text x="195" y="152" fill={GREEN}>
          Toma estática: ps local
        </text>
      </Diagram>
      <Slider
        label="Velocidad del aire respecto del modelo"
        value={speed}
        min={0}
        max={80}
        step={5}
        display={`${speed} m/s`}
        onChange={setSpeed}
      />
      <div className="cv-measure">
        <div>
          <strong>q · asociada al movimiento</strong>
          <output>{fmt(dynamic)} kPa</output>
        </div>
        <div className="cv-meter">
          <span style={{ width: `${(dynamic / maxQ) * 100}%` }} />
        </div>
        <small>Escala de q: 0 a 3,920 kPa · a 20 m/s: 0,245 kPa</small>
      </div>
      <div className="cv-pressure-values" aria-live="polite">
        <div>
          <span>Estática · ps</span>
          <strong>
            {fmt(staticPressure)} <small>kPa</small>
          </strong>
        </div>
        <span aria-hidden="true">+</span>
        <div>
          <span>Dinámica · q</span>
          <strong>
            {fmt(dynamic)} <small>kPa</small>
          </strong>
        </div>
        <span aria-hidden="true">=</span>
        <div>
          <span>Total · pt</span>
          <strong>
            {fmt(total)} <small>kPa</small>
          </strong>
        </div>
      </div>
      <Insight>
        {speed === 0
          ? "Sin velocidad relativa, q = 0 y pt = ps. Estar parado respecto del suelo no garantiza este caso si sopla viento."
          : comparison === "static"
            ? "Aquí mantienes ps y densidad. Al aumentar V, aumentan q y pt: no has impuesto presión total constante."
            : "Aquí mantienes pt y densidad. Bajo este modelo, al aumentar V sube q y baja ps. No generalices esta comparación a dos vuelos cualesquiera."}
      </Insight>
      <details className="cv-details">
        <summary>Ahora sí: la fórmula y sus límites</summary>
        <p>
          <strong>q = ½ρV²</strong> y, en este modelo, <strong>pt = ps + q</strong>.
        </p>
        <p>
          La suma se aplica al flujo incompresible, estacionario, sin aporte de energía, con
          pérdidas viscosas y cambios de altura despreciables, a lo largo de una línea de corriente.
        </p>
        <p>
          El Pitot ideal lleva presión total. La diferencia pt − ps coincide con q en la
          aproximación incompresible; en flujo compresible no son, en general, iguales. El reposo
          junto a una pared viscosa no equivale a una recuperación ideal de presión total.
        </p>
      </details>
    </Frame>
  );
}

function DensityVolume() {
  const [volume, setVolume] = useState(1);
  const width = 185 * volume;
  return (
    <Frame
      title="Las mismas partículas, otro volumen"
      prompt="Predice qué sucede al comprimir. Después mueve la pared: no se pierde ni se añade masa."
      note="Misma masa y composición. Las partículas y el tamaño del recipiente son esquemáticos; el cambio se representa en una dimensión, manteniendo las otras dos."
    >
      <Diagram
        label={`Una masa de 1 kilogramo ocupa ${volume.toFixed(1)} metros cúbicos. Su densidad es ${(1 / volume).toFixed(2)} kilogramos por metro cúbico.`}
      >
        <ParticleBox
          x={300 - width / 2}
          y={35}
          width={width}
          height={165}
          count={30}
          label="Misma masa: 1 kg"
        />
        <Arrow x={300 + width / 2 + 36} y={120} length={-26} color={GOLD} />
      </Diagram>
      <Slider
        label="Volumen disponible"
        value={volume}
        min={0.5}
        max={2}
        step={0.1}
        display={`${volume.toFixed(1).replace(".", ",")} m³`}
        onChange={setVolume}
      />
      <Insight>
        <strong>{(1 / volume).toFixed(2).replace(".", ",")} kg/m³.</strong>{" "}
        {volume < 1
          ? "Menos volumen para la misma masa: mayor densidad."
          : volume > 1
            ? "Más volumen para la misma masa: menor densidad."
            : "Una unidad de masa en una unidad de volumen."}
      </Insight>
      <details className="cv-details">
        <summary>Conecta la imagen con la fórmula</summary>
        <p>
          ρ = masa / volumen. Con masa constante, reducir el volumen a la mitad duplica la densidad.
        </p>
      </details>
    </Frame>
  );
}

function DensityConditions() {
  const [condition, setCondition] = useState("temperature");
  const [temperature, setTemperature] = useState(15);
  const [pressure, setPressure] = useState(100);
  const [container, setContainer] = useState("open");
  const rigid = condition === "temperature" && container === "rigid";
  const rhoRef = 100000 / (287.05 * 288.15);
  const rho = rigid
    ? rhoRef
    : (condition === "pressure" ? pressure * 1000 : 100000) /
      (287.05 * (condition === "temperature" ? temperature + 273.15 : 288.15));
  const actualPressure = rigid
    ? (100 * (temperature + 273.15)) / 288.15
    : condition === "pressure"
      ? pressure
      : 100;
  return (
    <Frame
      title="Cambia una condición. Declara las otras."
      prompt="¿Calentar siempre baja la densidad? Compara una muestra a presión constante con un recipiente rígido y sellado."
      note="Modelo de gas ideal para aire seco, de composición constante. Cada caja representa el mismo volumen de comparación. No son valores de desempeño ni una atmósfera real completa."
    >
      <Options
        label="Variable a cambiar"
        value={condition}
        onChange={setCondition}
        choices={[
          { value: "temperature", label: "Temperatura" },
          { value: "pressure", label: "Presión" },
        ]}
      />
      {condition === "temperature" && (
        <Options
          label="Condición que se mantiene"
          value={container}
          onChange={setContainer}
          choices={[
            { value: "open", label: "Presión constante" },
            { value: "rigid", label: "Masa y volumen constantes" },
          ]}
        />
      )}
      <Diagram
        label={`Referencia: ${rhoRef.toFixed(3)} kilogramos por metro cúbico. Comparación: ${rho.toFixed(3)} kilogramos por metro cúbico. ${rigid ? "La densidad no cambia; cambia la presión." : "El mismo volumen contiene distinta masa."}`}
      >
        <ParticleBox
          x={60}
          y={37}
          width={195}
          height={160}
          count={30}
          label="Referencia: 15 °C · 100 kPa"
        />
        <ParticleBox
          x={345}
          y={37}
          width={195}
          height={160}
          count={Math.round((30 * rho) / rhoRef)}
          label={rigid ? "Mismo recipiente sellado" : "Igual volumen de muestra"}
        />
        <text x="158" y="254" textAnchor="middle">
          {rhoRef.toFixed(3).replace(".", ",")} kg/m³
        </text>
        <text x="443" y="254" textAnchor="middle">
          {rho.toFixed(3).replace(".", ",")} kg/m³
        </text>
      </Diagram>
      {condition === "temperature" ? (
        <Slider
          label="Temperatura"
          min={-10}
          max={40}
          value={temperature}
          display={`${temperature} °C · ${(temperature + 273.15).toFixed(2).replace(".", ",")} K`}
          onChange={setTemperature}
        />
      ) : (
        <Slider
          label="Presión a temperatura constante de 15 °C"
          min={60}
          max={110}
          step={5}
          value={pressure}
          display={`${pressure} kPa`}
          onChange={setPressure}
        />
      )}
      <Insight>
        <strong>
          {rigid
            ? "Densidad constante."
            : condition === "temperature"
              ? "Presión constante: 100 kPa."
              : "Temperatura constante: 288,15 K."}
        </strong>{" "}
        {rigid
          ? `La masa y el volumen no cambian; la presión pasa a ${actualPressure.toFixed(1).replace(".", ",")} kPa.`
          : condition === "temperature"
            ? "Al calentar, una misma masa necesitaría más volumen. Por eso una muestra del mismo volumen contiene menos masa."
            : "A la misma temperatura y composición, más presión significa mayor densidad."}
      </Insight>
      <details className="cv-details">
        <summary>La relación y la escala correcta</summary>
        <p>
          ρ = p / (R T), usando presión absoluta y temperatura absoluta en kelvin. «Inversamente
          proporcional a la temperatura» requiere mantener presión y composición constantes.
        </p>
      </details>
    </Frame>
  );
}

function HumidityLab() {
  const [humid, setHumid] = useState("dry");
  const water = humid === "humid" ? 4 : 0;
  return (
    <Frame
      title="No desaparecen partículas: cambia la mezcla"
      prompt="Mantén presión, temperatura y volumen. Sustituye parte del aire seco por vapor de agua y compara la masa de las moléculas."
      note="Proporción de vapor ampliada para hacer visible la sustitución; no representa una humedad atmosférica real. Los símbolos representan moléculas, no gotas líquidas."
    >
      <Options
        label="Composición del aire"
        value={humid}
        onChange={setHumid}
        choices={[
          { value: "dry", label: "Aire seco" },
          { value: "humid", label: "Con más vapor de agua" },
        ]}
      />
      <Diagram
        label={
          water
            ? "El número representado de moléculas no cambia. Algunas moléculas del aire seco son sustituidas por moléculas de vapor de agua de menor masa; baja la masa total."
            : "Dos volúmenes iguales de aire seco, a igual presión y temperatura, contienen la misma cantidad y masa de moléculas."
        }
      >
        <ParticleBox
          x={55}
          y={36}
          width={205}
          height={163}
          count={24}
          label="Referencia: aire seco"
        />
        <ParticleBox
          x={340}
          y={36}
          width={205}
          height={163}
          count={24}
          water={water}
          label={water ? "Misma cantidad representada" : "Misma mezcla"}
        />
        <text x="300" y="255" textAnchor="middle">
          ● Aire seco: masa molecular media ≈ 29 u · ◆ Agua: ≈ 18 u
        </text>
      </Diagram>
      <Insight>
        <strong>
          {water
            ? "La mezcla tiene menos masa por el mismo volumen."
            : "Aún no cambia la densidad."}
        </strong>{" "}
        {water
          ? "El vapor de agua reemplaza moléculas más pesadas del aire seco. Por eso baja la densidad a iguales presión y temperatura."
          : "Activa el vapor: observa qué cambia y qué permanece igual."}
      </Insight>
    </Frame>
  );
}

function DensityPerformance() {
  const [ratio, setRatio] = useState(100);
  const [comparison, setComparison] = useState("same");
  const level = comparison === "level";
  const lift = level ? 100 : ratio;
  const speed = level ? Math.sqrt(100 / ratio) * 100 : 100;
  return (
    <Frame
      title="Menos densidad: ¿qué debe cambiar?"
      prompt="Reduce la densidad. Luego decide si conservas la velocidad verdadera o si quieres sostener el mismo peso en vuelo nivelado."
      note="Comparación conceptual: superficie y coeficiente de sustentación constantes. No calcula velocidades seguras, distancias de despegue ni potencia disponible. Para operar se requiere el AFM/POH aplicable."
    >
      <Options
        label="Condiciones del ejemplo"
        value={comparison}
        onChange={setComparison}
        choices={[
          { value: "same", label: "Misma velocidad verdadera" },
          { value: "level", label: "Mismo peso · vuelo nivelado" },
        ]}
      />
      <Diagram
        label={
          level
            ? `Para mantener la sustentación con ${ratio} por ciento de la densidad, este ejemplo aumenta la velocidad verdadera a ${speed.toFixed(0)} por ciento, manteniendo superficie y coeficiente de sustentación.`
            : `A la misma velocidad verdadera, superficie y coeficiente, la sustentación es ${ratio} por ciento de la referencia.`
        }
      >
        <path d="M156 157Q210 103 342 152L448 169L177 178Q139 175 156 157Z" fill={INK} />
        <Arrow x={300} y={121} length={lift * 0.64} vertical color={GREEN} />
        <Arrow x={300} y={186} length={-64} vertical color={GOLD} />
        <text x="337" y="49" fill={GREEN}>
          Sustentación: {lift}%
        </text>
        <text x="337" y="237" fill="#7A5C1E">
          Peso: 100%
        </text>
        <Arrow x={49} y={121} length={speed * 0.9} />
        <text x="45" y="92">
          V verdadera
        </text>
        <text x="45" y="147">
          {speed.toFixed(0)}%
        </text>
      </Diagram>
      <Slider
        label="Densidad respecto de la referencia"
        min={60}
        max={100}
        step={5}
        value={ratio}
        display={`${ratio}%`}
        onChange={setRatio}
      />
      <Insight>
        {level
          ? "Para conservar L = peso, este ejemplo compensa con más velocidad verdadera. También se puede modificar el coeficiente de sustentación, dentro de los límites de la aeronave."
          : "Si mantienes velocidad verdadera, superficie y coeficiente, la sustentación disminuye con la densidad. Así no se conservaría el vuelo nivelado sin un ajuste."}
      </Insight>
      <details className="cv-details">
        <summary>¿Y la propulsión?</summary>
        <p>
          Menos densidad suele dejar menos masa de aire para el motor y el propulsor. En aspiración
          normal puede caer la potencia disponible; sobrealimentación, regulación y límites cambian
          la respuesta. No todos los motores ni hélices responden en igual proporción.
        </p>
      </details>
    </Frame>
  );
}

function Atmosphere() {
  const [level, setLevel] = useState("low");
  const high = level === "high";
  return (
    <Frame
      title="Arriba puede hacer frío y haber menos densidad"
      prompt="Sube de nivel. Observa la tendencia de presión y densidad sin convertir altitud en una ley inversa."
      note="Perfil cualitativo habitual, sin escala ni meteorología real. Altitud no equivale a 1/densidad; para comparar aeropuertos se necesitan las condiciones reales."
    >
      <Options
        label="Nivel de comparación"
        value={level}
        onChange={setLevel}
        choices={[
          { value: "low", label: "Nivel bajo" },
          { value: "high", label: "Nivel alto" },
        ]}
      />
      <Diagram
        label={
          high
            ? "En un perfil atmosférico habitual, a mayor altitud hay menor presión y generalmente menor densidad, aunque disminuya la temperatura."
            : "En el nivel bajo del perfil, la presión y la densidad suelen ser mayores."
        }
      >
        <path d="M30 234L181 47L270 171L325 112L404 234Z" fill="#d5dfeb" />
        <path d="M145 93L181 47L220 102L188 84L172 98Z" fill="#fff" />
        <path
          d={`M45 ${high ? 75 : 204}H554`}
          stroke={GOLD}
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <ParticleBox
          x={397}
          y={40}
          width={156}
          height={157}
          count={high ? 16 : 32}
          label={high ? "Generalmente menos masa" : "Generalmente más masa"}
        />
        <text x="48" y="254">
          {high
            ? "Presión menor; temperatura también puede bajar"
            : "Muestra del mismo volumen y composición"}
        </text>
      </Diagram>
      <Insight>
        {high
          ? "El efecto de la caída de presión suele dominar: la densidad puede bajar a pesar del frío. No compares usando solo temperatura."
          : "Presión, temperatura y composición determinan la densidad. La altitud ayuda a describir un perfil, pero no sustituye esas condiciones."}
      </Insight>
    </Frame>
  );
}

/**
 * Render alongside the canonical content stage. No state escapes the visual,
 * no progress is unlocked, and no official character artwork is reproduced.
 */
export function CiaacTeachingVisual({ lessonNumber, stageIndex }: CiaacTeachingVisualProps) {
  // Keying focused labs makes revisiting another lesson/stage predictably reset its controls.
  const key = `${lessonNumber}:${stageIndex ?? "main"}`;
  if (lessonNumber === 1)
    return stageIndex === 2 ? (
      <AircraftDefinition key={key} />
    ) : (
      <FlightTime key={key} helicopter={stageIndex === 4} />
    );
  if (lessonNumber === 2)
    return stageIndex === 4 || stageIndex === 5 ? (
      <FluidProperties key={key} />
    ) : (
      <MatterLab key={key} initial={stageIndex === 6 ? "gas" : "liquid"} />
    );
  if (lessonNumber === 3) {
    if (stageIndex === 3) return <BoundaryLayer key={key} reference />;
    if (stageIndex === 5) return <FlowRegimes key={key} transition />;
    if (stageIndex === 4 || stageIndex === 7) return <FlowRegimes key={key} />;
    return <BoundaryLayer key={key} />;
  }
  if (lessonNumber === 4)
    return stageIndex === 2 ? (
      <ForceArea key={key} />
    ) : (
      <PressureLab key={key} totalFixed={stageIndex === 4 || stageIndex === 5} />
    );
  if (lessonNumber === 5) {
    if (stageIndex === 3 || stageIndex === 6) return <DensityConditions key={key} />;
    if (stageIndex === 4) return <HumidityLab key={key} />;
    if (stageIndex === 5) return <DensityPerformance key={key} />;
    if (stageIndex === 7) return <Atmosphere key={key} />;
    return <DensityVolume key={key} />;
  }
  return null;
}

const styles = `
.ciaac-visual{--cv-ink:#0f1833;--cv-blue:#163D70;--cv-gold:#C7A052;display:flex;flex-direction:column;gap:18px;min-width:0;padding:24px;border:1px solid #cbd6e5;border-radius:19px;background:linear-gradient(145deg,#fff 0%,#f3f6fa 100%);color:var(--cv-ink);box-shadow:0 7px 25px #0f183308}
.ciaac-visual *{box-sizing:border-box}.ciaac-visual button,.ciaac-visual input{font:inherit}.ciaac-visual .cv-eyebrow{display:block;color:#7A5C1E;font:700 10px ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase}.ciaac-visual .cv-heading h3{margin:8px 0 9px;font:27px/1.13 Georgia,serif;letter-spacing:-.025em}.ciaac-visual p{margin:0;color:#535f73;font-size:13px;line-height:1.65}.ciaac-visual .cv-diagram{display:block;width:100%;height:auto;max-height:320px;border:1px solid #dce3ed;border-radius:12px;background:#f9fbfd;overflow:visible}.ciaac-visual .cv-diagram text{font:12px system-ui,sans-serif}.ciaac-visual .cv-options{display:flex;flex-wrap:wrap;gap:8px}.ciaac-visual .cv-options button{min-height:42px;padding:10px 13px;border:1px solid #bdcbdc;border-radius:10px;background:#fff;color:var(--cv-blue);font-size:12px;font-weight:650;cursor:pointer}.ciaac-visual .cv-options button[aria-pressed=true]{border-color:var(--cv-blue);background:var(--cv-blue);color:#fff;box-shadow:0 2px 8px #163D7020}.ciaac-visual button:focus-visible,.ciaac-visual input:focus-visible,.ciaac-visual summary:focus-visible{outline:3px solid #C7A052;outline-offset:3px}.ciaac-visual .cv-slider{padding:16px 18px;border:1px solid #d9e2ed;border-radius:12px;background:#fff}.ciaac-visual .cv-slider label{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;color:#46536b;font-size:12px;font-weight:650}.ciaac-visual .cv-slider output{color:var(--cv-blue);font-variant-numeric:tabular-nums}.ciaac-visual input[type=range]{display:block;width:100%;height:30px;margin:9px 0 1px;accent-color:var(--cv-blue);cursor:pointer}.ciaac-visual .cv-range-ends{display:flex;justify-content:space-between;color:#66748a;font:10px ui-monospace,monospace}.ciaac-visual .cv-insight{padding:14px 16px;border-left:3px solid var(--cv-gold);border-radius:0 10px 10px 0;background:#f3ead6;color:#4d422b;font-size:13px;line-height:1.65}.ciaac-visual .cv-insight strong{color:#5d4618}.ciaac-visual .cv-note{padding-top:12px;border-top:1px solid #d8e1eb;color:#68758b;font-size:11px;line-height:1.6}.ciaac-visual .cv-events{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:7px}.ciaac-visual .cv-events button{display:flex;align-items:center;gap:8px;min-height:48px;padding:9px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#4b5b73;text-align:left;font-size:11px;line-height:1.35;cursor:pointer}.ciaac-visual .cv-events button>span{display:grid;flex:0 0 22px;height:22px;place-items:center;border-radius:50%;background:#e5edf7;color:var(--cv-blue);font-weight:700}.ciaac-visual .cv-events button[aria-pressed=true]{border-color:var(--cv-blue);background:#e5edf7;color:var(--cv-ink)}.ciaac-visual .cv-prediction{min-width:0;margin:0;padding:12px 14px 14px;border:1px solid #d8c9a9;border-radius:12px;background:#fcf9f2}.ciaac-visual .cv-prediction legend{max-width:100%;padding:0 5px;color:#715520;font-size:12px;font-weight:650}.ciaac-visual .cv-prediction p{margin-top:10px;font-size:12px}.ciaac-visual .cv-details{padding:13px 16px;border:1px solid #cbd6e5;border-radius:11px;background:#fff;font-size:12px}.ciaac-visual .cv-details summary{width:fit-content;max-width:100%;color:var(--cv-blue);font-weight:700;cursor:pointer;line-height:1.5}.ciaac-visual .cv-details p{margin-top:12px}.ciaac-visual .cv-measure{padding:16px;border-radius:12px;background:var(--cv-ink);color:#fff}.ciaac-visual .cv-measure>div:first-child{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12px}.ciaac-visual .cv-measure output{color:#edd5a2;font-variant-numeric:tabular-nums}.ciaac-visual .cv-measure small{display:block;margin-top:9px;color:#b9c8dc;font-size:10px}.ciaac-visual .cv-meter{height:17px;margin-top:12px;overflow:hidden;border:1px solid #8b9bb766;border-radius:5px;background:#ffffff12}.ciaac-visual .cv-meter>span{display:block;height:100%;background:var(--cv-gold);transition:width .2s ease}.ciaac-visual .cv-pressure-values{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:8px;text-align:center}.ciaac-visual .cv-pressure-values>div{min-width:0;padding:13px 4px;border-radius:9px;background:#e8eef6}.ciaac-visual .cv-pressure-values div>span{display:block;margin-bottom:7px;color:#53647e;font-size:10px}.ciaac-visual .cv-pressure-values strong{font:19px/1.3 Georgia,serif;font-variant-numeric:tabular-nums}.ciaac-visual .cv-pressure-values small{font:10px system-ui,sans-serif}
.ciaac-visual .cv-diagram-group{min-width:0}.ciaac-visual .cv-diagram-viewport{max-width:100%;overflow-x:auto;overscroll-behavior-x:contain;border-radius:12px}.ciaac-visual .cv-diagram-viewport.is-expanded .cv-diagram{min-width:720px;max-height:none}.ciaac-visual .cv-zoom{display:block;min-height:38px;margin:5px 0 0 auto;padding:6px 9px;border:0;border-radius:7px;background:transparent;color:var(--cv-blue);font-size:11px;cursor:pointer}.ciaac-visual .cv-zoom:hover{background:#e5edf7}
@media(max-width:600px){.ciaac-visual{gap:14px;padding:17px 13px;border-radius:15px}.ciaac-visual .cv-heading h3{font-size:23px}.ciaac-visual .cv-options button{flex:1;font-size:11px;padding:9px}.ciaac-visual .cv-slider{padding:12px}.ciaac-visual .cv-events{grid-template-columns:1fr 1fr}.ciaac-visual .cv-diagram{min-height:155px}.ciaac-visual .cv-pressure-values{gap:3px}.ciaac-visual .cv-pressure-values strong{font-size:15px}.ciaac-visual .cv-pressure-values small{display:block}.ciaac-visual .cv-pressure-values div>span{font-size:9px}}
@media(prefers-reduced-motion:reduce){.ciaac-visual *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
