import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bracketStyle: React.CSSProperties = {
    position: "absolute",
    width: 20,
    height: 20,
    opacity: 0.35,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "0 24px",
      }}
    >
      {/* Animated diagonal background */}
      <style>{`
        @keyframes bg-shift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(135deg, #050d1a 0%, #070c14 40%, #060a12 60%, #050d1a 100%)",
          backgroundSize: "400% 400%",
          animation: "bg-shift 15s ease infinite alternate",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "52px 64px",
          maxWidth: 480,
          width: "100%",
        }}
      >
        {/* Corner brackets */}
        <span
          style={{
            ...bracketStyle,
            top: 0,
            left: 0,
            borderTop: "1.5px solid rgba(29,111,232,0.5)",
            borderLeft: "1.5px solid rgba(29,111,232,0.5)",
          }}
        />
        <span
          style={{
            ...bracketStyle,
            top: 0,
            right: 0,
            borderTop: "1.5px solid rgba(29,111,232,0.5)",
            borderRight: "1.5px solid rgba(29,111,232,0.5)",
          }}
        />
        <span
          style={{
            ...bracketStyle,
            bottom: 0,
            left: 0,
            borderBottom: "1.5px solid rgba(29,111,232,0.5)",
            borderLeft: "1.5px solid rgba(29,111,232,0.5)",
          }}
        />
        <span
          style={{
            ...bracketStyle,
            bottom: 0,
            right: 0,
            borderBottom: "1.5px solid rgba(29,111,232,0.5)",
            borderRight: "1.5px solid rgba(29,111,232,0.5)",
          }}
        />

        {/* 404 with blur glow behind */}
        <div style={{ position: "relative", lineHeight: 1 }}>
          {/* Ghost blur layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "clamp(80px, 15vw, 140px)",
              fontFamily: "'Bebas Neue', sans-serif",
              color: "rgba(29,111,232,0.06)",
              filter: "blur(20px)",
              userSelect: "none",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            404
          </div>
          {/* Actual 404 text */}
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(80px, 15vw, 140px)",
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(29,111,232,0.5)",
              letterSpacing: "0.05em",
              userSelect: "none",
            }}
          >
            404
          </div>
        </div>

        {/* Route not found */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
            marginTop: 8,
          }}
        >
          ROUTE NOT FOUND
        </div>

        {/* Separator line */}
        <div
          style={{
            width: "100%",
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(29,111,232,0.3), transparent)",
            margin: "20px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -2,
              left: "50%",
              transform: "translateX(-50%)",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(29,111,232,0.5)",
            }}
          />
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.06em",
            marginBottom: 32,
          }}
        >
          The requested station is not on this line.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              padding: "9px 20px",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-foreground)",
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(29,111,232,0.4)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(29,111,232,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--color-border)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            {t("notFound.goBack")
              ? `\u2190 ${t("notFound.goBack").toUpperCase()}`
              : "\u2190 BACK"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              padding: "9px 20px",
              borderRadius: 6,
              border: "none",
              background: "#3b82f6",
              color: "white",
              cursor: "pointer",
              transition: "box-shadow 0.15s, background 0.15s",
              boxShadow: "0 0 12px rgba(59,130,246,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px rgba(59,130,246,0.4)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#2563eb";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 12px rgba(59,130,246,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#3b82f6";
            }}
          >
            {t("notFound.dashboard")
              ? t("notFound.dashboard").toUpperCase()
              : "DASHBOARD"}
          </button>
        </div>
      </div>
    </div>
  );
}
