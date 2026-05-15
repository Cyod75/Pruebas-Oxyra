import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { IconUser, IconMail, IconWeight, IconInfo, IconBackArrow } from "../../components/icons/Icons"; 
import { API_URL } from '../../config/api';
import DefaultAvatar from "../../components/DefaultAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import BackButton from "../../components/shared/BackButton";

// Skeleton simple
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-muted rounded-md ${className}`} />
);

export default function PersonalDataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (g) => {
    if (g === 'M') return t("profile.edit.male");
    if (g === 'F') return t("profile.edit.female");
    if (g === 'Otro') return t("profile.edit.other");
    return null;
  };

  const DataRow = ({ icon, label, value, isMissing, vertical }) => {
    if (vertical) {
      return (
        <div className="flex flex-col p-3 bg-secondary/20 rounded-xl border border-border/40 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
              {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
          {isMissing ? (
            <span className="text-xs text-muted-foreground italic px-2 py-1 text-left w-full">{t("common.not_defined")}</span>
          ) : (
            <div className="bg-background/40 rounded-lg px-3 py-2 border border-border/20 mt-1">
              <span className="text-sm font-semibold break-all">{value}</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isMissing ? (
          <span className="text-xs text-muted-foreground italic bg-secondary/50 px-2 py-1 rounded-md text-right">{t("common.not_defined")}</span>
        ) : (
          <span className="text-sm font-semibold truncate max-w-[150px] text-right" title={value}>{value}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-in fade-in duration-300">
      {/* Header fijo no transparente con título integrado */}
      <div className="fixed top-0 w-full z-50 flex items-center px-4 bg-background border-b border-border/40" 
           style={{
             paddingTop: "var(--safe-area-top)",
             height: "calc(3.5rem + var(--safe-area-top))"
           }}>
        <BackButton fallbackPath="/" className="rounded-full [&>svg]:w-7 [&>svg]:h-7" />
        <h1 className="text-lg font-bold ml-1 tracking-tight">{t("personal_data.title")}</h1>
      </div>

      <ScrollArea className="flex-1 w-full px-5 pb-10" 
                  style={{ paddingTop: "calc(3.5rem + var(--safe-area-top))" }}>
        {loading || !userData ? (
          <div className="space-y-4 pt-6">
            <div className="flex justify-center mb-8">
              <Skeleton className="h-28 w-28 rounded-full" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="pt-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-6 pb-8">
            <div className="flex flex-col items-center gap-2 mb-6">
              <DefaultAvatar
                userId={userData.idUsuario || userData.username}
                name={userData.nombre_completo || userData.username}
                src={userData.foto_perfil}
                size="h-28 w-28"
                className="shadow-sm border border-border ring-2 ring-background ring-offset-2 ring-offset-muted/20"
                muscularStats={userData.muscularStats}
              />
              {userData.nombre_completo && (
                <h3 className="font-bold text-lg mt-2">{userData.nombre_completo}</h3>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="pl-1 mb-2">
                <h4 className="text-xs uppercase font-bold text-muted-foreground">{t("personal_data.account_section")}</h4>
              </div>
              <DataRow 
                icon={<IconUser className="w-5 h-5"/>} 
                label={t("personal_data.username")} 
                value={`@${userData.username}`} 
              />
              <DataRow 
                icon={<IconMail className="w-5 h-5"/>} 
                label={t("personal_data.email")} 
                value={userData.email} 
                vertical
              />
              
              <div className="pl-1 mt-6 mb-2">
                <h4 className="text-xs uppercase font-bold text-muted-foreground">{t("personal_data.physique_section")}</h4>
              </div>
              <DataRow 
                icon={<IconInfo className="w-5 h-5"/>} 
                label={t("personal_data.gender")} 
                value={getGenderLabel(userData.genero)} 
                isMissing={!userData.genero}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataRow 
                  icon={<IconWeight className="w-5 h-5"/>} 
                  label={t("personal_data.weight")} 
                  value={(userData.peso_kg && Number(userData.peso_kg) > 0) ? `${Number(userData.peso_kg).toFixed(1)} kg` : null} 
                  isMissing={!userData.peso_kg || Number(userData.peso_kg) === 0}
                />
                <DataRow 
                  icon={<IconUser className="w-5 h-5"/>} 
                  label={t("personal_data.height")} 
                  value={(userData.estatura_cm && Number(userData.estatura_cm) > 0) ? `${userData.estatura_cm} cm` : null} 
                  isMissing={!userData.estatura_cm || Number(userData.estatura_cm) === 0}
                />
              </div>
            </div>
            
            <div className="mt-8 text-center px-4 pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                <Trans i18nKey="personal_data.edit_hint">
                  Para modificar tu información, dirígete a tu <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/profile')}>Perfil</span> y selecciona Editar Perfil.
                </Trans>
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
