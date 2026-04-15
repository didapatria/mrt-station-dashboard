import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathToKey: Record<string, string> = {
  dashboard: "nav.dashboard",
  stations: "nav.stations",
  schedules: "nav.schedules",
  map: "nav.stationMap",
  "route-planner": "nav.routePlanner",
  compare: "nav.compare",
  users: "nav.users",
  activity: "nav.activityLog",
  settings: "nav.settings",
  changelog: "nav.changelog",
  access: "nav.accessManagement",
  profile: "nav.profile",
};

export function PageBreadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            {t("nav.dashboard")}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && segments[0] !== "dashboard" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t(pathToKey[segments[0]] || segments[0])}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
