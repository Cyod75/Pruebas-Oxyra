import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IconSettings, IconSearch } from "../icons/Icons";
import OxyraLogo from "../shared/OxyraLogo";

export default function MobileHeader() {
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 pointer-events-none bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-sm"
      style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      <div className="pointer-events-auto h-14">
        <div className="flex items-center justify-between px-4 h-full text-foreground max-w-screen-xl mx-auto">

          {/* IZQUIERDA: Logo SVG */}
          <Link
            to="/"
            className="flex items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg
                       text-foreground/75 hover:text-foreground transition-colors duration-200"
            aria-label="Ir al inicio"
          >
            <OxyraLogo className="h-[22px] w-auto" />
          </Link>

          {/* DERECHA: Acciones (Buscar + Ajustes) */}
          <nav className="flex items-center gap-1" aria-label="Menú superior">
            {/* 1. BOTÓN BUSCAR */}
            <Link
              to="/search"
              className="flex items-center justify-center p-2 rounded-full hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Buscar"
            >
              <IconSearch className="w-5 h-5" />
            </Link>

            {/* 2. BOTÓN AJUSTES */}
            <Link
              to="/settings"
              state={{ from: location.pathname }}
              className="flex items-center justify-center p-2 rounded-full hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Ajustes de la cuenta"
            >
              <IconSettings className="w-5 h-5" />
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}
