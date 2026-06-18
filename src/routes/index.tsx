import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Star,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Zap,
  Trophy,
  Users,
  Play,
  ArrowRight,
  Sparkles,
  Target,
  Gift,
  Plane,
  Radar,
  Cloud,
  Sun,
  Palette,
  Settings2,
  Quote,
  Compass,
  Headphones,
  Briefcase,
  Heart,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ────────────────────────────────────────────────────────────── */
/* DATA                                                            */
/* ────────────────────────────────────────────────────────────── */

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
    chip: "IA",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Simulador CIAAC Real",
    description:
      "310 preguntas, 5 horas, mismo formato del examen real. Con calculadora, panel de materias y revisión completa al terminar.",
    tone: "navy",
    chip: "310 preguntas",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Banco de Preguntas",
    description:
      "Practica por materia, cantidad personalizada y recibe feedback inmediato con la explicación y cita del libro en cada respuesta.",
    tone: "silver",
    chip: "Por materia",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Flashcards Interactivas",
    description:
      "Desliza derecha si ya la sabes, izquierda para repasar. Pathy analiza tu progreso y celebra cada avance.",
    tone: "misty",
    chip: "Swipe",
  },
  {
    icon: <Play className="w-6 h-6" />,
    title: "Clases Grabadas",
    description:
      "Aprende a tu ritmo con clases organizadas por materia y tema. Controla velocidad, retoma donde lo dejaste.",
    tone: "navy",
    chip: "On-demand",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análisis Personalizado",
    description:
      "Mapa de calor de tus últimos 35 días, promedio por materia y racha de estudio. Pathy te motiva cada día.",
    tone: "cherry",
    chip: "Heatmap",
  },
];

const PATHY_STATES = [
  { days: "1–3 días", emoji: "🌸", label: "Misty Rose", color: "#F2DCDB", text: "#6C0820" },
  { days: "4–6 días", emoji: "🌺", label: "Cherry", color: "#F2AEBC", text: "#6C0820" },
  { days: "7–13 días", emoji: "💙", label: "Silver Lake", color: "#5A86CB", text: "#FFFFFF" },
  { days: "14–30 días", emoji: "☁️", label: "Lapis", color: "#3D5D91", text: "#FFFFFF" },
  { days: "30+ días", emoji: "🍷", label: "Burgundy", color: "#6C0820", text: "#FFFFFF" },
];

const STEPS = [
  {
    number: "01",
    title: "Elige tu materia",
    description:
      "Accede a las 12 materias del CIAAC con bloques de temas ordenados, actividades interactivas y flashcards.",
    icon: <Compass className="w-5 h-5" />,
  },
  {
    number: "02",
    title: "Practica con Yaris",
    description:
      "El tutor IA explica, hace preguntas, genera mapas mentales y te da nemotecnias para que nunca olvides.",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    number: "03",
    title: "Simula el examen",
    description:
      "Haz el simulador completo de 310 preguntas con tiempo real. Revisa cada error y llega el día del examen con confianza.",
    icon: <Target className="w-5 h-5" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Andrea G.",
    school: "CENCA",
    text: "Aprobé a la primera con 91%. Antes tenía pánico al examen, pero el simulador me dio la confianza que necesitaba.",
    rating: 5,
    score: "91%",
  },
  {
    name: "Diego R.",
    school: "UAEM Aviación",
    text: "Yaris es increíble. Me explica Meteorología con ejemplos de fútbol y series. Por fin entendí frentes y masas de aire.",
    rating: 5,
    score: "87%",
  },
  {
    name: "Sofía M.",
    school: "ENAH",
    text: "La racha de Pathy me mantuvo estudiando 40 días seguidos. Nunca había sido tan constante en mi vida.",
    rating: 5,
    score: "89%",
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
    title: "Comunidad FlightPath",
    description: "WhatsApp privado para estudiar con otros aspirantes, resolver dudas y mantenerte motivado.",
  },
];

const COMPARISON = [
  { feature: "Cobertura de las 12 materias CIAAC", fp: true, schools: "Parcial", self: false },
  { feature: "Simulador real (310 preguntas, 5h)", fp: true, schools: false, self: false },
  { feature: "Tutor IA disponible 24/7", fp: true, schools: false, self: false },
  { feature: "Banco de preguntas con explicación", fp: true, schools: "Limitado", self: false },
  { feature: "Plan de estudio personalizado", fp: true, schools: false, self: false },
  { feature: "Seguimiento de racha y progreso", fp: true, schools: false, self: false },
  { feature: "Garantía de mejora", fp: true, schools: false, self: false },
];

const FAQS = [
  {
    q: "¿FlightPath sirve para todas las escuelas?",
    a: "Sí. El temario está basado al 100% en el CIAAC oficial, por lo que sirve para estudiantes de cualquier escuela de aviación en México (CENCA, UAEM, ENAH, ESPA, etc.).",
  },
  {
    q: "¿Necesito conocimientos previos?",
    a: "No necesariamente. FlightPath empieza desde lo básico y avanza. Si llevas materias en tu escuela, FlightPath se vuelve tu repaso estructurado.",
  },
  {
    q: "¿Cómo es el examen del simulador?",
    a: "Replica el examen real: 310 preguntas distribuidas en 12 materias, 5 horas, opción múltiple. Con calculadora integrada y panel de materias.",
  },
  {
    q: "¿Puedo cancelar?",
    a: "El plan mensual lo cancelas cuando quieras. El plan anual incluye garantía de mejora: si completas tu ruta y no sientes avance, extendemos el acceso.",
  },
  {
    q: "¿Quién es Yaris?",
    a: "Yaris es nuestra tutora IA. Te explica cualquier concepto con ejemplos de películas, vida cotidiana y nemotecnias. Pregúntale lo que quieras, cuando quieras.",
  },
];

const SCHOOL_BADGES = ["CENCA", "UAEM", "ENAH", "ESPA", "AEROXIN", "TYS"];

/* ────────────────────────────────────────────────────────────── */
/* SKY — multiple planes, clouds, twinkles, radar, parallax        */
/* ────────────────────────────────────────────────────────────── */

function FlightSky({ density = "rich" }: { density?: "rich" | "calm" | "off" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", `${x * 14}px`);
      el.style.setProperty("--my", `${y * 10}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (density === "off") return null;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* aero grid */}
      <div className="absolute inset-0 fp-aero-grid" />

      {/* base cloud layer */}
      <div className="absolute fp-cloud-base fp-animate-cloud" style={{ top: "10%", left: "-4%", width: 420, height: 160 }} />
      <div className="absolute fp-cloud-base fp-animate-cloud-rev" style={{ top: "55%", right: "-3%", width: 480, height: 180 }} />
      <div className="absolute fp-cloud-base fp-animate-cloud" style={{ bottom: "-2%", left: "30%", width: 360, height: 140 }} />

      {/* top-layer cloud blobs (parallax) */}
      <div className="absolute fp-cloud-soft fp-animate-cloud" style={{ top: "8%", left: "6%", width: 280, height: 100, transform: "translate(var(--mx,0), var(--my,0))" }} />
      <div className="absolute fp-cloud-soft fp-animate-cloud-rev" style={{ top: "22%", right: "8%", width: 320, height: 120 }} />
      <div className="absolute fp-cloud-soft fp-animate-cloud" style={{ bottom: "14%", left: "20%", width: 220, height: 80 }} />
      <div className="absolute fp-cloud-soft fp-animate-cloud-rev" style={{ bottom: "22%", right: "18%", width: 200, height: 75 }} />
      <div className="absolute fp-cloud-soft fp-animate-cloud" style={{ top: "42%", left: "45%", width: 180, height: 60 }} />

      {/* flying planes — at 4 altitudes */}
      <FlyingPlane top="12%" delay="0s"  size={28} color="#3D5D91" rotation={-10} duration={42} />
      <FlyingPlane top="32%" delay="6s"  size={20} color="#6C0820" rotation={-4}  duration={50} reverse />
      <FlyingPlane top="58%" delay="2s"  size={24} color="#5A86CB" rotation={-8}  duration={46} />
      <FlyingPlane top="78%" delay="9s"  size={18} color="#3D5D91" rotation={-6}  duration={54} reverse />

      {/* twinkles */}
      {[
        { t: "8%",  l: "12%" }, { t: "18%", l: "82%" },
        { t: "30%", l: "30%" }, { t: "48%", l: "70%" },
        { t: "62%", l: "12%" }, { t: "72%", l: "88%" },
        { t: "85%", l: "40%" }, { t: "20%", l: "55%" },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#3D5D91] fp-animate-twinkle"
          style={{ top: p.t, left: p.l, animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* radar ping bottom-left */}
      <div className="absolute bottom-[18%] left-[10%] text-[#6C0820]">
        <div className="relative w-3 h-3 rounded-full bg-[#6C0820] fp-radar-dot" />
      </div>

      {/* dashed flight path SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-20,300 C 200,260 360,140 520,160 S 760,80 820,60"
          stroke="#3D5D91"
          strokeWidth="1.4"
          strokeOpacity="0.45"
          className="fp-dash-flow"
        />
        <path
          d="M-20,120 C 160,90 320,180 500,150 S 720,220 820,200"
          stroke="#6C0820"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          className="fp-dash-flow"
          style={{ animationDelay: "1s" }}
        />
      </svg>
    </div>
  );
}

function FlyingPlane({
  top,
  delay,
  size = 24,
  color = "#3D5D91",
  rotation = -8,
  duration = 40,
  reverse = false,
}: {
  top: string;
  delay: string;
  size?: number;
  color?: string;
  rotation?: number;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={reverse ? "absolute left-0 right-0 fp-animate-fly-back" : "absolute left-0 right-0 fp-animate-fly"}
      style={{ top, animationDelay: delay, animationDuration: `${duration}s` }}
    >
      <div className="inline-flex items-center gap-1.5" style={{ color }}>
        <span className="relative inline-block">
          <Plane
            className="fill-current"
            style={{
              width: size,
              height: size,
              transform: `rotate(${rotation}deg)`,
              filter: "drop-shadow(0 4px 8px rgba(34,55,92,.2))",
            }}
          />
          <span
            className="absolute -bottom-1 right-3 h-px bg-current"
            style={{ width: size * 1.4, opacity: 0.25 }}
          />
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* COUNTDOWN — burgundy alarm, tick animation                      */
/* ────────────────────────────────────────────────────────────── */

function useCountdown(targetMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function CountdownPill() {
  const target = useMemo(() => Date.now() + 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 23, []);
  const t = useCountdown(target);
  const pairs = [
    { v: t.days, l: "días" },
    { v: t.hours, l: "hrs" },
    { v: t.minutes, l: "min" },
    { v: t.seconds, l: "seg" },
  ];
  return (
    <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#22375C] text-white fp-shadow-navy overflow-hidden">
      <div className="fp-scan-sweep" />
      <span className="relative flex items-center gap-1.5 font-mono-fp text-[10px] uppercase tracking-[0.18em] text-[#F2AEBC]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2AEBC] fp-animate-pulse-dot" />
        Lanzamiento termina en
      </span>
      <div className="relative flex items-center gap-1.5">
        {pairs.map((p, i) => (
          <div key={p.l} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center min-w-[34px] px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">
              <span className="font-display text-base leading-none fp-tick" key={p.v}>
                {String(p.v).padStart(2, "0")}
              </span>
              <span className="font-mono-fp text-[8px] uppercase tracking-wider text-[#D7E1EE]">{p.l}</span>
            </div>
            {i < pairs.length - 1 && <span className="text-[#F2AEBC]">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* TWEAKS PANEL — theme switcher (sky/accent/atmosphere)           */
/* ────────────────────────────────────────────────────────────── */

type Sky = "hueso" | "cherry" | "azul";
type Atm = "rich" | "calm" | "off";

function TweaksPanel({
  sky, setSky, atm, setAtm,
}: { sky: Sky; setSky: (s: Sky) => void; atm: Atm; setAtm: (a: Atm) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 fp-glass border border-[#3D5D91]/15 rounded-2xl fp-shadow-lift p-4 fp-animate-soft-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#22375C]">
              <Palette className="w-4 h-4" />
              <span className="font-display text-sm">Personaliza el cielo</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#647DA0] hover:text-[#22375C]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-3">
            <p className="font-mono-fp text-[10px] uppercase tracking-[0.18em] text-[#647DA0] mb-1.5">Sky theme</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["hueso", "cherry", "azul"] as Sky[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSky(s)}
                  className={`rounded-xl px-2 py-2 text-xs font-medium border transition-all ${
                    sky === s
                      ? "border-[#6C0820] bg-[#FAEFEE] text-[#6C0820]"
                      : "border-[#E8EEF6] bg-white text-[#33527F] hover:border-[#B9C8DD]"
                  }`}
                >
                  <span
                    className="block w-full h-6 rounded mb-1 border border-white/40"
                    style={{
                      background:
                        s === "cherry"
                          ? "linear-gradient(180deg,#FBE7EC,#F6D9E1)"
                          : s === "azul"
                          ? "linear-gradient(180deg,#E7EFFB,#DAE6F6)"
                          : "linear-gradient(180deg,#FBFAF7,#F8F7F3)",
                    }}
                  />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono-fp text-[10px] uppercase tracking-[0.18em] text-[#647DA0] mb-1.5">Atmosphere</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["rich", "calm", "off"] as Atm[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAtm(a)}
                  className={`rounded-xl px-2 py-2 text-xs font-medium border transition-all ${
                    atm === a
                      ? "border-[#3D5D91] bg-[#EAF1FB] text-[#22375C]"
                      : "border-[#E8EEF6] bg-white text-[#33527F] hover:border-[#B9C8DD]"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full fp-card-navy fp-shadow-float flex items-center justify-center text-white hover:scale-105 transition-transform"
        aria-label="Personalizar"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* NAVBAR — glass, fixed, mobile drawer                            */
/* ────────────────────────────────────────────────────────────── */

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
      className={`fixed top-0 inset-x-0 z-40 fp-glass transition-all ${
        scrolled ? "border-b border-[#3D5D91]/10 shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4C648A]">
          <a href="#funciones" className="hover:text-[#3D5D91] transition-colors">Funciones</a>
          <a href="#materias" className="hover:text-[#3D5D91] transition-colors">Materias</a>
          <a href="#pathy" className="hover:text-[#3D5D91] transition-colors">Pathy</a>
          <a href="#yaris" className="hover:text-[#3D5D91] transition-colors">Yaris</a>
          <a href="#precios" className="hover:text-[#3D5D91] transition-colors">Precios</a>
          <a href="#faq" className="hover:text-[#3D5D91] transition-colors">FAQ</a>
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
            ["#yaris", "Yaris"],
            ["#precios", "Precios"],
            ["#faq", "FAQ"],
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
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles[tone] || styles.cherry} fp-shadow-card`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, tone = "cherry" }: { children: React.ReactNode; tone?: "cherry" | "ink" | "burgundy" }) {
  const cls =
    tone === "ink"
      ? "bg-[#E8EEF6] text-[#22375C]"
      : tone === "burgundy"
      ? "bg-[#6C0820]/10 text-[#6C0820]"
      : "bg-[#F2AEBC] text-[#6C0820]";
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${cls} font-mono-fp text-[10px] uppercase tracking-[0.2em] font-semibold mb-4`}>
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* LANDING                                                         */
/* ────────────────────────────────────────────────────────────── */

function LandingPage() {
  const [sky, setSky] = useState<Sky>("hueso");
  const [atm, setAtm] = useState<Atm>("rich");

  return (
    <div
      className="min-h-screen fp-sky-base font-sans-fp text-[#3D5D91]"
      data-fp-sky={sky}
      data-fp-atmosphere={atm}
    >
      <Navbar />
      <TweaksPanel sky={sky} setSky={setSky} atm={atm} setAtm={setAtm} />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 fp-cloudscape overflow-hidden">
        <FlightSky density={atm} />

        {/* floating top-right countdown */}
        <div className="absolute top-20 right-4 sm:right-8 z-10 hidden md:block">
          <CountdownPill />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* LEFT: copy */}
            <div className="lg:col-span-7">
              <Eyebrow>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C0820] fp-animate-pulse-dot" />
                Plataforma #1 CIAAC · México
              </Eyebrow>

              <h1 className="font-display text-[#22375C] text-[2.5rem] sm:text-6xl lg:text-7xl leading-[0.98] mb-6">
                El sistema de estudio<br />
                que <span className="fp-accent-text">se adapta a ti.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#647DA0] mb-8 max-w-xl leading-relaxed">
                FlightPath combina IA, simulador real y gamificación para que estudiantes de
                aviación mexicanos aprueben el CIAAC a la primera —{" "}
                <span className="font-semibold text-[#22375C]">sin perder tiempo ni dinero</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
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

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#647DA0] mb-8">
                {["Sin tarjeta de crédito", "Acceso inmediato", "Garantía de mejora"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3D5D91]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              {/* school strip */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-[#8DA1BE]">
                  Estudiantes de:
                </span>
                <div className="flex gap-3 flex-wrap">
                  {SCHOOL_BADGES.map((s) => (
                    <span
                      key={s}
                      className="font-mono-fp text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md bg-white/70 border border-[#3D5D91]/15 text-[#33527F] backdrop-blur"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: dashboard preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md fp-animate-float-y">
                <div className="fp-card-navy rounded-3xl p-6 fp-shadow-float relative overflow-hidden">
                  <div className="absolute inset-0 fp-aero-grid opacity-30 pointer-events-none" />
                  <div className="relative">
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

                    {/* heatmap mini */}
                    <div className="bg-white/10 rounded-xl p-3 border border-white/10 mb-3">
                      <p className="text-[#F2AEBC] text-[10px] font-mono-fp uppercase tracking-wider mb-2">
                        Últimos 35 días
                      </p>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => {
                          const intensity = [0, 0.2, 0.4, 0.6, 0.8, 1][Math.floor((Math.sin(i * 0.7) + 1) * 3)];
                          return (
                            <span
                              key={i}
                              className="aspect-square rounded-[3px]"
                              style={{ background: `rgba(242,174,188,${0.15 + intensity * 0.75})` }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                      <p className="text-[#F2AEBC] text-[10px] font-mono-fp uppercase tracking-wider mb-2">
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
                </div>

                {/* Yaris bubble */}
                <div className="absolute -top-5 -right-5 bg-white rounded-2xl p-3 fp-shadow-lift border border-[#F2DCDB] max-w-[200px] fp-animate-float-y-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xs">🤖</div>
                    <span className="font-display text-[#22375C] text-sm">Yaris</span>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22c55e] fp-animate-pulse-dot" />
                  </div>
                  <p className="text-[#647DA0] text-xs leading-snug">
                    ¿Recuerdas el efecto Coriolis? Es como el desagüe del baño 🌀
                  </p>
                </div>

                {/* streak badge */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 fp-shadow-lift border border-[#F2DCDB]">
                  <p className="text-2xl text-center">🔥</p>
                  <p className="font-display text-[#22375C] text-base text-center leading-none">14 días</p>
                  <p className="font-mono-fp text-[#8DA1BE] text-[10px] uppercase tracking-wider text-center mt-1">
                    racha
                  </p>
                </div>

                {/* radar pip */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#F2DCDB] fp-shadow-card flex items-center justify-center">
                  <Radar className="w-3.5 h-3.5 text-[#6C0820]" />
                </div>
              </div>
            </div>
          </div>

          {/* scroll hint */}
          <div className="mt-16 flex flex-col items-center text-[#8DA1BE] fp-animate-float-y-sm">
            <span className="font-mono-fp text-[10px] uppercase tracking-[0.25em] mb-1">scroll</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="py-12 border-y border-[#3D5D91]/10 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Estudiantes activos", icon: "👨‍✈️" },
              { value: "310", label: "Preguntas en simulador", icon: "📝" },
              { value: "12", label: "Materias cubiertas", icon: "📚" },
              { value: "80%", label: "Mínimo CIAAC", icon: "🏆" },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-3xl mb-1 transition-transform group-hover:scale-110">{stat.icon}</p>
                <p className="font-display text-3xl text-[#22375C]">{stat.value}</p>
                <p className="text-sm text-[#647DA0]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PROBLEM ════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape-cherry opacity-55" />
        <div className="absolute inset-0 fp-aero-grid opacity-40" />
        <div className="relative max-w-5xl mx-auto text-center">
          <Eyebrow tone="burgundy">El problema real</Eyebrow>
          <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl mb-5">
            El CIAAC tiene una tasa de <span className="fp-accent-text">reprobación altísima</span>
          </h2>
          <p className="text-lg text-[#647DA0] mb-12 max-w-2xl mx-auto leading-relaxed">
            Las escuelas dan material insuficiente. No existen plataformas especializadas en
            México. Y estudiar por cuenta propia sin estructura es casi imposible.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "📉", problem: "Material insuficiente", detail: "Las escuelas dan apuntes incompletos y desactualizados." },
              { icon: "😰", problem: "Sin hábitos estructurados", detail: "No sabes por dónde empezar ni cuánto estudiar al día." },
              { icon: "🔍", problem: "Ninguna plataforma especializada", detail: "El mercado solo tiene PDFs piratas y grupos sin moderar." },
            ].map((item) => (
              <div
                key={item.problem}
                className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-[#F2DCDB] fp-shadow-card fp-hover-lift text-left"
              >
                <p className="text-4xl mb-3">{item.icon}</p>
                <p className="font-display text-[#22375C] text-lg mb-1.5">{item.problem}</p>
                <p className="text-[#647DA0] text-sm leading-snug">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="funciones" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Todo en una plataforma</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              El sistema que <span className="fp-accent-text">se adapta a ti</span>
            </h2>
            <p className="mt-4 text-[#647DA0] max-w-xl mx-auto">
              No tú a él. FlightPath combina tecnología, IA y gamificación para que
              estudiar se vuelva algo que esperas con ganas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-[#E8EEF6] bg-white rounded-3xl fp-shadow-card fp-hover-lift overflow-hidden gap-0 py-0 group relative"
              >
                <CardContent className="p-7 relative">
                  <div className="flex items-start justify-between mb-5">
                    <ToneIcon tone={f.tone}>{f.icon}</ToneIcon>
                    <span className="font-mono-fp text-[10px] uppercase tracking-wider bg-[#F4F7FB] text-[#3D5D91] px-2 py-1 rounded-md">
                      {f.chip}
                    </span>
                  </div>
                  <h3 className="font-display text-[#22375C] text-xl mb-2">{f.title}</h3>
                  <p className="text-[#647DA0] text-sm leading-relaxed">{f.description}</p>
                  <span className="absolute bottom-3 right-4 text-[#F2AEBC] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden fp-card-navy">
        <div className="absolute inset-0 fp-aero-grid opacity-40" />
        <div className="absolute top-10 left-10 fp-cloud-base" style={{ width: 320, height: 120 }} />
        <div className="absolute bottom-10 right-10 fp-cloud-base" style={{ width: 280, height: 100 }} />

        {/* one slow plane in this section */}
        <FlyingPlane top="22%" delay="0s" size={20} color="#F2AEBC" rotation={-10} duration={40} />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow tone="cherry">Simple y efectivo</Eyebrow>
            <h2 className="font-display text-white text-3xl sm:text-5xl">Así funciona FlightPath</h2>
            <p className="mt-4 text-[#D7E1EE] max-w-xl mx-auto">
              Tres pasos. Una sola dirección: el día de tu examen, listo y con confianza real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 pt-10 text-center fp-hover-lift"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#F2AEBC] rounded-2xl flex items-center justify-center fp-shadow-coral rotate-3">
                  <span className="font-display text-[#6C0820] text-xl -rotate-3">{step.number}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3 text-[#F2AEBC]">
                  {step.icon}
                  <span className="font-mono-fp text-[10px] uppercase tracking-wider">
                    Paso {step.number}
                  </span>
                </div>
                <h3 className="font-display text-white text-xl mb-2">{step.title}</h3>
                <p className="text-[#D7E1EE] text-sm leading-relaxed">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-7 items-center w-14">
                    <span className="flex-1 border-t border-dashed border-[#F2AEBC]/60" />
                    <Plane className="w-3 h-3 text-[#F2AEBC] fill-current -rotate-12" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 12 MATERIAS ════════════════ */}
      <section id="materias" className="py-24 px-4 sm:px-6 bg-[#FBFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Cobertura total</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Las 12 materias del <span className="fp-accent-text">CIAAC</span>
            </h2>
            <p className="mt-4 text-[#647DA0]">
              310 preguntas distribuidas en 12 materias, exactamente como el examen real.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((s) => (
              <div
                key={s.id}
                className="group relative bg-white border border-[#E8EEF6] hover:border-[#F2AEBC] rounded-2xl p-5 flex flex-col items-center text-center gap-2.5 fp-shadow-card fp-hover-lift overflow-hidden"
              >
                <span className="absolute -top-2 -right-2 text-[8px] font-mono-fp uppercase tracking-wider bg-[#3D5D91] text-white px-2 py-1 rounded-bl-lg rounded-tr-2xl">
                  {String(s.id).padStart(2, "0")}
                </span>
                <span className="text-3xl">{s.icon}</span>
                <p className="text-[#22375C] font-display text-sm leading-tight min-h-[2.5rem]">{s.name}</p>
                <span className="font-mono-fp text-[10px] uppercase tracking-wider bg-[#F4F7FB] text-[#3D5D91] px-2 py-0.5 rounded-full">
                  {s.questions} pregs
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-[#647DA0]">
              <span className="font-display text-[#22375C] text-base">310</span>preguntas en total
            </span>
            <span className="w-px h-4 bg-[#D7E1EE]" />
            <span className="flex items-center gap-2 text-[#647DA0]">
              Mínimo:<span className="font-display fp-accent-text text-base">80%</span>
            </span>
            <span className="w-px h-4 bg-[#D7E1EE]" />
            <span className="flex items-center gap-2 text-[#647DA0]">
              Tiempo:<span className="font-display text-[#22375C] text-base">5 hrs</span>
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════ PATHY ════════════════ */}
      <section id="pathy" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape-cherry opacity-60" />
        <FlightSky density={atm === "off" ? "off" : "calm"} />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Tu compañera de estudio</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl mb-4">
              <span className="fp-accent-text">Pathy</span> te acompaña en cada racha
            </h2>
            <p className="text-[#647DA0] max-w-xl mx-auto">
              Pathy es una nube con gorra de piloto que evoluciona según tus días consecutivos
              estudiando. Entre más constante seas, más especial se vuelve.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PATHY_STATES.map((state, i) => (
              <div
                key={state.label}
                className="relative rounded-3xl p-5 border border-[#F2DCDB] fp-shadow-card fp-hover-lift flex flex-col items-center text-center gap-2 overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))`,
                  animation: `fp-floatYsm 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <span className="text-5xl mb-1">{state.emoji}</span>
                <span
                  className="font-display text-sm px-2.5 py-1 rounded-full"
                  style={{ background: state.color, color: state.text }}
                >
                  Pathy {state.label}
                </span>
                <span className="font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">
                  {state.days}
                </span>
                <span className="font-mono-fp text-[9px] uppercase tracking-wider text-[#B9C8DD]">
                  {state.color}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <div className="bg-white/85 backdrop-blur rounded-2xl p-4 border border-[#F2DCDB] flex items-center gap-3">
              <span className="text-3xl">😶‍🌫️</span>
              <div>
                <p className="font-display text-[#22375C] text-sm">Racha perdida</p>
                <p className="text-[#647DA0] text-xs">Pathy se vuelve gris hasta que regreses.</p>
              </div>
            </div>
            <div className="bg-white/85 backdrop-blur rounded-2xl p-4 border border-[#F2DCDB] flex items-center gap-3">
              <span className="text-3xl">🌑</span>
              <div>
                <p className="font-display text-[#22375C] text-sm">3+ días sin estudiar</p>
                <p className="text-[#647DA0] text-xs">Pathy se pone negra y un poco triste 💔.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ YARIS DEMO ════════════════ */}
      <section id="yaris" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow>Tutor IA · Siempre disponible</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl mb-5">
              Yaris te explica como te <span className="fp-accent-text">explicaría tu mejor amiga.</span>
            </h2>
            <p className="text-[#647DA0] text-lg leading-relaxed mb-7">
              Pregúntale lo que sea: conceptos de Aerodinámica, fórmulas de Navegación, un
              examen de hace 3 años. Yaris combina los apuntes oficiales del CIAAC con ejemplos
              de la vida diaria.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Explicaciones con ejemplos de películas y vida diaria",
                "Mapas mentales generados al instante",
                "Nemotecnias para que nunca olvides",
                "Cita el libro y el bloque de cada respuesta",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[#33527F]">
                  <span className="w-5 h-5 rounded-full bg-[#F2AEBC] text-[#6C0820] flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button className="fp-btn-coral rounded-2xl px-6 py-5 font-semibold fp-shadow-coral">
                Probar Yaris gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* chat mock */}
          <div className="relative">
            <div className="absolute -inset-6 bg-[#F2AEBC]/30 rounded-[2.5rem] blur-3xl" />
            <div className="relative bg-white border border-[#F2DCDB] rounded-3xl p-5 fp-shadow-float">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#F2AEBC] rounded-full flex items-center justify-center text-base">🤖</div>
                  <div>
                    <p className="font-display text-[#22375C] text-sm leading-none">Yaris</p>
                    <p className="font-mono-fp text-[10px] uppercase tracking-wider text-[#22c55e] mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] fp-animate-pulse-dot" />
                      en línea
                    </p>
                  </div>
                </div>
                <Headphones className="w-4 h-4 text-[#8DA1BE]" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-[#3D5D91] text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%] text-sm">
                    ¿Me explicas el efecto Coriolis con un ejemplo fácil?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#F4F7FB] text-[#22375C] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[88%] text-sm">
                    ¡Claro! 🌀 Imagina que tiras agua en el lavabo. El agua no cae recta — gira
                    porque la Tierra está rotando debajo de ella. Eso es Coriolis: una fuerza
                    aparente que desvía los objetos en movimiento por la rotación terrestre.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#F4F7FB] text-[#22375C] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[88%] text-sm">
                    <p className="font-display text-[13px] mb-1">📚 Nemotecnia:</p>
                    <p className="text-xs">
                      <span className="font-semibold">C</span>oriolis <span className="font-semibold">C</span>urva los <span className="font-semibold">C</span>uerpos en movimiento.
                    </p>
                  </div>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <div className="bg-[#F4F7FB] rounded-2xl px-3 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8DA1BE] fp-animate-pulse-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8DA1BE] fp-animate-pulse-dot" style={{ animationDelay: ".2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8DA1BE] fp-animate-pulse-dot" style={{ animationDelay: ".4s" }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-[#E8EEF6] pt-3">
                <input
                  type="text"
                  placeholder="Pregúntale algo a Yaris…"
                  className="flex-1 bg-transparent text-sm text-[#22375C] placeholder:text-[#8DA1BE] focus:outline-none"
                  readOnly
                />
                <button className="w-8 h-8 rounded-full fp-btn-coral flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* floating chip */}
            <div className="absolute -top-3 -right-3 bg-[#F2AEBC] text-[#6C0820] px-3 py-1.5 rounded-full font-mono-fp text-[10px] uppercase tracking-wider fp-shadow-coral">
              ⚡ respuesta en &lt; 2s
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-[#FBFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Lo que dicen los estudiantes</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Historias <span className="fp-accent-text">reales</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="bg-white border-[#F2DCDB] rounded-3xl fp-shadow-card fp-hover-lift gap-0 py-0 relative overflow-hidden">
                <span className="absolute -top-2 right-4 text-[6rem] leading-none font-display text-[#F2AEBC]/30 select-none pointer-events-none">
                  "
                </span>
                <CardContent className="p-7 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F2AEBC] text-[#F2AEBC]" />
                      ))}
                    </div>
                    <span className="font-mono-fp text-[10px] uppercase tracking-wider bg-[#6C0820]/10 text-[#6C0820] px-2 py-1 rounded-md">
                      Aprobó {t.score}
                    </span>
                  </div>
                  <p className="text-[#33527F] text-[15px] leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3D5D91] rounded-full flex items-center justify-center text-white font-display">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-display text-sm text-[#22375C]">{t.name}</p>
                      <p className="font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">{t.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ COMPARISON ════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow tone="ink">Comparativa honesta</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              FlightPath vs <span className="fp-accent-text">lo demás</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-[#E8EEF6] overflow-hidden fp-shadow-card bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F7FB] text-[#22375C]">
                  <th className="text-left p-4 font-display text-sm">Característica</th>
                  <th className="p-4 font-display text-sm text-[#6C0820]">FlightPath</th>
                  <th className="p-4 font-display text-sm text-[#647DA0]">Escuelas</th>
                  <th className="p-4 font-display text-sm text-[#647DA0]">Por cuenta propia</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 ? "bg-[#FBFAF7]" : "bg-white"}>
                    <td className="p-4 text-sm text-[#33527F]">{row.feature}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex w-7 h-7 rounded-full bg-[#F2AEBC] text-[#6C0820] items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm">
                      {row.schools === true ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3D5D91] mx-auto" />
                      ) : row.schools === false ? (
                        <X className="w-4 h-4 text-[#B9C8DD] mx-auto" />
                      ) : (
                        <span className="font-mono-fp text-[10px] uppercase tracking-wider text-[#647DA0]">
                          {row.schools}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm">
                      {row.self === true ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3D5D91] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-[#B9C8DD] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="precios" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 fp-cloudscape" />
        <div className="absolute inset-0 fp-aero-grid opacity-50" />
        <FlightSky density={atm === "off" ? "off" : "calm"} />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow tone="burgundy">
              <Clock className="w-3 h-3" />
              Precio de lanzamiento — solo 3 días
            </Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Invierte en tu <span className="fp-accent-text">carrera de piloto</span>
            </h2>
            <p className="mt-4 text-[#647DA0]">
              Un examen reprobado te cuesta tiempo, dinero y confianza. FlightPath te evita todo eso.
            </p>
            <div className="mt-6 flex justify-center md:hidden">
              <CountdownPill />
            </div>
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
              <div className="fp-scan-sweep" />
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
                  <Button className="w-full bg-[#F2AEBC] hover:bg-white text-[#6C0820] font-bold py-5 rounded-xl">
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

      {/* ════════════════ BONUSES ════════════════ */}
      <section className="py-20 px-4 sm:px-6 fp-card-navy relative overflow-hidden">
        <div className="absolute inset-0 fp-aero-grid opacity-30" />
        <FlyingPlane top="20%" delay="0s" size={18} color="#F2AEBC" rotation={-6} duration={48} reverse />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Gift className="w-5 h-5 text-[#F2AEBC]" />
            <Eyebrow tone="cherry">Bonos de lanzamiento</Eyebrow>
          </div>
          <h2 className="font-display text-white text-3xl sm:text-4xl mb-12">
            Con el plan anual también recibes:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {BONUSES.map((bonus, i) => (
              <div
                key={bonus.title}
                className="relative bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-left fp-hover-lift overflow-hidden"
              >
                <span className="absolute top-3 right-3 font-display text-white/15 text-3xl leading-none">
                  0{i + 1}
                </span>
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

      {/* ════════════════ GUARANTEE ════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-[#FBFAF7]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-10 fp-shadow-card border border-[#F2DCDB] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#F2AEBC]/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-[#3D5D91]/20 blur-3xl" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F2AEBC] flex items-center justify-center fp-shadow-coral">
                <ShieldCheck className="w-8 h-8 text-[#6C0820]" />
              </div>
              <h2 className="font-display text-[#22375C] text-2xl sm:text-3xl mb-4">
                Garantía de <span className="fp-accent-text">mejora</span>
              </h2>
              <p className="text-[#647DA0] text-base leading-relaxed mb-6">
                Si completas tu ruta de estudio y <strong className="text-[#22375C]">no sientes mejora</strong>,
                extendemos tu acceso y ajustamos tu plan personalizado.{" "}
                <strong className="text-[#22375C]">Sin costo adicional.</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-[#3D5D91] font-medium">
                {["Acceso extendido", "Plan ajustado", "Cero riesgo"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F7FB] border border-[#E8EEF6]">
                    <CheckCircle2 className="w-4 h-4" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow tone="ink">Dudas frecuentes</Eyebrow>
            <h2 className="font-display text-[#22375C] text-3xl sm:text-5xl">
              Preguntas <span className="fp-accent-text">honestas</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={f.q}
                className="fp-faq group bg-[#FBFAF7] border border-[#E8EEF6] rounded-2xl p-5 fp-shadow-card open:bg-white"
                open={i === 0}
              >
                <summary className="flex items-start justify-between gap-4">
                  <span className="font-display text-[#22375C] text-base">{f.q}</span>
                  <span className="w-7 h-7 rounded-full bg-[#F2AEBC] text-[#6C0820] flex items-center justify-center flex-shrink-0 transition-transform group-open:rotate-180">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-3 text-[#647DA0] text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 overflow-hidden fp-card-navy">
        <div className="absolute inset-0 fp-aero-grid opacity-40" />
        <div className="absolute top-1/3 -left-10 fp-cloud-base" style={{ width: 280, height: 100 }} />
        <div className="absolute bottom-1/4 -right-10 fp-cloud-base" style={{ width: 320, height: 110 }} />
        <FlyingPlane top="22%" delay="0s"  size={26} color="#F2AEBC" rotation={-10} duration={36} />
        <FlyingPlane top="68%" delay="4s"  size={20} color="#FAEFEE" rotation={-6}  duration={48} reverse />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block fp-animate-float-y mb-5">
            <Plane className="w-14 h-14 text-[#F2AEBC] -rotate-12 fill-current drop-shadow-lg" />
          </div>
          <h2 className="font-display text-white text-3xl sm:text-6xl mb-5">
            Aprende, <span className="fp-accent-text">Domina</span> y Vuela
          </h2>
          <p className="text-[#D7E1EE] text-lg mb-9 max-w-xl mx-auto">
            Únete a cientos de estudiantes de aviación que ya estudian con FlightPath y llegan al
            examen con confianza real.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-[#F2AEBC] hover:bg-white text-[#6C0820] px-10 py-6 text-base font-bold rounded-2xl fp-shadow-coral"
            >
              Empezar ahora gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="mt-4 font-mono-fp text-[11px] text-[#D7E1EE] uppercase tracking-wider">
            Sin tarjeta · Acceso inmediato · Garantía de mejora
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-[#D7E1EE]/70">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart key={i} className="w-3 h-3 fill-current text-[#F2AEBC]/80" />
            ))}
            <span className="font-mono-fp text-[10px] uppercase tracking-wider">
              Hecho con cariño en México
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="py-14 px-4 sm:px-6 bg-[#22375C] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#3D5D91] flex items-center justify-center">
                  <Plane className="w-4 h-4 text-[#F2AEBC] -rotate-45 fill-current" />
                </div>
                <span className="font-display text-white text-lg">FlightPath</span>
              </div>
              <p className="text-[#D7E1EE] text-sm leading-relaxed max-w-sm">
                El sistema de estudio que se adapta a ti. Aprende, domina y vuela ✈️
              </p>
              <p className="mt-4 font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">
                Por Yaritzi Bolaños · México
              </p>
            </div>
            <div>
              <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-[#F2AEBC] mb-3">Producto</p>
              <ul className="space-y-2 text-sm text-[#D7E1EE]">
                <li><a href="#funciones" className="hover:text-white">Funciones</a></li>
                <li><a href="#materias" className="hover:text-white">Materias</a></li>
                <li><a href="#precios" className="hover:text-white">Precios</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-[#F2AEBC] mb-3">Compañía</p>
              <ul className="space-y-2 text-sm text-[#D7E1EE]">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-[#F2AEBC] mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-[#D7E1EE]">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono-fp text-[10px] uppercase tracking-wider text-[#8DA1BE]">
              © {new Date().getFullYear()} FlightPath · CIAAC México
            </p>
            <div className="flex items-center gap-3 text-[#D7E1EE]">
              <span className="font-mono-fp text-[10px] uppercase tracking-wider">Aprende, Domina y Vuela</span>
              <Plane className="w-3.5 h-3.5 fill-current text-[#F2AEBC] -rotate-12" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
