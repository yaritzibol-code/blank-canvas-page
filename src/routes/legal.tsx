import { createFileRoute, Link } from "@tanstack/react-router";
import { BackLink } from "@/components/shared/BackLink";

export const Route = createFileRoute("/legal")({ component: LegalPage });

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "1.25rem", color: INK, fontWeight: 800, margin: "0 0 10px" }}>
        {title}
      </h2>
      <div style={{ color: "#4A5F80", fontSize: 14.5, lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

/** Términos, privacidad y avisos (PRD §12 y §16.19). */
function LegalPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT }}>
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #E3EAF5",
          padding: "16px clamp(16px, 5vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ fontFamily: DISPLAY, fontWeight: 800, color: INK, textDecoration: "none", fontSize: 18 }}>
          FlightPath ✈
        </Link>
        <BackLink />

      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(28px, 6vw, 56px) 20px 80px" }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.6rem, 5vw, 2.2rem)", color: INK, fontWeight: 800, margin: "0 0 8px" }}>
          Términos, privacidad y avisos
        </h1>
        <p style={{ color: "#647DA0", fontSize: 14, marginBottom: 40 }}>
          FlightPath — Aprende, Domina y Vuela · Última actualización: julio 2026
        </p>

        <Section title="Aviso de privacidad y datos personales">
          <p>
            FlightPath recopila únicamente los datos necesarios para crear tu cuenta, personalizar tu
            experiencia y administrar tu acceso: nombre, correo, WhatsApp, escuela de aviación, fecha
            estimada del examen CIAAC, tu progreso, resultados de cuestionarios y simuladores,
            preferencias de estudio, recordatorios y entradas de tu bitácora. Estos datos se usan solo
            con fines educativos, operativos, administrativos y de mejora de la experiencia. Nunca se
            venden ni se comparten con terceros ajenos a la operación de la plataforma.
          </p>
        </Section>

        <Section title="Seguimiento de actividad, cookies y tecnologías similares">
          <p>
            FlightPath registra datos de uso y actividad dentro de la plataforma, como avance en clases,
            tiempo de reproducción, actividades completadas, cuestionarios realizados, simuladores,
            flashcards y uso de herramientas de estudio. Estos datos se utilizan para guardar tu
            progreso, desbloquear contenido, personalizar recomendaciones, mejorar tu experiencia
            educativa y dar seguimiento al funcionamiento de la plataforma. También podemos utilizar
            cookies, identificadores de sesión o tecnologías similares para mantener tu sesión activa,
            recordar preferencias y medir el uso de FlightPath.
          </p>
        </Section>

        <Section title="Uso de inteligencia artificial (Yaris y Pathy)">
          <p>
            Yaris (tutora académica) y Pathy (asistente de progreso y organización) son herramientas de
            apoyo educativo. No garantizan la aprobación del examen, no modifican calificaciones,
            respuestas correctas, resultados, contenido oficial, accesos ni pagos. Yaris no está
            disponible durante un intento activo del Simulador CIAAC. Ninguna de las dos diagnostica,
            trata ni interpreta emocionalmente al estudiante como profesional de salud mental.
          </p>
        </Section>

        <Section title="Mi Bitácora no es una herramienta clínica">
          <p>
            Mi Bitácora puede contener información sobre motivación, concentración, confianza y notas
            personales. Es una herramienta de autoconocimiento académico y seguimiento del estudio; no
            es una herramienta médica, psicológica, terapéutica ni clínica.
          </p>
        </Section>

        <Section title="Disclaimer CIAAC">
          <p>
            FlightPath es una plataforma educativa independiente diseñada para apoyar la preparación del
            examen teórico CIAAC. No es una fuente oficial del CIAAC ni representa a la autoridad
            aeronáutica. El uso de la plataforma no garantiza la aprobación del examen.
          </p>
        </Section>

        <Section title="Uso de materiales">
          <p>
            Los materiales de la Biblioteca incluyen contenido propio, autorizado, documentos de
            consulta o referencias permitidas, con fines exclusivamente educativos. No está permitido
            redistribuir materiales de pago sin autorización. La descarga y la impresión dependen de los
            permisos definidos para cada material.
          </p>
        </Section>

        <Section title="Recordatorios por WhatsApp">
          <p>
            FlightPath usa WhatsApp solo para recordatorios relacionados con tu estudio, progreso,
            racha, repaso o preparación CIAAC. Puedes activarlos, pausarlos, desactivarlos o cambiar tu
            número en cualquier momento desde Recordatorios o Configuración. Los mensajes están
            diseñados para ser breves, útiles y no invasivos.
          </p>
        </Section>

        <Section title="Eliminación de cuenta">
          <p>
            Puedes solicitar la eliminación de tu cuenta desde Configuración. Tu cuenta quedará
            desactivada y tendrás 30 días para cambiar de opinión y recuperarla iniciando sesión de
            nuevo. Después de ese periodo, tu cuenta y la información asociada se eliminarán
            definitivamente, lo que puede implicar la pérdida de progreso, historial, bitácora,
            estadísticas, plan activo y acceso a materiales.
          </p>
        </Section>

        <Section title="Reportes y feedback">
          <p>
            Enviar un reporte no modifica automáticamente preguntas, calificaciones, materiales ni
            resultados: genera un caso que el equipo de FlightPath revisa desde el Panel Admin y al que
            da seguimiento.
          </p>
        </Section>

        <Section title="Protección administrativa">
          <p>
            El Panel Admin es de uso exclusivo de la administradora principal. Ningún estudiante puede
            ver información de otros estudiantes. Las notas internas del equipo no son visibles para los
            estudiantes y los datos académicos y personales se tratan con privacidad.
          </p>
        </Section>

        <p style={{ color: "#8CA0BF", fontSize: 12.5, marginTop: 40 }}>
          © 2026 FlightPath. Si tienes dudas sobre estos avisos, contáctanos desde Configuración →
          Soporte y ayuda.
        </p>
      </main>
    </div>
  );
}
