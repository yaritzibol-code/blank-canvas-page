import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Brain,
  BarChart3,
  BookOpen,
  Clock,
  Plane,
  CheckCircle2,
  Star,
  Menu,
  X,
  ChevronRight,
  Zap,
  Trophy,
  Users,
  MessageSquare,
  Shield,
  Play,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Gift,
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
    color: "bg-[#F2AEBC]",
    textColor: "text-[#6C0820]",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Simulador CIAAC Real",
    description:
      "310 preguntas, 5 horas, mismo formato del examen real. Con calculadora, panel de materias y revisión completa al terminar.",
    color: "bg-[#3D5D91]",
    textColor: "text-white",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Banco de Preguntas",
    description:
      "Practica por materia, cantidad personalizada y recibe feedback inmediato con la explicación y cita del libro en cada respuesta.",
    color: "bg-[#5A86CB]",
    textColor: "text-white",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Flashcards Interactivas",
    description:
      "Desliza derecha si ya la sabes, izquierda para repasar. Pathy analiza tu progreso y celebra cada avance.",
    color: "bg-[#F2DCDB]",
    textColor: "text-[#3D5D91]",
  },
  {
    icon: <Play className="w-6 h-6" />,
    title: "Clases Grabadas",
    description:
      "Aprende a tu ritmo con clases organizadas por materia y tema. Controla velocidad, retoma donde lo dejaste.",
    color: "bg-[#3D5D91]",
    textColor: "text-white",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análisis Personalizado",
    description:
      "Mapa de calor de tus últimos 35 días, promedio por materia y racha de estudio. Pathy te motiva cada día.",
    color: "bg-[#F2AEBC]",
    textColor: "text-[#6C0820]",
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

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#F2DCDB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#3D5D91] flex items-center justify-center">
            <span className="text-[#F2AEBC] font-bold text-lg leading-none">F</span>
          </div>
          <span className="font-bold text-[#3D5D91] text-lg">FlightPath</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#funciones" className="hover:text-[#3D5D91] transition-colors">
            Funciones
          </a>
          <a href="#materias" className="hover:text-[#3D5D91] transition-colors">
            Materias
          </a>
          <a href="#precios" className="hover:text-[#3D5D91] transition-colors">
            Precios
          </a>
          <Link to="/dashboard" className="hover:text-[#3D5D91] transition-colors">
            Dashboard
          </Link>
          <Link to="/simulador" className="hover:text-[#3D5D91] transition-colors">
            Simulador
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-[#3D5D91] hover:bg-[#F2DCDB]">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white">
              Empieza gratis
            </Button>
          </Link>
        </div>


        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#F2DCDB] px-4 py-4 flex flex-col gap-3">
          <a href="#funciones" className="py-2 text-slate-600 font-medium" onClick={() => setMobileOpen(false)}>
            Funciones
          </a>
          <a href="#materias" className="py-2 text-slate-600 font-medium" onClick={() => setMobileOpen(false)}>
            Materias
          </a>
          <a href="#precios" className="py-2 text-slate-600 font-medium" onClick={() => setMobileOpen(false)}>
            Precios
          </a>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#F2DCDB]">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-[#3D5D91] text-[#3D5D91]">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#3D5D91] hover:bg-[#5A86CB] text-white">
                Empieza gratis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-[#F2DCDB]/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0 hover:bg-[#F2AEBC] text-xs font-semibold uppercase tracking-wide">
                ✈️ Plataforma #1 para el CIAAC en México
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3D5D91] leading-tight mb-6">
                Aprende a tu ritmo,{" "}
                <span className="text-[#6C0820]">aprueba con confianza</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                El único sistema de estudio interactivo diseñado para que estudiantes de aviación
                mexicanos aprueben el examen CIAAC a la primera, sin perder tiempo ni dinero.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white px-8 py-6 text-base font-semibold shadow-lg shadow-[#3D5D91]/25 w-full sm:w-auto"
                  >
                    Empieza gratis ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#3D5D91] text-[#3D5D91] hover:bg-[#F2DCDB] px-8 py-6 text-base font-semibold w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Ver demo
                </Button>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D5D91]" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D5D91]" />
                  <span>Acceso inmediato</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D5D91]" />
                  <span>Garantía de mejora</span>
                </div>
              </div>
            </div>

            {/* Hero Visual — Pathy + Dashboard Preview */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-[#3D5D91] rounded-3xl p-6 shadow-2xl shadow-[#3D5D91]/30">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xl">
                      ☁️
                    </div>
                    <div>
                      <p className="text-[#F2AEBC] text-xs font-medium">¡Hola, Mariana!</p>
                      <p className="text-white font-bold text-sm">🔥 Racha de 14 días</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 text-xs">
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
                      <div key={stat.label} className="bg-white/10 rounded-xl p-3">
                        <p className="text-xl">{stat.icon}</p>
                        <p className="text-white font-bold text-lg leading-tight">{stat.value}</p>
                        <p className="text-[#F2DCDB] text-xs">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[#F2AEBC] text-xs font-medium mb-2">
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
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-[#F2DCDB] max-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <span className="text-[#3D5D91] font-bold text-xs">Yaris</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-snug">
                    ¿Recuerdas el efecto Coriolis? Es como el desagüe del baño 🌀
                  </p>
                </div>

                {/* Floating badge — streak */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-[#F2DCDB]">
                  <p className="text-2xl text-center">🔥</p>
                  <p className="text-[#3D5D91] font-bold text-sm text-center">14 días</p>
                  <p className="text-slate-400 text-xs text-center">de racha</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-10 border-y border-[#F2DCDB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Estudiantes activos", icon: "👨‍✈️" },
              { value: "310", label: "Preguntas en el simulador", icon: "📝" },
              { value: "12", label: "Materias cubiertas", icon: "📚" },
              { value: "80%", label: "Calificación mínima CIAAC", icon: "🏆" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-extrabold text-[#3D5D91]">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#F2DCDB]/20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#6C0820]/10 text-[#6C0820] border-0">El problema real</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91] mb-6">
            El CIAAC tiene una tasa de reprobación altísima
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            Las escuelas de aviación dan material insuficiente. No existen plataformas especializadas
            en México. Y estudiar por cuenta propia sin estructura es casi imposible.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "📉", problem: "Material insuficiente de las escuelas" },
              { icon: "😰", problem: "Sin hábitos de estudio estructurados" },
              { icon: "🔍", problem: "Ninguna plataforma especializada en CIAAC" },
            ].map((item) => (
              <div
                key={item.problem}
                className="bg-white rounded-2xl p-5 border border-[#F2DCDB] shadow-sm"
              >
                <p className="text-4xl mb-3">{item.icon}</p>
                <p className="text-slate-700 font-medium text-sm leading-snug">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0">Todo en una plataforma</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91]">
              El sistema que se adapta a ti
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              No tú a él. FlightPath combina tecnología, inteligencia artificial y gamificación para
              que estudiar se vuelva algo que esperas con ganas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-[#F2DCDB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 ${f.textColor}`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-[#3D5D91] text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-[#3D5D91] to-[#5A86CB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0">Simple y efectivo</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Así funciona FlightPath
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 bg-[#F2AEBC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#6C0820] font-extrabold text-xl">{step.number}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute transform translate-x-full translate-y-[-100%]" />
                )}
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-[#F2DCDB] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 MATERIAS */}
      <section id="materias" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0">Cobertura total</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91]">
              Las 12 materias del CIAAC
            </h2>
            <p className="mt-3 text-slate-500">
              310 preguntas distribuidas en 12 materias, exactamente como el examen real.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.id}
                className="bg-[#F2DCDB]/30 hover:bg-[#F2DCDB]/60 border border-[#F2DCDB] rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-colors cursor-default"
              >
                <span className="text-3xl">{subject.icon}</span>
                <p className="text-[#3D5D91] font-semibold text-sm leading-tight">{subject.name}</p>
                <Badge className="bg-[#3D5D91] text-white border-0 text-xs">
                  {subject.questions} preguntas
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              <span className="font-bold text-[#3D5D91]">310 preguntas en total</span> ·{" "}
              Calificación mínima para aprobar:{" "}
              <span className="font-bold text-[#6C0820]">80%</span> ·{" "}
              Tiempo límite: <span className="font-bold text-[#3D5D91]">5 horas</span>
            </p>
          </div>
        </div>
      </section>

      {/* PATHY */}
      <section className="py-20 px-4 sm:px-6 bg-[#F2DCDB]/20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0">Tu compañera de estudio</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91] mb-4">
            Pathy te acompaña en cada racha
          </h2>
          <p className="text-slate-600 mb-10 max-w-xl mx-auto">
            Pathy es una nube con gorra de piloto que evoluciona según tus días consecutivos
            estudiando. ¡Entre más constante seas, más especial se vuelve!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {PATHY_STATES.map((state) => (
              <div
                key={state.label}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 border border-[#F2DCDB] shadow-sm min-w-[110px]"
              >
                <span className="text-4xl">{state.emoji}</span>
                <p className="text-xs font-bold" style={{ color: state.color }}>
                  {state.label}
                </p>
                <p className="text-slate-400 text-xs">{state.days}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="text-lg">😶‍🌫️</span> Racha perdida → Pathy gris
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">🌑</span> 3+ días sin estudiar → Pathy negra
            </span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#F2AEBC] text-[#6C0820] border-0">Lo que dicen los estudiantes</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91]">
              Historias reales
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-[#F2DCDB] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F2AEBC] text-[#F2AEBC]" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#3D5D91] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#3D5D91]">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#F2DCDB]/20 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-[#6C0820]/10 text-[#6C0820] border-0">
              ⏰ Precio de lanzamiento — solo 3 días
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D5D91]">
              Invierte en tu carrera de piloto
            </h2>
            <p className="mt-3 text-slate-500">
              Un examen reprobado te cuesta tiempo, dinero y confianza. FlightPath te evita todo eso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Mensual */}
            <Card className="border-[#F2DCDB] shadow-sm">
              <CardContent className="p-8">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">
                  Plan Mensual
                </p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-[#3D5D91]">$1,500</span>
                  <span className="text-slate-400 text-sm mb-1">MXN/mes</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">Cancela cuando quieras</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Acceso a las 12 materias",
                    "Banco de preguntas ilimitado",
                    "Simulador CIAAC completo",
                    "Tutor IA Yaris",
                    "Flashcards interactivas",
                    "Análisis de progreso",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#3D5D91] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    variant="outline"
                    className="w-full border-[#3D5D91] text-[#3D5D91] hover:bg-[#F2DCDB] font-semibold"
                  >
                    Comenzar mensual
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plan Anual */}
            <Card className="border-2 border-[#3D5D91] shadow-xl shadow-[#3D5D91]/15 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#6C0820] text-white border-0 px-4 py-1 text-xs font-bold shadow-sm">
                  ⚡ PRECIO DE LANZAMIENTO
                </Badge>
              </div>
              <CardContent className="p-8">
                <p className="text-[#3D5D91] text-sm font-bold uppercase tracking-wide mb-2">
                  Plan Anual
                </p>
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl font-extrabold text-[#3D5D91]">$10,000</span>
                  <span className="text-slate-400 text-sm mb-1">MXN</span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-slate-400 text-sm line-through">$15,000 MXN</span>
                  <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 text-xs">
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
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#3D5D91] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-bold py-3 shadow-md shadow-[#3D5D91]/25">
                    Obtener acceso anual
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Solo por 3 días · Precio sube después
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* BONUSES */}
      <section className="py-16 px-4 sm:px-6 bg-[#3D5D91]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-[#F2AEBC]" />
            <Badge className="bg-[#F2AEBC] text-[#6C0820] border-0 font-bold">
              Bonos de lanzamiento
            </Badge>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-10">
            Con el plan anual también recibes:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BONUSES.map((bonus) => (
              <div key={bonus.title} className="bg-white/10 rounded-2xl p-6 text-left">
                <div className="w-10 h-10 bg-[#F2AEBC] rounded-xl flex items-center justify-center text-[#6C0820] mb-3">
                  {bonus.icon}
                </div>
                <h3 className="text-white font-bold mb-2">{bonus.title}</h3>
                <p className="text-[#F2DCDB] text-sm leading-relaxed">{bonus.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-[#F2DCDB]/40 border border-[#F2AEBC] rounded-3xl p-10">
            <div className="text-5xl mb-4">🛡️</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D5D91] mb-4">
              Garantía de mejora
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Si completas tu ruta de estudio y <strong>no sientes mejora</strong>, extendemos tu
              acceso y ajustamos tu plan de estudio personalizado.{" "}
              <strong>Sin costo adicional.</strong>
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
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-[#3D5D91] via-[#5A86CB] to-[#3D5D91]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#F2AEBC] text-4xl mb-4">✈️</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Aprende, Domina y Vuela
          </h2>
          <p className="text-[#F2DCDB] text-lg mb-8 max-w-xl mx-auto">
            Únete a cientos de estudiantes de aviación que ya estudian con FlightPath y llegan al
            examen con confianza real.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-[#F2AEBC] hover:bg-[#F2DCDB] text-[#6C0820] px-10 py-6 text-base font-bold shadow-lg"
            >
              Empezar ahora gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="mt-4 text-[#F2DCDB] text-sm">
            Sin tarjeta de crédito · Acceso inmediato · Garantía de mejora
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 sm:px-6 bg-[#3D5D91]/95 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F2AEBC] flex items-center justify-center">
              <span className="text-[#6C0820] font-bold">F</span>
            </div>
            <span className="font-bold text-white">FlightPath</span>
          </div>
          <p className="text-[#F2DCDB] text-sm text-center">
            Aprende, Domina y Vuela ✈️ · Por Yaritzi Bolaños
          </p>
          <div className="flex gap-4 text-[#F2DCDB] text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
