import type { LegislationCourse, LegislationAnnex } from "./legislation-types";

export const LEGISLATION_LEARNING_PATHS: Record<string, LegislationCourse> = {
  "linea-aerea/legislacion/convenios-internacionales/introduccion-a-los-tratados-internacionales-1":
    {
      id: "01",
      folder: "01_Introduccion_a_los_Tratados_Internacionales",
      name: "Introducción a los tratados",
      subtitle: "Un mapa antes de memorizar.",
      year: "MAPA",
      word: "Identificar",
      sources: ["chicago", "warsaw", "tokyo", "hague", "m99", "m71"],
      steps: [
        {
          label: "Despegue",
          title: "Un cielo.<br><em>Distintas preguntas.</em>",
          body: "Un vuelo cruza fronteras, transporta personas y necesita reglas comunes. Pero una pregunta sobre el espacio aéreo no es la misma que una pregunta sobre una maleta dañada. En esta materia aprenderás a <strong>encontrar el instrumento que corresponde a cada problema</strong>.",
          refs: [
            "chicago:Preámbulo y arts. 1, 43–44",
            "warsaw:Preámbulo",
            "tokyo:Art. 1",
            "m71:Art. 1",
          ],
          hero: true,
          cards: [
            ["Organizar", "Principios de navegación y cooperación entre Estados: Chicago 1944."],
            [
              "Transportar",
              "Documentos y responsabilidad del transportista: Varsovia 1929 y Montreal 1999.",
            ],
            [
              "Responder a actos ilícitos",
              "Conductas a bordo, apoderamiento y actos ilícitos: Tokio 1963, La Haya 1970 y Montreal 1971.",
            ],
          ],
          guide: "Abre las tres tarjetas. Primero entiende la pregunta; después busca el nombre.",
        },
        {
          label: "Qué es un convenio",
          title: "Un acuerdo con<br><em>un alcance.</em>",
          body: "Aquí estudiarás acuerdos entre Estados que establecen reglas comunes para una materia concreta. Sus preámbulos explican el propósito y sus artículos delimitan la aplicación. <strong>Firmar, ratificar y entrar en vigor son pasos diferentes</strong>: el año que usamos para identificar un convenio es el de su adopción o firma, no necesariamente el de entrada en vigor.",
          refs: ["chicago:Preámbulo y art. 91", "tokyo:Arts. 19–21", "m99:Art. 53"],
          cards: [
            ["Propósito", "¿Qué problema quieren atender los Estados?"],
            ["Ámbito", "¿A qué transporte, aeronaves o actos se aplica?"],
            ["Reglas", "¿Qué derechos, obligaciones o responsabilidades establece?"],
          ],
          questions: [
            {
              q: "Ves “Tokio 1963”. ¿Qué debes comprobar antes de aplicarlo a un caso?",
              options: [
                "Solo que el vuelo salga de Japón",
                "El ámbito del convenio y las condiciones del caso",
                "Solo el año del vuelo",
              ],
              answer: 1,
              why: "El nombre de la ciudad identifica el instrumento. Su ámbito se determina en los artículos, no por que el vuelo visite esa ciudad.",
            },
          ],
        },
        {
          label: "Línea de tiempo",
          title: "El año también<br><em>identifica.</em>",
          body: "Usa la línea de tiempo como orientación. Las rutas siguientes explican cada instrumento; aquí basta reconocer su pregunta central.",
          refs: [
            "warsaw:Preámbulo y firma",
            "chicago:Preámbulo",
            "tokyo:Fórmula de firma, p. 13 PDF",
            "hague:Art. 13 y firma",
            "m99:Preámbulo y firma",
            "m71:Firma, p. 8 PDF",
          ],
          timeline: true,
          questions: [
            {
              q: "¿Cuál de estos tres es anterior?",
              options: ["Chicago 1944", "Tokio 1963", "Varsovia 1929"],
              answer: 2,
              why: "Varsovia 1929 precede a Chicago 1944 y a Tokio 1963. La cronología ayuda a distinguirlos, pero no explica por sí sola su alcance.",
            },
            {
              q: "¿Basta decir “Montreal” para identificar el instrumento?",
              options: ["Sí", "No: hay que indicar 1971 o 1999"],
              answer: 1,
              why: "Montreal 1971 y Montreal 1999 tienen objetos diferentes. El año elimina esa ambigüedad.",
            },
          ],
        },
        {
          label: "Relaciona",
          title: "Tres puertas<br><em>de entrada.</em>",
          body: "Estas familias son un mapa pedagógico, no una clasificación jurídica excluyente. Un mismo hecho puede plantear varias preguntas y requerir consultar más de un instrumento.",
          refs: ["chicago:Arts. 1 y 43", "warsaw:Arts. 17–19", "tokyo:Art. 1", "hague:Art. 1"],
          match: [
            ["Chicago 1944", "Organización y navegación internacional"],
            ["Varsovia 1929", "Transporte y responsabilidad del porteador"],
            ["Tokio 1963", "Infracciones y ciertos otros actos a bordo"],
            ["La Haya 1970", "Apoderamiento ilícito de aeronaves"],
          ],
          guide:
            "Relaciona cada convenio con su foco principal. Los temas pueden conectarse sin ser idénticos.",
        },
        {
          label: "Recuerda",
          title: "Nombre + año<br><em>+ problema.</em>",
          body: "No memorices una lista de ciudades sueltas. Construye una ficha mental con tres coordenadas: <strong>nombre, año y problema</strong>. Añade una imagen solo después de comprender esas coordenadas.",
          refs: ["chicago:Arts. 1 y 43", "tokyo:Art. 1"],
          memory: {
            visual: "CHICAGO · 1944 → OACI",
            text: "Imagina cada convenio como una carpeta con ciudad, año y una etiqueta de tema. La carpeta es una analogía; no una disposición del convenio.",
          },
          recall: [
            [
              "¿Qué tres datos usarías para identificar un convenio?",
              "Nombre, año y problema o materia que aborda.",
            ],
            [
              "¿Por qué no basta saber la ciudad?",
              "Porque instrumentos distintos pueden compartir ciudad; hay que conservar el año y revisar el título y alcance.",
            ],
          ],
        },
        {
          label: "Ponlo a prueba",
          title: "Elige por<br><em>la pregunta.</em>",
          body: "En estos casos identifica el primer instrumento del curso que consultarías para la cuestión indicada. No se pide resolver un litigio.",
          refs: ["chicago:Arts. 1 y 43", "tokyo:Art. 6", "m99:Art. 17"],
          questions: [
            {
              q: "Quieres conocer el origen jurídico de la OACI.",
              options: ["Varsovia 1929", "Chicago 1944", "Tokio 1963"],
              answer: 1,
              why: "Chicago 1944 crea la organización en su art. 43.",
            },
            {
              q: "Quieres estudiar las facultades del comandante ante actos que comprometen el orden a bordo.",
              options: ["Tokio 1963", "Chicago 1944", "Varsovia 1929"],
              answer: 0,
              why: "Tokio 1963 desarrolla esas facultades, especialmente en los arts. 5–10.",
            },
            {
              q: "La pregunta es la responsabilidad por una maleta facturada dañada en transporte cubierto por el texto de 1999.",
              options: ["La Haya 1970", "Tokio 1963", "Montreal 1999"],
              answer: 2,
              why: "Montreal 1999 regula responsabilidad en el transporte internacional. Su art. 17 trata el equipaje.",
            },
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-chicago-2": {
    id: "02",
    folder: "02_Convenio_de_Chicago_1944",
    name: "Chicago 1944",
    subtitle: "La arquitectura de la aviación civil internacional.",
    year: "1944",
    word: "OACI",
    sources: ["chicago"],
    steps: [
      {
        label: "Despegue",
        title: "Chicago 1944.<br><em>Construir un marco común.</em>",
        body: "<strong>Convenio sobre Aviación Civil Internacional</strong>, firmado el 7 de diciembre de 1944. Su preámbulo relaciona el desarrollo de la aviación con la cooperación y la paz. Busca que la aviación civil internacional se desarrolle de forma segura y ordenada y que el transporte se establezca sobre una base de igualdad de oportunidades.",
        refs: ["chicago:Preámbulo; prólogo del Doc 7300/9"],
        hero: true,
        cards: [
          ["El problema", "Coordinar una actividad que cruza fronteras y requiere cooperación."],
          ["El marco", "Principios de navegación, normas comunes y organización internacional."],
          ["La conexión", "El propio Convenio crea la International Civil Aviation Organization."],
        ],
      },
      {
        label: "Soberanía y aplicación",
        title: "Cooperar sin borrar<br><em>las fronteras.</em>",
        body: "El art. 1 reconoce la <strong>soberanía plena y exclusiva de cada Estado sobre el espacio aéreo situado sobre su territorio</strong>. El art. 3 distingue aeronaves civiles y de Estado: el Convenio se aplica a las civiles. Considera de Estado las utilizadas en servicios militares, de aduanas o de policía.",
        refs: ["chicago:Arts. 1–3"],
        questions: [
          {
            q: "¿Chicago 1944 convierte el espacio aéreo de los Estados en un espacio sin soberanía?",
            options: [
              "Sí, para todos los vuelos internacionales",
              "No; reconoce soberanía plena y exclusiva",
              "Solo para vuelos con pasajeros",
            ],
            answer: 1,
            why: "La cooperación internacional convive con la soberanía estatal del art. 1.",
          },
          {
            q: "Una aeronave se utiliza en servicio de policía. Según el art. 3, ¿cómo se clasifica?",
            options: [
              "Como aeronave de Estado",
              "Como aeronave civil por llevar matrícula",
              "Como aeronave de OACI",
            ],
            answer: 0,
            why: "El criterio citado es el servicio: militar, aduanero o policial.",
          },
        ],
      },
      {
        label: "Volar entre Estados",
        title: "El permiso depende<br><em>del servicio.</em>",
        body: "El art. 5 contempla derechos de entrada, sobrevuelo sin escala y escalas no comerciales para aeronaves que no realizan servicios internacionales regulares, sujetos a condiciones. El art. 6 exige permiso especial u otra autorización para los servicios aéreos internacionales regulares. <strong>No significa que cualquier vuelo pueda operar libremente.</strong>",
        refs: ["chicago:Arts. 5–7"],
        cards: [
          [
            "No regular · art. 5",
            "Hay derechos previstos, pero también condiciones, posibilidad de exigir aterrizaje y reglas para embarcar o desembarcar tráfico remunerado.",
          ],
          [
            "Regular · art. 6",
            "Necesita autorización del Estado para operar en su territorio o sobre él.",
          ],
          [
            "Cabotaje · art. 7",
            "Cada Estado puede negar el transporte remunerado entre puntos de su territorio por aeronaves de otros Estados contratantes.",
          ],
        ],
        questions: [
          {
            q: "Una aerolínea quiere iniciar un servicio internacional regular. ¿Basta invocar Chicago 1944 para operar sin permiso?",
            options: ["Sí", "No; debe atender la autorización del art. 6"],
            answer: 1,
            why: "El art. 6 exige permiso especial u otra autorización y cumplir sus condiciones.",
          },
        ],
      },
      {
        label: "La estructura",
        title: "Cuatro bloques.<br><em>Una arquitectura.</em>",
        body: "No necesitas recorrer el Convenio artículo por artículo. Lee su estructura para saber dónde buscar. Los Anexos técnicos se conectan con este marco, pero se estudian por separado.",
        refs: ["chicago:Índice, partes I–IV"],
        cards: [
          [
            "I · Navegación aérea",
            "Principios, vuelo sobre territorios, nacionalidad, facilitación, condiciones de las aeronaves y normas internacionales.",
          ],
          [
            "II · La OACI",
            "Organización, Asamblea, Consejo, Comisión de Aeronavegación y funcionamiento institucional.",
          ],
          [
            "III · Transporte aéreo internacional",
            "Datos e informes, instalaciones y servicios, y organizaciones de explotación conjunta.",
          ],
          [
            "IV · Disposiciones finales",
            "Otros acuerdos, controversias, enmiendas y disposiciones finales del Convenio.",
          ],
        ],
      },
      {
        label: "ICAO / OACI",
        title: "Dos siglas.<br><em>Una organización.</em>",
        body: "<strong>ICAO = International Civil Aviation Organization.</strong><br><strong>OACI = Organización de Aviación Civil Internacional.</strong><br>El art. 43 crea la organización, compuesta por una Asamblea, un Consejo y otros órganos necesarios. El art. 44 fija sus fines, entre ellos el desarrollo seguro y ordenado de la aviación civil internacional.",
        refs: ["chicago:Arts. 43–44 y 54(l)"],
        cards: [
          ["Asamblea y Consejo", "Son órganos de la organización prevista por el Convenio."],
          [
            "Un lenguaje técnico común",
            "El Consejo adopta normas y métodos recomendados internacionales y los designa como Anexos al Convenio: art. 54(l).",
          ],
        ],
        questions: [
          {
            q: "¿ICAO y OACI son dos organismos distintos?",
            options: [
              "Sí: uno internacional y otro regional",
              "No: son las siglas inglesa y española de la misma organización",
            ],
            answer: 1,
            why: "Los nombres corresponden a la misma organización creada por Chicago 1944.",
          },
        ],
      },
      {
        label: "Aeronave y tripulación",
        title: "Los documentos<br><em>también cuentan.</em>",
        body: "El art. 29 enumera documentos a bordo. Los arts. 31 y 32 relacionan el certificado de aeronavegabilidad y las licencias de la tripulación operativa con el Estado de matrícula: deben ser expedidos o convalidados por él.",
        refs: ["chicago:Arts. 29, 31–32"],
        cards: [
          [
            "Aeronave",
            "Certificado de matrícula, certificado de aeronavegabilidad y diario de a bordo.",
          ],
          [
            "Personas",
            "Licencias apropiadas para la tripulación; si hay pasajeros, lista de nombres y lugares de embarco y destino.",
          ],
          [
            "Según el equipo y la carga",
            "Licencia de estación de radio si hay radio; manifiesto y declaraciones detalladas si transporta carga.",
          ],
        ],
        questions: [
          {
            q: "Según el art. 32, ¿qué Estado expide o convalida las licencias de la tripulación operativa para navegación internacional?",
            options: [
              "El de matrícula de la aeronave",
              "Siempre el de nacionalidad del piloto",
              "La OACI directamente",
            ],
            answer: 0,
            why: "La referencia del artículo es el Estado de matrícula, con la reserva prevista en su apartado b).",
          },
        ],
      },
      {
        label: "Normas y diferencias",
        title: "Uniformidad<br><em>con un mecanismo.</em>",
        body: "El art. 37 compromete a los Estados a colaborar para lograr el mayor grado posible de uniformidad. El art. 38 exige notificar diferencias cuando un Estado no puede ajustarse a una norma internacional o adopta reglas que difieren de ella.",
        refs: ["chicago:Arts. 37–38 y 54(l)"],
        questions: [
          {
            q: "Un Estado adopta una práctica distinta de una norma internacional. ¿Qué mecanismo contempla el art. 38?",
            options: [
              "Ocultarla para evitar diferencias",
              "Notificar la diferencia a OACI",
              "Cambiar el nombre del Anexo",
            ],
            answer: 1,
            why: "El Convenio contempla la notificación de diferencias. Uniformidad no equivale a suponer que todas las prácticas nacionales son idénticas.",
          },
        ],
      },
      {
        label: "Cómo me lo aprendo",
        title: "De Chicago<br><em>a ICAO.</em>",
        body: "Primero conserva el hecho: <strong>Chicago 1944 crea la OACI</strong>. Después usa las letras como ancla de memoria.",
        refs: ["chicago:Art. 43"],
        memory: {
          visual: "CH<span>I</span><span>C</span><span>A</span>G<span>O</span> → ICAO",
          text: "Resalta I–C–A–O dentro de CHICAGO. Es un juego visual para recuperar la relación; no una explicación del origen del nombre.",
        },
        recall: [
          ["Sin mirar: ¿año y organización?", "Chicago 1944; ICAO/OACI."],
          [
            "¿Qué idea frena “puedo volar en cualquier territorio”?",
            "La soberanía del art. 1 y las condiciones y autorizaciones correspondientes al tipo de servicio.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Tu marco<br><em>ya tiene estructura.</em>",
        body: "Recupera las conexiones principales antes de pasar a los Anexos.",
        refs: ["chicago:Arts. 1, 3, 6, 32, 37–38, 43"],
        questions: [
          {
            q: "¿Cuál es el foco de Chicago 1944 en este curso?",
            options: [
              "Marco de navegación y organización internacional",
              "Solo daños al equipaje",
              "Solo delitos a bordo",
            ],
            answer: 0,
            why: "Chicago 1944 aporta el marco y crea la OACI.",
          },
          {
            q: "¿Qué pareja es correcta?",
            options: [
              "Chicago 1944 → ICAO/OACI",
              "Chicago 1944 → tribunal de indemnizaciones",
              "Chicago 1944 → ausencia de soberanía",
            ],
            answer: 0,
            why: "El art. 43 sustenta la relación con ICAO/OACI.",
          },
          {
            q: "¿Qué afirmación respeta el Convenio?",
            options: [
              "La OACI expide todas las licencias personales",
              "Los servicios regulares internacionales requieren autorización",
              "Los Anexos eliminan todas las diferencias nacionales",
            ],
            answer: 1,
            why: "Art. 6. Las licencias se vinculan al Estado de matrícula y el art. 38 contempla diferencias.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/anexos-oaci-3": {
    id: "03",
    folder: "03_Los_19_Anexos_ICAO",
    name: "Los 19 Anexos ICAO",
    subtitle: "Número, nombre y tema. Después, memoria.",
    year: "19",
    word: "Reconocer",
    sources: ["annex", "chicago", "faa"],
    steps: [
      {
        label: "Despegue",
        title: "19 Anexos.<br><em>Un mapa que se recuerda.</em>",
        body: "Los Anexos agrupan temas técnicos ligados a Chicago 1944. Aquí aprenderás a reconocer <strong>número, título oficial en inglés y tema general</strong>. Las explicaciones en español son ayudas didácticas; no desarrollaremos el detalle normativo.",
        refs: ["annex:Tabla de los 19 Anexos", "chicago:Art. 54(l)"],
        hero: true,
        cards: [
          ["Entiende", "Primero conoce qué tema cubre cada Anexo."],
          ["Recuerda", "Después revela una asociación visual, señalada como nemotecnia."],
          [
            "Recupera",
            "Contesta una pregunta por Anexo y termina con tres niveles sin saltarte el proceso.",
          ],
        ],
      },
      {
        label: "1–3 · Fundamentos iniciales",
        title: "Anexos 1–3.<br><em>Fundamentos iniciales.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: ["annex:Tabla de los 19 Anexos"],
        annex: [1, 2, 3],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "4–6 · Cartas, unidades y operación",
        title: "Anexos 4–6.<br><em>Cartas, unidades y operación.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: ["annex:Tabla de los 19 Anexos"],
        annex: [4, 5, 6],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "7–9 · Identidad y facilitación",
        title: "Anexos 7–9.<br><em>Identidad y facilitación.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: ["annex:Tabla de los 19 Anexos"],
        annex: [7, 8, 9],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "10–12 · Comunicar, ordenar y buscar",
        title: "Anexos 10–12.<br><em>Comunicar, ordenar y buscar.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: ["annex:Tabla de los 19 Anexos"],
        annex: [10, 11, 12],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "13–15 · Investigar e informar",
        title: "Anexos 13–15.<br><em>Investigar e informar.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: ["annex:Tabla de los 19 Anexos"],
        annex: [13, 14, 15],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "16–19 · Proteger y gestionar",
        title: "Anexos 16–19.<br><em>Proteger y gestionar.</em>",
        body: "Estudia una tarjeta a la vez: lee el tema, descubre la asociación y recupera la conexión. Cada respuesta tiene una explicación.",
        refs: [
          "annex:Tabla de los 19 Anexos",
          "faa:5-2-3 Emergency code assignment; 5-2-4 Radio failure; 5-2-5 Hijack/unlawful interference",
        ],
        annex: [16, 17, 18, 19],
        guide: "La imagen es una pista. La respuesta debe conservar el número y el tema correcto.",
      },
      {
        label: "17 ≠ 19",
        title: "Security y Safety.<br><em>Dos enfoques.</em>",
        body: "<strong>Anexo 17: Security.</strong> Protección frente a actos de interferencia ilícita.<br><strong>Anexo 19: Safety Management.</strong> Gestión de la seguridad operacional. La palabra “seguridad” aparece en español en ambos contextos: conserva el propósito y el título en inglés para distinguirlos.",
        refs: ["annex:Anexos 17 y 19"],
        match: [
          ["Security · Anexo 17", "Protección ante interferencia ilícita"],
          ["Safety Management · Anexo 19", "Gestión de la seguridad operacional"],
        ],
        questions: [
          {
            q: "¿Toda emergencia demuestra que el tema es el Anexo 17?",
            options: [
              "Sí: emergencia y Security son sinónimos",
              "No: hay que identificar la materia concreta",
            ],
            answer: 1,
            why: "La nemotecnia del 7 no convierte todas las situaciones anormales en actos de interferencia ilícita.",
          },
        ],
      },
      {
        label: "Nivel 1 · Con imágenes",
        title: "Primero,<br><em>con tus pistas.</em>",
        body: "Recupera los 19 Anexos con la asociación visual y su número. Responde todas las tarjetas; si fallas, lee la explicación y vuelve a intentarlo.",
        refs: ["annex:Tabla de los 19 Anexos"],
        challenge: 1,
      },
      {
        label: "Nivel 2 · Pista breve",
        title: "Ahora,<br><em>menos ayuda.</em>",
        body: "El número y una palabra clave son tu única pista. Busca el título oficial entre las opciones.",
        refs: ["annex:Tabla de los 19 Anexos"],
        challenge: 2,
      },
      {
        label: "Nivel 3 · Sin pistas",
        title: "Número ↔ nombre.<br><em>De memoria.</em>",
        body: "Alterna ambos sentidos: a veces verás el número, otras el nombre. Las 19 conexiones deben quedar recuperadas sin nemotecnia visible.",
        refs: ["annex:Tabla de los 19 Anexos"],
        challenge: 3,
      },
      {
        label: "Qué Anexo consultarías",
        title: "De la lista<br><em>a la situación.</em>",
        body: "Piensa en la pregunta que necesitas resolver. Solo debes localizar el tema general del Anexo, sin anticipar sus requisitos detallados.",
        refs: ["annex:Tabla de los 19 Anexos"],
        questions: [
          {
            q: "Buscas el tema de recopilación y difusión de información aeronáutica.",
            options: ["Anexo 10", "Anexo 15", "Anexo 11"],
            answer: 1,
            why: "El 15 es Aeronautical Information Services. Telecomunicaciones y servicios de tránsito tienen otros focos.",
          },
          {
            q: "Necesitas localizar la organización de búsqueda y salvamento.",
            options: ["Anexo 13", "Anexo 12", "Anexo 14"],
            answer: 1,
            why: "El 12 es Search and Rescue; el 13 se ocupa de investigación.",
          },
          {
            q: "Quieres ubicar las marcas de nacionalidad y matrícula.",
            options: ["Anexo 7", "Anexo 8", "Anexo 1"],
            answer: 0,
            why: "El 7 identifica aeronaves. El 8 trata aeronavegabilidad y el 1 licencias del personal.",
          },
          {
            q: "¿Cuál se relaciona con responsabilidades de gestión de la seguridad operacional?",
            options: ["Anexo 17", "Anexo 18", "Anexo 19"],
            answer: 2,
            why: "El 19 es Safety Management.",
          },
          {
            q: "¿Dónde ubicas simplificación de formalidades de aduanas e inmigración?",
            options: ["Anexo 9", "Anexo 2", "Anexo 16"],
            answer: 0,
            why: "El 9 es Facilitation.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-varsovia-4": {
    id: "04",
    folder: "04_Convenio_de_Varsovia_1929",
    name: "Varsovia 1929",
    subtitle: "Documentos de transporte y responsabilidad.",
    year: "1929",
    word: "Transporte",
    sources: ["warsaw", "chicago", "m99"],
    steps: [
      {
        label: "Despegue",
        title: "Varsovia 1929.<br><em>El viaje y su responsabilidad.</em>",
        body: "<strong>Convenio para la unificación de ciertas reglas relativas al transporte aéreo internacional</strong>, firmado el 12 de octubre de 1929. El preámbulo busca uniformar las condiciones del transporte respecto de los documentos utilizados y de la responsabilidad del porteador. “Porteador” es el transportista en el lenguaje del texto.",
        refs: ["warsaw:Preámbulo y fórmula de firma"],
        hero: true,
        cards: [
          ["Transportar", "Personas, equipajes y mercancías en el ámbito del Convenio."],
          ["Documentar", "Billete de pasaje, talón de equipajes y carta de porte aéreo."],
          ["Responder", "Responsabilidad por daños y condiciones para reclamar."],
        ],
      },
      {
        label: "Ámbito de aplicación",
        title: "Internacional tiene<br><em>una definición.</em>",
        body: "El art. 1 cubre transporte internacional remunerado de personas, equipajes o mercancías en aeronave, y también transporte gratuito realizado por una empresa de transporte aéreo. Importan los puntos acordados de partida y destino y las escalas previstas.",
        refs: ["warsaw:Art. 1; facsímil p. 1362"],
        cards: [
          [
            "Dos Estados contratantes",
            "Partida y destino en territorios de dos Altas Partes Contratantes.",
          ],
          [
            "Un Estado, con escala exterior",
            "Partida y destino en una sola Alta Parte Contratante, con una escala prevista en otro territorio en los términos del art. 1.2.",
          ],
          [
            "Un Estado, sin esa escala",
            "El transporte entre puntos del mismo Estado sin la escala exterior descrita no se considera internacional a efectos del Convenio.",
          ],
        ],
        questions: [
          {
            q: "En el supuesto del art. 1.2, A y B están en un mismo Estado contratante y no hay escala en otro territorio. ¿Es internacional para Varsovia 1929?",
            options: ["Sí, porque lo realiza una aerolínea", "No, según ese supuesto"],
            answer: 1,
            why: "El facsímil oficial dice “no se considerará como internacional”. El nombre o tamaño de la aerolínea no sustituye el criterio del artículo.",
          },
        ],
      },
      {
        label: "Los documentos",
        title: "Tres transportes.<br><em>Tres documentos.</em>",
        body: "El Convenio dedica un bloque a los títulos de transporte. No memorices todos los campos: reconoce para qué sirve cada documento.",
        refs: ["warsaw:Arts. 3–9"],
        match: [
          ["Viajeros", "Billete de pasaje"],
          ["Equipaje facturado", "Talón de equipajes"],
          ["Mercancías", "Carta de porte aéreo"],
        ],
        guide:
          "En el texto original, ciertas omisiones documentales afectan al uso de límites o exclusiones de responsabilidad.",
      },
      {
        label: "Responsabilidad",
        title: "¿Qué daño<br><em>estás analizando?</em>",
        body: "El art. 17 trata muerte o lesiones del viajero por un accidente a bordo o durante operaciones de embarque o desembarque. El art. 18 se ocupa de destrucción, pérdida o avería de equipaje facturado o mercancías durante el transporte aéreo. El art. 19 trata el daño por retraso.",
        refs: ["warsaw:Arts. 17–19"],
        cards: [
          [
            "Personas",
            "El supuesto del art. 17 requiere el accidente y su conexión con los momentos previstos.",
          ],
          [
            "Equipaje y carga",
            "El art. 18 incluye el período de custodia del porteador y delimita el transporte aéreo.",
          ],
          [
            "Retraso",
            "La pregunta es el daño ocasionado por el retraso; no solo que el reloj marque otra hora.",
          ],
        ],
        questions: [
          {
            q: "Se analiza una mercancía dañada mientras está bajo custodia del porteador durante el transporte aéreo. ¿Qué tema corresponde?",
            options: [
              "La creación de OACI",
              "La responsabilidad del porteador por mercancías",
              "La facultad del comandante de desembarcar a alguien",
            ],
            answer: 1,
            why: "Es una cuestión del bloque de responsabilidad de Varsovia 1929, especialmente art. 18.",
          },
        ],
      },
      {
        label: "Condiciones y límites",
        title: "Responsabilidad<br><em>no es pago automático.</em>",
        body: "El texto original incluye causas de exoneración, límites y casos en los que el porteador no puede invocarlos. Por ejemplo, el art. 20.1 contempla probar que se tomaron todas las medidas necesarias para evitar el daño o que fue imposible hacerlo. Los arts. 22 y 25 regulan límites y su pérdida en los supuestos indicados.",
        refs: ["warsaw:Arts. 20–25"],
        questions: [
          {
            q: "¿Basta decir “hubo daño” para dar por resuelta cualquier reclamación?",
            options: [
              "Sí, no hay más condiciones",
              "No: hay que revisar el supuesto y las reglas de responsabilidad",
            ],
            answer: 1,
            why: "El convenio contiene condiciones, límites y exoneraciones. Esta ruta enseña a identificar el régimen, no a calcular una indemnización actual.",
          },
        ],
      },
      {
        label: "Distingue",
        title: "Transporte.<br><em>No organización mundial.</em>",
        body: "Varsovia 1929 se centra en el transporte y la responsabilidad del porteador. Chicago 1944 aborda el marco de navegación y crea la OACI. Más adelante verás cómo Montreal 1999 se relaciona con el sistema de Varsovia: <strong>son textos distintos</strong>.",
        refs: ["warsaw:Preámbulo", "chicago:Art. 43", "m99:Preámbulo y art. 55"],
        questions: [
          {
            q: "¿Qué pregunta encaja mejor con Varsovia 1929?",
            options: [
              "¿Qué documento acompaña a las mercancías?",
              "¿Qué órgano de OACI adopta Anexos?",
              "¿Qué medidas puede imponer el comandante?",
            ],
            answer: 0,
            why: "La carta de porte aéreo pertenece al bloque documental de Varsovia 1929.",
          },
        ],
      },
      {
        label: "Cómo me lo aprendo",
        title: "V de vuelo.<br><em>R de responsabilidad.</em>",
        body: "Ya conoces su contenido: transporte, documentos y responsabilidad. Ahora usa dos letras como ancla.",
        refs: ["warsaw:Preámbulo; capítulos II–III"],
        memory: {
          visual: "<span>V</span>A<span>R</span>SOVIA · 1929",
          text: "V → vuelo; R → responsabilidad. Imagina un billete y una maleta dentro de la palabra. La imagen recuerda el tema; no implica que Varsovia regule toda actividad aérea.",
        },
        recall: [
          [
            "Sin mirar: ¿año y dos materias?",
            "1929; documentos de transporte y responsabilidad del porteador.",
          ],
          [
            "¿Cuáles son los tres títulos de transporte?",
            "Billete de pasaje, talón de equipajes y carta de porte aéreo.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Recupera<br><em>la conexión.</em>",
        body: "Responde por el contenido que estudiaste, no por cómo suena el nombre.",
        refs: ["warsaw:Arts. 1, 3–5 y 17–20"],
        questions: [
          {
            q: "¿Año de Varsovia?",
            options: ["1929", "1944", "1963"],
            answer: 0,
            why: "Varsovia fue firmado el 12 de octubre de 1929.",
          },
          {
            q: "¿Qué documento relacionas con mercancías?",
            options: ["Licencia del piloto", "Carta de porte aéreo", "Certificado de matrícula"],
            answer: 1,
            why: "Varsovia 1929 dedica los arts. 5–9 a ese documento y sus efectos.",
          },
          {
            q: "¿Puede cubrir un transporte gratuito?",
            options: [
              "Nunca",
              "Sí, si lo realiza una empresa de transporte aéreo y se cumple el ámbito internacional",
            ],
            answer: 1,
            why: "El art. 1 incluye expresamente ese supuesto.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-tokio-1963-6": {
    id: "05",
    folder: "05_Convenio_de_Tokio_1963",
    name: "Tokio 1963",
    subtitle: "Actos a bordo y facultades del comandante.",
    year: "1963",
    word: "A bordo",
    sources: ["tokyo"],
    steps: [
      {
        label: "Despegue",
        title: "Tokio 1963.<br><em>Cuando el problema está a bordo.</em>",
        body: "<strong>Convenio sobre las infracciones y ciertos otros actos cometidos a bordo de las aeronaves</strong>, hecho en Tokio el 14 de septiembre de 1963. Su campo incluye infracciones penales y ciertos actos que comprometen la seguridad, el buen orden o la disciplina a bordo, aunque no sean delitos.",
        refs: ["tokyo:Art. 1 y firma; pp. 3 y 13 PDF"],
        hero: true,
        cards: [
          ["Qué actos", "Infracciones penales y otros actos previstos en el art. 1."],
          ["Quién interviene", "El comandante tiene facultades con fines y condiciones definidos."],
          ["Qué hacen los Estados", "El Convenio regula jurisdicción y deberes de cooperación."],
        ],
      },
      {
        label: "Actos y ámbito",
        title: "El orden a bordo<br><em>también importa.</em>",
        body: "El art. 1 contempla actos que pongan o puedan poner en peligro la seguridad de la aeronave, personas o bienes, o el buen orden y la disciplina. Como regla del art. 1.2, se refiere a aeronaves matriculadas en un Estado contratante mientras están en vuelo o en las zonas indicadas fuera del territorio de un Estado, con la reserva del capítulo III. Excluye aeronaves militares, aduaneras y de policía.",
        refs: ["tokyo:Art. 1; p. 3 PDF"],
        questions: [
          {
            q: "¿Tokio 1963 solo se ocupa de actos ya tipificados como delitos?",
            options: ["Sí", "No, también de ciertos otros actos a bordo"],
            answer: 1,
            why: "El art. 1.1(b) incluye actos que sean o no infracciones cuando comprometan los bienes que describe.",
          },
        ],
      },
      {
        label: "Jurisdicción",
        title: "Matrícula<br><em>no significa exclusividad.</em>",
        body: "El Estado de matrícula es competente para conocer infracciones y actos cometidos a bordo. El art. 3.3 no excluye la jurisdicción penal ejercida conforme a leyes nacionales. El art. 4 limita la interferencia de otros Estados con una aeronave en vuelo, pero prevé excepciones.",
        refs: ["tokyo:Arts. 3–4; p. 4 PDF"],
        questions: [
          {
            q: "¿Tokio 1963 concede siempre jurisdicción penal exclusiva al Estado de matrícula?",
            options: [
              "Sí, excluye cualquier otra",
              "No: el art. 3.3 conserva otras jurisdicciones conforme a leyes nacionales",
            ],
            answer: 1,
            why: "El Convenio reconoce competencia del Estado de matrícula sin establecer la exclusividad absoluta propuesta.",
          },
        ],
      },
      {
        label: "Dos sentidos de “en vuelo”",
        title: "Una expresión.<br><em>Dos delimitaciones.</em>",
        body: "Para el art. 1.3, el vuelo va desde aplicar fuerza motriz para despegar hasta terminar el recorrido de aterrizaje. Para las facultades del comandante del capítulo III, el art. 5.2 usa <strong>cierre de todas las puertas exteriores tras embarcar → apertura de cualquiera para desembarcar</strong>. En aterrizaje forzoso, este último período se prolonga hasta que las autoridades asumen la responsabilidad.",
        refs: ["tokyo:Arts. 1.3 y 5.2; pp. 3 y 5 PDF"],
        questions: [
          {
            q: "Estudias facultades del comandante bajo el capítulo III. ¿Qué delimitación corresponde?",
            options: [
              "Solo ruedas fuera del suelo",
              "Puertas cerradas tras embarque hasta apertura para desembarque, con la regla especial de aterrizaje forzoso",
            ],
            answer: 1,
            why: "El art. 5.2 tiene su propia definición para ese capítulo. No se debe sustituir por la del art. 1.3.",
          },
        ],
      },
      {
        label: "Facultades del comandante",
        title: "Medidas razonables.<br><em>Con una finalidad.</em>",
        body: "Con razones fundadas para creer que una persona ha cometido o está por cometer un acto del art. 1.1, el comandante puede imponer medidas razonables, incluso coercitivas, necesarias para proteger la seguridad, mantener el orden o permitir desembarque o entrega conforme al Convenio. Puede exigir o autorizar ayuda de la tripulación; a los pasajeros puede solicitarla o autorizarla, <strong>pero no exigirla</strong>.",
        refs: ["tokyo:Art. 6; pp. 5–6 PDF"],
        questions: [
          {
            q: "¿Puede exigir a un pasajero la misma ayuda que puede exigir a un tripulante?",
            options: [
              "Sí, siempre",
              "No: a pasajeros puede solicitarla o autorizarla, no exigirla",
            ],
            answer: 1,
            why: "La distinción aparece expresamente en el art. 6.2.",
          },
          {
            q: "¿Las facultades del comandante equivalen a libertad ilimitada para castigar?",
            options: [
              "No: son medidas razonables y necesarias para los fines previstos",
              "Sí, mientras la aeronave vuele",
            ],
            answer: 0,
            why: "El art. 6 establece condiciones y objetivos; no convierte al comandante en un tribunal.",
          },
        ],
      },
      {
        label: "Desembarcar y entregar",
        title: "Dos acciones.<br><em>Distintas condiciones.</em>",
        body: "El art. 8 permite desembarcar en los supuestos y para los fines que señala; el comandante informa al Estado del hecho y sus razones. El art. 9 contempla entregar a autoridades de un Estado contratante a quien razonablemente se considera autor de una infracción grave según la ley penal del Estado de matrícula; exige notificación y aportar la información y pruebas disponibles legítimamente.",
        refs: ["tokyo:Arts. 8–9; pp. 6–7 PDF"],
        cards: [
          [
            "Desembarque · art. 8",
            "Vinculado a actos del art. 1.1(b) y a proteger seguridad u orden en los términos del artículo.",
          ],
          [
            "Entrega · art. 9",
            "Vinculada a una infracción grave y a autoridades de un Estado contratante.",
          ],
        ],
        questions: [
          {
            q: "¿Desembarcar y entregar a autoridades son términos intercambiables sin condiciones?",
            options: ["Sí", "No, los arts. 8 y 9 tienen condiciones distintas"],
            answer: 1,
            why: "Distinguirlos evita transformar una facultad concreta en un poder general.",
          },
        ],
      },
      {
        label: "Cómo me lo aprendo",
        title: "Tokio → Japón.<br><em>Una escena a bordo.</em>",
        body: "Imagina una escena de anime en la que una discusión amenaza el orden de una cabina. Congela la imagen y piensa: <strong>actos a bordo, comandante, condiciones</strong>. Es una escena ficticia y una asociación cultural; no una descripción de Japón ni una regla jurídica.",
        refs: ["tokyo:Arts. 1 y 6"],
        memory: {
          visual: "TOKIO · 1963 → A BORDO",
          text: "La escena sirve para recuperar el tema. Tokio 1963 va más allá de “peleas”: abarca infracciones y ciertos otros actos definidos por su art. 1.",
        },
        recall: [
          [
            "¿Qué año y qué ámbito recuerdas?",
            "Tokio 1963; infracciones y ciertos otros actos a bordo de aeronaves.",
          ],
          [
            "¿Qué dos límites recordarías sobre las medidas del comandante?",
            "Deben ser razonables y necesarias para los fines del art. 6; no son un poder ilimitado de castigo.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Orden a bordo.<br><em>Criterio al responder.</em>",
        body: "Supón que se cumplen las condiciones de aplicación del Convenio. Identifica las reglas estudiadas.",
        refs: ["tokyo:Arts. 1, 3, 6, 8–9, 16"],
        questions: [
          {
            q: "Una conducta compromete el buen orden sin ser necesariamente delito. ¿Puede entrar en el art. 1?",
            options: ["Sí", "No"],
            answer: 0,
            why: "Tokio 1963 contempla ciertos actos sean o no infracciones.",
          },
          {
            q: "El comandante solicita ayuda a un pasajero. ¿Puede imponerla por el art. 6.2?",
            options: ["Sí", "No"],
            answer: 1,
            why: "Puede solicitar o autorizar ayuda de pasajeros, no exigirla.",
          },
          {
            q: "¿Qué etiqueta describe mejor Tokio 1963?",
            options: [
              "Indemnizaciones del transportista",
              "Actos a bordo y facultades del comandante",
              "Creación de OACI",
            ],
            answer: 1,
            why: "Esa es la conexión central de esta ruta.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-la-haya-1970-7": {
    id: "06",
    folder: "06_Convenio_de_La_Haya_1970",
    name: "La Haya 1970",
    subtitle: "Represión del apoderamiento ilícito de aeronaves.",
    year: "1970",
    word: "Apoderamiento",
    sources: ["hague", "tokyo"],
    steps: [
      {
        label: "Despegue",
        title: "La Haya 1970.<br><em>¿Quién controla la aeronave?</em>",
        body: "<strong>Convention for the Suppression of Unlawful Seizure of Aircraft</strong>, firmado el 16 de diciembre de 1970. En español: Convenio para la represión del apoderamiento ilícito de aeronaves. Su preámbulo identifica el peligro para personas y bienes, la afectación a los servicios y la pérdida de confianza que provocan esos actos.",
        refs: ["hague:Preámbulo; art. 13 y firma, pp. 2, 6–7 PDF"],
        hero: true,
        cards: [
          [
            "El núcleo",
            "Apoderarse ilícitamente de una aeronave en vuelo o ejercer su control en las condiciones del art. 1.",
          ],
          [
            "La respuesta",
            "Los Estados deben prever penas severas y mecanismos de jurisdicción y cooperación.",
          ],
          [
            "La diferencia",
            "El foco es el apoderamiento; Tokio 1963 también trata otros actos a bordo.",
          ],
        ],
      },
      {
        label: "El acto definido",
        title: "A bordo + en vuelo<br><em>+ apoderamiento.</em>",
        body: "El art. 1 se refiere a una persona a bordo de una aeronave en vuelo que, ilícitamente y mediante fuerza, amenaza de fuerza u otra intimidación, se apodera de la aeronave o ejerce su control, o intenta hacerlo. También incluye la complicidad con quien realiza o intenta ese acto.",
        refs: ["hague:Art. 1; p. 3 PDF"],
        questions: [
          {
            q: "¿Cuál reúne los elementos centrales descritos?",
            options: [
              "Una queja por demora",
              "Una persona a bordo toma el control mediante intimidación en vuelo",
              "Una diferencia en unidades de medida",
            ],
            answer: 1,
            why: "El art. 1 exige el acto y sus condiciones. No toda discusión o incidencia es apoderamiento ilícito.",
          },
          {
            q: "¿El intento queda fuera del art. 1?",
            options: ["Sí", "No, está incluido"],
            answer: 1,
            why: "El artículo incluye tentativa y complicidad en los términos que describe.",
          },
        ],
      },
      {
        label: "Vuelo y ámbito",
        title: "Las puertas importan.<br><em>Las condiciones también.</em>",
        body: "“En vuelo” va del cierre de todas las puertas exteriores tras embarcar a la apertura de cualquiera para desembarcar. En aterrizaje forzoso se prolonga hasta que las autoridades asumen responsabilidad. El art. 3 excluye aeronaves militares, aduaneras o de policía y establece condiciones territoriales de aplicación.",
        refs: ["hague:Art. 3; pp. 3–4 PDF"],
        cards: [
          [
            "Regla territorial general",
            "El lugar de despegue o de aterrizaje efectivo debe estar fuera del Estado de matrícula; que el vuelo se llame nacional o internacional no decide por sí solo.",
          ],
          [
            "Regla adicional",
            "Los arts. 6, 7, 8 y 10 también se aplican cuando el presunto autor se encuentra en un Estado distinto del de matrícula, cualquiera que sea el lugar de despegue o aterrizaje.",
          ],
        ],
        questions: [
          {
            q: "¿Basta la etiqueta comercial “vuelo nacional” para descartar automáticamente La Haya 1970?",
            options: ["Sí", "No; hay que revisar las condiciones del art. 3"],
            answer: 1,
            why: "La aplicación depende de los elementos que fija el artículo, incluidas sus reglas adicionales.",
          },
        ],
      },
      {
        label: "Respuesta de los Estados",
        title: "Cooperar para<br><em>perseguir el delito.</em>",
        body: "El Convenio prevé penas severas (art. 2), jurisdicción en supuestos definidos (art. 4), medidas para asegurar la presencia e investigación preliminar (art. 6) y reglas de extradición (art. 8). Si el Estado donde se encuentra el presunto autor no lo extradita, el art. 7 exige someter el caso a sus autoridades competentes para el ejercicio de la acción penal.",
        refs: ["hague:Arts. 2, 4, 6–8"],
        questions: [
          {
            q: "No se extradita al presunto autor. ¿El art. 7 permite simplemente ignorar el caso?",
            options: [
              "Sí",
              "No, debe someterse a las autoridades competentes para la acción penal",
            ],
            answer: 1,
            why: "Someter el caso a las autoridades no equivale a una condena automática: ellas deciden como en otros delitos graves conforme al derecho interno.",
          },
        ],
      },
      {
        label: "Relaciona con Tokio",
        title: "Comparten contexto.<br><em>Difieren en foco.</em>",
        body: "Tokio 1963 contempla infracciones y ciertos otros actos a bordo, facultades del comandante y medidas ante apoderamiento en su art. 11. La Haya 1970 define específicamente el delito de apoderamiento descrito y desarrolla su represión. No son cajas totalmente aisladas.",
        refs: ["tokyo:Arts. 1, 6 y 11", "hague:Arts. 1–2 y 7–10"],
        match: [
          ["Tokio 1963", "Actos a bordo y facultades del comandante"],
          ["La Haya 1970", "Represión específica del apoderamiento ilícito"],
        ],
        guide: "La palabra clave orienta la búsqueda; no borra las conexiones entre instrumentos.",
      },
      {
        label: "Cómo me lo aprendo",
        title: "1970.<br><em>El control no se entrega.</em>",
        body: "Imagina una palanca de mando ficticia con una etiqueta enorme: “LA HAYA 1970”. Una mano intrusa intenta tomarla y la etiqueta te recuerda el tema: apoderamiento ilícito.",
        refs: ["hague:Art. 1"],
        memory: {
          visual: "LA HAYA · 1970 → CONTROL",
          text: "La palanca es una asociación del curso. No describe cómo se comete un delito ni sustituye los elementos de fuerza, amenaza o intimidación del art. 1.",
        },
        recall: [
          ["¿Qué año y palabra clave?", "La Haya 1970; apoderamiento ilícito."],
          [
            "¿Qué diferencia conservarías respecto de Tokio 1963?",
            "Tokio 1963 tiene un campo más amplio de actos a bordo y facultades del comandante; La Haya 1970 se centra en la represión del apoderamiento definido.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Recupera<br><em>el núcleo.</em>",
        body: "Resuelve según el texto de La Haya 1970.",
        refs: ["hague:Arts. 1–3 y 7"],
        questions: [
          {
            q: "¿Cuál es su año?",
            options: ["1955", "1970", "1971"],
            answer: 1,
            why: "La Haya 1970 es el instrumento de apoderamiento estudiado; no lo identifiques solo por la ciudad.",
          },
          {
            q: "¿Qué situación representa su foco?",
            options: [
              "Reclamación por carga perdida",
              "Apoderamiento ilícito mediante intimidación a bordo en vuelo",
              "Creación de Anexos",
            ],
            answer: 1,
            why: "Corresponde al núcleo del art. 1, sujeto al resto del ámbito del Convenio.",
          },
          {
            q: "¿El período “en vuelo” equivale únicamente a estar en el aire?",
            options: ["Sí", "No: usa el criterio de puertas y la regla de aterrizaje forzoso"],
            answer: 1,
            why: "El art. 3.1 define el período para este Convenio.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-montreal-1971-8": {
    id: "07",
    folder: "07_Convenio_de_Montreal_1971",
    name: "Montreal 1971",
    subtitle: "Actos ilícitos contra la seguridad de la aviación civil.",
    year: "1971",
    word: "Actos ilícitos",
    sources: ["m71", "hague", "m99"],
    steps: [
      {
        label: "Despegue",
        title: "Montreal 1971.<br><em>Proteger frente a actos ilícitos.</em>",
        body: "<strong>Convention for the Suppression of Unlawful Acts against the Safety of Civil Aviation</strong>, hecho el 23 de septiembre de 1971. En español: Convenio para la represión de actos ilícitos contra la seguridad de la aviación civil. Su preámbulo plantea la necesidad de medidas para sancionar a los autores y disuadir esos actos.",
        refs: ["m71:Preámbulo, art. 15 y firma; pp. 2, 7–8 PDF"],
        hero: true,
        cards: [
          [
            "Tema",
            "Actos ilícitos e intencionales definidos contra la seguridad de la aviación civil.",
          ],
          [
            "Aeronaves y más",
            "Incluye supuestos relativos a aeronaves, personas a bordo, instalaciones de navegación e información falsa.",
          ],
          [
            "Año indispensable",
            "Montreal 1971 es distinto de Montreal 1999, que trata transporte y responsabilidad.",
          ],
        ],
      },
      {
        label: "Actos comprendidos",
        title: "No solo<br><em>tomar el control.</em>",
        body: "El art. 1 define actos cometidos ilícita e intencionalmente. Sus condiciones importan: no todo daño accidental ni toda información incorrecta reúnen la definición. También contempla tentativa y complicidad.",
        refs: ["m71:Art. 1; pp. 2–3 PDF"],
        cards: [
          [
            "Personas y aeronaves",
            "Violencia contra alguien a bordo de una aeronave en vuelo, si puede poner en peligro su seguridad; destrucción de una aeronave en servicio o daños en los términos previstos.",
          ],
          [
            "Dispositivos o sustancias",
            "Colocarlos o hacerlos colocar en una aeronave en servicio cuando puedan destruirla o causar los daños que describe el artículo.",
          ],
          [
            "Navegación e información",
            "Destruir, dañar o interferir instalaciones de navegación con el peligro previsto; comunicar información que se sabe falsa, poniendo en peligro una aeronave en vuelo.",
          ],
        ],
        questions: [
          {
            q: "¿Una equivocación involuntaria de información equivale por sí sola al supuesto de información falsa del art. 1.1(e)?",
            options: ["Sí", "No: exige conocimiento de la falsedad y puesta en peligro"],
            answer: 1,
            why: "El artículo exige comunicar información que se sabe falsa y con ello poner en peligro la seguridad de una aeronave en vuelo.",
          },
        ],
      },
      {
        label: "En vuelo y en servicio",
        title: "Un período<br><em>más amplio.</em>",
        body: "Montreal 1971 distingue “en vuelo” y “en servicio”. En vuelo: cierre de puertas tras embarque a apertura para desembarque, con la prolongación del aterrizaje forzoso. En servicio: desde que personal de tierra o tripulación inicia la preparación previa para un vuelo específico hasta 24 horas después de cualquier aterrizaje; en todo caso abarca el período completo en vuelo.",
        refs: ["m71:Art. 2; pp. 4–5 PDF"],
        match: [
          ["En vuelo", "Puertas cerradas tras embarque → apertura para desembarque"],
          ["En servicio", "Preparación para vuelo específico → 24 h después de aterrizaje"],
        ],
        questions: [
          {
            q: "¿“En servicio” comienza únicamente después de despegar?",
            options: ["Sí", "No; puede comenzar con la preparación previa del vuelo específico"],
            answer: 1,
            why: "El art. 2(b) extiende el período más allá de estar físicamente en el aire.",
          },
        ],
      },
      {
        label: "Ámbito y condiciones",
        title: "Lee el acto.<br><em>Luego su ámbito.</em>",
        body: "El art. 4 excluye aeronaves militares, aduaneras y de policía. Para varios actos del art. 1 establece conexiones con el lugar de despegue o aterrizaje, el Estado de matrícula, el lugar del hecho o la presencia del presunto autor. Para instalaciones de navegación exige que se utilicen en navegación aérea internacional.",
        refs: ["m71:Art. 4; p. 5 PDF"],
        questions: [
          {
            q: "¿El título permite concluir que se aplica a cualquier incidente de aviación sin revisar condiciones?",
            options: ["Sí", "No; se deben comprobar acto, intención y ámbito"],
            answer: 1,
            why: "Los arts. 1 y 4 delimitan lo que cubre Montreal 1971. Su título no reemplaza esa comprobación.",
          },
        ],
      },
      {
        label: "Cooperación estatal",
        title: "Prevenir, investigar<br><em>y someter el caso.</em>",
        body: "Los Estados se comprometen a penas severas (art. 3), establecen jurisdicción en los supuestos del art. 5 y adoptan medidas e investigación preliminar bajo el art. 6. Si no extraditan al presunto autor, el art. 7 exige someter el caso a las autoridades competentes para la acción penal. Los arts. 10–13 tratan prevención, asistencia e información.",
        refs: ["m71:Arts. 3, 5–8 y 10–13"],
        questions: [
          {
            q: "¿Someter el caso a autoridades competentes significa que el tratado ordena condenar automáticamente?",
            options: ["Sí", "No; las autoridades deciden conforme a las reglas aplicables"],
            answer: 1,
            why: "El art. 7 indica someter el caso y que las autoridades decidan como para un delito grave de derecho común.",
          },
        ],
      },
      {
        label: "1971 frente a 1999",
        title: "Misma ciudad.<br><em>Otra pregunta.</em>",
        body: "La distinción debe permanecer visible en todo el curso. <strong>Montreal 1971: represión de actos ilícitos.</strong><br><strong>Montreal 1999: unificación de ciertas reglas del transporte aéreo internacional y responsabilidad.</strong> Un hecho puede tener dimensiones penales y de daños, pero sus artículos no se intercambian.",
        refs: ["m71:Título y art. 1", "m99:Título y arts. 17–19"],
        match: [
          ["Montreal 1971", "Actos ilícitos contra la seguridad de la aviación civil"],
          ["Montreal 1999", "Reglas de transporte y responsabilidad del transportista"],
        ],
        questions: [
          {
            q: "¿Puedes usar el art. 17 de Montreal 1999 para explicar qué actos tipifica Montreal 1971?",
            options: ["Sí, comparten ciudad", "No, son instrumentos diferentes"],
            answer: 1,
            why: "La numeración pertenece a cada texto. Siempre conserva instrumento y año.",
          },
        ],
      },
      {
        label: "Cómo me lo aprendo",
        title: "Dos carpetas.<br><em>Sin intercambiar papeles.</em>",
        body: "Imagina dos maletines: el de <strong>1971</strong> tiene un objeto extraño intentando entrar y una alerta; el de <strong>1999</strong> lleva documentos de pasajeros, equipaje y carga. Los años están impresos en grande.",
        refs: ["m71:Art. 1", "m99:Arts. 3–4 y 17–19"],
        memory: {
          visual: "1971 · ALERTA │ 1999 · RECLAMACIÓN",
          text: "Alerta recuerda actos ilícitos; reclamación recuerda transporte y daños. Son etiquetas de memoria, no definiciones exhaustivas ni prueba de que todo aviso sea un delito.",
        },
        recall: [
          [
            "¿Qué problema aborda Montreal 1971?",
            "La represión de actos ilícitos contra la seguridad de la aviación civil definidos por el convenio.",
          ],
          [
            "¿Por qué un daño en tierra puede ser relevante?",
            "Algunos supuestos se refieren a aeronaves “en servicio”; ese período incluye preparación previa y el tiempo previsto después del aterrizaje.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "El año cambia<br><em>la carpeta.</em>",
        body: "Responde sin mezclar los dos instrumentos.",
        refs: ["m71:Arts. 1–2 y 7", "m99:Arts. 17–19"],
        questions: [
          {
            q: "Destrucción intencional e ilícita de una aeronave en servicio, bajo las condiciones del convenio: ¿qué foco estudias?",
            options: ["Montreal 1999", "Montreal 1971", "Varsovia 1929"],
            answer: 1,
            why: "Montreal 1971 incluye ese acto en el art. 1.",
          },
          {
            q: "¿Qué concepto incluye preparación previa para un vuelo específico?",
            options: ["En servicio", "Solo en vuelo"],
            answer: 0,
            why: "Art. 2(b) de Montreal 1971.",
          },
          {
            q: "¿Qué año acompaña al instrumento sobre reglas del transporte y responsabilidad?",
            options: ["1971", "1999"],
            answer: 1,
            why: "Montreal 1999 se estudia en la siguiente ruta.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/convenio-de-montreal-1999-5": {
    id: "08",
    folder: "08_Convenio_de_Montreal_1999",
    name: "Montreal 1999",
    subtitle: "Unificar reglas del transporte internacional.",
    year: "1999",
    word: "Responsabilidad",
    sources: ["m99", "warsaw", "m71"],
    steps: [
      {
        label: "Despegue",
        title: "Montreal 1999.<br><em>El transporte y sus daños.</em>",
        body: "<strong>Convention for the Unification of Certain Rules for International Carriage by Air</strong>, hecho el 28 de mayo de 1999. En español: Convenio para la unificación de ciertas reglas para el transporte aéreo internacional. Su preámbulo reconoce la contribución de Varsovia 1929 y la necesidad de modernizar y consolidar ese sistema, protegiendo los intereses de los usuarios.",
        refs: ["m99:Preámbulo y firma; pp. 1 y 18 PDF"],
        hero: true,
        cards: [
          ["Personas, equipaje y carga", "El Convenio delimita su transporte internacional."],
          ["Documentación", "Contempla documentos y otros medios que conserven la información."],
          ["Responsabilidad", "Regula daños, condiciones de responsabilidad y reclamaciones."],
        ],
      },
      {
        label: "Ámbito",
        title: "El contrato te da<br><em>las coordenadas.</em>",
        body: "Se aplica al transporte internacional remunerado de personas, equipaje o carga por aeronave, y al gratuito efectuado por una empresa de transporte aéreo. Según lo acordado, partida y destino deben estar en dos Estados partes, o en uno solo con escala convenida en otro Estado, aunque este último no sea parte.",
        refs: ["m99:Arts. 1–2; pp. 1–2 PDF"],
        questions: [
          {
            q: "Partida y destino están en un mismo Estado parte, con escala convenida en otro Estado. ¿Puede ser internacional para Montreal 1999?",
            options: ["Sí, conforme al art. 1.2", "No, nunca si regresa al mismo Estado"],
            answer: 0,
            why: "La escala convenida exterior puede satisfacer la definición. No se presume el carácter internacional solo por el nombre del vuelo.",
          },
          {
            q: "¿Un envío postal se trata sin más igual que cualquier carga?",
            options: ["Sí", "No; el art. 2 prevé reglas específicas para envíos postales"],
            answer: 1,
            why: "El art. 2.2 regula la responsabilidad frente a la administración postal y el 2.3 excluye las demás disposiciones salvo ese apartado.",
          },
        ],
      },
      {
        label: "Documentos y registros",
        title: "La información<br><em>puede conservarse.</em>",
        body: "Para pasajeros, el art. 3 permite sustituir la entrega del documento por otros medios que conserven la información requerida; en ese caso debe ofrecerse una constancia escrita. Para carga, el art. 4 admite otros medios de registro y un recibo si lo pide el expedidor. La falta de requisitos documentales no elimina por sí sola el contrato ni sus límites de responsabilidad.",
        refs: ["m99:Arts. 3–5 y 9; pp. 2–4 PDF"],
        cards: [
          [
            "Pasajeros y equipaje",
            "Información de partida y destino, escala cuando corresponda e identificación de cada pieza facturada, entre los requisitos del art. 3.",
          ],
          [
            "Carga",
            "Carta de porte aéreo u otros medios de registro, con las condiciones de los arts. 4–5.",
          ],
          [
            "Diferencia con el texto de 1929",
            "Montreal 1999 conserva la aplicación de las reglas, incluidos límites, ante incumplimientos documentales: arts. 3.5 y 9.",
          ],
        ],
        questions: [
          {
            q: "¿Montreal 1999 exige que toda la información exista únicamente en un documento físico?",
            options: ["Sí", "No, admite otros medios en las condiciones previstas"],
            answer: 1,
            why: "Los arts. 3 y 4 contemplan medios alternativos que conserven la información.",
          },
        ],
      },
      {
        label: "Personas y equipaje",
        title: "La maleta facturada<br><em>no es todo el equipaje.</em>",
        body: "El art. 17 regula muerte o lesión corporal del pasajero por accidente a bordo o durante embarque o desembarque. Para equipaje facturado, contempla el hecho dañoso a bordo o durante la custodia del transportista, con la excepción del defecto, calidad o vicio propio. Para equipaje no facturado, exige culpa del transportista o sus dependientes o agentes.",
        refs: ["m99:Art. 17; p. 6 PDF"],
        questions: [
          {
            q: "¿El art. 17 trata exactamente igual el equipaje facturado y el no facturado?",
            options: ["Sí", "No; distingue las condiciones de responsabilidad"],
            answer: 1,
            why: "Para el no facturado, incluidos objetos personales, se exige culpa del transportista o sus dependientes o agentes.",
          },
          {
            q: "Un pasajero sufre una lesión corporal. ¿El art. 17.1 permite omitir dónde y cómo ocurrió?",
            options: [
              "No: requiere accidente y conexión con los momentos previstos",
              "Sí: cualquier lesión durante las vacaciones",
            ],
            answer: 0,
            why: "El accidente debe ocurrir a bordo o en las operaciones de embarque o desembarque.",
          },
        ],
      },
      {
        label: "Carga y retraso",
        title: "Daño, condición<br><em>y posible defensa.</em>",
        body: "El art. 18 se refiere a daños a la carga durante el transporte aéreo y enumera causas de exoneración. El art. 19 se ocupa del daño por retraso de pasajeros, equipaje o carga. En retraso, el transportista puede exonerarse si prueba que tomó todas las medidas razonablemente necesarias para evitar el daño, o que le resultó imposible tomarlas.",
        refs: ["m99:Arts. 18–20; pp. 6–7 PDF"],
        cards: [
          [
            "Carga",
            "El período comprende la custodia del transportista, con precisiones para tramos de otros modos de transporte.",
          ],
          [
            "Retraso",
            "No es una promesa de pago fijo por cualquier demora: se examinan daño y condiciones.",
          ],
          [
            "Contribución al daño",
            "El art. 20 contempla exoneración total o parcial cuando la conducta de quien reclama causó o contribuyó al daño.",
          ],
        ],
        questions: [
          {
            q: "¿El art. 19 establece indemnización automática y fija por cualquier minuto de retraso?",
            options: ["Sí", "No: regula daño por retraso y una defensa del transportista"],
            answer: 1,
            why: "Hay que conservar las condiciones del artículo. No es un baremo automático por minutos.",
          },
        ],
      },
      {
        label: "Estructura de responsabilidad",
        title: "Dos niveles.<br><em>Sin aprender cifras vencidas.</em>",
        body: "Para muerte o lesión corporal del art. 17.1, el art. 21 establece un primer tramo y otro por encima del umbral con defensas específicas del transportista. El art. 20 también resulta aplicable. Los arts. 22–24 tratan límites para otros daños, unidad de cuenta y revisión de límites. <strong>Aprende el mecanismo; las cifras originales del PDF no se presentan aquí como cuantías vigentes.</strong>",
        refs: ["m99:Arts. 20–24; pp. 7–9 PDF"],
        questions: [
          {
            q: "¿Sería correcto usar sin verificar las cifras originales del PDF como límites actuales?",
            options: ["Sí, nunca se revisan", "No, el art. 24 prevé revisión de límites"],
            answer: 1,
            why: "El texto contiene un mecanismo de revisión. Este curso no fija cuantías actuales ni calcula indemnizaciones.",
          },
        ],
      },
      {
        label: "Transportistas y relación",
        title: "Quién contrata.<br><em>Quién transporta.</em>",
        body: "El capítulo V distingue al transportista contractual del que efectivamente realiza todo o parte del transporte autorizado por él. El art. 40 somete a ambos al régimen con el alcance previsto. Además, el art. 55 establece la prevalencia de Montreal 1999 frente a reglas de los instrumentos de Varsovia en las relaciones que especifica: <strong>no significa que Varsovia desaparezca automáticamente de todo supuesto</strong>.",
        refs: ["m99:Arts. 39–40 y 55; pp. 13 y 17 PDF"],
        match: [
          ["Transportista contractual", "Celebra como principal el contrato de transporte"],
          [
            "Transportista de hecho",
            "Realiza todo o parte del transporte por autorización del contractual",
          ],
        ],
        questions: [
          {
            q: "¿Montreal 1999 es solo otro nombre del mismo texto de Varsovia 1929?",
            options: [
              "Sí",
              "No, es un instrumento distinto con una relación regulada en su art. 55",
            ],
            answer: 1,
            why: "Comparte la materia de transporte y responsabilidad, pero tiene su propio texto y condiciones de prevalencia.",
          },
        ],
      },
      {
        label: "Cómo me lo aprendo",
        title: "1999.<br><em>Dos nueves, dos etiquetas.</em>",
        body: "Imagina los dos 9 como etiquetas curvas de equipaje: una dice “transporte” y otra “responsabilidad”. Junto a ellas hay un billete y una caja. Recupera siempre el año completo: Montreal 1999.",
        refs: ["m99:Preámbulo y arts. 17–19"],
        memory: {
          visual: "19<span>99</span> → TRANSPORTE + DAÑOS",
          text: "Las etiquetas son una imagen del curso, no una categoría legal. Para Montreal 1971 cambia de carpeta: actos ilícitos contra la seguridad.",
        },
        recall: [
          [
            "¿Año, tema y antecedente reconocido?",
            "Montreal 1999; reglas de transporte internacional y responsabilidad; reconoce Varsovia 1929 y otros instrumentos relacionados.",
          ],
          [
            "¿Qué matiz recordarías sobre el retraso?",
            "Se refiere al daño por retraso y contempla la defensa del art. 19; no promete un pago automático por toda demora.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cada daño<br><em>en su texto.</em>",
        body: "Identifica el instrumento y las condiciones básicas.",
        refs: ["m99:Arts. 1, 17, 19, 24 y 55", "m71:Art. 1"],
        questions: [
          {
            q: "¿Qué pareja corresponde?",
            options: [
              "Montreal 1999 → represión del sabotaje",
              "Montreal 1999 → reglas del transporte y responsabilidad",
            ],
            answer: 1,
            why: "El instrumento de 1999 se centra en transporte; los actos ilícitos estudiados corresponden a Montreal 1971.",
          },
          {
            q: "¿Qué determina el carácter internacional según el art. 1?",
            options: [
              "Los puntos y escalas acordados en las condiciones del artículo",
              "La nacionalidad del pasajero",
              "Que el avión sea grande",
            ],
            answer: 0,
            why: "La definición se vincula al transporte acordado y a los Estados, no al tamaño ni a la nacionalidad del pasajero.",
          },
          {
            q: "¿Qué conviene memorizar sobre los límites?",
            options: [
              "Una cifra antigua como si siempre fuera actual",
              "Que existe un mecanismo de revisión en el art. 24",
            ],
            answer: 1,
            why: "La arquitectura del régimen permanece como aprendizaje; una aplicación actual exige verificar el límite que corresponda.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/convenios-internacionales/repaso-final-de-convenios-9": {
    id: "09",
    folder: "09_Repaso_Final_de_Convenios",
    name: "Repaso final de convenios",
    subtitle: "¿Cómo me aprendo todos los convenios?",
    year: "RECAP",
    word: "Comparar",
    sources: ["warsaw", "chicago", "tokyo", "hague", "m71", "m99", "annex"],
    steps: [
      {
        label: "Tu mapa final",
        title: "Seis instrumentos.<br><em>Seis fichas mentales.</em>",
        body: "Reúne nombre, año y pregunta central. Los Anexos pertenecen al marco de Chicago 1944; no son diecinueve convenios independientes.",
        refs: [
          "chicago:Art. 54(l)",
          "warsaw:Preámbulo",
          "tokyo:Art. 1",
          "hague:Art. 1",
          "m71:Art. 1",
          "m99:Preámbulo",
        ],
        hero: true,
        timeline: true,
        recap: [
          [
            "Resumen",
            "Reúne nombre, año y pregunta central. Los Anexos pertenecen al marco de Chicago 1944; no son diecinueve convenios independientes.",
          ],
        ],
      },
      {
        label: "Convenio ↔ año",
        title: "El año es parte<br><em>del nombre.</em>",
        body: "Relaciona cada instrumento con su año. Montreal 1971 y Montreal 1999 se distinguen siempre.",
        refs: [
          "warsaw:Firma",
          "chicago:Prólogo",
          "tokyo:Firma",
          "hague:Firma",
          "m71:Firma",
          "m99:Firma",
        ],
        match: [
          ["Varsovia", "1929"],
          ["Chicago", "1944"],
          ["Tokio", "1963"],
          ["La Haya · apoderamiento", "1970"],
          ["Instrumento sobre actos ilícitos contra la seguridad", "1971"],
          ["Instrumento que moderniza y consolida reglas de transporte", "1999"],
        ],
      },
      {
        label: "Convenio ↔ tema",
        title: "Abre la carpeta<br><em>que corresponde.</em>",
        body: "Conecta la pregunta central. Son etiquetas para orientarte, no definiciones que excluyan todas las conexiones.",
        refs: [
          "warsaw:Preámbulo",
          "chicago:Arts. 1 y 43",
          "tokyo:Arts. 1 y 6",
          "hague:Art. 1",
          "m71:Art. 1",
          "m99:Preámbulo",
        ],
        match: [
          ["Varsovia 1929", "Documentos y responsabilidad del porteador: texto de 1929"],
          ["Chicago 1944", "Marco de navegación y creación de OACI"],
          ["Tokio 1963", "Actos a bordo y facultades del comandante"],
          ["La Haya 1970", "Represión del apoderamiento ilícito"],
          ["Montreal 1971", "Represión de actos ilícitos contra la seguridad"],
          [
            "Montreal 1999",
            "Modernización y consolidación de reglas de transporte y responsabilidad",
          ],
        ],
      },
      {
        label: "Convenio ↔ pista",
        title: "Lo raro,<br><em>bien conectado.</em>",
        body: "Mira la pista y recupera el convenio. Si recuerdas la imagen pero no el alcance, vuelve a su ruta. Todas estas pistas son nemotecnias creadas para estudiar.",
        refs: [
          "warsaw:Preámbulo",
          "chicago:Art. 43",
          "tokyo:Art. 1",
          "hague:Art. 1",
          "m71:Art. 1",
          "m99:Arts. 17–19",
        ],
        match: [
          ["V de vuelo + R de responsabilidad", "Varsovia 1929"],
          ["I–C–A–O dentro de CHICAGO", "Chicago 1944"],
          ["Escena ficticia de anime en una cabina", "Tokio 1963"],
          ["Una palanca de mando con etiqueta 1970", "La Haya 1970"],
          ["Maletín 1971 con alerta ante un objeto extraño", "Montreal 1971"],
          ["Dos 9 como etiquetas de transporte y daños", "Montreal 1999"],
        ],
      },
      {
        label: "Orden cronológico",
        title: "Ordena<br><em>la línea de tiempo.</em>",
        body: "Toca los instrumentos desde el más antiguo hasta el más reciente. El orden no supone que uno sustituya por completo al anterior: esa relación depende de cada texto.",
        refs: [
          "warsaw:Firma",
          "chicago:Prólogo",
          "tokyo:Firma",
          "hague:Firma",
          "m71:Firma",
          "m99:Firma",
        ],
        order: [
          "Varsovia 1929",
          "Chicago 1944",
          "Tokio 1963",
          "La Haya 1970",
          "Montreal 1971",
          "Montreal 1999",
        ],
      },
      {
        label: "Parecidos, no idénticos",
        title: "Las confusiones<br><em>más probables.</em>",
        body: "Antes de la evaluación, recupera las diferencias sin ver la respuesta.",
        refs: [
          "warsaw:Preámbulo",
          "m99:Preámbulo y art. 55",
          "tokyo:Arts. 1 y 6",
          "hague:Art. 1",
          "m71:Art. 1",
          "annex:Anexos 17 y 19",
        ],
        recall: [
          [
            "Varsovia 1929 y Montreal 1999: ¿qué comparten y qué no?",
            "Comparten la materia de transporte y responsabilidad. Son instrumentos distintos; Montreal 1999 moderniza y consolida el sistema y regula su relación en el art. 55.",
          ],
          [
            "Tokio 1963 y La Haya 1970: ¿cómo elegirías por el foco?",
            "Tokio 1963: actos a bordo y facultades del comandante. La Haya 1970: represión específica del apoderamiento ilícito. Tokio 1963 también contiene disposiciones sobre apoderamiento.",
          ],
          [
            "Montreal 1971 y Montreal 1999: ¿qué cambia?",
            "1971: actos ilícitos contra la seguridad. 1999: reglas del transporte y responsabilidad.",
          ],
          [
            "Anexos 17 y 19: ¿cómo los separas?",
            "17: Security, protección contra interferencia ilícita. 19: Safety Management, gestión de seguridad operacional.",
          ],
        ],
      },
      {
        label: "Evaluación final",
        title: "Situación → pregunta<br><em>→ instrumento.</em>",
        body: "Resuelve ocho casos. Cada pregunta delimita la materia a buscar; una situación real puede plantear varias cuestiones simultáneas.",
        refs: [
          "chicago:Arts. 1 y 43",
          "warsaw:Arts. 3–5",
          "tokyo:Arts. 1 y 6",
          "hague:Art. 1",
          "m71:Arts. 1–2",
          "m99:Arts. 17–19",
          "annex:Anexos 17 y 19",
        ],
        questions: [
          {
            q: "¿Dónde estudiarías la creación de OACI?",
            options: ["Chicago 1944", "Varsovia 1929", "La Haya 1970"],
            answer: 0,
            why: "Chicago 1944, art. 43.",
          },
          {
            q: "Buscas el billete de pasaje, talón de equipajes y carta de porte del texto de 1929.",
            options: ["Tokio 1963", "Varsovia 1929", "Montreal 1999"],
            answer: 1,
            why: "Es el bloque de títulos de transporte de Varsovia 1929.",
          },
          {
            q: "Quieres entender las medidas razonables del comandante para mantener el orden a bordo.",
            options: ["Tokio 1963", "Montreal 1999", "Chicago 1944"],
            answer: 0,
            why: "Tokio 1963, especialmente su art. 6.",
          },
          {
            q: "La cuestión precisa es la represión del apoderamiento ilícito por intimidación a bordo en vuelo.",
            options: ["La Haya 1970", "Varsovia 1929", "Montreal 1999"],
            answer: 0,
            why: "La Haya 1970 define ese núcleo en su art. 1.",
          },
          {
            q: "Buscas el supuesto de comunicar información que se sabe falsa y con ello poner en peligro una aeronave en vuelo.",
            options: ["Montreal 1999", "Montreal 1971", "Varsovia 1929"],
            answer: 1,
            why: "Montreal 1971, art. 1.1(e).",
          },
          {
            q: "Buscas responsabilidad por equipaje facturado conforme al texto de 1999.",
            options: ["Montreal 1971", "Tokio 1963", "Montreal 1999"],
            answer: 2,
            why: "Montreal 1999, art. 17.",
          },
          {
            q: "¿Qué pareja es correcta?",
            options: [
              "17 → Safety Management; 19 → Security",
              "17 → Security; 19 → Safety Management",
            ],
            answer: 1,
            why: "Conserva número y propósito, no solo la traducción “seguridad”.",
          },
          {
            q: "Un caso plantea delito y daños al pasajero. ¿Cómo estudias los convenios?",
            options: [
              "Elijo uno y supongo que excluye todos los demás",
              "Separo las preguntas y reviso los ámbitos de los instrumentos pertinentes",
            ],
            answer: 1,
            why: "La clasificación del curso orienta, pero no convierte los textos en categorías mutuamente excluyentes.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/disposiciones-generales-art-3-1": {
    id: "lac-01",
    folder: "01_Jurisdiccion_y_Aplicacion",
    name: "Jurisdicción y aplicación",
    subtitle:
      "Antes de decidir qué regla usar, identifica el espacio aéreo, la matrícula y el hecho a bordo.",
    year: "Ley de Aviación Civil",
    word: "LP 01",
    sources: ["3"],
    steps: [
      {
        label: "Despegue",
        title: "Jurisdicción y aplicación",
        body: "Antes de decidir qué regla usar, identifica el espacio aéreo, la matrícula y el hecho a bordo.",
        hero: true,
        refs: ["Ley de Aviación Civil · Artículo 3 · páginas 5"],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "El espacio aéreo y las controversias",
            "La explotación, uso o aprovechamiento del espacio aéreo sobre territorio nacional es de jurisdicción federal. Aquí, jurisdicción indica el ámbito de autoridad. Los tribunales federales conocen las controversias por la aplicación de esta Ley. Las controversias entre particulares pueden someterse a arbitraje conforme a las disposiciones aplicables; el artículo no explica ese procedimiento.\n\nTexto íntegro del artículo 3 (páginas 5):\nArtículo 3. La explotación, uso o aprovechamiento del espacio aéreo situado sobre el territorio\nnacional, es de jurisdicción federal.\nCorresponderá a los tribunales federales conocer de las controversias que se susciten con motivo de\nla aplicación de esta Ley, sin perjuicio de que las controversias que surjan entre particulares se sometan\na arbitraje, de conformidad con las disposiciones aplicables.\nLos hechos ocurridos y los actos realizados a bordo de una aeronave civil con matrícula mexicana, se\nsujetarán a las leyes y autoridades mexicanas; y los que ocurran o se realicen a bordo de una aeronave\ncivil extranjera durante el vuelo de la misma sobre territorio nacional, se regirán por las leyes y\nautoridades del Estado de matrícula de la aeronave, sin perjuicio de lo establecido en los tratados. En el\ncaso de comisión de delitos en aeronaves, se estará a lo dispuesto por el Código Penal Federal.\nSon aplicables a la navegación aérea civil las disposiciones que, sobre nacimientos y defunciones a\nbordo de un buque con bandera mexicana, establece el Código Civil Federal.",
          ],
          [
            "La matrícula importa",
            "Para hechos y actos a bordo de una aeronave civil con matrícula mexicana, el artículo señala leyes y autoridades mexicanas. Para una aeronave civil extranjera durante su vuelo sobre territorio nacional, señala las del Estado de matrícula, sin perjuicio de los tratados. No sustituyas esta segunda regla por «todo se rige por México».\n\nTexto íntegro del artículo 3 (páginas 5):\nArtículo 3. La explotación, uso o aprovechamiento del espacio aéreo situado sobre el territorio\nnacional, es de jurisdicción federal.\nCorresponderá a los tribunales federales conocer de las controversias que se susciten con motivo de\nla aplicación de esta Ley, sin perjuicio de que las controversias que surjan entre particulares se sometan\na arbitraje, de conformidad con las disposiciones aplicables.\nLos hechos ocurridos y los actos realizados a bordo de una aeronave civil con matrícula mexicana, se\nsujetarán a las leyes y autoridades mexicanas; y los que ocurran o se realicen a bordo de una aeronave\ncivil extranjera durante el vuelo de la misma sobre territorio nacional, se regirán por las leyes y\nautoridades del Estado de matrícula de la aeronave, sin perjuicio de lo establecido en los tratados. En el\ncaso de comisión de delitos en aeronaves, se estará a lo dispuesto por el Código Penal Federal.\nSon aplicables a la navegación aérea civil las disposiciones que, sobre nacimientos y defunciones a\nbordo de un buque con bandera mexicana, establece el Código Civil Federal.",
          ],
          [
            "Dos remisiones expresas",
            "Para delitos en aeronaves, el texto remite al Código Penal Federal. Para nacimientos y defunciones en navegación aérea civil, remite a las disposiciones del Código Civil Federal sobre esos hechos a bordo de un buque con bandera mexicana. Identificamos las remisiones, sin desarrollar esos códigos.\n\nTexto íntegro del artículo 3 (páginas 5):\nArtículo 3. La explotación, uso o aprovechamiento del espacio aéreo situado sobre el territorio\nnacional, es de jurisdicción federal.\nCorresponderá a los tribunales federales conocer de las controversias que se susciten con motivo de\nla aplicación de esta Ley, sin perjuicio de que las controversias que surjan entre particulares se sometan\na arbitraje, de conformidad con las disposiciones aplicables.\nLos hechos ocurridos y los actos realizados a bordo de una aeronave civil con matrícula mexicana, se\nsujetarán a las leyes y autoridades mexicanas; y los que ocurran o se realicen a bordo de una aeronave\ncivil extranjera durante el vuelo de la misma sobre territorio nacional, se regirán por las leyes y\nautoridades del Estado de matrícula de la aeronave, sin perjuicio de lo establecido en los tratados. En el\ncaso de comisión de delitos en aeronaves, se estará a lo dispuesto por el Código Penal Federal.\nSon aplicables a la navegación aérea civil las disposiciones que, sobre nacimientos y defunciones a\nbordo de un buque con bandera mexicana, establece el Código Civil Federal.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Tres preguntas antes de responder",
        body: "La matrícula orienta la regla de hechos a bordo; no borra las remisiones expresas del artículo.",
        match: [
          ["¿Dónde?", "Espacio aéreo sobre territorio nacional → jurisdicción federal."],
          ["¿Qué matrícula?", "Mexicana → leyes y autoridades mexicanas."],
          [
            "¿En qué supuesto?",
            "Extranjera en vuelo sobre México → Estado de matrícula, sin perjuicio de tratados.",
          ],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "El artículo permite someter controversias entre particulares a arbitraje conforme a disposiciones aplicables.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 3, segundo párrafo.",
          },
          {
            q: "El artículo explica las penas de todos los delitos a bordo.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "Solo remite al Código Penal Federal.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Un hecho ocurre a bordo de una aeronave civil con matrícula mexicana. ¿Qué marco señala el artículo?",
            options: ["Leyes y autoridades mexicanas", "Siempre las del lugar de despegue"],
            answer: 0,
            why: "Art. 3: la regla se vincula con la matrícula mexicana.",
          },
          {
            q: "Una aeronave civil extranjera vuela sobre México. ¿Qué regla se establece para actos a bordo?",
            options: [
              "Estado de matrícula, sin perjuicio de tratados",
              "Solo leyes mexicanas, sin salvedades",
            ],
            answer: 0,
            why: "Art. 3: conserva tanto el Estado de matrícula como la salvedad de tratados.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "La explotación del espacio aéreo sobre territorio nacional es de jurisdicción…",
            options: ["Municipal", "Federal", "Del operador"],
            answer: 1,
            why: "Art. 3, primer párrafo.",
          },
          {
            q: "¿El artículo excluye el arbitraje entre particulares?",
            options: ["Sí", "No"],
            answer: 1,
            why: "Se conserva la posibilidad de arbitraje conforme a las disposiciones aplicables.",
          },
          {
            q: "Para delitos en aeronaves, el artículo remite al…",
            options: ["Código Penal Federal", "Manual del operador"],
            answer: 0,
            why: "Art. 3: es una remisión, no un desarrollo de los delitos.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Reconstruye la regla de una aeronave extranjera con sus condiciones.",
            "Aeronave civil extranjera durante el vuelo sobre territorio nacional: leyes y autoridades del Estado de matrícula, sin perjuicio de los tratados.",
          ],
          [
            "Explica la diferencia entre jurisdicción federal y la regla de matrícula.",
            "La primera se refiere al espacio aéreo sobre el territorio nacional; la segunda determina el marco señalado para hechos y actos a bordo en los supuestos del artículo.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Antes de decidir qué regla usar, identifica el espacio aéreo, la matrícula y el hecho a bordo.",
        recap: [["Fuente estudiada", "Ley de Aviación Civil · Artículo 3 · páginas 5"]],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/autoridad-de-aviacion-civil-art-7-2": {
    id: "lac-02",
    folder: "02_Autoridad_de_Aviacion_Civil",
    name: "Autoridad de aviación civil",
    subtitle:
      "AFAC ejerce su autoridad mediante personas y funciones concretas. Aprende a reconocerlas.",
    year: "Ley de Aviación Civil",
    word: "LP 02",
    sources: ["7"],
    steps: [
      {
        label: "Despegue",
        title: "Autoridad de aviación civil",
        body: "AFAC ejerce su autoridad mediante personas y funciones concretas. Aprende a reconocerlas.",
        hero: true,
        refs: ["Ley de Aviación Civil · Artículo 7 · páginas 11, 12"],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Quién ejerce la autoridad",
            "La Agencia Federal de Aviación Civil (AFAC) ejerce autoridad en aeropuertos, helipuertos y aeródromos en general mediante comandantes regionales y comandantes de aeropuerto. No confundas estas figuras con la persona comandante de una aeronave.\n\nTexto íntegro del artículo 7 (páginas 11, 12):\nArtículo 7. La Agencia Federal de Aviación Civil ejerce su autoridad en los aeropuertos, helipuertos y\naeródromos en general, a través de las personas designadas como comandantes regionales y\ncomandantes de aeropuerto.\nLos comandantes regionales deberán ser mexicanos por nacimiento que no adquieran otra\nnacionalidad, y en el ejercicio de sus atribuciones dependerán funcional y operativamente de la Agencia\nFederal de Aviación Civil.\nLos comandantes regionales tendrán a su cargo las comandancias de aeropuerto que expresamente\nles sean determinadas por la propia Agencia Federal de Aviación Civil, los cuales ejercerán las\natribuciones que a continuación se mencionan:\nI. Vigilar permanentemente que las personas concesionarias, asignatarias, permisionarias,\noperadoras de aeronaves y prestadoras de servicios a la navegación aérea cumplan con esta\nLey, sus reglamentos, normas oficiales mexicanas y demás disposiciones aplicables;\nI Bis. Autorizar la práctica de visitas de vigilancia a las personas proveedoras de servicios;\nII. Vigilar el cumplimiento de las disposiciones e instrucciones contenidas en el Manual de la\nAgencia Federal de Aviación Civil;\nIII. Vigilar el estricto cumplimiento de los deberes y responsabilidades de los Comandantes de\nAeropuerto;\nIV. Vigilar que el personal de las comandancias de aeropuerto de su región esté debidamente\ncapacitado para el desempeño de sus funciones;\nV. Vigilar la seguridad y eficiencia de las operaciones aeronáuticas;\nVI. Levantar actas administrativas por violaciones a lo previsto en esta Ley, sus reglamentos y\nnormas oficiales mexicanas; actuar como auxiliar del ministerio público; cumplimentar las\nresoluciones judiciales y coordinar sus actividades con las demás autoridades que ejerzan\nfunciones en los aeropuertos; y\nVII. Las demás que expresamente les sean conferidas por su superior jerárquico y se encuentren\nfundadas en la legislación vigente aplicable a la materia.",
          ],
          [
            "Comandantes regionales",
            "Deben ser mexicanos por nacimiento que no adquieran otra nacionalidad. Dependen funcional y operativamente de AFAC. Tienen a su cargo las comandancias de aeropuerto que AFAC les determine expresamente. No añadimos los requisitos del artículo 7 Bis, que está fuera del alcance.\n\nTexto íntegro del artículo 7 (páginas 11, 12):\nArtículo 7. La Agencia Federal de Aviación Civil ejerce su autoridad en los aeropuertos, helipuertos y\naeródromos en general, a través de las personas designadas como comandantes regionales y\ncomandantes de aeropuerto.\nLos comandantes regionales deberán ser mexicanos por nacimiento que no adquieran otra\nnacionalidad, y en el ejercicio de sus atribuciones dependerán funcional y operativamente de la Agencia\nFederal de Aviación Civil.\nLos comandantes regionales tendrán a su cargo las comandancias de aeropuerto que expresamente\nles sean determinadas por la propia Agencia Federal de Aviación Civil, los cuales ejercerán las\natribuciones que a continuación se mencionan:\nI. Vigilar permanentemente que las personas concesionarias, asignatarias, permisionarias,\noperadoras de aeronaves y prestadoras de servicios a la navegación aérea cumplan con esta\nLey, sus reglamentos, normas oficiales mexicanas y demás disposiciones aplicables;\nI Bis. Autorizar la práctica de visitas de vigilancia a las personas proveedoras de servicios;\nII. Vigilar el cumplimiento de las disposiciones e instrucciones contenidas en el Manual de la\nAgencia Federal de Aviación Civil;\nIII. Vigilar el estricto cumplimiento de los deberes y responsabilidades de los Comandantes de\nAeropuerto;\nIV. Vigilar que el personal de las comandancias de aeropuerto de su región esté debidamente\ncapacitado para el desempeño de sus funciones;\nV. Vigilar la seguridad y eficiencia de las operaciones aeronáuticas;\nVI. Levantar actas administrativas por violaciones a lo previsto en esta Ley, sus reglamentos y\nnormas oficiales mexicanas; actuar como auxiliar del ministerio público; cumplimentar las\nresoluciones judiciales y coordinar sus actividades con las demás autoridades que ejerzan\nfunciones en los aeropuertos; y\nVII. Las demás que expresamente les sean conferidas por su superior jerárquico y se encuentren\nfundadas en la legislación vigente aplicable a la materia.",
          ],
          [
            "Vigilar y supervisar · I, I Bis, II–V",
            "Vigilan el cumplimiento de la Ley y disposiciones aplicables por concesionarias, asignatarias, permisionarias, operadoras y prestadoras de servicios a la navegación aérea. Autorizan visitas de vigilancia a proveedores de servicios. Vigilan el Manual de AFAC, los deberes de comandantes de aeropuerto, la capacitación del personal regional y la seguridad y eficiencia de las operaciones.\n\nTexto íntegro del artículo 7 (páginas 11, 12):\nArtículo 7. La Agencia Federal de Aviación Civil ejerce su autoridad en los aeropuertos, helipuertos y\naeródromos en general, a través de las personas designadas como comandantes regionales y\ncomandantes de aeropuerto.\nLos comandantes regionales deberán ser mexicanos por nacimiento que no adquieran otra\nnacionalidad, y en el ejercicio de sus atribuciones dependerán funcional y operativamente de la Agencia\nFederal de Aviación Civil.\nLos comandantes regionales tendrán a su cargo las comandancias de aeropuerto que expresamente\nles sean determinadas por la propia Agencia Federal de Aviación Civil, los cuales ejercerán las\natribuciones que a continuación se mencionan:\nI. Vigilar permanentemente que las personas concesionarias, asignatarias, permisionarias,\noperadoras de aeronaves y prestadoras de servicios a la navegación aérea cumplan con esta\nLey, sus reglamentos, normas oficiales mexicanas y demás disposiciones aplicables;\nI Bis. Autorizar la práctica de visitas de vigilancia a las personas proveedoras de servicios;\nII. Vigilar el cumplimiento de las disposiciones e instrucciones contenidas en el Manual de la\nAgencia Federal de Aviación Civil;\nIII. Vigilar el estricto cumplimiento de los deberes y responsabilidades de los Comandantes de\nAeropuerto;\nIV. Vigilar que el personal de las comandancias de aeropuerto de su región esté debidamente\ncapacitado para el desempeño de sus funciones;\nV. Vigilar la seguridad y eficiencia de las operaciones aeronáuticas;\nVI. Levantar actas administrativas por violaciones a lo previsto en esta Ley, sus reglamentos y\nnormas oficiales mexicanas; actuar como auxiliar del ministerio público; cumplimentar las\nresoluciones judiciales y coordinar sus actividades con las demás autoridades que ejerzan\nfunciones en los aeropuertos; y\nVII. Las demás que expresamente les sean conferidas por su superior jerárquico y se encuentren\nfundadas en la legislación vigente aplicable a la materia.",
          ],
          [
            "Actuar y coordinar · VI–VII",
            "Levantan actas administrativas por violaciones a la Ley, sus reglamentos y NOM; actúan como auxiliares del ministerio público; cumplen resoluciones judiciales y coordinan actividades con las demás autoridades de los aeropuertos. Las atribuciones adicionales deben ser expresamente conferidas por su superior y estar fundadas en la legislación aplicable.\n\nTexto íntegro del artículo 7 (páginas 11, 12):\nArtículo 7. La Agencia Federal de Aviación Civil ejerce su autoridad en los aeropuertos, helipuertos y\naeródromos en general, a través de las personas designadas como comandantes regionales y\ncomandantes de aeropuerto.\nLos comandantes regionales deberán ser mexicanos por nacimiento que no adquieran otra\nnacionalidad, y en el ejercicio de sus atribuciones dependerán funcional y operativamente de la Agencia\nFederal de Aviación Civil.\nLos comandantes regionales tendrán a su cargo las comandancias de aeropuerto que expresamente\nles sean determinadas por la propia Agencia Federal de Aviación Civil, los cuales ejercerán las\natribuciones que a continuación se mencionan:\nI. Vigilar permanentemente que las personas concesionarias, asignatarias, permisionarias,\noperadoras de aeronaves y prestadoras de servicios a la navegación aérea cumplan con esta\nLey, sus reglamentos, normas oficiales mexicanas y demás disposiciones aplicables;\nI Bis. Autorizar la práctica de visitas de vigilancia a las personas proveedoras de servicios;\nII. Vigilar el cumplimiento de las disposiciones e instrucciones contenidas en el Manual de la\nAgencia Federal de Aviación Civil;\nIII. Vigilar el estricto cumplimiento de los deberes y responsabilidades de los Comandantes de\nAeropuerto;\nIV. Vigilar que el personal de las comandancias de aeropuerto de su región esté debidamente\ncapacitado para el desempeño de sus funciones;\nV. Vigilar la seguridad y eficiencia de las operaciones aeronáuticas;\nVI. Levantar actas administrativas por violaciones a lo previsto en esta Ley, sus reglamentos y\nnormas oficiales mexicanas; actuar como auxiliar del ministerio público; cumplimentar las\nresoluciones judiciales y coordinar sus actividades con las demás autoridades que ejerzan\nfunciones en los aeropuertos; y\nVII. Las demás que expresamente les sean conferidas por su superior jerárquico y se encuentren\nfundadas en la legislación vigente aplicable a la materia.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "El 7 coordina el equipo",
        body: "Estas son agrupaciones para estudiar; las atribuciones legales siguen siendo las fracciones I–VII, incluida I Bis.",
        match: [
          ["Vigilar", "Cumplimiento, manual, deberes, capacitación y operaciones."],
          ["Autorizar", "Visitas de vigilancia a proveedores."],
          ["Actuar y coordinar", "Actas, auxilio, resoluciones judiciales y otras autoridades."],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "AFAC ejerce su autoridad también en helipuertos.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 7 lo incluye expresamente.",
          },
          {
            q: "Las atribuciones adicionales pueden carecer de fundamento legal.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "La fracción VII exige ese fundamento.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "AFAC asigna expresamente determinadas comandancias de aeropuerto a una persona comandante regional. ¿Coincide con el artículo?",
            options: ["Sí", "No"],
            answer: 0,
            why: "Art. 7: AFAC determina expresamente las comandancias a su cargo.",
          },
          {
            q: "Se propone una atribución adicional sin fundamento en legislación aplicable. ¿Basta la orden del superior?",
            options: ["Sí", "No"],
            answer: 1,
            why: "La fracción VII exige atribución expresa y fundamento en la legislación vigente aplicable.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Cómo ejerce AFAC autoridad en los aeródromos?",
            options: ["Solo por pilotos al mando", "Por comandantes regionales y de aeropuerto"],
            answer: 1,
            why: "Art. 7, primer párrafo.",
          },
          {
            q: "¿Quién depende funcional y operativamente de AFAC según este artículo?",
            options: ["Comandantes regionales", "Todos los pasajeros"],
            answer: 0,
            why: "Es el requisito expreso del segundo párrafo.",
          },
          {
            q: "Autorizar visitas de vigilancia aparece en…",
            options: ["La fracción I Bis del artículo 7", "Un artículo añadido al curso"],
            answer: 0,
            why: "Una fracción I Bis dentro del artículo 7 sí forma parte del artículo seleccionado.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Recuerda los requisitos y dependencia de comandantes regionales.",
            "Mexicanos por nacimiento que no adquieran otra nacionalidad; dependencia funcional y operativa de AFAC.",
          ],
          [
            "Menciona una función de vigilancia y dos de actuación o coordinación.",
            "Ejemplos: vigilar seguridad y eficiencia; levantar actas administrativas; cumplir resoluciones judiciales o coordinar con autoridades aeroportuarias.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "AFAC ejerce su autoridad mediante personas y funciones concretas. Aprende a reconocerlas.",
        recap: [["Fuente estudiada", "Ley de Aviación Civil · Artículo 7 · páginas 11, 12"]],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/servicio-de-transporte-aereo-art-17-bis-3": {
    id: "lac-03",
    folder: "03_Cabotaje",
    name: "Cabotaje",
    subtitle:
      "Una ruta con dos puntos en México no basta para decidir: observa quién opera, el servicio y dónde embarcaron.",
    year: "Ley de Aviación Civil",
    word: "LP 03",
    sources: ["17 Bis"],
    steps: [
      {
        label: "Despegue",
        title: "Cabotaje",
        body: "Una ruta con dos puntos en México no basta para decidir: observa quién opera, el servicio y dónde embarcaron.",
        hero: true,
        refs: ["Ley de Aviación Civil · Artículo 17 Bis · páginas 19"],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Dos prohibiciones expresas",
            "El artículo prohíbe las prácticas de cabotaje en territorio mexicano por permisionarios extranjeros. También las prohíbe a propietarios extranjeros de aeronaves no mexicanas destinadas a uso particular. Conserva todos los elementos de este segundo supuesto.\n\nTexto íntegro del artículo 17 Bis (páginas 19):\nArtículo 17 Bis. Las prácticas de cabotaje por parte de permisionarios extranjeros en territorio\nmexicano están prohibidas.\nLos propietarios extranjeros de aeronaves no mexicanas destinadas para uso particular tienen\nprohibido realizar prácticas de cabotaje.\nÚnicamente el permisionario mexicano que preste servicio de transporte aéreo internacional bajo la\nmodalidad de taxi aéreo o de fletamento puede transportar entre dos o más puntos en territorio nacional a\nlos pasajeros, carga, correo o una combinación de éstos que hayan embarcado en un punto en el\nextranjero.",
          ],
          [
            "Una situación permitida con condiciones",
            "Únicamente el permisionario mexicano que preste transporte aéreo internacional en modalidad de taxi aéreo o fletamento puede transportar entre dos o más puntos nacionales pasajeros, carga, correo o su combinación que hayan embarcado en un punto extranjero. Las cuatro pistas van juntas: mexicano + internacional + taxi/fletamento + embarque extranjero.\n\nTexto íntegro del artículo 17 Bis (páginas 19):\nArtículo 17 Bis. Las prácticas de cabotaje por parte de permisionarios extranjeros en territorio\nmexicano están prohibidas.\nLos propietarios extranjeros de aeronaves no mexicanas destinadas para uso particular tienen\nprohibido realizar prácticas de cabotaje.\nÚnicamente el permisionario mexicano que preste servicio de transporte aéreo internacional bajo la\nmodalidad de taxi aéreo o de fletamento puede transportar entre dos o más puntos en territorio nacional a\nlos pasajeros, carga, correo o una combinación de éstos que hayan embarcado en un punto en el\nextranjero.",
          ],
          [
            "Leer la ruta sin inventar permisos",
            "Extranjero → México A → México B permite visualizar el supuesto del tercer párrafo, si se cumplen todas sus condiciones. Si pasajeros nuevos embarcan en México A, ese párrafo no es fundamento para transportarlos a México B. El artículo no desarrolla una definición general de cabotaje ni todos los permisos de una operación internacional; no afirmamos que cualquier ruta internacional quede autorizada.\n\nTexto íntegro del artículo 17 Bis (páginas 19):\nArtículo 17 Bis. Las prácticas de cabotaje por parte de permisionarios extranjeros en territorio\nmexicano están prohibidas.\nLos propietarios extranjeros de aeronaves no mexicanas destinadas para uso particular tienen\nprohibido realizar prácticas de cabotaje.\nÚnicamente el permisionario mexicano que preste servicio de transporte aéreo internacional bajo la\nmodalidad de taxi aéreo o de fletamento puede transportar entre dos o más puntos en territorio nacional a\nlos pasajeros, carga, correo o una combinación de éstos que hayan embarcado en un punto en el\nextranjero.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Sigue el embarque, no solo el avión",
        body: "Memoria: M–I–T/F–E. Mexicano, Internacional, Taxi/Fletamento, Embarque extranjero. Todas las condiciones cuentan.",
        match: [
          ["Extranjero", "Aquí embarcan pasajeros, carga o correo."],
          [
            "México A",
            "Permisionario mexicano · servicio internacional de taxi aéreo o fletamento.",
          ],
          ["México B", "Continúa el transporte de quienes embarcaron en el extranjero."],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "El supuesto del tercer párrafo incluye correo y combinaciones de pasajeros, carga y correo.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Todos aparecen expresamente.",
          },
          {
            q: "Todo operador extranjero puede transportar entre puntos nacionales si antes vino del extranjero.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "El supuesto permitido identifica al permisionario mexicano y otras condiciones.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Permisionario mexicano, taxi aéreo internacional. Pasajeros embarcan en el extranjero y siguen entre dos puntos mexicanos.",
            options: ["Encaja en el tercer párrafo", "El tercer párrafo lo prohíbe"],
            answer: 0,
            why: "Art. 17 Bis: reúne operador, servicio, modalidad y origen de embarque.",
          },
          {
            q: "Mismo viaje, pero nuevos pasajeros suben en México A para ir a México B.",
            options: [
              "El tercer párrafo basta para ampararlos",
              "No encajan en el supuesto permitido de ese párrafo",
            ],
            answer: 1,
            why: "Esos pasajeros no embarcaron en el extranjero. No se evalúan otras posibles reglas.",
          },
          {
            q: "Un permisionario extranjero pretende realizar cabotaje en México.",
            options: ["Prohibido por el artículo", "Permitido por ser extranjero"],
            answer: 0,
            why: "Primer párrafo del art. 17 Bis.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Qué modalidades señala el supuesto permitido?",
            options: ["Toda modalidad", "Taxi aéreo o fletamento"],
            answer: 1,
            why: "Además exige transporte internacional y permisionario mexicano.",
          },
          {
            q: "¿Dónde deben haber embarcado los pasajeros o la carga del tercer párrafo?",
            options: ["En un punto extranjero", "En cualquier punto mexicano"],
            answer: 0,
            why: "El origen de embarque es una condición expresa.",
          },
          {
            q: "Propietario extranjero, aeronave no mexicana para uso particular: ¿puede realizar cabotaje?",
            options: ["No, el artículo lo prohíbe", "Sí, por ser particular"],
            answer: 0,
            why: "Art. 17 Bis, segundo párrafo.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Reconstruye las cuatro condiciones del supuesto permitido.",
            "Permisionario mexicano; transporte aéreo internacional; taxi aéreo o fletamento; pasajeros, carga o correo embarcados en un punto extranjero.",
          ],
          [
            "¿Por qué ver Extranjero → México → México no basta?",
            "La ruta no identifica por sí sola al permisionario, la modalidad del servicio ni el punto de embarque de lo transportado.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Una ruta con dos puntos en México no basta para decidir: observa quién opera, el servicio y dónde embarcaron.",
        recap: [["Fuente estudiada", "Ley de Aviación Civil · Artículo 17 Bis · páginas 19"]],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/operaciones-arts-32-a-34-4": {
    id: "lac-04",
    folder: "04_Operaciones",
    name: "Operaciones",
    subtitle:
      "Tres preguntas de pre-vuelo: qué llevas, quién puede abordar y qué debe regular AFAC.",
    year: "Ley de Aviación Civil",
    word: "LP 04",
    sources: ["32", "33", "34"],
    steps: [
      {
        label: "Despegue",
        title: "Operaciones",
        body: "Tres preguntas de pre-vuelo: qué llevas, quién puede abordar y qué debe regular AFAC.",
        hero: true,
        refs: [
          "Ley de Aviación Civil · Artículo 32 · páginas 23",
          "Ley de Aviación Civil · Artículo 33 · páginas 24",
          "Ley de Aviación Civil · Artículo 34 · páginas 24",
        ],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Qué debe ir a bordo",
            "Para realizar vuelos: información aeronáutica necesaria para las operaciones, póliza de seguro y certificados de aeronavegabilidad y matrícula vigentes o copia certificada de estos. Tener el certificado vigente no sustituye la exigencia de llevar a bordo lo indicado. El artículo también remite a otros documentos y equipos exigidos por la Ley y otras disposiciones; esta lista no los desarrolla.\n\nTexto íntegro del artículo 32 (páginas 23):\nArtículo 32. Toda aeronave, para realizar vuelos, debe llevar a bordo la información aeronáutica\nnecesaria para sus operaciones, la póliza de seguro, así como los certificados de aeronavegabilidad y de\nmatrícula vigentes o copia certificada de estos.\nLa obtención del certificado de aeronavegabilidad está sujeta a que se demuestre que la aeronave\ncumple con los estándares de aeronavegabilidad aceptados por la Agencia Federal de Aviación Civil, así\ncomo a las pruebas, al control técnico y a los requisitos de mantenimiento que establezcan los\nreglamentos, las normas oficiales mexicanas y demás disposiciones técnico-administrativas.\nLa vigencia del certificado de aeronavegabilidad es de dos años.\nLas aeronaves tienen que llevar a bordo los documentos y equipo que señalen esta Ley, sus\nreglamentos, las normas oficiales mexicanas, los tratados y demás disposiciones técnico-administrativas.\nLa Agencia Federal de Aviación Civil puede suspender o cancelar el certificado de aeronavegabilidad\npor incumplir los requerimientos y especificaciones mencionados en este artículo.\nSe otorgará el permiso de licencia de estación de la aeronave, que tendrá una vigencia indefinida,\nexcepto cuando hayan cambiado las características del equipo o la matrícula de la aeronave.",
          ],
          [
            "Vigencia y control",
            "El certificado de aeronavegabilidad dura dos años. Para obtenerlo deben demostrarse los estándares aceptados por AFAC y cumplirse pruebas, control técnico y mantenimiento establecidos en las normas remitidas. AFAC puede suspenderlo o cancelarlo por incumplimiento. El permiso de licencia de estación tiene vigencia indefinida, excepto si cambian las características del equipo o la matrícula.\n\nTexto íntegro del artículo 32 (páginas 23):\nArtículo 32. Toda aeronave, para realizar vuelos, debe llevar a bordo la información aeronáutica\nnecesaria para sus operaciones, la póliza de seguro, así como los certificados de aeronavegabilidad y de\nmatrícula vigentes o copia certificada de estos.\nLa obtención del certificado de aeronavegabilidad está sujeta a que se demuestre que la aeronave\ncumple con los estándares de aeronavegabilidad aceptados por la Agencia Federal de Aviación Civil, así\ncomo a las pruebas, al control técnico y a los requisitos de mantenimiento que establezcan los\nreglamentos, las normas oficiales mexicanas y demás disposiciones técnico-administrativas.\nLa vigencia del certificado de aeronavegabilidad es de dos años.\nLas aeronaves tienen que llevar a bordo los documentos y equipo que señalen esta Ley, sus\nreglamentos, las normas oficiales mexicanas, los tratados y demás disposiciones técnico-administrativas.\nLa Agencia Federal de Aviación Civil puede suspender o cancelar el certificado de aeronavegabilidad\npor incumplir los requerimientos y especificaciones mencionados en este artículo.\nSe otorgará el permiso de licencia de estación de la aeronave, que tendrá una vigencia indefinida,\nexcepto cuando hayan cambiado las características del equipo o la matrícula de la aeronave.",
          ],
          [
            "No aborda ≠ requiere autorización",
            "No pueden abordar personas armadas, en estado de ebriedad o bajo influjo de estupefacientes, psicotrópicos o enervantes. Cadáveres y personas cuya enfermedad implique riesgo para los demás pasajeros solo pueden transportarse con las autorizaciones correspondientes. No conviertas esta segunda categoría en prohibición absoluta.\n\nTexto íntegro del artículo 33 (páginas 24):\nArtículo 33. En las aeronaves civiles no podrán abordar personas armadas, en estado de ebriedad o\nbajo el influjo de estupefacientes, psicotrópicos o enervantes; y sólo con las autorizaciones\ncorrespondientes podrán transportarse cadáveres o personas que, por la naturaleza de su enfermedad,\npresenten riesgo para los demás pasajeros.\nLos menores de edad podrán viajar solos, bajo responsiva de sus padres o tutores.\nLas personas concesionarias, asignatarias y permisionarias deberán adoptar las medidas necesarias\nque permitan atender de manera adecuada a las personas con discapacidad, así como a las de edad\navanzada.\nLas personas concesionarias, asignatarias, permisionarias y operadoras aéreas deben realizar el\ntraslado de órganos, tejidos y células humanas, de conformidad con las disposiciones técnico-\nadministrativas que emita la Agencia Federal de Aviación Civil.",
          ],
          [
            "Menores, atención y traslados",
            "Los menores pueden viajar solos bajo responsiva de padres o tutores. Concesionarias, asignatarias y permisionarias deben adoptar medidas para atender adecuadamente a personas con discapacidad y de edad avanzada. Concesionarias, asignatarias, permisionarias y operadoras aéreas deben realizar el traslado de órganos, tejidos y células humanas conforme a disposiciones técnico-administrativas de AFAC. Discapacidad y edad avanzada no son motivos de prohibición en este artículo.\n\nTexto íntegro del artículo 33 (páginas 24):\nArtículo 33. En las aeronaves civiles no podrán abordar personas armadas, en estado de ebriedad o\nbajo el influjo de estupefacientes, psicotrópicos o enervantes; y sólo con las autorizaciones\ncorrespondientes podrán transportarse cadáveres o personas que, por la naturaleza de su enfermedad,\npresenten riesgo para los demás pasajeros.\nLos menores de edad podrán viajar solos, bajo responsiva de sus padres o tutores.\nLas personas concesionarias, asignatarias y permisionarias deberán adoptar las medidas necesarias\nque permitan atender de manera adecuada a las personas con discapacidad, así como a las de edad\navanzada.\nLas personas concesionarias, asignatarias, permisionarias y operadoras aéreas deben realizar el\ntraslado de órganos, tejidos y células humanas, de conformidad con las disposiciones técnico-\nadministrativas que emita la Agencia Federal de Aviación Civil.",
          ],
          [
            "Cuatro materias que AFAC debe regular",
            "AFAC debe regular el transporte aéreo de mercancías peligrosas, armas, municiones y explosivos, sin perjuicio de las atribuciones de otras dependencias federales ni de los tratados. Regular su transporte no equivale a permitir que una persona armada aborde. El artículo no proporciona procedimientos de embalaje, cantidades ni autorizaciones específicas.\n\nTexto íntegro del artículo 34 (páginas 24):\nArtículo 34. La Agencia Federal de Aviación Civil debe regular el transporte aéreo de mercancías\npeligrosas, así como de armas, municiones y explosivos, sin perjuicio de las atribuciones conferidas a\notras dependencias de la Administración Pública Federal y de lo dispuesto por los tratados.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Código 33 · detente y clasifica",
        body: "La puerta, la alerta 33 y el calcetín son una ayuda de memoria original: pregunta «¿puede entrar?». No son categorías legales. Órganos, tejidos y células tienen su propia regla de traslado.",
        match: [
          ["No aborda", "Personas armadas, ebrias o bajo el influjo de las sustancias señaladas."],
          ["Autorización", "Cadáveres o enfermedad que implique riesgo para otros pasajeros."],
          [
            "Responsiva / atención",
            "Menores solos: responsiva. Discapacidad y edad avanzada: atención adecuada.",
          ],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "El artículo 33 prohíbe a todos los menores viajar solos.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "Permite viajar solos bajo responsiva de padres o tutores.",
          },
          {
            q: "El artículo 34 detalla el embalaje de cada mercancía peligrosa.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "Establece la materia que AFAC debe regular; no desarrolla esos procedimientos.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Una persona está en estado de ebriedad. Según el art. 33…",
            options: ["No aborda", "Requiere autorización", "Puede viajar sola bajo responsiva"],
            answer: 0,
            why: "La ebriedad está en la categoría de quienes no pueden abordar.",
          },
          {
            q: "Una persona tiene una enfermedad que presenta riesgo para los demás pasajeros.",
            options: ["Prohibición absoluta", "Requiere las autorizaciones correspondientes"],
            answer: 1,
            why: "Art. 33: este supuesto se distingue de la prohibición del primer grupo.",
          },
          {
            q: "Una menor viaja sola bajo responsiva de su padre.",
            options: ["El artículo permite viajar así", "Está prohibido por ir sola"],
            answer: 0,
            why: "Art. 33, segundo párrafo: no exige acompañamiento en su texto.",
          },
          {
            q: "Los certificados están vigentes, pero no van a bordo ni se llevan sus copias certificadas.",
            options: ["Cumple el art. 32", "Falta cumplir la exigencia a bordo"],
            answer: 1,
            why: "Vigencia y presencia a bordo son condiciones distintas.",
          },
          {
            q: "Una persona de edad avanzada va a viajar.",
            options: ["La edad impide abordar", "Debe recibir atención adecuada"],
            answer: 1,
            why: "Art. 33: la edad avanzada se trata en el párrafo de atención, no como prohibición.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Cuánto dura el certificado de aeronavegabilidad según el art. 32?",
            options: ["Dos años", "Tres años", "Indefinidamente"],
            answer: 0,
            why: "No lo confundas con licencia del personal ni licencia de estación.",
          },
          {
            q: "¿La vigencia indefinida de la licencia de estación tiene excepciones?",
            options: ["No", "Sí: cambios del equipo o de matrícula"],
            answer: 1,
            why: "Art. 32, último párrafo.",
          },
          {
            q: "¿Qué regula AFAC en el art. 34?",
            options: ["Solo explosivos", "Mercancías peligrosas, armas, municiones y explosivos"],
            answer: 1,
            why: "El artículo preserva otras atribuciones federales y tratados.",
          },
          {
            q: "Órganos, tejidos y células humanas se trasladan conforme a…",
            options: ["Disposiciones técnico-administrativas de AFAC", "La regla de menores solos"],
            answer: 0,
            why: "Art. 33, último párrafo.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Sin mirar, reconstruye lo expresamente exigido a bordo en el primer párrafo del art. 32.",
            "Información aeronáutica necesaria; póliza de seguro; certificados de aeronavegabilidad y matrícula vigentes o copia certificada de estos.",
          ],
          [
            "Separa las cinco categorías del art. 33.",
            "Prohibición de abordar; transporte con autorizaciones; menores solos con responsiva; atención adecuada por discapacidad o edad avanzada; traslado de órganos, tejidos y células conforme a disposiciones AFAC.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Tres preguntas de pre-vuelo: qué llevas, quién puede abordar y qué debe regular AFAC.",
        recap: [
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 32 · páginas 23"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 33 · páginas 24"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 34 · páginas 24"],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/transito-aereo-arts-35-a-37-5": {
    id: "lac-05",
    folder: "05_Transito_Aereo",
    name: "Tránsito aéreo",
    subtitle: "Identifica el régimen de vuelo y conserva el alcance exacto de cada obligación.",
    year: "Ley de Aviación Civil",
    word: "LP 05",
    sources: ["35", "36", "37"],
    steps: [
      {
        label: "Despegue",
        title: "Tránsito aéreo",
        body: "Identifica el régimen de vuelo y conserva el alcance exacto de cada obligación.",
        hero: true,
        refs: [
          "Ley de Aviación Civil · Artículo 35 · páginas 25",
          "Ley de Aviación Civil · Artículo 36 · páginas 25",
          "Ley de Aviación Civil · Artículo 37 · páginas 25",
        ],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "IFR · vuelo por instrumentos",
            "Para navegación según reglas de vuelo por instrumentos es obligatorio usar servicios de tránsito aéreo, radioayudas, meteorología, telecomunicaciones e información aeronáutica, y los servicios de despacho e información de vuelos que preste la Secretaría o quien esté facultado por ella. También es obligatorio usar el sistema de aerovías indicado en la Publicación de Información Aeronáutica de México.\n\nTexto íntegro del artículo 35 (páginas 25):\nArtículo 35. De acuerdo con las reglas de vuelo por instrumentos, para la navegación en el espacio\naéreo, es obligatorio utilizar los servicios de tránsito aéreo, radioayudas, meteorología,\ntelecomunicaciones e información aeronáutica, así como los servicios de despacho e información de\nvuelos que preste la Secretaría o, en su caso, la persona facultada por esta. Asimismo, es obligatorio\nhacer uso del sistema de aerovías indicado en la Publicación de Información Aeronáutica de México.\nDe acuerdo con las reglas de vuelo visual, para la navegación en el espacio aéreo controlado, las\naeronaves deben establecer comunicación con Servicios a la Navegación en el Espacio Aéreo Mexicano\ny sujetarse al servicio de control de tránsito aéreo, conforme a lo establecido en esta Ley, sus\nreglamentos y demás disposiciones técnico-administrativas aplicables.",
          ],
          [
            "VFR · vuelo visual en espacio controlado",
            "En este supuesto las aeronaves deben establecer comunicación con Servicios a la Navegación en el Espacio Aéreo Mexicano y sujetarse al control de tránsito aéreo, conforme a la Ley y disposiciones aplicables. El párrafo no desarrolla las reglas de vuelo visual fuera de espacio controlado.\n\nTexto íntegro del artículo 35 (páginas 25):\nArtículo 35. De acuerdo con las reglas de vuelo por instrumentos, para la navegación en el espacio\naéreo, es obligatorio utilizar los servicios de tránsito aéreo, radioayudas, meteorología,\ntelecomunicaciones e información aeronáutica, así como los servicios de despacho e información de\nvuelos que preste la Secretaría o, en su caso, la persona facultada por esta. Asimismo, es obligatorio\nhacer uso del sistema de aerovías indicado en la Publicación de Información Aeronáutica de México.\nDe acuerdo con las reglas de vuelo visual, para la navegación en el espacio aéreo controlado, las\naeronaves deben establecer comunicación con Servicios a la Navegación en el Espacio Aéreo Mexicano\ny sujetarse al servicio de control de tránsito aéreo, conforme a lo establecido en esta Ley, sus\nreglamentos y demás disposiciones técnico-administrativas aplicables.",
          ],
          [
            "Zonas y servicios",
            "El Ejecutivo Federal puede establecer zonas prohibidas, restringidas o peligrosas por emergencia, seguridad pública o defensa nacional. El artículo no define los procedimientos de cada zona. Enumera servicios de tránsito aéreo, meteorología, cartografía, telecomunicaciones aeronáuticas, información aeronáutica, radioayudas, despacho e información de vuelo. Su finalidad: seguridad, regularidad y eficiencia de los vuelos.\n\nTexto íntegro del artículo 36 (páginas 25):\nArtículo 36. El Ejecutivo Federal, por razones de emergencia, seguridad pública o defensa nacional,\npodrá establecer zonas prohibidas, restringidas o peligrosas a la navegación aérea civil.\nLos servicios a la navegación aérea comprenden los de tránsito aéreo, meteorológica, cartografía,\ntelecomunicaciones aeronáuticas, servicios de información aeronáutica, radioayudas, despacho e\ninformación de vuelo. Dichos servicios tienen por objeto coadyuvar a la seguridad, regularidad y eficiencia\nde la operación de los vuelos.\nQueda prohibido a las aeronaves civiles realizar vuelos acrobáticos, de demostración y, en general,\nevoluciones de carácter peligroso sobre las ciudades y núcleos de población.\nLa Agencia Federal de Aviación Civil puede autorizar la realización de festivales aéreos, para lo cual\nseñalará las áreas donde estos deben llevarse a cabo.",
          ],
          [
            "Maniobras y festivales",
            "Las aeronaves civiles tienen prohibidos vuelos acrobáticos, de demostración y, en general, evoluciones peligrosas sobre ciudades y núcleos de población. AFAC puede autorizar festivales aéreos y señalar las áreas donde deban realizarse. No convierte todo lugar en apto para un festival.\n\nTexto íntegro del artículo 36 (páginas 25):\nArtículo 36. El Ejecutivo Federal, por razones de emergencia, seguridad pública o defensa nacional,\npodrá establecer zonas prohibidas, restringidas o peligrosas a la navegación aérea civil.\nLos servicios a la navegación aérea comprenden los de tránsito aéreo, meteorológica, cartografía,\ntelecomunicaciones aeronáuticas, servicios de información aeronáutica, radioayudas, despacho e\ninformación de vuelo. Dichos servicios tienen por objeto coadyuvar a la seguridad, regularidad y eficiencia\nde la operación de los vuelos.\nQueda prohibido a las aeronaves civiles realizar vuelos acrobáticos, de demostración y, en general,\nevoluciones de carácter peligroso sobre las ciudades y núcleos de población.\nLa Agencia Federal de Aviación Civil puede autorizar la realización de festivales aéreos, para lo cual\nseñalará las áreas donde estos deben llevarse a cabo.",
          ],
          [
            "El alcance para aeronaves militares",
            "Las operaciones militares sobre territorio nacional se sujetan a las disposiciones de tránsito aéreo de esta Ley, excepto en áreas restringidas para su operación exclusiva. Las infracciones se informan a Defensa o Marina según corresponda. Por seguridad nacional u orden público, la Secretaría coordina sus atribuciones de navegación con las autoridades civiles o militares correspondientes.\n\nTexto íntegro del artículo 37 (páginas 25):\nArtículo 37. Las operaciones de aeronaves militares en cualquier parte del espacio aéreo situado\nsobre el territorio nacional, a excepción de las áreas restringidas para su operación exclusiva, se\nsujetarán a las disposiciones de tránsito aéreo de esta Ley. En el caso de infracciones, se informará a las\nSecretarías de la Defensa y de Marina, según corresponda, para los efectos que procedan.\nPor razones de seguridad nacional o de orden público, la Secretaría ejercerá sus atribuciones\nrelativas a la navegación en el espacio aéreo en coordinación con las autoridades civiles o militares que\ncorrespondan.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "35 · dos columnas, dos supuestos",
        body: "Memoria: IFR = servicios + aerovías; VFR controlado = comunicar + sujetarse al control. Son resúmenes; conserva los servicios de la lista.",
        match: [
          ["IFR", "Servicios enumerados + sistema de aerovías de la PIA de México."],
          ["VFR controlado", "Comunicación con SENEAM + sujeción al control de tránsito aéreo."],
          ["36 → 37", "Zonas y seguridad de maniobras → alcance militar y coordinación."],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "El artículo 37 excluye a todas las operaciones militares de esta Ley en materia de tránsito aéreo.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "La excepción es para áreas restringidas de operación militar exclusiva.",
          },
          {
            q: "AFAC señala las áreas de los festivales aéreos que puede autorizar.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 36.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Vuelo visual dentro de espacio aéreo controlado. ¿Qué par identifica el art. 35?",
            options: [
              "Comunicar con SENEAM y sujetarse al control",
              "Ninguna comunicación por ser visual",
            ],
            answer: 0,
            why: "Es la condición concreta del segundo párrafo.",
          },
          {
            q: "Se proponen acrobacias civiles sobre un núcleo de población.",
            options: ["Prohibidas por el art. 36", "Permitidas por ser vuelo civil"],
            answer: 0,
            why: "El artículo prohíbe estas maniobras sobre ciudades y núcleos de población.",
          },
          {
            q: "Operación militar en un área restringida para su operación exclusiva.",
            options: ["El art. 37 incluye una excepción", "No existe excepción en el artículo"],
            answer: 0,
            why: "La excepción está expresamente delimitada a esas áreas.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Quién puede establecer zonas por emergencia, seguridad pública o defensa nacional?",
            options: ["Ejecutivo Federal", "Cualquier piloto"],
            answer: 0,
            why: "Art. 36.",
          },
          {
            q: "En IFR, ¿se exige el sistema de aerovías de la PIA de México?",
            options: ["Sí", "No"],
            answer: 0,
            why: "Art. 35, primer párrafo.",
          },
          {
            q: "¿Quién puede autorizar festivales aéreos y señalar sus áreas?",
            options: ["AFAC", "El público asistente"],
            answer: 0,
            why: "Art. 36, último párrafo.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Reconstruye las obligaciones VFR del art. 35 con su condición de espacio aéreo.",
            "En vuelo visual dentro del espacio aéreo controlado: comunicación con SENEAM y sujeción al servicio de control de tránsito aéreo.",
          ],
          [
            "Recuerda las tres finalidades de los servicios del art. 36.",
            "Coadyuvar a la seguridad, regularidad y eficiencia de la operación de los vuelos.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Identifica el régimen de vuelo y conserva el alcance exacto de cada obligación.",
        recap: [
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 35 · páginas 25"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 36 · páginas 25"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 37 · páginas 25"],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/personal-tecnico-aeronautico-art-38-6": {
    id: "lac-06",
    folder: "06_Personal_Tecnico_Aeronautico",
    name: "Personal técnico-aeronáutico",
    subtitle:
      "Una licencia y un certificado de aptitud psicofísica cumplen funciones distintas. Ambos deben estar vigentes para ejercer.",
    year: "Ley de Aviación Civil",
    word: "LP 06",
    sources: ["38"],
    steps: [
      {
        label: "Despegue",
        title: "Personal técnico-aeronáutico",
        body: "Una licencia y un certificado de aptitud psicofísica cumplen funciones distintas. Ambos deben estar vigentes para ejercer.",
        hero: true,
        refs: ["Ley de Aviación Civil · Artículo 38 · páginas 25, 26"],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Quién integra el personal",
            "Lo integran el personal de vuelo que interviene directamente en la operación y el personal de tierra cuyas funciones determine el reglamento. Debe ser mexicano por nacimiento, no adquirir otra nacionalidad y contar con las licencias respectivas. No desarrollamos las funciones de tierra remitidas al reglamento.\n\nTexto íntegro del artículo 38 (páginas 25, 26):\nArtículo 38. El personal técnico-aeronáutico está constituido por el personal de vuelo que interviene\ndirectamente en la operación de la aeronave y por el personal de tierra, cuyas funciones se especifiquen\nen el reglamento correspondiente. Dicho personal debe, además de ser mexicano por nacimiento, no\nadquirir otra nacionalidad y contar con las licencias respectivas.\nPara la operación de aeronaves de uso particular, las personas nacionales y extranjeras que las\npiloten pueden solicitar a la Agencia Federal de Aviación Civil la convalidación u obtención de la licencia\nde piloto privado, previo cumplimiento de los reglamentos correspondientes y de las disposiciones\ntécnico-administrativas respectivas.\nLa vigencia de las licencias del personal técnico aeronáutico será de tres años, salvo que:\nI. Se solicite la obtención de una licencia cuando previamente haya sido suspendida o cancelada\nuna anterior, caso en el que su vigencia será de un año, transcurrido el cual, de mediar una\nnueva solicitud, la Agencia Federal de Aviación Civil determinará, si conforme al cumplimiento\ndel interesado en el uso de la licencia, se le otorga por dos años o nuevamente por un año, o\nII. Se trate de la convalidación de licencia, cuya vigencia no podrá exceder de aquella otorgada\npor la Autoridad de Aviación Civil Extranjera.\nPara que el personal técnico-aeronáutico pueda dedicarse al ejercicio de su actividad, deberá\nacreditar ante la Agencia Federal de Aviación Civil ser titular de una licencia vigente expedida por esta y\ncontar con el certificado de aptitud psicofísica vigente correspondiente a su actividad.\nTerminada la vigencia del certificado de aptitud psicofísica, el interesado tiene treinta días naturales\npara solicitar su renovación, sin que esto implique el vencimiento de la respectiva licencia o autorización,\nperiodo en el cual no puede ejercer su actividad como personal técnico-aeronáutico.\nLa obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos,\nautorizaciones, capacidades de vuelo y certificados de capacidad del personal técnico-aeronáutico se\nrealizarán de conformidad con el reglamento correspondiente y con las disposiciones técnico-\nadministrativas emitidas por la Agencia Federal de Aviación Civil.\nEl personal técnico-aeronáutico de vuelo debe reportar a la Agencia Federal de Aviación Civil las\nincapacitaciones que les ocurran dentro de las veinticuatro horas siguientes al suceso.\nEl personal técnico-aeronáutico y las personas aspirantes a obtener un permiso de formación como\npersonal técnico-aeronáutico deben firmar y presentar al personal médico examinador o personal médico\nexaminador autorizado una declaración de salud, de conformidad con lo establecido en el reglamento\ncorrespondiente y las disposiciones técnico-administrativas emitidas para tal efecto.",
          ],
          [
            "Uso particular y licencia privada",
            "Para pilotar aeronaves de uso particular, nacionales y extranjeros pueden solicitar a AFAC la convalidación u obtención de licencia de piloto privado, previo cumplimiento de reglamentos y disposiciones técnico-administrativas. Poder solicitarla no significa que se otorgue automáticamente.\n\nTexto íntegro del artículo 38 (páginas 25, 26):\nArtículo 38. El personal técnico-aeronáutico está constituido por el personal de vuelo que interviene\ndirectamente en la operación de la aeronave y por el personal de tierra, cuyas funciones se especifiquen\nen el reglamento correspondiente. Dicho personal debe, además de ser mexicano por nacimiento, no\nadquirir otra nacionalidad y contar con las licencias respectivas.\nPara la operación de aeronaves de uso particular, las personas nacionales y extranjeras que las\npiloten pueden solicitar a la Agencia Federal de Aviación Civil la convalidación u obtención de la licencia\nde piloto privado, previo cumplimiento de los reglamentos correspondientes y de las disposiciones\ntécnico-administrativas respectivas.\nLa vigencia de las licencias del personal técnico aeronáutico será de tres años, salvo que:\nI. Se solicite la obtención de una licencia cuando previamente haya sido suspendida o cancelada\nuna anterior, caso en el que su vigencia será de un año, transcurrido el cual, de mediar una\nnueva solicitud, la Agencia Federal de Aviación Civil determinará, si conforme al cumplimiento\ndel interesado en el uso de la licencia, se le otorga por dos años o nuevamente por un año, o\nII. Se trate de la convalidación de licencia, cuya vigencia no podrá exceder de aquella otorgada\npor la Autoridad de Aviación Civil Extranjera.\nPara que el personal técnico-aeronáutico pueda dedicarse al ejercicio de su actividad, deberá\nacreditar ante la Agencia Federal de Aviación Civil ser titular de una licencia vigente expedida por esta y\ncontar con el certificado de aptitud psicofísica vigente correspondiente a su actividad.\nTerminada la vigencia del certificado de aptitud psicofísica, el interesado tiene treinta días naturales\npara solicitar su renovación, sin que esto implique el vencimiento de la respectiva licencia o autorización,\nperiodo en el cual no puede ejercer su actividad como personal técnico-aeronáutico.\nLa obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos,\nautorizaciones, capacidades de vuelo y certificados de capacidad del personal técnico-aeronáutico se\nrealizarán de conformidad con el reglamento correspondiente y con las disposiciones técnico-\nadministrativas emitidas por la Agencia Federal de Aviación Civil.\nEl personal técnico-aeronáutico de vuelo debe reportar a la Agencia Federal de Aviación Civil las\nincapacitaciones que les ocurran dentro de las veinticuatro horas siguientes al suceso.\nEl personal técnico-aeronáutico y las personas aspirantes a obtener un permiso de formación como\npersonal técnico-aeronáutico deben firmar y presentar al personal médico examinador o personal médico\nexaminador autorizado una declaración de salud, de conformidad con lo establecido en el reglamento\ncorrespondiente y las disposiciones técnico-administrativas emitidas para tal efecto.",
          ],
          [
            "Tres años, con situaciones especiales",
            "Regla: licencia por tres años. Si se obtiene una licencia después de suspensión o cancelación de una anterior, dura un año. Después, con nueva solicitud, AFAC decide según el cumplimiento si otorga dos años o nuevamente uno. Una convalidación no puede exceder la vigencia otorgada por la autoridad extranjera.\n\nTexto íntegro del artículo 38 (páginas 25, 26):\nArtículo 38. El personal técnico-aeronáutico está constituido por el personal de vuelo que interviene\ndirectamente en la operación de la aeronave y por el personal de tierra, cuyas funciones se especifiquen\nen el reglamento correspondiente. Dicho personal debe, además de ser mexicano por nacimiento, no\nadquirir otra nacionalidad y contar con las licencias respectivas.\nPara la operación de aeronaves de uso particular, las personas nacionales y extranjeras que las\npiloten pueden solicitar a la Agencia Federal de Aviación Civil la convalidación u obtención de la licencia\nde piloto privado, previo cumplimiento de los reglamentos correspondientes y de las disposiciones\ntécnico-administrativas respectivas.\nLa vigencia de las licencias del personal técnico aeronáutico será de tres años, salvo que:\nI. Se solicite la obtención de una licencia cuando previamente haya sido suspendida o cancelada\nuna anterior, caso en el que su vigencia será de un año, transcurrido el cual, de mediar una\nnueva solicitud, la Agencia Federal de Aviación Civil determinará, si conforme al cumplimiento\ndel interesado en el uso de la licencia, se le otorga por dos años o nuevamente por un año, o\nII. Se trate de la convalidación de licencia, cuya vigencia no podrá exceder de aquella otorgada\npor la Autoridad de Aviación Civil Extranjera.\nPara que el personal técnico-aeronáutico pueda dedicarse al ejercicio de su actividad, deberá\nacreditar ante la Agencia Federal de Aviación Civil ser titular de una licencia vigente expedida por esta y\ncontar con el certificado de aptitud psicofísica vigente correspondiente a su actividad.\nTerminada la vigencia del certificado de aptitud psicofísica, el interesado tiene treinta días naturales\npara solicitar su renovación, sin que esto implique el vencimiento de la respectiva licencia o autorización,\nperiodo en el cual no puede ejercer su actividad como personal técnico-aeronáutico.\nLa obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos,\nautorizaciones, capacidades de vuelo y certificados de capacidad del personal técnico-aeronáutico se\nrealizarán de conformidad con el reglamento correspondiente y con las disposiciones técnico-\nadministrativas emitidas por la Agencia Federal de Aviación Civil.\nEl personal técnico-aeronáutico de vuelo debe reportar a la Agencia Federal de Aviación Civil las\nincapacitaciones que les ocurran dentro de las veinticuatro horas siguientes al suceso.\nEl personal técnico-aeronáutico y las personas aspirantes a obtener un permiso de formación como\npersonal técnico-aeronáutico deben firmar y presentar al personal médico examinador o personal médico\nexaminador autorizado una declaración de salud, de conformidad con lo establecido en el reglamento\ncorrespondiente y las disposiciones técnico-administrativas emitidas para tal efecto.",
          ],
          [
            "Los 30 días no autorizan a ejercer",
            "Para ejercer se acredita ante AFAC licencia vigente expedida por ella y certificado de aptitud psicofísica vigente de la actividad. Al terminar la vigencia del certificado hay treinta días naturales para solicitar renovación. Eso no vence la licencia o autorización, pero durante ese periodo no se puede ejercer.\n\nTexto íntegro del artículo 38 (páginas 25, 26):\nArtículo 38. El personal técnico-aeronáutico está constituido por el personal de vuelo que interviene\ndirectamente en la operación de la aeronave y por el personal de tierra, cuyas funciones se especifiquen\nen el reglamento correspondiente. Dicho personal debe, además de ser mexicano por nacimiento, no\nadquirir otra nacionalidad y contar con las licencias respectivas.\nPara la operación de aeronaves de uso particular, las personas nacionales y extranjeras que las\npiloten pueden solicitar a la Agencia Federal de Aviación Civil la convalidación u obtención de la licencia\nde piloto privado, previo cumplimiento de los reglamentos correspondientes y de las disposiciones\ntécnico-administrativas respectivas.\nLa vigencia de las licencias del personal técnico aeronáutico será de tres años, salvo que:\nI. Se solicite la obtención de una licencia cuando previamente haya sido suspendida o cancelada\nuna anterior, caso en el que su vigencia será de un año, transcurrido el cual, de mediar una\nnueva solicitud, la Agencia Federal de Aviación Civil determinará, si conforme al cumplimiento\ndel interesado en el uso de la licencia, se le otorga por dos años o nuevamente por un año, o\nII. Se trate de la convalidación de licencia, cuya vigencia no podrá exceder de aquella otorgada\npor la Autoridad de Aviación Civil Extranjera.\nPara que el personal técnico-aeronáutico pueda dedicarse al ejercicio de su actividad, deberá\nacreditar ante la Agencia Federal de Aviación Civil ser titular de una licencia vigente expedida por esta y\ncontar con el certificado de aptitud psicofísica vigente correspondiente a su actividad.\nTerminada la vigencia del certificado de aptitud psicofísica, el interesado tiene treinta días naturales\npara solicitar su renovación, sin que esto implique el vencimiento de la respectiva licencia o autorización,\nperiodo en el cual no puede ejercer su actividad como personal técnico-aeronáutico.\nLa obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos,\nautorizaciones, capacidades de vuelo y certificados de capacidad del personal técnico-aeronáutico se\nrealizarán de conformidad con el reglamento correspondiente y con las disposiciones técnico-\nadministrativas emitidas por la Agencia Federal de Aviación Civil.\nEl personal técnico-aeronáutico de vuelo debe reportar a la Agencia Federal de Aviación Civil las\nincapacitaciones que les ocurran dentro de las veinticuatro horas siguientes al suceso.\nEl personal técnico-aeronáutico y las personas aspirantes a obtener un permiso de formación como\npersonal técnico-aeronáutico deben firmar y presentar al personal médico examinador o personal médico\nexaminador autorizado una declaración de salud, de conformidad con lo establecido en el reglamento\ncorrespondiente y las disposiciones técnico-administrativas emitidas para tal efecto.",
          ],
          [
            "Reportar y declarar",
            "El personal técnico-aeronáutico de vuelo reporta a AFAC las incapacitaciones dentro de las veinticuatro horas siguientes al suceso. El personal y aspirantes al permiso de formación firman y presentan una declaración de salud al personal médico examinador o autorizado. Los trámites de obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos, autorizaciones, capacidades de vuelo y certificados de capacidad se rigen por las disposiciones remitidas, que no se desarrollan aquí.\n\nTexto íntegro del artículo 38 (páginas 25, 26):\nArtículo 38. El personal técnico-aeronáutico está constituido por el personal de vuelo que interviene\ndirectamente en la operación de la aeronave y por el personal de tierra, cuyas funciones se especifiquen\nen el reglamento correspondiente. Dicho personal debe, además de ser mexicano por nacimiento, no\nadquirir otra nacionalidad y contar con las licencias respectivas.\nPara la operación de aeronaves de uso particular, las personas nacionales y extranjeras que las\npiloten pueden solicitar a la Agencia Federal de Aviación Civil la convalidación u obtención de la licencia\nde piloto privado, previo cumplimiento de los reglamentos correspondientes y de las disposiciones\ntécnico-administrativas respectivas.\nLa vigencia de las licencias del personal técnico aeronáutico será de tres años, salvo que:\nI. Se solicite la obtención de una licencia cuando previamente haya sido suspendida o cancelada\nuna anterior, caso en el que su vigencia será de un año, transcurrido el cual, de mediar una\nnueva solicitud, la Agencia Federal de Aviación Civil determinará, si conforme al cumplimiento\ndel interesado en el uso de la licencia, se le otorga por dos años o nuevamente por un año, o\nII. Se trate de la convalidación de licencia, cuya vigencia no podrá exceder de aquella otorgada\npor la Autoridad de Aviación Civil Extranjera.\nPara que el personal técnico-aeronáutico pueda dedicarse al ejercicio de su actividad, deberá\nacreditar ante la Agencia Federal de Aviación Civil ser titular de una licencia vigente expedida por esta y\ncontar con el certificado de aptitud psicofísica vigente correspondiente a su actividad.\nTerminada la vigencia del certificado de aptitud psicofísica, el interesado tiene treinta días naturales\npara solicitar su renovación, sin que esto implique el vencimiento de la respectiva licencia o autorización,\nperiodo en el cual no puede ejercer su actividad como personal técnico-aeronáutico.\nLa obtención, revalidación, recuperación, reposición y convalidación de licencias, permisos,\nautorizaciones, capacidades de vuelo y certificados de capacidad del personal técnico-aeronáutico se\nrealizarán de conformidad con el reglamento correspondiente y con las disposiciones técnico-\nadministrativas emitidas por la Agencia Federal de Aviación Civil.\nEl personal técnico-aeronáutico de vuelo debe reportar a la Agencia Federal de Aviación Civil las\nincapacitaciones que les ocurran dentro de las veinticuatro horas siguientes al suceso.\nEl personal técnico-aeronáutico y las personas aspirantes a obtener un permiso de formación como\npersonal técnico-aeronáutico deben firmar y presentar al personal médico examinador o personal médico\nexaminador autorizado una declaración de salud, de conformidad con lo establecido en el reglamento\ncorrespondiente y las disposiciones técnico-administrativas emitidas para tal efecto.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Dos documentos · cuatro relojes",
        body: "No mezcles el reloj de la licencia con el del certificado médico. El artículo no fija aquí una duración general del certificado de aptitud psicofísica.",
        match: [
          ["3 años", "Vigencia general de licencia; revisa las excepciones."],
          [
            "1 año → 2 o 1",
            "Licencia tras una anterior suspendida/cancelada; nueva solicitud y decisión de AFAC.",
          ],
          ["30 días naturales", "Para solicitar renovación del certificado vencido; sin ejercer."],
          ["24 horas", "Reporte de incapacitaciones del personal de vuelo a AFAC."],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "Que venza el certificado implica por sí mismo que venza la licencia.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "El artículo separa esos vencimientos, aunque impide ejercer durante el periodo indicado.",
          },
          {
            q: "La licencia convalidada no puede exceder la vigencia de la autoridad extranjera.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 38, fracción II.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Licencia vigente, certificado psicofísico vencido ayer. ¿Puede ejercer durante los 30 días para solicitar renovación?",
            options: ["Sí", "No"],
            answer: 1,
            why: "Art. 38: durante ese periodo no puede ejercer.",
          },
          {
            q: "La autoridad extranjera dio una vigencia menor a tres años. ¿La convalidación puede rebasarla?",
            options: ["Sí, siempre dura tres años", "No puede exceder esa vigencia"],
            answer: 1,
            why: "Es la segunda excepción a la vigencia general.",
          },
          {
            q: "Una incapacitación ocurrió hace unas horas a personal de vuelo. ¿Qué deber aparece?",
            options: ["Reportar a AFAC dentro de 24 horas", "Esperar a la renovación"],
            answer: 0,
            why: "El plazo se cuenta desde el suceso.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿La renovación del certificado vencido puede solicitarse dentro de…?",
            options: ["30 días naturales", "30 días hábiles"],
            answer: 0,
            why: "El artículo dice naturales.",
          },
          {
            q: "Después del primer año de la licencia especial, ¿dos años son automáticos?",
            options: ["Sí", "No, AFAC decide con nueva solicitud y según cumplimiento"],
            answer: 1,
            why: "Puede otorgar dos años o nuevamente uno.",
          },
          {
            q: "¿La declaración de salud alcanza a aspirantes al permiso de formación?",
            options: ["Sí", "No"],
            answer: 0,
            why: "El último párrafo los incluye expresamente.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Escribe las dos condiciones documentales para ejercer.",
            "Licencia vigente expedida por AFAC y certificado de aptitud psicofísica vigente correspondiente a la actividad, acreditados ante AFAC.",
          ],
          [
            "Explica qué significan 30 días y 24 horas.",
            "30 días naturales para solicitar renovación del certificado vencido, sin ejercer; 24 horas desde el suceso para reportar incapacitaciones del personal técnico-aeronáutico de vuelo a AFAC.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Una licencia y un certificado de aptitud psicofísica cumplen funciones distintas. Ambos deben estar vigentes para ejercer.",
        recap: [["Fuente estudiada", "Ley de Aviación Civil · Artículo 38 · páginas 25, 26"]],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/comandante-de-la-aeronave-arts-40-a-41-7": {
    id: "lac-07",
    folder: "07_Comandante_y_Piloto_al_Mando",
    name: "Comandante y piloto al mando",
    subtitle:
      "La autoridad a bordo tiene un responsable y una ventana de responsabilidad que no termina al tocar pista.",
    year: "Ley de Aviación Civil",
    word: "LP 07",
    sources: ["40", "41"],
    steps: [
      {
        label: "Despegue",
        title: "Comandante y piloto al mando",
        body: "La autoridad a bordo tiene un responsable y una ventana de responsabilidad que no termina al tocar pista.",
        hero: true,
        refs: [
          "Ley de Aviación Civil · Artículo 40 · páginas 27",
          "Ley de Aviación Civil · Artículo 41 · páginas 27",
        ],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Máxima autoridad a bordo",
            "Toda aeronave debe tener comandante o piloto al mando, máxima autoridad a bordo, responsable de operación, dirección, orden y seguridad de aeronave, tripulantes, pasajeros, equipaje, carga y correo. En servicio al público, el comandante debe ser mexicano por nacimiento sin adquirir otra nacionalidad y estar en pleno goce y ejercicio de sus derechos civiles y políticos.\n\nTexto íntegro del artículo 40 (páginas 27):\nArtículo 40.- Toda aeronave deberá contar con un comandante o piloto al mando, quien será la\nmáxima autoridad a bordo y el responsable de su operación y dirección y de mantener el orden y la\nseguridad de la aeronave, de los tripulantes, pasajeros, equipaje, carga y correo. El comandante de las\naeronaves de servicio al público deberá ser mexicano por nacimiento que no adquiera otra nacionalidad y\nestar en pleno goce y ejercicio de sus derechos civiles y políticos.\nLa persona comandante de la aeronave será designada por la persona concesionaria, asignataria o\npermisionaria, y en el caso de la operación de aeronaves para uso particular, por la persona propietaria o\nposeedora de la aeronave, para suplir la ausencia o incapacidad de esta durante el vuelo, se seguirá el\norden jerárquico de designación de la tripulación hecha por aquellas.\nEn casos de emergencia o por razones de seguridad, el comandante o el piloto que lo sustituya,\nactuará en nombre de quien lo designó y tomará las decisiones pertinentes.\nToda persona a bordo está obligada a acatar las instrucciones del comandante para la seguridad y\noperación de la aeronave.\nEl comandante registrará en el libro de bitácora los hechos que puedan tener consecuencias legales,\nocurridos durante el vuelo, y los pondrá en conocimiento de las autoridades competentes del primer lugar\nde aterrizaje en el territorio nacional, o de las autoridades competentes y del cónsul mexicano, si el\naterrizaje se realiza en el extranjero.",
          ],
          [
            "Designación y emergencia",
            "Designa la concesionaria, asignataria o permisionaria; para uso particular, la propietaria o poseedora. Ante ausencia o incapacidad durante el vuelo se sigue el orden jerárquico de la tripulación que hayan designado. En emergencia o por seguridad, el comandante o sustituto actúa en nombre de quien lo designó y toma las decisiones pertinentes. Toda persona a bordo acata sus instrucciones para seguridad y operación.\n\nTexto íntegro del artículo 40 (páginas 27):\nArtículo 40.- Toda aeronave deberá contar con un comandante o piloto al mando, quien será la\nmáxima autoridad a bordo y el responsable de su operación y dirección y de mantener el orden y la\nseguridad de la aeronave, de los tripulantes, pasajeros, equipaje, carga y correo. El comandante de las\naeronaves de servicio al público deberá ser mexicano por nacimiento que no adquiera otra nacionalidad y\nestar en pleno goce y ejercicio de sus derechos civiles y políticos.\nLa persona comandante de la aeronave será designada por la persona concesionaria, asignataria o\npermisionaria, y en el caso de la operación de aeronaves para uso particular, por la persona propietaria o\nposeedora de la aeronave, para suplir la ausencia o incapacidad de esta durante el vuelo, se seguirá el\norden jerárquico de designación de la tripulación hecha por aquellas.\nEn casos de emergencia o por razones de seguridad, el comandante o el piloto que lo sustituya,\nactuará en nombre de quien lo designó y tomará las decisiones pertinentes.\nToda persona a bordo está obligada a acatar las instrucciones del comandante para la seguridad y\noperación de la aeronave.\nEl comandante registrará en el libro de bitácora los hechos que puedan tener consecuencias legales,\nocurridos durante el vuelo, y los pondrá en conocimiento de las autoridades competentes del primer lugar\nde aterrizaje en el territorio nacional, o de las autoridades competentes y del cónsul mexicano, si el\naterrizaje se realiza en el extranjero.",
          ],
          [
            "Bitácora y aviso",
            "El comandante registra hechos ocurridos durante el vuelo que puedan tener consecuencias legales. Los comunica a autoridades competentes del primer aterrizaje en territorio nacional; si aterriza en el extranjero, a las autoridades competentes y al cónsul mexicano. Registrar no sustituye informar.\n\nTexto íntegro del artículo 40 (páginas 27):\nArtículo 40.- Toda aeronave deberá contar con un comandante o piloto al mando, quien será la\nmáxima autoridad a bordo y el responsable de su operación y dirección y de mantener el orden y la\nseguridad de la aeronave, de los tripulantes, pasajeros, equipaje, carga y correo. El comandante de las\naeronaves de servicio al público deberá ser mexicano por nacimiento que no adquiera otra nacionalidad y\nestar en pleno goce y ejercicio de sus derechos civiles y políticos.\nLa persona comandante de la aeronave será designada por la persona concesionaria, asignataria o\npermisionaria, y en el caso de la operación de aeronaves para uso particular, por la persona propietaria o\nposeedora de la aeronave, para suplir la ausencia o incapacidad de esta durante el vuelo, se seguirá el\norden jerárquico de designación de la tripulación hecha por aquellas.\nEn casos de emergencia o por razones de seguridad, el comandante o el piloto que lo sustituya,\nactuará en nombre de quien lo designó y tomará las decisiones pertinentes.\nToda persona a bordo está obligada a acatar las instrucciones del comandante para la seguridad y\noperación de la aeronave.\nEl comandante registrará en el libro de bitácora los hechos que puedan tener consecuencias legales,\nocurridos durante el vuelo, y los pondrá en conocimiento de las autoridades competentes del primer lugar\nde aterrizaje en el territorio nacional, o de las autoridades competentes y del cónsul mexicano, si el\naterrizaje se realiza en el extranjero.",
          ],
          [
            "El inicio y el cierre exactos",
            "La responsabilidad de operación y seguridad empieza cuando aborda para preparar el vuelo. Se extiende hasta que, al finalizar el vuelo en plataforma, la aeronave se detiene por completo, se apagan los motores de propulsión principal y se entrega a la representante de la concesionaria, asignataria o permisionaria; para uso particular, a la representante de la propietaria o poseedora. Aterrizar por sí solo no cierra esta ventana.\n\nTexto íntegro del artículo 41 (páginas 27):\nArtículo 41. La persona piloto al mando de la aeronave es responsable de la operación y seguridad\nde la misma desde que la aborda para la preparación del vuelo hasta que se detiene por completo, al\nfinalizar el vuelo en la plataforma, se apagan los motores utilizados como unidad de propulsión principal y\nse entrega la aeronave a la representante de la concesionaria, asignataria o permisionaria y, en el caso\nde las operaciones de aeronaves para uso particular, a la representante de la persona propietaria o\nposeedora de la misma.\nLas personas concesionarias, asignatarias, permisionarias y operadoras aéreas son responsables\nsolidarias con la persona comandante o piloto al mando por cualquier orden dictada en contravención a lo\ndispuesto por esta Ley, sus reglamentos, normas oficiales mexicanas y por las disposiciones técnico-\nadministrativas correspondientes. Para el caso de las operaciones de aeronaves para uso particular, la\npersona comandante o piloto al mando es responsable solidaria con la propietaria o poseedora de la\naeronave.",
          ],
          [
            "Responsabilidad solidaria",
            "Concesionarias, asignatarias, permisionarias y operadoras aéreas son responsables solidarias con el comandante o piloto al mando por órdenes contrarias a la Ley y las disposiciones enumeradas. Para uso particular, el texto establece responsabilidad solidaria del comandante o piloto al mando con la propietaria o poseedora. No desarrollamos sus efectos patrimoniales fuera del artículo.\n\nTexto íntegro del artículo 41 (páginas 27):\nArtículo 41. La persona piloto al mando de la aeronave es responsable de la operación y seguridad\nde la misma desde que la aborda para la preparación del vuelo hasta que se detiene por completo, al\nfinalizar el vuelo en la plataforma, se apagan los motores utilizados como unidad de propulsión principal y\nse entrega la aeronave a la representante de la concesionaria, asignataria o permisionaria y, en el caso\nde las operaciones de aeronaves para uso particular, a la representante de la persona propietaria o\nposeedora de la misma.\nLas personas concesionarias, asignatarias, permisionarias y operadoras aéreas son responsables\nsolidarias con la persona comandante o piloto al mando por cualquier orden dictada en contravención a lo\ndispuesto por esta Ley, sus reglamentos, normas oficiales mexicanas y por las disposiciones técnico-\nadministrativas correspondientes. Para el caso de las operaciones de aeronaves para uso particular, la\npersona comandante o piloto al mando es responsable solidaria con la propietaria o poseedora de la\naeronave.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "La responsabilidad no aterriza antes que tú",
        body: "Recuerda A–D–M–E: Aborda; Detención; Motores; Entrega. El cierre exige las condiciones completas del artículo 41.",
        match: [
          ["Aborda para preparar", "Aquí comienza la responsabilidad."],
          ["Vuelo y aterrizaje", "El contacto con la pista no es el final."],
          ["Plataforma", "Detención completa al finalizar el vuelo."],
          [
            "Motores y entrega",
            "Motores de propulsión principal apagados + entrega a la representante señalada.",
          ],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "Toda persona a bordo debe acatar instrucciones del comandante para seguridad y operación.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 40.",
          },
          {
            q: "La responsabilidad del art. 41 comienza únicamente al iniciar la carrera de despegue.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "Empieza al abordar para preparar el vuelo; no confundas la definición del art. 70.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "La aeronave aterrizó, pero todavía no se detiene por completo en plataforma. ¿Terminó la responsabilidad del art. 41?",
            options: ["Sí", "No"],
            answer: 1,
            why: "Aterrizar no cumple el cierre completo del artículo.",
          },
          {
            q: "En una emergencia, el comandante toma decisiones en nombre de quien lo designó.",
            options: ["Lo prevé el art. 40", "Necesita inventar una facultad adicional"],
            answer: 0,
            why: "Es una facultad expresa para emergencia o seguridad.",
          },
          {
            q: "Un hecho con posibles consecuencias legales ocurrió en vuelo; se aterriza en el extranjero. ¿A quién se comunica?",
            options: ["Solo al cónsul", "Autoridades competentes y cónsul mexicano"],
            answer: 1,
            why: "Además se registra en bitácora. Art. 40.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Cuándo inicia la responsabilidad del art. 41?",
            options: ["Al abordar para preparar el vuelo", "Al despegar"],
            answer: 0,
            why: "Conserva el momento exacto.",
          },
          {
            q: "¿Quién designa al comandante de una aeronave de uso particular?",
            options: ["Propietaria o poseedora", "Los pasajeros"],
            answer: 0,
            why: "Art. 40.",
          },
          {
            q: "Ante incapacidad durante vuelo, ¿qué rige la sustitución?",
            options: ["Orden jerárquico de designación de la tripulación", "Votación a bordo"],
            answer: 0,
            why: "Art. 40, segundo párrafo.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Escribe el inicio y todas las condiciones de cierre de responsabilidad.",
            "Inicio: aborda para preparación. Cierre: detención completa al finalizar el vuelo en plataforma, apagado de motores de propulsión principal y entrega a la representante que corresponda.",
          ],
          [
            "Recuerda las dos acciones ante hechos en vuelo con posibles consecuencias legales.",
            "Registrar en bitácora e informar a autoridades competentes; si el aterrizaje es extranjero, también al cónsul mexicano.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "La autoridad a bordo tiene un responsable y una ventana de responsabilidad que no termina al tocar pista.",
        recap: [
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 40 · páginas 27"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 41 · páginas 27"],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/danos-a-terceros-arts-70-a-71-8": {
    id: "lac-08",
    folder: "08_Danos_a_Terceros",
    name: "Daños a terceros",
    subtitle:
      "Observa el daño, su causa y quién debe responder. «En vuelo» tiene aquí un alcance definido para este capítulo.",
    year: "Ley de Aviación Civil",
    word: "LP 08",
    sources: ["70", "71"],
    steps: [
      {
        label: "Despegue",
        title: "Daños a terceros",
        body: "Observa el daño, su causa y quién debe responder. «En vuelo» tiene aquí un alcance definido para este capítulo.",
        hero: true,
        refs: [
          "Ley de Aviación Civil · Artículo 70 · páginas 40",
          "Ley de Aviación Civil · Artículo 71 · páginas 40",
        ],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Daño en superficie y causa",
            "Si por operación de una aeronave, objetos desprendidos o abordaje se causan daños a personas o cosas en superficie, la responsabilidad nace con establecer el daño y su causa. Cubren las indemnizaciones la concesionaria, asignataria o permisionaria; para uso particular, la propietaria o poseedora, conforme a las disposiciones aplicables.\n\nTexto íntegro del artículo 70 (páginas 40):\nArtículo 70. Cuando por la operación de una aeronave, por objetos desprendidos de la misma o por\nabordaje, se causen daños a personas o cosas que se encuentren en la superficie, nacerá la\nresponsabilidad con sólo establecer la existencia del daño y su causa.\nEs responsabilidad de la persona concesionaria, asignataria o permisionaria y, en el caso de la\noperación de las aeronaves para uso particular, de la persona propietaria o poseedora de la aeronave,\ncubrir las indemnizaciones por los daños causados, en términos de lo dispuesto en las disposiciones\nlegales aplicables.\nPara los efectos de este capítulo, una aeronave se encuentra en operación cuando está en\nmovimiento, lo que ocurrirá en los casos en que:\nI. Se encuentra en funcionamiento cualquiera de sus servicios o equipos, con tripulación, pasaje o\ncarga a bordo;\nII. Se desplaza en la superficie por su propia fuerza motriz, o\nIII. Se encuentre en vuelo.\nLa aeronave se considera en vuelo desde el momento en que inicia la carrera para su despegue hasta\nel momento en que concluya el recorrido del aterrizaje.",
          ],
          [
            "En operación, para este capítulo",
            "El artículo considera movimiento cuando: funciona cualquiera de los servicios o equipos con tripulación, pasaje o carga a bordo; se desplaza en superficie por su propia fuerza motriz; o está en vuelo. Por eso no reduzcas la operación únicamente a estar en el aire.\n\nTexto íntegro del artículo 70 (páginas 40):\nArtículo 70. Cuando por la operación de una aeronave, por objetos desprendidos de la misma o por\nabordaje, se causen daños a personas o cosas que se encuentren en la superficie, nacerá la\nresponsabilidad con sólo establecer la existencia del daño y su causa.\nEs responsabilidad de la persona concesionaria, asignataria o permisionaria y, en el caso de la\noperación de las aeronaves para uso particular, de la persona propietaria o poseedora de la aeronave,\ncubrir las indemnizaciones por los daños causados, en términos de lo dispuesto en las disposiciones\nlegales aplicables.\nPara los efectos de este capítulo, una aeronave se encuentra en operación cuando está en\nmovimiento, lo que ocurrirá en los casos en que:\nI. Se encuentra en funcionamiento cualquiera de sus servicios o equipos, con tripulación, pasaje o\ncarga a bordo;\nII. Se desplaza en la superficie por su propia fuerza motriz, o\nIII. Se encuentre en vuelo.\nLa aeronave se considera en vuelo desde el momento en que inicia la carrera para su despegue hasta\nel momento en que concluya el recorrido del aterrizaje.",
          ],
          [
            "En vuelo: carrera y recorrido",
            "Para este capítulo, el vuelo va desde el inicio de la carrera de despegue hasta concluir el recorrido de aterrizaje. No cambia el inicio y cierre de responsabilidad del piloto del art. 41; son reglas con objetos distintos.\n\nTexto íntegro del artículo 70 (páginas 40):\nArtículo 70. Cuando por la operación de una aeronave, por objetos desprendidos de la misma o por\nabordaje, se causen daños a personas o cosas que se encuentren en la superficie, nacerá la\nresponsabilidad con sólo establecer la existencia del daño y su causa.\nEs responsabilidad de la persona concesionaria, asignataria o permisionaria y, en el caso de la\noperación de las aeronaves para uso particular, de la persona propietaria o poseedora de la aeronave,\ncubrir las indemnizaciones por los daños causados, en términos de lo dispuesto en las disposiciones\nlegales aplicables.\nPara los efectos de este capítulo, una aeronave se encuentra en operación cuando está en\nmovimiento, lo que ocurrirá en los casos en que:\nI. Se encuentra en funcionamiento cualquiera de sus servicios o equipos, con tripulación, pasaje o\ncarga a bordo;\nII. Se desplaza en la superficie por su propia fuerza motriz, o\nIII. Se encuentre en vuelo.\nLa aeronave se considera en vuelo desde el momento en que inicia la carrera para su despegue hasta\nel momento en que concluya el recorrido del aterrizaje.",
          ],
          [
            "Colisión y responsabilidad solidaria",
            "Si colisionan dos o más aeronaves, las concesionarias, asignatarias o permisionarias y, aun en uso particular, las propietarias o poseedoras son solidariamente responsables por daños a terceros o bienes en superficie. Cada una está sujeta a los límites del artículo siguiente. Se reconoce esa remisión al art. 72 sin enseñar ni calcular sus límites.\n\nTexto íntegro del artículo 71 (páginas 40):\nArtículo 71. Cuando exista colisión entre dos o más aeronaves, las personas concesionarias,\nasignatarias o permisionarias y, aun en la operación de aeronaves para uso particular, las personas\npropietarias o poseedoras de las aeronaves, serán solidariamente responsables por los daños causados\na los terceros o a los bienes en la superficie, cada uno dentro de los límites establecidos en el artículo\nsiguiente.\nSe consideran también abordajes aquellos casos en que se causen daños a aeronaves en\nmovimiento, o a personas o bienes a bordo de éstas, por otra aeronave en movimiento, aunque no haya\nefectiva colisión.",
          ],
          [
            "Abordaje sin contacto",
            "También hay abordaje cuando una aeronave en movimiento causa daños a otra aeronave en movimiento o a personas o bienes a bordo de esta, aunque no exista colisión efectiva. En este supuesto conserva el movimiento de ambas y la existencia de daño; no todo acercamiento es automáticamente abordaje.\n\nTexto íntegro del artículo 71 (páginas 40):\nArtículo 71. Cuando exista colisión entre dos o más aeronaves, las personas concesionarias,\nasignatarias o permisionarias y, aun en la operación de aeronaves para uso particular, las personas\npropietarias o poseedoras de las aeronaves, serán solidariamente responsables por los daños causados\na los terceros o a los bienes en la superficie, cada uno dentro de los límites establecidos en el artículo\nsiguiente.\nSe consideran también abordajes aquellos casos en que se causen daños a aeronaves en\nmovimiento, o a personas o bienes a bordo de éstas, por otra aeronave en movimiento, aunque no haya\nefectiva colisión.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Dos ventanas, dos preguntas",
        body: "«Sin contacto» no significa «sin daño». Y la ventana de vuelo de este capítulo no sustituye la responsabilidad del art. 41.",
        match: [
          ["Art. 70 · daño", "Objeto desprendido → daño en superficie → establecer daño y causa."],
          ["Art. 70 · vuelo", "Inicio de carrera de despegue → fin del recorrido de aterrizaje."],
          [
            "Art. 71 · abordaje",
            "Aeronave en movimiento → daño a otra en movimiento o a lo que va a bordo, aun sin choque.",
          ],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "Para este capítulo, el vuelo concluye al terminar el recorrido de aterrizaje.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Art. 70.",
          },
          {
            q: "Todo acercamiento sin daño es abordaje según el art. 71.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "El supuesto sin colisión exige daños y aeronaves en movimiento.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "Un objeto desprendido de una aeronave causa daño a un bien en superficie. ¿Qué debe establecerse según el art. 70?",
            options: ["Daño y causa", "Solo que hubo un vuelo"],
            answer: 0,
            why: "Es el criterio expreso del primer párrafo.",
          },
          {
            q: "Dos aeronaves en movimiento no chocan, pero una causa daño a la otra.",
            options: ["Puede ser abordaje según el art. 71", "Nunca hay abordaje sin contacto"],
            answer: 0,
            why: "El segundo párrafo contempla expresamente ausencia de colisión efectiva.",
          },
          {
            q: "Funciona un equipo de la aeronave con tripulación a bordo. ¿Aparece como supuesto de operación?",
            options: ["Sí", "Solo si despegó"],
            answer: 0,
            why: "Art. 70, fracción I.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Cuándo empieza el vuelo para este capítulo?",
            options: ["Al iniciar la carrera de despegue", "Cuando aborda el piloto"],
            answer: 0,
            why: "Art. 70; no es la ventana del art. 41.",
          },
          {
            q: "Para uso particular, ¿quién cubre indemnizaciones del art. 70?",
            options: ["Propietaria o poseedora", "Siempre solo el pasajero"],
            answer: 0,
            why: "Art. 70, segundo párrafo.",
          },
          {
            q: "En colisión de aeronaves, ¿el art. 71 menciona límites?",
            options: ["Sí, remite al artículo siguiente", "No, dice que nunca hay límites"],
            answer: 0,
            why: "La remisión se conserva sin desarrollar el art. 72.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Reconstruye los tres supuestos de operación del art. 70.",
            "Servicios/equipos funcionando con tripulación, pasaje o carga a bordo; desplazamiento por propia fuerza motriz en superficie; o en vuelo.",
          ],
          [
            "Explica el abordaje sin contacto conservando sus condiciones.",
            "Una aeronave en movimiento causa daños a otra en movimiento, o a personas o bienes a bordo de esta, aunque no exista colisión efectiva.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Observa el daño, su causa y quién debe responder. «En vuelo» tiene aquí un alcance definido para este capítulo.",
        recap: [
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 70 · páginas 40"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 71 · páginas 40"],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/ley-de-aviacion-civil/accidentes-y-busqueda-y-salvamento-arts-79-a-82-9":
    {
      id: "lac-09",
      folder: "09_Accidentes_Busqueda_y_Salvamento",
      name: "Accidentes, búsqueda y salvamento",
      subtitle:
        "Clasifica el suceso, reconoce los deberes de respuesta y distingue investigar para prevenir de asignar culpa.",
      year: "Ley de Aviación Civil",
      word: "LP 09",
      sources: ["79", "80", "81", "82"],
      steps: [
        {
          label: "Despegue",
          title: "Accidentes, búsqueda y salvamento",
          body: "Clasifica el suceso, reconoce los deberes de respuesta y distingue investigar para prevenir de asignar culpa.",
          hero: true,
          refs: [
            "Ley de Aviación Civil · Artículo 79 · páginas 51",
            "Ley de Aviación Civil · Artículo 80 · páginas 51, 52",
            "Ley de Aviación Civil · Artículo 81 · páginas 52",
            "Ley de Aviación Civil · Artículo 82 · páginas 54",
          ],
        },
        {
          label: "Entiende",
          title: "Primero, entiende.",
          body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
          cards: [
            [
              "Accidente o incidente",
              "Accidente: suceso con lesiones mortales o graves a personas a bordo, o en tierra por partes desprendidas; daños o roturas estructurales a la aeronave; desaparición o ubicación inaccesible. Incidente: suceso relacionado con usar una aeronave que no llega a accidente y afecta o puede afectar la seguridad operacional. No necesita consumarse un daño para que un incidente pueda afectar la seguridad.\n\nTexto íntegro del artículo 79 (páginas 51):\nArtículo 79. Las personas concesionarias, asignatarias, operadoras aéreas, o permisionarias y, en el\ncaso de las operaciones de aeronaves para uso particular, las personas propietarias o poseedoras de\naeronaves, deben contar con los equipos técnicos y con el personal capacitado, necesario, para la\nprevención de accidentes e incidentes aéreos.\nPara efectos de esta Ley, se entiende por:\nI. Accidente: todo suceso en el cual se causen lesiones mortales o graves, a personas a bordo de\nla aeronave, o en tierra por partes que se hayan desprendido, o bien, se ocasionen daños o\nroturas estructurales a la aeronave, o por el que la aeronave desaparezca o se encuentre en un\nlugar inaccesible, y\nII. Incidente: todo suceso relacionado con la utilización de una aeronave, que no llegue a ser un\naccidente que afecte o pueda afectar la seguridad operacional.",
            ],
            [
              "Prevenir también es obligación",
              "Concesionarias, asignatarias, operadoras aéreas y permisionarias; para uso particular, propietarias o poseedoras, deben contar con equipos técnicos y personal capacitado necesarios para prevenir accidentes e incidentes.\n\nTexto íntegro del artículo 79 (páginas 51):\nArtículo 79. Las personas concesionarias, asignatarias, operadoras aéreas, o permisionarias y, en el\ncaso de las operaciones de aeronaves para uso particular, las personas propietarias o poseedoras de\naeronaves, deben contar con los equipos técnicos y con el personal capacitado, necesario, para la\nprevención de accidentes e incidentes aéreos.\nPara efectos de esta Ley, se entiende por:\nI. Accidente: todo suceso en el cual se causen lesiones mortales o graves, a personas a bordo de\nla aeronave, o en tierra por partes que se hayan desprendido, o bien, se ocasionen daños o\nroturas estructurales a la aeronave, o por el que la aeronave desaparezca o se encuentre en un\nlugar inaccesible, y\nII. Incidente: todo suceso relacionado con la utilización de una aeronave, que no llegue a ser un\naccidente que afecte o pueda afectar la seguridad operacional.",
            ],
            [
              "Buscar y salvar",
              "Es de interés público. Deben participar autoridades, propietarias, poseedoras, concesionarias, asignatarias, operadoras aéreas, permisionarias e integrantes de la tripulación de vuelo. La Secretaría dirige y controla las operaciones.\n\nTexto íntegro del artículo 80 (páginas 51, 52):\nArtículo 80. La búsqueda y salvamento en accidentes de aeronaves civiles es de interés público y las\nautoridades, las personas propietarias, poseedoras, concesionarias, asignatarias, operadoras aéreas,\npermisionarias e integrantes de la tripulación de vuelo estarán obligadas a participar en las acciones que\nse lleven a cabo.\nLas operaciones de búsqueda y salvamento estarán bajo la dirección y control de la Secretaría. Los\ncostos directos que se originen por el rescate de la aeronave, la investigación, la preservación de los\nrestos de la aeronave, correo, carga, el rescate de las víctimas y de sus bienes, la repatriación de los\nrestos mortales, sobrevivientes y la asistencia a los familiares de las víctimas será por cuenta de la\npersona concesionaria, asignataria, operadora aérea o permisionaria, y en el caso de las operaciones de\naeronaves para uso particular, de la persona propietaria o poseedora de la aeronave accidentada.\nCuando se vean involucradas aeronaves e instalaciones militares en accidentes o incidentes aéreos\nciviles las Dependencias Militares cooperaran en la investigación, proporcionando toda información que\nles requiera la Secretaría a través de la Agencia Federal de Aviación Civil.",
            ],
            [
              "Costos y cooperación",
              "Los costos directos de rescate de la aeronave, investigación, preservación de restos, correo y carga, rescate de víctimas y bienes, repatriación de restos mortales y sobrevivientes, y asistencia a familiares corresponden a concesionaria, asignataria, operadora aérea o permisionaria; en uso particular, propietaria o poseedora de la aeronave accidentada. Si se involucran aeronaves e instalaciones militares en sucesos civiles, las dependencias militares cooperan y dan la información que requiera la Secretaría a través de AFAC.\n\nTexto íntegro del artículo 80 (páginas 51, 52):\nArtículo 80. La búsqueda y salvamento en accidentes de aeronaves civiles es de interés público y las\nautoridades, las personas propietarias, poseedoras, concesionarias, asignatarias, operadoras aéreas,\npermisionarias e integrantes de la tripulación de vuelo estarán obligadas a participar en las acciones que\nse lleven a cabo.\nLas operaciones de búsqueda y salvamento estarán bajo la dirección y control de la Secretaría. Los\ncostos directos que se originen por el rescate de la aeronave, la investigación, la preservación de los\nrestos de la aeronave, correo, carga, el rescate de las víctimas y de sus bienes, la repatriación de los\nrestos mortales, sobrevivientes y la asistencia a los familiares de las víctimas será por cuenta de la\npersona concesionaria, asignataria, operadora aérea o permisionaria, y en el caso de las operaciones de\naeronaves para uso particular, de la persona propietaria o poseedora de la aeronave accidentada.\nCuando se vean involucradas aeronaves e instalaciones militares en accidentes o incidentes aéreos\nciviles las Dependencias Militares cooperaran en la investigación, proporcionando toda información que\nles requiera la Secretaría a través de la Agencia Federal de Aviación Civil.",
            ],
            [
              "Investigar con independencia",
              "La Secretaría investiga accidentes e incidentes civiles mediante la Comisión Investigadora y Dictaminadora de Accidentes Aéreos, con independencia y autoridad absoluta al investigar, conforme a las disposiciones remitidas. Con audiencia de interesados, se determina la causa probable y, en su caso, se toman acciones pertinentes. Sus integrantes no deben incurrir en conflictos de intereses.\n\nTexto íntegro del artículo 81 (páginas 52):\nArtículo 81. Corresponde a la Secretaría la investigación de los accidentes e incidentes sufridos por\naeronaves civiles, a través de la Comisión Investigadora y Dictaminadora de Accidentes Aéreos, quien\ntendrá independencia para realizar la investigación y autoridad absoluta al llevarla a cabo, de\nconformidad con el Reglamento y las disposiciones técnico administrativas que se emitan para tal efecto.\nConcluida la investigación, que se llevará a cabo con audiencia de los interesados, determinará la causa\nprobable de los mismos y, en su caso, tomará las acciones que estime pertinentes para el caso en\nconcreto.\nLos integrantes de la Comisión Investigadora y Dictaminadora de Accidentes Aéreos no deberán caer\nen conflictos de intereses en el ejercicio de su encargo, de conformidad con la Ley General de\nResponsabilidades Administrativas, los tratados suscritos por el Estado mexicano y demás disposiciones\nque resulten aplicables.\nEl objetivo de las investigaciones de accidentes o incidentes implementadas por la Secretaría será la\nprevención de futuros accidentes e incidentes. La identificación de la causa probable, factores\ncontribuyentes y recomendaciones no implica la asignación de culpa ni determinación de responsabilidad\nadministrativa, civil o penal.",
            ],
            [
              "Prevenir no es asignar culpa",
              "El objetivo de estas investigaciones es prevenir futuros accidentes e incidentes. Identificar causa probable, factores contribuyentes y recomendaciones no implica asignar culpa ni determinar responsabilidad administrativa, civil o penal. Esta regla describe esa investigación; no afirma que jamás puedan existir otras responsabilidades.\n\nTexto íntegro del artículo 81 (páginas 52):\nArtículo 81. Corresponde a la Secretaría la investigación de los accidentes e incidentes sufridos por\naeronaves civiles, a través de la Comisión Investigadora y Dictaminadora de Accidentes Aéreos, quien\ntendrá independencia para realizar la investigación y autoridad absoluta al llevarla a cabo, de\nconformidad con el Reglamento y las disposiciones técnico administrativas que se emitan para tal efecto.\nConcluida la investigación, que se llevará a cabo con audiencia de los interesados, determinará la causa\nprobable de los mismos y, en su caso, tomará las acciones que estime pertinentes para el caso en\nconcreto.\nLos integrantes de la Comisión Investigadora y Dictaminadora de Accidentes Aéreos no deberán caer\nen conflictos de intereses en el ejercicio de su encargo, de conformidad con la Ley General de\nResponsabilidades Administrativas, los tratados suscritos por el Estado mexicano y demás disposiciones\nque resulten aplicables.\nEl objetivo de las investigaciones de accidentes o incidentes implementadas por la Secretaría será la\nprevención de futuros accidentes e incidentes. La identificación de la causa probable, factores\ncontribuyentes y recomendaciones no implica la asignación de culpa ni determinación de responsabilidad\nadministrativa, civil o penal.",
            ],
            [
              "Aeronave perdida",
              "Salvo prueba en contrario, se considera perdida por declaración de concesionaria, asignataria, operadora aérea o permisionaria; en uso particular, propietaria o poseedora. También si pasan treinta días desde las últimas noticias oficiales o particulares y se ignora su paradero. AFAC declara la pérdida y cancela las inscripciones correspondientes.\n\nTexto íntegro del artículo 82 (páginas 54):\nArtículo 82. Se considerará perdida una aeronave, salvo prueba en contrario, en los siguientes casos:\nI. Por declaración de la persona concesionaria, asignataria, operadora aérea o permisionaria y, en\nel caso de las operaciones de aeronaves para uso particular, de la persona propietaria o\nposeedora de la aeronave, y\nII. Cuando transcurridos treinta días desde la fecha en que se tuvieron las últimas noticias oficiales\no particulares de la aeronave, se ignore su paradero.\nLa Agencia Federal de Aviación Civil declarará la pérdida y cancelará las inscripciones\ncorrespondientes.",
            ],
          ],
          guide:
            "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
        },
        {
          label: "Relaciona",
          title: "Del suceso a la prevención",
          body: "Memoria: investigar mira al próximo vuelo. El plazo del art. 82 parte de las últimas noticias, no de una fecha inventada de accidente.",
          match: [
            ["79 · identifica", "Accidente / incidente y recursos de prevención."],
            ["80 · responde", "Búsqueda y salvamento bajo dirección de la Secretaría."],
            ["81 · aprende", "Investigación → causa probable → prevenir; no asignar culpa."],
            [
              "82 · pérdida",
              "Últimas noticias → 30 días sin conocer paradero, salvo prueba en contrario; también existe declaración.",
            ],
          ],
        },
        {
          label: "Sí dice / No dice",
          title: "Lee con precisión.",
          body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
          questions: [
            {
              q: "La investigación del art. 81 se realiza con audiencia de los interesados.",
              options: ["Sí lo dice", "No lo dice"],
              answer: 0,
              why: "Lo dispone su primer párrafo.",
            },
            {
              q: "Una aeronave solo puede considerarse perdida después de 30 días.",
              options: ["Sí lo dice", "No lo dice"],
              answer: 1,
              why: "El art. 82 también contempla la declaración y conserva la salvedad de prueba en contrario.",
            },
          ],
        },
        {
          label: "Aplica",
          title: "Aplica la regla.",
          body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
          questions: [
            {
              q: "Una aeronave sufre roturas estructurales, sin lesionados.",
              options: ["Accidente", "Incidente necesariamente"],
              answer: 0,
              why: "Art. 79: el daño o rotura estructural es un supuesto de accidente.",
            },
            {
              q: "Un suceso relacionado con utilizar la aeronave puede afectar la seguridad y no reúne un supuesto de accidente.",
              options: ["Incidente", "No cuenta porque no hubo daño"],
              answer: 0,
              why: "El incidente puede afectar la seguridad sin que se consume daño.",
            },
            {
              q: "La investigación identifica factores contribuyentes. ¿Eso asigna culpa por sí mismo?",
              options: ["Sí", "No"],
              answer: 1,
              why: "Art. 81: no implica asignación de culpa ni determinación de responsabilidad.",
            },
            {
              q: "Pasan 30 días desde las últimas noticias particulares, sin conocerse el paradero.",
              options: [
                "Supuesto de pérdida, salvo prueba en contrario",
                "Solo cuentan noticias oficiales",
              ],
              answer: 0,
              why: "Art. 82 admite noticias oficiales o particulares.",
            },
          ],
        },
        {
          label: "Evaluación",
          title: "Comprueba lo aprendido.",
          body: "Responde correctamente todas las preguntas antes de continuar.",
          questions: [
            {
              q: "¿Quién dirige y controla búsqueda y salvamento?",
              options: ["Secretaría", "Solo el propietario"],
              answer: 0,
              why: "Art. 80.",
            },
            {
              q: "¿Cuál es el objetivo del art. 81?",
              options: ["Prevenir futuros accidentes e incidentes", "Asignar culpa penal"],
              answer: 0,
              why: "La finalidad y la separación de responsabilidades son expresas.",
            },
            {
              q: "¿Quién declara pérdida y cancela inscripciones?",
              options: ["AFAC", "Los familiares"],
              answer: 0,
              why: "Art. 82, último párrafo.",
            },
            {
              q: "¿El artículo 79 exige personal capacitado para prevención?",
              options: ["Sí", "No, solo equipos"],
              answer: 0,
              why: "Exige ambos recursos.",
            },
          ],
        },
        {
          label: "Recuerda sin mirar",
          title: "Recupera la regla.",
          body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
          recall: [
            [
              "Explica accidente e incidente con un ejemplo de cada uno.",
              "Accidente: rotura estructural. Incidente: suceso relacionado con uso que no es accidente pero afecta o puede afectar seguridad operacional. Revisa que tu ejemplo no cumpla un supuesto de accidente.",
            ],
            [
              "Reconstruye ambos supuestos de pérdida y su salvedad.",
              "Salvo prueba en contrario: declaración de la persona señalada por el artículo, o 30 días desde las últimas noticias oficiales o particulares sin conocer paradero. AFAC declara pérdida y cancela inscripciones.",
            ],
          ],
        },
        {
          label: "Aterrizaje",
          title: "Cierra el recorrido.",
          body: "Clasifica el suceso, reconoce los deberes de respuesta y distingue investigar para prevenir de asignar culpa.",
          recap: [
            ["Fuente estudiada", "Ley de Aviación Civil · Artículo 79 · páginas 51"],
            ["Fuente estudiada", "Ley de Aviación Civil · Artículo 80 · páginas 51, 52"],
            ["Fuente estudiada", "Ley de Aviación Civil · Artículo 81 · páginas 52"],
            ["Fuente estudiada", "Ley de Aviación Civil · Artículo 82 · páginas 54"],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/ley-de-aviacion-civil/sanciones-arts-88-a-90-10": {
    id: "lac-10",
    folder: "10_Sanciones_del_Piloto",
    name: "Sanciones del piloto",
    subtitle:
      "Reconoce la conducta y su consecuencia. Una multa no sustituye los supuestos expresos de revocación.",
    year: "Ley de Aviación Civil",
    word: "LP 10",
    sources: ["88", "89", "90"],
    steps: [
      {
        label: "Despegue",
        title: "Sanciones del piloto",
        body: "Reconoce la conducta y su consecuencia. Una multa no sustituye los supuestos expresos de revocación.",
        hero: true,
        refs: [
          "Ley de Aviación Civil · Artículo 88 · páginas 62, 63, 64",
          "Ley de Aviación Civil · Artículo 89 · páginas 67",
          "Ley de Aviación Civil · Artículo 90 · páginas 67, 68",
        ],
      },
      {
        label: "Entiende",
        title: "Primero, entiende.",
        body: "Visita cada tema. La explicación pedagógica y el texto íntegro de la ley permanecen juntos para consulta.",
        cards: [
          [
            "Mandos, operación y maniobras · I, III, V, VI, X, XIX, XIII, XXVI",
            "Se sanciona permitir a alguien ajeno a la tripulación de vuelo intervenir en los mandos, salvo fuerza mayor (I); no aterrizar en aeropuertos internacionales autorizados al internarse al país, salvo fuerza mayor (III); abandonar aeronave, tripulación, pasajeros, carga y efectos fuera de la terminal y sin causa justificada (V); vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos (VI); operación negligente o fuera de límites y parámetros del fabricante sin causa justificada (X y XIX); demostración, pruebas técnicas o instrucción sin autorización (XIII); y maniobras que activen alertamiento aéreo, siempre que no sea por falla técnica o emergencia (XXVI).\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Documentos y verificaciones · VII, IX, XVIII, XX, XXII",
            "Se sanciona tripular sin licencia (VII). Si en los tres días hábiles siguientes al evento se acredita que se contaba con licencia vigente, la multa cambia de 500–5,000 a 100–200 UMA. También: iniciar vuelo sin verificar vigencia de aeronavegabilidad y licencias de tripulación, y marcas de nacionalidad y matrícula (IX); operar sin documentos que deban llevarse a bordo (XVIII); documentación no emitida por autoridad competente para operar (XX) o en revalidación de licencia de piloto (XXII). No confundas licencia vigente con documento a bordo.\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Transporte, objetos e imágenes · II, IV, XV, XVII",
            "Se sanciona transportar mercancías peligrosas, armas o artículos peligrosos sin autorización (II); cadáveres o personas cuya enfermedad implique riesgo para otros pasajeros sin autorización (IV); arrojar o tolerar que innecesariamente se arrojen objetos o lastre en vuelo (XV); y realizar o permitir a bordo, en vuelo, planificaciones aerofotográficas o aerotopográficas sin permiso al tripular aeronave civil extranjera (XVII).\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Tránsito, reportes y auxilio · VIII, XI, XII, XIV, XVI, XXIV",
            "Se sanciona desobedecer instrucciones de tránsito aéreo salvo fuerza mayor (VIII); no informar incidentes o accidentes a AFAC o al comandante del aeropuerto más cercano dentro de 48 horas desde su conocimiento (XI); no utilizar servicios e instalaciones de ayudas a la navegación cuando sean aplicables (XII); volar sobre zonas prohibidas, restringidas o peligrosas sin autorización AFAC (XIV); negarse a búsqueda o salvamento salvo fuerza mayor (XVI); y no reportar incapacitaciones en vuelo a AFAC dentro de 24 horas (XXIV).\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Salud y condición psicofísica · XXI, XXIII, XXV",
            "Se sanciona presentar documentación médica no emitida por autoridad competente en trámites con AFAC o evaluación médica (XXI); ejercer funciones de licencia en ebriedad o bajo sustancias psicoactivas (XXIII); y omitir o declarar datos contrarios al estado de salud durante la evaluación médica (XXV). Esta última fracción añade a la multa la denegación de la Evaluación Médica por un año.\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Discrepancia que conserva la fuente",
            "El texto vigente del PDF contiene ambos rangos para la misma conducta: fracción X, 300–3,000 UMA; fracción XIX, 1,000–5,000 UMA. Ambas describen operar negligentemente o fuera de límites y parámetros del fabricante sin causa justificada. Conservamos las dos fracciones y no elegimos cuál debe aplicarse. La evaluación pregunta por la conducta, nunca obliga a escoger entre esos rangos.\n\nTexto íntegro del artículo 88 (páginas 62, 63, 64):\nArtículo 88. Se impondrá sanción a la persona comandante o piloto de cualquier aeronave civil por:\nI. Permitir a cualquier persona que no sea miembro de la tripulación de vuelo tomar parte en las\noperaciones de los mandos de la aeronave, salvo causa de fuerza mayor, multa de dos mil a\ncinco mil Unidades de Medida y Actualización;\nII. Transportar mercancías peligrosas, armas o artículos peligrosos, sin la debida autorización,\nmulta de un mil a cinco mil Unidades de Medida y Actualización;\nIII. No aterrizar en los aeropuertos internacionales autorizados en casos de vuelos de internación al\nterritorio nacional, salvo causa de fuerza mayor, multa de un mil a cinco mil Unidades de\nMedida y Actualización;\nIV. Transportar cadáveres o personas que por la naturaleza de su enfermedad presenten riesgo\npara los demás pasajeros, sin la autorización correspondiente, multa de un mil a cinco mil\nUnidades de Medida y Actualización;\nV. Abandonar la aeronave, la tripulación, los pasajeros, la carga y demás efectos, en lugar que no\nsea la terminal del vuelo y sin causa justificada, multa de quinientas a cinco mil Unidades de\nMedida y Actualización;\nVI. Realizar vuelos acrobáticos, rasantes o de exhibición en lugares prohibidos, multa de quinientas\na cinco mil Unidades de Medida y Actualización;\nVII. Tripular la aeronave sin licencia, multa de quinientas a cinco mil Unidades de Medida y\nActualización. En caso de acreditar dentro de los tres días hábiles siguientes a la fecha del\nevento, que se contaba con licencia vigente, se aplicará una multa de cien a doscientas\nUnidades de Medida y Actualización;\nVIII. Desobedecer las órdenes o instrucciones que reciba con respecto al tránsito aéreo, salvo causa\nde fuerza mayor, multa de quinientas a cinco mil Unidades de Medida y Actualización;\nIX. Iniciar el vuelo sin cerciorarse de la vigencia del certificado de aeronavegabilidad, de las\nlicencias de la tripulación de vuelo y de que la aeronave ostente las marcas de nacionalidad y\nmatrícula, multa de trescientas a tres mil Unidades de Medida y Actualización;\nX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de trescientas a tres mil\nUnidades de Medida y Actualización;\nXI. No informar a la Agencia Federal de Aviación Civil o al comandante del aeropuerto más\ncercano, en el caso de incidentes o accidentes aéreos, dentro de las cuarenta y ocho horas\nsiguientes a que tengan conocimiento de ellos, multa de trescientas a tres mil Unidades de\nMedida y Actualización;\nXII. No utilizar durante la operación de la aeronave los servicios e instalaciones de ayudas a la\nnavegación aérea; en caso de ser aplicable, multa de trescientas a tres mil Unidades de Medida\ny Actualización;\nXIII. Realizar vuelos de demostración, pruebas técnicas o de instrucción, sin la autorización\nrespectiva, multa de trescientas a tres mil Unidades de Medida y Actualización;\nXIV. Volar sobre zonas prohibidas, restringidas o peligrosas, sin autorización de la Agencia Federal\nde Aviación Civil, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXV. Arrojar o tolerar que innecesariamente se arrojen desde la aeronave en vuelo, objetos o lastre,\nmulta de doscientas a dos mil Unidades de Medida y Actualización;\nXVI. Negarse a participar en las operaciones de búsqueda o salvamento, salvo causa de fuerza\nmayor, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVII. Realizar o permitir que se realicen abordo de la aeronave en vuelo, planificaciones\naerofotográficas o aerotopográficas sin el permiso correspondiente, en el caso de tripular una\naeronave civil extranjera, multa de doscientas a dos mil Unidades de Medida y Actualización;\nXVIII. Operar la aeronave sin los documentos que deban llevarse a bordo de conformidad con esta\nLey, el reglamento correspondiente, las disposiciones técnico- administrativas y demás\ndisposiciones jurídicas aplicables, con una multa de quinientas a cinco mil Unidades de Medida\ny Actualización;\nXIX. Operar la aeronave de manera negligente o fuera de los límites y parámetros establecidos por\nel fabricante de la misma, sin que medie causa justificada, multa de mil a cinco mil Unidades de\nMedida y Actualización;\nXX. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, multa de dos mil a diez mil Unidades de Medida y Actualización;\nXXI. Presentar documentación que no fue emitida por la autoridad competente relacionados con los\ncertificados de aptitud psicofísica, o cualquier documento médico en los trámites administrativos\ncon la Agencia Federal de Aviación Civil, así como en la realización de la evaluación médica,\nmulta de quinientas a mil Unidades de Medida y Actualización;\nXXII. Presentar documentación que no fue emitida por la autoridad competente durante la\nrevalidación de la licencia de piloto, multa de quinientas a tres mil Unidades de Medida y\nActualización;\nXXIII. Ejercer en estado de ebriedad o bajo los efectos de sustancias psicoactivas las funciones que\nsu licencia le confiere, multa de dos mil a cinco mil Unidades de Medida y Actualización;\nXXIV. No reportar las incapacitaciones en vuelo a la Agencia Federal de Aviación Civil dentro de\nveinticuatro horas, multa de doscientas a quinientas Unidades de Medida y Actualización, y\nXXV. Omitir o asentar en sus declaraciones de salud datos contrarios a su estado de salud, durante\nla evaluación médica, multa de quinientas a un mil Unidades de Medida y Actualización, y la\ndenegación de la Evaluación Médica por un año.\nXXVI. Cuando realicen maniobras de vuelo que motiven la activación de un alertamiento aéreo, con\nuna multa de diez mil a veinticinco mil Unidades de Medida y Actualización, siempre y cuando\nno sea por falla técnica o emergencia.",
          ],
          [
            "Infracciones no previstas y reincidencia",
            "Otras infracciones a la Ley, reglamentos, NOM y disposiciones técnico-administrativas no previstas expresamente en los artículos anteriores del capítulo se sancionan por AFAC con 200–5,000 UMA. En reincidencia, AFAC puede imponer hasta el doble de la cuantía señalada en el capítulo: no es automáticamente el doble. La UMA es la unidad de cuenta, índice, base, medida o referencia publicada en el DOF para determinar pagos de obligaciones y supuestos legales. No calculamos un valor en pesos externo al PDF.\n\nTexto íntegro del artículo 89 (páginas 67):\nArtículo 89. Cualquier otra infracción o incumplimiento a esta Ley, sus reglamentos, normas oficiales\nmexicanas y disposiciones técnico-administrativas que no esté expresamente prevista en los artículos\nanteriores de este capítulo, será sancionada por la Agencia Federal de Aviación Civil con multa de\ndoscientas a cinco mil Unidades de Medida y Actualización.\nEn caso de reincidencia, la Agencia Federal de Aviación Civil podrá imponer una sanción equivalente\nhasta el doble de la cuantía señalada en este capítulo.\nPara efectos del presente capítulo, se entiende por Unidad de Medida y Actualización, la que será\nutilizada como unidad de cuenta, índice, base, medida o referencia para determinar la cuantía del pago\nde las obligaciones y supuestos previstos en las leyes federales, de las entidades federativas y de la\nCiudad de México, publicada en el Diario Oficial de la Federación.",
          ],
          [
            "Revocación · estado e ilícitos",
            "Sin perjuicio de otras sanciones, se revoca la licencia al comandante que tripule en ebriedad o bajo estupefacientes, psicotrópicos o enervantes, o permita que tripulación de vuelo opere así (I). También por actos u omisiones tendientes al uso ilícito de instalaciones de tránsito aéreo, contrabando o equiparado, tráfico de órganos, ataques a vías generales de comunicación, sabotaje, tráfico ilegal de personas, drogas y armas (II). La fracción II extiende igual sanción a cualquier miembro de la tripulación de vuelo en esos supuestos, sin desarrollar esos ilícitos.\n\nTexto íntegro del artículo 90 (páginas 67, 68):\nArtículo 90. Sin perjuicio a las demás sanciones que establece esta Ley y su reglamento, se le\nrevocará la licencia a la persona comandante de la aeronave que incurra en los siguientes supuestos:\nI. Que tripule en estado de ebriedad o bajo los efectos de estupefacientes, psicotrópicos o\nenervantes o que permita que un miembro de la tripulación de vuelo participe en las\noperaciones en ese estado o bajo tales efectos;\nII. Cuando realice actos u omisiones que tiendan al uso ilícito de instalaciones destinadas al\ntránsito aéreo, contrabando, contrabando equiparado, tráfico de órganos, ataques a las vías\ngenerales de comunicación, sabotaje, tráfico ilegal de personas, drogas y armas. Igual sanción\nse impondrá a cualquier miembro de la tripulación de vuelo, que se encuentre en los mismos\nsupuestos;\nIII. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, y\nIV. Cuando, sin causa legítima para ello, despegue o aterrice fuera de un aeródromo, o lo haga en\nuno sin permiso de operación o cuando haga uso de un aeródromo fuera de sus horarios de\noperación.",
          ],
          [
            "Revocación · documentos y aeródromos",
            "Se incluye presentar documentación no emitida por autoridad competente para operar una aeronave (III). También, sin causa legítima, despegar o aterrizar fuera de un aeródromo, hacerlo en uno sin permiso de operación o usarlo fuera de sus horarios (IV). Conserva la condición «sin causa legítima». Multa y revocación pueden coexistir: el inicio del artículo preserva las demás sanciones.\n\nTexto íntegro del artículo 90 (páginas 67, 68):\nArtículo 90. Sin perjuicio a las demás sanciones que establece esta Ley y su reglamento, se le\nrevocará la licencia a la persona comandante de la aeronave que incurra en los siguientes supuestos:\nI. Que tripule en estado de ebriedad o bajo los efectos de estupefacientes, psicotrópicos o\nenervantes o que permita que un miembro de la tripulación de vuelo participe en las\noperaciones en ese estado o bajo tales efectos;\nII. Cuando realice actos u omisiones que tiendan al uso ilícito de instalaciones destinadas al\ntránsito aéreo, contrabando, contrabando equiparado, tráfico de órganos, ataques a las vías\ngenerales de comunicación, sabotaje, tráfico ilegal de personas, drogas y armas. Igual sanción\nse impondrá a cualquier miembro de la tripulación de vuelo, que se encuentre en los mismos\nsupuestos;\nIII. Presentar documentación que no fue emitida por la autoridad competente para realizar la\noperación de una aeronave, y\nIV. Cuando, sin causa legítima para ello, despegue o aterrice fuera de un aeródromo, o lo haga en\nuno sin permiso de operación o cuando haga uso de un aeródromo fuera de sus horarios de\noperación.",
          ],
        ],
        guide:
          "Identifica el sujeto, la regla y sus condiciones. Una excepción puede cambiar la respuesta.",
      },
      {
        label: "Relaciona",
        title: "Conducta → consecuencia",
        body: "MULTA ≠ REVOCACIÓN. Tampoco significa que sean excluyentes. La discrepancia X/XIX permanece visible sin elegir un rango.",
        match: [
          [
            "88 · conductas",
            "Multas y, en XXV, denegación médica por un año. Revisa condiciones y excepciones.",
          ],
          ["89 · alcance residual", "Infracción no prevista + posible aumento por reincidencia."],
          ["90 · revocación", "Supuestos expresos, sin perjuicio de las demás sanciones."],
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "Lee con precisión.",
        body: "Distingue el texto legal de las generalizaciones que no aparecen en él.",
        questions: [
          {
            q: "El artículo 90 conserva las demás sanciones aunque se revoque la licencia.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 0,
            why: "Lo indica su frase inicial.",
          },
          {
            q: "Hay que escoger un único rango entre 88 X y XIX para aprobar este recorrido.",
            options: ["Sí lo dice", "No lo dice"],
            answer: 1,
            why: "La fuente presenta una discrepancia. Evaluamos la conducta sin resolver jurídicamente el rango.",
          },
        ],
      },
      {
        label: "Aplica",
        title: "Aplica la regla.",
        body: "Resuelve los escenarios conservando sujetos, condiciones y excepciones.",
        questions: [
          {
            q: "¿Qué hizo el piloto? Permitió a alguien ajeno a la tripulación de vuelo operar mandos, sin fuerza mayor.",
            options: ["Conducta del art. 88 I", "No aparece en el artículo"],
            answer: 0,
            why: "Art. 88 I: conserva la excepción de fuerza mayor.",
          },
          {
            q: "Operó negligentemente o fuera de los límites y parámetros del fabricante, sin causa justificada.",
            options: ["Conducta repetida en X y XIX", "Solo falta documental"],
            answer: 0,
            why: "Ambas fracciones describen esa conducta; los rangos difieren y no se escoge uno.",
          },
          {
            q: "El comandante permitió a un miembro de tripulación de vuelo operar ebrio. ¿Es supuesto de revocación?",
            options: ["Sí, art. 90 I", "Solo se sanciona si el comandante estaba ebrio"],
            answer: 0,
            why: "La fracción incluye permitir esa participación.",
          },
          {
            q: "No se reportó un accidente dentro de 48 horas desde que se tuvo conocimiento.",
            options: ["Art. 88 XI", "Art. 88 XXIV, sobre incapacitaciones"],
            answer: 0,
            why: "Son reportes con objetos y plazos distintos.",
          },
          {
            q: "El comandante usa un aeródromo fuera de horario sin causa legítima. ¿Aparece en art. 90?",
            options: ["Sí", "No"],
            answer: 0,
            why: "Fracción IV: conserva la ausencia de causa legítima.",
          },
        ],
      },
      {
        label: "Evaluación",
        title: "Comprueba lo aprendido.",
        body: "Responde correctamente todas las preguntas antes de continuar.",
        questions: [
          {
            q: "¿Reincidencia significa siempre exactamente el doble?",
            options: ["Sí", "No: AFAC puede imponer hasta el doble"],
            answer: 1,
            why: "Art. 89: «podrá» y «hasta» son relevantes.",
          },
          {
            q: "Una persona acredita que tenía licencia vigente dentro del plazo de art. 88 VII. ¿Cuál es ese plazo?",
            options: ["Tres días hábiles siguientes al evento", "Treinta días naturales"],
            answer: 0,
            why: "La fracción contempla el tratamiento específico de esa acreditación.",
          },
          {
            q: "Omitir datos o declarar datos contrarios a la salud durante evaluación médica agrega…",
            options: [
              "Denegación de Evaluación Médica por un año",
              "Revocación automática por esa sola fracción",
            ],
            answer: 0,
            why: "Art. 88 XXV: multa y denegación, no una revocación inventada.",
          },
          {
            q: "Documentación no emitida por autoridad competente para operar: ¿está en art. 90 III?",
            options: ["Sí", "No"],
            answer: 0,
            why: "Es uno de sus supuestos expresos de revocación.",
          },
        ],
      },
      {
        label: "Recuerda sin mirar",
        title: "Recupera la regla.",
        body: "Formula primero tu respuesta y después descubre el modelo de comparación.",
        recall: [
          [
            "Explica multa y revocación, sin decir que una excluye a la otra.",
            "Art. 88 enumera conductas sancionadas; art. 90 ordena revocación en sus supuestos, sin perjuicio de demás sanciones. No toda multa se convierte automáticamente en revocación.",
          ],
          [
            "Recuerda los dos reportes del art. 88 y sus plazos.",
            "XI: incidentes/accidentes a AFAC o comandante del aeropuerto más cercano dentro de 48 horas desde conocimiento. XXIV: incapacitaciones en vuelo a AFAC dentro de 24 horas.",
          ],
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Reconoce la conducta y su consecuencia. Una multa no sustituye los supuestos expresos de revocación.",
        recap: [
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 88 · páginas 62, 63, 64"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 89 · páginas 67"],
          ["Fuente estudiada", "Ley de Aviación Civil · Artículo 90 · páginas 67, 68"],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/constitucion-politica-de-los-estados-unidos-mexicanos/art-32-1": {
    id: "cpeum-art-32",
    folder: "01_Articulo_32",
    name: "Artículo 32",
    subtitle: "Nacionalidad, cargos, servicio y tripulación.",
    year: "Constitución Política de los Estados Unidos Mexicanos",
    word: "Artículo 32",
    sources: ["Artículo 32"],
    steps: [
      {
        label: "Despegue",
        title: "Artículo 32.<br><em>Lee la regla completa.</em>",
        body: "El Artículo 32 establece reglas distintas para personas y situaciones concretas. La clave está en reconocer a quién se refiere y bajo qué condiciones. En aviación, mira de cerca la tripulación y el cargo de comandante de aeródromo.",
        hero: true,
      },
      {
        label: "Lectura guiada",
        title: "Cinco párrafos, cinco alcances.",
        body: "Estudia el texto constitucional completo junto con su explicación y ejemplo de aplicación.",
        cards: [
          [
            "Párrafo 1 · Otra nacionalidad",
            "Texto constitucional:\nLa Ley regulará el ejercicio de los derechos que la legislación mexicana otorga a los mexicanos que posean otra nacionalidad y establecerá normas para evitar conflictos por doble nacionalidad.\n\nEn palabras simples:\nEl artículo encarga a la ley regular cómo ejercen sus derechos los mexicanos que también poseen otra nacionalidad y establecer normas para evitar conflictos por doble nacionalidad. Aquí no se detallan esas normas.\n\nEjemplo:\nSi una persona mexicana posee otra nacionalidad, este párrafo remite a la ley para la regulación del ejercicio de sus derechos. No permite afirmar que por ese solo hecho pierde todos sus derechos.",
          ],
          [
            "Párrafo 2 · Cargos reservados",
            "Texto constitucional:\nEl ejercicio de los cargos y funciones para los cuales, por disposición de la presente Constitución, se requiera ser mexicano por nacimiento, se reserva a quienes tengan esa calidad y no adquieran otra nacionalidad. Esta reserva también será aplicable a los casos que así lo señalen otras leyes del Congreso de la Unión.\n\nEn palabras simples:\nLa reserva se refiere a cargos y funciones para los que la Constitución exige ser mexicano por nacimiento: quienes los ejerzan deben tener esa calidad y no adquirir otra nacionalidad. También abarca los casos que otras leyes del Congreso de la Unión señalen. Este párrafo no enumera esos casos.\n\nEjemplo:\nSi un cargo exige por disposición constitucional ser mexicano por nacimiento, la reserva incluye esa calidad y no adquirir otra nacionalidad. No cambies “los cargos y funciones para los cuales…” por “todos los trabajos”.",
          ],
          [
            "Párrafo 3 · Servicio y fuerzas",
            "Texto constitucional:\nEn tiempo de paz, ningún extranjero podrá servir en la Fuerza Armada permanente, ni en las fuerzas de policía o seguridad pública. Para pertenecer al activo del Ejército en tiempo de paz y al de la Armada o al de la Fuerza Aérea o al de la Guardia Nacional en todo momento, o desempeñar cualquier cargo o comisión en ellos, se requiere ser mexicano por nacimiento.\n\nEn palabras simples:\nHay dos reglas. La primera impide a extranjeros servir en las fuerzas señaladas en tiempo de paz. La segunda exige ser mexicano por nacimiento para pertenecer al activo y desempeñar cargos o comisiones en los términos que expresa el párrafo. Conserva la diferencia: Ejército en tiempo de paz; Armada, Fuerza Aérea y Guardia Nacional en todo momento.\n\nEjemplo:\nPara pertenecer al activo de la Fuerza Aérea, el párrafo exige ser mexicano por nacimiento “en todo momento”. No reduzcas esa expresión a “en tiempo de paz”.",
          ],
          [
            "Párrafo 4 · Tripulación y cargos",
            "Texto constitucional:\nEsta misma calidad será indispensable en capitanes, pilotos, patrones, maquinistas, mecánicos y, de una manera general, para todo el personal que tripule cualquier embarcación o aeronave que se ampare con la bandera o insignia mercante mexicana. Será también necesaria para desempeñar los cargos de capitán de puerto y todos los servicios de practicaje y comandante de aeródromo.\n\nEn palabras simples:\n“Esta misma calidad” se refiere a ser mexicano por nacimiento. Es indispensable para las personas enumeradas y, en general, para todo el personal que tripule una embarcación o aeronave amparada con bandera o insignia mercante mexicana. La calidad también se exige para capitán de puerto, todos los servicios de practicaje y comandante de aeródromo.\n\nEjemplo:\nPara un piloto que tripula una aeronave amparada con la bandera mercante mexicana, el párrafo exige ser mexicano por nacimiento. La referencia a la aeronave es parte de la regla.",
          ],
          [
            "Párrafo 5 · Preferencia",
            "Texto constitucional:\nLos mexicanos serán preferidos a los extranjeros en igualdad de circunstancias, para toda clase de concesiones y para todos los empleos, cargos o comisiones de gobierno en que no sea indispensable la calidad de ciudadano.\n\nEn palabras simples:\nLa preferencia favorece a mexicanos frente a extranjeros cuando hay igualdad de circunstancias. El texto la sitúa en toda clase de concesiones y en empleos, cargos o comisiones de gobierno en que no sea indispensable la calidad de ciudadano. Mantén juntas la preferencia, la condición y su ámbito.\n\nEjemplo:\nSi se comparan una persona mexicana y una extranjera para una concesión en igualdad de circunstancias, el párrafo establece preferencia por la mexicana. No elimines la condición de igualdad.",
          ],
        ],
        guide: "Lee los cinco fragmentos y marca cada uno después de revisar su explicación.",
      },
      {
        label: "Quién y bajo qué condición",
        title: "Identifica sujeto, calidad y tiempo.",
        body: "Conserva todas las condiciones expresas antes de elegir.",
        questions: [
          {
            q: "Un cargo exige, por disposición de la Constitución, ser mexicano por nacimiento. ¿Cómo expresa el segundo párrafo la reserva?",
            options: [
              "Ser mexicano por nacimiento y no adquirir otra nacionalidad.",
              "Poseer cualquier nacionalidad, si se tiene experiencia.",
              "Ser mexicano, sin más condiciones.",
            ],
            answer: 0,
            why: "El segundo párrafo reserva esos cargos a quienes tengan la calidad de mexicanos por nacimiento y no adquieran otra nacionalidad.",
          },
          {
            q: "¿Qué combinación conserva las referencias de tiempo para pertenecer al activo?",
            options: [
              "Ejército, Armada, Fuerza Aérea y Guardia Nacional: solo en paz.",
              "Ejército: en tiempo de paz. Armada, Fuerza Aérea y Guardia Nacional: en todo momento.",
              "Las cuatro instituciones: el texto no señala tiempos.",
            ],
            answer: 1,
            why: "El tercer párrafo distingue “Ejército en tiempo de paz” y “Armada”, “Fuerza Aérea” y “Guardia Nacional en todo momento”.",
          },
          {
            q: "Para una concesión, se comparan una persona mexicana y una extranjera en igualdad de circunstancias. ¿Qué establece el artículo?",
            options: [
              "Una preferencia por la persona mexicana.",
              "Una prohibición general para toda persona extranjera.",
              "Una preferencia sin ninguna condición.",
            ],
            answer: 0,
            why: "El quinto párrafo dice “serán preferidos” y conserva la condición “en igualdad de circunstancias”. Preferencia no equivale a una prohibición general.",
          },
        ],
      },
      {
        label: "El vínculo aeronáutico",
        title: "Tripulación, aeronave y cargos.",
        body: "Relaciona a la persona que tripula, la descripción de la aeronave y la calidad requerida.",
        questions: [
          {
            q: "Lucía tripula como piloto una aeronave amparada con insignia mercante mexicana. ¿Qué calidad exige expresamente el cuarto párrafo?",
            options: [
              "Ser mexicana por nacimiento.",
              "Tener una edad determinada.",
              "Haber acumulado un número específico de horas de vuelo.",
            ],
            answer: 0,
            why: "El cuarto párrafo exige “esta misma calidad”: ser mexicano por nacimiento. No fija aquí una edad ni un número de horas de vuelo.",
          },
          {
            q: "¿Cuál de estos cargos aparece nombrado expresamente en el cuarto párrafo?",
            options: [
              "Todo empleo administrativo de un aeropuerto.",
              "Comandante de aeródromo.",
              "Todo empleo en una empresa de aviación.",
            ],
            answer: 1,
            why: "El texto nombra al “comandante de aeródromo”. No contiene esas otras formulaciones generales.",
          },
          {
            q: "Solo sabemos que una persona trabaja en aviación. ¿Basta ese dato para afirmar que está en el supuesto del personal que tripula?",
            options: [
              "Sí: el párrafo dice “toda persona que trabaje en aviación”.",
              "No: hay que identificar si tripula y la bandera o insignia mercante de la aeronave.",
            ],
            answer: 1,
            why: "La regla se refiere al personal que tripule la aeronave descrita. “Trabajar en aviación” no reproduce por sí solo ese supuesto. Esto tampoco decide si otras reglas podrían aplicar.",
          },
        ],
      },
      {
        label: "Sí dice / No dice",
        title: "No amplíes la norma.",
        body: "Una sola palabra puede ampliar indebidamente lo que dice el artículo.",
        questions: [
          {
            q: "“El artículo prohíbe a todos los mexicanos poseer otra nacionalidad.”",
            options: ["Sí dice", "No dice"],
            answer: 1,
            why: "El primer párrafo contempla mexicanos que poseen otra nacionalidad y encarga a la ley regular el ejercicio de sus derechos. El segundo contiene una reserva específica de cargos; no una prohibición general para todos los mexicanos.",
          },
          {
            q: "“La calidad de mexicano por nacimiento se exige para todo el personal que tripule la embarcación o aeronave descrita, no solo para pilotos.”",
            options: ["Sí dice", "No dice"],
            answer: 0,
            why: "El cuarto párrafo enumera varios roles y añade “de una manera general, para todo el personal que tripule” la embarcación o aeronave con bandera o insignia mercante mexicana.",
          },
          {
            q: "“Los mexicanos son preferidos a los extranjeros en todos los empleos privados, sin condiciones.”",
            options: ["Sí dice", "No dice"],
            answer: 1,
            why: "El quinto párrafo se refiere a concesiones y a los empleos, cargos o comisiones de gobierno descritos. Además, exige igualdad de circunstancias. La afirmación amplía el ámbito y borra una condición.",
          },
          {
            q: "“El Artículo 32 establece cuántas horas de vuelo necesita un piloto.”",
            options: ["Sí dice", "No dice"],
            answer: 1,
            why: "El artículo no fija horas de vuelo. Su cuarto párrafo trata la calidad de mexicano por nacimiento para el personal y los cargos que menciona.",
          },
          {
            q: "“En tiempo de paz, ningún extranjero podrá servir en la Fuerza Armada permanente ni en las fuerzas de policía o seguridad pública.”",
            options: ["Sí dice", "No dice"],
            answer: 0,
            why: "Es la primera oración del tercer párrafo. La expresión “en tiempo de paz” forma parte del texto.",
          },
        ],
      },
      {
        label: "Recupera lo aprendido",
        title: "Explícalo con tus palabras.",
        body: "Formula primero la respuesta; después descubre el modelo para compararla.",
        recall: [
          [
            "Explica la regla sobre tripulación usando: quién / en qué aeronave / qué calidad.",
            "Quién: capitanes, pilotos y, en general, todo el personal que tripule. En qué aeronave: una amparada con bandera o insignia mercante mexicana. Qué calidad: ser mexicano por nacimiento.",
          ],
          [
            "¿Qué diferencia hay entre la reserva de cargos y la preferencia?",
            "La reserva del segundo párrafo exige ser mexicano por nacimiento y no adquirir otra nacionalidad para los cargos y funciones descritos. La preferencia del quinto favorece a mexicanos frente a extranjeros en igualdad de circunstancias, dentro del ámbito que señala.",
          ],
          [
            "Da un ejemplo de algo que el artículo sí dice y otro de algo que no dice.",
            "Sí dice: ser mexicano por nacimiento es necesario para comandante de aeródromo. No dice: cuántas horas de vuelo requiere un piloto. Que algo no aparezca aquí no significa que esté permitido ni resuelve lo que otras normas puedan establecer.",
          ],
        ],
      },
      {
        label: "Ponlo a prueba",
        title: "Evaluación final.",
        body: "Contesta correctamente las cinco preguntas antes de avanzar.",
        questions: [
          {
            q: "Una persona mexicana posee otra nacionalidad. ¿Qué dice el primer párrafo?",
            options: [
              "Que pierde automáticamente todos sus derechos.",
              "Que la ley regulará el ejercicio de sus derechos y establecerá normas para evitar conflictos por doble nacionalidad.",
              "Que puede ejercer cualquier cargo sin condiciones.",
            ],
            answer: 1,
            why: "El primer párrafo remite a la ley. No declara una pérdida automática de derechos ni elimina las reservas de otros párrafos.",
          },
          {
            q: "¿Qué afirmación conserva el alcance de la reserva del segundo párrafo?",
            options: [
              "Se aplica a todos los trabajos, públicos y privados.",
              "Solo importa tener experiencia.",
              "Se refiere a los cargos y funciones descritos y también a los casos que así señalen otras leyes del Congreso de la Unión.",
            ],
            answer: 2,
            why: "El segundo párrafo delimita los cargos y funciones y añade los casos señalados por otras leyes del Congreso. Exige la calidad de mexicano por nacimiento y no adquirir otra nacionalidad.",
          },
          {
            q: "Para pertenecer al activo de la Fuerza Aérea, ¿cómo expresa el texto la condición temporal de la exigencia de ser mexicano por nacimiento?",
            options: ["En todo momento.", "Únicamente en tiempo de paz.", "Solo durante un vuelo."],
            answer: 0,
            why: "El tercer párrafo incluye a la Fuerza Aérea en la expresión “en todo momento”.",
          },
          {
            q: "Un piloto tripula una aeronave amparada con bandera mercante mexicana. ¿Qué frase del cuarto párrafo conecta su caso con la calidad de mexicano por nacimiento?",
            options: [
              "“En igualdad de circunstancias”.",
              "“Esta misma calidad será indispensable en capitanes, pilotos…”",
              "“La Ley regulará el ejercicio de los derechos…”",
            ],
            answer: 1,
            why: "“Esta misma calidad” retoma ser mexicano por nacimiento. La frase pertenece al cuarto párrafo, que también describe la embarcación o aeronave.",
          },
          {
            q: "¿Qué condición no debes borrar al explicar la preferencia de mexicanos frente a extranjeros?",
            options: [
              "Que se trate de cualquier empleo privado.",
              "Que no haya otras personas candidatas.",
              "La igualdad de circunstancias.",
            ],
            answer: 2,
            why: "El quinto párrafo exige igualdad de circunstancias y delimita su ámbito: concesiones y los empleos, cargos o comisiones de gobierno que describe.",
          },
        ],
      },
      {
        label: "Aterrizaje",
        title: "Cierra el recorrido.",
        body: "Comprueba que puedes explicar el vínculo entre nacionalidad, cargos, servicio y tripulación.",
        recap: [
          ["Texto completo", "Revisé los cinco párrafos del Artículo 32."],
          [
            "Vínculo aeronáutico",
            "Puedo explicar la regla aplicable a tripulación y comandante de aeródromo.",
          ],
          ["Límites", "Distingo lo que el artículo dice de lo que no establece."],
        ],
        refs: ["Constitución Política de los Estados Unidos Mexicanos · Artículo 32 · página 45"],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/medidas-de-seguridad-para-prevenir-actos-de-interferencia-ilicita-arts-1":
    {
      id: "rlac-01",
      folder: "01_Seguridad_Interferencia",
      name: "Seguridad e interferencia ilícita",
      subtitle:
        "Revisión, programa de seguridad, objetos peligrosos, armas y respuesta ante amenazas.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 43–47",
      sources: ["RLAC 43–47", "LAC 33–34"],
      steps: [
        {
          label: "Artículo 43",
          title: "La revisión protege el vuelo",
          body: "Quién y qué se revisa antes del transporte o embarque.",
          guide: "Separa la regla escrita de su consecuencia operativa.",
          refs: ["RLAC 43–47", "LAC 33–34", "RLAC pp. 22–24 · LAC p. 24"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 43",
              "Pasajero, equipaje de mano, equipaje por facturar y carga deben documentarse con anticipación para revisión.\nLa finalidad es verificar que no se transporten ilícitamente armas o materiales, sustancias y objetos peligrosos.\nSi el pasajero rehúsa la revisión, puede solicitarse a la autoridad competente que la efectúe.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La revisión no es decorativa: es un filtro legal antes del embarque.\nNegarse no obliga al operador a dejar pasar; la autoridad puede intervenir y negar el acceso.",
            ],
            [
              "¿Quién asegura el servicio?",
              "La persona concesionaria o permisionaria debe asegurarse de que los aeródromos utilizados proporcionen servicios de revisión.\nRLAC 43",
            ],
            [
              "Si se niega el acceso",
              "La autoridad informa su determinación lo antes posible al transportista para que adopte las medidas pertinentes.\nRLAC 43",
            ],
          ],
          recall: [
            [
              "Sin mirar: menciona las cuatro categorías sometidas a revisión.",
              "Pasajero, equipaje de mano, equipaje por facturar y carga.",
            ],
          ],
          hero: true,
        },
        {
          label: "Artículos 44–45",
          title: "Programa y barreras",
          body: "Programa autorizado, instrucción y procedimientos contra objetos peligrosos.",
          guide: "Aquí el Reglamento pasa de la regla general a los controles del operador.",
          refs: ["RLAC 43–47", "LAC 33–34", "RLAC pp. 22–24 · LAC p. 24"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 44–45",
              "Debe existir un programa de seguridad para prevenir actos de interferencia ilícita, autorizado por la AFAC.\nEl programa debe incluir medidas para impedir artículos que dificulten la navegación o pongan en peligro a tripulación y pasajeros.\nEl manejo, embalaje y transporte de materiales peligrosos se rige por NOM y disposiciones técnico-administrativas.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El operador necesita un sistema autorizado, no una colección informal de precauciones.\nCuando el Reglamento remite a NOM o disposiciones técnico-administrativas, este curso no inventa el detalle.",
            ],
            ["2 años", "Vigencia del programa de instrucción vinculado al programa de seguridad."],
            ["2 años", "Vigencia del instructor certificado que imparte esa instrucción."],
            [
              "Familias de riesgo citadas",
              "Sustancias químicas, corrosivas, radiactivas e inflamables; armas, explosivos, municiones, herramientas u objetos contundentes y dispositivos incapacitantes.\nRLAC 45",
            ],
            [
              "Operadores extranjeros",
              "Para vuelos hacia y desde el extranjero deben contar con un Suplemento de Procedimientos en Seguridad autorizado por la AFAC.\nRLAC 44",
            ],
            [
              "2 + 2 · Doble vigencia, dos controles",
              "Programa de instrucción: 2 años. Instructor certificado: 2 años. La cifra ayuda a recordar; no sustituye la lectura del artículo.",
            ],
          ],
        },
        {
          label: "Artículo 46",
          title: "Armas y objetos peligrosos",
          body: "Permiso, entrega, ubicación, devolución y aviso.",
          guide: "Sigue el objeto desde antes del vuelo hasta el destino.",
          refs: ["RLAC 43–47", "LAC 33–34", "RLAC pp. 22–24 · LAC p. 24"],
          cards: [
            ["1 · Acredita", "Presenta licencia o permiso a la autoridad competente."],
            ["2 · Entrega", "Entrega el bien al transportista antes del vuelo."],
            ["3 · Transporta", "Va en compartimento de carga, cuando proceda."],
            ["4 · Devuelve", "Se devuelve en el aeródromo de destino."],
            [
              "EL REGLAMENTO DICE · RLAC 46",
              "El traslado procede conforme a NOM y disposiciones técnico-administrativas.\nSi se descubre transporte clandestino, el comandante/PIC, el transportista o cualquier otra persona debe avisar a las autoridades competentes.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Permiso no significa acceso libre a cabina: existe una cadena de entrega y transporte.\nLo clandestino activa un deber de aviso.",
            ],
          ],
          questions: [
            {
              q: "Una persona presenta el permiso correspondiente, pero pretende conservar el arma consigo durante el vuelo. ¿Qué falta?",
              options: [
                "Nada: el permiso basta.",
                "Entregarla al transportista antes del vuelo para su transporte cuando proceda.",
                "Únicamente informar al comandante al aterrizar.",
              ],
              answer: 1,
              why: "Correcto. El artículo 46 añade entrega previa y transporte conforme al procedimiento aplicable.",
              wrong: "Casi. El permiso es necesario, pero no agota las condiciones del Reglamento.",
            },
          ],
        },
        {
          label: "Artículo 47",
          title: "Amenaza a bordo",
          body: "Medidas urgentes, aviso y coordinación con tránsito aéreo.",
          guide: "Distingue una amenaza general de un acto de interferencia ilícita.",
          refs: ["RLAC 43–47", "LAC 33–34", "RLAC pp. 22–24 · LAC p. 24"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 47",
              "Si una persona involucrada en la operación constituye peligro para pasajeros, carga o aeronave, el operador debe adoptar medidas urgentes y avisar de inmediato a las autoridades.\nSi hay acto de interferencia ilícita, el comandante/PIC actúa conforme al programa autorizado, mantiene comunicación con ATS y acata indicaciones hasta donde las circunstancias lo permitan.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Primero se contiene el riesgo y se avisa.\nCuando el supuesto escala a interferencia ilícita, se activa el programa y la coordinación operacional.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 33: regla de quién no puede abordar y autorizaciones especiales.\nReglamento: RLAC 43 y 46: revisión y cadena para armas u objetos peligrosos.\nDiferencia: La Ley formula restricciones; el Reglamento desarrolla controles y manejo.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 34: la AFAC regula mercancías peligrosas, armas, municiones y explosivos.\nReglamento: RLAC 45–46: procedimientos preventivos, permisos, entrega y aviso.\nDiferencia: No dicen exactamente lo mismo.",
            ],
          ],
          questions: [
            {
              q: "¿Dónde aparece el deber operativo de mantener comunicación con los servicios de tránsito aéreo ante interferencia ilícita?",
              options: [
                "Ley de Aviación Civil, artículo 33.",
                "Reglamento, artículo 47.",
                "En ambos con el mismo texto.",
              ],
              answer: 1,
              why: "Exacto: es desarrollo operativo del RLAC 47.",
              wrong:
                "No. La conexión temática existe, pero la obligación operativa está en el Reglamento.",
            },
          ],
        },
        {
          label: "Cierre",
          title: "Active recall",
          body: "Reconstruye la cadena completa sin convertir las remisiones en reglas inventadas.\n\nAlcance Connect respetado: este Learning Path evalúa únicamente RLAC 43–47. Las referencias a LAC 33–34 son comparativas y también están dentro del temario.",
          guide: "Explica, relaciona y recupera: esa es la secuencia FlightPath.",
          refs: ["RLAC 43–47", "LAC 33–34", "RLAC pp. 22–24 · LAC p. 24"],
          cards: [
            [
              "Qué se revisa y qué ocurre si una persona rehúsa la revisión.",
              "Marca lo que puedes explicar con tus palabras:",
            ],
            [
              "Qué cubre el programa de seguridad y cuáles son sus dos vigencias de 2 años.",
              "Marca lo que puedes explicar con tus palabras:",
            ],
            [
              "Cuál es la cadena permiso → entrega → carga → devolución.",
              "Marca lo que puedes explicar con tus palabras:",
            ],
            [
              "Qué cambia cuando existe un acto de interferencia ilícita.",
              "Marca lo que puedes explicar con tus palabras:",
            ],
          ],
          recall: [
            [
              "Completa la ruta de respuesta: riesgo detectado → ___ → ___; si es interferencia ilícita → programa + ___.",
              "Medidas urgentes → aviso inmediato; programa autorizado + comunicación con ATS y acatamiento posible de indicaciones.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/personal-de-vuelo-arts-77-a-86-2":
    {
      id: "rlac-02",
      folder: "02_Personal_Vuelo",
      name: "Personal de vuelo",
      subtitle:
        "Licencias, composición de tripulación, experiencia reciente, límites, entrenamiento y sobrecargos.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 77–86",
      sources: ["RLAC 77–86", "LAC 38"],
      steps: [
        {
          label: "Artículos 77–79",
          title: "Quién integra el personal",
          body: "Tripulación de vuelo, sobrecargos y licencias.",
          guide: "Dos artículos del rango están derogados; reconocerlo también es precisión.",
          refs: ["RLAC 77–86", "LAC 38", "RLAC pp. 33–38 · LAC pp. 25–26"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 77 y 79",
              "El personal de vuelo se integra por tripulación de vuelo y tripulación de sobrecargos.\nLas licencias abarcan pilotos de ala fija, helicóptero, aeróstato, ultraligero, planeador, RPAS grande (>25 kg), sobrecargo y otras que determine la AFAC.\nLa tripulación de vuelo cumple funciones esenciales y no puede ser inferior a lo especificado en el certificado de aeronavegabilidad.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "“Personal de vuelo” es la categoría amplia; dentro están quienes operan y quienes atienden seguridad/emergencia en cabina.\nEl certificado de aeronavegabilidad fija un piso que no puede reducirse.",
            ],
            ["Artículo 78", "Derogado. No se enseña una regla que ya no contiene.\nRLAC 78"],
            [
              "Copiloto",
              "Su utilización es obligatoria conforme a las NOM correspondientes.\nRLAC 79",
            ],
            [
              "Artículo 83",
              "Derogado. Se conserva como dato de lectura jurídica, no como obligación.\nRLAC 83",
            ],
          ],
          recall: [
            [
              "¿Cuáles son los dos grandes componentes del personal de vuelo?",
              "Tripulación de vuelo y tripulación de sobrecargos.",
            ],
          ],
          hero: true,
        },
        {
          label: "Artículos 80–81",
          title: "Asignación y bitácora",
          body: "Vigencia documental, experiencia reciente y conocimiento de ruta.",
          guide: "El patrón numérico 90–3–3 aparece en la experiencia reciente.",
          refs: ["RLAC 77–86", "LAC 38", "RLAC pp. 33–38 · LAC pp. 25–26"],
          cards: [
            ["90 días", "Ventana precedente que revisa la experiencia reciente."],
            ["3", "Despegues en el mismo modelo o entrenador correspondiente."],
            ["3", "Aterrizajes en el mismo modelo o entrenador correspondiente."],
            [
              "EL REGLAMENTO DICE · RLAC 80–81",
              "Para mando, copiloto o segundo oficial: licencia, certificado psicofísico y capacidades vigentes.\nDebe conocerse cartas, meteorología, comunicaciones, navegación, SAR y aproximaciones por instrumentos utilizables.\nCada integrante de tripulación de vuelo conserva y mantiene al día su bitácora aprobada y certificada por la AFAC.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La asignación no depende solo de portar licencia: combina vigencia, recencia y conocimiento operacional.\nLa bitácora es la evidencia mantenida al día.",
            ],
            [
              "90·3·3 · La puerta de la recencia",
              "En 90 días: 3 despegues + 3 aterrizajes. Después pregunta por ruta, meteorología, navegación, comunicaciones, SAR y aproximaciones.",
            ],
          ],
          questions: [
            {
              q: "Una persona tiene licencia vigente, pero no acredita los 3 despegues y 3 aterrizajes dentro de los 90 días precedentes. ¿Cumple el artículo 80?",
              options: [
                "Sí, la licencia vigente basta.",
                "No; falta demostrar la experiencia reciente exigida.",
                "Sí, si conoce la meteorología.",
              ],
              answer: 1,
              why: "Correcto. Son requisitos acumulativos, no alternativos.",
              wrong: "No. El artículo 80 exige más de una condición.",
            },
          ],
        },
        {
          label: "Artículo 82",
          title: "Límites y descanso",
          body: "Horas máximas en ventanas consecutivas y descanso asociado.",
          guide: "Lee cada número con su ventana; nunca los mezcles.",
          refs: ["RLAC 77–86", "LAC 38", "RLAC pp. 33–38 · LAC pp. 25–26"],
          cards: [
            ["90 / 30", "Máximo 90 horas en 30 días naturales consecutivos."],
            ["1000 / 365", "Máximo 1000 horas en 365 días naturales consecutivos."],
            ["30 / 7", "Máximo 30 horas en 7 días naturales consecutivos."],
            ["8 h 30 / 24", "Si se supera en 24 horas, siguen 24 horas de descanso."],
            [
              "EL REGLAMENTO DICE · RLAC 82",
              "Si se operan 30 horas en siete días o menos, procede relevo de toda actividad aeronáutica por las siguientes 24 horas y reinicia la ventana de siete días.\nLos descansos dentro de las ventanas no reinician por sí solos los periodos consecutivos.\nEn largo alcance puede volarse excepcionalmente el excedente necesario para completar el vuelo, ajustando los tiempos globales.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Cada límite se lee como pareja: horas + periodo.\nLa excepción de largo alcance no borra los límites globales ni el descanso.",
            ],
          ],
          questions: [
            {
              q: "Se alcanzan 30 horas de vuelo dentro de siete días. ¿Qué sigue según el artículo 82?",
              options: [
                "24 horas sin actividad aeronáutica y reinicio del periodo de siete días.",
                "Solo una pausa de 8 horas.",
                "La bitácora reinicia automáticamente al terminar el vuelo.",
              ],
              answer: 0,
              why: "Correcto. Ésa es la consecuencia expresa.",
              wrong: "Revisa la pareja 30 / 7 y la consecuencia de 24 horas.",
            },
          ],
        },
        {
          label: "Artículos 84 y 84 Bis",
          title: "Entrenamiento y competencia",
          body: "Programa anual y verificaciones de competencia.",
          guide: "Programa y verificación se relacionan, pero no son la misma cosa.",
          refs: ["RLAC 77–86", "LAC 38", "RLAC pp. 33–38 · LAC pp. 25–26"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 84",
              "Programa en tierra y vuelo autorizado por AFAC.\nIncluye instructores calificados, tipo de aeronave, coordinación, emergencias, pérdida de control, VFR/IFR, cartas, factores humanos, mercancías peligrosas y evacuación.\nSe repite anualmente e incluye evaluación de competencia.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El entrenamiento cubre técnica, coordinación y respuesta a lo anormal.\n“Anual” corresponde al programa del artículo 84.",
            ],
            [
              "EL REGLAMENTO DICE · RLAC 84 Bis",
              "Debe comprobarse técnica de pilotaje y capacidad en procedimientos normales, anormales y de emergencia para cada tipo o variante.\nLa competencia IFR se demuestra ante evaluador autorizado o inspector verificador, según corresponda.\nLa periodicidad y combinación entre variantes se determinan en las disposiciones técnico-administrativas.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El artículo 84 Bis verifica que la persona puede ejecutar; no fija aquí una periodicidad inventada.\nCuando el detalle vive en otra disposición, se reconoce la remisión.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 38: define personal técnico-aeronáutico y exige licencia y certificado psicofísico vigentes.\nReglamento: RLAC 77–84 Bis: clasifica, fija composición, recencia, bitácoras, límites, adiestramiento y competencia.\nDiferencia: La Ley establece el marco general; el Reglamento desarrolla condiciones operativas del personal de vuelo.",
            ],
          ],
        },
        {
          label: "Artículos 85–86",
          title: "Sobrecargos",
          body: "Función, cadena de mando y mínimos por pasajeros.\n\nEl certificado tipo puede exigir un mínimo mayor. No puede operarse por debajo de ese mínimo ni modificarse sin autorización previa de AFAC.",
          guide: "Yaris enseña la diferencia: atención al pasajero sí, pero seguridad primero.",
          refs: ["RLAC 77–86", "LAC 38", "RLAC pp. 33–38 · LAC pp. 25–26"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 85",
              "La función principal es auxiliar al comandante/PIC en seguridad y emergencia en la cabina de pasajeros.\nTambién atienden pasajeros y cumplen otras funciones asignadas.\nActúan siempre bajo las órdenes del comandante.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La atención es una función; la prioridad normativa es seguridad y emergencia.\nLa cadena de mando termina en el comandante.",
            ],
            ["20–50", "1 sobrecargo."],
            ["51–100", "2 sobrecargos."],
            [">100", "2 más 1 por cada 50 pasajeros adicionales."],
            [
              "Distingo personal de vuelo, tripulación de vuelo y sobrecargos.",
              "Confirma el cierre del bloque:",
            ],
            [
              "Recuerdo 90–3–3 y las cuatro ventanas del artículo 82.",
              "Confirma el cierre del bloque:",
            ],
            [
              "No convierto una remisión técnico-administrativa en una cifra inventada.",
              "Confirma el cierre del bloque:",
            ],
            ["Puedo calcular el mínimo base de sobrecargos.", "Confirma el cierre del bloque:"],
          ],
          questions: [
            {
              q: "Una aeronave tiene capacidad para 100 pasajeros. ¿Mínimo indicado por la escala del artículo 86?",
              options: ["1 sobrecargo.", "2 sobrecargos.", "3 sobrecargos."],
              answer: 1,
              why: "Correcto: 51 a 100 corresponde a dos.",
              wrong: "Casi. El incremento adicional empieza por encima de 100.",
            },
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/disposiciones-generales-para-la-operacion-arts-103-a-105-3":
    {
      id: "rlac-03",
      folder: "03_Disposiciones_Operacion",
      name: "Disposiciones para la operación",
      subtitle: "Conocimiento normativo, certificado visible y límites de las aeronaves de carga.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 103–105",
      sources: ["RLAC 103–105", "LAC 32"],
      steps: [
        {
          label: "Artículo 103",
          title: "Responsabilidad de conocimiento",
          body: "Qué debe conocer cada grupo y qué cambia para el operador aéreo.",
          guide: "Agrupa por persona responsable, no por fracción aislada.",
          refs: ["RLAC 103–105", "LAC 32", "RLAC p. 47 · LAC p. 23"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 103",
              "Personal técnico: normatividad nacional e internacional aplicable en el lugar de operación.\nTripulación de vuelo: reglamentos y procedimientos de zonas, aeródromos, servicios e instalaciones.\nSobrecargos: reglamentos y procedimientos aplicables a sus funciones.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La organización responde ante AFAC por preparar a su personal para el entorno real de operación.\nLa persona operadora aérea cumple únicamente las fracciones I y II.",
            ],
          ],
          questions: [
            {
              q: "¿La persona operadora aérea está expresamente obligada por las tres fracciones del artículo 103?",
              options: ["Sí, por las tres.", "No; únicamente por I y II.", "Solo por la III."],
              answer: 1,
              why: "Correcto. El último párrafo limita su obligación a I y II.",
              wrong: "Revisa el último párrafo del artículo 103.",
            },
          ],
          hero: true,
        },
        {
          label: "Artículo 104",
          title: "Certificado visible",
          body: "Qué acredita y dónde debe estar.",
          guide: "“A bordo” y “visible” son ideas distintas; aquí aparecen juntas.",
          refs: ["RLAC 103–105", "LAC 32", "RLAC p. 47 · LAC p. 23"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 104",
              "La aeronave que opere en territorio nacional debe llevar en su interior el certificado de aeronavegabilidad.\nDebe estar en lugar fijo y visible.\nAcredita que, al verificarse, la aeronave estaba en condiciones técnicas satisfactorias para operar con seguridad.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "No basta con que el certificado exista en un expediente externo.\nLa regla del artículo 104 añade una condición de exhibición dentro de la aeronave.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 32: la aeronave debe llevar certificados vigentes a bordo y regula la obtención/vigencia del certificado.\nReglamento: RLAC 104: exige llevar el certificado en el interior, en lugar fijo y visible.\nDiferencia: La relación es temática real; el Reglamento aporta el modo de exhibición.",
            ],
          ],
          recall: [["Completa: interior + lugar ___ + lugar ___.", "Fijo y visible."]],
        },
        {
          label: "Artículo 105",
          title: "Aeronave de carga",
          body: "Prohibición general y excepción funcional.",
          guide: "La excepción no convierte la aeronave de carga en transporte de pasajeros.",
          refs: ["RLAC 103–105", "LAC 32", "RLAC p. 47 · LAC p. 23"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 105",
              "Está prohibido transportar personas en aeronaves destinadas exclusivamente a carga.\nPuede transportarse personal al servicio del concesionario o permisionario necesario para atención y custodia de la carga.\nDeben cumplirse los requisitos de las NOM correspondientes.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La excepción es estrecha y depende de la función respecto de la carga.\n“Personal necesario” no significa cualquier empleado ni una persona pasajera.",
            ],
          ],
          questions: [
            {
              q: "Una aeronave exclusiva de carga lleva a una persona sin función de atención o custodia. ¿Encaja en la excepción?",
              options: [
                "Sí, si trabaja para la empresa.",
                "No; la función respecto de la carga es necesaria.",
                "Sí, si el vuelo es corto.",
              ],
              answer: 1,
              why: "Correcto. La relación funcional con atención o custodia es parte de la excepción.",
              wrong: "No. Duración o simple vínculo laboral no reemplazan el requisito funcional.",
            },
          ],
        },
        {
          label: "Aplicación",
          title: "Detecta el error",
          body: "Tres decisiones rápidas sobre los artículos 103–105.\n\nAlcance Connect respetado: no se añadieron los artículos 106–110, aunque sean cercanos en el Reglamento.",
          guide: "No uses artículos cercanos: resuelve solo con este bloque.",
          refs: ["RLAC 103–105", "LAC 32", "RLAC p. 47 · LAC p. 23"],
          cards: [
            [
              "El personal técnico conoce la normatividad aplicable donde opera.",
              "Marca las afirmaciones que deben cumplirse:",
            ],
            [
              "El certificado de aeronavegabilidad está fijo y visible en el interior.",
              "Marca las afirmaciones que deben cumplirse:",
            ],
            [
              "En aeronave exclusiva de carga solo viaja el personal necesario para atención y custodia, conforme a NOM.",
              "Marca las afirmaciones que deben cumplirse:",
            ],
          ],
          recall: [
            [
              "¿Qué tres verbos resumen el bloque?",
              "Conocer (103), exhibir/acreditar (104) y limitar el transporte de personas (105).",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/operaciones-de-vuelo-arts-111-a-120-4":
    {
      id: "rlac-04",
      folder: "04_Operaciones_Vuelo",
      name: "Operaciones de vuelo",
      subtitle: "Cabina, briefing, preflight legal, autoridad en vuelo, reportes y combustible.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 111–120",
      sources: ["RLAC 111–120", "LAC 40–41"],
      steps: [
        {
          label: "Artículos 111–114",
          title: "Cabina y briefing",
          body: "Controles, puestos de mando, información a pasajeros y permanencia.",
          guide: "Antes de despegar ya existen obligaciones operativas concretas.",
          refs: ["RLAC 111–120", "LAC 40–41", "RLAC pp. 53–57 · LAC pp. 27–28"],
          cards: [
            [
              "Controles",
              "Ninguna persona ajena a la tripulación de vuelo puede usar los controles en vuelo.\nRLAC 111",
            ],
            [
              "Puestos de mando",
              "Solo personas autorizadas y vinculadas con la operación pueden pasar y ocupar asientos adicionales.\nRLAC 111",
            ],
            [
              "Briefing",
              "Nombre del comandante/PIC; cinturones, flotación, oxígeno, salidas, evacuación y equipo individual.\nRLAC 112",
            ],
            [
              "Permanencia",
              "Tripulación asegurada en despegue/aterrizaje; cabina de mando nunca totalmente sola.\nRLAC 113–114",
            ],
          ],
          questions: [
            {
              q: "Durante el vuelo, ambos pilotos abandonan simultáneamente la cabina por una tarea relacionada con la operación. ¿Cumple el artículo 114?",
              options: [
                "Sí, porque la tarea es operacional.",
                "No; la cabina no puede quedar totalmente sola.",
                "Sí, si informan a sobrecargos.",
              ],
              answer: 1,
              why: "Correcto. La excepción por actividad operacional no permite dejarla totalmente sola.",
              wrong:
                "La relación con la operación permite una ausencia, pero no de todos a la vez.",
            },
          ],
          hero: true,
        },
        {
          label: "Artículos 115, 115 Bis y 116",
          title: "Pre-Flight Legal Check",
          body: "La decisión legal de iniciar o no iniciar.\n\nEl artículo usa “inferior de 376 hectopascales o superior a 25,000 pies”. Se conserva la formulación de la fuente; no se añaden requisitos externos.",
          guide: "Recorre el avión, los papeles, la carga, la tripulación y el entorno.",
          refs: ["RLAC 111–120", "LAC 40–41", "RLAC pp. 53–57 · LAC pp. 27–28"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 115–116",
              "No se inicia si condiciones técnicas, operativas o climáticas ponen en peligro el vuelo.\nEl PIC cumple la normativa aplicable y conoce reglas, procedimientos, zonas, aeródromos y servicios.\nAntes del vuelo verifica aeronavegabilidad, certificados, liberación de mantenimiento, equipo/MEL, peso y CG, carga, tripulación, planes, alterno IFR, meteorología, instalaciones, oxígeno, equipaje y otras condiciones.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El go/no-go es una responsabilidad documentada, no una intuición aislada.\nLa lista une estado técnico, preparación operacional y aptitud humana.",
            ],
            [
              "Aeronavegabilidad, matrícula y liberación de mantenimiento.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            ["Instrumentos/equipo conforme a MEL.", "Pre-Flight Legal Check: confirma cada bloque"],
            [
              "Peso, centro de gravedad y carga asegurada/distribuida.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            [
              "Tripulación con licencia, psicofísico y capacidades vigentes.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            [
              "Plan de vuelo y plan operacional; alterno cuando sea IFR.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            [
              "Meteorología y mínimos de origen, ruta, destino y alterno.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            [
              "Instalaciones/servicios adecuados y vuelo realizable sin peligro.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            [
              "Oxígeno respirable, máscara rápida cuando aplique y equipaje de mano asegurado.",
              "Pre-Flight Legal Check: confirma cada bloque",
            ],
            ["376 hPa", "Umbral de presión citado para máscara de colocación rápida."],
            ["25,000 ft", "Altitud también citada en la condición de cabina a presión."],
          ],
        },
        {
          label: "Artículos 116-A y 116-B",
          title: "Plan y aproximación",
          body: "Cómo se solicita el plan y el umbral de aproximación segura.",
          guide: "Los artículos insertados sí están dentro del rango 111–120.",
          refs: ["RLAC 111–120", "LAC 40–41", "RLAC pp. 53–57 · LAC pp. 27–28"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 116-A",
              "El plan puede solicitarse por escrito, teléfono, interfono, frecuencia aeronáutica u otro medio electrónico.\nSe usa el formato autorizado y la AFAC puede pedir la documentación física de respaldo.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El medio puede variar; el respaldo y el cumplimiento siguen siendo verificables.",
            ],
            ["300 m", "Altura sobre la elevación del aeródromo mencionada en RLAC 116-B."],
            [
              "EL REGLAMENTO DICE · RLAC 116-B",
              "Debe evitarse una aproximación por debajo de 300 m, salvo que con información de pista y rendimiento se constate que el aterrizaje puede realizarse con seguridad.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La excepción exige una constatación informada de aterrizaje seguro; no es automática.",
            ],
          ],
          questions: [
            {
              q: "¿Qué combinación permite la excepción del artículo 116-B?",
              options: [
                "Solo autorización verbal del operador.",
                "Información de pista + desempeño/rendimiento que permita constatar aterrizaje seguro.",
                "Que el vuelo sea VFR.",
              ],
              answer: 1,
              why: "Correcto. La excepción está vinculada a información y seguridad del aterrizaje.",
              wrong: "No. El artículo no formula esa condición como sustituto.",
            },
          ],
        },
        {
          label: "Artículos 117–118",
          title: "Durante el vuelo",
          body: "Autoridad, emergencia, reportes y cambios al plan.",
          guide: "La autoridad se usa para proteger, coordinar y reportar.",
          refs: ["RLAC 111–120", "LAC 40–41", "RLAC pp. 53–57 · LAC pp. 27–28"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 117",
              "El PIC mantiene orden y disciplina; por seguridad puede interrumpir y desembarcar.\nPuede reasignar temporalmente tareas por seguridad o emergencia.\nSin comunicación con el operador, puede hacer arreglos necesarios para terminar el viaje con seguridad.\nReporta condiciones de peligro a la estación apropiada lo antes posible.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La autoridad no es ilimitada: está orientada a seguridad y emergencia.\nUn reporte útil protege también a otras aeronaves.",
            ],
            [
              "EL REGLAMENTO DICE · RLAC 118",
              "Cuando surgen condiciones peligrosas que afectan la seguridad, debe coordinarse con ATS tan pronto como sea posible para cambios al plan aprobado.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Cambiar el plan por seguridad implica coordinación, no improvisación silenciosa.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 40: comandante como máxima autoridad, orden, seguridad y decisiones de emergencia.\nReglamento: RLAC 117–118: tareas operativas concretas durante el vuelo.\nDiferencia: La Ley establece autoridad general; el Reglamento explica usos y coordinación.",
            ],
          ],
        },
        {
          label: "Artículos 119–120",
          title: "Después y combustible",
          body: "Notificaciones, bitácora y condiciones de reabastecimiento.",
          guide: "El vuelo termina, pero la responsabilidad documental continúa.",
          refs: ["RLAC 111–120", "LAC 40–41", "RLAC pp. 53–57 · LAC pp. 27–28"],
          cards: [
            ["Incidente/accidente", "Notificar al comandante del aeródromo más próximo."],
            ["Falla/anormalidad", "Notificar al operador y asentar en bitácora."],
            [
              "Reabastecimiento",
              "Supervisión, procedimiento autorizado y comunicación tierra–a bordo.",
            ],
            [
              "EL REGLAMENTO DICE · RLAC 120",
              "Con pasajeros embarcando, a bordo o desembarcando: solo si personal calificado supervisa y el procedimiento está en el MGO.\nCon motores operando: solo si el fabricante lo prevé y AFAC lo autorizó en el MGO.\nDebe mantenerse comunicación entre tierra y personal calificado a bordo.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Son excepciones condicionadas, no permisos generales.\nEl MGO y la coordinación son piezas obligatorias.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 41: responsabilidad del PIC desde la preparación hasta detención, apagado y entrega.\nReglamento: RLAC 119–120: deberes posteriores y límites durante reabastecimiento.\nDiferencia: La Ley delimita el arco de responsabilidad; el Reglamento concreta acciones.",
            ],
            ["Quién puede usar controles y entrar a cabina.", "Marca si puedes explicar:"],
            ["Qué cubre el Pre-Flight Legal Check.", "Marca si puedes explicar:"],
            ["Cuándo se coordinan cambios al plan.", "Marca si puedes explicar:"],
            ["Qué se reporta y asienta después del vuelo.", "Marca si puedes explicar:"],
            [
              "Qué condiciones permiten reabastecer con pasajeros o motores operando.",
              "Marca si puedes explicar:",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/instrumentos-equipo-y-documentos-de-vuelo-art-131-5":
    {
      id: "rlac-05",
      folder: "05_Documentos_Vuelo",
      name: "Instrumentos, equipo y documentos de vuelo",
      subtitle: "La experiencia “¿Qué sube al avión?” construida únicamente con el artículo 131.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 131",
      sources: ["RLAC 131", "LAC 32"],
      steps: [
        {
          label: "Mapa de fuentes",
          title: "Ley y Reglamento",
          body: "Obligación general frente a listado operativo.",
          guide: "Mismo tema, funciones distintas.",
          refs: ["RLAC 131", "LAC 32", "RLAC pp. 61–62 · LAC p. 23"],
          cards: [
            [
              "Ley y Reglamento",
              "Ley: LAC 32: información aeronáutica, seguro y certificados vigentes; además remite a documentos y equipo exigidos por el marco aplicable.\nReglamento: RLAC 131: lista los documentos según modalidad del servicio.\nDiferencia: La Ley contiene el deber general; el Reglamento despliega el listado.",
            ],
          ],
          questions: [
            {
              q: "¿Cuál fuente contiene el listado de 17 fracciones estudiado aquí?",
              options: ["LAC 32.", "RLAC 131.", "Ambas con el mismo listado."],
              answer: 1,
              why: "Correcto. La Ley remite; el Reglamento enumera.",
              wrong: "No. La comparación no debe borrar la diferencia entre fuentes.",
            },
          ],
          hero: true,
        },
        {
          label: "Fracciones I–IV y XI",
          title: "Identidad y vigencia",
          body: "Certificados, bitácora, radio y seguro.",
          guide: "Empieza con la identidad documental de la aeronave.",
          refs: ["RLAC 131", "LAC 32", "RLAC pp. 61–62 · LAC p. 23"],
          cards: [
            [
              "Aeronavegabilidad + ruido",
              "Certificado de aeronavegabilidad y certificado de homologación de ruido anexo.\nI",
            ],
            ["Matrícula", "Certificado de matrícula.\nII"],
            ["Bitácora", "Libro de bitácora.\nIII"],
            ["Estación móvil", "Autorización de operar como estación radioaeronáutica móvil.\nIV"],
            [
              "Seguro",
              "Póliza vigente o copia fotostática con constancia de inscripción en el Registro Aeronáutico Mexicano.\nXI",
            ],
          ],
          recall: [
            [
              "Menciona los cinco elementos de identidad/vigencia agrupados en esta etapa.",
              "Aeronavegabilidad + ruido, matrícula, bitácora, autorización de estación radioaeronáutica móvil y seguro.",
            ],
          ],
        },
        {
          label: "Fracciones V–X, XII–XVI",
          title: "Operación y navegación",
          body: "Lo que prepara, guía y respalda el vuelo.",
          guide: "No memorices 17 objetos aislados: agrúpalos por función.",
          refs: ["RLAC 131", "LAC 32", "RLAC pp. 61–62 · LAC p. 23"],
          cards: [
            [
              "Preparación",
              "Manifiesto de peso/carga/balance; plan de vuelo; plan operacional.\nV, X, XIV",
            ],
            ["Manuales", "Manual de vuelo; MGO; lista de comprobación.\nVI, XII, XIII"],
            ["Despacho técnico", "MEL cuando el certificado tipo lo señale.\nVII"],
            [
              "Navegación",
              "Información AIP y cartas actualizadas de ruta y posibles desvíos.\nVIII–IX",
            ],
            [
              "Autorizaciones",
              "Aprobaciones específicas salvo imposibilidad por caso fortuito o fuerza mayor.\nXV",
            ],
            [
              "Intercepción",
              "Procedimientos para tripulación al mando de aeronaves interceptadas.\nXVI",
            ],
            [
              "I·O·N · Identidad · Operación · Navegación",
              "Agrupa el listado para recuperarlo, pero conserva cada fracción y su condición.",
            ],
          ],
        },
        {
          label: "Actividad",
          title: "¿Qué sube al avión?",
          body: "Selecciona cada grupo requerido por el artículo 131.\n\n“Otros documentos” no autoriza inventarlos: la fracción XVII remite a NOM y disposiciones técnico-administrativas con base en desarrollo tecnológico.",
          guide: "Marca solo cuando puedas decir qué contiene el grupo.",
          refs: ["RLAC 131", "LAC 32", "RLAC pp. 61–62 · LAC p. 23"],
          cards: [
            ["Certificados de aeronavegabilidad/ruido y matrícula.", "Checklist del artículo 131:"],
            [
              "Bitácora y autorización de estación radioaeronáutica móvil.",
              "Checklist del artículo 131:",
            ],
            ["Manifiesto de peso, carga y balance.", "Checklist del artículo 131:"],
            ["Manual de vuelo y MEL cuando aplique.", "Checklist del artículo 131:"],
            [
              "AIP y cartas actualizadas de ruta y posibles desvíos.",
              "Checklist del artículo 131:",
            ],
            ["Plan de vuelo y seguro vigente/copia registrada.", "Checklist del artículo 131:"],
            ["Lista de comprobación y MGO.", "Checklist del artículo 131:"],
            ["Plan operacional de vuelo.", "Checklist del artículo 131:"],
            [
              "Aprobaciones específicas, procedimientos de intercepción y otros exigidos por NOM/DTA.",
              "Checklist del artículo 131:",
            ],
          ],
        },
        {
          label: "Último párrafo",
          title: "Operadora aérea: excepción expresa",
          body: "Qué fracciones no se le exigen en este artículo.",
          guide: "La excepción está en el texto; no se deduce por conveniencia.",
          refs: ["RLAC 131", "LAC 32", "RLAC pp. 61–62 · LAC p. 23"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 131, último párrafo",
              "Las personas operadoras aéreas cumplen I, II, III, IV, VI, VII, VIII, IX, X, XI, XII, XV, XVI y XVII.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Dentro de este artículo, el listado especial omite V, XIII y XIV: manifiesto de peso/carga/balance, MGO y plan operacional de vuelo.\nLa omisión se explica solo para el alcance de esta disposición.",
            ],
          ],
          questions: [
            {
              q: "¿Cuál grupo queda fuera del listado especial para personas operadoras aéreas en el último párrafo del artículo 131?",
              options: ["V, XIII y XIV.", "I, II y III.", "VIII, IX y X."],
              answer: 0,
              why: "Correcto. Son las tres fracciones omitidas del listado especial.",
              wrong: "No. Compara la lista expresa con las 17 fracciones.",
            },
          ],
          recall: [
            [
              "Completa la excepción: V = ___; XIII = ___; XIV = ___.",
              "Manifiesto de peso, carga y balance; manual general de operaciones; plan operacional de vuelo.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/servicios-a-la-navegacion-aerea-arts-158-a-162-6":
    {
      id: "rlac-06",
      folder: "06_Servicios_Navegacion",
      name: "Servicios a la navegación aérea",
      subtitle:
        "Entrada a espacio con ATS, plan de vuelo, comunicaciones y restricciones temporales.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 158–162",
      sources: ["RLAC 158–162", "LAC 35–37"],
      steps: [
        {
          label: "Artículos 158–159",
          title: "Entrada y prioridad",
          body: "Requisitos antes de penetrar espacio con ATS y derecho de uso.",
          guide: "VFR o IFR: el punto central es cumplir antes de entrar.",
          refs: ["RLAC 158–162", "LAC 35–37", "RLAC pp. 72–73 · LAC p. 25"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 158–159",
              "El PIC VFR o IFR no penetra tipos y clases de espacio aéreo con ATS sin cumplir condiciones y requisitos de las reglas de tránsito aéreo.\nTodo PIC tiene el mismo derecho de uso, salvo las prioridades señaladas por esas reglas.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La igualdad de uso convive con prioridades operativas definidas.\nEl Reglamento no enumera aquí el detalle de cada clase; remite a reglas de tránsito aéreo.",
            ],
          ],
          questions: [
            {
              q: "“VFR significa que puedo entrar sin cumplir las reglas del espacio con ATS.”",
              options: ["Sí dice.", "No dice; el artículo incluye VFR e IFR."],
              answer: 1,
              why: "Correcto. RLAC 158 incluye expresamente ambos tipos de reglas de vuelo.",
              wrong: "No. El texto menciona visual e instrumentos.",
            },
          ],
          hero: true,
        },
        {
          label: "Artículo 160",
          title: "Plan abierto, plan cerrado",
          body: "Apertura, informes de posición y cierre.",
          guide: "El aterrizaje en la estación es el punto de cierre definido aquí.",
          refs: ["RLAC 158–162", "LAC 35–37", "RLAC pp. 72–73 · LAC p. 25"],
          cards: [
            ["Abrir", "Conforme a las disposiciones técnico-administrativas."],
            ["Informar", "Posición e informes apropiados durante el vuelo."],
            ["Aterrizar", "En aeropuerto, aeródromo o punto de destino del plan."],
            ["Cerrar", "Se considera efectuado al aterrizar en la estación."],
            [
              "EL REGLAMENTO DICE · RLAC 160",
              "AFAC puede requerir la presentación física del cierre para verificar cumplimiento.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El cierre tiene un momento definido, pero puede exigirse evidencia física.",
            ],
          ],
          recall: [
            [
              "¿Cuándo se considera efectuado el cierre del plan de vuelo?",
              "Al momento del aterrizaje en la estación: aeropuerto, aeródromo civil o punto de destino previsto.",
            ],
          ],
        },
        {
          label: "Artículo 161",
          title: "Falla de comunicaciones",
          body: "Responsabilidad compartida por el procedimiento.",
          guide:
            "El artículo no inventa el procedimiento: obliga a observar el descrito en las reglas.",
          refs: ["RLAC 158–162", "LAC 35–37", "RLAC pp. 72–73 · LAC p. 25"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 161",
              "El PIC y las personas prestadoras de ATS deben observar los procedimientos de emergencia por falla de comunicaciones descritos en las reglas de tránsito aéreo.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La obligación es compartida: aeronave y proveedor siguen el procedimiento aplicable.\nEste curso no añade frecuencias ni secuencias externas al artículo.",
            ],
          ],
          questions: [
            {
              q: "¿El artículo 161 contiene aquí el procedimiento técnico completo de falla de comunicaciones?",
              options: ["Sí, paso por paso.", "No; remite a las reglas de tránsito aéreo."],
              answer: 1,
              why: "Correcto. Se enseña la obligación y la remisión, sin inventar el detalle.",
              wrong: "Revisa la última frase del artículo.",
            },
          ],
        },
        {
          label: "Artículo 162",
          title: "Restricción o suspensión",
          body: "Quién puede restringir y por qué.",
          guide: "Distingue el alcance de AFAC del alcance de ATS en aeródromo.",
          refs: ["RLAC 158–162", "LAC 35–37", "RLAC pp. 72–73 · LAC p. 25"],
          cards: [
            [
              "AFAC",
              "Por condiciones especiales o de tránsito puede restringir o suspender temporal, parcial o totalmente vuelos VFR o IFR, previo aviso a los sujetos enumerados.\nRLAC 162",
            ],
            [
              "Servicios ATS",
              "Pueden restringir o suspender temporalmente una o todas las operaciones en un aeródromo cuando las condiciones de tránsito lo requieran.\nRLAC 162",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 35: uso obligatorio de servicios en IFR y comunicación/control en VFR dentro de espacio controlado.\nReglamento: RLAC 158–161: condiciones de entrada, plan, posición y falla de comunicaciones.\nDiferencia: La Ley establece obligaciones generales; el Reglamento concreta conductas del PIC y ATS.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 36–37: zonas y coordinación por seguridad pública/nacional; servicios de navegación.\nReglamento: RLAC 162: restricción o suspensión temporal por condiciones especiales o de tránsito.\nDiferencia: No confundir las facultades ni asumir que todo supuesto es idéntico.",
            ],
            ["Cumplimiento antes de entrar.", "Cierre de bloque:"],
            ["Igual derecho salvo prioridades.", "Cierre de bloque:"],
            ["Abrir, informar y cerrar plan.", "Cierre de bloque:"],
            ["Seguir procedimiento de falla de comunicaciones.", "Cierre de bloque:"],
            ["Reconocer quién restringe o suspende y en qué supuesto.", "Cierre de bloque:"],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/reglas-del-aire-arts-168-a-174-7":
    {
      id: "rlac-07",
      folder: "07_Reglas_Aire",
      name: "Reglas del aire",
      subtitle:
        "Desviaciones por emergencia, mínimos, separación, vigilancia, ATC, interceptación y apoderamiento ilícito.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 168–174",
      sources: ["RLAC 168–174", "LAC 35–37"],
      steps: [
        {
          label: "Artículo 168",
          title: "Apartarse por seguridad",
          body: "Emergencia no elimina el deber de informar.",
          guide: "Primero protege el vuelo; después documenta.",
          refs: ["RLAC 168–174", "LAC 35–37", "RLAC pp. 73–75 · LAC p. 25"],
          cards: [
            ["Se aparta", "De procedimientos por emergencia o seguridad."],
            ["Informa", "Al personal ATS sobre la situación."],
            ["Arriba", "Rinde informe escrito al comandante del aeródromo."],
          ],
          questions: [
            {
              q: "Tras apartarse de un procedimiento por seguridad, ¿qué exige el artículo 168 al arribo?",
              options: [
                "Nada adicional.",
                "Informe escrito al comandante del aeródromo.",
                "Solo una llamada al operador.",
              ],
              answer: 1,
              why: "Correcto. El deber de informar continúa al arribo.",
              wrong: "No. La fuente exige un informe escrito específico.",
            },
          ],
          hero: true,
        },
        {
          label: "Artículos 169–170",
          title: "Ámbito y excepción militar",
          body: "Quién cumple las reglas y cuándo puede apartarse una aeronave militar/naval.",
          guide: "No conviertas una excepción coordinada en una autorización general.",
          refs: ["RLAC 168–174", "LAC 35–37", "RLAC pp. 73–75 · LAC p. 25"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 169",
              "PIC en espacio bajo jurisdicción mexicana y aeronaves mexicanas en alta mar cumplen reglas generales de vuelo/tierra, IFR, VFR y ATS.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "El artículo abarca tanto operación nacional como determinadas operaciones en alta mar por matrícula mexicana.",
            ],
            [
              "EL REGLAMENTO DICE · RLAC 170",
              "Pilotos militares o navales pueden apartarse al actuar en sus atribuciones o áreas reservadas, previa coordinación con AFAC o ATS.",
            ],
            ["EN PALABRAS SIMPLES", "La coordinación previa es parte de la excepción."],
          ],
        },
        {
          label: "Artículo 171",
          title: "Límites que no se cruzan",
          body: "Alturas mínimas y separación entre aeronaves.",
          guide: "Recuerda la pareja horizontal y vertical.",
          refs: ["RLAC 168–174", "LAC 35–37", "RLAC pp. 73–75 · LAC p. 25"],
          cards: [
            ["610 m", "Separación horizontal mínima citada."],
            ["2,000 ft", "Equivalente horizontal que usa el artículo."],
            ["152 m", "Separación vertical mínima citada."],
            ["500 ft", "Equivalente vertical que usa el artículo."],
            [
              "EL REGLAMENTO DICE · RLAC 171",
              "No operar bajo alturas mínimas VFR/IFR, salvo despegue, aterrizaje, emergencia o autorización expresa de AFAC.\nNo acercarse a otra aeronave por debajo de las separaciones citadas, salvo aterrizaje o despegue en pistas paralelas.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Las excepciones son específicas y distintas para cada fracción.",
            ],
            [
              "2000 ↔ 500 · Plano ancho, plano alto",
              "Horizontal: 2,000 ft. Vertical: 500 ft. Asocia el número grande al plano horizontal, pero conserva también 610 m y 152 m.",
            ],
          ],
          questions: [
            {
              q: "¿La emergencia aparece como excepción expresa a la separación entre aeronaves de la fracción II?",
              options: ["Sí.", "No; esa fracción menciona pistas paralelas."],
              answer: 1,
              why: "Correcto. No traslades excepciones de una fracción a otra.",
              wrong:
                "Cuidado: la emergencia aparece en la fracción de alturas mínimas, no en la de separación.",
            },
          ],
        },
        {
          label: "Artículo 172",
          title: "Deberes en movimiento",
          body: "Vigilancia visual, rutas, derecho de paso, luces y autorización ATC.",
          guide: "Es una sola lista con varias capas de prevención.",
          refs: ["RLAC 168–174", "LAC 35–37", "RLAC pp. 73–75 · LAC p. 25"],
          cards: [
            [
              "Ver y evitar",
              "Vigilancia visual para evitar colisiones, cualquiera que sea la regla de vuelo o espacio, si la meteorología lo permite.\nI",
            ],
            [
              "Seguir lo publicado",
              "Trayectorias, altitudes y restricciones de velocidad de rutas/procedimientos en AIP.\nII",
            ],
            [
              "Operaciones especiales",
              "Lanzamiento, rociado, acrobacia, simulación, formación, globo, paracaídas y remolque según reglas/NOM.\nIII",
            ],
            [
              "Ceder paso",
              "Aeronaves aterrizando/final y aeronaves despegando/por despegar en maniobras.\nIV–V",
            ],
            ["Luces", "Operarlas conforme a las condiciones de las reglas de tránsito aéreo.\nVI"],
            [
              "Vuelo controlado",
              "Obtener autorización antes de salir, apegarse y pedir aprobación para cambios.\nVII",
            ],
          ],
          recall: [
            [
              "Sin mirar: enumera las seis familias de deberes del artículo 172.",
              "Vigilancia; rutas/altitudes/velocidad; operaciones especiales; derecho de paso; luces; autorización ATC y cambios aprobados.",
            ],
          ],
        },
        {
          label: "Artículos 173–174",
          title: "Interceptación y apoderamiento",
          body: "Dos situaciones distintas, dos remisiones distintas.",
          guide: "No las fundas en una sola regla.",
          refs: ["RLAC 168–174", "LAC 35–37", "RLAC pp. 73–75 · LAC p. 25"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 173",
              "La aeronave interceptada por autoridad competente observa los procedimientos de la Publicación de Información Aeronáutica del país.",
            ],
            ["EN PALABRAS SIMPLES", "Interceptación: la fuente operacional indicada es la AIP."],
            [
              "EL REGLAMENTO DICE · RLAC 174",
              "Ante apoderamiento ilícito, el PIC debe hacer lo posible por notificar a ATS conforme a NOM y reglas de tránsito aéreo.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "Apoderamiento ilícito: deber de notificación posible, sujeto a las circunstancias.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 35–36: marco de uso de servicios, espacio controlado, zonas y operaciones peligrosas.\nReglamento: RLAC 168–174: reportes, reglas aplicables, mínimos, deberes, interceptación y apoderamiento.\nDiferencia: La relación es temática; no existe equivalencia automática por número.",
            ],
            ["Explico la secuencia del artículo 168.", "Ready for recall:"],
            ["No traslado excepciones entre fracciones del 171.", "Ready for recall:"],
            ["Recuerdo 2,000 ft horizontal y 500 ft vertical.", "Ready for recall:"],
            ["Distingo interceptación de apoderamiento ilícito.", "Ready for recall:"],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/busqueda-salvamento-e-investigacion-de-accidentes-arts-175-a-187-8":
    {
      id: "rlac-08",
      folder: "08_SAR_Investigacion",
      name: "Búsqueda, salvamento e investigación",
      subtitle:
        "Planes SAR, alerta, notificación, socorro, Comisión investigadora y preservación de evidencia.",
      year: "Reglamento de la Ley de Aviación Civil",
      word: "RLAC 175–187",
      sources: ["RLAC 175–187", "LAC 79–82"],
      steps: [
        {
          label: "Artículos 175–179",
          title: "Red SAR",
          body: "Planes, coordinación, ayuda y centros de alerta.",
          guide: "Sigue la red: aeródromo, Secretaría, operadores, centros y torres.",
          refs: ["RLAC 175–187", "LAC 79–82", "RLAC pp. 75–79 · LAC pp. 51–54"],
          cards: [
            ["Plan", "SAR integrado al plan de emergencia del aeródromo."],
            ["Coordinar", "Comunicaciones, aeronaves y grupos de auxilio."],
            ["Ayudar", "Operadores prestan aeronaves a solicitud de la Secretaría."],
            ["Alertar", "Centros de área y torres coordinan comunicaciones/emergencias."],
            [
              "EL REGLAMENTO DICE · RLAC 175–179",
              "Acciones SAR se documentan en acta y son de interés público.\nServicio bajo control/dirección de la Secretaría, disponible 24 horas.\nAeronaves SAR requieren comunicaciones de socorro y localizador de emergencia conforme a la regulación aplicable.\nCentros de control de área son centros de alerta; torres coordinan emergencias cercanas al aeródromo.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "SAR es una red coordinada y documentada, no una acción improvisada.",
            ],
            ["24 h", "Disponibilidad diaria del servicio de búsqueda y salvamento."],
            [
              "Ley y Reglamento",
              "Ley: LAC 80: SAR es de interés público, obliga a participar y queda bajo dirección/control de la Secretaría.\nReglamento: RLAC 175–179: integra planes, brigadas, comunicaciones, disponibilidad y centros de alerta.\nDiferencia: El Reglamento desarrolla la organización operativa.",
            ],
          ],
          hero: true,
        },
        {
          label: "Artículos 180 y 180 Bis",
          title: "Notificar el suceso",
          body: "Cadena de aviso y personas obligadas.",
          guide:
            "Una noticia cierta activa la comunicación; varias funciones tienen deber expreso.",
          refs: ["RLAC 175–187", "LAC 79–82", "RLAC pp. 75–79 · LAC pp. 51–54"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 180",
              "Quien tenga noticia cierta de un accidente avisa a la autoridad más cercana de cualquier nivel; ésta comunica al comandante del aeródromo o representante de la Secretaría.\nAccidentes e incidentes nacionales, y los de aeronaves mexicanas fuera del país, deben notificarse a la Secretaría.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La cadena de aviso empieza incluso fuera del sector aeronáutico.",
            ],
            [
              "Operación",
              "Concesionarios, permisionarios, operadores y propietarios; tripulación de mando.\n180 Bis I–II",
            ],
            [
              "Mantenimiento",
              "Quien firmó liberación o efectuó instalación, mantenimiento, modificación, reparación, revisión o prueba.\n180 Bis III",
            ],
            [
              "Aeródromo y tierra",
              "Administrador/operaciones; combustible, hoja de embarque, carga/balance y remolque.\n180 Bis IV–V",
            ],
            ["ATS", "Personal de servicios de tránsito aéreo.\n180 Bis VI"],
          ],
          questions: [
            {
              q: "¿El personal que prepara carga y balance aparece entre las personas obligadas a notificar?",
              options: ["Sí.", "No."],
              answer: 0,
              why: "Correcto. Está dentro de operaciones en tierra del artículo 180 Bis.",
              wrong: "Sí aparece expresamente en el artículo 180 Bis.",
            },
          ],
        },
        {
          label: "Artículos 181–184",
          title: "Socorro y señales",
          body: "Acceso, llamada de socorro, señales a buques y frecuencias.",
          guide: "Aquí la precisión visual ayuda más que una pared de texto.",
          refs: ["RLAC 175–187", "LAC 79–82", "RLAC pp. 75–79 · LAC pp. 51–54"],
          cards: [
            ["Acordonar", "Autoridades custodian y permiten acceso SAR/investigadores."],
            ["Transmitir", "Tripulación retransmite socorro si la aeronave en peligro no puede."],
            ["Señalar", "Círculo, alabeos, luces de noche y guía al lugar."],
            [
              "Llevar",
              "Lista/carta de instalaciones y estaciones costeras con frecuencias de peligro.",
            ],
            [
              "EL REGLAMENTO DICE · RLAC 182–183",
              "El PIC actúa conforme a NOM al solicitar socorro o conocer otra aeronave en peligro.\nUna aeronave puede llamar a un buque: círculo, alabeos, luces nocturnas y dirección al accidente.\nEl buque sigue o indica imposibilidad con la bandera internacional “N” u otros medios disponibles.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La señal es una secuencia para captar atención, confirmar y guiar.",
            ],
          ],
          recall: [
            [
              "¿Qué cuatro acciones aéreas componen la señal al buque?",
              "Círculo; alabeos; luces de aterrizaje de noche; dirigirse al lugar y repetir hasta comprensión.",
            ],
          ],
        },
        {
          label: "Artículos 185–187",
          title: "Investigar para prevenir",
          body: "Comisión, recomendaciones, tripulación y preservación.",
          guide: "Investigación no equivale a asignación automática de culpa.",
          refs: ["RLAC 175–187", "LAC 79–82", "RLAC pp. 75–79 · LAC pp. 51–54"],
          cards: [
            [
              "EL REGLAMENTO DICE · RLAC 185",
              "La Comisión identifica causa probable, elabora informes y emite recomendaciones preventivas.\nLos sujetos obligados informan plazo y acciones de implementación o impedimentos.",
            ],
            [
              "EN PALABRAS SIMPLES",
              "La investigación produce aprendizaje operacional y seguimiento.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 81: objetivo preventivo; causa probable, factores y recomendaciones no implican culpa ni responsabilidad administrativa, civil o penal.\nReglamento: RLAC 185: composición técnica, informes, recomendaciones y seguimiento.\nDiferencia: La Ley aclara el propósito; el Reglamento desarrolla el trabajo de la Comisión.",
            ],
            [
              "Ley y Reglamento",
              "Ley: LAC 79: define accidente e incidente.\nReglamento: RLAC 186–187: retorno de tripulación y preservación/custodia para investigar.\nDiferencia: Definir el suceso y proteger la evidencia son pasos distintos.",
            ],
            [
              "Tripulación",
              "No vuelve a funciones de vuelo hasta autorización; puede existir autorización provisional condicionada, con los requisitos del artículo 186.\nRLAC 186",
            ],
            [
              "Sitio y restos",
              "Comandante de aeropuerto reúne elementos; Secretaría coordina antes de remover; operador/propietario preserva restos, registros y grabadores.\nRLAC 187",
            ],
          ],
          questions: [
            {
              q: "La identificación de causa probable implica automáticamente culpa penal.",
              options: ["Sí dice.", "No dice; la LAC 81 lo excluye expresamente."],
              answer: 1,
              why: "Correcto. Investigación preventiva no es asignación automática de culpa.",
              wrong: "No. La fuente diferencia investigación de determinación de responsabilidad.",
            },
          ],
        },
        {
          label: "Active recall",
          title: "Flujo completo",
          body: "De la aeronave en problemas a las recomendaciones.",
          guide: "Recupera el orden y luego ubica los artículos.",
          refs: ["RLAC 175–187", "LAC 79–82", "RLAC pp. 75–79 · LAC pp. 51–54"],
          cards: [
            ["Problema", "Socorro o noticia cierta."],
            ["Alerta", "Centro/torre y autoridades."],
            ["Búsqueda", "Coordinación y aeronaves."],
            ["Salvamento", "Rescate, asistencia y recuperación."],
            ["Preservación", "Acordonar, custodiar, conservar."],
            ["Investigación", "Comisión, causa probable e informes."],
            ["Prevención", "Recomendaciones y seguimiento."],
            ["Quién dirige SAR y su disponibilidad.", "Marca lo que puedes explicar:"],
            ["Quiénes deben notificar un accidente o incidente.", "Marca lo que puedes explicar:"],
            ["Cómo se solicita ayuda a una embarcación.", "Marca lo que puedes explicar:"],
            ["Por qué preservar restos, registros y grabadores.", "Marca lo que puedes explicar:"],
            ["Por qué investigación no equivale a culpa.", "Marca lo que puedes explicar:"],
          ],
          recall: [
            [
              "¿Cuándo se considera perdida una aeronave según la comparación con LAC 82?",
              "Por declaración del sujeto correspondiente o, salvo prueba en contrario, tras 30 días desde las últimas noticias sin conocer su paradero.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aviacion-civil/sanciones-arts-196-a-197-9": {
    id: "rlac-09",
    folder: "09_Sanciones",
    name: "Suspensión y cancelación",
    subtitle:
      "Cancelación de documentos, suspensión por condiciones de riesgo y diferencias con multa o revocación.",
    year: "Reglamento de la Ley de Aviación Civil",
    word: "RLAC 196–197",
    sources: ["RLAC 196–197", "LAC 88–90"],
    steps: [
      {
        label: "Mapa conceptual",
        title: "Cancelar no es suspender",
        body: "Dos efectos distintos dentro del Reglamento.",
        guide: "El verbo jurídico importa: no son sinónimos.",
        refs: ["RLAC 196–197", "LAC 88–90", "RLAC pp. 82–83 · LAC pp. 62–68"],
        cards: [
          [
            "Cancelación",
            "RLAC 196 permite cancelar licencias, psicofísicos, capacidades y ciertas autorizaciones/permisos por incumplimiento.\nRLAC 196",
          ],
          [
            "Suspensión",
            "RLAC 197 detiene servicios, operaciones o documentos cuando se actualizan condiciones específicas.\nRLAC 197",
          ],
          [
            "C ≠ S · Cancelar no es suspender",
            "La suspensión puede durar mientras persiste la condición; la cancelación sigue su propio procedimiento.",
          ],
        ],
        questions: [
          {
            q: "Una condición de riesgo detectada en verificación encaja primero en:",
            options: [
              "RLAC 196, cancelación automática.",
              "RLAC 197, suspensión.",
              "LAC 89, sin revisión del supuesto.",
            ],
            answer: 1,
            why: "Correcto. Es causa expresa de suspensión en RLAC 197 II.",
            wrong: "No. Distingue la causa de suspensión del supuesto general de cancelación.",
          },
        ],
        hero: true,
      },
      {
        label: "Artículo 196",
        title: "Cancelación",
        body: "Qué documentos alcanza y por qué.",
        guide: "No agregues revocación: este artículo habla de cancelación.",
        refs: ["RLAC 196–197", "LAC 88–90", "RLAC pp. 82–83 · LAC pp. 62–68"],
        cards: [
          [
            "EL REGLAMENTO DICE · RLAC 196",
            "AFAC puede cancelar licencias, certificados de aptitud psicofísica y capacidades.\nTambién ciertas autorizaciones y el permiso referido en el propio artículo.\nLa causa es incumplir Ley, Reglamento, NOM, reglas de tránsito aéreo u otras disposiciones técnico-administrativas.\nEl proceso se sujeta a la Ley Federal de Procedimiento Administrativo.",
          ],
          [
            "EN PALABRAS SIMPLES",
            "Existe una facultad de cancelación por incumplimiento normativo y un cauce procedimental.\nEl artículo no dice que toda infracción produzca automáticamente la misma consecuencia.",
          ],
        ],
        recall: [
          [
            "Menciona las tres categorías principales de documentos personales que puede cancelar AFAC.",
            "Licencias, certificados de aptitud psicofísica y capacidades.",
          ],
        ],
      },
      {
        label: "Artículo 197",
        title: "Causas de suspensión",
        body: "Nueve supuestos agrupados por función.",
        guide: "Agrupar ayuda a recordar sin deformar la lista.",
        refs: ["RLAC 196–197", "LAC 88–90", "RLAC pp. 82–83 · LAC pp. 62–68"],
        cards: [
          [
            "Aeronave/operación",
            "Falta de aeronavegabilidad o condiciones de riesgo detectadas en verificación.\nI–II",
          ],
          [
            "Título habilitante",
            "Servicios/talleres incumplen requisitos de concesión, asignación o permiso.\nIII",
          ],
          [
            "Personal",
            "Incapacidad psicofísica; abandono del puesto antes del relevo, salvo caso fortuito/fuerza mayor.\nIV–V",
          ],
          [
            "Institución/permiso",
            "Enseñanza o documentos fuera de requerimientos; incumplimiento del artículo 27.\nVI–VII",
          ],
          [
            "SMS",
            "Incumplimiento de obligaciones del Sistema de Gestión de Seguridad Operacional.\nVIII",
          ],
          [
            "PIC y tránsito",
            "Desobediencia a órdenes/procedimientos o riesgo a seguridad/integridad, según dictamen.\nIX",
          ],
          [
            "EL REGLAMENTO DICE · RLAC 197, cierre",
            "La suspensión subsiste mientras persistan las condiciones que la motivaron.\nAFAC establece medidas para restablecer las condiciones de seguridad requeridas.",
          ],
          [
            "EN PALABRAS SIMPLES",
            "La salida de la suspensión depende de corregir la condición, no solo de esperar.",
          ],
        ],
        questions: [
          {
            q: "¿La suspensión termina automáticamente después de un número fijo de días indicado en el artículo 197?",
            options: ["Sí, a los 30 días.", "No; subsiste mientras persistan las condiciones."],
            answer: 1,
            why: "Correcto. El artículo no fija aquí un plazo único.",
            wrong: "No existe ese plazo en la fuente estudiada.",
          },
        ],
      },
      {
        label: "Diferencias reales",
        title: "Ley ↔ Reglamento",
        body: "Multa, suspensión, cancelación y revocación no son equivalentes.",
        guide: "Aquí la comparación evita cuatro confusiones frecuentes.",
        refs: ["RLAC 196–197", "LAC 88–90", "RLAC pp. 82–83 · LAC pp. 62–68"],
        cards: [
          [
            "Ley y Reglamento",
            "Ley: LAC 88: multas a comandante/PIC por conductas tipificadas.\nReglamento: RLAC 197: suspensión por causas de seguridad y cumplimiento.\nDiferencia: Multa y suspensión pueden responder a supuestos distintos; no son sinónimos.",
          ],
          [
            "Ley y Reglamento",
            "Ley: LAC 89: multa residual y posible duplicación por reincidencia.\nReglamento: RLAC 196: cancelación de licencias/documentos por incumplimiento.\nDiferencia: Una multa general no equivale automáticamente a cancelación.",
          ],
          [
            "Ley y Reglamento",
            "Ley: LAC 90: revocación de la licencia del comandante en supuestos expresos.\nReglamento: RLAC 196: usa “cancelar” para documentos y permisos descritos.\nDiferencia: Se conservan los verbos de cada fuente; no se resuelve una equivalencia que el texto no afirma.",
          ],
        ],
        questions: [
          {
            q: "Una sanción económica prevista por la Ley debe llamarse:",
            options: ["Suspensión.", "Multa.", "Cancelación."],
            answer: 1,
            why: "Correcto. Usa el nombre que corresponde al efecto jurídico descrito.",
            wrong: "No. No conviertas los conceptos en equivalentes.",
          },
        ],
      },
      {
        label: "Active recall",
        title: "Sí dice / no dice",
        body: "Cierra con precisión terminológica.\n\nAlcance Connect respetado: no se añadieron RLAC 197 Bis, Ter, Quáter o Quinquies porque el temario termina en el artículo 197.",
        guide: "Lee el verbo, identifica la fuente y explica el efecto.",
        refs: ["RLAC 196–197", "LAC 88–90", "RLAC pp. 82–83 · LAC pp. 62–68"],
        cards: [
          ["Multa (LAC 88–89).", "Confirma que puedes distinguir:"],
          ["Revocación (LAC 90).", "Confirma que puedes distinguir:"],
          ["Cancelación (RLAC 196).", "Confirma que puedes distinguir:"],
          ["Suspensión (RLAC 197).", "Confirma que puedes distinguir:"],
        ],
        recall: [
          [
            "Completa: la suspensión subsiste hasta que ___.",
            "Dejen de persistir las condiciones que la motivaron; AFAC fija medidas para restablecer la seguridad.",
          ],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aeropuertos/clasificacion-de-aerodromos-art-6-1":
    {
      id: "Reglamento de la Ley de Aeropuertos-01",
      folder: "01_Clasificacion_Operacion",
      name: "Clasificación y operación",
      subtitle:
        "Learning Path FlightPath sobre clasificación y operación de aeródromos, artículo 6.",
      year: "Reglamento de la Ley de Aeropuertos",
      word: "Artículo 6",
      sources: ["Artículo fuente · 6"],
      steps: [
        {
          label: "01 · Despegue",
          title: "Antes de operar,haz coincidir las piezas.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Antes de operar,haz coincidir las piezas.",
              "El artículo 6 no se aprende como un párrafo. Se entiende como una decisión: aeródromo, servicio, aeronave y operación deben ser compatibles.FuenteArtículo 6Duración10–12 minMetaDecidir si puede operar",
            ],
          ],
          hero: true,
        },
        {
          label: "02 · Entiende",
          title: "La ecuación de operación",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "La ecuación de operación",
              "En una operación normal, todas las piezas deben corresponder. Si una falla, la operación no cumple la regla base. Aeródromo con concesión o permisoClasificación y categoríaServicio y aeronaveItinerario y rutaPlan aprobado, si es operador ¿Puede operar? La categoría también impone límites. En todo momento deben observarse las limitaciones técnicas y operacionales que se deriven de ella.",
            ],
          ],
        },
        {
          label: "03 · Relaciona",
          title: "La regla base, pieza por pieza",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "La regla base, pieza por pieza",
              "Fuera de una emergencia, transportistas y operadores aéreos únicamente pueden operar cuando se cumple esta cadena. Aeródromo civilCon respaldo para operarDebe contar con concesión o permiso. CorrespondenciaServicio + aeronaveLa clasificación y la categoría deben corresponder al servicio prestado y a la aeronave utilizada. Operación previstaItinerario + rutaLa operación debe corresponder también a itinerarios y rutas; para operadores, al plan de vuelo aprobado. Error común: tener un plan aprobado no reemplaza la correspondencia de clasificación, categoría, servicio, aeronave, itinerario o ruta.",
            ],
          ],
        },
        {
          label: "04 · Recuerda",
          title: "Fuera del aeródromo: tres puertas y una condición especial",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Fuera del aeródromo: tres puertas y una condición especial",
              "El segundo párrafo distingue los aterrizajes fuera de un aeródromo. Puerta 1EmergenciaTransportistas y operadores pueden efectuar el aterrizaje fuera de un aeródromo. Puerta 2Vuelo de auxilioEl artículo contempla expresamente este supuesto. Puerta 3Búsqueda y salvamentoTambién permite el aterrizaje en un lugar distinto a un aeródromo. Condición especial · Operadores aéreosCuando la naturaleza de la actividad o del evento hace inviable usar un aeródromoEl operador puede aterrizar fuera si además cuenta con plan de vuelo aprobado y aprobación previa de la Secretaría. Las tres condiciones deben reunirse. No generalices: la condición especial se refiere a operadores aéreos. El artículo no la formula para transportistas.",
            ],
          ],
        },
        {
          label: "05 · Aplica",
          title: "¿Puede operar aquí?",
          body: "Elige la respuesta que respeta todas las condiciones del artículo 6.",
          questions: [
            {
              q: "Operación normal compatible",
              options: ["Sí", "No", "Solo bajo condición especial"],
              answer: 0,
              why: "Sí. La cadena de correspondencia está completa. Artículo 6, primer párrafo.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Categoría que no corresponde",
              options: ["Sí", "No", "Solo bajo condición especial"],
              answer: 1,
              why: "No. Sin emergencia, la categoría debe corresponder a la aeronave y deben respetarse sus limitaciones. Artículo 6.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Vuelo de auxilio fuera de aeródromo",
              options: ["Sí", "No", "Solo bajo condición especial"],
              answer: 0,
              why: "Sí. El vuelo de auxilio es uno de los supuestos expresos para aterrizar fuera de aeródromo. Artículo 6, segundo párrafo.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Operador con actividad fuera de aeródromo",
              options: ["Sí", "No en ningún caso", "Solo bajo determinada condición"],
              answer: 2,
              why: "Solo si completa las tres condiciones: inviabilidad por la naturaleza de la actividad o evento, plan aprobado y aprobación previa de la Secretaría. Artículo 6.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "06 · Detecta el error",
          title: "Sí dice / No dice",
          body: "Evita extender la regla más allá de lo que expresa el artículo.",
          questions: [
            {
              q: "“En una emergencia, la regla base admite una excepción.”",
              options: ["Sí dice", "No dice"],
              answer: 0,
              why: "Sí dice. El primer párrafo comienza con la excepción para casos de emergencia.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "“Cualquier transportista puede aterrizar fuera del aeródromo si tiene plan de vuelo aprobado.”",
              options: ["Sí dice", "No dice"],
              answer: 1,
              why: "No dice. Para transportistas, el artículo menciona emergencia, auxilio, búsqueda y salvamento; la condición especial se refiere a operadores.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "“Las limitaciones técnicas y operacionales de la categoría deben observarse en todo momento.”",
              options: ["Sí dice", "No dice"],
              answer: 0,
              why: "Sí dice, de forma expresa, al cierre del primer párrafo.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "07 · Active recall",
          title: "Reconstruye la decisión",
          body: "Sin mirar atrás, explica en tus palabras qué debe corresponder antes de una operación normal. Completa la reglaAeródromo con concesión o permiso + ______ + servicio y aeronave + ______ + plan aprobado cuando se trate de operador.Respuesta: clasificación y categoría; itinerario y ruta. Además, deben observarse en todo momento las limitaciones técnicas y operacionales derivadas de la categoría. AterrizajeYa puedes decidir.Completaste la lógica del artículo 6 sin convertirla en una lista para memorizar.Continuar al LP 02",
          questions: [
            {
              q: "¿Qué conjunto describe la condición especial del operador para aterrizar fuera de aeródromo?",
              options: [
                "Solo plan aprobado",
                "Tres condiciones acumulativas",
                "Concesión del aeródromo",
              ],
              answer: 1,
              why: "Correcto: inviabilidad por la naturaleza de la actividad o evento + plan aprobado + aprobación previa de la Secretaría.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Una operación normal cumple ruta e itinerario, pero la categoría no corresponde a la aeronave. ¿Resultado?",
              options: ["Puede operar", "No puede operar"],
              answer: 1,
              why: "No puede operar bajo la regla normal: todas las piezas deben corresponder.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
          recall: [
            [
              "Completa la regla",
              "Respuesta: clasificación y categoría; itinerario y ruta. Además, deben observarse en todo momento las limitaciones técnicas y operacionales derivadas de la categoría.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aeropuertos/operaciones-arts-104-a-115-2": {
    id: "Reglamento de la Ley de Aeropuertos-02",
    folder: "02_Operaciones_Aerodromo",
    name: "Operaciones en el aeródromo",
    subtitle: "Learning Path FlightPath sobre operaciones en el aeródromo, artículos 104 a 115.",
    year: "Reglamento de la Ley de Aeropuertos",
    word: "Artículos 104 a 115",
    sources: ["Artículos fuente · 104 a 115"],
    steps: [
      {
        label: "01 · Despegue",
        title: "Un aeródromo,muchas responsabilidades.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Un aeródromo,muchas responsabilidades.",
            "Pista, calle de rodaje y plataforma no son “más o menos lo mismo”. Cada área activa reglas y responsables distintos. Zona demantenimiento✈▣● ● ● PistaCalle de rodajePlataformaAeronaveVehículoPasajeros FuenteArtículos 104–115ExcluidoArtículo 116MetaIdentificar regla y responsable",
          ],
        ],
        hero: true,
      },
      {
        label: "02 · Entiende",
        title: "Reportar y usar cada área correctamente",
        body: "Artículo 104El manifiesto operativoDespués de aterrizar o antes de despegar, el transportista u operador manifiesta, bajo protesta de decir verdad: número de pasajeros, tipo de aeronave, destino u origen y la demás información requerida en los formatos publicados por la Secretaría en el Diario Oficial de la Federación. Administrador aeroportuarioRecibir y supervisarEs responsable de que todos los transportistas y operadores le entreguen el manifiesto y de supervisar la veracidad de la información, sin perjuicio de las atribuciones de la Secretaría. Artículo 105Cada área, para su finalidadLas aeronaves solo pueden usar las áreas del aeródromo para los fines a que están destinadas. La excepción es una emergencia declarada a bordo, cuando la circunstancia lo justifica. Si se usa la excepciónReporte inmediatoEl comandante o piloto al mando presenta de inmediato un reporte escrito y firmado ante la comandancia, con circunstancias, causas y la información relacionada que esta solicite. Artículo 106Aeródromo acuáticoSu permisionario establece las medidas necesarias para garantizar la seguridad del movimiento de aeronaves y del tránsito marítimo.Remisión El artículo remite a disposiciones marítimas y portuarias; aquí no se desarrollan. Artículo 107Ala rotativaEl vuelo dentro del aeródromo civil se realiza únicamente en áreas designadas y conforme a procedimientos de las normas básicas de seguridad publicados en la PIA.El administrador toma medidas para evitar riesgos u obstáculos. Si la operación afecta seguridad o eficiencia, la Secretaría puede suspenderla o limitarla, por sí o a petición del administrador, y la medida se publica en el DOF y la PIA.",
        questions: [
          {
            q: "Una aeronave utiliza una zona para una finalidad distinta, sin emergencia declarada.",
            options: ["Uso correcto", "Uso incorrecto"],
            answer: 1,
            why: "Uso incorrecto. El artículo 105 solo prevé la excepción por emergencia declarada a bordo cuando se justifique.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Existe emergencia declarada a bordo; la circunstancia justifica el uso y el piloto presenta de inmediato el reporte escrito y firmado.",
            options: ["Sí, bajo la excepción", "No"],
            answer: 0,
            why: "Uso correcto bajo la excepción y con el reporte exigido. Artículo 105.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "03 · Relaciona",
        title: "¿Quién tiene la responsabilidad?",
        body: "El artículo 108 cambia la regla según exista o no servicio de control de tránsito aéreo. Con servicio de controlSeguir instrucciones ATSTodo movimiento de una aeronave dentro de pistas y calles de rodaje debe apegarse a las instrucciones del prestador de los servicios de control de tránsito aéreo. Sin dicho servicioComandante o piloto al mandoEl movimiento de la aeronave es responsabilidad del comandante o piloto al mando. Regla que siempre acompaña el movimiento: toda aeronave que por cualquier medio se encuentre en movimiento dentro del aeródromo civil debe mantener encendidas sus luces de navegación.",
        questions: [
          {
            q: "La aeronave se mueve en pistas y calles de rodaje de un aeródromo con servicio de control.",
            options: ["Prestador ATS: instrucciones", "Administrador aeroportuario"],
            answer: 0,
            why: "Debe apegarse a las instrucciones del prestador del servicio de control de tránsito aéreo. Artículo 108.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "El aeródromo no cuenta con ese servicio.",
            options: ["Prestador ATS", "Comandante o piloto al mando"],
            answer: 1,
            why: "El movimiento es responsabilidad del comandante o piloto al mando. Artículo 108.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "La aeronave está siendo movida por otro medio dentro del aeródromo.",
            options: ["Luces encendidas", "Luces opcionales"],
            answer: 0,
            why: "Debe mantener encendidas las luces de navegación; la regla aplica al movimiento por cualquier medio. Artículo 108.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "04 · Responsabilidades",
        title: "Remover el riesgo y responder por el daño",
        body: "Artículo 109Primera responsabilidadEl transportista u operador retira cualquier aeronave que constituya un riesgo u obstruya el tránsito aéreo o la operación del aeródromo. Accidente o incidenteOrden del comandanteEl responsable remueve la aeronave inmediatamente después de que el comandante de aeródromo lo ordene. Si no obedece en el plazoEl administrador ejecuta la remociónEl comandante puede ordenar al administrador que la efectúe, directamente o mediante un prestador, conforme a las instrucciones del comandante y con seguridad. El costo de movimiento y estancia corresponde al responsable de la aeronave. Asegurada o decomisadaDepositario o interventorDurante ese tiempo, responde de acatar las órdenes de remoción y cubrir los gastos de traslado y, en su caso, estancia. Artículo 110: si el administrador presume el abandono de una aeronave, informa por escrito al comandante. El punto remite al artículo 77 de la Ley de Aviación Civil; esa disposición no se desarrolla aquí. Artículo 111Daños a plataforma, calles de rodaje, pistas o tercerosLos prestadores de servicios aeroportuarios y complementarios toman medidas para evitar daños. Si se producen, el prestador responsable cubre gastos, reparaciones, reposición o indemnización a las partes afectadas.",
        questions: [
          {
            q: "Un prestador de servicio daña la plataforma durante su operación.",
            options: ["Paga el administrador", "Responde el prestador"],
            answer: 1,
            why: "El prestador responsable cubre los gastos, reparaciones, reposición o indemnización. Artículo 111.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "05 · Plataforma",
        title: "¿Se puede hacer en plataforma?",
        body: "El artículo 112 separa una excepción controlada de trabajos que nunca se realizan ahí. Permitido solo por fuerza mayorMantenimiento, reparación y prueba a baja potenciaExige precauciones para no dañar personas, instalaciones o equipos; ajuste a las reglas de operación; y consentimiento del administrador, quien notifica al comandante. En ningún casoTrabajo mayor o limpieza exteriorNo pueden realizarse mantenimiento o reparación mayores, ni labores de conservación o limpieza exterior de las aeronaves.",
        questions: [
          {
            q: "Por fuerza mayor se requiere una reparación; hay precauciones, se cumplen reglas y existe consentimiento del administrador.",
            options: ["Sí, excepcionalmente", "No"],
            answer: 0,
            why: "Sí, siempre que no sea reparación mayor y el administrador notifique al comandante. Artículo 112.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Se propone mantenimiento mayor con todas las precauciones.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. El mantenimiento o reparación mayores están prohibidos en plataforma en todos los casos. Artículo 112.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Se desea probar motores a alta potencia por fuerza mayor.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. La excepción solo menciona pruebas de motores a baja potencia. Artículo 112.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Se propone limpieza exterior de la aeronave.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. Las labores de conservación o limpieza exterior no se realizan en plataforma. Artículo 112.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "06 · Flujo seguro",
        title: "Pasajeros y carga: cada movimiento en su lugar",
        body: "Artículo 113Pasajeros a pieRegla general: no deben transitar a pie en plataformas. Excepción: aeródromos que por su categoría no cuenten con abordadores mecánicos.En la excepción, el transportista conduce a los pasajeros al edificio terminal y sigue los procedimientos de las reglas de operación. Artículo 114Carga y descargaSe realiza dentro de las áreas destinadas para ese fin, conforme a las reglas de operación del aeródromo y a las limitaciones establecidas por las autoridades competentes.",
        questions: [
          {
            q: "Un aeródromo no cuenta con abordadores mecánicos por su categoría. El transportista conduce a los pasajeros y sigue los procedimientos.",
            options: ["Permitido bajo la excepción", "Siempre prohibido"],
            answer: 0,
            why: "Corresponde a la excepción del artículo 113, con responsabilidad del transportista.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "La carga se descarga fuera del área destinada, aunque la maniobra parezca más rápida.",
            options: ["Permitido", "No permitido"],
            answer: 1,
            why: "No permitido. La carga y descarga debe hacerse en las áreas destinadas y conforme a reglas y limitaciones. Artículo 114.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "07 · Checklist",
        title: "¿Puedo encender motores?",
        body: "Para aeronaves estacionadas en plataformas y calles de rodaje, los cinco requisitos del artículo 115 deben reunirse. IPersonal técnico aeronáutico facultadoLa maniobra la realiza quien está facultado para ello. IIAeronave calzada y frenadaAmbas condiciones deben estar presentes. IIIFaro giratorio prendido IVManiobra sin riesgoNo debe constituir riesgo para personas o bienes en el área. VProcedimientos del aeródromoDeben respetarse. Situaciones prohibidas Dentro de un hangarDurante suministro de combustibleDurante embarque de pasajeros El artículo añade una salvedad para casos previstos en las normas básicas de seguridad. Este punto remite a otra disposición; no se desarrolla aquí.",
        questions: [
          {
            q: "La aeronave está calzada y frenada; el faro está prendido y no hay riesgo, pero quien inicia no es personal técnico aeronáutico facultado.",
            options: ["Sí puede", "No puede"],
            answer: 1,
            why: "No puede. Si falta uno de los cinco requisitos, no se reúne el checklist del artículo 115.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "08 · Active recall",
        title: "Reconstruye antes de evaluar",
        body: "Selecciona solo los cinco elementos que pertenecen al checklist del artículo 115. AterrizajeEl mapa ya tiene reglas.Ahora puedes ubicar la acción, identificar al responsable y detectar cuándo una excepción deja de aplicar.Continuar al LP 03",
        questions: [
          {
            q: "¿Quién supervisa la veracidad del manifiesto del artículo 104?",
            options: ["Administrador aeroportuario", "Comandante de aeródromo", "Transportista"],
            answer: 0,
            why: "El administrador aeroportuario, sin perjuicio de las atribuciones de la Secretaría.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿Qué ocurre si el responsable no remueve una aeronave en el plazo fijado?",
            options: ["El comandante ordena la remoción", "Se mantiene indefinidamente"],
            answer: 0,
            why: "El comandante puede ordenar al administrador efectuar la remoción; los costos recaen en el responsable.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "En un aeródromo sin servicio de control, ¿quién responde por el movimiento?",
            options: ["Prestador ATS", "Comandante o piloto al mando"],
            answer: 1,
            why: "Comandante o piloto al mando, conforme al artículo 108.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aeropuertos/control-de-acceso-art-156-3": {
    id: "Reglamento de la Ley de Aeropuertos-03",
    folder: "03_Control_Acceso",
    name: "Control de acceso",
    subtitle:
      "Learning Path FlightPath sobre control de acceso a zonas restringidas, artículo 156.",
    year: "Reglamento de la Ley de Aeropuertos",
    word: "Artículo 156",
    sources: ["Artículo fuente · 156"],
    steps: [
      {
        label: "01 · Despegue",
        title: "No basta con llegar.Hay que cumplir la condición.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "No basta con llegar.Hay que cumplir la condición.",
            "El artículo 156 distingue tres grupos. Cada uno accede a zonas restringidas por una ruta diferente.FuenteArtículo 156Grupos3 rutas de accesoMetaDecidir quién entra",
          ],
        ],
        hero: true,
      },
      {
        label: "02 · Entiende",
        title: "La ruta de acceso",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "La ruta de acceso",
            "El artículo regula quién puede llegar a la zona restringida y qué debe cumplir. No define otras zonas ni amplía el recorrido. TerminalPunto de controlZona restringidaPlataforma Grupo 1Personas que laboran y vehículosIdentificación vigente.Autorización para la zona específica.Portarla y mantenerla visible. Grupo 2TripulantesSolo para embarque y desembarque.Uniforme.Revisión previa.Identificación vigente de la aerolínea, visible. Grupo 3PasajerosSolo para embarque y desembarque.Revisión previa.Reunir los requisitos establecidos.",
          ],
        ],
      },
      {
        label: "03 · Personas y vehículos",
        title: "La identificación abre una zona específica",
        body: "No es una autorización genérica: debe estar vigente y autorizar el acceso a la zona correspondiente. CondiciónVigente + específicaToda persona que labore o vehículo que transite en zonas restringidas debe contar con esa identificación. ResponsabilidadPortar y mantener visibleEl titular de la identificación responde de portarla y mantenerla visible.",
        questions: [
          {
            q: "Un vehículo intenta transitar sin identificación vigente.",
            options: ["Sí puede", "No puede"],
            answer: 1,
            why: "No puede. El vehículo debe contar con identificación vigente para la zona específica. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Una persona trabaja en el aeródromo, pero su identificación no autoriza esa zona.",
            options: ["Sí puede", "No puede"],
            answer: 1,
            why: "No puede. La identificación debe autorizar la zona específica correspondiente. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "04 · Foco especial",
        title: "Tripulación: cinco condiciones",
        body: "El uniforme y la identificación no bastan por separado. La finalidad, la revisión y la visibilidad también forman parte de la regla. 1Finalidad limitadaAcceso únicamente para efectuar el embarque y desembarque de la aeronave. 2Uniforme 3Revisión previa 4Identificación vigente de la aerolínea 5Portarla y mantenerla visibleDurante todo el tiempo dentro de esas zonas.",
        questions: [
          {
            q: "Tripulante con uniforme e identificación vigente, pero aún sin revisión previa.",
            options: ["Sí", "No en ningún caso", "Solo al completar la condición"],
            answer: 2,
            why: "Solo después de la revisión previa y para embarque o desembarque, manteniendo visible la identificación. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Tripulante uniformado que no cuenta con identificación vigente de la aerolínea.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. Debe contar con identificación vigente de la aerolínea. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Tripulante revisado, uniformado, con identificación vigente y visible, que accede para efectuar el embarque.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. El supuesto reúne finalidad y requisitos del artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "05 · Pasajeros",
        title: "Acceso para embarcar o desembarcar",
        body: "Los pasajeros únicamente acceden a zonas restringidas con esa finalidad, previa revisión y siempre que reúnan los requisitos establecidos. No agregues requisitos. El artículo 156 dice “los requisitos establecidos”, pero no los enumera. Esta materia no los completa con otras disposiciones.",
        questions: [
          {
            q: "Un pasajero intenta entrar antes de la revisión.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. El acceso exige revisión previa y los demás requisitos. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Un pasajero ya fue revisado, reúne los requisitos establecidos y accede para embarcar.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Reúne finalidad, revisión previa y requisitos. Artículo 156.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "06 · Active recall",
        title: "Reconstruye las tres rutas",
        body: "Selecciona solo lo que corresponde a tripulantes. AterrizajeAcceso concedido: con condiciones.Ya distingues las rutas de personas y vehículos, tripulantes y pasajeros sin importar requisitos de otros artículos.Continuar al LP 04",
        questions: [
          {
            q: "¿Qué distingue la identificación de una persona que labora o de un vehículo?",
            options: ["Vigencia y zona específica", "Acceso a cualquier zona"],
            answer: 0,
            why: "Debe estar vigente y autorizar la zona específica correspondiente.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿Quién debe mantener visible la identificación dentro de la zona?",
            options: ["El titular", "El punto de control"],
            answer: 0,
            why: "El titular es responsable de portarla y mantenerla visible; el artículo reitera esa responsabilidad para tripulantes.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-la-ley-de-aeropuertos/autoridad-aeroportuaria-art-169-4": {
    id: "Reglamento de la Ley de Aeropuertos-04",
    folder: "04_Autoridad_Aeroportuaria",
    name: "Autoridad aeroportuaria",
    subtitle:
      "Learning Path FlightPath sobre atribuciones del comandante de aeródromo, artículo 169.",
    year: "Reglamento de la Ley de Aeropuertos",
    word: "Artículo 169",
    sources: ["Artículo fuente · 169"],
    steps: [
      {
        label: "01 · Despegue",
        title: "No memorices diez fracciones.Reconoce la acción.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "No memorices diez fracciones.Reconoce la acción.",
            "El artículo 169 reúne las atribuciones del comandante de aeródromo. Las agruparemos por verbos sin cambiar su contenido.FuenteArtículo 169FraccionesI a XMetaIdentificar atribuciones",
          ],
        ],
        hero: true,
      },
      {
        label: "02 · Entiende",
        title: "Radar de atribuciones",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Radar de atribuciones",
            "Ocho verbos sirven como mapa. La fracción sigue siendo la referencia exacta. I y IVVerificarNormas, condiciones, sistemas, procedimientos, equipos y personal. IIConocerActos y hechos que incidan o puedan incidir en operación y seguridad. III y VIICoordinarMedidas necesarias y órganos locales que preside. IIIProtegerVida humana, infraestructura aeroportuaria y aeronaves. VReportarIntegrar resultados de verificaciones para que la Secretaría proceda. VI y VIIIOrdenarEmisión de NOTAM y suspensión temporal procedente. IXInvestigarOrdenar medidas para que se investiguen incidentes o accidentes. VIIISuspenderTotal o parcialmente y de manera temporal, cuando resulte procedente. Fracción X: también contempla otras atribuciones señaladas en diversas disposiciones. Este punto remite a otras fuentes; no se desarrollan aquí.",
          ],
        ],
      },
      {
        label: "03 · Verificar y conocer",
        title: "Del cumplimiento al hecho operativo",
        body: "Fracción IVerificar cumplimientoDe la Ley, el Reglamento, el programa local de seguridad o medidas de seguridad, condiciones de concesión o permiso, y las normas, reglamentos y disposiciones aplicables que sean competencia de la Secretaría. Fracción IIConocer actos y hechosTodos los que incidan o puedan incidir en la operación y seguridad de los aeródromos civiles de su adscripción. Fracción IVVerificar preparaciónSistemas y procedimientos de seguridad actualizados y operativos; equipos de emergencia en condiciones de uso; personal capacitado y suficiente para operarlos. ClaveVerificar no es administrar todoEl artículo asigna controles específicos al comandante, no todas las funciones de los demás roles del aeródromo.",
        questions: [
          {
            q: "Verificar que los equipos de emergencia estén en condiciones de uso.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Es una atribución expresa de la fracción IV.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Conocer un hecho que pueda afectar la seguridad del aeródromo.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Corresponde a la fracción II.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "04 · Coordinar y reportar",
        title: "Preservar, presidir e integrar resultados",
        body: "Fracción IIICoordinar e instrumentarLas medidas necesarias para preservar vida humana y seguridad de infraestructura aeroportuaria y aeronaves. Fracción VIntegrar el reporteDel resultado de sus verificaciones, para que la Secretaría proceda conforme a las disposiciones aplicables. Fracción VIIPresidirEl comité local de seguridad aeroportuaria y la comisión coordinadora de autoridades.",
        questions: [
          {
            q: "Coordinar medidas necesarias para proteger vida humana e infraestructura aeroportuaria.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Corresponde a la fracción III.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "05 · Ordenar e investigar",
        title: "Acciones de autoridad, con límites precisos",
        body: "Fracción VIOrdenar NOTAMPuede ordenar la emisión de las NOTAM que corresponda. Fracción VIIISuspender temporalmenteTotal o parcialmente las operaciones del aeródromo civil, cuando en términos de la Ley y el Reglamento resulte procedente. Fracción IXOrdenar medidas de investigaciónPara que se investigue todo incidente o accidente con aeronaves, vehículos terrestres o personas dentro de los límites de los aeródromos de su jurisdicción. No confundas los roles EscenarioRol que corresponde en esta materiaFuenteSupervisar la veracidad del manifiestoAdministrador aeroportuarioArt. 104Dar instrucciones de movimiento en pistas y calles con controlPrestador ATSArt. 108Entregar el manifiesto operativoTransportista u operadorArt. 104Ordenar NOTAM o suspensión temporal procedenteComandante de aeródromoArt. 169, VI y VIII",
        questions: [
          {
            q: "Ordenar la emisión de una NOTAM que corresponda.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Fracción VI.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Suspender temporalmente parte de las operaciones cuando resulte procedente en términos de la Ley y el Reglamento.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Fracción VIII: suspensión temporal total o parcial.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "Ordenar las medidas conducentes para investigar un incidente dentro del aeródromo de su jurisdicción.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Fracción IX. Observa el verbo exacto: ordena las medidas para que se realice la investigación.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "06 · Active recall",
        title: "¿Puede hacerlo el comandante?",
        body: "Primero reconstruye el radar; después decide en los escenarios. Explica en tus palabras¿Cuál es la diferencia entre “investigar” como categoría pedagógica y la atribución exacta de la fracción IX?La fracción IX no dice simplemente que el comandante investigue: le atribuye ordenar las medidas conducentes para que se realice la investigación de incidentes o accidentes dentro del ámbito descrito. Aterrizaje finalReconoces la atribución y su límite.Terminaste los cuatro Learning Paths del Reglamento de la Ley de Aeropuertos dentro del alcance Connect.Volver al mapa general",
        questions: [
          {
            q: "El comandante integra el resultado de sus verificaciones para que la Secretaría proceda.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Fracción V.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "El comandante supervisa la veracidad de todos los manifiestos del artículo 104.",
            options: ["Sí", "No"],
            answer: 1,
            why: "No. Ese escenario pertenece al administrador aeroportuario, no a una atribución del artículo 169.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "El comandante preside el comité local de seguridad aeroportuaria.",
            options: ["Sí", "No"],
            answer: 0,
            why: "Sí. Fracción VII.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
        recall: [
          [
            "Explica en tus palabras",
            "La fracción IX no dice simplemente que el comandante investigue: le atribuye ordenar las medidas conducentes para que se realice la investigación de incidentes o accidentes dentro del ámbito descrito.",
          ],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-medicina-de-aviacion-civil/requisitos-generales-de-aptitud-psicofisica-art-13-1":
    {
      id: "Reglamento de Medicina de Aviación Civil-01",
      folder: "01_Requisitos_Generales_de_Aptitud_Psicofisica",
      name: "Requisitos Generales de Aptitud Psicofísica",
      subtitle:
        "Learning Path FlightPath sobre el artículo 13 del Reglamento de Medicina de Aviación Civil.",
      year: "Reglamento de Medicina de Aviación Civil",
      word: "Artículo 13",
      sources: [
        "Fuente única: Reglamento de Medicina de Aviación Civil, artículo 13. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
      ],
      steps: [
        {
          label: "01 · Despegue",
          title: "Aptitud psicofísica: la regla de interferencia.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Aptitud psicofísica: la regla de interferencia.",
              "El artículo 13 exige que la persona solicitante esté exenta de determinadas condiciones cuando sean susceptibles de causar una deficiencia funcional que probablemente interfiera con la operación segura de una aeronave o con el buen desempeño de sus funciones. FuenteArtículo 13EnfoqueRequisito regulatorioNo esDiagnóstico médico Misión 1 · Fija el criterioNo basta con nombrar una condición.La pregunta regulatoria del artículo es si podría causar una deficiencia funcional que probablemente interfiera con la operación segura o el buen desempeño.Fuente única: Reglamento de Medicina de Aviación Civil, artículo 13. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          hero: true,
        },
        {
          label: "02 · Entiende",
          title: "Cuatro grupos. Una sola pregunta.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Cuatro grupos. Una sola pregunta.",
              "Condición físicaDeformidadCongénita o adquirida. IncapacidadActiva o latenteAguda o crónica. Lesión / secuelaHerida o lesiónO secuela de alguna intervención quirúrgica. Medicamentos / efectosEfecto o efecto secundarioDe medicamento terapéutico, diagnosticado o preventivo; prescrito o no prescrito. ?Pregunta constante: ¿podría ser susceptible de causar una deficiencia funcional que probablemente interfiera con la operación segura de una aeronave o con el buen desempeño de sus funciones? !El personal médico debe poner atención especial al uso de hierbas medicinales o modalidades de tratamientos alternativos respecto de posibles efectos secundarios.",
            ],
          ],
        },
        {
          label: "03 · Relaciona",
          title: "Lee la regla como una secuencia.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Lee la regla como una secuencia.",
              "1 · Categoría del artículoDeformidad, incapacidad, herida o lesión / secuela, o efecto de medicamento.→2 · Posible deficiencia funcionalDebe ser susceptible de causarla.→3 · Interferencia probableCon operación segura o buen desempeño. Error comúnEl artículo no pide diagnosticar.Tampoco enumera patologías concretas. Enseña un requisito y el criterio de interferencia funcional relevante.",
            ],
          ],
        },
        {
          label: "04 · Recuerda",
          title: "¿Sí dice o no dice?",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿El artículo 13 enumera deformidad congénita o adquirida?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo si es crónica"],
              answer: 0,
              why: "Correcto. Está en la fracción I del artículo 13.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 13 explica enfermedades concretas y su diagnóstico?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo para aspirantes"],
              answer: 1,
              why: "Correcto. No enumera enfermedades ni enseña a diagnosticarlas.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 13 pide atención especial a hierbas medicinales y tratamientos alternativos por posibles efectos secundarios?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo si están prescritos"],
              answer: 0,
              why: "Correcto. Lo establece el último párrafo del artículo 13.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "05 · Aplica",
          title: "Aplica sin convertir la regla en consejo médico.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "Una persona toma un medicamento prescrito cuyo efecto puede causar una deficiencia funcional relevante. ¿El artículo 13 considera esa categoría?",
              options: ["ASí", "BNo", "CSolo en renovación"],
              answer: 0,
              why: "Correcto. Incluye medicamentos prescritos o no prescritos cuando se cumple el criterio funcional.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Se pregunta si una enfermedad específica permite volar. ¿El artículo 13 permite decidirlo con esa sola pregunta?",
              options: ["ASí, siempre", "BNo dice; no se diagnostica aquí", "CSolo por edad"],
              answer: 1,
              why: "Correcto. El Learning Path se limita a la regla regulatoria.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "El personal médico advierte uso de hierbas medicinales. ¿Qué exige el artículo 13?",
              options: [
                "AIgnorarlo",
                "BSuspenderlo automáticamente",
                "CPoner atención especial a posibles efectos secundarios",
              ],
              answer: 2,
              why: "Correcto. Esa es la regla expresa.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "06 · Evaluación",
          title: "Comprueba lo esencial del artículo 13.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿Qué dos ámbitos puede afectar la deficiencia funcional descrita en el artículo 13?",
              options: [
                "ALa operación segura o el buen desempeño de las funciones",
                "BLa comodidad o la velocidad de trámite",
                "CSolo la operación de aeronaves",
              ],
              answer: 0,
              why: "Correcto. Son los dos ámbitos expresos del artículo 13.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿Cuál pertenece a las categorías expresas?",
              options: [
                "AUna recomendación médica externa",
                "BSecuela de alguna intervención quirúrgica",
                "CUna opinión de un tercero",
              ],
              answer: 1,
              why: "Correcto. Está en la fracción III.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Respecto de medicamentos, ¿qué cubre el texto?",
              options: [
                "ASolo medicamentos prescritos",
                "BSolo medicamentos preventivos",
                "CEfectos o efectos secundarios de los tipos señalados, prescritos o no prescritos",
              ],
              answer: 2,
              why: "Correcto. Ese es el alcance de la fracción IV.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "07 · Recupera",
          title: "Reconstruye la regla sin mirar atrás.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Reconstruye la regla sin mirar atrás.",
              "Explica con tus palabras las cuatro categorías y la pregunta de interferencia que las conecta. Comprueba tu respuesta:Mencioné deformidad, incapacidad, lesión / secuela y efectos de medicamentos.Incluí la posible deficiencia funcional.Cerré con operación segura o buen desempeño.No añadí diagnósticos ni patologías concretas. Tu texto no se envía ni se guarda fuera de este archivo.",
            ],
          ],
        },
        {
          label: "08 · Aterrizaje",
          title: "Una regla clara para recordar.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Una regla clara para recordar.",
              "Artículo 13Condición prevista↓¿Puede causar una deficiencia funcional que probablemente interfiera?↓Operación segura o buen desempeño Puedo nombrar las cuatro categorías.Puedo explicar el criterio de interferencia.Sé que esto no es consejo médico.Fuente única: Reglamento de Medicina de Aviación Civil, artículo 13. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-medicina-de-aviacion-civil/evaluacion-medica-art-14-2": {
    id: "Reglamento de Medicina de Aviación Civil-02",
    folder: "02_Como_se_realiza_la_Evaluacion_Medica",
    name: "Cómo se realiza la Evaluación Médica",
    subtitle:
      "Learning Path FlightPath sobre el artículo 14 del Reglamento de Medicina de Aviación Civil.",
    year: "Reglamento de Medicina de Aviación Civil",
    word: "Artículo 14",
    sources: [
      "Fuente única: Reglamento de Medicina de Aviación Civil, artículo 14. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
    ],
    steps: [
      {
        label: "01 · Despegue",
        title: "Cómo se realiza la evaluación médica.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Cómo se realiza la evaluación médica.",
            "El artículo 14 responde tres preguntas: quién puede realizar la evaluación, qué requisito de vigencia debe cumplir y qué componentes comprende para todas las clases.FuenteArtículo 14ClaveNombramiento o autorización vigenteMétodoMapa por categorías Misión 1Identifica estructura, no finalidad clínica.Aprenderás qué integra la evaluación, sin explicar para qué sirve cada prueba ni interpretar resultados.Fuente única: Reglamento de Medicina de Aviación Civil, artículo 14. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
          ],
        ],
        hero: true,
      },
      {
        label: "02 · Quién puede",
        title: "Solo tres figuras, con vigencia.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Solo tres figuras, con vigencia.",
            "01Personas médicas evaluadorasDeben contar con nombramiento vigente, según corresponda.02Personas médicas examinadorasDeben contar con nombramiento vigente, según corresponda.03Personas médicas examinadoras autorizadasDeben contar con autorización vigente, según corresponda. !El artículo 14 dice que la evaluación únicamente será realizada por estas personas. Aquí no se desarrollan requisitos profesionales de artículos posteriores.",
          ],
        ],
      },
      {
        label: "03 · Nivel de aptitud",
        title: "Renovación e inicial: mismo nivel.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Renovación e inicial: mismo nivel.",
            "Evaluación inicialNivel de aptitud psicofísica de referencia.=RenovaciónDebe tener el mismo nivel.↯Excepción expresaCuando la Agencia determine otros requisitos psicofísicos. Regla del artículo 14, fracción IIgual, salvo determinación expresa.No se agregan ni explican aquí requisitos psicofísicos distintos.",
          ],
        ],
      },
      {
        label: "04 · Componentes",
        title: "Un mapa visual de lo que comprende.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Un mapa visual de lo que comprende.",
            "HistoriaHistoria clínica. Evaluación generalExamen médico general. VistaExploración oftalmológica: agudeza visual, discriminación de color, fondo de ojo, campimetría y otros cuando el personal médico lo determine. Audición y equilibrioExamen auditivo: agudeza auditiva, función vestibular y equilibrio, y otros cuando el personal médico lo determine. OtorrinolaringologíaOtoscopia; exploración de cuello, nariz y senos paranasales; y otros cuando el personal médico lo determine. RespiratorioExploración neumológica: inspección, palpación, percusión y auscultación de ambos hemitórax; y otros cuando el personal médico lo determine. CardiovascularExploración cardiológica: inspección, palpación, percusión y auscultación del área; y otros cuando el personal médico lo determine. Salud mentalValoración psiquiátrica: antecedentes psiquiátricos y entrevista. Valoración y estudio psicológico. GabineteRadiografía de tórax; electrocardiograma de 12 derivaciones; audiometría; y otros cuando el personal médico lo determine. LaboratorioExamen general de orina; hemoglobina glucosilada; biometría hemática; química sanguínea de 6 elementos; detección de sustancias psicoactivas; prueba de detección de VIH; y otros cuando el personal médico lo determine. InterrogatorioAntecedentes de incapacitación durante el vuelo y otros padecimientos que puedan causar un riesgo médico aumentado. iEl artículo 14 establece que esta evaluación corresponde a todas las clases. Este mapa solo identifica sus componentes.",
          ],
        ],
      },
      {
        label: "05 · Arma la evaluación",
        title: "Agrupa cada elemento en su categoría.",
        body: "Historia clínica Examen médico general Exploración oftalmológica Examen auditivo Radiografía de tórax Biometría hemática Valoración psiquiátrica Valoración y estudio psicológico Selecciona una categoría para cada elemento.",
        match: [
          ["Relaciona el elemento", "Historia"],
          ["Relaciona el elemento", "Examen"],
          ["Relaciona el elemento", "Visión"],
          ["Relaciona el elemento", "Audición"],
          ["Relaciona el elemento", "Gabinete"],
          ["Relaciona el elemento", "Laboratorio"],
          ["Relaciona el elemento", "Salud mental"],
          ["Relaciona el elemento", "Salud mental"],
        ],
      },
      {
        label: "06 · Sí dice / No dice",
        title: "Texto oficial frente a inferencias.",
        body: "Revisa la regla y completa la actividad para avanzar.",
        questions: [
          {
            q: "¿El artículo 14 incluye la radiografía de tórax entre los estudios de gabinete?",
            options: ["ASÍ DICE", "BNO DICE", "CSolo en una norma externa"],
            answer: 0,
            why: "Correcto. Aparece en el inciso j).",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿El artículo 14 explica cómo interpretar una prueba de laboratorio?",
            options: ["ASÍ DICE", "BNO DICE", "CSolo para renovación"],
            answer: 1,
            why: "Correcto. El artículo identifica componentes, no interpretación clínica.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿Pueden realizarla personas médicas sin nombramiento o autorización vigente?",
            options: [
              "ASí, si tienen experiencia",
              "BSolo si lo solicita la persona",
              "CNO DICE que puedan; exige vigencia",
            ],
            answer: 2,
            why: "Correcto. Nombramiento o autorización vigente, según corresponda.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "07 · Evaluación",
        title: "Comprueba lo esencial del artículo 14.",
        body: "Revisa la regla y completa la actividad para avanzar.",
        questions: [
          {
            q: "¿Quién puede realizar la evaluación médica?",
            options: [
              "ACualquier profesional de salud",
              "BLas tres figuras médicas señaladas, con nombramiento o autorización vigente",
              "CÚnicamente la persona solicitante",
            ],
            answer: 1,
            why: "Correcto. Esa es la regla del primer párrafo.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿Qué ocurre con el nivel exigido en renovación?",
            options: [
              "AEs el mismo que en inicial, salvo determinación expresa de la Agencia",
              "BSiempre es menor",
              "CLo decide la persona solicitante",
            ],
            answer: 0,
            why: "Correcto. Es la fracción I.",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
          {
            q: "¿Cuál es un componente expreso de laboratorio?",
            options: [
              "AUna prueba no mencionada en el artículo",
              "BUna recomendación de tratamiento",
              "CQuímica sanguínea de 6 elementos",
            ],
            answer: 2,
            why: "Correcto. Está en el inciso k).",
            wrong: "Revisa la regla y vuelve a intentarlo.",
          },
        ],
      },
      {
        label: "08 · Recupera y aterriza",
        title: "Arma el mapa desde la memoria.",
        body: "Descubre la tarjeta después de leer la regla.",
        cards: [
          [
            "Arma el mapa desde la memoria.",
            "Sin volver al mapa, escribe quién puede realizar la evaluación, la regla de renovación y al menos siete categorías que la integran. Comprueba tu respuesta:Nombré las tres figuras médicas y la vigencia correspondiente.Incluí la regla: renovación = inicial, salvo determinación expresa de la Agencia.Mencioné al menos siete categorías del artículo 14.No expliqué finalidades clínicas ni interpreté resultados. Tu texto no se envía ni se guarda fuera de este archivo. Fuente única: Reglamento de Medicina de Aviación Civil, artículo 14. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
          ],
        ],
        final: true,
      },
    ],
  },
  "linea-aerea/legislacion/reglamento-de-medicina-de-aviacion-civil/certificado-y-casos-de-evaluacion-arts-15-a-16-3":
    {
      id: "Reglamento de Medicina de Aviación Civil-03",
      folder: "03_Certificado_y_Casos_de_Evaluacion",
      name: "Certificado y Casos de Evaluación",
      subtitle:
        "Learning Path FlightPath sobre los artículos 15 y 16 del Reglamento de Medicina de Aviación Civil.",
      year: "Reglamento de Medicina de Aviación Civil",
      word: "Artículos 15 y 16",
      sources: [
        "Fuente única: Reglamento de Medicina de Aviación Civil, artículos 15 y 16. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
      ],
      steps: [
        {
          label: "01 · Despegue",
          title: "Del resultado al certificado; del caso a la evaluación.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Del resultado al certificado; del caso a la evaluación.",
              "Los artículos 15 y 16 explican qué documento emite la Agencia para constatar el resultado y en qué casos debe llevarse a cabo una evaluación médica.DocumentoCertificado de Aptitud PsicofísicaCasosSeis supuestosFuenteArtículos 15 y 16 Misión 1Dos preguntas regulatorias.¿Qué emite la Agencia? ¿Cuándo debe realizarse la evaluación?Fuente única: Reglamento de Medicina de Aviación Civil, artículos 15 y 16. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          hero: true,
        },
        {
          label: "02 · Certificado",
          title: "La Agencia emite y entrega.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "La Agencia emite y entrega.",
              "Evaluación médicaProduce un resultado de aptitud psicofísica.→La Agencia emiteEl Certificado de Aptitud Psicofísica para constatar ese resultado.→EntregaA la persona solicitante. 15El certificado debe contener el resultado de la aptitud psicofísica correspondiente.",
            ],
          ],
        },
        {
          label: "03 · Limitaciones",
          title: "Cuando la seguridad depende de su cumplimiento.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Cuando la seguridad depende de su cumplimiento.",
              "¿Dónde?En el Certificado de Aptitud Psicofísica y en la licencia correspondiente.¿Cuándo?Cuando el desempeño seguro de las funciones dependa del cumplimiento de la limitación o limitaciones especiales. Alcance exactoNo inventes tipos de limitación.El artículo 15 permite enseñar la regla de anotación, no crear ejemplos o categorías que no proporciona.",
            ],
          ],
        },
        {
          label: "04 · Cuándo evaluar",
          title: "¿Cuándo me deben evaluar?",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "¿Cuándo me deben evaluar?",
              "ISolicitar, renovar o recuperarCualquier tipo de licencia, permiso o autorización.IIExpedir el certificadoPara expedir el Certificado de Aptitud Psicofísica.IIIDetectar una alteraciónAl detectarse cualquier alteración psicofísica.IVAccidente o incidenteDespués de ocurrir un accidente o incidente aéreo.VRevaloración médicaCuando las personas médicas examinadoras la soliciten.VIDeterminación de la AgenciaCuando así lo determine la Agencia.",
            ],
          ],
        },
        {
          label: "05 · Escenarios",
          title: "Decide con el artículo 16.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "Renovación de licencia. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: al renovar cualquier tipo de licencia. Fracción I.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Recuperación de autorización. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: al recuperar una autorización. Fracción I.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Alteración psicofísica detectada. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: al detectarse cualquier alteración psicofísica. Fracción III.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Después de un accidente aéreo. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: después de un accidente aéreo. Fracción IV.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Después de un incidente aéreo. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: después de un incidente aéreo. Fracción IV.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Solicitud de revaloración por persona médica examinadora. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: fracción V.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "Determinación de la Agencia. ¿Requiere evaluación médica según el artículo 16?",
              options: ["ASí", "BNo dice", "CSolo al renovar"],
              answer: 0,
              why: "Sí: fracción VI.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "06 · Sí dice / No dice",
          title: "Precisión antes que inferencia.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿El artículo 15 dice que cualquier persona puede emitir el Certificado de Aptitud Psicofísica?",
              options: [
                "ASÍ DICE",
                "BNO DICE; lo emite la Agencia",
                "CSolo si la licencia está vigente",
              ],
              answer: 1,
              why: "Correcto. Esa es la autoridad expresamente señalada.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 16 exige esperar a la renovación después de un accidente o incidente aéreo?",
              options: [
                "ASÍ DICE",
                "BSolo tras un accidente",
                "CNO DICE; establece evaluación después del hecho",
              ],
              answer: 2,
              why: "Correcto. Fracción IV.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 15 enumera tipos concretos de limitación especial?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo para permisos"],
              answer: 1,
              why: "Correcto. Solo establece cuándo deben anotarse.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "07 · Evaluación",
          title: "Comprueba artículos 15 y 16.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿Qué debe contener el certificado?",
              options: [
                "AEl resultado de la aptitud psicofísica correspondiente",
                "BUn diagnóstico desarrollado por este curso",
                "CUna lista inventada de limitaciones",
              ],
              answer: 0,
              why: "Correcto. Es el contenido señalado por el artículo 15.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿A quién se entrega el certificado?",
              options: [
                "AA cualquier tercero",
                "BA la persona solicitante",
                "CSolo a la persona médica examinadora",
              ],
              answer: 1,
              why: "Correcto.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿Cuál es un caso expreso de evaluación?",
              options: [
                "ATerminar una clase teórica",
                "BCambiar de domicilio",
                "CCuando así lo determine la Agencia",
              ],
              answer: 2,
              why: "Correcto. Fracción VI.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "08 · Recupera y aterriza",
          title: "Reconstruye los seis casos sin mirar.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Reconstruye los seis casos sin mirar.",
              "Escribe qué emite la Agencia, qué contiene y a quién se entrega. Después reconstruye los seis casos del artículo 16. Comprueba tu respuesta:Identifiqué el Certificado de Aptitud Psicofísica.Dije que contiene el resultado y se entrega a la persona solicitante.Recordé los seis casos del artículo 16.No inventé tipos de limitación ni criterios médicos. Tu texto no se envía ni se guarda fuera de este archivo. Fuente única: Reglamento de Medicina de Aviación Civil, artículos 15 y 16. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          final: true,
        },
      ],
    },
  "linea-aerea/legislacion/reglamento-de-medicina-de-aviacion-civil/disminucion-de-aptitud-psicofisica-art-17-4":
    {
      id: "Reglamento de Medicina de Aviación Civil-04",
      folder: "04_Disminucion_de_Aptitud_Psicofisica",
      name: "Disminución de Aptitud Psicofísica",
      subtitle:
        "Learning Path FlightPath sobre el artículo 17 del Reglamento de Medicina de Aviación Civil.",
      year: "Reglamento de Medicina de Aviación Civil",
      word: "Artículo 17",
      sources: [
        "Fuente única: Reglamento de Medicina de Aviación Civil, artículo 17. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
      ],
      steps: [
        {
          label: "01 · Despegue",
          title: "Una obligación breve. Una acción clara.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Una obligación breve. Una acción clara.",
              "Cuando la persona titular tiene conocimiento de una disminución de su aptitud psicofísica que pudiera impedirle desempeñar debidamente y en condiciones de seguridad sus funciones, debe notificarlo a la Agencia.FuenteArtículo 17AcciónNotificarDestinatarioLa Agencia MisiónRecuerda la acción, no diagnostiques.Este Learning Path explica una obligación regulatoria. No determina si una persona concreta está apta o no.Fuente única: Reglamento de Medicina de Aviación Civil, artículo 17. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          hero: true,
        },
        {
          label: "02 · A quién aplica",
          title: "Personas titulares de cuatro títulos.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Personas titulares de cuatro títulos.",
              "Titulares dePermisosExpedidos u otorgados por la Agencia.Titulares deAutorizacionesExpedidas u otorgadas por la Agencia.Titulares deLicenciasExpedidas u otorgadas por la Agencia.Titulares deCertificado de capacidadExpedido u otorgado por la Agencia.",
            ],
          ],
        },
        {
          label: "03 · Regla central",
          title: "Conocimiento, posible impedimento, notificación.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Conocimiento, posible impedimento, notificación.",
              "Artículo 17Si tengo conocimiento de una disminución de aptitud psicofísica↓que pudiera impedir el desempeño debido y seguro↓debo notificar a la Agencia",
            ],
          ],
        },
        {
          label: "04 · Qué debo hacer",
          title: "Escenarios simples. Una sola acción.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "El titular conoce una disminución que puede afectar el desempeño seguro. ¿Qué debe hacer?",
              options: [
                "AContinuar sin informar",
                "BEsperar a la siguiente renovación",
                "CNotificar a la Agencia",
              ],
              answer: 2,
              why: "Correcto. Esa es la obligación central.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "El titular duda si debe avisar ahora o al renovar. ¿Qué establece el artículo 17?",
              options: [
                "ANotificar al tener conocimiento del supuesto descrito",
                "BEsperar la renovación",
                "CDecidir su propia aptitud",
              ],
              answer: 0,
              why: "Correcto. El texto dice “en el momento en que tengan conocimiento”.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿A quién se dirige la notificación?",
              options: ["AA cualquier tercero", "BA la Agencia", "CSolo a otro titular"],
              answer: 1,
              why: "Correcto.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "05 · Sí dice / No dice",
          title: "Evita retrasos e inferencias.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿El artículo 17 dice que el titular debe esperar a renovar antes de informar?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo si tiene permiso"],
              answer: 1,
              why: "Correcto. No establece esa espera.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 17 autoriza al curso a diagnosticar la disminución?",
              options: ["ASÍ DICE", "BSolo en un escenario", "CNO DICE"],
              answer: 2,
              why: "Correcto. Este contenido no diagnostica ni determina aptitud.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿El artículo 17 identifica a la Agencia como destinataria?",
              options: ["ASÍ DICE", "BNO DICE", "CSolo a la renovación"],
              answer: 0,
              why: "Correcto. La notificación es a la Agencia.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "06 · Evaluación",
          title: "Comprueba la obligación del artículo 17.",
          body: "Revisa la regla y completa la actividad para avanzar.",
          questions: [
            {
              q: "¿Cuándo surge la obligación descrita?",
              options: [
                "AAl tener conocimiento de una disminución que pudiera impedir el desempeño debido y seguro",
                "BSolo al vencer la licencia",
                "CCuando lo decida un compañero",
              ],
              answer: 0,
              why: "Correcto. Ese es el supuesto del artículo 17.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿Cuál es la acción obligatoria?",
              options: ["AEsperar", "BNotificar a la Agencia", "CInterpretar resultados clínicos"],
              answer: 1,
              why: "Correcto.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
            {
              q: "¿A quién aplica?",
              options: [
                "ASolo a titulares de licencias",
                "BA cualquier pasajero",
                "CA titulares de permisos, autorizaciones, licencias o certificado de capacidad expedidos u otorgados por la Agencia",
              ],
              answer: 2,
              why: "Correcto. Respeta la lista del artículo 17.",
              wrong: "Revisa la regla y vuelve a intentarlo.",
            },
          ],
        },
        {
          label: "07 · Recupera y aterriza",
          title: "Completa la regla sin mirar.",
          body: "Descubre la tarjeta después de leer la regla.",
          cards: [
            [
              "Completa la regla sin mirar.",
              "Completa con tus palabras: Si tengo conocimiento de una disminución de aptitud psicofísica que pudiera…, entonces debo… Comprueba tu respuesta:Incluí que puede impedir el desempeño debido y en condiciones de seguridad.Escribí la acción: notificar.Identifiqué a la Agencia como destinataria.No añadí diagnóstico, tratamiento ni espera hasta renovación. Tu texto no se envía ni se guarda fuera de este archivo. Fuente única: Reglamento de Medicina de Aviación Civil, artículo 17. Texto oficial en SIDOF. Este Learning Path explica requisitos regulatorios; no diagnostica ni determina la aptitud de una persona.",
            ],
          ],
          final: true,
        },
      ],
    },
};

export const LEGISLATION_ANNEXES: LegislationAnnex[] = [
  {
    n: 1,
    name: "Personnel Licensing",
    theme: "Licencias del personal",
    about: "licencias de tripulaciones de vuelo, controladores y personal de mantenimiento",
    visual: "I → L",
    memory:
      "¿Qué necesitas primero para volar? Una licencia. Imagina una L apoyada en el número romano I.",
    scenario: "Licencias de pilotos y controladores",
  },
  {
    n: 2,
    name: "Rules of the Air",
    theme: "Reglas del aire",
    about: "reglas para la realización de vuelos visuales y por instrumentos",
    visual: "2 ↻ R",
    memory: "Gira el 2 con imaginación hasta ver una R: Rules.",
    scenario: "Reglas para vuelos visuales y por instrumentos",
  },
  {
    n: 3,
    name: "Meteorological Service for International Air Navigation",
    theme: "Servicio meteorológico",
    about:
      "servicios meteorológicos para la navegación aérea internacional y observaciones desde aeronaves",
    visual: "3 ↻ M / W",
    memory: "Transforma mentalmente el 3 en M de Meteorology o W de Weather.",
    scenario: "Información y servicios meteorológicos",
  },
  {
    n: 4,
    name: "Aeronautical Charts",
    theme: "Cartas aeronáuticas",
    about: "especificaciones de las cartas que se utilizan en aviación internacional",
    visual: "N · E · S · O",
    memory: "Cuatro puntos cardinales, cuatro lados de un mapa rectangular: 4 te lleva a cartas.",
    scenario: "Especificaciones de cartas aeronáuticas",
  },
  {
    n: 5,
    name: "Units of Measurement to be Used in Air and Ground Operations",
    theme: "Unidades de medida",
    about: "unidades de medida para operaciones aéreas y terrestres",
    visual: "1 2 3 4 5",
    memory:
      "Cinco dedos para contar; contar te lleva a medir. El título oficial es más largo que la pista.",
    scenario: "Unidades usadas en operaciones aéreas y terrestres",
  },
  {
    n: 6,
    name: "Operation of Aircraft",
    theme: "Operación de aeronaves",
    about:
      "especificaciones para que operaciones similares alcancen un nivel de seguridad por encima de un mínimo previsto",
    visual: "6 → O",
    memory: "Encuentra la O dentro del 6: Operation.",
    scenario: "Operación segura de aeronaves",
  },
  {
    n: 7,
    name: "Aircraft Nationality and Registration Marks",
    theme: "Nacionalidad y matrícula",
    about: "requisitos de matrícula e identificación de las aeronaves",
    visual: "CR7 → MARCA",
    memory:
      "CR7 evoca una marca reconocible: 7 → marcas de nacionalidad y matrícula. La referencia cultural solo es una pista.",
    scenario: "Identificación y marcas de matrícula de una aeronave",
  },
  {
    n: 8,
    name: "Airworthiness of Aircraft",
    theme: "Aeronavegabilidad",
    about: "certificación e inspección de aeronaves mediante procedimientos uniformes",
    visual: "8 ↻",
    memory:
      "Imagina el 8 como una hélice, montada absurdamente en tu avión imaginario. Te recuerda preguntar por su aeronavegabilidad; no sirve para evaluar un avión real.",
    scenario: "Certificación de aeronavegabilidad",
  },
  {
    n: 9,
    name: "Facilitation",
    theme: "Facilitación",
    about:
      "simplificación de formalidades aduaneras, migratorias y sanitarias en aeropuertos internacionales",
    visual: "9 VIDAS → FÁCIL",
    memory:
      "¿Por qué la vida de los gatos sería tan fácil? En la historia tienen nueve vidas: 9 → facilitación.",
    scenario: "Simplificación de formalidades migratorias y aduaneras",
  },
  {
    n: 10,
    name: "Aeronautical Telecommunications",
    theme: "Telecomunicaciones aeronáuticas",
    about: "normalización de equipos, sistemas y procedimientos de comunicaciones",
    visual: "Telecomunicac10nes",
    memory:
      "Busca el 10 dentro de Telecomunicac10nes. También puedes imaginar el 1 y el 0 formando un micrófono.",
    scenario: "Equipos y procedimientos de telecomunicaciones",
  },
  {
    n: 11,
    name: "Air Traffic Services",
    theme: "Servicios de tránsito aéreo",
    about: "establecimiento y operación del control de tránsito, información de vuelo y alerta",
    visual: "1 │ 1",
    memory: "Dos unos como dos torres de control: 11 → ATS. El tema incluye más que las torres.",
    scenario: "Servicios de control, información de vuelo y alerta",
  },
  {
    n: 12,
    name: "Search and Rescue",
    theme: "Búsqueda y salvamento",
    about: "organización y operación de medios y servicios de búsqueda y salvamento",
    visual: "1 2 … ¿3?",
    memory: "Los números hacen fila: 1, 2… ¿dónde está el 3? Hay que buscarlo y salvarlo.",
    scenario: "Organizar servicios para buscar y salvar",
  },
  {
    n: 13,
    name: "Aircraft Accident and Incident Investigation",
    theme: "Investigación de accidentes e incidentes",
    about: "notificación, investigación e informes de accidentes de aeronaves",
    visual: "1　_　3",
    memory: "Ahora la fila dice 1, espacio, 3. Falta el 2: hay que investigar qué pasó.",
    scenario: "Investigación de un accidente o incidente",
  },
  {
    n: 14,
    name: "Aerodromes",
    theme: "Aeródromos",
    about: "especificaciones para el diseño y equipo de aeródromos",
    visual: "1 + 4 → A",
    memory: "Acerca visualmente el 1 y el 4 para imaginar una A: Aerodromes.",
    scenario: "Diseño y equipo de aeródromos",
  },
  {
    n: 15,
    name: "Aeronautical Information Services",
    theme: "Servicios de información aeronáutica",
    about:
      "recopilación y difusión de información aeronáutica necesaria para las operaciones de vuelo",
    visual: "1nformación · 5ervicios",
    memory: "Lee primero el 1 de 1nformación y luego el 5 de 5ervicios: 15.",
    scenario: "Recopilar y distribuir información aeronáutica",
  },
  {
    n: 16,
    name: "Environmental Protection",
    theme: "Protección del medio ambiente",
    about: "protección ambiental relacionada con ruido de aeronaves y emisiones de motores",
    visual: "1 + 6 → ÁRBOL",
    memory:
      "Imagina el 1 como tronco y la curva del 6 como copa. El árbol te lleva al medio ambiente.",
    scenario: "Ruido de aeronaves y emisiones de motores",
  },
  {
    n: 17,
    name: "Security — Safeguarding International Civil Aviation against Acts of Unlawful Interference",
    theme: "Protección frente a interferencia ilícita",
    about: "protección de la aviación civil internacional frente a actos de interferencia ilícita",
    visual: "1<span>7</span> → SECURITY",
    memory:
      "Varios códigos especiales de transponder empiezan por 7. Usa ese 7 solo como puente hacia 17 → Security, sin convertir todas las emergencias en interferencia ilícita.",
    scenario: "Protección frente a actos de interferencia ilícita",
  },
  {
    n: 18,
    name: "The Safe Transport of Dangerous Goods by Air",
    theme: "Transporte seguro de mercancías peligrosas",
    about: "etiquetado, embalaje y envío de mercancías peligrosas por vía aérea",
    visual: "18 → 8 ↻ → CARGA",
    memory:
      "Gira el 8 e imagina una cápsula dentro de una maleta ficticia. Solo representa la idea de mercancía peligrosa: una cápsula no es por sí misma una clasificación legal.",
    scenario: "Transporte seguro de mercancías peligrosas",
  },
  {
    n: 19,
    name: "Safety Management",
    theme: "Gestión de la seguridad operacional",
    about:
      "responsabilidades de gestión de la seguridad relacionadas con la operación segura de las aeronaves",
    visual: "18 → 19 · SAFE",
    memory:
      "En la historia anterior se retira la mercancía peligrosa de la maleta y aparece SAFE. Esa escena recuerda Safety Management; gestionar la seguridad exige mucho más que retirar un objeto.",
    scenario: "Gestión de la seguridad de las operaciones",
  },
];
