import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconBackArrow, IconLock, IconEye, IconEyeOff, IconCheck } from "../../components/icons/Icons";
import { API_URL } from '../../config/api';
import { oxyAlert } from "../../utils/customAlert";

const FormInput = ({ label, icon, type, name, placeholder, value, onChange, extraProps = {}, rightElement = null }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">{label}</label>
        <div className="group bg-zinc-900/50 border border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900 transition-all duration-300 rounded-2xl flex items-center pl-4 pr-2 py-3.5 relative">
            <div className="text-zinc-600 group-focus-within:text-white transition-colors duration-300">
                {icon}
            </div>
            <input 
                type={type} 
                name={name}
                className="bg-transparent border-none text-white w-full ml-3 focus:outline-none placeholder-zinc-600 font-medium h-full"
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                {...extraProps}
            />
            {rightElement && (
                <div className="ml-2 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
    </div>
);

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!email || !code) {
        navigate("/forgot-password");
    }
  }, [email, code, navigate]);

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length > 10) score++;
    return Math.min(score, 4);
  };

  const handlePasswordChange = (e) => {
      const val = e.target.value;
      setPassword(val);
      setPasswordStrength(checkPasswordStrength(val));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError(t("auth.reset_password.error_mismatch"));
        return;
    }
    if (passwordStrength < 2) { // Require at least Medium
         setError(t("auth.reset_password.error_weak"));
         return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.reset_password.error_resetting"));
      }
      
      // Success
      setError("");
      await oxyAlert(t("auth.reset_password.success_message"));
      navigate("/login");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden selection:bg-white selection:text-black">
        
      <div className="absolute top-[-10%] right-[30%] w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col px-6 py-6 h-full grow">
        
        <div className="flex items-center mb-6">
          <button 
             onClick={() => navigate("/login")} 
             className="group p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <IconBackArrow className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{t("auth.reset_password.title")}</h1>
          <p className="text-zinc-400 text-base font-medium">{t("auth.reset_password.subtitle")}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="space-y-2">
                <FormInput 
                    label={t("auth.reset_password.new_password_label")}
                    icon={<IconLock className="w-5 h-5" />}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    rightElement={
                        <button
                            type="button"
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                        </button>
                    }
                />
                 {/* Visualizador de Fuerza de Contraseña */}
                 {password.length > 0 && (
                    <div className="flex gap-1 h-1 mt-1 px-1">
                        <div className={`h-full rounded-full flex-1 transition-all duration-300 ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-zinc-800'}`} />
                        <div className={`h-full rounded-full flex-1 transition-all duration-300 ${passwordStrength >= 2 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
                        <div className={`h-full rounded-full flex-1 transition-all duration-300 ${passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
                        <div className={`h-full rounded-full flex-1 transition-all duration-300 ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-zinc-800'}`} />
                    </div>
                )}
                 {password.length > 0 && (
                    <p className="text-[10px] text-zinc-500 px-1 text-right">
                        {passwordStrength < 2 ? t("auth.reset_password.strength_weak") : passwordStrength < 4 ? t("auth.reset_password.strength_medium") : t("auth.reset_password.strength_strong")}
                    </p>
                )}
            </div>

            <FormInput 
                label={t("auth.reset_password.confirm_password_label")}
                icon={<IconLock className="w-5 h-5" />}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                rightElement={
                    <button
                        type="button"
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                    </button>
                }
            />

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold h-14 rounded-full text-lg shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : t("auth.reset_password.submit")}
            </button>

        </form>

      </div>
    </div>
  );
}
