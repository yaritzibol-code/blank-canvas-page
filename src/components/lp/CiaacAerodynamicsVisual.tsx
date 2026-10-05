import { useId, type ReactNode } from "react";
import "./ciaac-aerodynamics-visual.css";

/** Native, qualitative teaching diagrams. No aircraft performance data is implied. */
const ink = "#15364b";
const blue = "#24688d";
const gold = "#aa741c";
const gray = "#d8e0e3";
const teal = "#39786c";
const t = (x: number, y: number, value: string, anchor: "start" | "middle" | "end" = "middle") => (
  <text x={x} y={y} textAnchor={anchor}>
    {value}
  </text>
);
function Arrow({
  id,
  x1,
  y1,
  x2,
  y2,
  tone = "force",
  dashed = false,
}: {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: "force" | "flow" | "aux";
  dashed?: boolean;
}) {
  return (
    <path
      d={`M${x1} ${y1}L${x2} ${y2}`}
      fill="none"
      stroke={tone === "force" ? blue : tone === "flow" ? gold : teal}
      strokeWidth={tone === "force" ? 4 : 3}
      strokeDasharray={dashed ? "7 5" : undefined}
      markerEnd={`url(#${id}-${tone})`}
    />
  );
}
function Scene({
  label,
  height = 260,
  children,
}: {
  label: string;
  height?: number;
  children: (id: string) => ReactNode;
}) {
  const id = `aero-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className="aero-svg-scroll" tabIndex={0} role="group" aria-label={`Diagrama: ${label}`}>
      <svg viewBox={`0 0 360 ${height}`} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{label}</title>
        <defs>
          {(["force", "flow", "aux"] as const).map((tone) => (
            <marker
              key={tone}
              id={`${id}-${tone}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M0 0L10 5L0 10Z"
                fill={tone === "force" ? blue : tone === "flow" ? gold : teal}
              />
            </marker>
          ))}
        </defs>
        {children(id)}
      </svg>
    </div>
  );
}
function Figure({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="ciaac-aero-visual">
      <div className="aero-figure-heading">
        <span aria-hidden="true">LECTURA VISUAL</span>
        <h3>{title}</h3>
      </div>
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
function Panel({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="aero-panel">
      <h4>{title}</h4>
      {children}
      {note && <p className="aero-panel-note">{note}</p>}
    </section>
  );
}
function Formula({ children }: { children: ReactNode }) {
  return <div className="aero-formula">{children}</div>;
}
const foil = "M55 150C55 111 153 95 315 150C214 144 91 174 55 150Z";
const symmetricFoil = "M55 150C55 119 174 123 315 150C174 177 55 181 55 150Z";
function Kinematics() {
  return (
    <Figure
      title="Rapidez y dirección: dos cambios posibles"
      caption="Cada flecha ámbar representa una velocidad respecto al aire, no una fuerza. Se comparan dos instantes en cada esquema; los puntos representan al mismo cuerpo en posiciones distintas."
    >
      <div className="aero-grid">
        <Panel title="En una trayectoria recta">
          <Scene
            label="Dos posiciones del mismo cuerpo en una recta. La segunda flecha de velocidad es más larga y apunta en la misma dirección."
            height={230}
          >
            {(id) => (
              <>
                <path d="M25 165H335" stroke={ink} strokeWidth="2" strokeDasharray="6 5" />
                <rect x="45" y="134" width="55" height="30" rx="6" fill={gray} stroke={ink} />
                <rect x="186" y="134" width="55" height="30" rx="6" fill={gray} stroke={ink} />
                <Arrow id={id} x1={73} y1={94} x2={131} y2={94} tone="flow" />
                <Arrow id={id} x1={214} y1={94} x2={322} y2={94} tone="flow" />
                {t(99, 61, "V₁")}
                {t(268, 61, "V₂")}
                {t(73, 208, "Instante 1")}
                {t(247, 208, "Instante 2")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel title="En una trayectoria curva">
          <Scene
            label="Dos velocidades tangentes a una trayectoria curva tienen la misma longitud y distinta dirección."
            height={250}
          >
            {(id) => (
              <>
                <path
                  d="M285 213A140 140 0 0 0 145 73"
                  fill="none"
                  stroke={ink}
                  strokeWidth="2"
                  strokeDasharray="6 5"
                />
                <circle cx="285" cy="213" r="8" fill={ink} />
                <circle cx="145" cy="73" r="8" fill={ink} />
                <Arrow id={id} x1={285} y1={213} x2={285} y2={128} tone="flow" />
                <Arrow id={id} x1={145} y1={73} x2={60} y2={73} tone="flow" />
                {t(313, 164, "V₁")}
                {t(96, 48, "V₂")}
                {t(175, 246, "Velocidad tangente")}
              </>
            )}
          </Scene>
        </Panel>
      </div>
    </Figure>
  );
}
function NetForce({ balanced = false }: { balanced?: boolean }) {
  if (balanced)
    return (
      <Figure
        title="Sumar sobre un solo cuerpo"
        caption="Modelo de traslación horizontal. Fuerza neta cero significa aceleración cero; la velocidad puede ser distinta de cero. Se omiten las fuerzas verticales."
      >
        <Panel title="Fuerzas equilibradas">
          <Scene
            label="Dos fuerzas horizontales iguales y opuestas sobre el mismo bloque producen resultante cero."
            height={225}
          >
            {(id) => (
              <>
                <rect
                  x="125"
                  y="75"
                  width="110"
                  height="70"
                  rx="9"
                  fill={gray}
                  stroke={ink}
                  strokeWidth="2"
                />
                {t(180, 118, "Cuerpo")}
                <Arrow id={id} x1={125} y1={110} x2={35} y2={110} />
                <Arrow id={id} x1={235} y1={110} x2={325} y2={110} />
                {t(75, 73, "F")}
                {t(283, 73, "F")}
                <Arrow id={id} x1={120} y1={190} x2={245} y2={190} tone="flow" />
                {t(180, 222, "V constante posible")}
              </>
            )}
          </Scene>
          <Formula>ΣF = 0 → a = 0</Formula>
        </Panel>
      </Figure>
    );
  return (
    <Figure
      title="Primero la resultante"
      caption="Solo se muestran componentes horizontales; las fuerzas verticales se omiten porque la comparación trata del movimiento horizontal. Las flechas discontinuas representan aceleración, no otra fuerza. Datos didácticos."
    >
      <div className="aero-stack">
        {[1000, 2000].map((mass, i) => (
          <Panel
            key={mass}
            title={`Caso ${i === 0 ? "A" : "B"} · ${mass === 1000 ? "1 000" : "2 000"} kg`}
          >
            <div className="aero-force-case">
              <Scene
                label={`Fuerza de 3 000 N a la derecha y 1 000 N a la izquierda sobre ${mass} kg; aceleración de ${2 / (i + 1)} metros por segundo al cuadrado.`}
                height={235}
              >
                {(id) => (
                  <>
                    {t(180, 29, "+x hacia la derecha")}
                    <rect
                      x="90"
                      y="88"
                      width="120"
                      height="65"
                      rx="8"
                      fill={gray}
                      stroke={ink}
                      strokeWidth="2"
                    />
                    {t(150, 128, mass === 1000 ? "1 000 kg" : "2 000 kg")}
                    <Arrow id={id} x1={90} y1={115} x2={42} y2={115} />
                    <Arrow id={id} x1={210} y1={115} x2={354} y2={115} />
                    {t(59, 73, "1 000 N")}
                    {t(280, 73, "3 000 N")}
                    <Arrow
                      id={id}
                      x1={115}
                      y1={191}
                      x2={i === 0 ? 265 : 190}
                      y2={191}
                      tone="aux"
                      dashed
                    />
                    {t(180, 228, `a = ${i === 0 ? "2" : "1"} m/s²`)}
                  </>
                )}
              </Scene>
              <div className="aero-result">
                <span>RESULTANTE</span>
                <strong>ΣFx = 2 000 N</strong>
                <span>a = ΣFx / m</span>
                <strong>{i === 0 ? "2" : "1"} m/s²</strong>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </Figure>
  );
}
function Interaction({ wing = false }: { wing?: boolean }) {
  return (
    <Figure
      title={wing ? "Una interacción entre ala y aire" : "¿Sobre qué cuerpo actúa?"}
      caption="Iguales y opuestas; cuerpos distintos. Las fuerzas de la pareja ocurren simultáneamente. Azul continuo: fuerza. Ámbar fino: movimiento del aire; su flecha no representa una fuerza adicional."
    >
      <div className="aero-grid">
        <Panel title={wing ? "Fuerza del aire sobre el ala" : "Fuerza del aire sobre la hélice"}>
          <Scene
            label={
              wing
                ? "Sobre el ala se muestra una fuerza ascendente."
                : "Sobre la hélice aislada se muestra fuerza hacia la derecha."
            }
          >
            {(id) => (
              <>
                {wing ? (
                  <>
                    <path d={foil} fill={gray} stroke={ink} strokeWidth="2" />
                    <Arrow id={id} x1={160} y1={133} x2={160} y2={33} />
                    {t(240, 55, "Sobre el ala")}
                  </>
                ) : (
                  <>
                    <ellipse
                      cx="95"
                      cy="125"
                      rx="14"
                      ry="85"
                      fill={gray}
                      stroke={ink}
                      strokeWidth="2"
                    />
                    <circle cx="95" cy="125" r="22" fill={ink} />
                    <Arrow id={id} x1={95} y1={125} x2={255} y2={125} />
                    {t(250, 94, "Hacia delante")}
                  </>
                )}
                {t(180, 244, wing ? "Cuerpo 1 · ala" : "Cuerpo 1 · hélice")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel title={wing ? "Fuerza del ala sobre el aire" : "Fuerza de la hélice sobre el aire"}>
          <Scene
            label={
              wing
                ? "En la región de aire se muestra la fuerza opuesta, descendente."
                : "Sobre el aire se muestra una fuerza hacia la izquierda, de la misma longitud que la fuerza sobre la hélice."
            }
          >
            {(id) => (
              <>
                <rect
                  x="40"
                  y="27"
                  width="280"
                  height="182"
                  rx="16"
                  fill="none"
                  stroke={ink}
                  strokeWidth="2"
                  strokeDasharray="8 6"
                />
                {wing ? (
                  <Arrow id={id} x1={180} y1={62} x2={180} y2={162} />
                ) : (
                  <Arrow id={id} x1={265} y1={125} x2={105} y2={125} />
                )}
                {wing ? (
                  <>
                    <Arrow id={id} x1={80} y1={75} x2={99} y2={142} tone="flow" />
                    <Arrow id={id} x1={270} y1={75} x2={289} y2={142} tone="flow" />
                  </>
                ) : (
                  <>
                    <Arrow id={id} x1={280} y1={60} x2={190} y2={60} tone="flow" />
                    <Arrow id={id} x1={280} y1={180} x2={190} y2={180} tone="flow" />
                  </>
                )}
                {t(180, 244, "Cuerpo 2 · aire")}
              </>
            )}
          </Scene>
        </Panel>
      </div>
      <div className="aero-pair-bracket" aria-hidden="true" />
      <Formula>Iguales y opuestas; cuerpos distintos</Formula>
    </Figure>
  );
}
function PressureBudget() {
  return (
    <Figure
      title="La suma se conserva"
      caption="Mismo balance ideal, misma altura y densidad constante. Flujo estacionario, sin pérdidas. Son cuentas en pascales, no una gráfica de presión a escala."
    >
      <Formula>ps + q = pt</Formula>
      <div className="aero-grid">
        {[false, true].map((b) => (
          <Panel key={String(b)} title={b ? "Estado B" : "Estado A"}>
            <dl className="aero-ledger">
              <div>
                <dt>Total · pt</dt>
                <dd>101 000 Pa</dd>
              </div>
              <div>
                <dt>Dinámica · q</dt>
                <dd>{b ? "900" : "400"} Pa</dd>
              </div>
              <div>
                <dt>Estática · ps</dt>
                <dd>{b ? "100 100" : "100 600"} Pa</dd>
              </div>
            </dl>
          </Panel>
        ))}
      </div>
      <div className="aero-budget-change">
        <span>pt permanece igual →</span>
        <span>q aumenta 500 Pa ↑</span>
        <span>ps disminuye 500 Pa ↓</span>
      </div>
    </Figure>
  );
}
function Venturi({ contextOnly = false }: { contextOnly?: boolean }) {
  return (
    <Figure
      title={contextOnly ? "Observa el cambio de sección" : "Área, velocidad y presión"}
      caption="Conducto de profundidad constante: la garganta tiene mitad de altura y mitad de área. Modelo estacionario, incompresible, horizontal, sin fugas ni pérdidas. La recuperación real puede ser incompleta; un perfil no es medio tubo de Venturi."
    >
      <Panel title="El área fija la velocidad: A₁V₁ = A₂V₂">
        <Scene
          label={
            contextOnly
              ? "Venturi: la sección se estrecha en la garganta y la flecha de velocidad aumenta; la presión es la incógnita de la pregunta."
              : "Venturi: entrada y salida tienen igual área; garganta de mitad de área con flecha de velocidad doble. La presión total se mantiene constante."
          }
          height={295}
        >
          {(id) => (
            <>
              <path
                d="M15 60H65C120 60 120 90 160 90H200C240 90 240 60 295 60H345M15 180H65C120 180 120 150 160 150H200C240 150 240 180 295 180H345"
                fill="none"
                stroke={ink}
                strokeWidth="4"
              />
              <Arrow id={id} x1={20} y1={120} x2={65} y2={120} tone="flow" />
              <Arrow id={id} x1={135} y1={120} x2={225} y2={120} tone="flow" />
              <Arrow id={id} x1={285} y1={120} x2={330} y2={120} tone="flow" />
              {t(46, 32, "A₁")}
              {t(180, 32, "A₁ / 2")}
              {t(314, 32, "A₁")}
              {t(45, 216, "V₁")}
              {t(180, 216, "2V₁")}
              {t(314, 216, "V₁")}
              {!contextOnly && (
                <>
                  <path d="M20 254H340" stroke={blue} strokeWidth="3" />
                  {t(180, 287, "pt constante")}
                </>
              )}
              {contextOnly && t(180, 271, "¿Qué ocurre con ps?")}
            </>
          )}
        </Scene>
        <div className="aero-three-columns">
          <div>
            <strong>Entrada</strong>
            {!contextOnly && (
              <>
                <span>q₁</span>
                <span>ps de entrada</span>
              </>
            )}
          </div>
          <div>
            <strong>Garganta</strong>
            {!contextOnly && (
              <>
                <span>4q₁</span>
                <span>ps menor</span>
              </>
            )}
          </div>
          <div>
            <strong>Salida</strong>
            {!contextOnly && (
              <>
                <span>q₁</span>
                <span>ps recuperada idealmente</span>
              </>
            )}
          </div>
        </div>
      </Panel>
    </Figure>
  );
}
function Anatomy() {
  return (
    <Figure
      title="Un corte del ala"
      caption="Geometría esquemática. El perfil es una sección bidimensional de un ala tridimensional. La cuerda une directamente los dos bordes; la envergadura mide de punta a punta y pertenece a otra dirección."
    >
      <div className="aero-grid">
        <Panel title="Del volumen a la sección">
          <Scene
            label="Un segmento tridimensional de ala con un plano de corte resaltado se proyecta a una sección de perfil."
            height={295}
          >
            {() => (
              <>
                <path
                  d="M55 94L164 34Q224 26 305 74L199 142Q99 91 55 94Z"
                  fill={gray}
                  stroke={ink}
                  strokeWidth="2"
                />
                <path d="M55 94Q74 112 199 142L305 74" fill="none" stroke={ink} strokeWidth="2" />
                <path
                  d="M111 57Q177 45 252 103L252 122Q183 72 111 78Z"
                  fill="#d9ad59"
                  fillOpacity=".65"
                  stroke={gold}
                  strokeWidth="2"
                />
                {t(70, 32, "Ala 3D")}
                <path d="M184 114L184 180" stroke={gold} strokeWidth="2" strokeDasharray="6 5" />
                <path
                  d="M55 235C55 198 164 191 315 235C207 230 92 258 55 235Z"
                  fill={gray}
                  stroke={ink}
                  strokeWidth="2"
                />
                {t(180, 285, "Contorno del corte · 2D")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel title="Cinco referencias del perfil">
          <Scene
            label="Borde de ataque a la izquierda y de salida a la derecha; extradós arriba, intradós abajo, y cuerda recta entre los bordes."
            height={310}
          >
            {() => (
              <>
                <path d={foil} fill={gray} stroke={ink} strokeWidth="2" />
                <path d="M55 150H315" stroke={gold} strokeWidth="3" strokeDasharray="7 5" />
                <path
                  d="M90 123V54M172 156V211M55 150L29 179V229M315 150L332 180V260"
                  fill="none"
                  stroke={ink}
                  strokeWidth="1.5"
                />
                {t(90, 38, "Extradós")}
                {t(170, 241, "Intradós")}
                {t(13, 257, "Borde de", "start")}
                {t(13, 283, "ataque", "start")}
                {t(346, 286, "Borde de salida", "end")}
                {t(218, 68, "Cuerda")}
                {t(218, 95, "geométrica")}
                <path d="M220 103L244 150" fill="none" stroke={gold} strokeWidth="1.5" />
              </>
            )}
          </Scene>
        </Panel>
        <Panel title="Otra dimensión: envergadura">
          <Scene
            label="Vista superior de un ala completa. La envergadura va de punta a punta; la cuerda es perpendicular a ella."
            height={260}
          >
            {(id) => (
              <>
                <path
                  d="M50 112L180 87L310 112V184L180 188L50 184Z"
                  fill={gray}
                  stroke={ink}
                  strokeWidth="2"
                />
                <path
                  d="M50 62H310"
                  stroke={blue}
                  strokeWidth="3"
                  markerStart={`url(#${id}-force)`}
                  markerEnd={`url(#${id}-force)`}
                />
                <path d="M50 73V98M310 73V98" stroke={ink} />
                {t(180, 38, "Envergadura")}
                <Arrow id={id} x1={180} y1={95} x2={180} y2={183} tone="aux" />
                {t(238, 154, "Cuerda")}
                {t(180, 238, "Vista superior")}
              </>
            )}
          </Scene>
        </Panel>
      </div>
    </Figure>
  );
}
function Orientation() {
  return (
    <Figure
      title="La misma forma, otra orientación"
      caption="Perfil simétrico idealizado. El ángulo α se mide entre cuerda y corriente libre, no desde el horizonte. La flecha L es perpendicular a esa corriente. Ilustración cualitativa, sin ángulo ni coeficiente universales."
    >
      <div className="aero-grid">
        {[false, true].map((positive) => (
          <Panel
            key={String(positive)}
            title={positive ? "Ángulo de ataque positivo" : "Ángulo de ataque cero"}
          >
            <Scene
              label={
                positive
                  ? "Perfil simétrico con borde de ataque más alto que borde de salida, corriente libre horizontal y sustentación hacia arriba."
                  : "Perfil simétrico con cuerda horizontal, corriente simétrica y sustentación ideal cero."
              }
              height={285}
            >
              {(id) => (
                <>
                  <Arrow id={id} x1={22} y1={42} x2={138} y2={42} tone="flow" />
                  {t(226, 49, "Flujo libre")}
                  {[0, 1].map((i) => (
                    <path
                      key={i}
                      d={
                        positive
                          ? `M15 ${88 - i * 24}C110 ${65 - i * 24} 245 ${93 - i * 24} 345 ${145 - i * 24}`
                          : `M15 ${90 - i * 24}Q155 ${55 - i * 24} 345 ${90 - i * 24}`
                      }
                      fill="none"
                      stroke={gold}
                      strokeWidth="2"
                    />
                  ))}
                  {[0, 1].map((i) => (
                    <path
                      key={i}
                      d={
                        positive
                          ? `M15 ${191 + i * 24}C145 ${170 + i * 24} 255 ${213 + i * 24} 345 ${230 + i * 24}`
                          : `M15 ${210 + i * 24}Q155 ${245 + i * 24} 345 ${210 + i * 24}`
                      }
                      fill="none"
                      stroke={gold}
                      strokeWidth="2"
                    />
                  ))}
                  <g transform={positive ? "rotate(10 55 150)" : undefined}>
                    <path d={symmetricFoil} fill={gray} stroke={ink} strokeWidth="2" />
                    <path d="M55 150H315" stroke={ink} strokeWidth="2" strokeDasharray="7 5" />
                  </g>
                  {positive ? (
                    <>
                      <path d="M55 150H315" stroke={teal} strokeWidth="2" strokeDasharray="4 5" />
                      <path
                        d="M165 150A110 110 0 0 1 163.3 169.1"
                        fill="none"
                        stroke={blue}
                        strokeWidth="3"
                      />
                      {t(191, 172, "α")}
                      <Arrow id={id} x1={244} y1={165} x2={244} y2={63} />
                      {t(266, 84, "L")}
                    </>
                  ) : (
                    t(180, 200, "α = 0")
                  )}
                </>
              )}
            </Scene>
            <Formula>
              {positive ? "α > 0 · L perpendicular al flujo" : "L = 0 en este modelo ideal"}
            </Formula>
          </Panel>
        ))}
      </div>
    </Figure>
  );
}
function FourForces({ mode = "level" }: { mode?: "level" | "compare" | "glide" | "resultant" }) {
  if (mode === "resultant")
    return (
      <Figure
        title="Una resultante, dos componentes"
        caption="Las presiones y la fricción dan una única resultante aerodinámica R. L es perpendicular al movimiento respecto al aire; D se opone a ese movimiento. El peso tiene otro origen."
      >
        <Panel title="Ejes relativos al aire">
          <Scene
            label="R aerodinámica se descompone en L hacia arriba y D hacia atrás; velocidad respecto al aire hacia la derecha."
            height={280}
          >
            {(id) => (
              <>
                <circle cx="245" cy="188" r="9" fill={ink} />
                <Arrow id={id} x1={245} y1={188} x2={245} y2={63} />
                {t(270, 91, "L")}
                <Arrow id={id} x1={245} y1={188} x2={105} y2={188} />
                {t(151, 220, "D")}
                <Arrow id={id} x1={245} y1={188} x2={105} y2={63} tone="aux" />
                {t(151, 104, "R")}
                <path
                  d="M105 188V63H245"
                  fill="none"
                  stroke={ink}
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                />
                <Arrow id={id} x1={180} y1={250} x2={315} y2={250} tone="flow" />
                {t(83, 257, "Avance")}
              </>
            )}
          </Scene>
        </Panel>
      </Figure>
    );
  return (
    <Figure
      title={
        mode === "glide"
          ? "El peso también se proyecta"
          : "Primero la referencia, luego las fuerzas"
      }
      caption={
        mode === "glide"
          ? "Planeo rectilíneo estabilizado, sin empuje y en aire quieto. Las componentes dibujadas son proyecciones de W, no fuerzas adicionales."
          : "Azul continuo: fuerzas sobre el mismo cuerpo. Ámbar: velocidad respecto al aire. Verde discontinuo: proyecciones, no fuerzas extra. Cada igualdad requiere las condiciones escritas en su panel."
      }
    >
      <div className="aero-grid">
        {mode !== "glide" && (
          <Panel
            title="Recto y nivelado estabilizado"
            note="Alas horizontales; T paralelo a la trayectoria."
          >
            <Scene
              label="Punto material con L arriba, W abajo, T adelante y D atrás; velocidad horizontal. Fuerzas opuestas de igual magnitud."
              height={290}
            >
              {(id) => (
                <>
                  <circle cx="180" cy="147" r="10" fill={ink} />
                  <Arrow id={id} x1={180} y1={147} x2={180} y2={48} />
                  {t(210, 73, "L")}
                  <Arrow id={id} x1={180} y1={147} x2={180} y2={246} />
                  {t(210, 238, "W")}
                  <Arrow id={id} x1={180} y1={147} x2={305} y2={147} />
                  {t(286, 127, "T")}
                  <Arrow id={id} x1={180} y1={147} x2={55} y2={147} />
                  {t(73, 127, "D")}
                  <Arrow id={id} x1={45} y1={273} x2={315} y2={273} tone="flow" />
                  {t(180, 31, "Vertical terrestre ↑")}
                </>
              )}
            </Scene>
            <Formula>L = W · T = D</Formula>
          </Panel>
        )}
        {(mode === "compare" || mode === "glide") && (
          <Panel
            title={mode === "glide" ? "Planeo estabilizado" : "Ascenso rectilíneo estabilizado"}
            note={
              mode === "glide"
                ? "T = 0; trayectoria descendente a la derecha."
                : "T paralelo a la trayectoria ascendente."
            }
          >
            <Scene
              label={
                mode === "glide"
                  ? "Trayectoria descendente; W vertical abajo se descompone en una componente paralela hacia delante y otra normal a la trayectoria."
                  : "Trayectoria ascendente; W vertical abajo se descompone en W sen gamma contra la trayectoria y W cos gamma perpendicular a ella."
              }
              height={330}
            >
              {(id) => {
                const glide = mode === "glide";
                return (
                  <>
                    <path
                      d={glide ? "M30 117L330 227" : "M30 227L330 117"}
                      fill="none"
                      stroke={gold}
                      strokeWidth="2"
                    />
                    <circle cx="180" cy="172" r="8" fill={ink} />
                    <Arrow id={id} x1={180} y1={172} x2={180} y2={292} />
                    {t(159, 309, "W")}
                    <Arrow id={id} x1={180} y1={172} x2={glide ? 218.6 : 141.4} y2={66.1} />
                    {t(glide ? 244 : 116, 87, "L")}
                    <Arrow
                      id={id}
                      x1={180}
                      y1={172}
                      x2={glide ? 141.4 : 83.6}
                      y2={glide ? 157.9 : 207.3}
                    />
                    {t(glide ? 122 : 74, glide ? 137 : 236, "D")}
                    {!glide && (
                      <>
                        <Arrow id={id} x1={180} y1={172} x2={315} y2={122.5} />
                        {t(315, 96, "T")}
                      </>
                    )}
                    <Arrow
                      id={id}
                      x1={180}
                      y1={172}
                      x2={glide ? 218.6 : 141.4}
                      y2={186.1}
                      tone="aux"
                      dashed
                    />
                    <Arrow
                      id={id}
                      x1={glide ? 218.6 : 141.4}
                      y1={186.1}
                      x2={180}
                      y2={292}
                      tone="aux"
                      dashed
                    />
                    {t(glide ? 264 : 77, 268, "W cos γ")}
                    {t(glide ? 278 : 75, glide ? 130 : 163, "W sen γ")}
                    {glide && (
                      <path d="M267 137L216 184" fill="none" stroke={teal} strokeWidth="1.5" />
                    )}
                    <path d="M180 172H324" stroke={ink} strokeWidth="1" strokeDasharray="5 5" />
                    <path
                      d={
                        glide ? "M270 172A90 90 0 0 1 264.5 203" : "M264.5 141A90 90 0 0 1 270 172"
                      }
                      fill="none"
                      stroke={ink}
                      strokeWidth="2"
                    />
                    {t(301, glide ? 204 : 169, "γ")}
                    {t(180, 30, "W permanece vertical")}
                  </>
                );
              }}
            </Scene>
            <Formula>
              {mode === "glide" ? (
                "L = W cos |γ| · D = W sen |γ|"
              ) : (
                <>
                  L = W cos γ<br />T = D + W sen γ
                </>
              )}
            </Formula>
          </Panel>
        )}
        {mode === "compare" && (
          <Panel
            title="Viraje coordinado nivelado"
            note="Vista de frente. La componente horizontal de L cambia la dirección del movimiento."
          >
            <Scene
              label="Sustentación inclinada L, componente vertical L cos phi igual al peso y componente horizontal L sen phi hacia el centro del viraje."
              height={350}
            >
              {(id) => (
                <>
                  <circle cx="120" cy="190" r="9" fill={ink} />
                  <path d="M40 148L285 275" stroke={ink} strokeWidth="5" />
                  <Arrow id={id} x1={120} y1={190} x2={190} y2={55} />
                  {t(217, 72, "L")}
                  <Arrow id={id} x1={120} y1={190} x2={120} y2={325} />
                  {t(151, 321, "W")}
                  <Arrow id={id} x1={120} y1={190} x2={120} y2={55} tone="aux" dashed />
                  <path d="M120 55H190" stroke={teal} strokeWidth="2" strokeDasharray="5 4" />
                  <Arrow id={id} x1={120} y1={190} x2={190} y2={190} tone="aux" dashed />
                  {t(52, 93, "L cos φ")}
                  {t(259, 204, "L sen φ")}
                  <path
                    d="M120 115A75 75 0 0 1 154.5 123.4"
                    fill="none"
                    stroke={ink}
                    strokeWidth="2"
                  />
                  {t(143, 104, "φ")}
                  {t(180, 31, "Vertical terrestre ↑")}
                </>
              )}
            </Scene>
            <Formula>L cos φ = W · L &gt; W si φ ≠ 0</Formula>
          </Panel>
        )}
      </div>
    </Figure>
  );
}
function FlowMap({ pressure = false }: { pressure?: boolean }) {
  return (
    <Figure
      title={pressure ? "Acelerar y recuperar presión" : "Leer un campo de flujo"}
      caption="Ilustración cualitativa de una condición de sustentación positiva. Las líneas no atraviesan el sólido. El remanso puede moverse con forma e incidencia; las partículas no tienen un tiempo de encuentro obligatorio. No son datos de un perfil real."
    >
      <div className="aero-grid">
        <Panel title="Corriente libre → flujo local">
          <Scene
            label="Corriente de izquierda a derecha rodea ambas superficies de un perfil. Se señala un remanso próximo al borde inferior delantero y una deflexión posterior hacia abajo."
            height={295}
          >
            {(id) => (
              <>
                {t(180, 28, "V∞ y p∞ de referencia")}
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d={`M16 ${70 + i * 23}C70 ${70 + i * 23} 82 ${42 + i * 23} 155 ${53 + i * 23}S275 ${91 + i * 19} 343 ${116 + i * 20}`}
                    fill="none"
                    stroke={gold}
                    strokeWidth="2.5"
                    markerEnd={`url(#${id}-flow)`}
                  />
                ))}
                <path d={foil} fill={gray} stroke={ink} strokeWidth="2" />
                {[0, 1].map((i) => (
                  <path
                    key={i}
                    d={`M16 ${178 + i * 34}C90 ${197 + i * 25} 179 ${177 + i * 30} 249 ${180 + i * 30}S317 ${208 + i * 29} 343 ${219 + i * 27}`}
                    fill="none"
                    stroke={gold}
                    strokeWidth="2.5"
                    markerEnd={`url(#${id}-flow)`}
                  />
                ))}
                <path d="M16 154H59" stroke={gold} strokeWidth="2" />
                <circle cx="59" cy="154" r="5" fill={blue} />
                <path d="M59 160L59 258H140" fill="none" stroke={blue} strokeWidth="1.5" />
                {t(230, 266, "Remanso local")}
              </>
            )}
          </Scene>
        </Panel>
        {pressure && (
          <Panel
            title="Presión a lo largo de la cuerda"
            note="Tendencias orientativas. Azul continuo: extradós. Verde discontinuo: intradós."
          >
            <Scene
              label="Presión estática frente a posición a lo largo de la cuerda: en el extradós hay succión y posterior recuperación; también varía la presión del intradós."
              height={295}
            >
              {(id) => (
                <>
                  <Arrow id={id} x1={45} y1={245} x2={45} y2={35} tone="aux" />
                  <Arrow id={id} x1={45} y1={245} x2={340} y2={245} tone="aux" />
                  {t(50, 27, "p")}
                  {t(207, 281, "x / c")}
                  <path
                    d="M45 117H330"
                    fill="none"
                    stroke={ink}
                    strokeWidth="1.5"
                    strokeDasharray="6 5"
                  />
                  {t(17, 122, "p∞")}
                  <path
                    d="M55 130C70 243 108 232 146 186S254 127 318 122"
                    fill="none"
                    stroke={blue}
                    strokeWidth="4"
                  />
                  <path
                    d="M55 97C114 77 152 106 205 111S288 117 318 122"
                    fill="none"
                    stroke={teal}
                    strokeWidth="3"
                    strokeDasharray="8 5"
                  />
                  {t(149, 69, "Referencia p∞")}
                  {t(180, 217, "Succión")}
                  {t(254, 165, "Recuperación")}
                  {t(49, 279, "0")}
                  {t(325, 279, "1")}
                </>
              )}
            </Scene>
          </Panel>
        )}
      </div>
    </Figure>
  );
}
function BoundaryLayer() {
  return (
    <Figure
      title="El flujo exterior y la pared no son lo mismo"
      caption="Ampliación independiente, fuera de escala. Junto a la pared fija la velocidad relativa es cero. La transición de laminar a turbulento no implica automáticamente separación."
    >
      <div className="aero-grid">
        <Panel title="Perfil de velocidad en la capa límite">
          <Scene
            label="Flechas de velocidad aumentan desde cero en la pared hasta el flujo exterior."
            height={280}
          >
            {(id) => (
              <>
                <path d="M20 223H340" stroke={ink} strokeWidth="7" />
                {[35, 91, 148, 179].map((length, i) => (
                  <Arrow
                    key={i}
                    id={id}
                    x1={70}
                    y1={193 - i * 43}
                    x2={70 + length}
                    y2={193 - i * 43}
                    tone="flow"
                  />
                ))}
                <circle cx="70" cy="223" r="5" fill={blue} />
                <path
                  d="M70 223C70 180 185 154 249 64"
                  stroke={blue}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="7 5"
                />
                {t(190, 29, "Flujo exterior local")}
                {t(180, 267, "Pared · V relativa = 0")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel title="Adherido y separado son distintos">
          <Scene
            label="Flujo turbulento puede seguir junto a la pared; separación se representa al alejarse las corrientes de la superficie."
            height={280}
          >
            {(id) => (
              <>
                <path d="M20 219H340" stroke={ink} strokeWidth="6" />
                {[0, 1].map((i) => (
                  <path
                    key={i}
                    d={`M20 ${177 - i * 34}Q52 ${160 - i * 34} 80 ${177 - i * 34}T140 ${177 - i * 34}T200 ${177 - i * 34}Q247 ${170 - i * 34} 330 ${74 - i * 27}`}
                    fill="none"
                    stroke={gold}
                    strokeWidth="2.5"
                    markerEnd={`url(#${id}-flow)`}
                  />
                ))}
                {t(108, 74, "Turbulento")}
                {t(108, 102, "adherido")}
                {t(268, 28, "Separado")}
                <path d="M214 191L214 240" stroke={blue} strokeWidth="2" strokeDasharray="5 4" />
                {t(180, 270, "La pared queda aquí")}
              </>
            )}
          </Scene>
        </Panel>
      </div>
    </Figure>
  );
}
function LiftFactors({ compare = false }: { compare?: boolean }) {
  return (
    <Figure
      title={
        compare ? "Dos preguntas, dos comparaciones" : "Construir una fuerza con cuatro factores"
      }
      caption="Ejemplo didáctico: ρ = 1,20 kg/m³; S = 16 m². Los estados comparados son modelos matemáticos; no son datos de una aeronave ni instrucciones de maniobra. CL es adimensional."
    >
      <Formula>q = ½ρV² · L = q S CL</Formula>
      <div className="aero-grid">
        <Panel title="Estado de referencia · 50 m/s">
          <Scene
            label="La presión dinámica q en pascales, el área S en metros cuadrados y el coeficiente CL adimensional se multiplican para producir L en newtons."
            height={215}
          >
            {(id) => (
              <>
                {[10, 130, 250].map((x) => (
                  <rect
                    key={x}
                    x={x}
                    y="20"
                    width="100"
                    height="84"
                    rx="8"
                    fill={gray}
                    stroke={ink}
                    strokeWidth="1.5"
                  />
                ))}
                {t(60, 54, "q")}
                {t(60, 87, "Pa")}
                {t(180, 54, "S")}
                {t(180, 87, "m²")}
                {t(300, 54, "CL")}
                {t(300, 87, "1")}
                {t(120, 69, "×")}
                {t(240, 69, "×")}
                <path d="M60 115V137H300V115" fill="none" stroke={ink} strokeWidth="2" />
                <Arrow id={id} x1={180} y1={137} x2={180} y2={174} />
                {t(180, 207, "L · N")}
              </>
            )}
          </Scene>
          <dl className="aero-ledger">
            <div>
              <dt>q</dt>
              <dd>1 500 Pa</dd>
            </div>
            <div>
              <dt>S</dt>
              <dd>16 m²</dd>
            </div>
            <div>
              <dt>CL</dt>
              <dd>0,50</dd>
            </div>
            <div>
              <dt>L</dt>
              <dd>12 000 N</dd>
            </div>
          </dl>
        </Panel>
        {compare ? (
          <>
            <Panel title="60 m/s · CL constante" note="Se mantienen ρ, S y CL.">
              <dl className="aero-ledger">
                <div>
                  <dt>q</dt>
                  <dd>2 160 Pa</dd>
                </div>
                <div>
                  <dt>CL</dt>
                  <dd>0,50</dd>
                </div>
                <div>
                  <dt>L</dt>
                  <dd>17 280 N</dd>
                </div>
              </dl>
              <Formula>L aumenta un 44 %</Formula>
            </Panel>
            <Panel
              title="60 m/s · L constante"
              note="Mismo peso en vuelo recto nivelado estabilizado; ρ y S fijas."
            >
              <dl className="aero-ledger">
                <div>
                  <dt>q</dt>
                  <dd>2 160 Pa</dd>
                </div>
                <div>
                  <dt>L requerida</dt>
                  <dd>12 000 N</dd>
                </div>
                <div>
                  <dt>CL requerido</dt>
                  <dd>≈ 0,347</dd>
                </div>
              </dl>
              <Formula>CL disminuye</Formula>
            </Panel>
          </>
        ) : (
          <Panel title="Qué aporta cada factor">
            <div className="aero-factor-list">
              <p>
                <strong>ρ · kg/m³</strong>Masa de aire por volumen
              </p>
              <p>
                <strong>V · m/s</strong>Velocidad respecto al aire
              </p>
              <p>
                <strong>S · m²</strong>Área alar de referencia
              </p>
              <p>
                <strong>CL · sin unidades</strong>Respuesta en esa condición
              </p>
            </div>
          </Panel>
        )}
      </div>
    </Figure>
  );
}
function CoefficientCurve() {
  return (
    <Figure
      title="La tendencia tiene condiciones y un límite"
      caption="Curva conceptual de CL frente a α. Geometría, configuración, Reynolds, Mach y superficie especificados. No se asignan valores universales de ángulo crítico, pendiente o CL máximo."
    >
      <Panel title="CL no crece indefinidamente">
        <Scene
          label="En una región adherida CL crece aproximadamente con el ángulo de ataque; alcanza un máximo y luego puede disminuir."
          height={305}
        >
          {(id) => (
            <>
              <Arrow id={id} x1={48} y1={250} x2={48} y2={30} tone="aux" />
              <Arrow id={id} x1={48} y1={250} x2={339} y2={250} tone="aux" />
              {t(25, 30, "CL")}
              {t(335, 284, "α")}
              <path
                d="M65 232L207 93Q230 70 246 77T322 170"
                fill="none"
                stroke={blue}
                strokeWidth="4"
              />
              <circle cx="238" cy="75" r="5" fill={gold} />
              {t(226, 42, "CL máximo")}
              <path d="M238 85V245" stroke={ink} strokeWidth="1.5" strokeDasharray="6 5" />
              {t(112, 88, "Región")}
              {t(112, 115, "adherida")}
              {t(294, 210, "Puede")}
              {t(294, 238, "caer")}
              {t(162, 285, "Ángulo de ataque")}
            </>
          )}
        </Scene>
      </Panel>
    </Figure>
  );
}
function DragTaxonomy() {
  return (
    <Figure
      title="Una resistencia, varios mecanismos"
      caption="Forma, fricción e interferencia son contribuciones de resistencia parásita en esta agrupación introductoria. Los dibujos aíslan mecanismos; no son regiones independientes que se puedan sumar dos veces."
    >
      <div className="aero-grid">
        <Panel
          title="Forma · presión y separación"
          note="Una estela amplia puede acompañar una distribución de presión desfavorable."
        >
          <Scene
            label="Cuerpo romo con líneas de corriente separadas y estela ancha detrás."
            height={205}
          >
            {(id) => (
              <>
                <path d="M115 64Q58 64 58 111T115 158Z" fill={gray} stroke={ink} strokeWidth="2" />
                <path
                  d="M20 61H70Q116 27 170 60L333 52M20 161H70Q116 195 170 162L333 177"
                  fill="none"
                  stroke={gold}
                  strokeWidth="3"
                />
                <path
                  d="M131 79Q175 56 194 99T260 104T330 94M131 143Q175 166 194 126T260 119T330 145"
                  fill="none"
                  stroke={blue}
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
                <Arrow id={id} x1={18} y1={110} x2={50} y2={110} tone="flow" />
                {t(249, 31, "Estela")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel
          title="Fricción · esfuerzo tangencial"
          note="Existe también en una superficie lisa por la viscosidad del aire."
        >
          <Scene
            label="Flujo exterior sobre pared fija y fuerza tangencial sobre la superficie en el sentido del flujo."
            height={205}
          >
            {(id) => (
              <>
                <path d="M30 151H330" stroke={ink} strokeWidth="7" />
                {[50, 130, 210].map((x) => (
                  <Arrow key={x} id={id} x1={x} y1={130} x2={x + 50} y2={130} />
                ))}
                <Arrow id={id} x1={57} y1={59} x2={286} y2={59} tone="flow" />
                {t(180, 33, "Flujo")}
                {t(180, 189, "Superficie fija")}
              </>
            )}
          </Scene>
        </Panel>
        <Panel
          title="Interferencia · unión de superficies"
          note="El flujo del conjunto interactúa en una unión; los carenados pueden suavizarla."
        >
          <Scene
            label="Dos superficies perpendiculares forman una unión; las líneas se curvan y se aproximan alrededor de esa unión."
            height={205}
          >
            {() => (
              <>
                <path
                  d="M40 150L149 78L323 122L211 191Z"
                  fill={gray}
                  stroke={ink}
                  strokeWidth="2"
                />
                <path d="M150 134V38L231 56V156Z" fill="#b9c9cf" stroke={ink} strokeWidth="2" />
                <path
                  d="M35 135Q83 104 126 112Q146 159 219 169L307 146M31 161Q117 177 143 149Q144 197 233 190"
                  fill="none"
                  stroke={gold}
                  strokeWidth="3"
                />
                {t(73, 39, "Unión")}
                <path d="M75 48L143 129" stroke={ink} strokeWidth="1.5" />
              </>
            )}
          </Scene>
        </Panel>
      </div>
    </Figure>
  );
}
function InducedDrag() {
  return (
    <Figure
      title="Antes de hablar de velocidad, fija la condición"
      caption="Modelo subsónico, configuración y k constantes. La tendencia inversa con V² requiere L constante. La resistencia inducida está asociada al sistema de sustentación de un ala finita, no solo a un punto de su punta."
    >
      <Formula>Di = q S k CL²</Formula>
      <div className="aero-grid">
        <Panel title="Si se mantiene la sustentación L">
          <Formula>
            CL = L / (qS)
            <br />
            Di = k L² / (qS)
          </Formula>
          <div className="aero-trend">
            <span>V → 2V</span>
            <span>q → 4q</span>
            <strong>Di → Di / 4</strong>
          </div>
        </Panel>
        <Panel title="Si se mantiene el coeficiente CL">
          <Formula>Di = q S k CL²</Formula>
          <div className="aero-trend">
            <span>V → 2V</span>
            <span>q → 4q</span>
            <strong>Di → 4Di</strong>
          </div>
        </Panel>
      </div>
    </Figure>
  );
}
function DragCurve() {
  const x = (v: number) => 72 + ((v - 0.5) / 1.6) * 251;
  const y = (d: number) => 262 - (d / 2500) * 203;
  const curve = (fn: (v: number) => number) =>
    Array.from({ length: 81 }, (_, i) => {
      const v = 0.6 + (i / 80) * 1.4;
      return `${i ? "L" : "M"}${x(v).toFixed(2)} ${y(fn(v)).toFixed(2)}`;
    }).join(" ");
  return (
    <Figure
      title="Dos tendencias producen un mínimo"
      caption="Datos didácticos: Dp = 500(V/V₀)² N y Di = 500/(V/V₀)² N. L, densidad y configuración fijas; familia de vuelos nivelados estabilizados. Se supone flujo adherido en el dominio dibujado, sin extrapolar a V = 0 ni a pérdida o compresibilidad fuerte."
    >
      <div className="aero-grid">
        <Panel title="D frente a V/V₀">
          <Scene
            label="Curva de resistencia parásita creciente, inducida decreciente y total en U. En V/V0 igual a uno, las partes valen 500 N y la suma 1000 N."
            height={332}
          >
            {(id) => (
              <>
                <Arrow id={id} x1={72} y1={262} x2={72} y2={28} tone="aux" />
                <Arrow id={id} x1={72} y1={262} x2={340} y2={262} tone="aux" />
                {t(76, 23, "D · N")}
                {t(294, 325, "V / V₀")}
                {[500, 1000, 2000].map((d) => (
                  <g key={d}>
                    <path d={`M72 ${y(d)}H330`} stroke="#d7dddd" strokeWidth="1" />
                    {t(65, y(d) + 7, String(d), "end")}
                  </g>
                ))}
                {[0.5, 1, 1.5, 2].map((v) => (
                  <g key={v}>
                    <path d={`M${x(v)} 262v6`} stroke={ink} />
                    {t(x(v), 297, String(v).replace(".", ","))}
                  </g>
                ))}
                <path
                  d={curve((v) => 500 * v * v)}
                  fill="none"
                  stroke={gold}
                  strokeWidth="3"
                  strokeDasharray="9 5"
                />
                <path
                  d={curve((v) => 500 / v / v)}
                  fill="none"
                  stroke={teal}
                  strokeWidth="3"
                  strokeDasharray="3 5"
                />
                <path
                  d={curve((v) => 500 * v * v + 500 / v / v)}
                  fill="none"
                  stroke={blue}
                  strokeWidth="4"
                />
                <path
                  d={`M${x(1)} 262V${y(1000)}`}
                  stroke={ink}
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />
                <circle cx={x(1)} cy={y(1000)} r="6" fill={blue} />
                <circle cx={x(1)} cy={y(500)} r="5" fill={ink} />
                {t(222, 151, "Mínimo")}
              </>
            )}
          </Scene>
          <div className="aero-legend">
            <span>
              <i className="aero-line total" />D total
            </span>
            <span>
              <i className="aero-line parasite" />
              Dp parásita
            </span>
            <span>
              <i className="aero-line induced" />
              Di inducida
            </span>
          </div>
        </Panel>
        <Panel title="El mínimo de este modelo">
          <dl className="aero-ledger">
            <div>
              <dt>En V₀ · Dp</dt>
              <dd>500 N</dd>
            </div>
            <div>
              <dt>En V₀ · Di</dt>
              <dd>500 N</dd>
            </div>
            <div>
              <dt>En V₀ · total</dt>
              <dd>1 000 N</dd>
            </div>
            <div>
              <dt>En 2V₀ · total</dt>
              <dd>2 125 N</dd>
            </div>
          </dl>
          <Formula>
            Dp = Di en el mínimo
            <br />
            de A V² + B / V²
          </Formula>
          <p className="aero-panel-note">
            Igualdad propia del modelo con A y B constantes positivos; no una ley para toda curva
            real.
          </p>
        </Panel>
      </div>
    </Figure>
  );
}
function Normalization({ drag = false }: { drag?: boolean }) {
  return (
    <Figure
      title={
        drag
          ? "CD y D responden preguntas distintas"
          : "La escala se cancela si la referencia coincide"
      }
      caption="Mismo objeto, misma condición y misma área de referencia para comparar fuerzas y coeficientes. Los coeficientes son adimensionales; L y D se expresan en newtons. No mezclar datos de sección y de aeronave completa."
    >
      <div className="aero-grid">
        <Panel title="Fuerza = escala × coeficiente">
          <Formula>
            L = q S CL
            <br />D = q S CD
          </Formula>
          <div className="aero-factor-list">
            <p>
              <strong>qS · N</strong>Escala de fuerza
            </p>
            <p>
              <strong>CL y CD · sin unidades</strong>Respuesta aerodinámica normalizada
            </p>
          </div>
        </Panel>
        <Panel title={drag ? "Resistencia y potencia" : "Fineza del mismo objeto"}>
          <Formula>
            {drag ? (
              <>
                D · unidad N<br />
                Potencia = D V · unidad W
              </>
            ) : (
              <>
                L / D = (q S CL) / (q S CD)
                <br />L / D = CL / CD
              </>
            )}
          </Formula>
          <p className="aero-panel-note">
            {drag
              ? "Minimizar D y minimizar DV son problemas distintos. Un CD bajo no basta para conocer D sin qS."
              : "Duplicar qS con CL y CD fijos duplica ambas fuerzas; la razón entre ellas se conserva."}
          </p>
        </Panel>
      </div>
    </Figure>
  );
}
function Polar() {
  const points = [
    { name: "A", cl: 0.3, cd: 0.025, ratio: 12 },
    { name: "B", cl: 0.6, cd: 0.04, ratio: 15 },
    { name: "C", cl: 1.2, cd: 0.12, ratio: 10 },
  ];
  const x = (cd: number) => 55 + (cd / 0.13) * 268;
  const y = (cl: number) => 269 - (cl / 1.3) * 221;
  return (
    <Figure
      title="La fineza es una razón, no un extremo aislado"
      caption="Datos didácticos de tres condiciones del mismo avión y la misma convención. B tiene la mayor fineza entre A, B y C. Los tres puntos no prueban un máximo continuo: no se dibuja una curva ni una tangente supuesta."
    >
      <div className="aero-grid">
        <Panel title="Polar · CD horizontal, CL vertical">
          <Scene
            label="Polar con tres puntos y rectas desde el origen. B tiene pendiente CL/CD igual a 15; A igual a 12 y C igual a 10."
            height={330}
          >
            {(id) => (
              <>
                <Arrow id={id} x1={55} y1={269} x2={55} y2={28} tone="aux" />
                <Arrow id={id} x1={55} y1={269} x2={340} y2={269} tone="aux" />
                {t(28, 29, "CL")}
                {t(320, 319, "CD")}
                {[0.3, 0.6, 1.2].map((v) => (
                  <g key={v}>
                    <path d={`M55 ${y(v)}H323`} stroke="#d7dddd" strokeWidth="1" />
                    {t(48, y(v) + 7, String(v).replace(".", ","), "end")}
                  </g>
                ))}
                {[0, 0.04, 0.08, 0.12].map((v) => (
                  <g key={v}>
                    <path d={`M${x(v)} 269v6`} stroke={ink} />
                    {t(x(v), 299, String(v).replace(".", ","))}
                  </g>
                ))}
                {points.map((p, i) => (
                  <g key={p.name}>
                    <path
                      d={`M55 269L${x(p.cd)} ${y(p.cl)}`}
                      fill="none"
                      stroke={i === 1 ? blue : i === 0 ? gold : teal}
                      strokeWidth={i === 1 ? 4 : 2.5}
                      strokeDasharray={i === 1 ? undefined : i === 0 ? "8 5" : "3 5"}
                    />
                    <circle
                      cx={x(p.cd)}
                      cy={y(p.cl)}
                      r="6"
                      fill={i === 1 ? blue : i === 0 ? gold : teal}
                    />
                    {t(x(p.cd) + 13, y(p.cl) - 12, p.name)}
                  </g>
                ))}
              </>
            )}
          </Scene>
        </Panel>
        <Panel title="Compara las tres razones">
          <div className="aero-polar-values">
            {points.map((p) => (
              <div key={p.name} className={p.name === "B" ? "is-best" : ""}>
                <strong>Condición {p.name}</strong>
                <span>CL = {p.cl.toFixed(2).replace(".", ",")}</span>
                <span>CD = {p.cd.toFixed(3).replace(".", ",")}</span>
                <b>CL / CD = {p.ratio}</b>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Figure>
  );
}

/** Stage navs are from the verified native M2/M3 documents; intro also serves diagnostics. */
export function CiaacAerodynamicsVisual({
  module,
  lesson,
  stage,
  nav,
  kind,
}: {
  module: number;
  lesson: number;
  stage: number;
  nav: string;
  kind: string;
}) {
  if (kind === "finish") return null;
  const opening = kind === "intro" || /preflight|diagn[oó]stic/i.test(nav) || stage === 0;
  if (module === 2) {
    if (lesson === 1) {
      if (opening || nav === "Cambiar rapidez o dirección") return <Kinematics />;
      if (nav === "Antes de sumar fuerzas") return <NetForce balanced />;
      if (nav === "Una interacción, dos cuerpos" || nav === "Comprueba las interacciones")
        return <Interaction />;
      if (nav === "El ala también interactúa con el aire") return <Interaction wing />;
      return <NetForce />;
    }
    if (lesson === 2) {
      if (opening) return <Venturi contextOnly />;
      if (nav === "Del conducto al perfil") return <FlowMap pressure />;
      if (
        nav === "Qué presión cambia" ||
        nav === "El balance y sus condiciones" ||
        nav === "Revisa las condiciones"
      )
        return <PressureBudget />;
      return <Venturi />;
    }
    if (lesson === 3) {
      if (nav === "La forma encuentra al flujo" || nav === "Distingue sección y orientación")
        return <Orientation />;
      if (nav === "De las presiones a la fuerza" || nav === "Explica la interacción")
        return <Interaction wing />;
      return <Anatomy />;
    }
  }
  if (module === 3) {
    if (lesson === 1) {
      if (nav === "Origen de cada fuerza") return <FourForces mode="resultant" />;
      if (nav === "Cuándo funcionan los pares" || kind === "quiz")
        return <FourForces mode="compare" />;
      if (nav === "Un planeador también tiene fuerzas") return <FourForces mode="glide" />;
      return <FourForces />;
    }
    if (lesson === 2) {
      if (nav === "Dos maneras compatibles de mirar") return <Interaction wing />;
      if (nav === "El flujo real tiene estructura") return <BoundaryLayer />;
      return (
        <FlowMap pressure={nav === "Frenar, acelerar y recuperar presión" || kind === "quiz"} />
      );
    }
    if (lesson === 3) {
      if (nav === "De la superficie a la fuerza") return <FourForces mode="resultant" />;
      if (nav === "Qué expresa CL") return <CoefficientCurve />;
      return (
        <LiftFactors compare={nav === "Comparar sin cambiar el problema" || kind === "quiz"} />
      );
    }
    if (lesson === 4) {
      if (nav === "Una fuerza, varios mecanismos") return <FourForces mode="resultant" />;
      if (nav === "Resistencia parásita" || kind === "exercise") return <DragTaxonomy />;
      if (nav === "El costo de producir sustentación") return <InducedDrag />;
      if (nav === "CD y operación") return <Normalization drag />;
      return <DragCurve />;
    }
    if (lesson === 5) {
      if (nav === "Normalizar y comparar") return <Normalization />;
      if (nav === "Condiciones que acompañan al número") return <CoefficientCurve />;
      if (nav === "Qué conclusión permite la fineza") return <FourForces mode="glide" />;
      return <Polar />;
    }
  }
  return null;
}
