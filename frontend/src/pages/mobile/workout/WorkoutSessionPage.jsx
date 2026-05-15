import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconBackArrow, IconLoader, IconCheck, IconX } from "../../../components/icons/Icons";
import { Button } from "@/components/ui/button";
import ExerciseUnitView from "./components/ExerciseUnitView";
import RestTimerOverlay from "./components/RestTimerOverlay";
import { API_URL } from '../../../config/api';
import { scheduleRestTimer, cancelRestTimer, notifyWorkoutDone, vibrateAlert } from "../../../utils/notifications";
import { oxyAlert, oxyConfirm } from "../../../utils/customAlert";
import CancelReasonSheet from "./components/CancelReasonSheet";

export default function WorkoutSessionPage() {
  const { t } = useTranslation();
  const { routineId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [routineMeta, setRoutineMeta] = useState(null);
  const [workoutData, setWorkoutData] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(new Date());

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('oxyra_rest_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('oxyra_rest_sound_enabled', soundEnabled);
  }, [soundEnabled]);

  const playAlert = () => {
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.35);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    } else {
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }
    }
  };

  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/api/users/routine/${routineId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setRoutineMeta({ id: data.idRutina, nombre: data.nombre });
          
          // --- INICIALIZACIÓN INTELIGENTE ---
          const initialWorkoutState = data.ejercicios.map(ej => {
            // Opción 1: Hay datos previos (Memoria Muscular)
            if (ej.last_session_data && ej.last_session_data.length > 0) {
                return {
                    ...ej,
                    performedSets: ej.last_session_data.map(s => ({
                        weight: s.weight,
                        reps: s.reps,
                        completed: false // Siempre desmarcadas al empezar
                    })),
                    currentRestTimerSetting: ej.descanso_segundos || 90
                };
            }
            // Opción 2: Nueva rutina -> 2 Series por defecto (vacías)
            return {
                ...ej,
                performedSets: Array.from({ length: ej.series_objetivo || 2 }).map(() => ({
                    weight: '',
                    reps: '',
                    completed: false
                })),
                currentRestTimerSetting: ej.descanso_segundos || 90
            };
          });

          setWorkoutData(initialWorkoutState);
        }
      } catch (error) {
        console.error("Error fetching routine:", error);
        await oxyAlert(t("workout_session.error_loading"));
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutineData();
  }, [routineId, navigate]);

  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (restTimeLeft <= 0 && isResting) {
      setIsResting(false);
      vibrateAlert();  // Vibración de alerta: 3 pulsos + 1 largo
      playAlert();     // Sonido de beep (si está activado)
    }
    return () => clearTimeout(timerRef.current);
  }, [isResting, restTimeLeft, soundEnabled]);

  const triggerRestTimer = (duration) => {
    setRestDuration(duration);
    setRestTimeLeft(duration);
    setIsResting(true);
    scheduleRestTimer(duration); // Programa la notificación nativa
  };

  const cancelTimer = () => {
    setIsResting(false);
    cancelRestTimer(); // Cancela la notificación nativa
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutData.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleFinishWorkout = async () => {
    if (!(await oxyConfirm(t("workout_session.confirm_finish")))) return;
    setLoading(true);

    const endTime = new Date();
    const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);

    const payload = {
        rutinaId: routineMeta.id,
        nombreRutina: routineMeta.nombre,
        durationSeconds: durationSeconds,
        exercises: workoutData
    };

    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/api/users/workout/save`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // Cuenta regresiva de series completadas
            let totalSeries = 0;
            workoutData.forEach(ej => {
                totalSeries += ej.performedSets.filter(s => s.completed).length;
            });
            notifyWorkoutDone(Math.round(durationSeconds / 60), totalSeries);
            navigate('/');
        } else {
            await oxyAlert(t("workout_session.error_saving"));
        }
    } catch (error) {
        console.error("Error saving workout:", error);
        await oxyAlert(t("workout_session.connection_error_saving"));
    } finally {
        setLoading(false);
    }
  };

  const handleExit = async () => {
    if (await oxyConfirm(t("workout_session.confirm_exit"))) {
        setShowCancelReason(true);
    }
  };

  const handleCancelConfirm = (reason) => {
      // You can send 'reason' to a backend/analytics here
      console.log("Motivo de cancelación:", reason);
      setShowCancelReason(false);
      navigate(-1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><IconLoader className="animate-spin w-8 h-8 text-primary"/></div>;

  const currentExercise = workoutData[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workoutData.length - 1;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 pb-3 border-b border-border/40 bg-background/95 backdrop-blur-sm z-10"
        style={{ paddingTop: 'calc(0.75rem + var(--safe-area-top))' }}
      >
        <button onClick={handleExit} className="text-muted-foreground hover:text-foreground transition-colors">
          <IconX className="w-6 h-6" />
        </button>
        <div className="text-center">
             <h2 className="text-sm font-bold text-foreground w-48 truncate">{currentExercise.nombre}</h2>
             <p className="text-xs text-muted-foreground">
                {t("workout_session.exercise_of", { current: currentExerciseIndex + 1, total: workoutData.length })}
             </p>
        </div>
        <Button size="sm" variant="ghost" className="text-primary font-bold" onClick={handleFinishWorkout}>
            {t("workout_session.finish")}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <ExerciseUnitView 
            exerciseData={currentExercise}
            exerciseIndex={currentExerciseIndex}
            setWorkoutData={setWorkoutData}
            onSetComplete={triggerRestTimer}
        />
      </div>

       <div className="p-4 border-t border-border/40 bg-background/95 backdrop-blur-sm z-10 flex gap-3">
            <Button
                variant="outline"
                className="flex-1 rounded-full border-border/50 text-muted-foreground disabled:opacity-30"
                onClick={handlePrevExercise}
                disabled={currentExerciseIndex === 0}
            >
                {t("workout_session.prev")}
            </Button>

            {isLastExercise ? (
                 <Button 
                    className="flex-[2] rounded-full font-bold bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleFinishWorkout}
                >
                    {t("workout_session.finish_routine")} <IconCheck className="w-5 h-5 ml-2"/>
                </Button>
            ) : (
                <Button 
                    className="flex-[2] rounded-full font-bold"
                    onClick={handleNextExercise}
                >
                    {t("workout_session.next_exercise")}
                </Button>
            )}
       </div>

       <RestTimerOverlay 
          isResting={isResting}
          timeLeft={restTimeLeft}
          totalTime={restDuration}
          onCancel={cancelTimer}
          onAddSeconds={(secs) => {setRestTimeLeft(prev => prev + secs)}}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
       />

       <CancelReasonSheet 
          open={showCancelReason}
          onOpenChange={setShowCancelReason}
          onConfirm={handleCancelConfirm}
       />
    </div>
  );
}