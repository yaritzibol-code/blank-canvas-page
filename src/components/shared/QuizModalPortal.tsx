import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

let openQuizModals = 0;
let unlockPage: (() => void) | null = null;

/** Keeps questionnaire setup dialogs attached to the viewport, not a scrolled card. */
export function QuizModalPortal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openQuizModals++ === 0) {
      const body = document.body;
      const html = document.documentElement;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const previous = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow,
        htmlOverflow: html.style.overflow,
      };
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = `-${scrollX}px`;
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      unlockPage = () => {
        body.style.position = previous.position;
        body.style.top = previous.top;
        body.style.left = previous.left;
        body.style.right = previous.right;
        body.style.width = previous.width;
        body.style.overflow = previous.overflow;
        html.style.overflow = previous.htmlOverflow;
        window.scrollTo(scrollX, scrollY);
      };
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openQuizModals--;
      if (openQuizModals === 0) {
        unlockPage?.();
        unlockPage = null;
      }
      previousFocus?.focus({ preventScroll: true });
    };
  }, [mounted]);

  return mounted ? createPortal(children, document.body) : null;
}
