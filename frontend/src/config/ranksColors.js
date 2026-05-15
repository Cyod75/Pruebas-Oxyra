
// Colores oficiales del sistema de rangos Oxyra
// Estos colores rellenarán los "paths" del SVG del cuerpo
export const RANK_COLORS = {
    "Sin Rango": "#27272a", // zinc-800 (Apagado/Vacío)
    "Hierro": "#52525b",    // zinc-600
    "Bronce": "#cd7f32",    // Bronce metálico
    "Plata": "#e4e4e7",     // zinc-200 Brillante
    "Oro": "#fbbf24",       // amber-400
    "Platino": "#94a3b8",   // slate-400 (Platino)
    "Esmeralda": "#34d399", // emerald-400
    "Diamante": "#60a5fa",  // blue-400 (Oxyra Blue)
    "Campeon": "#a855f7",   // purple-500
    "Oxyra": "#ef4444"      // red-500 (Legendario/Fuego)
};

// Función helper para obtener color seguro desde los datos del backend
export const getMuscleColor = (userStats, muscleName) => {
    // userStats: array que viene de userController.getProfile -> muscularStats
    // muscleName: string que coincidirá con el ID del grupo (ej: 'Bíceps')
    
    if (!userStats || !Array.isArray(userStats)) {
        return RANK_COLORS["Sin Rango"];
    }

    // Buscamos el stat que coincida con el nombre del músculo
    const stat = userStats.find(s => s.grupo_muscular === muscleName);
    
    if (stat && stat.rango_actual) {
        return RANK_COLORS[stat.rango_actual] || RANK_COLORS["Sin Rango"];
    }
    
    return RANK_COLORS["Sin Rango"];
};