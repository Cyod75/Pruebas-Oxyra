import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconAlertTriangle, IconTrash, IconMail, IconCheckCircle } from "../../icons/Icons";
import { API_URL } from '../../../config/api';

export default function DeleteAccountSheet({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/auth/send-deletion-code`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("settings.delete_account_sheet.error_sending"));
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (code.length !== 6) {
      setError(t("settings.delete_account_sheet.error_digits"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("settings.delete_account_sheet.error_deleting"));

      setSuccess(true);
      setTimeout(() => {
        localStorage.removeItem("authToken");
        window.location.href = "/welcome";
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setStep(1);
        setCode("");
        setError("");
        setSuccess(false);
      }, 300)
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto rounded-t-[2.5rem] px-6 border-t border-white/10 glass-dark pb-12 shadow-2xl">
        <div className="mx-auto w-12 h-1.5 bg-zinc-800 rounded-full mt-2 mb-6" />
        
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <IconTrash className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <SheetTitle className="text-2xl font-black tracking-tight text-white">{t("settings.delete_account_sheet.title")}</SheetTitle>
                <SheetDescription className="text-zinc-400 text-sm max-w-[280px]">
                  {t("settings.delete_account_sheet.description")}
                </SheetDescription>
              </div>
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                variant="destructive" 
                className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-red-500/20 active:scale-95 transition-all text-white border-none"
                onClick={handleSendCode}
                disabled={loading}
              >
                {loading ? t("settings.delete_account_sheet.sending") : t("settings.delete_account_sheet.send_code")}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-14 rounded-2xl font-bold text-zinc-400 hover:text-white"
                onClick={() => handleClose(false)}
                disabled={loading}
              >
                {t("settings.delete_account_sheet.cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                {success ? <IconCheckCircle className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" /> : <IconMail className="w-8 h-8 text-blue-500 animate-pulse" />}
              </div>
              <div className="space-y-2">
                <SheetTitle className="text-2xl font-black tracking-tight text-white">
                  {success ? t("settings.delete_account_sheet.success_title") : t("settings.delete_account_sheet.verify_title")}
                </SheetTitle>
                <SheetDescription className="text-zinc-400 text-sm">
                  {success 
                    ? t("settings.delete_account_sheet.success_description")
                    : t("settings.delete_account_sheet.verify_description")}
                </SheetDescription>
              </div>
            </div>

            {!success && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">{t("settings.delete_account_sheet.verification_code")}</Label>
                    <div className="relative group">
                      <Input 
                        type="text" 
                        maxLength="6"
                        placeholder="000000" 
                        className="h-16 rounded-2xl bg-zinc-900/50 border-zinc-800 text-center text-3xl font-mono tracking-[0.4em] text-white focus:ring-red-500/20 focus:border-red-500/50 transition-all placeholder:text-zinc-800"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>

                  {error && <ErrorAlert message={error} />}

                  <Button 
                    className="w-full h-14 rounded-2xl font-black text-base bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all mt-4 border-none shadow-xl shadow-white/10"
                    onClick={handleDeleteAccount}
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? t("settings.delete_account_sheet.deleting") : t("settings.delete_account_sheet.confirm_delete")}
                  </Button>
                  <button 
                     className="w-full text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors py-2"
                     onClick={() => setStep(1)}
                  >
                    {t("settings.delete_account_sheet.back")}
                  </button>
                </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-shake">
      <IconAlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
      <p className="text-sm font-medium text-red-200">{message}</p>
    </div>
  );
}
