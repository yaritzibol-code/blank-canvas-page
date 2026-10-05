import { useId, type ReactNode } from "react";
import "./ciaac-aerodynamics-m4-m5.css";

type Props = { module: number; lesson: number; stage: number; nav: string; kind: string };
const gold = "#d7ac60",
  cyan = "#6cc9da",
  ink = "#dbe7ef",
  muted = "#a9bdcb";
function Text({
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
  anchor?: "middle" | "start" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor={anchor}
      fontSize="13"
      fontFamily="system-ui, sans-serif"
    >
      {children}
    </text>
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
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 10 5 0 10Z" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={dashed ? "5 5" : undefined}
        markerEnd={`url(#${id})`}
      />
    </g>
  );
}
function Line({ d, color = ink, dashed = false }: { d: string; color?: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
}
function Panel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="aero45-panel">
      <div className="aero45-panel-title">{title}</div>
      <svg viewBox="0 0 360 240" role="img" aria-label={title}>
        <title>{title}</title>
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
function Group({ children }: { children: ReactNode }) {
  return <div className="aero45-visual">{children}</div>;
}
function CG({ x = 180, y = 120 }: { x?: number; y?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill={gold} />
      <Text x={x + 15} y={y - 12} color={gold}>
        CG
      </Text>
    </g>
  );
}
function TopPlane() {
  return (
    <path
      d="M180 42Q171 44 171 81L72 128V141L171 121V175L140 192V201L180 193L220 201V192L189 175V121L288 141V128L189 81Q189 44 180 42Z"
      fill="#244456"
      stroke={ink}
      strokeWidth="2"
    />
  );
}
function Axes({ tilted = false }: { tilted?: boolean }) {
  return (
    <Group>
      <Panel
        title={tilted ? "Los ejes acompañan al avión" : "Alabeo · eje longitudinal"}
        caption={
          tilted
            ? "Son referencias solidarias a la aeronave; no se mantienen verticales u horizontales respecto de la Tierra."
            : "Vista frontal. El alabeo es un giro alrededor del eje que une nariz y cola."
        }
      >
        <g transform={tilted ? "rotate(-25 180 120)" : undefined}>
          <Line d="M48 126H312M180 73V118" />
          <ellipse cx="180" cy="126" rx="17" ry="20" fill="#244456" stroke={ink} strokeWidth="2" />
          <CG x={180} y={126} />
          <circle cx="180" cy="126" r="30" fill="none" stroke={gold} strokeDasharray="4 4" />
          {tilted && <Line d="M180 44V209" color={gold} dashed />}
          <Arrow d="M120 97A68 68 0 0 1 234 81" />
        </g>
        <Text x={180} y={226}>
          {tilted ? "Referencia ligada al cuerpo" : "Eje visto de frente: ⊙"}
        </Text>
      </Panel>
      <Panel
        title="Cabeceo · eje transversal"
        caption="Vista lateral, nariz a la izquierda. Giro alrededor del eje que atraviesa las alas."
      >
        <path
          d="M47 132Q63 112 136 118L278 127L292 90L307 92L301 145L76 146Z"
          fill="#244456"
          stroke={ink}
          strokeWidth="2"
        />
        <CG x={165} y={131} />
        <Arrow d="M89 174A81 81 0 0 1 103 73" />
        <Text x={174} y={214}>
          Nariz arriba / nariz abajo
        </Text>
      </Panel>
      <Panel
        title="Guiñada · eje vertical del avión"
        caption="Vista superior. Izquierda y derecha se nombran desde la posición del piloto, mirando hacia la nariz."
      >
        <TopPlane />
        <CG />
        <circle cx="180" cy="120" r="15" fill="none" stroke={gold} strokeDasharray="4 4" />
        <Arrow d="M144 58A55 55 0 0 1 220 65" />
        <Text x={73} y={222}>
          Izq. piloto
        </Text>
        <Text x={286} y={222}>
          Der. piloto
        </Text>
      </Panel>
    </Group>
  );
}
function Ailerons() {
  return (
    <Group>
      <Panel
        title="Orden de alabeo a la derecha"
        caption="Vista desde atrás. Las flechas describen cambios relativos de sustentación, no las cargas totales."
      >
        <Line d="M40 125H320" />
        <circle cx="180" cy="125" r="15" fill="#244456" stroke={ink} />
        <path d="M40 125L111 148M249 125L320 102" stroke={gold} strokeWidth="7" />
        <Arrow d="M89 116V55" />
        <Arrow d="M275 53V87" />
        <Text x={86} y={35} color={cyan}>
          ΔL aumenta
        </Text>
        <Text x={275} y={35} color={cyan}>
          ΔL disminuye
        </Text>
        <Text x={88} y={178}>
          Izq.: alerón abajo
        </Text>
        <Text x={271} y={178}>
          Der.: alerón arriba
        </Text>
        <Arrow d="M150 187Q180 164 212 191" color={gold} />
        <Text x={180} y={226}>
          Derecha del piloto →
        </Text>
      </Panel>
      <Panel
        title="Guiñada adversa: efecto distinto"
        caption="Esquema superior de la tendencia inicial: la resistencia adicional del ala izquierda puede desviar la nariz a la izquierda. La coordinación exige timón según la condición."
      >
        <TopPlane />
        <Arrow d="M89 148V198" color={gold} />
        <Text x={65} y={220} color={gold}>
          ΔD mayor
        </Text>
        <Arrow d="M218 64Q180 20 141 64" />
        <Text x={180} y={21}>
          Tendencia de nariz a la izquierda
        </Text>
      </Panel>
    </Group>
  );
}
function Elevator() {
  return (
    <Group>
      <Panel
        title="Elevador: cambio de fuerza en la cola"
        caption="Ejemplo convencional de mando de nariz arriba. Se representa ΔF hacia abajo; no se afirma que la carga absoluta de cola siempre sea descendente."
      >
        <Line d="M42 124H291" />
        <path d="M270 124L318 103" stroke={gold} strokeWidth="7" />
        <CG x={142} y={124} />
        <Arrow d="M293 138V191" />
        <Text x={278} y={215} color={cyan}>
          ΔF de cola ↓
        </Text>
        <Arrow d="M89 166Q50 128 86 88" color={gold} />
        <Text x={93} y={62} color={gold}>
          Nariz arriba
        </Text>
        <Text x={286} y={80}>
          Elevador arriba
        </Text>
      </Panel>
      <Panel
        title="Timón: momento de guiñada"
        caption="Vista superior, ejemplo de guiñada derecha: timón a la derecha y cambio de fuerza lateral de la cola hacia la izquierda."
      >
        <TopPlane />
        <path d="M180 174L197 206" stroke={gold} strokeWidth="6" />
        <Arrow d="M174 188H113" />
        <Text x={73} y={177} color={cyan}>
          ΔF lateral
        </Text>
        <Arrow d="M148 59Q180 28 220 59" color={gold} />
        <Text x={180} y={22}>
          Nariz a la derecha
        </Text>
        <Text x={273} y={224}>
          Timón a la derecha
        </Text>
      </Panel>
    </Group>
  );
}
// Original analytic teaching section, not a named or measured NACA profile.
const sectionPoint = (t: number) => {
  const x = 40 + 280 * t;
  const mean = 139 - 14 * Math.sin(Math.PI * t);
  const halfThickness = 27 * Math.sin(Math.PI * t) ** 0.65 * (1 - 0.65 * t);
  return { x, mean, upper: mean - halfThickness, lower: mean + halfThickness };
};
const sectionSamples = Array.from({ length: 81 }, (_, i) => sectionPoint(i / 80));
const airfoil = `M${sectionSamples.map((p) => `${p.x},${p.upper}`).join("L")}L${[...sectionSamples]
  .reverse()
  .map((p) => `${p.x},${p.lower}`)
  .join("L")}Z`;
const meanLine = `M${sectionSamples.map((p) => `${p.x},${p.mean}`).join("L")}`;
function HighLift() {
  return (
    <Group>
      <Panel
        title="Flap · borde de salida"
        caption="Corte esquemático: la deflexión cambia la geometría. Puede aumentar sustentación y resistencia; su efecto depende de configuración y condición."
      >
        <path
          d="M40 139C49 96 133 94 224 119L225 142C150 157 55 158 40 139Z"
          fill="#244456"
          stroke={ink}
          strokeWidth="2"
        />
        <path d="M232 122L307 166L282 172L228 145Z" fill={gold} />
        <Line d="M232 122L319 139" dashed />
        <Arrow d="M289 121Q316 133 314 157" />
        <Text x={270} y={201} color={gold}>
          Flap desplegado
        </Text>
        <Text x={125} y={56}>
          Ejemplo independiente
        </Text>
      </Panel>
      <Panel
        title="Slat ≠ slot"
        caption="El slat es el elemento delantero; el slot es la abertura de paso. Un slot fijo no es por sí mismo una superficie móvil."
      >
        <path
          d="M82 141C88 104 164 102 240 122L326 145C240 144 148 161 82 141Z"
          fill="#244456"
          stroke={ink}
          strokeWidth="2"
        />
        <path d="M35 138Q27 108 73 102L65 116Q47 120 49 143Z" fill={gold} />
        <Arrow d="M60 166Q62 137 78 119" />
        <Text x={51} y={80} color={gold}>
          Slat
        </Text>
        <Line d="M51 85V104" color={gold} />
        <Text x={113} y={202} color={cyan}>
          Slot: abertura
        </Text>
        <Line d="M106 184L75 141" color={cyan} />
        <Text x={247} y={60}>
          Ala principal
        </Text>
      </Panel>
    </Group>
  );
}
function Spoilers() {
  return (
    <Group>
      <Panel
        title="Spoiler · panel sobre el extradós"
        caption="Corte y vistas traseras independientes. El despliegue simétrico reduce sustentación y aumenta resistencia; el asimétrico puede contribuir al alabeo."
      >
        <path d={airfoil} fill="#244456" stroke={ink} strokeWidth="2" />
        <path d="M188 105L161 60" stroke={gold} strokeWidth="7" />
        <Text x={239} y={57} color={gold}>
          Spoiler
        </Text>
        <Line d="M207 63L174 75" color={gold} />
        <Line d="M40 195H148M208 195H320" />
        <path d="M54 195L62 175M125 195L133 175M292 195L300 175" stroke={gold} strokeWidth="5" />
        <Text x={94} y={222}>
          Simétrico
        </Text>
        <Text x={267} y={222}>
          Asimétrico
        </Text>
      </Panel>
      <Panel
        title="Trim tab · borde del elevador"
        caption="Detalle de cola separado. El tab modifica el momento de bisagra para aliviar el esfuerzo sostenido; no bloquea la actitud."
      >
        <path d="M34 136Q52 115 176 128L177 140L34 141Z" fill="#244456" stroke={ink} />
        <path d="M177 128L266 99L271 110L177 140Z" fill="#38586b" stroke={ink} />
        <path d="M267 101L310 122" stroke={gold} strokeWidth="7" />
        <circle cx="177" cy="134" r="4" fill={cyan} />
        <Text x={96} y={178}>
          Estabilizador
        </Text>
        <Text x={224} y={69}>
          Elevador
        </Text>
        <Text x={298} y={161} color={gold}>
          Tab
        </Text>
      </Panel>
    </Group>
  );
}
function TrimState({ up }: { up: boolean }) {
  return (
    <Panel
      title={up ? "Tab abajo → elevador arriba" : "Tab arriba → elevador abajo"}
      caption={
        up
          ? "Tab convencional: el cambio de fuerza sobre el tab crea un momento alrededor de la bisagra del elevador."
          : "Estado contrario, también convencional. Las deflexiones y fuerzas son esquemáticas; no representan magnitudes reales."
      }
    >
      <Arrow d="M23 53H106" />
      <Text x={174} y={57} color={cyan}>
        Flujo relativo
      </Text>
      <path d="M27 137Q58 115 157 131L157 143L27 143Z" fill="#244456" stroke={ink} />
      <g transform={up ? "rotate(-18 157 137)" : "rotate(18 157 137)"}>
        <path d="M157 131L265 135V141L157 143Z" fill="#38586b" stroke={ink} />
        <path d={up ? "M265 138L305 164" : "M265 138L305 112"} stroke={gold} strokeWidth="6" />
        <circle cx="265" cy="138" r="4" fill={gold} />
        <Arrow d={up ? "M289 148V100" : "M289 126V162"} />
      </g>
      <circle cx="157" cy="137" r="5" fill={cyan} />
      <Arrow d={up ? "M198 164Q219 139 199 112" : "M198 112Q219 139 199 164"} color={gold} />
      <Text x={88} y={183}>
        Estabilizador fijo
      </Text>
      <Text x={143} y={213} color={cyan}>
        Bisagra del elevador
      </Text>
      <Text x={288} y={211} color={gold}>
        Bisagra tab
      </Text>
    </Panel>
  );
}
function Trim() {
  return (
    <>
      <Group>
        <TrimState up />
        <TrimState up={false} />
      </Group>
      <div className="aero45-note">
        <strong>Anti-servo: otro sistema.</strong> Su tab se mueve en el mismo sentido que la
        superficie principal y aumenta el esfuerzo. No aplicar la regla del tab convencional.
      </div>
      <ol className="aero45-process">
        <li>Establecer condición</li>
        <li>Sostener presión</li>
        <li>Ajustar compensación</li>
        <li>Verificar y reajustar</li>
      </ol>
    </>
  );
}
function Geometry({ dimension = false }: { dimension?: boolean }) {
  return (
    <Group>
      <Panel
        title={
          dimension ? "Espesor y combadura: medidas distintas" : "Anatomía de un perfil combado"
        }
        caption={
          dimension
            ? "Convención del dibujo: espesor entre caras, normal a la cuerda; combadura entre línea media y cuerda. Sus máximos no tienen que coincidir."
            : "Sección original esquemática. La cuerda une los bordes; la línea media recorre los puntos medios entre ambas caras."
        }
      >
        <path d={airfoil} fill="#244456" stroke={ink} strokeWidth="2" />
        <Line d="M40 139H320" color={gold} dashed />
        <path d={meanLine} fill="none" stroke={cyan} strokeWidth="2" strokeDasharray="8 3 2 3" />
        {dimension ? (
          <>
            <Line
              d={`M116 ${sectionPoint(76 / 280).upper}V${sectionPoint(76 / 280).lower}M108 ${sectionPoint(76 / 280).upper}H124M108 ${sectionPoint(76 / 280).lower}H124`}
            />
            <Text x={69} y={91}>
              Espesor
            </Text>
            <Line
              d={`M210 ${sectionPoint(170 / 280).mean}V139M205 ${sectionPoint(170 / 280).mean}H215M205 139H215`}
              color={cyan}
            />
            <Text x={236} y={184} color={cyan}>
              Combadura
            </Text>
            <Line d="M234 169L212 138" color={cyan} />
          </>
        ) : (
          <>
            <Text x={136} y={64}>
              Extradós
            </Text>
            <Line d="M136 72V99" />
            <Text x={131} y={198}>
              Intradós
            </Text>
            <Line d="M131 181V154" />
            <Text x={46} y={184}>
              Ataque
            </Text>
            <Line d="M46 168L40 143" />
            <Text x={312} y={91}>
              Salida
            </Text>
            <Line d="M312 98L320 136" />
          </>
        )}
        <Text x={103} y={230} color={gold}>
          – – Cuerda
        </Text>
        <Text x={256} y={230} color={cyan}>
          – · – Línea media
        </Text>
      </Panel>
      {dimension ? (
        <Panel
          title="Ángulo de ataque: cambia la orientación"
          caption="El mismo perfil gira sin deformarse. α se mide entre cuerda y viento relativo; la incidencia se mide respecto de una referencia de la aeronave."
        >
          <g transform="rotate(12 40 139)">
            <path d={airfoil} fill="#244456" stroke={ink} strokeWidth="2" />
            <Line d="M40 139H320" color={gold} dashed />
          </g>
          <Arrow d="M30 191H122" />
          <Text x={94} y={220} color={cyan}>
            Viento relativo
          </Text>
          <Line d="M40 139H329" color={cyan} dashed />
          <path d="M240 139A200 200 0 0 1 236 181" stroke={gold} fill="none" strokeWidth="2" />
          <Text x={262} y={170} color={gold}>
            α
          </Text>
          <Text x={180} y={44}>
            Ejemplo: c = 1,50 m · t = 0,18 m
          </Text>
          <Text x={180} y={67}>
            t/c = 0,12 = 12 %
          </Text>
        </Panel>
      ) : null}
    </Group>
  );
}
function Design() {
  return (
    <>
      <div className="aero45-requirements">
        <span>Baja velocidad · margen de sustentación</span>
        <span>Crucero · resistencia</span>
        <span>Estructura · espesor disponible</span>
      </div>
      <Group>
        <Panel
          title="Curvas de sustentación: Cₗ frente a α"
          caption="Ilustración conceptual, no datos de perfiles reales. La curva permite estudiar pendiente, sustentación a α = 0 y comportamiento próximo a la pérdida."
        >
          <Arrow d="M49 194V35" color={ink} />
          <Arrow d="M49 194H322" color={ink} />
          <Text x={27} y={40}>
            Cₗ
          </Text>
          <Text x={322} y={217}>
            α
          </Text>
          <path
            d="M69 177Q133 134 212 62Q247 36 281 78"
            stroke={gold}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M69 192Q137 149 211 88Q248 72 285 118"
            stroke={cyan}
            strokeWidth="3"
            fill="none"
          />
          <Text x={304} y={78} color={gold}>
            A
          </Text>
          <Text x={305} y={122} color={cyan}>
            B
          </Text>
        </Panel>
        <Panel
          title="Polar: comparar al mismo Cₗ"
          caption="La línea común fija la sustentación de comparación. Los puntos señalan diferentes resistencias, sin convertir el ejemplo en una clasificación universal."
        >
          <Arrow d="M50 194V35" color={ink} />
          <Arrow d="M50 194H323" color={ink} />
          <Text x={27} y={40}>
            Cₗ
          </Text>
          <Text x={319} y={216}>
            Cᴅ
          </Text>
          <path d="M149 188Q93 117 231 44" stroke={gold} strokeWidth="3" fill="none" />
          <path d="M177 188Q127 117 268 44" stroke={cyan} strokeWidth="3" fill="none" />
          <Line d="M50 103H310" color={muted} dashed />
          <circle cx="151" cy="103" r="5" fill={gold} />
          <circle cx="185" cy="103" r="5" fill={cyan} />
          <Text x={286} y={95}>
            Mismo Cₗ
          </Text>
          <Text x={234} y={36} color={gold}>
            A
          </Text>
          <Text x={275} y={36} color={cyan}>
            B
          </Text>
        </Panel>
      </Group>
      <div className="aero45-note">
        Comparación válida: mantener Reynolds, Mach, estado superficial y configuración. No hay
        cifras de desempeño ni escala numérica en estas curvas.
      </div>
    </>
  );
}
const families = [
  {
    name: "Simétrico",
    d: "M35 120Q100 75 325 120Q100 165 35 120Z",
    note: "Línea media sobre la cuerda. Puede producir sustentación con ángulo de ataque.",
  },
  {
    name: "Combado",
    d: "M35 120Q95 61 325 120Q132 119 35 120Z",
    note: "Línea media curvada. La silueta no determina por sí sola su desempeño.",
  },
  {
    name: "Orientado a flujo laminar",
    d: "M35 120C62 91 163 70 325 120C165 157 59 145 35 120Z",
    note: "Objetivo de diseño, no garantía de flujo laminar en toda condición.",
  },
  {
    name: "Arco circular",
    d: "M35 120Q180 67 325 120Q180 173 35 120Z",
    note: "Ejemplo de sección delgada de bordes agudos para estudiar alta velocidad.",
  },
  {
    name: "Doble cuña",
    d: "M35 120L180 96L325 120L180 144Z",
    note: "Caras rectas y vértices. Ejemplo conceptual, no asignación a una aeronave.",
  },
];
function FamilyAtlas({ subset }: { subset: number[] }) {
  return (
    <Group>
      {subset.map((i) => (
        <Panel key={i} title={families[i].name} caption={families[i].note}>
          <path d={families[i].d} fill="#244456" stroke={ink} strokeWidth="2" />
          <Line d="M35 120H325" color={gold} dashed />
          <Line d="M35 178H325M35 171V185M325 171V185" color={muted} />
          <Text x={180} y={204}>
            Misma cuerda de comparación
          </Text>
          <Text x={180} y={42}>
            Ejemplo esquemático de familia
          </Text>
        </Panel>
      ))}
    </Group>
  );
}
function Laminar() {
  return (
    <>
      <FamilyAtlas subset={[2]} />
      <Group>
        <Panel
          title="Capa límite: estados del flujo"
          caption="La transición depende de la condición. Las divisiones son ilustrativas y no indican una posición de transición garantizada."
        >
          <Line d="M28 175H331" />
          <path d="M28 164Q180 147 331 92" stroke={gold} strokeWidth="2" fill="none" />
          <path d="M40 169H115M40 161H115" stroke={cyan} strokeWidth="2" />
          <path
            d="M130 156q15 -12 25 0t25 0M193 147q10 -22 19 -4t20 -7t20 -7t20 -5t20 -14"
            stroke={cyan}
            strokeWidth="2"
            fill="none"
          />
          <Text x={75} y={208}>
            Laminar
          </Text>
          <Text x={164} y={227}>
            Transición
          </Text>
          <Text x={270} y={208}>
            Turbulenta
          </Text>
          <Arrow d="M33 61H121" />
          <Text x={229} y={65}>
            Flujo exterior
          </Text>
        </Panel>
        <Panel
          title="La superficie también cuenta"
          caption="Rugosidad y contaminación pueden anticipar la transición y cambiar la resistencia. El contorno solo no acredita el estado real de la capa límite."
        >
          <Line d="M40 92H316" />
          <Text x={180} y={61}>
            Superficie limpia / lisa
          </Text>
          <path
            d="M40 173H108l5 -7l6 7H188l4 -9l6 9H250l5 -6l5 6H316"
            stroke={ink}
            strokeWidth="2"
            fill="none"
          />
          <Text x={180} y={145}>
            Rugosidad / contaminación
          </Text>
          <Text x={180} y={219} color={gold}>
            Sin punto de transición numérico
          </Text>
        </Panel>
      </Group>
    </>
  );
}
function Evidence() {
  return (
    <div className="aero45-evidence">
      <div>
        <strong>Observable en la geometría</strong>
        <p>Simetría · combadura · espesor · bordes · caras curvas o rectas</p>
      </div>
      <div>
        <strong>Necesita datos</strong>
        <p>Cₗ máximo · resistencia · pérdida · transición · efecto de Reynolds y Mach</p>
      </div>
    </div>
  );
}
function Diagnostic({ module, lesson }: { module: number; lesson: number }) {
  if (module === 4 && lesson === 1)
    return (
      <Group>
        <Panel
          title="Observa la orientación de las semialas"
          caption="Vista desde atrás en dos instantes. Identifica el movimiento descrito antes de revisar la explicación."
        >
          <g transform="translate(-85 0)">
            <Line d="M119 99H241" />
            <circle cx="180" cy="99" r="9" fill="#244456" stroke={ink} />
          </g>
          <g transform="translate(85 0) rotate(22 180 99)">
            <Line d="M119 99H241" />
            <circle cx="180" cy="99" r="9" fill="#244456" stroke={ink} />
          </g>
          <Text x={95} y={156}>
            Instante A
          </Text>
          <Text x={265} y={156}>
            Instante B
          </Text>
          <Text x={180} y={206}>
            Un ala asciende y la otra desciende
          </Text>
        </Panel>
      </Group>
    );
  if (module === 4)
    return (
      <Group>
        <Panel
          title="Localiza los mandos de las alas"
          caption="Vista superior. Se destacan los alerones sin representar su deflexión; decide qué movimiento corresponde a la orden."
        >
          <TopPlane />
          <path d="M74 136L126 127M234 127L286 136" stroke={gold} strokeWidth="7" />
          <Text x={63} y={175} color={gold}>
            Alerón izq.
          </Text>
          <Text x={296} y={175} color={gold}>
            Alerón der.
          </Text>
          <Text x={180} y={229}>
            Izquierda / derecha del piloto
          </Text>
        </Panel>
      </Group>
    );
  return (
    <Group>
      <Panel
        title="Perfil simétrico orientado al flujo"
        caption="Geometría y orientación de la pregunta, sin dibujar fuerzas. La respuesta requiere relacionar ambas con el comportamiento aerodinámico."
      >
        <g transform="rotate(10 35 120)">
          <path d={families[0].d} fill="#244456" stroke={ink} strokeWidth="2" />
          <Line d="M35 120H325" color={gold} dashed />
        </g>
        <Line d="M35 120H329" color={muted} dashed />
        <Arrow d="M35 188H129" />
        <Text x={239} y={192} color={cyan}>
          Viento relativo
        </Text>
        <Text x={180} y={54}>
          Ángulo de ataque positivo
        </Text>
      </Panel>
    </Group>
  );
}
/** Deliberately limited to explanatory stages; exercises remain uncluttered. */
export function CiaacAerodynamicsModulesFourFiveVisual({ module, lesson, stage, kind }: Props) {
  if (
    kind === "quiz" &&
    stage === 1 &&
    ((module === 4 && (lesson === 1 || lesson === 2)) || (module === 5 && lesson === 3))
  )
    return <Diagnostic module={module} lesson={lesson} />;
  if (kind !== "content") return null;
  if (module === 4) {
    if (lesson === 1 && stage === 2) return <Axes />;
    if (lesson === 1 && stage === 4) return <Axes tilted />;
    if (lesson === 2 && stage === 3) return <Ailerons />;
    if (lesson === 2 && stage === 4) return <Elevator />;
    if (lesson === 3 && stage === 3) return <HighLift />;
    if (lesson === 3 && stage === 4) return <Spoilers />;
    if (lesson === 4 && stage === 2) return <Trim />;
  }
  if (module === 5) {
    if (lesson === 1 && stage === 1) return <Geometry />;
    if (lesson === 1 && stage === 2) return <Geometry dimension />;
    if (lesson === 2 && stage === 3) return <Design />;
    if (lesson === 3 && stage === 2) return <FamilyAtlas subset={[0, 1]} />;
    if (lesson === 3 && stage === 3) return <Laminar />;
    if (lesson === 3 && stage === 4)
      return (
        <>
          <FamilyAtlas subset={[3, 4]} />
          <Evidence />
        </>
      );
  }
  return null;
}
