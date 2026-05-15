import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconLoader, IconPlus, IconTrash, IconDumbbell } from "../../icons/Icons";
import ExerciseSelectorSheet from "./ExerciseSelectorSheet";
import { API_URL } from "../../../config/api";
import { oxyAlert } from "../../../utils/customAlert";

export default function CreateManualRoutineSheet({ open, onOpenChange, onRoutineCreated }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([]); // Lista de ejercicios añadidos
  const [loading, setLoading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      await oxyAlert(t("training.manual_routine.alert_name"));
      return;
    }
    if (exercises.length === 0) {
      await oxyAlert(t("training.manual_routine.alert_exercises"));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/routine/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            nombre: name,
            objetivo: "Personalizado",
            ejercicios: exercises
        })
      });

      const data = await res.json();
      if (res.ok) {
        onRoutineCreated(data.rutina);
        // Reset y cerrar
        setName("");
        setExercises([]);
        onOpenChange(false);
      } else {
        await oxyAlert(t("training.manual_routine.alert_error"));
      }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const removeExercise = (indexToRemove) => {
      setExercises(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95%] rounded-t-[32px] bg-background border-t border-border px-0 flex flex-col focus:outline-none">
        
        <SheetHeader className="mb-6 pt-2 px-6">
          <SheetTitle className="text-2xl font-black text-foreground">{t("training.manual_routine.title")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
              {t("training.manual_routine.name_label")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("training.manual_routine.name_placeholder")}
              className="w-full bg-secondary/30 border border-border/40 rounded-2xl px-4 py-4 text-foreground font-bold text-lg placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          {/* Exercises Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {t("training.manual_routine.exercises_count", { count: exercises.length })}
              </h4>
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <IconPlus className="w-3 h-3" />
                {t("training.manual_routine.add_button")}
              </button>
            </div>

            {exercises.length === 0 ? (
              <div 
                onClick={() => setIsSelectorOpen(true)}
                className="w-full aspect-video rounded-3xl border-2 border-dashed border-border/40 bg-secondary/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-secondary/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <IconDumbbell className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{t("training.manual_routine.tap_to_add")}</span>
              </div>
            ) : (
                <div className="space-y-3 pb-20">
                    {exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-xs font-bold shrink-0">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-foreground">
                                    {t(`exercises.${ex.nombre}`, { defaultValue: ex.nombre })}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    {t(`muscles.${ex.grupo_muscular}`, { defaultValue: ex.grupo_muscular })}
                                </span>
                            </div>
                            <button onClick={() => removeExercise(idx)} className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                                <IconTrash className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    
                    <Button 
                        variant="outline"
                        className="w-full border-dashed border-border/50 text-muted-foreground"
                        onClick={() => setIsSelectorOpen(true)}
                    >
                        {t("training.manual_routine.add_button")}
                    </Button>
                </div>
            )}
        </div>
        </div>

        {/* Footer Guardar */}
        <div className="p-6 border-t border-border/30 bg-background/95 backdrop-blur-sm mt-auto">
            <Button
            onClick={handleSave}
            disabled={loading || !name}
            className="w-full h-14 rounded-full bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            {loading ? <IconLoader className="w-5 h-5 animate-spin" /> : t("training.manual_routine.save_button")}
          </Button>
        </div>

        {/* Selector anidado */}
        <ExerciseSelectorSheet 
            open={isSelectorOpen} 
            onOpenChange={setIsSelectorOpen}
            onExercisesSelected={(newExercises) => setExercises(prev => [...prev, ...newExercises])}
        />

      </SheetContent>
    </Sheet>
  );
}   