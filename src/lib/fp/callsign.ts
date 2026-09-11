/**
 * Indicativo de Comunidad (callsign).
 *
 * Es el "gamertag" con el que aparece en los rankings quien prefiere no mostrar
 * su nombre: una nube o una aeronave, una estrella y cuatro dígitos, por
 * ejemplo "Cirro Vega #4821". El servidor lo asigna UNA sola vez por alumno y
 * queda fijo; aquí sólo viven los catálogos y la lógica pura, compartida por
 * servidor (generación) y navegador (insignia, formato).
 *
 * Sin marcas de terceros: las aeronaves son tipos, partes y aves que dan nombre
 * a aeronaves, nunca modelos comerciales.
 */

export const CALLSIGN_NUBES = [
  "Cirro",
  "Cúmulo",
  "Nimbo",
  "Estrato",
  "Lenticular",
  "Mammatus",
  "Pileus",
  "Arcus",
  "Virga",
  "Castellanus",
  "Fractus",
  "Congestus",
  "Incus",
  "Undulatus",
  "Radiatus",
  "Fibratus",
  "Uncinus",
  "Floccus",
  "Nebulosus",
  "Velum",
  "Calvus",
  "Capillatus",
  "Humilis",
  "Spissatus",
  "Lacunosus",
  "Perlucidus",
  "Altocúmulo",
  "Cirrostrato",
  "Nimboestrato",
] as const;

export const CALLSIGN_AERONAVES = [
  "Biplano",
  "Planeador",
  "Turbohélice",
  "Reactor",
  "Delta",
  "Canard",
  "Winglet",
  "Estela",
  "Vórtice",
  "Mach",
  "Vector",
  "Alerón",
  "Hélice",
  "Turbina",
  "Rotor",
  "Halcón",
  "Cóndor",
  "Albatros",
  "Gavilán",
  "Vencejo",
  "Águila",
  "Colibrí",
  "Pelícano",
  "Grulla",
  "Cernícalo",
  "Golondrina",
  "Fragata",
  "Aguilucho",
] as const;

export const CALLSIGN_ESTRELLAS = [
  "Sirius",
  "Vega",
  "Altair",
  "Deneb",
  "Rigel",
  "Antares",
  "Polaris",
  "Canopus",
  "Arcturus",
  "Capella",
  "Procyon",
  "Betelgeuse",
  "Aldebarán",
  "Spica",
  "Régulus",
  "Cástor",
  "Pólux",
  "Mizar",
  "Alcor",
  "Alnitak",
  "Mintaka",
  "Bellatrix",
  "Fomalhaut",
  "Achernar",
  "Hadar",
  "Acrux",
  "Mimosa",
  "Adhara",
  "Shaula",
  "Alhena",
  "Electra",
  "Maia",
  "Merope",
  "Alcíone",
  "Atlas",
  "Pleione",
  "Taygeta",
  "Celaeno",
  "Sadr",
  "Albireo",
] as const;

/** FNV-1a de 32 bits: rápido, determinista y suficiente para repartir nombres. */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Genera el indicativo para una semilla (el id del usuario). `salt` permite
 * pedir otra combinación cuando la primera ya está ocupada; el servidor
 * reintenta hasta que la base acepte el valor único.
 */
export function generarCallsign(semilla: string, salt = 0): string {
  const h1 = hashTexto(`${semilla}:a:${salt}`);
  const h2 = hashTexto(`${semilla}:b:${salt}`);
  const h3 = hashTexto(`${semilla}:c:${salt}`);
  const prefijos = [...CALLSIGN_NUBES, ...CALLSIGN_AERONAVES];
  const prefijo = prefijos[h1 % prefijos.length]!;
  const estrella = CALLSIGN_ESTRELLAS[h2 % CALLSIGN_ESTRELLAS.length]!;
  const numero = 1000 + (h3 % 9000);
  return `${prefijo} ${estrella} #${numero}`;
}

const RE_CALLSIGN = /^(\S+) (\S+) #(\d{4})$/u;

export function esCallsign(texto: string | null | undefined): boolean {
  return Boolean(texto && RE_CALLSIGN.test(texto));
}

/** Separa "Cirro Vega #4821" en sus piezas visibles. */
export function partesCallsign(callsign: string): { nombre: string; numero: string } {
  const m = RE_CALLSIGN.exec(callsign);
  if (!m) return { nombre: callsign, numero: "" };
  return { nombre: `${m[1]} ${m[2]}`, numero: `#${m[3]}` };
}

export type InsigniaIcono = "cloud" | "plane" | "star";

/**
 * Insignia visual del indicativo: un tono estable y el glifo de su familia
 * (nube o aeronave). Se deriva del propio texto, así que navegador y servidor
 * pintan lo mismo sin guardar nada extra.
 */
export function insigniaCallsign(callsign: string): { hue: number; icono: InsigniaIcono } {
  const { nombre } = partesCallsign(callsign);
  const primera = nombre.split(" ")[0] ?? "";
  const icono: InsigniaIcono = (CALLSIGN_NUBES as readonly string[]).includes(primera)
    ? "cloud"
    : (CALLSIGN_AERONAVES as readonly string[]).includes(primera)
      ? "plane"
      : "star";
  return { hue: hashTexto(callsign) % 360, icono };
}
