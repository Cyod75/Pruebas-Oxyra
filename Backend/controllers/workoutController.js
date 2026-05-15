const db = require('../config/db');

// --- CONFIGURACIÓN DE RANGOS (Oxyra System) ---
const RANK_SYSTEM = {
    tiers: [
        { dbValue: 'Oxyra',     label: '🌌 OXYRA',    req: 1.00 }, 
        { dbValue: 'Campeon',   label: '🏆 CAMPEÓN',  req: 0.85 },
        { dbValue: 'Diamante',  label: '💎 DIAMANTE', req: 0.70 },
        { dbValue: 'Esmeralda', label: '🟢 ESMERALDA',req: 0.58 },
        { dbValue: 'Platino',   label: '💠 PLATINO',  req: 0.48 },
        { dbValue: 'Oro',       label: '🟡 ORO',      req: 0.38 },
        { dbValue: 'Plata',     label: '⚪ PLATA',    req: 0.28 },
        { dbValue: 'Bronce',    label: '🟤 BRONCE',   req: 0.15 },
        { dbValue: 'Hierro',    label: '🔩 HIERRO',   req: 0.00 }
    ],
    max_multipliers: {
        'Pecho': 2.2, 'Espalda Alta': 2.4, 'Espalda Media': 2.6, 'Espalda Baja': 3.2, 
        'Cuadriceps': 3.0, 'Femoral': 2.5, 'Gluteo': 3.5, 'Hombro': 1.4, 'Bíceps': 1.0, 
        'Tríceps': 1.2, 'Trapecio': 2.5, 'Antebrazo': 0.8, 'Gemelo': 1.5, 'Aductores': 1.5, 
        'Abdomen': 1.0, 'General': 2.0
    }
};

const MUSCLE_MAPPING = [
    { keywords: ['dominada', 'jalon', 'pullover', 'lat'], target: 'Espalda Alta' },
    { keywords: ['remo', 't-bar', 'seal'], target: 'Espalda Media' },
    { keywords: ['muerto', 'lumbar', 'rack pull'], target: 'Espalda Baja' },
    { keywords: ['sentadilla', 'prensa', 'extension', 'zancada', 'pierna'], target: 'Cuadriceps' },
    { keywords: ['banca', 'pecho', 'apertura', 'flexiones', 'fondos', 'push'], target: 'Pecho' },
    { keywords: ['femoral', 'curl tumbado', 'isquio'], target: 'Femoral' },
    { keywords: ['hip thrust', 'gluteo', 'patada'], target: 'Gluteo' },
    { keywords: ['militar', 'hombro', 'lateral', 'pajaro', 'press'], target: 'Hombro' },
    { keywords: ['biceps', 'curl', 'predicador'], target: 'Bíceps' },
    { keywords: ['triceps', 'copa', 'frances', 'polea'], target: 'Tríceps' },
    { keywords: ['gemelo', 'talones'], target: 'Gemelo' },
    { keywords: ['trapecio'], target: 'Trapecio' },
    { keywords: ['antebrazo'], target: 'Antebrazo' },
    { keywords: ['aductor'], target: 'Aductores' },
    { keywords: ['abdomen', 'crunch', 'plancha', 'abs', 'abdominales'], target: 'Abdomen' }
];

// --- LISTA SEGURA DE MÚSCULOS (Base de Datos) ---
const VALID_DB_MUSCLES = [
    'Pecho', 'Espalda Alta','Espalda Media','Espalda Baja', 'Hombro', 
    'Cuadriceps', 'Femoral', 'Gluteo', 'Gemelo', 'Aductores',
    'Bíceps', 'Tríceps', 'Antebrazo', 'Trapecio', 
    'Abdomen','General'
];

// Función para evitar errores de ENUM en MySQL
function normalizeMuscleForDB(inputMuscle) {
    if (!inputMuscle) return 'General';
    
    // 1. Coincidencia exacta
    if (VALID_DB_MUSCLES.includes(inputMuscle)) return inputMuscle;

    // 2. Coincidencia insensible a mayúsculas
    const lowerInput = inputMuscle.toLowerCase();
    const match = VALID_DB_MUSCLES.find(m => m.toLowerCase() === lowerInput);
    if (match) return match;

    // 3. Mapeos manuales de seguridad
    if (lowerInput.includes('abdominal')) return 'Abdomen';
    if (lowerInput.includes('abs')) return 'Abdomen';
    if (lowerInput.includes('pierna')) return 'Cuadriceps';
    if (lowerInput.includes('biceps')) return 'Bíceps';
    if (lowerInput.includes('triceps')) return 'Tríceps';
    if (lowerInput.includes('pectoral')) return 'Pecho';
    if (lowerInput.includes('dorsal')) return 'Espalda Alta';
    
    return 'General';
}

function detectMuscle(exerciseName, defaultGroup) {
    const nameLower = (exerciseName || "").toLowerCase();
    const map = MUSCLE_MAPPING.find(m => m.keywords.some(k => nameLower.includes(k)));
    if (map) return map.target;
    
    // Si viene un grupo por defecto, intentamos usarlo
    if (defaultGroup) {
        if (defaultGroup === 'Espalda') return 'Espalda Media';
        return defaultGroup;
    }
    
    return 'General'; 
}

function calculateRank(ratio, muscle) {
    const maxMult = RANK_SYSTEM.max_multipliers[muscle] || RANK_SYSTEM.max_multipliers['General'];
    for (const tier of RANK_SYSTEM.tiers) {
        const threshold = tier.req * maxMult; 
        if (ratio >= threshold) return { dbValue: tier.dbValue, label: tier.label };
    }
    return { dbValue: 'Hierro', label: '🔩 HIERRO' };
}

function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return weight * (1 + (reps / 30));
}

exports.saveWorkoutSession = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user.id;
        const { rutinaId, nombreRutina, durationSeconds, exercises } = req.body;

        // Validación básica
        if (!exercises || !Array.isArray(exercises)) {
            throw new Error("No se recibieron ejercicios válidos.");
        }

        const [userData] = await connection.query("SELECT peso_kg FROM usuarios WHERE idUsuario = ?", [userId]);
        const userWeight = userData[0]?.peso_kg || 75;

        // 1. Guardar Historial Workout
        const duracionMinutos = durationSeconds ? Math.ceil(durationSeconds / 60) : 0;
        
        const [sessionResult] = await connection.query(
            `INSERT INTO historial_workouts (usuario_id, rutina_origen_id, nombre_sesion, fecha_fin, duracion_minutos, fecha_inicio) 
             VALUES (?, ?, ?, NOW(), ?, DATE_SUB(NOW(), INTERVAL ? SECOND))`,
            [userId, rutinaId || null, nombreRutina || "Entrenamiento Libre", duracionMinutos, durationSeconds || 0]
        );
        const workoutId = sessionResult.insertId;

        // 2. Procesar Ejercicios
        let statsToUpdate = {}; 

        for (const exercise of exercises) {
            // Si el usuario actualizó el timer en el frontend
            if (exercise.currentRestTimerSetting && rutinaId && exercise.idEjercicio) {
                await connection.query(
                    `UPDATE rutina_detalles SET descanso_segundos = ? WHERE rutina_id = ? AND ejercicio_id = ?`,
                    [exercise.currentRestTimerSetting, rutinaId, exercise.idEjercicio]
                );
            }

            // Validación de sets
            if (!exercise.performedSets || !Array.isArray(exercise.performedSets)) continue;

            const completedSets = exercise.performedSets.filter(set => set.completed);
            let bestSet1RM = 0;

            for (let i = 0; i < completedSets.length; i++) {
                const set = completedSets[i];
                const w = parseFloat(set.weight) || 0;
                const r = parseInt(set.reps) || 0;

                // Insertar Set
                await connection.query(
                    `INSERT INTO historial_sets (workout_id, ejercicio_id, nombre_ejercicio_snapshot, numero_serie, kg_levantados, reps_realizadas)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [workoutId, exercise.idEjercicio || null, exercise.nombre || "Ejercicio", i + 1, w, r]
                );

                // Calcular 1RM para Oxyra
                const estimated1RM = calculate1RM(w, r);
                if (estimated1RM > bestSet1RM) bestSet1RM = estimated1RM;
            }

            // Preparar actualización de stats
            if (bestSet1RM > 0) {
                const rawMuscle = detectMuscle(exercise.nombre, exercise.grupo_muscular);
                const validMuscle = normalizeMuscleForDB(rawMuscle);
                
                if (!statsToUpdate[validMuscle] || bestSet1RM > statsToUpdate[validMuscle]) {
                    statsToUpdate[validMuscle] = bestSet1RM;
                }
            }
        }

        // 3. Actualizar Rangos Oxyra
        console.log(`\n📊 Oxyra UPDATE (User: ${userId}, Peso: ${userWeight}kg)`);
        for (const [muscle, oneRM] of Object.entries(statsToUpdate)) {
            const ratio = userWeight > 0 ? (oneRM / userWeight) : 0;
            const rankInfo = calculateRank(ratio, muscle);
            
            await connection.query(
                `INSERT INTO stats_musculares (usuario_id, grupo_muscular, fuerza_teorica_max, rango_actual)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 rango_actual = CASE WHEN VALUES(fuerza_teorica_max) > fuerza_teorica_max THEN VALUES(rango_actual) ELSE rango_actual END,
                 fuerza_teorica_max = GREATEST(fuerza_teorica_max, VALUES(fuerza_teorica_max))`,
                [userId, muscle, oneRM, rankInfo.dbValue]
            );
            console.log(`   -> ${muscle}: ${oneRM.toFixed(1)}kg (${rankInfo.label})`);
        }

        await connection.commit();
        res.json({ message: "Entreno guardado correctamente", workoutId });

    } catch (error) {
        await connection.rollback();
        console.error("❌ ERROR CRÍTICO GUARDANDO ENTRENO:", error);
        res.status(500).json({ error: "Error interno al guardar entrenamiento", details: error.message });
    } finally {
        connection.release();
    }
};

// --- GRÁFICA DE VOLUMEN ---
exports.getVolumeChart = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || 'week';

        // Build date cutoff
        let cutoffDays = null;
        switch (period) {
            case 'week':    cutoffDays = 7;   break;
            case 'month':   cutoffDays = 30;  break;
            case '3months': cutoffDays = 90;  break;
            case 'year':    cutoffDays = 365; break;
            case 'all':     cutoffDays = null; break;
            default:        cutoffDays = 7;
        }

        let sql, params;
        if (cutoffDays !== null) {
            sql = `
                SELECT 
                    DATE_FORMAT(h.fecha_fin, '%Y-%m-%d') AS dia,
                    ROUND(SUM(s.kg_levantados * s.reps_realizadas), 1) AS volumen_kg
                FROM historial_workouts h
                JOIN historial_sets s ON s.workout_id = h.idWorkout
                WHERE h.usuario_id = ?
                  AND h.fecha_fin IS NOT NULL
                  AND h.fecha_fin >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE_FORMAT(h.fecha_fin, '%Y-%m-%d')
                ORDER BY DATE_FORMAT(h.fecha_fin, '%Y-%m-%d') ASC
            `;
            params = [userId, cutoffDays];
        } else {
            sql = `
                SELECT 
                    DATE_FORMAT(h.fecha_fin, '%Y-%m-%d') AS dia,
                    ROUND(SUM(s.kg_levantados * s.reps_realizadas), 1) AS volumen_kg
                FROM historial_workouts h
                JOIN historial_sets s ON s.workout_id = h.idWorkout
                WHERE h.usuario_id = ?
                  AND h.fecha_fin IS NOT NULL
                GROUP BY DATE_FORMAT(h.fecha_fin, '%Y-%m-%d')
                ORDER BY DATE_FORMAT(h.fecha_fin, '%Y-%m-%d') ASC
            `;
            params = [userId];
        }

        const [rows] = await db.query(sql, params);
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ ERROR getVolumeChart:", error.message, error.sql);
        res.status(500).json({ error: "Error al obtener gráfica de volumen", detail: error.message });
    }
};