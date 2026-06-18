/* FlightPath shared line-icon set — single-stroke, instrument-clean.
   Use instead of emojis across the app:  <Icon n="book" size={18} /> */
import type { CSSProperties, ReactNode } from "react";

export type FPIconName =
  | "home" | "book" | "help" | "sim" | "clock" | "library" | "cards" | "play"
  | "doc" | "chart" | "bell" | "user" | "users" | "settings" | "flame" | "spark"
  | "plane" | "check" | "checkCircle" | "arrow" | "arrowUp" | "arrowDown"
  | "target" | "brain" | "chat" | "audio" | "bolt" | "shield" | "trophy"
  | "calendar" | "search" | "plus" | "minus" | "edit" | "trash" | "download"
  | "upload" | "star" | "heart" | "lock" | "mail" | "eye" | "eyeOff" | "filter"
  | "grid" | "list" | "close" | "chevR" | "chevL" | "chevD" | "chevU"
  | "compass" | "radio" | "map" | "cloud" | "sun" | "wind" | "gauge" | "rocket"
  | "medal" | "flag" | "pin" | "pause" | "refresh" | "send" | "info" | "alert"
  | "moon" | "headset" | "pencil" | "bookmark" | "graduation" | "stats" | "timer"
  | "lightbulb" | "fire" | "wrench" | "scale" | "stethoscope" | "tower" | "globe";

export function Icon({
  n, size = 18, sw = 1.6, color = "currentColor", className, style,
}: { n: FPIconName; size?: number; sw?: number; color?: string; className?: string; style?: CSSProperties }) {
  const p = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const fc = { fill: color, stroke: "none" as const };
  const g: Record<FPIconName, ReactNode> = {
    home: <path d="M4 11l8-7 8 7M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" {...p} />,
    book: <path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2V5zM7 18h11" {...p} />,
    help: <><circle cx="12" cy="12" r="9" {...p} /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6v.4" {...p} /><circle cx="12" cy="17" r="0.6" {...fc} /></>,
    sim: <><rect x="3" y="4" width="18" height="13" rx="2" {...p} /><path d="M8 21h8M12 17v4" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3.5 2" {...p} /></>,
    library: <path d="M5 4v16M9 4v16M14 6l5 14M5 4h4M14 6l4-1" {...p} />,
    cards: <><rect x="4" y="7" width="13" height="13" rx="2.5" {...p} /><path d="M8 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" {...p} /></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><path d="M10 9.5l4 2.5-4 2.5z" {...fc} /></>,
    doc: <path d="M7 3h7l5 5v13H7zM14 3v5h5" {...p} />,
    chart: <path d="M4 19V5M4 19h16M8 16v-4M12 16V9M16 16v-2" {...p} />,
    stats: <path d="M4 19V5M4 19h16M8 16v-4M12 16V9M16 16v-2" {...p} />,
    bell: <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" {...p} />,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.4" {...p} /><path d="M3 20a6 6 0 0 1 12 0M16 5a3.4 3.4 0 0 1 0 6.5M18 20a6 6 0 0 0-3-5.2" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 13H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-1.6 2.9z" {...p} /></>,
    wrench: <path d="M14.5 6.5a4 4 0 0 0 5 5l-7 7a2.1 2.1 0 0 1-3-3l5-9z" {...p} />,
    flame: <path d="M12 3s4.5 4 4.5 8.5A4.5 4.5 0 1 1 7.5 11.5c0-2 1-3 2-4-1 4 2.5 4 2.5 7.5 0-3.5 4-3.5 4-7.5 0-3.5-4-4-4-4z" {...p} />,
    fire: <path d="M12 3s4.5 4 4.5 8.5A4.5 4.5 0 1 1 7.5 11.5c0-2 1-3 2-4-1 4 2.5 4 2.5 7.5 0-3.5 4-3.5 4-7.5 0-3.5-4-4-4-4z" {...p} />,
    spark: <path d="M12 3l1.6 5.8L19 11l-5.4 1.6L12 19l-1.6-6.4L5 11l5.4-2.2L12 3z" {...p} />,
    lightbulb: <><path d="M9 18h6M10 21h4" {...p} /><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.3V16h6v-.2c0-.9.3-1.7 1-2.3A6 6 0 0 0 12 3z" {...p} /></>,
    plane: <path d="M3.5 13l17-7.5L14 21l-2.5-7L3.5 13z" {...p} />,
    rocket: <path d="M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5M14 4c3 0 6 3 6 6 0 2-3 6-7 9l-4-4c3-4 7-7 9-7M9 11l4 4" {...p} />,
    check: <path d="M5 12l4 4 10-10" {...p} />,
    checkCircle: <><circle cx="12" cy="12" r="9" {...p} /><path d="M8.5 12l2.5 2.5 4.5-5" {...p} /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    arrowUp: <path d="M12 19V5M6 11l6-6 6 6" {...p} />,
    arrowDown: <path d="M12 5v14M6 13l6 6 6-6" {...p} />,
    send: <path d="M4 12l16-8-6 16-3-6-7-2z" {...p} />,
    target: <><circle cx="12" cy="12" r="8" {...p} /><circle cx="12" cy="12" r="3.4" {...p} /></>,
    brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 1V4.5A2.5 2.5 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 4 3 3 0 0 1-5 1" {...p} />,
    chat: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4l-4 4v-4H6a2 2 0 0 1-2-2V6z" {...p} />,
    audio: <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8" {...p} />,
    headset: <path d="M4 14v-2a8 8 0 1 1 16 0v2M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2z" {...p} />,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...p} />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...p} />,
    trophy: <path d="M7 4h10v4a5 5 0 0 1-10 0V4zM5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M9 16h6M8 20h8M12 16v4" {...p} />,
    medal: <><circle cx="12" cy="14" r="5" {...p} /><path d="M9 9L7 3M15 9l2-6M12 12.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" {...p} /></>,
    graduation: <path d="M12 4l10 5-10 5L2 9l10-5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" {...p} />,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2.5" {...p} /><path d="M4 9h16M8 3v4M16 3v4" {...p} /></>,
    timer: <><circle cx="12" cy="13" r="8" {...p} /><path d="M12 9v4l2.5 2M9 2h6" {...p} /></>,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="M16 16l5 5" {...p} /></>,
    filter: <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" {...p} />,
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    minus: <path d="M5 12h14" {...p} />,
    edit: <path d="M4 20h4l10-10-4-4L4 16v4zM13.5 6.5l4 4" {...p} />,
    pencil: <path d="M4 20h4l10-10-4-4L4 16v4zM13.5 6.5l4 4" {...p} />,
    trash: <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" {...p} />,
    download: <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" {...p} />,
    upload: <path d="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14" {...p} />,
    star: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 17.6 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3z" {...p} />,
    heart: <path d="M12 20s-7-4.3-9.3-8.2C1.2 9 2.3 5.5 5.5 5.1c2-.2 3.4 1 4.5 2.4 1.1-1.4 2.5-2.6 4.5-2.4 3.2.4 4.3 3.9 2.8 6.7C19 15.7 12 20 12 20z" {...p} />,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" {...p} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" {...p} /><path d="M4 7l8 5 8-5" {...p} /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    eyeOff: <path d="M4 4l16 16M9.9 5.2A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6.3 7.8A17 17 0 0 0 2 12s4 7 10 7a10 10 0 0 0 3.3-.6M9.5 9.6A3 3 0 0 0 14.4 14" {...p} />,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.4" {...p} /><rect x="13" y="4" width="7" height="7" rx="1.4" {...p} /><rect x="4" y="13" width="7" height="7" rx="1.4" {...p} /><rect x="13" y="13" width="7" height="7" rx="1.4" {...p} /></>,
    list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...p} />,
    close: <path d="M6 6l12 12M18 6L6 18" {...p} />,
    chevR: <path d="M9 6l6 6-6 6" {...p} />,
    chevL: <path d="M15 6l-6 6 6 6" {...p} />,
    chevD: <path d="M6 9l6 6 6-6" {...p} />,
    chevU: <path d="M6 15l6-6 6 6" {...p} />,
    compass: <><circle cx="12" cy="12" r="9" {...p} /><path d="M15 9l-2.2 6L9 16l2-6 4-1z" {...p} /></>,
    map: <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" {...p} />,
    globe: <><circle cx="12" cy="12" r="9" {...p} /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" {...p} /></>,
    radio: <><circle cx="12" cy="12" r="2.4" {...p} /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M6 6a8.5 8.5 0 0 0 0 12M18 6a8.5 8.5 0 0 1 0 12" {...p} /></>,
    tower: <path d="M7 3l1 6m9-6l-1 6M6 9h12M8 9l1.5 12h5L16 9M9.5 15h5" {...p} />,
    cloud: <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18H7z" {...p} />,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" {...p} /></>,
    wind: <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h8a2.5 2.5 0 1 1-2.5 2.5" {...p} />,
    gauge: <><path d="M5 18a8 8 0 1 1 14 0" {...p} /><path d="M12 14l4-4" {...p} /><circle cx="12" cy="14" r="1.3" {...fc} /></>,
    scale: <path d="M12 4v16M7 4h10M5 8l-2.5 6a3 3 0 0 0 5 0L5 8zm14 0l-2.5 6a3 3 0 0 0 5 0L19 8zM7 20h10" {...p} />,
    stethoscope: <path d="M6 4v5a4 4 0 0 0 8 0V4M6 4H4m2 0h2m6 0h-2m2 0h2M10 17a5 5 0 0 0 9 0v-2" {...p} />,
    flag: <path d="M6 21V4M6 4h11l-2 4 2 4H6" {...p} />,
    pin: <><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>,
    pause: <path d="M9 5v14M15 5v14" {...p} />,
    refresh: <path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M18 4v5h-5M6 20v-5h5" {...p} />,
    info: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 11v5" {...p} /><circle cx="12" cy="8" r="0.6" {...fc} /></>,
    alert: <><path d="M12 4l9 16H3l9-16z" {...p} /><path d="M12 10v4" {...p} /><circle cx="12" cy="17" r="0.6" {...fc} /></>,
    moon: <path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" {...p} />,
    bookmark: <path d="M6 4h12v17l-6-4-6 4V4z" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className} style={{ display: "block", ...style }}>{g[n]}</svg>;
}
