import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  ChevronRight,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  Zap,
  Play,
  Brain,
  BarChart2,
  CheckCircle2,
  Circle,
  Trophy,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const SUBJECTS = [
  { id: 1, icon: "✈️", name: "Aerodinámica", progress: 72, total: 8, done: 6, color: "#3D5D91" },
  { id: 2, icon: "⚙️", name: "Aeronaves y Motores", progress: 55, total: 9, done: 5, color: "#5A86CB" },
  { id: 3, icon: "⚖️", name: "Legislación Aeronáutica", progress: 40, total: 14, done: 6, color: "#3D5D91" },
  { id: 4, icon: "🏥", name: "Medicina de Aviación", progress: 85, total: 13, done: 11, color: "#6C0820" },
  { id: 5, icon: "🌤️", name: "Meteorología", progress: 60, total: 22, done: 13, color: "#5A86CB" },
  { id: 6, icon: "🗺️", name: "Navegación Aérea", progress: 30, total: 22, done: 7, color: "#3D5D91" },
  { id: 7, icon: "🗼", name: "Servicios de Tránsito Aéreo", progress: 20, total: 18, done: 4, color: "#5A86CB" },
  { id: 8, icon: "📻", name: "Comunicaciones", progress: 10, total: 20, done: 2, color: "#3D5D91" },
  { id: 9, icon: "📋", name: "Manuales AIS", progress: 0, total: 19, done: 0, color: "#5A86CB" },
  { id: 10, icon: "🧠", name: "Factores Humanos", progress: 90, total: 13, done: 12, color: "#6C0820" },
  { id: 11, icon: "🛡️", name: "Seguridad Aérea", progress: 45, total: 10, done: 5, color: "#3D5D91" },
  { id: 12, icon: "🛫", name: "Operaciones Aeronáuticas", progress: 15, total: 20, done: 3, color: "#5A86CB" },
];

const RECENT_ACTIVITY = [
  { type: "simulador", icon: "✈️", text: "Simulador CIAAC completado", score: "84%", time: "hace 2 días", color: "text-[#3D5D91]" },
  { type: "banco", icon: "🎯", text: "50 preguntas de Meteorología", score: "78%", time: "hace 3 días", color: "text-[#5A86CB]" },
  { type: "flashcard", icon: "⚡", text: "Flashcards de Aerodinámica", score: "32/40 dominadas", time: "hace 4 días", color: "text-[#6C0820]" },
  { type: "materia", icon: "📖", text: "Medicina de Aviación — Bloque 3", score: "Completado", time: "hace 5 días", color: "text-green-600" },
];

const HEATMAP_DATA = Array.from({ length: 35 }, (_, i) => ({
  day: i,
  intensity: i % 7 === 0 ? 0 : Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
}));

const HEATMAP_COLORS = ["bg-slate-100", "bg-[#F2DCDB]", "bg-[#F2AEBC]", "bg-[#5A86CB]", "bg-[#3D5D91]"];

function StatCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="border-[#F2DCDB] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-2xl font-extrabold text-[#3D5D91]">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function DashboardHome() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const examDate = new Date("2026-07-15");
  const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D5D91]">Mariana 👋</h1>
          <p className="text-slate-500 text-sm mt-1">
            Llevas{" "}
            <span className="text-[#3D5D91] font-bold">14 días de racha</span>. ¡Pathy Lapis está
            orgullosa! ☁️
          </p>
        </div>

        {/* Exam countdown */}
        <div className="bg-gradient-to-br from-[#3D5D91] to-[#5A86CB] rounded-2xl px-5 py-4 text-white min-w-[200px] shadow-lg shadow-[#3D5D91]/20">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-[#F2AEBC]" />
            <p className="text-[#F2DCDB] text-xs font-medium">Tu examen CIAAC</p>
          </div>
          <p className="text-3xl font-extrabold">{daysLeft}</p>
          <p className="text-[#F2DCDB] text-sm">días restantes</p>
          <p className="text-[#F2DCDB]/60 text-xs mt-1">15 de julio 2026</p>
        </div>
      </div>

      {/* Pathy message */}
      <div className="bg-[#F2DCDB]/40 border border-[#F2AEBC] rounded-2xl p-4 flex items-start gap-3">
        <div className="text-3xl">☁️</div>
        <div className="flex-1">
          <p className="text-[#6C0820] font-bold text-sm">Pathy Lapis dice:</p>
          <p className="text-slate-600 text-sm mt-0.5">
            ¡Llevas 14 días consecutivos! Hoy te toca repasar{" "}
            <span className="font-semibold text-[#3D5D91]">Navegación Aérea</span> — tienes solo
            el 30% avanzado y el examen se acerca. ¿Empezamos? 🗺️
          </p>
        </div>
        <Link to="/dashboard">
          <Button
            size="sm"
            className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white text-xs whitespace-nowrap shrink-0"
          >
            Ir a Navegación
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          value="14"
          label="Días de racha"
          sub="Mejor: 21 días"
          color="bg-orange-50"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-[#3D5D91]" />}
          value="1,247"
          label="Preguntas respondidas"
          sub="+42 hoy"
          color="bg-[#F2DCDB]"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-[#5A86CB]" />}
          value="81%"
          label="Promedio general"
          sub="Meta: 80%"
          color="bg-[#F2DCDB]/60"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-[#6C0820]" />}
          value="47h"
          label="Horas de estudio"
          sub="Este mes: 12h"
          color="bg-[#F2AEBC]/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue studying */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#3D5D91] text-lg">Continúa estudiando</h2>
            <Link to="/dashboard" className="text-[#3D5D91] text-sm font-medium flex items-center gap-1 hover:underline">
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active subject */}
          <div className="bg-gradient-to-r from-[#3D5D91] to-[#5A86CB] rounded-2xl p-5 text-white">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌤️</div>
              <div className="flex-1 min-w-0">
                <Badge className="bg-[#F2AEBC]/20 text-[#F2AEBC] border-0 text-xs mb-2">
                  En progreso
                </Badge>
                <h3 className="font-bold text-lg">Meteorología</h3>
                <p className="text-[#F2DCDB] text-sm">
                  Bloque 3 — El Agua en la Atmósfera · Nubes y Precipitación
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-[#F2DCDB] mb-1">
                      <span>13 de 22 temas</span>
                      <span>60%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F2AEBC] rounded-full w-[60%]" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#F2AEBC] hover:bg-[#F2DCDB] text-[#6C0820] font-bold shrink-0"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <Target className="w-5 h-5" />,
                title: "Banco de Preguntas",
                desc: "Practica por materia",
                color: "bg-[#5A86CB]",
                path: "/dashboard/banco",
              },
              {
                icon: <Play className="w-5 h-5" />,
                title: "Simulador CIAAC",
                desc: "310 preguntas • 5 horas",
                color: "bg-[#3D5D91]",
                path: "/dashboard/simulador",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Flashcards",
                desc: "Repaso rápido",
                color: "bg-[#F2AEBC]",
                path: "/dashboard/flashcards",
                textDark: true,
              },
              {
                icon: <Brain className="w-5 h-5" />,
                title: "Pregúntale a Yaris",
                desc: "Tutor IA disponible",
                color: "bg-[#6C0820]",
                path: "/dashboard",
              },
            ].map((action) => (
              <Link key={action.title} to={action.path as "/dashboard"}>
                <div className={`${action.color} rounded-2xl p-4 flex items-start gap-3 hover:opacity-90 transition-opacity cursor-pointer h-full`}>
                  <div className={`mt-0.5 ${action.textDark ? "text-[#6C0820]" : "text-white"}`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${action.textDark ? "text-[#6C0820]" : "text-white"}`}>
                      {action.title}
                    </p>
                    <p className={`text-xs ${action.textDark ? "text-[#6C0820]/70" : "text-white/70"}`}>
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Heatmap */}
          <Card className="border-[#F2DCDB]">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[#3D5D91] text-sm font-bold">
                Actividad — últimos 35 días
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex gap-1 flex-wrap">
                {HEATMAP_DATA.map((d, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-md ${HEATMAP_COLORS[d.intensity]} transition-all`}
                    title={d.intensity === 0 ? "Sin actividad" : `${d.intensity * 15} preguntas`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <span>Menos</span>
                {HEATMAP_COLORS.map((c, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${c} border border-slate-100`} />
                ))}
                <span>Más</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Simulators history */}
          <Card className="border-[#F2DCDB]">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[#3D5D91] text-sm font-bold flex items-center justify-between">
                Simuladores recientes
                <Link to="/dashboard/analisis" className="text-[#3D5D91] font-normal text-xs flex items-center gap-0.5 hover:underline">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {[
                { date: "20 mayo", score: 84, passed: true },
                { date: "15 mayo", score: 77, passed: false },
                { date: "8 mayo", score: 79, passed: false },
                { date: "1 mayo", score: 82, passed: true },
              ].map((sim) => (
                <div key={sim.date} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      sim.passed
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {sim.passed ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium">{sim.date}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sim.passed ? "bg-green-500" : "bg-red-400"}`}
                        style={{ width: `${sim.score}%` }}
                      />
                    </div>
                  </div>
                  <Badge
                    className={`border-0 text-xs ${
                      sim.passed
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {sim.score}%
                  </Badge>
                </div>
              ))}
              <Link to="/dashboard/simulador">
                <Button
                  className="w-full mt-2 bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold h-9 text-sm"
                >
                  Hacer simulador
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-[#F2DCDB]">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[#3D5D91] text-sm font-bold">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.text} className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0 mt-0.5">{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium leading-tight">{a.text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold ${a.color}`}>{a.score}</span>
                      <span className="text-slate-400 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 12 Materias progress */}
      <Card className="border-[#F2DCDB]">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#3D5D91] font-bold">
              Progreso por materia
            </CardTitle>
            <Link to="/dashboard/materias" className="text-[#3D5D91] text-sm font-medium flex items-center gap-1 hover:underline">
              Ver materias <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {SUBJECTS.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-slate-700 text-xs font-medium truncate">{s.name}</p>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                      {s.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${s.progress}%`,
                        backgroundColor: s.progress >= 80 ? "#22c55e" : s.progress >= 50 ? "#5A86CB" : s.progress > 0 ? "#3D5D91" : "#e2e8f0",
                      }}
                    />
                  </div>
                </div>
                {s.progress >= 80 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                )}
                {s.progress === 0 && (
                  <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#F2DCDB] flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Completada (≥80%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#5A86CB] rounded-full" /> En progreso</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-200 rounded-full" /> Sin iniciar</span>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-bold text-[#3D5D91]">4</span> de 12 materias listas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Yaris CTA — always visible */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white rounded-2xl px-4 py-3 shadow-xl shadow-[#3D5D91]/30 flex items-center gap-2 font-semibold text-sm transition-all hover:scale-105 active:scale-95">
          <span className="text-lg">🤖</span>
          Explícamelo Yaris
        </button>
      </div>
    </div>
  );
}
