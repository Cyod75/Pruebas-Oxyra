import React from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "../../../hooks/useChangePassword"; // Ajusta ruta
import { IconEye, IconEyeOff, IconCheckCircle, IconAlertTriangle } from "../../icons/Icons"; // Ajusta ruta

export default function SecuritySheet({ open, onOpenChange }) {
  const { t } = useTranslation();
  const { 
    passForm, setPassForm, showPass, toggleShow, loading, status, submitPasswordChange 
  } = useChangePassword(() => onOpenChange(false));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl px-5">
        <SheetHeader className="mb-6 mt-4">
          <SheetTitle>{t("settings.security_sheet.title")}</SheetTitle>
          <SheetDescription>{t("settings.security_sheet.description")}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 pb-10">
          <PasswordField label={t("settings.security_sheet.current_label")} value={passForm.current} isVisible={showPass.current} onChange={(v) => setPassForm({...passForm, current: v})} onToggle={() => toggleShow('current')} />
          <PasswordField label={t("settings.security_sheet.new_label")} value={passForm.new} isVisible={showPass.new} onChange={(v) => setPassForm({...passForm, new: v})} onToggle={() => toggleShow('new')} />
          <PasswordField label={t("settings.security_sheet.confirm_label")} value={passForm.confirm} isVisible={showPass.confirm} onChange={(v) => setPassForm({...passForm, confirm: v})} onToggle={() => toggleShow('confirm')} />
          
          <StatusAlert status={status} />
          
          <Button className="w-full mt-2" onClick={submitPasswordChange} disabled={loading}>
            {loading ? t("settings.security_sheet.updating") : t("settings.security_sheet.update")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helpers locales (podrías sacarlos a un archivo shared si quisieras)
function PasswordField({ label, value, isVisible, onChange, onToggle }) {
    return (<div className="space-y-1 relative"><Label>{label}</Label><div className="relative"><Input type={isVisible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="pr-10" /><button className="absolute right-3 top-2.5 text-muted-foreground" onClick={onToggle}>{isVisible ? <IconEyeOff className="h-5 w-5"/> : <IconEye className="h-5 w-5"/>}</button></div></div>);
}
function StatusAlert({ status }) {
    if (!status || !status.message) return null;
    const isError = status.type === 'error';
    return (<div className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium animate-in fade-in ${isError ? "bg-red-500/15 text-red-600 border border-red-500/20" : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"}`}>{isError ? <IconAlertTriangle className="h-5 w-5"/> : <IconCheckCircle className="h-5 w-5"/>}<span>{status.message}</span></div>);
}