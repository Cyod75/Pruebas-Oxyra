import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../config/api";
import DefaultAvatar from "../DefaultAvatar";
import { IconLoader } from "../icons/Icons";

export default function UserListItem({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Estado local — espeja MobilePublicProfile: lo_sigo + pendiente
  const [followState, setFollowState] = useState({
    lo_sigo: user.lo_sigo ?? false,
    pendiente: user.pendiente ?? false,
  });
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);

    // Si ya sigo O está pendiente → unfollow / cancelar solicitud
    const isFollowingOrPending = followState.lo_sigo || followState.pendiente;
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
        body: JSON.stringify({ [bodyKey]: user.idUsuario }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowState({
          lo_sigo: data.lo_sigo ?? false,
          pendiente: data.pendiente ?? false,
        });
      }
    } catch (error) {
      console.error("Error social:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determinar estado visual del botón (igual que MobilePublicProfile)
  const buttonClass = followState.lo_sigo
    ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
    : followState.pendiente
    ? "bg-secondary/50 text-muted-foreground border border-border/50"
    : "bg-primary text-primary-foreground hover:opacity-90";

  const buttonLabel = followState.lo_sigo
    ? t("profile.public_profile.following")
    : followState.pendiente
    ? t("profile.public_profile.pending")
    : t("profile.public_profile.follow");

  return (
    <div
      onClick={() => navigate(`/profile/${user.username}`)}
      className="flex items-center justify-between p-3 bg-card/50 border border-border/40 rounded-xl mb-2 cursor-pointer hover:bg-card transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <DefaultAvatar
          userId={user.idUsuario}
          name={user.nombre_completo || user.username}
          src={user.foto_perfil}
          size="h-10 w-10"
          className="border border-border/50 shadow-sm ring-0"
        />

        <div className="flex flex-col">
          <p className="text-sm font-bold leading-none text-foreground">{user.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.nombre_completo}</p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleFollowToggle}
        disabled={loading}
        className={`h-8 px-4 rounded-full text-xs font-bold tracking-wide transition-all ${buttonClass}`}
      >
        {loading ? (
          <IconLoader className="animate-spin h-3 w-3" />
        ) : (
          buttonLabel
        )}
      </Button>
    </div>
  );
}