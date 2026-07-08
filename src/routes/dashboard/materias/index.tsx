import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { SUBJECT_TEMAS } from "@/modules/data/registry";
import {
  MATERIAS_DEF,
  getPublishedQuestions,
  getTemaProgress,
  materiaPerformance,
  materiaProgressPct,
  useSessionUser,
  useStore,
} from "@/lib/store";

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

/** Colores y descripciones por materia (visual, se conservan del diseño). */
const SUBJECT_EXTRA: Record<string, { color: string; description: string }> = {
  aerodinamica: { color: "#3D5D91", description: "Leyes del vuelo, fuerzas, perfiles y estabilidad" },
  "aeronaves-motores": { color: "#5A86CB", description: "Estructuras, motores, sistemas y tren de aterrizaje" },
  legislacion: { color: "#3D5D91", description: "Marco legal nacional e internacional de aviación" },
  medicina: { color: "#6C0820", description: "Fisiología, hipoxia, fatiga y efectos del vuelo" },
  meteorologia: { color: "#5A86CB", description: "Atmósfera, vientos, nubes, frentes y reportes" },
  navegacion: { color: "#3D5D91", description: "VOR, ILS, cartas, triangulo de velocidades y NavLog" },
  "servicios-transito": { color: "#5A86CB", description: "Espacios aéreos, separación y control de tráfico" },
  comunicaciones: { color: "#3D5D91", description: "Radiotelefonía, procedimientos y emergencias" },
  "manuales-ais": { color: "#5A86CB", description: "PIA, Jeppesen, NOTAM y cartas de aproximación" },
  "factores-humanos": { color: "#6C0820", description: "CRM, SHELL, fatiga, estrés y toma de decisiones" },
  "seguridad-aerea": { color: "#3D5D91", description: "SMS, AVSEC, gestión de riesgos e identificación de peligros" },
  operaciones: { color: "#5A86CB", description: "VFR/IFR, peso y balance, rendimientos y aeródromos" },
};

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const STATUS_CONFIG = {
  done:   { label: "Completada",  className: "bg-[#FAEFEE] text-[#6C0820] border border-[#F2AEBC]/40", icon: CheckCircle2 },
  active: { label: "En progreso", className: "bg-[#E8EEF6] text-[#3D5D91] border border-[#B9C8DD]/60", icon: PlayCircle },
  locked: { label: "Bloqueada",   className: "bg-[#F4F7FB] text-[#8DA1BE] border border-[#E8EEF6]",   icon: Lock },
};

function MateriasIndex() {
  const user = useSessionUser();

  const subjects = useStore<Subject[]>(() => {
    const perf = user ? materiaPerformance(user.id) : [];
    const doneTemaIds = new Set(
      user
        ? getTemaProgress(user.id)
            .filter((t) => t.completado)
            .map((t) => t.temaId)
        : [],
    );
    return MATERIAS_DEF.map((m) => {
      const temas = SUBJECT_TEMAS[m.slug] ?? [];
      const totalTopics = temas.length;
      const doneTopics = temas.filter((t) => doneTemaIds.has(t.id)).length;
      const progress = user ? materiaProgressPct(user.id, m.slug) : 0;
      const avg = perf.find((p) => p.slug === m.slug)?.avg ?? 0;
      const questions = getPublishedQuestions(m.slug).length;
      const status: Subject["status"] =
        totalTopics > 0 && doneTopics === totalTopics ? "done" : "active";
      const extra = SUBJECT_EXTRA[m.slug] ?? { color: "#3D5D91", description: "" };
      return {
        slug: m.slug,
        icon: m.icon as FPIconName,
        name: m.name,
        questions,
        totalTopics,
        doneTopics,
        progress,
        avg,
        status,
        color: extra.color,
        description: extra.description,
      };
    });
  });

  const total = subjects.length;
  const done = subjects.filter((s) => s.status === "done").length;
  const inProgress = subjects.filter((s) => s.status === "active").length;

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
        {subjects.map((subject) => {
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

