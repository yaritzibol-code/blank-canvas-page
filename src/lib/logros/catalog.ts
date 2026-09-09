/**
 * Los 100 logros oficiales de FlightPath.
 *
 * El orden y los identificadores son estables: al cambiar una condición se
 * edita solo el `check` de la fila, sin tocar la interfaz ni los desbloqueos
 * que ya obtuvieron los usuarios.
 */
import type { LogroCtx, LogroDef } from "./types";

type Fila = Omit<LogroDef, "orden">;

const filas: Fila[] = [
  /* ───────── Primeros pasos ───────── */
  { id: "primer-vuelo", nombre: "Primer vuelo", desc: "Completa tu primera actividad.", categoria: "Primeros pasos", icon: "rocket", check: (c) => c.actividades >= 1 },
  { id: "despegando", nombre: "Despegando", desc: "Completa 3 actividades.", categoria: "Primeros pasos", icon: "plane", check: (c) => c.actividades >= 3 },
  { id: "en-ruta", nombre: "En ruta", desc: "Completa 5 actividades.", categoria: "Primeros pasos", icon: "map", check: (c) => c.actividades >= 5 },
  { id: "ya-arrancamos", nombre: "Ya arrancamos", desc: "Completa 10 actividades.", categoria: "Primeros pasos", icon: "bolt", check: (c) => c.actividades >= 10 },
  { id: "buen-comienzo", nombre: "Buen comienzo", desc: "Completa tu primera sesión de estudio de al menos 30 minutos.", categoria: "Primeros pasos", icon: "clock", check: (c) => c.sesiones30min >= 1 },
  { id: "primera-mision", nombre: "Primera misión", desc: "Completa tu primer Learning Path.", categoria: "Primeros pasos", icon: "flag", check: (c) => c.lpCompletados >= 1 },
  { id: "primer-cuestionario", nombre: "Primer cuestionario", desc: "Completa tu primer cuestionario.", categoria: "Primeros pasos", icon: "help", check: (c) => c.quizCount >= 1 },
  { id: "primera-tarjeta", nombre: "Primera tarjeta", desc: "Completa tu primera sesión de Flashcards.", categoria: "Primeros pasos", icon: "cards", check: (c) => c.flashSesiones >= 1 },
  { id: "primera-consulta", nombre: "Primera consulta", desc: "Consulta tu primer recurso de la Biblioteca.", categoria: "Primeros pasos", icon: "library", check: (c) => c.bibliotecaRecursos >= 1 },
  { id: "primer-100", nombre: "Primer 100", desc: "Obtén tu primer 100% en un cuestionario.", categoria: "Primeros pasos", icon: "star", check: (c) => c.quizPerfectos >= 1 },

  /* ───────── Constancia ───────── */
  { id: "constante", nombre: "Constante", desc: "Estudia durante 3 días diferentes.", categoria: "Constancia", icon: "check", check: (c) => c.diasConActividad >= 3 },
  { id: "racha-inicial", nombre: "Racha inicial", desc: "Estudia durante 3 días consecutivos.", categoria: "Constancia", icon: "flame", check: (c) => c.streakMax >= 3 },
  { id: "una-semana", nombre: "Una semana", desc: "Estudia durante 7 días consecutivos.", categoria: "Constancia", icon: "flame", check: (c) => c.streakMax >= 7 },
  { id: "dos-semanas", nombre: "Dos semanas", desc: "Estudia durante 14 días consecutivos.", categoria: "Constancia", icon: "flame", check: (c) => c.streakMax >= 14 },
  { id: "imparable", nombre: "Imparable", desc: "Estudia durante 30 días consecutivos.", categoria: "Constancia", icon: "spark", check: (c) => c.streakMax >= 30 },
  { id: "mes-preparacion", nombre: "Mes de preparación", desc: "Estudia al menos 20 días dentro de un mismo mes.", categoria: "Constancia", icon: "calendar", check: (c) => c.maxDiasEnMes >= 20 },
  { id: "madrugador", nombre: "Madrugador", desc: "Completa 5 sesiones de estudio antes de las 09:00.", categoria: "Constancia", icon: "sun", check: (c) => c.sesionesMadrugada >= 5 },
  { id: "turno-nocturno", nombre: "Turno nocturno", desc: "Completa 5 sesiones de estudio después de las 21:00.", categoria: "Constancia", icon: "moon", check: (c) => c.sesionesNoche >= 5 },
  { id: "sin-excusas", nombre: "Sin excusas", desc: "Completa al menos una actividad durante 7 días consecutivos.", categoria: "Constancia", icon: "checkCircle", check: (c) => c.streakMax >= 7 && c.actividades >= 7 },
  { id: "rumbo-constante", nombre: "Rumbo constante", desc: "Mantén una racha de 14 días consecutivos.", categoria: "Constancia", icon: "compass", check: (c) => c.streakMax >= 14 },

  /* ───────── Cuestionarios ───────── */
  { id: "buen-despegue", nombre: "Buen despegue", desc: "Obtén 80% o más en un cuestionario.", categoria: "Cuestionarios", icon: "arrowUp", check: (c) => c.quiz80 >= 1 },
  { id: "vuelo-estable", nombre: "Vuelo estable", desc: "Obtén 90% o más en un cuestionario.", categoria: "Cuestionarios", icon: "gauge", check: (c) => c.quiz90 >= 1 },
  { id: "perfecto", nombre: "Perfecto", desc: "Obtén 100% en un cuestionario.", categoria: "Cuestionarios", icon: "star", check: (c) => c.quizPerfectos >= 1 },
  { id: "cinco-perfectos", nombre: "Cinco perfectos", desc: "Obtén 100% en 5 cuestionarios.", categoria: "Cuestionarios", icon: "star", check: (c) => c.quizPerfectos >= 5 },
  { id: "diez-perfectos", nombre: "Diez perfectos", desc: "Obtén 100% en 10 cuestionarios.", categoria: "Cuestionarios", icon: "trophy", check: (c) => c.quizPerfectos >= 10 },
  { id: "sin-bajar-guardia", nombre: "Sin bajar la guardia", desc: "Obtén 90% o más en 5 cuestionarios consecutivos.", categoria: "Cuestionarios", icon: "shield", check: (c) => c.quiz90Consecutivos >= 5 },
  { id: "mejor-que-ayer", nombre: "Mejor que ayer", desc: "Mejora tu puntuación respecto a tu intento anterior.", categoria: "Cuestionarios", icon: "arrowUp", check: (c) => c.mejoroRespectoAnterior },
  { id: "a-la-segunda", nombre: "A la segunda", desc: "Repite un cuestionario y mejora tu puntuación.", categoria: "Cuestionarios", icon: "refresh", check: (c) => c.repetidoMejorado },
  { id: "de-memoria", nombre: "De memoria", desc: "Obtén 90% o más en un cuestionario sin haberlo realizado anteriormente.", categoria: "Cuestionarios", icon: "brain", check: (c) => c.primerIntento90 },
  { id: "todo-bajo-control", nombre: "Todo bajo control", desc: "Obtén 90% o más en los cuestionarios de una materia.", categoria: "Cuestionarios", icon: "checkCircle", check: (c) => c.materiasDominadas >= 1 },

  /* ───────── Learning Paths ───────── */
  { id: "primer-path", nombre: "Primer Path", desc: "Completa tu primer Learning Path.", categoria: "Learning Paths", icon: "flag", check: (c) => c.lpCompletados >= 1 },
  { id: "cinco-en-ruta", nombre: "Cinco en ruta", desc: "Completa 5 Learning Paths.", categoria: "Learning Paths", icon: "map", check: (c) => c.lpCompletados >= 5 },
  { id: "diez-en-ruta", nombre: "Diez en ruta", desc: "Completa 10 Learning Paths.", categoria: "Learning Paths", icon: "map", check: (c) => c.lpCompletados >= 10 },
  { id: "veinticinco-en-ruta", nombre: "Veinticinco en ruta", desc: "Completa 25 Learning Paths.", categoria: "Learning Paths", icon: "route", check: (c) => c.lpCompletados >= 25 },
  { id: "cincuenta-en-ruta", nombre: "Cincuenta en ruta", desc: "Completa 50 Learning Paths.", categoria: "Learning Paths", icon: "route", check: (c) => c.lpCompletados >= 50 },
  { id: "nivel-de-vuelo", nombre: "Nivel de vuelo", desc: "Completa 75 Learning Paths.", categoria: "Learning Paths", icon: "gauge", check: (c) => c.lpCompletados >= 75 },
  { id: "ruta-completa", nombre: "Ruta completa", desc: "Completa todos los Learning Paths de una materia.", categoria: "Learning Paths", icon: "checkCircle", check: (c) => c.materiasLpCompletas >= 1 },
  { id: "materia-dominada", nombre: "Materia dominada", desc: "Completa 3 materias al 100%.", categoria: "Learning Paths", icon: "graduation", check: (c) => c.materiasLpCompletas >= 3 },
  { id: "en-ascenso", nombre: "En ascenso", desc: "Alcanza 25% de progreso en una ruta.", categoria: "Learning Paths", icon: "arrowUp", check: (c) => c.maxProgresoMateria >= 25 },
  { id: "a-mitad-de-ruta", nombre: "A mitad de ruta", desc: "Alcanza 50% de progreso en una ruta.", categoria: "Learning Paths", icon: "gauge", check: (c) => c.maxProgresoMateria >= 50 },
  { id: "recta-final-lp", nombre: "Recta final", desc: "Alcanza 75% de progreso en una ruta.", categoria: "Learning Paths", icon: "flag", check: (c) => c.maxProgresoMateria >= 75 },
  { id: "listo-para-despegar", nombre: "Listo para despegar", desc: "Completa una ruta al 100%.", categoria: "Learning Paths", icon: "plane", check: (c) => c.maxProgresoMateria >= 100 },
  { id: "sin-saltos", nombre: "Sin saltos", desc: "Completa 10 Learning Paths consecutivos siguiendo el orden establecido.", categoria: "Learning Paths", icon: "check", check: (c) => c.lpCompletados >= 10 },
  { id: "ruta-limpia", nombre: "Ruta limpia", desc: "Completa todos los Learning Paths de una materia sin dejar ninguno pendiente.", categoria: "Learning Paths", icon: "checkCircle", check: (c) => c.materiasLpCompletas >= 1 },
  { id: "explorador", nombre: "Explorador", desc: "Completa al menos un Learning Path de 5 materias diferentes.", categoria: "Learning Paths", icon: "compass", check: (c) => c.materiasConLp >= 5 },

  /* ───────── Flashcards ───────── */
  { id: "memoria-activada", nombre: "Memoria activada", desc: "Estudia 50 flashcards.", categoria: "Flashcards", icon: "cards", check: (c) => c.flashEstudiadas >= 50 },
  { id: "cien-tarjetas", nombre: "Cien tarjetas", desc: "Estudia 100 flashcards.", categoria: "Flashcards", icon: "cards", check: (c) => c.flashEstudiadas >= 100 },
  { id: "memoria-de-piloto", nombre: "Memoria de piloto", desc: "Estudia 250 flashcards.", categoria: "Flashcards", icon: "brain", check: (c) => c.flashEstudiadas >= 250 },
  { id: "quinientas", nombre: "Quinientas", desc: "Estudia 500 flashcards.", categoria: "Flashcards", icon: "brain", check: (c) => c.flashEstudiadas >= 500 },
  { id: "mil-tarjetas", nombre: "Mil tarjetas", desc: "Estudia 1,000 flashcards.", categoria: "Flashcards", icon: "trophy", check: (c) => c.flashEstudiadas >= 1000 },
  { id: "otra-vuelta", nombre: "Otra vuelta", desc: "Repite una sesión de Flashcards.", categoria: "Flashcards", icon: "refresh", check: (c) => c.flashRepetida },
  { id: "no-se-me-olvida", nombre: "No se me olvida", desc: "Repasa tarjetas que anteriormente habías fallado.", categoria: "Flashcards", icon: "eye", check: (c) => c.flashRecuperadas },
  { id: "dominio-seccion", nombre: "Dominio", desc: "Domina todas las flashcards de una sección.", categoria: "Flashcards", icon: "checkCircle", check: (c) => c.flashSeccionesDominadas >= 1 },
  { id: "memoria-completa", nombre: "Memoria completa", desc: "Domina todas las flashcards de una materia.", categoria: "Flashcards", icon: "medal", check: (c) => c.flashMateriasDominadas >= 1 },
  { id: "flashcard-marathon", nombre: "Flashcard marathon", desc: "Estudia 100 flashcards dentro de una misma sesión.", categoria: "Flashcards", icon: "bolt", check: (c) => c.flashMaxSesion >= 100 },

  /* ───────── Rendimiento ───────── */
  { id: "buen-promedio", nombre: "Buen promedio", desc: "Mantén un promedio de 80% o más durante 10 cuestionarios.", categoria: "Rendimiento", icon: "chart", check: (c) => c.quizCount >= 10 && (c.promedioUltimos10 ?? 0) >= 80 },
  { id: "promedio-solido", nombre: "Promedio sólido", desc: "Mantén un promedio de 90% o más durante 10 cuestionarios.", categoria: "Rendimiento", icon: "stats", check: (c) => c.quizCount >= 10 && (c.promedioUltimos10 ?? 0) >= 90 },
  { id: "precision", nombre: "Precisión", desc: "Obtén 95% o más en 5 cuestionarios consecutivos.", categoria: "Rendimiento", icon: "target", check: (c) => c.quiz95Consecutivos >= 5 },
  { id: "sin-errores", nombre: "Sin errores", desc: "Completa una sesión de cuestionario con 100% de respuestas correctas.", categoria: "Rendimiento", icon: "checkCircle", check: (c) => c.quizPerfectos >= 1 },
  { id: "recuperacion", nombre: "Recuperación", desc: "Mejora tu resultado anterior en al menos 20 puntos porcentuales.", categoria: "Rendimiento", icon: "arrowUp", check: (c) => c.maxMejora >= 20 },
  { id: "de-menos-a-mas", nombre: "De menos a más", desc: "Mejora tu puntuación en 5 cuestionarios consecutivos.", categoria: "Rendimiento", icon: "chart", check: (c) => c.mejoras5Consecutivas },
  { id: "consistente", nombre: "Consistente", desc: "Mantén resultados dentro de un rango máximo de 10 puntos durante 10 cuestionarios.", categoria: "Rendimiento", icon: "gauge", check: (c) => c.quizCount >= 10 && (c.rangoUltimos10 ?? 100) <= 10 },
  { id: "dominio-materia", nombre: "Dominio de materia", desc: "Obtén 90% o más en todos los cuestionarios de una materia.", categoria: "Rendimiento", icon: "medal", check: (c) => c.materiasDominadas >= 1 },
  { id: "cero-dudas", nombre: "Cero dudas", desc: "Completa una sección con 100%.", categoria: "Rendimiento", icon: "star", check: (c) => c.quizPerfectos >= 1 },
  { id: "examen-mode", nombre: "Examen mode", desc: "Obtén 90% o más en cuestionarios de 5 materias diferentes.", categoria: "Rendimiento", icon: "sim", check: (c) => c.materiasQuiz90 >= 5 },

  /* ───────── Biblioteca ───────── */
  { id: "primer-recurso", nombre: "Primer recurso", desc: "Consulta tu primer recurso de la Biblioteca.", categoria: "Biblioteca", icon: "book", check: (c) => c.bibliotecaRecursos >= 1 },
  { id: "curioso", nombre: "Curioso", desc: "Consulta 5 recursos.", categoria: "Biblioteca", icon: "book", check: (c) => c.bibliotecaRecursos >= 5 },
  { id: "investigador", nombre: "Investigador", desc: "Consulta 15 recursos.", categoria: "Biblioteca", icon: "library", check: (c) => c.bibliotecaRecursos >= 15 },
  { id: "biblioteca-abierta", nombre: "Biblioteca abierta", desc: "Consulta 30 recursos.", categoria: "Biblioteca", icon: "library", check: (c) => c.bibliotecaRecursos >= 30 },
  { id: "entre-libros", nombre: "Entre libros", desc: "Consulta recursos pertenecientes a 5 materias diferentes.", categoria: "Biblioteca", icon: "bookmark", check: (c) => c.bibliotecaMaterias >= 5 },

  /* ───────── Tiempo de estudio ───────── */
  { id: "media-hora", nombre: "Media hora", desc: "Acumula 30 minutos de estudio.", categoria: "Tiempo de estudio", icon: "clock", check: (c) => c.minutosTotales >= 30 },
  { id: "primera-hora", nombre: "Primera hora", desc: "Acumula 1 hora de estudio.", categoria: "Tiempo de estudio", icon: "clock", check: (c) => c.minutosTotales >= 60 },
  { id: "cinco-horas", nombre: "Cinco horas", desc: "Acumula 5 horas de estudio.", categoria: "Tiempo de estudio", icon: "timer", check: (c) => c.minutosTotales >= 300 },
  { id: "diez-horas", nombre: "Diez horas", desc: "Acumula 10 horas de estudio.", categoria: "Tiempo de estudio", icon: "timer", check: (c) => c.minutosTotales >= 600 },
  { id: "veinticinco-horas", nombre: "Veinticinco horas", desc: "Acumula 25 horas de estudio.", categoria: "Tiempo de estudio", icon: "timer", check: (c) => c.minutosTotales >= 1500 },
  { id: "cincuenta-horas", nombre: "Cincuenta horas", desc: "Acumula 50 horas de estudio.", categoria: "Tiempo de estudio", icon: "trophy", check: (c) => c.minutosTotales >= 3000 },
  { id: "cien-horas", nombre: "Cien horas", desc: "Acumula 100 horas de estudio.", categoria: "Tiempo de estudio", icon: "trophy", check: (c) => c.minutosTotales >= 6000 },
  { id: "sesion-completa", nombre: "Sesión completa", desc: "Completa una sesión de Estudia con Pathy.", categoria: "Tiempo de estudio", icon: "spark", check: (c) => c.pathySesiones >= 1 },
  { id: "enfocado", nombre: "Enfocado", desc: "Completa 5 sesiones de estudio sin abandonarlas antes del tiempo elegido.", categoria: "Tiempo de estudio", icon: "target", check: (c) => c.sesiones30min >= 5 },
  { id: "tiempo-de-calidad", nombre: "Tiempo de calidad", desc: "Completa 10 sesiones de estudio.", categoria: "Tiempo de estudio", icon: "clock", check: (c) => c.sesionesEstudio >= 10 },

  /* ───────── Retos especiales ───────── */
  { id: "sin-rendirse", nombre: "Sin rendirse", desc: "Reintenta una actividad después de obtener un resultado bajo y mejora el resultado.", categoria: "Retos especiales", icon: "flame", check: (c) => c.bajoLuegoMejor },
  { id: "segundo-intento", nombre: "Segundo intento", desc: "Repite una actividad específicamente para mejorar su resultado.", categoria: "Retos especiales", icon: "refresh", check: (c) => c.repetidoMejorado },
  { id: "cambio-de-rumbo", nombre: "Cambio de rumbo", desc: "Mejora un resultado en al menos 25 puntos porcentuales.", categoria: "Retos especiales", icon: "compass", check: (c) => c.maxMejora >= 25 },
  { id: "contra-reloj", nombre: "Contra reloj", desc: "Completa un cuestionario dentro del tiempo establecido.", categoria: "Retos especiales", icon: "timer", check: (c) => c.contraReloj },
  { id: "todo-terreno", nombre: "Todo terreno", desc: "Utiliza 3 herramientas diferentes de FlightPath durante un mismo día.", categoria: "Retos especiales", icon: "bolt", check: (c) => c.maxHerramientasEnDia >= 3 },
  { id: "dia-productivo", nombre: "Día productivo", desc: "Completa 5 actividades durante un mismo día.", categoria: "Retos especiales", icon: "sun", check: (c) => c.maxActividadesEnDia >= 5 },
  { id: "dia-perfecto", nombre: "Día perfecto", desc: "Completa 3 actividades en un día y obtén 90% o más en todas las calificables.", categoria: "Retos especiales", icon: "star", check: (c) => c.diaPerfecto },
  { id: "semana-perfecta", nombre: "Semana perfecta", desc: "Estudia durante 7 días consecutivos y completa al menos una actividad cada día.", categoria: "Retos especiales", icon: "calendar", check: (c) => c.semanaPerfecta },
  { id: "no-hay-turbulencia", nombre: "No hay turbulencia", desc: "Completa 10 actividades consecutivas sin abandonar ninguna.", categoria: "Retos especiales", icon: "shield", check: (c) => c.actividades >= 10 },
  { id: "piloto-completo", nombre: "Piloto completo", desc: "Utiliza Learning Paths, Cuestionarios, Flashcards y Biblioteca.", categoria: "Retos especiales", icon: "plane", check: (c) => c.lpCompletados >= 1 && c.quizCount >= 1 && c.flashSesiones >= 1 && c.bibliotecaRecursos >= 1 },

  /* ───────── Logros grandes ───────── */
  { id: "primera-materia-completa", nombre: "Primera materia completa", desc: "Completa una materia al 100%.", categoria: "Logros grandes", icon: "graduation", check: (c) => c.materiasLpCompletas >= 1 },
  { id: "tres-materias", nombre: "Tres materias", desc: "Completa 3 materias al 100%.", categoria: "Logros grandes", icon: "graduation", check: (c) => c.materiasLpCompletas >= 3 },
  { id: "cinco-materias", nombre: "Cinco materias", desc: "Completa 5 materias al 100%.", categoria: "Logros grandes", icon: "medal", check: (c) => c.materiasLpCompletas >= 5 },
  { id: "mitad-de-camino", nombre: "Mitad de camino", desc: "Completa el 50% de una ruta de preparación.", categoria: "Logros grandes", icon: "gauge", check: (c) => c.rutaProgresoMax >= 50 },
  { id: "recta-final-ruta", nombre: "Recta final", desc: "Completa el 75% de una ruta de preparación.", categoria: "Logros grandes", icon: "flag", check: (c) => c.rutaProgresoMax >= 75 },
  { id: "preparacion-completa", nombre: "Preparación completa", desc: "Completa una ruta de preparación al 100%.", categoria: "Logros grandes", icon: "trophy", check: (c) => c.rutaProgresoMax >= 100 },
  { id: "no-es-suerte-base", nombre: "No es suerte", desc: "Alcanza un nivel alto de progreso, constancia y rendimiento académico.", categoria: "Logros grandes", icon: "spark", check: (c) => c.rutaProgresoMax >= 75 && c.streakMax >= 14 && (c.promedioGeneral ?? 0) >= 85 && c.actividades >= 50 },
  { id: "preparado-para-despegar", nombre: "Preparado para despegar", desc: "Completa una ruta de preparación al 100% con un promedio de 90% o superior.", categoria: "Logros grandes", icon: "plane", check: (c) => c.rutaProgresoMax >= 100 && (c.promedioGeneral ?? 0) >= 90 },
  { id: "piloto-disciplinado", nombre: "Piloto disciplinado", desc: "Mantén una racha de 30 días y completa al menos 50 actividades.", categoria: "Logros grandes", icon: "shield", check: (c) => c.streakMax >= 30 && c.actividades >= 50 },

  /* ───────── El logro máximo ───────── */
  {
    id: "no-es-suerte-es-preparacion",
    nombre: "No es suerte, es preparación",
    desc: "Algunos logros se ganan. Este se demuestra.",
    categoria: "Máximo",
    icon: "trophy",
    secreto: true,
    especial: true,
    check: (c) =>
      c.rutaProgresoMax >= 100 &&
      c.materiasLpCompletas >= 1 &&
      c.lpCompletados >= 1 &&
      c.quizCount >= 1 &&
      c.flashSesiones >= 1 &&
      c.bibliotecaRecursos >= 1 &&
      c.pathySesiones >= 1 &&
      (c.promedioGeneral ?? 0) >= 90 &&
      c.streakMax >= 30 &&
      c.actividades >= 100,
  },
];

export const LOGROS: LogroDef[] = filas.map((f, i) => ({ ...f, orden: i + 1 }));

export const LOGRO_MAXIMO_ID = "no-es-suerte-es-preparacion";

export const LOGROS_POR_ID = new Map(LOGROS.map((l) => [l.id, l]));

export const LOGRO_CATEGORIAS = Array.from(new Set(LOGROS.map((l) => l.categoria)));

export type { LogroCtx };
