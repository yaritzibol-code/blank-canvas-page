import { useId, type ReactNode } from "react";
import "./ciaac-aerodynamics-m6-m7.css";

type Props = { module: number; lesson: number; stage: number; nav: string; kind: string };
const gold = "#d7ac60",
  cyan = "#6cc9da",
  ink = "#e1ebf2",
  muted = "#a9bdcb",
  navy = "#112d40";
function T({
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
      fontSize="17"
      fontFamily="system-ui, sans-serif"
    >
      {children}
    </text>
  );
}
function L({ d, color = muted, dash = false }: { d: string; color?: string; dash?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dash ? "5 5" : undefined}
    />
  );
}
function A({ d, color = cyan }: { d: string; color?: string }) {
  const id = `a67-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
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
          orient="auto"
        >
          <path d="M0 0 10 5 0 10Z" fill={color} />
        </marker>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" markerEnd={`url(#${id})`} />
    </g>
  );
}
function F({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  const id = `f67-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <figure className="aero67-figure">
      <div className="aero67-title">{title}</div>
      <div
        className="aero67-canvas"
        tabIndex={0}
        aria-label="Diagrama; desplaza horizontalmente si es necesario"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 360 260"
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-desc`}>{caption}</desc>
          <rect width="360" height="260" rx="12" fill={navy} />
          {children}
        </svg>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
function Group({ children }: { children: ReactNode }) {
  return <div className="aero67-grid">{children}</div>;
}
function Profile({
  mode = "clean",
  labels = true,
}: {
  labels?: boolean;
  mode?:
    | "clean"
    | "plain"
    | "split"
    | "slotted"
    | "fowler"
    | "slat"
    | "slot"
    | "krueger"
    | "cuff"
    | "spoiler";
}) {
  const rear = ["plain", "slotted", "fowler"].includes(mode);
  return (
    <g>
      <path
        d={
          rear
            ? "M45 126 Q87 75 190 109 L235 124 Q128 132 45 126Z"
            : "M45 126 Q91 68 220 110 L315 129 Q149 138 45 126Z"
        }
        fill="#274b60"
        stroke={ink}
        strokeWidth="2"
      />
      {mode === "plain" && (
        <path
          d="M235 124 Q251 125 272 145 L299 164 Q270 156 248 140Z"
          fill={gold}
          stroke={gold}
          strokeWidth="2"
        />
      )}
      {mode === "split" && (
        <>
          <L d="M227 132L283 167" color={gold} />
          <circle cx="227" cy="132" r="4" fill={gold} />
        </>
      )}
      {(mode === "fowler" || mode === "slotted") && (
        <>
          <path
            d={
              mode === "fowler"
                ? "M260 140 Q276 139 291 155 L329 183 Q288 168 260 140Z"
                : "M245 138 Q264 136 279 150 L313 174 Q274 161 245 138Z"
            }
            fill={gold}
            stroke={gold}
          />
          <L d="M237 127L309 134" dash />
          {mode === "fowler" ? (
            <A d="M240 196H288" color={gold} />
          ) : (
            <A d="M214 159Q237 154 239 131Q252 123 272 133" />
          )}
        </>
      )}
      {(mode === "slat" || mode === "slot") && (
        <>
          <path d="M20 127Q24 80 69 83Q45 96 39 117Z" fill={gold} stroke={gold} />
          <A d="M20 153Q42 147 45 123Q46 108 62 103" />
          <T x={111} y={65} color={gold}>
            {mode === "slat" ? "Slat: superficie móvil" : "Slot: abertura"}
          </T>
          <L d={mode === "slat" ? "M84 73L34 97" : "M91 73L45 111"} color={gold} />
        </>
      )}
      {mode === "krueger" && (
        <>
          <path d="M65 130L20 146Q18 118 30 100L65 130Z" fill={gold} />
          <circle cx="65" cy="130" r="4" fill={cyan} />
          <A d="M106 161Q57 191 28 158" color={gold} />
        </>
      )}
      {mode === "cuff" && (
        <path d="M71 91Q17 102 31 141L70 134Q43 122 71 91Z" fill={gold} stroke={gold} />
      )}
      {mode === "spoiler" && (
        <>
          <path d="M163 107L136 65" stroke={gold} strokeWidth="7" />
          <L d="M139 54Q174 51 190 70T232 74T279 89T329 87" color={cyan} />
          <L d="M174 88Q195 79 211 96T250 99T294 114" color={cyan} />
        </>
      )}
      {labels && (
        <>
          <T x={65} y={221}>
            Ataque
          </T>
          <T x={285} y={221}>
            Salida
          </T>
        </>
      )}
    </g>
  );
}
function Plane() {
  return (
    <path
      d="M180 35Q166 39 167 100L55 142L55 157L169 137L171 204L131 225L132 233L180 220L228 233L229 225L189 204L191 137L305 157L305 142L193 100Q194 39 180 35Z"
      fill="#274b60"
      stroke={muted}
      strokeWidth="2"
    />
  );
}
function Flaps({ nav }: { nav: string }) {
  if (nav === "Un ala adaptable")
    return (
      <Group>
        <F
          title="Superficies del borde de salida"
          caption="Vista superior de una disposición habitual: flaps interiores y alerones exteriores. La distribución real depende del diseño."
        >
          <Plane />
          <path d="M112 145L164 136M196 136L248 145" stroke={gold} strokeWidth="8" />
          <path d="M59 154L101 147M259 147L301 154" stroke={cyan} strokeWidth="8" />
          <T x={180} y={80} color={gold}>
            Flaps interiores
          </T>
          <L d="M148 87L140 137" color={gold} />
          <T x={180} y={183} color={cyan}>
            Alerones exteriores
          </T>
          <L d="M98 178L80 154" color={cyan} />
        </F>
      </Group>
    );
  if (nav === "Sustentación y velocidad")
    return (
      <Group>
        <F
          title="Más capacidad de sustentación"
          caption="Curvas conceptuales C_L–α. El aumento de C_Lmáx no fija universalmente el cambio del ángulo crítico. En vuelo recto nivelado estabilizado, L ≈ W con cualquiera de las configuraciones."
        >
          <A d="M50 202V35" />
          <A d="M50 202H324" />
          <T x={28} y={35}>
            C_L
          </T>
          <T x={329} y={227}>
            α
          </T>
          <path
            d="M57 184Q146 126 223 87Q244 78 266 107"
            fill="none"
            stroke={cyan}
            strokeWidth="3"
          />
          <path d="M57 152Q137 73 215 53Q241 46 275 82" fill="none" stroke={gold} strokeWidth="3" />
          <circle cx="233" cy="85" r="4" fill={cyan} />
          <circle cx="228" cy="52" r="4" fill={gold} />
          <T x={128} y={62} color={gold}>
            Con flap · máximo
          </T>
          <T x={163} y={146} color={cyan}>
            Limpia · máximo
          </T>
          <T x={181} y={247}>
            Capacidad ≠ fuerza actual: L ≈ W
          </T>
        </F>
      </Group>
    );
  if (nav === "Simple y dividido")
    return (
      <Group>
        <F
          title="Flap simple"
          caption="La porción posterior completa del perfil gira alrededor de una bisagra; aumenta la combadura."
        >
          <Profile mode="plain" />
          <circle cx="235" cy="124" r="4" fill={cyan} />
          <T x={180} y={43}>
            Gira el borde de salida completo
          </T>
        </F>
        <F
          title="Flap dividido"
          caption="Desciende un panel del intradós. La superficie superior conserva su contorno; no se mueve todo el borde de salida."
        >
          <Profile mode="split" />
          <T x={180} y={43}>
            Gira el panel inferior
          </T>
        </F>
      </Group>
    );
  if (nav === "Ranurado y Fowler")
    return (
      <Group>
        <F
          title="Flap ranurado"
          caption="La abertura comunica intradós con extradós del flap. El recorrido de aire evita atravesar el material sólido; esquema, no escala de eficacia."
        >
          <Profile mode="slotted" />
        </F>
        <F
          title="Flap Fowler"
          caption="El elemento se desplaza hacia atrás y se deflecta; aumenta el área proyectada. La línea discontinua indica la posición retraída, no un conducto de aire."
        >
          <Profile mode="fowler" />
          <T x={170} y={48}>
            Traslación + deflexión
          </T>
        </F>
      </Group>
    );
  return null;
}
function UseFlaps({ nav }: { nav: string }) {
  if (nav === "Dos necesidades")
    return (
      <Group>
        <F
          title="Carrera y distancia total"
          caption="La carrera terrestre y el tramo hasta el obstáculo son partes distintas. Trayectorias conceptuales: una menor velocidad de despegue no garantiza un mejor ángulo de ascenso."
        >
          <L d="M28 194H330" />
          <path d="M285 193V114H302V193" fill="#526070" />
          <A d="M40 179H150" color={gold} />
          <L d="M150 179Q208 149 287 87" color={gold} />
          <L d="M175 179Q237 133 287 58" color={cyan} />
          <T x={98} y={221}>
            Carrera terrestre
          </T>
          <T x={231} y={41}>
            Tramo en el aire
          </T>
          <T x={180} y={246}>
            Distancia total hasta el obstáculo
          </T>
        </F>
      </Group>
    );
  if (nav === "Después del despegue")
    return (
      <Group>
        <F
          title="La configuración cambia primero"
          caption="En el instante inicial de retracción, la velocidad todavía puede ser la misma y la sustentación puede reducirse. El resultado depende de la transición; no representa una caída garantizada ni una secuencia operativa."
        >
          <T x={180} y={40}>
            Misma V inicial · geometría distinta
          </T>
          <g transform="translate(0 5) scale(.52)">
            <Profile mode="plain" labels={false} />
          </g>
          <g transform="translate(172 5) scale(.52)">
            <Profile labels={false} />
          </g>
          <A d="M153 96H201" color={gold} />
          <T x={93} y={158}>
            Configurado
          </T>
          <T x={265} y={158}>
            Retracción
          </T>
          <T x={180} y={199}>
            C_L puede disminuir
          </T>
          <T x={180} y={228}>
            Transición según AFM/POH
          </T>
        </F>
      </Group>
    );
  if (nav === "Aproximación y aterrizaje")
    return (
      <Group>
        <F
          title="Energía cinética a masa constante"
          caption="E = ½mV²: al pasar de V a 0,9V, la energía pasa de 100 % a 81 %. Este cálculo no equivale a una reducción igual de la distancia de frenado."
        >
          <T x={180} y={40}>
            Energía ∝ velocidad²
          </T>
          <rect x="75" y="70" width="72" height="130" rx="4" fill={cyan} />
          <rect x="213" y="94.7" width="72" height="105.3" rx="4" fill={gold} />
          <T x={111} y={62}>
            100 %
          </T>
          <T x={249} y={83}>
            81 %
          </T>
          <T x={111} y={225}>
            V
          </T>
          <T x={249} y={225}>
            0,9 V
          </T>
        </F>
      </Group>
    );
  return null;
}
function Leading({ nav }: { nav: string }) {
  if (nav === "Slot y slat")
    return (
      <Group>
        <F
          title="Slot: una abertura"
          caption="Slot designa la ranura. Aquí se representa una abertura fija entre elementos, no el nombre de una pieza móvil."
        >
          <Profile mode="slot" />
        </F>
        <F
          title="Slat: una superficie"
          caption="El slat es el elemento sólido móvil delantero; cuando se separa del ala abre una ranura. Slat y slot no son sinónimos."
        >
          <Profile mode="slat" />
        </F>
      </Group>
    );
  if (nav === "Cambiar la forma")
    return (
      <Group>
        <F
          title="Panel Krueger"
          caption="Ejemplo geométrico: el panel pivota desde el intradós y forma un nuevo borde delantero. No se desliza hacia adelante como un slat."
        >
          <Profile mode="krueger" />
        </F>
        <F
          title="Cuff de borde de ataque"
          caption="Modificación fija del contorno delantero. La geometría y sus efectos dependen del diseño; no es un mecanismo retráctil."
        >
          <Profile mode="cuff" />
        </F>
      </Group>
    );
  if (nav === "Cómo ayudan las ranuras")
    return (
      <Group>
        <F
          title="Retrasar la separación"
          caption="Comparación conceptual de un dispositivo ranurado que aumenta C_Lmáx y retrasa el ángulo de separación. El flujo adherido no implica que la capa límite sea laminar."
        >
          <A d="M50 207V37" />
          <A d="M50 207H326" />
          <T x={25} y={34}>
            C_L
          </T>
          <T x={327} y={232}>
            α
          </T>
          <path
            d="M55 190Q120 153 167 102Q187 89 216 131"
            fill="none"
            stroke={cyan}
            strokeWidth="3"
          />
          <path
            d="M55 188Q164 127 246 59Q268 49 297 97"
            fill="none"
            stroke={gold}
            strokeWidth="3"
          />
          <T x={111} y={83} color={cyan}>
            Sin ranura
          </T>
          <T x={231} y={35} color={gold}>
            Con ranura
          </T>
          <T x={180} y={247}>
            Caso conceptual · no todos los dispositivos
          </T>
        </F>
      </Group>
    );
  return null;
}
function Spoilers({ nav }: { nav: string }) {
  if (nav === "Alterar el extradós")
    return (
      <Group>
        <F
          title="Spoiler abierto"
          caption="Al elevarse el panel altera el flujo del extradós. A condiciones inicialmente iguales, disminuye la sustentación y aumenta la resistencia; la sustentación total no desaparece."
        >
          <Profile mode="spoiler" />
          <T x={180} y={37}>
            Separación detrás del panel
          </T>
          <T x={180} y={191}>
            L disminuye · D aumenta
          </T>
        </F>
      </Group>
    );
  if (nav === "Ayudar al alabeo")
    return (
      <Group>
        <F
          title="Alabeo diferencial · vista desde atrás"
          caption="La derecha del avión está a la derecha del dibujo. Un spoiler derecho reduce la sustentación de esa semiala; el momento tiende a bajar el ala derecha."
        >
          <L d="M50 135H310" color={ink} />
          <ellipse cx="180" cy="135" rx="18" ry="24" fill="#274b60" stroke={ink} />
          <L d="M180 112V71" color={ink} />
          <path d="M236 134L226 103" stroke={gold} strokeWidth="7" />
          <A d="M86 135V63" />
          <A d="M276 135V99" />
          <A d="M228 73Q294 102 282 173" color={gold} />
          <T x={85} y={45}>
            L izquierda
          </T>
          <T x={275} y={77}>
            L menor
          </T>
          <T x={275} y={218} color={gold}>
            Derecha del avión ↓
          </T>
        </F>
      </Group>
    );
  if (nav === "Cargar las ruedas")
    return (
      <Group>
        {[4000, 1000].map((lift) => (
          <F
            key={lift}
            title={lift === 4000 ? "Antes de la descarga" : "Con menor sustentación"}
            caption={`Balance vertical en pista: W = 10 000 N, L = ${lift.toLocaleString("es")} N, N = ${(10000 - lift).toLocaleString("es")} N. La escala de fuerzas es común en ambos paneles; N es la reacción del suelo.`}
          >
            <L d="M30 154H330" />
            <rect x="112" y="127" width="136" height="15" rx="6" fill="#274b60" stroke={ink} />
            <circle cx="132" cy="148" r="6" fill={muted} />
            <circle cx="228" cy="148" r="6" fill={muted} />
            <A d="M180 136V236" color={gold} />
            <A d={`M120 127V${127 - lift / 100}`} />
            <A d={`M240 154V${154 - (10000 - lift) / 100}`} />
            <T x={82} y={40}>
              L: {lift.toLocaleString("es")} N
            </T>
            <T x={262} y={40}>
              N: {(10000 - lift).toLocaleString("es")} N
            </T>
            <T x={264} y={224} color={gold}>
              W: 10 000 N
            </T>
          </F>
        ))}
      </Group>
    );
  return null;
}
function Ball({ trend }: { trend: "stable" | "neutral" | "unstable" }) {
  const stable = trend === "stable",
    neutral = trend === "neutral";
  return (
    <F
      title={stable ? "Estática positiva" : neutral ? "Estática neutra" : "Estática negativa"}
      caption={
        stable
          ? "Esfera desplazada y soltada desde reposo: la fuerza tangencial inicial apunta hacia el fondo de referencia."
          : neutral
            ? "Soltada desde reposo sobre el plano, no existe una fuerza tangencial restauradora. Con velocidad inicial, la historia sería diferente."
            : "Esfera desplazada y soltada desde reposo: la fuerza tangencial inicial la aleja de la cima de referencia."
      }
    >
      <L
        d={stable ? "M55 74Q180 258 305 74" : neutral ? "M50 158H310" : "M55 205Q180 28 305 205"}
        color={ink}
      />
      <circle
        cx="180"
        cy={stable ? 154 : neutral ? 145 : 103}
        r="11"
        fill="none"
        stroke={muted}
        strokeDasharray="4 3"
      />
      <circle cx="229" cy={stable ? 140 : neutral ? 145 : 119} r="12" fill={gold} />
      {!neutral && <A d={stable ? "M239 145L210 163" : "M243 130L272 151"} />}
      <T x={180} y={38}>
        Referencia → desplazamiento
      </T>
      <T x={180} y={238}>
        {neutral
          ? "Fuerza tangencial = 0"
          : stable
            ? "Tendencia hacia la referencia"
            : "Tendencia a alejarse"}
      </T>
    </F>
  );
}
function Equilibrium({ nav }: { nav: string }) {
  if (nav === "El estado de equilibrio")
    return (
      <Group>
        <F
          title="Recta: velocidad constante"
          caption="En el marco terrestre considerado inercial, un vuelo rectilíneo uniforme tiene fuerza neta nula. Las flechas de velocidad conservan dirección y módulo."
        >
          <L d="M40 125H320" dash />
          <A d="M62 125H112" />
          <A d="M157 125H207" />
          <A d="M250 125H300" />
          <T x={180} y={65}>
            v constante
          </T>
          <T x={180} y={207}>
            ΣF = 0
          </T>
        </F>
        <F
          title="Curva: cambia la dirección"
          caption="En un viraje de rapidez constante, la velocidad cambia de dirección. La fuerza neta apunta hacia el centro; no se añade una fuerza centrífuga en este marco."
        >
          <circle cx="180" cy="134" r="69" fill="none" stroke={muted} strokeWidth="2" />
          <A d="M180 65H230" />
          <A d="M249 134V184" />
          <A d="M180 203H130" />
          <A d="M243 134H183" color={gold} />
          <circle cx="180" cy="134" r="4" fill={gold} />
          <T x={180} y={34}>
            Rapidez constante
          </T>
          <T x={180} y={243} color={gold}>
            Fuerza neta hacia el centro
          </T>
        </F>
      </Group>
    );
  if (nav === "La respuesta a una perturbación")
    return (
      <Group>
        <Ball trend="stable" />
        <Ball trend="unstable" />
      </Group>
    );
  if (nav === "Responder a los mandos")
    return (
      <Group>
        <F
          title="Momentos que compiten"
          caption="El mando puede producir un momento que se opone al restaurador. Es un compromiso de autoridad y respuesta; no exige que toda aeronave maniobrable sea inestable."
        >
          <L d="M65 132H290" color={ink} />
          <circle cx="180" cy="132" r="6" fill={gold} />
          <A d="M106 99Q180 18 255 99" />
          <A d="M106 168Q180 244 255 168" color={gold} />
          <T x={180} y={35} color={cyan}>
            Momento de control
          </T>
          <T x={180} y={238} color={gold}>
            Momento restaurador
          </T>
        </F>
      </Group>
    );
  return null;
}
function wave(mode: "decay" | "constant" | "grow" | "return", phase = 0) {
  return Array.from({ length: 161 }, (_, i) => {
    const t = i / 160;
    const amplitude =
      mode === "decay" ? 55 * Math.exp(-2.6 * t) : mode === "grow" ? 17 * Math.exp(1.25 * t) : 40;
    const y =
      mode === "return"
        ? 138 - 65 * Math.exp(-4 * t)
        : 138 - amplitude * Math.cos(t * Math.PI * 6 + phase);
    return `${i ? "L" : "M"}${(52 + 270 * t).toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}
function Plot({
  mode,
  coupled = false,
}: {
  mode: "decay" | "constant" | "grow" | "return";
  coupled?: boolean;
}) {
  const label = {
    decay: "Oscilación amortiguada",
    constant: "Oscilación constante",
    grow: "Oscilación creciente",
    return: "Retorno no oscilatorio",
  }[mode];
  return (
    <F
      title={coupled ? "Alabeo y guiñada desfasados" : label}
      caption={
        coupled
          ? "Señales conceptuales de alabeo y guiñada con igual periodo y desfase. La amplitud disminuye en este ejemplo; no define la respuesta de todos los aviones."
          : `${label}: desviación respecto al equilibrio frente al tiempo. La tendencia inicial de fuerzas y momentos, por sí sola, no describe toda esta historia temporal.`
      }
    >
      <A d="M51 215V42" />
      <A d="M51 215H329" />
      <L d="M51 138H322" dash />
      <T x={130} y={28}>
        Desviación
      </T>
      <T x={290} y={244}>
        Tiempo
      </T>
      <path d={wave(mode)} fill="none" stroke={gold} strokeWidth="3" />
      {coupled && (
        <>
          <path
            d={wave(mode, Math.PI / 2)}
            fill="none"
            stroke={cyan}
            strokeWidth="3"
            strokeDasharray="7 3"
          />
          <T x={119} y={72} color={gold}>
            Alabeo
          </T>
          <T x={265} y={72} color={cyan}>
            Guiñada - -
          </T>
        </>
      )}
    </F>
  );
}
function StaticDynamic({ nav }: { nav: string }) {
  if (nav === "Tres tendencias estáticas")
    return (
      <Group>
        <Ball trend="stable" />
        <Ball trend="neutral" />
        <Ball trend="unstable" />
      </Group>
    );
  if (nav === "La historia temporal")
    return (
      <Group>
        <Plot mode="decay" />
        <Plot mode="constant" />
        <Plot mode="grow" />
        <Plot mode="return" />
      </Group>
    );
  if (nav === "Definir la prueba")
    return (
      <Group>
        <F
          title="Momento ≠ movimiento instantáneo"
          caption="Después de aumentar α, puede aparecer un momento restaurador mientras la velocidad angular todavía aleja al avión de la referencia. α es el ángulo respecto al viento relativo, no la actitud respecto al horizonte."
        >
          <g transform="rotate(12 180 126)">
            <Profile labels={false} />
          </g>
          <A d="M63 185H147" />
          <T x={95} y={245} color={cyan}>
            Viento relativo
          </T>
          <A d="M294 88Q275 35 223 32" color={gold} />
          <A d="M215 60Q278 60 294 111" />
          <T x={137} y={31} color={cyan}>
            Velocidad angular
          </T>
          <T x={194} y={218} color={gold}>
            Momento restaurador
          </T>
        </F>
      </Group>
    );
  return null;
}
function Axes({ nav }: { nav: string }) {
  if (nav === "Tres ejes del cuerpo")
    return (
      <Group>
        <F
          title="Ejes de cuerpo · vista oblicua"
          caption="X apunta hacia la nariz, Y hacia el ala derecha y Z hacia abajo del avión. Cabeceo alrededor de Y, alabeo alrededor de X y guiñada alrededor de Z; estos ejes se mueven con la aeronave."
        >
          <g transform="translate(0 8) skewX(-14) scale(1 .85)">
            <Plane />
          </g>
          <circle cx="145" cy="119" r="5" fill={gold} />
          <A d="M145 119L169 33" color={gold} />
          <A d="M145 119L307 151" />
          <A d="M145 119L148 214" color={ink} />
          <T x={197} y={38} color={gold}>
            X · nariz
          </T>
          <T x={280} y={180} color={cyan}>
            Y · derecha
          </T>
          <T x={177} y={241}>
            Z · abajo
          </T>
        </F>
      </Group>
    );
  if (nav === "Lateral")
    return (
      <Group>
        <F
          title="Diedro con resbalamiento · vista frontal"
          caption="Vista de frente: la derecha del avión está a la izquierda del dibujo. Aire desde la derecha del avión puede aumentar el α efectivo derecho; el momento resultante tiende a elevar esa ala. No se deduce solo del ángulo de banco."
        >
          <L d="M48 105L180 146L312 105" color={ink} />
          <ellipse cx="180" cy="140" rx="17" ry="24" fill="#274b60" stroke={ink} />
          <A d="M34 193H122" />
          <A d="M86 123V60" color={gold} />
          <T x={95} y={42} color={gold}>
            Ala derecha ↑
          </T>
          <T x={95} y={224} color={cyan}>
            Aire desde la derecha
          </T>
        </F>
      </Group>
    );
  if (nav === "Direccional")
    return (
      <Group>
        <F
          title="La deriva actúa detrás del CG"
          caption="Vista superior. Una fuerza lateral hacia la izquierda en la cola produce guiñada de nariz a la derecha, reduciendo el desalineamiento con aire que llega desde delante y la derecha. Es alineación relativa al aire, no recuperación de un rumbo geográfico."
        >
          <Plane />
          <circle cx="180" cy="130" r="5" fill={gold} />
          <T x={210} y={125} color={gold}>
            CG
          </T>
          <A d="M282 40L228 87" />
          <A d="M180 211H118" color={gold} />
          <A d="M153 49Q185 18 216 49" color={gold} />
          <T x={274} y={28} color={cyan}>
            Aire relativo
          </T>
          <T x={89} y={241} color={gold}>
            Fuerza en la cola
          </T>
        </F>
      </Group>
    );
  return null;
}
function Centers({ nav }: { nav: string }) {
  if (nav === "Tres referencias")
    return (
      <Group>
        <F
          title="CG: distribución de masa del avión"
          caption="El centro de gravedad pertenece a la distribución de masa del avión completo. Las posiciones y masas dibujadas son conceptuales, no una hoja de carga."
        >
          <Plane />
          <circle cx="172" cy="101" r="12" fill={cyan} />
          <circle cx="183" cy="176" r="8" fill={cyan} />
          <circle cx="133" cy="132" r="10" fill={cyan} />
          <circle cx="227" cy="132" r="10" fill={cyan} />
          <circle cx="180" cy="132" r="5" fill={gold} />
          <T x={247} y={78} color={gold}>
            CG
          </T>
          <L d="M235 84L186 126" color={gold} />
        </F>
        <F
          title="CP: resultante de presión"
          caption="El centro de presión localiza la resultante aerodinámica sobre este perfil. No es el centro de masa ni una referencia idéntica al centro aerodinámico."
        >
          <Profile />
          <A d="M87 95V59" />
          <A d="M134 91V35" />
          <A d="M181 100V58" />
          <A d="M230 113V88" />
          <A d="M162 128V40" color={gold} />
          <circle cx="162" cy="128" r="5" fill={gold} />
          <T x={180} y={180} color={gold}>
            Resultante en CP
          </T>
        </F>
      </Group>
    );
  if (nav === "Centro aerodinámico")
    return (
      <Group>
        <F
          title="CA y CP: referencias diferentes"
          caption="En la aproximación subsónica de perfil, el CA se sitúa cerca de 25 % de cuerda y el momento respecto a él cambia poco con α. No implica momento nulo. El CP puede desplazarse con la condición."
        >
          <Profile />
          <L d="M45 172H315" dash />
          <L d="M45 161V182M112.5 161V182M315 161V182" color={gold} />
          <circle cx="112.5" cy="125" r="5" fill={gold} />
          <circle cx="170" cy="128" r="5" fill={cyan} />
          <circle cx="211" cy="130" r="5" fill="none" stroke={cyan} strokeWidth="2" />
          <A d="M81 90Q110 52 139 90" color={gold} />
          <T x={93} y={197} color={gold}>
            ≈ 25 % · CA
          </T>
          <T x={225} y={59} color={cyan}>
            CP: dos condiciones
          </T>
          <T x={271} y={197}>
            100 %
          </T>
        </F>
      </Group>
    );
  if (nav === "No contar dos veces el momento")
    return (
      <Group>
        {[false, true].map((atCA) => (
          <F
            key={String(atCA)}
            title={atCA ? "Resultante en CA + par" : "Resultante en CP"}
            caption={
              atCA
                ? "La misma fuerza se traslada hacia delante al CA. Para conservar el efecto total se añade el par equivalente antihorario de este dibujo; no se vuelve a añadir la fuerza original en CP."
                : "La resultante ascendente se aplica en CP. En este modelo de perfil orientado con borde de ataque a la izquierda, CP está detrás de CA."
            }
          >
            <Profile />
            <A d={`M${atCA ? 112 : 178} 128V43`} color={gold} />
            <circle cx={atCA ? 112 : 178} cy="128" r="5" fill={gold} />
            {atCA && <A d="M225 95Q197 53 162 87" color={cyan} />}
            <T x={180} y={184}>
              {atCA ? "M_CA = L × brazo CA–CP" : "Una fuerza resultante"}
            </T>
          </F>
        ))}
      </Group>
    );
  if (nav === "Equilibrio de ala y cola")
    return (
      <Group>
        <F
          title="Solo balance de fuerzas verticales"
          caption="Modelo convencional con cola descendente: 10 500 N arriba compensan 10 000 N de peso y 500 N de cola abajo. Se muestra solo el balance vertical; los brazos no representan equilibrio de momentos."
        >
          <L d="M47 117H309" color={ink} />
          <path d="M279 117L264 91M234 115H307" stroke={ink} strokeWidth="3" />
          <A d="M129 117V44" />
          <A d="M166 117V187" color={gold} />
          <A d="M277 117V138" color={gold} />
          <T x={129} y={30}>
            L ala: 10 500 N
          </T>
          <T x={128} y={217} color={gold}>
            W: 10 000 N
          </T>
          <T x={275} y={175} color={gold}>
            Cola: 500 N ↓
          </T>
          <T x={180} y={246}>
            Flechas esquemáticas · no a escala
          </T>
        </F>
      </Group>
    );
  if (nav === "Estabilidad del avión completo")
    return (
      <Group>
        <F
          title="Momento total alrededor del CG"
          caption="Contribuciones de ala, cola, fuselaje y propulsión se suman respecto al CG. La pendiente local negativa expresa tendencia restauradora si el momento positivo se define nariz arriba. No demuestra amortiguamiento dinámico."
        >
          <A d="M52 220V39" />
          <A d="M52 137H326" />
          <T x={31} y={30}>
            C_m
          </T>
          <T x={330} y={162}>
            α
          </T>
          <L d="M80 64L296 204" color={gold} />
          <circle cx="193" cy="137" r="5" fill={gold} />
          <T x={236} y={112}>
            Equilibrio: C_m = 0
          </T>
          <T x={177} y={37}>
            Positivo: nariz arriba
          </T>
          <T x={183} y={248}>
            Ala + cola + fuselaje + propulsión
          </T>
        </F>
      </Group>
    );
  if (nav === "Los dos extremos")
    return (
      <Group>
        <F
          title="Envolvente conceptual del CG"
          caption="Los límites protegen controlabilidad y estabilidad. Demasiado adelante puede faltar autoridad de nariz arriba; demasiado atrás puede deteriorarse la restauración y recuperación. No hay porcentajes universales ni recomendación de volar en un extremo."
        >
          <T x={180} y={38}>
            Nariz ← posición del CG → cola
          </T>
          <rect x="104" y="93" width="152" height="54" rx="6" fill="#234c54" stroke={cyan} />
          <L d="M40 120H319" />
          <L d="M104 81V160M256 81V160" color={gold} />
          <T x={180} y={115}>
            CG permitido
          </T>
          <T x={81} y={192} color={gold}>
            Delante
          </T>
          <T x={281} y={192} color={gold}>
            Detrás
          </T>
          <T x={86} y={217}>
            Autoridad
          </T>
          <T x={86} y={237}>
            insuficiente
          </T>
          <T x={274} y={217}>
            Restauración
          </T>
          <T x={274} y={237}>
            deteriorada
          </T>
        </F>
      </Group>
    );
  return null;
}
function Dutch({ nav }: { nav: string }) {
  if (nav === "Dos movimientos acoplados" || nav === "El compromiso entre respuestas")
    return (
      <Group>
        <Plot mode="decay" coupled />
      </Group>
    );
  if (nav === "Por qué se enlazan")
    return (
      <Group>
        <F
          title="Un modo lateral-direccional acoplado"
          caption="El resbalamiento β provoca momentos de alabeo y guiñada. La respuesta con inercia modifica de nuevo β. Este ciclo no requiere que un ala entre en pérdida ni que se detenga el movimiento al cruzar el equilibrio."
        >
          <rect x="95" y="26" width="170" height="42" rx="8" fill="#274b60" stroke={gold} />
          <T x={180} y={53}>
            Resbalamiento β
          </T>
          <rect x="37" y="111" width="286" height="42" rx="8" fill="#274b60" stroke={cyan} />
          <T x={180} y={138}>
            Momentos de alabeo y guiñada
          </T>
          <rect x="63" y="204" width="234" height="35" rx="8" fill="#274b60" stroke={gold} />
          <T x={180} y={227}>
            Movimiento con inercia
          </T>
          <A d="M180 70V104" />
          <A d="M180 157V196" />
          <A d="M300 220Q348 215 342 107Q338 47 270 47" color={gold} />
        </F>
      </Group>
    );
  if (nav === "Distinguir otros fenómenos")
    return (
      <Group>
        <F
          title="Alternancia y divergencia"
          caption="Misma referencia conceptual de alabeo frente a tiempo: el balanceo holandés oscila; una divergencia espiral crece sin alternancia. Una barrena es otro fenómeno, asociado a pérdida y autorrotación."
        >
          <A d="M51 215V37" />
          <A d="M51 215H328" />
          <L d="M51 138H322" dash />
          <path d={wave("decay")} fill="none" stroke={gold} strokeWidth="3" />
          <path
            d="M52 138Q207 139 320 49"
            fill="none"
            stroke={cyan}
            strokeWidth="3"
            strokeDasharray="7 3"
          />
          <T x={117} y={28}>
            Alabeo
          </T>
          <T x={273} y={244}>
            Tiempo
          </T>
          <T x={189} y={65} color={cyan}>
            Espiral - -
          </T>
          <T x={198} y={192} color={gold}>
            Balanceo holandés
          </T>
        </F>
      </Group>
    );
  if (nav === "Amortiguar el modo")
    return (
      <Group>
        <F
          title="Lazo básico del yaw damper"
          caption="Un sensor de movimiento alimenta al controlador, que actúa sobre el timón e influye en el movimiento. No se presupone una referencia de rumbo ni se prescribe una recuperación manual universal."
        >
          {["Sensor de movimiento", "Controlador yaw damper", "Timón → movimiento"].map(
            (label, i) => (
              <g key={label}>
                <rect
                  x="65"
                  y={31 + i * 71}
                  width="238"
                  height="42"
                  rx="8"
                  fill="#274b60"
                  stroke={i === 1 ? gold : cyan}
                />
                <T x={184} y={58 + i * 71}>
                  {label}
                </T>
                {i < 2 && <A d={`M184 ${77 + i * 71}V${96 + i * 71}`} />}
              </g>
            ),
          )}
          <A d="M63 194Q25 194 25 120Q25 51 57 51" color={gold} />
          <T x={180} y={245}>
            Realimentación de movimiento
          </T>
        </F>
      </Group>
    );
  return null;
}
function Asymmetry({ nav }: { nav: string }) {
  if (nav === "Fuerzas desiguales" || nav === "Calcular el momento")
    return (
      <Group>
        <F
          title="Tracción desigual · vista superior"
          caption="Nariz hacia arriba. Con brazos iguales de 2 m, 1 000 N a la izquierda y 3 000 N a la derecha producen 4 000 N·m de guiñada hacia la izquierda. Las fuerzas son longitudinales; el momento no es una fuerza vertical."
        >
          <Plane />
          <circle cx="180" cy="131" r="5" fill={gold} />
          <L d="M103 131H257" dash />
          <A d="M103 125V94" />
          <A d="M257 125V32" />
          <A d="M210 74Q180 46 146 76" color={gold} />
          <T x={89} y={48}>
            Izquierda
          </T>
          <T x={88} y={69}>
            1 000 N
          </T>
          <T x={278} y={175}>
            Derecha
          </T>
          <T x={277} y={195}>
            3 000 N
          </T>
          <T x={138} y={156}>
            2 m
          </T>
          <T x={220} y={156}>
            2 m
          </T>
          <T x={180} y={250} color={gold}>
            M = (T derecha − T izquierda) × 2 m
          </T>
        </F>
        {nav === "Calcular el momento" && (
          <F
            title="Tres casos · el mismo brazo"
            caption="Modelo simétrico idealizado con brazos laterales de 2 m. La diferencia de tracción, no la suma, determina el momento neto. N·m es una unidad de momento, no de potencia."
          >
            <T x={180} y={38}>
              Izquierda / derecha → |momento|
            </T>
            {[
              ["3 000 / 3 000 N", "0 N·m"],
              ["1 000 / 3 000 N", "4 000 N·m"],
              ["0 / 3 000 N", "6 000 N·m"],
            ].map(([forces, moment], i) => (
              <g key={forces}>
                <rect x="25" y={57 + i * 62} width="310" height="48" rx="7" fill="#274b60" />
                <T x={121} y={87 + i * 62}>
                  {forces}
                </T>
                <T x={270} y={87 + i * 62} color={gold}>
                  {moment}
                </T>
              </g>
            ))}
          </F>
        )}
      </Group>
    );
  if (nav === "Oponerse a la guiñada")
    return (
      <Group>
        <F
          title="Momento requerido y disponible"
          caption="Ejes dimensionales: magnitud de momento en N·m frente a velocidad equivalente. La autoridad de control crece conceptualmente con velocidad; la demanda es constante solo en este modelo. El cruce no es una Vmc operativa ni garantiza ascenso."
        >
          <A d="M54 210V38" />
          <A d="M54 210H328" />
          <L d="M55 135H319" color={gold} dash />
          <path d="M62 194Q190 171 307 53" fill="none" stroke={cyan} strokeWidth="3" />
          <T x={154} y={27}>
            Magnitud de momento (N·m)
          </T>
          <T x={223} y={116} color={gold}>
            Demanda - -
          </T>
          <T x={243} y={55} color={cyan}>
            Autoridad
          </T>
          <T x={206} y={245}>
            Velocidad equivalente
          </T>
        </F>
      </Group>
    );
  if (nav === "Tres preguntas distintas")
    return (
      <Group>
        <F
          title="Tres comprobaciones independientes"
          caption="Control direccional, margen respecto al ángulo de ataque crítico y capacidad de ascenso son cuestiones distintas. Mantener control direccional no demuestra automáticamente sustentación suficiente ni excedente de potencia."
        >
          {[
            ["Control", "¿Se equilibra la guiñada?"],
            ["Sustentación", "¿Hay margen a α crítico?"],
            ["Ascenso", "¿Hay potencia excedente?"],
          ].map(([label, question], i) => (
            <g key={label}>
              <rect
                x="27"
                y={25 + i * 75}
                width="306"
                height="63"
                rx="8"
                fill="#274b60"
                stroke={i === 1 ? cyan : gold}
              />
              <T x={180} y={49 + i * 75} color={gold}>
                {label}
              </T>
              <T x={180} y={73 + i * 75}>
                {question}
              </T>
            </g>
          ))}
        </F>
      </Group>
    );
  return null;
}
/** Only approved explanatory stages receive diagrams; checks and synthesis stay uncluttered. */
export function CiaacAerodynamicsModulesSixSevenVisual({
  module,
  lesson,
  stage,
  nav,
  kind,
}: Props) {
  if (kind !== "content" || !Number.isInteger(stage) || stage < 1) return null;
  if (module === 6) {
    if (lesson === 1) return <Flaps nav={nav} />;
    if (lesson === 2) return <UseFlaps nav={nav} />;
    if (lesson === 3) return <Leading nav={nav} />;
    if (lesson === 4) return <Spoilers nav={nav} />;
  }
  if (module === 7) {
    if (lesson === 1) return <Equilibrium nav={nav} />;
    if (lesson === 2) return <StaticDynamic nav={nav} />;
    if (lesson === 3) return <Axes nav={nav} />;
    if (lesson === 4) return <Centers nav={nav} />;
    if (lesson === 5) return <Dutch nav={nav} />;
    if (lesson === 6) return <Asymmetry nav={nav} />;
  }
  return null;
}
