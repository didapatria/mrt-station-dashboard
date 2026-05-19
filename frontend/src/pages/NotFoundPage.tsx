import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-6">
      <div className="not-found-bg" />

      <div className="relative flex flex-col items-center text-center p-[52px_64px] max-w-120 w-full">
        {/* Corner brackets */}
        <span className="not-found-bracket not-found-bracket--tl" />
        <span className="not-found-bracket not-found-bracket--tr" />
        <span className="not-found-bracket not-found-bracket--bl" />
        <span className="not-found-bracket not-found-bracket--br" />

        {/* 404 with blur glow behind */}
        <div className="relative leading-none">
          <div className="not-found-404-ghost">404</div>
          <div className="not-found-404-text">404</div>
        </div>

        <div className="not-found-route-label">ROUTE NOT FOUND</div>

        <div className="not-found-separator" />

        <p className="not-found-desc">
          The requested station is not on this line.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
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
