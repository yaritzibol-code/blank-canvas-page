import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./CiaacAircraftScenes.css";

export type AircraftKind = "airplane" | "helicopter" | "glider" | "balloon" | "hovercraft";
export type OperationKind = "airplane" | "helicopter";

interface OperationEvent {
  id: string;
  label: string;
  description: string;
  countsTowardFlightTime: boolean;
  physicallyAirborne: boolean;
}

// The endpoints are the OACI definitions taught in this LP, not elapsed clock values.
// eslint-disable-next-line react-refresh/only-export-components
export const AIRPLANE_EVENTS: readonly OperationEvent[] = [
  {
    id: "preparation",
    label: "Preparación en plataforma",
    description: "El avión está estacionado. Todavía no inicia su primer movimiento para despegar.",
    countsTowardFlightTime: false,
    physicallyAirborne: false,
  },
  {
    id: "first-movement",
    label: "Primer movimiento para despegar",
    description:
      "El avión empieza a moverse con propósito de despegar. Aquí empieza este tiempo de vuelo.",
    countsTowardFlightTime: true,
    physicallyAirborne: false,
  },
  {
    id: "taxi-wait",
    label: "Espera durante el rodaje",
    description:
      "El avión está detenido temporalmente. La operación no ha terminado y el tiempo de vuelo sigue contando.",
    countsTowardFlightTime: true,
    physicallyAirborne: false,
  },
  {
    id: "airborne",
    label: "Despegue / en el aire",
    description:
      "El avión ya está físicamente en el aire. El tiempo de vuelo comenzó antes, con el primer movimiento para despegar.",
    countsTowardFlightTime: true,
    physicallyAirborne: true,
  },
  {
    id: "arrival",
    label: "Aterrizaje y rodaje de llegada",
    description:
      "Las ruedas vuelven al suelo y continúa el rodaje de llegada. Todavía falta la detención final.",
    countsTowardFlightTime: true,
    physicallyAirborne: false,
  },
  {
    id: "final-stop",
    label: "Detención final al terminar el vuelo",
    description:
      "El avión se detiene finalmente al terminar el vuelo. Aquí termina el intervalo estudiado.",
    countsTowardFlightTime: false,
    physicallyAirborne: false,
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const HELICOPTER_EVENTS: readonly OperationEvent[] = [
  {
    id: "systems-on",
    label: "Sistemas encendidos; rotor parado",
    description:
      "Los sistemas están encendidos, pero las palas aún no giran. El intervalo estudiado no ha comenzado.",
    countsTowardFlightTime: false,
    physicallyAirborne: false,
  },
  {
    id: "rotor-start",
    label: "Las palas empiezan a girar para esta operación de vuelo",
    description:
      "Las palas empiezan a girar para esta operación de vuelo. Aquí empieza el tiempo de vuelo estudiado.",
    countsTowardFlightTime: true,
    physicallyAirborne: false,
  },
  {
    id: "airborne",
    label: "Despegue / en el aire",
    description: "El helicóptero está físicamente en el aire y las palas siguen girando.",
    countsTowardFlightTime: true,
    physicallyAirborne: true,
  },
  {
    id: "aircraft-stopped",
    label: "Aeronave detenida al terminar; rotor todavía girando",
    description:
      "La aeronave ya se detuvo al terminar, pero las palas aún giran. Todavía falta esa condición para terminar el tiempo de vuelo.",
    countsTowardFlightTime: true,
    physicallyAirborne: false,
  },
  {
    id: "all-stopped",
    label: "Aeronave y palas detenidas",
    description:
      "Al terminar el vuelo, la aeronave y las palas están detenidas. Las dos condiciones del final se cumplen.",
    countsTowardFlightTime: false,
    physicallyAirborne: false,
  },
];

const AIRCRAFT_NAMES: Record<AircraftKind, string> = {
  airplane: "Avión",
  helicopter: "Helicóptero",
  glider: "Planeador",
  balloon: "Globo",
  hovercraft: "Aerodeslizador",
};

const AIRCRAFT_DESCRIPTIONS: Record<AircraftKind, string> = {
  airplane:
    "Avión de ala fija. El ala está destacada: su interacción con el aire permite sostener la aeronave.",
  helicopter:
    "Helicóptero con el rotor destacado. Las palas interactúan con el aire para sostener la aeronave.",
  glider:
    "Planeador sin motor, con alas largas destacadas. Puede sostenerse por su interacción con el aire.",
  balloon:
    "Globo con su envolvente y cesta suspendida. Se sostiene por flotación en el aire, sin depender de una superficie debajo.",
  hovercraft:
    "Aerodeslizador sobre un colchón de aire contenido entre su faldón y el suelo. Su sustentación depende de la superficie debajo.",
};

/** Shared, recognizable airplane geometry keeps identity constant across all physical states. */
function AirplaneBody({
  running = false,
  highlight = false,
}: {
  running?: boolean;
  highlight?: boolean;
}) {
  return (
    <g className="ciaac-aircraft-body" strokeLinejoin="round" strokeLinecap="round">
      {/* Far wing and undercarriage sit behind the fuselage. */}
      <path d="M183 91 135 53 167 54 257 91Z" fill="#8fa7c9" stroke="#0f2d45" strokeWidth="2" />
      <path d="m227 126-13 29m98-32 9 34" fill="none" stroke="#0f2d45" strokeWidth="5" />
      <path d="M206 156h18m89 1h20" stroke="#0f2d45" strokeWidth="3" />
      <circle cx="214" cy="157" r="11" fill="#0f2d45" />
      <circle cx="323" cy="157" r="10" fill="#0f2d45" />
      <circle cx="214" cy="157" r="4" fill="#8fa7c9" />
      <circle cx="323" cy="157" r="3.5" fill="#8fa7c9" />
      {/* Fin, rear fuselage, cabin and cowling form one continuous silhouette. */}
      <path
        d="m33 99-7-62h17l35 57 104-9 39-27h47q18 1 32 20l17 22 38 8q15 4 20 17l-15 9-181-1-117-19Z"
        fill="#0f2d45"
      />
      <path d="m33 94-3-48h9l29 47Z" fill="#8fa7c9" />
      <path d="m40 104 68 9 99 8h158l-10 9-178-1-118-18Z" fill="#8fa7c9" />
      <path d="m87 108 119 4h142" fill="none" stroke="#d4af6b" strokeWidth="4" />
      {/* Cockpit glazing, a visible windshield, and door. */}
      <path d="m227 65-28 23h35V65Zm15 0v23h44l-14-17q-5-6-14-6Z" fill="#f7f5ee" />
      <path d="m278 73 15 23h19l-16-17q-6-6-18-6Z" fill="#8fa7c9" />
      <path d="M238 96v22m-28-20h11" fill="none" stroke="#8fa7c9" strokeWidth="2" />
      {/* The near wing is a long, tapered lifting surface, not a generic arrow. */}
      <path
        d="m190 96-84 36-19 20 25 3 151-55Z"
        fill={highlight ? "#d4af6b" : "#f7f5ee"}
        stroke="#0f2d45"
        strokeWidth="2.5"
      />
      <path d="m119 146 125-45" stroke={highlight ? "#f7f5ee" : "#d4af6b"} strokeWidth="3" />
      <path d="m188 117-52 35" fill="none" stroke="#0f2d45" strokeWidth="3" />
      <path d="m53 98-42 19 7 8 74-15Z" fill="#d4af6b" stroke="#0f2d45" strokeWidth="2" />
      {/* Propeller motion is an engine cue, never the flight-time boundary. */}
      {running && <ellipse cx="374" cy="118" rx="9" ry="35" fill="#8fa7c9" opacity=".2" />}
      <g className={running ? "ciaac-propeller is-running" : "ciaac-propeller"}>
        <path d="M372 84q5-3 5 7l-1 26 2 31q0 7-5 6l-2-34Z" fill="#0f2d45" />
        <path d="M373 85v8m3 51v8" stroke="#d4af6b" strokeWidth="3" />
      </g>
      <circle cx="374" cy="118" r="5" fill="#d4af6b" stroke="#0f2d45" strokeWidth="2" />
    </g>
  );
}

function HelicopterBody({ running = false }: { running?: boolean }) {
  return (
    <g className="ciaac-aircraft-body" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="m194 116-15 32m118-27 14 24M166 151h164q13 0 18-8"
        fill="none"
        stroke="#0f2d45"
        strokeWidth="5"
      />
      <path
        d="m204 114-13 24m104-14 8 14M180 141h139"
        fill="none"
        stroke="#8fa7c9"
        strokeWidth="3"
      />
      <path d="m37 74 161 15 18 34L61 94 33 87Z" fill="#0f2d45" />
      <path d="m48 78 146 17 10 10L54 88Z" fill="#8fa7c9" />
      <path d="m32 84-4-37h11l25 41Z" fill="#d4af6b" stroke="#0f2d45" strokeWidth="2" />
      <path d="m61 91-32 15 5 6 59-14Z" fill="#d4af6b" stroke="#0f2d45" strokeWidth="2" />
      <path
        d="M204 76v-8q0-8 10-9h41q12 0 15 12l2 9"
        fill="#8fa7c9"
        stroke="#0f2d45"
        strokeWidth="2"
      />
      <path d="M235 42v23" stroke="#0f2d45" strokeWidth="6" />
      <path d="M225 57h21" stroke="#0f2d45" strokeWidth="3" />
      <path
        d="M191 91q12-19 38-18h50q24 1 41 18l27 25q7 10-6 15l-24 6-88-2q-35-2-44-20Z"
        fill="#0f2d45"
      />
      <path d="m294 83 5 29 39 7-23-25q-9-9-21-11Z" fill="#8fa7c9" />
      <path d="M286 82h-27v28h32Zm-35 0h-21q-12 0-18 10l-4 15 43 3Z" fill="#f7f5ee" />
      <path d="m199 116 88 5 51 3" fill="none" stroke="#d4af6b" strokeWidth="4" />
      <path d="M256 116v13m-27-12h10" fill="none" stroke="#8fa7c9" strokeWidth="2" />
      {/* A flattened disc plus blades distinguishes running from stopped even when motion is paused. */}
      {running && (
        <ellipse
          className="ciaac-rotor-disc"
          cx="235"
          cy="40"
          rx="152"
          ry="12"
          fill="#d4af6b"
          opacity=".2"
        />
      )}
      <g className={running ? "ciaac-main-rotor is-running" : "ciaac-main-rotor"}>
        <path
          d="m83 34 145 3 158-8v8l-143 6-160-2Z"
          fill="#d4af6b"
          stroke="#0f2d45"
          strokeWidth="1.7"
        />
        <path d="M90 36h14m266-3 10-1" stroke="#f7f5ee" strokeWidth="3" />
      </g>
      <ellipse cx="235" cy="40" rx="10" ry="5" fill="#0f2d45" />
      {running && <circle cx="35" cy="71" r="25" fill="#d4af6b" opacity=".15" />}
      <g className={running ? "ciaac-tail-rotor is-running" : "ciaac-tail-rotor"}>
        <path d="m32 48 7 1-1 19 20 3-1 7-19-2-3 20-7-2 3-19-20-3 1-7 19 4Z" fill="#0f2d45" />
        <path d="m33 48 6 1m18 22-1 7m-28 16 7 2m-23-31-1 7" stroke="#d4af6b" strokeWidth="3" />
      </g>
      <circle cx="35" cy="71" r="5" fill="#d4af6b" />
    </g>
  );
}

function GliderBody() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="m181 96-83-51-19-27 26 2 135 76Z" fill="#8fa7c9" stroke="#0f2d45" strokeWidth="2" />
      <path
        d="m29 99-2-47h14l32 46 143-2q19-20 48-14l48 18 52 11q13 3 17 11-9 6-28 7l-142-6-159-15Z"
        fill="#f7f5ee"
        stroke="#0f2d45"
        strokeWidth="3"
      />
      <path d="m219 96 17-9q15-6 31 0l35 12Z" fill="#8fa7c9" stroke="#0f2d45" strokeWidth="2" />
      <path d="m80 105 145 8 127 8" fill="none" stroke="#d4af6b" strokeWidth="3.5" />
      <path
        d="m195 104-106 72-32 39 24 4 176-111Z"
        fill="#d4af6b"
        stroke="#0f2d45"
        strokeWidth="2.5"
      />
      <path d="m84 207 149-94" fill="none" stroke="#f7f5ee" strokeWidth="3" />
      <path d="m52 100-39 20 5 7 68-21Z" fill="#d4af6b" stroke="#0f2d45" strokeWidth="2" />
      <path d="m32 90-2-31h8l24 36Z" fill="#8fa7c9" />
      <path d="M211 124h13" fill="none" stroke="#0f2d45" strokeWidth="5" />
    </g>
  );
}

function BalloonBody() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M149 38C110 61 112 111 139 142l44 48h36l44-48c28-32 29-81-9-104-31-19-76-19-105 0Z"
        fill="#d4af6b"
        stroke="#0f2d45"
        strokeWidth="3"
      />
      <path
        d="M175 30c-24 33-22 80-7 116l20 44h10l-9-49c-6-38-6-79 7-115M224 29c24 33 22 81 7 117l-19 44h-9l8-49c6-38 7-79-6-115"
        fill="#f7f5ee"
      />
      <path
        d="M175 30c-24 33-22 80-7 116l20 44M224 29c24 33 22 81 7 117l-19 44"
        fill="none"
        stroke="#0f2d45"
        strokeWidth="1.6"
        opacity=".45"
      />
      <path
        d="m182 188 8 27m30-27-8 27m-22-20 3 20m19-20-3 20"
        fill="none"
        stroke="#0f2d45"
        strokeWidth="2"
      />
      <path d="m186 213 3 26q13 5 25 0l4-26Z" fill="#0f2d45" />
      <path
        d="M188 219h28m-26 8h25m-18-12v23m10-23v23"
        fill="none"
        stroke="#d4af6b"
        strokeWidth="1.5"
      />
      <path d="M184 212h35" stroke="#0f2d45" strokeWidth="4" />
      {/* Surrounding air and a broad upward displacement cue, never rotor downwash. */}
      <path
        className="ciaac-buoyancy-cue"
        d="M105 148q-16-37-7-67m194 67q16-37 7-67"
        fill="none"
        stroke="#8fa7c9"
        strokeWidth="3"
      />
    </g>
  );
}

function HovercraftBody() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* The cushion visibly ends at the ground; it is not drawn as free-air lift. */}
      <path
        className="ciaac-air-cushion"
        d="M55 158q134-18 283 0l17 27H38Z"
        fill="#d4af6b"
        opacity=".28"
      />
      <path d="M48 152q151-15 292 0l8 13-17 9H58l-17-10Z" fill="#0f2d45" />
      {[65, 88, 111, 134, 157, 180, 203, 226, 249, 272, 295, 318].map((x) => (
        <path key={x} d={`m${x} 158 2 13`} stroke="#8fa7c9" strokeWidth="2" />
      ))}
      <path
        d="m45 143 77-13 154-7 57 15 14 14H44Z"
        fill="#d4af6b"
        stroke="#0f2d45"
        strokeWidth="2.5"
      />
      <path d="m135 130 14-55h89l47 57Z" fill="#f7f5ee" stroke="#0f2d45" strokeWidth="3" />
      <path
        d="m156 83-8 33h41V83Zm42 0v33h57l-26-33Z"
        fill="#8fa7c9"
        stroke="#0f2d45"
        strokeWidth="2"
      />
      <path d="M142 126h138" stroke="#0f2d45" strokeWidth="3" />
      <path d="M214 76V60m-6 0h28" fill="none" stroke="#0f2d45" strokeWidth="3" />
      <ellipse cx="94" cy="109" rx="25" ry="32" fill="#8fa7c9" stroke="#0f2d45" strokeWidth="5" />
      <ellipse cx="94" cy="109" rx="18" ry="25" fill="#f7f5ee" stroke="#0f2d45" strokeWidth="1.5" />
      <path d="m92 86 4 1 2 21 10 15-5 4-10-15-12-12 4-5 7 9Z" fill="#0f2d45" />
      <circle cx="94" cy="109" r="5" fill="#d4af6b" />
      <path
        className="ciaac-cushion-flow"
        d="M80 179H44l-10 4m275-4h38l11 4"
        fill="none"
        stroke="#b08740"
        strokeWidth="3"
      />
      <path d="M12 186h376" stroke="#0f2d45" strokeWidth="3" />
    </g>
  );
}

function WingAirflow({ glider = false }: { glider?: boolean }) {
  return (
    <g
      className="ciaac-wing-airflow"
      fill="none"
      stroke="#8fa7c9"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path
        d={glider ? "M353 157H267q-28-10-53 5l-47 29H126" : "M373 169h-95q-43-8-64-23l-30-2h-64"}
      />
      <path d={glider ? "M321 177h-60l-81 43H121" : "M360 189h-92q-39-8-72-24h-64"} />
    </g>
  );
}

function SceneSvg({
  title,
  description,
  children,
  viewBox = "0 0 520 310",
}: {
  title: string;
  description: string;
  children: ReactNode;
  viewBox?: string;
}) {
  const id = useId();
  return (
    <svg
      className="ciaac-scene-svg"
      viewBox={viewBox}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-desc`}>{description}</desc>
      {children}
    </svg>
  );
}

/** A central, selectable example. Category controls and explanatory copy belong to its caller. */
export function AircraftIllustration({
  kind,
  motion = true,
  className = "",
}: {
  kind: AircraftKind;
  motion?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`ciaac-aircraft-scene ciaac-aircraft-example ${className}`}
      data-motion={motion ? "on" : "paused"}
      data-aircraft={kind}
    >
      <SceneSvg title={AIRCRAFT_NAMES[kind]} description={AIRCRAFT_DESCRIPTIONS[kind]}>
        {kind === "airplane" && (
          <g transform="translate(54 45) rotate(-5 200 110)">
            <AirplaneBody running highlight />
            <WingAirflow />
          </g>
        )}
        {kind === "helicopter" && (
          <g transform="translate(55 71)">
            <HelicopterBody running />
            <g
              className="ciaac-rotor-wash"
              fill="none"
              stroke="#8fa7c9"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M144 57q-29 52-34 103m217-99q31 51 29 99" />
              <path d="M131 171q-22 13-48 13m255-13q23 13 45 13" />
            </g>
          </g>
        )}
        {kind === "glider" && (
          <g transform="translate(59 39) rotate(-4 200 110)">
            <GliderBody />
            <WingAirflow glider />
          </g>
        )}
        {kind === "balloon" && (
          <g transform="translate(59 3)">
            <BalloonBody />
          </g>
        )}
        {kind === "hovercraft" && (
          <g transform="translate(59 67)">
            <HovercraftBody />
          </g>
        )}
      </SceneSvg>
    </div>
  );
}

const PLANE_POSES = [
  { x: 26, y: 157, angle: 0 },
  { x: 70, y: 157, angle: 0 },
  { x: 102, y: 157, angle: 0 },
  { x: 135, y: 36, angle: -7 },
  { x: 165, y: 157, angle: 0 },
  { x: 188, y: 157, angle: 0 },
];
const HELICOPTER_POSES = [
  { x: 50, y: 174, angle: 0 },
  { x: 50, y: 174, angle: 0 },
  { x: 140, y: 48, angle: -3 },
  { x: 170, y: 174, angle: 0 },
  { x: 170, y: 174, angle: 0 },
];

/** Discrete event scene. Changing eventIndex moves the same aircraft; no internal clock or quiz state. */
export function OperationScene({
  kind,
  eventIndex,
  purpose = "flight",
  motion = true,
  className = "",
}: {
  kind: OperationKind;
  eventIndex: number;
  purpose?: "flight" | "hangar";
  motion?: boolean;
  className?: string;
}) {
  const events = kind === "airplane" ? AIRPLANE_EVENTS : HELICOPTER_EVENTS;
  const requestedIndex = Math.max(
    0,
    Math.min(events.length - 1, Number.isFinite(eventIndex) ? Math.trunc(eventIndex) : 0),
  );
  // Moving to another hangar never accidentally displays a takeoff state.
  const index =
    purpose === "hangar"
      ? requestedIndex === 0
        ? 0
        : requestedIndex === events.length - 1
          ? events.length - 1
          : 1
      : requestedIndex;
  const event = events[index];
  const pose = (kind === "airplane" ? PLANE_POSES : HELICOPTER_POSES)[index];
  const rotorRunning = kind === "helicopter" && index > 0 && index < events.length - 1;
  const engineRunning = kind === "airplane" && index > 0 && index < events.length - 1;
  const groundMoving = kind === "airplane" && (index === 1 || index === 4);
  const physicalLabel = event.physicallyAirborne ? "Físicamente en el aire" : "En tierra";
  const detailLabel =
    kind === "helicopter"
      ? rotorRunning
        ? "Palas en movimiento"
        : "Palas detenidas"
      : index === 2
        ? "Espera temporal"
        : index === 5
          ? "Detención final"
          : groundMoving
            ? "Rodando"
            : index === 0
              ? "Estacionado"
              : "En vuelo físico";
  const description =
    purpose === "hangar"
      ? `La aeronave se mueve para cambiarla de hangar, sin propósito de despegar. Este movimiento no inicia el tiempo de vuelo de la operación estudiada.`
      : event.description;
  const positionStyle: CSSProperties = { transform: `translate(${pose.x}px, ${pose.y}px)` };
  const attitudeStyle: CSSProperties = { transform: `rotate(${pose.angle}deg)` };
  const shadowStyle: CSSProperties = {
    transform: `translate(${pose.x + 204}px, 328px) scale(${event.physicallyAirborne ? 0.67 : 1}, ${event.physicallyAirborne ? 0.6 : 1})`,
    opacity: event.physicallyAirborne ? 0.08 : 0.13,
  };

  return (
    <div
      className={`ciaac-aircraft-scene ciaac-operation-scene ${className}`}
      data-motion={motion ? "on" : "paused"}
      data-aircraft={kind}
      data-event={event.id}
      data-purpose={purpose}
      data-airborne={event.physicallyAirborne}
      data-rotor-running={rotorRunning}
    >
      <SceneSvg
        title={`${AIRCRAFT_NAMES[kind]} · ${purpose === "hangar" ? "Cambio de hangar" : event.label}`}
        description={description}
        viewBox="0 0 600 390"
      >
        {/* One surface is the persistent reference: wheels/skids touch it only on the ground. */}
        <path d="M0 325H600v65H0Z" fill="#0f2d45" opacity=".035" />
        <path d="M16 325H584" stroke="#0f2d45" strokeWidth="2" opacity=".32" />
        <g
          className={groundMoving ? "ciaac-ground-marks is-moving" : "ciaac-ground-marks"}
          stroke="#d4af6b"
          strokeWidth="3"
          strokeLinecap="round"
        >
          {[0, 150, 300, 450, 600, 750, 900].map((x) => (
            <path key={x} d={`M${x} 352h52`} />
          ))}
        </g>
        <ellipse
          className="ciaac-operation-shadow"
          cx="0"
          cy="0"
          rx="140"
          ry="7"
          fill="#0f2d45"
          style={shadowStyle}
        />
        <g className="ciaac-operation-position" style={positionStyle}>
          <g className="ciaac-operation-attitude" style={attitudeStyle}>
            {kind === "airplane" ? (
              <AirplaneBody running={engineRunning} />
            ) : (
              <HelicopterBody running={rotorRunning} />
            )}
          </g>
        </g>
      </SceneSvg>
      <div className="ciaac-scene-status">
        <span>
          <i
            className={
              event.physicallyAirborne ? "ciaac-state-mark is-airborne" : "ciaac-state-mark"
            }
            aria-hidden="true"
          />
          {physicalLabel}
        </span>
        <span className={rotorRunning ? "ciaac-rotor-status is-running" : undefined}>
          {rotorRunning && (
            <i className="ciaac-rotor-status-icon" aria-hidden="true">
              ↻
            </i>
          )}
          {detailLabel}
        </span>
        {purpose === "hangar" && <span>Sin propósito de despegar</span>}
      </div>
    </div>
  );
}
