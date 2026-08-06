/** Configuración de Yaris (prompt de sistema por personalidad) y límites de IA. */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, cardStyle, cardHeadStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, labelStyle } from "@/components/admin/AdminShell";
import {
  adminGetYarisConfig,
  adminUpdateYarisPrompt,
  adminGetAILimits,
  adminSetAILimit,
  type YarisDefaults,
  type YarisTonoKey,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/operaciones/yaris")({ component: YarisAdminPage });

const TONOS: Array<{ key: YarisTonoKey; label: string; help: string }> = [
  { key: "formal", label: "Formal", help: "Habla de usted, registro profesional de instructora." },
  { key: "normal", label: "Normal", help: "Español mexicano cercano, claro y directo." },
  { key: "amiga", label: "Amiga Yaris", help: "Relajada, memotecnia y referencias Disney/anime." },
];

function YarisAdminPage() {
  const [prompt, setPrompt] = useState("");
  const [personas, setPersonas] = useState<Record<YarisTonoKey, string>>({ formal: "", normal: "", amiga: "" });
  const [tab, setTab] = useState<YarisTonoKey>("normal");
  const [defaults, setDefaults] = useState<YarisDefaults | null>(null);
  const [notes, setNotes] = useState("");
  const [version, setVersion] = useState(1);
  const [history, setHistory] = useState<Array<{ version: number; created_at: string }>>([]);
  const [tokens, setTokens] = useState(500000);
  const [calls, setCalls] = useState(1000);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    const [cfg, lim] = await Promise.all([adminGetYarisConfig(), adminGetAILimits()]);
    if ("error" in cfg) setErr(cfg.error);
    else {
      setDefaults(cfg.defaults);
      // Si nunca se ha guardado nada, se muestra el prompt REAL de fábrica
      // (el mismo que Yaris usa en producción) en vez de un cuadro vacío.
      setPrompt(cfg.config.prompt || cfg.defaults.prompt);
      setPersonas({
        formal: cfg.config.personas.formal || cfg.defaults.personas.formal,
        normal: cfg.config.personas.normal || cfg.defaults.personas.normal,
        amiga: cfg.config.personas.amiga || cfg.defaults.personas.amiga,
      });
      setNotes(cfg.config.notes);
      setVersion(cfg.config.version);
      setHistory(cfg.history);
    }
    if ("error" in lim) setErr(lim.error);
    else {
      setTokens(lim.daily_token_limit);
      setCalls(lim.daily_call_limit);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function savePrompt() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const res = await adminUpdateYarisPrompt({ data: { prompt, personas, notes } });
    if ("error" in res) setErr(res.error);
    else {
      setMsg(`Guardado como versión ${res.version}. Yaris ya responde con este prompt.`);
      await load();
    }
    setBusy(false);
  }

  async function saveLimits() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const res = await adminSetAILimit({ data: { dailyTokenLimit: tokens, dailyCallLimit: calls } });
    if ("error" in res) setErr(res.error);
    else setMsg("Límites de IA actualizados.");
    setBusy(false);
  }

  return (
    <AdminShell title="Yaris & IA" active="operaciones_yaris" backTo={{ label: "Panel", to: "/admin/operaciones" }}>
      {msg && <div style={{ background: "#D1FAE5", color: "#065F46", padding: 10, borderRadius: 10, marginBottom: 14 }}>{msg}</div>}
      {err && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: 10, borderRadius: 10, marginBottom: 14 }}>{err}</div>}

      <section style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}>System prompt base de Yaris · versión {version}</div>
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          <p style={{ fontSize: ".8rem", color: "#647DA0", margin: 0 }}>
            Este es el prompt real que Yaris usa en producción. Al guardar, se aplica de inmediato a todas las respuestas
            (chat, cuestionarios y streaming). El bloque de personalidad y el de longitud se agregan debajo del base.
          </p>
          <div>
            <label style={labelStyle}>Prompt base (común a las tres personalidades)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: ".85rem", resize: "vertical" }}
            />
            {defaults && (
              <button
                type="button"
                onClick={() => setPrompt(defaults.prompt)}
                style={{ ...secondaryBtnStyle, marginTop: 8, fontSize: ".78rem" }}
              >
                Restaurar prompt de fábrica
              </button>
            )}
          </div>

          <div>
            <label style={labelStyle}>Personalidad</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {TONOS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  style={{
                    ...(tab === t.key ? primaryBtnStyle : secondaryBtnStyle),
                    fontSize: ".82rem",
                    padding: "8px 14px",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: ".78rem", color: "#647DA0", margin: "0 0 6px" }}>
              {TONOS.find((t) => t.key === tab)!.help} Se añade al prompt base cuando la estudiante elige esta voz.
            </p>
            <textarea
              value={personas[tab]}
              onChange={(e) => setPersonas({ ...personas, [tab]: e.target.value })}
              rows={9}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: ".85rem", resize: "vertical" }}
            />
            {defaults && (
              <button
                type="button"
                onClick={() => setPersonas({ ...personas, [tab]: defaults.personas[tab] })}
                style={{ ...secondaryBtnStyle, marginTop: 8, fontSize: ".78rem" }}
              >
                Restaurar voz de fábrica ({TONOS.find((t) => t.key === tab)!.label})
              </button>
            )}
          </div>

          {defaults && (
            <details style={{ fontSize: ".8rem", color: "#647DA0" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>Ver bloques de longitud (no editables)</summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
                {(["corta", "normal", "detallada"] as const).map((k) => (
                  <li key={k}>
                    <strong>{k}:</strong> {defaults.largos[k]}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div>
            <label style={labelStyle}>Notas internas (opcional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} placeholder="Cambio X, tono más formal, etc." />
          </div>
          <button onClick={savePrompt} disabled={busy || !prompt.trim()} style={{ ...primaryBtnStyle, alignSelf: "flex-start" }}>
            {busy ? "Guardando…" : "Guardar nueva versión"}
          </button>
          {history.length > 0 && (
            <div style={{ marginTop: 8, fontSize: ".8rem", color: "#647DA0" }}>
              Historial reciente:
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {history.map((h) => (
                  <li key={h.version}>
                    v{h.version} · {new Date(h.created_at).toLocaleString("es-MX")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>


      <section style={cardStyle}>
        <div style={cardHeadStyle}>Límites globales de IA (por día)</div>
        <div style={{ padding: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <label style={labelStyle}>Tokens totales / día</label>
            <input type="number" value={tokens} onChange={(e) => setTokens(Number(e.target.value))} style={inputStyle} min={0} />
          </div>
          <div>
            <label style={labelStyle}>Llamadas totales / día</label>
            <input type="number" value={calls} onChange={(e) => setCalls(Number(e.target.value))} style={inputStyle} min={0} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={saveLimits} disabled={busy} style={primaryBtnStyle}>
              {busy ? "Guardando…" : "Guardar límites"}
            </button>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px", fontSize: ".8rem", color: "#647DA0" }}>
          Yaris corre sobre la API de OpenAI del proyecto (modelo <code>gpt-5.6-luna</code>, reasoning effort <code>low</code>) y bitacoriza cada llamada en <code>ai_usage</code>.
          Además del tope global, cada usuario tiene un límite fijo de 10 consultas por minuto, 100 por hora y 300 por día, con máximo 12,000 tokens de entrada y 1,200 de salida por solicitud.
        </div>
      </section>
    </AdminShell>
  );
}
