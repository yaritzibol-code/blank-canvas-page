import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { studentStats, useSessionUser, useStore } from "@/lib/store";
import { ASSETS } from "./destinations";

const BRIEFINGS: Record<
  string,
  { title: string; eyebrow: string; description: string; image?: string }
> = {
  rutas: {
    title: "Learning Paths",
    eyebrow: "TU PLAN DE VUELO",
    description:
      "Un camino claro, una lección a la vez. Entiende el porqué y conecta cada concepto con la cabina.",
    image: "foto-ruta-aprendizaje.jpg",
  },
  flashcards: {
    title: "Flashcards",
    eyebrow: "MEMORIA DE VUELO",
    description:
      "Lo que recuerdas hoy, lo dominas mañana. Repasa los conceptos clave de cada materia.",
    image: "foto-flashcards.jpg",
  },
  clases: {
    title: "Clases grabadas",
    eyebrow: "BRIEFING · APRENDIZAJE",
    description:
      "La explicación que necesitas, a tu ritmo. Elige una clase y vuelve a ella cuando quieras.",
    image: "foto-clase-grabada.jpg",
  },
  estudiemos: {
    title: "Estudiemos Juntos",
    eyebrow: "TU ESCUADRÓN DE ESTUDIO",
    description: "Ponle rumbo a tu sesión. Pathy organiza tu tiempo y te acompaña paso a paso.",
    image: "foto-estudiante-cartas.jpg",
  },
  "linea-aerea": {
    title: "Línea Aérea",
    eyebrow: "TU SIGUIENTE ASIENTO",
    description:
      "Los manuales del curso y la guía oficial, en un solo lugar. Refuerza cada fuente antes de tu siguiente vuelo.",
    image: "foto-piloto-cabina.jpg",
  },
  prueba: {
    title: "Ponme a Prueba",
    eyebrow: "DEMUESTRA LO APRENDIDO",
    description:
      "Entender es poder explicarlo. Pon a prueba tus conocimientos y encuentra lo que todavía puedes mejorar.",
    image: "foto-simulador-laptop.jpg",
  },
  rtari: {
    title: "RTARI",
    eyebrow: "CONTACTO · INGLÉS AERONÁUTICO",
    description:
      "Tu voz, tu criterio y tu próximo nivel. Practica una entrevista de inglés aeronáutico con Yaris.",
    image: "foto-piloto-cabina.jpg",
  },
  compass: {
    title: "COMPASS",
    eyebrow: "APTITUDES DE VUELO",
    description:
      "Precisión bajo presión. Entrena tu coordinación, memoria, orientación y capacidad de decisión.",
    image: "foto-aptitudes.jpg",
  },
  biblioteca: {
    title: "Biblioteca",
    eyebrow: "TU HANGAR DE CONOCIMIENTO",
    description:
      "Manuales y material de consulta para respaldar cada respuesta. Encuentra tu próxima lectura.",
    image: "foto-biblioteca.jpg",
  },
  comunidad: {
    title: "Ranking",
    eyebrow: "COMUNIDAD · FLIGHTPATH",
    description:
      "La constancia te lleva más alto. Cada punto refleja el trabajo que haces para seguir aprendiendo.",
  },
  perfil: {
    title: "Mi perfil",
    eyebrow: "IDENTIDAD DE VUELO",
    description: "Tu formación, tus metas y el camino que estás construyendo.",
  },
  facturacion: {
    title: "Facturación",
    eyebrow: "TU PASE DE ABORDAJE",
    description: "Consulta tu plan, tus pagos y las opciones para seguir volando.",
  },
  analisis: {
    title: "Análisis",
    eyebrow: "TELEMETRÍA DE ESTUDIO",
    description: "Mira tu progreso, reconoce tus fortalezas y prepara tu próximo paso.",
  },
  bitacora: {
    title: "Mi Bitácora",
    eyebrow: "CADA SESIÓN CUENTA",
    description: "Tu registro de vuelo. Lo que aprendes, lo que sientes y lo que quieres mejorar.",
  },
  configuracion: {
    title: "Configuración",
    eyebrow: "AJUSTA TU CABINA",
    description:
      "Haz de FlightPath tu espacio. Personaliza la experiencia para estudiar a tu manera.",
  },
  recordatorios: {
    title: "Recordatorios",
    eyebrow: "TU PRÓXIMO VUELO",
    description: "Reserva un momento para aprender. Organiza tus recordatorios de estudio.",
  },
  planes: {
    title: "Tu plan de vuelo",
    eyebrow: "SIGUE AVANZANDO",
    description: "Elige el acceso que acompaña tu preparación.",
  },
};
export function ModuleBriefing({ screen }: { screen: string }) {
  const user = useSessionUser(),
    stats = useStore(() => (user ? studentStats(user.id) : null));
  const briefing = BRIEFINGS[screen];
  if (!briefing) return null;
  return (
    <aside className="fd-workspace-intro">
      <p className="fd-eyebrow">{briefing.eyebrow}</p>
      <h1>{briefing.title}</h1>
      <p className="fd-brief-description">{briefing.description}</p>
      {briefing.image && <img className="fd-brief-photo" src={ASSETS + briefing.image} alt="" />}
      <div className="fd-panel fd-brief-progress">
        <p className="fd-eyebrow">TU PROGRESO</p>
        <div>
          <strong>{stats?.answered ?? 0}</strong>
          <span>preguntas respondidas</span>
        </div>
        <div>
          <strong>{stats?.streak ?? 0}</strong>
          <span>días de racha</span>
        </div>
        <Link to="/dashboard/analisis">
          Ver mi análisis <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="fd-brief-pathy">
        <img src={ASSETS + "pathy.png"} alt="Pathy" />
        <p>Lo que haces hoy te acerca a tu próximo despegue.</p>
      </div>
    </aside>
  );
}
export function hasBriefing(screen: string) {
  return !!BRIEFINGS[screen];
}
