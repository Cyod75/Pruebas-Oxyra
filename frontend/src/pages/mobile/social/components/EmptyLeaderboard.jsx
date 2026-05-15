import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { IconSearch, IconUserPlus } from "@/components/icons/Icons";

export default function EmptyLeaderboard({ onSwitchToExplore }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Icono decorativo */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center">
          <IconUserPlus className="h-12 w-12 text-zinc-500" />
        </div>
        {/* Anillos pulsantes */}
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
        <div className="absolute -inset-2 rounded-full border border-primary/10 animate-pulse opacity-20" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">
        {t("social.leaderboard.empty.title")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[260px] mb-6 leading-relaxed">
        {t("social.leaderboard.empty.description")}
      </p>

      {/* CTA */}
      <button
        onClick={onSwitchToExplore}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
      >
        <IconSearch className="h-4 w-4" />
        {t("social.leaderboard.empty.search_button")}
      </button>
    </motion.div>
  );
}
