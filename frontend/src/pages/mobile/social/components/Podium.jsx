import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RANK_COLORS } from "@/config/ranksColors";
import { PODIUM_COLORS, RANK_ICONS } from "@/components/shared/ranksHelpers";
import { IconCrown } from "@/components/icons/Icons";
import DefaultAvatar from "@/components/DefaultAvatar";

function PodiumUser({ user, position, delay = 0 }) {
  const navigate = useNavigate();
  const colors = PODIUM_COLORS[position];
  const rankColor = RANK_COLORS[user.rango_global] || RANK_COLORS["Sin Rango"];
  const rankIcon = RANK_ICONS[user.rango_global];

  const isFirst = position === 1;
  const avatarSize = isFirst ? "h-20 w-20" : "h-14 w-14";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onClick={() => navigate(`/profile/${user.username}`)}
    >
      {/* Corona para el #1 */}
      {isFirst && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
          className="text-amber-400 -mb-2 z-10"
        >
          <IconCrown className="h-7 w-7 fill-amber-400 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Avatar con borde de color */}
      <div
        className="relative rounded-full p-[3px] transition-transform group-hover:scale-105 group-active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${colors.border}, ${rankColor})`,
          boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
        }}
      >
        <DefaultAvatar
          userId={user.idUsuario ?? user.username}
          name={user.nombre_completo || user.username}
          src={user.foto_perfil}
          size={avatarSize}
          className="border-2 border-zinc-950 ring-0"
        />

        {/* Número de posición */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 border-zinc-950"
          style={{ backgroundColor: colors.border, color: '#09090b' }}
        >
          {position}
        </div>

        {/* Mini rank icon */}
        {rankIcon && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <img src={rankIcon} alt={user.rango_global} className="w-4 h-4 object-contain" />
          </div>
        )}
      </div>

      {/* Username */}
      <p className="text-xs font-bold text-foreground mt-2 truncate max-w-[80px]">
        {user.username}
      </p>

      {/* Score */}
      <div
        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: colors.bg, color: colors.border }}
      >
        {user.score.toFixed(1)}
      </div>
    </motion.div>
  );
}

export default function Podium({ top3 }) {
  if (!top3 || top3.length === 0) return null;

  // Reorganizar: [#2, #1, #3] para layout visual piramidal
  const ordered = [];
  if (top3[1]) ordered.push({ user: top3[1], position: 2 });
  if (top3[0]) ordered.push({ user: top3[0], position: 1 });
  if (top3[2]) ordered.push({ user: top3[2], position: 3 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-end justify-center gap-4 px-4 pt-6 pb-4"
    >
      {ordered.map(({ user, position }, idx) => (
        <div
          key={user.idUsuario}
          className={position === 1 ? "mb-4" : "mb-0"}
        >
          <PodiumUser
            user={user}
            position={position}
            delay={idx * 0.15}
          />
        </div>
      ))}
    </motion.div>
  );
}
