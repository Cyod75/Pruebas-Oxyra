import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { IconCheck, IconLoader, IconPlus } from "../../icons/Icons"; // Usa tus iconos
import { API_URL } from "../../../config/api"; // Asegúrate de tener esto configurado

export default function ExerciseSelectorSheet({ open, onOpenChange, onExercisesSelected }) {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Cargar ejercicios al abrir
  useEffect(() => {
    if (open && exercises.length === 0) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    } catch (error) {
      console.error("Error cargando ejercicios");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    // Devolver los objetos completos de los ejercicios seleccionados
    const selectedObjects = exercises.filter(ex => selectedIds.includes(ex.idEjercicio));
    onExercisesSelected(selectedObjects);
    setSelectedIds([]); // Resetear selección
    onOpenChange(false);
  };

  // Filtrado simple
  const filteredExercises = exercises.filter(ex => 
    ex.nombre.toLowerCase().includes(search.toLowerCase()) || 
    ex.grupo_muscular.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] rounded-t-[32px] bg-background border-t border-border px-0 flex flex-col">
        
        <SheetHeader className="px-6 mb-4 mt-4">
          <SheetTitle>{t("training.exercise_selector.title")}</SheetTitle>
          {/* Buscador */}
          <input 
            type="text"
            placeholder={t("training.exercise_selector.search_placeholder")}
            className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SheetHeader>

        {/* Lista Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2">
            {loading ? (
                <div className="flex justify-center py-10"><IconLoader className="animate-spin text-primary"/></div>
            ) : (
                filteredExercises.map((ex) => {
                    const isSelected = selectedIds.includes(ex.idEjercicio);
                    return (
                        <div 
                            key={ex.idEjercicio}
                            onClick={() => toggleSelection(ex.idEjercicio)}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected 
                                ? "bg-primary/10 border-primary" 
                                : "bg-card border-border/40 hover:bg-secondary/20"
                            }`}
                        >
                            <div>
                                <h4 className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>{t(`exercises.${ex.nombre}`, { defaultValue: ex.nombre })}</h4>
                                <span className="text-xs text-muted-foreground">{t(`muscles.${ex.grupo_muscular}`, { defaultValue: ex.grupo_muscular })}</span>
                            </div>
                            {isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <IconCheck className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                            )}
                        </div>
                    );
                })
            )}
        </div>

        {/* Footer flotante */}
        <div className="p-6 border-t border-border/30 bg-background/95 backdrop-blur-sm">
            <Button 
                className="w-full h-12 rounded-full font-bold text-base"
                onClick={handleConfirm}
                disabled={selectedIds.length === 0}
            >
                {t("training.exercise_selector.add_count", { count: selectedIds.length })}
            </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}   