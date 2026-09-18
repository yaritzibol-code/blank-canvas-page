import type { LegislationCourse } from "./legislation-types";

export const ANNEX10_LEARNING_PATHS: Record<string, LegislationCourse> = {
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-1-definitions-1": {
    id: "annex10-v2-chapter-1",
    folder: "01_Introduction_and_Core_Definitions",
    name: "Introduction to Annex 10 & Core Definitions",
    subtitle: "1 temas · 7 misiones",
    year: "ICAO Annex 10 · Volume II",
    word: "Chapter 1",
    sources: [
      "1.1 · páginas 20",
      "1.1–1.3 · páginas 20, 21, 22",
      "1.2 · páginas 20, 21",
      "1.3 · páginas 21, 22",
      "1.6–1.9 · páginas 23, 24, 25",
      "Foreword — Status of Annex components; Editorial practices · páginas 12, 13",
      "Introduction; Foreword · páginas 1, 11, 12, 13, 19",
    ],
    steps: [
      {
        label: "Despegue",
        title: "Introduction to Annex 10 & Core Definitions",
        body: "Chapter 1 de ICAO Annex 10, Volume II. Este recorrido reúne 1 temas fuente en su orden académico.",
        hero: true,
        cards: [
          [
            "Introduction to Annex 10 and Core Definitions",
            "Antes de construir una llamada o interpretar un mensaje, necesitas reconocer el servicio, las estaciones y la dirección de la comunicación. Este es tu punto de partida en Annex 10, Volume II.",
          ],
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 1",
        title: "El volumen de los procedimientos",
        body: "<p><strong>Annex 10 — Aeronautical Telecommunications</strong> contiene varios volúmenes. El adjunto es <strong>Volume II — Communication Procedures including those with PANS status</strong>. Enseña procedimientos de comunicación: cómo establecer contacto, preparar, transmitir, recibir y manejar mensajes.</p><p>El objetivo del international aeronautical telecommunication service es asegurar las telecomunicaciones y radioayudas necesarias para la <strong>seguridad, regularidad y eficiencia</strong> de la navegación aérea internacional.</p><p>Esta materia usa la séptima edición, julio de 2016, con la enmienda 91 incorporada en el archivo. Su estructura FlightPath sigue ocho chapters: fundamentos; administración; procedimientos generales; AFS; voz; radio navigation; broadcasting; data link. Primero conocerás las reglas comunes y después los procedimientos de cada servicio.</p>",
        guide:
          "La portada y el Foreword identifican Volume II como Communication Procedures. El recorrido sigue esa materia, sin completar sus referencias con otros documentos.",
        refs: ["Annex 10, Volume II · Introduction; Foreword", "Páginas físicas 1, 11, 12, 13, 19"],
        questions: [
          {
            q: "¿Cuál es el centro de este volumen?",
            options: [
              "Communication Procedures",
              "Especificaciones de diseño de todas las radioayudas",
              "Un catálogo de frecuencias de cada aeropuerto",
            ],
            answer: 0,
            why: "La portada y el Foreword identifican Volume II como Communication Procedures. El recorrido sigue esa materia, sin completar sus referencias con otros documentos.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 2",
        title: "Reconocer el peso de cada disposición",
        body: '<div class="concepts"><article><h3>Standard · SHALL</h3><p>Especificación cuya aplicación uniforme se reconoce necesaria; los Estados se ajustan conforme al Convenio. SHALL expresa obligación dentro de ese contexto.</p></article><article><h3>Recommendation · SHOULD</h3><p>Práctica cuya aplicación uniforme se reconoce deseable. Los Estados procuran ajustarse a ella; no se presenta como Standard.</p></article><article><h3>PANS</h3><p>Procedures for Air Navigation Services. Tienen su propio estatus; una disposición marcada PANS sigue siendo PANS aunque emplee SHALL.</p></article><article><h3>Note</h3><p>Información explicativa o referencias. No constituye parte de un Standard ni de una Recommended Practice.</p></article></div><p>Las definiciones no tienen estatus independiente: fijan el significado de los términos donde se utilizan. Las tablas y figuras referidas por una disposición forman parte de ella y comparten su estatus. Los Attachments ofrecen material complementario o guía.</p>',
        guide:
          "El prefijo y el estatus del texto importan. No basta con buscar el verbo para clasificar una disposición.",
        refs: [
          "Annex 10, Volume II · Foreword — Status of Annex components; Editorial practices",
          "Páginas físicas 12, 13",
        ],
        questions: [
          {
            q: "Una disposición lleva el prefijo PANS y el verbo shall. ¿Cómo la identificas?",
            options: [
              "PANS, conservando la fuerza del verbo en ese procedimiento",
              "Standard, porque todo shall lo convierte en Standard",
              "Note, porque no es Standard",
            ],
            answer: 0,
            why: "El prefijo y el estatus del texto importan. No basta con buscar el verbo para clasificar una disposición.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 3",
        title: "Primero: ¿qué servicio interviene?",
        body: '<p><strong>Aeronautical Telecommunication Service</strong> es el servicio de telecomunicación para cualquier propósito aeronáutico. Dentro de este marco, reconoce estas familias por su función:</p><div class="concepts"><article><h3>Aeronautical Fixed Service · AFS</h3><p>Comunicación entre puntos fijos especificados, principalmente para la seguridad de la navegación y la operación regular, eficiente y económica de los servicios aéreos. AFTN es una red mundial de circuitos fijos dentro del AFS; se desarrolla en Chapter 4.</p></article><article><h3>Aeronautical Mobile Service</h3><p>Entre aeronautical stations y aircraft stations, o entre aircraft stations. También pueden participar estaciones de supervivencia y, en las frecuencias designadas, radiobalizas de emergencia.</p></article><article><h3>Aeronautical Radio Navigation Service</h3><p>Radio navigation en beneficio de la operación segura de las aeronaves. Sus procedimientos se estudian en Chapter 6.</p></article><article><h3>Aeronautical Broadcasting Service</h3><p>Transmisión de información relacionada con la navegación aérea. Se desarrolla en Chapter 7.</p></article></div>',
        guide:
          "La pista es «puntos fijos especificados». AFS es la familia; AFTN es una de sus redes.",
        refs: ["Annex 10, Volume II · 1.1", "Páginas físicas 20"],
        questions: [
          {
            q: "Relaciona la función con su familia: comunicación entre puntos fijos especificados.",
            options: [
              "Aeronautical Fixed Service",
              "Aeronautical Mobile Service",
              "Aeronautical Broadcasting Service",
            ],
            answer: 0,
            why: "La pista es «puntos fijos especificados». AFS es la familia; AFTN es una de sus redes.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 4",
        title: "Después: ¿quién comunica?",
        body: '<p>Un <strong>servicio</strong> describe la actividad; una <strong>station</strong> es una estación que participa en ella. Identificar el papel de cada estación ayuda a leer quién debe actuar en un procedimiento.</p><div class="table-scroll"><table><thead><tr><th>Station</th><th>Cómo reconocerla</th></tr></thead><tbody><tr><td>Aeronautical Station</td><td>Estación terrestre del aeronautical mobile service; en ciertos casos puede estar a bordo de un buque o en una plataforma marítima.</td></tr><tr><td>Aircraft Station</td><td>Estación móvil a bordo de una aeronave, distinta de una survival craft station.</td></tr><tr><td>Aeronautical Fixed Station</td><td>Estación del AFS.</td></tr><tr><td>Air-ground Control Radio Station</td><td>Tiene responsabilidad principal de manejar comunicaciones de operación y control de aeronaves en un área determinada.</td></tr><tr><td>Network Station</td><td>Aeronautical station que forma parte de una radiotelephony network.</td></tr></tbody></table></div>',
        guide:
          "La ubicación a bordo y el servicio móvil corresponden a Aircraft Station. Network Station tiene otra definición: es una aeronautical station de una red radiotelefónica.",
        refs: ["Annex 10, Volume II · 1.2", "Páginas físicas 20, 21"],
        questions: [
          {
            q: "La estación va a bordo de una aeronave y participa en el servicio móvil. ¿Qué término corresponde?",
            options: [
              "Aircraft Station",
              "Aeronautical Fixed Station",
              "Network Station por el solo hecho de estar a bordo",
            ],
            answer: 0,
            why: "La ubicación a bordo y el servicio móvil corresponden a Aircraft Station. Network Station tiene otra definición: es una aeronautical station de una red radiotelefónica.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 5",
        title: "La dirección y el método no son lo mismo",
        body: '<div class="table-scroll"><table><thead><tr><th>Término</th><th>Significado de trabajo</th></tr></thead><tbody><tr><td>Air-ground communication</td><td>Comunicación en ambos sentidos entre aeronave y estaciones o lugares en la superficie.</td></tr><tr><td>Air-to-ground communication</td><td>Un solo sentido: aeronave → superficie.</td></tr><tr><td>Ground-to-air communication</td><td>Un solo sentido: superficie → aeronave.</td></tr><tr><td>Simplex</td><td>Entre dos estaciones, un sentido a la vez.</td></tr><tr><td>Duplex</td><td>Entre dos estaciones, ambos sentidos simultáneamente.</td></tr><tr><td>Broadcast</td><td>Información de navegación aérea que no se dirige a estaciones específicas.</td></tr><tr><td>Blind transmission</td><td>No se logra comunicación en ambos sentidos, pero se cree que la estación llamada puede recibir.</td></tr><tr><td>Readback</td><td>La receptora repite el mensaje o parte apropiada a la transmisora para confirmar recepción correcta.</td></tr></tbody></table></div><p>Una comunicación air-ground puede usar un método simplex: «ambos sentidos» no significa necesariamente «al mismo tiempo». El procedimiento detallado de readback y de blind transmission llegará en Chapter 5.</p>',
        guide: "Simplex describe la alternancia. Duplex permite los dos sentidos simultáneamente.",
        refs: ["Annex 10, Volume II · 1.3", "Páginas físicas 21, 22"],
        questions: [
          {
            q: "Dos estaciones pueden hablar en ambos sentidos, pero solo una a la vez. ¿Qué método es?",
            options: ["Simplex", "Duplex", "Broadcast"],
            answer: 0,
            why: "Simplex describe la alternancia. Duplex permite los dos sentidos simultáneamente.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 6",
        title: "Frecuencias y datos: lo necesario para seguir",
        body: '<div class="concepts"><article><h3>Primary / secondary frequency</h3><p>En una radiotelephony network, son la primera y segunda opción asignadas a la aeronave para air-ground communication. No son una clasificación de urgencia.</p></article><article><h3>CPDLC</h3><p>Controller-pilot data link communications: medio de comunicación controlador–piloto que usa data link para ATC communications. Su establecimiento, mensajes y fallas se desarrollan en Chapter 8.</p></article><article><h3>Otros términos que vas a usar</h3><p>Aeronautical telecommunication agency opera estaciones; aircraft operating agency realiza u ofrece operaciones de aeronaves. Un telecommunication log registra actividades de una estación. Un location indicator es un grupo de cuatro letras asignado a la ubicación de una aeronautical fixed station.</p></article></div><p><strong>Radio direction finding</strong> determina la dirección por recepción de ondas de radio. Aquí basta con reconocer el nombre; solicitudes, clases de precisión y limitaciones pertenecen a Chapter 6.</p>',
        guide:
          "Primary y secondary expresan orden de elección asignado. Las obligaciones de watch se estudian por separado.",
        refs: ["Annex 10, Volume II · 1.6–1.9", "Páginas físicas 23, 24, 25"],
        questions: [
          {
            q: "¿Qué significa secondary frequency en esta definición?",
            options: [
              "Segunda opción asignada en una radiotelephony network",
              "Frecuencia exclusiva para mensajes sin prioridad",
              "Una frecuencia que reemplaza automáticamente toda escucha obligatoria",
            ],
            answer: 0,
            why: "Primary y secondary expresan orden de elección asignado. Las obligaciones de watch se estudian por separado.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to Annex 10 and Core Definitions · 7",
        title: "Ubica las familias en una situación",
        body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
        guide:
          "Las familias responden preguntas diferentes: servicio, estación y método. No es necesario memorizar una lista aislada para reconocerlas.",
        refs: ["Annex 10, Volume II · 1.1–1.3", "Páginas físicas 20, 21, 22"],
        match: [
          ["AFS", "Entre puntos fijos especificados"],
          ["Aircraft Station", "Estación móvil a bordo de aeronave"],
          ["Simplex", "Un sentido a la vez"],
          ["Readback", "Repetir para confirmar recepción correcta"],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Repaso del chapter.",
        body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
        recap: [
          [
            "Introduction to Annex 10 and Core Definitions",
            "Tema revisado dentro de este chapter.",
          ],
        ],
        refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
        final: true,
      },
    ],
  },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-2-administrative-provisions-relating-to-the-international-aero-2":
    {
      id: "annex10-v2-chapter-2",
      folder: "02_Administrative_Provisions",
      name: "Administrative Provisions Relating to the International Aeronautical Telecommunication Service",
      subtitle: "3 temas · 9 misiones",
      year: "ICAO Annex 10 · Volume II",
      word: "Chapter 2",
      sources: [
        "2.1 · páginas 27",
        "2.1–2.2 · páginas 27",
        "2.2 · páginas 27",
        "2.3.1–2.3.2 · páginas 27",
        "2.3.3 · páginas 27",
        "2.4 · páginas 27, 28",
        "2.5 · páginas 28",
        "2.6 · páginas 28",
      ],
      steps: [
        {
          label: "Despegue",
          title:
            "Administrative Provisions Relating to the International Aeronautical Telecommunication Service",
          body: "Chapter 2 de ICAO Annex 10, Volume II. Este recorrido reúne 3 temas fuente en su orden académico.",
          hero: true,
          cards: [
            [
              "Division and Access to the Service",
              "Reconoce cómo se divide el servicio internacional y a qué estaciones alcanza la protección contra acceso no autorizado.",
            ],
            [
              "Hours of Service and Supervision",
              "Aprende quién comunica horarios y cambios, cómo se tramitan solicitudes y cómo se atienden infracciones de procedimiento.",
            ],
            [
              "Superfluous Transmissions and Interference",
              "Distingue la prohibición de transmisiones superfluas de las precauciones que preceden a pruebas y experimentos.",
            ],
          ],
        },
        {
          label: "Division and Access to the Service · 1",
          title: "Ubica cada servicio",
          body: '<span class="norm">Standard</span> <p>El international aeronautical telecommunication service se divide en cuatro partes: <strong>AFS, aeronautical mobile service, aeronautical radio navigation service y aeronautical broadcasting service</strong>.</p><p>La división evita confundir el medio con la función. AFTN pertenece al AFS; voice y data link se estudian dentro del mobile service. Esos desarrollos tienen su lugar en Chapters 4, 5 y 8.</p>',
          guide:
            "2.1 enumera cuatro servicios. Las redes y aplicaciones no crean nuevas divisiones.",
          refs: ["Annex 10, Volume II · 2.1", "Páginas físicas 27"],
          questions: [
            {
              q: "¿Cuál pertenece a las cuatro divisiones de 2.1?",
              options: [
                "Aeronautical Broadcasting Service",
                "Un servicio independiente llamado CPDLC",
                "Un servicio independiente llamado AFTN",
              ],
              answer: 0,
              why: "2.1 enumera cuatro servicios. Las redes y aplicaciones no crean nuevas divisiones.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Division and Access to the Service · 2",
          title: "Protección directa y remota",
          body: '<span class="norm">Standard</span> <p><strong>Todas las aeronautical telecommunication stations</strong> deben protegerse frente al acceso no autorizado, tanto directo como remoto. La disposición incluye expresamente los <strong>end systems e intermediate systems de ATN</strong>.</p><p>El alcance no se limita a la consola visible para el operador. Si un sistema intermedio participa en ATN, también está incluido. El apartado exige protección, pero no prescribe aquí un producto, contraseña, arquitectura ni tecnología concreta.</p>',
          guide:
            "La exigencia cubre todas las estaciones e incluye expresamente sistemas finales e intermedios de ATN, con acceso directo o remoto.",
          refs: ["Annex 10, Volume II · 2.2", "Páginas físicas 27"],
          questions: [
            {
              q: "Un intermediate system de ATN solo admite acceso remoto. ¿Queda cubierto?",
              options: [
                "Sí, la protección incluye sistemas intermedios y acceso remoto",
                "No, solo se protege el acceso presencial",
                "Solo si se usa radiotelephony",
              ],
              answer: 0,
              why: "La exigencia cubre todas las estaciones e incluye expresamente sistemas finales e intermedios de ATN, con acceso directo o remoto.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Division and Access to the Service · 3",
          title: "Aplicar sin inventar requisitos",
          body: "<p>Al revisar una instalación, separa dos preguntas: <strong>qué servicio presta</strong> y <strong>si está protegida frente al acceso no autorizado</strong>. Que sea AFS o mobile no elimina la exigencia de protección.</p><p>La lectura precisa conserva tanto el alcance como los límites de la disposición: «shall be protected» es obligatorio; un método técnico específico que no aparece en 2.2 no puede atribuirse a este apartado.</p>",
          guide:
            "La primera reproduce el alcance normativo real sin añadir soluciones técnicas ajenas a la fuente.",
          refs: ["Annex 10, Volume II · 2.1–2.2", "Páginas físicas 27"],
          questions: [
            {
              q: "¿Qué afirmación está sustentada por 2.2?",
              options: [
                "La protección comprende acceso no autorizado directo o remoto",
                "ICAO exige en este apartado una marca concreta de equipo",
                "La protección se recomienda solo para AFTN",
              ],
              answer: 0,
              why: "La primera reproduce el alcance normativo real sin añadir soluciones técnicas ajenas a la fuente.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Hours of Service and Supervision · 1",
          title: "Avisar los horarios y sus cambios",
          body: '<span class="norm">Standard</span> <p>La <strong>Competent Authority</strong> notifica los horarios normales de las estaciones y oficinas bajo su control a las agencias designadas por las demás Administrations interesadas.</p><p>Cuando sea necesario y practicable, notifica los cambios <strong>antes de aplicarlos</strong>. Cuando sea necesario, esos cambios también se promulgan mediante NOTAM. Conserva estas condiciones: el texto no convierte toda variación en un aviso idéntico sin considerar necesidad y posibilidad.</p>',
          guide:
            "2.3.1 asigna esa notificación a la Competent Authority respecto de sus estaciones y oficinas.",
          refs: ["Annex 10, Volume II · 2.3.1–2.3.2", "Páginas físicas 27"],
          questions: [
            {
              q: "¿Quién tiene la responsabilidad de notificar los horarios normales?",
              options: [
                "La Competent Authority",
                "Cualquier aeronave que use el servicio",
                "Solo el destinatario de un mensaje",
              ],
              answer: 0,
              why: "2.3.1 asigna esa notificación a la Competent Authority respecto de sus estaciones y oficinas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Hours of Service and Supervision · 2",
          title: "Solicitar un cambio a tiempo",
          body: '<span class="norm">Standard</span> <p>Una estación o aircraft operating agency que necesita cambiar el horario de otra estación solicita el cambio <strong>tan pronto como conoce la necesidad</strong>. También debe recibir el resultado de su solicitud tan pronto como sea posible.</p><p>Solicitar no equivale a dar el cambio por aceptado. El procedimiento incluye una respuesta sobre el resultado; las extensiones y el cierre operacional se desarrollan en Chapter 3.</p>',
          guide: "Esta secuencia conserva los dos deberes de oportunidad de 2.3.3.",
          refs: ["Annex 10, Volume II · 2.3.3", "Páginas físicas 27"],
          order: [
            "Se conoce la necesidad",
            "Se solicita el cambio cuanto antes",
            "Se informa al solicitante del resultado cuanto antes",
          ],
        },
        {
          label: "Hours of Service and Supervision · 3",
          title: "Supervisar y escalar según el caso",
          body: '<p><span class="norm">Standard</span> Cada Estado designa la autoridad responsable de que el servicio se conduzca según estos procedimientos. Las infracciones <strong>serias o repetidas</strong> se comunican por la autoridad que las detecta a la autoridad designada del Estado de la estación.</p><p><span class="norm">Recommendation</span> Las infracciones ocasionales que no son serias deberían tratarse por comunicación directa entre los interesados, por correspondencia o contacto personal. Las autoridades deberían intercambiar información sobre funcionamiento, mantenimiento, fenómenos inusuales de transmisión y otros asuntos indicados.</p>',
          guide:
            "La vía formal de 2.4.3 es un Standard. La recomendación de trato directo se refiere a infracciones ocasionales no serias.",
          refs: ["Annex 10, Volume II · 2.4", "Páginas físicas 27, 28"],
          questions: [
            {
              q: "Una infracción es seria y repetida. ¿Qué tratamiento corresponde?",
              options: [
                "La autoridad que la detecta eleva la representación a la autoridad designada del Estado de la estación",
                "Se trata siempre solo por contacto informal",
                "Se omite porque la comunicación directa es una Recommendation",
              ],
              answer: 0,
              why: "La vía formal de 2.4.3 es un Standard. La recomendación de trato directo se refiere a infracciones ocasionales no serias.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Superfluous Transmissions and Interference · 1",
          title: "Eliminar lo innecesario",
          body: '<span class="norm">Standard</span> <p>Cada Estado debe asegurar que ninguna estación dentro de su territorio transmita deliberadamente señales, mensajes o datos <strong>innecesarios o anónimos</strong>.</p><p>La disposición alcanza señales y datos, no únicamente conversación de voz. La palabra «deliberadamente» también forma parte de su alcance: se está regulando la transmisión intencional de ese material.</p>',
          guide:
            "La prohibición incluye señales, mensajes y datos transmitidos deliberadamente cuando son innecesarios o anónimos.",
          refs: ["Annex 10, Volume II · 2.5", "Páginas físicas 28"],
          questions: [
            {
              q: "¿Qué caso entra directamente en 2.5?",
              options: [
                "Una estación transmite deliberadamente datos innecesarios y anónimos",
                "Una estación comunica un mensaje necesario identificado",
                "Una estación recibe una llamada dirigida a ella",
              ],
              answer: 0,
              why: "La prohibición incluye señales, mensajes y datos transmitidos deliberadamente cuando son innecesarios o anónimos.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Superfluous Transmissions and Interference · 2",
          title: "Antes de autorizar una prueba",
          body: '<span class="norm">Standard</span> <p>Antes de autorizar pruebas o experimentos, cada Administration prescribe <strong>todas las precauciones posibles</strong> para evitar harmful interference. El apartado da ejemplos: elegir frecuencia y hora, reducir la radiación o suprimirla si es posible.</p><p>Las precauciones se definen antes de autorizar. Elegir una frecuencia es una de ellas; no sustituye considerar la hora ni la radiación.</p>',
          guide: "El texto coloca expresamente las precauciones antes de la autorización.",
          refs: ["Annex 10, Volume II · 2.6", "Páginas físicas 28"],
          questions: [
            {
              q: "¿Qué opción respeta la secuencia de 2.6?",
              options: [
                "Prescribir precauciones antes de autorizar pruebas",
                "Autorizar primero y considerar interferencia al final",
                "Tratar una prueba como excepción automática a toda precaución",
              ],
              answer: 0,
              why: "El texto coloca expresamente las precauciones antes de la autorización.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Superfluous Transmissions and Interference · 3",
          title: "Si aun así aparece interferencia",
          body: '<span class="norm">Standard</span> <p>Cualquier harmful interference producida por pruebas o experimentos debe eliminarse <strong>tan pronto como sea posible</strong>. Haber previsto precauciones no elimina esta obligación posterior.</p><p>Para leer correctamente el procedimiento, distingue prevención y respuesta: seleccionar condiciones que eviten interferencia, y eliminar la interferencia perjudicial que llegue a producirse.</p>',
          guide:
            "La autorización no exime de eliminar cuanto antes la interferencia perjudicial que resulte de las pruebas.",
          refs: ["Annex 10, Volume II · 2.6", "Páginas físicas 28"],
          questions: [
            {
              q: "Una prueba autorizada causa harmful interference. ¿Qué exige el apartado?",
              options: [
                "Eliminarla lo antes posible",
                "Esperar a terminar todos los experimentos",
                "Considerarla aceptable por estar autorizada",
              ],
              answer: 0,
              why: "La autorización no exime de eliminar cuanto antes la interferencia perjudicial que resulte de las pruebas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Aterrizaje",
          title: "Repaso del chapter.",
          body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
          recap: [
            ["Division and Access to the Service", "Tema revisado dentro de este chapter."],
            ["Hours of Service and Supervision", "Tema revisado dentro de este chapter."],
            ["Superfluous Transmissions and Interference", "Tema revisado dentro de este chapter."],
          ],
          refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
          final: true,
        },
      ],
    },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-3-general-procedures-for-the-international-aeronautical-teleco-3":
    {
      id: "annex10-v2-chapter-3",
      folder: "03_General_Procedures",
      name: "General Procedures for the International Aeronautical Telecommunication Service",
      subtitle: "5 temas · 15 misiones",
      year: "ICAO Annex 10 · Volume II",
      word: "Chapter 3",
      sources: [
        "3.1; 3.2.1; 3.2.4 · páginas 29",
        "3.2.2 · páginas 29",
        "3.2.3 · páginas 29",
        "3.3.1–3.3.3 · páginas 29, 30",
        "3.3.4–3.3.6.1 · páginas 30",
        "3.3.7–3.3.7.5 · páginas 30",
        "3.4 · páginas 31",
        "3.5.1.1–3.5.1.5 · páginas 31",
        "3.5.1.2–3.5.1.4 · páginas 31",
        "3.5.1.6 · páginas 31, 32",
        "3.6.1 · páginas 32",
        "3.6.2 · páginas 32",
        "3.7.1–3.7.1.1 · páginas 32",
        "3.7–3.8 · páginas 32",
        "3.8 · páginas 32",
      ],
      steps: [
        {
          label: "Despegue",
          title: "General Procedures for the International Aeronautical Telecommunication Service",
          body: "Chapter 3 de ICAO Annex 10, Volume II. Este recorrido reúne 5 temas fuente en su orden académico.",
          hero: true,
          cards: [
            [
              "Service Extension and Station Closure",
              "El horario publicado es el punto de partida. El tráfico necesario y las comunicaciones especiales pueden exigir extenderlo.",
            ],
            [
              "Acceptance Transmission and Delivery of Messages",
              "Sigue las responsabilidades del mensaje sin confundir quién decide su admisibilidad, quién lo transporta y quién lo entrega.",
            ],
            [
              "Time System and Communication Records",
              "Aprende a leer grupos de fecha y hora, mantener logs y corregirlos sin perder la entrada original.",
            ],
            [
              "Establishment of Radiocommunication",
              "Dos reglas generales sostienen el contacto: atender a la estación que llama y radiar solo la potencia necesaria para un servicio satisfactorio.",
            ],
            [
              "Abbreviations Codes and Message Cancellation",
              "Reducir un mensaje no significa volverlo ambiguo. Cancelarlo exige autorización del originador.",
            ],
          ],
        },
        {
          label: "Service Extension and Station Closure · 1",
          title: "Cuándo extender el servicio",
          body: '<span class="norm">Standard</span> <p>Las estaciones extienden su horario normal cuando se necesita atender tráfico necesario para la operación de vuelo. Una estación sin servicio continuo, involucrada o que se espera participe en tráfico de <strong>distress, urgency, unlawful interference o interception</strong>, extiende su horario para dar el apoyo requerido.</p><p>Estos procedimientos generales se aplican a los demás capítulos cuando corresponda; los detalles propios de cada servicio siguen en sus chapters.</p>',
          guide: "3.2.4 incluye tanto participación actual como prevista en esas comunicaciones.",
          refs: ["Annex 10, Volume II · 3.1; 3.2.1; 3.2.4", "Páginas físicas 29"],
          questions: [
            {
              q: "Se espera tráfico de urgency cuando termina el horario. ¿Qué corresponde?",
              options: [
                "Extender el servicio para prestar el apoyo requerido",
                "Cerrar automáticamente a la hora publicada",
                "Cambiar la categoría del mensaje",
              ],
              answer: 0,
              why: "3.2.4 incluye tanto participación actual como prevista en esas comunicaciones.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Service Extension and Station Closure · 2",
          title: "Antes de cerrar",
          body: '<span class="norm">Standard</span> <p>Antes del cierre, la estación <strong>notifica su intención</strong> a las estaciones con las que mantiene comunicación directa, confirma que no se necesita una extensión e informa la reapertura cuando será distinta del horario normal.</p><p>No se trata solo de anunciar «cierro». Primero deben quedar atendidas las condiciones que permiten hacerlo.</p>',
          guide:
            "3.2.2 exige estas comprobaciones previas; no autoriza cancelar mensajes para poder cerrar.",
          refs: ["Annex 10, Volume II · 3.2.2", "Páginas físicas 29"],
          questions: [
            {
              q: "¿Qué falta si una estación solo anuncia que cerrará?",
              options: [
                "Confirmar que no se requiere extensión y avisar reapertura si difiere del horario normal",
                "Cambiar todas las prioridades a SS",
                "Cancelar por iniciativa propia todos los mensajes",
              ],
              answer: 0,
              why: "3.2.2 exige estas comprobaciones previas; no autoriza cancelar mensajes para poder cerrar.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Service Extension and Station Closure · 3",
          title: "El cierre en una red",
          body: '<span class="norm">Standard</span> <p>Si trabaja regularmente en una red sobre un circuito común, la estación avisa a la <strong>control station</strong>, si existe, o a todas las estaciones de la red. Después mantiene watch durante <strong>dos minutos</strong>. Puede cerrar si no recibe llamadas en ese período.</p><p>Esta secuencia complementa los requisitos generales de cierre. Si llega una llamada, la condición que permite cerrar sin más ya no se cumple.</p>',
          guide: "El período de escucha viene después del aviso, no antes.",
          refs: ["Annex 10, Volume II · 3.2.3", "Páginas físicas 29"],
          order: [
            "Notificar a control station o a toda la red",
            "Mantener watch durante dos minutos",
            "Cerrar si no se recibió ninguna llamada",
          ],
        },
        {
          label: "Acceptance Transmission and Delivery of Messages · 1",
          title: "La aceptación tiene un responsable",
          body: '<p><span class="norm">Standard</span> Solo se aceptan categorías de 4.4.1.1; su clasificación detallada está en Chapter 4. La estación donde se presenta el mensaje decide su aceptabilidad. Una vez aceptado, se transmite, retransmite y/o entrega según prioridad, <strong>sin discriminación ni demora indebida</strong>.</p><p>Se aceptan mensajes para estaciones del servicio, salvo acuerdos especiales. Los de aircraft operating agencies deben llegar en el formato prescrito por representante autorizado o por circuito autorizado. Se permiten mensajes para varios destinatarios, sujetos a los límites de direccionamiento.</p><p><span class="norm">Recommendation</span> Si una autoridad de relay considera inaceptable un mensaje, debería plantearlo posteriormente a la autoridad de la estación que lo aceptó.</p>',
          guide:
            "3.3.1.1 pone la responsabilidad en la estación de presentación; un desacuerdo posterior no justifica demoras indebidas.",
          refs: ["Annex 10, Volume II · 3.3.1–3.3.3", "Páginas físicas 29, 30"],
          questions: [
            {
              q: "¿Quién determina la aceptabilidad inicialmente?",
              options: [
                "La estación donde se presenta para transmisión",
                "Exclusivamente la última estación de relay",
                "Cualquier destinatario después de la entrega",
              ],
              answer: 0,
              why: "3.3.1.1 pone la responsabilidad en la estación de presentación; un desacuerdo posterior no justifica demoras indebidas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Acceptance Transmission and Delivery of Messages · 2",
          title: "Entregar con alcance y constancia",
          body: '<p><span class="norm">Standard</span> Se acuerda una oficina única por aircraft operating agency para recibir mensajes de cada estación. La estación es responsable de entregar a destinatarios dentro de los aeródromos que sirve; fuera de esos límites, a quienes cubran los acuerdos especiales.</p><p>La entrega se realiza como registro escrito u otro medio permanente prescrito por las autoridades.</p><p><span class="norm">Recommendation</span> Si se entrega por teléfono o altavoz sin grabación, debería proporcionarse cuanto antes una copia escrita como confirmación.</p>',
          guide: "La copia escrita confirma la entrega. Ese apartado está marcado Recommendation.",
          refs: ["Annex 10, Volume II · 3.3.4–3.3.6.1", "Páginas físicas 30"],
          questions: [
            {
              q: "La entrega se hizo por teléfono sin grabación. ¿Qué recomienda 3.3.6.1?",
              options: [
                "Proporcionar una copia escrita lo antes posible",
                "Eliminar toda constancia para evitar duplicados",
                "Tratar la llamada como registro automático",
              ],
              answer: 0,
              why: "La copia escrita confirma la entrega. Ese apartado está marcado Recommendation.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Acceptance Transmission and Delivery of Messages · 3",
          title: "Mensajes que llegan desde una aeronave",
          body: '<p><span class="norm">Standard</span> Si un mensaje de aeronave en vuelo necesita AFTN para llegar a destino, la estación lo reprocesa al formato de 4.4.2 antes de enviarlo. Para otros circuitos AFS también se contempla ese formato, salvo los acuerdos previos de distribución indicados.</p><p>Sin dirección específica: la información meteorológica se remite sin demora a la oficina meteorológica asociada al punto de recepción; la información ATS, a la unidad ATS asociada a la estación receptora.</p><p><span class="norm">PANS</span> Al registrar AIREP se usan, donde sea posible, las convenciones de datos aprobadas; al retransmitir por telegrafía, el texto se transmite como fue registrado conforme a ese procedimiento. Este volumen remite los detalles de AIREP a otro documento y aquí no se añaden.</p>',
          guide: "La falta de dirección específica no impide la remisión prevista en 3.3.7.2.",
          refs: ["Annex 10, Volume II · 3.3.7–3.3.7.5", "Páginas físicas 30"],
          questions: [
            {
              q: "Llega información meteorológica de una aeronave sin dirección específica. ¿Qué destino señala 3.3.7.2?",
              options: [
                "La oficina meteorológica asociada al punto de recepción, sin demora",
                "Cualquier oficina elegida al azar",
                "Se retiene hasta que la aeronave escriba una dirección AFTN",
              ],
              answer: 0,
              why: "La falta de dirección específica no impide la remisión prevista en 3.3.7.2.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Time System and Communication Records · 1",
          title: "Leer DDHHMM en UTC",
          body: '<span class="norm">Standard</span> <p>Todas las estaciones del servicio usan <strong>Coordinated Universal Time (UTC)</strong>. Medianoche se expresa como <strong>2400</strong> al terminar el día y <strong>0000</strong> al comenzar el día.</p><p>Un date-time group contiene seis cifras: las dos primeras son el día del mes y las cuatro restantes, hora y minuto UTC. Por ejemplo didáctico, <strong>181425</strong> se interpreta como día 18 a las 14:25 UTC. No incluye mes ni año.</p>',
          guide: "Las posiciones son DD + HH + MM. El grupo no representa segundos.",
          refs: ["Annex 10, Volume II · 3.4", "Páginas físicas 31"],
          questions: [
            {
              q: "Interpreta 031451, grupo que también aparece en los ejemplos AFTN.",
              options: ["Día 03, 14:51 UTC", "Mes 03, día 14, año 51", "03:14 y 51 segundos"],
              answer: 0,
              why: "Las posiciones son DD + HH + MM. El grupo no representa segundos.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Time System and Communication Records · 2",
          title: "Quién registra y durante cuánto tiempo",
          body: '<p><span class="norm">Standard</span> Cada estación mantiene un log escrito o automático. Excepción: una aircraft station que usa radiotelephony directamente con una aeronautical station no necesita mantener ese log.</p><p>Los registros se conservan <strong>al menos 30 días</strong>; si pertenecen a una investigación, durante más tiempo, hasta que sea evidente que ya no se requieren.</p><p><span class="norm">Recommendation</span> La estación aeronáutica debería registrar al recibir. Si el registro manual continuado retrasa comunicaciones durante una emergencia, puede interrumpirse temporalmente y completarse a la primera oportunidad. Un registro a bordo sobre distress, harmful interference o interrupción debería asociarse con hora, posición y altitud.</p>',
          guide: "El mínimo de 30 días no sustituye la retención más larga para investigaciones.",
          refs: ["Annex 10, Volume II · 3.5.1.1–3.5.1.5", "Páginas físicas 31"],
          questions: [
            {
              q: "Un log tiene 30 días y sigue siendo pertinente a una investigación. ¿Se puede eliminar por cumplir el mínimo?",
              options: [
                "No; se conserva hasta que sea evidente que ya no se requiere",
                "Sí; 30 días es siempre el máximo",
                "Solo se conserva si es automático",
              ],
              answer: 0,
              why: "El mínimo de 30 días no sustituye la retención más larga para investigaciones.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Time System and Communication Records · 3",
          title: "Qué debe aparecer en el log",
          body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Grupo</th><th>Contenido requerido</th></tr></thead><tbody><tr><td>Identidad y servicio</td><td>Agencia operadora, identificación de estación, fecha, apertura y cierre.</td></tr><tr><td>Operadores y watch</td><td>Firma de cada operador y horas de relevo; frecuencias vigiladas y tipo de watch continuo o programado.</td></tr><tr><td>Comunicaciones</td><td>Comunicación, prueba o intento: texto, hora de terminación, estaciones y frecuencia. Puede omitirse el texto si las copias forman parte del log; se exceptúan los intermediate mechanical relay stations según el apartado.</td></tr><tr><td>Incidencias</td><td>Distress y acciones; condiciones y dificultades, incluida interferencia; interrupciones por fallas u otros problemas, duración y acciones.</td></tr><tr><td>Información adicional</td><td>La que el operador considere valiosa como parte del registro de operaciones.</td></tr></tbody></table></div><p>La descripción de interferencia debería incluir, cuando sea practicable, hora, naturaleza, frecuencia e identificación de la señal interferente.</p>',
          guide: "3.5.1.6 j) pide descripción breve, duración y acciones.",
          refs: ["Annex 10, Volume II · 3.5.1.6", "Páginas físicas 31, 32"],
          questions: [
            {
              q: "¿Qué registro de interrupción es el más completo según el apartado?",
              options: [
                "Descripción, duración y acción tomada",
                "Solo la palabra «falla»",
                "Solo el nombre del operador",
              ],
              answer: 0,
              why: "3.5.1.6 j) pide descripción breve, duración y acciones.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Time System and Communication Records · 4",
          title: "Corregir sin borrar la historia",
          body: '<span class="norm">Standard</span> <p>En logs escritos, las entradas las hacen operadores de turno; otras personas que conocen los hechos pueden certificar su exactitud. Toda entrada debe ser completa, clara, correcta e inteligible, sin marcas superfluas.</p><p>Solo quien hizo la entrada original realiza la corrección: traza una línea sobre el error, coloca sus iniciales y registra fecha y hora de corrección. La entrada correcta va en la siguiente línea después de la última entrada.</p>',
          guide:
            "No se elimina el rastro de la entrada original ni se inserta la corrección ocultando la secuencia.",
          refs: ["Annex 10, Volume II · 3.5.1.2–3.5.1.4", "Páginas físicas 31"],
          order: [
            "La persona que hizo la entrada tacha el error con una sola línea",
            "Añade sus iniciales y la fecha y hora de corrección",
            "Registra lo correcto en la siguiente línea después de la última entrada",
          ],
        },
        {
          label: "Establishment of Radiocommunication · 1",
          title: "Atender llamadas dirigidas",
          body: '<span class="norm">Standard</span> <p>Todas las estaciones deben responder a llamadas dirigidas a ellas por otras estaciones del aeronautical telecommunication service e intercambiar comunicaciones cuando se solicite.</p><p>Este apartado establece el deber general. Los call signs, la forma de llamar y las respuestas radiotelefónicas se desarrollan en Chapter 5.</p>',
          guide: "3.6.1 formula la obligación general de atender llamadas dirigidas.",
          refs: ["Annex 10, Volume II · 3.6.1", "Páginas físicas 32"],
          questions: [
            {
              q: "¿Qué acción está prescrita ante una llamada dirigida de otra estación del servicio?",
              options: [
                "Responder e intercambiar comunicaciones a solicitud",
                "Ignorarla salvo que sea distress",
                "Exigir que use CPDLC en todos los casos",
              ],
              answer: 0,
              why: "3.6.1 formula la obligación general de atender llamadas dirigidas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishment of Radiocommunication · 2",
          title: "Potencia mínima, servicio satisfactorio",
          body: '<span class="norm">Standard</span> <p>Las estaciones radian la <strong>potencia mínima necesaria para asegurar un servicio satisfactorio</strong>. La frase tiene dos partes que deben mantenerse juntas: no dice «potencia máxima siempre» ni «potencia mínima aunque el servicio falle».</p><p>El criterio es la suficiencia del servicio. El apartado no proporciona un valor universal en watts ni una tabla por distancia.</p>',
          guide:
            "El criterio de 3.6.2 es potencia mínima necesaria, ligado a un resultado satisfactorio.",
          refs: ["Annex 10, Volume II · 3.6.2", "Páginas físicas 32"],
          questions: [
            {
              q: "Dos niveles de potencia dan servicio satisfactorio. ¿Qué criterio corresponde?",
              options: [
                "Usar el mínimo necesario que lo asegure",
                "Usar siempre el máximo disponible",
                "Usar un valor fijo inventado para toda estación",
              ],
              answer: 0,
              why: "El criterio de 3.6.2 es potencia mínima necesaria, ligado a un resultado satisfactorio.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Abbreviations Codes and Message Cancellation · 1",
          title: "Cuándo usar códigos y abreviaturas",
          body: '<span class="norm">Standard</span> <p>Se usan abreviaturas y códigos cuando son apropiados y acortan o facilitan la comunicación. Si el texto contiene códigos o abreviaturas no aprobados por ICAO, el originador debe proporcionar su descodificación a la estación que acepta el mensaje <strong>si esta la requiere</strong>.</p><p><span class="norm">Note</span> Usar códigos aprobados apropiadamente evita la necesidad de aplicar esa descodificación. El Annex remite a Doc 8400; este curso no importa de allí un catálogo adicional.</p>',
          guide:
            "La obligación se activa cuando la estación aceptante solicita la descodificación.",
          refs: ["Annex 10, Volume II · 3.7.1–3.7.1.1", "Páginas físicas 32"],
          questions: [
            {
              q: "La estación pide descodificar una abreviatura no aprobada por ICAO. ¿Quién debe facilitarlo?",
              options: [
                "El originador",
                "El destinatario sin consultar al originador",
                "Nadie, porque abreviar exime de explicar",
              ],
              answer: 0,
              why: "La obligación se activa cuando la estación aceptante solicita la descodificación.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Abbreviations Codes and Message Cancellation · 2",
          title: "Quién puede autorizar la cancelación",
          body: '<span class="norm">Standard</span> <p>Una telecommunication station cancela mensajes <strong>solo cuando el originador autoriza la cancelación</strong>. La decisión no se deduce de conveniencia, antigüedad o carga de trabajo.</p><p>Esta es la regla general. Las señales para cancelar una transmisión defectuosa AFTN y el manejo específico de voz se explican en sus Learning Paths; no deben confundirse con una decisión autónoma de retirar el mensaje del originador.</p>',
          guide:
            "3.8 exige autorización del originador, no una decisión unilateral por conveniencia.",
          refs: ["Annex 10, Volume II · 3.8", "Páginas físicas 32"],
          questions: [
            {
              q: "La estación quiere cancelar un mensaje porque le resulta inconveniente transmitirlo. ¿Qué necesita?",
              options: [
                "Autorización del originador para cancelar el mensaje",
                "Solo que cambie el turno",
                "Bajar su prioridad a KK",
              ],
              answer: 0,
              why: "3.8 exige autorización del originador, no una decisión unilateral por conveniencia.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Abbreviations Codes and Message Cancellation · 3",
          title: "Distinguir dos controles",
          body: "<p>Antes de transmitir, comprueba que las abreviaturas sean apropiadas y faciliten el intercambio; si necesitas descodificación de códigos no aprobados, solicítala al originador. Antes de cancelar, verifica su autorización.</p><p>Son responsabilidades diferentes: saber interpretar el texto no autoriza cancelarlo; que un mensaje sea breve no prueba que su código esté aprobado.</p>",
          guide: "La fuente establece condiciones independientes para abreviación y cancelación.",
          refs: ["Annex 10, Volume II · 3.7–3.8", "Páginas físicas 32"],
          questions: [
            {
              q: "¿Cuál de estas conclusiones es válida?",
              options: [
                "Descodificación y autorización de cancelación resuelven preguntas distintas",
                "Un código desconocido autoriza automáticamente cancelar",
                "Todo texto corto usa necesariamente códigos ICAO",
              ],
              answer: 0,
              why: "La fuente establece condiciones independientes para abreviación y cancelación.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Aterrizaje",
          title: "Repaso del chapter.",
          body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
          recap: [
            ["Service Extension and Station Closure", "Tema revisado dentro de este chapter."],
            [
              "Acceptance Transmission and Delivery of Messages",
              "Tema revisado dentro de este chapter.",
            ],
            ["Time System and Communication Records", "Tema revisado dentro de este chapter."],
            ["Establishment of Radiocommunication", "Tema revisado dentro de este chapter."],
            [
              "Abbreviations Codes and Message Cancellation",
              "Tema revisado dentro de este chapter.",
            ],
          ],
          refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
          final: true,
        },
      ],
    },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-4-aeronautical-fixed-service-afs-4": {
    id: "annex10-v2-chapter-4",
    folder: "04_Aeronautical_Fixed_Service_AFS",
    name: "Aeronautical Fixed Service (AFS)",
    subtitle: "8 temas · 38 misiones",
    year: "ICAO Annex 10 · Volume II",
    word: "Chapter 4",
    sources: [
      "1.1; 4.1.1 · páginas 20, 33",
      "1.9; 4.2–4.3 · páginas 24, 25, 36",
      "4.1.1 Note 4; 4.5 · páginas 33, 74",
      "4.1.1 Notes 3–7 · páginas 33",
      "4.1.2 · páginas 34, 35",
      "4.1.2.3–4.1.2.6; 4.4.15.4–4.4.15.6; 4.4.17 · páginas 35, 71, 72, 73, 74",
      "4.4.1.1 · páginas 36, 37",
      "4.4.1.1.3–4.4.1.1.8 · páginas 36, 37",
      "4.4.1.1.9 · páginas 37, 38",
      "4.4.1.1; 4.4.3.1.1 · páginas 36, 37, 38, 46",
      "4.4.1.2 · páginas 38",
      "4.4.1.3 · páginas 38, 39",
      "4.4.1.4 · páginas 39, 40",
      "4.4.1.5; 4.4.16 · páginas 41, 42, 73",
      "4.4.1.6–4.4.1.8 · páginas 42, 43",
      "4.4.11.1–4.4.11.8 · páginas 56, 57, 58",
      "4.4.11.6–4.4.11.15 · páginas 58, 59, 60, 61, 62",
      "4.4.12–4.4.13; 4.4.15.3.7–3.10 · páginas 62, 63, 70",
      "4.4.14 · páginas 63, 64",
      "4.4.15.1–4.4.15.2 · páginas 65, 66, 68, 69",
      "4.4.15.3 · páginas 69, 70, 71",
      "4.4.15; Figure 4-4 · páginas 64, 65, 66, 67",
      "4.4.2.1 · páginas 43, 44",
      "4.4.2–4.4.6; Figure 4-1 · páginas 43, 44, 45, 46, 48, 50, 51",
      "4.4.3.1.2.1; 4.4.4.2.1 · páginas 47, 48",
      "4.4.3.1.2.2; 4.4.4.2.2 · páginas 47, 48, 49",
      "4.4.3.1.2.3; 4.4.5.2; 4.4.8 · páginas 47, 48, 50, 52",
      "4.4.3.1.2; 4.4.4.2 · páginas 46, 47, 48",
      "4.4.3–4.4.4 · páginas 46, 47, 48",
      "4.4.3–4.4.4 · páginas 46, 47, 48, 49",
      "4.4.5.7; Attachment B · páginas 50, 133, 134",
      "4.4.5–4.4.6; 4.4.9.1 · páginas 49, 50, 51, 52",
      "4.4.6.1 Note 2 · páginas 51",
      "4.4.8–4.4.10.1.1.2 · páginas 52, 54",
      "4.4.9.1–4.4.9.2; 4.4.10.1.2–1.5 · páginas 52, 54, 55, 56",
      "4.4.9.3; 4.4.10.1.6–1.7 · páginas 52, 53, 54, 56",
      "4.6; Table 4-1 · páginas 74, 75",
      "4.7 · páginas 75",
    ],
    steps: [
      {
        label: "Despegue",
        title: "Aeronautical Fixed Service (AFS)",
        body: "Chapter 4 de ICAO Annex 10, Volume II. Este recorrido reúne 8 temas fuente en su orden académico.",
        hero: true,
        cards: [
          [
            "Introduction to AFS",
            "AFS es más amplio que AFTN. Reconoce sus sistemas y el tipo de intercambio que permite cada uno.",
          ],
          [
            "AFTN Message Categories and Priority",
            "Clasifica mensajes AFTN y distingue el indicador de dos letras del nivel efectivo de prioridad de transmisión.",
          ],
          [
            "AFTN Message Format ITA2",
            "Lee las cinco partes del formato y reconoce qué datos se conservan, qué señales delimitan y qué límites se aplican.",
          ],
          [
            "AFTN Addressing and Origin",
            "Separa ubicación, organización y división. Aprende qué información adicional exige un designador especial.",
          ],
          [
            "AFTN Service Messages and Error Handling",
            "Una anomalía de secuencia, dirección, origen o texto necesita una respuesta distinta. Aprende a identificarla antes de actuar.",
          ],
          [
            "AFTN Normal Transmission Procedures",
            "El heading cambia en cada retransmisión; las obligaciones de routing, comprobación y retención no desaparecen.",
          ],
          [
            "AFTN Message Format IA5",
            "Compara el formato con ITA-2 sin trasladar mecánicamente sus caracteres de inicio y final.",
          ],
          [
            "CIDIN ATSMHS and ICC",
            "Comprende qué aporta cada sistema al intercambio ground-ground, con el alcance que sí desarrolla Volume II.",
          ],
        ],
      },
      {
        label: "Introduction to AFS · 1",
        title: "AFS: la familia completa",
        body: '<p><strong>Aeronautical Fixed Service</strong> conecta puntos fijos especificados para apoyar la seguridad y la operación regular, eficiente y económica. En Chapter 4 se trata la comunicación ground-ground punto a punto o punto a multipunto.</p><div class="table-scroll"><table><thead><tr><th>Sistema o aplicación</th><th>Papel en este volumen</th></tr></thead><tbody><tr><td>ATS direct speech</td><td>Circuitos y redes de voz directa entre unidades ATS.</td></tr><tr><td>Meteorological operational</td><td>Circuitos, redes y sistemas de broadcast de información meteorológica.</td></tr><tr><td>AFTN</td><td>Mensajería store-and-forward de texto ITA-2 o IA-5.</td></tr><tr><td>CIDIN</td><td>Transporte común de mensajes de aplicaciones, binarios o de texto.</td></tr><tr><td>ATSMHS</td><td>Intercambio de mensajes ATS entre usuarios sobre ATN ICS.</td></tr><tr><td>ICC</td><td>Intercambio entre unidades ATS para servicios operacionales.</td></tr></tbody></table></div>',
        guide: "4.1.1 enumera seis sistemas y aplicaciones; AFTN es uno de ellos.",
        refs: ["Annex 10, Volume II · 1.1; 4.1.1", "Páginas físicas 20, 33"],
        questions: [
          {
            q: "¿Qué relación es correcta?",
            options: [
              "AFTN forma parte de AFS",
              "AFS y AFTN significan exactamente lo mismo",
              "AFS solo transporta voz",
            ],
            answer: 0,
            why: "4.1.1 enumera seis sistemas y aplicaciones; AFTN es uno de ellos.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to AFS · 2",
        title: "Voz ATS y canales meteorológicos",
        body: '<p>Un <strong>ATS direct speech circuit</strong> es un circuito telefónico AFS para intercambio directo entre unidades ATS. La Note de 4.2 remite sus disposiciones detalladas a Annex 11; no las añadimos aquí.</p><p><span class="norm">Standard</span> Los procedimientos de canales y redes meteorológicas operacionales deben ser compatibles con AFTN.</p><p><span class="norm">Note</span> Compatibilidad significa que la información puede intercambiarse por AFTN y viceversa sin efectos perjudiciales para su operación. Una meteorological operational telecommunication network integra canales para intercambiar información conforme a horarios preestablecidos.</p>',
        guide:
          "La Note de 4.3 explica la compatibilidad operacional sin exigir que todos los sistemas sean idénticos.",
        refs: ["Annex 10, Volume II · 1.9; 4.2–4.3", "Páginas físicas 24, 25, 36"],
        questions: [
          {
            q: "¿Qué significa compatible en 4.3?",
            options: [
              "Que la información pueda intercambiarse con AFTN sin perjudicar su operación",
              "Que toda comunicación tenga que ser de voz",
              "Que se eliminen los horarios preestablecidos",
            ],
            answer: 0,
            why: "La Note de 4.3 explica la compatibilidad operacional sin exigir que todos los sistemas sean idénticos.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to AFS · 3",
        title: "Preparar texto que pueda circular",
        body: '<span class="norm">Standard</span> <p>Los mensajes de texto admiten letras A–Z, cifras 0–9 y los signos <code>- ? : ( ) . , ’ = / +</code>. Otros caracteres solo se usan cuando sean absolutamente necesarios para comprender el texto y se escriben completos en palabras.</p><p>No se emplean números romanos: si deben indicarse, se usa la cifra arábiga precedida de <strong>ROMAN</strong>. Se evita plain language cuando códigos o abreviaturas apropiados puedan reducir la extensión; no se añaden expresiones de cortesía innecesarias.</p><p>Hay secuencias reservadas para delimitar mensajes, como ZCZC y NNNN en ITA-2. Las funciones y restricciones completas de ITA-2 e IA-5 se estudian en sus formatos. La Note de 4.1.2 excluye de este apartado las ATS voice communications.</p>',
        guide: "4.1.2.4 prohíbe numerales romanos y prescribe ROMAN seguido del número arábigo.",
        refs: ["Annex 10, Volume II · 4.1.2", "Páginas físicas 34, 35"],
        questions: [
          {
            q: "¿Cómo indica el texto que se pretende un número romano?",
            options: [
              "ROMAN seguido de la cifra arábiga",
              "Usando directamente letras romanas sin explicación",
              "No existe ninguna forma prevista",
            ],
            answer: 0,
            why: "4.1.2.4 prohíbe numerales romanos y prescribe ROMAN seguido del número arábigo.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Introduction to AFS · 4",
        title: "Un destino, distintas capas",
        body: '<p><span class="norm">Note</span> AFTN ofrece store-and-forward; CIDIN transporta mensajes para aplicaciones como AFTN y OPMET. ATSMHS e ICC funcionan sobre ATN ICS y permiten la transición de usuarios y sistemas AFTN/CIDIN a la arquitectura ATN.</p><p>La diferencia que debes retener ahora es funcional: <strong>servicio</strong>, <strong>red de mensajería</strong> y <strong>aplicación</strong> no son nombres intercambiables. En los siguientes recorridos construirás mensajes AFTN; el último LP del chapter desarrolla CIDIN, ATSMHS e ICC al nivel que ofrece la fuente.</p>',
        guide: "La Note 3 de 4.1.1 describe así AFTN.",
        refs: ["Annex 10, Volume II · 4.1.1 Notes 3–7", "Páginas físicas 33"],
        questions: [
          {
            q: "Selecciona el servicio descrito como store-and-forward de texto ITA-2 o IA-5.",
            options: ["AFTN", "Solo ATS direct speech", "Direction finding"],
            answer: 0,
            why: "La Note 3 de 4.1.1 describe así AFTN.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Categories and Priority · 1",
        title: "Las categorías y sus indicadores",
        body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Indicador</th><th>Categoría</th><th>Qué incluye</th></tr></thead><tbody><tr><td>SS</td><td>Distress</td><td>Peligro grave e inminente notificado por estación móvil y asistencia inmediata requerida.</td></tr><tr><td>DD</td><td>Urgency</td><td>Seguridad de buque, aeronave, otro vehículo o personas a bordo o a la vista.</td></tr><tr><td>FF</td><td>Flight safety</td><td>Movimiento/control; interés inmediato para aeronaves en vuelo o preparando salida; meteorología específica indicada.</td></tr><tr><td>GG</td><td>Meteorological</td><td>Pronósticos, observaciones y reportes de la categoría.</td></tr><tr><td>GG</td><td>Flight regularity</td><td>Carga para peso y balance, horarios, servicing, desviaciones colectivas de pasajeros/crew/carga, aterrizajes no rutinarios, preparativos pre-flight, llegadas/salidas, partes urgentes.</td></tr><tr><td>GG</td><td>AIS</td><td>NOTAM y SNOWTAM.</td></tr><tr><td>KK</td><td>Aeronautical administrative</td><td>Operación/mantenimiento de instalaciones, funcionamiento de telecomunicaciones y asuntos de servicios entre autoridades.</td></tr><tr><td>Según corresponda</td><td>Service messages</td><td>Verificación y corrección de otros mensajes y control de secuencias.</td></tr></tbody></table></div>',
        guide:
          "4.4.1.1.6 asigna GG a AIS. No confundas esta tabla AFTN con la prioridad de un NOTAM en voz, que depende de su contenido.",
        refs: ["Annex 10, Volume II · 4.4.1.1; 4.4.3.1.1", "Páginas físicas 36, 37, 38, 46"],
        questions: [
          {
            q: "Un NOTAM se clasifica en AFTN bajo la categoría AIS. ¿Qué indicador le corresponde?",
            options: ["GG", "KK", "SS por ser un NOTAM"],
            answer: 0,
            why: "4.4.1.1.6 asigna GG a AIS. No confundas esta tabla AFTN con la prioridad de un NOTAM en voz, que depende de su contenido.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Categories and Priority · 2",
        title: "Meteorología no siempre significa GG",
        body: '<p><span class="norm">Standard</span> Dentro de <strong>FF</strong> están SIGMET, special air-reports, AIRMET, avisos de ceniza volcánica y ciclón tropical, y pronósticos enmendados. La categoría meteorological <strong>GG</strong> comprende pronósticos como TAF y pronósticos de área/ruta, observaciones y reportes como METAR y SPECI.</p><p>La solicitud de información lleva el mismo indicador de la categoría solicitada, salvo que la flight safety justifique una prioridad mayor. No basta con reconocer que el mensaje «habla del tiempo»; hay que identificar su categoría concreta.</p>',
        guide: "4.4.1.1.3 c) lo incluye expresamente en flight safety messages.",
        refs: ["Annex 10, Volume II · 4.4.1.1.3–4.4.1.1.8", "Páginas físicas 36, 37"],
        questions: [
          {
            q: "Según la lista de AFTN, ¿qué indicador corresponde a SIGMET?",
            options: ["FF", "GG en todos los casos", "KK"],
            answer: 0,
            why: "4.4.1.1.3 c) lo incluye expresamente en flight safety messages.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Categories and Priority · 3",
        title: "Tres niveles, cinco indicadores",
        body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Prioridad de transmisión</th><th>Indicadores</th></tr></thead><tbody><tr><td>1</td><td>SS</td></tr><tr><td>2</td><td>DD y FF</td></tr><tr><td>3</td><td>GG y KK</td></tr></tbody></table></div><p>No ordenes automáticamente los cinco indicadores como cinco niveles sucesivos. DD y FF comparten el nivel 2; GG y KK comparten el 3.</p><p><span class="norm">Recommendation</span> Los mensajes con el mismo indicador deberían transmitirse en el orden en que se reciben para transmisión.</p>',
        guide: "Es la tabla de 4.4.1.2.1: tres niveles de transmisión.",
        refs: ["Annex 10, Volume II · 4.4.1.2", "Páginas físicas 38"],
        order: ["SS", "DD / FF", "GG / KK"],
      },
      {
        label: "AFTN Message Categories and Priority · 4",
        title: "La ruta más expedita disponible",
        body: '<p><span class="norm">Standard</span> La comunicación se enruta por la ruta disponible más expedita. Cuando hace falta, se acuerdan rutas alternativas y listas de diversion routing. Si el tráfico retenido en origen no puede cursarse en un período razonable, se consulta al originador, salvo los acuerdos o desvíos automáticos a servicios comerciales previstos.</p><p><span class="norm">Recommendation</span> Con centros totalmente automáticos, el desvío hacia otro centro totalmente automático debería empezar inmediatamente al detectar una interrupción; hacia uno no totalmente automático, dentro de diez minutos. En centros no totalmente automáticos, también dentro de diez minutos. Sin acuerdos previos, se recomienda notificación por service message.</p><p><span class="norm">Note</span> «Período razonable» depende del tránsito aplicable a la categoría o de lo acordado, no de un plazo universal inventado.</p>',
        guide:
          "El apartado distingue configuración de centros y expresa esos tiempos como Recommendation.",
        refs: ["Annex 10, Volume II · 4.4.1.3", "Páginas físicas 38, 39"],
        questions: [
          {
            q: "¿Es universalmente obligatorio esperar diez minutos antes de desviar?",
            options: [
              "No; los tiempos son Recommendation y algunos casos indican desvío inmediato",
              "Sí, todos los desvíos empiezan exactamente a los diez minutos",
              "No se permite diversion routing",
            ],
            answer: 0,
            why: "El apartado distingue configuración de centros y expresa esos tiempos como Recommendation.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Categories and Priority · 5",
        title: "Clasificador de mensajes AFTN",
        body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
        guide:
          "El contenido determina la categoría y su indicador. Recuerda después agrupar los indicadores en tres niveles de transmisión.",
        refs: ["Annex 10, Volume II · 4.4.1.1", "Páginas físicas 36, 37"],
        match: [
          ["Distress", "SS"],
          ["Urgency", "DD"],
          ["SIGMET", "FF"],
          ["METAR", "GG"],
          ["Aeronautical administrative", "KK"],
        ],
      },
      {
        label: "AFTN Message Format ITA2 · 1",
        title: "Ver el mensaje completo",
        body: '<p>La estructura es <strong>heading → address → origin → text → ending</strong>. La Figure 4-1 distingue la parte permanente y las señales que permiten tratar el mensaje en teletypewriter.</p><div class="concepts"><article><h3>Heading</h3><p>Inicia y distingue una transmisión por un canal.</p></article><article><h3>Address y origin</h3><p>Indican prioridad, destinatarios, momento de presentación y originador.</p></article><article><h3>Text y ending</h3><p>Transportan el contenido y delimitan su cierre.</p></article></div><p>En la figura, <code>↑</code> es FIGURE SHIFT, <code>↓</code> LETTER SHIFT, <code>→</code> SPACE, <code>&lt;</code> CARRIAGE RETURN y <code>≡</code> LINE FEED. No confundas estos símbolos explicativos con palabras del mensaje.</p>',
        guide: "La Figure 4-1 muestra ese orden y la función de cada parte.",
        refs: [
          "Annex 10, Volume II · 4.4.2–4.4.6; Figure 4-1",
          "Páginas físicas 43, 44, 45, 46, 48, 50, 51",
        ],
        order: ["Heading", "Address", "Origin", "Text", "Ending"],
        figure: {
          src: "/lp/annex10/figures/source-page-45.png",
          alt: "Figure 4-1. Message format ITA-2",
        },
      },
      {
        label: "AFTN Message Format ITA2 · 2",
        title: "Heading: identificar esta transmisión",
        body: '<span class="norm">Standard</span> <p>Empieza con <strong>ZCZC</strong>. La transmission identification contiene tres letras de circuito y el channel-sequence number: transmisora, receptora, canal. Si solo existe un canal, se asigna A; con varios, A, B, C…</p><p>La secuencia de tres cifras va de 001 a 000 (que representa 1000), por canal, con nueva serie diaria a las 0000. <strong>GLB039</strong>, ejemplo oficial, significa mensaje 39 por canal B desde G hacia L. Después van cinco SPACES y un LETTER SHIFT. Puede incluirse información de servicio acordada, precedida de SPACE, máximo diez caracteres y sin alignment functions.</p><p><span class="norm">Recommendation</span> Se permite número de secuencia de cuatro cifras, sujeto al acuerdo de las autoridades, para evitar duplicación en 24 horas.</p>',
        guide: "G identifica la transmisora, L la receptora y B el canal; 039 es la secuencia.",
        refs: ["Annex 10, Volume II · 4.4.2.1", "Páginas físicas 43, 44"],
        questions: [
          {
            q: "En GLB039, ¿qué representa B?",
            options: ["El canal", "El destinatario final del texto", "La prioridad"],
            answer: 0,
            why: "G identifica la transmisora, L la receptora y B el canal; 039 es la secuencia.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format ITA2 · 3",
        title: "Address y origin: no intercambiar campos",
        body: "<p><strong>Address</strong>: alignment, indicador de prioridad, indicadores de destinatarios y alignment. Cada addressee indicator tiene ocho letras. La dirección completa se limita a tres líneas.</p><p><strong>Origin</strong>: filing time de seis cifras, originator indicator de ocho letras, priority alarm si corresponde, campo opcional y alignment. Filing time es la fecha/hora de presentación para transmisión, no el channel-sequence number.</p><p>La priority alarm se usa únicamente en distress: FIGURE SHIFT, cinco señales n.º 10 en figure case y LETTER SHIFT. Los datos opcionales del origin se permiten por acuerdo sin superar 69 caracteres de línea. El siguiente LP desarrolla el significado de cada posición del indicador.</p>",
        guide:
          "4.4.4.1 identifica filing time como un date-time group de seis cifras dentro de origin.",
        refs: ["Annex 10, Volume II · 4.4.3–4.4.4", "Páginas físicas 46, 47, 48, 49"],
        questions: [
          {
            q: "¿En qué parte está el grupo de fecha y hora de presentación?",
            options: ["Origin", "Heading como channel-sequence number", "Ending"],
            answer: 0,
            why: "4.4.4.1 identifica filing time como un date-time group de seis cifras dentro de origin.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format ITA2 · 4",
        title: "Text y ending: cerrar con precisión",
        body: '<span class="norm">Standard</span> <p>El texto sigue 4.1.2. La identificación explícita exigida por YYY, YXY o ZZZ precede a la referencia del originador cuando corresponda. <strong>CFM</strong> introduce una confirmación; <strong>COR</strong>, una corrección, cada una tras alignment. Las correcciones se incorporan antes de entrega local.</p><p>El end-of-text es LETTER SHIFT + CARRIAGE RETURN + LINE FEED. Después, el ending contiene <strong>siete LINE FEEDS y NNNN</strong>; al transmitir a torn-tape relay stations se añaden doce LETTER SHIFTS como message-separation signal. NNNN debe permanecer intacto.</p><p>Límites: texto de origen ≤1800 caracteres; mensaje completo de ZCZC a NNNN inclusive ≤2100; línea impresa ≤69 caracteres y/o espacios. Los conteos incluyen caracteres no imprimibles según las fronteras del apartado.</p>',
        guide: "NNNN cumple una función de delimitación que no puede sustituirse por texto libre.",
        refs: ["Annex 10, Volume II · 4.4.5–4.4.6; 4.4.9.1", "Páginas físicas 49, 50, 51, 52"],
        questions: [
          {
            q: "¿NNNN puede sustituirse por una palabra de cortesía al terminar?",
            options: [
              "No; es el end-of-message signal prescrito",
              "Sí, si se entiende el texto",
              "Solo los mensajes SS usan NNNN",
            ],
            answer: 0,
            why: "NNNN cumple una función de delimitación que no puede sustituirse por texto libre.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format ITA2 · 5",
        title: "Un mensaje largo se divide con contexto",
        body: '<p><span class="norm">Standard</span> Un texto de más de 1800 caracteres se ingresa como mensajes separados, cada uno dentro del límite.</p><p><span class="norm">Attachment · guía</span> Attachment B propone conservar address y origin iguales en las partes y señalar la secuencia en la última línea del texto: <code>// END PART 01 //</code>, <code>// END PART 02 //</code> y, para la última de tres, <code>// END PART 03/03 //</code>. La información de secuencia cuenta dentro de los caracteres del texto.</p><p>El límite procede del capítulo; el modo de marcar las partes es guidance del Attachment. No tienen que presentarse como disposiciones del mismo estatus.</p>',
        guide: "La Note de Attachment B incluye la secuencia de las partes en el conteo del texto.",
        refs: ["Annex 10, Volume II · 4.4.5.7; Attachment B", "Páginas físicas 50, 133, 134"],
        questions: [
          {
            q: "¿La etiqueta END PART cuenta dentro del límite del texto?",
            options: ["Sí", "No, porque es solo una ayuda", "Únicamente en la última parte"],
            answer: 0,
            why: "La Note de Attachment B incluye la secuencia de las partes en el conteo del texto.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format ITA2 · 6",
        title: "Localiza los campos ITA-2",
        body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
        guide:
          "Este ejercicio usa las líneas del ejemplo oficial de page-copy; no representa todos los caracteres no imprimibles. La Figure 4-1 conserva el formato completo.",
        refs: ["Annex 10, Volume II · 4.4.6.1 Note 2", "Páginas físicas 51"],
        match: [
          ["ZCZC LPA183", "Heading"],
          ["GG LGGGZRZX LGATKLMW", "Address"],
          ["201838 EGLLKLMW", "Origin"],
          ["As required", "Text del esquema ilustrativo"],
          ["Page feed + NNNN", "Ending"],
        ],
      },
      {
        label: "AFTN Addressing and Origin · 1",
        title: "Lee un indicador como 4 + 3 + 1",
        body: '<span class="norm">Standard</span> <p>El indicador de destinatario contiene location indicator de <strong>cuatro letras</strong>, designador de organización/función de <strong>tres letras</strong> y una letra de departamento, división o proceso. Si no se requiere identificar este último, se completa con <strong>X</strong>.</p><p>El originator indicator usa la misma organización 4 + 3 + 1, pero identifica dónde y quién origina. En el ejemplo oficial <code>LGATYMYF</code>: LGAT es la ubicación, YMY la Meteorological Office y F su sección. No se consulta ni se inventa aquí un directorio adicional.</p>',
        guide: "El patrón es ubicación, organización/función y división/proceso.",
        refs: ["Annex 10, Volume II · 4.4.3.1.2; 4.4.4.2", "Páginas físicas 46, 47, 48"],
        order: ["LGAT", "YMY", "F"],
      },
      {
        label: "AFTN Addressing and Origin · 2",
        title: "YYY y YXY: el nombre va en el texto",
        body: '<span class="norm">Standard</span> <p>Una organización sin designador ICAO de tres letras usa <strong>YYY</strong>; si es servicio u organización militar, <strong>YXY</strong>. La octava posición es X. El nombre específico se incluye al comienzo del texto.</p><p>Esto se aplica tanto al destinatario como al originador. <code>LGATYYYX</code> no revela por sí solo cuál es la organización; el texto completa esa información.</p><pre>GG NCRGYYYX\n311521 PHNLYYYX\nAIR PENGUIN FLIGHT 801\nCANCELLED</pre><p class="small">Ejemplo del Annex, sin heading ni ending. La línea de texto identifica la organización conforme al ejemplo publicado.</p>',
        guide: "YXY identifica este caso; el nombre específico se añade al comienzo del texto.",
        refs: ["Annex 10, Volume II · 4.4.3.1.2.1; 4.4.4.2.1", "Páginas físicas 47, 48"],
        questions: [
          {
            q: "Una organización militar no tiene designador asignado. ¿Qué grupo especial se usa?",
            options: [
              "YXY, seguido de X",
              "ZZZ, seguido de X",
              "YYY sin identificarla en el texto",
            ],
            answer: 0,
            why: "YXY identifica este caso; el nombre específico se añade al comienzo del texto.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Addressing and Origin · 3",
        title: "ZZZ: el tramo que conecta con la aeronave",
        body: '<span class="norm">Standard</span> <p>Si el destinatario es una aeronave en vuelo, se usa la ubicación de la estación que hará el relay por mobile service + <strong>ZZZX</strong>. La aeronave se identifica al inicio del texto.</p><p>Si la aeronave origina el mensaje, origin usa la ubicación de la estación que lo transfiere a AFTN + ZZZX; el texto identifica la aeronave originadora.</p><pre>FF CZEGZRZX\n031821 CYCBZZZX\nKLM153 [resto del texto recibido]</pre><p class="small">Ejemplo de 4.4.4.2.2, con el marcador explicativo del resto del texto traducido. CYCB es la estación que ingresa el mensaje a AFTN; no es la aeronave.</p>',
        guide: "ZZZX señala que se necesita la identificación explícita en texto; no la reemplaza.",
        refs: ["Annex 10, Volume II · 4.4.3.1.2.2; 4.4.4.2.2", "Páginas físicas 47, 48, 49"],
        questions: [
          {
            q: "En un originator indicator con ZZZX, ¿dónde se identifica la aeronave originadora?",
            options: [
              "Al comienzo del texto",
              "En lugar del channel-sequence number",
              "Nunca se identifica",
            ],
            answer: 0,
            why: "ZZZX señala que se necesita la identificación explícita en texto; no la reemplaza.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Addressing and Origin · 4",
        title: "Varias identificaciones sin perder el orden",
        body: '<span class="norm">Standard</span> <p>Cuando YXY, YYY o ZZZ se refiere a varias organizaciones, sus identificaciones en texto siguen el orden de address y origin. Cada destinatario va seguido por alignment; el originador se introduce con <strong>FROM</strong> y el conjunto termina con <strong>STOP</strong> y alignment antes del resto.</p><p>Si los destinatarios exceden tres líneas, se crean dos o más mensajes conformes al límite, ordenando indicadores para minimizar retransmisiones cuando sea practicable. En relay, <strong>stripped address</strong> elimina destinatarios que el siguiente centro, estación de destino o conjunto del circuito multipunto no necesita atender.</p>',
        guide:
          "4.4.8 conserva las responsabilidades de entrega y relay del tramo, retirando indicadores que no le corresponden.",
        refs: [
          "Annex 10, Volume II · 4.4.3.1.2.3; 4.4.5.2; 4.4.8",
          "Páginas físicas 47, 48, 50, 52",
        ],
        questions: [
          {
            q: "¿Qué hace stripped address?",
            options: [
              "Elimina indicadores innecesarios para el siguiente tramo o entrega correspondiente",
              "Elimina todos los destinatarios",
              "Cambia el originador por cada relay",
            ],
            answer: 0,
            why: "4.4.8 conserva las responsabilidades de entrega y relay del tramo, retirando indicadores que no le corresponden.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Addressing and Origin · 5",
        title: "Distribución predeterminada",
        body: '<p><span class="norm">Standard</span> Con acuerdo entre Administrations, el PDAI usa: primeras dos letras del location indicator del centro del Estado que implementa el sistema; <strong>ZZ</strong> en posiciones 3–4; tres letras para lista de distribución; y X u otra letra que precise la lista. En la quinta posición, N y S se reservan para NOTAM y SNOWTAM.</p><p>Los Estados intercambian PDAIs y sus listas asociadas para asegurar routing y retransmisiones. Las listas pueden incluir destinatarios nacionales, internacionales y PDAIs internacionales.</p><p><span class="norm">PANS</span> Deberían usarse PDAIs siempre que sea posible entre Estados que acordaron el sistema. <span class="norm">Note</span> Se excluyen combinaciones ZC, CZ y NN para evitar conflicto con delimitadores.</p>',
        guide: "El formato especial de PDAI no debe confundirse con ZZZ en un indicador ordinario.",
        refs: ["Annex 10, Volume II · 4.4.14", "Páginas físicas 63, 64"],
        questions: [
          {
            q: "¿Qué indican ZZ en posiciones tercera y cuarta de un PDAI?",
            options: [
              "Necesidad de distribución especial",
              "Una aeronave en vuelo",
              "El canal de transmisión",
            ],
            answer: 0,
            why: "El formato especial de PDAI no debe confundirse con ZZZ en un indicador ordinario.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Addressing and Origin · 6",
        title: "Designadores que piden contexto",
        body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
        guide:
          "YYY, YXY y ZZZ necesitan identificación específica al principio del texto. X completa la octava posición en esos casos.",
        refs: ["Annex 10, Volume II · 4.4.3–4.4.4", "Páginas físicas 46, 47, 48"],
        match: [
          ["YYY", "Organización sin designador ICAO de tres letras"],
          ["YXY", "Servicio u organización militar sin designador"],
          ["ZZZ", "Aeronave en vuelo que requiere tramo AFTN"],
          ["X en octava posición", "Filler cuando no se identifica división/proceso"],
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 1",
        title: "Service message: referencia clara",
        body: '<p><span class="norm">Standard</span> Los service messages obtienen información o verifican mensajes transmitidos incorrectamente, confirman secuencias y realizan funciones afines. Usan formato completo y prioridad apropiada. El texto empieza con <strong>SVC</strong>, excepto el acknowledgement de SS.</p><p>Para una fixed station identificada solo por ubicación se usa location indicator + <strong>YFY</strong> + octava letra apropiada. La respuesta se dirige a quien originó el service message. Una corrección se envía a todos los destinatarios que recibieron la transmisión incorrecta. La referencia usa transmission identification o filing time + originator indicator.</p><p><span class="norm">Recommendation</span> Se recomienda texto conciso y, al referirse a un mensaje anterior, su mismo indicador de prioridad.</p>',
        guide: "La corrección sigue el alcance del error, no una distribución arbitraria.",
        refs: ["Annex 10, Volume II · 4.4.1.1.9", "Páginas físicas 37, 38"],
        questions: [
          {
            q: "¿A quién se dirige una corrección de transmisión?",
            options: [
              "A todos los destinatarios que recibieron la transmisión incorrecta",
              "Solo al primer destinatario",
              "Siempre a todas las estaciones del mundo",
            ],
            answer: 0,
            why: "La corrección sigue el alcance del error, no una distribución arbitraria.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 2",
        title: "Secuencia ausente o mensaje mal encaminado",
        body: '<span class="norm">Standard</span> <p>La receptora verifica la secuencia de cada canal. Si faltan números, envía a la estación anterior un service message con <strong>QTA MIS</strong> y las identificaciones ausentes. La anterior reasume responsabilidad y retransmite con nueva identificación correcta; la receptora espera después el último número recibido + 1.</p><p>Un <strong>misrouted message</strong> no contiene instrucciones de relay sobre las que la receptora pueda actuar. Puede rechazarlo con <strong>SVC QTA MSR</strong> + identificación, o asumir su transmisión a todos los destinatarios. El rechazo devuelve la responsabilidad a la anterior.</p><p><span class="norm">Recommendation</span> Para una secuencia menor que la esperada: SVC LR + recibida + EXP + esperada; se recomienda sincronizar y revisar la secuencia saliente.</p>',
        guide:
          "MIS trata secuencia ausente; MSR trata misrouting; OGN trata origin. Los ejemplos aquí omiten señales de control para centrar la decisión.",
        refs: ["Annex 10, Volume II · 4.4.1.4", "Páginas físicas 39, 40"],
        questions: [
          {
            q: "Falta ABC123. ¿Qué texto simplificado corresponde a la anomalía?",
            options: ["SVC QTA MIS ABC123", "SVC QTA MSR ABC123", "SVC QTA OGN ABC123 CORRUPT"],
            answer: 0,
            why: "MIS trata secuencia ausente; MSR trata misrouting; OGN trata origin. Los ejemplos aquí omiten señales de control para centrar la decisión.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 3",
        title: "Texto mutilado: localizar el punto de falla",
        body: '<p><span class="norm">Standard</span> Antes de retransmitir, si se cree que la mutilación ocurrió antes de llegar a la estación anterior, se pide repetición al <strong>originador</strong> usando la referencia de origin. Si ocurrió durante o después de la transmisión de la estación anterior, se rechaza y pide repetición a <strong>esa estación</strong> usando transmission identification. En ambos casos se usa QTA RPT.</p><p>El originador que reasume responsabilidad por 4.4.11.2 prepara nuevo heading y añade <strong>DUPE</strong> conforme a 4.4.11.3. La estación anterior que tiene copia correcta la retransmite con nueva identificación; si no la tiene, pide al originador.</p><p>Durante relay, si aún no se envió un cierre correcto, se cancela con <strong>QTA QTA</strong> y ending completo, se reasume responsabilidad y se solicita recuperación. Si ya se envió todo y existe copia correcta, se envía <strong>SVC CORRECTION (origin) STOP (texto correcto)</strong> a los afectados.</p>',
        guide:
          "4.4.11.4 diferencia este caso del daño que ya existía antes de la estación anterior.",
        refs: ["Annex 10, Volume II · 4.4.11.1–4.4.11.8", "Páginas físicas 56, 57, 58"],
        questions: [
          {
            q: "Se cree que la mutilación ocurrió durante el envío de la estación anterior. ¿A quién se pide repetición?",
            options: [
              "A la estación anterior, con la transmission identification",
              "Siempre a todos los destinatarios",
              "Solo a una aeronave en vuelo",
            ],
            answer: 0,
            why: "4.4.11.4 diferencia este caso del daño que ya existía antes de la estación anterior.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 4",
        title: "Dirección, origen y cierre: tres diagnósticos",
        body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Anomalía</th><th>Acción / señal</th></tr></thead><tbody><tr><td>Address completamente mutilado</td><td>Rechazar a anterior: SVC QTA ADS [identificación] CORRUPT.</td></tr><tr><td>Indicador de destinatario inválido o desconocido</td><td>Relay a direcciones válidas bajo su responsabilidad; solicitar corrección con ADS y CHECK o UNKNOWN. Si es desconocido y origin está correcto, consultar al originador.</td></tr><tr><td>Origin mutilado o ausente en primer relay</td><td>Detener proceso; SVC QTA OGN [identificación] CORRUPT.</td></tr><tr><td>Originator incorrecto en primer relay</td><td>Detener proceso; SVC QTA OGN [identificación] INCORRECT.</td></tr><tr><td>Ending reconocible pero mutilado</td><td>Reparar cuando sea necesario antes de relay, o insertar cierre correcto si se detecta tras el texto.</td></tr><tr><td>Falta cierre y no se sabe si también falta texto</td><td>Insertar CHECK TEXT NEW ENDING ADDED, identificación propia y ending, con disposición escalonada prescrita.</td></tr></tbody></table></div><p>Las formas mostradas son esquemas de contenido; las funciones de control se consultan en los apartados citados. Un destinatario inválido tiene longitud distinta de ocho letras; desconocido no significa necesariamente inválido.</p>',
        guide: "4.4.11.13 exige relay de los destinatarios válidos y gestión específica del error.",
        refs: ["Annex 10, Volume II · 4.4.11.6–4.4.11.15", "Páginas físicas 58, 59, 60, 61, 62"],
        questions: [
          {
            q: "Hay un destinatario inválido y otros válidos. ¿Se descarta todo?",
            options: [
              "No: se atienden los válidos y se solicita corregir el error",
              "Sí: siempre se elimina el mensaje completo",
              "Se inventa una octava letra para completar",
            ],
            answer: 0,
            why: "4.4.11.13 exige relay de los destinatarios válidos y gestión específica del error.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 5",
        title: "Corregir durante la preparación",
        body: '<span class="norm">Standard</span> <p>En preparación de tape ITA-2, errores anteriores al texto requieren descartar y preparar de nuevo. En texto, cuando es posible, se retrocede y elimina con LETTERS; si no, se usa <strong>E E E</strong>, se repite el último grupo correcto y se continúa. Si se detecta después, se usa <strong>COR</strong>. El ending se escribe sin error.</p><p>Si el mensaje ya fluye hacia AFTN, no se cierra con errores conocidos sin corregir. Error antes del texto: <strong>QTA QTA</strong> y ending completo. Error de texto inmediato: E E E y último grupo correcto; tardío: COR.</p><p>En IA-5 off-line se reemplaza el carácter erróneo por <strong>DEL</strong>; on-line se usa E E E, y detección tardía usa COR. Las correcciones se incorporan antes de entrega local o transferencia a circuito manual.</p>',
        guide: "4.4.13.2 prescribe cancelar esa transmisión antes de completar un mensaje erróneo.",
        refs: [
          "Annex 10, Volume II · 4.4.12–4.4.13; 4.4.15.3.7–3.10",
          "Páginas físicas 62, 63, 70",
        ],
        questions: [
          {
            q: "Un error anterior al texto se detecta mientras el mensaje ya fluye a AFTN. ¿Qué corresponde?",
            options: [
              "Cancelar la transmisión incompleta con QTA QTA y ending completo",
              "Terminarlo como si estuviera correcto",
              "Insertar silenciosamente una letra en origin",
            ],
            answer: 0,
            why: "4.4.13.2 prescribe cancelar esa transmisión antes de completar un mensaje erróneo.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Service Messages and Error Handling · 6",
        title: "Circuito fallido e IA-5 computarizado",
        body: '<p><span class="norm">Standard</span> Ante falla del circuito fijo se intenta restablecer contacto cuanto antes; se avisa a estaciones directas afectadas por routing y también al restaurarlo. <span class="norm">Recommendation</span> Si no se restablece en un período razonable, se recomienda circuito alternativo autorizado. <span class="norm">Standard</span> Air-ground solo se permite excepcional y temporalmente, asegurando no interferir aeronaves en vuelo.</p><p>En fade-out/propagación adversa se mantiene watch en frecuencia regular y se transmite la secuencia DE, identificación tres veces, alignment, tres líneas RY, alignment y NNNN. Sin desvío preacordado, se intercambia SVC QSP, con RQ/NO/CNL según petición, rechazo o cancelación.</p><p>En IA-5 computarizado con control continuo, recuperación de mutilación pertenece al link control, sin service message posterior ni CHECK TEXT. Sin control continuo, se cancela responsabilidad de onward routing y se pide retransmisión; si no hay copia correcta, se pide al originador.</p>',
        guide: "La autorización condicionada está en 4.4.1.5.2.1.",
        refs: ["Annex 10, Volume II · 4.4.1.5; 4.4.16", "Páginas físicas 41, 42, 73"],
        questions: [
          {
            q: "¿Puede un circuito fijo fallido usar air-ground sin condiciones?",
            options: [
              "No; es excepcional y temporal, y debe asegurarse ausencia de interferencia a aeronaves en vuelo",
              "Sí, siempre sustituye a todos los circuitos fijos",
              "Nunca, aun en el caso excepcional previsto",
            ],
            answer: 0,
            why: "La autorización condicionada está en 4.4.1.5.2.1.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Normal Transmission Procedures · 1",
        title: "El Routing Directory orienta el relay",
        body: '<span class="norm">Standard</span> <p>Las transmisiones siguen responsabilidades de onward relay acordadas entre Administrations. Cada estación usa un <strong>Routing Directory</strong> con Routing List.</p><p>Si todas las ubicaciones de las líneas posteriores al heading son idénticas, la receptora asume el relay: usa circuito normal o alternativo. Si ninguno funciona, no devuelve el mensaje por el circuito de recepción sin notificarlo previamente por service message.</p><p>Stripped address conserva los indicadores necesarios para el tramo o entrega. <span class="norm">Recommendation</span> Un originador que no puede manejar service messages debería acordar con su centro cómo intercambiarlos.</p>',
        guide: "La condición de notificación previa evita una devolución sin coordinación.",
        refs: ["Annex 10, Volume II · 4.4.8–4.4.10.1.1.2", "Páginas físicas 52, 54"],
        questions: [
          {
            q: "No funcionan ni el circuito normal ni el alternativo. ¿Puede devolverse el mensaje sin aviso por el circuito de entrada?",
            options: [
              "No; debe notificarse antes mediante service message",
              "Sí; el circuito de entrada siempre es una devolución automática",
              "Se eliminan todos los destinatarios",
            ],
            answer: 0,
            why: "La condición de notificación previa evita una devolución sin coordinación.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Normal Transmission Procedures · 2",
        title: "Reprocesar y transmitir",
        body: '<span class="norm">Standard</span> <p>La transmisión sigue starting pulse si hace falta, heading, address, origin, text y ending. Con equipo receptor temporizado, tras 30 segundos o más de reposo se envía spacing impulse de 20–30 ms y se espera al menos 1,5 segundos antes del heading.</p><p>Para relay se elimina el heading anterior y se crea uno con identificación del <strong>canal saliente</strong>. Se preserva NNNN; en torn-tape se corta en la separación. Las necesidades de tape feed se acuerdan según 4.4.7.</p><p>En circuitos simplex, una serie no continúa más de aproximadamente cinco minutos. Cada mensaje recibido correctamente se entrega o retransmite sin esperar a terminar la serie. Cuando sea posible, se obtiene tape correcto antes de relay; un tape ilegible no se retransmite salvo juicio fundado de que no causará fallas posteriores.</p>',
        guide:
          "La identificación pertenece a la transmisión por un canal; el originador del mensaje no cambia por hacer relay.",
        refs: [
          "Annex 10, Volume II · 4.4.9.1–4.4.9.2; 4.4.10.1.2–1.5",
          "Páginas físicas 52, 54, 55, 56",
        ],
        questions: [
          {
            q: "¿Qué parte se reemplaza al retransmitir por otro canal?",
            options: [
              "El heading con nueva transmission identification",
              "El originator por el operador del relay",
              "La prioridad por KK en todos los casos",
            ],
            answer: 0,
            why: "La identificación pertenece a la transmisión por un canal; el originador del mensaje no cambia por hacer relay.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
        figure: {
          src: "/lp/annex10/figures/source-page-54.png",
          alt: "Figure 4-2. Form of transmission — teletypewriter operation",
        },
      },
      {
        label: "AFTN Normal Transmission Procedures · 3",
        title: "Comprobar continuidad sin acusar todo",
        body: '<p><span class="norm">Standard</span> En teletypewriter no se envía acknowledgement por cada mensaje recibido, salvo la excepción <strong>SS</strong>; se controla la continuidad por secuencias. El destino AFTN acusa individualmente SS al origen mediante mensaje completo SS con alarm y texto <strong>R + origin del mensaje</strong>, sin repetir su alarm ni información opcional.</p><p>Los channel checks usan heading, alignment, <strong>CH</strong>, alignment y cierre; se verifica secuencia. Si falta uno fuera de la tolerancia acordada, se pide con SVC MIS CH, hora opcional y LR + última identificación. Hay excepciones acordadas por protocolo de control o ARQ.</p><p><span class="norm">Recommendation</span> En circuito libre se recomiendan checks H+00, H+20 y H+40. <span class="norm">Standard</span> Si un destinatario de mensaje múltiple pide repetición, se repite solo a él sin DUPE.</p>',
        guide: "4.4.10.1.6.1 establece la excepción SS.",
        refs: ["Annex 10, Volume II · 4.4.9.3; 4.4.10.1.6–1.7", "Páginas físicas 52, 53, 54, 56"],
        questions: [
          {
            q: "¿Cuál requiere acknowledgement individual de la estación destino al origen?",
            options: ["Distress SS", "Todos los GG", "Todo mensaje sin excepción"],
            answer: 0,
            why: "4.4.10.1.6.1 establece la excepción SS.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Normal Transmission Procedures · 4",
        title: "Conservar registros según el papel",
        body: '<p><span class="norm">Standard</span> Origen AFTN conserva copias completas de lo transmitido al menos 30 días. Destino conserva información para identificar todos los recibidos y acciones al menos 30 días. Los centros conservan copia completa de relay/retransmisión al menos una hora, con la excepción del positive acknowledgement entre centros que libera la responsabilidad de repetición.</p><p><span class="norm">Recommendation</span> Para los centros también se recomienda registro identificador de tráfico y acciones por 30 días.</p><p>Las pruebas de canal son Recommendation: start-of-message, QJH, originator, tres líneas RY en ITA-2 o U* en IA-5, y end-of-message. Se distinguen de un mensaje ordinario y del channel check CH.</p>',
        guide:
          "La hora corresponde al requisito de corto plazo de centros de relay, no a las copias de origen.",
        refs: ["Annex 10, Volume II · 4.4.1.6–4.4.1.8", "Páginas físicas 42, 43"],
        questions: [
          {
            q: "¿Qué retención mínima corresponde a copias completas transmitidas por la estación origen AFTN?",
            options: [
              "30 días",
              "Una hora en todos los casos",
              "Solo hasta que el operador cierre turno",
            ],
            answer: 0,
            why: "La hora corresponde al requisito de corto plazo de centros de relay, no a las copias de origen.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format IA5 · 1",
        title: "Un formato acordado y compatible",
        body: '<span class="norm">Standard</span> <p>IA-5 se usa cuando las Administrations lo acuerdan. Las que lo usan deben acomodar a estaciones AFTN adyacentes que empleen ITA-2.</p><div class="table-scroll"><table><thead><tr><th>Función</th><th>ITA-2</th><th>IA-5</th></tr></thead><tbody><tr><td>Inicio</td><td>ZCZC</td><td>SOH (0/1)</td></tr><tr><td>Paso hacia texto</td><td>End of origin con alignment</td><td>End of origin con alignment y STX (0/2)</td></tr><tr><td>Alarm de distress</td><td>FIGURE SHIFT + cinco señales 10 + LETTER SHIFT</td><td>Cinco BEL (0/7)</td></tr><tr><td>Ending</td><td>Siete LINE FEEDS + NNNN; separación si aplica</td><td>Alignment + VT (0/11) + ETX (0/3)</td></tr></tbody></table></div><p>La Figure 4-4 agrupa heading line, address y origin dentro de «THE HEADING». Conserva esa topología al leer el formato oficial.</p>',
        guide: "SOH es start-of-heading; ETX aparece al final.",
        refs: ["Annex 10, Volume II · 4.4.15; Figure 4-4", "Páginas físicas 64, 65, 66, 67"],
        questions: [
          {
            q: "¿Qué carácter inicia el heading IA-5?",
            options: ["SOH", "ZCZC", "ETX"],
            answer: 0,
            why: "SOH es start-of-heading; ETX aparece al final.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
        figure: {
          src: "/lp/annex10/figures/source-page-67.png",
          alt: "Figure 4-4. Message format International Alphabet No. 5 (IA-5)",
        },
      },
      {
        label: "AFTN Message Format IA5 · 2",
        title: "Heading, address y origin",
        body: '<span class="norm">Standard</span> <p>Después de SOH van identificación de circuito/enlace y secuencia. En punto a punto: transmisora, receptora, canal; en multipunto la identificación la asigna la control/master station. La serie de tres cifras se reinicia diariamente a 0000; su expansión se trata como Recommendation sujeta a acuerdo.</p><p>La información adicional de servicio va tras SPACE, máximo diez caracteres según 4.4.15.1.1.5, sin alignment. Address mantiene prioridad y destinatarios 4+3+1, máximo tres líneas. Origin contiene DDHHMM, originator, alarm si distress, datos opcionales acordados sin exceder 69 caracteres de línea, alignment y <strong>STX</strong>.</p><p>La Figure 4-4 abrevia la indicación de servicio como resto de línea; para el límite concreto se aplica aquí el texto de 4.4.15.1.1.5.</p>',
        guide: "4.4.15.2.2.7 coloca STX al terminar origin.",
        refs: ["Annex 10, Volume II · 4.4.15.1–4.4.15.2", "Páginas físicas 65, 66, 68, 69"],
        questions: [
          {
            q: "¿Dónde está STX en la estructura prescrita?",
            options: [
              "Después del alignment que concluye la línea origin",
              "Antes de SOH",
              "En lugar del priority indicator",
            ],
            answer: 0,
            why: "4.4.15.2.2.7 coloca STX al terminar origin.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "AFTN Message Format IA5 · 3",
        title: "Texto, límites y final",
        body: '<span class="norm">Standard</span> <p>El texto se compone conforme a 4.1.2; incluye los datos entre STX y ETX. YYY/YXY/ZZZ conservan la identificación al principio, y FROM/STOP separan identificaciones múltiples. CFM confirma; COR corrige.</p><p>En circuitos de baja velocidad: texto ≤1800 caracteres, mensaje completo ≤2100. El conteo del texto comienza después de STX y termina antes de la primera alignment del ending; excluye ambos delimitadores e incluye caracteres imprimibles y no imprimibles dentro de esas fronteras. El conteo completo incluye SOH hasta ETX. <span class="norm">Note</span> Baja velocidad: 300 bit/s o menos. <span class="norm">Standard</span> Longitudes superiores sin dividir en velocidad media/alta requieren acuerdo y no reducir el desempeño de red/enlace.</p><p>El ending se ordena <strong>alignment → VT → ETX</strong>. Attachment B apoya la división con partes identificadas, igual que en ITA-2. El receptor tiene una capacidad de avance de línea tratada bajo el prefijo Recommendation de 4.4.15.3.12.1.1, aun cuando ese texto utiliza shall.</p>',
        guide: "La secuencia es 4.4.15.3.12.1; no se añade NNNN como si fuera ITA-2.",
        refs: ["Annex 10, Volume II · 4.4.15.3", "Páginas físicas 69, 70, 71"],
        order: ["Alignment (CARRIAGE RETURN + LINE FEED)", "VT", "ETX"],
      },
      {
        label: "AFTN Message Format IA5 · 4",
        title: "Caracteres reservados y control del canal",
        body: '<p><span class="norm">Standard</span> SOH, STX y ETX no se insertan fuera de su lugar. Tampoco se permiten secuencias ZCZC, +:+:, NNNN o cuatro comas dentro del mensaje. El uso de IA-5 completo requiere los acuerdos previstos; no se infiere libertad para usar delimitadores como texto.</p><p>Sin control continuo se hacen checks periódicos: heading, alignment y STX, CH, alignment y ETX. <span class="norm">Recommendation</span> En circuito desocupado/no controlado: H+00, H+20, H+40. <span class="norm">Standard</span> SS se acusa individualmente con prioridad SS y alarm.</p><p>En circuitos/redes independientes de código y byte, 4.4.17 omite heading line: se inicia con alignment y address, y se mantiene ending completo. Los datos adicionales de supervisión son Recommendation y, si se añaden, están sujetos a las restricciones de 4.4.17.3.1.</p>',
        guide: "Las prohibiciones explícitas de IA-5 incluyen NNNN, ZCZC, +:+: y cuatro comas.",
        refs: [
          "Annex 10, Volume II · 4.1.2.3–4.1.2.6; 4.4.15.4–4.4.15.6; 4.4.17",
          "Páginas físicas 35, 71, 72, 73, 74",
        ],
        questions: [
          {
            q: "¿Puede usarse NNNN libremente como texto IA-5 por no ser su ending?",
            options: [
              "No; 4.1.2.6 también prohíbe esa secuencia",
              "Sí; cualquier secuencia ITA-2 es libre en IA-5",
              "Solo cambiando la prioridad a GG",
            ],
            answer: 0,
            why: "Las prohibiciones explícitas de IA-5 incluyen NNNN, ZCZC, +:+: y cuatro comas.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "CIDIN ATSMHS and ICC · 1",
        title: "CIDIN: transporte común",
        body: '<span class="norm">Note</span> <p><strong>Common ICAO Data Interchange Network</strong> comprende entidades de aplicación y servicios de comunicación para mensajes ground-ground. Usa protocolos basados en X.25 para facilidades independientes de código y byte.</p><p>Sus objetivos principales son mejorar AFTN y soportar mensajes grandes y aplicaciones más exigentes, como OPMET, entre dos o múltiples sistemas terrestres. Las notas describen su función y remiten los procedimientos europeos detallados a otro manual; este LP no incorpora ese manual.</p>',
        guide: "4.5 describe transporte de mensajes y apoyo a AFTN y aplicaciones como OPMET.",
        refs: ["Annex 10, Volume II · 4.1.1 Note 4; 4.5", "Páginas físicas 33, 74"],
        questions: [
          {
            q: "¿Qué función se atribuye a CIDIN?",
            options: [
              "Transporte ground-ground independiente de código y byte",
              "Sustituir el spelling alphabet en voz",
              "Determinar radio bearings de una aeronave",
            ],
            answer: 0,
            why: "4.5 describe transporte de mensajes y apoyo a AFTN y aplicaciones como OPMET.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "CIDIN ATSMHS and ICC · 2",
        title: "ATSMHS: servicio de mensajes ATS",
        body: '<p><span class="norm">Standard</span> El ATS message service de ATSMHS se usa para intercambiar mensajes ATS entre usuarios sobre ATN internet.</p><p><span class="norm">Note</span> La fuente identifica tres end systems: <strong>ATS message server, ATS message user agent y AFTN/AMHS gateway</strong>. La Table 4-1 muestra pares de comunicación: server–server, server–gateway, server–user agent y gateway–gateway. El soporte se basa en sistemas de manejo de mensajes indicados por las notas; no se desarrolla aquí su especificación externa.</p>',
        guide: "La tabla muestra cuatro pares concretos de end systems.",
        refs: ["Annex 10, Volume II · 4.6; Table 4-1", "Páginas físicas 74, 75"],
        questions: [
          {
            q: "¿Cuál de estos pares aparece en Table 4-1?",
            options: [
              "ATS Message Server — ATS Message User Agent",
              "Aircraft voice radio — direction-finding station",
              "User Agent — User Agent como único par de la tabla",
            ],
            answer: 0,
            why: "La tabla muestra cuatro pares concretos de end systems.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
        figure: {
          src: "/lp/annex10/figures/source-page-75.png",
          alt: "Table 4-1. Communications between ATN end systems implementing ATS message handling services",
        },
      },
      {
        label: "CIDIN ATSMHS and ICC · 3",
        title: "ICC: coordinar entre unidades ATS",
        body: '<p><span class="norm">Standard</span> El conjunto <strong>Inter-centre Communications</strong> se usa para intercambiar mensajes ATS entre usuarios de air traffic services sobre ATN internet.</p><p><span class="norm">Note</span> Apoya flight notification, flight coordination, transfer of control and communications, flight planning, airspace management y air traffic flow management. AIDC es la primera aplicación desarrollada para ICC; intercambia información entre ATS units para funciones como notificar aproximación al límite FIR, coordinar condiciones de frontera y transferir autoridad de control y comunicaciones.</p>',
        guide: "La Note de 4.7 vincula AIDC con esas funciones críticas de coordinación ATC.",
        refs: ["Annex 10, Volume II · 4.7", "Páginas físicas 75"],
        questions: [
          {
            q: "¿Qué asociación es correcta?",
            options: [
              "ICC / AIDC — apoyo a coordinación y transferencia entre unidades ATS",
              "CIDIN — únicamente llamadas MAYDAY",
              "ATSMHS — únicamente radio direction finding",
            ],
            answer: 0,
            why: "La Note de 4.7 vincula AIDC con esas funciones críticas de coordinación ATC.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aterrizaje",
        title: "Repaso del chapter.",
        body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
        recap: [
          ["Introduction to AFS", "Tema revisado dentro de este chapter."],
          ["AFTN Message Categories and Priority", "Tema revisado dentro de este chapter."],
          ["AFTN Message Format ITA2", "Tema revisado dentro de este chapter."],
          ["AFTN Addressing and Origin", "Tema revisado dentro de este chapter."],
          ["AFTN Service Messages and Error Handling", "Tema revisado dentro de este chapter."],
          ["AFTN Normal Transmission Procedures", "Tema revisado dentro de este chapter."],
          ["AFTN Message Format IA5", "Tema revisado dentro de este chapter."],
          ["CIDIN ATSMHS and ICC", "Tema revisado dentro de este chapter."],
        ],
        refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
        final: true,
      },
    ],
  },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-5-aeronautical-mobile-service-voice-communications-5":
    {
      id: "annex10-v2-chapter-5",
      folder: "05_Aeronautical_Mobile_Service_Voice",
      name: "Aeronautical Mobile Service — Voice Communications",
      subtitle: "13 temas · 59 misiones",
      year: "ICAO Annex 10 · Volume II",
      word: "Chapter 5",
      sources: [
        "5.1.1–5.1.1.3 · páginas 77",
        "5.1.2–5.1.7; 5.1.9 · páginas 77, 78, 79, 80",
        "5.1.8 Note 1; 5.4 · páginas 78, 110",
        "5.1.8 · páginas 78, 79",
        "5.1.8.4–5.1.8.8 · páginas 78, 79",
        "5.2.1.2 · páginas 80",
        "5.2.1.3; Figure 5-1 · páginas 80, 81",
        "5.2.1.4.1 · páginas 82, 83",
        "5.2.1.4.1.1 · páginas 82",
        "5.2.1.4.1.2–1.4 · páginas 82, 83",
        "5.2.1.4.1.5 · páginas 83",
        "5.2.1.4.1.6–1.8 · páginas 83, 84",
        "5.2.1.4.2–4.3 · páginas 84",
        "5.2.1.5.1–5.2.1.5.7 · páginas 84, 85",
        "5.2.1.5.8 · páginas 85, 86",
        "5.2.1.5.8 · páginas 85, 86, 87",
        "5.2.1.5.8 · páginas 86",
        "5.2.1.5.8 · páginas 87",
        "5.2.1.6 · páginas 87, 88",
        "5.2.1.6.2.2 · páginas 88",
        "5.2.1.7.1 · páginas 88, 89",
        "5.2.1.7.2; Table 5-1 · páginas 89, 90",
        "5.2.1.7.3.1–5.2.1.7.3.2.1 · páginas 90",
        "5.2.1.7.3.2 · páginas 90, 91",
        "5.2.1.7.3.2.6; 5.2.2.3.4 · páginas 91, 92, 98",
        "5.2.1.7.3.3 · páginas 92",
        "5.2.1.8; 5.2.1.9.3; 5.2.1.9.5 · páginas 93, 94, 95, 96",
        "5.2.1.9.1–5.2.1.9.2.5 · páginas 94, 95",
        "5.2.1.9.4 · páginas 95, 96",
        "5.2.2.1 · páginas 96, 97",
        "5.2.2.2; 5.2.2.3 · páginas 97, 98",
        "5.2.2.4–5.2.2.5 · páginas 98, 99",
        "5.2.2.6; 5.2.1.7.3.4 · páginas 92, 93, 99",
        "5.2.2.7.1.1 · páginas 99, 100",
        "5.2.2.7.1.2–7.1.2.1 · páginas 100",
        "5.2.2.7.1.3 · páginas 100",
        "5.2.2.7.2–7.3 · páginas 100, 101",
        "5.2.3.1.1 · páginas 101",
        "5.2.3.1.2.6; 5.2.3.1.4; 5.2.3.2 · páginas 102",
        "5.2.3.1.2–1.3 · páginas 101, 102",
        "5.2.3.3 · páginas 102, 103",
        "5.2.4.1 · páginas 103",
        "5.2.4.2; 5.2.4.6 · páginas 103, 104, 105",
        "5.2.4.3–5.2.4.4 · páginas 104",
        "5.2.4.5 · páginas 104",
        "5.3.1 · páginas 105, 106",
        "5.3.1; 5.3.3.3 · páginas 105, 106, 109",
        "5.3.2.1 · páginas 106",
        "5.3.2.2 · páginas 107",
        "5.3.2.3–5.3.2.4 · páginas 107",
        "5.3.2.5 · páginas 108",
        "5.3.3.1 · páginas 108",
        "5.3.3.2–5.3.3.3 · páginas 109",
        "5.3.3.4–5.3.3.5 · páginas 109, 110",
        "5.4 · páginas 110",
        "Figure 5-1 · páginas 81",
        "Figure 5-1; 5.2.1.5.6 · páginas 81, 85",
      ],
      steps: [
        {
          label: "Despegue",
          title: "Aeronautical Mobile Service — Voice Communications",
          body: "Chapter 5 de ICAO Annex 10, Volume II. Este recorrido reúne 13 temas fuente en su orden académico.",
          hero: true,
          cards: [
            [
              "General Principles and Message Priority",
              "Distingue la prioridad de voz de la de AFTN y usa la fraseología prevista para cada situación.",
            ],
            [
              "Language and Radiotelephony Spelling Alphabet",
              "Identifica el idioma disponible y practica el spelling alphabet con las formas exactas de la figura oficial.",
            ],
            [
              "Transmission of Numbers",
              "Primero identifica qué dato estás transmitiendo. Después aplica la regla y sus excepciones de la edición adjunta.",
            ],
            [
              "Transmitting Technique and Standard Words",
              "Practica palabras que confirman, solicitan, corrigen y autorizan. Entender su función evita respuestas ambiguas.",
            ],
            [
              "Message Composition and Calling",
              "Construye la llamada y distingue los tipos de call sign antes de abreviarlos.",
            ],
            [
              "Establishing and Exchanging Radiotelephony Communications",
              "Practica initial contact, readback y correcciones como un intercambio con responsabilidad en ambos extremos.",
            ],
            [
              "Communication Watch and Frequency Management",
              "Relaciona watch, primary guard y transferencia de frecuencia sin convertir una recomendación en una regla universal.",
            ],
            [
              "Voice Communication Failure",
              "Sigue las alternativas de contacto antes de blind transmission y distingue una falla de receptor de una falta de respuesta.",
            ],
            [
              "HF Message Handling",
              "Sigue el mensaje HF desde la aeronave hasta sus destinatarios y distingue receipt de intercept.",
            ],
            [
              "SELCAL",
              "Aprende la comprobación y el uso en ruta de SELCAL, conservando el estatus PANS de sus procedimientos.",
            ],
            [
              "Distress Communications",
              "Reconoce la condición de distress y practica el mensaje, las acciones de las estaciones y el fin del silencio.",
            ],
            [
              "Urgency Communications",
              "Distingue urgency de distress y reconoce el uso específico de la señal para protected medical transports.",
            ],
            [
              "Unlawful Interference Communications",
              "Este apartado es breve. Su alcance está en la asistencia y la notificación, sin añadir procedimientos externos.",
            ],
          ],
        },
        {
          label: "General Principles and Message Priority · 1",
          title: "Primero claridad y disciplina",
          body: '<p><span class="norm">Standard</span> Se mantiene el más alto nivel de disciplina en todas las comunicaciones. Se usa <strong>ICAO standardized phraseology</strong> en las situaciones para las que está especificada; solo cuando no sirve al propósito se recurre a plain language.</p><p>Se evita transmitir en frecuencias móviles mensajes distintos de los previstos en 5.1.8 cuando el fixed service puede cumplir la función.</p><p><span class="norm">Recommendation</span> Se consideran las consecuencias de human performance que afecten recepción y comprensión. La disciplina no es solo brevedad: también exige que el mensaje llegue con su significado intacto.</p>',
          guide: "La prioridad de phraseology estandarizada está en 5.1.1.1.",
          refs: ["Annex 10, Volume II · 5.1.1–5.1.1.3", "Páginas físicas 77"],
          questions: [
            {
              q: "Existe phraseology especificada y sirve para la transmisión. ¿Qué corresponde?",
              options: [
                "Usarla",
                "Sustituirla siempre por palabras personales",
                "Usar abreviaciones inventadas para acortar",
              ],
              answer: 0,
              why: "La prioridad de phraseology estandarizada está en 5.1.1.1.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "General Principles and Message Priority · 2",
          title: "La prioridad del mobile service",
          body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Orden</th><th>Categoría / señal</th></tr></thead><tbody><tr><td>1</td><td>Distress calls, messages y traffic — MAYDAY</td></tr><tr><td>2</td><td>Urgency, incluidos medical transports — PAN PAN / PAN PAN MEDICAL</td></tr><tr><td>3</td><td>Comunicaciones relacionadas con direction finding</td></tr><tr><td>4</td><td>Flight safety messages</td></tr><tr><td>5</td><td>Meteorological messages</td></tr><tr><td>6</td><td>Flight regularity messages</td></tr></tbody></table></div><p><span class="norm">Note</span> Un NOTAM puede encajar de c) a f) según su contenido e importancia para la aeronave. Unlawful interference puede impedir usar procedimientos habituales de categoría y prioridad.</p><p><span class="norm">Recommendation</span> Los mensajes de igual prioridad deberían transmitirse, en general, en orden de recepción.</p>',
          guide: "Es el orden de 5.1.8; no es la tabla SS / DD-FF / GG-KK de AFTN.",
          refs: ["Annex 10, Volume II · 5.1.8", "Páginas físicas 78, 79"],
          order: [
            "Distress",
            "Urgency",
            "Direction finding",
            "Flight safety",
            "Meteorological",
            "Flight regularity",
          ],
        },
        {
          label: "General Principles and Message Priority · 3",
          title: "Safety, meteorological y regularity",
          body: "<p><strong>Flight safety</strong> incluye movimiento/control, mensajes de interés inmediato para una aeronave en vuelo, información meteorológica de interés inmediato para una aeronave en vuelo o por salir, y otros mensajes sobre aeronaves en vuelo o por salir.</p><p><strong>Meteorological</strong> comprende información hacia/desde aeronaves distinta de esa meteorología de interés inmediato. <strong>Flight regularity</strong> comprende instalaciones esenciales, servicing, cambios colectivos de pasajeros y tripulación por desvíos inevitables de horarios, aterrizajes no rutinarios, partes urgentes y cambios de horarios. Las necesidades individuales de pasajeros/crew no son admisibles en esa categoría.</p><p>Una unidad ATS en canal directo piloto-controlador solo debe manejar regularity si no interfiere con su función principal y no hay otro canal disponible. Interpilot air-to-air trata seguridad/regularidad y se clasifica por contenido.</p>",
          guide: "5.1.8.4 incluye expresamente esa meteorología inmediata en flight safety.",
          refs: ["Annex 10, Volume II · 5.1.8.4–5.1.8.8", "Páginas físicas 78, 79"],
          questions: [
            {
              q: "Un aviso meteorológico afecta de inmediato a una aeronave por salir. ¿Qué categoría de voz corresponde?",
              options: [
                "Flight safety",
                "Meteorological necesariamente por mencionar tiempo",
                "Flight regularity",
              ],
              answer: 0,
              why: "5.1.8.4 incluye expresamente esa meteorología inmediata en flight safety.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "General Principles and Message Priority · 4",
          title: "Pruebas, llamadas y cancelaciones",
          body: '<p><span class="norm">Standard</span> Pruebas que puedan interferir una estación vecina requieren su consentimiento. Test signals: máximo diez segundos, numerales hablados ONE, TWO, THREE… y call sign; se reducen al mínimo. Establece contacto quien tiene tráfico, salvo disposiciones específicas.</p><p><span class="norm">Recommendation</span> Después de llamar a la estación aeronáutica se recomienda esperar al menos diez segundos antes de repetir. <span class="norm">Standard</span> Ante llamadas simultáneas, la estación aeronáutica decide el orden. Entre aeronaves, la receptora controla duración, sujeto a intervención de la estación; en frecuencia ATS se requiere permiso previo salvo intercambios breves.</p><p>Si llega instrucción de cancelar antes de terminar, se indica ignorar la transmisión incompleta. Cancelar una transmisión completa retenida o no entregable se trata como Recommendation en 5.1.9.2; la estación canceladora conserva responsabilidad por acciones posteriores.</p>',
          guide:
            "No se debe confundir esa recomendación con el máximo obligatorio de diez segundos para test signals.",
          refs: ["Annex 10, Volume II · 5.1.2–5.1.7; 5.1.9", "Páginas físicas 77, 78, 79, 80"],
          questions: [
            {
              q: "¿El intervalo de al menos diez segundos antes de repetir una llamada es Standard?",
              options: [
                "No; 5.1.5 es Recommendation",
                "Sí; todo número de segundos es obligatorio",
                "Es una Note sin recomendación",
              ],
              answer: 0,
              why: "No se debe confundir esa recomendación con el máximo obligatorio de diez segundos para test signals.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Language and Radiotelephony Spelling Alphabet · 1",
          title: "Qué idioma se usa",
          body: '<span class="norm">Standard</span> <p>Las air-ground radiotelephony communications se realizan en el idioma normalmente usado por la estación terrestre o en inglés. El inglés debe estar disponible, a solicitud de cualquier aircraft station, en estaciones terrestres que sirven aeropuertos y rutas designados utilizados por servicios aéreos internacionales.</p><p>Los idiomas disponibles se publican en AIP y otra información aeronáutica de la instalación. <span class="norm">Note</span> El idioma habitual de la estación no tiene por qué ser el idioma del Estado; puede existir un idioma común acordado regionalmente.</p>',
          guide:
            "El apartado distingue idioma usual de estación, idioma del Estado y disponibilidad del inglés.",
          refs: ["Annex 10, Volume II · 5.2.1.2", "Páginas físicas 80"],
          questions: [
            {
              q: "¿Es correcto afirmar que siempre debe usarse únicamente el idioma del Estado?",
              options: [
                "No; se permite el idioma usual de la estación o inglés según 5.2.1.2",
                "Sí; inglés está excluido",
                "Sí, incluso cuando se solicita inglés en una estación cubierta por 5.2.1.2.2",
              ],
              answer: 0,
              why: "El apartado distingue idioma usual de estación, idioma del Estado y disponibilidad del inglés.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Language and Radiotelephony Spelling Alphabet · 2",
          title: "El alfabeto completo",
          body: '<p><span class="norm">Standard</span> Para deletrear nombres propios, abreviaturas de servicio y palabras de escritura dudosa se usa el alfabeto de Figure 5-1. Aprende la palabra exacta: <strong>Alfa</strong> y <strong>Juliett</strong> conservan la escritura de ICAO.</p><div class="table-scroll"><table><thead><tr><th>Letras</th><th>Palabras</th></tr></thead><tbody><tr><td>A B C D E F G</td><td>Alfa · Bravo · Charlie · Delta · Echo · Foxtrot · Golf</td></tr><tr><td>H I J K L M N</td><td>Hotel · India · Juliett · Kilo · Lima · Mike · November</td></tr><tr><td>O P Q R S T</td><td>Oscar · Papa · Quebec · Romeo · Sierra · Tango</td></tr><tr><td>U V W X Y Z</td><td>Uniform · Victor · Whiskey · X-ray · Yankee · Zulu</td></tr></tbody></table></div><p>Abre la figura completa para leer la pronunciación aproximada y el subrayado de sílabas acentuadas. Se conserva la figura, sin reemplazar el acento por una pronunciación de memoria.</p>',
          guide: "I–C–A–O se deletrea India Charlie Alfa Oscar.",
          refs: ["Annex 10, Volume II · 5.2.1.3; Figure 5-1", "Páginas físicas 80, 81"],
          order: ["India", "Charlie", "Alfa", "Oscar"],
          figure: {
            src: "/lp/annex10/figures/source-page-81.png",
            alt: "Figure 5-1. The Radiotelephony Spelling Alphabet",
          },
        },
        {
          label: "Language and Radiotelephony Spelling Alphabet · 3",
          title: "Pronunciar sin perder la referencia",
          body: '<p><span class="norm">Note</span> La figura ofrece representación fonética internacional y representación aproximada en alfabeto latino. En esta última, las sílabas subrayadas reciben énfasis. Charlie admite CHAR LEE o SHAR LEE; Uniform admite YOU NEE FORM u OO NEE FORM, como indica la figura.</p><p><span class="norm">PANS</span> Para agilizar, puede prescindirse del deletreo fonético cuando ello no comprometa la recepción correcta ni la inteligibilidad. Esto no autoriza sustituir palabras del alfabeto cuando sí se está deletreando.</p>',
          guide:
            "La palabra oficial es Juliett. La figura es la referencia para la pronunciación y el énfasis.",
          refs: ["Annex 10, Volume II · Figure 5-1; 5.2.1.5.6", "Páginas físicas 81, 85"],
          questions: [
            {
              q: "Al deletrear J, ¿qué palabra de la figura seleccionas?",
              options: ["Juliett", "Juliet sin la escritura de la figura", "January"],
              answer: 0,
              why: "La palabra oficial es Juliett. La figura es la referencia para la pronunciación y el énfasis.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Language and Radiotelephony Spelling Alphabet · 4",
          title: "Deletrea sin sustituir palabras",
          body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
          guide:
            "Estas son las palabras escritas en Figure 5-1. La figura completa conserva las indicaciones de pronunciación.",
          refs: ["Annex 10, Volume II · Figure 5-1", "Páginas físicas 81"],
          match: [
            ["A", "Alfa"],
            ["J", "Juliett"],
            ["Q", "Quebec"],
            ["W", "Whiskey"],
            ["X", "X-ray"],
            ["Z", "Zulu"],
          ],
        },
        {
          label: "Transmission of Numbers · 1",
          title: "Regla base: cada cifra por separado",
          body: '<span class="norm">Standard</span> <p>Salvo las excepciones especificadas, los números se pronuncian cifra por cifra. Esto se ve en call signs, headings, viento y runway numbers.</p><div class="table-scroll"><table><thead><tr><th>Dato del ejemplo ICAO</th><th>Transmisión</th></tr></thead><tbody><tr><td>CCA 238</td><td>Air China two three eight</td></tr><tr><td>Heading 100°</td><td>heading one zero zero</td></tr><tr><td>Heading 080°</td><td>heading zero eight zero</td></tr><tr><td>Wind 200° / 70 kt</td><td>wind two zero zero degrees seven zero knots</td></tr><tr><td>Wind 160° / 18 kt / gusting 30 kt</td><td>wind one six zero degrees one eight knots gusting three zero knots</td></tr><tr><td>Runway 27 / 30</td><td>runway two seven / runway three zero</td></tr></tbody></table></div><p>Estas formas escritas muestran la secuencia de palabras. La pronunciación inglesa de cada cifra se practica en la última etapa.</p>',
          guide: "El heading mantiene cada cifra separada, aunque sea cien.",
          refs: ["Annex 10, Volume II · 5.2.1.4.1.1", "Páginas físicas 82"],
          questions: [
            {
              q: "¿Cómo se expresa heading 100 en el ejemplo?",
              options: ["heading one zero zero", "heading one hundred", "heading ten zero"],
              answer: 0,
              why: "El heading mantiene cada cifra separada, aunque sea cien.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmission of Numbers · 2",
          title: "Flight level, QNH y transponder",
          body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Tipo</th><th>Regla y excepción</th><th>Ejemplos oficiales</th></tr></thead><tbody><tr><td>Flight level</td><td>Cifras separadas; centenas enteras: cifra de centena + HUNDRED.</td><td>FL180: flight level one eight zero; FL200: flight level two hundred.</td></tr><tr><td>Altimeter setting</td><td>Cifras separadas; 1000 hPa: ONE THOUSAND.</td><td>QNH1009: one zero zero nine; QNH1000: one thousand; QNH993: nine nine three.</td></tr><tr><td>Transponder code</td><td>Cifras separadas; solo millares enteros: cifra de millar + THOUSAND.</td><td>2400: squawk two four zero zero; 1000: squawk one thousand; 2000: squawk two thousand.</td></tr></tbody></table></div><p>Estas páginas están marcadas con enmienda 91. Observa que 2400 no es un millar entero: no se transforma en «two thousand four hundred» para squawk.</p>',
          guide:
            "La excepción de transponder solo cubre millares enteros; 2400 se da cifra a cifra.",
          refs: ["Annex 10, Volume II · 5.2.1.4.1.2–1.4", "Páginas físicas 82, 83"],
          questions: [
            {
              q: "Elige la forma del ejemplo para squawk 2400.",
              options: [
                "squawk two four zero zero",
                "squawk two thousand four hundred",
                "squawk twenty four hundred",
              ],
              answer: 0,
              why: "La excepción de transponder solo cubre millares enteros; 2400 se da cifra a cifra.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmission of Numbers · 3",
          title: "Altitude, cloud height, visibility y RVR",
          body: '<span class="norm">Standard</span> <p>Para estas magnitudes, centenas y millares enteros usan <strong>HUNDRED</strong> y <strong>THOUSAND</strong>. Las cifras del número de centenas o millares se pronuncian por separado; las combinaciones incluyen ambas partes.</p><div class="table-scroll"><table><thead><tr><th>Dato</th><th>Ejemplo de transmisión</th></tr></thead><tbody><tr><td>Altitude 800</td><td>eight hundred</td></tr><tr><td>Altitude 3400</td><td>three thousand four hundred</td></tr><tr><td>Altitude 12000</td><td>one two thousand</td></tr><tr><td>Cloud height 2200</td><td>two thousand two hundred</td></tr><tr><td>Visibility 1000 / 700</td><td>visibility one thousand / visibility seven hundred</td></tr><tr><td>RVR 600 / 1700</td><td>RVR six hundred / RVR one thousand seven hundred</td></tr></tbody></table></div><p>La regla depende del tipo de dato. No traslades «heading one zero zero» a una altitude de centenas enteras.</p>',
          guide: "La cantidad combina millares y centenas enteros.",
          refs: ["Annex 10, Volume II · 5.2.1.4.1.5", "Páginas físicas 83"],
          order: ["three", "thousand", "four", "hundred"],
        },
        {
          label: "Transmission of Numbers · 4",
          title: "Decimal, reloj relativo y hora",
          body: '<p><span class="norm">Standard</span> El punto decimal se expresa <strong>DECIMAL</strong>: 100.3 → ONE ZERO ZERO DECIMAL THREE. En bearing relativo con reloj de doce horas, las cifras dobles se pronuncian <strong>TEN, ELEVEN o TWELVE [O’CLOCK]</strong>.</p><p><span class="norm">PANS</span> Al transmitir hora normalmente bastan los minutos, cifra por cifra; si puede haber confusión, se incluye la hora. 0920 puede decirse TOO ZE-RO, o ZE-RO NIN-er TOO ZE-RO; 1643, FOW-er TREE, o WUN SIX FOW-er TREE.</p><p>La cantidad de cifras de un designador VHF tiene reglas específicas, incluidas en frequency management. DECIMAL no significa que puedan omitirse cifras arbitrariamente.</p>',
          guide: "5.2.1.4.1.8 conserva la hora cuando hay posibilidad de confusión.",
          refs: ["Annex 10, Volume II · 5.2.1.4.1.6–1.8", "Páginas físicas 83, 84"],
          questions: [
            {
              q: "La hora puede confundirse si solo se dan los minutos. ¿Qué indica PANS?",
              options: [
                "Incluir también la hora",
                "Cambiar a hora local",
                "Omitir toda referencia de tiempo",
              ],
              answer: 0,
              why: "5.2.1.4.1.8 conserva la hora cuando hay posibilidad de confusión.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmission of Numbers · 5",
          title: "Pronunciación inglesa y verificación",
          body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Elemento</th><th>Pronunciación</th></tr></thead><tbody><tr><td>0 · 1 · 2 · 3</td><td>ZE-RO · WUN · TOO · TREE</td></tr><tr><td>4 · 5 · 6</td><td>FOW-er · FIFE · SIX</td></tr><tr><td>7 · 8 · 9</td><td>SEV-en · AIT · NIN-er</td></tr><tr><td>Decimal</td><td>DAY-SEE-MAL</td></tr><tr><td>Hundred / Thousand</td><td>HUN-dred / TOU-SAND</td></tr></tbody></table></div><p><span class="norm">Note</span> Las mayúsculas de la tabla señalan sílabas acentuadas. ZE-RO da igual énfasis a ambas; FOW-er enfatiza la primera.</p><p><span class="norm">Standard</span> Si se quiere verificar recepción exacta de números, quien transmite solicita readback de esos números. Pronunciar con precisión y verificar recepción son pasos diferentes.</p>',
          guide: "5.2.1.4.2.1 prescribe solicitar que la receptora repita los números.",
          refs: ["Annex 10, Volume II · 5.2.1.4.2–4.3", "Páginas físicas 84"],
          questions: [
            {
              q: "¿Qué acción verifica la recepción exacta de números?",
              options: [
                "Solicitar readback de los números",
                "Suponer que el silencio confirma recepción",
                "Cambiar todos los números a palabras ordinarias",
              ],
              answer: 0,
              why: "5.2.1.4.2.1 prescribe solicitar que la receptora repita los números.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
          figure: {
            src: "/lp/annex10/figures/source-page-84.png",
            alt: "Pronunciation of numbers — 5.2.1.4.3.1 (tabla sin número)",
          },
        },
        {
          label: "Transmission of Numbers · 6",
          title: "El contexto cambia la transmisión",
          body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
          guide:
            "Todos son ejemplos del Annex. Identificar primero el tipo de dato evita extender una excepción al campo equivocado.",
          refs: ["Annex 10, Volume II · 5.2.1.4.1", "Páginas físicas 82, 83"],
          match: [
            ["Heading 100", "heading one zero zero"],
            ["FL200", "flight level two hundred"],
            ["QNH1000", "QNH one thousand"],
            ["Squawk 2400", "squawk two four zero zero"],
            ["Altitude 12000", "one two thousand"],
            ["RVR1700", "RVR one thousand seven hundred"],
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 1",
          title: "Una técnica que facilite entender",
          body: '<p><span class="norm">Standard</span> Transmisiones concisas en tono conversacional normal.</p><p><span class="norm">PANS</span> Leer mensajes escritos antes de transmitir; enunciar claramente; mantener ritmo uniforme no mayor de 100 palabras/minuto y más lento si hay que anotar; pausar ligeramente alrededor de números; mantener volumen y distancia al micrófono; suspender habla al apartar la cabeza. Interrumpir brevemente mensajes largos para comprobar frecuencia y permitir solicitudes de repetición.</p><p>También PANS: conservar el sentido al transmitir en plain language o phraseology; desplegar abreviaturas salvo las generalmente comprendidas; evitar deletreo innecesario si no afecta inteligibilidad. <span class="norm">Recommendation</span> Adaptar técnica a condiciones de comunicación.</p>',
          guide: "5.2.1.5.3 adapta la técnica para inteligibilidad y anotación.",
          refs: ["Annex 10, Volume II · 5.2.1.5.1–5.2.1.5.7", "Páginas físicas 84, 85"],
          questions: [
            {
              q: "¿Qué práctica PANS facilita copiar un mensaje?",
              options: [
                "Reducir el ritmo y pausar ligeramente alrededor de números",
                "Acelerar sobre los números",
                "Seguir hablando al girar la cabeza lejos del micrófono",
              ],
              answer: 0,
              why: "5.2.1.5.3 adapta la técnica para inteligibilidad y anotación.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 2",
          title: "Pedir, separar y autorizar",
          body: '<p><span class="norm">Standard</span> Se usan estas palabras y frases con el significado asignado. Las explicaciones siguientes son paráfrasis en español; la palabra transmitida se conserva en inglés.</p><div class="table-scroll"><table><thead><tr><th>Palabra / frase</th><th>Función</th></tr></thead><tbody><tr><td>ACKNOWLEDGE</td><td>Confirma que recibiste y entendiste el mensaje.</td></tr><tr><td>AFFIRM</td><td>Sí.</td></tr><tr><td>APPROVED</td><td>Permiso concedido para la acción propuesta.</td></tr><tr><td>BREAK</td><td>Separa porciones de un mensaje cuando no hay distinción clara.</td></tr><tr><td>BREAK BREAK</td><td>Separa mensajes a distintas aeronaves en entorno muy ocupado.</td></tr><tr><td>CANCEL</td><td>Anula una clearance transmitida previamente.</td></tr><tr><td>CHECK</td><td>Examina un sistema o procedimiento; no se usa en otro contexto, normalmente sin respuesta.</td></tr><tr><td>CLEARED</td><td>Autorizado a proceder bajo las condiciones especificadas.</td></tr><tr><td>CONFIRM</td><td>Solicita verificar clearance, instrucción, acción o información.</td></tr><tr><td>CONTACT</td><td>Establece comunicación con…</td></tr><tr><td>CORRECT</td><td>Verdadero o exacto.</td></tr><tr><td>CORRECTION</td><td>Se cometió un error; sigue la versión correcta.</td></tr><tr><td>DISREGARD</td><td>Ignora.</td></tr></tbody></table></div>',
          guide:
            "CONTACT solicita establecer comunicación. MONITOR pide escuchar; CORRECT confirma exactitud.",
          refs: ["Annex 10, Volume II · 5.2.1.5.8", "Páginas físicas 85, 86"],
          questions: [
            {
              q: "Quieres que la otra estación establezca comunicación con otra frecuencia/estación. ¿Cuál eliges?",
              options: ["CONTACT", "MONITOR", "CORRECT"],
              answer: 0,
              why: "CONTACT solicita establecer comunicación. MONITOR pide escuchar; CORRECT confirma exactitud.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 3",
          title: "Escuchar, repetir y cerrar",
          body: '<div class="table-scroll"><table><thead><tr><th>Palabra / frase</th><th>Función</th></tr></thead><tbody><tr><td>HOW DO YOU READ</td><td>Pregunta por legibilidad de la transmisión.</td></tr><tr><td>I SAY AGAIN</td><td>Repito para claridad o énfasis.</td></tr><tr><td>MAINTAIN</td><td>Continúa conforme a las condiciones especificadas o en su sentido literal.</td></tr><tr><td>MONITOR</td><td>Escucha en la frecuencia.</td></tr><tr><td>NEGATIVE</td><td>No; permiso no concedido; no es correcto; no es capaz.</td></tr><tr><td>OVER</td><td>Terminé la transmisión y espero respuesta.</td></tr><tr><td>OUT</td><td>Terminó el intercambio y no espero respuesta.</td></tr><tr><td>READ BACK</td><td>Repite todo o la parte especificada exactamente como la recibiste.</td></tr><tr><td>RECLEARED</td><td>La nueva clearance sustituye la anterior o parte de ella.</td></tr><tr><td>REPORT</td><td>Transmite la información solicitada.</td></tr><tr><td>REQUEST</td><td>Deseo saber u obtener…</td></tr><tr><td>ROGER</td><td>He recibido toda tu última transmisión.</td></tr><tr><td>SAY AGAIN</td><td>Repite toda o la parte indicada de tu última transmisión.</td></tr><tr><td>SPEAK SLOWER</td><td>Reduce la velocidad de habla.</td></tr></tbody></table></div><p><span class="norm">Note</span> OVER y OUT no se usan normalmente en comunicaciones VHF o satellite voice. ROGER no debe responder a una petición de READ BACK ni sustituir AFFIRM/NEGATIVE cuando se necesita respuesta directa.</p>',
          guide:
            "ROGER solo acusa recepción de toda la última transmisión; la Note excluye usarlo en lugar de readback.",
          refs: ["Annex 10, Volume II · 5.2.1.5.8", "Páginas físicas 86"],
          questions: [
            {
              q: "Te piden READ BACK. ¿ROGER satisface esa petición?",
              options: [
                "No; se necesita repetir el contenido solicitado",
                "Sí, ROGER significa «lo repetiré»",
                "Sí, ROGER contiene implícitamente todos los números",
              ],
              answer: 0,
              why: "ROGER solo acusa recepción de toda la última transmisión; la Note excluye usarlo en lugar de readback.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 4",
          title: "Espera, cumplimiento y dificultad",
          body: '<div class="table-scroll"><table><thead><tr><th>Palabra / frase</th><th>Función</th></tr></thead><tbody><tr><td>STANDBY</td><td>Espera y te llamaré.</td></tr><tr><td>UNABLE</td><td>No puedo cumplir la solicitud, instrucción o clearance.</td></tr><tr><td>WILCO</td><td>Entiendo el mensaje y lo cumpliré.</td></tr><tr><td>WORDS TWICE</td><td>Como solicitud: envía cada palabra o grupo dos veces; como información: lo haré por dificultad de comunicación.</td></tr></tbody></table></div><p><span class="norm">Note</span> STANDBY no es aprobación ni rechazo; si la demora es larga, normalmente quien llamó restablece contacto. UNABLE normalmente va seguido de una razón.</p><p>Piensa en la decisión: «recibí» es ROGER; «entiendo y cumpliré» es WILCO; «no puedo cumplir» es UNABLE; «espera, te llamaré» es STANDBY. No son respuestas equivalentes.</p>',
          guide: "El significado de WILCO incluye comprensión y cumplimiento, no solo recepción.",
          refs: ["Annex 10, Volume II · 5.2.1.5.8", "Páginas físicas 87"],
          questions: [
            {
              q: "Necesitas indicar que entiendes el mensaje y cumplirás.",
              options: ["WILCO", "ROGER", "STANDBY"],
              answer: 0,
              why: "El significado de WILCO incluye comprensión y cumplimiento, no solo recepción.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 5",
          title: "Seleccionar por intención",
          body: "<p>Usa el contraste para elegir: <strong>AFFIRM</strong> responde sí; <strong>CORRECT</strong> verifica exactitud; <strong>CONFIRM</strong> pide esa verificación. <strong>I SAY AGAIN</strong> anuncia que tú repites; <strong>SAY AGAIN</strong> solicita al otro que repita.</p><p><strong>BREAK</strong> separa partes de un mensaje. <strong>BREAK BREAK</strong> separa mensajes a aeronaves distintas en un entorno muy ocupado. <strong>APPROVED</strong> concede permiso a acción propuesta y <strong>CLEARED</strong> autoriza proceder bajo condiciones especificadas.</p>",
          guide:
            "La dirección de la solicitud cambia: SAY AGAIN pide al otro; I SAY AGAIN anuncia tu propia repetición.",
          refs: ["Annex 10, Volume II · 5.2.1.5.8", "Páginas físicas 85, 86, 87"],
          questions: [
            {
              q: "No recibiste una parte de la última transmisión. ¿Qué frase solicita repetir?",
              options: ["SAY AGAIN", "I SAY AGAIN", "CORRECT"],
              answer: 0,
              why: "La dirección de la solicitud cambia: SAY AGAIN pide al otro; I SAY AGAIN anuncia tu propia repetición.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Transmitting Technique and Standard Words · 6",
          title: "Selecciona por intención, no por costumbre",
          body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
          guide:
            "Las palabras no son intercambiables: escuchar, establecer contacto, recibir y comprometerse a cumplir son funciones distintas.",
          refs: ["Annex 10, Volume II · 5.2.1.5.8", "Páginas físicas 85, 86, 87"],
          match: [
            ["CONTACT", "Establecer comunicación"],
            ["MONITOR", "Escuchar en una frecuencia"],
            ["ROGER", "Recibí toda la última transmisión"],
            ["WILCO", "Entiendo y cumpliré"],
            ["STANDBY", "Espera y te llamaré"],
            ["UNABLE", "No puedo cumplir"],
          ],
        },
        {
          label: "Message Composition and Calling · 1",
          title: "Call y text: la estructura base",
          body: '<span class="norm">Standard</span> <p>Un mensaje manejado enteramente por mobile service contiene <strong>call</strong>, que identifica destinatario y originador, y después <strong>text</strong>.</p><pre>NEW YORK RADIO SWISSAIR ONE ONE ZERO\nREQUEST SELCAL CHECK</pre><p>Si nace en una aeronave y requiere AFTN o no tiene distribución predeterminada: call → FOR → organización destinataria → estación destino → texto. Ejemplo del Annex:</p><pre>BOSTON RADIO SWISSAIR ONE TWO EIGHT\nFOR SWISSAIR BOSTON\nNUMBER ONE ENGINE CHANGE REQUIRED</pre><p>El texto se mantiene tan corto como sea practicable para transmitir lo necesario y usa phraseology ICAO.</p>',
          guide: "5.2.1.6.2.1 añade el direccionamiento después de la llamada.",
          refs: ["Annex 10, Volume II · 5.2.1.6", "Páginas físicas 87, 88"],
          order: ["Call", "FOR", "Organización destinataria", "Estación destino", "Texto"],
        },
        {
          label: "Message Composition and Calling · 2",
          title: "De AFTN hacia la aeronave",
          body: '<span class="norm">Standard</span> <p>Al retransmitir a una aeronave un mensaje preparado como AFTN, se omiten <strong>heading y address</strong> del formato AFTN. La transmisión contiene texto, incorporando COR, seguido de <strong>FROM</strong>, nombre de la organización originadora y su ubicación tomada del origin.</p><p><span class="norm">PANS</span> Las abreviaturas se convierten normalmente a palabras/frases completas al transmitir a la aeronave, excepto las generalmente entendidas por uso común.</p>',
          guide:
            "La retransmisión conserva la procedencia útil y retira el envoltorio AFTN no indicado para el tramo móvil.",
          refs: ["Annex 10, Volume II · 5.2.1.6.2.2", "Páginas físicas 88"],
          questions: [
            {
              q: "¿Qué dato acompaña FROM?",
              options: [
                "La organización originadora y su ubicación",
                "El channel-sequence number y ZCZC",
                "La prioridad cambiada a SS",
              ],
              answer: 0,
              why: "La retransmisión conserva la procedencia útil y retira el envoltorio AFTN no indicado para el tramo móvil.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Message Composition and Calling · 3",
          title: "Call signs de estaciones",
          body: '<span class="norm">Standard</span> <p>Se identifica la estación por <strong>location + unit/service</strong>. Tras comunicación satisfactoria puede omitirse location o unit/service cuando corresponda.</p><div class="table-scroll"><table><thead><tr><th>Servicio</th><th>Sufijo</th></tr></thead><tbody><tr><td>Area control / approach / arrivals / departures</td><td>CONTROL / APPROACH / ARRIVAL / DEPARTURE</td></tr><tr><td>Aerodrome / surface movement</td><td>TOWER / GROUND</td></tr><tr><td>Radar / precision approach radar</td><td>RADAR / PRECISION</td></tr><tr><td>Direction finding / flight information</td><td>HOMER / INFORMATION</td></tr><tr><td>Clearance / apron</td><td>DELIVERY / APRON</td></tr><tr><td>Company dispatch / aeronautical station</td><td>DISPATCH / RADIO</td></tr></tbody></table></div>',
          guide: "La tabla de 5.2.1.7.1.2 asigna HOMER.",
          refs: ["Annex 10, Volume II · 5.2.1.7.1", "Páginas físicas 88, 89"],
          questions: [
            {
              q: "¿Qué sufijo identifica una direction-finding station?",
              options: ["HOMER", "TOWER", "DISPATCH"],
              answer: 0,
              why: "La tabla de 5.2.1.7.1.2 asigna HOMER.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Message Composition and Calling · 4",
          title: "Tres tipos de aircraft call sign",
          body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Tipo</th><th>Full call sign</th><th>Abbreviated call sign</th></tr></thead><tbody><tr><td>a</td><td>Caracteres de matrícula; fabricante/modelo puede ser prefijo según Note.</td><td>Primer carácter y al menos dos últimos; fabricante/modelo puede sustituir primer carácter según Note.</td></tr><tr><td>b</td><td>Telephony designator de operating agency + cuatro últimos caracteres de matrícula.</td><td>Telephony designator + al menos dos últimos caracteres.</td></tr><tr><td>c</td><td>Telephony designator + flight identification.</td><td>No existe forma abreviada.</td></tr></tbody></table></div><p>Ejemplos oficiales: N57826 → N26 o N826; VARIG PVMA → VARIG MA o VARIG VMA; SCANDINAVIAN 937 no se abrevia. La forma abreviada tiene condiciones de uso que se aplican en el siguiente LP.</p>',
          guide: "5.2.1.7.2.2 excluye el tipo c.",
          refs: ["Annex 10, Volume II · 5.2.1.7.2; Table 5-1", "Páginas físicas 89, 90"],
          questions: [
            {
              q: "¿Qué call sign carece de forma abreviada?",
              options: [
                "Tipo c: designador + flight identification",
                "Tipo a en todos los casos",
                "Tipo b en todos los casos",
              ],
              answer: 0,
              why: "5.2.1.7.2.2 excluye el tipo c.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
          figure: {
            src: "/lp/annex10/figures/source-page-90.png",
            alt: "Table 5-1. Examples of full call signs and abbreviated call signs",
          },
        },
        {
          label: "Message Composition and Calling · 5",
          title: "Llamar sin crear confusión",
          body: '<span class="norm">Standard</span> <p>Para establecer comunicación se usan <strong>full call signs</strong>. La llamada nombra primero la estación llamada y luego la que llama, como NEW YORK RADIO — GABCD en Table 5-2. Salvo designador telefónico y tipo de aeronave, se pronuncia cada carácter; las letras se deletrean y los números siguen sus reglas.</p><p>No se cambia el tipo de call sign durante el vuelo salvo instrucción temporal ATC por seguridad. No se dirige una transmisión a aeronave durante take-off, último tramo de final approach o landing roll, excepto por razones de seguridad.</p>',
          guide:
            "El uso inicial completo permite establecer identificación antes de procedimientos posteriores.",
          refs: ["Annex 10, Volume II · 5.2.1.7.3.1–5.2.1.7.3.2.1", "Páginas físicas 90"],
          questions: [
            {
              q: "En el primer contacto, ¿cuál es la forma correcta?",
              options: [
                "Call sign completo de estación llamada y call sign completo de quien llama",
                "Abreviar siempre desde la primera llamada",
                "Transmitir solo el texto sin identificar a nadie en cualquier situación",
              ],
              answer: 0,
              why: "El uso inicial completo permite establecer identificación antes de procedimientos posteriores.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 1",
          title: "Llamada y respuesta",
          body: '<span class="norm">Standard</span> <p>Para establecer contacto se empieza con llamada y respuesta. Si existe certeza de que la llamada será recibida, quien llama puede transmitir el mensaje sin esperar la respuesta. Table 5-3 invierte los participantes en la respuesta: <strong>GABCD — NEW YORK RADIO</strong>.</p><p><span class="norm">PANS</span> Una llamada general usa ALL STATIONS + identificación de quien llama. <span class="norm">Note</span> No se espera respuesta salvo llamada posterior individual para acknowledgement.</p><p><span class="norm">PANS</span> Si no se sabe quién llamó: <strong>STATION CALLING … (station called) SAY AGAIN YOUR CALL SIGN</strong>. Ejemplo: STATION CALLING CAIRO (pause) SAY AGAIN YOUR CALL SIGN.</p>',
          guide: "El PANS prescribe pedir el call sign de nuevo; la identificación no se adivina.",
          refs: ["Annex 10, Volume II · 5.2.1.7.3.2", "Páginas físicas 90, 91"],
          questions: [
            {
              q: "No reconoces la estación que te llama. ¿Qué hace el procedimiento?",
              options: [
                "Pedir que repita su call sign",
                "Adivinarlo por una llamada anterior",
                "Responder con una clearance sin identificación",
              ],
              answer: 0,
              why: "El PANS prescribe pedir el call sign de nuevo; la identificación no se adivina.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
          figure: {
            src: "/lp/annex10/figures/source-page-91.png",
            alt: "Table 5-3. Radiotelephony reply procedure",
          },
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 2",
          title: "Después del contacto",
          body: '<span class="norm">Standard</span> <p>Las abreviaturas de call sign solo se usan tras comunicación satisfactoria y si no hay riesgo de confusión. La aeronave las usa <strong>solo después de que la estación aeronáutica la haya llamado así</strong>.</p><p>Una vez establecido contacto se permite comunicación continua de dos vías sin nueva identificación o llamada hasta terminarlo. Pero al emitir clearances ATC y hacer su readback, controlador y piloto <strong>siempre añaden el call sign de la aeronave</strong>.</p>',
          guide: "La condición de 5.2.1.7.3.3.1 es explícita.",
          refs: ["Annex 10, Volume II · 5.2.1.7.3.3", "Páginas físicas 92"],
          questions: [
            {
              q: "Ya hay contacto, pero la estación no ha usado tu call sign abreviado. ¿Puedes introducirlo tú?",
              options: [
                "No; la aeronave espera ser llamada así por la estación",
                "Sí, siempre que sea más corto",
                "Sí, incluso un tipo c",
              ],
              answer: 0,
              why: "La condición de 5.2.1.7.3.3.1 es explícita.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 3",
          title: "Readback: comprobar lo recibido",
          body: '<p><span class="norm">Standard</span> El receptor se asegura de haber recibido correctamente antes de acusar. El acknowledgement de aeronave incluye su call sign.</p><p><span class="norm">PANS</span> La aeronave debería repetir los mensajes ATC importantes o sus partes y terminar con call sign. La estación debería repetir position/flight progress reports, salvo suspensión temporal para aliviar congestión. Puede usarse readback adicional para verificación; quien lo comprueba confirma exactitud con su call sign.</p><pre>CLEARED TO DESCEND TO NINE THOUSAND FEET — TWA NINE SIX THREE</pre><p class="small">Readback del ejemplo oficial de 5.2.1.9.2.2.</p><p>Si se recibe reporte de posición junto con weather, PANS contempla WEATHER RECEIVED tras el readback de posición, salvo intercept requerido por otras estaciones. La lista completa de clearances que requieren readback se remite a PANS-ATM y no se importa a este curso.</p>',
          guide:
            "El ejemplo y PANS cierran el readback con el call sign; 5.2.1.7.3.3.3 exige identificar la aeronave al leer clearances.",
          refs: ["Annex 10, Volume II · 5.2.1.9.1–5.2.1.9.2.5", "Páginas físicas 94, 95"],
          questions: [
            {
              q: "En el readback del ejemplo, ¿qué debe conservarse?",
              options: [
                "La instrucción recibida y el call sign de la aeronave",
                "Solo ROGER",
                "Solo la altitud sin identificación",
              ],
              answer: 0,
              why: "El ejemplo y PANS cierran el readback con el call sign; 5.2.1.7.3.3.3 exige identificar la aeronave al leer clearances.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 4",
          title: "Corregir tu transmisión o un readback",
          body: '<span class="norm">Standard</span> <p>Si te equivocas transmitiendo: <strong>CORRECTION</strong>, último grupo o frase correcto y versión correcta. Si conviene repetir todo: <strong>CORRECTION, I SAY AGAIN</strong> antes del mensaje completo.</p><p>Si detectas un dato incorrecto al verificar un readback, al terminar este dices <strong>NEGATIVE I SAY AGAIN</strong> seguido de la versión correcta de los elementos afectados.</p><p>Quien duda de lo recibido solicita repetición completa o parcial: SAY AGAIN; SAY AGAIN ALL BEFORE…; SAY AGAIN…TO…; SAY AGAIN ALL AFTER… <span class="norm">Recommendation</span> Se recomiendan solicitudes específicas como SAY AGAIN ALTIMETER o SAY AGAIN WIND; también duplicar elementos importantes cuando se prevé recepción difícil.</p>',
          guide: "La corrección del readback tiene esa frase específica en 5.2.1.9.4.7.",
          refs: ["Annex 10, Volume II · 5.2.1.9.4", "Páginas físicas 95, 96"],
          questions: [
            {
              q: "Detectas un dato erróneo en el readback de la otra estación. ¿Qué frase prescribe el apartado?",
              options: ["NEGATIVE I SAY AGAIN", "ROGER", "STANDBY como confirmación del dato"],
              answer: 0,
              why: "La corrección del readback tiene esa frase específica en 5.2.1.9.4.7.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 5",
          title: "Probar legibilidad y terminar",
          body: '<p><span class="norm">PANS</span> Test: estación llamada, identificación de aeronave, RADIO CHECK, frecuencia. Respuesta: aeronave, estación que responde y legibilidad. Se registra en la estación aeronáutica.</p><div class="table-scroll"><table><thead><tr><th>Nivel</th><th>Readability</th></tr></thead><tbody><tr><td>1</td><td>Unreadable</td></tr><tr><td>2</td><td>Readable now and then</td></tr><tr><td>3</td><td>Readable but with difficulty</td></tr><tr><td>4</td><td>Readable</td></tr><tr><td>5</td><td>Perfectly readable</td></tr></tbody></table></div><p><span class="norm">Standard</span> La conversación termina por la estación receptora usando su propio call sign. <span class="norm">PANS</span> OPERATIONS NORMAL se transmite tras la llamada prescrita.</p>',
          guide:
            "La escala PANS distingue recepción ocasional (2) de recepción con dificultad (3).",
          refs: [
            "Annex 10, Volume II · 5.2.1.8; 5.2.1.9.3; 5.2.1.9.5",
            "Páginas físicas 93, 94, 95, 96",
          ],
          questions: [
            {
              q: "Una transmisión se lee con dificultad. ¿Qué nivel corresponde?",
              options: ["3", "2", "5"],
              answer: 0,
              why: "La escala PANS distingue recepción ocasional (2) de recepción con dificultad (3).",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishing and Exchanging Radiotelephony Communications · 6",
          title: "Elige la herramienta de corrección",
          body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
          guide:
            "La frase depende de quién se equivocó y qué parte del intercambio debe repetirse.",
          refs: ["Annex 10, Volume II · 5.2.1.9.4", "Páginas físicas 95, 96"],
          match: [
            ["CORRECTION", "Corregir mi propia transmisión"],
            ["CORRECTION, I SAY AGAIN", "Repetir todo mi mensaje para corregirlo"],
            ["SAY AGAIN", "Pedir repetición de toda la última transmisión"],
            ["NEGATIVE I SAY AGAIN", "Corregir elementos de un readback recibido"],
          ],
        },
        {
          label: "Communication Watch and Frequency Management · 1",
          title: "Watch y 121.5 MHz",
          body: '<p><span class="norm">Standard</span> En vuelo se mantiene watch según la autoridad; no se abandona sin informar, salvo razones de seguridad. En vuelos largos sobre agua o áreas designadas con ELT requerido, se vigila continuamente 121.5 MHz, salvo comunicaciones en otros canales VHF, limitaciones del equipo o tareas de cockpit que impidan doble escucha. También es obligatorio en áreas/rutas de posible interceptación u otros peligros cuando lo exija la autoridad.</p><p><span class="norm">Recommendation</span> En otros vuelos se recomienda vigilar 121.5 en lo posible. <span class="norm">Standard</span> Las estaciones aeronáuticas la escuchan continuamente durante horas de servicio de unidades donde esté instalada. El uso de air-to-air no elimina las otras frecuencias de watch obligatorias.</p><p>Si se suspende operación, se avisa cuando sea posible y se indica retorno; se notifica reanudación y, si se prolonga, hora revisada.</p>',
          guide: "La precisión está en mantener las condiciones de 5.2.2.1.1.1–1.1.3.",
          refs: ["Annex 10, Volume II · 5.2.2.1", "Páginas físicas 96, 97"],
          questions: [
            {
              q: "¿La fuente exige 121.5 sin excepciones a toda aeronave en cualquier vuelo?",
              options: [
                "No; distingue casos obligatorios, excepciones y una Recommendation para otros vuelos",
                "Sí, sin considerar equipo ni tareas de cockpit",
                "No menciona 121.5",
              ],
              answer: 0,
              why: "La precisión está en mantener las condiciones de 5.2.2.1.1.1–1.1.3.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Communication Watch and Frequency Management · 2",
          title: "Primary guard no es solo una frecuencia",
          body: '<p><span class="norm">PANS</span> Las regular stations se seleccionan para el segmento. Cuando se requiere continuidad adicional, comparten primary guard según dónde puedan atender mejor a la aeronave. Quien tiene primary guard designa primary/secondary frequencies, recibe position reports y tráfico esencial, y actúa ante fallas.</p><p>La transferencia suele coincidir con límites FIR/control area, pero puede anticiparse o retrasarse para mejorar comunicación.</p><p><span class="norm">Standard</span> La air-ground control radio station designa las frecuencias normales. <span class="norm">PANS</span> En red, la designación inicial se hace en pre-flight check o primer contacto tras take-off y se comunica a las demás. <span class="norm">Recommendation</span> Se consideran propagación/distancia y se propone alternativa si una frecuencia no sirve.</p>',
          guide:
            "El papel de la estación incluye tareas concretas además de seleccionar frecuencias.",
          refs: ["Annex 10, Volume II · 5.2.2.2; 5.2.2.3", "Páginas físicas 97, 98"],
          questions: [
            {
              q: "¿Qué comprende primary guard según PANS?",
              options: [
                "Frecuencias, position reports, tráfico esencial y acción ante fallas",
                "Solo escuchar una frecuencia llamada primary",
                "Controlar exclusivamente horarios administrativos",
              ],
              answer: 0,
              why: "El papel de la estación incluye tareas concretas además de seleccionar frecuencias.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Communication Watch and Frequency Management · 3",
          title: "HF: coordinar el cambio",
          body: '<p><span class="norm">Standard</span> Se intenta comunicar directamente con la estación apropiada; si no es posible se usan medios de relay disponibles y adecuados.</p><p><span class="norm">PANS</span> La estación aconseja transferir frecuencia/red; sin consejo, la aeronave notifica antes. Se prefiere cambiar de red mientras hay contacto con estación de ambas; si cambia también la estación, ambas coordinan antes y se dan primary y secondary nuevas.</p><p>Al entrar tras despegue se da hora de despegue o último checkpoint; al entrar en nueva red, hora del último checkpoint o posición reportada. Al salir: <strong>CHANGING TO …</strong> (unidad ATS), o tras aterrizaje <strong>LANDED … (location) … (time)</strong>. <span class="norm">Standard</span> Se informa watch en la nueva frecuencia cuando lo exige la autoridad ATS.</p>',
          guide: "5.2.2.5.2 busca continuidad coordinando la transición.",
          refs: ["Annex 10, Volume II · 5.2.2.4–5.2.2.5", "Páginas físicas 98, 99"],
          questions: [
            {
              q: "El cambio de red coincide con cambio de estación. ¿Qué indica PANS?",
              options: [
                "Coordinación entre estaciones antes de aconsejar/autorizar el cambio y nuevas primary/secondary",
                "Cambiar sin avisar a ninguna estación",
                "Omitir ambas frecuencias nuevas",
              ],
              answer: 0,
              why: "5.2.2.5.2 busca continuidad coordinando la transición.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Communication Watch and Frequency Management · 4",
          title: "VHF y designadores de canal",
          body: '<p><span class="norm">Standard</span> VHF: la estación indica la transferencia conforme a procedimientos acordados; si no lo hace, la aeronave notifica antes. En primer contacto o al dejar una frecuencia se transmite la información prescrita por la autoridad.</p><p><span class="norm">PANS</span> Para designador VHF se usan seis cifras; si quinta y sexta son cero, bastan cuatro: 118.000 → ONE ONE EIGHT DECIMAL ZERO; 118.005 → ONE ONE EIGHT DECIMAL ZERO ZERO FIVE. En el caso específico de espacio aéreo con todos los canales separados 25 kHz o más y sin requisito operacional de seis cifras, se usan cinco, con la misma excepción de ceros: 118.025 → ONE ONE EIGHT DECIMAL ZERO TWO.</p><p><span class="norm">Note</span> Se debe cuidar la selección correcta en paneles de cinco/seis cifras. No se aplica la excepción de cinco sin verificar el contexto descrito.</p>',
          guide: "Los ceros intermedios identifican el canal y no pueden eliminarse.",
          refs: ["Annex 10, Volume II · 5.2.2.6; 5.2.1.7.3.4", "Páginas físicas 92, 93, 99"],
          questions: [
            {
              q: "Bajo la regla general de seis cifras, ¿cómo identificas 118.005?",
              options: [
                "ONE ONE EIGHT DECIMAL ZERO ZERO FIVE",
                "ONE ONE EIGHT DECIMAL FIVE",
                "ONE ONE EIGHT DECIMAL ZERO",
              ],
              answer: 0,
              why: "Los ceros intermedios identifican el canal y no pueden eliminarse.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Communication Watch and Frequency Management · 5",
          title: "Interpilot y tráfico entre estaciones",
          body: '<p><span class="norm">Standard</span> Interpilot air-to-air se establece en 123.45 MHz mediante llamada dirigida o general, teniendo en cuenta las condiciones de uso. Su definición se refiere a vuelos en áreas remotas y oceánicas fuera del alcance VHF terrestre. <span class="norm">PANS</span> La llamada inicial incluye <strong>INTERPILOT</strong> porque la aeronave puede vigilar más de una frecuencia.</p><p>Si estaciones de red usan air-ground para coordinación esencial, PANS indica usar, en lo posible, frecuencias que no lleven el grueso del tráfico air-ground. Las comunicaciones con aeronaves tienen prioridad sobre ese intercambio entre estaciones terrestres.</p>',
          guide: "Permite reconocer el canal en aeronaves que vigilan varias frecuencias.",
          refs: ["Annex 10, Volume II · 5.2.1.7.3.2.6; 5.2.2.3.4", "Páginas físicas 91, 92, 98"],
          questions: [
            {
              q: "¿Qué identificación distintiva incluye la llamada inicial interpilot según PANS?",
              options: ["INTERPILOT", "SVC", "CURRENT DATA AUTHORITY"],
              answer: 0,
              why: "Permite reconocer el canal en aeronaves que vigilan varias frecuencias.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Voice Communication Failure · 1",
          title: "Intentos de recuperación air-ground",
          body: '<span class="norm">Standard</span> <p>Si falla contacto con la estación apropiada en el canal designado, se intenta el <strong>canal anterior</strong>; si falla, otro apropiado a la ruta. Si tampoco funciona, se intenta comunicar con la estación apropiada, otras estaciones o aeronaves usando todos los medios disponibles, e informar que no se logró contacto en el canal asignado.</p><p>Dentro de una red se monitoriza además el canal VHF apropiado para llamadas de aeronaves cercanas. La secuencia trata la recuperación de comunicaciones; no introduce reglas de navegación de otros Annexes.</p>',
          guide: "5.2.2.7.1.1 establece esa progresión.",
          refs: ["Annex 10, Volume II · 5.2.2.7.1.1", "Páginas físicas 99, 100"],
          order: [
            "Intentar el canal anterior",
            "Intentar otro canal apropiado a la ruta",
            "Intentar contacto con estaciones o aeronaves por todos los medios disponibles",
          ],
        },
        {
          label: "Voice Communication Failure · 2",
          title: "TRANSMITTING BLIND",
          body: '<p><span class="norm">Standard</span> Si fallan los intentos anteriores, se transmite el mensaje <strong>dos veces</strong> en el canal o canales designados, precedido de <strong>TRANSMITTING BLIND</strong>, incluyendo destinatarios cuando sea necesario.</p><p><span class="norm">PANS</span> En operación de red, debería transmitirse dos veces tanto en primary como en secondary, anunciando el canal al que se cambia antes del cambio.</p><p>Blind transmission no afirma que exista recepción confirmada: se usa precisamente cuando no se ha establecido el intercambio de dos vías.</p>',
          guide: "La frase y la duplicación del mensaje están en 5.2.2.7.1.2.",
          refs: ["Annex 10, Volume II · 5.2.2.7.1.2–7.1.2.1", "Páginas físicas 100"],
          questions: [
            {
              q: "Tras agotar los intentos, ¿qué frase precede a la transmisión prescrita?",
              options: ["TRANSMITTING BLIND", "ROGER", "DISTRESS TRAFFIC ENDED"],
              answer: 0,
              why: "La frase y la duplicación del mensaje están en 5.2.2.7.1.2.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Voice Communication Failure · 3",
          title: "Si el receptor ha fallado",
          body: '<span class="norm">Standard</span> <p>Se transmiten reportes en horas o posiciones previstas sobre el canal en uso, precedidos de <strong>TRANSMITTING BLIND DUE TO RECEIVER FAILURE</strong>. El mensaje se repite completo y se indica la hora de la siguiente transmisión prevista.</p><p>Con ATC o advisory service se transmiten además las intenciones del pilot-in-command respecto de continuar el vuelo. Si la falla es de equipo a bordo y se dispone de SSR, se selecciona el código apropiado para radio failure. Este apartado no da la cifra del código; no se agrega una de memoria.</p>',
          guide:
            "El procedimiento pide anunciar la próxima transmisión además de repetir el mensaje.",
          refs: ["Annex 10, Volume II · 5.2.2.7.1.3", "Páginas físicas 100"],
          questions: [
            {
              q: "¿Qué información adicional exige la secuencia de receiver failure?",
              options: [
                "La hora de la siguiente transmisión prevista",
                "Solo una palabra ROGER",
                "Un código SSR numérico que no figura en este apartado",
              ],
              answer: 0,
              why: "El procedimiento pide anunciar la próxima transmisión además de repetir el mensaje.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Voice Communication Failure · 4",
          title: "Falla ground-to-air y notificación",
          body: '<p><span class="norm">Standard</span> Tras llamadas sin éxito donde se cree que escucha la aeronave, la estación solicita asistencia a otras estaciones y aeronaves de la ruta para establecer contacto y relay. También se aplica por solicitud ATS o cuando la falta de una comunicación esperada hace sospechar falla.</p><p><span class="norm">Recommendation</span> Si falla esa asistencia, se recomienda blind transmission de mensajes que no contengan ATC clearances en las frecuencias donde se cree que escucha. <span class="norm">Standard</span> Una ATC clearance no se transmite blind salvo solicitud específica del originador.</p><p>La air-ground control radio station notifica cuanto antes la falla a la unidad ATS y aircraft operating agency apropiadas.</p>',
          guide:
            "5.2.2.7.2.4 contiene esa excepción precisa; no se generaliza a todas las clearances.",
          refs: ["Annex 10, Volume II · 5.2.2.7.2–7.3", "Páginas físicas 100, 101"],
          questions: [
            {
              q: "¿Cuándo permite el apartado transmitir una ATC clearance blind?",
              options: [
                "Solo a solicitud específica del originador",
                "Siempre que se haya llamado una vez",
                "Nunca, sin excepción prevista",
              ],
              answer: 0,
              why: "5.2.2.7.2.4 contiene esa excepción precisa; no se generaliza a todas las clearances.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "HF Message Handling · 1",
          title: "Elegir la estación que facilita la entrega",
          body: '<span class="norm">PANS</span> <p>En red, si las condiciones lo permiten, la aeronave debería enviar el mensaje a la estación desde la que pueda entregarse más fácilmente a su destino final. Los reportes requeridos por ATS van a la estación que sirve al FIC/ACC de su área; hacia la aeronave, se prefiere la estación que sirve al originador.</p><p><span class="norm">Note</span> Excepcionalmente puede comunicarse con una estación fuera de su red, siempre que no interrumpa el watch continuo requerido en la red apropiada ni interfiera indebidamente a otras estaciones.</p>',
          guide: "El principio busca entregar el mensaje al destino operacional adecuado.",
          refs: ["Annex 10, Volume II · 5.2.3.1.1", "Páginas físicas 101"],
          questions: [
            {
              q: "¿Qué guía la elección de estación para un reporte ATS?",
              options: [
                "La estación que sirve al FIC/ACC del área donde vuela la aeronave",
                "Siempre la estación más lejana",
                "La primera que permita abandonar todo watch requerido",
              ],
              answer: 0,
              why: "El principio busca entregar el mensaje al destino operacional adecuado.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "HF Message Handling · 2",
          title: "Receipt e intercept no son lo mismo",
          body: '<span class="norm">PANS</span> <p>Otras estaciones de la red que necesitan la información deberían interceptarla y acusarla cuando sea posible. El acknowledgement de intercept sigue <strong>inmediatamente después</strong> del acknowledgement de recepción de la estación llamada.</p><p>La estación que interceptó dice su call sign, opcionalmente ROGER, y call sign de quien transmitió. Si falta acknowledgement de intercept durante <strong>un minuto</strong>, la estación que aceptó desde la aeronave debería reenviar, normalmente por AFS, a quienes no acusaron intercept. Si se usa AFTN, dirige a las estaciones correspondientes; estas distribuyen como si hubieran recibido directamente.</p><p>Donde sea practicable, estos procedimientos también se aplican fuera de red. El número de estaciones que interceptan se mantiene al mínimo compatible con necesidad operacional según Note.</p>',
          guide: "Receipt e intercept confirman acciones diferentes dentro de la red.",
          refs: ["Annex 10, Volume II · 5.2.3.1.2–1.3", "Páginas físicas 101, 102"],
          order: [
            "La estación llamada acusa recepción",
            "Se espera el acknowledgement de intercept de las otras estaciones",
            "Tras un minuto sin ese acknowledgement, se reenvía a las estaciones faltantes",
          ],
        },
        {
          label: "HF Message Handling · 3",
          title: "Entregar información y conservar responsabilidad",
          body: '<p><span class="norm">Standard</span> Air-report o mensaje meteorológico recibido desde una aeronave se remite sin demora a ATS y oficinas meteorológicas asociadas; también a la operating agency si lo pidió específicamente.</p><p><span class="norm">Recommendation</span> Si no se logra contactar una aeronave destinataria, se recomienda reenviar a estaciones de ruta que puedan; si no se dispone así del mensaje, avisar al origen. <span class="norm">Standard</span> Al reenviar se sustituye la propia ubicación por la de la nueva estación en address.</p><p><span class="norm">PANS</span> Si un mensaje ATS no se entrega dentro del plazo ATS, se informa al originador y no se actúa más salvo instrucción. Sin acknowledgement, se supone no recibido y se avisa inmediatamente. Pedir ayuda para relay no delega la responsabilidad de entrega: se obtiene certeza de acknowledgement correcto.</p>',
          guide: "La ausencia de acknowledgement no se trata como prueba de entrega.",
          refs: ["Annex 10, Volume II · 5.2.3.1.2.6; 5.2.3.1.4; 5.2.3.2", "Páginas físicas 102"],
          questions: [
            {
              q: "Transmitiste un mensaje ATS pero no lograste acknowledgement. ¿Qué supone PANS?",
              options: [
                "No recibido, e informar inmediatamente al originador",
                "Entregado porque salió por radio",
                "Entregado si no fue un mensaje de distress",
              ],
              answer: 0,
              why: "La ausencia de acknowledgement no se trata como prueba de entrega.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "HF Message Handling · 4",
          title: "Registrar el intercambio HF",
          body: '<span class="norm">PANS</span> <p>En teletypewriter, cada línea comienza al margen izquierdo y cada transmisión usa una nueva línea. El registro incluye, según corresponda: call sign de quien llama; texto; call sign de llamada/receptora y abreviación de recibido/readback/sin respuesta; estaciones que acusaron intercept; frecuencia; hora UTC.</p><p>Partes faltantes: <strong>. . .</strong> o <strong>M M M</strong> con espacios. Errores de tecleo: <strong>E E E</strong> y dato correcto. Errores detectados después de completar la entrada se corrigen después de la última entrada, con <strong>COR</strong> y lo correcto.</p>',
          guide:
            "El registro debe permitir reconocer lo que no se recibió, sin reconstrucciones supuestas.",
          refs: ["Annex 10, Volume II · 5.2.3.3", "Páginas físicas 102, 103"],
          questions: [
            {
              q: "¿Cómo se representa texto faltante en este registro?",
              options: [
                "Tres puntos o tres M separados por espacios",
                "Se inventa el contenido probable",
                "Se omite sin señal alguna",
              ],
              answer: 0,
              why: "El registro debe permitir reconocer lo que no se recibió, sin reconstrucciones supuestas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "SELCAL · 1",
          title: "Qué sustituye SELCAL",
          body: '<span class="norm">PANS</span> <p><strong>Selective calling</strong> sustituye la llamada de voz por tonos codificados en canales radiotelefónicos. Una llamada combina cuatro tonos preseleccionados y dura aproximadamente dos segundos. El coder terrestre los genera; el decoder conectado al receptor a bordo reconoce el código y activa luz y/o chime en cockpit.</p><p>Se usa con estaciones equipadas en canales HF y VHF en ruta. La aeronave todavía puede mantener escucha convencional si es necesario. <span class="norm">Note</span> Como hay códigos limitados, distintas aeronaves pueden compartir código; se mantienen los procedimientos correctos RTF al establecer comunicación.</p>',
          guide:
            "La descripción de 5.2.4.1.1 se refiere a la llamada, no a reemplazar el contenido de toda comunicación.",
          refs: ["Annex 10, Volume II · 5.2.4.1", "Páginas físicas 103"],
          questions: [
            {
              q: "¿SELCAL sustituye toda la conversación por datos?",
              options: [
                "No; sustituye la llamada de voz por tonos codificados",
                "Sí; elimina el intercambio radiotelefónico",
                "Sí; convierte todo en AFTN",
              ],
              answer: 0,
              why: "La descripción de 5.2.4.1.1 se refiere a la llamada, no a reemplazar el contenido de toda comunicación.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "SELCAL · 2",
          title: "Código conocido antes de usarlo",
          body: '<span class="norm">PANS</span> <p>La operating agency y la aeronave aseguran que las estaciones normalmente contactadas conozcan el código asociado al call sign. Cuando sea practicable, la agencia distribuye listas a intervalos regulares. La aeronave incluye el código en flight plan y verifica con HF mientras aún está dentro de cobertura VHF.</p><p>En principio se asocia el código al radiotelephony call sign: al flight number si este se usa, o a matrícula en los demás casos. <span class="norm">Note</span> Con equipo de código único y call sign por flight number, es esencial avisar a las estaciones del código disponible en cada vuelo.</p>',
          guide:
            "La Note reconoce esa limitación del equipo y exige que las estaciones estén informadas.",
          refs: ["Annex 10, Volume II · 5.2.4.2; 5.2.4.6", "Páginas físicas 103, 104, 105"],
          questions: [
            {
              q: "Se usa equipo de código único con call sign basado en número de vuelo. ¿Qué destaca la Note?",
              options: [
                "Informar en cada vuelo el código SELCAL disponible",
                "Suponer que el código cambia solo con el número de vuelo",
                "No permitir usar ese call sign",
              ],
              answer: 0,
              why: "La Note reconoce esa limitación del equipo y exige que las estaciones estén informadas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "SELCAL · 3",
          title: "Pre-flight check y respuesta",
          body: '<span class="norm">PANS</span> <p>La aeronave contacta la estación y solicita <strong>pre-flight SELCAL check</strong>, facilitando el código si hace falta. Con primary y secondary asignadas, normalmente se comprueba <strong>secondary primero y primary después</strong>, quedando lista para seguir en primary.</p><p>Si el check revela instalación terrestre o aérea inoperativa, mantiene escucha continua en el vuelo siguiente hasta volver a disponer de SELCAL. Cuando la estación inicia con SELCAL, la aeronave responde con su call sign y <strong>GO AHEAD</strong>.</p>',
          guide: "Así la aeronave termina lista para continuar en primary.",
          refs: ["Annex 10, Volume II · 5.2.4.3–5.2.4.4", "Páginas físicas 104"],
          order: ["Secondary frequency", "Primary frequency"],
        },
        {
          label: "SELCAL · 4",
          title: "En ruta: fallo, voz y restauración",
          body: '<span class="norm">PANS</span> <p>La aeronave asegura que la estación sepa que establece o mantiene SELCAL watch. Una vez establecido, las estaciones lo usan para llamar. Los scheduled reports pueden iniciarse por SELCAL cuando lo prescriben acuerdos regionales.</p><p>Sin respuesta después de <strong>dos llamadas en primary y dos en secondary</strong>, la estación vuelve a llamar por voz. Las estaciones de red se notifican inmediatamente fallas SELCAL terrestres o aéreas; la aeronave avisa a las estaciones interesadas que se necesita voice calling. Se avisa a todas cuando el sistema vuelve a funcionar.</p>',
          guide: "5.2.4.5.4 establece el retorno a voz tras esa secuencia de llamadas.",
          refs: ["Annex 10, Volume II · 5.2.4.5", "Páginas físicas 104"],
          questions: [
            {
              q: "No hay respuesta a dos llamadas primary y dos secondary. ¿Qué sigue según PANS?",
              options: [
                "Volver a voice calling",
                "Dar por recibido el mensaje",
                "Esperar indefinidamente sin avisar",
              ],
              answer: 0,
              why: "5.2.4.5.4 establece el retorno a voz tras esa secuencia de llamadas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Distress Communications · 1",
          title: "Reconocer la condición y proteger el tráfico",
          body: '<span class="norm">Standard</span> <p><strong>Distress</strong>: amenaza de peligro serio y/o inminente y necesidad de asistencia inmediata. La primera comunicación empieza con <strong>MAYDAY</strong>; puede repetirse la señal en comunicaciones posteriores.</p><p>Los mensajes dirigidos a la aeronave se reducen al número, volumen y contenido mínimos requeridos por la condición. Si la estación llamada no acusa, otras estaciones prestan asistencia. Normalmente se mantiene la frecuencia inicial hasta considerar que otra permitirá mejor ayuda. Se habla lenta y distintamente.</p><p><span class="norm">Note</span> Pueden usarse 121.5 MHz u otras frecuencias VHF/HF disponibles según corresponda. No se enseña un cambio automático e incondicional a 121.5.</p>',
          guide: "La necesidad de asistencia inmediata es parte de la definición de distress.",
          refs: ["Annex 10, Volume II · 5.3.1", "Páginas físicas 105, 106"],
          questions: [
            {
              q: "El caso describe peligro serio/inminente y necesidad de asistencia inmediata. ¿Qué señal corresponde?",
              options: ["MAYDAY", "PAN PAN como regla de este caso", "ROGER"],
              answer: 0,
              why: "La necesidad de asistencia inmediata es parte de la definición de distress.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Distress Communications · 2",
          title: "Construir el mensaje de distress",
          body: '<span class="norm">Standard</span> <p>Se transmite en la frecuencia air-ground en uso, precedido de <strong>MAYDAY</strong>, preferiblemente tres veces. Se incluyen tantos elementos como sea posible, claramente y, si es posible, en este orden:</p><div class="table-scroll"><table><thead><tr><th>Orden</th><th>Elemento</th></tr></thead><tbody><tr><td>1</td><td>Estación destinataria, si tiempo y circunstancias lo permiten.</td></tr><tr><td>2</td><td>Identificación de la aeronave.</td></tr><tr><td>3</td><td>Naturaleza del distress.</td></tr><tr><td>4</td><td>Intenciones de la persona al mando.</td></tr><tr><td>5</td><td>Posición actual, nivel y heading.</td></tr></tbody></table></div><p>No conviertas «preferiblemente tres veces» o «si es posible en este orden» en una condición que impida pedir ayuda. Las Notes permiten medidas suplementarias, broadcast y cualquier medio disponible para llamar la atención, manteniendo clara la situación.</p>',
          guide:
            "La secuencia facilita recibir lo esencial, con la flexibilidad expresada en 5.3.2.1.1.",
          refs: ["Annex 10, Volume II · 5.3.2.1", "Páginas físicas 106"],
          order: [
            "Estación destinataria",
            "Identificación de aeronave",
            "Naturaleza del distress",
            "Intenciones",
            "Posición, nivel y heading",
          ],
        },
        {
          label: "Distress Communications · 3",
          title: "La estación que recibe se hace cargo",
          body: '<span class="norm">Standard</span> <p>La estación llamada, o la primera que acusa el distress, <strong>acusa inmediatamente</strong>, toma control de comunicaciones o transfiere clara y específicamente la responsabilidad avisando a la aeronave.</p><p>Actúa de inmediato para facilitar toda información necesaria a ATS y a la operating agency/representante conforme a arreglos previos. Advierte a otras estaciones para evitar que transfieran tráfico hacia la frecuencia de distress.</p><p><span class="norm">Note</span> Notificar a la agencia no tiene prioridad sobre acciones que afecten la seguridad del vuelo en distress, otros vuelos de la zona o su evolución prevista.</p>',
          guide:
            "El control de comunicaciones y la protección del tráfico se atienden de inmediato.",
          refs: ["Annex 10, Volume II · 5.3.2.2", "Páginas físicas 107"],
          questions: [
            {
              q: "¿Qué acción inicial corresponde a la primera estación que acusa?",
              options: [
                "Acknowledgement inmediato y asumir control o transferirlo claramente",
                "Esperar a contactar a la agencia antes de toda acción de seguridad",
                "Derivar tráfico ordinario hacia la misma frecuencia",
              ],
              answer: 0,
              why: "El control de comunicaciones y la protección del tráfico se atienden de inmediato.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Distress Communications · 4",
          title: "Imponer silencio y prestar asistencia",
          body: '<span class="norm">Standard</span> <p>La aeronave en distress o la estación que controla ese tráfico puede imponer silencio a todas las estaciones del área o a una que interfiera usando <strong>STOP TRANSMITTING</strong> y <strong>MAYDAY</strong>. El uso de esas señales queda reservado a ellas.</p><p>Distress tiene <strong>prioridad absoluta</strong>. Quien lo conoce no transmite en esa frecuencia, salvo cancelación/terminación, traslado de todo el tráfico a otras frecuencias, permiso de la estación controladora o necesidad de prestar asistencia. Si no puede ayudar, continúa escuchando hasta que sea evidente que ya se presta ayuda.</p>',
          guide: "La escucha y las restricciones de transmisión protegen la asistencia.",
          refs: ["Annex 10, Volume II · 5.3.2.3–5.3.2.4", "Páginas físicas 107"],
          questions: [
            {
              q: "Otra estación oye distress pero no puede asistir. ¿Qué debe hacer?",
              options: [
                "Continuar escuchando hasta que sea evidente que se está prestando ayuda",
                "Transmitir un mensaje de flight regularity",
                "Imponer por sí misma silencio como si controlara el distress",
              ],
              answer: 0,
              why: "La escucha y las restricciones de transmisión protegen la asistencia.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Distress Communications · 5",
          title: "Terminar distress no es solo guardar silencio",
          body: '<span class="norm">Standard</span> <p>La aeronave que ya no está en distress transmite un mensaje cancelando esa condición. La estación controladora, al conocer el fin, informa cuanto antes a ATS y a la operating agency/representante.</p><p>Para terminar comunicaciones de distress y silencio, la estación controladora transmite un mensaje que incluye <strong>DISTRESS TRAFFIC ENDED</strong> en las frecuencias usadas. Solo ella lo origina, tras recibir la cancelación de la aeronave y estar autorizada por la autoridad apropiada.</p>',
          guide:
            "5.3.2.5.3 reserva ese anuncio a la controladora, después de cancelación y autorización.",
          refs: ["Annex 10, Volume II · 5.3.2.5", "Páginas físicas 108"],
          questions: [
            {
              q: "¿Quién origina DISTRESS TRAFFIC ENDED bajo las condiciones prescritas?",
              options: [
                "La estación que controla las comunicaciones",
                "Cualquier estación que deje de oír MAYDAY",
                "Solo un destinatario de un mensaje AFTN",
              ],
              answer: 0,
              why: "5.3.2.5.3 reserva ese anuncio a la controladora, después de cancelación y autorización.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Urgency Communications · 1",
          title: "El criterio de urgency",
          body: '<span class="norm">Standard</span> <p><strong>Urgency</strong> afecta a la seguridad de una aeronave u otro vehículo, o una persona a bordo o a la vista, pero no requiere asistencia inmediata. La primera comunicación empieza con <strong>PAN PAN</strong>.</p><p>Tiene prioridad sobre toda comunicación <strong>excepto distress</strong>. Las demás estaciones evitan interferir. Se mantiene normalmente la frecuencia inicial hasta considerar mejor asistencia en otra; se transmiten los mensajes lentamente y con claridad, limitando lo dirigido a la aeronave a lo necesario.</p>',
          guide:
            "El criterio reproduce 5.3.1.1 b), sin asociar de memoria una avería concreta a una categoría.",
          refs: ["Annex 10, Volume II · 5.3.1; 5.3.3.3", "Páginas físicas 105, 106, 109"],
          questions: [
            {
              q: "Una condición de seguridad no requiere asistencia inmediata. ¿Qué definición encaja?",
              options: ["Urgency", "Distress necesariamente", "Flight regularity por definición"],
              answer: 0,
              why: "El criterio reproduce 5.3.1.1 b), sin asociar de memoria una avería concreta a una categoría.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Urgency Communications · 2",
          title: "Componer el urgency message",
          body: '<span class="norm">Standard</span> <p>PAN PAN se pronuncia preferiblemente tres veces; cada palabra como el francés «panne». Se usa la frecuencia air-ground en uso. El mensaje contiene tantos elementos como se requieran y, si es posible, en el orden siguiente: estación destinataria, identificación de aeronave, naturaleza de urgency, intenciones, posición/nivel/heading y <strong>otra información útil</strong>.</p><p><span class="norm">Note</span> No se impide broadcast si tiempo y circunstancias lo hacen preferible. La destinataria normalmente es la estación con la que se comunica o la responsable del área.</p>',
          guide: "Es la secuencia de 5.3.3.1.1 con las condiciones expresadas por el texto.",
          refs: ["Annex 10, Volume II · 5.3.3.1", "Páginas físicas 108"],
          order: [
            "Estación destinataria",
            "Identificación de aeronave",
            "Naturaleza de urgency",
            "Intenciones",
            "Posición, nivel y heading",
            "Otra información útil",
          ],
        },
        {
          label: "Urgency Communications · 3",
          title: "Acción de la estación y de las demás",
          body: '<span class="norm">Standard</span> <p>La estación llamada o la primera que acusa hace acknowledgement, facilita cuanto antes la información a ATS y a la operating agency/representante según acuerdos, y <strong>si es necesario</strong> controla comunicaciones.</p><p>Las demás estaciones no interfieren; la prioridad permanece por debajo de distress. La Note sobre notificación a la agencia preserva la prioridad de acciones que afectan seguridad y evolución de vuelos.</p>',
          guide:
            "5.3.3.2.1 c) expresa esa condición; no hay que copiar automáticamente toda la secuencia distress.",
          refs: ["Annex 10, Volume II · 5.3.3.2–5.3.3.3", "Páginas físicas 109"],
          questions: [
            {
              q: "¿Cuándo ejerce control de las comunicaciones la estación que acusa urgency?",
              options: [
                "Si es necesario",
                "Nunca",
                "Solo después de que todas las estaciones transmitan primero",
              ],
              answer: 0,
              why: "5.3.3.2.1 c) expresa esa condición; no hay que copiar automáticamente toda la secuencia distress.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Urgency Communications · 4",
          title: "Protected medical transports",
          body: '<span class="norm">Standard</span> <p>El uso de la señal indica que el mensaje trata de un <strong>protected medical transport</strong> conforme a las Convenciones y Protocolos que cita la fuente. No es una etiqueta automática para cualquier problema médico a bordo.</p><p>PAN PAN, preferiblemente tres veces, va seguido por la señal de medical transports <strong>MAY-DEE-CAL</strong>, pronunciada como el francés «médical». Se dan: call sign u otra identificación reconocida; posición; número y tipo de transportes; ruta prevista; tiempos estimados en ruta, salida y llegada según corresponda; y otra información como altitud, frecuencias vigiladas, idiomas y modos/códigos SSR.</p><p>Las estaciones aplican 5.3.3.2 y 5.3.3.3 según corresponda: acknowledgement, información, control si hace falta y protección de prioridad.</p>',
          guide: "El significado está expresamente limitado en 5.3.3.4.1–4.2.",
          refs: ["Annex 10, Volume II · 5.3.3.4–5.3.3.5", "Páginas físicas 109, 110"],
          questions: [
            {
              q: "¿Qué indica específicamente la señal de medical transports?",
              options: [
                "Que el mensaje concierne a un protected medical transport",
                "Que cualquier pasajero está mareado",
                "Que urgency pasa automáticamente por encima de distress",
              ],
              answer: 0,
              why: "El significado está expresamente limitado en 5.3.3.4.1–4.2.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Unlawful Interference Communications · 1",
          title: "Una circunstancia excepcional",
          body: '<p><span class="norm">Note</span> Los actos de unlawful interference pueden crear circunstancias excepcionales que impidan usar los procedimientos reconocidos para determinar categoría y prioridad.</p><p>Esto explica por qué el alumno no debe esperar siempre una comunicación que siga el formato habitual antes de reconocer que puede requerirse ayuda. El texto no proporciona aquí una secuencia de señales encubiertas ni códigos numéricos; no se agregan.</p>',
          guide: "La Note reconoce una limitación posible del procedimiento normal.",
          refs: ["Annex 10, Volume II · 5.1.8 Note 1; 5.4", "Páginas físicas 78, 110"],
          questions: [
            {
              q: "¿Qué advierte la Note sobre unlawful interference?",
              options: [
                "Puede impedir el uso de procedimientos habituales para categoría/prioridad",
                "Siempre sigue un formato único completo",
                "Elimina toda responsabilidad de asistencia",
              ],
              answer: 0,
              why: "La Note reconoce una limitación posible del procedimiento normal.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Unlawful Interference Communications · 2",
          title: "Quién actúa y a quién notifica",
          body: '<span class="norm">Standard</span> <p>La estación llamada por la aeronave sometida a unlawful interference, o la primera que acusa una llamada de ella, presta <strong>toda la asistencia posible</strong>.</p><p>Esto incluye notificar a las unidades ATS apropiadas y a cualquier otra estación, agencia o persona en posición de facilitar el vuelo. La responsabilidad no se limita a reenviar la llamada a una única entidad.</p>',
          guide: "La regla de asistencia y notificación es el contenido operacional de 5.4.",
          refs: ["Annex 10, Volume II · 5.4", "Páginas físicas 110"],
          questions: [
            {
              q: "¿Qué alcance de asistencia prescribe 5.4?",
              options: [
                "Toda la posible, incluida notificación a ATS y a quienes puedan facilitar el vuelo",
                "Solo responder ROGER y cerrar",
                "Esperar siempre un formato perfecto antes de actuar",
              ],
              answer: 0,
              why: "La regla de asistencia y notificación es el contenido operacional de 5.4.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Aterrizaje",
          title: "Repaso del chapter.",
          body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
          recap: [
            ["General Principles and Message Priority", "Tema revisado dentro de este chapter."],
            [
              "Language and Radiotelephony Spelling Alphabet",
              "Tema revisado dentro de este chapter.",
            ],
            ["Transmission of Numbers", "Tema revisado dentro de este chapter."],
            ["Transmitting Technique and Standard Words", "Tema revisado dentro de este chapter."],
            ["Message Composition and Calling", "Tema revisado dentro de este chapter."],
            [
              "Establishing and Exchanging Radiotelephony Communications",
              "Tema revisado dentro de este chapter.",
            ],
            [
              "Communication Watch and Frequency Management",
              "Tema revisado dentro de este chapter.",
            ],
            ["Voice Communication Failure", "Tema revisado dentro de este chapter."],
            ["HF Message Handling", "Tema revisado dentro de este chapter."],
            ["SELCAL", "Tema revisado dentro de este chapter."],
            ["Distress Communications", "Tema revisado dentro de este chapter."],
            ["Urgency Communications", "Tema revisado dentro de este chapter."],
            ["Unlawful Interference Communications", "Tema revisado dentro de este chapter."],
          ],
          refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
          final: true,
        },
      ],
    },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-6-aeronautical-radio-navigation-service-6": {
    id: "annex10-v2-chapter-6",
    folder: "06_Aeronautical_Radio_Navigation_Service",
    name: "Aeronautical Radio Navigation Service",
    subtitle: "2 temas · 8 misiones",
    year: "ICAO Annex 10 · Volume II",
    word: "Chapter 6",
    sources: [
      "1.1; 6.1.1 · páginas 20, 111",
      "1.2; 1.4; 6.2 introductory notes; 6.2.1–6.2.2.1 · páginas 21, 22, 111, 112",
      "6.1.2–6.1.2.1 · páginas 111",
      "6.1.3 · páginas 111",
      "6.2.12 · páginas 113",
      "6.2.12–6.2.13 · páginas 113",
      "6.2.3–6.2.6 · páginas 112",
      "6.2.7–6.2.11 · páginas 112, 113",
    ],
    steps: [
      {
        label: "Despegue",
        title: "Aeronautical Radio Navigation Service",
        body: "Chapter 6 de ICAO Annex 10, Volume II. Este recorrido reúne 2 temas fuente en su orden académico.",
        hero: true,
        cards: [
          [
            "Aeronautical Radio Navigation Service",
            "Relaciona el servicio con sus ayudas, las solicitudes de activación y la comunicación de cambios de estado.",
          ],
          [
            "Direction Finding",
            "Aprende qué puede proporcionar una estación sola o una red y cómo solicitar, interpretar y confirmar la respuesta.",
          ],
        ],
      },
      {
        label: "Aeronautical Radio Navigation Service · 1",
        title: "Alcance del servicio",
        body: '<span class="norm">Standard</span> <p>El aeronautical radio navigation service comprende <strong>todos los tipos y sistemas de radio navigation aids</strong> del servicio aeronáutico internacional. Su definición sitúa su finalidad en el beneficio y operación segura de las aeronaves.</p><p>Este capítulo de Volume II trata procedimientos del servicio. No desarrolla aquí diseño, principios físicos o uso instrumental detallado de cada radioayuda; la siguiente ruta se concentra en direction finding porque la fuente sí desarrolla su procedimiento.</p>',
        guide: "Direction finding es un desarrollo específico dentro de un alcance más amplio.",
        refs: ["Annex 10, Volume II · 1.1; 6.1.1", "Páginas físicas 20, 111"],
        questions: [
          {
            q: "¿Qué comprende el servicio según 6.1.1?",
            options: [
              "Todos los tipos y sistemas de radioayudas del servicio aeronáutico internacional",
              "Solo direction finding",
              "Solo comunicaciones de voz entre pilotos",
            ],
            answer: 0,
            why: "Direction finding es un desarrollo específico dentro de un alcance más amplio.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aeronautical Radio Navigation Service · 2",
        title: "Solicitar una ayuda no continua",
        body: '<p><span class="norm">Standard</span> Una radioayuda que no opera continuamente se pone en funcionamiento, <strong>si es practicable</strong>, cuando lo solicita una aeronave, una autoridad de control en tierra o un representante autorizado de una aircraft operating agency.</p><p><span class="norm">Recommendation</span> La solicitud desde aeronave debería dirigirse a la estación aeronáutica correspondiente en la frecuencia air-ground normalmente en uso.</p>',
        guide: "Hay que conservar tanto el deber como la condición incluida en 6.1.2.",
        refs: ["Annex 10, Volume II · 6.1.2–6.1.2.1", "Páginas físicas 111"],
        questions: [
          {
            q: "¿La activación de una ayuda no continua es incondicional?",
            options: [
              "No; el Standard incluye «si es practicable»",
              "Sí; sin ninguna condición de posibilidad",
              "Es solo una Note",
            ],
            answer: 0,
            why: "Hay que conservar tanto el deber como la condición incluida en 6.1.2.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aeronautical Radio Navigation Service · 3",
        title: "Cambios de estado y AIS",
        body: '<span class="norm">Standard</span> <p>Se establecen arreglos para que la unidad local de <strong>aeronautical information service</strong> reciba sin demora información esencial sobre cambios del estado operacional de non-visual aids.</p><p>La finalidad indicada es apoyar pre-flight briefing y difusión de información conforme a la referencia del Annex. Este LP conserva esa responsabilidad sin añadir el procedimiento editorial de otros documentos.</p>',
        guide: "6.1.3 vincula el cambio operacional con información aeronáutica oportuna.",
        refs: ["Annex 10, Volume II · 6.1.3", "Páginas físicas 111"],
        questions: [
          {
            q: "¿Quién debe recibir sin demora los cambios esenciales del estado operacional?",
            options: [
              "La unidad local AIS",
              "Solo una estación elegida por el alumno",
              "Nadie hasta terminar el mes",
            ],
            answer: 0,
            why: "6.1.3 vincula el cambio operacional con información aeronáutica oportuna.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Direction Finding · 1",
        title: "Bearing, heading y position",
        body: '<p>Radio direction finding usa la recepción de ondas para determinar dirección. Un <strong>radio bearing</strong> es el ángulo entre la dirección aparente de una emisión y una referencia; true toma true North y magnetic toma magnetic North.</p><p><span class="norm">Note introductoria</span> Una estación sola solo determina la dirección de la aeronave respecto a ella; pueden trabajar grupos bajo una estación principal. <span class="norm">Recommendation</span> Una estación sola debería facilitar true/magnetic bearing o true/magnetic heading <strong>sin viento</strong> para dirigirse a ella, según solicitud.</p><p>Una red envía bearings a su controladora para determinar posición. Esta puede dar posición respecto a referencia o lat/long, true bearing y distancia, o magnetic heading sin viento y distancia hacia la referencia. No conviertas «heading sin viento» en un cálculo de corrección de viento.</p>',
        guide: "La Note introductoria 2 expresa la limitación de una estación sola.",
        refs: [
          "Annex 10, Volume II · 1.2; 1.4; 6.2 introductory notes; 6.2.1–6.2.2.1",
          "Páginas físicas 21, 22, 111, 112",
        ],
        questions: [
          {
            q: "¿Qué limitación tiene una estación trabajando sola?",
            options: [
              "Solo determina dirección respecto de sí misma",
              "Determina siempre una posición completa por sí sola",
              "Calcula necesariamente el viento y corrige el heading",
            ],
            answer: 0,
            why: "La Note introductoria 2 expresa la limitación de una estación sola.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Direction Finding · 2",
        title: "Solicitar y transmitir para observación",
        body: '<span class="norm">Standard</span> <p>Se llama a la estación responsable o controladora de la red en su listening frequency y se especifica el servicio deseado mediante frase apropiada. Cuando estén listas, la estación indica, si hace falta, frecuencia, repeticiones, duración u otro requisito de transmisión.</p><p>En radiotelephony, la aeronave termina la solicitud de bearing repitiendo su call sign. Si la transmisión resultó muy corta, transmite más tiempo en <strong>dos períodos de aproximadamente diez segundos</strong>, o las señales solicitadas. Si la observación no satisface a la estación, pide repetir.</p><p><span class="norm">Note</span> Algunas VHF/DF requieren señal modulada de voz para obtener bearing.</p>',
        guide: "El requisito permite obtener una observación utilizable.",
        refs: ["Annex 10, Volume II · 6.2.3–6.2.6", "Páginas físicas 112"],
        questions: [
          {
            q: "La transmisión fue demasiado breve. ¿Qué alternativa prescribe 6.2.5.1?",
            options: [
              "Dos períodos de aproximadamente diez segundos, o señales solicitadas",
              "Inventar una posición para evitar repetir",
              "Responder WILCO sin nueva transmisión",
            ],
            answer: 0,
            why: "El requisito permite obtener una observación utilizable.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Direction Finding · 3",
        title: "Interpretar la respuesta y hacer readback",
        body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Respuesta</th><th>Orden</th></tr></thead><tbody><tr><td>Bearing / heading</td><td>Frase apropiada; tres cifras en grados respecto a estación; clase; hora de observación si hace falta.</td></tr><tr><td>Position</td><td>Frase apropiada; posición; clase; hora de observación.</td></tr></tbody></table></div><p>La aeronave repite el mensaje al recibirlo para confirmación o corrección. Si la referencia no es la estación, se usa aeródromo, ciudad destacada o rasgo geográfico; se prefiere aeródromo. Para ciudad grande, la referencia de distancia/dirección es su centro.</p><p>Lat/long: grados y minutos, seguidos por N/S y E/W; por voz se dicen NORTH, SOUTH, EAST o WEST.</p>',
        guide: "6.2.9 exige readback, no solo acusar recepción.",
        refs: ["Annex 10, Volume II · 6.2.7–6.2.11", "Páginas físicas 112, 113"],
        questions: [
          {
            q: "¿Qué hace la aeronave tras recibir bearing, heading o position?",
            options: [
              "Repite el mensaje para confirmación o corrección",
              "Asume que la clase es siempre A",
              "Omite la referencia para abreviar",
            ],
            answer: 0,
            why: "6.2.9 exige readback, no solo acusar recepción.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Direction Finding · 4",
        title: "La clase expresa precisión estimada",
        body: '<span class="norm">Standard</span> <div class="table-scroll"><table><thead><tr><th>Clase</th><th>Bearing</th><th>Position</th></tr></thead><tbody><tr><td>A</td><td>±2°</td><td>Dentro de 9,3 km (5 NM)</td></tr><tr><td>B</td><td>±5°</td><td>Dentro de 37 km (20 NM)</td></tr><tr><td>C</td><td>±10°</td><td>Dentro de 92 km (50 NM)</td></tr><tr><td>D</td><td>Menor precisión que C</td><td>Menor precisión que C</td></tr></tbody></table></div><p>La clase deriva de la estimación de exactitud de la estación. No intercambies los límites angulares de bearing con los límites de distancia de position.</p><p>La estación tiene autoridad para rechazar bearing, heading o position si las condiciones son insatisfactorias o fuera de sus límites calibrados; da la razón al rechazar.</p>',
        guide: "El 5 de Class B es angular; los 5 NM corresponden a position Class A.",
        refs: ["Annex 10, Volume II · 6.2.12–6.2.13", "Páginas físicas 113"],
        questions: [
          {
            q: "Una respuesta de bearing Class B expresa…",
            options: [
              "Exactitud dentro de ±5°",
              "Exactitud dentro de 5 NM",
              "Precisión menor que Class C",
            ],
            answer: 0,
            why: "El 5 de Class B es angular; los 5 NM corresponden a position Class A.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Direction Finding · 5",
        title: "No mezcles grados y distancia",
        body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
        guide: "La clase A, B o C debe leerse junto al tipo de resultado: bearing o position.",
        refs: ["Annex 10, Volume II · 6.2.12", "Páginas físicas 113"],
        match: [
          ["Bearing Class A", "±2°"],
          ["Bearing Class B", "±5°"],
          ["Bearing Class C", "±10°"],
          ["Position Class A", "9,3 km (5 NM)"],
          ["Position Class B", "37 km (20 NM)"],
          ["Position Class C", "92 km (50 NM)"],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Repaso del chapter.",
        body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
        recap: [
          ["Aeronautical Radio Navigation Service", "Tema revisado dentro de este chapter."],
          ["Direction Finding", "Tema revisado dentro de este chapter."],
        ],
        refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
        final: true,
      },
    ],
  },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-7-aeronautical-broadcasting-service-7": {
    id: "annex10-v2-chapter-7",
    folder: "07_Aeronautical_Broadcasting_Service",
    name: "Aeronautical Broadcasting Service",
    subtitle: "2 temas · 6 misiones",
    year: "ICAO Annex 10 · Volume II",
    word: "Chapter 7",
    sources: [
      "1.1; 1.3; 7.1.1–7.1.2.2 · páginas 20, 22, 115",
      "7.1.2.3; 7.2 · páginas 115, 116",
      "7.1.2.3–7.1.2.4.1 · páginas 115",
      "7.1.3 · páginas 115",
      "7.2.1 · páginas 116",
      "7.2.2 · páginas 116",
    ],
    steps: [
      {
        label: "Despegue",
        title: "Aeronautical Broadcasting Service",
        body: "Chapter 7 de ICAO Annex 10, Volume II. Este recorrido reúne 2 temas fuente en su orden académico.",
        hero: true,
        cards: [
          [
            "Aeronautical Broadcasting Service",
            "Revisa preparación, publicación y continuidad del broadcast, incluida la disciplina de los tiempos asignados.",
          ],
          [
            "Radiotelephone Broadcast Procedures",
            "Construye el general call y adapta el ritmo de un broadcast para mantener la claridad.",
          ],
        ],
      },
      {
        label: "Aeronautical Broadcasting Service · 1",
        title: "Material, frecuencia y horario",
        body: '<span class="norm">Standard</span> <p>Broadcast transmite información de navegación aérea sin dirigirse a estaciones específicas. El originador prepara el texto en la forma deseada para transmitirlo. Se usan frecuencias y horas especificadas; los schedules y frecuencias se publican en documentos apropiados.</p><p>Un cambio se publica por NOTAM al menos <strong>dos semanas antes</strong>. Además, si es practicable, se anuncia en broadcasts regulares durante las 48 horas previas, una vez al comienzo y otra al final de cada emisión.</p><p><span class="norm">Note</span> Esto no impide un cambio de frecuencia de emergencia cuando las circunstancias no permiten NOTAM con dos semanas de antelación.</p>',
        guide:
          "Las 48 horas son para anuncios adicionales por broadcasts, condicionados a que sea practicable.",
        refs: ["Annex 10, Volume II · 1.1; 1.3; 7.1.1–7.1.2.2", "Páginas físicas 20, 22, 115"],
        questions: [
          {
            q: "¿Qué período de NOTAM previo establece el cambio ordinario?",
            options: ["Al menos dos semanas", "Solo 48 horas siempre", "Un minuto"],
            answer: 0,
            why: "Las 48 horas son para anuncios adicionales por broadcasts, condicionados a que sea practicable.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aeronautical Broadcasting Service · 2",
        title: "Retraso y time allotment",
        body: '<span class="norm">Standard</span> <p>Los broadcasts programados, salvo sequential collective, comienzan a la hora con general call. Si se retrasan, a la hora prevista se da aviso breve para <strong>stand by</strong>, con minutos aproximados de demora. Tras indicar un período definido, no se comienza antes de que termine.</p><p>En time-allotment, la estación termina puntualmente al agotarse su período, aunque quede material. En sequential collective, cada estación está lista a su hora; si una no empieza, la siguiente espera a su <strong>propia</strong> hora, sin adelantarla.</p>',
        guide: "7.1.2.4.1 conserva el horario de la siguiente estación.",
        refs: ["Annex 10, Volume II · 7.1.2.3–7.1.2.4.1", "Páginas físicas 115"],
        questions: [
          {
            q: "Una estación no inició su turno sequential collective. ¿La siguiente adelanta su emisión?",
            options: [
              "No; espera su propia hora designada",
              "Sí, automáticamente",
              "Cancela todos los turnos del día",
            ],
            answer: 0,
            why: "7.1.2.4.1 conserva el horario de la siguiente estación.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aeronautical Broadcasting Service · 3",
        title: "Interrupción del servicio",
        body: '<span class="norm">Standard</span> <p>Si la estación responsable deja de prestar servicio, otra realiza el broadcast <strong>si es posible</strong> hasta restaurar normalidad. Si no es posible y el broadcast está destinado a recepción por fixed stations, las que deben copiarlo siguen escuchando las frecuencias especificadas hasta que se reanude.</p><p>Las dos ramas importan: primero la alternativa disponible; si no existe, la escucha prescrita para ese tipo de broadcast.</p>',
        guide:
          "La continuidad de escucha es la acción prescrita cuando no puede hacerse el broadcast alternativo.",
        refs: ["Annex 10, Volume II · 7.1.3", "Páginas físicas 115"],
        questions: [
          {
            q: "No hay estación alternativa y el broadcast debe ser copiado por fixed stations. ¿Qué hacen las receptoras?",
            options: [
              "Continúan escuchando en las frecuencias especificadas",
              "Cambian por iniciativa propia a una frecuencia cualquiera",
              "Dan el material por recibido",
            ],
            answer: 0,
            why: "La continuidad de escucha es la acción prescrita cuando no puede hacerse el broadcast alternativo.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Radiotelephone Broadcast Procedures · 1",
        title: "Natural, breve y claro",
        body: '<span class="norm">Standard</span> <p>Radiotelephone broadcasts deben ser tan naturales, cortos y concisos como sea practicable sin perder claridad. La velocidad <strong>no supera 100 palabras por minuto</strong>.</p><p>Aquí el límite está en un Standard de broadcasting. No lo clasifiques solo por recordar que una cifra igual aparecía bajo PANS en la técnica general de radiotelephony.</p>',
        guide: "La ubicación y marcación del apartado determinan su estatus.",
        refs: ["Annex 10, Volume II · 7.2.1", "Páginas físicas 116"],
        questions: [
          {
            q: "¿Qué estatus tiene el máximo de 100 palabras/minuto de 7.2.1.2?",
            options: ["Standard", "Recommendation", "Solo Note"],
            answer: 0,
            why: "La ubicación y marcación del apartado determinan su estatus.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Radiotelephone Broadcast Procedures · 2",
        title: "General call, estación y hora opcional",
        body: '<span class="norm">Standard</span> <p>El preámbulo de cada broadcast comprende <strong>general call, station name y opcionalmente hora UTC</strong>. El ejemplo oficial muestra:</p><pre>ALL STATIONS\nTHIS IS\nNEW YORK RADIO\nTIME, ZERO ZERO FOUR FIVE</pre><p>THIS IS conecta el general call con la identificación en el ejemplo. La hora ilustrada no la vuelve obligatoria: el texto permite omitirla.</p>',
        guide: "Se conserva la secuencia del ejemplo oficial y el carácter opcional de la hora.",
        refs: ["Annex 10, Volume II · 7.2.2", "Páginas físicas 116"],
        order: ["ALL STATIONS", "THIS IS", "NEW YORK RADIO", "TIME, ZERO ZERO FOUR FIVE"],
      },
      {
        label: "Radiotelephone Broadcast Procedures · 3",
        title: "Horario y contenido son controles distintos",
        body: "<p>El preámbulo permite reconocer quién emite; la técnica facilita entender el material; el horario determina cuándo empieza. Si ya se anunció stand by por un período, no se anticipa el comienzo aunque el texto esté preparado.</p><p>Para revisar un broadcast, comprueba identificación, concisión y claridad, ritmo de hasta 100 palabras/minuto y respeto del horario o período anunciado. Estas comprobaciones integran los procedimientos de 7.1 y 7.2.</p>",
        guide: "General call y station name son componentes; la hora UTC se declara opcional.",
        refs: ["Annex 10, Volume II · 7.1.2.3; 7.2", "Páginas físicas 115, 116"],
        questions: [
          {
            q: "¿La hora UTC forma parte obligatoria de todo preámbulo?",
            options: [
              "No; es opcional en 7.2.2",
              "Sí; omitirla invalida siempre el broadcast",
              "Solo puede darse hora local",
            ],
            answer: 0,
            why: "General call y station name son componentes; la hora UTC se declara opcional.",
            wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
          },
        ],
      },
      {
        label: "Aterrizaje",
        title: "Repaso del chapter.",
        body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
        recap: [
          ["Aeronautical Broadcasting Service", "Tema revisado dentro de este chapter."],
          ["Radiotelephone Broadcast Procedures", "Tema revisado dentro de este chapter."],
        ],
        refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
        final: true,
      },
    ],
  },
  "linea-aerea/anexo-10-volumen-ii/chapters/chapter-8-aeronautical-mobile-service-data-link-communications-8":
    {
      id: "annex10-v2-chapter-8",
      folder: "08_Aeronautical_Mobile_Service_Data_Link",
      name: "Aeronautical Mobile Service — Data Link Communications",
      subtitle: "8 temas · 32 misiones",
      year: "ICAO Annex 10 · Volume II",
      word: "Chapter 8",
      sources: [
        "1.8; 8.2 · páginas 23, 24, 119",
        "1.8; 8.2.8.1–8.2.8.5 · páginas 24, 120",
        "8.1 Notes; 8.1.1.1 · páginas 117",
        "8.1.1.2–8.1.1.3 · páginas 117",
        "8.1.1.4.1–8.1.1.4.2 · páginas 118",
        "8.1.1.4.3 · páginas 118",
        "8.1.2.1 · páginas 118",
        "8.1.2.2–8.1.2.3 · páginas 118, 119",
        "8.1.3 · páginas 119",
        "8.1.3; 8.2.10 · páginas 119, 125",
        "8.2.11.1; 8.2.9.1.1 · páginas 120, 125",
        "8.2.11.2–8.2.11.3 · páginas 125",
        "8.2.12.1–8.2.12.3 · páginas 125",
        "8.2.12.4.1–8.2.12.4.4 · páginas 126",
        "8.2.12.4.5–8.2.12.4.6 · páginas 126",
        "8.2.12.4; 8.2.12.6–7 · páginas 126, 127",
        "8.2.12.5–8.2.12.6 · páginas 126",
        "8.2.12.7; 8.2.13 · páginas 127",
        "8.2.1–8.2.6 · páginas 119",
        "8.2.7; 8.2.9.1.1–1.2; 8.2.11.1 · páginas 119, 120, 125",
        "8.2.8.6–8.2.8.7 · páginas 120",
        "8.2.9.1.3 · páginas 120, 121",
        "8.2.9.1–8.2.9.2.1 · páginas 120, 121",
        "8.2.9.3 Note; Tables 8-1–8-3 · páginas 121, 122, 123",
        "8.2.9.3.2.1–3.2.5 · páginas 123",
        "8.2.9.3.2.6–8.2.9.5.2 · páginas 124",
        "8.2.9.3.2; Table 8-2 · páginas 121, 122",
        "8.2.9.3.2; Tables 8-2 and 8-3 · páginas 122, 123",
        "8.2.9.3–8.2.9.3.1; Table 8-1 · páginas 121, 122",
        "8.2.9.6.1–8.2.9.6.2 · páginas 124",
        "8.2.9.6.3–8.2.9.6.4 · páginas 124, 125",
        "Table 8-3 · páginas 123",
      ],
      steps: [
        {
          label: "Despegue",
          title: "Aeronautical Mobile Service — Data Link Communications",
          body: "Chapter 8 de ICAO Annex 10, Volume II. Este recorrido reúne 8 temas fuente en su orden académico.",
          hero: true,
          cards: [
            [
              "Introduction to Data Link and DLIC",
              "Distingue iniciar data link de disponer de CPDLC operacional y sigue las acciones ante un logon fallido.",
            ],
            [
              "Data Link Message Composition and Display",
              "Revisa el conjunto de caracteres y las capacidades de presentación y almacenamiento que exige el volumen.",
            ],
            [
              "Introduction to CPDLC",
              "Conoce las capacidades de piloto y controlador y la disciplina que mantiene claro un intercambio CPDLC.",
            ],
            [
              "Establishment and Transfer of CPDLC",
              "Distingue current y next data authority y revisa cómo se transfieren comunicaciones y mensajes pendientes.",
            ],
            [
              "Exchange of CPDLC Messages",
              "Practica mensajes de varios elementos, respuestas válidas y correcciones coordinadas con voz.",
            ],
            [
              "CPDLC Message Attributes",
              "El alert attribute indica la alerta; el response attribute delimita respuestas. Sus precedencias se calculan por separado.",
            ],
            [
              "CPDLC Free Text and Message Display",
              "Distingue la capacidad de escribir texto libre de los procedimientos que limitan su uso y de la presentación recomendada.",
            ],
            [
              "CPDLC Emergencies and Failures",
              "Separa emergencia, falla total, mensaje fallido y suspensión de requests: cada situación tiene una acción y frase distintas.",
            ],
          ],
        },
        {
          label: "Introduction to Data Link and DLIC · 1",
          title: "El alcance y el logon",
          body: '<p><span class="norm">Note</span> Chapter 8 se basa principalmente en CPDLC; 8.1 también puede aplicarse a otras aplicaciones de data link, como ADS-C y data link flight information services. No se desarrollan aquí esas aplicaciones más allá de esta mención.</p><p><span class="norm">PANS</span> Antes de entrar al espacio donde la unidad ATS usa data link, se inicia comunicación para registrar la aeronave y permitir iniciar una aplicación cuando sea necesario. Puede iniciar la aeronave, automáticamente o por el piloto, o la unidad ATS mediante address forwarding. El logon address se publica en AIP.</p><p><span class="norm">Note</span> Una FIR puede tener varios logon addresses y varias FIR compartir uno.</p>',
          guide:
            "La finalidad de inicio precede a las indicaciones de disponibilidad operacional de CPDLC.",
          refs: ["Annex 10, Volume II · 8.1 Notes; 8.1.1.1", "Páginas físicas 117"],
          questions: [
            {
              q: "¿DLIC y CPDLC operacional son automáticamente la misma etapa?",
              options: [
                "No; DLIC registra y permite iniciar aplicaciones cuando sea necesario",
                "Sí; todo logon demuestra que cualquier diálogo ya está listo",
                "DLIC solo es una llamada de voz",
              ],
              answer: 0,
              why: "La finalidad de inicio precede a las indicaciones de disponibilidad operacional de CPDLC.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to Data Link and DLIC · 2",
          title: "Aircraft initiation y ATS forwarding",
          body: '<span class="norm">PANS</span> <p>Al recibir solicitud válida de una aeronave que se aproxima o está dentro del área de servicio, ATS la acepta y, si puede correlacionarla con un flight plan, establece conexión.</p><p>El ground system inicialmente contactado entrega a la siguiente unidad ATS la información actualizada relevante con tiempo suficiente para establecer data link. El forwarding no consiste en esperar a perder todo contacto y volver a empezar sin datos.</p>',
          guide: "8.1.1.2 combina validez, área y correlación con flight plan.",
          refs: ["Annex 10, Volume II · 8.1.1.2–8.1.1.3", "Páginas físicas 117"],
          questions: [
            {
              q: "¿Qué condición acompaña el establecimiento tras solicitud válida?",
              options: [
                "Poder correlacionarla con un flight plan",
                "Recibir cualquier texto sin identificar aeronave",
                "Que ya haya fallado CPDLC",
              ],
              answer: 0,
              why: "8.1.1.2 combina validez, área y correlación con flight plan.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to Data Link and DLIC · 3",
          title: "Falla: indicación y revisión ATS",
          body: '<span class="norm">PANS</span> <p>El sistema indica la falla a las unidades ATS apropiadas y a la tripulación cuando falla un logon iniciado por ella. ATS establece procedimientos para resolver cuanto antes.</p><p>Primero verifica que la solicitud sea a la unidad correcta. Con flight plan, compara identificación, matrícula o aircraft address y otros datos; verifica y corrige diferencias. Sin flight plan, crea uno con información suficiente en el sistema de procesamiento. Después dispone re-initiation.</p><p><span class="norm">Note</span> Si el logon responde a contact request de una unidad transferidora, ambas unidades ATS reciben la indicación.</p>',
          guide: "Es la rama b) de 8.1.1.4.2 seguida de c).",
          refs: ["Annex 10, Volume II · 8.1.1.4.1–8.1.1.4.2", "Páginas físicas 118"],
          questions: [
            {
              q: "Hay solicitud a la unidad correcta, pero no flight plan disponible. ¿Qué prevé PANS?",
              options: [
                "Crear uno con información suficiente y disponer re-initiation",
                "Aceptar cualquier identidad sin correlación",
                "Esperar sin procedimiento de resolución",
              ],
              answer: 0,
              why: "Es la rama b) de 8.1.1.4.2 seguida de c).",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to Data Link and DLIC · 4",
          title: "Falla: revisión del piloto",
          body: '<span class="norm">PANS</span> <p>El operador establece procedimientos para resolver fallas de initiation. El piloto verifica exactitud y coherencia de información de flight plan disponible en FMS/equipo de inicio, corrige diferencias, verifica la dirección ATS y reinicia data link.</p><p>No se trata de repetir indefinidamente el mismo logon con datos discordantes. Las verificaciones tienen lugar antes de reiniciar.</p>',
          guide: "8.1.1.4.3 dispone revisar datos y dirección antes de re-initiation.",
          refs: ["Annex 10, Volume II · 8.1.1.4.3", "Páginas físicas 118"],
          order: [
            "Verificar coherencia de datos de flight plan y corregir diferencias",
            "Verificar la dirección de la unidad ATS",
            "Reiniciar data link",
          ],
        },
        {
          label: "Data Link Message Composition and Display · 1",
          title: "Componer con economía y precisión",
          body: '<span class="norm">Standard</span> <p>Los mensajes se componen en formato estándar, como CPDLC message set, plain language, o códigos/abreviaturas según 3.7. Se evita plain language si códigos y abreviaturas apropiados reducen extensión. No se usan palabras innecesarias como expresiones de cortesía.</p><p>Esto no autoriza abreviaturas inventadas. La forma escogida debe conservar el significado y cumplir los procedimientos de la aplicación.</p>',
          guide: "La concisión afecta palabras innecesarias, no información necesaria.",
          refs: ["Annex 10, Volume II · 8.1.2.1", "Páginas físicas 118"],
          questions: [
            {
              q: "¿Qué edición mejora un mensaje según 8.1.2.1?",
              options: [
                "Quitar cortesía innecesaria conservando todo contenido requerido",
                "Omitir una condición operacional para abreviar",
                "Añadir abreviaturas no comprensibles sin control",
              ],
              answer: 0,
              why: "La concisión afecta palabras innecesarias, no información necesaria.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Data Link Message Composition and Display · 2",
          title: "Caracteres permitidos",
          body: '<span class="norm">Standard</span> <p>Se permiten letras <strong>A–Z solo en mayúsculas</strong>, cifras 0–9, espacio y los signos siguientes:</p><pre>- ? : ( ) . , ’ = / +</pre><p>No se usan otros caracteres. A diferencia de la disposición AFS de 4.1.2, aquí el apartado no contiene una excepción para usar otro carácter absolutamente necesario. Los números romanos no se usan: se escribe <strong>ROMAN</strong> y la cifra arábiga si ese es el significado pretendido.</p>',
          guide:
            "La primera emplea mayúsculas y cifra arábiga; # no figura entre los signos permitidos.",
          refs: ["Annex 10, Volume II · 8.1.2.2–8.1.2.3", "Páginas físicas 118, 119"],
          questions: [
            {
              q: "¿Qué texto respeta mayúsculas y signos permitidos?",
              options: ["ROMAN 4", "Roman IV", "ROMAN #4"],
              answer: 0,
              why: "La primera emplea mayúsculas y cifra arábiga; # no figura entre los signos permitidos.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Data Link Message Composition and Display · 3",
          title: "Mostrar, imprimir y recuperar",
          body: '<span class="norm">Standard</span> <p>Los sistemas de tierra y a bordo permiten mostrar los mensajes apropiadamente, imprimir cuando se requiera y almacenarlos de modo que la recuperación sea oportuna y conveniente cuando haga falta.</p><p>Cuando se requiere presentación textual, se muestra <strong>inglés como mínimo</strong>. No es una prohibición de otros idiomas de interfaz ni autoriza eliminar el inglés del texto requerido.</p>',
          guide: "8.1.3 vincula impresión a necesidad y almacenamiento a recuperación utilizable.",
          refs: ["Annex 10, Volume II · 8.1.3", "Páginas físicas 119"],
          questions: [
            {
              q: "¿Qué capacidad además de mostrar se exige?",
              options: [
                "Imprimir cuando se requiera y almacenar para recuperación oportuna",
                "Borrar el mensaje después de verlo",
                "Imprimir todos los mensajes sin condición",
              ],
              answer: 0,
              why: "8.1.3 vincula impresión a necesidad y almacenamiento a recuperación utilizable.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to CPDLC · 1",
          title: "CPDLC, message y element",
          body: "<p><strong>Controller-pilot data link communications</strong> usa data link para comunicaciones ATC entre controlador y piloto. Un CPDLC message contiene un elemento o combinación de elementos enviados en una transmisión.</p><p>El message set incluye standard message elements y free text message elements. Un standard element tiene formato, uso y atributos definidos en la referencia PANS-ATM; free text no corresponde a un standard element. El conjunto completo se remite a ese documento y no se reconstruye aquí de memoria.</p>",
          guide: "La definición distingue el mensaje completo de sus elementos.",
          refs: ["Annex 10, Volume II · 1.8; 8.2", "Páginas físicas 23, 24, 119"],
          questions: [
            {
              q: "¿Un mensaje CPDLC puede contener varios elementos?",
              options: [
                "Sí; un elemento o una combinación en una transmisión",
                "No; message y element siempre son sinónimos",
                "Solo si se transforma a voz",
              ],
              answer: 0,
              why: "La definición distingue el mensaje completo de sus elementos.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to CPDLC · 2",
          title: "Capacidades en ambos extremos",
          body: '<p><span class="norm">Standard</span> Se mantiene máxima disciplina. Los sistemas permiten revisar y validar mensajes enviados y recibidos, y acusar los recibidos cuando corresponda.</p><div class="concepts"><article><h3>Controlador</h3><p>Responder, incluidas emergencias; emitir clearances, instrucciones y advisories; pedir y proporcionar información.</p></article><article><h3>Piloto</h3><p>Responder; pedir clearances e información; reportar información; declarar o cancelar emergencia.</p></article></div><p>Ambos pueden intercambiar standard elements, free text o combinaciones. <span class="norm">Recommendation</span> Al componer se consideran efectos de human performance en recepción y comprensión.</p>',
          guide: "8.2.5 enumera esas capacidades del piloto.",
          refs: ["Annex 10, Volume II · 8.2.1–8.2.6", "Páginas físicas 119"],
          questions: [
            {
              q: "¿Qué capacidad pertenece explícitamente al piloto?",
              options: [
                "Declarar o cancelar una emergencia",
                "Emitir cualquier clearance ATC a otras aeronaves",
                "Eliminar la necesidad de validar mensajes enviados",
              ],
              answer: 0,
              why: "8.2.5 enumera esas capacidades del piloto.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Introduction to CPDLC · 3",
          title: "Mismo medio y preferencia por elementos estándar",
          body: '<p><span class="norm">Standard</span> No se requiere voice readback de mensajes CPDLC salvo que lo especifique la autoridad ATS apropiada.</p><p><span class="norm">PANS</span> Si el propósito ya está en el message set, se usa el elemento estándar asociado. Normalmente respuesta CPDLC a CPDLC y voz a voz, con la excepción de emergencia de 8.2.12.1. Se evita free text por riesgo de interpretación y ambigüedad.</p><p>Disponer de free text es una capacidad; no significa que sea la opción preferente para todo mensaje. Las reglas de composición y respuesta se aplican además de las capacidades del equipo.</p>',
          guide: "8.2.9.1.1 prescribe el elemento asociado cuando existe en el message set.",
          refs: [
            "Annex 10, Volume II · 8.2.7; 8.2.9.1.1–1.2; 8.2.11.1",
            "Páginas físicas 119, 120, 125",
          ],
          questions: [
            {
              q: "El propósito tiene un elemento estándar asociado. ¿Qué se usa según PANS?",
              options: [
                "El elemento estándar",
                "Siempre free text para personalizar",
                "Una respuesta por voz en todos los casos",
              ],
              answer: 0,
              why: "8.2.9.1.1 prescribe el elemento asociado cuando existe en el message set.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishment and Transfer of CPDLC · 1",
          title: "Establecido y disponible para operación",
          body: '<p><strong>Current data authority</strong> es el ground system designado para el diálogo con el controlador responsable actual. <strong>Next data authority</strong> es el designado por la current para la siguiente transferencia.</p><p><span class="norm">Standard</span> Piloto y controlador son informados del establecimiento exitoso y disponibilidad operacional, inicialmente y al restaurarse tras falla. El piloto puede identificar en todo momento la unidad ATC que presta servicio. Cuando el sistema a bordo detecta disponibilidad operacional, envía <strong>CURRENT DATA AUTHORITY</strong>.</p><p><span class="norm">PANS</span> CPDLC se establece con tiempo suficiente para comunicar con la unidad ATC apropiada.</p>',
          guide: "La definición vincula la siguiente autoridad con la actual.",
          refs: ["Annex 10, Volume II · 1.8; 8.2.8.1–8.2.8.5", "Páginas físicas 24, 120"],
          questions: [
            {
              q: "¿Quién designa next data authority según la definición?",
              options: [
                "Current data authority",
                "Cualquier estación que envíe un texto",
                "El último destinatario de un AFTN",
              ],
              answer: 0,
              why: "La definición vincula la siguiente autoridad con la actual.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishment and Transfer of CPDLC · 2",
          title: "Iniciativa de aeronave o ATC",
          body: '<p><span class="norm">PANS</span> Ante solicitud inesperada de aeronave, ATC obtiene las circunstancias para decidir. Si ATC la rechaza, proporciona razón mediante mensaje CPDLC apropiado.</p><p><span class="norm">Standard</span> ATC solo establece si no hay enlace CPDLC existente o tiene autorización de la unidad que lo mantiene. Si la aeronave rechaza iniciativa ATC, usa <strong>NOT CURRENT DATA AUTHORITY</strong> o <strong>NOT AUTHORIZED NEXT DATA AUTHORITY</strong> según corresponda. No se permiten otras razones de rechazo a bordo para este caso; procedimientos locales determinan si el controlador ve la razón.</p>',
          guide: "8.2.8.7.1 restringe la iniciativa ATC cuando ya existe enlace.",
          refs: ["Annex 10, Volume II · 8.2.8.6–8.2.8.7", "Páginas físicas 120"],
          questions: [
            {
              q: "Una unidad quiere iniciar enlace cuando otra ya lo tiene. ¿Qué condición permite hacerlo?",
              options: [
                "Autorización de la unidad que mantiene CPDLC",
                "Solo que la nueva unidad prefiera hacerlo",
                "Enviar free text sin coordinación",
              ],
              answer: 0,
              why: "8.2.8.7.1 restringe la iniciativa ATC cuando ya existe enlace.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishment and Transfer of CPDLC · 3",
          title: "Transferir voz y CPDLC conjuntamente",
          body: '<span class="norm">PANS</span> <p>Al transferir CPDLC, la transferencia de voz y CPDLC <strong>comienza concurrentemente</strong>. Si la unidad receptora no dispone de CPDLC, su terminación comienza concurrentemente con la transferencia de voz.</p><p>«Comenzar concurrentemente» no significa que todos los procesos internos se completen en el mismo instante. La regla relaciona el inicio de ambas acciones.</p>',
          guide: "Es el caso específico de 8.2.9.6.2.",
          refs: ["Annex 10, Volume II · 8.2.9.6.1–8.2.9.6.2", "Páginas físicas 124"],
          questions: [
            {
              q: "La unidad receptora no ofrece CPDLC. ¿Qué comienza junto con transferir voz?",
              options: [
                "La terminación de CPDLC",
                "Un nuevo diálogo CPDLC obligatorio con esa unidad",
                "El borrado de las clearances sin revisión",
              ],
              answer: 0,
              why: "Es el caso específico de 8.2.9.6.2.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Establishment and Transfer of CPDLC · 4",
          title: "Mensajes outstanding al transferir",
          body: '<p><span class="norm">Standard</span> Si cambia data authority y hay mensajes sin closure response, se informa al controlador transferidor. Para downlinks no contestados, el sistema puede enviar closure responses automáticas con contenido publicado en instrucciones locales. Para uplinks sin respuesta del piloto, puede terminar automáticamente el diálogo antes de transferir.</p><p><span class="norm">PANS</span> Se debería volver a voz para aclarar ambigüedades de mensajes pendientes. <span class="norm">Standard</span> Si no cambia data authority, los mensajes pendientes se envían al controlador apropiado o se cierran según instrucciones locales y acuerdos cuando sean necesarios.</p>',
          guide:
            "8.2.9.6.3.2.1 prioriza aclarar la ambigüedad; cerrar un diálogo no prueba cumplimiento.",
          refs: ["Annex 10, Volume II · 8.2.9.6.3–8.2.9.6.4", "Páginas físicas 124, 125"],
          questions: [
            {
              q: "Hay ambigüedad sobre un mensaje pendiente en una transferencia. ¿Qué indica PANS?",
              options: [
                "Volver a voz para aclararla",
                "Suponer que la aeronave aceptó",
                "Cambiar automáticamente UNABLE a WILCO",
              ],
              answer: 0,
              why: "8.2.9.6.3.2.1 prioriza aclarar la ambigüedad; cerrar un diálogo no prueba cumplimiento.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Exchange of CPDLC Messages · 1",
          title: "Construir sin acumular ambigüedad",
          body: '<p><span class="norm">Standard</span> Un mensaje puede tener hasta <strong>cinco elementos</strong>; solo dos pueden contener route clearance variable. Se construye con standard, free text o combinación.</p><p><span class="norm">PANS</span> Se usan los elementos estándar cuando el propósito está contemplado y se evitan, cuando sea posible, mensajes largos, múltiples clearances, múltiples solicitudes o mezclas de clearances e información. Las correcciones/clarificaciones usan el medio disponible más apropiado.</p><p>El máximo de cinco no es una recomendación de llenarlo siempre. El criterio pedagógico es transmitir lo necesario con un significado claro.</p>',
          guide: "El límite total y el límite de route clearance variable son distintos.",
          refs: ["Annex 10, Volume II · 8.2.9.1–8.2.9.2.1", "Páginas físicas 120, 121"],
          questions: [
            {
              q: "¿Cuál es el límite del mensaje según 8.2.9.2?",
              options: [
                "Cinco elementos, solo dos con route clearance variable",
                "Cinco route clearances sin otra limitación",
                "Dos elementos en todos los casos",
              ],
              answer: 0,
              why: "El límite total y el límite de route clearance variable son distintos.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Exchange of CPDLC Messages · 2",
          title: "WILCO se aplica a todos los elementos",
          body: '<span class="norm">PANS</span> <p>La respuesta requerida a un multi-element message se aplica a <strong>todos</strong> sus elementos. Ejemplo de la Note: <code>CLIMB TO FL310 MAINTAIN MACH.84</code>; WILCO indica cumplimiento de ambos.</p><p>Si el piloto no puede cumplir un elemento de una clearance, responde <strong>UNABLE al mensaje completo</strong>. Si ATC no puede aprobar ninguna parte de una solicitud, responde UNABLE sin reiterar clearances vigentes. Si solo puede aprobar parte, responde UNABLE al conjunto, con razón o previsión si procede; una Note permite posteriores mensajes separados para lo aceptable.</p><p>Si se puede aprobar todo, ATC responde con clearances para cada elemento; debería hacerlo en un solo uplink.</p>',
          guide: "Una respuesta no acepta silenciosamente solo parte del conjunto.",
          refs: ["Annex 10, Volume II · 8.2.9.3.2.1–3.2.5", "Páginas físicas 123"],
          questions: [
            {
              q: "Puedes cumplir el ascenso, pero no la velocidad del mismo multi-element clearance. ¿Qué respuesta corresponde?",
              options: [
                "UNABLE al mensaje completo",
                "WILCO solo al ascenso sin decirlo",
                "ROGER como aceptación parcial",
              ],
              answer: 0,
              why: "Una respuesta no acepta silenciosamente solo parte del conjunto.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Exchange of CPDLC Messages · 3",
          title: "Seleccionar la respuesta por atributo",
          body: "<p>Para uplink, <strong>W/U</strong> admite WILCO/UNABLE y STANDBY entre sus respuestas; <strong>A/N</strong>, AFFIRM/NEGATIVE y STANDBY; <strong>R</strong>, ROGER/UNABLE y STANDBY. Existen además respuestas de autoridad, logical acknowledgement cuando se requiere y ERROR según las tablas.</p><p><strong>Y</strong> admite mensaje del sentido contrario; <strong>N</strong> no exige respuesta salvo logical acknowledgement requerido, con las respuestas de excepción indicadas. STANDBY aparece como respuesta válida en W/U, A/N y R; no lo sustituyas por aceptación de cumplimiento.</p><p>El siguiente LP muestra tablas completas y precedencia. Aquí decide primero si se solicita cumplimiento, confirmación, recepción u otra información; nunca elijas por semejanza con una palabra aislada.</p>",
          guide: "Table 8-2 distingue A/N de W/U.",
          refs: ["Annex 10, Volume II · 8.2.9.3.2; Tables 8-2 and 8-3", "Páginas físicas 122, 123"],
          questions: [
            {
              q: "Para atributo A/N, ¿cuál de estas es una respuesta de la tabla?",
              options: ["AFFIRM", "WILCO", "Una aceptación parcial no expresada"],
              answer: 0,
              why: "Table 8-2 distingue A/N de W/U.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Exchange of CPDLC Messages · 4",
          title: "Responder en orden y gestionar ERROR",
          body: '<p><span class="norm">PANS</span> Si un mensaje de varios elementos tiene atributo Y, cuando se usa una respuesta única, contiene el mismo número de respuestas y en el mismo orden. Ejemplo oficial:</p><pre>CONFIRM SQUAWK\nWHEN CAN YOU ACCEPT FL410</pre><pre>SQUAWKING 5525\nWE CAN ACCEPT FL410 AT 1636Z</pre><p><span class="norm">Standard</span> ERROR incluye razón. La autoridad ATS selecciona los elementos que soporta y publica el subset en AIP; ante un mensaje fuera de él, ATC responde <strong>MESSAGE NOT SUPPORTED BY THIS ATC UNIT</strong>. <span class="norm">Recommendation</span> Al controlador deberían ofrecérsele solo uplinks apropiados al sector.</p>',
          guide: "La correspondencia evita asociar una respuesta al elemento equivocado.",
          refs: ["Annex 10, Volume II · 8.2.9.3.2.6–8.2.9.5.2", "Páginas físicas 124"],
          questions: [
            {
              q: "La respuesta única a varios elementos Y debe…",
              options: [
                "Mantener el número de respuestas y el orden correspondiente",
                "Contestar solo el último",
                "Cambiar el orden libremente",
              ],
              answer: 0,
              why: "La correspondencia evita asociar una respuesta al elemento equivocado.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "Exchange of CPDLC Messages · 5",
          title: "Corregir por voz sin dejar dos diálogos",
          body: '<span class="norm">PANS</span> <p>Si se corrige por voz un CPDLC sin respuesta operacional recibida, se antepone:</p><pre>DISREGARD CPDLC (message type) MESSAGE, BREAK</pre><p>Después se da la clearance, instrucción, información o solicitud correcta. La identificación debe evitar ambigüedad. Ejemplo del Annex: <strong>SAS445 DISREGARD CPDLC CLIMB CLEARANCE MESSAGE, BREAK, CLIMB TO FL310.</strong></p><p>Si un mensaje que requiere respuesta operacional se negocia luego por voz, se envía closure response CPDLC apropiada para sincronizar: por instrucción explícita de cierre por voz o cierre automático. <span class="norm">Note</span> El mensaje original podría no haber llegado, haber llegado sin acción, o ya haberse ejecutado.</p>',
          guide: "8.2.9.1.3.3 exige el cierre apropiado.",
          refs: ["Annex 10, Volume II · 8.2.9.1.3", "Páginas físicas 120, 121"],
          questions: [
            {
              q: "¿Negociar por voz permite olvidar el diálogo CPDLC pendiente?",
              options: [
                "No; se envía cierre CPDLC apropiado para sincronizar",
                "Sí; siempre desaparece sin acción",
                "Sí; se presume WILCO",
              ],
              answer: 0,
              why: "8.2.9.1.3.3 exige el cierre apropiado.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Message Attributes · 1",
          title: "Alert attribute: llamar la atención",
          body: '<p><span class="norm">Standard</span> Los sistemas pueden usar alert attributes para atraer atención a mensajes de mayor prioridad. El atributo define el tipo de alerta al recibir.</p><div class="table-scroll"><table><thead><tr><th>Tipo</th><th>Descripción</th><th>Precedencia</th></tr></thead><tbody><tr><td>H</td><td>High</td><td>1</td></tr><tr><td>M</td><td>Medium</td><td>2</td></tr><tr><td>L</td><td>Low</td><td>3</td></tr><tr><td>N</td><td>No alerting required</td><td>4</td></tr></tbody></table></div><p><span class="norm">Note</span> En varios elementos, el tipo con mayor precedencia se convierte en el del mensaje completo. La precedencia 1 es la mayor. «N» aquí significa sin alerta; no se confunde con N de response.</p>',
          guide: "H tiene precedencia 1 frente a 2 de M.",
          refs: ["Annex 10, Volume II · 8.2.9.3–8.2.9.3.1; Table 8-1", "Páginas físicas 121, 122"],
          questions: [
            {
              q: "Un mensaje combina alert M y H. ¿Cuál gobierna el mensaje?",
              options: ["H", "M", "N"],
              answer: 0,
              why: "H tiene precedencia 1 frente a 2 de M.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
          figure: {
            src: "/lp/annex10/figures/source-page-122.png",
            alt: "Tables 8-1 and 8-2. Alert Attribute / Response Attribute (Uplink)",
          },
        },
        {
          label: "CPDLC Message Attributes · 2",
          title: "Response attribute de uplink",
          body: '<div class="table-scroll"><table><thead><tr><th>Tipo / precedencia</th><th>Requiere respuesta</th><th>Respuestas válidas</th></tr></thead><tbody><tr><td>W/U · 1</td><td>Sí</td><td>WILCO, UNABLE, STANDBY, NOT CURRENT DATA AUTHORITY, NOT AUTHORIZED NEXT DATA AUTHORITY, LOGICAL ACKNOWLEDGEMENT (only if required), ERROR</td></tr><tr><td>A/N · 2</td><td>Sí</td><td>AFFIRM, NEGATIVE, STANDBY, NOT CURRENT DATA AUTHORITY, NOT AUTHORIZED NEXT DATA AUTHORITY, LOGICAL ACKNOWLEDGEMENT (only if required), ERROR</td></tr><tr><td>R · 3</td><td>Sí</td><td>ROGER, UNABLE, STANDBY, NOT CURRENT DATA AUTHORITY, NOT AUTHORIZED NEXT DATA AUTHORITY, LOGICAL ACKNOWLEDGEMENT (only if required), ERROR</td></tr><tr><td>Y · 4</td><td>Sí</td><td>Any CPDLC downlink message; LOGICAL ACKNOWLEDGEMENT (only if required)</td></tr><tr><td>N · 5</td><td>No, salvo logical acknowledgement requerido</td><td>LOGICAL ACKNOWLEDGEMENT (only if required), NOT CURRENT DATA AUTHORITY, NOT AUTHORIZED NEXT DATA AUTHORITY, ERROR</td></tr></tbody></table></div><p>Tabla recreada fielmente de Table 8-2. Lee tanto la obligación como las excepciones: N no significa que no pueda existir ninguna respuesta del sistema.</p>',
          guide: "Table 8-2 asigna precedencia 1 a W/U y 3 a R.",
          refs: ["Annex 10, Volume II · 8.2.9.3.2; Table 8-2", "Páginas físicas 121, 122"],
          questions: [
            {
              q: "Combinas response attributes R y W/U. ¿Qué atributo tiene mayor precedencia?",
              options: ["W/U", "R", "N"],
              answer: 0,
              why: "Table 8-2 asigna precedencia 1 a W/U y 3 a R.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Message Attributes · 3",
          title: "Response attribute de downlink",
          body: '<div class="table-scroll"><table><thead><tr><th>Tipo</th><th>Respuesta requerida</th><th>Respuestas válidas</th><th>Precedencia</th></tr></thead><tbody><tr><td>Y</td><td>Sí</td><td>Any CPDLC uplink message; LOGICAL ACKNOWLEDGEMENT (only if required)</td><td>1</td></tr><tr><td>N</td><td>No, salvo logical acknowledgement requerido</td><td>LOGICAL ACKNOWLEDGEMENT (only if required), MESSAGE NOT SUPPORTED BY THIS ATC UNIT, ERROR</td><td>2</td></tr></tbody></table></div><p>Table 8-3 no repite la lista de tipos de uplink. El sentido del mensaje importa. No copies automáticamente W/U, A/N y R a una clasificación de downlink.</p>',
          guide: "H/M/L/N son alert attributes; la tabla downlink de response usa Y y N.",
          refs: ["Annex 10, Volume II · Table 8-3", "Páginas físicas 123"],
          questions: [
            {
              q: "¿Qué tipos muestra Table 8-3 para downlink?",
              options: ["Y y N", "W/U, A/N y R exclusivamente", "H, M y L"],
              answer: 0,
              why: "H/M/L/N son alert attributes; la tabla downlink de response usa Y y N.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
          figure: {
            src: "/lp/annex10/figures/source-page-123.png",
            alt: "Table 8-3. Response Attribute (Downlink)",
          },
        },
        {
          label: "CPDLC Message Attributes · 4",
          title: "Combinar sin mezclar las escalas",
          body: "<p>Para cada mensaje de varios elementos, identifica la mayor precedencia de <strong>alert</strong> y la mayor de <strong>response</strong>. Son preguntas separadas: cómo alertar y qué respuestas son válidas.</p><p>Ejercicio didáctico con tipos de las tablas: un uplink combina alert M y H, y response R y W/U. El resultado es <strong>alert H y response W/U</strong>. No se convierte H en una respuesta, ni W/U en nivel de alerta.</p><p>Después se aplica la regla del LP anterior: una respuesta a multi-element message se refiere a todos sus elementos.</p>",
          guide: "Se elige la mayor precedencia en cada escala de forma independiente.",
          refs: [
            "Annex 10, Volume II · 8.2.9.3 Note; Tables 8-1–8-3",
            "Páginas físicas 121, 122, 123",
          ],
          questions: [
            {
              q: "En ese ejercicio, ¿qué combinación resulta?",
              options: ["H + W/U", "M + R", "N + Y por tener dos elementos"],
              answer: 0,
              why: "Se elige la mayor precedencia en cada escala de forma independiente.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Free Text and Message Display · 1",
          title: "Por qué evitar free text",
          body: '<p><span class="norm">PANS</span> Se debería evitar free text. Si la intención está prevista en el message set, se usa el standard element asociado.</p><p><span class="norm">Note</span> Situaciones no rutinarias o emergencias pueden necesitar free text, especialmente si falla voz; evitarlo reduce malinterpretación y ambigüedad. El texto no lo prohíbe absolutamente ni lo convierte en solución preferida para todo.</p>',
          guide: "8.2.9.1.1 prescribe el elemento correspondiente.",
          refs: ["Annex 10, Volume II · 8.2.11.1; 8.2.9.1.1", "Páginas físicas 120, 125"],
          questions: [
            {
              q: "El propósito ya tiene standard element. ¿Qué opción sigue el procedimiento?",
              options: [
                "Usar ese elemento estándar",
                "Redactar siempre una versión personal",
                "No transmitir nada aunque el elemento exista",
              ],
              answer: 0,
              why: "8.2.9.1.1 prescribe el elemento correspondiente.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Free Text and Message Display · 2",
          title: "Cuando una circunstancia no está cubierta",
          body: '<p><span class="norm">Standard</span> La autoridad ATS apropiada puede aceptar free text para circunstancias no contempladas. En consulta con operadores y otras autoridades concernidas, define <strong>display format, intended use y attributes</strong> de cada elemento y los publica junto con procedimientos en AIP.</p><p><span class="norm">PANS</span> Estos elementos deberían almacenarse para selección en sistemas de tierra/aeronave. El propósito es facilitar uso consistente, no exigir que cada usuario improvise su propia redacción.</p>',
          guide: "8.2.11.2 vincula la aceptación a esas definiciones y su publicación.",
          refs: ["Annex 10, Volume II · 8.2.11.2–8.2.11.3", "Páginas físicas 125"],
          questions: [
            {
              q: "¿Qué debe definir y publicar la autoridad en este caso?",
              options: [
                "Formato, uso previsto, atributos y procedimientos relevantes",
                "Solo el color del botón",
                "Una autorización sin significado ni atributos",
              ],
              answer: 0,
              why: "8.2.11.2 vincula la aceptación a esas definiciones y su publicación.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Free Text and Message Display · 3",
          title: "La presentación también comunica",
          body: '<p><span class="norm">Recommendation</span> Las unidades ATC que usan mensajes del PANS-ATM deberían mostrar el texto asociado tal como aparece en ese message set.</p><p><span class="norm">Standard</span> Los requisitos generales de display permiten mostrar, imprimir cuando se requiera y recuperar mensajes almacenados; la presentación textual incluye inglés como mínimo.</p><p>Una interfaz puede ayudar a leer, pero no debe atribuir al Annex un texto estándar que este volumen no reproduce. Los ejemplos del curso proceden de los mensajes que sí aparecen en el PDF.</p>',
          guide: "La marcación de 8.2.10 es Recommendation; no se cambia por el tema tratado.",
          refs: ["Annex 10, Volume II · 8.1.3; 8.2.10", "Páginas físicas 119, 125"],
          questions: [
            {
              q: "¿Qué estatus tiene mostrar el texto asociado tal como en PANS-ATM bajo 8.2.10?",
              options: [
                "Recommendation",
                "Standard solo porque habla de ATC",
                "PANS en ese apartado",
              ],
              answer: 0,
              why: "La marcación de 8.2.10 es Recommendation; no se cambia por el tema tratado.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 1",
          title: "Emergencias y respuestas ausentes",
          body: '<p><span class="norm">PANS</span> Al recibir un CPDLC emergency message, el controlador acusa por el <strong>medio más eficiente disponible</strong>. Esta es la excepción importante a responder normalmente por el mismo medio. Al responder por CPDLC a los demás mensajes de emergencia o urgency, se usa uplink <strong>ROGER</strong>.</p><p><span class="norm">Standard</span> Si se requiere logical acknowledgement y/o operational response y no llega, piloto o controlador reciben alerta.</p><p>No se debe confundir una alerta por respuesta ausente con una confirmación de ejecución. El diálogo necesita la acción correspondiente, no una suposición de cumplimiento.</p>',
          guide: "8.2.12.1 permite priorizar el medio eficaz.",
          refs: ["Annex 10, Volume II · 8.2.12.1–8.2.12.3", "Páginas físicas 125"],
          questions: [
            {
              q: "Un emergency message llega por CPDLC. ¿Cómo lo acusa el controlador según PANS?",
              options: [
                "Por el medio más eficiente disponible",
                "Únicamente por CPDLC sin excepción",
                "No lo acusa hasta restaurar voz",
              ],
              answer: 0,
              why: "8.2.12.1 permite priorizar el medio eficaz.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 2",
          title: "Falla de CPDLC y retorno a voz",
          body: '<p><span class="norm">Recommendation</span> La falla debería detectarse oportunamente. <span class="norm">Standard</span> Una vez detectada, se alerta a controlador y piloto cuanto antes.</p><p><span class="norm">PANS</span> Si necesitan comunicarse antes de restaurar CPDLC, vuelven a voz si es posible y preceden la información con <strong>CPDLC FAILURE</strong>. Para comunicar falla total del sistema terrestre a todas las estaciones: <strong>ALL STATIONS CPDLC FAILURE</strong> + identificación de quien llama.</p><p><span class="norm">Note</span> No se espera respuesta a esa llamada general, salvo que se llame individualmente para acknowledgement.</p>',
          guide: "La falla del servicio y la de un mensaje aislado tienen frases distintas.",
          refs: ["Annex 10, Volume II · 8.2.12.4.1–8.2.12.4.4", "Páginas físicas 126"],
          questions: [
            {
              q: "¿Qué frase precede la información al volver a voz por falla de CPDLC?",
              options: [
                "CPDLC FAILURE",
                "CPDLC MESSAGE FAILURE para todos los casos",
                "DISTRESS TRAFFIC ENDED",
              ],
              answer: 0,
              why: "La falla del servicio y la de un mensaje aislado tienen frases distintas.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 3",
          title: "Los pendientes se consideran no entregados",
          body: '<span class="norm">PANS</span> <p>Si falla CPDLC y se vuelve a voz, <strong>todos los mensajes outstanding se consideran no entregados</strong> y se reinicia por voz todo el diálogo relativo a ellos.</p><p>Si se restaura antes de necesitar voz, también se consideran no entregados, y el diálogo se reinicia por <strong>CPDLC</strong>. La diferencia es el medio de recuperación; no cambia la premisa sobre mensajes pendientes.</p>',
          guide: "8.2.12.4.6 no conserva una entrega supuesta de los pendientes.",
          refs: ["Annex 10, Volume II · 8.2.12.4.5–8.2.12.4.6", "Páginas físicas 126"],
          questions: [
            {
              q: "Se restauró CPDLC antes de necesitar voz. ¿Qué haces con outstanding?",
              options: [
                "Considerarlos no entregados y reiniciar el diálogo por CPDLC",
                "Suponerlos cumplidos",
                "Convertir automáticamente todas las respuestas a WILCO",
              ],
              answer: 0,
              why: "8.2.12.4.6 no conserva una entrega supuesta de los pendientes.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 4",
          title: "Shutdown planificado y mensaje aislado",
          body: '<p><span class="norm">Standard</span> Un shutdown planificado de red o sistema terrestre se anuncia por NOTAM, con período y frecuencias de voz si hace falta. A aeronaves actualmente en contacto se informa por voz o CPDLC la pérdida inminente. Piloto y controlador tienen capacidad para abortar CPDLC.</p><p><span class="norm">PANS</span> Ante falla de un solo mensaje se toma una acción apropiada: por voz, confirmar qué se hará con el diálogo, precediendo <strong>CPDLC MESSAGE FAILURE</strong>; o por CPDLC, reenviar el mensaje fallido.</p>',
          guide: "8.2.12.6 ofrece reemisión CPDLC o confirmación por voz con la frase específica.",
          refs: ["Annex 10, Volume II · 8.2.12.5–8.2.12.6", "Páginas físicas 126"],
          questions: [
            {
              q: "¿Cuál es una acción permitida ante un solo mensaje CPDLC fallido?",
              options: [
                "Reemitir el mensaje mediante CPDLC, según corresponda",
                "Declarar siempre cierre completo de toda la red",
                "Dar por aceptada la parte que no falló sin verificar",
              ],
              answer: 0,
              why: "8.2.12.6 ofrece reemisión CPDLC o confirmación por voz con la frase específica.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 5",
          title: "Detener requests no apaga CPDLC",
          body: '<span class="norm">PANS</span> <p>Para pedir suspensión temporal de solicitudes de piloto se usa:</p><pre>((call sign) or ALL STATIONS) STOP SENDING CPDLC REQUESTS [UNTIL ADVISED] [(reason)]</pre><p>Para reanudar:</p><pre>((call sign) or ALL STATIONS) RESUME NORMAL CPDLC OPERATIONS</pre><p><span class="norm">Note</span> CPDLC sigue disponible para responder, reportar información y declarar/cancelar emergencia si hace falta. <span class="norm">Standard</span> Pruebas de CPDLC que puedan afectar ATS se coordinan antes de realizarlas.</p>',
          guide: "La suspensión se refiere a requests, no a todas las funciones del diálogo.",
          refs: ["Annex 10, Volume II · 8.2.12.7; 8.2.13", "Páginas físicas 127"],
          questions: [
            {
              q: "Tras STOP SENDING CPDLC REQUESTS, ¿puede el piloto declarar emergencia por CPDLC si necesita?",
              options: [
                "Sí; la Note conserva esa disponibilidad",
                "No; el sistema queda totalmente apagado",
                "Solo tras enviar una nueva solicitud ordinaria",
              ],
              answer: 0,
              why: "La suspensión se refiere a requests, no a todas las funciones del diálogo.",
              wrong: "Revisa la explicación y la referencia antes de intentarlo de nuevo.",
            },
          ],
        },
        {
          label: "CPDLC Emergencies and Failures · 6",
          title: "Falla total, mensaje o requests",
          body: "<p>Recupera las diferencias que ya estudiaste. Relaciona cada tarjeta con su significado o aplicación; después podrás comprobar el recorrido completo.</p>",
          guide:
            "Las frases identifican problemas y acciones distintas. Suspender requests conserva respuestas, reportes y funciones de emergencia.",
          refs: ["Annex 10, Volume II · 8.2.12.4; 8.2.12.6–7", "Páginas físicas 126, 127"],
          match: [
            ["CPDLC FAILURE", "Comunicar por voz tras falla de CPDLC"],
            ["CPDLC MESSAGE FAILURE", "Confirmar por voz acciones sobre un mensaje fallido"],
            ["STOP SENDING CPDLC REQUESTS", "Suspender temporalmente solicitudes"],
            ["RESUME NORMAL CPDLC OPERATIONS", "Avisar reanudación del uso normal"],
          ],
        },
        {
          label: "Aterrizaje",
          title: "Repaso del chapter.",
          body: "Comprueba que puedes reconocer los procedimientos y aplicar sus decisiones sin perder la terminología ICAO.",
          recap: [
            ["Introduction to Data Link and DLIC", "Tema revisado dentro de este chapter."],
            ["Data Link Message Composition and Display", "Tema revisado dentro de este chapter."],
            ["Introduction to CPDLC", "Tema revisado dentro de este chapter."],
            ["Establishment and Transfer of CPDLC", "Tema revisado dentro de este chapter."],
            ["Exchange of CPDLC Messages", "Tema revisado dentro de este chapter."],
            ["CPDLC Message Attributes", "Tema revisado dentro de este chapter."],
            ["CPDLC Free Text and Message Display", "Tema revisado dentro de este chapter."],
            ["CPDLC Emergencies and Failures", "Tema revisado dentro de este chapter."],
          ],
          refs: ["ICAO Annex 10 — Volume II · Seventh Edition, July 2016 · Amendment 91"],
          final: true,
        },
      ],
    },
};
