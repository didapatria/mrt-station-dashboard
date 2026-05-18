import { useState, useRef } from "react";
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
  Camera,
  Loader2,
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
import { useMyPermissions } from "@/hooks/use-permissions";
import { authService } from "@/services/auth.service";
import { useUpdateAvatar } from "@/hooks/use-auth";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PageHeader } from "@/components/PageHeader";

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


export default function ProfilePage() {
  usePageMeta({ title: "Profile", path: "/profile" });
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { permissions } = usePermission();
  useMyPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateAvatarMutation = useUpdateAvatar();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      updateAvatarMutation.mutate(dataUrl, {
        onSuccess: () => toast.success("Avatar updated"),
        onError: () => toast.error("Failed to update avatar"),
      });
    };
    reader.readAsDataURL(file);
  };

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
    "Playwright (112 E2E, GitHub Pages report)",
  ];

  return (
    <div>
      <PageHeader title="PROFILE" subtitle={`${user.role} · ${t("profile.subtitle")}`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          }}
        >
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Profile Info card with avatar gradient treatment */}
            <div
              className="ops-card"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%)"
                  : "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 100%)",
              }}
            >
              <div className="ops-accent-line" />
              <div>
                <div
                  className="ops-card-header"
                  style={{
                    padding: "20px 24px 16px",
                    background: isDark
                      ? "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%)"
                      : "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 100%)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={
                            avatarPreview ||
                            user.avatarUrl ||
                            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                          }
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={updateAvatarMutation.isPending}
                        className="ops-avatar-btn"
                      >
                        {updateAvatarMutation.isPending ? (
                          <Loader2
                            size={10}
                            style={{ color: "white", animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <Camera size={10} style={{ color: "white" }} />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
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
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                        <span className="ops-mono-data">{user.email}</span>
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
                        <div className="ops-icon-box">
                          <Icon
                            size={15}
                            className="text-muted-foreground"
                          />
                        </div>
                        <div>
                          <div className="ops-mono-label">{item.label}</div>
                          <div className="ops-row-value">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <div className="ops-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>PREFERENCES</div>
                <div className="ops-card-subtitle">
                  Current environment settings
                </div>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Icon
                          size={14}
                          style={{ color: "var(--color-muted-foreground)" }}
                        />
                        <span className="ops-station-ref">{item.label}</span>
                      </div>
                      <Badge variant="outline">{item.value}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <div className="ops-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={15} />
                  PERMISSIONS
                </div>
                <div className="ops-card-subtitle">
                  {permissions.length > 0
                    ? `${permissions.length} permissions via role`
                    : "Loading permissions..."}
                </div>
              </div>
              <div style={{ padding: "16px 24px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {permissions.map((perm) => (
                    <span key={perm} className="ops-chip" style={{ fontSize: 9 }}>
                      {perm}
                    </span>
                  ))}
                  {permissions.length === 0 && (
                    <span className="ops-mono-data">Fetching permissions...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Change Password */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <div className="ops-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={15} />
                  {t("profile.changePassword").toUpperCase()}
                </div>
                <div className="ops-card-subtitle">
                  {t("profile.updatePassword")}
                </div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <form
                  onSubmit={handleSubmit(onPasswordChange)}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Label htmlFor="currentPassword" className="ops-form-label">
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
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: 40,
                        }}
                        tabIndex={-1}
                        onClick={() => setShowCurrent(!showCurrent)}
                      >
                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="ops-form-error">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Label htmlFor="newPassword" className="ops-form-label">
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
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: 40,
                        }}
                        tabIndex={-1}
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="ops-form-error">{errors.newPassword.message}</p>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Label htmlFor="confirmPassword" className="ops-form-label">
                      {t("profile.confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="ops-form-error">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="ops-btn-mono"
                  >
                    {isSubmitting
                      ? t("profile.changing")
                      : t("profile.changePassword")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <div className="ops-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {t("profile.techStack").toUpperCase()}
                </div>
                <div className="ops-card-subtitle">
                  {frontendStack.length +
                    backendStack.length +
                    infraStack.length +
                    testingStack.length}{" "}
                  technologies
                </div>
              </div>
              <div style={{ padding: "16px 24px 20px" }}>
                <Tabs defaultValue="frontend">
                  <TabsList
                    style={{
                      width: "100%",
                      marginBottom: 16,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <TabsTrigger
                      value="frontend"
                      style={{
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                      }}
                    >
                      Frontend
                    </TabsTrigger>
                    <TabsTrigger
                      value="backend"
                      style={{
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                      }}
                    >
                      Backend
                    </TabsTrigger>
                    <TabsTrigger
                      value="infra"
                      style={{
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                      }}
                    >
                      Infra
                    </TabsTrigger>
                    <TabsTrigger
                      value="testing"
                      style={{
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                      }}
                    >
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
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {stack.map((tech) => (
                          <span key={tech} className="ops-chip" title={tech}>
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
