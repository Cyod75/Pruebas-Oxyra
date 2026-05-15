import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconRotate, IconLoader, IconAlertCircle } from "../../components/icons/Icons"; 
import { API_URL } from "../../config/api";
import { getMuscleColor } from "../../config/ranksColors"; 

import BodyFront from "../../components/shared/BodyFront"; 
import BodyBack from "../../components/shared/BodyBack"; 
import MuscleDetailSheet from "../../components/settings/sheets/MuscleDetailSheet";
import RanksInfoSheet from "../../components/settings/sheets/RanksInfoSheet";
import PhysiqueScanSheet from "../../components/settings/sheets/PhysiqueScanSheet";
import ModernLoader from "../../components/shared/ModernLoader";
import { useConnection } from "../../context/ConnectionContext";

// Icono de escáner personalizado para el botón
const IconScan = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

export default function MobileStatistics() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]); 
  const [view, setView] = useState("front"); 
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [isScanSheetOpen, setIsScanSheetOpen] = useState(false);
  const { reportError } = useConnection();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.muscularStats || []);
        setTimeout(() => setLoading(false), 600);
      } else {
        throw new Error(t("statistics.error_fetching"));
      }
    } catch (error) {
      console.error("Error cargando stats:", error);
      reportError();
    } 
  };

  const handleMuscleClick = (muscle) => {
    setSelectedMuscle(muscle);
    setIsSheetOpen(true);
  };

  const muscleColors = useMemo(() => {
    const map = {};
    const muscles = [
        'Pecho', 'Espalda Alta', 'Espalda Media', 'Espalda Baja', 'Hombro', 'Trapecio',
        'Cuadriceps', 'Femoral', 'Gluteo', 'Gemelo', 'Aductores',
        'Bíceps', 'Tríceps', 'Antebrazo', 'Abdomen'
    ];
    muscles.forEach(m => map[m] = getMuscleColor(stats, m));
    return map;
  }, [stats]);

  // Tras cargar, determinamos si el usuario tiene datos musculares reales
  const hasData = !loading && stats.length > 0;
  const noData  = !loading && stats.length === 0;

  // Mientras carga: mostramos el ModernLoader
  if (loading) return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center overflow-hidden">
        <ModernLoader text={t("statistics.loading_biometry")} />
    </div>
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-background overflow-hidden animate-in fade-in duration-500">

      {/* --- AVATAR (siempre en fondo como base visual) --- */}
      <div className={`absolute inset-0 flex items-center justify-center z-10 px-6 pt-10 pb-20 transition-all duration-700 ${
        noData ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="absolute bottom-[12%] w-[40%] h-[15px] bg-black/10 blur-xl rounded-full pointer-events-none dark:bg-black/30" />
        <div className="relative w-full h-full max-h-[82vh] scale-105 flex items-center justify-center transition-all duration-700 animate-in zoom-in-95 fill-mode-both origin-center">
            {view === "front" ? (
                <BodyFront colors={muscleColors} onMuscleClick={noData ? undefined : handleMuscleClick} />
            ) : (
                <BodyBack colors={muscleColors} onMuscleClick={noData ? undefined : handleMuscleClick} />
            )}
        </div>
      </div>

      {/* --- EMPTY STATE OVERLAY (solo si no hay datos) --- */}
      {noData && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-8 animate-in fade-in duration-700">
          {/* Capa frosted glass ultraligera */}
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[6px]" />

          {/* Contenido centrado */}
          <div className="relative z-10 flex flex-col items-center text-center gap-5 w-full max-w-[260px]">
            {/* Icono minimalista (Activity) */}
            <div className="w-14 h-14 rounded-[1.25rem] bg-secondary/40 border border-border/50 flex items-center justify-center backdrop-blur-md mb-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>

            {/* Texto principal */}
            <div className="space-y-1.5">
              <h2 className="text-[22px] font-black text-foreground tracking-tight uppercase">
                {t("statistics.no_activity")}
              </h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {t("statistics.no_activity_desc")}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/training")}
              className="mt-4 w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm tracking-wide hover:bg-foreground/90 hover:shadow-lg active:scale-[0.97] transition-all shadow-md"
            >
              {t("statistics.start")}
            </button>
          </div>
        </div>
      )}

      {/* --- UNIFIED CONTROL CAPSULE (solo si hay datos) --- */}
      {hasData && (
      <div className="absolute right-6 top-6 z-30">
        <div className="flex flex-col gap-1 p-1 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border/50 shadow-sm">
            
            {/* Info Button */}
            <button 
                onClick={() => setIsInfoSheetOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground transition-all hover:text-primary hover:bg-background/50 active:scale-95"
            >
                <IconAlertCircle className="w-5 h-5" />
            </button>
            
            {/* Divider */}
            <div className="h-px w-full px-2">
                <div className="h-full w-full bg-border/50" />
            </div>

            {/* AI Scan Button */}
            <button 
                onClick={() => setIsScanSheetOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground transition-all hover:text-blue-500 hover:bg-blue-500/10 active:scale-95 relative group"
                title={t("statistics.scan_title")}
            >
                <IconScan className="w-5 h-5" />
                {/* PRO dot indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background" />
            </button>

            {/* Divider */}
            <div className="h-px w-full px-2">
                <div className="h-full w-full bg-border/50" />
            </div>

            {/* Rotate Button */}
            <button 
                onClick={() => setView(prev => prev === "front" ? "back" : "front")}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground transition-all hover:text-foreground hover:bg-background/50 active:scale-95"
            >
                <IconRotate className={`w-5 h-5 transition-transform duration-500 ${view === 'back' ? 'rotate-180' : ''}`} />
            </button>

        </div>
      </div>
      )}


      {/* --- SHEETS & MODALS --- */}
      <MuscleDetailSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        muscle={selectedMuscle} 
        stats={stats} 
      />
      
      <RanksInfoSheet 
        open={isInfoSheetOpen} 
        onOpenChange={setIsInfoSheetOpen} 
      />

      <PhysiqueScanSheet
        open={isScanSheetOpen}
        onOpenChange={setIsScanSheetOpen}
        onScanComplete={fetchStats}
      />

    </div>
  );
}
