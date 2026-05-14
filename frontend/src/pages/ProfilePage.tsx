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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    "Playwright (72 E2E)",
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("profile.title")}
        </h2>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {profileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0",
                        }}
                      >
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                            {item.label}
                          </p>
                          <p className="text-sm font-medium">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {preferencesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.5rem 0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <Badge variant="outline">{item.value}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                  <Shield className="h-4 w-4" />
                  Permissions
                </CardTitle>
                <CardDescription>{permissions.length} permissions granted</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs font-mono">
                      {perm}
                    </Badge>
                  ))}
                  {permissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No permissions assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Change Password */}
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
                  <Lock className="h-4 w-4" />
                  {t("profile.changePassword")}
                </CardTitle>
                <CardDescription>{t("profile.updatePassword")}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <form
                  onSubmit={handleSubmit(onPasswordChange)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {t("profile.currentPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        {...register("currentPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10"
                        tabIndex={-1}
                        onClick={() => setShowCurrent(!showCurrent)}
                      >
                        {showCurrent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-xs text-destructive">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("profile.newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        {...register("newPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10"
                        tabIndex={-1}
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-destructive">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("profile.confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting
                      ? t("profile.changing")
                      : t("profile.changePassword")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("profile.techStack")}
                </CardTitle>
                <CardDescription>
                  {frontendStack.length +
                    backendStack.length +
                    infraStack.length +
                    testingStack.length}{" "}
                  technologies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="frontend">
                  <TabsList className="mb-4 w-full">
                    <TabsTrigger value="frontend" className="flex-1">
                      Frontend
                    </TabsTrigger>
                    <TabsTrigger value="backend" className="flex-1">
                      Backend
                    </TabsTrigger>
                    <TabsTrigger value="infra" className="flex-1">
                      Infra
                    </TabsTrigger>
                    <TabsTrigger value="testing" className="flex-1">
                      Testing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="frontend">
                    <div className="flex flex-wrap gap-2">
                      {frontendStack.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="backend">
                    <div className="flex flex-wrap gap-2">
                      {backendStack.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="infra">
                    <div className="flex flex-wrap gap-2">
                      {infraStack.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="testing">
                    <div className="flex flex-wrap gap-2">
                      {testingStack.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
