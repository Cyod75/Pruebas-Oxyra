import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import logoWhite from "../../assets/images/oxyra-white.png";
import logoBlack from "../../assets/images/oxyra-black.png";

// UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Custom Components
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsRow from "../../components/settings/SettingsRow";
import ThemeController from "../../components/shared/ThemeController";

// Sheets (Popups)
import SecuritySheet from "../../components/settings/sheets/SecuritySheet";
import SubscriptionSheet from "../../components/settings/sheets/SubscriptionSheet";
import NotificationSheet from "../../components/settings/sheets/NotificationSheet";
import DeleteAccountSheet from "../../components/settings/sheets/DeleteAccountSheet";
import LanguageSheet from "../../components/settings/sheets/LanguageSheet";

// Hooks
import { useSubscription } from "../../hooks/useSubscription";
import { useNotifications } from "../../hooks/useNotifications";
import BackButton from "../../components/shared/BackButton";

// Iconos
import {
  IconBackArrow,
  IconUser,
  IconLock,
  IconLogout,
  IconPalette,
  IconWeight,
  IconTrash,
  IconBell,
  IconEyeOff,
  IconDoc,
  IconGlobe,
  IconDiscord,
  IconInstagram,
} from "../../components/icons/Icons";

import flagSpain from "../../assets/iconos/Flag_of_Spain.png";
import flagUS from "../../assets/iconos/Flag_of_United_States.png";

import { API_URL } from "../../config/api";

// Icono de carga simple (Spinner)
const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent text-muted-foreground" />
);

export default function MobileSettings() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();

  // -- HOOKS --
  const {
    isPro,
    daysLeft,
    loading: subLoading,
    handleSubscribe,
    handleCancel,
  } = useSubscription();
  const {
    notificationsEnabled,
    loading: notifLoading,
    toggleNotifications,
  } = useNotifications();

  // Estados UI
  const [weightUnit, setWeightUnit] = useState(
    () => localStorage.getItem("oxyra_weight_unit") || "kg",
  );

  // Control de Sheets
  const [showProfile, setShowProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  // PRIVACIDAD
  const [esPrivada, setEsPrivada] = useState(false);

  React.useEffect(() => {
    const fetchPrivacy = async () => {
      const token = localStorage.getItem("authToken");
      try {
        // Reusing /me endpoint to get es_privada
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEsPrivada(data.es_privada === 1);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrivacy();
  }, []);

  const handleTogglePrivate = async (val) => {
    // Optimistic update
    setEsPrivada(val);
    const token = localStorage.getItem("authToken");
    try {
      const formData = new FormData();
      formData.append("es_privada", val); 

      await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }, // No content-type for FormData
        body: formData,
      });
    } catch (e) {
      console.error(e);
      setEsPrivada(!val); // Revert on error
    }
  };

  // L?gica del Click en Notificaciones (CORREGIDA)
  const handleNotificationClick = () => {
    // 1. BLOQUEO ANTI-SPAM: Si ya est? cargando, no hacemos nada
    if (notifLoading) return;

    if (notificationsEnabled) {
      // Si est?n activas, queremos desactivar -> MOSTRAR POPUP
      setShowNotificationConfirm(true);
    } else {
      // Si est?n desactivadas, activar directamente
      toggleNotifications(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground animate-in fade-in duration-300 relative">
      {/* HEADER */}
      <header
        className="fixed top-0 w-full glass z-50 flex items-end px-4 justify-between border-b border-border/40"
        style={{
          paddingTop: "var(--safe-area-top)",
          height: "calc(3.5rem + var(--safe-area-top))",
        }}
      >
        <div className="flex items-center gap-2 h-14">
          <BackButton />
          <h1 className="text-lg font-bold tracking-tight">{t("settings.title")}</h1>
        </div>
      </header>

      {/* CONTENIDO */}
      <ScrollArea
        className="h-full pb-6 w-full"
        style={{ paddingTop: "calc(3.5rem + var(--safe-area-top))" }}
      >
        <div className="px-4 pt-6 pb-12">
          <SettingsSection title={t("settings.account")}>
            <SettingsRow
              icon={
                <img
                  src={isPro ? logoWhite : (isDark ? logoWhite : logoBlack)}
                  alt="Oxyra"
                  className="w-5 h-5 object-contain"
                  style={{ filter: isPro ? 'none' : (isDark ? 'none' : 'none') }}
                />
              }
              label={isPro ? t("settings.manage_subscription") : t("settings.oxyra_pro")}
              sub={
                isPro
                  ? (daysLeft > 0 ? t("settings.renew_in", { days: daysLeft }) : t("settings.active_subscription"))
                  : t("settings.level_up")
              }
              iconClass={
                isPro
                  ? "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30 shadow-sm"
                  : (isDark ? "bg-secondary/80 border border-border/50" : "bg-secondary border border-border/40")
              }
              right={
                isPro && (
                  <Badge className="bg-blue-500 text-white border-0 hover:bg-blue-600">
                    PRO
                  </Badge>
                )
              }
              onClick={() => setShowSubscription(true)}
            />
            <SettingsRow
              icon={<IconUser />}
              label={t("settings.personal_data")}
              sub={t("settings.personal_data_sub")}
              onClick={() => navigate("/settings/personal-data")}
            />

            {/* CUENTA PRIVADA */}
            <SettingsRow
              icon={<IconEyeOff />}
              label={t("settings.private_account")}
              sub={t("settings.private_account_sub")}
              iconClass={
                esPrivada
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-500/10 text-indigo-500"
              }
              right={
                <Switch
                  checked={esPrivada}
                  onCheckedChange={handleTogglePrivate}
                />
              }
            />

            <SettingsRow
              icon={<IconLock />}
              label={t("settings.security")}
              sub={t("settings.change_password")}
              onClick={() => setShowSecurity(true)}
            />
          </SettingsSection>

          <SettingsSection title={t("settings.experience")}>
            <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 shrink-0">
                  <IconPalette className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">{t("settings.visual_theme")}</span>
              </div>
              <ThemeController />
            </div>

            <SettingsRow
              icon={<IconGlobe />}
              label={t("settings.language")}
              iconClass="bg-blue-500/10 text-blue-500"
              onClick={() => setShowLanguage(true)}
              right={
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 rounded-full border border-border/20 shadow-sm">
                  <span className="text-xs font-semibold text-muted-foreground">{i18n.language === 'en' ? t("settings.english") : t("settings.spanish")}</span>
                  <div className="w-5 h-[13px] rounded-[2px] overflow-hidden shadow-sm flex items-center justify-center border border-white/20 bg-black/10">
                    <img 
                      src={i18n.language === 'en' ? flagUS : flagSpain} 
                      alt="Idioma" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              }
            />

            <SettingsRow
              icon={<IconWeight />}
              label={t("settings.weight_unit")}
              iconClass="bg-emerald-500/10 text-emerald-500"
              right={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nu = weightUnit === "kg" ? "lbs" : "kg";
                    setWeightUnit(nu);
                    localStorage.setItem("oxyra_weight_unit", nu);
                  }}
                  className="h-7 px-3 text-xs font-mono border-muted-foreground/20 bg-transparent hover:bg-muted"
                >
                  {weightUnit.toUpperCase()}
                </Button>
              }
            />

            {/* ROW DE NOTIFICACIONES */}
            <SettingsRow
              icon={<IconBell />}
              label={t("settings.notifications")}
              // Cambia la opacidad si est? cargando para dar feedback visual
              className={notifLoading ? "opacity-70 cursor-wait" : ""}
              iconClass={
                notificationsEnabled
                  ? "bg-pink-500 text-white"
                  : "bg-pink-500/10 text-pink-500"
              }
              onClick={handleNotificationClick}
              right={
                // 2. FEEDBACK VISUAL: Si carga mostramos spinner, si no el switch
                notifLoading ? (
                  <Spinner />
                ) : (
                  <Switch
                    checked={notificationsEnabled}
                    className="pointer-events-none"
                  />
                )
              }
            />
          </SettingsSection>

          <SettingsSection title={t("settings.legal")}>
            <SettingsRow
              icon={<IconDoc />}
              label={t("settings.privacy_policy")}
              onClick={() => window.open("https://jordi.informaticamajada.es/privacy.html", "_blank")}
            />
            <SettingsRow
              icon={<IconDoc />}
              label={t("settings.terms")}
              onClick={() => window.open("https://jordi.informaticamajada.es/terms.html", "_blank")}
            />
          </SettingsSection>

          <SettingsSection title={t("settings.about_us")}>
            <SettingsRow
              icon={<IconDiscord className="w-5 h-5" />}
              label={t("settings.discord")}
              sub={t("settings.discord_sub")}
              iconClass="bg-[#5865F2]/10 text-[#5865F2]"
              onClick={() => window.open("#", "_blank")}
            />
            <SettingsRow
              icon={<IconInstagram className="w-5 h-5" />}
              label={t("settings.instagram")}
              sub={t("settings.instagram_sub")}
              iconClass="bg-[#E1306C]/10 text-[#E1306C]"
              onClick={() => window.open("https://www.instagram.com/jmonteiro.05?igsh=bWc4dGF6ZGJqeDg3&utm_source=qr", "_blank")}
            />
          </SettingsSection>

          <SettingsSection title={t("settings.danger_zone")}>
            <SettingsRow
              icon={<IconLogout />}
              label={t("settings.logout")}
              isDestructive
              onClick={() => {
                localStorage.removeItem("authToken");
                navigate("/welcome");
              }}
            />
            <SettingsRow
              icon={<IconTrash />}
              label={t("settings.delete_account")}
              isDestructive
              onClick={() => setShowDeleteAccount(true)}
            />
          </SettingsSection>

          <div className="text-center space-y-1 pt-4 pb-10 opacity-50">
            <p className="text-xs font-bold">Oxyra App</p>
            <p className="text-[10px] text-muted-foreground">
              v1.2.0 - Build 4502
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* SHEETS */}
      <SecuritySheet open={showSecurity} onOpenChange={setShowSecurity} />
      <DeleteAccountSheet
        open={showDeleteAccount}
        onOpenChange={setShowDeleteAccount}
      />
      <LanguageSheet
        open={showLanguage}
        onOpenChange={setShowLanguage}
      />
      <SubscriptionSheet
        open={showSubscription}
        onOpenChange={setShowSubscription}
        isPro={isPro}
        daysLeft={daysLeft}
        loading={subLoading}
        onSubscribe={handleSubscribe}
        onCancel={handleCancel}
      />

      <NotificationSheet
        open={showNotificationConfirm}
        onOpenChange={setShowNotificationConfirm}
        loading={notifLoading}
        onConfirmDisable={() => {
          toggleNotifications(false).then(() =>
            setShowNotificationConfirm(false),
          );
        }}
      />
    </div>
  );
}
