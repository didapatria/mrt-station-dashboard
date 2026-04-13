import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Train } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch { /* handled by mutation */ }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = loginMutation.error ? (loginMutation.error as any)?.response?.data?.error || loginMutation.error.message : null;

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
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="admin@mrtjakarta.co.id" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link to="/register" className="text-primary hover:underline">{t("auth.signUp")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
