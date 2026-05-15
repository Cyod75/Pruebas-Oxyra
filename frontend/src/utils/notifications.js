import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * ═══════════════════════════════════════════════════════════
 *  OXYRA — SISTEMA DE NOTIFICACIONES LOCALES
 *  Web-Safe: Si se ejecuta en navegador, las llamadas son
 *  ignoradas silenciosamente para no romper la versión web.
 * ═══════════════════════════════════════════════════════════
 */

const isNative = Capacitor.isNativePlatform();

// IDs reservados para cada tipo de notificación
const NOTIF_IDS = {
    WELCOME:        10,
    REST_TIMER:     20,
    DAILY_REMINDER: 30,
    WORKOUT_DONE:   40,
};


/** Vibración corta: confirmación al marcar una serie ✓ */
export const vibrateCheck = async () => {
    if (!isNative) return;
    try {
        // ImpactStyle.Light = toque suave y rápido, muy profesional
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        console.warn('[Oxyra] Haptics no disponible:', e?.message);
    }
};

/** Vibración de alerta: cuando el descanso acaba */
export const vibrateAlert = async () => {
    if (!isNative) return;
    try {
        // Heavy = pulso fuerte, más NotificationType.Warning para el patrón doble
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await new Promise(r => setTimeout(r, 120));
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await new Promise(r => setTimeout(r, 120));
        await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
        console.warn('[Oxyra] Haptics no disponible:', e?.message);
    }
};

//  CANALES Android (se crean si no existen — idempotente)
//  Se llaman ANTES de programar cualquier notificación.
const ensureChannels = async () => {
    if (!isNative) return;
    try {
        await LocalNotifications.createChannel({
            id: 'oxyra_general',
            name: 'General',
            description: 'Notificaciones generales de Oxyra',
            importance: 4,   // HIGH
            visibility: 1,
            vibration: true,
        });
        await LocalNotifications.createChannel({
            id: 'oxyra_training',
            name: 'Entrenamiento',
            description: 'Alertas de sesiones de gym',
            importance: 5,   // MAX — aparece encima de otras apps
            visibility: 1,
            vibration: true,
        });
        await LocalNotifications.createChannel({
            id: 'oxyra_daily',
            name: 'Recordatorios diarios',
            description: 'Registro diario de comidas y entrenamientos',
            importance: 3,
            visibility: 1,
            vibration: false,
        });
    } catch (e) {
        console.warn('[Oxyra] Canal ya existe o error menor:', e?.message);
    }
};


//  PERMISOS
const ensurePermissions = async () => {
    if (!isNative) return false;
    let { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        display = result.display;
    }
    if (display !== 'granted') {
        console.warn('[Oxyra] Permisos de notificación denegados.');
        return false;
    }
    return true;
};


//  HELPER: Asegurar todo y luego programar

const safeSchedule = async (notification) => {
    const ok = await ensurePermissions();
    if (!ok) return;
    await ensureChannels();   // Idempotente, siempre seguro de llamar
    try {
        await LocalNotifications.schedule({ notifications: [notification] });
        console.warn('[Oxyra] Notificación programada:', notification.title);
    } catch (e) {
        console.error('[Oxyra] Error al programar notificación:', e);
    }
};


//  CANCELAR por ID

const cancelById = async (id) => {
    if (!isNative) return;
    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.some(n => n.id === id)) {
            await LocalNotifications.cancel({ notifications: [{ id }] });
        }
    } catch (e) {
        console.warn('[Oxyra] Error al cancelar notificación id=' + id, e?.message);
    }
};


//  1. BIENVENIDA — Al iniciar sesión (1.5s delay)

export const notifyWelcome = async (username) => {
    if (!isNative) return;
    const h = new Date().getHours();
    const greeting = h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';

    await safeSchedule({
        title: `${greeting}, ${username} 👋`,
        body: 'Tu dashboard de entrenamiento y nutrición te espera.',
        id: NOTIF_IDS.WELCOME,
        schedule: { at: new Date(Date.now() + 1500) },
        smallIcon: 'ic_launcher',
        iconColor: '#3b82f6',
        channelId: 'oxyra_general',
    });
};


//  2. TEMPORIZADOR DE DESCANSO
//     Se programa al marcar una serie. Si el usuario vuelve
//     antes de que suene, lo cancelamos.

export const scheduleRestTimer = async (seconds) => {
    if (!isNative) return;
    await cancelById(NOTIF_IDS.REST_TIMER); // Cancelar el anterior si existe
    await safeSchedule({
        title: '¡Fin del descanso! 💪',
        body: 'Es momento de tu siguiente serie. ¡Vamos a por ello!',
        id: NOTIF_IDS.REST_TIMER,
        schedule: { at: new Date(Date.now() + seconds * 1000) },
        smallIcon: 'ic_launcher',
        iconColor: '#3b82f6',
        channelId: 'oxyra_training',
    });
};

export const cancelRestTimer = async () => {
    await cancelById(NOTIF_IDS.REST_TIMER);
};


//  3. RECORDATORIO DIARIO — 9:00 AM cada día

export const scheduleDailyReminder = async () => {
    if (!isNative) return;
    await cancelById(NOTIF_IDS.DAILY_REMINDER); // Evitar duplicados
    await safeSchedule({
        title: '¡Buenos días! ☀️  Oxyra te espera',
        body: 'Recuerda registrar tu peso, comidas y entreno de hoy.',
        id: NOTIF_IDS.DAILY_REMINDER,
        schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
        smallIcon: 'ic_launcher',
        iconColor: '#3b82f6',
        channelId: 'oxyra_daily',
    });
};

export const cancelDailyReminder = async () => {
    await cancelById(NOTIF_IDS.DAILY_REMINDER);
};


//  4. ENTRENAMIENTO COMPLETADO — 3s tras guardar

export const notifyWorkoutDone = async (durationMinutes, totalSeries) => {
    if (!isNative) return;
    await safeSchedule({
        title: '¡Sesión completada! 🏆',
        body: `${totalSeries} series · ${durationMinutes} minutos. Un día más mejor que ayer.`,
        id: NOTIF_IDS.WORKOUT_DONE,
        schedule: { at: new Date(Date.now() + 3000) },
        smallIcon: 'ic_launcher',
        iconColor: '#3b82f6',
        channelId: 'oxyra_training',
    });
};
