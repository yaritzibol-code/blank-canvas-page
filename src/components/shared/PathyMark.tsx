/**
 * Pathy en pequeño.
 *
 * Donde Pathy habla en línea (resultados de cuestionario y simulador,
 * recomendaciones del historial) no cabe la mascota animada completa, pero
 * tampoco debe aparecer un icono genérico de nube: la nube flotante se leía
 * como un adorno, no como el personaje. Esto usa el mismo arte de la mascota
 * a tamaño de icono.
 */
export function PathyMark({
  size = 28,
  float = false,
  className = "",
}: {
  size?: number;
  /** Flotación suave para las cabeceras de resultado. */
  float?: boolean;
  className?: string;
}) {
  return (
    <img
      src="/img/pathy-cloud.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        filter: "drop-shadow(0 6px 12px rgba(35,43,77,.18))",
        ...(float ? { animation: "fp-float 3.6s ease-in-out infinite" } : {}),
      }}
    />
  );
}
