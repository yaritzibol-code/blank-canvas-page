import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";

export const Route = createFileRoute("/dashboard/materias/")({
  component: MateriasIndex,
});

type Subject = {
  slug: string;
  icon: FPIconName;
  name: string;
  questions: number;
  totalTopics: number;
  doneTopics: number;
  progress: number;
  avg: number;
  status: "active" | "done" | "locked";
  color: string;
  description: string;
};

const SUBJECTS: Subject[] = [
  { slug: "aerodinamica", icon: "plane", name: "Aerodinámica", questions: 30, totalTopics: 8, doneTopics: 6, progress: 72, avg: 84, status: "active", color: "#3D5D91", description: "Leyes del vuelo, fuerzas, perfiles y estabilidad" },
  { slug: "aeronaves-motores", icon: "settings", name: "Aeronaves y Motores", questions: 30, totalTopics: 9, doneTopics: 5, progress: 55, avg: 76, status: "active", color: "#5A86CB", description: "Estructuras, motores, sistemas y tren de aterrizaje" },
  { slug: "legislacion", icon: "scale", name: "Legislación Aeronáutica", questions: 30, totalTopics: 14, doneTopics: 6, progress: 40, avg: 70, status: "active", color: "#3D5D91", description: "Marco legal nacional e internacional de aviación" },
  { slug: "medicina", icon: "stethoscope", name: "Medicina de Aviación", questions: 20, totalTopics: 13, doneTopics: 11, progress: 85, avg: 91, status: "done", color: "#6C0820", description: "Fisiología, hipoxia, fatiga y efectos del vuelo" },
  { slug: "meteorologia", icon: "cloud", name: "Meteorología", questions: 30, totalTopics: 22, doneTopics: 13, progress: 60, avg: 78, status: "active", color: "#5A86CB", description: "Atmósfera, vientos, nubes, frentes y reportes" },
  { slug: "navegacion", icon: "map", name: "Navegación Aérea", questions: 30, totalTopics: 22, doneTopics: 7, progress: 30, avg: 68, status: "active", color: "#3D5D91", description: "VOR, ILS, cartas, triangulo de velocidades y NavLog" },
  { slug: "servicios-transito", icon: "tower", name: "Servicios de Tránsito Aéreo", questions: 30, totalTopics: 18, doneTopics: 4, progress: 20, avg: 65, status: "active", color: "#5A86CB", description: "Espacios aéreos, separación y control de tráfico" },
  { slug: "comunicaciones", icon: "radio", name: "Comunicaciones Aeronáuticas", questions: 20, totalTopics: 20, doneTopics: 2, progress: 10, avg: 0, status: "active", color: "#3D5D91", description: "Radiotelefonía, procedimientos y emergencias" },
  { slug: "manuales-ais", icon: "doc", name: "Manuales de Información", questions: 20, totalTopics: 19, doneTopics: 0, progress: 0, avg: 0, status: "locked", color: "#5A86CB", description: "PIA, Jeppesen, NOTAM y cartas de aproximación" },
  { slug: "factores-humanos", icon: "brain", name: "Factores Humanos", questions: 20, totalTopics: 13, doneTopics: 12, progress: 90, avg: 88, status: "done", color: "#6C0820", description: "CRM, SHELL, fatiga, estrés y toma de decisiones" },
  { slug: "seguridad-aerea", icon: "shield", name: "Seguridad Aérea", questions: 20, totalTopics: 10, doneTopics: 5, progress: 45, avg: 74, status: "active", color: "#3D5D91", description: "SMS, AVSEC, gestión de riesgos e identificación de peligros" },
  { slug: "operaciones", icon: "plane", name: "Operaciones Aeronáuticas", questions: 30, totalTopics: 20, doneTopics: 3, progress: 15, avg: 62, status: "active", color: "#5A86CB", description: "VFR/IFR, peso y balance, rendimientos y aeródromos" },
];

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const STATUS_CONFIG = {
  done:   { label: "Completada",  className: "bg-[#FAEFEE] text-[#6C0820] border border-[#F2AEBC]/40", icon: CheckCircle2 },
  active: { label: "En progreso", className: "bg-[#E8EEF6] text-[#3D5D91] border border-[#B9C8DD]/60", icon: PlayCircle },
  locked: { label: "Bloqueada",   className: "bg-[#F4F7FB] text-[#8DA1BE] border border-[#E8EEF6]",   icon: Lock },
};

function MateriasIndex() {
  const total = SUBJECTS.length;
  const done = SUBJECTS.filter((s) => s.status === "done").length;
  const inProgress = SUBJECTS.filter((s) => s.status === "active").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6" style={{ fontFamily: FONT, color: "#33527F" }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: "0.68rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.18em", color: "#647DA0", fontWeight: 700, marginBottom: 6 }}>
          Learning paths · CIAAC
        </p>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "2rem", color: "#22375C", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          Las 12 Materias
        </h1>
        <p className="text-[#647DA0] text-sm mt-2 max-w-xl">
          Estudia cada materia a tu ritmo. Los temas se desbloquean en orden.
        </p>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-3 gap-4">
        <OverviewTile n={done}                       label="Completadas"  iconName="checkCircle" tone="cherry" />
        <OverviewTile n={inProgress}                 label="En progreso"  iconName="play"        tone="ink" />
        <OverviewTile n={total - done - inProgress}  label="Bloqueadas"   iconName="lock"        tone="muted" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS.map((subject) => {
          const { label, className, icon: StatusIcon } = STATUS_CONFIG[subject.status];
          const isLocked = subject.status === "locked";
          return (
            <Link key={subject.slug} to="/dashboard/materias/$subjectId" params={{ subjectId: subject.slug }}>
              <Card
                className="border-[#E8EEF6] bg-white rounded-2xl transition-all duration-200 cursor-pointer h-full gap-0 py-0 group"
                style={{
                  boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 8px 24px -12px rgba(15,26,51,0.12)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#F2AEBC"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E8EEF6"; }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="inline-flex items-center justify-center rounded-xl"
                      style={{
                        width: 44, height: 44,
                        background: isLocked ? "#F4F7FB" : `${subject.color}14`,
                        color: isLocked ? "#8DA1BE" : subject.color,
                        border: `1px solid ${isLocked ? "#E8EEF6" : `${subject.color}26`}`,
                      }}
                    >
                      <Icon n={subject.icon} size={22} />
                    </span>
                    <Badge className={`${className} text-[10px] font-mono uppercase tracking-[0.14em] font-semibold flex items-center gap-1 px-2 py-1 rounded-full`}>
                      <StatusIcon className="w-3 h-3" />
                      {label}
                    </Badge>
                  </div>

                  <h3 style={{ fontFamily: DISPLAY, color: "#22375C", fontSize: "1.05rem", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 4 }}>
                    {subject.name}
                  </h3>
                  <p className="text-[#8DA1BE] text-xs mb-4 leading-snug min-h-[2rem]">{subject.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#647DA0]">
                        <span className="text-[#33527F] font-semibold">{subject.doneTopics}</span>
                        <span className="opacity-60">/{subject.totalTopics}</span> temas
                      </span>
                      <span style={{ fontFamily: MONO, color: "#22375C", fontWeight: 700, letterSpacing: "0.04em" }}>{subject.progress}%</span>
                    </div>
                    <Progress
                      value={subject.progress}
                      className="h-1.5 bg-[#E8EEF6]"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8EEF6]">
                    <div className="flex items-center gap-3 text-xs text-[#8DA1BE]">
                      <span style={{ fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        <span className="text-[#33527F] font-semibold">{subject.questions}</span> pregs
                      </span>
                      {subject.avg > 0 && (
                        <span style={{ fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          Avg{" "}
                          <span
                            className="font-semibold"
                            style={{ color: subject.avg >= 80 ? "#0d8a4f" : "#b06a13" }}
                          >
                            {subject.avg}%
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-[#6C0820] opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </span>
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

function OverviewTile({ n, label, iconName, tone }: { n: number; label: string; iconName: FPIconName; tone: "cherry" | "ink" | "muted" }) {
  const styles = {
    cherry: { bg: "#FAEFEE", border: "#F2AEBC", color: "#6C0820", iconBg: "#F2AEBC", iconColor: "#6C0820" },
    ink:    { bg: "#EAF1FB", border: "#B9C8DD", color: "#3D5D91", iconBg: "#3D5D91", iconColor: "#FFFFFF" },
    muted:  { bg: "#F4F7FB", border: "#E8EEF6", color: "#8DA1BE", iconBg: "#E8EEF6", iconColor: "#8DA1BE" },
  }[tone];
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 border" style={{ background: styles.bg, borderColor: styles.border }}>
      <span className="inline-flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: styles.iconBg, color: styles.iconColor, flexShrink: 0 }}>
        <Icon n={iconName} size={18} sw={1.8} />
      </span>
      <div>
        <p style={{ fontFamily: DISPLAY, fontSize: "1.6rem", color: styles.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{n}</p>
        <p style={{ fontSize: "0.7rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.14em", color: styles.color, fontWeight: 600, marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

