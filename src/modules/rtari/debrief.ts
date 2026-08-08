/**
 * Forma del debrief de la entrevista RTARI.
 *
 * Vive aparte de `rtari.server.ts` porque la UI y el historial local necesitan
 * estos tipos, y ese módulo importa el cliente de servicio de Supabase: al
 * traerlo desde el navegador se llevaría medio servidor al bundle.
 */
import type { IcaoSkill } from "./icao";

export interface DebriefTurn {
  role: "examiner" | "candidate";
  text: string;
}

/** Una frase del alumno y cómo se dice bien. */
export interface DebriefCorreccion {
  dijiste: string;
  mejor: string;
  porque: string;
}

/** Un área de la escala OACI que salió floja, con su evidencia. */
export interface DebriefArea {
  skill: IcaoSkill;
  comentario: string;
  ejemplo?: string;
}

export interface DebriefVocabulario {
  en: string;
  es: string;
  uso: string;
}

export interface RtariDebrief {
  niveles: Partial<Record<IcaoSkill, number>>;
  veredicto: string;
  fortalezas: string[];
  areas: DebriefArea[];
  correcciones: DebriefCorreccion[];
  vocabulario: DebriefVocabulario[];
  siguientes: string[];
  /** true cuando el alumno habló tan poco que la calificación no es confiable. */
  muestraCorta: boolean;
}
