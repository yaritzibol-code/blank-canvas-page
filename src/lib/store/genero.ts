/**
 * Concordancia de género para dirigirse a la estudiante o al estudiante.
 *
 * El género se elige en el onboarding y se puede cambiar en Mi perfil. Cuando
 * no está definido usamos la forma neutra ("¿cómo te sientes?"), nunca una
 * suposición a partir del nombre.
 */
import type { User } from "./types";

export type Genero = "femenino" | "masculino" | "neutro";

export function generoDe(user: Pick<User, "genero"> | null | undefined): Genero {
  return user?.genero ?? "neutro";
}

/**
 * Elige la forma correcta de una palabra con género.
 * `gen("Ansiosa", "Ansioso", "Con ansiedad")`.
 */
export function porGenero(g: Genero, femenino: string, masculino: string, neutro?: string): string {
  if (g === "femenino") return femenino;
  if (g === "masculino") return masculino;
  return neutro ?? `${femenino}/${masculino.slice(-1)}`;
}

/** Terminación sola: "a" | "o" | "a/o". */
export function terminacion(g: Genero): string {
  return g === "femenino" ? "a" : g === "masculino" ? "o" : "a/o";
}

/**
 * Adjetivo con la terminación correcta a partir de la raíz.
 * `adjetivo("femenino", "Ansios")` → "Ansiosa"; neutro → "Ansiosa/o".
 */
export function adjetivo(g: Genero, raiz: string): string {
  return `${raiz}${terminacion(g)}`;
}

/** "listo" / "lista" / "listo/a" para frases del producto. */
export function listo(g: Genero): string {
  return adjetivo(g, "list");
}
