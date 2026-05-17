import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { useRegister, useGoogleLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Train, Eye, EyeOff } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate("/dashboard");
    } catch {
      /* handled by mutation */
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLoginMutation.mutateAsync(credentialResponse.credential);
      navigate("/dashboard");
    } catch {
      /* handled by mutation */
    }
  };

  const err = registerMutation.error as {
    response?: { data?: { error?: string } };
  } | null;
  const errorMessage =
    err?.response?.data?.error || registerMutation.error?.message || null;

  type ApiError = { response?: { data?: { error?: string } } };
  const googleError = googleLoginMutation.error
    ? (googleLoginMutation.error as ApiError)?.response?.data?.error ||
      googleLoginMutation.error.message
    : null;

  return (
    <>
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <Train className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">MRT Jakarta</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.signUp")}</CardTitle>
          <CardDescription>{t("auth.registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
                onClick={() => registerMutation.reset()}
              >
                {errorMessage}
              </div>
            )}
            {googleError && (
              <div
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
                onClick={() => googleLoginMutation.reset()}
              >
                {googleError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("auth.confirmPassword") || "Confirm Password"}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? t("auth.creatingAccount")
                : t("auth.signUp")}
            </Button>
          </form>

          <div
            className="my-4"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase">
              {t("auth.orContinueWith")}
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
