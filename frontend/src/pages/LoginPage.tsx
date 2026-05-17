import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { useLogin, useGoogleLogin } from "@/hooks/use-auth";
import { Eye, EyeOff, Train } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({
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

  type ApiError = { response?: { data?: { error?: string } } };
  const errorMessage = loginMutation.error
    ? (loginMutation.error as ApiError)?.response?.data?.error ||
      loginMutation.error.message
    : null;
  const googleError = googleLoginMutation.error
    ? (googleLoginMutation.error as ApiError)?.response?.data?.error ||
      googleLoginMutation.error.message
    : null;

  return (
    <>
      {/* Mobile header */}
      <div
        className="lg:hidden"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "linear-gradient(135deg, #1d6fe8, #0ea5e9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(29,111,232,0.4)",
            flexShrink: 0,
          }}
        >
          <Train style={{ width: 14, height: 14, color: "white" }} />
        </div>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20,
            letterSpacing: "0.1em",
            color: "var(--color-foreground)",
          }}
        >
          MRT JAKARTA
        </span>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 40,
            color: "var(--color-foreground)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          {t("auth.signIn")}
        </div>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Enter credentials to access the system
        </p>
      </div>

      {/* Error banners */}
      {errorMessage && (
        <div
          className="auth-error-banner"
          onClick={() => loginMutation.reset()}
          style={{ marginBottom: 24 }}
        >
          {errorMessage}
        </div>
      )}
      {googleError && (
        <div
          className="auth-error-banner"
          onClick={() => googleLoginMutation.reset()}
          style={{ marginBottom: 24 }}
        >
          {googleError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div style={{ marginBottom: 28 }}>
          <label className="auth-label" htmlFor="email">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@mrtjakarta.co.id"
            className="auth-input"
            {...register("email")}
          />
          {errors.email && (
            <p className="auth-field-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 36 }}>
          <label className="auth-label" htmlFor="password">
            {t("auth.password")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              className="auth-input"
              style={{ paddingRight: 42 }}
              {...register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 40,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(148,163,184,0.35)",
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="auth-field-error">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="auth-submit-btn"
        >
          {loginMutation.isPending ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "28px 0",
        }}
      >
        <div
          style={{ flex: 1, height: 1, background: "var(--color-border)" }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.16em",
          }}
        >
          {t("auth.orContinueWith").toUpperCase()}
        </span>
        <div
          style={{ flex: 1, height: 1, background: "var(--color-border)" }}
        />
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {}}
          size="large"
          width="100%"
          text="continue_with"
        />
      </div>

      <p
        style={{
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "var(--color-muted-foreground)",
          letterSpacing: "0.04em",
        }}
      >
        {t("auth.noAccount")}{" "}
        <Link
          to="/register"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            borderBottom: "1px solid rgba(96,165,250,0.3)",
            paddingBottom: 1,
          }}
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </>
  );
}
