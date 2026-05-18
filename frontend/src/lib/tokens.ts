/**
 * Signal OS — Design Token System
 * Single source of truth for MRT Station Dashboard design decisions.
 *
 * These TypeScript tokens mirror the CSS variables in index.css and extend
 * them with typed values for use in inline styles and logic.
 *
 * Prefer CSS variables in JSX styles. Use these tokens for:
 *   - Dynamic computations (opacity math, conditional colors)
 *   - Component logic (status → color mapping)
 *   - Consistent magic numbers across the codebase
 */

// ─── Spacing ─────────────────────────────────────────────────────────────────
/** 4px base unit. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  sm: "6px",
  md: "10px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const font = {
  display: "'Bebas Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
  body: "'Sora', sans-serif",
} as const;

export const fontSize = {
  /** JetBrains Mono data labels / status chips */
  label: 9.5,
  /** Body small */
  sm: 12,
  /** Body default */
  base: 13.5,
  /** Section subtitles */
  md: 15,
  /** Card titles (Bebas Neue) */
  title: 18,
  /** Page headers (Bebas Neue) */
  heading: 36,
  /** Hero display (Bebas Neue) */
  display: 76,
} as const;

// ─── Color palette (raw values for dynamic use) ───────────────────────────────
export const color = {
  accent: "#1d6fe8",
  accentMid: "#3b82f6",
  accentLight: "#60a5fa",

  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#0ea5e9",

  /** Dark mode panel backgrounds */
  dark: {
    base: "oklch(0.115 0.022 245)",
    card: "oklch(0.152 0.02 243)",
    sidebar: "oklch(0.09 0.022 245)",
    muted: "oklch(0.18 0.018 244)",
  },
  /** Light mode backgrounds */
  light: {
    base: "oklch(0.974 0.007 248)",
    card: "oklch(0.99 0.005 248)",
    sidebar: "oklch(0.96 0.009 248)",
    muted: "oklch(0.94 0.008 248)",
  },
} as const;

// ─── Status → color mapping ───────────────────────────────────────────────────
export type StationStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";
export type ScheduleStatus = "ON_TIME" | "DELAYED" | "CANCELLED";
export type UserRole = "ADMIN" | "OPERATOR";

export const statusColors: Record<StationStatus, { text: string; glow: string; bg: string }> = {
  ACTIVE: {
    text: "#22c55e",
    glow: "rgba(34,197,94,0.35)",
    bg: "rgba(34,197,94,0.1)",
  },
  MAINTENANCE: {
    text: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    bg: "rgba(245,158,11,0.1)",
  },
  INACTIVE: {
    text: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    bg: "rgba(239,68,68,0.1)",
  },
};

export const scheduleColors: Record<ScheduleStatus, { text: string; bg: string }> = {
  ON_TIME: { text: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  DELAYED: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  CANCELLED: { text: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export const roleColors: Record<UserRole, { text: string; bg: string; border: string }> = {
  ADMIN: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  OPERATOR: {
    text: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
  },
};

// ─── Card styles (shared across pages) ───────────────────────────────────────
export const cardBase: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: radius.lg,
  overflow: "hidden",
  position: "relative",
};

export const cardWithAccent: React.CSSProperties = {
  ...cardBase,
  boxShadow: "inset 3px 0 0 rgba(59,130,246,0.55)",
};

/** 2px gradient line at top of card */
export const accentLine: React.CSSProperties = {
  height: 2,
  background: "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
};

// ─── LED status dot (reusable inline style generator) ────────────────────────
export function ledDot(status: StationStatus): React.CSSProperties {
  const c = statusColors[status];
  return {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: c.text,
    boxShadow: `0 0 6px ${c.glow}`,
    flexShrink: 0,
    animation: status === "ACTIVE" ? "pulse-led 2s ease-in-out infinite" : "none",
  };
}

// ─── Typography helpers ───────────────────────────────────────────────────────
export const monoLabel: React.CSSProperties = {
  fontFamily: font.mono,
  fontSize: fontSize.label,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted-foreground)",
};

export const displayTitle: React.CSSProperties = {
  fontFamily: font.display,
  fontSize: fontSize.title,
  letterSpacing: "0.05em",
  color: "var(--color-foreground)",
};

export const pageHeading: React.CSSProperties = {
  fontFamily: font.display,
  fontSize: fontSize.heading,
  letterSpacing: "0.04em",
  lineHeight: 1,
  color: "var(--color-foreground)",
  margin: 0,
};

// ─── z-index scale ────────────────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ─── Breakpoints (matches Tailwind defaults) ──────────────────────────────────
export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
