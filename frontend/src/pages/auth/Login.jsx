import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IconBackArrow,
  IconLock,
  IconEye,
  IconEyeOff,
} from "../../components/icons/Icons";
import { API_URL } from "../../config/api";
import DesktopAuthLayout from "../../components/layouts/DesktopAuthLayout";
import { notifyWelcome } from "../../utils/notifications";

//  Icono Email inline 
const IconEmail = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
  </svg>
);

//  Input reutilizable 
const FormInput = ({ label, icon, type, name, placeholder, value, onChange, rightElement = null }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">{label}</label>
    <div className="group bg-zinc-900/60 border border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900 transition-all duration-300 rounded-xl flex items-center pl-4 pr-2 py-3.5">
      <div className="text-zinc-600 group-focus-within:text-white transition-colors duration-300 shrink-0">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        autoComplete={name === "password" ? "current-password" : name}
        className="bg-transparent border-none text-white w-full ml-3 focus:outline-none placeholder-zinc-600 font-medium text-sm"
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
      />
      {rightElement && <div className="ml-2 flex items-center">{rightElement}</div>}
    </div>
  </div>
);

//  Formulario de Login (compartido entre mobile y desktop) 
function LoginForm({ onBack }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.login.error_fallback"));
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Notificación de bienvenida profesional (solo en APK, silenciosa en web)
      notifyWelcome(data.user.username || data.user.nombre);

      if (data.user.rol === "admin" || data.user.rol === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        id="login-back-btn"
        onClick={onBack || (() => navigate("/welcome"))}
        className="group mt-6 md:mt-0 mb-8 -ml-1 p-2 w-fit rounded-full hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
        aria-label={t("auth.login.back")}
      >
        <IconBackArrow className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-2">
          {t("auth.login.title")}
        </h1>
        <p className="text-zinc-400 text-base font-medium">
          {t("auth.login.subtitle")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label={t("auth.login.email_user_label")}
          icon={<IconEmail className="w-5 h-5" />}
          type="text"
          name="email"
          placeholder={t("auth.login.email_user_placeholder")}
          value={formData.email}
          onChange={handleChange}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">{t("auth.login.password_label")}</label>
          <div className="group bg-zinc-900/60 border border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900 transition-all duration-300 rounded-xl flex items-center pl-4 pr-2 py-3.5">
            <div className="text-zinc-600 group-focus-within:text-white transition-colors duration-300 shrink-0">
              <IconLock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              className="bg-transparent border-none text-white w-full ml-3 focus:outline-none placeholder-zinc-600 font-medium text-sm"
              placeholder={t("auth.login.password_placeholder")}
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              id="login-toggle-password"
              className="p-2 text-zinc-500 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
            </button>
          </div>
          {/* Forgot password */}
          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-zinc-500 hover:text-white transition-colors duration-200"
            >
              {t("auth.login.forgot_password")}
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-white text-black font-bold h-14 rounded-full text-base shadow-[0_0_25px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)] hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            t("auth.login.submit")
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-auto pt-8 text-center text-zinc-500 text-sm font-medium">
        {t("auth.login.no_account")}{" "}
        <Link
          to="/register"
          className="text-white font-bold hover:underline underline-offset-4 decoration-zinc-500 transition-colors"
        >
          {t("auth.login.register")}
        </Link>
      </p>
    </div>
  );
}

//  Página Login 
export default function Login() {
  const navigate = useNavigate();

  return (
    <>
      {/*  DESKTOP  */}
      <DesktopAuthLayout quote="Tu mejor versión empieza aquí.">
        <LoginForm />
      </DesktopAuthLayout>

      {/*  MOBILE  */}
      <div className="md:hidden min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative overflow-hidden selection:bg-white selection:text-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-blue-900/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col px-6 py-6 grow">
          <LoginForm onBack={() => navigate("/welcome")} />
        </div>
      </div>
    </>
  );
}