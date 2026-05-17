import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Palette, Bell, Monitor } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/store/theme.store";

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle
              className="text-lg"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Globe className="h-4 w-4" />
              Language
            </CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesia</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle
              className="text-lg"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Select value={theme} onValueChange={() => toggleTheme()}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle
              className="text-lg"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>
              Real-time notification preferences
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p className="text-sm font-medium">Real-time Updates</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when data changes via SSE
                </p>
              </div>
              <span className="text-sm text-success font-medium">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle
              className="text-lg"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Monitor className="h-4 w-4" />
              About
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-2 text-sm">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono font-semibold">2.11.0</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">Frontend</span>
              <span>React 19 + Vite 8 + Tailwind 4</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">Backend</span>
              <span>Express.js 5 + TypeScript</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">Database</span>
              <span>PostgreSQL + Prisma ORM</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">Auth</span>
              <span>JWT + Google OAuth</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="text-muted-foreground">E2E Tests</span>
              <span>93 Playwright tests</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
