/* eslint-disable i18next/no-literal-string */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config/api";
import { RANK_ICONS } from "../../components/shared/ranksHelpers";
import { IconSparkles, IconLoader, IconCheck } from "../../components/icons/Icons";
import slide1 from "../../assets/images/onboarding/onboarding_phone_ranks.png";
import slide2 from "../../assets/images/onboarding/onboarding_phone_home.png";
import slide3 from "../../assets/images/onboarding/onboarding_phone_ranking.png";
import "./OnboardingPage.css";

//  NEW PREMIUM ASSETS 
// Goals
import imgLoseWeight from "../../assets/assets/images/onboarding/main_fitness_objective/lose_weight.svg";
import imgStrength from "../../assets/assets/images/onboarding/main_fitness_objective/gain_strength.svg";
import imgMuscle from "../../assets/assets/images/onboarding/main_fitness_objective/gain_muscle.png";
import imgAthletic from "../../assets/assets/images/onboarding/main_fitness_objective/be_more_athletic.png";

// Motivations
import imgConfidence from "../../assets/assets/images/onboarding/body_goal_reason/more_confidence.svg";
import imgAttractive from "../../assets/assets/images/onboarding/body_goal_reason/more_attractive.svg";
import imgHealth from "../../assets/assets/images/onboarding/body_goal_reason/improve_health.svg";
import imgEnergy from "../../assets/assets/images/onboarding/body_goal_reason/more_energy.svg";
import imgRespect from "../../assets/assets/images/onboarding/body_goal_reason/get_more_respect.svg";
import imgPotential from "../../assets/assets/images/onboarding/body_goal_reason/reach_my_potential.svg";

// Frequency
import imgFreqNotMuch from "../../assets/assets/images/onboarding/choose_thought_frequency/none.svg";
import imgFreqSometimes from "../../assets/assets/images/onboarding/choose_thought_frequency/a_bit.svg";
import imgFreqAlot from "../../assets/assets/images/onboarding/choose_thought_frequency/a_lot.svg";
import imgFreqAlways from "../../assets/assets/images/onboarding/choose_thought_frequency/all_the_time.svg";

// Obstacles
import imgObsTime from "../../assets/assets/images/onboarding/body_goal_barrier/lack_of_time.svg";
import imgObsKnowledge from "../../assets/assets/images/onboarding/body_goal_barrier/lack_of_knowledge.svg";
import imgObsMotivation from "../../assets/assets/images/onboarding/body_goal_barrier/low_motivation.svg";
import imgObsInjury from "../../assets/assets/images/onboarding/body_goal_barrier/physical_injuries.svg";
import imgObsEquipment from "../../assets/assets/images/onboarding/body_goal_barrier/lack_of_equipment.svg";
import imgObsNever from "../../assets/assets/images/onboarding/body_goal_barrier/never_tried.svg";

// Experience
import imgExpNever from "../../assets/assets/images/onboarding/training_experience/never_before.svg";
import imgExpBeginner from "../../assets/assets/images/onboarding/training_experience/beginner.svg";
import imgExpIntermediate from "../../assets/assets/images/onboarding/training_experience/intermediate.svg";
import imgExpAdvanced from "../../assets/assets/images/onboarding/training_experience/advanced.svg";

// Gender
import imgMale from "../../assets/assets/images/onboarding/gender/male.svg";
import imgFemale from "../../assets/assets/images/onboarding/gender/female.svg";

// Injuries
import imgInjBack from "../../assets/assets/images/onboarding/injuries/back_pain.png";
import imgInjKnee from "../../assets/assets/images/onboarding/injuries/knee_pain.png";
import imgInjHip from "../../assets/assets/images/onboarding/injuries/hip_pain.png";
import imgInjElbow from "../../assets/assets/images/onboarding/injuries/elbow_pain.png";
import imgInjShoulder from "../../assets/assets/images/onboarding/injuries/shoulder_pain.png";
import imgInjWrist from "../../assets/assets/images/onboarding/injuries/wrist_pain.png";

// Equipment
import iconHome from "../../assets/assets/icons/onboarding/home_icon.svg";
import iconDumbbell from "../../assets/assets/icons/onboarding/dumbell_icon.svg";
import iconCalisthenics from "../../assets/assets/icons/onboarding/calisthenics_icon.svg";
import iconGym from "../../assets/assets/icons/onboarding/gym_equipment_icon.svg";

// How Found
import iconFriends from "../../assets/assets/icons/onboarding/familia_2.png";
import iconTiktok from "../../assets/assets/icons/onboarding/tiktok-icon-dark_2.svg";
import iconInstagram from "../../assets/assets/icons/onboarding/instagram-icon_2.svg";
import iconYoutube from "../../assets/assets/icons/onboarding/youtube_2.svg";
import iconStore from "../../assets/assets/icons/onboarding/appstore_2.svg";
import iconOther from "../../assets/assets/icons/onboarding/puntos-suspensivos-del-circulo_2.svg";
import headerLogo from "../../assets/iconos/header-logo-oxyra.svg";


//  Inline SVG icons (standalone, no import needed) 

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

//  QUIZ METADATA 
const TOTAL_QUIZ_STEPS = 14;

//  HELPER COMPONENTS 

/** Single-select pill option */
const OptionPill = ({ label, emoji, imgSrc, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.97] text-left
      ${selected
        ? "bg-blue-500/15 border-blue-500/50 shadow-sm shadow-blue-500/10"
        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60"
      }`}
  >
    {imgSrc ? (
      <img src={imgSrc} alt="" className="w-8 h-8 object-contain" />
    ) : emoji ? (
      <span className="text-xl">{emoji}</span>
    ) : null}
    <span className={`font-semibold text-sm flex-1 transition-colors ${selected ? "text-blue-300" : "text-zinc-200"}`}>
      {label}
    </span>
    {selected && (
      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
        <IconCheck />
      </div>
    )}
  </button>
);

/** 2-column icon card */
const IconOptionCard = ({ label, emoji, icon, imgSrc, selected, onClick, cornerLayout = false, bigIcon = false }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col rounded-2xl border transition-all duration-200 active:scale-[0.96] overflow-hidden min-h-[110px] w-full
      ${selected
        ? "bg-blue-500/15 border-blue-500/50 shadow-md shadow-blue-500/10"
        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60"
      }
      ${!cornerLayout ? "items-center justify-center gap-2.5 p-4" : ""}
    `}
  >
    {selected && (
      <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ${cornerLayout ? "z-10" : ""}`}>
        <IconCheck />
      </div>
    )}

    {cornerLayout ? (
      <>
        <div className="w-full p-4 pr-10 text-left z-10">
          <span className={`block text-xs font-bold leading-tight transition-colors ${selected ? "text-blue-300" : "text-zinc-200"}`}>
            {label}
          </span>
        </div>
        {(imgSrc || emoji || icon) && (
          <div className={`absolute pointer-events-none opacity-80 ${bigIcon ? "right-[-12px] bottom-[-12px]" : "right-1 bottom-1"}`}>
            {imgSrc ? (
              <img 
                src={imgSrc} 
                alt="" 
                className={`${bigIcon ? "w-[100px] h-[100px]" : "w-[72px] h-[72px]"} object-contain`} 
              />
            ) : emoji ? (
              <span className={`${bigIcon ? "text-6xl" : "text-4xl"} block`}>{emoji}</span>
            ) : icon ? (
              <span className={`${bigIcon ? "text-6xl" : "text-4xl"} block`}>{icon}</span>
            ) : null}
          </div>
        )}
      </>
    ) : (
      <>
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-10 h-10 object-contain mb-1" />
        ) : emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : icon ? (
          <span className="text-2xl">{icon}</span>
        ) : null}
        <span className={`text-xs font-bold text-center leading-tight transition-colors ${selected ? "text-blue-300" : "text-zinc-300"}`}>
          {label}
        </span>
      </>
    )}
  </button>
);

/** Row button for duration */
const RowOption = ({ label, subtitle, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 active:scale-[0.98]
      ${selected
        ? "bg-blue-500/15 border-blue-500/50 shadow-sm shadow-blue-500/10"
        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60"
      }`}
  >
    <div className="text-left">
      <span className={`block font-bold text-sm ${selected ? "text-blue-300" : "text-zinc-200"}`}>{label}</span>
      {subtitle && <span className="block text-xs text-zinc-500 mt-0.5">{subtitle}</span>}
    </div>
    {selected && (
      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
        <IconCheck />
      </div>
    )}
  </button>
);

/** Continue button */
const ContinueBtn = ({ label, onClick, disabled, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center px-5 leading-none"
  >
    {loading ? (
      <IconLoader className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
    ) : (
      <span className="block w-full text-center leading-tight tracking-tight">{label}</span>
    )}
  </button>
);

//  RULER SLIDER 

function RulerSlider({ min, max, step = 1, value, onChange, unit = "kg", decimals = 0 }) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startVal = useRef(value);

  // pixels per unit on the ruler
  const PX_PER_UNIT = 8;
  const TICK_EVERY = decimals > 0 ? 1 : 5;

  // Clamp helper
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap = (v) => {
    const rounded = Math.round(v / step) * step;
    return parseFloat(clamp(rounded).toFixed(decimals));
  };

  // Calculate ruler offset so the current value is centered
  const offset = -(value - min) * PX_PER_UNIT;

  // Pointer handlers
  const onPointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startVal.current = value;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    const deltaVal = -dx / PX_PER_UNIT;
    onChange(snap(startVal.current + deltaVal));
  };

  const onPointerUp = () => { isDragging.current = false; };

  // Build ticks
  const ticks = [];
  for (let v = min; v <= max; v = parseFloat((v + step).toFixed(decimals))) {
    const isLarge = ((v - min) / step) % (TICK_EVERY / step) === 0;
    ticks.push({ v, isLarge });
  }

  return (
    <div className="ruler-slider-container" ref={containerRef}>
      {/* Value display */}
      <div className="ruler-value-display">
        <span className="ruler-value-number">{value.toFixed(decimals)}</span>
        <span className="ruler-value-unit">{unit}</span>
      </div>

      {/* Ruler track */}
      <div
        className="ruler-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ userSelect: "none", touchAction: "none" }}
      >
        {/* Center indicator line */}
        <div className="ruler-center-line" />

        {/* Scrolling scale */}
        <div
          className="ruler-scale"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {ticks.map(({ v, isLarge }) => (
            <div
              key={v}
              className={`ruler-tick ${isLarge ? "ruler-tick-large" : "ruler-tick-small"}`}
              style={{ width: `${PX_PER_UNIT}px` }}
            >
              <div className={`ruler-tick-line ${isLarge ? "large" : "small"}`} />
              {isLarge && (
                <span className="ruler-tick-label">{v.toFixed(decimals)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

//  RANKS TRIANGLE 

function RanksTriangle({ onComplete }) {
  const RANKS = [
    { name: "Sin Rango", pts: 0, color: "#6b7280", glow: "rgba(107,114,128,0.4)" },
    { name: "Hierro", pts: 10, color: "#78716c", glow: "rgba(120,113,108,0.5)" },
    { name: "Bronce", pts: 20, color: "#cd7f32", glow: "rgba(205,127,50,0.5)" },
    { name: "Plata", pts: 30, color: "#9ca3af", glow: "rgba(156,163,175,0.5)" },
    { name: "Oro", pts: 40, color: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
    { name: "Platino", pts: 50, color: "#60d8d8", glow: "rgba(96,216,216,0.5)" },
    { name: "Esmeralda", pts: 60, color: "#34d399", glow: "rgba(52,211,153,0.5)" },
    { name: "Diamante", pts: 70, color: "#818cf8", glow: "rgba(129,140,248,0.6)" },
    { name: "Campeón", pts: 85, color: "#f472b6", glow: "rgba(244,114,182,0.6)" },
    { name: "Oxyra", pts: 100, color: "#ffffff", glow: "rgba(255,255,255,0.7)" },
  ];
  const [currentRankIdx, setCurrentRankIdx] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [cameraProgress, setCameraProgress] = useState(0); // 0 = base, 1 = tip

  useEffect(() => {
    const totalDuration = 9000; // 9 seconds for a beautiful, smooth sweep through the ranks
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      setCameraProgress(progress);

      const idx = Math.floor(progress * (RANKS.length - 1));
      setCurrentRankIdx(Math.min(idx, RANKS.length - 1));

      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => setShowFinal(true), 600);
      }
    }, 16); // 60fps instead of 50ms for smoother zoom

    return () => clearInterval(interval);
  }, []);

  const rank = RANKS[currentRankIdx];
  const camY = `${100 - cameraProgress * 100}%`;

  // Zoom in to 2.1x scale at the peak, starting from 1.3x
  const currentScale = 1.3 + cameraProgress * 0.8;
  // Pan from bottom (-70y) to tip (+140y)
  const currentY = -70 + cameraProgress * 210;

  return (
    <div className="ranks-triangle-container relative w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Camera Wrapper */}
      <motion.div 
        className="triangle-wrapper"
        initial={{ scale: 1.3, y: -70 }}
        animate={{ scale: currentScale, y: currentY }}
        transition={{ duration: 0.1, ease: "linear" }}
        style={{ transformOrigin: "50% 50%", width: 240, height: 300 }} 
      >
        <svg viewBox="0 0 240 300" className="triangle-svg absolute inset-0 w-full h-full">
          {/* Minimalist Triangle body */}
          <polygon 
            points="120,10 230,290 10,290" 
            fill="rgba(255,255,255,0.02)" 
            stroke="rgba(255,255,255,0.7)" 
            strokeWidth="1.5" 
          />

          {/* Rank levels as horizontal bands */}
          {RANKS.map((r, i) => {
            const y = 290 - (i / (RANKS.length - 1)) * 280;
            const progress = i / (RANKS.length - 1);
            const halfWidth = (1 - progress) * 110;
            const distance = Math.abs(currentRankIdx - i);
            const lineOpacity = Math.max(0.7 - distance * 0.15, 0.1);

            return (
              <g key={r.name}>
                {i > 0 && <line x1={120 - halfWidth} y1={y} x2={120 + halfWidth} y2={y} stroke="rgba(255,255,255,0.9)" strokeWidth="1" strokeOpacity={lineOpacity} />}
              </g>
            );
          })}

          {/* Camera focus indicator */}
          <line
            x1="10" y1={parseFloat(camY) * 2.8 + 10}
            x2="230" y2={parseFloat(camY) * 2.8 + 10}
            stroke={rank.color}
            strokeWidth="3"
            strokeOpacity="1"
            filter={`drop-shadow(0 0 10px ${rank.glow})`}
          />
        </svg>

        {/* Current rank labels along the side */}
        <div className="absolute inset-0">
          {RANKS.map((r, i) => {
            const progress = i / (RANKS.length - 1);
            const pct = 100 - progress * 93.3; // 280px / 300px = 93.3% height bounds
            const isActive = i === currentRankIdx;
            const distance = Math.abs(currentRankIdx - i);
            const isVisible = distance <= 2;
            const rankIconAsset = RANK_ICONS[r.name];
            
            // Calculate right slope X coordinate: 120 (center) + halfWidth
            // Then add a small offset so it doesn't touch the line
            const halfWidth = (1 - progress) * 110;
            const leftPos = `${((120 + halfWidth) / 240) * 100 + 4}%`;
            
            return (
              <div
                key={r.name}
                className="triangle-rank-label flex items-center gap-[6px] absolute whitespace-nowrap overflow-visible"
                style={{
                  top: `${pct}%`,
                  left: leftPos,
                  color: r.color,
                  opacity: isActive ? 1 : (isVisible ? Math.max(0.6 - distance * 0.2, 0) : 0),
                  fontWeight: isActive ? 800 : 500,
                  transform: `translateY(-50%) scale(${isActive ? 1.05 : 0.9})`,
                  textShadow: isActive ? `0 0 18px ${r.glow}` : "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  pointerEvents: "none",
                  zIndex: isActive ? 10 : 1
                }}
              >
                {rankIconAsset && (
                  <span className="shrink-0">
                      <img 
                        src={rankIconAsset} 
                        alt="" 
                        className="w-4 h-4 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
                        style={{ 
                          opacity: isActive ? 1 : 0.7,
                          transform: r.name === 'Sin Rango' ? 'scale(1.2)' : 'none'
                        }} 
                      />
                  </span>
                )}
                <span style={{ fontSize: "10px", letterSpacing: "0.02em" }}>{r.name}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Current rank highlight (Fixed position outside the zoomed wrapper) */}
      <AnimatePresence mode="wait">
        {!showFinal && (
          <motion.div
            key={currentRankIdx}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="rank-current-display absolute bottom-[20px] left-0 right-0 z-20 flex flex-col items-center gap-2 drop-shadow-2xl pointer-events-none"
            style={{ color: rank.color, textShadow: `0 0 25px ${rank.glow}` }}
          >
            {RANK_ICONS[rank.name] && (
              <img 
                src={RANK_ICONS[rank.name]} 
                alt="" 
                className="w-14 h-14 object-contain mb-1" 
                style={{ transform: rank.name === 'Sin Rango' ? 'scale(1.25)' : 'none', filter: `drop-shadow(0 0 10px ${rank.glow})` }}
              />
            )}
            <span className="text-[32px] tracking-tight uppercase font-black italic">{rank.name}</span>
            <span className="text-sm font-bold opacity-80 backdrop-blur-md bg-black/20 px-3 py-1 rounded-full border border-white/5">{rank.pts} pts</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final overlay */}
      <AnimatePresence>
        {showFinal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ranks-final-overlay"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="ranks-final-content"
            >
              <img 
                src={RANK_ICONS["Oxyra"]} 
                alt="Oxyra Rank" 
                className="w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.7)]" 
              />
              <img 
                src={headerLogo} 
                alt="Oxyra Logo" 
                className="h-10 w-auto object-contain mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
              />
              <p className="ranks-final-text mt-6 font-semibold">
                {"¿Hasta dónde llegarás?"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

//  CAROUSEL 

function OnboardingCarousel({ onComplete }) {
  const CAROUSEL_SLIDES = [
    {
      title: "Tu progreso, siempre visible",
      description: "Registra cada entrenamiento, visualiza tu evolución muscular y sube de rango conforme alcanzas nuevos límites.",
      image: slide1,
    },
    {
      title: "IA que entrena contigo",
      description: "Gemini genera rutinas personalizadas basadas en tus objetivos, equipamiento y disponibilidad. Sin excusas.",
      image: slide2,
    },
    {
      title: "Compite. Evoluciona. Domina.",
      description: "Desde Hierro hasta Oxyra: un sistema de rangos único que te motiva a superarte cada día.",
      image: slide3,
    },
  ];
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const goNext = () => {
    if (current < CAROUSEL_SLIDES.length - 1) {
      setDir(1);
      setCurrent(p => p + 1);
    } else {
      onComplete();
    }
  };

  const slide = CAROUSEL_SLIDES[current];

  return (
    <div className="onboarding-carousel">
      {/* Slides */}
      <div className="carousel-slides-area">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={current}
            custom={dir}
            variants={{ enter: d => ({ x: d * 60, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: d * -60, opacity: 0 }) }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="carousel-slide"
          >
            {/* Top: title & description */}
            <div className="carousel-text">
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-desc">{slide.description}</p>
            </div>

            {/* Center: image */}
            <div className="carousel-image-area">
              <div className="carousel-image-glow" />
              <img src={slide.image} alt={slide.title} className="carousel-image" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="carousel-dots">
        {CAROUSEL_SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
            className={`carousel-dot ${i === current ? "active" : ""}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="carousel-cta">
        <ContinueBtn
          label={current === CAROUSEL_SLIDES.length - 1 ? "Comenzar" : "Continuar"}
          onClick={goNext}
        />
      </div>
    </div>
  );
}

//  QUESTION HEADER (back + progress) 

function QuizHeader({ step, totalSteps, onBack }) {
  const pct = (step / totalSteps) * 100;
  return (
    <div className="quiz-header">
      <button onClick={onBack} className="quiz-back-btn">
        <IconArrowLeft />
      </button>
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="quiz-step-label">
        {(step / totalSteps).toLocaleString(undefined, { style: "percent" }) === "100%" ? "14/14" : `${step}/${totalSteps}`}
      </span>
    </div>
  );
}

//  INDIVIDUAL QUIZ STEPS 

function Step1({ answers, onChange }) {
  const GOALS = [
    { id: "weight_loss", label: "Perder peso y definir", imgSrc: imgLoseWeight },
    { id: "strength", label: "Ser más fuerte", imgSrc: imgStrength },
    { id: "muscle", label: "Ganar masa muscular", imgSrc: imgMuscle },
    { id: "athletic", label: "Ser más atlético", imgSrc: imgAthletic },
    { id: "ranks", label: "Solo obtener mis rangos", emoji: "🏆" },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuál es tu mayor objetivo?"}</h2>
        <p className="quiz-subtitle">{"Elige la opción que más te represente"}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {GOALS.map(o => (
          <OptionPill key={o.id} label={o.label} emoji={o.emoji} imgSrc={o.imgSrc}
            selected={answers.goal === o.id}
            onClick={() => onChange({ goal: o.id })} />
        ))}
      </div>
    </div>
  );
}

function Step2({ answers, onChange }) {
  const MOTIVATIONS = [
    { id: "confidence", label: "Ganar confianza en mí mismo", imgSrc: imgConfidence },
    { id: "attractive", label: "Sería más atractivo", imgSrc: imgAttractive },
    { id: "health", label: "Mejoraría mi salud", imgSrc: imgHealth },
    { id: "energy", label: "Tendría más energía", imgSrc: imgEnergy },
    { id: "respect", label: "Sería más respetado", imgSrc: imgRespect },
    { id: "potential", label: "Llegaría a mi potencial físico", imgSrc: imgPotential },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"Quiero conseguir este objetivo porque…"}</h2>
        <p className="quiz-subtitle">{"Tu motivación profunda es clave"}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {MOTIVATIONS.map(o => (
          <OptionPill key={o.id} label={o.label} emoji={o.emoji} imgSrc={o.imgSrc}
            selected={answers.motivation === o.id}
            onClick={() => onChange({ motivation: o.id })} />
        ))}
      </div>
    </div>
  );
}

function Step3({ answers, onChange }) {
  const FOCUS_FREQUENCY = [
    { id: "not_much", label: "No mucho", imgSrc: imgFreqNotMuch },
    { id: "sometimes", label: "A veces", imgSrc: imgFreqSometimes },
    { id: "a_lot", label: "Mucho", imgSrc: imgFreqAlot },
    { id: "always", label: "Todo el tiempo", imgSrc: imgFreqAlways },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Sueles pensar mucho en este objetivo?"}</h2>
        <p className="quiz-subtitle">{"Tu mindset define tu progreso"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FOCUS_FREQUENCY.map(o => (
          <IconOptionCard key={o.id} label={o.label} emoji={o.emoji} imgSrc={o.imgSrc}
            selected={answers.frequency === o.id}
            onClick={() => onChange({ frequency: o.id })} />
        ))}
      </div>
    </div>
  );
}

function Step4({ answers, onChange }) {
  const OBSTACLES = [
    { id: "time", label: "Falta de tiempo", imgSrc: imgObsTime },
    { id: "knowledge", label: "Falta de conocimiento", imgSrc: imgObsKnowledge },
    { id: "motivation", label: "Motivación baja", imgSrc: imgObsMotivation },
    { id: "injury", label: "Lesiones o molestias físicas", imgSrc: imgObsInjury },
    { id: "equipment", label: "Falta de equipamiento", imgSrc: imgObsEquipment },
    { id: "never", label: "Nunca lo he intentado", imgSrc: imgObsNever },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Por qué no has conseguido este objetivo?"}</h2>
        <p className="quiz-subtitle">{"Identifica tu mayor obstáculo"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {OBSTACLES.map(o => (
          <IconOptionCard key={o.id} label={o.label} emoji={o.emoji} imgSrc={o.imgSrc}
            selected={answers.obstacle === o.id}
            onClick={() => onChange({ obstacle: o.id })}
            cornerLayout
          />
        ))}
      </div>
    </div>
  );
}

function Step5({ answers, onChange }) {
  const EXPERIENCE_LEVELS = [
    { id: "never", label: "Nunca he entrenado", desc: "Comenzamos desde cero", imgSrc: imgExpNever },
    { id: "beginner", label: "Principiante", desc: "Lo he intentado antes", imgSrc: imgExpBeginner },
    { id: "intermediate", label: "Intermedio", desc: "Entreno regularmente", imgSrc: imgExpIntermediate },
    { id: "advanced", label: "Avanzado", desc: "Años de experiencia", imgSrc: imgExpAdvanced },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuánta experiencia tienes entrenando?"}</h2>
        <p className="quiz-subtitle">{"Adaptaremos tu plan a tu nivel"}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {EXPERIENCE_LEVELS.map(o => (
          <OptionPill key={o.id}
            label={`${o.label} — ${o.desc}`}
            imgSrc={o.imgSrc}
            selected={answers.experience === o.id}
            onClick={() => onChange({ experience: o.id })} />
        ))}
      </div>
    </div>
  );
}

function Step6({ answers, onChange }) {
  const val = answers.weight ?? 75.0;
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuánto pesas?"}</h2>
        <p className="quiz-subtitle">{"Desliza la regla para ajustar tu peso"}</p>
      </div>
      <RulerSlider
        min={30} max={200} step={0.1} decimals={1}
        value={val} unit="kg"
        onChange={v => onChange({ weight: v })}
      />
      <div className="ruler-info-labels">
        <div className="ruler-info-item">
          <span className="ruler-info-icon">📊</span>
          <span className="ruler-info-text">{"Tu peso nos permite calcular cargas ideales de entrenamiento"}</span>
        </div>
        <div className="ruler-info-item">
          <span className="ruler-info-icon">🔒</span>
          <span className="ruler-info-text">{"Esta información es privada y solo la usa la IA"}</span>
        </div>
      </div>
    </div>
  );
}

function Step7({ answers, onChange }) {
  const gender = answers.gender ?? null;
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuál es tu sexo?"}</h2>
        <p className="quiz-subtitle">{"Personaliza tu experiencia desde el inicio"}</p>
      </div>

      {/* Big gender icon */}
      <div className="gender-icon-area h-[160px] flex items-center justify-center">
          <motion.div
            key={gender}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="gender-big-icon h-full w-full flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            {gender === "M" ? (
              <img src={imgMale} className="h-full object-contain" alt="Masculino" />
            ) : (
              <img src={imgFemale} className="h-full object-contain" alt="Femenino" />
            )}
          </motion.div>
      </div>

      <div className="gender-options">
        <button
          onClick={() => onChange({ gender: "M" })}
          className={`gender-btn ${gender === "M" ? "selected" : ""}`}
        >
          <img src={imgMale} className="w-10 h-10 object-contain gender-icon-small" alt="" />
          <span className="gender-btn-label">{"Masculino"}</span>
        </button>
        <button
          onClick={() => onChange({ gender: "F" })}
          className={`gender-btn ${gender === "F" ? "selected" : ""}`}
        >
          <img src={imgFemale} className="w-10 h-10 object-contain gender-icon-small" alt="" />
          <span className="gender-btn-label">{"Femenino"}</span>
        </button>
      </div>
    </div>
  );
}

function Step8({ answers, onChange }) {
  const val = answers.height ?? 170;
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuánto mides?"}</h2>
        <p className="quiz-subtitle">{"Desliza la regla para ajustar tu altura"}</p>
      </div>
      <RulerSlider
        min={100} max={230} step={1} decimals={0}
        value={val} unit="cm"
        onChange={v => onChange({ height: v })}
      />
      <div className="ruler-info-labels">
        <div className="ruler-info-item">
          <span className="ruler-info-icon">📏</span>
          <span className="ruler-info-text">{"Usamos tu altura para calcular proporciones y rangos de movimiento ideales"}</span>
        </div>
      </div>
    </div>
  );
}

function Step9({ answers, onChange }) {
  const HOW_FOUND = [
    { id: "friends", label: "Amigos o familia", imgSrc: iconFriends },
    { id: "tiktok", label: "TikTok", imgSrc: iconTiktok },
    { id: "instagram", label: "Instagram", imgSrc: iconInstagram },
    { id: "youtube", label: "YouTube", imgSrc: iconYoutube },
    { id: "store", label: "App Store o Play Store", imgSrc: iconStore },
    { id: "other", label: "Otro", imgSrc: iconOther },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cómo nos has conocido?"}</h2>
        <p className="quiz-subtitle">{"Ayúdanos a entender cómo llegaste aquí"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {HOW_FOUND.map(o => (
          <IconOptionCard key={o.id} label={o.label} imgSrc={o.imgSrc}
            selected={answers.howFound === o.id}
            onClick={() => onChange({ howFound: o.id })} />
        ))}
      </div>
    </div>
  );
}

function Step10({ answers, onChange }) {
  const [ranksDone, setRanksDone] = useState(false);
  return (
    <div className="quiz-step step10-no-scroll">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"El sistema de rangos de Oxyra"}</h2>
        <p className="quiz-subtitle">{"Cada entrenamiento te acerca a la cima"}</p>
      </div>
      <RanksTriangle onComplete={() => setRanksDone(true)} />
    </div>
  );
}

function Step11({ answers, onChange }) {
  const EQUIPMENT = [
    { id: "home", label: "Equipamiento en casa", imgSrc: iconHome },
    { id: "small_gym", label: "Gimnasio pequeño", imgSrc: iconDumbbell },
    { id: "calisthenics", label: "Equipamiento de calistenia", imgSrc: iconCalisthenics },
    { id: "commercial_gym", label: "Gimnasio comercial", imgSrc: iconGym },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Qué equipamiento tienes disponible?"}</h2>
        <p className="quiz-subtitle">{"La IA adaptará el plan a tu entorno"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT.map(eq => (
          <IconOptionCard key={eq.id} label={eq.label} imgSrc={eq.imgSrc}
            selected={answers.equipment === eq.id}
            onClick={() => onChange({ equipment: eq.id })}
            cornerLayout 
          />
        ))}
      </div>
    </div>
  );
}

function Step12({ answers, onChange }) {
  const mode = answers.daysMode ?? "count"; // "count" | "specific"
  const daysCount = answers.daysCount ?? null;
  const daysSpecific = answers.daysSpecific ?? [];

  const DAYS_OF_WEEK = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ];

  const DAYS_COUNT = [
    { id: 1, label: "1 día" },
    { id: 2, label: "2 días" },
    { id: 3, label: "3 días" },
    { id: 4, label: "4 días" },
    { id: 5, label: "5 días" },
    { id: 6, label: "6 días" },
    { id: 7, label: "Todos los días" },
  ];

  const toggleSpecific = (id) => {
    const curr = daysSpecific;
    onChange({ daysSpecific: curr.includes(id) ? curr.filter(d => d !== id) : [...curr, id] });
  };

  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuántos días a la semana quieres entrenar?"}</h2>
        <p className="quiz-subtitle">{"Elige cuánto o cuándo entrenas"}</p>
      </div>

      {/* Mode tabs */}
      <div className="days-mode-tabs">
        <button
          onClick={() => onChange({ daysMode: "count", daysSpecific: [] })}
          className={`days-mode-tab ${mode === "count" ? "active" : ""}`}
        >
          {"Por semana"}
        </button>
        <button
          onClick={() => onChange({ daysMode: "specific", daysCount: null })}
          className={`days-mode-tab ${mode === "specific" ? "active" : ""}`}
        >
          {"Días específicos"}
        </button>
      </div>

      {mode === "count" && (
        <div className="flex flex-col gap-2">
          {DAYS_COUNT.map(d => (
            <RowOption key={d.id} label={d.label}
              selected={daysCount === d.id}
              onClick={() => onChange({ daysCount: d.id })} />
          ))}
        </div>
      )}

      {mode === "specific" && (
        <div className="flex flex-col gap-2">
          {DAYS_OF_WEEK.map(d => (
            <RowOption 
              key={d.id} 
              label={d.label}
              selected={daysSpecific.includes(d.id)}
              onClick={() => toggleSpecific(d.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Step13({ answers, onChange }) {
  const DURATIONS = [
    { id: "15", label: "15 minutos", subtitle: "Express" },
    { id: "30", label: "30 minutos", subtitle: "Eficiente" },
    { id: "45", label: "45 minutos", subtitle: "En serio" },
    { id: "60", label: "60 minutos", subtitle: "Intenso" },
    { id: "90", label: "90+ minutos", subtitle: "Obsesivo" },
  ];
  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Cuánto tiempo tienes para entrenar?"}</h2>
        <p className="quiz-subtitle">{"Optimizamos el plan a tu disponibilidad"}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {DURATIONS.map(d => (
          <RowOption key={d.id} label={d.label} subtitle={d.subtitle}
            selected={answers.duration === d.id}
            onClick={() => onChange({ duration: d.id })} />
        ))}
      </div>
    </div>
  );
}

function Step14({ answers, onChange }) {
  const INJURIES = [
    { id: "back", label: "Dolor de espalda", imgSrc: imgInjBack },
    { id: "knee", label: "Dolor de rodilla", imgSrc: imgInjKnee },
    { id: "hip", label: "Dolor de cadera", imgSrc: imgInjHip },
    { id: "elbow", label: "Dolor de codo", imgSrc: imgInjElbow },
    { id: "shoulder", label: "Dolor de hombro", imgSrc: imgInjShoulder },
    { id: "wrist", label: "Dolor de muñeca", imgSrc: imgInjWrist },
  ];
  const selected = answers.injuries ?? [];
  const toggle = (id) => {
    onChange({ injuries: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] });
  };

  return (
    <div className="quiz-step">
      <div className="quiz-question-header">
        <h2 className="quiz-title">{"¿Tienes algún dolor o lesión?"}</h2>
        <p className="quiz-subtitle">{"La IA evitará sobrecargar las zonas afectadas"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {INJURIES.map(inj => (
          <IconOptionCard
            key={inj.id}
            label={inj.label}
            imgSrc={inj.imgSrc}
            selected={selected.includes(inj.id)}
            onClick={() => toggle(inj.id)}
            cornerLayout
            bigIcon
          />
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-zinc-500 text-center mt-3 font-medium">
          {"Sin dolores registrados — perfecto para entrenar sin restricciones"}
        </p>
      )}
    </div>
  );
}

//  LOADING SCREEN 

function GeneratingScreen({ progressText }) {
  const [dotCount, setDotCount] = useState(1);
  const messages = [
    "Analizando tu perfil...",
    "Diseñando tu plan personalizado...",
    "Seleccionando ejercicios óptimos...",
    "Ajustando cargas e intensidad...",
    "Finalizando tu programa..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => setDotCount(d => (d % 3) + 1), 500);
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2000);
    return () => { clearInterval(dotTimer); clearInterval(msgTimer); };
  }, [messages.length]);

  return (
    <div className="generating-screen">
      <div className="generating-orb" />
      <div className="generating-content">
        <div className="generating-icon-ring">
          <div className="generating-spinner" />
          <IconSparkles className="generating-sparkles-icon" />
        </div>
        <h2 className="generating-title">{"Creando tu plan con IA"}</h2>
        {progressText ? (
          <p className="generating-msg">{progressText}</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="generating-msg"
            >
              {messages[msgIdx]}{"."
                .repeat(dotCount)}
            </motion.p>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

//  SUCCESS SCREEN 

function SuccessScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="success-screen"
    >
      <div className="success-glow" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 250 }}
        className="success-checkmark"
      >
        ✓
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="success-text-area"
      >
        <h2 className="success-title">{"Tu plan está listo"}</h2>
        <p className="success-subtitle">{"La IA ha creado un programa personalizado y lo ha añadido a tus rutinas"}</p>
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="success-cta-area"
      >
        <button onClick={onStart} className="success-btn">
          <span>{"Entrenar con Oxyra"}</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

//  MAIN ONBOARDING PAGE 

export default function OnboardingPage() {
  const navigate = useNavigate();

  // Phase: "carousel" | "quiz" | "generating" | "success" | "routine_gen_failed"
  const [phase, setPhase] = useState("carousel");
  /** Texto de progreso durante generación (p. ej. "Generando tu rutina 1 de 3...") — reutiliza el flujo visual de la fase "generating". */
  const [generatingProgressText, setGeneratingProgressText] = useState("");
  const [quizStep, setQuizStep] = useState(1); // 1-14
  const [dir, setDir] = useState(1); // animation direction

  const [answers, setAnswers] = useState({
    goal: null,
    motivation: null,
    frequency: null,
    obstacle: null,
    experience: null,
    weight: 75.0,
    gender: "M",
    height: 170,
    howFound: null,
    // Phase 3
    equipment: null,
    daysMode: "count",
    daysCount: null,
    daysSpecific: [],
    duration: null,
    injuries: [],
  });

  const updateAnswers = useCallback((partial) => {
    setAnswers(prev => ({ ...prev, ...partial }));
  }, []);

  // Whether "Continue" is enabled for each step
  const canContinue = useCallback(() => {
    switch (quizStep) {
      case 1: return !!answers.goal;
      case 2: return !!answers.motivation;
      case 3: return !!answers.frequency;
      case 4: return !!answers.obstacle;
      case 5: return !!answers.experience;
      case 6: return true; // slider always has a value
      case 7: return !!answers.gender;
      case 8: return true; // slider always has a value
      case 9: return !!answers.howFound;
      case 10: return true; // ranks animation — always continuable
      case 11: return !!answers.equipment;
      case 12:
        if (answers.daysMode === "count") return !!answers.daysCount;
        return answers.daysSpecific.length > 0;
      case 13: return !!answers.duration;
      case 14: return true; // injuries are optional
      default: return false;
    }
  }, [quizStep, answers]);

  const goNext = async () => {
    if (!canContinue()) return;
    if (quizStep < TOTAL_QUIZ_STEPS) {
      setDir(1);
      setQuizStep(s => s + 1);
    } else {
      // Last step — finish
      await handleFinish();
    }
  };

  const goBack = () => {
    if (quizStep > 1) {
      setDir(-1);
      setQuizStep(s => s - 1);
    } else {
      // Back from step 1 → go back to carousel
      setPhase("carousel");
    }
  };

  const handleFinish = async () => {
    setPhase("generating");
    setGeneratingProgressText("");
    const token = localStorage.getItem("authToken");

    try {
      // 1. Build the AI prompt from answers
      const GOAL_MAP = {
        weight_loss: "Perder peso y definir",
        strength: "Ganar fuerza",
        muscle: "Ganar masa muscular",
        athletic: "Mejorar rendimiento atlético",
        ranks: "Obtener rangos"
      };
      const EQUIP_MAP = {
        home: "Equipamiento en casa",
        small_gym: "Gimnasio pequeño",
        calisthenics: "Equipamiento de calistenia",
        commercial_gym: "Gimnasio comercial",
      };
      const DURATION_MAP = { "15": "15 minutos", "30": "30 minutos", "45": "45 minutos", "60": "60 minutos", "90": "90+ minutos" };
      const EXP_MAP = {
        never: "Principiante", beginner: "Principiante",
        intermediate: "Intermedio", advanced: "Avanzado"
      };

      const injuriesNote = answers.injuries.length > 0
        ? `El usuario tiene las siguientes zonas con dolor o lesiones: ${answers.injuries.join(", ")}. Adapta el plan para no sobrecargar esas zonas.`
        : "";

      // Determine days scheduling
      let daysNote = "";
      if (answers.daysMode === "count" && answers.daysCount) {
        daysNote = `El usuario quiere entrenar ${answers.daysCount} días a la semana. Crea una rutina por día de entrenamiento con título descriptivo.`;
      } else if (answers.daysMode === "specific" && answers.daysSpecific.length > 0) {
        daysNote = `El usuario quiere entrenar los siguientes días: ${answers.daysSpecific.join(", ")}. Asigna cada rutina generada al día correspondiente como nombre de sesión.`;
      }

      // Generate multiple sessions according to days
      const numSessions = answers.daysMode === "count" ? (answers.daysCount ?? 3) : (answers.daysSpecific.length || 3);

      const payload = {
        objetivo: GOAL_MAP[answers.goal] || answers.goal,
        duracion: DURATION_MAP[answers.duration] || "45 minutos",
        enfoque: "Cuerpo completo",
        equipo: EQUIP_MAP[answers.equipment] || "Gimnasio comercial",
        nivel: EXP_MAP[answers.experience] || "Principiante",
        extra_context: `${injuriesNote} ${daysNote} Genera exactamente ${numSessions} sesión(es) separadas. Cada sesión debe ser un objeto JSON independiente dentro de un array "sesiones".`,
      };

      // Call the existing generate-routine endpoint  
      // (We call it once per session day for compatibility)
      const sessionsToGenerate = Math.min(numSessions, 3); // Cap at 3 for performance

      const generatedRoutines = [];
      for (let i = 0; i < sessionsToGenerate; i++) {
        setGeneratingProgressText(`Generando tu rutina ${i + 1} de ${sessionsToGenerate}...`);

        const sessionLabel = answers.daysMode === "specific" && answers.daysSpecific[i]
          ? answers.daysSpecific[i]
          : null;

        const sessionPayload = {
          ...payload,
          objetivo: payload.objetivo + (sessionLabel ? ` (sesión ${sessionLabel})` : ` (sesión ${i + 1})`),
        };

        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await fetch(`${API_URL}/api/users/generate-routine/onboarding`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(sessionPayload),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.rutina) generatedRoutines.push(data.rutina);
            break;
          }

          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      if (generatedRoutines.length === 0) {
        setGeneratingProgressText("");
        setPhase("routine_gen_failed");
        return;
      }

      // 2. Save physical data + mark onboarding complete (solo si hubo al menos una rutina)
      await fetch(`${API_URL}/api/users/complete-onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          peso_kg: answers.weight,
          estatura_cm: answers.height,
          genero: answers.gender,
        }),
      });

      // 3. Update localStorage so guards don't redirect again
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...userData, onboarding_completed: true }));

      setGeneratingProgressText("");
      setPhase("success");
    } catch (error) {
      console.error("Error finalizando onboarding:", error);
      setGeneratingProgressText("");
      setPhase("routine_gen_failed");
    }
  };

  const handleContinueOnboardingWithoutRoutines = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await fetch(`${API_URL}/api/users/complete-onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          peso_kg: answers.weight,
          estatura_cm: answers.height,
          genero: answers.gender,
        }),
      });
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...userData, onboarding_completed: true }));
      setPhase("success");
    } catch (error) {
      console.error("Error al completar onboarding sin rutinas:", error);
      setPhase("routine_gen_failed");
    }
  };

  const handleStartTraining = () => {
    navigate("/", { replace: true });
  };

  // Render current quiz step
  const renderStep = () => {
    const props = { answers, onChange: updateAnswers };
    switch (quizStep) {
      case 1: return <Step1 {...props} />;
      case 2: return <Step2 {...props} />;
      case 3: return <Step3 {...props} />;
      case 4: return <Step4 {...props} />;
      case 5: return <Step5 {...props} />;
      case 6: return <Step6 {...props} />;
      case 7: return <Step7 {...props} />;
      case 8: return <Step8 {...props} />;
      case 9: return <Step9 {...props} />;
      case 10: return <Step10 {...props} />;
      case 11: return <Step11 {...props} />;
      case 12: return <Step12 {...props} />;
      case 13: return <Step13 {...props} />;
      case 14: return <Step14 {...props} />;
      default: return null;
    }
  };

  //  FULL SCREEN PHASES 

  if (phase === "generating") return <GeneratingScreen progressText={generatingProgressText} />;
  if (phase === "routine_gen_failed") {
    return (
      <div className="generating-screen">
        <div className="generating-content">
          <h2 className="generating-title">{"No pudimos generar tus rutinas"}</h2>
          <p className="generating-msg text-center max-w-sm mx-auto">
            {"Hubo un problema temporal con el servicio de IA (por ejemplo, sobrecarga). Puedes reintentar o entrar en la app y crear rutinas más tarde."}
          </p>
          <div className="success-cta-area flex flex-col gap-3 mt-8 w-full max-w-xs mx-auto">
            <button
              type="button"
              className="success-btn"
              onClick={() => {
                void handleFinish();
              }}
            >
              <span>{"Reintentar"}</span>
            </button>
            <button
              type="button"
              className="flex h-14 w-full items-center justify-center rounded-2xl border border-zinc-600 bg-transparent px-5 text-center text-base font-semibold leading-tight tracking-tight text-zinc-200"
              onClick={() => {
                void handleContinueOnboardingWithoutRoutines();
              }}
            >
              <span className="block w-full text-center">{"Continuar sin rutinas"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (phase === "success") return <SuccessScreen onStart={handleStartTraining} />;

  if (phase === "carousel") {
    return (
      <div className="onboarding-root">
        <OnboardingCarousel onComplete={() => setPhase("quiz")} />
      </div>
    );
  }

  //  QUIZ PHASE 

  return (
    <div className="onboarding-root">
      <QuizHeader step={quizStep} totalSteps={TOTAL_QUIZ_STEPS} onBack={goBack} />

      <div className="quiz-content">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={quizStep}
            custom={dir}
            variants={{
              enter: d => ({ x: d * 40, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: d => ({ x: d * -40, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="quiz-step-wrapper"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA — fixed at bottom */}
      <div className="quiz-cta">
        <ContinueBtn
          label={quizStep === TOTAL_QUIZ_STEPS ? "Finalizar" : (quizStep === 14 && answers.injuries.length === 0 ? "Omitir" : "Continuar")}
          onClick={goNext}
          disabled={!canContinue()}
        />
      </div>
    </div>
  );
}
