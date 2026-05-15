import React, { useState, useRef, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader, IconAlertTriangle, IconCamera, IconX, IconCheck } from "../../icons/Icons";
import { API_URL } from "../../../config/api";
import { RANK_COLORS } from "../../../config/ranksColors";
import { RANK_ICONS } from "../../shared/ranksHelpers";

// Fases del flujo
const PHASE = {
  UPLOAD: "upload",
  ANALYZING: "analyzing",
  RESULTS: "results",
  ERROR: "error",
};

export default function PhysiqueScanSheet({ open, onOpenChange, onScanComplete }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(PHASE.UPLOAD);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [remainingScans, setRemainingScans] = useState(null);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Reset al cerrar
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        setPhase(PHASE.UPLOAD);
        setFrontImage(null);
        setBackImage(null);
        setFrontPreview(null);
        setBackPreview(null);
        setResults(null);
        setErrorMsg(null);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const handleFileSelect = useCallback((file, type) => {
    if (!file) return;

    // Validar tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg(t("profile.physique_scan.errors.invalid_type"));
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t("profile.physique_scan.errors.invalid_size"));
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "front") {
        setFrontImage(file);
        setFrontPreview(e.target.result);
      } else {
        setBackImage(file);
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async () => {
    if (!frontImage || !backImage) {
      setErrorMsg(t("profile.physique_scan.errors.missing_photos"));
      return;
    }

    setPhase(PHASE.ANALYZING);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("front", frontImage);
      formData.append("back", backImage);

      const res = await fetch(`${API_URL}/api/ai/analyze-physique`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResults(data.data);
        setRemainingScans(data.remaining_scans);
        setPhase(PHASE.RESULTS);
        // Notificar al padre que el escaneo ha terminado para refrescar los datos
        if (onScanComplete) onScanComplete(data.data);
      } else {
        // Errores controlados del backend
        if (res.status === 403) {
          setErrorMsg(t("profile.physique_scan.errors.pro_only"));
        } else if (res.status === 429) {
          setErrorMsg(`⚠️ ${data.message || t("profile.physique_scan.errors.limit_reached")}`);
        } else if (data.error === "SAFETY_BLOCK") {
          setErrorMsg(t("profile.physique_scan.errors.safety_block"));
        } else if (data.error === "INVALID_IMAGE") {
          setErrorMsg(t("profile.physique_scan.errors.invalid_human"));
        } else {
          setErrorMsg(data.message || t("common.error"));
        }
        setPhase(PHASE.ERROR);
      }
    } catch (err) {
      console.error("Error en escaneo:", err);
      setErrorMsg(t("profile.physique_scan.errors.connection"));
      setPhase(PHASE.ERROR);
    }
  };

  const removeImage = (type) => {
    if (type === "front") {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  // 
  // RENDER: FASE UPLOAD
  // 
  const renderUpload = () => (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <IconAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-500 font-medium leading-tight">{errorMsg}</p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <Trans i18nKey="profile.physique_scan.instructions">
            Sube dos fotos de tu físico: una de <strong className="text-foreground">frente</strong> y una de <strong className="text-foreground">espalda</strong>. 
            La IA analizará tu musculatura y te asignará un rango por cada grupo muscular.
          </Trans>
        </p>
      </div>

      {/* Photo Slots */}
      <div className="grid grid-cols-2 gap-4">
        {/* FRONT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            📸 {t("profile.physique_scan.front_photo")}
          </label>
          <div
            onClick={() => !frontPreview && frontInputRef.current.click()}
            className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group
              ${frontPreview
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5 bg-secondary/20"
              }`}
          >
            {frontPreview ? (
              <>
                <img src={frontPreview} alt="Frente" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage("front"); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-red-500 active:scale-90"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconCheck className="w-3 h-3 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase">{t("profile.physique_scan.ready")}</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <IconCamera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t("profile.physique_scan.front")}</span>
              </div>
            )}
          </div>
          <input
            ref={frontInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0], "front")}
          />
        </div>

        {/* BACK */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            📸 {t("profile.physique_scan.back_photo")}
          </label>
          <div
            onClick={() => !backPreview && backInputRef.current.click()}
            className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group
              ${backPreview
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5 bg-secondary/20"
              }`}
          >
            {backPreview ? (
              <>
                <img src={backPreview} alt="Espalda" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage("back"); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-red-500 active:scale-90"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconCheck className="w-3 h-3 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase">{t("profile.physique_scan.ready")}</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <IconCamera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t("profile.physique_scan.back")}</span>
              </div>
            )}
          </div>
          <input
            ref={backInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0], "back")}
          />
        </div>
      </div>

      {/* Privacy Note */}
      <div className="flex items-start gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          <Trans i18nKey="profile.physique_scan.privacy_note">
            <strong className="text-muted-foreground/80">Privacidad GDPR:</strong> Tus fotos NO se almacenan. Se analizan en memoria y se eliminan inmediatamente.
          </Trans>
        </p>
      </div>

      {/* Analyze Button */}
      <div className="pt-2">
        <Button
          className={`w-full h-14 text-base font-bold rounded-full shadow-lg transition-all active:scale-[0.98]
            ${frontImage && backImage
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          onClick={handleAnalyze}
          disabled={!frontImage || !backImage}
        >
          <div className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5" />
            <span>{t("profile.physique_scan.analyze_button")}</span>
          </div>
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-60">
          {t("profile.physique_scan.limit_note")}
        </p>
      </div>
    </div>
  );

  // 
  // RENDER: FASE ANALYZING
  // 
  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-500">
      {/* Orb animado */}
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconSparkles className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
        {/* Anillo giratorio */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#scanGradient)" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" />
          <defs>
            <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-lg font-black text-foreground tracking-tight">{t("profile.physique_scan.analyzing_title")}</h3>
        <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
          {t("profile.physique_scan.analyzing_subtitle")}
        </p>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // 
  // RENDER: FASE RESULTS
  // 
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Éxito Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <IconCheck className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-lg font-black text-foreground">{t("profile.physique_scan.completed")}</h3>
          {remainingScans !== null && (
            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
              {t("profile.physique_scan.remaining_scans", { count: remainingScans })}
            </p>
          )}
        </div>

        {/* Análisis General */}
        {results.analisis_general && (
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">{t("profile.physique_scan.general_analysis")}</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{results.analisis_general}</p>
          </div>
        )}

        {/* Muscle Rankings */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <IconSparkles className="w-3 h-3 text-primary" />
            {t("profile.physique_scan.muscle_ranks")}
          </h4>
          <div className="space-y-2">
            {results.musculos?.map((muscle, i) => {
              const color = RANK_COLORS[muscle.rango] || RANK_COLORS["Sin Rango"];
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/40 transition-all animate-in fade-in slide-in-from-right-2"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color + "15", border: `1px solid ${color}30` }}
                    >
                      {RANK_ICONS[muscle.rango] ? (
                        <img 
                            src={RANK_ICONS[muscle.rango]} 
                            alt={muscle.rango} 
                            className="w-6 h-6 object-contain" 
                            style={{ transform: muscle.rango === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      )}
                    </div>
                      <span className="text-sm font-bold text-foreground">{t(`muscles.${muscle.grupo}`, { defaultValue: muscle.grupo })}</span>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: color + "15",
                      color: color,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    {t(`ranks.info.list.${muscle.rango}.name`, { defaultValue: muscle.rango })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <Button
            className="w-full h-12 font-bold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all active:scale-[0.98]"
            onClick={() => {
              setPhase(PHASE.UPLOAD);
              setFrontImage(null);
              setBackImage(null);
              setFrontPreview(null);
              setBackPreview(null);
              setResults(null);
            }}
          >
            {t("profile.physique_scan.new_scan")}
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 font-bold rounded-full"
            onClick={() => handleOpenChange(false)}
          >
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  };

  // 
  // RENDER: FASE ERROR
  // 
  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <IconAlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-center space-y-2 max-w-[280px]">
        <h3 className="text-lg font-black text-foreground">{t("profile.physique_scan.error_title")}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
      </div>
      <Button
        className="h-12 px-8 font-bold rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all active:scale-[0.98]"
        onClick={() => setPhase(PHASE.UPLOAD)}
      >
        {t("profile.physique_scan.retry")}
      </Button>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92%] rounded-t-[32px] px-6 bg-background border-t border-border overflow-y-auto focus:outline-none"
      >
        {/* Header solo en Upload y Results */}
        {(phase === PHASE.UPLOAD || phase === PHASE.RESULTS) && (
          <SheetHeader className="mb-6 mt-6 text-center">
            <div className="mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              {phase === PHASE.RESULTS ? (
                <IconCheck className="w-8 h-8 text-emerald-500" />
              ) : (
                <IconCamera className="w-8 h-8 text-blue-500" />
              )}
            </div>

            {/* Badge PRO */}
            <div className="flex justify-center mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                PRO Feature
              </span>
            </div>

            <SheetTitle className="text-2xl font-bold text-foreground">
              {phase === PHASE.RESULTS ? t("profile.physique_scan.results_title") : t("profile.physique_scan.title")}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {phase === PHASE.RESULTS
                ? t("profile.physique_scan.results_subtitle")
                : t("profile.physique_scan.subtitle")
              }
            </SheetDescription>
          </SheetHeader>
        )}

        {/* Content por fase */}
        {phase === PHASE.UPLOAD && renderUpload()}
        {phase === PHASE.ANALYZING && renderAnalyzing()}
        {phase === PHASE.RESULTS && renderResults()}
        {phase === PHASE.ERROR && renderError()}
      </SheetContent>
    </Sheet>
  );
}
