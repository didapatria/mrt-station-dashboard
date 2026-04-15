import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { useLogin, useGoogleLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Train, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch { /* handled by mutation */ }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLoginMutation.mutateAsync(credentialResponse.credential);
      navigate("/dashboard");
    } catch { /* handled by mutation */ }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = loginMutation.error ? (loginMutation.error as any)?.response?.data?.error || loginMutation.error.message : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleError = googleLoginMutation.error ? (googleLoginMutation.error as any)?.response?.data?.error || googleLoginMutation.error.message : null;

  return (
    <>
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <Train className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">MRT Jakarta</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.signIn")}</CardTitle>
          <CardDescription>{t("auth.enterCredentials")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" onClick={() => loginMutation.reset()}>{errorMessage}</div>}
            {googleError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" onClick={() => googleLoginMutation.reset()}>{googleError}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="admin@mrtjakarta.co.id" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...register("password")} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>

          <div className="my-4" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase">{t("auth.orContinueWith")}</span>
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
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary hover:underline">{t("auth.signUp")}</Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
