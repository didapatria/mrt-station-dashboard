import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      <div className="not-found-bg" />

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
        <span className="not-found-bracket not-found-bracket--tl" />
        <span className="not-found-bracket not-found-bracket--tr" />
        <span className="not-found-bracket not-found-bracket--bl" />
        <span className="not-found-bracket not-found-bracket--br" />

        {/* 404 with blur glow behind */}
        <div style={{ position: "relative", lineHeight: 1 }}>
          <div className="not-found-404-ghost">404</div>
          <div className="not-found-404-text">404</div>
        </div>

        <div className="not-found-route-label">ROUTE NOT FOUND</div>

        <div className="not-found-separator" />

        <p className="not-found-desc">
          The requested station is not on this line.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate(-1)}
            className="not-found-btn-outline"
          >
            {t("notFound.goBack")
              ? `\u2190 ${t("notFound.goBack").toUpperCase()}`
              : "\u2190 BACK"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="not-found-btn-primary"
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
