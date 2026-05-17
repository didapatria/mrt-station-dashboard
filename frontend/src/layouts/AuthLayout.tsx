import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";

const MRT_STATIONS = [
  "Lebak Bulus Grab",
  "Fatmawati",
  "Cipete Raya",
  "Haji Nawi",
  "Blok A",
  "Blok M BCA",
  "ASEAN",
  "Senayan",
  "Istora Mandiri",
  "Bendungan Hilir",
  "Setiabudi Astra",
  "Dukuh Atas BNI",
  "Bundaran HI",
];

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col"
        style={{
          background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 50%, #091525 100%)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glowing orb */}
        <div
          className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-8 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo area */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(59, 130, 246, 0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l4-8 4 4 4-6 4 10" />
                <circle cx="3" cy="17" r="1.5" fill="white" stroke="none" />
                <circle cx="19" cy="17" r="1.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(148, 163, 184, 0.9)",
              }}
            >
              MRT Jakarta
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="mt-auto mb-auto pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(52px, 5.5vw, 72px)",
                lineHeight: 0.95,
                color: "white",
                letterSpacing: "-0.01em",
                marginBottom: 16,
              }}
            >
              STATION
              <br />
              <span style={{ color: "#3b82f6" }}>MANAGEMENT</span>
              <br />
              DASHBOARD
            </h1>
            <p
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                color: "rgba(148, 163, 184, 0.7)",
                letterSpacing: "0.04em",
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              Operational control for MRT Jakarta's North–South corridor.
              Monitor stations, schedules, and real-time service status.
            </p>
          </motion.div>

          {/* MRT Line diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: 8 }}
          >
            {/* SVG Line */}
            <div style={{ paddingTop: 4, flexShrink: 0 }}>
              <svg width="16" height={MRT_STATIONS.length * 28} viewBox={`0 0 16 ${MRT_STATIONS.length * 28}`}>
                {/* Track line */}
                <line
                  x1="8" y1="8"
                  x2="8" y2={MRT_STATIONS.length * 28 - 8}
                  stroke="#1e3a5f"
                  strokeWidth="2"
                />
                <line
                  className="mrt-line"
                  x1="8" y1="8"
                  x2="8" y2={MRT_STATIONS.length * 28 - 8}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Station dots */}
                {MRT_STATIONS.map((_, i) => (
                  <circle
                    key={i}
                    cx="8"
                    cy={8 + i * 28}
                    r={i === 0 || i === MRT_STATIONS.length - 1 ? 5 : 3.5}
                    fill={i === 0 || i === MRT_STATIONS.length - 1 ? "#3b82f6" : "#0a1628"}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className={i % 3 === 0 ? "station-dot" : ""}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </svg>
            </div>

            {/* Station names */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {MRT_STATIONS.map((station, i) => (
                <div
                  key={station}
                  style={{
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    opacity: i % 2 === 0 ? 0.85 : 0.45,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      color: i === 0 || i === MRT_STATIONS.length - 1 ? "#60a5fa" : "rgba(148, 163, 184, 0.8)",
                      letterSpacing: "0.04em",
                      fontWeight: i === 0 || i === MRT_STATIONS.length - 1 ? 600 : 400,
                    }}
                  >
                    {station.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(148, 163, 184, 0.3)",
              letterSpacing: "0.06em",
              paddingTop: 20,
            }}
          >
            JAKARTA MRT · N–S LINE · {new Date().getFullYear()}
          </motion.p>
        </div>
      </div>

      {/* Right side — auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
