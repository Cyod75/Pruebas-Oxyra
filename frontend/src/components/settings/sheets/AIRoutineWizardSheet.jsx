import React, { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle
} from "@/components/ui/sheet";
import {
  IconSparkles,
  IconLoader,
  IconCheck,
  IconCrown,
} from "../../icons/Icons";
import { API_URL } from "../../../config/api";
import { useNavigate } from "react-router-dom";

// Onboarding-like assets for visual option cards
import imgLoseWeight from "../../../assets/assets/images/onboarding/main_fitness_objective/lose_weight.svg";
import imgStrength from "../../../assets/assets/images/onboarding/main_fitness_objective/gain_strength.svg";
import imgMuscle from "../../../assets/assets/images/onboarding/main_fitness_objective/gain_muscle.png";
import imgAthletic from "../../../assets/assets/images/onboarding/main_fitness_objective/be_more_athletic.png";
import iconHome from "../../../assets/assets/icons/onboarding/home_icon.svg";
import iconDumbbell from "../../../assets/assets/icons/onboarding/dumbell_icon.svg";
import iconCalisthenics from "../../../assets/assets/icons/onboarding/calisthenics_icon.svg";
import iconGym from "../../../assets/assets/icons/onboarding/gym_equipment_icon.svg";
import imgMusclePull from "../../../assets/assets/images/shared/image_lats.png";
import imgMusclePullSelected from "../../../assets/assets/images/shared/image_lats_selected.png";
import imgMusclePush from "../../../assets/assets/images/shared/image_chest.png";
import imgMusclePushSelected from "../../../assets/assets/images/shared/image_chest_selected.png";
import imgMuscleUpper from "../../../assets/assets/images/shared/image_upperback.png";
import imgMuscleUpperSelected from "../../../assets/assets/images/shared/image_upperback_selected.png";
import imgMuscleLower from "../../../assets/assets/images/shared/image_quads.png";
import imgMuscleLowerSelected from "../../../assets/assets/images/shared/image_quads_selected.png";

//  Inline SVG Icons not in Icons.jsx 

const IconArrowLeft = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconSend = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconFlame = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
  </svg>
);

const IconBolt = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconDroplet = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const IconActivity = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconHome2 = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBarbell = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1" />
    <path d="m3 3 1 1" />
    <path d="m18 22 4-4" />
    <path d="m2 6 4-4" />
    <path d="m3 10 7-7" />
    <path d="m14 21 7-7" />
  </svg>
);

const IconHuman = ({ className = "w-12 h-12" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="4" r="2" />
    <path d="M15 8H9l-3 8h1l1-3h8l1 3h1z" />
    <path d="M9 13v7" />
    <path d="M15 13v7" />
  </svg>
);

//  Wizard Config 

const TOTAL_STEPS = 4;

const OBJECTIVES = [
  { id: "muscle", label: "Ganar músculo", imgSrc: imgMuscle },
  { id: "strength", label: "Ganar fuerza", imgSrc: imgStrength },
  { id: "fat", label: "Perder grasa", imgSrc: imgLoseWeight },
  { id: "functional", label: "Ser más atlético", imgSrc: imgAthletic },
];

const DURATIONS = [
  { id: "15", label: "15 minutos", subtitle: "Express" },
  { id: "30", label: "30 minutos", subtitle: "Eficiente" },
  { id: "45", label: "45 minutos", subtitle: "En serio" },
  { id: "60", label: "60 minutos", subtitle: "Intenso" },
  { id: "90", label: "90+ minutos", subtitle: "Obsesivo" },
];

const MUSCLES = [
  { id: "custom", label: "Elegir músculos", desc: "Personaliza al máximo", imgSrc: null, imgSelectedSrc: null },
  { id: "pull", label: "Músculos de Tracción", desc: "Espalda, bíceps, romboides", imgSrc: imgMusclePull, imgSelectedSrc: imgMusclePullSelected },
  { id: "push", label: "Músculos de Empuje", desc: "Pecho, hombros, tríceps", imgSrc: imgMusclePush, imgSelectedSrc: imgMusclePushSelected },
  { id: "upper", label: "Parte Superior", desc: "Todo el tren superior", imgSrc: imgMuscleUpper, imgSelectedSrc: imgMuscleUpperSelected },
  { id: "lower", label: "Parte Inferior", desc: "Piernas, glúteos, gemelos", imgSrc: imgMuscleLower, imgSelectedSrc: imgMuscleLowerSelected },
];

const CUSTOM_MUSCLES_LIST = [
  { id: "Pecho", label: "Pecho", type: "major" },
  { id: "Espalda", label: "Espalda", type: "major" },
  { id: "Hombro", label: "Hombro", type: "major" },
  { id: "Cuadriceps", label: "Cuádriceps", type: "major" },
  { id: "Isquiosurales", label: "Isquios", type: "major" },
  { id: "Gluteo", label: "Glúteo", type: "major" },
  { id: "Biceps", label: "Bíceps", type: "minor" },
  { id: "Triceps", label: "Tríceps", type: "minor" },
  { id: "Antebrazo", label: "Antebrazo", type: "minor" },
  { id: "Gemelo", label: "Gemelo", type: "minor" },
  { id: "Abdomen", label: "Abdomen", type: "minor" }
];

const EQUIPMENT = [
  { id: "home", label: "Equipamiento en casa", imgSrc: iconHome },
  { id: "small_gym", label: "Gimnasio pequeño", imgSrc: iconDumbbell },
  { id: "calisthenics", label: "Calistenia", imgSrc: iconCalisthenics },
  { id: "commercial_gym", label: "Gimnasio comercial", imgSrc: iconGym },
];

//  Sub-Components 

/** Progress bar with step dots */
const ProgressBar = ({ current, total }) => (
  <div className="flex flex-col gap-2 px-1">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
        Paso {current} de {total}
      </span>
      <span className="text-[11px] font-bold text-primary">
        {Math.round((current / total) * 100)}%
      </span>
    </div>
    <div className="relative h-1.5 bg-secondary/60 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  </div>
);

/** Card used in page 1 and page 4 */
const IconCard = ({ label, icon, imgSrc, selected, onClick, cornerLayout = false }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col rounded-[20px] border transition-all duration-200 active:scale-[0.96] select-none w-full overflow-hidden min-h-[118px]
      ${
        selected
          ? "bg-primary/10 border-primary/60 shadow-md shadow-primary/10"
          : "bg-secondary/30 border-transparent hover:bg-secondary/60"
      }`}
  >
    {selected && (
      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <IconCheck className="w-3 h-3 text-primary-foreground" />
      </div>
    )}
    {cornerLayout ? (
      <>
        <div className="w-full p-5 pr-12 text-left">
          <span
            className={`block text-[15px] font-semibold leading-tight transition-colors ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {label}
          </span>
        </div>
        {imgSrc && (
          <div className="absolute right-[2px] bottom-[2px] pointer-events-none">
            <img src={imgSrc} alt="" className="w-[68px] h-[68px] object-contain" />
          </div>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center justify-center gap-3 p-5 min-h-[110px]">
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-11 h-11 object-contain" />
        ) : (
          <div className={`transition-colors ${selected ? "text-primary" : "text-muted-foreground"}`}>
            {icon}
          </div>
        )}
        <span
          className={`text-sm font-semibold text-center leading-tight transition-colors ${
            selected ? "text-primary" : "text-foreground"
          }`}
        >
          {label}
        </span>
      </div>
    )}
  </button>
);

/** Wide row button used in page 2 */
const RowButton = ({ label, subtitle, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 rounded-[16px] border transition-all duration-200 active:scale-[0.98] select-none
      ${
        selected
          ? "bg-primary/10 border-primary/60 shadow-sm shadow-primary/10"
          : "bg-secondary/30 border-transparent hover:bg-secondary/60"
      }`}
  >
    <div className="text-left">
      <span
        className={`block font-bold text-sm transition-colors ${
          selected ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </span>
      <span className="block text-xs text-muted-foreground mt-0.5">{subtitle}</span>
    </div>
    {selected && (
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
        <IconCheck className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
    )}
  </button>
);

/** Muscle card used in page 3 */
const MuscleCard = ({ label, selected, onClick, wide = false, imgSrc, imgSelectedSrc }) => (
  <button
    onClick={onClick}
    className={`relative flex justify-between gap-3 p-4 rounded-[20px] border transition-all duration-200 active:scale-[0.96] select-none overflow-hidden
      ${wide ? "col-span-2 min-h-[108px]" : "min-h-[132px]"}
      ${imgSrc ? "items-start" : "items-center"}
      ${
        selected
          ? "bg-primary/10 border-primary/60 shadow-md shadow-primary/10"
          : "bg-secondary/30 border-transparent hover:bg-secondary/60"
      }`}
  >
    {selected && (
      <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <IconCheck className="w-3 h-3 text-primary-foreground" />
      </div>
    )}
    <div className={`w-full min-w-0 relative z-10 ${imgSrc ? "text-left pr-10" : "text-center pr-0"}`}>
      <span
        className={`block text-sm font-bold leading-tight transition-colors ${
          selected ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </div>
    {imgSrc && (
      <div className="absolute right-[-6px] bottom-[-6px] opacity-90 pointer-events-none">
        <img
          src={selected ? (imgSelectedSrc || imgSrc) : imgSrc}
          alt=""
          className="w-24 h-24 object-contain"
        />
      </div>
    )}
  </button>
);

/** Continue / CTA button */
const ContinueButton = ({ label = "Continuar", onClick, disabled, loading = false, children }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full h-14 rounded-full font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <IconLoader className="w-5 h-5 animate-spin" />
        <span>Consultando a Gemini...</span>
      </>
    ) : (
      children || label
    )}
  </button>
);

//  PAYWALL MODAL 

const PaywallModal = ({ onClose, onSubscribe, loading }) => (
  <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-6">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    />
    <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col gap-6 animate-in zoom-in-95 slide-in-from-bottom-6 duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
          <IconCrown className="w-7 h-7 text-yellow-500" />
        </div>
        <div>
          <span className="block text-xs font-black text-yellow-500 uppercase tracking-widest mb-1">
            Función PRO
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Hazte PRO
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Genera rutinas ilimitadas con Gemini AI
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2.5">
        {[
          "IA Generativa ilimitada",
          "Rutinas personalizadas al máximo",
          "Sin límite de generaciones diarias",
        ].map((b) => (
          <div key={b} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <IconCheck className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-sm text-zinc-300">{b}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={onSubscribe}
          disabled={loading}
          className="w-full h-13 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <IconLoader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <IconCrown className="w-4 h-4" />
              <span>Desbloquear por 9.99€/mes</span>
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-semibold"
        >
          Ahora no
        </button>
      </div>
    </div>
  </div>
);

//  PAGES 

/** Page 1: Objective */
const Page1 = ({ answers, setAnswers }) => {
  const [inputValue, setInputValue] = useState(answers.objetivo || "");

  const handleCardClick = (label) => {
    setInputValue(label);
    setAnswers((prev) => ({ ...prev, objetivo: label }));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setAnswers((prev) => ({ ...prev, objetivo: val }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Elige tu objetivo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona o escribe tu meta principal
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {OBJECTIVES.map((obj) => (
          <IconCard
            key={obj.id}
            label={obj.label}
            icon={obj.icon}
            imgSrc={obj.imgSrc}
            cornerLayout
            selected={inputValue === obj.label}
            onClick={() => handleCardClick(obj.label)}
          />
        ))}
      </div>

      {/* Text input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="O escribe tu objetivo personalizado..."
          className="w-full bg-secondary/30 border border-transparent focus:border-primary/50 rounded-2xl px-4 py-3.5 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300"
        />
        {inputValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
            <IconSend />
          </div>
        )}
      </div>
    </div>
  );
};

/** Page 2: Session duration */
const Page2 = ({ answers, setAnswers }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
        Duración de tu sesión
      </h2>
      <p className="text-sm text-muted-foreground mt-1">¿Cuánto tiempo tienes hoy?</p>
    </div>
    <div className="flex flex-col gap-2.5">
      {DURATIONS.map((d) => (
        <RowButton
          key={d.id}
          label={d.label}
          subtitle={d.subtitle}
          selected={answers.duracion === d.id}
          onClick={() => setAnswers((prev) => ({ ...prev, duracion: d.id }))}
        />
      ))}
    </div>
  </div>
);

/** Page 3: Muscles */
const Page3 = ({ answers, setAnswers }) => {
  const toggleCustomMuscle = (id) => {
    setAnswers((prev) => {
      const current = prev.customMuscles;
      if (current.includes(id)) {
        return { ...prev, customMuscles: current.filter((m) => m !== id) };
      } else {
        return { ...prev, customMuscles: [...current, id] };
      }
    });
  };

  const hasMajor = answers.customMuscles.some((m) =>
    CUSTOM_MUSCLES_LIST.find((cm) => cm.id === m)?.type === "major"
  );
  const isValidCustom = answers.customMuscles.length >= 2 || hasMajor;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Músculos a trabajar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Selecciona un grupo muscular</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MUSCLES.map((m, i) => (
          <MuscleCard
            key={m.id}
            label={m.label}
            imgSrc={m.imgSrc}
            imgSelectedSrc={m.imgSelectedSrc}
            selected={answers.musculos === m.id}
            onClick={() => setAnswers((prev) => ({ ...prev, musculos: m.id }))}
            wide={i === MUSCLES.length - 1 && MUSCLES.length % 2 !== 0}
          />
        ))}
      </div>

      {answers.musculos === "custom" && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-3 border-t border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Elige tus músculos</h3>
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              {answers.customMuscles.length} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {CUSTOM_MUSCLES_LIST.map((cm) => {
              const isSelected = answers.customMuscles.includes(cm.id);
              return (
                <button
                  key={cm.id}
                  onClick={() => toggleCustomMuscle(cm.id)}
                  className={`px-4 py-2.5 rounded-[12px] text-xs font-bold border transition-all active:scale-95 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                      : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary/70 hover:text-foreground"
                  }`}
                >
                  {cm.label}
                </button>
              );
            })}
          </div>

          {answers.customMuscles.length > 0 && !isValidCustom && (
            <p className="text-xs text-amber-500 font-medium animate-in fade-in">
              * Selecciona al menos 1 músculo grande o 2 músculos pequeños.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/** Page 4: Equipment */
const Page4 = ({ answers, setAnswers }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
        Máquinas disponibles
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        ¿Dónde vas a entrenar hoy?
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {EQUIPMENT.map((eq) => (
        <IconCard
          key={eq.id}
          label={eq.label}
          icon={eq.icon}
          imgSrc={eq.imgSrc}
          cornerLayout
          selected={answers.equipo === eq.id}
          onClick={() => setAnswers((prev) => ({ ...prev, equipo: eq.id }))}
        />
      ))}
    </div>
  </div>
);

//  MAIN WIZARD 

export default function AIRoutineWizardSheet({
  open,
  onOpenChange,
  onRoutineCreated,
  isPro = false,
}) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    objetivo: "",
    duracion: "",
    musculos: "",
    customMuscles: [],
    equipo: "",
  });
  const [direction, setDirection] = useState("forward"); // "forward" | "backward"
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLoading, setPaywallLoading] = useState(false);

  // Reset on close
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setAnswers({ objetivo: "", duracion: "", musculos: "", customMuscles: [], equipo: "" });
        setLoading(false);
        setShowPaywall(false);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const canContinue = useCallback(() => {
    if (step === 1) return answers.objetivo.trim().length > 0;
    if (step === 2) return !!answers.duracion;
    if (step === 3) {
      if (!answers.musculos) return false;
      if (answers.musculos === "custom") {
        const hasMajor = answers.customMuscles.some((m) =>
          CUSTOM_MUSCLES_LIST.find((cm) => cm.id === m)?.type === "major"
        );
        return answers.customMuscles.length >= 2 || hasMajor;
      }
      return true;
    }
    if (step === 4) return !!answers.equipo;
    return false;
  }, [step, answers]);

  const goNext = () => {
    if (!canContinue()) return;
    if (step < TOTAL_STEPS) {
      setDirection("forward");
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection("backward");
      setStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    if (!canContinue()) return;

    // Paywall gate
    if (!isPro) {
      setShowPaywall(true);
      return;
    }

    // Build payload
    const DURATION_MAP = { "15": "15 minutos", "30": "30 minutos", "45": "45 minutos", "60": "60 minutos", "90": "90+ minutos" };
    const MUSCLE_MAP = {
      pull: "Músculos de Tracción (espalda, bíceps)",
      push: "Músculos de Empuje (pecho, hombros, tríceps)",
      upper: "Parte Superior del Cuerpo",
      lower: "Parte Inferior del Cuerpo",
    };
    const EQUIP_MAP = {
      home: "Equipamiento en casa",
      small_gym: "Gimnasio pequeño",
      calisthenics: "Equipamiento de calistenia",
      commercial_gym: "Gimnasio comercial",
    };

    const finalMuscles = answers.musculos === "custom" 
      ? answers.customMuscles.join(", ")
      : MUSCLE_MAP[answers.musculos] || answers.musculos;

    const payload = {
      objetivo: answers.objetivo,
      duracion: DURATION_MAP[answers.duracion] || answers.duracion,
      enfoque: finalMuscles,
      equipo: EQUIP_MAP[answers.equipo] || answers.equipo,
      nivel: "Intermedio" // Requerido por el backend
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/generate-routine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onRoutineCreated(data.rutina);
        handleOpenChange(false);
      } else {
        console.error("Error generating routine:", data);
      }
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaywallSubscribe = async () => {
    setPaywallLoading(true);
    // Redirect to settings for subscription management
    setTimeout(() => {
      setPaywallLoading(false);
      setShowPaywall(false);
      handleOpenChange(false);
      navigate("/settings");
    }, 800);
  };

  const renderPage = () => {
    switch (step) {
      case 1:
        return <Page1 answers={answers} setAnswers={setAnswers} />;
      case 2:
        return <Page2 answers={answers} setAnswers={setAnswers} />;
      case 3:
        return <Page3 answers={answers} setAnswers={setAnswers} />;
      case 4:
        return <Page4 answers={answers} setAnswers={setAnswers} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[94%] rounded-t-[32px] bg-background border-t border-border focus:outline-none flex flex-col overflow-hidden p-0"
        >
          {/* Required for screen readers */}
          <SheetTitle className="sr-only">Crear Rutina con IA</SheetTitle>

          {/*  TOP BAR  */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 space-y-4">
            {/* Back button or IA label */}
            <div className="flex items-center">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconArrowLeft />
                  <span>Volver</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <IconSparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">
                    Crear con IA
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            <ProgressBar current={step} total={TOTAL_STEPS} />
          </div>

          {/*  SCROLLABLE CONTENT  */}
          <div
            key={step}
            className="flex-1 overflow-y-auto px-5 py-2 animate-in fade-in slide-in-from-right-4 duration-300"
            style={{
              animationDirection: direction === "backward" ? "normal" : "normal",
            }}
          >
            {renderPage()}
            {/* Bottom padding to clear the CTA */}
            <div className="h-6" />
          </div>

          {/*  CTA BUTTON  */}
          <div className="flex-shrink-0 px-5 pb-8 pt-4 border-t border-border/40 bg-background">
            {step < TOTAL_STEPS ? (
              <ContinueButton
                onClick={goNext}
                disabled={!canContinue()}
              />
            ) : (
              <ContinueButton
                onClick={handleFinish}
                disabled={!canContinue()}
                loading={loading}
              >
                <IconSparkles className="w-5 h-5" />
                <span>Crear Entrenamiento</span>
              </ContinueButton>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/*  PAYWALL MODAL (rendered outside sheet to avoid stacking context issues)  */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSubscribe={handlePaywallSubscribe}
          loading={paywallLoading}
        />
      )}
    </>
  );
}
