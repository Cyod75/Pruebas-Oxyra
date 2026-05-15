import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/api";
import { oxyAlert } from "../../../utils/customAlert";

const StepperInput = ({ label, value, onChange, min = 0, step = 10, colorClass = "text-primary" }) => (
  <div className="bg-secondary/40 rounded-[20px] p-2.5 border border-border/40 transition-all focus-within:border-border/80">
    <div className="flex items-center justify-between mb-1.5 px-1">
      <label className={`text-[10px] font-extrabold uppercase tracking-widest ${colorClass}`}>{label}</label>
    </div>
    <div className="flex items-center justify-between bg-background rounded-full p-[3px] shadow-sm border border-border/10">
      <button 
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground active:scale-90 transition-all font-bold text-xl"
      >−</button>
      <div className="flex-1 px-1 h-10 flex items-center justify-center relative">
        <input 
          type="number"
          min={min}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-center font-black text-[18px] text-foreground focus:outline-none appearance-none"
        />
      </div>
      <button 
        type="button"
        onClick={() => onChange(value + step)}
        className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground active:scale-90 transition-all font-bold text-xl"
      >+</button>
    </div>
  </div>
);

export default function GoalsEditModal({ open, onClose, objetivos, onSaved }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [caloriasDia, setCaloriasDia] = useState(Math.round(objetivos.calorias_dia || 2000));
  const [proteinasG, setProteinasG] = useState(Math.round(objetivos.proteinas_g || 150));
  const [carbosG, setCarbosG] = useState(Math.round(objetivos.carbos_g || 200));
  const [grasasG, setGrasasG] = useState(Math.round(objetivos.grasas_g || 70));
  const [aguaMl, setAguaMl] = useState(Math.round(objetivos.agua_ml || 2500));

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/nutrition/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          objetivo: objetivos.objetivo || "mantener",
          calorias_dia: caloriasDia,
          proteinas_g: proteinasG,
          carbos_g: carbosG,
          grasas_g: grasasG,
          agua_ml: aguaMl
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando objetivos");

      onSaved();
    } catch (e) {
      oxyAlert(`Error al guardar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="w-full h-auto max-h-[85dvh] sm:max-w-sm bg-background/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:scale-95 sm:zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between shrink-0 bg-background/50">
          <h2 className="text-lg font-bold tracking-tight">Editar Objetivos</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center active:scale-90 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-5 space-y-3.5">
          <StepperInput 
            label={`${t("nutrition.calories")} (kcal)`} 
            value={caloriasDia} 
            onChange={setCaloriasDia} 
            step={50} 
            colorClass="text-blue-400" 
          />
          <div className="grid grid-cols-2 gap-3.5">
            <StepperInput 
              label={`${t("nutrition.protein")} (g)`} 
              value={proteinasG} 
              onChange={setProteinasG} 
              step={5} 
              colorClass="text-purple-400" 
            />
            <StepperInput 
              label={`${t("nutrition.carbs")} (g)`} 
              value={carbosG} 
              onChange={setCarbosG} 
              step={5} 
              colorClass="text-amber-500" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <StepperInput 
              label={`${t("nutrition.fat")} (g)`} 
              value={grasasG} 
              onChange={setGrasasG} 
              step={5} 
              colorClass="text-red-400" 
            />
            <StepperInput 
              label={`${t("nutrition.hydration")} (ml)`} 
              value={aguaMl} 
              onChange={setAguaMl} 
              step={250} 
              colorClass="text-cyan-400" 
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-border/40 shrink-0 bg-background/50">
          <button 
            disabled={loading} 
            onClick={handleSave} 
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? "Guardando..." : "Guardar Objetivos"}
          </button>
        </div>

      </div>
    </div>
  );
}
