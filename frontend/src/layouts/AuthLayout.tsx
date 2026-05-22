import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ACCENT = "#1d6fe8";

// Static list — station endpoint requires auth and this layout is public-only
const ROUTE_STATIONS = [
  "Lebak Bulus Bank Syariah Indonesia",
  "Fatmawati Indomaret",
  "Cipete Raya Tuku",
  "Haji Nawi",
  "Blok A",
  "Blok M BCA",
  "ASEAN Headquarters",
  "Senayan Mastercard",
  "Istora Mandiri",
  "Bendungan Hilir",
  "Setiabudi Astra",
  "Dukuh Atas BNI",
  "Bundaran HI Bank Jakarta",
];

export default function AuthLayout() {
  const { token } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (token) return <Navigate to="/dashboard" replace />;

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");

  const p = isDark
    ? {
        bg: "#05090f",
        gridOpacity: 0.018,
        logoText: "rgba(148,163,184,0.65)",
        clockText: "rgba(148,163,184,0.45)",
        headlineMain: "white",
        headlineStroke: "rgba(29,111,232,0.65)",
        subtitleText: "rgba(148,163,184,0.4)",
        chipBg: "rgba(255,255,255,0.03)",
        chipBorder: "rgba(255,255,255,0.07)",
        chipLabel: "rgba(148,163,184,0.35)",
        chipValue: "rgba(226,232,240,0.8)",
        svgBgLine: "#0b1826",
        terminalStation: "#60a5fa",
        midStation: "rgba(148,163,184,0.55)",
        footerBorder: "rgba(255,255,255,0.04)",
        footerText: "rgba(148,163,184,0.18)",
        footerVersion: "rgba(29,111,232,0.3)",
      }
    : {
        bg: "oklch(0.962 0.01 248)",
        gridOpacity: 0.045,
        logoText: "rgba(30,58,92,0.7)",
        clockText: "rgba(51,65,85,0.55)",
        headlineMain: "#0f172a",
        headlineStroke: "rgba(29,111,232,0.55)",
        subtitleText: "rgba(71,85,105,0.55)",
        chipBg: "rgba(29,111,232,0.04)",
        chipBorder: "rgba(29,111,232,0.12)",
        chipLabel: "rgba(51,65,85,0.5)",
        chipValue: "rgba(15,23,42,0.85)",
        svgBgLine: "#d1dff5",
        terminalStation: "#1d6fe8",
        midStation: "rgba(51,65,85,0.55)",
        footerBorder: "rgba(0,0,0,0.07)",
        footerText: "rgba(51,65,85,0.35)",
        footerVersion: "rgba(29,111,232,0.5)",
      };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex w-[48%] relative overflow-hidden flex-col transition-[background] duration-300 border-r border-[rgba(29,111,232,0.12)]"
        style={{ background: p.bg }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: p.gridOpacity,
            backgroundImage: `linear-gradient(${ACCENT} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Scanline overlay (dark only) */}
        {isDark && <div className="auth-scanlines" />}

        {/* Glow top-left */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(29,111,232,${isDark ? "0.09" : "0.06"}) 0%, transparent 70%)`,
          }}
        />

        {/* Corner brackets */}
        {[
          { top: 20, left: 20, borderTop: true, borderLeft: true },
          { top: 20, right: 20, borderTop: true, borderRight: true },
          { bottom: 20, left: 20, borderBottom: true, borderLeft: true },
          { bottom: 20, right: 20, borderBottom: true, borderRight: true },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
              width: 28,
              height: 28,
              ...(pos.borderTop && {
                borderTop: `1.5px solid rgba(29,111,232,${isDark ? "0.5" : "0.35"})`,
              }),
              ...(pos.borderBottom && {
                borderBottom: `1.5px solid rgba(29,111,232,${isDark ? "0.5" : "0.35"})`,
              }),
              ...(pos.borderLeft && {
                borderLeft: `1.5px solid rgba(29,111,232,${isDark ? "0.5" : "0.35"})`,
              }),
              ...(pos.borderRight && {
                borderRight: `1.5px solid rgba(29,111,232,${isDark ? "0.5" : "0.35"})`,
              }),
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-[36px_40px]">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-11"
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7.5 h-7.5 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
                  boxShadow: `0 0 18px rgba(29,111,232,${isDark ? "0.4" : "0.25"})`,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 17l4-8 4 4 4-6 4 10" />
                </svg>
              </div>
              <span
                className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: p.logoText }}
              >
                MRT JAKARTA
              </span>
            </div>

            {/* Status + Clock */}
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.22)] rounded-[3px] px-2 py-0.75">
                <span className="auth-status-dot" />
                <span className="font-mono text-[8.5px] text-[#10b981] tracking-[0.14em]">
                  OPERATIONAL
                </span>
              </div>
              <span
                className="font-mono text-[13px] tracking-[0.08em] tabular-nums"
                style={{ color: p.clockText }}
              >
                {hh}
                <span className="auth-clock-colon">:</span>
                {mm}
                <span className="auth-clock-colon">:</span>
                {ss}
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mb-2"
          >
            <div className="font-display leading-[0.9] tracking-[0.03em] mb-4 text-[clamp(54px,5.8vw,76px)]">
              <span className="block" style={{ color: p.headlineMain }}>
                STATION
              </span>
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: `1.5px ${p.headlineStroke}`,
                  display: "block",
                }}
              >
                CONTROL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-px w-5 opacity-70"
                style={{ background: ACCENT }}
              />
              <span
                className="font-mono text-[9.5px] tracking-[0.14em] uppercase"
                style={{ color: p.subtitleText }}
              >
                North–South Line · {ROUTE_STATIONS.length} Stations
              </span>
            </div>
          </motion.div>

          {/* Stat chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex gap-2 mb-6 mt-5 flex-wrap"
          >
            {[
              { label: "STATIONS", value: String(ROUTE_STATIONS.length) },
              { label: "STATUS", value: "ACTIVE" },
              { label: "LINE", value: "N–S" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded px-2.5 py-1.25 flex flex-col gap-px"
                style={{
                  background: p.chipBg,
                  border: `1px solid ${p.chipBorder}`,
                }}
              >
                <span
                  className="font-mono text-[8px] tracking-[0.14em]"
                  style={{ color: p.chipLabel }}
                >
                  {label}
                </span>
                <span
                  className="font-mono text-[12px] font-semibold tracking-[0.06em]"
                  style={{ color: p.chipValue }}
                >
                  {value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Route diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-4.5 items-start flex-1 overflow-hidden"
          >
            {/* SVG line */}
            <div className="pt-1 shrink-0">
              <svg
                width="16"
                height={ROUTE_STATIONS.length * 20}
                viewBox={`0 0 16 ${ROUTE_STATIONS.length * 20}`}
              >
                <line
                  x1="8"
                  y1="6"
                  x2="8"
                  y2={ROUTE_STATIONS.length * 20 - 6}
                  stroke={p.svgBgLine}
                  strokeWidth="2"
                />
                <line
                  className="mrt-line"
                  x1="8"
                  y1="6"
                  x2="8"
                  y2={ROUTE_STATIONS.length * 20 - 6}
                  stroke={ACCENT}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {ROUTE_STATIONS.map((_, i) => (
                  <circle
                    key={i}
                    cx="8"
                    cy={6 + i * 20}
                    r={i === 0 || i === ROUTE_STATIONS.length - 1 ? 4.5 : 3}
                    fill={
                      i === 0 || i === ROUTE_STATIONS.length - 1 ? ACCENT : p.bg
                    }
                    stroke={ACCENT}
                    strokeWidth="2"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </svg>
            </div>

            {/* Station names */}
            <div className="flex flex-col flex-1">
              {ROUTE_STATIONS.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.5 + i * 0.045 }}
                  className="h-5 flex items-center justify-between pr-1"
                >
                  <span
                    className="font-mono text-[10px] tracking-[0.05em]"
                    style={{
                      color:
                        i === 0 || i === ROUTE_STATIONS.length - 1
                          ? p.terminalStation
                          : p.midStation,
                      fontWeight:
                        i === 0 || i === ROUTE_STATIONS.length - 1 ? 600 : 400,
                    }}
                  >
                    {name.toUpperCase()}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full bg-[#10b981] shrink-0 shadow-[0_0_4px_rgba(16,185,129,0.45)]"
                    style={{ opacity: isDark ? 0.55 : 0.7 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 }}
            className="flex items-center justify-between pt-5 mt-4"
            style={{ borderTop: `1px solid ${p.footerBorder}` }}
          >
            <span
              className="font-mono text-[9px] tracking-widest"
              style={{ color: p.footerText }}
            >
              JAKARTA MRT · N–S LINE · {new Date().getFullYear()}
            </span>
            <span
              className="font-mono text-[9px] tracking-[0.08em]"
              style={{ color: p.footerVersion }}
            >
              v2.14.0
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 bg-background relative">
        {/* Subtle center glow */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(29,111,232,0.04)_0%,transparent_70%)]"
        />

        {/* Theme toggle — top right (desktop only; mobile handled per-page) */}
        <div className="hidden lg:block absolute top-4 right-4 z-10 text-foreground">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-100 relative z-1"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
