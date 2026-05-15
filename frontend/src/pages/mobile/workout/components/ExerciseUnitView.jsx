import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IconDumbbell, IconTimer, IconPlus, IconInfo } from "../../../../components/icons/Icons";
import { vibrateCheck } from "../../../../utils/notifications";
import { Button } from "@/components/ui/button";
import { oxyConfirm } from "../../../../utils/customAlert";
import SetRow from "./SetRow";
import ScrollPickerSheet from "./ScrollPickerSheet"; 
import ExerciseInfoSheet from "./ExerciseInfoSheet";
import { exerciseVisuals } from "../../../../data/exerciseVisuals";

export default function ExerciseUnitView({ exerciseData, exerciseIndex, setWorkoutData, onSetComplete }) {
  const { t } = useTranslation();
  
  // --- DETECCIÓN DE VISUAL DEL EJERCICIO ---
  const visualBaseUrl = exerciseData?.nombre ? exerciseVisuals[exerciseData.nombre] : null;

  // Estado del modal de información
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Estado para controlar qué picker está abierto y para qué serie/campo
  const [pickerConfig, setPickerConfig] = useState({
    isOpen: false,
    type: null, // 'timer', 'weight', 'reps'
    setIndex: null, // Si es para una serie específica
    currentValue: 0
  });

  // --- GENERADORES DE OPCIONES (Memoizados para rendimiento) ---
  const timerOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => (i + 1) * 5), []); // 5s a 300s
  const weightOptions = useMemo(() => Array.from({ length: 200 }, (_, i) => i * 2.5), []); // 0 to 500 in 2.5 steps
  const repsOptions = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []); // 1 to 100

  // --- MANEJADORES ---

  // Abrir el picker correcto
  const openPicker = (type, setIndex = null, currentValue = 0) => {
    // Si el valor viene vacío, ponemos un default
    let safeValue = currentValue;
    if (safeValue === '' || safeValue === null) {
        if (type === 'weight') safeValue = 10;
        if (type === 'reps') safeValue = 8;
    }
    setPickerConfig({ isOpen: true, type, setIndex, currentValue: safeValue });
  };

  const handleSavePicker = (value) => {
    const { type, setIndex } = pickerConfig;

    if (type === 'timer') {
        // Actualizar timer global del ejercicio
        updateExerciseData(newData => {
            newData[exerciseIndex].currentRestTimerSetting = value;
        });
    } else {
        // Actualizar Peso o Reps de una serie
        handleSetChange(setIndex, type, value);
    }
  };

  // Helper para actualizar datos inmutables
  const updateExerciseData = (callback) => {
    setWorkoutData(prevData => {
        // Deep copy segura para evitar mutaciones de estado
        const newData = JSON.parse(JSON.stringify(prevData));
        callback(newData);
        return newData;
    });
  };

  const handleSetChange = (setIndex, field, value) => {
    updateExerciseData(newData => {
        const currentSets = newData[exerciseIndex].performedSets;
        currentSets[setIndex][field] = value;
        
        // --- LÓGICA DE AUTO-COMPLETADO DE LA SIGUIENTE SERIE ---
        if (field === 'completed' && value === true) {
            vibrateCheck(); // Vibración corta de confirmación al marcar serie
            // 1. Disparar timer
            onSetComplete(newData[exerciseIndex].currentRestTimerSetting);
            
            // 2. Copiar datos a la siguiente serie si existe y está vacía/incompleta
            const nextSetIndex = setIndex + 1;
            if (nextSetIndex < currentSets.length) {
                const currentSet = currentSets[setIndex];
                const nextSet = currentSets[nextSetIndex];

                // Solo copiamos si la siguiente NO está completada aún
                if (!nextSet.completed) {
                    // Si el usuario no ha tocado la siguiente, le copiamos los valores
                    if (!nextSet.weight) nextSet.weight = currentSet.weight;
                    if (!nextSet.reps) nextSet.reps = currentSet.reps;
                }
            }
        }
    });
  };

  const handleAddSet = () => {
     updateExerciseData(newData => {
        const sets = newData[exerciseIndex].performedSets;
        // Copiamos datos de la última serie para la nueva
        const lastSet = sets[sets.length - 1] || { weight: '', reps: '' };
        
        sets.push({
            weight: lastSet.weight, 
            reps: lastSet.reps, 
            completed: false
        });
     });
  };

  const handleDeleteSet = async (setIndex) => {
      if (!(await oxyConfirm(t("workout_session.exercise.delete_set_confirm")))) return;
      updateExerciseData(newData => {
          newData[exerciseIndex].performedSets.splice(setIndex, 1);
      });
  };

  return (
    <div className="pb-20">
      {/* Header Imagen — Reproductor Visual Inmersivo */}
      <div className="h-56 flex items-end justify-center relative overflow-hidden mb-4">
        
        {/* === CAPA 0: Fondo (Imagen o Fallback) === */}
        {visualBaseUrl ? (
          <img 
            src={`${visualBaseUrl}0.jpg`} 
            alt={exerciseData.nombre}
            className="absolute inset-0 w-full h-full object-cover z-0"
            loading="eager"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          /* Fallback: diseño original con icono dumbbell */
          <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center z-0">
            <IconDumbbell className="w-24 h-24 text-zinc-800" />
          </div>
        )}

        {/* === CAPA 1: Overlay de oscurecimiento (legibilidad) === */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* === CAPA 2: Gradiente inferior (fusión con app) === */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>

        {/* === CAPA 3: Texto del título (por encima de todo) === */}
        <h1 className="relative z-20 text-2xl font-black text-foreground text-center px-4 pb-4 drop-shadow-lg">
          {exerciseData.nombre}
        </h1>
      </div>

      <div className="px-4">
        {/* Info y Timer Button */}
        <div className="flex items-center justify-between mb-6 bg-secondary/20 p-3 rounded-xl border border-border/50">
            <div className="text-sm">
                <span className="text-primary font-bold uppercase tracking-wide text-xs block mb-1">{t("workout_session.exercise.muscle")}</span>
                <span className="font-semibold">{t(`muscles.${exerciseData.grupo_muscular}`, { defaultValue: exerciseData.grupo_muscular })}</span>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Botón Info — solo si hay visual disponible */}
                {visualBaseUrl && (
                    <button 
                        onClick={() => setIsInfoOpen(true)}
                        className="flex items-center justify-center w-10 h-10 bg-background border border-border rounded-full shadow-sm active:scale-90 transition-transform"
                        aria-label="Ver técnica del ejercicio"
                    >
                        <IconInfo className="w-4 h-4 text-primary" />
                    </button>
                )}

                <button 
                    onClick={() => openPicker('timer', null, exerciseData.currentRestTimerSetting)}
                    className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform"
                >
                    <IconTimer className="w-4 h-4 text-primary" />
                    <span className="font-bold font-mono">{exerciseData.currentRestTimerSetting}s</span>
                </button>
            </div>
        </div>

        {/* Tabla Headers */}
        <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-3 mb-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
            <span>{t("workout_session.exercise.set")}</span>
            <span>{t("workout_session.exercise.kg")}</span>
            <span>{t("workout_session.exercise.reps")}</span>
            <span>{t("workout_session.exercise.done")}</span>
        </div>

        {/* Lista de Sets */}
        <div className="space-y-3">
            {exerciseData.performedSets.map((set, index) => (
                <SetRow 
                    key={index} // Idealmente usar un ID único, pero index sirve si no reordenamos
                    setNumber={index + 1}
                    setData={set}
                    // Pasamos las funciones para abrir los pickers
                    onWeightClick={() => openPicker('weight', index, set.weight)}
                    onRepsClick={() => openPicker('reps', index, set.reps)}
                    onCheck={() => handleSetChange(index, 'completed', !set.completed)}
                    onDelete={() => handleDeleteSet(index)}
                />
            ))}
        </div>

        <Button 
            variant="outline" 
            className="w-full mt-6 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 h-12"
            onClick={handleAddSet}
        >
            <IconPlus className="w-4 h-4 mr-2" /> {t("workout_session.exercise.add_set")}
        </Button>
      </div>

      {/* Selector Genérico (Sheet) */}
      <ScrollPickerSheet 
        open={pickerConfig.isOpen}
        onOpenChange={(isOpen) => setPickerConfig(prev => ({ ...prev, isOpen }))}
        title={pickerConfig.type === 'timer' ? t("workout_session.exercise.rest_title") : pickerConfig.type === 'weight' ? t("workout_session.exercise.weight_title") : t("workout_session.exercise.reps_title")}
        initialValue={pickerConfig.currentValue}
        options={pickerConfig.type === 'timer' ? timerOptions : pickerConfig.type === 'weight' ? weightOptions : repsOptions}
        suffix={pickerConfig.type === 'timer' ? 's' : pickerConfig.type === 'weight' ? 'kg' : ''}
        onSave={handleSavePicker}
      />

      {/* Modal de Información del Ejercicio */}
      <ExerciseInfoSheet
        open={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        exerciseName={exerciseData.nombre}
        baseUrl={visualBaseUrl}
      />
    </div>
  );
}