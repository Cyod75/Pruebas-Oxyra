import React from "react";
import { useTranslation } from "react-i18next";
import { IconTimer, IconX, IconPlus, IconSound, IconSoundOff } from "../../../../components/icons/Icons";

export default function RestTimerOverlay({ isResting, timeLeft, totalTime, onCancel, onAddSeconds, soundEnabled, onToggleSound }) {
  const { t } = useTranslation();
  
  if (!isResting) return null; // No renderizar si no está descansando

  // Calcular progreso para la barra visual
  const progressPercentage = (timeLeft / totalTime) * 100;
  
  // Formatear MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-zinc-900/95 border border-zinc-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md z-50 animate-in slide-in-from-bottom-4 duration-300">
        {/* Barra de Progreso Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 overflow-hidden rounded-t-2xl">
            <div 
                className="h-full bg-primary transition-all duration-1000 ease-linear" 
                style={{ width: `${progressPercentage}%` }}
            />
        </div>

        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <IconTimer className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{t("workout_session.rest.title")}</p>
                    <p className="text-3xl font-black tracking-tight font-mono">{formattedTime}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={onToggleSound}
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${soundEnabled ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    title={soundEnabled ? t("workout_session.rest.sound_off_hint") : t("workout_session.rest.sound_on_hint")}
                >
                    {soundEnabled ? <IconSound className="w-5 h-5" /> : <IconSoundOff className="w-5 h-5" />}
                </button>
                <button 
                    onClick={() => onAddSeconds(30)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center text-xs font-bold px-3"
                >
                    <IconPlus className="w-3 h-3 mr-1" /> 30s
                </button>
                <button 
                    onClick={onCancel}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                >
                    <IconX className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
}