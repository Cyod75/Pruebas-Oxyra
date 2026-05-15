import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconBackArrow, IconCheck } from "../../components/icons/Icons";
import { API_URL } from '../../config/api';

export default function VerifyCode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
        navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
        setError(t("auth.verify_code.error_length"));
        return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.verify_code.error_verifying"));
      }
      
      setSuccess(true);
      setTimeout(() => {
          navigate("/reset-password", { state: { email, code } });
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden selection:bg-white selection:text-black">
      
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col px-6 py-6 h-full grow">
        
        <div className="flex items-center mb-6">
          <button 
             onClick={() => navigate("/forgot-password")} 
             className="group p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <IconBackArrow className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{t("auth.verify_code.title")}</h1>
          <p className="text-zinc-400 text-base font-medium">
            {t("auth.verify_code.subtitle")} <span className="text-white font-bold">{email}</span>.
          </p>
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
             {t("auth.verify_code.success_message")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">{t("auth.verify_code.code_label")}</label>
                <div className="bg-zinc-900/50 border border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900 transition-all duration-300 rounded-2xl flex items-center px-4 py-3.5">
                    <input 
                        type="text" 
                        maxLength="6"
                        className="bg-transparent border-none text-white w-full text-center text-2xl tracking-[0.5em] font-bold focus:outline-none placeholder-zinc-700 h-full"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Only numbers
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading || success || code.length !== 6}
                className="w-full bg-white text-black font-bold h-14 rounded-full text-lg shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : t("auth.verify_code.verify")}
            </button>

        </form>

      </div>
    </div>
  );
}
