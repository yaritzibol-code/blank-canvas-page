import { useEffect, useRef, useState } from "react";
import "./aero-concept-visual.css";

type Scene =
  | "surface"
  | "pressure"
  | "density"
  | "massflow"
  | "axes"
  | "control"
  | "trim"
  | "configuration"
  | "system"
  | "stability"
  | "cg"
  | "asymmetry"
  | "airspeed"
  | "envelope"
  | "sequence";
type Concept = {
  scene: Scene;
  title: string;
  caption: string;
  animated?: boolean;
  variant?: string;
};
const key = (module: number, lesson: number, nav: string) => `${module}/${lesson}/${nav}`;
export const AERO_CONCEPTS: Record<string, Concept> = {
  "1/3/Una superficie limpia": {
    scene: "surface",
    title: "La superficie también cambia el flujo",
    caption:
      "La rugosidad o la contaminación puede alterar la transición y la separación. No garantiza una mejora: compara el ala limpia con una superficie irregular. Es una ilustración de mecanismos, no un límite de contaminación admisible.",
  },
  "1/4/Frenar el flujo": {
    scene: "pressure",
    title: "Al frenar el aire, cambia el reparto de presión",
    caption:
      "Flujo ideal, estacionario, de densidad constante y a igual altura: si disminuye V, baja q y aumenta ps; pt permanece constante en esa línea. En flujo real las pérdidas limitan la recuperación.",
    animated: true,
  },
  "1/4/El sistema Pitot-estático": {
    scene: "pressure",
    title: "Dos tomas, una diferencia",
    caption:
      "El Pitot recibe presión total; la toma estática mide presión estática sin frenar el flujo de la misma manera. Su diferencia se relaciona con la velocidad. La animación muestra un balance ideal, no la respuesta ni los errores de un instrumento real.",
    animated: true,
    variant: "pitot",
  },
  "1/5/Temperatura y presión": {
    scene: "density",
    title: "Calentar no significa siempre lo mismo",
    caption:
      "En este caso se mantienen la masa y la presión: al aumentar la temperatura absoluta, el gas ocupa más volumen y su densidad disminuye. Si el volumen se fijara, cambiaría la presión. Los puntos son simbólicos.",
    animated: true,
    variant: "heat",
  },
  "1/5/El ala y la propulsión": {
    scene: "massflow",
    title: "Mismo volumen de aire, distinta masa",
    caption:
      "A igual volumen por segundo, menor densidad significa menor masa por segundo. Esto importa en alas, hélices y motores, pero su respuesta concreta depende también de velocidad, configuración y condiciones de operación.",
  },
  "1/5/La montaña y el avión": {
    scene: "density",
    title: "Altitud: compara el mismo volumen",
    caption:
      "La menor densidad habitual en altura significa menos masa en igual volumen. La temperatura y la presión reales también cuentan: no uses una proporción fija entre altura y prestaciones.",
    variant: "altitude",
  },
};

Object.assign(AERO_CONCEPTS, {
  "4/1/Qué movimiento corresponde": {
    scene: "axes",
    title: "Cada giro tiene su eje",
    caption:
      "El avión gira alrededor de su eje longitudinal en alabeo. Cabeceo corresponde al eje lateral y guiñada al vertical. La animación aísla un giro; en vuelo pueden combinarse.",
    animated: true,
    variant: "roll",
  },
  "4/2/Qué hace una superficie de mando": {
    scene: "control",
    title: "Una deflexión cambia la geometría local",
    caption:
      "Al mover una superficie de mando cambia el flujo y la carga aerodinámica local. Su posición y brazo respecto del centro de gravedad determinan el momento. La deflexión dibujada no representa una respuesta universal ni una recomendación de mando.",
    animated: true,
  },
  "4/3/Qué significa secundarias": {
    scene: "configuration",
    title: "Diferentes dispositivos, diferentes funciones",
    caption:
      "Flap: modifica curvatura y, según el tipo, área. Dispositivo de borde de ataque: modifica el comportamiento del flujo delantero. Spoiler: perturba el flujo sobre el ala. Son funciones distintas; no todos equipan todas las aeronaves.",
    animated: true,
  },
  "4/4/Qué se equilibra": {
    scene: "trim",
    title: "El trim modifica el equilibrio de momentos",
    caption:
      "Compensar alivia el esfuerzo sostenido de mando en una condición elegida. Los momentos se comparan respecto del centro de gravedad. La compensación no inmoviliza el avión ni sustituye el control y la vigilancia.",
    animated: true,
  },
  "4/4/Cuándo hay que reajustar": {
    scene: "trim",
    title: "Otra condición puede pedir otra compensación",
    caption:
      "Velocidad, potencia o configuración pueden modificar el momento de cabeceo y el esfuerzo requerido. El dibujo compara una referencia con un momento cambiante; el procedimiento y la dirección del ajuste dependen de la aeronave.",
    animated: true,
    variant: "change",
  },
  "5/2/Qué necesita el avión": {
    scene: "system",
    title: "El diseño busca un compromiso",
    caption:
      "Crucero, baja velocidad y resistencia estructural imponen necesidades diferentes. La elección se hace para una misión y un avión completo: ningún perfil gana simultáneamente en todos los criterios.",
    variant: "design",
  },
  "5/2/Por qué cambia la configuración": {
    scene: "configuration",
    title: "La geometría se adapta a la fase de vuelo",
    caption:
      "Desplegar dispositivos puede cambiar sustentación, resistencia y momentos; también añade masa y complejidad. Se compara geometría, no prestaciones certificadas. La configuración autorizada se obtiene del AFM/POH.",
    animated: true,
  },
});

Object.assign(AERO_CONCEPTS, {
  "6/1/El avión completo": {
    scene: "system",
    title: "Un flap cambia más que una fuerza",
    caption:
      "El cambio local del ala modifica sustentación y resistencia, y puede modificar el momento de cabeceo del avión completo. No hay un sentido de compensación válido para todas las aeronaves.",
  },
  "6/2/Elegir una configuración": {
    scene: "sequence",
    title: "La configuración se elige con condiciones y límites",
    caption:
      "Fase de vuelo, masa, velocidad y limitaciones se consideran antes de elegir. El dibujo conecta datos con una configuración autorizada, no prescribe una posición de flap.",
    variant: "choose",
  },
  "6/2/La aproximación frustrada": {
    scene: "sequence",
    title: "La transición exige conservar margen",
    caption:
      "En una aproximación frustrada cambian potencia, actitud y configuración bajo el procedimiento publicado. Retirar sustentación de golpe puede reducir el margen: la secuencia y velocidades son específicas del AFM/POH.",
    animated: true,
    variant: "goaround",
  },
  "6/3/El borde delantero": {
    scene: "configuration",
    title: "El dispositivo delantero cambia el flujo de entrada",
    caption:
      "Un slat puede abrir una ranura y modificar la distribución de presión y el comportamiento de la capa límite. No actúa simplemente como una inyección de energía; geometría y condiciones determinan su efecto.",
    animated: true,
    variant: "leading",
  },
  "6/3/Trabajar como sistema": {
    scene: "configuration",
    title: "Borde de ataque y flap trabajan en conjunto",
    caption:
      "El efecto combinado depende del diseño. La coordinación de dispositivos cambia la geometría y permite gestionar el comportamiento a baja velocidad, dentro de límites estructurales y de operación.",
    animated: true,
  },
  "6/4/Gestionar energía en vuelo": {
    scene: "control",
    title: "El spoiler cambia el flujo sobre el ala",
    caption:
      "Desplegar un spoiler suele aumentar resistencia y reducir sustentación local. Su empleo en vuelo afecta la energía y la trayectoria; no convierte cualquier descenso en una maniobra segura.",
    animated: true,
    variant: "spoiler",
  },
  "6/4/Vuelo y tierra": {
    scene: "sequence",
    title: "En tierra cambia el objetivo",
    caption:
      "En vuelo se gestiona energía y control. Tras el contacto, los spoilers autorizados reducen sustentación y favorecen carga sobre las ruedas. Lógica, condiciones y limitaciones dependen del sistema.",
    variant: "ground",
  },
  "7/1/Capacidad de maniobra": {
    scene: "axes",
    title: "Maniobrar es cambiar el estado de vuelo",
    caption:
      "Una maniobra requiere momentos de control y respuesta de la aeronave; la estabilidad describe su tendencia tras una perturbación. Son propiedades relacionadas, pero no equivalentes.",
    animated: true,
  },
  "7/1/El compromiso de diseño": {
    scene: "system",
    title: "Estabilidad, control y misión se valoran juntos",
    caption:
      "El diseño combina estabilidad, capacidad de control y maniobrabilidad para una misión. No se deduce el comportamiento completo de una sola etiqueta ni existe un compromiso idéntico en todos los aviones.",
    variant: "stability",
  },
  "7/2/Cuando el movimiento crece": {
    scene: "stability",
    title: "Una oscilación puede aumentar con el tiempo",
    caption:
      "Aquí crece la amplitud de una perturbación: comportamiento dinámicamente inestable en este esquema. El sentido de la primera respuesta no basta para describir toda la evolución.",
    animated: true,
    variant: "growing",
  },
  "7/2/Leer las gráficas": {
    scene: "stability",
    title: "Mira la envolvente de la oscilación",
    caption:
      "Amplitud decreciente, constante o creciente describe tres respuestas dinámicas. Compara tiempo y perturbación con la misma escala. No son datos de una aeronave ni indican por sí solos un procedimiento.",
    animated: true,
    variant: "compare",
  },
  "7/3/Longitudinal": {
    scene: "cg",
    title: "El cabeceo se estudia respecto del centro de gravedad",
    caption:
      "Ala, cola y posición del centro de gravedad participan en el balance longitudinal. La estabilidad depende de cómo cambia el momento con la perturbación, no solo de que los momentos sean iguales en un instante.",
  },
  "7/3/Separar para comprender": {
    scene: "axes",
    title: "Los ejes separan el análisis, no el avión real",
    caption:
      "Alabeo, cabeceo y guiñada se estudian por separado para identificar causas. En vuelo pueden acoplarse; una respuesta en un eje puede modificar los otros.",
    animated: true,
  },
  "7/4/Mover el peso": {
    scene: "cg",
    title: "Mover una masa desplaza el centro de gravedad",
    caption:
      "Al mover una masa interna hacia atrás, el centro de gravedad total se desplaza hacia atrás. No se mueve necesariamente el centro aerodinámico. La posición permitida se verifica con peso y balance, no con este esquema.",
    animated: true,
    variant: "move",
  },
  "7/6/Interpretar sin improvisar": {
    scene: "asymmetry",
    title: "Empujes diferentes crean un momento",
    caption:
      "En este esquema bimotor, la diferencia de empuje produce un momento de guiñada respecto del CG. El control disponible y las condiciones limitan la respuesta. El dibujo no sustituye procedimientos ni velocidades publicadas.",
    animated: true,
  },
  "8/2/Interpretar sin simplificar de más": {
    scene: "airspeed",
    title: "IAS y TAS describen cosas distintas",
    caption:
      "En la aproximación incompresible y con correcciones despreciadas, mantener IAS implica presión dinámica comparable. Si baja la densidad, aumenta la TAS correspondiente. Viento cambia velocidad sobre el suelo; no se debe confundir con TAS.",
    animated: true,
  },
  "8/3/Usar el concepto correctamente": {
    scene: "envelope",
    title: "La maniobra tiene varios límites",
    caption:
      "La envolvente reúne pérdida y límites estructurales para condiciones definidas. Estar dentro de un dibujo genérico no autoriza una maniobra. Masa, configuración, ráfagas y limitaciones publicadas importan.",
    animated: true,
  },
});

export function hasAeroConcept(module: number, lesson: number, nav: string) {
  return Object.hasOwn(AERO_CONCEPTS, key(module, lesson, nav));
}
const WING =
  "M100 126 C91 110 121 91 167 88 C262 80 376 115 452 135 C350 130 220 151 142 140 C116 137 103 132 100 126Z";
const GOLD = "#e7c77b",
  BLUE = "#78c8ee",
  WHITE = "#e5eff7";
function Arrow({
  x,
  y,
  length,
  color = GOLD,
}: {
  x: number;
  y: number;
  length: number;
  color?: string;
}) {
  const sign = Math.sign(length) || 1;
  return (
    <path
      d={`M${x} ${y}h${length}l${-sign * 6} -4m${sign * 6} 4l${-sign * 6} 4`}
      fill="none"
      stroke={color}
      strokeWidth="2.4"
    />
  );
}
function Wing({ transform }: { transform?: string }) {
  return <path d={WING} transform={transform} fill={WHITE} stroke="#f9fcff" strokeWidth="1.4" />;
}
function Text({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor}>
      {children}
    </text>
  );
}
function ConceptScene({ concept, phase }: { concept: Concept; phase: number }) {
  const blend = (1 - Math.cos(phase)) / 2;
  if (concept.scene === "surface")
    return (
      <>
        {[0, 1].map((side) => (
          <g key={side} transform={`translate(${side * 340} 28) scale(.64)`}>
            <Wing />
            {[18, 38].map((offset) => (
              <path
                key={offset}
                d={`M20 ${100 - offset}Q180 ${40 - offset} 330 ${90 - offset}T490 ${118 - offset}`}
                fill="none"
                stroke={BLUE}
                strokeWidth="2.5"
              />
            ))}
            {side === 1 &&
              Array.from({ length: 11 }, (_, i) => (
                <circle
                  key={i}
                  cx={145 + i * 19}
                  cy={[89, 85, 85, 85, 87, 90, 94, 98, 103, 107, 111][i]}
                  r="4"
                  fill={GOLD}
                />
              ))}
            <Text x={230} y={210} anchor="middle">
              {side ? "Superficie irregular" : "Superficie limpia"}
            </Text>
          </g>
        ))}
        <Text x={35} y={214}>
          La geometría de la superficie cambia la interacción con el aire.
        </Text>
      </>
    );
  if (concept.scene === "pressure") {
    const dynamic = 115 - 70 * blend;
    return (
      <>
        <Text x={28} y={28}>
          {concept.variant === "pitot"
            ? "Pitot: pt · toma estática: ps"
            : "Un reparto que cambia; una suma constante"}
        </Text>
        <path d="M28 83H298M28 155H298" stroke={BLUE} fill="none" strokeWidth="2" />
        <Arrow x={55} y={105} length={100 * Math.sqrt(dynamic / 115)} />
        {concept.variant === "pitot" && (
          <>
            <path d="M238 108H270V191" stroke={WHITE} strokeWidth="7" fill="none" />
            <circle cx="237" cy="108" r="4" fill={GOLD} />
            <Text x={226} y={218}>
              pt
            </Text>
            <circle cx="144" cy="155" r="4" fill={GOLD} />
            <Text x={136} y={183}>
              ps
            </Text>
          </>
        )}
        <Text x={385} y={65}>
          pt = ps + q
        </Text>
        <rect x="374" y="89" width={220 - dynamic} height="46" fill={BLUE} />
        <rect x={594 - dynamic} y="89" width={dynamic} height="46" fill={GOLD} />
        <Text x={391} y={162}>
          ps
        </Text>
        <Text x={555} y={162}>
          q
        </Text>
        <Text x={373} y={203}>
          V menor → q menor
        </Text>
        <Text x={373} y={226}>
          Suma ideal constante
        </Text>
      </>
    );
  }
  if (concept.scene === "density") {
    const heat = concept.variant === "heat";
    const width = heat ? 174 + 60 * blend : 174;
    return (
      <>
        <Text x={30} y={28}>
          {heat ? "Misma masa · presión constante" : "Dos volúmenes iguales"}
        </Text>
        {[0, 1].map((i) => (
          <g key={i}>
            <rect
              x={45 + i * 335}
              y="60"
              width={i ? width : 174}
              height="116"
              rx="7"
              stroke={i ? GOLD : BLUE}
              fill="none"
              strokeWidth="2"
            />
            {Array.from({ length: heat ? 16 : i ? 8 : 16 }, (_, n) => (
              <circle
                key={n}
                cx={58 + i * 335 + ((n % 4) * ((i ? width : 174) - 26)) / 3}
                cy={75 + Math.floor(n / 4) * 28}
                r="4"
                fill={i ? GOLD : BLUE}
              />
            ))}
            <Text x={45 + i * 335} y={205}>
              {heat
                ? i
                  ? "Al calentar: V aumenta"
                  : "Estado de referencia"
                : i
                  ? "Menor densidad"
                  : "Mayor densidad"}
            </Text>
          </g>
        ))}
        <Text x={30} y={238}>
          {heat
            ? "ρ = masa / volumen: la misma masa queda más repartida."
            : "Menos masa en el mismo espacio; no es un vacío."}
        </Text>
      </>
    );
  }
  if (concept.scene === "massflow")
    return (
      <>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(0 ${i * 103})`}>
            <Text x={25} y={28}>
              {i ? "Menor densidad" : "Mayor densidad"}
            </Text>
            <rect x="215" y="7" width="135" height="75" stroke={BLUE} fill="none" />
            {Array.from({ length: i ? 6 : 12 }, (_, n) => (
              <circle
                key={n}
                cx={235 + (n % 4) * 30}
                cy={24 + Math.floor(n / 4) * 21}
                r="4"
                fill={GOLD}
              />
            ))}
            <Arrow x={373} y={46} length={85} />
            <Text x={482} y={40}>
              {i ? "Menor masa / s" : "Mayor masa / s"}
            </Text>
          </g>
        ))}
        <Text x={28} y={238}>
          Se mantiene el volumen por segundo para comparar.
        </Text>
      </>
    );
  if (concept.scene === "axes") {
    const angle = 18 * Math.sin(phase);
    return (
      <>
        <Text x={30} y={30}>
          Vista frontal · alabeo
        </Text>
        <g transform={`rotate(${angle} 245 132)`}>
          <path
            d="M68 137L221 126L234 82H253L267 126L423 137L420 147L266 142L254 180H235L222 142L68 147Z"
            fill={WHITE}
          />
          <circle cx="245" cy="132" r="8" fill={GOLD} />
        </g>
        <path d="M55 143H435" stroke={BLUE} strokeDasharray="5 5" fill="none" />
        <path d="M202 64Q245 45 285 71l-8 -1m8 1l-3 -8" stroke={GOLD} fill="none" strokeWidth="2" />
        <Text x={461} y={80}>
          Alabeo
        </Text>
        <Text x={461} y={104}>
          eje longitudinal
        </Text>
        <Text x={461} y={153}>
          Cabeceo: lateral
        </Text>
        <Text x={461} y={185}>
          Guiñada: vertical
        </Text>
        <Text x={30} y={235}>
          El punto dorado representa el eje visto de frente.
        </Text>
      </>
    );
  }
  if (concept.scene === "control" && concept.variant === "spoiler")
    return (
      <>
        <Text x={28} y={28}>
          Spoiler levantado sobre el ala
        </Text>
        <Wing />
        <path
          d="M245 97L285 104"
          transform={`rotate(${-55 * blend} 245 97)`}
          stroke={GOLD}
          strokeWidth="6"
        />
        <circle cx="245" cy="97" r="4" fill={BLUE} />
        <path
          d={`M35 88Q145 58 235 77Q300 ${75 - 45 * blend} 445 ${102 - 40 * blend}`}
          stroke={BLUE}
          fill="none"
          strokeWidth="2"
        />
        <Text x={477} y={94}>
          Flujo perturbado
        </Text>
        <Text x={477} y={130}>
          Carga local cambia
        </Text>
        <Text x={28} y={233}>
          No es el mismo movimiento que bajar un flap.
        </Text>
      </>
    );
  if (concept.scene === "control" || concept.scene === "configuration") {
    const angle = concept.variant === "leading" ? 0 : 25 * blend;
    return (
      <>
        <Text x={28} y={28}>
          {concept.scene === "control" ? "Superficie articulada" : "Ejemplo: geometría variable"}
        </Text>
        <path
          d="M100 126 C91 110 121 91 167 88 C232 83 292 100 345 116 L345 137 C264 143 186 147 142 140 C116 137 103 132 100 126Z"
          fill={WHITE}
        />
        <g transform={`rotate(${angle} 345 127)`}>
          <path d="M345 116L452 135L345 137Z" fill={BLUE} />
        </g>
        <circle cx="345" cy="127" r="4" fill={GOLD} />
        {concept.scene === "configuration" && (
          <path
            d={`M110 110Q${75 - 12 * blend} ${84 - 8 * blend} ${94 - 10 * blend} ${133 + 8 * blend}`}
            stroke={GOLD}
            strokeWidth="6"
            fill="none"
          />
        )}
        <Text x={472} y={94}>
          {concept.variant === "leading"
            ? "Slat separado"
            : concept.scene === "configuration"
              ? "Borde de ataque"
              : "Deflexión"}
        </Text>
        <Text x={472} y={126}>
          {concept.variant === "leading"
            ? "ranura abierta"
            : concept.scene === "configuration"
              ? "+ borde de salida"
              : "↓"}
        </Text>
        <Text x={472} y={158}>
          {concept.scene === "configuration" ? "cambian el perfil" : "carga local distinta"}
        </Text>
        <Text x={28} y={226}>
          Geometría ampliada; no es una secuencia de operación.
        </Text>
      </>
    );
  }
  if (concept.scene === "trim") {
    const moment = 45 + 105 * blend;
    return (
      <>
        <Text x={28} y={28}>
          Comparación de momentos respecto del CG
        </Text>
        <Wing transform="translate(-22 17) scale(.9)" />
        <circle cx="219" cy="132" r="6" fill={GOLD} />
        <Text x={209} y={165}>
          CG
        </Text>
        <path
          d="M188 73Q220 42 251 73l-7 -1m7 1l-1 -7"
          fill="none"
          stroke={GOLD}
          strokeWidth="2.5"
        />
        <path
          d="M252 180Q220 210 188 180l7 1m-7 -1l1 7"
          fill="none"
          stroke={BLUE}
          strokeWidth="2.5"
        />
        <Text x={427} y={65}>
          Momento de referencia
        </Text>
        <rect x="427" y="78" width="150" height="17" fill={GOLD} />
        <Text x={427} y={129}>
          Momento opuesto
        </Text>
        <rect x="427" y="142" width={moment} height="17" fill={BLUE} />
        <Text x={427} y={196}>
          {blend > 0.98 ? "Balance en este ejemplo" : "Reparto cambiante"}
        </Text>
        <Text x={28} y={240}>
          Equilibrio de momentos ≠ ausencia de fuerzas.
        </Text>
      </>
    );
  }
  if (concept.scene === "system")
    return (
      <>
        <path
          d="M347 45L360 48L375 111L539 141V154L371 138L370 191L402 206V214L352 204L304 214V206L335 191L334 138L167 154V141L329 111L341 48Z"
          fill={WHITE}
        />
        <path d="M161 147L98 99M543 147L611 99M354 209V228" stroke={GOLD} fill="none" />
        <Text x={23} y={73}>
          {concept.variant === "design"
            ? "Crucero eficiente"
            : concept.variant === "stability"
              ? "Estabilidad"
              : "Sustentación"}
        </Text>
        <Text x={511} y={73}>
          {concept.variant === "design"
            ? "Baja velocidad"
            : concept.variant === "stability"
              ? "Control"
              : "Resistencia"}
        </Text>
        <Text x={354} y={245} anchor="middle">
          {concept.variant === "design"
            ? "Masa y estructura"
            : concept.variant === "stability"
              ? "Misión y maniobra"
              : "Momento y equilibrio"}
        </Text>
      </>
    );
  if (concept.scene === "sequence") {
    const ground = concept.variant === "ground",
      choose = concept.variant === "choose";
    const labels = choose
      ? ["Fase y condiciones", "Límites publicados", "Configuración"]
      : ground
        ? ["En vuelo", "Contacto", "Carga en ruedas"]
        : ["Estado inicial", "Transición", "Nuevo equilibrio"];
    return (
      <>
        {labels.map((label, i) => (
          <g key={label} transform={`translate(${22 + i * 225} 18)`}>
            <rect x="0" y="28" width="204" height="132" rx="10" fill="none" stroke={GOLD} />
            <Text x={102} y={16} anchor="middle">
              {label}
            </Text>
            {choose ? (
              <>
                <path d="M50 56H153M50 82H140M50 108H124" stroke={BLUE} strokeWidth="4" />
                <circle cx="162" cy="133" r="13" fill="none" stroke={GOLD} />
              </>
            ) : (
              <>
                <path
                  d="M34 100L87 85L99 58L111 59L114 88L175 104L171 111L113 105L112 130L97 131L87 106L33 108Z"
                  fill={WHITE}
                  transform={ground ? undefined : `rotate(${-i * 5} 103 96)`}
                />
                {ground && (
                  <path
                    d="M20 143H183"
                    stroke={i ? GOLD : BLUE}
                    strokeDasharray={i ? undefined : "4 4"}
                  />
                )}
              </>
            )}
            {i < 2 && <Arrow x={208} y={95} length={14} />}
          </g>
        ))}
        {concept.animated && <circle cx={35 + blend * 630} cy="212" r="6" fill={GOLD} />}
        <Text x={28} y={245}>
          {choose
            ? "La elección sale de datos, no de una regla única."
            : ground
              ? "La sustentación descargaba ruedas; reducirla favorece su carga."
              : "La animación muestra una transición conceptual, no pasos de cabina."}
        </Text>
      </>
    );
  }
  if (concept.scene === "stability") {
    const types = concept.variant === "compare" ? ["damped", "neutral", "growing"] : ["growing"];
    const value = (x: number, type: string) =>
      Math.sin(x * 0.075) *
      (type === "growing" ? 10 + x * 0.09 : type === "damped" ? 49 * Math.exp(-x / 145) : 28);
    return (
      <>
        <Text x={24} y={25}>
          Perturbación
        </Text>
        <path d="M60 45V215H656M60 133H656" stroke="#718aa1" fill="none" />
        {types.map((type, i) => (
          <path
            key={type}
            d={Array.from(
              { length: 101 },
              (_, n) => `${n ? "L" : "M"}${60 + n * 5.7},${133 - value(n * 5.7, type)}`,
            ).join(" ")}
            stroke={[BLUE, GOLD, "#ef978b"][types.length === 1 ? 2 : i]}
            fill="none"
            strokeWidth="2"
          />
        ))}
        {types.map((type, i) => {
          const x = (phase * 49) % 565;
          return (
            <circle
              key={type}
              cx={60 + x}
              cy={133 - value(x, type)}
              r="5"
              fill={[BLUE, GOLD, "#ef978b"][types.length === 1 ? 2 : i]}
            />
          );
        })}
        <Text x={552} y={244}>
          Tiempo →
        </Text>
        <Text x={60} y={244}>
          {types.length === 1
            ? "Amplitud creciente"
            : "Azul: decrece · dorado: constante · coral: crece"}
        </Text>
      </>
    );
  }
  if (concept.scene === "cg") {
    const shift = concept.variant === "move" ? blend * 74 : 0;
    return (
      <>
        <Text x={28} y={28}>
          Masa interna y posición del CG
        </Text>
        <path d="M76 148Q55 119 102 112H457L479 72H498L495 129L580 148L565 158H102Z" fill={WHITE} />
        <path d="M253 130L302 161L196 172L184 161Z" fill={BLUE} />
        <rect x={240 + shift * 2} y="118" width="20" height="19" fill={GOLD} />
        <circle cx={255 + shift} cy="151" r="5" fill={GOLD} />
        <Text x={247 + shift} y={204}>
          CG
        </Text>
        <path
          d={`M${255 + shift} 159v26l-4 -6m4 6l4 -6`}
          stroke={GOLD}
          fill="none"
          strokeWidth="2"
        />
        <path d="M226 91V113" stroke={BLUE} strokeDasharray="3 3" />
        <Text x={178} y={80}>
          Referencia del ala
        </Text>
        <Text x={28} y={242}>
          {concept.variant === "move"
            ? "La masa y el CG se desplazan; la referencia del ala permanece fija."
            : "La posición de las fuerzas crea brazos de momento."}
        </Text>
      </>
    );
  }
  if (concept.scene === "asymmetry")
    return (
      <>
        <path
          d="M338 57L352 57L364 116L525 138V153L361 141L355 202H339L332 141L169 153V138L332 116Z"
          fill={WHITE}
        />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={245 + i * 172} y="125" width="23" height="52" rx="8" fill={BLUE} />
            <path
              d={`M${256 + i * 172} 124v-${i ? 30 + 50 * blend : 80}l-4 6m4 -6l4 6`}
              stroke={GOLD}
              fill="none"
              strokeWidth="3"
            />
          </g>
        ))}
        <circle cx="346" cy="137" r="5" fill={GOLD} />
        <Text x={23} y={28}>
          Vista superior · empuje hacia delante
        </Text>
        <Text x={30} y={236}>
          Empujes desiguales → momento de guiñada alrededor del CG.
        </Text>
      </>
    );
  if (concept.scene === "airspeed")
    return (
      <>
        <Text x={28} y={30}>
          Presión dinámica comparable
        </Text>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(0 ${i * 93})`}>
            <Text x={28} y={80}>
              {i
                ? `ρ relativa: ${(110 ** 2 / (145 + 55 * blend) ** 2).toFixed(2)}`
                : "ρ referencia: 1"}
            </Text>
            <Arrow x={205} y={74} length={i ? 145 + 55 * blend : 110} />
            <Text x={414} y={80}>
              {i ? "TAS mayor" : "TAS de referencia"}
            </Text>
          </g>
        ))}
        <Text x={28} y={243}>
          q = ½ρV² · V es velocidad verdadera respecto del aire.
        </Text>
      </>
    );
  if (concept.scene === "envelope") {
    const x = 180 + 260 * blend;
    return (
      <>
        <path d="M72 204H630M72 204V42" stroke="#7891aa" fill="none" />
        <path
          d="M105 198Q160 146 248 72H529V201Z"
          fill="#78c8ee"
          fillOpacity=".14"
          stroke={BLUE}
          strokeWidth="2"
        />
        <path d="M248 72H529V201" stroke={GOLD} strokeWidth="3" fill="none" />
        <circle cx={x} cy="160" r="6" fill={GOLD} />
        <Text x={20} y={26}>
          Factor de carga
        </Text>
        <Text x={475} y={233}>
          Velocidad →
        </Text>
        <Text x={123} y={103}>
          Pérdida
        </Text>
        <Text x={320} y={56}>
          Límite estructural
        </Text>
        <Text x={550} y={136}>
          Límite V
        </Text>
        <Text x={90} y={254}>
          Solo porción positiva y cualitativa de una envolvente.
        </Text>
      </>
    );
  }
  return null;
}

/** Explanatory motion is opt-in. It never gates a lesson or runs on diagnostic stages. */
export function AeroConceptVisual({
  module,
  lesson,
  nav,
  kind,
}: {
  module: number;
  lesson: number;
  nav: string;
  kind: string;
}) {
  const concept = AERO_CONCEPTS[key(module, lesson, nav)];
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const elapsed = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (preference.matches) setPlaying(false);
    };
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!playing || kind !== "content" || !concept?.animated) return;
    let id = 0;
    let previous: number | null = null;
    const frame = (now: number) => {
      if (previous !== null) elapsed.current += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      setPhase(elapsed.current * 0.7);
      id = window.requestAnimationFrame(frame);
    };
    id = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(id);
  }, [playing, kind, concept]);
  if (!concept || kind !== "content") return null;
  return (
    <figure
      className="aero-concept-visual"
      data-concept={concept.scene}
      data-motion={!!concept.animated}
    >
      <div className="aero-concept-header">
        <h3>{concept.title}</h3>
        {concept.animated && (
          <button type="button" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
            {playing ? "Pausar explicación" : "Animar explicación"}
          </button>
        )}
      </div>
      <svg
        viewBox="0 0 700 260"
        role="img"
        aria-label={concept.title}
        data-phase={phase.toFixed(3)}
      >
        <title>{concept.title}</title>
        <desc>{concept.caption}</desc>
        <ConceptScene concept={concept} phase={phase} />
      </svg>
      <figcaption>
        {concept.caption}
        <small>
          Esquema original FlightPath · cualitativo, sin escala; no sustituye datos del AFM/POH.
        </small>
      </figcaption>
    </figure>
  );
}
