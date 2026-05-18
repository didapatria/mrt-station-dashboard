import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const MRT_STATIONS = [
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

const ACCENT = "#1d6fe8";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--color-background)",
      }}
    >
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "48%",
          background: p.bg,
          position: "relative",
          overflow: "hidden",
          borderRight: `1px solid rgba(29,111,232,0.12)`,
          flexDirection: "column",
          transition: "background 0.3s ease",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: p.gridOpacity,
            backgroundImage: `linear-gradient(${ACCENT} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            pointerEvents: "none",
          }}
        />

        {/* Scanline overlay (dark only) */}
        {isDark && <div className="auth-scanlines" />}

        {/* Glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(29,111,232,${isDark ? "0.09" : "0.06"}) 0%, transparent 70%)`,
            pointerEvents: "none",
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
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "36px 40px",
          }}
        >
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 44,
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 18px rgba(29,111,232,${isDark ? "0.4" : "0.25"})`,
                  flexShrink: 0,
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
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: p.logoText,
                  textTransform: "uppercase",
                }}
              >
                MRT JAKARTA
              </span>
            </div>

            {/* Status + Clock */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(16,185,129,0.07)",
                  border: "1px solid rgba(16,185,129,0.22)",
                  borderRadius: 3,
                  padding: "3px 8px",
                }}
              >
                <span className="auth-status-dot" />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 8.5,
                    color: "#10b981",
                    letterSpacing: "0.14em",
                  }}
                >
                  OPERATIONAL
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: p.clockText,
                  letterSpacing: "0.08em",
                  fontVariantNumeric: "tabular-nums",
                }}
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
            style={{ marginBottom: 8 }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(54px, 5.8vw, 76px)",
                lineHeight: 0.9,
                letterSpacing: "0.03em",
                marginBottom: 16,
              }}
            >
              <span style={{ color: p.headlineMain, display: "block" }}>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  height: 1,
                  width: 20,
                  background: ACCENT,
                  opacity: 0.7,
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  color: p.subtitleText,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                North–South Line · 13 Stations
              </span>
            </div>
          </motion.div>

          {/* Stat chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "STATIONS", value: "13" },
              { label: "STATUS", value: "ACTIVE" },
              { label: "LINE", value: "N–S" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: p.chipBg,
                  border: `1px solid ${p.chipBorder}`,
                  borderRadius: 4,
                  padding: "5px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 8,
                    color: p.chipLabel,
                    letterSpacing: "0.14em",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: p.chipValue,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
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
            style={{
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {/* SVG line */}
            <div style={{ paddingTop: 4, flexShrink: 0 }}>
              <svg
                width="16"
                height={MRT_STATIONS.length * 20}
                viewBox={`0 0 16 ${MRT_STATIONS.length * 20}`}
              >
                <line
                  x1="8"
                  y1="6"
                  x2="8"
                  y2={MRT_STATIONS.length * 20 - 6}
                  stroke={p.svgBgLine}
                  strokeWidth="2"
                />
                <line
                  className="mrt-line"
                  x1="8"
                  y1="6"
                  x2="8"
                  y2={MRT_STATIONS.length * 20 - 6}
                  stroke={ACCENT}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {MRT_STATIONS.map((_, i) => (
                  <circle
                    key={i}
                    cx="8"
                    cy={6 + i * 20}
                    r={i === 0 || i === MRT_STATIONS.length - 1 ? 4.5 : 3}
                    fill={
                      i === 0 || i === MRT_STATIONS.length - 1 ? ACCENT : p.bg
                    }
                    stroke={ACCENT}
                    strokeWidth="2"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </svg>
            </div>

            {/* Station names */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                flex: 1,
              }}
            >
              {MRT_STATIONS.map((station, i) => (
                <motion.div
                  key={station}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.5 + i * 0.045 }}
                  style={{
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingRight: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color:
                        i === 0 || i === MRT_STATIONS.length - 1
                          ? p.terminalStation
                          : p.midStation,
                      letterSpacing: "0.05em",
                      fontWeight:
                        i === 0 || i === MRT_STATIONS.length - 1 ? 600 : 400,
                    }}
                  >
                    {station.toUpperCase()}
                  </span>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#10b981",
                      opacity: isDark ? 0.55 : 0.7,
                      flexShrink: 0,
                      boxShadow: "0 0 4px rgba(16,185,129,0.45)",
                    }}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 20,
              borderTop: `1px solid ${p.footerBorder}`,
              marginTop: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: p.footerText,
                letterSpacing: "0.1em",
              }}
            >
              JAKARTA MRT · N–S LINE · {new Date().getFullYear()}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: p.footerVersion,
                letterSpacing: "0.08em",
              }}
            >
              v2.13.0
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 2rem",
          background: "var(--color-background)",
          position: "relative",
        }}
      >
        {/* Subtle center glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,111,232,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Theme toggle — top right (desktop only; mobile handled per-page) */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            color: "var(--color-foreground)",
          }}
        >
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          style={{
            width: "100%",
            maxWidth: 400,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
