import React from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { IconTraining, IconNutrition, IconRanks, IconProfile } from "../icons/Icons"; 
import { useTranslation } from "react-i18next";

export default function MobileFooter() {
  const { t } = useTranslation();
  const location = useLocation();
  const isSettingsView = location.pathname === "/settings";
  const getLinkClass = ({ isActive }) => {
    return `flex flex-col items-center justify-center group transition-colors duration-300 ${
      isActive ? "text-primary" : "text-[#bdbdbe] hover:text-foreground"
    }`;
  };

  return (
    <footer
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[360px] rounded-full backdrop-blur-xl border overflow-hidden ${
        isSettingsView
          ? "bg-card/65 border-white/15 shadow-2xl shadow-black/45"
          : "bg-card/80 border-border shadow-xl dark:shadow-2xl shadow-zinc-500/10 dark:shadow-black/50"
      }`}
      style={{ bottom: 'calc(1.5rem + var(--safe-area-bottom))' }}
    >
      <nav className="flex items-center justify-between px-6 py-2" role="menubar">
        
        <NavLink to="/" className={getLinkClass} aria-label={t("nav.train")}>
          {({ isActive }) => (
            <>
              <IconTraining className={`w-[22px] h-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium mt-1">{t("nav.train")}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/products" className={getLinkClass} aria-label={t("nav.nutrition")}>
          {({ isActive }) => (
            <>
              <IconNutrition className={`w-[22px] h-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{t("nav.nutrition")}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/stats" className={getLinkClass} aria-label={t("nav.ranks")}>
          {({ isActive }) => (
            <>
              <IconRanks className={`w-[21px] h-[21px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{t("nav.ranks")}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/profile" className={getLinkClass} aria-label={t("nav.profile")}>
          {({ isActive }) => (
            <>
              <IconProfile className={`w-[22px] h-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{t("nav.profile")}</span>
            </>
          )}
        </NavLink>

      </nav>
    </footer>
  );
}