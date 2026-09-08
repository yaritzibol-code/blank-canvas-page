/**
 * Fuente única de la próxima aplicación registrada del examen CIAAC.
 *
 * La consumen /ciaac (countdown), /convocatoria-ciaac-2026 y la
 * calculadora. Al pasar la fecha, las páginas cambian solas a su estado
 * "aplicación pasada" (ver ciaacYaPaso) — aun así, actualiza estas
 * constantes en cuanto se conozca el siguiente periodo para volver al
 * estado "fecha registrada". Protocolo completo en SEO.md.
 */

export const PROXIMO_CIAAC = "2026-08-17T08:00:00-06:00";
export const PROXIMO_CIAAC_TEXTO = "17 de agosto de 2026";
/** "17 ago" para cajas de fecha compactas. */
export const PROXIMO_CIAAC_CORTO = "17 ago";

/**
 * true cuando la aplicación registrada ya quedó atrás (con 12 h de margen:
 * el propio día del examen la página sigue en modo "es hoy"). Se evalúa por
 * render — con SSR, el servidor decide en cada request, así que el sitio
 * nunca muestra una convocatoria caduca aunque nadie edite el código.
 */
export function ciaacYaPaso(ahora: number = Date.now()): boolean {
  return ahora > new Date(PROXIMO_CIAAC).getTime() + 12 * 3600 * 1000;
}

/* ─── Convocatoria de línea aérea (ASPA · Aeroméxico Connect) ────────── */

/**
 * Estado de la convocatoria de Primer Oficial Embraer 190.
 *
 * Esta bandera es el ÚNICO interruptor: la landing pública
 * (`/convocatoria-aeromexico`) y el módulo del dashboard leen de aquí todo su
 * texto de estado — distintivos, titulares, CTAs, metadatos, preguntas
 * frecuentes y aviso legal. Cambiarla de valor cambia la página entera; no
 * hace falta editar copy suelto en el JSX.
 *
 * Al cerrarse un proceso se pone en `false` y la página pasa sola al discurso
 * de preparación anticipada: el temario publicado no cambia de una
 * convocatoria a otra, así que estudiarlo antes sigue siendo la venta.
 */
export const LA_CONVOCATORIA_ABIERTA = true;

export interface ConvocatoriaCopy {
  /** Etiqueta corta de estado (distintivos y cintillos). */
  estado: string;
  /** Aviso largo, en una línea, para cintillos y avisos de página. */
  aviso: string;
  /** Cierre del cintillo: qué es esta página y qué no. */
  cintilloCierre: string;
  /** Segunda línea del titular del hero. */
  heroAccent: string;
  heroParrafo: string;
  /** Texto de los botones de compra. */
  cta: string;
  /** Frase de la tarjeta flotante del hero. */
  heroTarjeta: string;
  requisitosSub: string;
  temarioSub: string;
  evaluacionesSub: string;
  comprarAccent: string;
  comprarParrafo: string;
  planParrafo: string;
  cierreTitulo: string;
  cierreAccent: string;
  cierreParrafo: string;
  /** Primera frase del aviso de no afiliación. */
  avisoLegalEstado: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  twitterDescription: string;
  cursoDescription: string;
  /** Bajada del hero del módulo del dashboard, tras el aviso de estado. */
  tableroParrafo: string;
  /** Preguntas frecuentes que dependen del estado; van antes de las fijas. */
  faqs: { q: string; a: string }[];
}

const ABIERTA: ConvocatoriaCopy = {
  estado: "Convocatoria activa",
  aviso:
    "La convocatoria de Primer Oficial Embraer 190 está abierta. Las fechas, los requisitos vigentes y el registro los publica ASPA de México en sus canales oficiales.",
  cintilloCierre:
    "Aquí preparas el examen teórico; el proceso lo administra ASPA de México y sus publicaciones son la única fuente válida.",
  heroAccent: "Primer Oficial Embraer 190.",
  heroParrafo:
    "La convocatoria está abierta y el examen teórico es la primera puerta. Practica el temario publicado — ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — con un cuestionario que te dice exactamente dónde estás fallando.",
  cta: "Comprar acceso al cuestionario",
  heroTarjeta: "una sola ruta de práctica.",
  requisitosSub:
    "ASPA de México invita a unirse a su grupo de pilotos como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. Esto es lo que pide el proceso — confirma la lista vigente en la publicación oficial antes de armar tu expediente.",
  temarioSub:
    "Estas son las cinco fuentes que define la empresa para el examen de Primer Oficial Embraer 190, y las materias de FlightPath con las que practicas cada una.",
  evaluacionesSub:
    "El examen teórico es la primera puerta. Llega con el temario dominado y el resto del proceso se vuela mejor.",
  comprarAccent: "practica hasta dominarlo.",
  comprarParrafo:
    "El cuestionario Embraer 190 — Primer Oficial vive dentro de FlightPath Pro: practicas el temario publicado completo, mides tu avance por materia y repites los temas débiles hasta que el examen teórico deje de ser incógnita.",
  planParrafo:
    "Acceso Pro a toda la plataforma: cuestionario de la convocatoria, banco completo, simulacros y tutor IA. Sin plazos forzosos.",
  cierreTitulo: "El examen teórico",
  cierreAccent: "se gana practicando.",
  cierreParrafo:
    "Llega a la convocatoria con las 5 fuentes del temario dominadas y tu preparación medida materia por materia.",
  avisoLegalEstado:
    "FlightPath no anuncia, gestiona ni garantiza ningún proceso de selección: las fechas, requisitos y resultados los publica exclusivamente ASPA de México.",
  metaTitle: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190 | FlightPath",
  metaDescription:
    "La convocatoria de Primer Oficial Embraer 190 (ASPA · Aeroméxico Connect) está abierta. Practica el temario del examen teórico — ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — con el cuestionario de FlightPath.",
  ogTitle: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190",
  ogDescription:
    "Convocatoria abierta. Practica el temario del examen teórico: ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10, con banco propio y simulacros cronometrados.",
  twitterDescription:
    "Prepara el temario de la convocatoria (ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10) con un banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA.",
  cursoDescription:
    "Cuestionario de práctica del temario publicado: ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10, con banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA.",
  tableroParrafo:
    "Este es tu tablero para llegar al examen teórico con el temario dominado: cada cuestionario es un mini simulador en modo aprendiendo, con feedback inmediato y Yaris explicándote cada pregunta.",
  faqs: [
    {
      q: "¿La convocatoria de Aeroméxico Connect sigue abierta?",
      a: "Sí. La convocatoria de Primer Oficial Embraer 190 está abierta. Las fechas de registro, los requisitos vigentes y el detalle del proceso los publica ASPA de México en sus canales oficiales: revísalos ahí antes de inscribirte, porque son la única fuente válida.",
    },
    {
      q: "La convocatoria ya está abierta, ¿por dónde empiezo?",
      a: "Por el examen teórico: es la primera puerta y la única que puedes ganar estudiando desde hoy. Si vas con el tiempo encima, arranca con simulacros cronometrados para ubicar tus materias débiles y ataca esas primero, en vez de leer las cinco fuentes de corrido.",
    },
    {
      q: "¿Qué es la convocatoria de ASPA y Aeroméxico Connect?",
      a: "ASPA de México invita a pilotos a unirse como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. El proceso incluye un examen teórico sobre el temario oficial, la evaluación AON (Aviation Suite, con prueba de inglés), una evaluación en simulador y una entrevista con panel.",
    },
    {
      q: "¿Qué requisitos pide la convocatoria de ASPA?",
      a: "Edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas en bitácora (mínimo 180 de vuelo real y hasta 70 de simulador), carta de presentación de ASPA y expediente completo y actualizado en el archivo del sindicato. Verifica la lista vigente en la publicación oficial.",
    },
  ],
};

const CERRADA: ConvocatoriaCopy = {
  estado: "Convocatoria cancelada",
  aviso:
    "La convocatoria de Primer Oficial Embraer 190 fue cancelada y por ahora no hay proceso abierto. El temario publicado no cambia, así que la preparación sigue siendo válida para cuando se abra la siguiente.",
  cintilloCierre:
    "Esta página es una guía de preparación anticipada, no un aviso de proceso abierto: las fechas y requisitos oficiales los publica ASPA de México.",
  heroAccent: "prepárate para la próxima.",
  heroParrafo:
    "La convocatoria de Primer Oficial Embraer 190 fue cancelada. El temario del examen teórico no cambia — ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — así que puedes llegar con él dominado el día que se publique la siguiente, en lugar de empezar contrarreloj.",
  cta: "Empezar mi preparación",
  heroTarjeta: "listas antes de que abra.",
  requisitosSub:
    "Así se perfilaba el candidato en la última convocatoria publicada para Primer Oficial del Embraer 190 de Aeroméxico Connect. Tenlos listos —expediente, horas y carta— para no perder tiempo cuando se abra la siguiente.",
  temarioSub:
    "Estas son las cinco fuentes que define la empresa para el examen de Primer Oficial Embraer 190, y las materias de FlightPath con las que practicas cada una. Es material publicado y estable: lo que estudias hoy sigue vigente cuando abra el próximo proceso.",
  evaluacionesSub:
    "El examen teórico es la primera puerta. Es también la única que puedes tener ganada de antemano: llega con el temario dominado y el resto del proceso se vuela mejor.",
  comprarAccent: "llega listo el día uno.",
  comprarParrafo:
    "El cuestionario Embraer 190 — Primer Oficial vive dentro de FlightPath Pro: practicas el temario publicado completo, mides tu avance por materia y repites los temas débiles hasta que el examen teórico deje de ser incógnita. Sin convocatoria abierta no hay prisa, y esa es justo la ventaja: estudias con calma lo que otros estudiarán con reloj.",
  planParrafo:
    "Acceso Pro a toda la plataforma: temario de línea aérea, banco completo, simulacros y tutor IA. Sin plazos forzosos.",
  cierreTitulo: "La convocatoria avisa tarde.",
  cierreAccent: "Tú puedes ir adelantado.",
  cierreParrafo:
    "Cuando se publique la siguiente, el temario será el mismo y el plazo será corto. Llega con las 5 fuentes dominadas y tu preparación medida materia por materia.",
  avisoLegalEstado:
    "La convocatoria de Primer Oficial Embraer 190 fue cancelada y FlightPath no anuncia, gestiona ni garantiza ningún proceso de selección: las fechas, requisitos y resultados los publica exclusivamente ASPA de México.",
  metaTitle: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190: cancelada | FlightPath",
  metaDescription:
    "La convocatoria de Primer Oficial Embraer 190 (ASPA · Aeroméxico Connect) fue cancelada. El temario del examen teórico no cambia: prepara ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 desde ahora y llega listo a la próxima.",
  ogTitle: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190: cancelada",
  ogDescription:
    "Se canceló la convocatoria, pero el temario sigue igual: ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10. Prepáralo con calma y llega listo a la próxima.",
  twitterDescription:
    "Convocatoria cancelada, temario intacto: prepara ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10 con un banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA.",
  cursoDescription:
    "Preparación anticipada del temario publicado (ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10) para la próxima convocatoria de Primer Oficial Embraer 190: banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA. La última convocatoria publicada fue cancelada.",
  tableroParrafo:
    "Este es tu tablero para tenerlo cubierto antes de que abra la siguiente: cada cuestionario es un mini simulador en modo aprendiendo, con feedback inmediato y Yaris explicándote cada pregunta.",
  faqs: [
    {
      q: "¿La convocatoria de Aeroméxico Connect sigue abierta?",
      a: "No. La convocatoria de Primer Oficial Embraer 190 fue cancelada y por ahora no hay un proceso abierto ni una fecha anunciada para el siguiente. Conviene seguir los canales oficiales de ASPA de México para enterarte en cuanto se publique uno nuevo.",
    },
    {
      q: "Si se canceló, ¿tiene caso prepararse ahora?",
      a: "Sí, y es el mejor momento. El temario del examen teórico es material publicado y estable — ATP, PHAK, Jeppesen, legislación nacional y el Anexo 10 de la OACI — así que no cambia de un proceso a otro. Quien empieza cuando sale la convocatoria estudia contrarreloj; quien ya lo tiene cubierto sólo repasa. Además, las mismas fuentes se usan en procesos de otras aerolíneas.",
    },
    {
      q: "¿Qué es la convocatoria de ASPA y Aeroméxico Connect?",
      a: "Es la invitación de ASPA de México a pilotos para unirse como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. El proceso incluye un examen teórico sobre el temario oficial, la evaluación AON (Aviation Suite, con prueba de inglés), una evaluación en simulador y una entrevista con panel. La última convocatoria publicada fue cancelada.",
    },
    {
      q: "¿Qué requisitos pedía la convocatoria de ASPA?",
      a: "Edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas en bitácora (mínimo 180 de vuelo real y hasta 70 de simulador), carta de presentación de ASPA y expediente completo y actualizado en el archivo del sindicato. Son la referencia de la convocatoria cancelada: la próxima puede ajustarlos, así que verifícalos en la publicación oficial cuando salga.",
    },
  ],
};

/** Todo el texto de la landing y del módulo, según el estado vigente. */
export const LA_CONVOCATORIA_COPY: ConvocatoriaCopy = LA_CONVOCATORIA_ABIERTA ? ABIERTA : CERRADA;

/** Atajos usados en varios lugares. */
export const LA_CONVOCATORIA_ESTADO = LA_CONVOCATORIA_COPY.estado;
export const LA_CONVOCATORIA_AVISO = LA_CONVOCATORIA_COPY.aviso;
