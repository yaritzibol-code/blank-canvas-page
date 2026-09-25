/**
 * Muestra a la alumna, una por una, las transmisiones del equipo que aún no
 * recibe. Espera a que no haya otro diálogo abierto (recorrido de Pathy,
 * onboarding, ofertas…) y no interrumpe COMPASS ni la entrevista RTARI.
 */
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  marcarNotificacionRecibida,
  notificacionesPendientes,
  useSessionUser,
  useStore,
} from "@/lib/store";
import { RadioTransmission } from "./RadioTransmission";

/** Pantallas con actividad en curso: la transmisión espera a que salga. */
const RUTAS_EN_VUELO = /^\/dashboard\/(compass|rtari)(\/|$)/;

function hayOtroDialogo(): boolean {
  const abiertos = document.querySelectorAll<HTMLElement>(
    'dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]',
  );
  return [...abiertos].some(
    (el) => !el.closest(".fd-radio-dialog") && el.getClientRects().length > 0,
  );
}

export function RadioWatcher() {
  const user = useSessionUser();
  const { pathname } = useLocation();
  const [ahora, setAhora] = useState(() => Date.now());
  const [libre, setLibre] = useState(false);
  const pendientes = useStore(() => notificacionesPendientes(user, ahora));
  /** Transmisiones de esta racha, para numerar "Mensaje 2 de 3". */
  const lote = useRef<string[]>([]);

  // Revisa cada pocos segundos: vigencias que vencen y diálogos que se cierran.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 3000);
    return () => clearInterval(id);
  }, []);

  const esAlumna = !!user && user.role !== "admin";
  const hayPendientes = pendientes.length > 0;
  useEffect(() => {
    if (!esAlumna || !hayPendientes) return;
    // Un respiro tras navegar: deja que la pantalla y sus diálogos se monten.
    const t = setTimeout(() => setLibre(!hayOtroDialogo()), 900);
    return () => clearTimeout(t);
  }, [esAlumna, hayPendientes, pathname, ahora]);

  if (!esAlumna || !hayPendientes || RUTAS_EN_VUELO.test(pathname)) return null;
  const actual = pendientes[0];
  const enLote = lote.current;
  if (!enLote.includes(actual.id)) {
    // Racha nueva si la anterior ya se recibió completa.
    if (!enLote.some((id) => pendientes.some((p) => p.id === id))) enLote.length = 0;
    for (const p of pendientes) if (!enLote.includes(p.id)) enLote.push(p.id);
  }
  if (!libre) return null;

  const nombre = user.nombre?.trim().split(/\s+/)[0] || "Cadete";
  return (
    <RadioTransmission
      key={actual.id}
      noti={actual}
      destinatario={nombre}
      posicion={{ actual: enLote.indexOf(actual.id) + 1, total: enLote.length }}
      onRecibido={() => void marcarNotificacionRecibida(actual.id)}
    />
  );
}
