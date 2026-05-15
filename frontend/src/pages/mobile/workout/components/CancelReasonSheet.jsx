import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function CancelReasonSheet({ open, onOpenChange, onConfirm }) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState("");

  const reasons = [
    t("workout_session.cancel.reasons.wrong_routine"),
    t("workout_session.cancel.reasons.no_time"),
    t("workout_session.cancel.reasons.technical"),
    t("workout_session.cancel.reasons.tired"),
    t("workout_session.cancel.reasons.equipment"),
    t("workout_session.cancel.reasons.other"),
  ];

  const handleConfirm = () => {
    onConfirm(selectedReason);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[32px] px-6 bg-background border-t border-border focus:outline-none flex flex-col max-h-[90%]">
        
        <SheetHeader className="mb-6 mt-6">
          <SheetTitle className="text-xl font-bold text-foreground">{t("workout_session.cancel.title")}</SheetTitle>
          <SheetDescription className="text-sm font-medium text-muted-foreground">
            {t("workout_session.cancel.subtitle")}
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto space-y-2.5 pb-2">
          {reasons.map((r) => (
            <div 
              key={r}
              onClick={() => setSelectedReason(r)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                selectedReason === r 
                ? "bg-secondary border-border shadow-sm text-foreground" 
                : "bg-transparent border-border/40 hover:bg-secondary/40 text-muted-foreground"
              }`}
            >
              <span className="text-sm font-bold">{r}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedReason === r ? "border-foreground" : "border-muted-foreground/30"}`}>
                {selectedReason === r && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 pb-8 mt-auto bg-background">
          <Button 
            className="w-full h-14 rounded-full font-bold text-[15px] bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all"
            onClick={handleConfirm}
            disabled={!selectedReason}
          >
            {t("workout_session.cancel.confirm")}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
