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
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}
      >
        <div className="auth-mobile-logo">
          <Train style={{ width: 14, height: 14, color: "white" }} />
        </div>
        <span className="auth-brand-name">MRT JAKARTA</span>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <div className="auth-heading">{t("auth.signIn")}</div>
        <p className="auth-subheading">Enter credentials to access the system</p>
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
              className="auth-eye-btn"
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
        <div className="auth-divider-line" />
        <span className="auth-divider-label">{t("auth.orContinueWith").toUpperCase()}</span>
        <div className="auth-divider-line" />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {}}
          size="large"
          width="100%"
          text="continue_with"
        />
      </div>

      <p className="auth-footer-text">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="auth-link">
          {t("auth.signUp")}
        </Link>
      </p>
    </>
  );
}
