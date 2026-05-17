import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Palette,
  Bell,
  Monitor,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { usePermission } from "@/hooks/use-permission";
import { authService } from "@/services/auth.service";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const chipStyle: React.CSSProperties = {
  background: "rgba(59,130,246,0.1)",
  border: "1px solid rgba(59,130,246,0.2)",
  borderRadius: 3,
  padding: "3px 8px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9.5,
  color: "#60a5fa",
};

const permChipStyle: React.CSSProperties = {
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(59,130,246,0.18)",
  borderRadius: 3,
  padding: "3px 8px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  color: "#60a5fa",
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  overflow: "hidden",
};

const cardHeaderStyle: React.CSSProperties = {
  padding: "18px 24px 14px",
  borderBottom: "1px solid var(--color-border)",
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
  marginTop: 4,
};

const monoLabelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--color-muted-foreground)",
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { permissions } = usePermission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  if (!user) return null;

  const onPasswordChange = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t("profile.passwordChanged"));
      reset();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const msg = err?.response?.data?.error || "Failed to change password";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileItems = [
    { icon: User, label: t("auth.name"), value: user.name },
    { icon: Mail, label: t("auth.email"), value: user.email },
    { icon: Shield, label: "Role", value: user.role },
    {
      icon: Calendar,
      label: t("profile.memberSince"),
      value: new Date(user.createdAt).toLocaleDateString(
        i18n.language === "id" ? "id-ID" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      ),
    },
  ];

  const preferencesItems = [
    {
      icon: Globe,
      label: t("nav.menu") + " Language",
      value: i18n.language === "id" ? "Indonesia" : "English",
    },
    {
      icon: Palette,
      label: "Theme",
      value: theme === "dark" ? "Dark" : "Light",
    },
    {
      icon: Monitor,
      label: "Platform",
      value: navigator.userAgent.includes("Mac") ? "macOS" : "Desktop",
    },
    { icon: Bell, label: "Notifications", value: "Real-time (SSE)" },
  ];

  const frontendStack = [
    "React 19",
    "TypeScript",
    "Vite 8",
    "TanStack Query",
    "Zustand",
    "Tailwind CSS 4",
    "Shadcn UI",
    "React Hook Form",
    "Zod",
    "Framer Motion",
    "React Router v7",
    "Axios",
    "Recharts",
    "Leaflet",
    "react-i18next",
    "jsPDF",
    "react-joyride",
    "Sonner",
    "Google OAuth",
  ];
  const backendStack = [
    "Node.js",
    "Express.js 5",
    "TypeScript",
    "Prisma ORM",
    "PostgreSQL",
    "JWT",
    "bcryptjs",
    "Zod",
    "Swagger/OpenAPI",
    "SSE",
    "Rate Limiting",
    "Helmet",
    "Morgan",
  ];
  const infraStack = [
    "Docker",
    "docker-compose",
    "Fly.io",
    "Supabase",
    "Vercel",
    "GitHub Actions",
    "PWA",
    "Playwright",
  ];
  const testingStack = [
    "Vitest",
    "React Testing Library",
    "Supertest",
    "Playwright (93 E2E)",
  ];

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
          PROFILE
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
          {user.role} · {t("profile.subtitle")}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Profile Info */}
            <div style={cardStyle}>
              <div style={{ ...cardHeaderStyle, padding: "20px 24px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar style={{ width: 64, height: 64 }}>
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 28,
                        letterSpacing: "0.03em",
                        lineHeight: 1.1,
                        color: "var(--color-foreground)",
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 24px 20px" }}>
                {profileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "var(--color-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} style={{ color: "var(--color-muted-foreground)" }} />
                      </div>
                      <div>
                        <div style={monoLabelStyle}>{item.label}</div>
                        <div
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--color-foreground)",
                            marginTop: 1,
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preferences */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>PREFERENCES</div>
                <div style={cardSubtitleStyle}>Current environment settings</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                {preferencesItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 24px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={14} style={{ color: "var(--color-muted-foreground)" }} />
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13 }}>
                          {item.label}
                        </span>
                      </div>
                      <Badge variant="outline">{item.value}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>
                  <Shield size={15} />
                  PERMISSIONS
                </div>
                <div style={cardSubtitleStyle}>{permissions.length} permissions granted</div>
              </div>
              <div style={{ padding: "16px 24px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {permissions.map((perm) => (
                    <span key={perm} style={permChipStyle}>
                      {perm}
                    </span>
                  ))}
                  {permissions.length === 0 && (
                    <p
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 13,
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      No permissions assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Change Password */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>
                  <Lock size={15} />
                  {t("profile.changePassword").toUpperCase()}
                </div>
                <div style={cardSubtitleStyle}>{t("profile.updatePassword")}</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <form onSubmit={handleSubmit(onPasswordChange)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label
                      htmlFor="currentPassword"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      {t("profile.currentPassword")}
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        {...register("currentPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 40 }}
                        tabIndex={-1}
                        onClick={() => setShowCurrent(!showCurrent)}
                      >
                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--color-destructive)" }}>
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label
                      htmlFor="newPassword"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      {t("profile.newPassword")}
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        {...register("newPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 40 }}
                        tabIndex={-1}
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--color-destructive)" }}>
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label
                      htmlFor="confirmPassword"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      {t("profile.confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--color-destructive)" }}>
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting ? t("profile.changing") : t("profile.changePassword")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Tech Stack */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>{t("profile.techStack").toUpperCase()}</div>
                <div style={cardSubtitleStyle}>
                  {frontendStack.length + backendStack.length + infraStack.length + testingStack.length} technologies
                </div>
              </div>
              <div style={{ padding: "16px 24px 20px" }}>
                <Tabs defaultValue="frontend">
                  <TabsList
                    style={{ width: "100%", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <TabsTrigger value="frontend" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                      Frontend
                    </TabsTrigger>
                    <TabsTrigger value="backend" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                      Backend
                    </TabsTrigger>
                    <TabsTrigger value="infra" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                      Infra
                    </TabsTrigger>
                    <TabsTrigger value="testing" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                      Testing
                    </TabsTrigger>
                  </TabsList>
                  {[
                    { value: "frontend", stack: frontendStack },
                    { value: "backend", stack: backendStack },
                    { value: "infra", stack: infraStack },
                    { value: "testing", stack: testingStack },
                  ].map(({ value, stack }) => (
                    <TabsContent key={value} value={value}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {stack.map((tech) => (
                          <span key={tech} style={chipStyle}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
