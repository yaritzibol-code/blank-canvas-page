/**
 * Monta un overlay (`position: fixed`) directamente en `<body>`.
 *
 * Motivo: cualquier ancestro con `transform`, `filter` o `will-change` se
 * convierte en bloque contenedor de sus descendientes `position: fixed`, así
 * que el modal deja de anclarse a la ventana y se coloca respecto a la página
 * completa — el usuario tenía que hacer scroll para encontrarlo. Sacándolo a
 * `<body>` con un portal, el overlay es inmune a lo que hagan los ancestros.
 *
 * Además bloquea el scroll del fondo mientras el modal está abierto y cierra
 * con `Escape` cuando se pasa `onClose`.
 */
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * El servidor no ejecuta layout effects; en el cliente sí interesa que sea de
 * layout, porque así el portal se monta antes del primer pintado y las
 * animaciones de entrada del modal siguen viéndose.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Modales apilados: sólo el último en cerrarse restaura el scroll. */
let openModals = 0;

function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  const { body } = document;
  if (openModals === 0) {
    body.dataset.fpScrollLock = body.style.overflow;
    body.style.overflow = "hidden";
  }
  openModals += 1;
  return () => {
    openModals = Math.max(0, openModals - 1);
    if (openModals === 0) {
      body.style.overflow = body.dataset.fpScrollLock ?? "";
      delete body.dataset.fpScrollLock;
    }
  };
}

export function ModalPortal({
  children,
  onClose,
  lockScroll = true,
}: {
  children: ReactNode;
  /** Si se pasa, `Escape` cierra el modal. */
  onClose?: () => void;
  /** Bloquea el scroll del fondo mientras el modal está abierto. */
  lockScroll?: boolean;
}) {
  /**
   * El portal se crea después de hidratar: el HTML del servidor no contiene el
   * modal, y montarlo durante la hidratación haría que React reportara un
   * desajuste y regenerara el árbol.
   */
  const [mounted, setMounted] = useState(false);
  useIsomorphicLayoutEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!lockScroll) return;
    return lockBodyScroll();
  }, [lockScroll]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // El portal sólo existe en el cliente: en SSR no hay `document`.
  if (!mounted || typeof document === "undefined") return null;
  // `display: contents` no genera caja: el envoltorio sólo marca el modal para
  // los estilos globales que antes lo alcanzaban dentro de `.fp-app-content`.
  return createPortal(
    <div data-fp-modal="" style={{ display: "contents" }}>
      {children}
    </div>,
    document.body,
  );
}
