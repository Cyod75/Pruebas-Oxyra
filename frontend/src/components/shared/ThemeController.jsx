import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Switch } from "@/components/ui/switch";

// Iconos SVG forzando tamaño con w-4 h-4
const SunIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

export default function ThemeController() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3 bg-secondary/50 p-1.5 rounded-full border border-white/5">
      {/* Icono Sol: Se ilumina si es modo claro (!isDark) */}
      <div className={`p-1 rounded-full transition-colors ${!isDark ? "bg-background text-yellow-500 shadow-sm" : "text-muted-foreground"}`}>
        <SunIcon className="w-4 h-4" />
      </div>

      <Switch 
        checked={isDark} 
        onCheckedChange={toggleTheme} 
        className="data-[state=checked]:bg-primary scale-90"
      />

      {/* Icono Luna: Se ilumina si es modo oscuro (isDark) */}
      <div className={`p-1 rounded-full transition-colors ${isDark ? "bg-background text-blue-400 shadow-sm" : "text-muted-foreground"}`}>
        <MoonIcon className="w-4 h-4" />
      </div>
    </div>
  );
}