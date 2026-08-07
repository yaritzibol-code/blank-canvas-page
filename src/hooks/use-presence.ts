/**
 * Publica la presencia de esta pestaña en el canal en vivo compartido.
 *
 * Se monta una sola vez (raíz de la app). Re-publica al cambiar de pantalla o
 * de actividad, y refresca la marca de interacción como máximo cada 30 s.
 */
import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  TAB_ID,
  getPresenceActivity,
  nombrePantalla,
  onPresenceActivityChange,
  publicarPresencia,
  retirarPresencia,
  type PresenceState,
} from "@/lib/presence";
import type { User } from "@/lib/store/types";

const HEARTBEAT_MS = 30_000;

export function usePresence(user: User | null | undefined): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [actividad, setActividad] = useState<string | null>(() => getPresenceActivity());
  const desdeRef = useRef<string>(new Date().toISOString());
  const interaccionRef = useRef<number>(Date.now());

  // Cambios de actividad reportados por los módulos.
  useEffect(() => onPresenceActivityChange(() => setActividad(getPresenceActivity())), []);

  // Marca de interacción real.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const marcar = () => {
      interaccionRef.current = Date.now();
    };
    const eventos: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "wheel", "focus"];
    eventos.forEach((e) => window.addEventListener(e, marcar, { passive: true }));
    const onVis = () => {
      if (document.visibilityState === "visible") marcar();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, marcar));
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Publicación: mientras haya sesión, esta pestaña aparece en el canal.
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const estado = (): PresenceState => ({
      tabId: TAB_ID,
      userId: user.id,
      nombre: user.nombre || "Sin nombre",
      email: user.email || "",
      role: user.role,
      plan: user.plan,
      avatarPath: user.avatarPath ?? null,
      ruta: window.location.pathname,
      pantalla: nombrePantalla(window.location.pathname),
      actividad: getPresenceActivity(),
      desde: desdeRef.current,
      ultimaInteraccion: new Date(interaccionRef.current).toISOString(),
    });

    publicarPresencia(estado());
    const id = window.setInterval(() => publicarPresencia(estado()), HEARTBEAT_MS);
    const salir = () => retirarPresencia();
    window.addEventListener("pagehide", salir);
    return () => {
      window.removeEventListener("pagehide", salir);
      window.clearInterval(id);
      retirarPresencia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Re-publica al cambiar de pantalla o de actividad.
  useEffect(() => {
    if (!user) return;
    interaccionRef.current = Date.now();
    publicarPresencia({
      tabId: TAB_ID,
      userId: user.id,
      nombre: user.nombre || "Sin nombre",
      email: user.email || "",
      role: user.role,
      plan: user.plan,
      avatarPath: user.avatarPath ?? null,
      ruta: pathname,
      pantalla: nombrePantalla(pathname),
      actividad,
      desde: desdeRef.current,
      ultimaInteraccion: new Date().toISOString(),
    });
  }, [pathname, actividad, user]);
}
