import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Palette, Bell, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/store/theme.store";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PageHeader } from "@/components/PageHeader";
import { OpsCard } from "@/components/OpsCard";

export default function SettingsPage() {
  usePageMeta({ title: "Settings", path: "/settings" });
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div>
      <PageHeader
        title="SETTINGS"
        subtitle="System Configuration · Preferences"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-grid"
      >
        {/* Language */}
        <OpsCard
          title="LANGUAGE"
          subtitle="Localization settings"
          icon={<Globe size={15} />}
        >
          <div className="ops-setting-row">
            <span className="ops-mono-label">Active Language</span>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-40 font-mono text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <span className="font-mono text-[11px]">English</span>
                </SelectItem>
                <SelectItem value="id">
                  <span className="font-mono text-[11px]">Indonesia</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </OpsCard>

        {/* Appearance */}
        <OpsCard
          title="APPEARANCE"
          subtitle="Customize the look and feel"
          icon={<Palette size={15} />}
        >
          <div className="ops-setting-row">
            <span className="ops-mono-label">Color Theme</span>
            <Select value={theme} onValueChange={() => toggleTheme()}>
              <SelectTrigger className="w-40 font-mono text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <span className="font-mono text-[11px]">Light</span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="font-mono text-[11px]">Dark</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </OpsCard>

        {/* Notifications */}
        <OpsCard
          title="NOTIFICATIONS"
          subtitle="Real-time notification preferences"
          icon={<Bell size={15} />}
        >
          <div className="ops-setting-row">
            <div>
              <div className="ops-mono-label">Real-time Updates</div>
              <div className="text-muted-foreground font-['Sora',sans-serif] text-[11px] mt-0.5">
                Receive notifications via SSE when data changes
              </div>
            </div>
            <span className="ops-status-active">ENABLED</span>
          </div>
        </OpsCard>

        {/* About */}
        <OpsCard
          title="ABOUT"
          subtitle="System information"
          icon={<Monitor size={15} />}
        >
          <div>
            {[
              { key: "VERSION", value: "2.13.0" },
              { key: "FRONTEND", value: "React 19 + Vite 8 + Tailwind 4" },
              { key: "BACKEND", value: "Express.js 5 + TypeScript" },
              { key: "DATABASE", value: "PostgreSQL + Prisma ORM" },
              { key: "AUTH", value: "JWT + Google OAuth" },
              { key: "E2E TESTS", value: "112 Playwright tests" },
            ].map(({ key, value }) => (
              <div key={key} className="ops-data-row">
                <span className="ops-mono-label">{key}</span>
                <span className="ops-value-badge">{value}</span>
              </div>
            ))}
          </div>
        </OpsCard>
      </motion.div>
    </div>
  );
}
