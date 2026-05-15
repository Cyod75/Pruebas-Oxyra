import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../config/api';
// ICONOS
import { IconSettings, IconHeart, IconScanBody, IconChevronRight } from "../../components/icons/Icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// NUESTRO NUEVO AVATAR
import DefaultAvatar from "../../components/DefaultAvatar";

// COMPONENTE REUTILIZABLE
import FollowRequestsSheet from "../../components/settings/sheets/FollowRequestsSheet";
import SubscriptionSheet from "../../components/settings/sheets/SubscriptionSheet";

// HOOKS
import { useSubscription } from "../../hooks/useSubscription";
// IMPORTAR EL LOADER
import ModernLoader from "../../components/shared/ModernLoader";
import { useConnection } from "../../context/ConnectionContext";
import VolumeChart from "../../components/profile/VolumeChart";
import { oxyAlert } from "../../utils/customAlert";

export default function MobileProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { reportError } = useConnection();
  
  // Estado para controlar el Popup de edición
  const [showRequests, setShowRequests] = useState(false); // NUEVO ESTADO
  const [showSubscription, setShowSubscription] = useState(false);

  // Hook Pro
  const { isPro, daysLeft, loading: subLoading, handleSubscribe, handleCancel } = useSubscription();

  // Estado del usuario
  const [user, setUser] = useState({
    idUsuario: null,
    nombre: t("profile.loading"),
    username: "...",
    biografia: "",
    foto_perfil: null,
    peso: "",
    altura: "",
    genero: "M",
    stats: { entrenos: 0, seguidores: 0, seguidos: 0 },
    es_pro: false,
    muscularStats: []
  });

  // 1. CARGAR DATOS
  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/welcome");

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(t("profile.error_loading"));
      
      const data = await response.json();

      setUser({
          idUsuario: data.idUsuario ?? null,
          nombre: data.nombre_completo || t("profile.default_user"),
          username: data.username,
          biografia: data.biografia || "",
          foto_perfil: data.foto_perfil ?? null,
          
          // IMPORTANTE: Mapeo exacto con los nombres que devolvemos ahora en el backend
          peso: data.peso_kg || "",
          altura: data.estatura_cm || "",
          genero: data.genero || "M",
          
          stats: { 
              entrenos: data.stats?.entrenos || 0, 
              seguidores: data.stats?.seguidores || 0, 
              seguidos: data.stats?.seguidos || 0 
          },
          es_pro: data.es_pro === 1,
          muscularStats: data.muscularStats || [],
      });

      setLoading(false);

    } catch (error) {
      console.error(error);
      reportError();
    }
  };

  const handleShareProfile = async () => {
    const shareUrl = `${window.location.origin}/profile/${user.username}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: t("profile.share_title", { name: user.nombre }),
                text: t("profile.share_text"),
                url: shareUrl
            });
            return; 
        } catch (err) {
            console.log(t("profile.share_cancelled"));
        }
    }

    try {
        await navigator.clipboard.writeText(shareUrl);
        await oxyAlert(t("profile.link_copied")); 
    } catch (err) {
        await oxyAlert(t("profile.link_copy_error"));
    }
  };

  // BLOQUEO DE SEGURIDAD (SOLUCIÓN LOADER)
  if (loading) {
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center overflow-hidden pt-[108px]">
            <ModernLoader text={t("profile.preparing_profile")} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-foreground animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div 
        className="flex items-center justify-between px-4 pb-2"
        style={{ paddingTop: 'calc(1.5rem + var(--safe-area-top))' }}
      >
         <h1 className="text-xl font-bold tracking-tight ml-2">{user.username}</h1>
         <div className="flex items-center gap-5">
            <div onClick={() => setShowRequests(true)} className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-300">
                <IconHeart />
            </div>
            <div onClick={() => navigate("/settings")} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <IconSettings />
            </div>
         </div>
      </div>

      {/* INFO PERFIL */}
      <div className="px-4 mt-4 mb-6">
        <div className="flex items-center gap-6">
           <DefaultAvatar 
              userId={user.idUsuario ?? user.username} 
              name={user.nombre}
              src={user.foto_perfil} 
              size="h-24 w-24"
              className="border border-border shadow-sm"
              muscularStats={user.muscularStats}
           />

           <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-col">
                 <span className="font-bold text-lg leading-none">{user.nombre}</span>
                 {user.es_pro && (
                    <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-widest mt-1">
                        {t("profile.pro_athlete")}
                    </span>
                 )}
              </div>

              <div className="flex justify-between pr-4">
                 <StatItem label={t("profile.workouts")} num={user.stats.entrenos} />
                 <div onClick={() => navigate(`/profile/${user.username}/followers`)} className="cursor-pointer hover:opacity-80 active:scale-95 transition-all">
                   <StatItem label={t("profile.followers")} num={user.stats.seguidores} />
                 </div>
                 <div onClick={() => navigate(`/profile/${user.username}/following`)} className="cursor-pointer hover:opacity-80 active:scale-95 transition-all">
                   <StatItem label={t("profile.following")} num={user.stats.seguidos} />
                 </div>
               </div>
           </div>
        </div>

        <div className="mt-4">
           <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
             {user.biografia || t("profile.add_bio")}
           </p>
        </div>
      </div>

      {/* BOTONES ACCIÓN */}
      <div className="px-4 mb-8">
        <div className="flex gap-3">
           <Button 
             variant="outline" 
             onClick={() => navigate('/profile/edit')}
             className="flex-1 h-9 rounded-lg font-semibold bg-secondary/50 border-0 text-foreground hover:bg-secondary transition-colors"
           >
             {t("profile.edit_profile")}
           </Button>
           
           <Button 
             variant="outline" 
             onClick={handleShareProfile}
             className="flex-1 h-9 rounded-lg font-semibold bg-secondary/50 border-0 text-foreground hover:bg-secondary transition-colors"
           >
              {t("profile.share")}
           </Button>
        </div>
      </div>

      {/* BANNER IA ESCANEO CORPORAL */}
      {!isPro && (
        <div className="px-4 mb-8">
          <div 
            onClick={() => setShowSubscription(true)}
            className="flex items-center justify-between px-4 py-3 rounded-[1rem] cursor-pointer transition-all active:scale-95 border border-indigo-500/20 shadow-md relative overflow-hidden"
            style={{ background: 'linear-gradient(100deg, #111827 0%, #1e3a8a 150%)' }}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="text-indigo-100 opacity-90 shrink-0">
                 <IconScanBody className="w-10 h-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-[16px] tracking-tight">{t("profile.scan_body")}</span>
                <span className="text-[12px] text-indigo-200/60 font-medium mt-0.5">{t("profile.scan_body_sub")}</span>
              </div>
            </div>
            <IconChevronRight className="w-5 h-5 text-white/50 shrink-0 relative z-10" />
          </div>
        </div>
      )}

      {/* GRÁFICA DE VOLUMEN */}
      <VolumeChart />

      {/* POPUP DE SOLICITUDES */}
      <FollowRequestsSheet 
        open={showRequests} 
        onOpenChange={setShowRequests}
        onUpdate={fetchProfile}
      />

      <SubscriptionSheet
        open={showSubscription}
        onOpenChange={setShowSubscription}
        isPro={isPro}
        daysLeft={daysLeft}
        loading={subLoading}
        onSubscribe={handleSubscribe}
        onCancel={handleCancel}
      />
    </div>
  );
}

function StatItem({ num, label }) {
  return (
    <div className="flex flex-col items-start min-w-[60px]">
       <span className="text-[11px] text-muted-foreground font-medium mb-0.5">{label}</span>
       <span className="text-lg font-bold text-foreground leading-none">{num}</span>
    </div>
  );
}