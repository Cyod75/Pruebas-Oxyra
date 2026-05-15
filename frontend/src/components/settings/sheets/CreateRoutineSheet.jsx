import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader, IconAlertTriangle } from "../../icons/Icons";
import { API_URL } from '../../../config/api';
import { useNavigate } from "react-router-dom"; // Para redirigir a settings si es necesario
import { oxyConfirm } from "../../../utils/customAlert";

export default function CreateRoutineSheet({ open, onOpenChange, onRoutineCreated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // Estado para errores de validación/pro
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    objetivo: "Hipertrofia",
    nivel: "Intermedio",
    enfoque: "Push (Empuje)",
    musculos_custom: "",
    equipo: "Gimnasio completo"
  });

  const CUSTOM_TEXT_LIMIT = 80; // Límite en frontend un poco más estricto visualmente

  const generateRoutine = async () => {
    setErrorMsg(null);

    // Validación local
    if (formData.enfoque === "Personalizado" && !formData.musculos_custom.trim()) {
        return setErrorMsg("Por favor, especifica qué músculos entrenar.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/generate-routine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        onRoutineCreated(data.rutina); 
        onOpenChange(false);
        // Reset
        setFormData(prev => ({ ...prev, musculos_custom: "" }));
      } else {
        // MANEJO DE ERRORES INTELIGENTE
        if (res.status === 403 && data.error === "REQUIRES_PRO") {
            // Caso: No es Pro
            if(await oxyConfirm("🔒 Esta función es exclusiva para PRO.\n\n¿Quieres desbloquearla ahora?")) {
                navigate("/settings"); // O abre tu SubscriptionSheet aquí
                onOpenChange(false);
            }
        } else if (res.status === 429) {
            // Caso: Límite diario
            setErrorMsg(`⚠️ ${data.message}`);
        } else {
            // Otros errores (Filtro de contenido, etc)
            setErrorMsg(data.error || "Algo salió mal");
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Componente de Tarjeta
  const SelectionCard = ({ label, selected, onClick, className = "" }) => (
    <div 
      onClick={onClick}
      className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none ${className}
        ${selected 
          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02] font-bold" 
          : "bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        }`}
    >
      <span className="text-sm">{label}</span>
    </div>
  );

  const splitOptions = ["Push (Empuje)", "Pull (Tirón)", "Legs (Pierna)", "Torso", "Full Body", "Personalizado"];
  const equipmentOptions = [
    { value: "Gimnasio completo", label: "🏋️ Gimnasio" },
    { value: "Mancuernas y Banco", label: "dumbbell Mancuernas" },
    { value: "Peso Corporal", label: "🤸 Calistenia" },
    { value: "Casa con bandas", label: "🏠 En casa" }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92%] rounded-t-[32px] px-6 bg-background border-t border-border overflow-y-auto focus:outline-none">
        
        <SheetHeader className="mb-6 mt-6 text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <IconSparkles className="w-8 h-8 text-blue-500 animate-pulse" /> 
          </div>
          
          {/* Badge PRO */}
          <div className="flex justify-center mb-2">
             <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                PRO Feature
             </span>
          </div>

          <SheetTitle className="text-2xl font-bold text-foreground">Entrenador IA</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Diseña una sesión perfecta para hoy.
          </SheetDescription>
        </SheetHeader>

        {/* MENSAJE DE ERROR VISUAL */}
        {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <IconAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500 font-medium leading-tight">{errorMsg}</p>
            </div>
        )}

        <div className="space-y-8 pb-10">
          
          {/* 1. OBJETIVO & NIVEL */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Objetivo</label>
                <select 
                    className="w-full bg-secondary/30 border border-transparent rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                >
                    {["Hipertrofia", "Fuerza", "Resistencia", "Pérdida de Peso"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nivel</label>
                <select 
                    className="w-full bg-secondary/30 border border-transparent rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                    value={formData.nivel}
                    onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                >
                    {["Principiante", "Intermedio", "Avanzado"].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
          </div>

          {/* 2. ENFOQUE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">¿Qué entrenamos hoy?</label>
            <div className="grid grid-cols-2 gap-2">
                {splitOptions.map((split) => (
                    <SelectionCard 
                        key={split}
                        label={split}
                        selected={formData.enfoque === split}
                        onClick={() => setFormData({...formData, enfoque: split})}
                    />
                ))}
            </div>

            {/* Input Personalizado con Límite */}
            {formData.enfoque === "Personalizado" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                    <div className="flex justify-between px-1 mb-1">
                        <label className="text-[10px] font-bold text-primary uppercase">Específica músculos</label>
                        <span className={`text-[10px] font-mono ${formData.musculos_custom.length >= CUSTOM_TEXT_LIMIT ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {formData.musculos_custom.length}/{CUSTOM_TEXT_LIMIT}
                        </span>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Ej: Solo bíceps y cuello..."
                        maxLength={CUSTOM_TEXT_LIMIT}
                        className="w-full bg-secondary/20 border border-primary/50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                        value={formData.musculos_custom}
                        onChange={(e) => setFormData({...formData, musculos_custom: e.target.value})}
                        autoFocus
                    />
                </div>
            )}
          </div>

           {/* 3. EQUIPO */}
           <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Material</label>
            <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((option) => (
                    <SelectionCard 
                        key={option.value}
                        label={option.label}
                        selected={formData.equipo === option.value}
                        onClick={() => setFormData({...formData, equipo: option.value})}
                        className="min-h-[3rem]"
                    />
                ))}
            </div>
          </div>

          {/* BOTÓN GENERAR */}
          <div className="pt-4">
            <Button 
                className="w-full h-14 text-base font-bold rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all active:scale-[0.98]"
                onClick={generateRoutine}
                disabled={loading}
            >
                {loading ? (
                <div className="flex items-center gap-2">
                    <IconLoader className="h-5 w-5 animate-spin" /> 
                    <span>Consultando a Gemini...</span>
                </div>
                ) : (
                <div className="flex items-center gap-2">
                    <IconSparkles className="h-5 w-5" /> 
                    <span>Generar Rutina Pro</span>
                </div>
                )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 opacity-60">
                Uso limitado a 5 generaciones diarias.
            </p>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  );
}