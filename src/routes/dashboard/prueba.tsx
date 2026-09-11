/**
 * Ponme a Prueba — herramientas donde la alumna demuestra lo aprendido.
 *
 * Hoy sólo "Explícale a Yaris" está construido; los demás ejercicios se
 * muestran como próximamente para marcar la dirección de la herramienta.
 */
import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { ExplicaleAYaris } from "@/components/prueba/ExplicaleAYaris";
import { isPaid, useSessionUser } from "@/lib/store";
import { YarisAvatar } from "@/components/shared/YarisAvatar";

export const Route = createFileRoute("/dashboard/prueba")({
  component: PonmeAPruebaPage,
  head: () => ({
    meta: [
      { title: "Ponme a Prueba — FlightPath" },
      {
        name: "description",
        content:
          "Demuestra que realmente entendiste: explícale un tema a Yaris y recibe feedback de instructora.",
      },
      { property: "og:title", content: "Ponme a Prueba — FlightPath" },
      {
        property: "og:description",
        content: "Explícale un tema a Yaris con tus palabras y comprueba tu comprensión real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

interface Ejercicio {
  icon: FPIconName;
  titulo: string;
  descripcion: string;
  disponible: boolean;
}

const EJERCICIOS: Ejercicio[] = [
  {
    icon: "chat",
    titulo: "Explícale a Yaris",
    descripcion:
      "Explícale un tema a Yaris con tus propias palabras y demuestra cuánto realmente lo entendiste.",
    disponible: true,
  },
  {
    icon: "plane",
    titulo: "Patrones de espera",
    descripcion: "Practica entradas, procedimientos y situaciones de espera.",
    disponible: false,
  },
  {
    icon: "gauge",
    titulo: "Resuélvelo",
    descripcion: "Resuelve problemas y cálculos de aviación.",
    disponible: false,
  },
  {
    icon: "cloud",
    titulo: "METAR & TAF",
    descripcion: "Interpreta reportes meteorológicos y condiciones de vuelo.",
    disponible: false,
  },
];

function PonmeAPruebaPage() {
  const user = useSessionUser();
  const paid = isPaid(user);
  const [abierto, setAbierto] = useState<"explica" | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 56px", fontFamily: FONT }}>
      {abierto === null && (
        <Link
          to="/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14,
            color: "#3D5D91", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
          }}
        >
          ← Volver al dashboard
        </Link>
      )}

      {abierto === "explica" ? (
        <ExplicaleAYaris onSalir={() => setAbierto(null)} />
      ) : (
        <>
          <header style={{ marginBottom: 22 }}>
            <h1 style={{ fontFamily: DISPLAY, fontSize: "1.8rem", color: "#22375C", margin: "0 0 4px" }}>
              Ponme a Prueba
            </h1>
            <p style={{ fontSize: "0.95rem", color: "#647DA0", margin: 0 }}>
              Demuestra que realmente entendiste.
            </p>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {EJERCICIOS.map((e) => (
              <Tarjeta
                key={e.titulo}
                ejercicio={e}
                onComenzar={() => (paid ? setAbierto("explica") : setUpgradeOpen(true))}
              />
            ))}
          </div>
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Ponme a Prueba"
        benefit="Yaris te pone a prueba como instructora: te reta, te repregunta y te dice qué reforzar."
        userId={user.id}
      />
    </div>
  );
}

function Tarjeta({ ejercicio, onComenzar }: { ejercicio: Ejercicio; onComenzar: () => void }) {
  const activo = ejercicio.disponible;
  const base: CSSProperties = {
    background: activo ? "white" : "#F5F6F9",
    border: activo ? "2px solid #3D5D91" : "1px solid #E3E7EF",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: activo ? "0 12px 30px rgba(34,55,92,.10)" : "none",
    opacity: activo ? 1 : 0.72,
  };

  return (
    <article style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {activo ? (
          <YarisAvatar size={38} />
        ) : (
          <div
            style={{
              width: 38, height: 38, borderRadius: 12, background: "#E7EBF3",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon n={ejercicio.icon} size={18} color="#8DA1BE" />
          </div>
        )}
        <h2
          style={{
            fontFamily: DISPLAY, fontSize: "1.05rem", margin: 0,
            color: activo ? "#22375C" : "#7B8CA6",
          }}
        >
          {ejercicio.titulo}
        </h2>
      </div>

      <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: activo ? "#4A5C77" : "#8DA1BE", margin: 0, flex: 1 }}>
        {ejercicio.descripcion}
      </p>

      {activo ? (
        <button
          onClick={onComenzar}
          style={{
            minHeight: 46, borderRadius: 12, border: "none", background: "#3D5D91",
            color: "white", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", fontFamily: FONT,
          }}
        >
          Comenzar
        </button>
      ) : (
        <span
          style={{
            alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
            background: "#E7EBF3", color: "#7B8CA6", borderRadius: 999,
            padding: "6px 12px", fontSize: "0.74rem", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: ".05em",
          }}
        >
          <Icon n="clock" size={13} /> Próximamente
        </span>
      )}
    </article>
  );
}
