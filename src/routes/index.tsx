import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Star,
  Menu,
  X,
  ChevronRight,
  Zap,
  Trophy,
  Users,
  Play,
  ArrowRight,
  Sparkles,
  Target,
  Gift,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const SUBJECTS = [
  { id: 1, icon: "✈️", name: "Aerodinámica", questions: 30 },
  { id: 2, icon: "⚙️", name: "Aeronaves y Motores", questions: 30 },
  { id: 3, icon: "⚖️", name: "Legislación Aeronáutica", questions: 30 },
  { id: 4, icon: "🏥", name: "Medicina de Aviación", questions: 20 },
  { id: 5, icon: "🌤️", name: "Meteorología", questions: 30 },
  { id: 6, icon: "🗺️", name: "Navegación Aérea", questions: 30 },
  { id: 7, icon: "🗼", name: "Servicios de Tránsito Aéreo", questions: 30 },
  { id: 8, icon: "📻", name: "Comunicaciones Aeronáuticas", questions: 20 },
  { id: 9, icon: "📋", name: "Manuales de Información", questions: 20 },
  { id: 10, icon: "🧠", name: "Factores Humanos", questions: 20 },
  { id: 11, icon: "🛡️", name: "Seguridad Aérea", questions: 20 },
  { id: 12, icon: "🛫", name: "Operaciones Aeronáuticas", questions: 30 },
];

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Tutor IA Yaris",
    description:
      'Explica cada concepto con ejemplos de películas, vida cotidiana y nemotecnias. Siempre disponible con el botón "Explícamelo Yaris".',
    tone: "cherry",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Simulador CIAAC Real",
    description:
      "310 preguntas, 5 horas, mismo formato del examen real. Con calculadora, panel de materias y revisión completa al terminar.",
    tone: "navy",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Banco de Preguntas",
    description:
      "Practica por materia, cantidad personalizada y recibe feedback inmediato con la explicación y cita del libro en cada respuesta.",
    tone: "silver",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Flashcards Interactivas",
    description:
      "Desliza derecha si ya la sabes, izquierda para repasar. Pathy analiza tu progreso y celebra cada avance.",
    tone: "misty",
  },
  {
    icon: <Play className="w-6 h-6" />,
    title: "Clases Grabadas",
    description:
      "Aprende a tu ritmo con clases organizadas por materia y tema. Controla velocidad, retoma donde lo dejaste.",
    tone: "navy",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análisis Personalizado",
    description:
      "Mapa de calor de tus últimos 35 días, promedio por materia y racha de estudio. Pathy te motiva cada día.",
    tone: "cherry",
  },
];

const PATHY_STATES = [
  { days: "1–3 días", emoji: "🌸", label: "Pathy Misty Rose", color: "#F2DCDB" },
  { days: "4–6 días", emoji: "🌺", label: "Pathy Cherry", color: "#F2AEBC" },
  { days: "7–13 días", emoji: "💙", label: "Pathy Silver Lake", color: "#5A86CB" },
  { days: "14–30 días", emoji: "☁️", label: "Pathy Lapis", color: "#3D5D91" },
  { days: "30+ días", emoji: "🍷", label: "Pathy Burgundy", color: "#6C0820" },
];

const STEPS = [
  {
    number: "01",
    title: "Elige tu materia",
    description:
      "Accede a las 12 materias del CIAAC con bloques de temas ordenados, actividades interactivas y flashcards.",
  },
  {
    number: "02",
    title: "Practica con Yaris",
    description:
      "El tutor IA explica, hace preguntas, genera mapas mentales y te da nemotecnias para que nunca olvides.",
  },
  {
    number: "03",
    title: "Simula el examen",
    description:
      "Haz el simulador completo de 310 preguntas con tiempo real. Revisa cada error y llega el día del examen con confianza.",
  },
];

const TESTIMONIALS = [
  {
    name: "Andrea G.",
    school: "CENCA",
    text: "Aprobé a la primera con 91%. Antes tenía pánico al examen, pero el simulador me dio la confianza que necesitaba.",
    rating: 5,
  },
  {
    name: "Diego R.",
    school: "UAEM Aviación",
    text: "Yaris es increíble. Me explica Meteorología con ejemplos de fútbol y series. Por fin entendí frentes y masas de aire.",
    rating: 5,
  },
  {
    name: "Sofía M.",
    school: "ENAH",
    text: "La racha de Pathy me mantuvo estudiando 40 días seguidos. Nunca había sido tan constante en mi vida.",
    rating: 5,
  },
];

const BONUSES = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Guía Last Minute",
    description: "Los puntos más importantes de las 12 materias para repasar 2 semanas antes de tu examen.",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Tips para el día del examen",
    description: "Qué comer, cómo llegar, qué llevar y cómo manejar el estrés el día del CIAAC.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Comunidad FlightPath en WhatsApp",
    description: "Estudia con otros estudiantes, resuelve dudas y mantente motivado.",
  },
];

/* ────────────────────────────────────────────────────────── */
/* Animated sky backdrop with parallax planes and clouds      */
/* ────────────────────────────────────────────────────────── */
function FlightSky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", `${x * 12}px`);
      el.style.setProperty("--my", `${y * 8}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* aero grid */}
      <div className="absolute inset-0 fp-aero-grid" />

      {/* cloud blobs */}
      <div
        className="absolute fp-cloud-soft fp-animate-cloud"
        style={{ top: "8%", left: "6%", width: 280, height: 100, transform: "translate(var(--mx,0), var(--my,0))" }}
      />
      <div
        className="absolute fp-cloud-base fp-animate-cloud-rev"
        style={{ top: "20%", right: "8%", width: 360, height: 140 }}
      />
      <div
        className="absolute fp-cloud-soft fp-animate-cloud"
        style={{ bottom: "12%", left: "20%", width: 220, height: 80 }}
      />
      <div
        className="absolute fp-cloud-soft fp-animate-cloud-rev"
        style={{ bottom: "22%", right: "18%", width: 180, height: 70 }}
      />

      {/* flying planes (parallax) */}
      <div className="absolute top-[18%] left-0 right-0 fp-px-layer" style={{ transform: "translate(var(--mx,0), var(--my,0))" }}>
        <div className="fp-animate-fly inline-flex items-center gap-2 text-[#3D5D91]/70">
          <Plane className="w-7 h-7 -rotate-12 fill-current" />
        </div>
      </div>
      <div className="absolute top-[45%] left-0 right-0">
        <div className="fp-animate-fly-back inline-flex items-center gap-2 text-[#6C0820]/55">
          <Plane className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* twinkles */}
      {[
        { t: "10%", l: "15%" },
        { t: "30%", l: "78%" },
        { t: "60%", l: "30%" },
        { t: "75%", l: "82%" },
        { t: "85%", l: "12%" },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#3D5D91] fp-animate-twinkle"
          style={{ top: p.t, left: p.l, animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 fp-glass transition-all ${
        scrolled ? "border-b border-[#3D5D91]/10 shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-[#3D5D91] flex items-center justify-center fp-shadow-navy">
            <Plane className="w-4 h-4 text-[#F2AEBC] -rotate-45 fill-current" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[#F2AEBC] fp-animate-pulse-dot" />
          </div>
          <div className="leading-tight">
            <span className="font-display text-[#22375C] text-lg block">FlightPath</span>
            <span className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-[#647DA0]">
              CIAAC · MX
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4C648A]">
          <a href="#funciones" className="hover:text-[#3D5D91] transition-colors">Funciones</a>
          <a href="#materias" className="hover:text-[#3D5D91] transition-colors">Materias</a>
          <a href="#pathy" className="hover:text-[#3D5D91] transition-colors">Pathy</a>
          <a href="#precios" className="hover:text-[#3D5D91] transition-colors">Precios</a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-[#3D5D91] hover:bg-[#F2DCDB]/60 rounded-xl font-medium">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button className="fp-btn-coral rounded-xl px-5 font-semibold shadow-sm">
              Empieza gratis
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-[#3D5D91]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fp-glass border-t border-[#3D5D91]/10 px-4 py-4 flex flex-col gap-2">
          {[
            ["#funciones", "Funciones"],
            ["#materias", "Materias"],
            ["#pathy", "Pathy"],
            ["#precios", "Precios"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="py-2 text-[#4C648A] font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-[#3D5D91]/10">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-[#3D5D91]/30 text-[#3D5D91] rounded-xl">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full fp-btn-coral rounded-xl">Empieza gratis</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function ToneIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    cherry: "bg-[#F2AEBC] text-[#6C0820]",
    navy: "bg-[#3D5D91] text-white",
    silver: "bg-[#5A86CB] text-white",
    misty: "bg-[#F2DCDB] text-[#3D5D91]",
  };
  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles[tone] || styles.cherry} fp-shadow-card`}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen fp-sky-base font-sans-fp text-[#3D5D91]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 fp-cloudscape overflow-hidden">
        <FlightSky />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#3D5D91]/15 fp-shadow-card mb-5">
                <span className="w-2 h-2 rounded-full bg-[#6C0820] fp-animate-pulse-dot" />
                <span className="font-mono-fp text-[11px] uppercase tracking-[0.18em] text-[#3D5D91]">
                  Plataforma #1 CIAAC · México
                </span>
              </div>

              <h1 className="font-display text-[#22375C] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
                El sistema de estudio que <span className="text-[#6C0820]">se adapta a ti.</span>
              </h1>
              <p className="text-lg text-[#647DA0] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                FlightPath combina IA, simulador real y gamificación para que estudiantes de
                aviación mexicanos aprueben el CIAAC a la primera —{" "}
                <span className="font-semibold text-[#3D5D91]">sin perder tiempo ni dinero</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="fp-btn-coral rounded-2xl px-8 py-6 text-base font-semibold fp-shadow-coral w-full sm:w-auto"
                  >
                    Empieza gratis ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#funciones">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#3D5D91]/30 text-[#3D5D91] hover:bg-white rounded-2xl px-8 py-6 text-base font-semibold w-full sm:w-auto backdrop-blur"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ver funciones
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-[#647DA0]">
                {["Sin tarjeta de crédito", "Acceso inmediato", "Garantía de mejora"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3D5D91]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual — Navy dashboard preview */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md fp-animate-float-y">
                <div className="fp-card-navy rounded-3xl p-6 fp-shadow-float">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xl fp-animate-float-y-sm">
                      ☁️
                    </div>
                    <div>
                      <p className="text-[#F2AEBC] text-xs font-medium">¡Hola, Mariana!</p>
                      <p className="text-white font-bold text-sm">🔥 Racha de 14 días</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 text-[10px] font-mono-fp uppercase tracking-wider">
                        Pathy Lapis
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Preguntas hoy", value: "42", icon: "🎯" },
                      { label: "Promedio", value: "84%", icon: "📊" },
                      { label: "Simuladores", value: "5", icon: "✈️" },
                      { label: "Horas totales", value: "31h", icon: "⏱️" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                      >
                        <p className="text-xl">{stat.icon}</p>
                        <p className="font-display text-white text-2xl leading-tight">{stat.value}</p>
                        <p className="text-[#F2DCDB] text-[11px]">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <p className="text-[#F2AEBC] text-[11px] font-mono-fp uppercase tracking-wider mb-2">
                      Continúa donde lo dejaste
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌤️</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">Meteorología</p>
                        <p className="text-[#F2DCDB] text-xs">Bloque 3 — Nubes y Precipitación</p>
                        <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-[#F2AEBC] rounded-full w-[65%]" />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#F2AEBC]" />
                    </div>
                  </div>
                </div>

                {/* Floating badge — Yaris */}
                <div className="absolute -top-5 -right-5 bg-white rounded-2xl p-3 fp-shadow-lift border border-[#F2DCDB] max-w-[180px] fp-animate-float-y-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <span className="font-display text-[#22375C] text-sm">Yaris</span>
                  </div>
                  <p className="text-[#647DA0] text-xs leading-snug">
                    ¿Recuerdas el efecto Coriolis? Es como el desagüe del baño 🌀
                  </p>
                </div>

                {/* Floating badge — streak */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 fp-shadow-lift border border-[#F2DCDB]">
                  <p className="text-2xl text-center">🔥</p>
                  <p className="font-display text-[#22375C] text-base text-center">14 días</p>
                  <p className="font-mono-fp text-[#8DA1BE] text-[10px] uppercase tracking-wider text-center">
                    racha
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-12 border-y border-[#3D5D91]/10 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Estudiantes activos", icon: "👨‍✈️" },
              { value: "310", label: "Preguntas en simulador", icon: "📝" },
              { value: "12", label: "Materias cubiertas", icon: "📚" },
              { value: "80%", label: "Mínimo CIAAC", icon: "🏆" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl mb-1">{stat.icon}</p>
                <p className="font-display text-3xl text-[#22375C]">{stat.value}</p>
                <p className="text-sm text-[#647DA0]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape-cherry opacity-50" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#6C0820]/10 text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
            El problema real
          </Badge>
          <h2 className="font-display text-[#22375C] text-3xl sm:text-4xl mb-6">
            El CIAAC tiene una tasa de reprobación altísima
          </h2>
          <p className="text-lg text-[#647DA0] mb-10 leading-relaxed">
            Las escuelas de aviación dan material insuficiente. No existen plataformas
            especializadas en México. Y estudiar por cuenta propia sin estructura es casi imposible.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "📉", problem: "Material insuficiente de las escuelas" },
              { icon: "😰", problem: "Sin hábitos de estudio estructurados" },
              { icon: "🔍", problem: "Ninguna plataforma especializada en CIAAC" },
            ].map((item) => (
              <div
                key={item.problem}
                className="bg-white/85 backdrop-blur rounded-2xl p-6 border border-[#F2DCDB] fp-shadow-card fp-hover-lift"
              >
                <p className="text-4xl mb-3">{item.icon}</p>
                <p className="text-[#33527F] font-medium text-sm leading-snug">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="funciones" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              Todo en una plataforma
            </Badge>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              El sistema que se adapta a ti
            </h2>
            <p className="mt-4 text-[#647DA0] max-w-xl mx-auto">
              No tú a él. FlightPath combina tecnología, inteligencia artificial y gamificación
              para que estudiar se vuelva algo que esperas con ganas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-[#F2DCDB] bg-white/85 backdrop-blur rounded-3xl fp-shadow-card fp-hover-lift overflow-hidden gap-0 py-0"
              >
                <CardContent className="p-7">
                  <ToneIcon tone={f.tone}>{f.icon}</ToneIcon>
                  <h3 className="font-display text-[#22375C] text-xl mt-5 mb-2">{f.title}</h3>
                  <p className="text-[#647DA0] text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden fp-card-navy">
        <div className="absolute inset-0 fp-aero-grid opacity-40" />
        <div className="absolute top-10 left-10 fp-cloud-base" style={{ width: 320, height: 120 }} />
        <div className="absolute bottom-10 right-10 fp-cloud-base" style={{ width: 280, height: 100 }} />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              Simple y efectivo
            </Badge>
            <h2 className="font-display text-white text-3xl sm:text-5xl">Así funciona FlightPath</h2>
            <p className="mt-4 text-[#D7E1EE] max-w-xl mx-auto">
              Tres pasos. Una sola dirección: el día de tu examen, listo y con confianza real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 text-center fp-hover-lift"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#F2AEBC] rounded-2xl flex items-center justify-center fp-shadow-coral">
                  <span className="font-display text-[#6C0820] text-xl">{step.number}</span>
                </div>
                <div className="pt-7">
                  <h3 className="font-display text-white text-xl mb-2">{step.title}</h3>
                  <p className="text-[#D7E1EE] text-sm leading-relaxed">{step.description}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px border-t border-dashed border-[#F2AEBC]/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12 MATERIAS ─── */}
      <section id="materias" className="py-24 px-4 sm:px-6 bg-[#FBFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              Cobertura total
            </Badge>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Las 12 materias del CIAAC
            </h2>
            <p className="mt-4 text-[#647DA0]">
              310 preguntas distribuidas en 12 materias, exactamente como el examen real.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.id}
                className="group bg-white border border-[#E8EEF6] hover:border-[#F2AEBC] rounded-2xl p-5 flex flex-col items-center text-center gap-2.5 fp-shadow-card fp-hover-lift transition-colors"
              >
                <span className="text-3xl">{subject.icon}</span>
                <p className="text-[#22375C] font-display text-sm leading-tight min-h-[2.5rem]">
                  {subject.name}
                </p>
                <span className="font-mono-fp text-[10px] uppercase tracking-wider bg-[#F4F7FB] text-[#3D5D91] px-2 py-0.5 rounded-full">
                  {subject.questions} preguntas
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#647DA0]">
              <span className="font-display text-[#22375C]">310 preguntas en total</span> ·{" "}
              Calificación mínima: <span className="font-bold text-[#6C0820]">80%</span> ·{" "}
              Tiempo límite: <span className="font-bold text-[#3D5D91]">5 horas</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── PATHY ─── */}
      <section id="pathy" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape-cherry opacity-60" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
            Tu compañera de estudio
          </Badge>
          <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl mb-4">
            Pathy te acompaña en cada racha
          </h2>
          <p className="text-[#647DA0] mb-12 max-w-xl mx-auto">
            Pathy es una nube con gorra de piloto que evoluciona según tus días consecutivos
            estudiando. Entre más constante seas, más especial se vuelve.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {PATHY_STATES.map((state, i) => (
              <div
                key={state.label}
                className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur rounded-2xl p-5 border border-[#F2DCDB] fp-shadow-card fp-hover-lift min-w-[120px]"
                style={{ animation: `fp-floatYsm 4s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
              >
                <span className="text-4xl">{state.emoji}</span>
                <p className="font-display text-xs" style={{ color: state.color }}>
                  {state.label}
                </p>
                <p className="font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">
                  {state.days}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-[#647DA0]">
            <span className="flex items-center gap-2">
              <span className="text-lg">😶‍🌫️</span> Racha perdida → Pathy gris
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">🌑</span> 3+ días sin estudiar → Pathy negra
            </span>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              Lo que dicen los estudiantes
            </Badge>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">Historias reales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.name}
                className="border-[#F2DCDB] rounded-3xl fp-shadow-card fp-hover-lift gap-0 py-0"
              >
                <CardContent className="p-7">
                  <div className="flex mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F2AEBC] text-[#F2AEBC]" />
                    ))}
                  </div>
                  <p className="text-[#33527F] text-[15px] leading-relaxed mb-5 font-sans-fp">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3D5D91] rounded-full flex items-center justify-center text-white font-display">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-display text-sm text-[#22375C]">{t.name}</p>
                      <p className="font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">
                        {t.school}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="precios" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape" />
        <div className="absolute inset-0 fp-aero-grid opacity-50" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#6C0820]/10 text-[#6C0820] border-0 font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              ⏰ Precio de lanzamiento — solo 3 días
            </Badge>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Invierte en tu carrera de piloto
            </h2>
            <p className="mt-4 text-[#647DA0]">
              Un examen reprobado te cuesta tiempo, dinero y confianza. FlightPath te evita todo eso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#E8EEF6] rounded-3xl bg-white fp-shadow-card gap-0 py-0">
              <CardContent className="p-8">
                <p className="font-mono-fp text-[10px] text-[#8DA1BE] uppercase tracking-[0.2em] mb-3">
                  Plan Mensual
                </p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-5xl text-[#22375C]">$1,500</span>
                  <span className="text-[#8DA1BE] text-sm mb-1">MXN/mes</span>
                </div>
                <p className="text-[#8DA1BE] text-xs mb-7">Cancela cuando quieras</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Acceso a las 12 materias",
                    "Banco de preguntas ilimitado",
                    "Simulador CIAAC completo",
                    "Tutor IA Yaris",
                    "Flashcards interactivas",
                    "Análisis de progreso",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#33527F]">
                      <CheckCircle2 className="w-4 h-4 text-[#3D5D91] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    variant="outline"
                    className="w-full border-[#3D5D91]/30 text-[#3D5D91] hover:bg-[#F2DCDB]/40 font-semibold rounded-xl py-5"
                  >
                    Comenzar mensual
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative rounded-3xl fp-card-navy fp-shadow-float overflow-hidden gap-0 py-0 border-0">
              <div className="absolute top-0 left-0 w-full h-full opacity-30 fp-aero-grid pointer-events-none" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 px-4 py-1 text-[10px] font-mono-fp uppercase tracking-[0.2em] font-bold shadow-sm">
                  ⚡ Precio de lanzamiento
                </Badge>
              </div>
              <CardContent className="relative p-8">
                <p className="font-mono-fp text-[10px] text-[#F2AEBC] uppercase tracking-[0.2em] mb-3">
                  Plan Anual
                </p>
                <div className="flex items-end gap-3 mb-1">
                  <span className="font-display text-5xl text-white">$10,000</span>
                  <span className="text-[#D7E1EE] text-sm mb-1">MXN</span>
                </div>
                <div className="flex items-center gap-2 mb-7">
                  <span className="text-[#D7E1EE]/70 text-sm line-through">$15,000 MXN</span>
                  <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 text-[10px] font-mono-fp uppercase">
                    Ahorras $5,000
                  </Badge>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Todo del plan mensual",
                    "Acceso 12 meses completos",
                    "Clases grabadas por materia",
                    "Biblioteca de materiales CIAAC",
                    "Recordatorios por WhatsApp",
                    "Sesiones de estudio guiadas",
                    "Bitácora de vuelo emocional",
                    "Bonos de lanzamiento incluidos ✨",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#FAF8F4]">
                      <CheckCircle2 className="w-4 h-4 text-[#F2AEBC] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full fp-btn-coral font-bold py-5 rounded-xl fp-shadow-coral">
                    Obtener acceso anual
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-xs text-[#D7E1EE]/80 mt-3 font-mono-fp uppercase tracking-wider">
                  Solo por 3 días · Precio sube después
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── BONUSES ─── */}
      <section className="py-20 px-4 sm:px-6 fp-card-navy relative overflow-hidden">
        <div className="absolute inset-0 fp-aero-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Gift className="w-5 h-5 text-[#F2AEBC]" />
            <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 font-bold font-mono-fp text-[10px] uppercase tracking-[0.2em]">
              Bonos de lanzamiento
            </Badge>
          </div>
          <h2 className="font-display text-white text-3xl sm:text-4xl mb-12">
            Con el plan anual también recibes:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {BONUSES.map((bonus) => (
              <div
                key={bonus.title}
                className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-left fp-hover-lift"
              >
                <div className="w-10 h-10 bg-[#F2AEBC] rounded-xl flex items-center justify-center text-[#6C0820] mb-4">
                  {bonus.icon}
                </div>
                <h3 className="font-display text-white text-base mb-2">{bonus.title}</h3>
                <p className="text-[#D7E1EE] text-sm leading-relaxed">{bonus.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUARANTEE ─── */}
      <section className="py-24 px-4 sm:px-6 bg-[#FBFAF7]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-10 fp-shadow-card border border-[#F2DCDB] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#F2AEBC]/30 blur-3xl" />
            <div className="relative">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="font-display text-[#22375C] text-2xl sm:text-3xl mb-4">
                Garantía de mejora
              </h2>
              <p className="text-[#647DA0] text-base leading-relaxed mb-6">
                Si completas tu ruta de estudio y <strong className="text-[#22375C]">no sientes mejora</strong>,
                extendemos tu acceso y ajustamos tu plan personalizado.{" "}
                <strong className="text-[#22375C]">Sin costo adicional.</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-[#3D5D91] font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Acceso extendido
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Plan ajustado
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Cero riesgo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden fp-card-navy">
        <div className="absolute inset-0 fp-aero-grid opacity-40" />
        <div className="absolute top-1/3 -left-10 fp-cloud-base" style={{ width: 280, height: 100 }} />
        <div className="absolute bottom-1/4 -right-10 fp-cloud-base" style={{ width: 320, height: 110 }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <Plane className="w-12 h-12 text-[#F2AEBC] mx-auto mb-4 -rotate-12 fill-current fp-animate-float-y" />
          <h2 className="font-display text-white text-3xl sm:text-5xl mb-4">
            Aprende, Domina y Vuela
          </h2>
          <p className="text-[#D7E1EE] text-lg mb-8 max-w-xl mx-auto">
            Únete a cientos de estudiantes de aviación que ya estudian con FlightPath y llegan al
            examen con confianza real.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-[#F2AEBC] hover:bg-[#F2DCDB] text-[#6C0820] px-10 py-6 text-base font-bold rounded-2xl fp-shadow-coral"
            >
              Empezar ahora gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="mt-4 font-mono-fp text-[11px] text-[#D7E1EE] uppercase tracking-wider">
            Sin tarjeta · Acceso inmediato · Garantía de mejora
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-4 sm:px-6 bg-[#22375C] border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3D5D91] flex items-center justify-center">
              <Plane className="w-4 h-4 text-[#F2AEBC] -rotate-45 fill-current" />
            </div>
            <span className="font-display text-white text-lg">FlightPath</span>
          </div>
          <p className="font-mono-fp text-[#D7E1EE] text-xs uppercase tracking-wider text-center">
            Aprende, Domina y Vuela ✈️ · Por Yaritzi Bolaños
          </p>
          <div className="flex gap-5 text-[#D7E1EE] text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
