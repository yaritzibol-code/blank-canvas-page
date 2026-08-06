import { createFileRoute, Link } from "@tanstack/react-router";
import { BackLink } from "@/components/shared/BackLink";
import { TERMS_VERSION } from "@/lib/terms-version";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
  head: () => ({
    meta: [
      { title: "Términos y condiciones, privacidad y avisos — FlightPath" },
      { name: "description", content: "Términos y condiciones del servicio, política de suscripción, cancelación y reembolsos, aviso de privacidad y avisos legales de FlightPath." },
      { property: "og:title", content: "Términos y condiciones — FlightPath" },
      { property: "og:description", content: "Términos del servicio, suscripción, cancelación, reembolsos y aviso de privacidad de FlightPath." },
      { property: "og:url", content: "https://flightpath.mx/legal" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/legal" }],
  }),
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";
const CONTACT = "contacto@flightpath.mx";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 34, scrollMarginTop: 90 }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "1.25rem", color: INK, fontWeight: 800, margin: "0 0 10px" }}>
        {title}
      </h2>
      <div style={{ color: "#4A5F80", fontSize: 14.5, lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: DISPLAY, fontSize: "1.02rem", color: INK, fontWeight: 800, margin: "22px 0 8px" }}>
      {children}
    </h3>
  );
}

/** Términos y condiciones, aviso de privacidad y avisos (PRD §12 y §16.19). */
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
        <p style={{ color: "#647DA0", fontSize: 14, marginBottom: 26 }}>
          FlightPath — Aprende, Domina y Vuela · Última actualización: 4 de agosto de 2026 · Versión {TERMS_VERSION}
        </p>

        {/* Índice */}
        <nav style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 14, padding: "16px 20px", marginBottom: 36, fontSize: 13.5 }}>
          <strong style={{ color: INK, display: "block", marginBottom: 8 }}>Contenido</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 4 }}>
            <a href="#terminos" style={{ color: "#3D5D91", textDecoration: "none" }}>1. Términos y condiciones</a>
            <a href="#pagos" style={{ color: "#3D5D91", textDecoration: "none" }}>2. Suscripción, pagos y renovación</a>
            <a href="#cancelacion" style={{ color: "#3D5D91", textDecoration: "none" }}>3. Cancelación y reembolsos</a>
            <a href="#uso-aceptable" style={{ color: "#3D5D91", textDecoration: "none" }}>4. Uso aceptable y propiedad intelectual</a>
            <a href="#responsabilidad" style={{ color: "#3D5D91", textDecoration: "none" }}>5. Garantías y responsabilidad</a>
            <a href="#privacidad" style={{ color: "#3D5D91", textDecoration: "none" }}>6. Aviso de privacidad</a>
            <a href="#avisos" style={{ color: "#3D5D91", textDecoration: "none" }}>7. Avisos de la plataforma</a>
          </div>
        </nav>

        {/* ═════════ 1. TÉRMINOS ═════════ */}
        <Section id="terminos" title="1. Términos y condiciones del servicio">
          <H3>1.1 Quiénes somos y aceptación</H3>
          <p>
            FlightPath es una plataforma educativa en línea, operada desde México y disponible en{" "}
            <strong>flightpath.mx</strong>, para la preparación del examen teórico CIAAC y de procesos de
            selección de líneas aéreas. Puedes contactarnos en <strong>{CONTACT}</strong>. Al crear una
            cuenta, marcar la casilla de aceptación o usar la plataforma, celebras un contrato con
            FlightPath y aceptas estos Términos y el Aviso de privacidad. La versión que aceptas queda
            registrada con fecha, hora y versión del documento ({TERMS_VERSION}). Si no estás de acuerdo,
            no uses la plataforma.
          </p>
          <H3>1.2 El servicio</H3>
          <p>
            FlightPath ofrece contenido y herramientas de estudio: banco de preguntas con explicación,
            cuestionarios, simulacros cronometrados, biblioteca de materiales, flashcards, clases,
            módulos de convocatorias, seguimiento de progreso y asistentes con inteligencia artificial
            (Yaris y Pathy). Existen un plan gratuito con funciones limitadas y un plan de pago
            (FlightPath Pro) con acceso completo; el alcance y precio vigentes de cada plan son los
            publicados dentro de la plataforma al momento de contratar.
          </p>
          <H3>1.3 Tu cuenta</H3>
          <p>
            Debes proporcionar información veraz y mantenerla actualizada. Tu cuenta es personal e
            intransferible: eres responsable de mantener la confidencialidad de tu contraseña y de toda
            la actividad realizada desde tu cuenta. Debes ser mayor de 18 años o contar con el
            consentimiento de tu padre, madre o tutor. Podemos suspender cuentas que incumplan estos
            Términos, previo aviso cuando sea razonable.
          </p>
          <H3>1.4 Modificaciones</H3>
          <p>
            Podemos actualizar estos Términos. Si el cambio es sustancial, lo anunciaremos dentro de la
            plataforma con al menos 15 días de anticipación. La versión vigente y su fecha siempre están
            publicadas en esta página; seguir usando FlightPath después de la fecha de entrada en vigor
            implica aceptar la nueva versión.
          </p>
          <H3>1.5 Ley aplicable</H3>
          <p>
            Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
            controversia, las partes se someten a los tribunales competentes de la Ciudad de México,
            renunciando a cualquier otro fuero, sin perjuicio de los derechos irrenunciables que te
            correspondan como consumidor conforme a la Ley Federal de Protección al Consumidor.
          </p>
        </Section>

        {/* ═════════ 2. PAGOS ═════════ */}
        <Section id="pagos" title="2. Suscripción, pagos y renovación automática">
          <p>
            El plan FlightPath Pro se contrata como <strong>suscripción con renovación automática</strong>.
            Los precios vigentes (incluida cualquier cuota inicial de acceso, cuando aplique) se muestran
            claramente antes de pagar y se cobran en pesos mexicanos, salvo indicación en contrario.
          </p>
          <H3>2.1 Renovación automática</H3>
          <p>
            Al suscribirte autorizas que tu método de pago se cargue de forma recurrente al inicio de
            cada periodo (mensual) <strong>hasta que canceles</strong>. La fecha de renovación y el
            estado de tu suscripción son visibles en todo momento en{" "}
            <em>Dashboard → Planes → Gestionar suscripción</em>.
          </p>
          <H3>2.2 Procesamiento de pagos</H3>
          <p>
            Los pagos son procesados por <strong>Stripe</strong>; FlightPath no almacena los datos
            completos de tu tarjeta. Si un cobro recurrente falla, Stripe podrá reintentarlo; si no se
            logra el cobro, el acceso Pro se suspende al terminar el periodo pagado.
          </p>
          <H3>2.3 Cambios de precio</H3>
          <p>
            Podemos cambiar los precios hacia futuro. Cualquier cambio que afecte tu suscripción activa
            se te notificará con al menos 15 días de anticipación a tu siguiente renovación, para que
            puedas cancelar antes si no estás de acuerdo.
          </p>
        </Section>

        {/* ═════════ 3. CANCELACIÓN ═════════ */}
        <Section id="cancelacion" title="3. Cancelación y política de reembolsos">
          <H3>3.1 Cancelar</H3>
          <p>
            Puedes cancelar tu suscripción en cualquier momento y sin penalización desde{" "}
            <em>Dashboard → Planes → Gestionar suscripción</em> (portal de facturación de Stripe) o
            escribiendo a {CONTACT}. La cancelación surte efecto <strong>al final del periodo ya
            pagado</strong>: conservas el acceso Pro hasta esa fecha y no se generan cargos posteriores.
          </p>
          <H3>3.2 Reembolsos</H3>
          <p>
            Salvo lo exigido por la ley aplicable, <strong>no se otorgan reembolsos proporcionales por
            periodos parciales no utilizados</strong>. Sí reembolsamos: (a) cargos duplicados o erróneos,
            y (b) cobros realizados después de una cancelación efectiva, notificados dentro de los 30
            días naturales siguientes al cargo.
          </p>
          <H3>3.3 Cargos no reconocidos</H3>
          <p>
            Si ves un cargo que no reconoces, escríbenos primero a {CONTACT}: la mayoría de los casos se
            resuelven en menos de 48 horas hábiles, más rápido que una controversia bancaria. FlightPath
            conserva registros de contratación, aceptación de términos, accesos y uso del servicio, y los
            presentará como evidencia ante disputas o contracargos improcedentes.
          </p>
        </Section>

        {/* ═════════ 4. USO ACEPTABLE / PI ═════════ */}
        <Section id="uso-aceptable" title="4. Uso aceptable y propiedad intelectual">
          <H3>4.1 Uso aceptable</H3>
          <p>
            Te comprometes a no: (a) compartir, prestar o revender tu cuenta o el acceso al contenido;
            (b) copiar, extraer de forma masiva (scraping), publicar o redistribuir el banco de
            preguntas, explicaciones, flashcards o materiales de pago; (c) intentar vulnerar la
            seguridad, hacer ingeniería inversa o interferir con el funcionamiento de la plataforma;
            (d) usar la plataforma para fines ilícitos o fraudulentos. El incumplimiento puede derivar en
            la suspensión o cancelación de la cuenta sin reembolso, además de las acciones legales que
            correspondan.
          </p>
          <H3>4.2 Propiedad intelectual</H3>
          <p>
            La plataforma, su marca, diseño, software, banco de reactivos, explicaciones y contenidos
            propios son propiedad de FlightPath o de sus licenciantes. Al contratar recibes una licencia
            personal, limitada, no exclusiva e intransferible para usar el contenido con fines de estudio
            propio mientras tu acceso esté vigente. Los materiales de terceros disponibles en la
            Biblioteca conservan los derechos de sus titulares y se ofrecen como referencia educativa;
            la descarga y la impresión dependen de los permisos definidos para cada material.
          </p>
        </Section>

        {/* ═════════ 5. RESPONSABILIDAD ═════════ */}
        <Section id="responsabilidad" title="5. Garantías, disponibilidad y responsabilidad">
          <H3>5.1 Plataforma educativa independiente</H3>
          <p>
            FlightPath es independiente: no es fuente oficial del CIAAC, no representa a la autoridad
            aeronáutica (AFAC) y <strong>no está afiliada a ASPA de México ni a Aeroméxico</strong>. En
            los módulos de convocatorias, el material de referencia es siempre el temario y la guía
            oficiales proporcionados por la empresa convocante. El uso de la plataforma{" "}
            <strong>no garantiza la aprobación</strong> de ningún examen o proceso de selección.
          </p>
          <H3>5.2 Disponibilidad</H3>
          <p>
            El servicio se presta "tal cual" y "según disponibilidad". Trabajamos por mantenerlo
            disponible de forma continua, pero puede haber interrupciones por mantenimiento, fallas de
            terceros (hosting, pagos, IA) o causas de fuerza mayor.
          </p>
          <H3>5.3 Limitación de responsabilidad</H3>
          <p>
            En la máxima medida permitida por la ley, la responsabilidad total de FlightPath frente a ti
            por cualquier reclamación derivada del servicio se limita al monto que pagaste a FlightPath
            en los 3 meses anteriores al hecho que la origine. FlightPath no responde por daños
            indirectos, lucro cesante ni pérdida de oportunidades (por ejemplo, el resultado de un examen
            o proceso de selección).
          </p>
        </Section>

        {/* ═════════ 6. PRIVACIDAD ═════════ */}
        <Section id="privacidad" title="6. Aviso de privacidad">
          <p>
            FlightPath (contacto: {CONTACT}) es responsable del tratamiento de tus datos personales
            conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </p>
          <H3>6.1 Datos que recabamos</H3>
          <p>
            (a) De cuenta y perfil: nombre, correo, contraseña (cifrada), WhatsApp, escuela de aviación y
            fecha estimada del examen. (b) De uso académico: progreso, resultados de cuestionarios y
            simuladores, flashcards, clases vistas, preferencias, recordatorios y entradas de tu
            bitácora. (c) Técnicos y de seguridad: dirección IP, navegador y dispositivo, idioma, zona
            horaria y registros de acceso y actividad. (d) De pago: los gestiona Stripe; FlightPath solo
            recibe el estado de la suscripción y los últimos dígitos de la tarjeta cuando Stripe los
            comparte.
          </p>
          <H3>6.2 Finalidades</H3>
          <p>
            Primarias: crear y administrar tu cuenta, prestar el servicio educativo, guardar tu progreso,
            procesar pagos y renovaciones, enviar recordatorios que actives, dar soporte, y mantener la{" "}
            <strong>seguridad de la plataforma y la prevención de fraude</strong> (incluida la
            conservación de registros de contratación, aceptación de términos, accesos y uso como
            evidencia ante aclaraciones, disputas o contracargos). Secundarias (opcionales): enviarte
            novedades y promociones si diste tu consentimiento; puedes retirarlo cuando quieras.
          </p>
          <H3>6.3 Encargados y transferencias</H3>
          <p>
            Para operar usamos proveedores que tratan datos por cuenta de FlightPath: Stripe
            (procesamiento de pagos), Lovable/Supabase (infraestructura y base de datos), OpenAI
            (procesamiento de las conversaciones con la tutora IA) y WhatsApp/Meta (entrega de
            recordatorios, si los activas). No vendemos tus datos ni los compartimos con terceros ajenos
            a la operación; solo los revelaríamos por obligación legal o para la defensa de derechos de
            FlightPath (por ejemplo, evidencia ante una disputa de pago).
          </p>
          <H3>6.4 Tus derechos (ARCO)</H3>
          <p>
            Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición, así como
            revocar tu consentimiento o limitar el uso de tus datos, escribiendo a {CONTACT} desde el
            correo registrado en tu cuenta. Responderemos en un máximo de 20 días hábiles. También puedes
            editar tu perfil y preferencias directamente en Configuración.
          </p>
          <H3>6.5 Conservación y cookies</H3>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta (ver sección
            7), se borra la información asociada, salvo los registros que debamos conservar por
            obligación legal, facturación o defensa ante reclamaciones, por el plazo estrictamente
            necesario. Usamos cookies e identificadores de sesión para mantener tu sesión activa,
            recordar preferencias y medir el uso de la plataforma.
          </p>
        </Section>

        {/* ═════════ 7. AVISOS ═════════ */}
        <Section id="avisos" title="7. Avisos de la plataforma">
          <H3>7.1 Inteligencia artificial (Yaris y Pathy)</H3>
          <p>
            Yaris (tutora académica) y Pathy (asistente de progreso y organización) son herramientas de
            apoyo educativo. Sus respuestas pueden contener errores: verifica siempre contra el material
            oficial. No garantizan la aprobación del examen, no modifican calificaciones, respuestas
            correctas, resultados, contenido oficial, accesos ni pagos. Yaris no está disponible durante
            un intento activo del Simulador CIAAC. Ninguna de las dos diagnostica, trata ni interpreta
            emocionalmente al estudiante como profesional de salud mental.
          </p>
          <H3>7.2 Mi Bitácora no es una herramienta clínica</H3>
          <p>
            Mi Bitácora puede contener información sobre motivación, concentración, confianza y notas
            personales. Es una herramienta de autoconocimiento académico y seguimiento del estudio; no es
            una herramienta médica, psicológica, terapéutica ni clínica.
          </p>
          <H3>7.3 Recordatorios por WhatsApp</H3>
          <p>
            FlightPath usa WhatsApp solo para recordatorios relacionados con tu estudio, progreso, racha,
            repaso o preparación CIAAC. Puedes activarlos, pausarlos, desactivarlos o cambiar tu número
            en cualquier momento desde Recordatorios o Configuración.
          </p>
          <H3>7.4 Eliminación de cuenta</H3>
          <p>
            Puedes solicitar la eliminación de tu cuenta desde Configuración. Tu cuenta quedará
            desactivada y tendrás 30 días para recuperarla iniciando sesión de nuevo. Después de ese
            periodo, tu cuenta y la información asociada se eliminarán definitivamente, lo que puede
            implicar la pérdida de progreso, historial, bitácora, estadísticas, plan activo y acceso a
            materiales. Eliminar la cuenta no cancela por sí solo una suscripción activa: cancélala
            primero desde Planes.
          </p>
          <H3>7.5 Reportes y feedback</H3>
          <p>
            Enviar un reporte no modifica automáticamente preguntas, calificaciones, materiales ni
            resultados: genera un caso que el equipo de FlightPath revisa y al que da seguimiento.
          </p>
          <H3>7.6 Protección administrativa</H3>
          <p>
            El Panel Admin es de uso exclusivo del equipo administrador. Ningún estudiante puede ver
            información de otros estudiantes, y las notas internas del equipo no son visibles para los
            estudiantes.
          </p>
        </Section>

        <p style={{ color: "#8CA0BF", fontSize: 12.5, marginTop: 40 }}>
          © 2026 FlightPath · Versión {TERMS_VERSION} · Si tienes dudas sobre estos términos o avisos,
          escríbenos a {CONTACT} o desde Configuración → Soporte y ayuda.
        </p>
      </main>
    </div>
  );
}
