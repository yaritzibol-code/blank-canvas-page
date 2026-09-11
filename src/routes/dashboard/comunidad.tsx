/**
 * Comunidad — el tablero de rankings de FlightPath.
 *
 * Los rankings están abiertos siempre: se cargan de inmediato y el tutorial de
 * primera vez se dibuja ENCIMA de la interfaz real, con foco sobre cada pieza.
 * Los cinco rankings y sus valores vienen del servidor; aquí no se calcula ni
 * un punto. Privacidad real: quien no publica su nombre aparece con su
 * indicativo (callsign) y su insignia. Las cuentas administrativas ven todo,
 * pero no participan (se excluyen en la RPC).
 *
 * Esta ruta sólo carga datos y guarda preferencias; la presentación vive en
 * `components/comunidad/ComunidadView`.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAvatarUrl } from "@/components/shared/AvatarPicker";
import { useSessionUser } from "@/lib/store";
import {
  getComunidad,
  getFlightPoints,
  getMisPosiciones,
  setCommunityPrefs,
} from "@/lib/fp/fp.functions";
import { sincronizarFP } from "@/lib/fp/client";
import { ComunidadView, type PosicionRanking } from "@/components/comunidad/ComunidadView";
import { Tutorial } from "@/components/comunidad/Tutorial";
import type { FpPeriodo, FpRankingId, FpRankingRow, FpResumen } from "@/lib/fp/shared";

export const Route = createFileRoute("/dashboard/comunidad")({
  component: ComunidadPage,
  head: () => ({
    meta: [
      { title: "Comunidad FlightPath: los rankings de quienes están destacando" },
      {
        name: "description",
        content:
          "Rankings abiertos de FlightPath: Top General, Top CIAAC, Top Línea Aérea, racha más larga y más logros. Cada punto sale de actividad real.",
      },
      { property: "og:title", content: "Comunidad FlightPath" },
      {
        property: "og:description",
        content: "Aquí reconocemos a quienes están dando lo mejor de sí en FlightPath.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

/** Indicativo de respaldo mientras el servidor asigna el real. */
const CALLSIGN_PROVISIONAL = "Cirro Vega #0000";

function ComunidadPage() {
  const user = useSessionUser();
  const [metric, setMetric] = useState<FpRankingId>("general");
  const [periodo, setPeriodo] = useState<FpPeriodo>("semana");
  const [top, setTop] = useState<FpRankingRow[]>([]);
  const [yo, setYo] = useState<FpRankingRow[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [miPosicion, setMiPosicion] = useState<number | null>(null);
  const [miValor, setMiValor] = useState<number | null>(null);
  const [faltan, setFaltan] = useState<number | null>(null);
  const [posicionArriba, setPosicionArriba] = useState<number | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [resumen, setResumen] = useState<FpResumen | null>(null);
  const [posiciones, setPosiciones] = useState<PosicionRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tutorial, setTutorial] = useState(false);
  const miFoto = useAvatarUrl(user?.avatarPath);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getComunidad({ data: { metric, periodo } });
      setTop(r.top);
      setYo(r.yo);
      setTotalParticipantes(r.total);
      setMiPosicion(r.miPosicion);
      setMiValor(r.miValor);
      setFaltan(r.faltan);
      setPosicionArriba(r.posicionArriba);
      setEsAdmin(r.esAdmin);
    } finally {
      setCargando(false);
    }
  }, [metric, periodo]);

  useEffect(() => {
    if (!user) return;
    void sincronizarFP(true).then(() =>
      getFlightPoints().then((r) => {
        setResumen(r);
        if (!r.tutorialVisto && !r.tutorialOculto) setTutorial(true);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (user) void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, cargar]);

  useEffect(() => {
    if (!user) return;
    void getMisPosiciones({ data: { periodo } }).then((r) => {
      setPosiciones(r.posiciones);
      setEsAdmin(r.esAdmin);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, periodo]);

  const cambiarPrivacidad = useCallback(
    async (p: "nombre" | "folio") => {
      setResumen((r) => (r ? { ...r, privacidad: p, privacidadElegida: true } : r));
      await setCommunityPrefs({ data: { privacidad: p } });
      void cargar();
    },
    [cargar],
  );

  const cerrarTutorial = useCallback(async ({ noMostrar }: { noMostrar: boolean }) => {
    setTutorial(false);
    setResumen((r) => (r ? { ...r, tutorialVisto: true, tutorialOculto: noMostrar } : r));
    await setCommunityPrefs({ data: { tutorialVisto: true, tutorialOculto: noMostrar } });
  }, []);

  if (!user) return null;

  const nombre = user.nombre || user.email.split("@")[0] || "Piloto";

  return (
    <>
      <ComunidadView
        nombre={nombre}
        miFoto={miFoto}
        metric={metric}
        periodo={periodo}
        top={top}
        yo={yo}
        totalParticipantes={totalParticipantes}
        miPosicion={miPosicion}
        miValor={miValor}
        faltan={faltan}
        posicionArriba={posicionArriba}
        esAdmin={esAdmin}
        resumen={resumen}
        posiciones={posiciones}
        cargando={cargando}
        onMetric={setMetric}
        onPeriodo={setPeriodo}
        onPrivacidad={cambiarPrivacidad}
        onAbrirTutorial={() => setTutorial(true)}
      />

      {tutorial && resumen && (
        <Tutorial
          esAdmin={esAdmin}
          yo={{
            nombre,
            avatarUrl: miFoto,
            callsign: resumen.callsign || CALLSIGN_PROVISIONAL,
            privacidad: resumen.privacidad,
            privacidadElegida: resumen.privacidadElegida,
            tutorialVisto: resumen.tutorialVisto,
          }}
          hayZona={!esAdmin && yo.length > 0}
          onPrivacidad={cambiarPrivacidad}
          onCerrar={(r) => void cerrarTutorial(r)}
        />
      )}
    </>
  );
}
