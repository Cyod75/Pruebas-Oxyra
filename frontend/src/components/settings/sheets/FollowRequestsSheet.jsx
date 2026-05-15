import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconCheck, IconX, IconLoader, IconHeart } from "../../icons/Icons"; 
import { API_URL } from '../../../config/api';
import DefaultAvatar from "../../DefaultAvatar";

export default function FollowRequestsSheet({ open, onOpenChange, onUpdate }) {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 

  useEffect(() => {
    if (open) {
        fetchRequests();
    }
  }, [open]);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
        const res = await fetch(`${API_URL}/api/users/requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setRequests(data);
        }
    } catch (error) {
        console.error("Error fetching requests:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
      setActionLoading(userId);
      const token = localStorage.getItem("authToken");
      const endpoint = action === 'accept' ? '/api/users/requests/accept' : '/api/users/requests/reject';
      
      try {
          const res = await fetch(`${API_URL}${endpoint}`, {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ seguidorId: userId })
          });

          if (res.ok) {
              if (action === 'accept') {
                  setRequests(prev => prev.map(r => 
                      r.idUsuario === userId ? { ...r, estado: 'aceptado' } : r
                  ));
              } else {
                  setRequests(prev => prev.filter(r => r.idUsuario !== userId));
              }
              // Actualizar datos del padre (contador seguidores, etc.)
              if (onUpdate) onUpdate();
          }
      } catch (error) {
          console.error(`Error ${action} request:`, error);
      } finally {
          setActionLoading(null);
      }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85%] rounded-t-[32px] px-5 bg-background border-t border-border overflow-y-auto focus:outline-none">
        
        {/* HEADER */}
        <SheetHeader className="mb-6 mt-6 text-left space-y-1">
            <SheetTitle className="text-2xl font-black italic tracking-tighter">{t("settings.activity_sheet.title")}</SheetTitle>
            <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("settings.activity_sheet.subtitle")}
            </SheetDescription>
        </SheetHeader>

        {/* LISTA CON SCROLL */}
        <div className="pb-10 min-h-[300px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <IconLoader className="animate-spin w-8 h-8 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest font-medium">{t("settings.activity_sheet.loading")}</span>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground opacity-40">
                    <IconHeart className="w-16 h-16" />
                    <p className="text-xs font-black uppercase tracking-widest">{t("settings.activity_sheet.empty")}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div key={req.idUsuario} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 transition-all hover:bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <DefaultAvatar
                                    userId={req.idUsuario}
                                    name={req.nombre_completo || req.username}
                                    src={req.foto_perfil}
                                    size="h-12 w-12"
                                    className="border border-border/50 ring-0"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-base italic tracking-tight">{req.username}</span>
                                    {req.estado === 'pendiente' ? (
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("settings.activity_sheet.requested_follow")}</span>
                                    ) : (
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wide animate-in fade-in slide-in-from-bottom-1 duration-500">{t("settings.activity_sheet.started_following")}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {req.estado === 'pendiente' ? (
                                    <>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => handleAction(req.idUsuario, 'reject')}
                                            disabled={actionLoading === req.idUsuario}
                                        >
                                            <IconX className="w-5 h-5" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition-all active:scale-95"
                                            onClick={() => handleAction(req.idUsuario, 'accept')}
                                            disabled={actionLoading === req.idUsuario}
                                        >
                                            {actionLoading === req.idUsuario ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
                                        </Button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </SheetContent>
    </Sheet>
  );
}
