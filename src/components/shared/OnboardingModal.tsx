/**
 * Onboarding guiado (PRD Flujo 2): recorrido de 5 pasos al entrar por primera
 * vez. Pide el nombre (para mostrarlo bien en toda la cabina), escuela,
 * WhatsApp y fecha CIAAC, y cierra con un mini-tour de la plataforma.
 * Animaciones CSS puras (respetan prefers-reduced-motion) y diseño
 * mobile-first: en pantallas chicas se vuelve una hoja inferior a pantalla
 * completa con botones de dedo.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { MATERIAS_DEF, updateUser } from "@/lib/store";
import type { User } from "@/lib/store";

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";
const BRAND = "#6C0820";
const CORAL = "#F2AEBC";

const TOTAL_STEPS = 7;

const GENEROS: { key: "femenino" | "masculino" | "neutro"; label: string; ejemplo: string }[] = [
  { key: "femenino", label: "Femenino", ejemplo: "“¿Lista para despegar?”" },
  { key: "masculino", label: "Masculino", ejemplo: "“¿Listo para despegar?”" },
  { key: "neutro", label: "Prefiero no decirlo", ejemplo: "“¿Te sientes con todo?”" },
];

const TOUR: { icon: FPIconName; title: string; sub: string }[] = [
  { icon: "help", title: "Cuestionarios", sub: "2,900+ preguntas con explicación, por materia y tema" },
  { icon: "sim", title: "Simulador CIAAC", sub: "Simulacros cronometrados como el examen real" },
  { icon: "library", title: "Biblioteca", sub: "Los manuales oficiales, organizados y listos" },
  { icon: "spark", title: "Yaris & Pathy", sub: "Tu tutora IA y tu copiloto de motivación, 24/7" },
];

export function OnboardingModal({ user, onDone }: { user: User; onDone: () => void }) {
  const [step, setStep] = useState(0);
  // dir controla la animación de entrada del paso (adelante/atrás).
  const [dir, setDir] = useState<1 | -1>(1);
  const [nombre, setNombre] = useState(user.nombre);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [escuela, setEscuela] = useState(user.escuela);
  const [fecha, setFecha] = useState(user.fechaCiaac ?? "");
  const [recordatorios, setRecordatorios] = useState(true);
  const [genero, setGenero] = useState<"femenino" | "masculino" | "neutro">(user.genero ?? "neutro");
  const [focoRuta, setFocoRuta] = useState<"ciaac" | "linea-aerea">(user.focoRuta ?? "ciaac");
  const [focoMateria, setFocoMateria] = useState<string>(user.focoMateria ?? "");
  const [nombreError, setNombreError] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null);

  const firstName = useMemo(() => {
    const n = nombre.trim().split(/\s+/)[0];
    return n ? n[0].toUpperCase() + n.slice(1) : "";
  }, [nombre]);

  useEffect(() => {
    if (step === 1) setTimeout(() => nombreRef.current?.focus(), 380);
  }, [step]);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(TOTAL_STEPS - 1, next)));
  };

  const advance = () => {
    if (step === 1) {
      if (nombre.trim().length < 2) {
        setNombreError(true);
        nombreRef.current?.focus();
        return;
      }
      setNombreError(false);
    }
    // Quien se enfoca en Línea Aérea no presenta CIAAC: se salta esa fecha.
    if (step === 4 && focoRuta === "linea-aerea") {
      go(6);
      return;
    }
    go(step + 1);
  };

  const finish = (skip = false) => {
    updateUser(user.id, {
      onboardingDone: true,
      ...(skip
        ? {}
        : {
            nombre: nombre.trim() || user.nombre,
            genero,
            focoRuta,
            focoMateria: focoRuta === "ciaac" ? (focoMateria || null) : null,
            whatsapp: whatsapp.trim(),
            whatsappEstado: whatsapp.trim() ? "registrado" : "sin_numero",
            escuela: escuela.trim(),
            fechaCiaac: fecha || null,
            prefs: {
              ...user.prefs,
              toggles: { ...user.prefs.toggles, whatsapp: recordatorios },
            },
          }),
    });
    onDone();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step > 0 && step < TOTAL_STEPS - 1) advance();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #E3EAF5",
    fontSize: 16, // ≥16px evita el zoom automático de iOS al enfocar
    fontFamily: FONT,
    color: INK,
    outline: "none",
    background: "#FBFAF7",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    color: INK,
    margin: "16px 0 7px",
  };

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#3D5D91";
    e.target.style.boxShadow = "0 0 0 4px rgba(61,93,145,0.10)";
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E3EAF5";
    e.target.style.boxShadow = "none";
  };

  // Progreso de la "ruta de vuelo" del header (0 → 100%).
  const prog = (step / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="fp-ob-overlay" onKeyDown={onKeyDown}>
      <style>{`
        .fp-ob-overlay {
          position: fixed; inset: 0; z-index: 4000;
          background: rgba(15,26,51,.48);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: flex-end; justify-content: center;
          font-family: ${FONT};
          animation: fpObFade .45s ease both;
        }
        .fp-ob-card {
          width: 100%; max-width: 600px;
          max-height: calc(100dvh - 24px);
          overflow-y: auto; overscroll-behavior: contain;
          background: linear-gradient(180deg, #FFFFFF 0%, #FBFAF7 100%);
          border-radius: 26px 26px 0 0;
          padding: 24px 22px calc(22px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -20px 80px rgba(15,26,51,.45);
          animation: fpObSheet .55s cubic-bezier(.26,1.2,.38,1) both;
        }
        @media (min-width: 640px) {
          .fp-ob-overlay { align-items: center; padding: 24px; }
          .fp-ob-card { border-radius: 28px; padding: 34px 38px 30px; animation: fpObPop .55s cubic-bezier(.26,1.2,.38,1) both; }
        }
        .fp-ob-step { animation: fpObStepF .42s cubic-bezier(.3,1,.4,1) both; }
        .fp-ob-step.back { animation: fpObStepB .42s cubic-bezier(.3,1,.4,1) both; }
        .fp-ob-stagger > * { opacity: 0; animation: fpObRise .5s cubic-bezier(.3,1,.4,1) forwards; }
        .fp-ob-stagger > *:nth-child(1) { animation-delay: .06s }
        .fp-ob-stagger > *:nth-child(2) { animation-delay: .14s }
        .fp-ob-stagger > *:nth-child(3) { animation-delay: .22s }
        .fp-ob-stagger > *:nth-child(4) { animation-delay: .30s }
        .fp-ob-pathy { animation: fpObFloat 3.6s ease-in-out infinite; }
        .fp-ob-halo { animation: fpObBreathe 3.6s ease-in-out infinite; }
        .fp-ob-plane { transition: left .6s cubic-bezier(.3,1,.4,1); }
        .fp-ob-track-fill { transition: width .6s cubic-bezier(.3,1,.4,1); }
        .fp-ob-btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
        .fp-ob-btn:active { transform: scale(.97); }
        @media (hover: hover) { .fp-ob-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 34px -16px rgba(108,8,32,.55); } }
        @keyframes fpObFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fpObSheet { from { transform: translateY(60px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes fpObPop { from { transform: translateY(26px) scale(.96); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes fpObStepF { from { opacity: 0; transform: translateX(34px) } to { opacity: 1; transform: none } }
        @keyframes fpObStepB { from { opacity: 0; transform: translateX(-34px) } to { opacity: 1; transform: none } }
        @keyframes fpObRise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        @keyframes fpObFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
        @keyframes fpObBreathe { 0%,100% { opacity: .55; transform: scale(1.22) } 50% { opacity: .9; transform: scale(1.34) } }
        @media (prefers-reduced-motion: reduce) {
          .fp-ob-overlay, .fp-ob-card, .fp-ob-step, .fp-ob-stagger > *, .fp-ob-pathy, .fp-ob-halo { animation: none !important; opacity: 1 !important; }
          .fp-ob-plane, .fp-ob-track-fill { transition: none; }
        }
      `}</style>

      <div className="fp-ob-card" role="dialog" aria-modal="true" aria-label="Bienvenida a FlightPath">
        {/* Ruta de vuelo: progreso del onboarding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", color: "#8DA1BE", whiteSpace: "nowrap" }}>
            {step + 1} / {TOTAL_STEPS}
          </span>
          <div style={{ position: "relative", flex: 1, height: 22 }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, transform: "translateY(-50%)", background: "rgba(61,93,145,.16)", borderRadius: 2 }} />
            <div className="fp-ob-track-fill" style={{ position: "absolute", top: "50%", left: 0, height: 2, transform: "translateY(-50%)", background: BRAND, borderRadius: 2, width: `${prog}%` }} />
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span key={i} style={{
                position: "absolute", top: "50%", left: `${(i / (TOTAL_STEPS - 1)) * 100}%`,
                width: 7, height: 7, borderRadius: "50%", transform: "translate(-50%,-50%)",
                background: i <= step ? BRAND : "#fff",
                border: i <= step ? "none" : "1.5px solid rgba(61,93,145,.35)",
                transition: "background .3s",
              }} />
            ))}
            <span className="fp-ob-plane" style={{ position: "absolute", top: "50%", left: `${prog}%`, transform: "translate(-50%,-50%)", zIndex: 1 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#fff", boxShadow: "0 4px 14px rgba(15,26,51,.22)", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${BRAND}22` }}>
                <span style={{ transform: "rotate(90deg)", display: "flex" }}><Icon n="plane" size={14} color={BRAND} /></span>
              </span>
            </span>
          </div>
          <button
            onClick={() => finish(true)}
            style={{ background: "none", border: "none", color: "#8DA1BE", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, padding: 6, whiteSpace: "nowrap" }}
          >
            Saltar
          </button>
        </div>

        {/* PASO 0 — Bienvenida */}
        {step === 0 && (
          <div className="fp-ob-step" key="s0" style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 132, height: 132, margin: "6px auto 18px" }}>
              <div className="fp-ob-halo" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(242,174,188,.5), transparent 70%)", filter: "blur(10px)" }} />
              <div className="fp-ob-pathy" style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 22px 50px -22px rgba(15,26,51,.55)" }}>
                <img src="/assets/pathy-cloud.png" alt="Pathy, tu copiloto de estudio" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)" }} />
              </div>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.5rem,5.5vw,1.9rem)", color: INK, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              ¡Bienvenido a bordo! ✈️
            </h2>
            <p style={{ color: "#647DA0", fontSize: 14.5, lineHeight: 1.65, margin: "0 auto", maxWidth: 400 }}>
              Soy <strong style={{ color: BRAND }}>Pathy</strong>, tu copiloto de estudio. Antes de despegar,
              preparemos tu cabina — te toma menos de un minuto.
            </p>
            <button onClick={advance} className="fp-ob-btn fp-ob-btn-primary" style={primaryBtn}>
              Preparar mi cabina <Icon n="arrow" size={17} color="#fff" />
            </button>
          </div>
        )}

        {/* PASO 1 — Nombre */}
        {step === 1 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s1">
            <StepHead icon="user" title="¿Cómo quieres que te llamemos?" sub="Tu nombre aparece en tu cabina, tu bitácora y tus estadísticas." />
            <label style={labelStyle}>Tu nombre</label>
            <input
              ref={nombreRef}
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); if (nombreError) setNombreError(false); }}
              placeholder="Ej. María González"
              style={{ ...inputStyle, ...(nombreError ? { borderColor: "#e74c3c" } : {}) }}
              onFocus={focus}
              onBlur={blur}
              autoComplete="name"
            />
            {nombreError && (
              <p style={{ color: "#e74c3c", fontSize: 12.5, fontWeight: 600, margin: "7px 0 0" }}>
                Escribe tu nombre para continuar (mínimo 2 letras).
              </p>
            )}
            {firstName && (
              <div style={{
                marginTop: 16, display: "inline-flex", alignItems: "center", gap: 9,
                background: "rgba(61,93,145,.07)", border: "1px solid rgba(61,93,145,.14)",
                borderRadius: 999, padding: "8px 16px", fontSize: 13.5, color: "#33527F", fontWeight: 600,
              }}>
                <Icon n="spark" size={15} color={BRAND} /> Así te verás: “Hola, {firstName} ✈️”
              </div>
            )}
            <NavBtns onBack={() => go(0)} onNext={advance} />
          </div>
        )}

        {/* PASO 2 — Cómo dirigirnos a ti */}
        {step === 2 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s2g">
            <StepHead icon="user" title="¿Cómo nos dirigimos a ti?" sub="Para hablarte bien en toda la plataforma. Puedes cambiarlo después en tu perfil." />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {GENEROS.map((g) => {
                const activo = genero === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGenero(g.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                      padding: "14px 16px", borderRadius: 14, cursor: "pointer", width: "100%",
                      background: activo ? "rgba(108,8,32,0.05)" : "#fff",
                      border: `1.5px solid ${activo ? BRAND : "#E3EAF5"}`,
                      fontFamily: FONT,
                    }}
                  >
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${activo ? BRAND : "#C9D6E8"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {activo && <span style={{ width: 10, height: 10, borderRadius: "50%", background: BRAND }} />}
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: INK }}>{g.label}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "#647DA0", marginTop: 2 }}>{g.ejemplo}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <NavBtns onBack={() => go(1)} onNext={advance} />
          </div>
        )}

        {/* PASO 3 — En qué se enfoca */}
        {step === 3 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s3f">
            <StepHead icon="target" title="¿En qué te vas a enfocar?" sub="Personalizamos tu inicio con lo que más te importa ahora." />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {([
                { key: "ciaac" as const, icon: "graduation" as FPIconName, label: "Examen CIAAC", sub: "Las 12 materias oficiales del examen teórico" },
                { key: "linea-aerea" as const, icon: "plane" as FPIconName, label: "Línea Aérea", sub: "Convocatoria de Primer Oficial (Embraer 190)" },
              ]).map((r) => {
                const activo = focoRuta === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setFocoRuta(r.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                      padding: "14px 16px", borderRadius: 14, cursor: "pointer", width: "100%",
                      background: activo ? "rgba(108,8,32,0.05)" : "#fff",
                      border: `1.5px solid ${activo ? BRAND : "#E3EAF5"}`,
                      fontFamily: FONT,
                    }}
                  >
                    <span
                      style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: activo ? BRAND : "rgba(61,93,145,0.08)",
                        color: activo ? CORAL : "#3D5D91",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon n={r.icon} size={19} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: INK }}>{r.label}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "#647DA0", marginTop: 2 }}>{r.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {focoRuta === "ciaac" && (
              <>
                <label style={labelStyle}>¿Alguna materia en especial? (opcional)</label>
                <select
                  value={focoMateria}
                  onChange={(e) => setFocoMateria(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Todas por igual</option>
                  {MATERIAS_DEF.map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </>
            )}
            <NavBtns onBack={() => go(2)} onNext={advance} />
          </div>
        )}

        {/* PASO 4 — Perfil de vuelo */}
        {step === 4 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s2">
            <StepHead icon="graduation" title={`Tu perfil de vuelo${firstName ? `, ${firstName}` : ""}`} sub="Nos ayuda a personalizar tu preparación. Todo es opcional y editable después." />
            <label style={labelStyle}>Escuela de aviación</label>
            <input value={escuela} onChange={(e) => setEscuela(e.target.value)} placeholder="Ej. Escuela de Aviación del Pacífico" style={inputStyle} onFocus={focus} onBlur={blur} />
            <label style={labelStyle}>WhatsApp (para recordatorios de estudio)</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+52 55 1234 5678" style={inputStyle} onFocus={focus} onBlur={blur} inputMode="tel" autoComplete="tel" />
            <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 0", fontSize: 13.5, color: "#4A5F80", cursor: "pointer" }}>
              <input type="checkbox" checked={recordatorios} onChange={(e) => setRecordatorios(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#3D5D91", flexShrink: 0 }} />
              Quiero recibir recordatorios de estudio por WhatsApp
            </label>
            <NavBtns onBack={() => go(3)} onNext={advance} />
          </div>
        )}

        {/* PASO 5 — Fecha CIAAC (solo si se enfoca en el CIAAC) */}
        {step === 5 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s3">
            <StepHead icon="calendar" title="¿Cuándo es tu CIAAC?" sub="Con tu fecha activamos la cuenta regresiva y ajustamos tu ritmo de estudio." />
            <label style={labelStyle}>Fecha estimada o programada</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
            <button
              onClick={() => { setFecha(""); advance(); }}
              style={{ background: "none", border: "none", color: "#3D5D91", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, padding: "12px 0 0", display: "block" }}
            >
              Aún no tengo fecha →
            </button>
            <NavBtns onBack={() => go(4)} onNext={advance} />
          </div>
        )}

        {/* PASO 6 — Tour + despegue */}
        {step === 6 && (
          <div className={`fp-ob-step ${dir === -1 ? "back" : ""}`} key="s4">
            <StepHead icon="rocket" title={`Todo listo${firstName ? `, ${firstName}` : ""}. Esto te espera:`} sub="Tu cabina de estudio, en cuatro instrumentos." />
            <div className="fp-ob-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 16 }}>
              {TOUR.map((t) => (
                <div key={t.title} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid #E8EEF6", borderRadius: 14, padding: "13px 15px", boxShadow: "0 1px 2px rgba(15,26,51,.04), 0 10px 26px -18px rgba(15,26,51,.18)" }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: "#FAEFEE", color: BRAND, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon n={t.icon} size={19} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: INK, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>{t.title}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: "#647DA0", lineHeight: 1.45, marginTop: 2 }}>{t.sub}</span>
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => finish(false)} className="fp-ob-btn fp-ob-btn-primary" style={{ ...primaryBtn, marginTop: 22 }}>
              Despegar <Icon n="plane" size={17} color="#fff" />
            </button>
            <button onClick={() => go(focoRuta === "linea-aerea" ? 4 : 5)} style={ghostBtn}>← Atrás</button>
          </div>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: "100%",
  marginTop: 24,
  padding: "15px 20px",
  minHeight: 52,
  borderRadius: 14,
  border: "none",
  background: BRAND,
  color: "#fff",
  fontWeight: 800,
  fontSize: 15.5,
  cursor: "pointer",
  fontFamily: FONT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  boxShadow: "0 12px 28px -14px rgba(108,8,32,.5)",
};

const ghostBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px 20px",
  marginTop: 8,
  borderRadius: 12,
  border: "none",
  background: "transparent",
  color: "#647DA0",
  fontWeight: 700,
  fontSize: 13.5,
  cursor: "pointer",
  fontFamily: FONT,
};

function StepHead({ icon, title, sub }: { icon: FPIconName; title: string; sub: string }) {
  return (
    <>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg, ${INK}, #3D5D91)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: "0 12px 26px -14px rgba(34,55,92,.55)" }}>
        <Icon n={icon} size={24} color={CORAL} />
      </div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem,4.6vw,1.55rem)", color: INK, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ color: "#647DA0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{sub}</p>
    </>
  );
}

function NavBtns({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <>
      <button onClick={onNext} className="fp-ob-btn fp-ob-btn-primary" style={primaryBtn}>
        Continuar <Icon n="arrow" size={17} color="#fff" />
      </button>
      <button onClick={onBack} style={ghostBtn}>← Atrás</button>
    </>
  );
}
