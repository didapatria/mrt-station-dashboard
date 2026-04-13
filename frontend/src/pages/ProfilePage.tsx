import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
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
  const { t } = useTranslation();
  const { user } = useAuthStore();
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
      toast.success("Password changed successfully");
      reset();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.response?.data?.error || "Failed to change password";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileItems = [
    { icon: User, label: "Full Name", value: user.name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Shield, label: "Role", value: user.role },
    {
      icon: Calendar,
      label: t("profile.memberSince"),
      value: new Date(user.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  const frontendStack = [
    "React 19", "TypeScript", "Vite", "TanStack Query", "Zustand",
    "Tailwind CSS 4", "Shadcn UI", "React Hook Form", "Zod",
    "Framer Motion", "React Router v7", "Axios", "Recharts", "Leaflet",
  ];
  const backendStack = [
    "Node.js", "Express.js 5", "TypeScript", "Prisma ORM",
    "PostgreSQL", "JWT", "Zod", "Swagger/OpenAPI",
  ];
  const infraStack = ["Docker", "docker-compose", "Nginx", "GitHub Actions"];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h2>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-6"
      >
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-4">
              {profileItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4 py-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("profile.changePassword")}
            </CardTitle>
            <CardDescription>{t("profile.updatePassword")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
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
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
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
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting ? t("profile.changing") : t("profile.changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("profile.techStack")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="frontend">
              <TabsList className="mb-4">
                <TabsTrigger value="frontend">Frontend</TabsTrigger>
                <TabsTrigger value="backend">Backend</TabsTrigger>
                <TabsTrigger value="infra">Infrastructure</TabsTrigger>
              </TabsList>
              <TabsContent value="frontend">
                <div className="flex flex-wrap gap-2">
                  {frontendStack.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
              </TabsContent>
              <TabsContent value="backend">
                <div className="flex flex-wrap gap-2">
                  {backendStack.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
              </TabsContent>
              <TabsContent value="infra">
                <div className="flex flex-wrap gap-2">
                  {infraStack.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
