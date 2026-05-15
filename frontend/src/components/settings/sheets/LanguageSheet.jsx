import React from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { IconCheck } from "../../icons/Icons";
import flagSpain from "../../../assets/iconos/Flag_of_Spain.png";
import flagUS from "../../../assets/iconos/Flag_of_United_States.png";

export default function LanguageSheet({ open, onOpenChange }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "es";

  const languages = [
    { id: "es", name: t("settings.spanish"), flag: flagSpain },
    { id: "en", name: t("settings.english"), flag: flagUS },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto rounded-t-[2.5rem] px-6 pb-12 border-t-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="mx-auto w-12 h-1.5 bg-muted/30 rounded-full mt-3 mb-6" />
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-extrabold tracking-tight">{t("settings.language_sheet_title")}</SheetTitle>
          <SheetDescription className="text-muted-foreground/70">
            {t("settings.language_sheet_desc")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                i18n.changeLanguage(lang.id);
                localStorage.setItem("oxyra_language", lang.id);
                // Cerrar sheet a los 300ms 
                setTimeout(() => onOpenChange(false), 200);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border-2 ${
                currentLanguage === lang.id
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "bg-muted/30 border-transparent hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 rounded-md overflow-hidden shadow-sm border border-border/10 flex items-center justify-center bg-black/10">
                  <img 
                    src={lang.flag} 
                    alt={lang.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className={`font-semibold ${currentLanguage === lang.id ? "text-primary" : "text-foreground"}`}>
                  {lang.name}
                </span>
              </div>
              {currentLanguage === lang.id && (
                <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg shadow-primary/20">
                  <IconCheck className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
