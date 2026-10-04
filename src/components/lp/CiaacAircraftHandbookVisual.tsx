const ROOT = "/lp/ciaac/aircraft-handbook";

function Art({ name, alt, caption }: { name: string; alt: string; caption: string }) {
  return (
    <figure className="aircraft-visual">
      <img src={`${ROOT}/${name}.png`} alt={alt} width={1536} height={1024} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Labels and intervals remain accessible HTML, separate from the original raster art. */
export function AircraftHandbookVisual({ stage }: { stage: number }) {
  if (stage === 1)
    return (
      <Art
        name="preflight-pushback"
        alt="Vista elevada de plataforma: un remolcador conectado al tren de nariz inicia el retroceso de un avión con todas sus ruedas apoyadas."
        caption="Inicio del push-back para una salida programada"
      />
    );
  if (stage === 2)
    return (
      <div className="aircraft-concepts">
        <Art
          name="aircraft-support"
          alt="Comparación de tres mecanismos: planeador sostenido por sus alas, globo por flotación y aerodeslizador sobre un colchón de aire contra la superficie."
          caption="La forma de sostenerse determina la clasificación"
        />
        <div className="aircraft-mechanisms">
          <span>
            <strong>Planeador</strong>Alas · sí es aeronave
          </span>
          <span>
            <strong>Globo</strong>Flotación · sí es aeronave
          </span>
          <span>
            <strong>Aerodeslizador</strong>Colchón contra la superficie · excluido
          </span>
        </div>
      </div>
    );
  if (stage === 3)
    return (
      <figure className="aircraft-timeline">
        <figcaption>Una operación completa</figcaption>
        <ol>
          <li>
            <span aria-hidden="true">↶</span>
            <time>10:00</time>
            <strong>Primer movimiento</strong>
            <small>Para despegar</small>
          </li>
          <li>
            <span aria-hidden="true">↗</span>
            <time>10:12</time>
            <strong>Despegue</strong>
            <small>Empieza el tramo en el aire</small>
          </li>
          <li>
            <span aria-hidden="true">↘</span>
            <time>11:00</time>
            <strong>Aterrizaje</strong>
            <small>Termina el tramo en el aire</small>
          </li>
          <li>
            <span aria-hidden="true">⊣</span>
            <time>11:08</time>
            <strong>Detención final</strong>
            <small>En plataforma</small>
          </li>
        </ol>
        <div className="aircraft-time-full">Tiempo de vuelo · 68 minutos</div>
        <div className="aircraft-time-air">En el aire · 48 minutos</div>
        <p>Tramos en tierra: 12 + 8 = 20 minutos</p>
      </figure>
    );
  if (stage === 4)
    return (
      <div className="aircraft-rotor">
        <Art
          name="helicopter-rotor"
          alt="Helicóptero inmóvil tras aterrizar con las palas aún girando, comparado con el mismo helicóptero y sus palas totalmente detenidos."
          caption="El final exige ambas condiciones"
        />
        <ol>
          <li>
            <strong>Inicio</strong>Las palas empiezan a girar
          </li>
          <li>
            <time>09:40</time>Aterrizaje · inmóvil, rotor girando<span>Sigue contando</span>
          </li>
          <li>
            <time>09:43</time>Aeronave detenida + palas detenidas<span>Final del intervalo</span>
          </li>
        </ol>
      </div>
    );
  return null;
}
