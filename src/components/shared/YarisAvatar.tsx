/**
 * Avatar de Yaris (tutora de IA).
 *
 * Yaris es un personaje, no un icono genérico: donde antes había una
 * "estrellita de IA" ahora va su retrato. Se usa en cabeceras de chat,
 * burbujas de respuesta y botones que la invocan.
 */
export function YarisAvatar({
  size = 28,
  ring = false,
  className = "",
}: {
  size?: number;
  /** Aro suave para cabeceras sobre fondo oscuro. */
  ring?: boolean;
  className?: string;
}) {
  return (
    <img
      src="/assets/yaris-face.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: "50%",
        display: "block",
        flexShrink: 0,
        background: "#FFFFFF",
        ...(ring ? { boxShadow: "0 0 0 2px rgba(255,255,255,.55)" } : {}),
      }}
    />
  );
}
