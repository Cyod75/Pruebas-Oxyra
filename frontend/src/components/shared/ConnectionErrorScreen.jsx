import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useConnection } from "../../context/ConnectionContext";
import { useTheme } from "../../context/ThemeContext";
import OxyraLogo from "./OxyraLogo";

/**
 * ConnectionErrorScreen
 * ----------------------
 * Pantalla de error de conexión que ocupa TODA la pantalla (z-index máximo).
 * Oculta header y footer completamente.
 * Aparece cuando status === "offline" (después del ModernLoader inicial).
 *
 * El usuario SOLO puede salir de aquí pulsando "Reintentar".
 */
export default function ConnectionErrorScreen() {
  const { t } = useTranslation();
  const { retryManually, status } = useConnection();
  const { isDark } = useTheme();
  const isRetrying = status === "checking";
  const canvasRef = useRef(null);

  // Partículas animadas en canvas (efecto premium)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Crear partículas
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(239, 68, 68, ${p.opacity})`   // rojo oscuro
          : `rgba(185, 28, 28, ${p.opacity})`;   // rojo claro
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      {/* Canvas de partículas de fondo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Glow rojizo ambiental */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 gap-8 max-w-sm">

        {/* Logo Oxyra (pequeño, para contexto de marca) */}
        <div className="opacity-30">
          <OxyraLogo className="h-5 w-auto" />
        </div>

        {/* Icono de WiFi cortado — SVG propio */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 1l22 22" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.99 9.04A16 16 0 0 1 8 6.14" />
              <path d="M12.99 16.15a4 4 0 0 1 2.01 1.1L12 21l-3-3.85a4 4 0 0 1 5.34-.47" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-3xl border border-red-500/20 animate-ping opacity-30" aria-hidden="true" />
        </div>

        {/* Textos */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {t("connection.no_connection_title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("connection.no_connection_desc")}
          </p>
        </div>

        {/* Botón Reintentar */}
        <button
          onClick={retryManually}
          disabled={isRetrying}
          className={`
            w-full h-14 rounded-2xl font-bold text-base transition-all duration-300
            select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
            ${isRetrying
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-400 hover:shadow-red-500/50 active:scale-95"
            }
          `}
          aria-label={t("connection.retry")}
        >
          {isRetrying ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("connection.connecting_ellipsis")}
            </span>
          ) : (
            t("connection.retry")
          )}
        </button>
      </div>
    </div>
  );
}
