import React from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RANK_COLORS } from "../../../config/ranksColors";
import { RANK_ICONS } from "../../shared/ranksHelpers";
import { IconAlertCircle } from "../../icons/Icons";

export default function RanksInfoSheet({ open, onOpenChange }) {
  const { t } = useTranslation();

  const RANKS = [
      { key: "Oxyra", color: RANK_COLORS["Oxyra"] },
      { key: "Campeon", color: RANK_COLORS["Campeon"] },
      { key: "Diamante", color: RANK_COLORS["Diamante"] },
      { key: "Esmeralda", color: RANK_COLORS["Esmeralda"] },
      { key: "Platino", color: RANK_COLORS["Platino"] },
      { key: "Oro", color: RANK_COLORS["Oro"] },
      { key: "Plata", color: RANK_COLORS["Plata"] },
      { key: "Bronce", color: RANK_COLORS["Bronce"] },
      { key: "Hierro", color: RANK_COLORS["Hierro"] },
      { key: "Sin Rango", color: RANK_COLORS["Sin Rango"] }
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80%] rounded-t-[32px] px-6 bg-background border-t border-border focus:outline-none overflow-y-auto">
        
        <SheetHeader className="mb-8 mt-4 text-left">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconAlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <SheetTitle className="text-xl font-black italic uppercase tracking-tight">{t("ranks.info.title")}</SheetTitle>
                    <SheetDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        {t("ranks.info.subtitle")}
                    </SheetDescription>
                </div>
            </div>
        </SheetHeader>

        <div className="space-y-8 pb-12">
            
            <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("ranks.info.how_it_works_title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-3.5">
                    {t("ranks.info.how_it_works_desc")}
                </p>
            </section>

            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("ranks.info.hierarchy_title")}
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                    {RANKS.map((rank, i) => {
                        const rankInfo = t(`ranks.info.list.${rank.key}`, { returnObjects: true });
                        const icon = RANK_ICONS[rankInfo.name] || RANK_ICONS[rank.key];
                        return (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                    style={{ backgroundColor: rank.color + '15', border: `1px solid ${rank.color}30` }}
                                >
                                    {icon ? (
                                        <img 
                                            src={icon} 
                                            alt={rank.name} 
                                            className="w-8 h-8 object-contain drop-shadow-sm" 
                                            style={{ transform: rank.name === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
                                        />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: rank.color }} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase italic tracking-tighter" style={{ color: rank.color }}>
                                        {rankInfo.name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-medium leading-tight">
                                        {rankInfo.desc}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[11px] text-primary font-bold italic text-center">
                    {t("ranks.info.quote")}
                </p>
            </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
