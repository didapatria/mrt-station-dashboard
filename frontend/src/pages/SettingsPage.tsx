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

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  };

  const cardWithAccent: React.CSSProperties = {
    ...cardStyle,
    borderLeft: "3px solid transparent",
    borderImage:
      "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.2) 100%) 1",
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: "18px 24px 14px",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    letterSpacing: "0.05em",
    color: "var(--color-foreground)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const cardSubtitleStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.08em",
    color: "var(--color-muted-foreground)",
  };

  const settingRowStyle: React.CSSProperties = {
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--color-border)",
    transition: "all 0.12s ease",
  };

  const settingLabelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--color-muted-foreground)",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36,
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: "var(--color-foreground)",
            margin: 0,
          }}
        >
          SETTINGS
        </h2>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: "0.1em",
            color: "var(--color-muted-foreground)",
            marginTop: 4,
          }}
        >
          System Configuration · Preferences
        </p>
        <div
          style={{
            marginTop: 16,
            height: 1,
            background:
              "linear-gradient(90deg, var(--color-border) 0%, transparent 80%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {/* Language */}
        <div style={cardWithAccent}>
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
            }}
          />
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <Globe size={15} />
              LANGUAGE
            </div>
            <div style={cardSubtitleStyle}>Localization settings</div>
          </div>
          <div style={settingRowStyle}>
            <span style={settingLabelStyle}>Active Language</span>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger
                style={{
                  width: 160,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    English
                  </span>
                </SelectItem>
                <SelectItem value="id">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    Indonesia
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Appearance */}
        <div style={cardWithAccent}>
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
            }}
          />
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <Palette size={15} />
              APPEARANCE
            </div>
            <div style={cardSubtitleStyle}>Customize the look and feel</div>
          </div>
          <div style={settingRowStyle}>
            <span style={settingLabelStyle}>Color Theme</span>
            <Select value={theme} onValueChange={() => toggleTheme()}>
              <SelectTrigger
                style={{
                  width: 160,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    Light
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    Dark
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications */}
        <div style={cardWithAccent}>
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
            }}
          />
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <Bell size={15} />
              NOTIFICATIONS
            </div>
            <div style={cardSubtitleStyle}>
              Real-time notification preferences
            </div>
          </div>
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Real-time Updates</div>
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 11,
                  color: "var(--color-muted-foreground)",
                  marginTop: 2,
                }}
              >
                Receive notifications via SSE when data changes
              </div>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                color: "var(--color-success, #22c55e)",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              ENABLED
            </span>
          </div>
        </div>

        {/* About */}
        <div style={cardWithAccent}>
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
            }}
          />
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <Monitor size={15} />
              ABOUT
            </div>
            <div style={cardSubtitleStyle}>System information</div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
            }}
          >
            {[
              { key: "VERSION", value: "2.11.0" },
              { key: "FRONTEND", value: "React 19 + Vite 8 + Tailwind 4" },
              { key: "BACKEND", value: "Express.js 5 + TypeScript" },
              { key: "DATABASE", value: "PostgreSQL + Prisma ORM" },
              { key: "AUTH", value: "JWT + Google OAuth" },
              { key: "E2E TESTS", value: "93 Playwright tests" },
            ].map(({ key, value }, idx, arr) => (
              <div
                key={key}
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom:
                    idx < arr.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                  transition: "all 0.12s ease",
                }}
              >
                <span style={settingLabelStyle}>{key}</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    color: "var(--color-foreground)",
                    background: "rgba(29,111,232,0.08)",
                    border: "1px solid rgba(29,111,232,0.15)",
                    borderRadius: 3,
                    padding: "3px 10px",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
