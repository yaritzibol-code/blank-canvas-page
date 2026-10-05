import { useId, type ReactNode } from "react";
import "./ciaac-aerodynamics-m8.css";

type Props = { module: number; lesson: number; stage: number; nav: string; kind: string };
const gold = "#ebbd70",
  cyan = "#78d8e7",
  ink = "#e8f0f6",
  muted = "#a8bdcf";
function Label({
  x,
  y,
  children,
  color = ink,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor={anchor}
      fontSize="14"
      fontFamily="system-ui, sans-serif"
    >
      {children}
    </text>
  );
}
function Line({
  d,
  color = muted,
  dashed = false,
}: {
  d: string;
  color?: string;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashed ? "5 5" : undefined}
    />
  );
}
function Arrow({
  d,
  color = cyan,
  dashed = false,
}: {
  d: string;
  color?: string;
  dashed?: boolean;
}) {
  const id = `m8-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g>
      <defs>
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10Z" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={dashed ? "6 5" : undefined}
        markerEnd={`url(#${id})`}
      />
    </g>
  );
}
function Panel({
  title,
  caption,
  children,
  height = 240,
}: {
  title: string;
  caption: string;
  children: ReactNode;
  height?: number;
}) {
  const id = `m8-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <figure className="aero8-panel">
      <h4>{title}</h4>
      <div className="aero8-scroll" role="group" tabIndex={0} aria-label={`Diagrama: ${title}`}>
        <svg viewBox={`0 0 360 ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-desc`}>{caption}</desc>
          {children}
        </svg>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="aero8-visual" aria-label={title}>
      <div className="aero8-kicker">LABORATORIO VISUAL · MANIOBRAS</div>
      <h3>{title}</h3>
      <div className="aero8-grid">{children}</div>
    </section>
  );
}
function Point({ x, y, color = ink }: { x: number; y: number; color?: string }) {
  return <circle cx={x} cy={y} r="4" fill={color} />;
}
function Axes({ yLabel = "", xLabel = "V" }: { yLabel?: string; xLabel?: string }) {
  return (
    <>
      <Arrow d="M48 194V35" color={muted} />
      <Arrow d="M48 194H325" color={muted} />
      <Label x={52} y={23} anchor="start">
        {yLabel}
      </Label>
      <Label x={320} y={220}>
        {xLabel}
      </Label>
    </>
  );
}

function ClimbBalance() {
  return (
    <Group title="Ascender sin confundir los ángulos">
      <Panel
        height={260}
        title="Fuerzas en ascenso uniforme"
        caption="T y D siguen la trayectoria; L es normal a ella y W es vertical. Con empuje paralelo: T − D = W sen γ; L = W cos γ. Los trazos grises son referencias, no fuerzas adicionales."
      >
        <Line d="M35 148H330" dashed />
        <Line d="M48 191L306 97" dashed />
        <Arrow d="M168 148L271 110.4" />
        <Label x={287} y={107}>
          T
        </Label>
        <Arrow d="M168 148L96 174.3" />
        <Label x={66} y={189}>
          D
        </Label>
        <Arrow d="M168 148L137 63" />
        <Label x={124} y={52}>
          L
        </Label>
        <Arrow d="M168 148V244.3" color={gold} />
        <Label x={185} y={223} color={gold}>
          W
        </Label>
        <Point x={168} y={148} />
        <Line d="M231 148A63 63 0 0 0 227 127" color={gold} />
        <Label x={246} y={139} color={gold}>
          γ
        </Label>
        <Label x={65} y={124} color={muted}>
          Horizonte
        </Label>
      </Panel>
      <Panel
        title="Trayectoria, cuerda y ataque"
        caption="γ se mide desde el horizonte a la trayectoria. α se mide entre la cuerda y la dirección de movimiento respecto del aire; el viento relativo llega en sentido opuesto. La actitud del fuselaje requiere además la incidencia del ala."
      >
        <Line d="M46 182H327" dashed />
        <Arrow d="M65 182L311 111" />
        <Label x={262} y={139} color={cyan}>
          Trayectoria
        </Label>
        <Line d="M65 182L294 58" color={gold} />
        <Label x={262} y={47} color={gold}>
          Cuerda
        </Label>
        <Line d="M135 182A70 70 0 0 0 132 163" />
        <Label x={152} y={175}>
          γ
        </Label>
        <Line d="M173 151A113 113 0 0 0 164 128" color={gold} />
        <Label x={193} y={133} color={gold}>
          α
        </Label>
        <Arrow d="M289 186L209 209" dashed />
        <Label x={227} y={234} color={cyan}>
          Viento relativo
        </Label>
      </Panel>
    </Group>
  );
}
function ClimbExcess() {
  return (
    <Group title="Dos separaciones, dos objetivos">
      {[false, true].map((power) => {
        const optimum = power ? 180 : 130;
        const available = (x: number) => (power ? 60 : 60 + 0.12 * (x - 60));
        const required = (x: number) =>
          available(x) + (power ? 95 : 85) - (power ? 0.005 : 0.004) * (x - optimum) ** 2;
        const points = Array.from({ length: 52 }, (_, i) => {
          const x = 60 + i * 5;
          return `${x},${required(x)}`;
        }).join(" ");
        return (
          <Panel
            key={String(power)}
            title={power ? "VY · máximo régimen" : "VX · máximo ángulo"}
            caption={
              power
                ? "La mayor separación entre potencia útil disponible y requerida maximiza ROC = ΔP/W. Curvas cualitativas; no indican velocidades de una aeronave."
                : "El mayor exceso T − D maximiza sen γ = (T − D)/W en el modelo estabilizado. La separación se mide verticalmente, a una misma V."
            }
          >
            <Axes yLabel={power ? "Potencia útil" : "Empuje / resistencia"} />
            <Line d={`M60 ${available(60)}L315 ${available(315)}`} color={gold} />
            <polyline points={points} fill="none" stroke={cyan} strokeWidth="2.5" />
            <Line d={`M${optimum} ${available(optimum)}V${required(optimum)}`} color={ink} />
            <Point x={optimum} y={required(optimum)} />
            <Line d={`M${optimum} ${required(optimum)}V194`} dashed />
            <Label x={optimum} y={218}>
              {power ? "VY" : "VX"}
            </Label>
            <Label x={260} y={power ? 48 : 68} color={gold}>
              Disponible
            </Label>
            <Label x={252} y={173} color={cyan}>
              Requerida
            </Label>
          </Panel>
        );
      })}
    </Group>
  );
}
function ClimbWind() {
  return (
    <Group title="Misma altura por minuto, otra distancia">
      <Panel
        title="Viento horizontal de frente"
        caption="Para el mismo movimiento respecto del aire y el mismo intervalo Δt, ambas trayectorias ganan h. El viento horizontal de frente reduce la distancia terrestre; no aumenta por sí solo el régimen de ascenso respecto del aire."
      >
        <Line d="M40 195H325M40 70H325" dashed />
        <Line d="M52 195L305 70" color={cyan} />
        <Line d="M52 195L204 70" color={gold} />
        <Point x={204} y={70} color={gold} />
        <Point x={305} y={70} color={cyan} />
        <Label x={291} y={49} color={cyan}>
          Sin viento
        </Label>
        <Label x={158} y={49} color={gold}>
          De frente
        </Label>
        <Arrow d="M40 190V76" color={ink} />
        <Label x={25} y={137}>
          h
        </Label>
        <Arrow d="M313 109H254" color={gold} />
        <Label x={280} y={134} color={gold}>
          Viento
        </Label>
        <Label x={181} y={222}>
          Igual Δt · menor distancia terrestre
        </Label>
      </Panel>
    </Group>
  );
}
function LevelState() {
  return (
    <Group title="Tres condiciones que se comprueban por separado">
      <Panel
        title="Huella temporal del movimiento"
        height={290}
        caption="Las filas comparan altitud h, rapidez V y dirección ψ durante el mismo intervalo. Solo la primera mantiene las tres constantes. Un viraje puede ser nivelado y de rapidez constante, pero cambia la dirección."
      >
        <Label x={159} y={28}>
          h
        </Label>
        <Label x={233} y={28}>
          V
        </Label>
        <Label x={309} y={28}>
          ψ
        </Label>
        {["Uniforme", "Acelerado", "Viraje", "Ascenso"].map((label, i) => (
          <g key={label}>
            <Label x={10} y={69 + i * 55} anchor="start">
              {label}
            </Label>
            {[0, 1, 2].map((j) => (
              <g key={j}>
                <Line d={`M${130 + j * 74} ${82 + i * 55}h55m-55 0v-38`} />
                <Line
                  d={`M${135 + j * 74} ${65 + i * 55}l43 ${(i === 1 && j === 1) || (i === 2 && j === 2) || (i === 3 && j === 0) ? -22 : 0}`}
                  color={i === 0 ? cyan : gold}
                />
              </g>
            ))}
          </g>
        ))}
        <Label x={230} y={282} color={muted}>
          Tiempo → en cada recuadro
        </Label>
      </Panel>
      <Panel
        title="Equilibrio de fuerzas y momentos"
        caption="En el modelo simple L = W y T = D. Por separado, la suma de momentos debe ser cero. Los arcos inferiores representan momentos opuestos en un eje; no son fuerzas añadidas."
      >
        <Point x={180} y={93} />
        <Arrow d="M180 93V28" />
        <Label x={196} y={34}>
          L
        </Label>
        <Arrow d="M180 93V158" color={gold} />
        <Label x={197} y={154} color={gold}>
          W
        </Label>
        <Arrow d="M180 93H285" />
        <Label x={301} y={99}>
          T
        </Label>
        <Arrow d="M180 93H75" color={gold} />
        <Label x={58} y={99} color={gold}>
          D
        </Label>
        <Arrow d="M103 215A43 30 0 0 1 177 193" />
        <Arrow d="M257 215A43 30 0 0 0 183 193" color={gold} />
        <Label x={180} y={237}>
          ΣM = 0 · alrededor del CG
        </Label>
      </Panel>
    </Group>
  );
}
function LevelCL() {
  const points = Array.from({ length: 32 }, (_, i) => {
    const v = 42 + i;
    return `${48 + 3.6 * v},${194 - 75 * (60 / v) ** 2}`;
  }).join(" ");
  return (
    <Group title="Mantener L exige cambiar CL">
      <Panel
        title="CL requerido ∝ 1/V²"
        caption="A W, ρ y S constantes, pasar de 60 a 48 m/s exige 1.5625 veces el CL inicial: +56.25 %. La línea CL máximo limita la factibilidad; extrapolar la curva no demuestra que el ala pueda sostener el vuelo nivelado."
      >
        <Axes yLabel="CL / CL a 60 m/s" xLabel="m/s" />
        <Line d="M49 58H315" dashed />
        <Label x={126} y={48} color={gold}>
          CL máximo (esquema)
        </Label>
        <polyline points={points} fill="none" stroke={cyan} strokeWidth="2.5" />
        <Point x={220.8} y={76.8125} />
        <Point x={264} y={119} />
        <Line d="M220.8 76.8125V194M264 119V194" dashed />
        <Label x={220.8} y={217}>
          48
        </Label>
        <Label x={264} y={217}>
          60
        </Label>
        <Label x={176} y={97} color={cyan}>
          1.5625
        </Label>
        <Label x={174} y={138} color={cyan}>
          1.0000
        </Label>
      </Panel>
    </Group>
  );
}
function ManeuverEnvelope() {
  return (
    <Group title="La esquina de una envolvente ideal">
      <Panel
        title="V-n positivo y peso"
        caption="Las parábolas representan n máximo aerodinámico ∝ V²/W. Al reducir W, la curva alcanza antes la misma carga límite: VA disminuye. Esquema cuasiestático; se omiten la envolvente negativa y otros límites de velocidad."
      >
        <Axes yLabel="n = L/W" />
        <Line d="M49 70H318" color={gold} />
        <Label x={281} y={58} color={gold}>
          n límite
        </Label>
        <Line d="M50 194Q135 194 220 70" color={cyan} />
        <Line d="M50 194Q115 194 180 70" color={ink} />
        <Point x={220} y={70} color={cyan} />
        <Point x={180} y={70} />
        <Line d="M180 70V194M220 70V194" dashed />
        <Label x={175} y={217}>
          VA₂
        </Label>
        <Label x={225} y={217} color={cyan}>
          VA₁
        </Label>
        <Label x={281} y={118} color={cyan}>
          W₁
        </Label>
        <Label x={108} y={106}>
          W₂ &lt; W₁
        </Label>
        <Label x={255} y={171} color={muted}>
          Modelo ideal
        </Label>
      </Panel>
    </Group>
  );
}
function ManeuverLimits() {
  return (
    <Group title="Carga, pérdida y límites de interpretación">
      <Panel
        title="Mismo ángulo crítico"
        caption="Para la misma configuración y condiciones: VS,n = VS,1 √n. La pérdida sigue ocurriendo al alcanzar α crítico; aumentar n eleva la velocidad a la que se alcanza, no el ángulo crítico."
      >
        <Label x={80} y={35}>
          Carga n
        </Label>
        <Label x={255} y={35}>
          VS relativa
        </Label>
        <rect x="58" y="63" width="72" height="39" rx="6" fill={cyan} opacity=".22" />
        <Label x={94} y={89}>
          1 g
        </Label>
        <rect x="194" y="63" width="84" height="39" fill={cyan} opacity=".3" />
        <Label x={236} y={89}>
          1.000
        </Label>
        <rect x="58" y="124" width="72" height="39" rx="6" fill={gold} opacity=".22" />
        <Label x={94} y={150}>
          2 g
        </Label>
        <rect x="194" y="124" width="119" height="39" fill={gold} opacity=".3" />
        <Label x={254} y={150}>
          1.414
        </Label>
        <Line d="M45 190H315" />
        <Label x={180} y={219} color={gold}>
          α crítico no aumenta
        </Label>
      </Panel>
      <Panel
        title="VA no es una autorización general"
        caption="Por debajo de VA no se garantiza protección ante entradas completas repetidas, inversiones rápidas o combinaciones de ejes. Consulta el AFM/POH y los límites aplicables; el dibujo identifica ejes, no prescribe mandos."
      >
        <Point x={180} y={110} />
        <Arrow d="M180 110L282 75" />
        <Arrow d="M180 110L98 58" color={gold} />
        <Arrow d="M180 110V185" color={ink} />
        <Label x={271} y={55}>
          Alabeo
        </Label>
        <Label x={95} y={36} color={gold}>
          Cabeceo
        </Label>
        <Label x={222} y={181}>
          Guiñada
        </Label>
        <Label x={180} y={218} color={gold}>
          Entradas combinadas ≠ garantía
        </Label>
      </Panel>
    </Group>
  );
}
function TurnFrames() {
  return (
    <Group title="Un viraje, dos marcos separados">
      {[false, true].map((rotating) => (
        <Panel
          key={String(rotating)}
          title={rotating ? "Marco que gira con el avión" : "Marco inercial"}
          caption={
            rotating
              ? "Se añaden al modelo giratorio la fuerza inercial centrífuga, punteada y hacia fuera, y las fuerzas reales L y W. No es una interacción física adicional ni se añade a la ecuación del marco inercial."
              : "L y W son fuerzas reales. Su resultante horizontal apunta al centro: L sen φ = mV²/R. No se añade otra fuerza centrípeta. La componente vertical L cos φ compensa W."
          }
        >
          <Line d="M180 36V138" dashed />
          <Line d="M115 91L245 166" />
          <Point x={180} y={129} />
          <Arrow d="M180 129L235 34" />
          <Label x={253} y={35}>
            L
          </Label>
          <Arrow d="M180 129V224" color={gold} />
          <Label x={199} y={224} color={gold}>
            W
          </Label>
          <Line d="M180 79A50 50 0 0 1 205 86" color={gold} />
          <Label x={196} y={65} color={gold}>
            φ
          </Label>
          {rotating ? (
            <>
              <Arrow d="M180 129H125" dashed color={gold} />
              <Label x={81} y={104} color={gold}>
                Centrífuga*
              </Label>
              <Label x={88} y={188} color={gold}>
                *inercial
              </Label>
            </>
          ) : (
            <>
              <Label x={75} y={86} color={muted}>
                ΣF hacia
              </Label>
              <Label x={75} y={105} color={muted}>
                el centro →
              </Label>
            </>
          )}
          <Label x={285} y={155} color={muted}>
            Centro →
          </Label>
        </Panel>
      ))}
    </Group>
  );
}
function TurnLoad() {
  const pts = [0, 10, 20, 30, 40, 45, 50, 55, 60, 65, 70]
    .map((a) => `${50 + a * 3.6},${194 - (1 / Math.cos((a * Math.PI) / 180) - 1) * 72}`)
    .join(" ");
  return (
    <Group title="La carga aumenta de forma no lineal">
      <Panel
        title="n = sec φ"
        caption="Solo para viraje coordinado y nivelado: 30° → 1.155; 45° → 1.414; 60° → 2. La curva se detiene en 70°; a 90° el modelo requeriría sustentación infinita."
      >
        <Axes yLabel="n" xLabel="φ" />
        <polyline points={pts} fill="none" stroke={cyan} strokeWidth="3" />
        {[
          [30, 1.155],
          [45, 1.414],
          [60, 2],
        ].map(([a, n]) => (
          <g key={a}>
            <Point x={50 + a * 3.6} y={194 - (n - 1) * 72} color={gold} />
            <Line d={`M${50 + a * 3.6} ${194 - (n - 1) * 72}V194`} dashed />
            <Label x={50 + a * 3.6} y={218}>
              {a}°
            </Label>
            <Label x={50 + a * 3.6 - 8} y={194 - (n - 1) * 72 - 12} color={gold}>
              {n}
            </Label>
          </g>
        ))}
        <Label x={30} y={199}>
          1
        </Label>
      </Panel>
    </Group>
  );
}
function TurnRadius() {
  return (
    <Group title="Duplicar V cuadruplica R">
      <Panel
        title="Igual banqueo · respecto del aire"
        caption="R = V²/(g tan φ). A igual banqueo, pasar de V a 2V lleva de R a 4R y reduce a la mitad el régimen angular. Círculos a la misma escala; las flechas tangentes muestran V y las radiales a, no fuerzas nuevas."
      >
        <circle cx="72" cy="130" r="23" fill="none" stroke={cyan} strokeWidth="2" />
        <circle cx="239" cy="130" r="92" fill="none" stroke={gold} strokeWidth="2" />
        <Point x={72} y={130} />
        <Point x={239} y={130} />
        <Line d="M72 130H95" color={cyan} />
        <Line d="M239 130H331" color={gold} />
        <Label x={72} y={171} color={cyan}>
          R
        </Label>
        <Label x={282} y={153} color={gold}>
          4R
        </Label>
        <Point x={72} y={107} color={cyan} />
        <Arrow d="M72 107H111" />
        <Arrow d="M72 107V129" dashed />
        <Label x={105} y={89} color={cyan}>
          V
        </Label>
        <Point x={239} y={38} color={gold} />
        <Arrow d="M239 38H317" color={gold} />
        <Arrow d="M239 38V60" dashed color={gold} />
        <Label x={281} y={23} color={gold}>
          2V
        </Label>
        <Label x={220} y={65}>
          a
        </Label>
        <Label x={55} y={128}>
          a
        </Label>
      </Panel>
    </Group>
  );
}
function TurnStates() {
  return (
    <Group title="La forma de la trayectoria no basta">
      <Panel
        title="Espiral y barrena"
        caption="La espiral no exige que el ala esté en pérdida; la barrena sí combina pérdida y autorrotación. Esta comparación es conceptual y no contiene instrucciones de recuperación."
      >
        <rect x="24" y="45" width="144" height="145" rx="12" fill={cyan} opacity=".12" />
        <rect x="192" y="45" width="144" height="145" rx="12" fill={gold} opacity=".12" />
        <Label x={96} y={76} color={cyan}>
          ESPIRAL
        </Label>
        <Label x={264} y={76} color={gold}>
          BARRENA
        </Label>
        <Line d="M47 100H145M215 100H313" />
        <Label x={96} y={129}>
          Pérdida
        </Label>
        <Label x={96} y={151}>
          no necesaria
        </Label>
        <Label x={264} y={125}>
          Pérdida
        </Label>
        <Label x={264} y={149}>
          +
        </Label>
        <Label x={264} y={173}>
          autorrotación
        </Label>
        <Label x={180} y={222}>
          Distinguir el estado aerodinámico
        </Label>
      </Panel>
    </Group>
  );
}
function GlideBalance() {
  return (
    <Group title="Geometría y fuerzas del planeo">
      <Panel
        title="Triángulo sobre el punto de llegada"
        caption="En aire en calma y con T = 0: tan γ = D/L; d = h·(L/D). h es altura sobre el punto de llegada. El esquema exagera γ para leerlo; no es un ángulo operacional."
      >
        <Line d="M45 65V194H315Z" color={cyan} />
        <Line d="M45 65H140" dashed />
        <Line d="M104 65A59 59 0 0 1 98 90" color={gold} />
        <Label x={123} y={84} color={gold}>
          γ
        </Label>
        <Label x={27} y={137}>
          h
        </Label>
        <Label x={177} y={221}>
          d
        </Label>
        <Label x={241} y={106} color={cyan}>
          Trayectoria
        </Label>
        <Label x={180} y={27}>
          T = 0 · aire en calma
        </Label>
      </Panel>
      <Panel
        title="L y D giran con la trayectoria"
        caption="Planeo rectilíneo uniforme. L es perpendicular a la trayectoria descendente; D se opone al movimiento y W sigue vertical. Las tres fuerzas se equilibran; no hay fuerza neta permanente hacia abajo."
      >
        <Line d="M43 78L319 208" dashed />
        <Arrow d="M183 143L219 66" />
        <Label x={237} y={64}>
          L
        </Label>
        <Arrow d="M183 143L147 126" />
        <Label x={124} y={118}>
          D
        </Label>
        <Arrow d="M183 143V237" color={gold} />
        <Label x={203} y={228} color={gold}>
          W
        </Label>
        <Point x={183} y={143} />
        <Label x={180} y={27}>
          L = W cos γ · D = W sen γ
        </Label>
      </Panel>
    </Group>
  );
}
function GlideRange() {
  return (
    <Group title="Distancia y tiempo son objetivos distintos">
      <Panel
        title="Misma altura, dos finezas"
        caption="A escala geométrica: desde h, L/D = 8 permite 8h y L/D = 12 permite 12h en el modelo ideal en calma. No incluye obstáculos, reserva de altura, virajes ni incertidumbres."
      >
        <Line d="M45 100V122H315" dashed />
        <Line d="M45 100L221 122" color={cyan} />
        <Line d="M45 100L309 122" color={gold} />
        <Line d="M45 160H221M45 185H309" />
        <Label x={133} y={154} color={cyan}>
          8h
        </Label>
        <Label x={177} y={210} color={gold}>
          12h
        </Label>
        <Label x={25} y={113}>
          h
        </Label>
        <Label x={112} y={63} color={cyan}>
          L/D = 8
        </Label>
        <Label x={256} y={63} color={gold}>
          L/D = 12
        </Label>
      </Panel>
      <Panel
        title="Polar cualitativa de descenso"
        caption="La tasa de descenso positiva crece hacia abajo. El mínimo de la curva busca tiempo; la tangente desde el origen busca menor descenso por distancia. En general sus velocidades no coinciden."
      >
        <Arrow d="M45 42H323" color={muted} />
        <Arrow d="M45 42V215" color={muted} />
        <Label x={320} y={26}>
          V
        </Label>
        <Label x={61} y={234} anchor="start">
          Tasa de descenso ↓
        </Label>
        <polyline
          points={Array.from({ length: 40 }, (_, i) => {
            const u = 25 + i * 5;
            return `${45 + u},${92 + 0.008 * (u - 90) ** 2}`;
          }).join(" ")}
          fill="none"
          stroke={cyan}
          strokeWidth="2.5"
        />
        <Line d="M45 42L307 166.89" color={gold} />
        <Point x={135} y={92} color={cyan} />
        <Point x={164.79} y={99.1} color={gold} />
        <Label x={128} y={72} color={cyan}>
          Mínima tasa
        </Label>
        <Label x={257} y={109} color={gold}>
          Mejor alcance
        </Label>
      </Panel>
    </Group>
  );
}
function DescentDimensions() {
  return (
    <Group title="Comprobar las unidades">
      <Panel
        title="Ejemplo didáctico: 300 ft por NM"
        caption="Una pendiente de 300 ft/NM multiplicada por 1.5 NM/min da 450 ft/min. Es una conversión de distancia a tiempo; no una pendiente prescrita ni una instrucción de aproximación."
      >
        <Axes yLabel="Altura consumida (ft)" xLabel="NM" />
        <Line d="M49 194L288 54" color={cyan} />
        <Line d="M288 54V194M49 54H288" dashed />
        <Label x={29} y={58}>
          900
        </Label>
        <Label x={288} y={217}>
          3
        </Label>
        <Label x={205} y={140} color={gold}>
          300 ft/NM
        </Label>
        <Label x={190} y={168} color={gold}>
          × 1.5 NM/min
        </Label>
      </Panel>
    </Group>
  );
}
function LandingEnergy() {
  return (
    <Group title="Distancia total y energía al contacto">
      <Panel
        title="Tres partes, sin porcentajes fijos"
        caption="Aproximación, transición y carrera terrestre son partes distintas. La distancia total parte de una altura de referencia h definida; no equivale a la carrera sobre la pista. El perfil es esquemático."
      >
        <Line d="M24 173H338" color={muted} />
        <Line d="M35 63L140 143Q175 173 211 173H328" color={cyan} />
        <Line d="M35 63V173M140 143V190M211 173V190" dashed />
        <Label x={22} y={122}>
          h
        </Label>
        <Label x={90} y={42}>
          Aproximación
        </Label>
        <Label x={183} y={112}>
          Transición
        </Label>
        <Label x={277} y={149}>
          Carrera
        </Label>
        <Line d="M35 213H328M35 205V221M328 205V221" color={gold} />
        <Label x={180} y={239} color={gold}>
          Distancia total
        </Label>
      </Panel>
      <Panel
        title="10 % más Vg → 21 % más Ek"
        caption="Con igual masa, Ek = ½mVg². Las barras comparan magnitudes normalizadas. La energía crece 21 %, pero la distancia real no tiene una corrección universal de 21 %: la desaceleración puede cambiar."
      >
        <Label x={185} y={27}>
          Valores relativos
        </Label>
        {[
          ["Vg", 1, 1.1],
          ["Ek", 1, 1.21],
        ].map(([name, a, b], i) => (
          <g key={String(name)}>
            <Label x={30} y={86 + i * 94}>
              {name}
            </Label>
            <rect
              x="62"
              y={51 + i * 94}
              width={180 * Number(a)}
              height="25"
              fill={cyan}
              opacity=".7"
            />
            <rect
              x="62"
              y={87 + i * 94}
              width={180 * Number(b)}
              height="25"
              fill={gold}
              opacity=".7"
            />
            <Label x={260} y={70 + i * 94}>
              1.00
            </Label>
            <Label x={305} y={106 + i * 94}>
              {Number(b).toFixed(2)}
            </Label>
          </g>
        ))}
      </Panel>
    </Group>
  );
}
function LandingGround() {
  return (
    <Group title="El suelo cambia el flujo y el apoyo">
      <Panel
        title="Flujo inducido cerca del suelo"
        caption="La proximidad del suelo modifica el flujo inducido y puede reducir la resistencia inducida en condiciones comparables. Los trazos son cualitativos; no hay un cojín sólido ni flujo que atraviese la pista."
      >
        <Label x={90} y={30}>
          Lejos
        </Label>
        <Label x={267} y={30}>
          Cerca
        </Label>
        <Line d="M20 202H163M193 202H338" color={gold} />
        <Line d="M38 75H146M211 166H319" color={ink} />
        <Arrow d="M47 86C16 98 38 135 58 112C72 95 46 97 49 111" />
        <Arrow d="M137 86C168 98 146 135 126 112C112 95 138 97 135 111" />
        <Arrow d="M221 173C202 178 206 192 224 188" />
        <Arrow d="M309 173C328 178 324 192 306 188" />
        <Arrow d="M87 89V147" />
        <Arrow d="M267 176V192" />
        <Label x={180} y={233} color={gold}>
          Menor resistencia inducida posible
        </Label>
      </Panel>
    </Group>
  );
}
function LandingWheels() {
  return (
    <Group title="Sustentación residual y ruedas">
      <Panel
        title="Cuerpo libre después del contacto"
        caption="Sin aceleración vertical: N + L = W. La sustentación residual reduce N, la carga normal sobre las ruedas. La resistencia aerodinámica y el frenado apuntan horizontalmente contra el movimiento; el frenado no se suma al apoyo vertical."
      >
        <Line d="M27 200H333" color={gold} />
        <rect x="147" y="125" width="72" height="43" rx="7" fill={muted} opacity=".25" />
        <circle cx="160" cy="190" r="10" fill="none" stroke={ink} strokeWidth="2" />
        <circle cx="207" cy="190" r="10" fill="none" stroke={ink} strokeWidth="2" />
        <Arrow d="M183 145V113" />
        <Label x={171} y={96}>
          L residual
        </Label>
        <Arrow d="M183 145V226" color={gold} />
        <Label x={208} y={233} color={gold}>
          W
        </Label>
        <Arrow d="M240 200V151" color={ink} />
        <Label x={260} y={153}>
          N
        </Label>
        <Arrow d="M147 145H67" />
        <Label x={82} y={126}>
          D
        </Label>
        <Arrow d="M150 198H65" color={gold} />
        <Label x={75} y={224} color={gold}>
          Frenado
        </Label>
        <Arrow d="M237 53H313" color={muted} />
        <Label x={278} y={37}>
          Vg →
        </Label>
      </Panel>
    </Group>
  );
}
function RotorLocal() {
  return (
    <Group title="Cada sección encuentra su propio viento">
      <Panel
        title="Velocidad tangencial: Ωr"
        caption="Para una misma velocidad angular Ω, la sección a 2r tiene el doble de velocidad tangencial que la sección a r. Vista superior, giro antihorario: en el radio derecho, el movimiento de la pala apunta hacia arriba."
      >
        <circle cx="159" cy="141" r="81" fill="none" stroke={muted} strokeDasharray="5 5" />
        <Line d="M78 141H240M159 60V222" />
        <Point x={159} y={141} />
        <Point x={199} y={141} color={cyan} />
        <Point x={239} y={141} color={gold} />
        <Arrow d="M199 141V104" />
        <Arrow d="M239 141V67" color={gold} />
        <Label x={191} y={163} color={cyan}>
          r
        </Label>
        <Label x={248} y={163} color={gold}>
          2r
        </Label>
        <Label x={180} y={92} color={cyan}>
          Ωr
        </Label>
        <Label x={270} y={58} color={gold}>
          2Ωr
        </Label>
        <Arrow d="M91 103A81 81 0 0 0 80 160" color={ink} />
        <Label x={46} y={117}>
          Ω ↺
        </Label>
      </Panel>
      <Panel
        title="Paso geométrico ≠ ángulo de ataque"
        caption="La cuerda forma el paso θ con el plano de referencia. α se mide entre la cuerda y la línea del viento relativo resultante local. El flujo inducido cambia esa línea y, por tanto, α para un mismo paso."
      >
        <Line d="M39 173H322" dashed />
        <Line d="M50 173L292 66" color={gold} />
        <Arrow d="M308 128L50 173" />
        <Line d="M122 173A72 72 0 0 0 116 144" color={gold} />
        <Label x={138} y={165} color={gold}>
          θ
        </Label>
        <Line d="M205 146A158 158 0 0 0 196 109" color={ink} />
        <Label x={223} y={128}>
          α
        </Label>
        <Label x={265} y={48} color={gold}>
          Cuerda
        </Label>
        <Label x={265} y={152} color={cyan}>
          Viento local
        </Label>
        <Label x={187} y={205} color={muted}>
          Plano de referencia
        </Label>
      </Panel>
    </Group>
  );
}
function RotorControls() {
  return (
    <Group title="Cambiar el paso de dos maneras">
      {[false, true].map((cyclic) => (
        <Panel
          key={String(cyclic)}
          title={cyclic ? "Cíclico · variación con azimut" : "Colectivo · cambio conjunto"}
          caption={
            cyclic
              ? "El paso varía periódicamente durante cada vuelta. Esta gráfica conceptual no prescribe una fase universal de respuesta del disco ni una secuencia de mando."
              : "El colectivo desplaza el nivel de paso de todas las palas. Aquí se muestra un incremento uniforme en el modelo ideal; no una curva de prestaciones."
          }
        >
          <Axes yLabel="Paso θ" xLabel="" />
          <Label x={180} y={239}>
            Azimut
          </Label>
          <Line d="M52 139H306" dashed />
          {cyclic ? (
            <polyline
              points={Array.from(
                { length: 73 },
                (_, i) => `${52 + (i * 254) / 72},${139 - 45 * Math.sin((i * 2 * Math.PI) / 72)}`,
              ).join(" ")}
              fill="none"
              stroke={gold}
              strokeWidth="2.5"
            />
          ) : (
            <Line d="M52 96H306" color={gold} />
          )}
          {!cyclic && (
            <>
              <Arrow d="M180 135V100" color={gold} />
              <Label x={215} y={120} color={gold}>
                Δθ
              </Label>
            </>
          )}
          <Label x={52} y={216}>
            0°
          </Label>
          <Label x={180} y={216}>
            180°
          </Label>
          <Label x={290} y={216}>
            360°
          </Label>
        </Panel>
      ))}
    </Group>
  );
}
function RotorAdvance() {
  return (
    <Group title="La rotación decide qué mitad avanza">
      <Panel
        title="Una sección · comparación ideal"
        height={275}
        caption="Vista superior: vuelo hacia arriba y rotor antihorario. La mitad derecha avanza: 150 + 30 = 180 m/s; la izquierda retrocede: 150 − 30 = 120 m/s. Se comparan velocidades locales ideales; no son límites ni sustentaciones reales."
      >
        <circle cx="180" cy="155" r="78" fill="none" stroke={muted} strokeWidth="2" />
        <Line d="M102 155H258" />
        <Point x={180} y={155} />
        <Arrow d="M180 133V44" color={ink} />
        <Label x={180} y={24}>
          Vuelo ↑ 30 m/s
        </Label>
        <Arrow d="M258 155V91" color={gold} />
        <Arrow d="M102 155V199" />
        <Label x={292} y={139} color={gold}>
          Avanza
        </Label>
        <Label x={295} y={160} color={gold}>
          180
        </Label>
        <Label x={56} y={123} color={cyan}>
          Retrocede
        </Label>
        <Label x={57} y={145} color={cyan}>
          120
        </Label>
        <Arrow d="M148 84A78 78 0 0 0 105 132" color={ink} />
        <Label x={120} y={65}>
          ↺
        </Label>
        <Label x={180} y={254}>
          Ωr = 150 m/s en esta sección
        </Label>
      </Panel>
    </Group>
  );
}
function RotorAutorotation() {
  return (
    <Group title="Flujo global y par local">
      {[false, true].map((auto) => (
        <Panel
          key={String(auto)}
          title={auto ? "Descenso autorrotativo" : "Estacionario motorizado"}
          caption={
            auto
              ? "El flujo global atraviesa el disco hacia arriba, relativo al rotor que desciende. La flecha del movimiento del helicóptero está separada de las flechas del aire. Es un esquema, no una secuencia de emergencia."
              : "En estacionario motorizado, el flujo global atraviesa el disco hacia abajo. Las flechas representan movimiento del aire relativo al rotor, no vectores de sustentación."
          }
        >
          <ellipse
            cx="168"
            cy="131"
            rx="116"
            ry="16"
            fill={muted}
            fillOpacity=".12"
            stroke={ink}
            strokeWidth="2"
          />
          {[94, 164, 234].map((x) => (
            <Arrow key={x} d={auto ? `M${x} 204V54` : `M${x} 54V204`} />
          ))}
          <Label x={168} y={31} color={cyan}>
            Aire {auto ? "↑" : "↓"}
          </Label>
          {auto ? (
            <>
              <Arrow d="M316 97V168" color={gold} />
              <Label x={286} y={221} color={gold}>
                Descenso ↓
              </Label>
            </>
          ) : (
            <Label x={180} y={231}>
              Helicóptero: altura constante
            </Label>
          )}
        </Panel>
      ))}
      <Panel
        title="No toda la pala impulsa el giro"
        caption="En autorrotación pueden coexistir regiones en pérdida, impulsora y resistente. La impulsora aporta par al rotor; otras lo consumen. Sus límites varían con las condiciones: las anchuras del esquema no representan porcentajes."
      >
        <Line d="M37 167H323" />
        <rect x="40" y="96" width="74" height="36" fill={muted} opacity=".4" />
        <rect x="114" y="96" width="112" height="36" fill={cyan} opacity=".5" />
        <rect x="226" y="96" width="92" height="36" fill={gold} opacity=".5" />
        <Label x={76} y={81}>
          Pérdida
        </Label>
        <Label x={170} y={57} color={cyan}>
          Impulsora
        </Label>
        <Label x={277} y={81} color={gold}>
          Resistente
        </Label>
        <Arrow d="M170 136V166" />
        <Arrow d="M277 166V137" color={gold} />
        <Label x={38} y={192} anchor="start">
          Raíz
        </Label>
        <Label x={322} y={192} anchor="end">
          Punta
        </Label>
        <Label x={180} y={226}>
          Distribución radial cualitativa
        </Label>
      </Panel>
    </Group>
  );
}

function Diagnostic({ lesson }: { lesson: number }) {
  const names = [
    "Ascenso",
    "Recto y nivelado",
    "Velocidad de maniobra",
    "Viraje",
    "Descenso",
    "Aterrizaje",
    "Ala rotativa",
  ];
  return (
    <Group title={`Antes de despegar · ${names[lesson - 1]}`}>
      <Panel
        title="Observa el escenario"
        caption="Esquema de contexto para la pregunta. Decide con tus conocimientos previos; la explicación y los vectores de fuerzas aparecen después."
      >
        {(lesson === 1 || lesson === 5) && (
          <>
            <Line d="M30 174H331" dashed />
            <Line d={lesson === 1 ? "M80 157L242 101" : "M70 88L290 169"} color={cyan} />
            <Point x={lesson === 1 ? 160 : 180} y={lesson === 1 ? 129 : 129} />
            <Label x={180} y={217}>
              Horizonte de referencia
            </Label>
            <Label x={180} y={45}>
              {lesson === 1 ? "Actitud observada" : "Trayectoria observada"}
            </Label>
          </>
        )}
        {lesson === 2 && (
          <>
            <Line d="M35 155H327" dashed />
            {[65, 180, 295].map((x, i) => (
              <g key={x}>
                <Point x={x} y={126} />
                <Label x={x} y={94}>
                  t{i + 1}
                </Label>
              </g>
            ))}
            <Label x={180} y={206}>
              Comparar observaciones en el tiempo
            </Label>
          </>
        )}
        {lesson === 3 && (
          <>
            <Axes yLabel="Carga" xLabel="Velocidad" />
            <rect x="98" y="69" width="151" height="93" fill={muted} opacity=".12" />
            <Label x={173} y={120} color={gold}>
              ¿Qué limita el modelo?
            </Label>
          </>
        )}
        {lesson === 4 && (
          <>
            <circle cx="180" cy="130" r="78" fill="none" stroke={cyan} strokeWidth="2" />
            <Point x={180} y={52} />
            <Point x={258} y={130} />
            <Point x={180} y={208} />
            <Label x={180} y={129}>
              Trayectoria
            </Label>
            <Label x={180} y={150}>
              curva
            </Label>
          </>
        )}
        {lesson === 6 && (
          <>
            <path d="M58 76H302L327 209H33Z" fill={muted} fillOpacity=".13" stroke={muted} />
            <Line d="M180 88V201" dashed />
            {[73, 91, 109, 251, 269, 287].map((x) => (
              <Line key={x} d={`M${x} 166V188`} color={ink} />
            ))}
            <Label x={180} y={43}>
              Pista de referencia
            </Label>
          </>
        )}
        {lesson === 7 && (
          <>
            <ellipse cx="180" cy="110" rx="116" ry="24" fill="none" stroke={cyan} />
            <Line d="M64 110H296M180 86V134M180 134V164" />
            <rect
              x="148"
              y="164"
              width="64"
              height="27"
              rx="12"
              fill={muted}
              fillOpacity=".2"
              stroke={ink}
            />
            <Line d="M128 209H231M158 190L148 209M206 190L216 209" />
            <Label x={180} y={46}>
              Helicóptero en estacionario
            </Label>
          </>
        )}
      </Panel>
    </Group>
  );
}

/** Original diagrams keyed to the approved M8 content stages; no exercise answers are overlaid. */
export function CiaacAerodynamicsModuleEightVisual({ module, lesson, nav, kind }: Props) {
  if (module !== 8 || lesson < 1 || lesson > 7) return null;
  if (kind === "quiz" && nav === "Antes de despegar") return <Diagnostic lesson={lesson} />;
  if (kind !== "content") return null;
  if (lesson === 1) {
    if (nav === "Modelo de ascenso") return <ClimbBalance />;
    if (nav === "Exceso disponible") return <ClimbExcess />;
    if (nav === "Prestaciones y decisión") return <ClimbWind />;
  }
  if (lesson === 2) {
    if (nav === "Reconocer la condición") return <LevelState />;
    if (nav === "Una condición, varias velocidades") return <LevelCL />;
  }
  if (lesson === 3) {
    if (nav === "Leer la envolvente") return <ManeuverEnvelope />;
    if (nav === "Peso y límites") return <ManeuverLimits />;
  }
  if (lesson === 4) {
    if (nav === "Dos maneras de observar") return <TurnFrames />;
    if (nav === "Carga y pérdida") return <TurnLoad />;
    if (nav === "Radio y régimen") return <TurnRadius />;
    if (nav === "Coordinación y límites") return <TurnStates />;
  }
  if (lesson === 5) {
    if (nav === "El balance durante el descenso") return <GlideBalance />;
    if (nav === "Alcance y duración") return <GlideRange />;
    if (nav === "Aplicación razonada") return <DescentDimensions />;
  }
  if (lesson === 6) {
    if (nav === "Fases y energía") return <LandingEnergy />;
    if (nav === "Aerodinámica cerca del suelo") return <LandingGround />;
    if (nav === "Pista y prestaciones") return <LandingWheels />;
  }
  if (lesson === 7) {
    if (nav === "Del perfil al rotor") return <RotorLocal />;
    if (nav === "Controles y reacción") return <RotorControls />;
    if (nav === "Aire en movimiento") return <RotorAdvance />;
    if (nav === "Autorrotación y límites") return <RotorAutorotation />;
  }
  return null;
}
