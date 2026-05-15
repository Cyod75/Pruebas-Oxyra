import React, { useState, useEffect, useRef } from "react";
// AÑADIMOS IconGrip
import { IconDotsHorizontal, IconPlay, IconEdit, IconTrash, IconGrip } from "../icons/Icons"; 
import { useTranslation } from "react-i18next";

export default function RoutineCard({ routine, onClick, onDelete, onStart, onRename, dragControls }) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const levelKey = routine.nivel || "General";
  const metaInfo = `${t("training.days", { count: routine.dias?.length || 0 })} • ${t(`training.levels.${levelKey}`, { defaultValue: levelKey === "General" ? t("training.general") : levelKey })}`;
  const isAI = routine.creada_por_ia;

  useEffect(() => {
    if (!showMenu) return; 
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleAction = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    if (action) action();
  };

  return (
    <div 
      onClick={onClick}
      className="
        group relative w-full flex flex-col justify-between overflow-visible rounded-[26px] p-5 cursor-pointer 
        transition-transform duration-200 active:scale-[0.99]
        bg-white border border-slate-100 shadow-sm hover:border-slate-200
        dark:bg-zinc-950/40 dark:backdrop-blur-md dark:border dark:border-white/[0.06]
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        
        <div className="flex-1 pr-2 flex flex-col gap-2">
            <h3 className="font-bold text-[19px] leading-tight text-slate-900 dark:text-white tracking-tight line-clamp-1">
                 {routine.nombre_rutina || t("training.unnamed")}
            </h3>
            
            <div className="flex items-center gap-2.5 flex-wrap">
                <div className={`
                    px-2 py-[3px] rounded-md text-[9px] font-extrabold uppercase tracking-widest border
                    ${isAI 
                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/10' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5'
                    }
                `}>
                    {isAI ? t("training.ai_plan") : t("training.manual_plan")}
                </div>
                <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10"></div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 tracking-wide uppercase">
                    {metaInfo}
                </span>
            </div>
        </div>

        {/* --- CONTROLES (Drag + Menú) --- */}
        <div className="flex items-center gap-1 -mt-2 -mr-2" ref={menuRef}>
            
            {/* 1. ASA DE ARRASTRE (SOLO SI HAY DRAG CONTROLS) */}
            {dragControls && (
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    className="p-2 rounded-full cursor-grab touch-none text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:text-zinc-700 dark:hover:text-zinc-400 dark:hover:bg-white/5 transition-colors"
                >
                    <IconGrip className="w-5 h-5" />
                </div>
            )}

            {/* 2. MENÚ DE OPCIONES */}
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`
                        p-2 rounded-full transition-all duration-200
                        ${showMenu 
                            ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white rotate-90' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-white/5'
                        }
                    `}
                >
                    <IconDotsHorizontal className="w-5 h-5" />
                </button>

                {/* POP UP FLOTANTE */}
                {showMenu && (
                    <div className="
                        absolute right-0 top-10 w-44 rounded-2xl overflow-hidden z-50
                        animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 origin-top-right
                        bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl ring-1 ring-black/5
                        dark:bg-[#18181b]/90 dark:backdrop-blur-xl dark:border dark:border-white/[0.08] dark:shadow-2xl
                    ">
                        <div className="p-1.5 flex flex-col gap-0.5">
                            <button onClick={(e) => handleAction(e, onRename)} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white">
                                <IconEdit className="w-4 h-4 opacity-70" /> {t("common.rename")}
                            </button>
                            <div className="h-[1px] bg-slate-100 dark:bg-white/5 mx-2 my-0.5"></div>
                            <button onClick={(e) => handleAction(e, onDelete)} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-red-500 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                                <IconTrash className="w-4 h-4 opacity-70" /> {t("common.delete")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <button 
        onClick={(e) => handleAction(e, onStart)}
        className="
            relative w-full h-[46px] rounded-[18px] font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 
            transition-all duration-300 z-0
            bg-blue-600 text-white hover:opacity-90 shadow-sm
            dark:bg-white/[0.04] dark:text-blue-200 dark:border dark:border-white/5
            dark:hover:bg-white/[0.08] dark:hover:text-blue-100
        "
      >
        <IconPlay className="w-3.5 h-3.5 fill-current" /> {t("training.start_workout_button")}
      </button>
    </div>
  );
}