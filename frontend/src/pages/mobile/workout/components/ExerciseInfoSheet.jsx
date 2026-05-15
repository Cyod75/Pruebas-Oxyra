import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconCheck } from "../../../../components/icons/Icons";

/**
 * ExerciseInfoSheet
 * 
 * Modal bottom-sheet que muestra una animación simulada del ejercicio 
 * alternando entre los fotogramas 0.jpg y 1.jpg del repositorio,
 * junto con tips genéricos de técnica.
 * 
 * Props:
 *  - open: boolean
 *  - onOpenChange: (boolean) => void
 *  - exerciseName: string
 *  - baseUrl: string (ruta base del directorio de imágenes, ej: .../Crunches/)
 */
export default function ExerciseInfoSheet({ open, onOpenChange, exerciseName, baseUrl }) {
  const { t } = useTranslation();
  
  // --- SIMULADOR DE GIF: alterna entre frame 0 y 1 ---
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!open || !baseUrl) return;

    // Resetear al frame 0 al abrir
    setFrame(0);

    const interval = setInterval(() => {
      setFrame(prev => (prev === 0 ? 1 : 0));
    }, 800);

    return () => clearInterval(interval);
  }, [open, baseUrl]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85%] rounded-t-[32px] bg-background border-t border-border px-0 flex flex-col"
      >
        <SheetHeader className="px-6 mb-2 mt-4">
          <SheetTitle className="text-lg font-black">{exerciseName}</SheetTitle>
        </SheetHeader>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          
          {/* === ANIMACIÓN DEL EJERCICIO === */}
          {baseUrl ? (
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-zinc-900/30 border border-border/30">
              <img 
                src={`${baseUrl}${frame}.jpg`}
                alt={`${exerciseName} - Fotograma ${frame + 1}`}
                className="w-full rounded-2xl aspect-[4/3] object-cover transition-opacity duration-200"
                loading="eager"
                onError={(e) => {
                  // Si el frame 1 falla, quedarse en frame 0
                  if (frame === 1) {
                    e.target.src = `${baseUrl}0.jpg`;
                  }
                }}
              />
              {/* Indicador de frame animado */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${frame === 0 ? 'bg-primary scale-125' : 'bg-white/40'}`} />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${frame === 1 ? 'bg-primary scale-125' : 'bg-white/40'}`} />
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-900/30 flex items-center justify-center mb-6 border border-border/30">
              <span className="text-muted-foreground text-sm">{t("workout_session.exercise_info.no_image")}</span>
            </div>
          )}

          {/* === TIPS DE TÉCNICA === */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              {t("workout_session.exercise_info.technique_tips")}
            </h3>
            
            <div className="space-y-3">
              <TipItem 
                text={t("workout_session.exercise_info.tip_1")}
              />
              <TipItem 
                text={t("workout_session.exercise_info.tip_2")}
              />
              <TipItem 
                text={t("workout_session.exercise_info.tip_3")}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Componente interno para cada tip */
function TipItem({ text }) {
  return (
    <div className="flex gap-3 items-start p-3 rounded-xl bg-secondary/15 border border-border/30">
      <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
        <IconCheck className="w-3 h-3 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {text}
      </p>
    </div>
  );
}
