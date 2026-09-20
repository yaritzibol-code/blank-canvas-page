import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { SUBJECT_TEMAS } from "@/modules/data/registry";
import {
  MATERIAS_DEF,
  useBankCounts,
  getTemaProgress,
  materiaPerformance,
  materiaProgressPct,
  useSessionUser,
  useStore,
} from "@/lib/store";
import { adminOnly } from "@/components/shared/UnderConstruction";

export const Route = createFileRoute("/dashboard/materias/")({
  component: adminOnly(MateriasIndex, "Learning Paths"),
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
  aerodinamica: { color: "#163D70", description: "Leyes del vuelo, fuerzas, perfiles y estabilidad" },
  "aeronaves-motores": { color: "#5A86CB", description: "Estructuras, motores, sistemas y tren de aterrizaje" },
  legislacion: { color: "#163D70", description: "Marco legal nacional e internacional de aviación" },
  medicina: { color: "#7A5C1E", description: "Fisiología, hipoxia, fatiga y efectos del vuelo" },
  meteorologia: { color: "#5A86CB", description: "Atmósfera, vientos, nubes, frentes y reportes" },
  navegacion: { color: "#163D70", description: "VOR, ILS, cartas, triangulo de velocidades y NavLog" },
  "servicios-transito": { color: "#5A86CB", description: "Espacios aéreos, separación y control de tráfico" },
  comunicaciones: { color: "#163D70", description: "Radiotelefonía, procedimientos y emergencias" },
  "manuales-ais": { color: "#5A86CB", description: "PIA, Jeppesen, NOTAM y cartas de aproximación" },
  "factores-humanos": { color: "#7A5C1E", description: "CRM, SHELL, fatiga, estrés y toma de decisiones" },
  "seguridad-aerea": { color: "#163D70", description: "SMS, AVSEC, gestión de riesgos e identificación de peligros" },
  operaciones: { color: "#5A86CB", description: "VFR/IFR, peso y balance, rendimientos y aeródromos" },
};

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

const STATUS_CONFIG = {
  done:   { label: "Completada",  className: "bg-[#FBF7EC] text-[#7A5C1E] border border-[#C7A052]/40", icon: CheckCircle2 },
  active: { label: "En progreso", className: "bg-[#E8ECF2] text-[#163D70] border border-[#B8C5DA]/60", icon: PlayCircle },
  locked: { label: "Bloqueada",   className: "bg-[#F5F5F7] text-[#7E90AD] border border-[#E8ECF2]",   icon: Lock },
};

function MateriasIndex() {
  const user = useSessionUser();
  const counts = useBankCounts();
  const porMateria = new Map<string, number>();
  counts.forEach((c) => porMateria.set(c.materia, (porMateria.get(c.materia) ?? 0) + Number(c.total)));


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
      const questions = porMateria.get(m.slug) ?? 0;
      const status: Subject["status"] =
        totalTopics > 0 && doneTopics === totalTopics ? "done" : "active";
      const extra = SUBJECT_EXTRA[m.slug] ?? { color: "#163D70", description: "" };
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
    <div className="max-w-6xl mx-auto space-y-6" style={{ fontFamily: FONT, color: "#123360" }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: "0.68rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.18em", color: "#4A5872", fontWeight: 700, marginBottom: 6 }}>
          Learning paths · CIAAC
        </p>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "2rem", color: "#081A35", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          Las 12 Materias
        </h1>
        <p className="text-[#4A5872] text-sm mt-2 max-w-xl">
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
                className="border-[#E8ECF2] bg-white rounded-2xl transition-all duration-200 cursor-pointer h-full gap-0 py-0 group"
                style={{
                  boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 8px 24px -12px rgba(15,26,51,0.12)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#C7A052"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E8ECF2"; }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="inline-flex items-center justify-center rounded-xl"
                      style={{
                        width: 44, height: 44,
                        background: isLocked ? "#F5F5F7" : `${subject.color}14`,
                        color: isLocked ? "#7E90AD" : subject.color,
                        border: `1px solid ${isLocked ? "#E8ECF2" : `${subject.color}26`}`,
                      }}
                    >
                      <Icon n={subject.icon} size={22} />
                    </span>
                    <Badge className={`${className} text-[10px] font-mono uppercase tracking-[0.14em] font-semibold flex items-center gap-1 px-2 py-1 rounded-full`}>
                      <StatusIcon className="w-3 h-3" />
                      {label}
                    </Badge>
                  </div>

                  <h3 style={{ fontFamily: DISPLAY, color: "#081A35", fontSize: "1.05rem", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 4 }}>
                    {subject.name}
                  </h3>
                  <p className="text-[#7E90AD] text-xs mb-4 leading-snug min-h-[2rem]">{subject.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4A5872]">
                        <span className="text-[#123360] font-semibold">{subject.doneTopics}</span>
                        <span className="opacity-60">/{subject.totalTopics}</span> temas
                      </span>
                      <span style={{ fontFamily: MONO, color: "#081A35", fontWeight: 700, letterSpacing: "0.04em" }}>{subject.progress}%</span>
                    </div>
                    <Progress
                      value={subject.progress}
                      className="h-1.5 bg-[#E8ECF2]"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8ECF2]">
                    <div className="flex items-center gap-3 text-xs text-[#7E90AD]">
                      <span style={{ fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        <span className="text-[#123360] font-semibold">{subject.questions}</span> pregs
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
                    <span className="text-[#7A5C1E] opacity-0 group-hover:opacity-100 transition-opacity">
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
    cherry: { bg: "#FBF7EC", border: "#C7A052", color: "#7A5C1E", iconBg: "#C7A052", iconColor: "#7A5C1E" },
    ink:    { bg: "#EAF1FB", border: "#B8C5DA", color: "#163D70", iconBg: "#163D70", iconColor: "#FFFFFF" },
    muted:  { bg: "#F5F5F7", border: "#E8ECF2", color: "#7E90AD", iconBg: "#E8ECF2", iconColor: "#7E90AD" },
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

