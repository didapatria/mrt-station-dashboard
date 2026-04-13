import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20 mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">{t("notFound.title")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("notFound.description")}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("notFound.goBack")}
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            <Home className="h-4 w-4 mr-2" />
            {t("notFound.dashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
