import { createContext, useContext, useEffect, useState } from "react";

// Creamos el contexto
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Miramos si hay algo guardado
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    // 2. Si no, miramos la preferencia del sistema
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    // 3. Por defecto oscuro (estilo Oxyra)
    return "dark"; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Quitamos clases antiguas para evitar conflictos
    root.classList.remove("light", "dark");
    // Añadimos la clase actual (necesario para shadcn)
    root.classList.add(theme);
    // Guardamos en local
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// --- AQUÍ ESTÁ LA SOLUCIÓN DEL ERROR ---
// Exportamos el hook directamente desde aquí para que MobileSettings lo encuentre
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};