import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { HandbookFigure } from "@/lib/lp/handbook-types";
import "./ciaac-propeller-diagrams.css";

export interface ApprovedPropellerDiagramProps {
  mode: "geometry" | "pitch" | "forces";
  /** The full, uncropped propeller-master-v2 asset. Anchors use its 1536 × 1024 frame. */
  figure: HandbookFigure;
  onZoom?: (figure: HandbookFigure) => void;
  /** Omit when the containing lesson already owns its source footer. */
  source?: { title: string; url: string };
}

const colors = { axial: "#8ee4ed", radial: "#ffd38a", aero: "#bfb5ff", centrifugal: "#ffbbd7" };
// Reviewed approximate image landmarks. These are placement anchors, not measurements.
const stations = [
  { label: "Raíz", x: 856, y: 392, slope: 0.66 },
  { label: "Zona media", x: 1128, y: 266, slope: 0.42 },
  { label: "Punta", x: 1400, y: 114, slope: 0.2 },
];
const forceLabels = [
  "Todas",
  "Tracción",
  "Tensión radial",
  "Torsión aerodinámica",
  "Torsión centrífuga",
];
const pitchLabels = ["Todo", "Paso geométrico", "Paso efectivo", "Resbalamiento"];
const titles = {
  geometry: "Geometría de la pala",
  pitch: "Avance en una vuelta",
  forces: "Direcciones de las fuerzas",
};

function Selectors({
  labels,
  value,
  onChange,
  controls,
  label,
}: {
  labels: string[];
  value: number;
  onChange: (value: number) => void;
  controls: string;
  label: string;
}) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % labels.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + labels.length - 1) % labels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = labels.length - 1;
    else return; // Enter and Space retain native button behavior.
    event.preventDefault();
    onChange(next);
    buttons.current[next]?.focus();
  };
  return (
    <div className="am-propeller__selectors" role="group" aria-label={label}>
      {labels.map((item, index) => (
        <button
          key={item}
          type="button"
          ref={(node) => {
            buttons.current[index] = node;
          }}
          aria-pressed={index === value}
          aria-controls={controls}
          onClick={() => onChange(index)}
          onKeyDown={(event) => navigate(event, index)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Arrowheads({ id }: { id: string }) {
  return (
    <defs>
      {Object.entries(colors).map(([name, color]) => (
        <marker
          key={name}
          id={`${id}-${name}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="3"
          markerHeight="3"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

function Master({
  figure,
  onZoom,
  mode,
  selected,
  id,
}: Omit<ApprovedPropellerDiagramProps, "source"> & { selected: number; id: string }) {
  const arrows = `${id}-master`;
  const highlighted = (index: number) => selected === 0 || selected === index;
  return (
    <figure className="am-propeller__master">
      <div className="am-propeller__master-head">
        <span>Hélice de referencia · paso fijo</span>
        {onZoom && (
          <button type="button" onClick={() => onZoom(figure)}>
            Ampliar ilustración
          </button>
        )}
      </div>
      <div className="am-propeller__frame">
        <img src={figure.file} alt={figure.alt} width="1536" height="1024" />
        {mode !== "pitch" && (
          <svg
            className="am-propeller__overlay"
            viewBox="0 0 1536 1024"
            aria-hidden="true"
            focusable="false"
          >
            <Arrowheads id={arrows} />
            <line className="am-propeller__shaft" x1="590" y1="282" x2="1016" y2="666" />
            {mode === "geometry" ? (
              <>
                <circle className="am-propeller__shaft-locator" cx="649" cy="333" r="37" />
                <line
                  className="am-propeller__vector is-axial"
                  x1="803"
                  y1="474"
                  x2="1016"
                  y2="666"
                  markerEnd={`url(#${arrows}-axial)`}
                />
                <path className="am-propeller__span-guide" d="M 856 392 L 1467 80" />
                {stations.map((station, index) => (
                  <g key={station.label} data-station={index} data-selected={selected === index}>
                    <circle
                      className="am-propeller__station"
                      cx={station.x}
                      cy={station.y}
                      r="35"
                    />
                    <text x={station.x} y={station.y + 18} textAnchor="middle">
                      {index + 1}
                    </text>
                  </g>
                ))}
              </>
            ) : (
              <>
                <g
                  className="am-propeller__load is-axial"
                  data-force="axial"
                  data-emphasized={highlighted(1)}
                >
                  <line
                    className="am-propeller__vector"
                    x1="1128"
                    y1="266"
                    x2="1309.05"
                    y2="429.2"
                    markerEnd={`url(#${arrows}-axial)`}
                  />
                  <line
                    className="am-propeller__vector"
                    x1="368"
                    y1="696"
                    x2="549.05"
                    y2="859.2"
                    markerEnd={`url(#${arrows}-axial)`}
                  />
                </g>
                <g
                  className="am-propeller__load is-radial"
                  data-force="radial"
                  data-emphasized={highlighted(2)}
                >
                  <line
                    className="am-propeller__vector"
                    x1="856"
                    y1="392"
                    x2="1357.02"
                    y2="136.16"
                    markerEnd={`url(#${arrows}-radial)`}
                  />
                  <line
                    className="am-propeller__vector"
                    x1="640"
                    y1="514"
                    x2="174.24"
                    y2="819.86"
                    markerEnd={`url(#${arrows}-radial)`}
                  />
                </g>
                <circle className="am-propeller__section-locator" cx="1128" cy="266" r="52" />
              </>
            )}
          </svg>
        )}
      </div>
      {mode !== "pitch" && (
        <figcaption className="am-propeller__key">
          <span className="is-axial">Tracción axial: hacia delante</span>
          {mode === "geometry" ? (
            <span className="is-radial">Círculo en el eje: entrada de potencia</span>
          ) : (
            <span className="is-radial">Tensión radial: hacia las puntas</span>
          )}
          <span>Vista oblicua del lado delantero · eje hacia atrás arriba a la izquierda</span>
        </figcaption>
      )}
    </figure>
  );
}

/** A qualitative, constructed section, never a slice or angle measured from the raster. */
function BladeSection({
  id,
  station,
  twisting,
  selected = 0,
}: {
  id: string;
  station: number;
  twisting?: boolean;
  selected?: number;
}) {
  const angle = stations[station].slope;
  const center = { x: 240, y: twisting ? 169 : 145 };
  const length = twisting ? 172 : 218;
  const point = (x: number, y = 0) => ({
    x: center.x + x * Math.cos(angle) - y * Math.sin(angle),
    y: center.y + x * Math.sin(angle) + y * Math.cos(angle),
  });
  const leading = point(-length / 2);
  const trailing = point(length / 2);
  const p = (x: number, y = 0) => {
    const v = point(x, y);
    return `${v.x},${v.y}`;
  };
  const profile = `M ${p(-length / 2)} C ${p(-length * 0.52, -25)} ${p(-length * 0.04, -36)} ${p(length / 2)} C ${p(0.1 * length, 9)} ${p(-length * 0.42, 15)} ${p(-length / 2)} Z`;
  const radius = 52;
  const arcEnd = {
    x: leading.x + radius * Math.cos(angle),
    y: leading.y + radius * Math.sin(angle),
  };
  const arrows = `${id}-section`;
  return (
    <svg
      className="am-propeller__schematic"
      viewBox="0 0 480 310"
      role="img"
      aria-labelledby={`${id}-section-title ${id}-section-description`}
      data-section={station}
    >
      <title id={`${id}-section-title`}>
        {twisting
          ? "Momentos opuestos sobre el eje longitudinal de la pala"
          : `Sección esquemática: ${stations[station].label}`}
      </title>
      <desc id={`${id}-section-description`}>
        {twisting
          ? "Vista local con dos flechas curvas de colores alrededor del símbolo del eje longitudinal de la pala."
          : "Perfil esquemático con cuerda, arco angular y referencia del plano de rotación. Tres estaciones: raíz, zona media y punta."}
      </desc>
      <Arrowheads id={arrows} />
      <line
        className="am-propeller__reference"
        data-rotation-plane="true"
        x1="42"
        y1={leading.y}
        x2="438"
        y2={leading.y}
      />
      <text className="am-propeller__plane-label" x="432" y={leading.y - 13} textAnchor="end">
        Plano de rotación
      </text>
      <path className="am-propeller__airfoil" d={profile} />
      <line
        className="am-propeller__chord"
        data-chord="true"
        x1={leading.x}
        y1={leading.y}
        x2={trailing.x}
        y2={trailing.y}
      />
      <circle className="am-propeller__edge" cx={leading.x} cy={leading.y} r="4" />
      <circle className="am-propeller__edge" cx={trailing.x} cy={trailing.y} r="4" />
      {!twisting ? (
        <>
          <path
            className="am-propeller__angle"
            data-angle-arc="true"
            d={`M ${leading.x + radius} ${leading.y} A ${radius} ${radius} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          />
          <line
            className="am-propeller__leader"
            x1={leading.x}
            y1={leading.y + 8}
            x2="88"
            y2="214"
          />
          <text x="40" y="242">
            Ataque
          </text>
          <line
            className="am-propeller__leader"
            x1={trailing.x}
            y1={trailing.y + 8}
            x2="385"
            y2="214"
          />
          <text x="375" y="242">
            Salida
          </text>
          <text x="242" y="245" textAnchor="middle">
            Cuerda
          </text>
          <line
            className="am-propeller__leader"
            x1="242"
            y1="224"
            x2={center.x}
            y2={center.y + 9}
          />
        </>
      ) : (
        <>
          <g
            className="am-propeller__moment is-aero"
            data-moment="aerodynamic"
            data-emphasized={selected === 0 || selected === 3}
          >
            <path
              d="M 155.43 138.22 A 90 90 0 0 1 324.57 138.22"
              data-sweep="1"
              markerEnd={`url(#${arrows}-aero)`}
            />
          </g>
          <g
            className="am-propeller__moment is-centrifugal"
            data-moment="centrifugal"
            data-emphasized={selected === 0 || selected === 4}
          >
            <path
              d="M 348.06 129.67 A 115 115 0 0 0 131.94 129.67"
              data-sweep="0"
              markerEnd={`url(#${arrows}-centrifugal)`}
            />
          </g>
          <circle className="am-propeller__pitch-axis" cx={center.x} cy={center.y} r="9" />
          <path
            className="am-propeller__pitch-axis"
            d={`M ${center.x - 5} ${center.y - 5} l 10 10 M ${center.x + 5} ${center.y - 5} l -10 10`}
          />
          <line
            className="am-propeller__leader"
            x1={center.x}
            y1={center.y + 12}
            x2={center.x}
            y2="239"
          />
          <text x="240" y="266" textAnchor="middle">
            Eje longitudinal de la pala
          </text>
        </>
      )}
      <text className="am-propeller__view-label" x="240" y="297" textAnchor="middle">
        Vista local: raíz → punta · hacia delante ↑
      </text>
    </svg>
  );
}

function PitchSchematic({ id, selected }: { id: string; selected: number }) {
  const arrowId = `${id}-advance`;
  // Shared, normalized drawing reference only. No operational distance or percentage.
  const start = 64;
  const actualEnd = 295;
  const theoreticalEnd = 422;
  return (
    <svg
      className="am-propeller__schematic"
      viewBox="0 0 480 335"
      role="img"
      aria-labelledby={`${id}-pitch-title ${id}-pitch-description`}
    >
      <title id={`${id}-pitch-title`}>
        Paso geométrico, paso efectivo y resbalamiento en la misma vuelta
      </title>
      <desc id={`${id}-pitch-description`}>
        Tres segmentos horizontales dorado, azul y violeta, con guías verticales compartidas.
        Esquema sin escala ni datos de rendimiento.
      </desc>
      <Arrowheads id={arrowId} />
      <path
        className="am-propeller__one-turn"
        d="M 98 52 A 25 25 0 1 0 82 75"
        markerEnd={`url(#${arrowId}-radial)`}
      />
      <text x="132" y="59">
        Una vuelta completa
      </text>
      <text x="132" y="84" className="am-propeller__muted-label">
        Mismo inicio · mismo giro
      </text>
      <line className="am-propeller__reference" x1={start} y1="108" x2={start} y2="295" />
      <line className="am-propeller__reference" x1={actualEnd} y1="168" x2={actualEnd} y2="295" />
      <line
        className="am-propeller__reference"
        x1={theoreticalEnd}
        y1="108"
        x2={theoreticalEnd}
        y2="295"
      />
      <g
        className="am-propeller__distance is-radial"
        data-distance="geometric"
        data-emphasized={selected === 0 || selected === 1}
      >
        <text x={start} y="126">
          Paso geométrico
        </text>
        <line
          x1={start}
          y1="143"
          x2={theoreticalEnd}
          y2="143"
          markerEnd={`url(#${arrowId}-radial)`}
        />
      </g>
      <g
        className="am-propeller__distance is-axial"
        data-distance="effective"
        data-emphasized={selected === 0 || selected === 2}
      >
        <text x={start} y="189">
          Paso efectivo
        </text>
        <line x1={start} y1="206" x2={actualEnd} y2="206" markerEnd={`url(#${arrowId}-axial)`} />
      </g>
      <g
        className="am-propeller__distance is-aero"
        data-distance="slip"
        data-emphasized={selected === 0 || selected === 3}
      >
        <text x={theoreticalEnd} y="256" textAnchor="end">
          Resbalamiento
        </text>
        <line
          x1={actualEnd}
          y1="277"
          x2={theoreticalEnd}
          y2="277"
          markerStart={`url(#${arrowId}-aero)`}
          markerEnd={`url(#${arrowId}-aero)`}
        />
      </g>
      <text className="am-propeller__view-label" x="64" y="320">
        Avance axial → · distancias sin escala
      </text>
    </svg>
  );
}

function DiagramContent({ mode, figure, onZoom, source }: ApprovedPropellerDiagramProps) {
  const id = `am-propeller-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [selected, setSelected] = useState(0);
  const labels =
    mode === "geometry"
      ? stations.map((station, index) => `${index + 1}. ${station.label}`)
      : mode === "pitch"
        ? pitchLabels
        : forceLabels;
  return (
    <section
      className={`am-propeller am-propeller--${mode}`}
      data-propeller-mode={mode}
      aria-label={titles[mode]}
    >
      <Selectors
        labels={labels}
        value={selected}
        onChange={setSelected}
        controls={`${id}-views`}
        label={mode === "geometry" ? "Localizar sección de la pala" : "Resaltar en el esquema"}
      />
      <div id={`${id}-views`} className="am-propeller__views">
        <Master mode={mode} figure={figure} onZoom={onZoom} selected={selected} id={id} />
        <figure className="am-propeller__panel">
          <figcaption>
            {mode === "geometry"
              ? "Sección esquemática independiente"
              : mode === "pitch"
                ? "Comparación de avances"
                : "Torsión: sección local independiente"}
          </figcaption>
          {mode === "pitch" ? (
            <PitchSchematic id={id} selected={selected} />
          ) : (
            <BladeSection
              id={id}
              station={mode === "geometry" ? selected : 1}
              twisting={mode === "forces"}
              selected={selected}
            />
          )}
          {mode === "geometry" && (
            <div className="am-propeller__key">
              <span>Arco: ángulo de pala · raíz → punta: decreciente</span>
              <span>Geometría cualitativa · sin mediciones del dibujo</span>
            </div>
          )}
          {mode === "forces" && (
            <div className="am-propeller__key">
              <span className="is-aero">Aerodinámica → mayor ángulo</span>
              <span className="is-centrifugal">Centrífuga → menor ángulo</span>
              <span>Fuerzas seleccionadas · direcciones, sin magnitudes</span>
            </div>
          )}
          {mode === "pitch" && (
            <div className="am-propeller__relation">Geométrico − efectivo = resbalamiento</div>
          )}
        </figure>
      </div>
      {mode === "forces" && (
        <div className="am-propeller__orientation">
          Referencia de giro: antihorario, visto de frente mirando hacia atrás
        </div>
      )}
      <div className="am-propeller__status" role="status" aria-live="polite" aria-atomic="true">
        {mode === "geometry" ? "Sección localizada" : "Resaltado"}: {labels[selected]}
      </div>
      {source && (
        <a className="am-propeller__source" href={source.url}>
          {source.title}
        </a>
      )}
    </section>
  );
}

/** Local visual controls only: no lesson cards, navigation, quiz state or progress writes. */
export function ApprovedPropellerDiagram(props: ApprovedPropellerDiagramProps) {
  return (
    <DiagramContent key={`${props.mode}:${props.figure.number}:${props.figure.file}`} {...props} />
  );
}
