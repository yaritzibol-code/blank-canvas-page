import type { IconName } from "@/components/landing/shared";

/**
 * Icono de landing por materia. Las materias guardan el icono del set del
 * dashboard (`MATERIAS_DEF.icon`); las páginas públicas usan otro juego de
 * glifos, así que aquí vive la traducción — compartida por /ciaac, las guías
 * /ciaac/$materia y la calculadora.
 */
export const ICONO_MATERIA: Record<string, IconName> = {
  aerodinamica: "plane",
  "aeronaves-motores": "bolt",
  legislacion: "doc",
  medicina: "heart",
  meteorologia: "waypoint",
  navegacion: "compass",
  "servicios-transito": "grid",
  comunicaciones: "radio",
  "manuales-ais": "library",
  "factores-humanos": "brain",
  "seguridad-aerea": "shield",
  operaciones: "sim",
};
