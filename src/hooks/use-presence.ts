/**
 * Publica la presencia de esta pestaña en el canal en vivo.
 *
 * Se monta una sola vez (layout del dashboard). Re-publica al cambiar de
 * pantalla o de actividad, y refresca la marca de interacción como máximo
 * cada 30 s para no generar tráfico innecesario.
 */
import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  crearCanalPresencia,
  getPresenceActivity,
  nombrePantalla,
  onPresenceActivityChange,
  type PresenceState,
} from "@/lib/presence";
import type { User } from "@/lib/store/types";

const HEARTBEAT_MS = 30_000;

export function usePresence(user: User | null | undefined): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [actividad, setActividad] = useState<string | null>(() => getPresenceActivity());
  const canalRef = useRef<RealtimeChannel | null>(null);
  const desdeRef = useRef<string>(new Date().toISOString());
  const interaccionRef = useRef<number>(Date.now());
  const tabIdRef = useRef<string>("");
  if (!tabIdRef.current) {
    tabIdRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `tab_${Math.random().toString(36).slice(2)}`;
  }

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

  // Canal: se abre con la sesión y se cierra al salir.
  useEffect(() => {
    if (!user) return;
    const canal = crearCanalPresencia(tabIdRef.current);
    if (!canal) return;
    canalRef.current = canal;
    canal.subscribe((status) => {
      if (status === "SUBSCRIBED") void canal.track(estado());
    });
    const id = window.setInterval(() => {
      void canal.track(estado());
    }, HEARTBEAT_MS);
    const salir = () => {
      void canal.untrack();
    };
    window.addEventListener("pagehide", salir);
    return () => {
      window.removeEventListener("pagehide", salir);
      window.clearInterval(id);
      canalRef.current = null;
      const client = canal;
      void client.unsubscribe();
    };

    function estado(): PresenceState {
      return {
        tabId: tabIdRef.current,
        userId: user!.id,
        nombre: user!.nombre || "Sin nombre",
        email: user!.email || "",
        role: user!.role,
        plan: user!.plan,
        avatarPath: user!.avatarPath ?? null,
        ruta: window.location.pathname,
        pantalla: nombrePantalla(window.location.pathname),
        actividad: getPresenceActivity(),
        desde: desdeRef.current,
        ultimaInteraccion: new Date(interaccionRef.current).toISOString(),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Re-publica al cambiar de pantalla o de actividad.
  useEffect(() => {
    const canal = canalRef.current;
    if (!canal || !user) return;
    interaccionRef.current = Date.now();
    void canal.track({
      tabId: tabIdRef.current,
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
    } satisfies PresenceState);
  }, [pathname, actividad, user]);
}
