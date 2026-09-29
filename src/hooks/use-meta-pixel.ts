/**
 * Pixel de Meta en una app de una sola página.
 *
 * El código base del pixel (`__root.tsx`) registra la primera visita; aquí se
 * registra cada cambio de pantalla posterior y se guardan los datos de
 * atribución (`fbclid`, UTM) con los que llegó la persona desde el anuncio.
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { captureAttribution, isMetaConfigured, metaTrack } from "@/lib/meta";

export function useMetaPixel(): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const primera = useRef(true);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (isMetaConfigured()) metaTrack("PageView");
  }, [pathname]);
}
