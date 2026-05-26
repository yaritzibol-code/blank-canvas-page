import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/materias/")({
  component: MateriasIndex,
});

const SUBJECTS = [
  {
    slug: "aerodinamica",
    icon: "✈️",
    name: "Aerodinámica",
    questions: 30,
    totalTopics: 8,
    doneTopics: 6,
    progress: 72,
    avg: 84,
    status: "active" as const,
    color: "#3D5D91",
    description: "Leyes del vuelo, fuerzas, perfiles y estabilidad",
  },
  {
    slug: "aeronaves-motores",
    icon: "⚙️",
    name: "Aeronaves y Motores",
    questions: 30,
    totalTopics: 9,
    doneTopics: 5,
    progress: 55,
    avg: 76,
    status: "active" as const,
    color: "#5A86CB",
    description: "Estructuras, motores, sistemas y tren de aterrizaje",
  },
  {
    slug: "legislacion",
    icon: "⚖️",
    name: "Legislación Aeronáutica",
    questions: 30,
    totalTopics: 14,
    doneTopics: 6,
    progress: 40,
    avg: 70,
    status: "active" as const,
    color: "#3D5D91",
    description: "Marco legal nacional e internacional de aviación",
  },
  {
    slug: "medicina",
    icon: "🏥",
    name: "Medicina de Aviación",
    questions: 20,
    totalTopics: 13,
    doneTopics: 11,
    progress: 85,
    avg: 91,
    status: "done" as const,
    color: "#6C0820",
    description: "Fisiología, hipoxia, fatiga y efectos del vuelo",
  },
  {
    slug: "meteorologia",
    icon: "🌤️",
    name: "Meteorología",
    questions: 30,
    totalTopics: 22,
    doneTopics: 13,
    progress: 60,
    avg: 78,
    status: "active" as const,
    color: "#5A86CB",
    description: "Atmósfera, vientos, nubes, frentes y reportes",
  },
  {
    slug: "navegacion",
    icon: "🗺️",
    name: "Navegación Aérea",
    questions: 30,
    totalTopics: 22,
    doneTopics: 7,
    progress: 30,
    avg: 68,
    status: "active" as const,
    color: "#3D5D91",
    description: "VOR, ILS, cartas, triangulo de velocidades y NavLog",
  },
  {
    slug: "servicios-transito",
    icon: "🗼",
    name: "Servicios de Tránsito Aéreo",
    questions: 30,
    totalTopics: 18,
    doneTopics: 4,
    progress: 20,
    avg: 65,
    status: "active" as const,
    color: "#5A86CB",
    description: "Espacios aéreos, separación y control de tráfico",
  },
  {
    slug: "comunicaciones",
    icon: "📻",
    name: "Comunicaciones Aeronáuticas",
    questions: 20,
    totalTopics: 20,
    doneTopics: 2,
    progress: 10,
    avg: 0,
    status: "active" as const,
    color: "#3D5D91",
    description: "Radiotelefonía, procedimientos y emergencias",
  },
  {
    slug: "manuales-ais",
    icon: "📋",
    name: "Manuales de Información",
    questions: 20,
    totalTopics: 19,
    doneTopics: 0,
    progress: 0,
    avg: 0,
    status: "locked" as const,
    color: "#5A86CB",
    description: "PIA, Jeppesen, NOTAM y cartas de aproximación",
  },
  {
    slug: "factores-humanos",
    icon: "🧠",
    name: "Factores Humanos",
    questions: 20,
    totalTopics: 13,
    doneTopics: 12,
    progress: 90,
    avg: 88,
    status: "done" as const,
    color: "#6C0820",
    description: "CRM, SHELL, fatiga, estrés y toma de decisiones",
  },
  {
    slug: "seguridad-aerea",
    icon: "🛡️",
    name: "Seguridad Aérea",
    questions: 20,
    totalTopics: 10,
    doneTopics: 5,
    progress: 45,
    avg: 74,
    status: "active" as const,
    color: "#3D5D91",
    description: "SMS, AVSEC, gestión de riesgos e identificación de peligros",
  },
  {
    slug: "operaciones",
    icon: "🛫",
    name: "Operaciones Aeronáuticas",
    questions: 30,
    totalTopics: 20,
    doneTopics: 3,
    progress: 15,
    avg: 62,
    status: "active" as const,
    color: "#5A86CB",
    description: "VFR/IFR, peso y balance, rendimientos y aeródromos",
  },
];

const STATUS_CONFIG = {
  done: { label: "Completada", className: "bg-green-50 text-green-700", icon: CheckCircle2 },
  active: { label: "En progreso", className: "bg-[#F2DCDB] text-[#3D5D91]", icon: PlayCircle },
  locked: { label: "Bloqueada", className: "bg-slate-100 text-slate-400", icon: Lock },
};

function MateriasIndex() {
  const total = SUBJECTS.length;
  const done = SUBJECTS.filter((s) => s.status === "done").length;
  const inProgress = SUBJECTS.filter((s) => s.status === "active").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D5D91]">Las 12 Materias</h1>
        <p className="text-slate-500 text-sm mt-1">
          Estudia cada materia a tu ritmo. Los temas se desbloquean en orden.
        </p>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">{done}</p>
          <p className="text-xs text-green-600 font-medium">Completadas</p>
        </div>
        <div className="bg-[#F2DCDB] border border-[#F2AEBC] rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[#3D5D91]">{inProgress}</p>
          <p className="text-xs text-[#3D5D91] font-medium">En progreso</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-400">
            {total - done - inProgress}
          </p>
          <p className="text-xs text-slate-400 font-medium">Bloqueadas</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS.map((subject) => {
          const { label, className, icon: StatusIcon } = STATUS_CONFIG[subject.status];
          return (
            <Link key={subject.slug} to="/dashboard/materias/$subjectId" params={{ subjectId: subject.slug }}>
              <Card className="border-[#F2DCDB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{subject.icon}</span>
                    <Badge className={`${className} border-0 text-xs font-medium flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {label}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-[#3D5D91] text-base leading-tight mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-slate-400 text-xs mb-3 leading-snug">{subject.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        {subject.doneTopics}/{subject.totalTopics} temas
                      </span>
                      <span className="font-bold text-[#3D5D91]">{subject.progress}%</span>
                    </div>
                    <Progress
                      value={subject.progress}
                      className="h-1.5 bg-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F2DCDB]">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>
                        <span className="font-bold text-slate-600">{subject.questions}</span> preguntas
                      </span>
                      {subject.avg > 0 && (
                        <span>
                          Promedio{" "}
                          <span
                            className={`font-bold ${subject.avg >= 80 ? "text-green-600" : "text-orange-500"}`}
                          >
                            {subject.avg}%
                          </span>
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#3D5D91]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
