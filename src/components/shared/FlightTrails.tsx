import { useEffect, useRef } from "react";
import { mountReferenceMotion } from "../landing/reference-motion";

/** Decorative flight paths from the supplied design; never intercepts controls. */
export function FlightTrails() {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => (root.current ? mountReferenceMotion(root.current) : undefined), []);
  return (
    <span
      ref={root}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: -1 }}
    >
      <canvas
        data-motion="planes"
        data-tone="dark"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </span>
  );
}
