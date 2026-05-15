import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconLoader, IconCheck, IconRotate, IconLock } from "../../components/icons/Icons";
import ModernLoader from "../../components/shared/ModernLoader";
import BackButton from "../../components/shared/BackButton";
import BodyFront from "../../components/shared/BodyFront";
import BodyBack from "../../components/shared/BodyBack";
import { RANK_ICONS } from "../../components/shared/ranksHelpers";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { oxyAlert } from "../../utils/customAlert";
import { useTranslation } from "react-i18next";

// Configuración de colores por rango
const RANK_COLORS = {
  Oxyra: "#ef4444", // Red (Antes Purple)
  Campeon: "#a855f7", // Purple (Antes Red)
  Diamante: "#3b82f6", // Blue
  Esmeralda: "#10b981", // Emerald
  Platino: "#06b6d4", // Cyan
  Oro: "#eab308", // Yellow
  Plata: "#9ca3af", // Gray
  Bronce: "#78350f", // Brown
  Hierro: "#1c1917" // Stone-900 
};

export default function MobilePublicProfile() {
  const { t, i18n } = useTranslation();
  const username = useParams().username; 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bodyView, setBodyView] = useState("front"); // "front" | "back"

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/profile/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) {
          await oxyAlert(t("profile.public_profile.user_not_found"));
          navigate(-1);
        }
        return;
      }

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);

    // Si ya lo sigo O está pendiente -> Unfollow (Dejar de seguir / Cancelar solicitud)
    const isFollowingOrPending = profile.lo_sigo || profile.pendiente;
    
    const endpoint = isFollowingOrPending ? "/api/users/unfollow" : "/api/users/follow";
    const bodyKey = isFollowingOrPending ? "idUsuarioADejar" : "idUsuarioASequir";

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [bodyKey]: profile.idUsuario }),
      });

      if (res.ok) {
        const data = await res.json(); 
        
        setProfile((prev) => {
            // Ajustar contador solo si cambio el estado "lo_sigo" (activo)
            let newFollowers = prev.stats.seguidores;
            
            // Si antes lo seguía y ahora no -> Restar
            if (prev.lo_sigo && !data.lo_sigo) newFollowers -= 1;
            
            // Si antes no lo seguía y ahora sí -> Sumar
            if (!prev.lo_sigo && data.lo_sigo) newFollowers += 1;
            
            return {
                ...prev,
                lo_sigo: data.lo_sigo,
                pendiente: data.pendiente,
                stats: {
                    ...prev.stats,
                    seguidores: newFollowers
                }
            };
        });
      }
    } catch (error) {
      console.error("Error al seguir", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Procesar colores musculares
  const getMuscleColors = () => {
    if (!profile?.muscularStats) return {};
    const colors = {};
    profile.muscularStats.forEach((stat) => {
      // Check for mismatch
      const color = RANK_COLORS[stat.rango_actual] || "#2d2d2d";
      colors[stat.grupo_muscular] = color;
    });
    return colors;
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background fixed top-0 left-0 z-[100]">
        <ModernLoader text={t("profile.preparing_profile")} />
      </div>
    );
  if (!profile) return null;

  const muscleColors = getMuscleColors();

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/30">
        
      {/* 2. HEADER: Identidad (Glassmorphism) */}
      <div
        className="relative z-50 sticky top-0 w-full bg-background/80 backdrop-blur-xl border-b border-border/10 flex items-center justify-center pb-2"
        style={{ paddingTop: 'calc(0.5rem + var(--safe-area-top))', height: 'calc(4rem + var(--safe-area-top))' }}
      >
        
        {/* Izquierda: Back Button */}
        <div className="absolute left-4">
             <BackButton className="bg-secondary/50 hover:bg-secondary text-foreground rounded-full p-2" />
        </div>

        {/* Centro: Identidad */}
        <div className="flex flex-col items-center">
            <h1 className="text-sm font-black italic tracking-wider">@{profile.username}</h1>
            {profile.es_pro ? (
                <span className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-widest mt-0.5">
                    {t("profile.pro_athlete")}
                </span>
            ) : (
                <div className="flex items-center gap-1 mt-0.5">
                    {RANK_ICONS[profile.rango_global] && (
                        <img 
                            src={RANK_ICONS[profile.rango_global]} 
                            alt="" 
                            className="w-3.5 h-3.5 object-contain opacity-70" 
                            style={{ transform: profile.rango_global === 'Sin Rango' ? 'scale(1.15)' : 'none' }}
                        />
                    )}
                    <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {profile.rango_global || t("profile.public_profile.athlete")}
                    </span>
                </div>
            )}
        </div>
        
        {/* Derecha: Botón Seguir */}
        <div className="absolute right-4">
            <Button
                size="sm"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`h-8 px-4 rounded-full text-xs font-bold tracking-wide transition-all ${
                profile.lo_sigo
                    ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
                    : profile.pendiente 
                        ? "bg-secondary/50 text-muted-foreground border border-border/50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                }`}
            >
                {followLoading ? (
                    <IconLoader className="animate-spin h-3 w-3" /> 
                ) : profile.lo_sigo ? (
                    t("profile.public_profile.following")
                ) : profile.pendiente ? (
                    t("profile.public_profile.pending")
                ) : (
                    t("profile.public_profile.follow")
                )}
            </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-[calc(100vh-64px)] pb-24">
        
        {/* 3. NIVEL 1: HÉROE (Cuerpo 3D Flotante) */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[450px]">
            {/* Sombra de piso para "anclar" el modelo */}
            <div className="absolute bottom-10 w-40 h-4 bg-foreground/5 blur-xl rounded-[100%]" />
            
            <div className="w-full max-w-[400px] h-[420px] filter drop-shadow-[0_0_30px_rgba(0,0,0,0.05)] transition-all duration-500">
                 {bodyView === "front" ? (
                    <BodyFront colors={muscleColors} />
                 ) : (
                    <BodyBack colors={muscleColors} />
                 )}
            </div>

            {/* CONTROLES FLOTANTES (FAB) */}
            <button 
                onClick={() => setBodyView(prev => prev === "front" ? "back" : "front")}
                className="absolute bottom-8 right-6 h-12 w-12 rounded-2xl bg-secondary/80 backdrop-blur-md border border-border/20 flex items-center justify-center shadow-lg transition-all hover:bg-secondary active:scale-95 text-muted-foreground hover:text-foreground"
            >
                <IconRotate className={`h-5 w-5 transition-transform duration-500 ${bodyView === 'back' ? 'rotate-180' : ''}`} />
            </button>

            {/* Stats Distribuidos (Izquierda / Derecha) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                 <GlassStat label={t("profile.workouts").toUpperCase()} value={profile.stats.entrenos} align="start" />
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                 <div onClick={() => navigate(`/profile/${profile.username}/followers`)} className="cursor-pointer hover:opacity-80 active:scale-95 transition-all">
                   <GlassStat label={t("profile.followers").toUpperCase()} value={profile.stats.seguidores} align="end" />
                 </div>
                 <div onClick={() => navigate(`/profile/${profile.username}/following`)} className="cursor-pointer hover:opacity-80 active:scale-95 transition-all">
                   <GlassStat label={t("profile.following").toUpperCase()} value={profile.stats.seguidos} align="end" />
                 </div>
            </div>
        </div>

        {/* 4. NIVEL 3: DATOS (Historial Glass Cards) */}
        <div className="px-4 mt-4">
            <div className="flex items-end gap-2 mb-4 border-b border-border/10 pb-2">
                <h3 className="text-xl font-black italic text-foreground">{t("profile.public_profile.activity")}</h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{t("profile.public_profile.recent_logs")}</span>
            </div>

            <div className="space-y-3">
                {profile.is_private_restricted ? (
                     <div className="rounded-xl border border-dashed border-border/40 p-8 flex flex-col items-center justify-center text-center opacity-60">
                     <div className="p-3 bg-secondary rounded-full mb-3">
                        <IconLock className="h-6 w-6 text-muted-foreground" />
                     </div>
                     <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">{t("profile.public_profile.private_account_title")}</h4>
                     <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                        {t("profile.public_profile.private_account_desc")}
                     </p>
                 </div>
                ) : profile.recentWorkouts && profile.recentWorkouts.length > 0 ? (
                    profile.recentWorkouts.map((workout, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-4 shadow-sm transition-all hover:shadow-md">
                            {/* Accent Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-100 transition-opacity" />
                            
                            <div className="flex items-center justify-between pl-3">
                                <div>
                                    <h4 className="font-bold text-sm text-foreground leading-tight mb-1">{workout.nombre_sesion}</h4>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                        {formatDistanceToNow(new Date(workout.fecha_fin), { 
                                            addSuffix: true, 
                                            locale: i18n.language === 'es' ? es : enUS 
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black italic text-foreground/20 group-hover:text-primary transition-colors">
                                        {workout.duracion_minutos}'
                                    </span>
                                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50">{t("profile.public_profile.duration_label")}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-border/40 p-8 flex flex-col items-center justify-center text-center opacity-40">
                        <span className="text-2xl mb-2">⚡</span>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("profile.public_profile.no_activity")}</p>
                    </div>
                )}
            </div>

      </div>
      </div>
    </div>
  );
}

function GlassStat({ label, value, align = "start" }) {
    return (
        <div className={`bg-card/50 backdrop-blur-md rounded-lg p-3 border border-border/10 shadow-sm min-w-[80px] flex flex-col ${align === "end" ? "items-end" : "items-start"}`}>
            <div className="text-lg font-black italic text-foreground leading-none mb-1">{value}</div>
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
    );
}

function StatItem({ num, label }) { // Deprecated but kept to avoid render errors if used elsewhere
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-foreground leading-none">
        {num}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}
