/** Registro canónico de las 12 materias CIAAC (fuente única de verdad). */

export interface MateriaDef {
  slug: string;
  name: string;
  icon: string; // FPIconName
  /** Preguntas de esta materia dentro del simulador de 310. */
  simTotal: number;
}

export const MATERIAS_DEF: MateriaDef[] = [
  { slug: "aerodinamica", name: "Aerodinámica", icon: "plane", simTotal: 30 },
  { slug: "aeronaves-motores", name: "Aeronaves y Motores", icon: "settings", simTotal: 30 },
  { slug: "legislacion", name: "Legislación Aeronáutica", icon: "scale", simTotal: 30 },
  { slug: "medicina", name: "Medicina de Aviación", icon: "stethoscope", simTotal: 20 },
  { slug: "meteorologia", name: "Meteorología", icon: "cloud", simTotal: 30 },
  { slug: "navegacion", name: "Navegación Aérea", icon: "map", simTotal: 30 },
  { slug: "servicios-transito", name: "Servicios de Tránsito Aéreo", icon: "tower", simTotal: 30 },
  { slug: "comunicaciones", name: "Comunicaciones Aeronáuticas", icon: "radio", simTotal: 20 },
  { slug: "manuales-ais", name: "Manuales de Información Aeronáutica", icon: "book", simTotal: 20 },
  { slug: "factores-humanos", name: "Factores Humanos", icon: "brain", simTotal: 20 },
  { slug: "seguridad-aerea", name: "Seguridad Aérea", icon: "shield", simTotal: 20 },
  { slug: "operaciones", name: "Operaciones Aeronáuticas", icon: "doc", simTotal: 30 },
];

export const SIM_TOTAL_QS = MATERIAS_DEF.reduce((s, m) => s + m.simTotal, 0); // 310

export function materiaBySlug(slug: string): MateriaDef | undefined {
  return MATERIAS_DEF.find((m) => m.slug === slug);
}

export function materiaByName(name: string): MateriaDef | undefined {
  const n = name.trim().toLowerCase();
  return MATERIAS_DEF.find((m) => m.name.toLowerCase() === n || m.slug === n);
}
