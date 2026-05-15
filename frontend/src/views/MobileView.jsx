import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom"; 
import MobileHeader from "../components/layouts/MobileHeader";
import MobileFooter from "../components/layouts/MobileFooter";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { scheduleDailyReminder } from "../utils/notifications";

//  Creación de canales Android (obligatorio en Android 8+) 
// Sin canales definidos, las notificaciones llegan silenciosas o no llegan.
const initNotificationChannels = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await LocalNotifications.createChannel({
            id: "oxyra_general",
            name: "General",
            description: "Notificaciones generales de Oxyra",
            importance: 4,   // HIGH (hace sonar y aparece en pantalla)
            visibility: 1,   // PUBLIC
            vibration: true,
        });

        await LocalNotifications.createChannel({
            id: "oxyra_training",
            name: "Entrenamiento",
            description: "Alertas durante tus sesiones de gym",
            importance: 5,   // MAX (urgente, aparece sobre otras apps)
            visibility: 1,
            vibration: true,
            sound: "default",
        });

        await LocalNotifications.createChannel({
            id: "oxyra_daily",
            name: "Recordatorios diarios",
            description: "Recordatorios de registro de comidas y entrenamientos",
            importance: 3,   // DEFAULT (sin interrupción visual)
            visibility: 1,
            vibration: false,
        });

        console.warn("[Oxyra] Canales de notificación inicializados.");
    } catch (e) {
        console.error("[Oxyra] Error al crear canales de notificación:", e);
    }
};

export default function MobileView() {
    const location = useLocation();
    const isFullPageView =
        location.pathname.startsWith("/profile") ||
        location.pathname.startsWith("/routine") ||
        location.pathname.startsWith("/workout") ||
        location.pathname.startsWith("/settings") ||
        location.pathname === "/search";

    const hideFooterOnMobile = 
        location.pathname.startsWith("/routine") ||
        location.pathname.startsWith("/workout") ||
        location.pathname === "/settings/personal-data" ||
        location.pathname === "/profile/edit";

    //  Inicialización única al montar la vista autenticada 
    useEffect(() => {
        const setup = async () => {
            await initNotificationChannels();
            await scheduleDailyReminder();
        };

        setup();
    }, []); 

    return (
        <div className="flex flex-col h-[100dvh] md:h-screen w-full bg-background relative overflow-hidden">
            {/* Header fijo (Oculto en desktop) */}
            {!isFullPageView && (
                <div className="md:hidden shrink-0 z-50">
                    <MobileHeader />
                </div>
            )}
            
            <main
                className={`flex-1 relative w-full overflow-y-auto overflow-x-hidden hidden-scrollbar ${!hideFooterOnMobile ? "pb-24 md:pb-0" : "pb-0"} ${isFullPageView ? "pt-0" : "md:!pt-0"}`}
                style={!isFullPageView ? { paddingTop: "calc(70px + var(--safe-area-top))" } : undefined}
            >
                <Outlet />
            </main>

            {!hideFooterOnMobile && (
                <div className="md:hidden shrink-0 z-50">
                    <MobileFooter />
                </div>
            )}
        </div>
    );
}