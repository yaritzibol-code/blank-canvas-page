import {
  Books,
  Brain,
  Cards,
  ChartLine,
  Compass,
  GearSix,
  GraduationCap,
  Notebook,
  Person,
  PlayCircle,
  Radio,
  Sparkle,
  Target,
  Timer,
  Trophy,
  UsersThree,
  Wallet,
  type Icon,
} from "@phosphor-icons/react";

export type Section = { label: string; path: string; description: string; icon: Icon };
export type Destination = {
  code: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  description: string;
  photo: string;
  icon: Icon;
  sections: Section[];
};
export const ASSETS = "/flightdeck/";
export const DESTINATIONS: Destination[] = [
  {
    code: "LAX",
    name: "Aprendizaje",
    city: "Los Ángeles",
    lat: 33.9425,
    lon: -118.4081,
    timezone: "America/Los_Angeles",
    description:
      "Construye tu ruta, entiende cada concepto y convierte lo aprendido en tu siguiente gran despegue.",
    photo: "foto-ruta-aprendizaje.jpg",
    icon: GraduationCap,
    sections: [
      {
        label: "Learning Paths",
        path: "/dashboard/rutas",
        description: "Tu ruta de aprendizaje, paso a paso",
        icon: GraduationCap,
      },
      {
        label: "Flashcards",
        path: "/dashboard/flashcards",
        description: "Repasa y fortalece tu memoria",
        icon: Cards,
      },
      {
        label: "Clases grabadas",
        path: "/dashboard/clases",
        description: "La explicación, a tu ritmo",
        icon: PlayCircle,
      },
      {
        label: "Estudiemos Juntos",
        path: "/dashboard/estudiemos",
        description: "Tu sesión de estudio guiada",
        icon: UsersThree,
      },
    ],
  },
  {
    code: "MEX",
    name: "Cuestionarios",
    city: "Ciudad de México",
    lat: 19.4361,
    lon: -99.0719,
    timezone: "America/Mexico_City",
    description:
      "Practica con los bancos reales: el examen CIAAC, el de línea aérea y retos cortos contra el reloj.",
    photo: "foto-cuestionario-tablet.jpg",
    icon: Target,
    sections: [
      {
        label: "CIAAC",
        path: "/dashboard/banco",
        description: "Banco explicado y simulador de 310",
        icon: Cards,
      },
      {
        label: "Línea Aérea",
        path: "/dashboard/linea-aerea",
        description: "Las 5 fuentes del examen de aerolínea",
        icon: Compass,
      },
      {
        label: "Ponme a Prueba",
        path: "/dashboard/prueba",
        description: "Reto corto contra el reloj",
        icon: Timer,
      },
    ],
  },
  {
    code: "BOG",
    name: "Aptitudes",
    city: "Bogotá",
    lat: 4.7016,
    lon: -74.1469,
    timezone: "America/Bogota",
    description:
      "Entrena tu inglés aeronáutico y las habilidades que necesitas dentro de la cabina.",
    photo: "foto-aptitudes.jpg",
    icon: Brain,
    sections: [
      {
        label: "RTARI",
        path: "/dashboard/rtari",
        description: "Inglés aeronáutico y entrevista por voz",
        icon: Radio,
      },
      {
        label: "COMPASS",
        path: "/dashboard/compass",
        description: "Entrenamiento de aptitudes de piloto",
        icon: Brain,
      },
    ],
  },
  {
    code: "MIA",
    name: "Biblioteca",
    city: "Miami",
    lat: 25.7959,
    lon: -80.287,
    timezone: "America/New_York",
    description:
      "Tu biblioteca de vuelo. Consulta manuales y materiales para preparar cada etapa de tu formación.",
    photo: "foto-biblioteca.jpg",
    icon: Books,
    sections: [
      {
        label: "Biblioteca",
        path: "/dashboard/biblioteca",
        description: "Manuales, documentos y material de consulta",
        icon: Books,
      },
    ],
  },
  {
    code: "GRU",
    name: "Comunidad",
    city: "São Paulo",
    lat: -23.4356,
    lon: -46.4731,
    timezone: "America/Sao_Paulo",
    description:
      "Cada sesión cuenta. Descubre tu lugar en la comunidad y celebra tus avances con otros pilotos.",
    photo: "foto-mesa-estudio.jpg",
    icon: Trophy,
    sections: [
      {
        label: "Ranking",
        path: "/dashboard/comunidad",
        description: "Tu constancia te lleva más alto",
        icon: Trophy,
      },
    ],
  },
];
export const ACCOUNT_SECTIONS: Section[] = [
  {
    label: "Mi perfil",
    path: "/dashboard/perfil",
    description: "Tu identidad de vuelo",
    icon: Person,
  },
  {
    label: "Facturación",
    path: "/dashboard/facturacion",
    description: "Plan y pagos",
    icon: Wallet,
  },
  {
    label: "Análisis",
    path: "/dashboard/analisis",
    description: "Tu progreso real",
    icon: ChartLine,
  },
  {
    label: "Mi Bitácora",
    path: "/dashboard/bitacora",
    description: "Registra cada sesión",
    icon: Notebook,
  },
];
export const SETTINGS_SECTIONS: Section[] = [
  {
    label: "Configuración",
    path: "/dashboard/configuracion",
    description: "Ajusta tu experiencia",
    icon: GearSix,
  },
  {
    label: "Recordatorios",
    path: "/dashboard/recordatorios",
    description: "Tu siguiente sesión",
    icon: Timer,
  },
  { label: "Planes", path: "/dashboard/planes", description: "Elige cómo volar", icon: Sparkle },
];
export function destinationForPath(path: string) {
  return DESTINATIONS.find((d) =>
    d.sections.some((s) => path === s.path || path.startsWith(s.path + "/")),
  );
}
