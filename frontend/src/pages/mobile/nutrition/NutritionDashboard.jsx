import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import FoodSearchModal from "./FoodSearchModal";
import GoalsEditModal from "./GoalsEditModal";
import { IconEdit } from "../../../components/icons/Icons";
import { API_URL } from "../../../config/api";
import { oxyAlert } from "../../../utils/customAlert";

//  HELPERS 
const clamp  = (v, min, max) => Math.max(min, Math.min(max, v));
const token  = () => localStorage.getItem("authToken");
const authH  = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

async function apiFetch(path, opts = {}) {
  const res  = await fetch(`${API_URL}${path}`, { headers: authH(), ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error desconocido");
  return data;
}

const MEAL_SECTIONS = [
  { id: "desayuno",  label: "Desayuno",  emoji: "☀️" },
  { id: "almuerzo",  label: "Almuerzo",  emoji: "🌿" },
  { id: "cena",      label: "Cena",      emoji: "🌙" },
  { id: "snacks",    label: "Snacks",    emoji: "🍎" },
];

//  SUB-COMPONENTS 
function RingProgress({ label, value, max, unit = "", color, size = 110, strokeWidth = 10 }) {
  const pct  = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-secondary" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-foreground leading-none">{Math.round(value)}</span>
          <span className="text-[10px] font-medium text-muted-foreground leading-none mt-0.5">{unit}</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold text-muted-foreground w-20 text-right shrink-0">
        {Math.round(value)}/{Math.round(max)}g
      </span>
    </div>
  );
}

function WaterTracker({ waterMl, goalMl, onAdd, onRemove, loading }) {
  const { t } = useTranslation();
  const glasses = Math.round(waterMl / 250);
  const goal    = Math.round(goalMl / 250);
  const pct     = Math.min((waterMl / goalMl) * 100, 100);

  return (
    <div className="rounded-[22px] p-4 bg-card border border-border/40 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💧</span>
          <div>
            <p className="text-sm font-bold text-foreground">{t("nutrition.hydration")}</p>
            <p className="text-[11px] text-muted-foreground">{waterMl} / {goalMl} ml</p>
          </div>
        </div>
        <span className="text-[11px] font-bold" style={{ color: pct >= 100 ? "#34d399" : "#3b82f6" }}>
          {Math.round(pct)}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#3b82f6,#06b6d4)" }} />
      </div>

      {/* Iconos de vasos */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: Math.max(goal, glasses) }).map((_, i) => (
          <span key={i} className="text-base" style={{ opacity: i < glasses ? 1 : 0.2 }}>💧</span>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onRemove} disabled={loading || glasses === 0}
          className="flex-1 h-9 rounded-[12px] text-xs font-bold text-muted-foreground bg-secondary active:scale-95 transition-all disabled:opacity-40">
          − 250 ml
        </button>
        <button onClick={onAdd} disabled={loading}
          className="flex-1 h-9 rounded-[12px] text-xs font-bold text-white active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
          + 250 ml
        </button>
      </div>
    </div>
  );
}

function FoodEntry({ entry, onRemove, removing }) {
  const factor = entry.gramos / 100;
  const kcal   = entry.kcal ?? Math.round((entry.kcal_100g || 0) * factor);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {entry.imagen_url && (
          <img src={entry.imagen_url} alt={entry.nombre} className="w-8 h-8 rounded-[8px] object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{entry.nombre}</p>
          <p className="text-[11px] text-muted-foreground">{entry.gramos}g · {Math.round(kcal)} kcal</p>
        </div>
      </div>
      <button onClick={() => onRemove(entry.idRegistro)} disabled={removing}
        className="ml-3 h-7 w-7 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform shrink-0 disabled:opacity-40">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
             strokeLinecap="round" className="w-3.5 h-3.5 text-muted-foreground">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

function MealCard({ section, entries, onAdd, onRemove, removing }) {
  const { t } = useTranslation();
  const totalKcal = entries.reduce((s, e) => s + Number(e.kcal || 0), 0);

  return (
    <div className="rounded-[22px] overflow-hidden bg-card border border-border/40 shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{section.emoji}</span>
          <div>
            <p className="text-sm font-bold text-foreground">{t(`nutrition.meals.${section.id}`)}</p>
            <p className="text-[11px] text-muted-foreground">{Math.round(totalKcal)} kcal</p>
          </div>
        </div>
        <button onClick={() => onAdd(section.id)}
          className="h-8 w-8 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 shadow-lg"
          style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
          aria-label={`Añadir alimento a ${section.label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
               strokeLinecap="round" className="w-4 h-4">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {entries.length > 0 && (
        <div className="px-4 pb-3">
          {entries.map(e => (
            <FoodEntry key={e.idRegistro} entry={e} onRemove={onRemove} removing={removing} />
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-[12px] text-muted-foreground/60 flex items-center gap-1.5 italic" dangerouslySetInnerHTML={{ __html: t("nutrition.touch_to_add") }} />
        </div>
      )}
    </div>
  );
}

//  MAIN COMPONENT 
export default function NutritionDashboard() {
  const { t } = useTranslation();
  const [registros,        setRegistros]        = useState([]);
  const [objetivos,        setObjetivos]        = useState({ calorias_dia:2000, proteinas_g:150, carbos_g:200, grasas_g:70, agua_ml:2500 });
  const [waterMl,          setWaterMl]          = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [waterLoading,     setWaterLoading]     = useState(false);
  const [removingId,       setRemovingId]       = useState(null);
  const [searchModalOpen,  setSearchModalOpen]  = useState(false);
  const [goalsModalOpen,   setGoalsModalOpen]   = useState(false);
  const [activeMealId,     setActiveMealId]     = useState(null);
  const [error,            setError]            = useState(null);

  //  Carga inicial del día 
  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/nutrition/today");
      setRegistros(data.registros || []);
      setWaterMl(Number(data.agua_ml) || 0);
      if (data.objetivos) setObjetivos(data.objetivos);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  //  Reset automático al cambiar de día 
  // Compara la fecha actual cada minuto. Si cambió, recarga.
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        fetchToday(); // Nuevo día → recarga (los datos de hoy serán 0)
      }
    }, 60_000); // Chequeo cada minuto
    return () => clearInterval(interval);
  }, [fetchToday]);

  //  Totales
  const totals = registros.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.kcal        || 0),
      protein:  acc.protein  + Number(e.proteinas_g || 0),
      carbs:    acc.carbs    + Number(e.carbos_g    || 0),
      fat:      acc.fat      + Number(e.grasas_g    || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  //  Handlers
  const handleOpenAdd = (mealId) => {
    setActiveMealId(mealId);
    setSearchModalOpen(true);
  };

  const handleFoodSelected = useCallback(async (food) => {
    setSearchModalOpen(false);
    const n = food.nutritionPer100 || {};
    try {
      await apiFetch("/api/nutrition/log", {
        method: "POST",
        body: JSON.stringify({
          comida:         activeMealId,
          nombre:         food.name,
          marca:          food.brand   || null,
          imagen_url:     food.image   || null,
          barcode:        food.barcode || null,
          gramos:         food.grams,
          kcal_100g:      n.calories   || 0,
          proteinas_100g: n.protein    || 0,
          carbos_100g:    n.carbs      || 0,
          grasas_100g:    n.fat        || 0,
        }),
      });
      await fetchToday();
    } catch (e) {
      await oxyAlert(`Error al guardar: ${e.message}`);
    }
  }, [activeMealId, fetchToday]);

  const handleRemoveEntry = useCallback(async (id) => {
    setRemovingId(id);
    try {
      await apiFetch(`/api/nutrition/log/${id}`, { method: "DELETE" });
      setRegistros(prev => prev.filter(r => r.idRegistro !== id));
    } catch (e) {
      await oxyAlert(`Error al eliminar: ${e.message}`);
    } finally {
      setRemovingId(null);
    }
  }, []);

  const handleAddWater = useCallback(async () => {
    setWaterLoading(true);
    try {
      await apiFetch("/api/nutrition/water", { method: "POST", body: JSON.stringify({ cantidad_ml: 250 }) });
      setWaterMl(prev => prev + 250);
    } catch (e) { /* silente */ } finally { setWaterLoading(false); }
  }, []);

  const handleRemoveWater = useCallback(async () => {
    setWaterLoading(true);
    try {
      await apiFetch("/api/nutrition/water", { method: "DELETE" });
      setWaterMl(prev => Math.max(0, prev - 250));
    } catch (e) { /* silente */ } finally { setWaterLoading(false); }
  }, []);

  const remainingKcal = Math.max(0, objetivos.calorias_dia - totals.calories);

  //  Render
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
          <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round"/>
        </svg>
        <p className="text-sm text-muted-foreground">{t("nutrition.loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full pb-10">

        {error && (
          <div className="mx-5 mb-4 px-4 py-3 rounded-[16px] text-sm text-red-400"
               style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            ⚠️ {t("nutrition.error")} — <button onClick={fetchToday} className="underline">{t("nutrition.retry")}</button>
          </div>
        )}

        {/*  CALORIE SUMMARY RING  */}
        <div className="mx-5 mb-4 rounded-[24px] p-5 bg-card border border-border/40 shadow-sm relative">
          <button 
            onClick={() => setGoalsModalOpen(true)}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95 transition-all outline-none z-20"
            aria-label="Editar Objetivos"
          >
            <IconEdit className="w-[18px] h-[18px]" strokeWidth="2.5" />
          </button>

          <div className="flex items-center justify-center translate-x-4 gap-10 sm:gap-14 w-full pt-2 pb-2">
            <RingProgress label={t("nutrition.calories")} value={totals.calories} max={objetivos.calorias_dia}
              unit="kcal" color="#3b82f6" size={130} strokeWidth={10} />
            <div className="w-[120px] space-y-2.5">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t("nutrition.goal")}</p>
                <p className="text-[28px] leading-none font-black text-foreground mt-1">{Math.round(objetivos.calorias_dia)}</p>
              </div>
              <div className="h-px bg-border/40 w-full" />
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t("nutrition.remaining")}</p>
                <p className="text-[28px] leading-none font-black mt-1" style={{ color: remainingKcal === 0 ? "#f87171" : "#34d399" }}>
                  {Math.round(remainingKcal)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-around mt-5 pt-4 border-t border-border/40">
            <RingProgress label={t("nutrition.protein")} value={totals.protein} max={objetivos.proteinas_g} unit="g" color="#a78bfa" size={78} strokeWidth={7} />
            <RingProgress label={t("nutrition.carbs")}   value={totals.carbs}   max={objetivos.carbos_g}   unit="g" color="#f59e0b" size={78} strokeWidth={7} />
            <RingProgress label={t("nutrition.fat")}    value={totals.fat}     max={objetivos.grasas_g}   unit="g" color="#f87171" size={78} strokeWidth={7} />
          </div>

          <div className="mt-4 space-y-2.5">
            <MacroBar label={t("nutrition.protein")} value={totals.protein} max={Math.round(objetivos.proteinas_g)} color="#a78bfa" />
            <MacroBar label={t("nutrition.carbs")}   value={totals.carbs}   max={Math.round(objetivos.carbos_g)}   color="#f59e0b" />
            <MacroBar label={t("nutrition.fat")}    value={totals.fat}     max={Math.round(objetivos.grasas_g)}   color="#f87171" />
          </div>
        </div>

        {/*  HIDRATACIÓN  */}
        <div className="mx-5 mb-4">
          <WaterTracker
            waterMl={waterMl}
            goalMl={objetivos.agua_ml || 2500}
            onAdd={handleAddWater}
            onRemove={handleRemoveWater}
            loading={waterLoading}
          />
        </div>

        {/*  MEAL CARDS  */}
        <div className="px-5 space-y-3 pb-safe">
          {MEAL_SECTIONS.map(section => (
            <MealCard
              key={section.id}
              section={section}
              entries={registros.filter(r => r.comida === section.id)}
              onAdd={handleOpenAdd}
              onRemove={handleRemoveEntry}
              removing={removingId !== null}
            />
          ))}
        </div>
      </div>

      {/*  FOOD SEARCH MODAL  */}
      {searchModalOpen && (
        <FoodSearchModal
          mealLabel={activeMealId ? t(`nutrition.meals.${activeMealId}`) : ""}
          onSelect={handleFoodSelected}
          onClose={() => setSearchModalOpen(false)}
        />
      )}

      {/*  GOALS EDIT MODAL  */}
      {goalsModalOpen && (
        <GoalsEditModal
          open={goalsModalOpen}
          onClose={() => setGoalsModalOpen(false)}
          objetivos={objetivos}
          onSaved={() => {
            setGoalsModalOpen(false);
            fetchToday();
            oxyAlert("✅ Objetivos de dieta actualizados");
          }}
        />
      )}
    </>
  );
}
