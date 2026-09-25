/** Official character art, scoped to Learning Paths. Shared avatars keep their current appearance elsewhere. */
export function LearningPathYarisAvatar({ size = 28, ring = false, className = "" }: {
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return <img src="/lp/visual/yaris.png" alt="" aria-hidden="true" draggable={false}
    width={size} height={size} className={`lp-character-avatar ${className}`}
    style={{ width: size, height: size, objectFit: "cover", objectPosition: "center 17%",
      borderRadius: "50%", display: "block", flexShrink: 0,
      background: "rgba(7,27,49,.8)",
      ...(ring ? { boxShadow: "0 0 0 1px rgba(212,175,107,.75)" } : {}) }} />;
}

export function LearningPathPathyMark({ size = 28, float = false, className = "" }: {
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return <img src="/lp/visual/pathy.png" alt="" aria-hidden="true" draggable={false}
    width={size} height={size} className={className}
    style={{ width: size, height: size, objectFit: "contain", display: "block", flexShrink: 0,
      ...(float ? { animation: "fp-float 3.6s ease-in-out infinite" } : {}) }} />;
}
