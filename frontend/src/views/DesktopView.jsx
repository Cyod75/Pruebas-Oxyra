import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconTraining, IconNutrition, IconRanks, IconProfile, IconSearch, IconSettings } from '../components/icons/Icons';
import OxyraLogo from '../components/shared/OxyraLogo';

export default function DesktopView({ children }) {
  const { t } = useTranslation();
  
  const getLinkClass = ({ isActive }) => {
    return `flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 w-fit md:w-full max-w-[240px] ${
      isActive 
        ? "bg-primary text-primary-foreground font-semibold" 
        : "text-[#bdbdbe] hover:bg-muted/50 hover:text-foreground font-medium"
    }`;
  };

  return (
    <div className="flex w-full h-[100dvh] md:h-screen bg-background text-foreground md:overflow-hidden justify-center relative">
      
      {/* LEFT SIDEBAR (MD+) */}
      <nav className="hidden md:flex flex-col w-[280px] xl:w-[320px] h-full border-r border-border/40 bg-card/30 p-6 overscroll-contain overflow-y-auto shrink-0 relative">
        <div className="mb-8 px-4 flex items-center">
          <OxyraLogo className="h-6 w-auto text-foreground" />
        </div>
        
        <div className="flex flex-col gap-2 flex-grow">
          <NavLink to="/" className={getLinkClass}>
             {({ isActive }) => (
               <>
                 <IconTraining className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                 <span className="text-lg">{t("nav.train") || "Entrenar"}</span>
               </>
             )}
          </NavLink>

          <NavLink to="/products" className={getLinkClass}>
             {({ isActive }) => (
               <>
                 <IconNutrition className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                 <span className="text-lg">{t("nav.nutrition") || "Nutrición"}</span>
               </>
             )}
          </NavLink>

          <NavLink to="/stats" className={getLinkClass}>
             {({ isActive }) => (
               <>
                 <IconRanks className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                 <span className="text-lg">{t("nav.ranks") || "Estadísticas"}</span>
               </>
             )}
          </NavLink>

          <NavLink to="/profile" className={getLinkClass}>
             {({ isActive }) => (
               <>
                 <IconProfile className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                 <span className="text-lg">{t("nav.profile") || "Perfil"}</span>
               </>
             )}
          </NavLink>


        </div>

      </nav>

      {/* CENTER COLUMN (MOBILE VIEW REPLICA) */}
      <div id="oxyra-center-container" className="transform translate-x-0 w-full h-[100dvh] md:h-screen md:flex-1 md:max-w-[600px] lg:max-w-[650px] xl:max-w-[760px] relative bg-background md:border-x md:border-border/40 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* RIGHT SIDEBAR (LG+) */}
      <aside className="hidden lg:flex flex-col w-[320px] xl:w-[380px] h-full border-l border-border/40 bg-card/30 p-6 overscroll-contain overflow-y-auto shrink-0 relative">
        
        {/* Un widget premium / accesos rápidos */}
        <div className="bg-gradient-to-br from-card to-muted/20 rounded-3xl p-6 border border-border/50 text-center flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-sm shadow-sm group">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>
           
           <OxyraLogo className="h-6 w-auto opacity-80 z-10" />
           <h3 className="font-semibold text-lg text-foreground mt-2 z-10">{t("desktop.sidebar.welcome_title")}</h3>
           <p className="text-sm text-muted-foreground z-10 font-medium">{t("desktop.sidebar.welcome_description")}</p>
           
           <NavLink to="/stats" className="mt-2 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary/25 z-10">
              {t("desktop.sidebar.view_progress")}
           </NavLink>
        </div>

        <div className="mt-8 flex flex-col gap-4">
           <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">{t("desktop.sidebar.quick_links")}</h4>
           <div className="flex flex-col gap-2">
             <NavLink to="/search" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted/50 transition-colors text-foreground border border-transparent hover:border-border/50 group">
               <div className="p-2 bg-background rounded-xl border border-border/50 shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <IconSearch className="w-5 h-5" />
               </div>
               <span className="font-medium text-sm">{t("desktop.sidebar.explore_exercises")}</span>
             </NavLink>
             <NavLink to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted/50 transition-colors text-foreground border border-transparent hover:border-border/50 group">
               <div className="p-2 bg-background rounded-xl border border-border/50 shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <IconSettings className="w-5 h-5" />
               </div>
               <span className="font-medium text-sm">{t("desktop.sidebar.account_settings")}</span>
             </NavLink>
           </div>
        </div>

        <div className="mt-auto pt-6 w-full text-xs text-muted-foreground/50 flex flex-wrap gap-x-4 gap-y-2 justify-center px-4">
           <span>&copy; {new Date().getFullYear()} Oxyra</span>
           <span className="hover:text-foreground cursor-pointer transition-colors">{t("desktop.sidebar.terms")}</span>
           <span className="hover:text-foreground cursor-pointer transition-colors">{t("desktop.sidebar.privacy")}</span>
        </div>
      </aside>

    </div>
  );
}