import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconBackArrow, IconCheck } from "../../components/icons/Icons";
import { API_URL } from "../../config/api";
import DesktopAuthLayout from "../../components/layouts/DesktopAuthLayout";
import { notifyWelcome } from "../../utils/notifications";
import { oxyAlert } from "../../utils/customAlert";

function VerifyEmailForm({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar código");
      }

      setSuccess(true);
      
      // Auto-login con el token recibido
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Bienvenida nativa (silenciosa en web)
      notifyWelcome(data.user.username || data.user.nombre);

      setTimeout(() => {
        if (data.user.rol === "admin" || data.user.rol === "superadmin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al reenviar");
      
      setError("");
      // Mostrar feedback ligero de que se ha enviado (opcional)
      await oxyAlert("Se ha reenviado un nuevo código a tu correo.");
    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack || (() => navigate("/register"))}
          className="group p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <IconBackArrow className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">Verificar Email</h1>
        <p className="text-zinc-400 text-base font-medium leading-relaxed">
          Hemos enviado un código a <br />
          <span className="text-white font-bold">{email}</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
          <IconCheck className="w-5 h-5 text-green-500 shrink-0" />
          ¡Cuenta verificada! Entrando a Oxyra...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">CÓDIGO DE 6 DÍGITOS</label>
          <div className="bg-zinc-900/60 border border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900 transition-all duration-300 rounded-2xl flex items-center px-4 py-3.5">
            <input
              type="text"
              maxLength="6"
              className="bg-transparent border-none text-white w-full text-center text-2xl tracking-[0.5em] font-bold focus:outline-none placeholder-zinc-700 h-full"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success || code.length !== 6}
          className="w-full bg-white text-black font-bold h-14 rounded-full text-base shadow-[0_0_25px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)] hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
          ) : (
            "Verificar y Entrar"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-zinc-500 text-sm font-medium">
          ¿No has recibido el código?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-white font-bold hover:underline underline-offset-4 decoration-zinc-500 transition-colors"
          >
            Reenviar
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <>
      <DesktopAuthLayout quote="Estás a un paso de comenzar tu transformación.">
        <VerifyEmailForm />
      </DesktopAuthLayout>

      <div className="md:hidden min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative overflow-hidden selection:bg-white selection:text-black">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-blue-900/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col px-6 py-6 grow">
          <VerifyEmailForm onBack={() => navigate("/register")} />
        </div>
      </div>
    </>
  );
}
