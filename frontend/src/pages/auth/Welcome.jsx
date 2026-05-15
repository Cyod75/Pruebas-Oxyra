import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import {
  initializeGoogleAuth,
  nativeGoogleSignIn,
  isNative,
} from "../../services/googleAuth";
import headerLogoOxyra from "../../assets/iconos/header-logo-oxyra.svg";
import { API_URL } from "../../config/api";
import DesktopAuthLayout from "../../components/layouts/DesktopAuthLayout";
import { notifyWelcome } from "../../utils/notifications";
import { oxyAlert } from "../../utils/customAlert";

//  slides will be generated inside the component to use translations 

//  SVG Google inline 
const GoogleIcon = () => (
  <svg className="w-5 h-5 absolute left-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 absolute left-5" aria-hidden="true">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

//  Adaptador: normaliza el payload al mismo formato sin importar el origen ─
// Web devuelve: { email, name, picture, sub }
// Nativo devuelve: { email, name, picture, sub } (ya normalizado por el servicio)
function normalizeGoogleUser(userInfo) {
  return {
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture ?? userInfo.imageUrl ?? null,
    sub: userInfo.sub ?? userInfo.id ?? null,
  };
}

//  Envía el payload normalizado al backend
async function sendToBackend(normalizedUser) {
  const targetUrl = `${API_URL}/api/auth/google-login`;
  console.log("[sendToBackend] Llamando a URL exacta en POST:", targetUrl);
  
  const backendRes = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedUser),
  });
  return backendRes;
}

export default function Welcome() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [googleAuthReady, setGoogleAuthReady] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      text: t("auth.welcome.slides.0"),
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: 2,
      text: t("auth.welcome.slides.1"),
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: 3,
      text: t("auth.welcome.slides.2"),
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  //  Inicialización del plugin nativo (OBLIGATORIO antes de signIn) 
  // En web no hace nada; el flujo lo gestiona @react-oauth/google.
  // En nativo, inicializa @capgo/capacitor-social-login.
  useEffect(() => {
    initializeGoogleAuth()
      .then(() => {
        setGoogleAuthReady(true);
      })
      .catch((err) => {
        console.error("[GoogleAuth] Error al inicializar:", JSON.stringify(err), err);
        // En web siempre marcamos como listo (no depende del plugin nativo)
        if (!isNative()) setGoogleAuthReady(true);
      });
  }, []);

  //  Google OAuth (WEB) 
  const loginWithGoogleWeb = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();

        const backendRes = await sendToBackend(normalizeGoogleUser(userInfo));
        const data = await backendRes.json();

        if (backendRes.ok && data.token) {
          localStorage.setItem("authToken", data.token);
          if (data.user) {
            localStorage.setItem("userData", JSON.stringify(data.user));
            notifyWelcome(data.user.username || data.user.nombre_completo);
          }
          navigate("/");
        } else {
          console.error("Error en el login del servidor (web):", data.error);
          await oxyAlert(t("auth.login.google_error"));
        }
      } catch (error) {
        console.error("Error en el proceso de Google (web):", error);
      }
    },
    onError: () => console.error("Error en el OAuth de Google (web)"),
  });

  //  Google Sign-In (NATIVO Android) 
  const loginWithGoogleNative = async () => {
    if (!googleAuthReady) {
      console.warn("[GoogleAuth] El plugin aún no está inicializado. Espera un momento.");
      return;
    }
    try {
      // nativeGoogleSignIn() devuelve { email, name, picture, sub } ya normalizado
      const normalized = await nativeGoogleSignIn();
      console.log("[GoogleAuth] Usuario nativo normalizado:", JSON.stringify(normalized));

      const backendRes = await sendToBackend(normalized);
      const data = await backendRes.json();

      if (backendRes.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
          notifyWelcome(data.user.username || data.user.nombre_completo);
        }
        navigate("/");
      } else {
        console.error("[GoogleAuth] Error en el login del servidor (nativo):", data.error);
        await oxyAlert(t("auth.login.google_error"));
      }
    } catch (error) {
      // Códigos de error comunes:
      //   code 10    → Developer Error: SHA-1 no registrado en Google Cloud o clientId incorrecto
      //   code 12500 → Sign-in failed: Play Services desactualizado o cuenta bloqueada
      console.error(
        "[GoogleAuth] Error en el proceso de Google Sign-In nativo:",
        JSON.stringify(error),
        error
      );
      await oxyAlert(`Google Sign-In falló.\nDetalle: ${JSON.stringify(error)}`);
    }
  };

  //  Selector de flujo: Web vs Nativo 
  const handleGoogleLogin = () => {
    if (isNative()) {
      loginWithGoogleNative();
    } else {
      loginWithGoogleWeb();
    }
  };

  //  Autoplay carrusel (mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  //  Contenido compartido de los botones de acción 
  const renderActionButtons = (stacked = false) => (
    <div className={`flex flex-col gap-3 w-full ${stacked ? "" : ""}`}>
      {/* Botón Google */}
      <button
        id="welcome-google-btn"
        onClick={handleGoogleLogin}
        className="relative w-full h-14 bg-white text-black font-bold text-base rounded-full flex items-center justify-center shadow-md hover:bg-white/90 hover:scale-[1.015] active:scale-[0.98] transition-all duration-300"
      >
        <GoogleIcon />
        <span>{t("auth.welcome.google_signup")}</span>
      </button>

      {/* Botón Email */}
      <button
        id="welcome-email-btn"
        onClick={() => navigate("/register")}
        className="relative w-full h-14 bg-transparent text-white font-bold text-base rounded-full border border-zinc-700 flex items-center justify-center hover:border-zinc-400 hover:bg-white/5 active:scale-[0.98] transition-all duration-300"
      >
        <EmailIcon />
        <span>{t("auth.welcome.email_signup")}</span>
      </button>

      {/* Enlace Login */}
      <div className="text-center mt-3">
        <span className="text-zinc-500 font-medium text-sm">{t("auth.welcome.have_account")} </span>
        <button
          id="welcome-login-link"
          onClick={() => navigate("/login")}
          className="text-white font-bold text-sm hover:underline underline-offset-4 decoration-zinc-500 transition-all duration-200"
        >
          {t("auth.welcome.login")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════ VISTA DESKTOP (split-screen) ═══════════════════════ */}
      <DesktopAuthLayout quote={t("auth.welcome.desktop_quote")}>
        <div className="flex flex-col gap-8">
          {/* Encabezado */}
          <div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
              {t("auth.welcome.title")}<br />
              <span className="text-white">Oxyra</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              {t("auth.welcome.subtitle")}
            </p>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">{t("auth.welcome.access")}</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Botones */}
          {renderActionButtons()}
        </div>
      </DesktopAuthLayout>

      {/* ═══════════════ VISTA MOBILE (carrusel original) ══════════════════ */}
      <div className="md:hidden h-screen w-full relative bg-black text-white overflow-hidden font-sans">
        {/* Fondo carrusel */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image} alt="Background" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />
          </div>
        ))}

        {/* Contenido mobile */}
        <div className="relative z-10 h-full flex flex-col px-6 py-12">
          <div className="flex items-center justify-center gap-3 mt-4">
            <img src={headerLogoOxyra} alt="Oxyra Logo" className="h-10 w-auto" />
          </div>

          <div className="flex flex-col items-center text-center mt-auto mb-6">
            <p className="text-2xl md:text-3xl font-bold leading-tight max-w-md mx-auto">
              {slides[currentIndex].text}
            </p>
            <div className="flex gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {renderActionButtons(true)}
        </div>
      </div>
    </>
  );
}
