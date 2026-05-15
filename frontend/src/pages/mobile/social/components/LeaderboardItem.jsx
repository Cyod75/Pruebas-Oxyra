import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { RANK_COLORS } from "@/config/ranksColors";
import { RANK_ICONS } from "@/components/shared/ranksHelpers";
import DefaultAvatar from "@/components/DefaultAvatar";

export default function LeaderboardItem({ user, position, isCurrentUser = false }) {
  const navigate = useNavigate();
  const rankColor = RANK_COLORS[user.rango_global] || RANK_COLORS["Sin Rango"];
  const rankIcon = RANK_ICONS[user.rango_global];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(position * 0.04, 0.6) }}
      onClick={() => navigate(`/profile/${user.username}`)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all active:scale-[0.98] rounded-xl mx-2 mb-1.5 ${
        isCurrentUser
          ? "bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5"
          : "bg-zinc-900/50 hover:bg-zinc-800/60 border border-transparent"
      }`}
    >
      {/* Posición */}
      <span className={`text-sm font-black w-7 text-center tabular-nums ${
        isCurrentUser ? "text-primary" : "text-muted-foreground"
      }`}>
        #{position}
      </span>

      {/* Avatar */}
      <div className="relative">
        <DefaultAvatar
          userId={user.idUsuario ?? user.username}
          name={user.nombre_completo || user.username}
          src={user.foto_perfil}
          size="h-10 w-10"
          className="border-2 ring-0"
          style={{ borderColor: rankColor }}
        />
        {/* Mini rank icon badge over avatar */}
        {rankIcon && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border/20">
            <img 
              src={rankIcon} 
              alt={user.rango_global} 
              className="w-3.5 h-3.5 object-contain" 
              style={{ transform: user.rango_global === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${
          isCurrentUser ? "text-primary" : "text-foreground"
        }`}>
          {user.username}
          {isCurrentUser && (
            <span className="ml-1.5 text-[10px] font-medium text-primary/70">(Tú)</span>
          )}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {rankIcon && (
            <img 
              src={rankIcon} 
              alt="" 
              className="w-3 h-3 object-contain opacity-70" 
              style={{ transform: user.rango_global === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
            />
          )}
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 border-transparent"
            style={{ color: rankColor, backgroundColor: `${rankColor}15` }}
          >
            {user.rango_global || "Sin Rango"}
          </Badge>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={`text-sm font-black tabular-nums ${
          isCurrentUser ? "text-primary" : "text-foreground"
        }`}>
          {user.score.toFixed(1)}
        </p>
        <p className="text-[10px] text-muted-foreground">pts</p>
      </div>
    </motion.div>
  );
}
