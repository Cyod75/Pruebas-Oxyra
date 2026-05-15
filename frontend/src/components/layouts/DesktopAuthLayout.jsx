import React from "react";
import gymBg from "../../assets/images/gym-hero-bg.png";
import logoWhite from "../../assets/images/oxyra-white.png";
import headerLogoOxyra from "../../assets/iconos/header-logo-oxyra.svg";

/**
 * DesktopAuthLayout
 * Contenedor split-screen 50/50 para las vistas de autenticación en desktop.
 * Columna izquierda: imagen de gimnasio con overlay + logo.
 * Columna derecha: slot para el formulario/contenido interactivo.
 */
export default function DesktopAuthLayout({ children, quote }) {
  return (
    <div className="hidden md:flex h-screen w-screen overflow-hidden bg-[#0A0A0C] font-sans">
      {/*  COLUMNA IZQUIERDA — Visual ─ */}
      <div className="relative w-1/2 h-full overflow-hidden">
        {/* Imagen de fondo del gimnasio */}
        <img
          src={gymBg}
          alt="Oxyra Gym"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay oscuro multicapa para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Contenido encima del overlay */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo superior izquierda */}
          <div className="flex items-center gap-3">
            <img src={headerLogoOxyra} alt="Oxyra Logo" className="h-10 w-auto" />
          </div>

          {/* Quote motivacional en la parte inferior */}
          <div className="mt-auto">
            {quote && (
              <blockquote className="text-white/90 text-2xl font-bold leading-snug max-w-sm drop-shadow-lg">
                {quote}
              </blockquote>
            )}
            {/* Línea decorativa */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-10 bg-white/40" />
              <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                Premium Fitness
              </span>
            </div>
          </div>
        </div>
      </div>

      {/*  COLUMNA DERECHA — Funcional  */}
      <div className="w-1/2 h-full bg-[#0A0A0C] flex items-center justify-center p-8 overflow-y-auto">
        {/* Luz ambiental sutil en la esquina superior */}
        <div className="pointer-events-none absolute right-0 top-0 w-[35vw] h-[35vh] bg-white/[0.03] blur-[80px] rounded-full" />

        {/* Contenido del formulario con ancho máximo elegante */}
        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
