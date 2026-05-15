import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from '../../../config/api';
// Reutilizamos tus iconos
import { IconBackArrow, IconUserPlus, IconCheck, IconSettings } from "../../../components/icons/Icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconLoader } from "../../../components/icons/Icons";

import DefaultAvatar from "../../../components/DefaultAvatar";
import { oxyAlert } from "../../../utils/customAlert";

export default function PublicProfile() {
  const { username } = useParams(); // Capturamos el username de la URL
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Para saber si soy yo mismo

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // Nota: Necesitarás un endpoint en tu backend que busque por username (público)
      // GET /api/users/profile/:username
      const res = await fetch(`${API_URL}/api/users/profile/${username.replace('@', '')}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsFollowing(data.is_following); // El backend debe decirme si ya lo sigo
        
        // Decodificar token o usar info guardada para saber si soy yo
        // Esto es simplificado, idealmente vendría de un Context de Auth
        const storedUser = JSON.parse(localStorage.getItem("user_info") || "{}");
        setCurrentUser(storedUser);
      } else {
        // Si no existe, redirigir o mostrar 404
        console.error("Usuario no encontrado");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    // Lógica para seguir/dejar de seguir
    setIsFollowing(!isFollowing); 
    // await fetch(...) 
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Perfil de ${profile.username} en Oxyra`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Entrena con ${profile.username}`, url });
      } catch (err) { console.log("Compartir cancelado"); }
    } else {
      navigator.clipboard.writeText(url);
      await oxyAlert("Enlace copiado al portapapeles");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><IconLoader className="animate-spin w-8 h-8 text-primary"/></div>;
  if (!profile) return <div className="h-screen flex items-center justify-center text-muted-foreground">Usuario no encontrado</div>;

  const isMe = currentUser?.username === profile.username;

  return (
    <div className="min-h-screen bg-background pb-24 animate-in fade-in duration-500">
      
      {/* HEADER CON BACK BUTTON */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <IconBackArrow />
         </button>
         <h1 className="text-lg font-bold tracking-tight">@{profile.username}</h1>
         {/* Si soy yo, muestro settings, si no, botón de opciones/reportar (opcional) */}
         <div className="w-8">
            {isMe && <IconSettings className="cursor-pointer" onClick={() => navigate("/settings")} />}
         </div>
      </div>

      {/* INFO PERFIL (Estilo Oxyra) */}
      <div className="px-4 mt-4 mb-6">
        <div className="flex items-center gap-6">
           <DefaultAvatar 
               userId={profile.idUsuario ?? profile.username} 
               name={profile.nombre_completo || profile.nombre}
               src={profile.foto_perfil} 
               size="h-24 w-24"
               className="border-2 border-background ring-2 ring-border/20 shadow-xl"
               muscularStats={profile.muscularStats}
           />

           <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-col">
                 <span className="font-bold text-xl leading-none">{profile.nombre}</span>
                 {profile.es_pro && (
                    <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-widest mt-1">
                        Pro Athlete
                    </span>
                 )}
              </div>

              <div className="flex justify-between pr-2">
                 <StatItem label="Entrenos" num={profile.stats?.entrenos || 0} />
                 <StatItem label="Seguidores" num={profile.stats?.seguidores || 0} />
                 <StatItem label="Seguidos" num={profile.stats?.seguidos || 0} />
              </div>
           </div>
        </div>

        <div className="mt-5">
           <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
             {profile.biografia || "Sin biografía."}
           </p>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="px-4 mb-8">
        <div className="flex gap-3">
           {isMe ? (
             <Button 
                variant="outline" 
                onClick={() => navigate("/profile")} // Ir a la vista de edición privada
                className="flex-1 h-10 rounded-xl font-bold border-border/50 bg-secondary/20 text-foreground hover:bg-secondary/40"
             >
                Editar Perfil
             </Button>
           ) : (
             <Button 
                onClick={handleFollowToggle}
                className={`flex-1 h-10 rounded-xl font-bold shadow-lg transition-all ${
                    isFollowing 
                    ? "bg-secondary text-foreground hover:bg-secondary/80" 
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
             >
                {isFollowing ? "Siguiendo" : "Seguir"}
             </Button>
           )}
           
           <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex-1 h-10 rounded-xl font-bold border-border/50 bg-secondary/20 text-foreground hover:bg-secondary/40"
           >
              Compartir
           </Button>
        </div>
      </div>

      {/* ESTADÍSTICAS VISUALES (Consistencia) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consistencia</h3>
            <span className="text-xs text-muted-foreground">Actividad reciente</span>
        </div>
        <Card className="bg-card/30 border-border/30 shadow-none backdrop-blur-sm">
           <CardContent className="p-4 flex items-end justify-between h-32 gap-1">
              {/* Aquí podrías mapear datos reales del backend */}
              {[10, 30, 0, 60, 40, 80, 20].map((val, i) => (
                 <div key={i} className="w-full relative group">
                    <div 
                      className={`w-full rounded-t-sm transition-all ${val > 0 ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ height: `${val || 5}%`, opacity: val > 0 ? 1 : 0.3 }} 
                    />
                 </div>
              ))}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatItem({ num, label }) {
  return (
    <div className="flex flex-col items-start min-w-[60px]">
       <span className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5 opacity-70">{label}</span>
       <span className="text-lg font-black text-foreground leading-none">{num}</span>
    </div>
  );
}