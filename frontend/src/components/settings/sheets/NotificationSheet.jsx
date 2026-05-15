import React from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconBell, IconAlertTriangle } from "../../icons/Icons"; // Ajusta ruta si es necesario

export default function NotificationSheet({ open, onOpenChange, onConfirmDisable, loading }) {
  const { t } = useTranslation();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl px-6 pb-8">
        <SheetHeader className="mb-6 mt-4 text-center">
            <div className="mx-auto bg-red-500/10 p-4 rounded-full mb-2 w-fit">
                <IconBell className="h-8 w-8 text-red-500" />
            </div>
            <SheetTitle className="text-xl">{t("settings.notification_sheet.title")}</SheetTitle>
            <SheetDescription>
                {t("settings.notification_sheet.description")}
            </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Aviso visual extra */}
            <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 flex items-start gap-3">
                 <IconAlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-muted-foreground text-left">
                    {t("settings.notification_sheet.security_note")}
                 </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <Button 
                    variant="destructive" 
                    className="w-full font-bold h-11"
                    onClick={onConfirmDisable}
                    disabled={loading}
                >
                    {loading ? t("settings.notification_sheet.disabling") : t("settings.notification_sheet.confirm")}
                </Button>
                
                <Button 
                    variant="outline" 
                    className="w-full h-11"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                >
                    {t("settings.notification_sheet.cancel")}
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}