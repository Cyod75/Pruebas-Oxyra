import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconBackArrow, IconCheck, IconX } from "../../components/icons/Icons";
import { API_URL } from '../../config/api';

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

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.forgot_password.error_sending"));
      }
      
      setSuccess(true);
      setTimeout(() => {
          navigate("/verify-code", { state: { email } });
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden selection:bg-white selection:text-black">
      
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{t("auth.forgot_password.title")}</h1>
          <p className="text-zinc-400 text-base font-medium">{t("auth.forgot_password.subtitle")}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
             <IconCheck className="w-5 h-5 text-green-500" />
             {t("auth.forgot_password.success_message")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <FormInput 
                label={t("auth.forgot_password.email_label")}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                }
                type="email"
                name="email"
                placeholder={t("auth.forgot_password.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button 
                type="submit" 
                disabled={loading || success}
                className="w-full bg-white text-black font-bold h-14 rounded-full text-lg shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : success ? t("auth.forgot_password.sent") : t("auth.forgot_password.submit")}
            </button>

        </form>

      </div>
    </div>
  );
}
