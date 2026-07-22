/** Configuración de Yaris (prompt de sistema) y límites de IA. */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, cardStyle, cardHeadStyle, primaryBtnStyle, inputStyle, labelStyle } from "@/components/admin/AdminShell";
import {
  adminGetYarisConfig,
  adminUpdateYarisPrompt,
  adminGetAILimits,
  adminSetAILimit,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/operaciones/yaris")({ component: YarisAdminPage });

function YarisAdminPage() {
  const [prompt, setPrompt] = useState("");
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
      setPrompt(cfg.config.prompt);
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
    const res = await adminUpdateYarisPrompt({ data: { prompt, notes } });
    if ("error" in res) setErr(res.error);
    else {
      setMsg(`Guardado como versión ${res.version}.`);
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
        <div style={cardHeadStyle}>System prompt de Yaris · versión {version}</div>
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: ".85rem", resize: "vertical" }}
            />
          </div>
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
          Aplican como tope global; futuras versiones de Yaris chequean estos valores antes de llamar al gateway y bitacorizan cada uso en <code>ai_usage</code>.
        </div>
      </section>
    </AdminShell>
  );
}
