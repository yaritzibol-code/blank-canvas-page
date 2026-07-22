/**
 * Panel lateral de chat con Yaris (tutora académica) — se abre desde el
 * sidebar del dashboard. Usa Lovable AI Gateway (Gemini) mediante el
 * server function `yarisAiChat`, con un fallback determinista si algo falla.
 */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Icon } from "@/components/ui/fp-icon";
import { yarisReply, logYarisUse } from "@/lib/store";
import { yarisAiChat } from "@/lib/yaris-ai.functions";
import type { User } from "@/lib/store";

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

interface Msg {
  from: "yaris" | "user";
  text: string;
  cite?: string | null;
}

export function YarisChatModal({
  open,
  onClose,
  user,
  seccion = "Global",
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
  seccion?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const askYaris = useServerFn(yarisAiChat);

  useEffect(() => {
    if (open) {
      setVisible(true);
      if (user) logYarisUse(user.id, seccion);
      setMessages((prev) =>
        prev.length === 0 ? [{ from: "yaris", text: yarisReply(0, {}).t, cite: null }] : prev,
      );
    } else {
      setVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typing]);

  if (!open) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    const nextUserMsgs: Msg[] = [...messages, { from: "user", text }];
    setMessages(nextUserMsgs);
    setInput("");
    setTyping(true);
    try {
      const history = nextUserMsgs
        .filter((m) => (m.from === "yaris" ? messages.indexOf(m) > 0 : true)) // skip greeting
        .map((m) => ({
          role: (m.from === "yaris" ? "assistant" : "user") as "assistant" | "user",
          content: m.text.replace(/<[^>]+>/g, ""),
        }))
        .slice(-16);
      const res = await askYaris({ data: { history, context: { materia: seccion } } });
      setMessages((m) => [...m, { from: "yaris", text: res.text, cite: res.cite ?? null }]);
    } catch (err) {
      console.error("Yaris AI failed", err);
      const turn = messages.filter((m) => m.from === "yaris").length;
      const r = yarisReply(turn, {}, text);
      setMessages((m) => [...m, { from: "yaris", text: r.t, cite: r.c }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(34,55,92,.25)", fontFamily: FONT }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px, 100vw)",
          background: "white",
          boxShadow: "-16px 0 48px rgba(34,55,92,.28)",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform .3s ease",
        }}
      >
        {/* Header */}
        <div style={{ background: INK, color: "white", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(242,174,188,.18)", color: "#F2AEBC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon n="spark" size={19} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: ".98rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Yaris IA</div>
            <div style={{ fontSize: ".7rem", opacity: 0.7 }}>Tutora académica</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1, padding: 4, fontFamily: FONT }}
          >
            ×
          </button>
        </div>

        {/* Mensajes */}
        <div
          ref={listRef}
          style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "#F7F9FC" }}
        >
          {messages.map((m, i) =>
            m.from === "yaris" ? (
              <div
                key={i}
                style={{
                  maxWidth: "88%", alignSelf: "flex-start",
                  background: "white", border: "1px solid #E8EEF6",
                  borderRadius: "12px 12px 12px 4px", padding: "10px 14px",
                  fontSize: ".85rem", color: INK, lineHeight: 1.5,
                  boxShadow: "0 2px 8px rgba(61,93,145,.05)",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
                {m.cite && (
                  <div style={{ marginTop: 6, fontSize: ".72rem", color: "#8DA1BE" }}>Fuente: {m.cite}</div>
                )}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  maxWidth: "88%", alignSelf: "flex-end",
                  background: "#6C0820", color: "white",
                  borderRadius: "12px 12px 4px 12px", padding: "10px 14px",
                  fontSize: ".85rem", lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            ),
          )}
          {typing && (
            <div style={{ alignSelf: "flex-start", fontSize: ".78rem", color: "#8DA1BE", fontStyle: "italic", padding: "2px 6px" }}>
              Yaris está escribiendo...
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: 14, borderTop: "1px solid #E8EEF6", display: "flex", gap: 8, flexShrink: 0, background: "white" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
            placeholder="Escribe tu duda académica..."
            style={{
              flex: 1, padding: "10px 14px",
              border: "1.5px solid #E8EEF6", borderRadius: 10,
              fontSize: ".85rem", fontFamily: FONT, color: INK,
              outline: "none", background: "#FBFAF7",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
            onBlur={(e) => (e.target.style.borderColor = "#E8EEF6")}
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || typing}
            style={{
              padding: "0 16px",
              background: input.trim() && !typing ? "#6C0820" : "#C9D4E5",
              color: "white", border: "none", borderRadius: 10,
              cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6,
              fontWeight: 700, fontSize: ".82rem", fontFamily: FONT,
            }}
          >
            <Icon n="send" size={15} /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
