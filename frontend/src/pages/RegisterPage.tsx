import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { useRegister, useGoogleLogin } from "@/hooks/use-auth";
import { Eye, EyeOff, Train } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
            color: "white",
          }}
        >
          MRT JAKARTA
        </span>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 40,
            color: "white",
            letterSpacing: "0.06em",
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          {t("auth.signUp")}
        </div>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "rgba(148,163,184,0.4)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {t("auth.registerDescription")}
        </p>
      </div>

      {/* Error banners */}
      {errorMessage && (
        <div
          className="auth-error-banner"
          onClick={() => registerMutation.reset()}
          style={{ marginBottom: 20 }}
        >
          {errorMessage}
        </div>
      )}
      {googleError && (
        <div
          className="auth-error-banner"
          onClick={() => googleLoginMutation.reset()}
          style={{ marginBottom: 20 }}
        >
          {googleError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div style={{ marginBottom: 24 }}>
          <label className="auth-label" htmlFor="name">
            {t("auth.name")}
          </label>
          <input
            id="name"
            placeholder="Enter your name"
            className="auth-input"
            {...register("name")}
          />
          {errors.name && (
            <p className="auth-field-error">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 24 }}>
          <label className="auth-label" htmlFor="email">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="auth-input"
            {...register("email")}
          />
          {errors.email && (
            <p className="auth-field-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label className="auth-label" htmlFor="password">
            {t("auth.password")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
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

        {/* Confirm password */}
        <div style={{ marginBottom: 36 }}>
          <label className="auth-label" htmlFor="confirmPassword">
            {t("auth.confirmPassword") || "Confirm Password"}
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            className="auth-input"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="auth-field-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="auth-submit-btn"
        >
          {registerMutation.isPending
            ? t("auth.creatingAccount")
            : "CREATE ACCOUNT"}
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
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "rgba(148,163,184,0.25)",
            letterSpacing: "0.16em",
          }}
        >
          {t("auth.orContinueWith").toUpperCase()}
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
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
          color: "rgba(148,163,184,0.35)",
          letterSpacing: "0.04em",
        }}
      >
        {t("auth.hasAccount")}{" "}
        <Link
          to="/login"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            borderBottom: "1px solid rgba(96,165,250,0.3)",
            paddingBottom: 1,
          }}
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </>
  );
}
