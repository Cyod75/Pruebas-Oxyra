import React from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MUSCLE_EXERCISES } from "../../../config/muscleData";
import { RANK_COLORS } from "../../../config/ranksColors";
import { RANK_ICONS } from "../../shared/ranksHelpers";
import { IconDumbbell } from "../../icons/Icons";

export default function MuscleDetailSheet({ open, onOpenChange, muscle, stats }) {
  const { t } = useTranslation();
  if (!muscle) return null;

  const muscleStat = stats.find(s => s.grupo_muscular === muscle) || {
    rango_actual: t("ranks.unranked"),
    nivel_actual: 0,
    progreso: 0
  };

  const exercises = MUSCLE_EXERCISES[muscle] || [];
  const rankColor = RANK_COLORS[muscleStat.rango_actual] || RANK_COLORS["Sin Rango"] || RANK_COLORS["Unranked"] || "#808080";
  const rankIcon = RANK_ICONS[muscleStat.rango_actual];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70%] rounded-t-[32px] px-6 bg-background border-t border-border focus:outline-none overflow-y-auto">
        
        <SheetHeader className="mb-8 mt-4 text-left">
            <div className="flex items-center gap-4">
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ backgroundColor: rankColor + '20', border: `1px solid ${rankColor}40` }}
                >
                    {rankIcon ? (
                        <img 
                            src={rankIcon} 
                            alt={muscleStat.rango_actual} 
                            className="w-9 h-9 object-contain" 
                            style={{ transform: muscleStat.rango_actual === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: rankColor }} />
                    )}
                </div>
                <div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">
                        {t(`muscles.${muscle}`)}
                    </SheetTitle>
                    <SheetDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                        {t("ranks.analysis")}
                    </SheetDescription>
                </div>
            </div>
        </SheetHeader>

        <div className="space-y-8 pb-12">
            {/* STATS SECTION */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox 
                    label={t("ranks.current_rank")} 
                    value={t(`ranks.info.list.${muscleStat.rango_actual}.name`, { defaultValue: muscleStat.rango_actual })} 
                    color={rankColor}
                    subValue={t("ranks.level", { level: muscleStat.nivel_actual || 1 })}
                    icon={rankIcon}
                />
                <StatBox 
                    label={t("ranks.potential")} 
                    value={t("ranks.elite")} 
                    color="#60a5fa"
                    subValue={t("ranks.next_milestone")}
                />
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("ranks.rank_progress")}</span>
                    <span className="text-xs font-bold text-foreground">75%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: '75%', backgroundColor: rankColor }}
                    />
                </div>
            </div>

            {/* RECOMMENDED EXERCISES */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <IconDumbbell className="w-3 h-3" />
                    {t("ranks.optimized_exercises")}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 group active:scale-[0.98] transition-all">
                            <span className="font-bold text-sm text-foreground/80">{t(`exercises.${ex}`, { defaultValue: ex })}</span>
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatBox({ label, value, color, subValue, icon }) {
    return (
        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">{label}</span>
            {icon && (
                <img 
                    src={icon} 
                    alt={value} 
                    className="w-7 h-7 object-contain mb-1" 
                    style={{ transform: value === 'Sin Rango' ? 'scale(1.2)' : 'none' }}
                />
            )}
            <span className="text-lg font-black block" style={{ color }}>{value}</span>
            <span className="text-[10px] font-medium text-muted-foreground/60 block">{subValue}</span>
        </div>
    );
}
