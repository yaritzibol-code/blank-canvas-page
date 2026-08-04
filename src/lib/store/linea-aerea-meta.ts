/**
 * Metadata ligera de los cuestionarios de Línea Aérea (5 manuales oficiales).
 * Vive aparte del banco de 250 preguntas para que el módulo pueda listarlos
 * sin descargar ~340 KB de preguntas al abrir la página.
 */
export interface LineaAereaQuiz {
  code: string;
  titulo: string;
  materia: string;
  icon: string;
  total: number;
  /** PDF fuente en Drive (visor embebible). */
  fileUrl: string;
}

/** Total del cuestionario OFICIAL de la convocatoria (fuente LAOF). */
export const LINEA_AEREA_OFICIAL_TOTAL = 377;

export const LINEA_AEREA_QUIZZES: LineaAereaQuiz[] = [
  {
    "code": "ATP",
    "titulo": "ATP — Airline Transport Pilot (excepto Performance y Weight & Balance)",
    "materia": "operaciones",
    "icon": "doc",
    "total": 50,
    "fileUrl": "https://drive.google.com/file/d/1twt092Ek_CE1yTPk1FaKM-PkeqPBDA9S/preview"
  },
  {
    "code": "ANX10",
    "titulo": "OACI Anexo 10 Vol. II — Procedimientos de Comunicaciones",
    "materia": "comunicaciones",
    "icon": "radio",
    "total": 50,
    "fileUrl": "https://drive.google.com/file/d/1-m3KPCzA6lX7u4zO6_6TCAsJf_-VHyIB/preview"
  },
  {
    "code": "CPAM",
    "titulo": "CPAM — Legislación Nacional para Tripulaciones de Vuelo",
    "materia": "legislacion",
    "icon": "scale",
    "total": 50,
    "fileUrl": "https://drive.google.com/file/d/1Eq5EDfzqnKDrGDjBQtZDK26QFKp6Gfj0/preview"
  },
  {
    "code": "JEPP",
    "titulo": "Jeppesen General Airway Manual — Introduction",
    "materia": "navegacion",
    "icon": "map",
    "total": 50,
    "fileUrl": "https://drive.google.com/file/d/1NdiWKEH7vqMqW5Zst_UDyAHnu5IxJMGx/preview"
  },
  {
    "code": "PHAK",
    "titulo": "Pilot's Handbook of Aeronautical Knowledge (FAA-H-8083-25C)",
    "materia": "aerodinamica",
    "icon": "plane",
    "total": 50,
    "fileUrl": "https://drive.google.com/file/d/1It2xSBSn-vX4xYDFQHH2DMJd02J_k_zO/preview"
  }
];
