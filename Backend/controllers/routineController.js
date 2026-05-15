const db = require('../config/db');

// OBTENER MIS RUTINAS
exports.getMyRoutines = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rutinas] = await db.query(
            "SELECT * FROM rutinas WHERE usuario_id = ? ORDER BY fecha_creacion DESC", 
            [userId]
        );
        res.json(rutinas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo rutinas" });
    }
};

// OBTENER DETALLE DE RUTINA (CON MEMORIA MUSCULAR)
exports.getRoutineDetail = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        // 1. Obtener cabecera
        const [rutina] = await db.query(
            "SELECT * FROM rutinas WHERE idRutina = ? AND usuario_id = ?", 
            [id, userId]
        );

        if (rutina.length === 0) return res.status(404).json({ error: "Rutina no encontrada" });

        // 2. Obtener ejercicios base
        const [ejerciciosBase] = await db.query(`
            SELECT 
                e.idEjercicio,
                e.nombre, 
                e.grupo_muscular,
                rd.series_objetivo, 
                rd.reps_objetivo, 
                rd.descanso_segundos, 
                rd.orden
            FROM rutina_detalles rd
            JOIN ejercicios e ON rd.ejercicio_id = e.idEjercicio
            WHERE rd.rutina_id = ?
            ORDER BY rd.orden ASC
        `, [id]);

        // 3. BUSCAR ÚLTIMO ENTRENAMIENTO (Lógica de Memoria)
        const [lastWorkout] = await db.query(`
            SELECT idWorkout 
            FROM historial_workouts 
            WHERE rutina_origen_id = ? AND usuario_id = ?
            ORDER BY fecha_inicio DESC 
            LIMIT 1
        `, [id, userId]);

        let ejerciciosConDatos = [];

        if (lastWorkout.length > 0) {
            // CASO A: Ya la entrenaste antes -> Cargamos datos
            const lastWorkoutId = lastWorkout[0].idWorkout;
            const [historySets] = await db.query(`
                SELECT ejercicio_id, kg_levantados, reps_realizadas
                FROM historial_sets
                WHERE workout_id = ?
                ORDER BY numero_serie ASC
            `, [lastWorkoutId]);

            ejerciciosConDatos = ejerciciosBase.map(ej => {
                const setsPrevios = historySets.filter(s => s.ejercicio_id === ej.idEjercicio);
                
                if (setsPrevios.length > 0) {
                    return {
                        ...ej,
                        series_objetivo: setsPrevios.length, 
                        last_session_data: setsPrevios.map(s => ({
                            weight: s.kg_levantados,
                            reps: s.reps_realizadas
                        }))
                    };
                }
                return { ...ej, series_objetivo: 2 }; 
            });

        } else {
            // CASO B: Primera vez -> 2 Series por defecto
            ejerciciosConDatos = ejerciciosBase.map(ej => ({
                ...ej,
                series_objetivo: 2 
            }));
        }

        res.json({
            ...rutina[0],
            ejercicios: ejerciciosConDatos
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo detalles" });
    }
};

// ELIMINAR RUTINA
exports.deleteRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await db.query(
            "DELETE FROM rutinas WHERE idRutina = ? AND usuario_id = ?",
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rutina no encontrada o no autorizada" });
        }

        res.json({ message: "Rutina eliminada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error eliminando la rutina" });
    }
};

// CATÁLOGO DE EJERCICIOS
exports.getAllExercises = async (req, res) => {
    try {
        const [ejercicios] = await db.query("SELECT * FROM ejercicios ORDER BY grupo_muscular, nombre");
        res.json(ejercicios);
    } catch (err) {
        res.status(500).json({ error: "Error cargando ejercicios" });
    }
};

// CREAR RUTINA MANUAL
exports.createManualRoutine = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { nombre, objetivo, nivel, ejercicios } = req.body; 
        const userId = req.user.id;

        const [resRutina] = await connection.query(
            `INSERT INTO rutinas (usuario_id, nombre, objetivo, nivel_dificultad, creada_por_ia) 
             VALUES (?, ?, ?, ?, FALSE)`,
            [userId, nombre, objetivo || 'General', nivel || 'Intermedio']
        );
        
        const routineId = resRutina.insertId;

        if (ejercicios && ejercicios.length > 0) {
            for (let i = 0; i < ejercicios.length; i++) {
                const ex = ejercicios[i];
                await connection.query(
                    `INSERT INTO rutina_detalles (rutina_id, ejercicio_id, orden, series_objetivo, reps_objetivo, descanso_segundos)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [routineId, ex.idEjercicio, i + 1, ex.series || 2, ex.reps || '10-12', ex.descanso || 90]
                );
            }
        }

        await connection.commit();
        const [nuevaRutina] = await connection.query("SELECT * FROM rutinas WHERE idRutina = ?", [routineId]);
        res.json({ message: "Rutina creada", rutina: nuevaRutina[0] });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: "Error creando rutina manual" });
    } finally {
        connection.release();
    }
};

// ACTUALIZAR RUTINA (Nombre, Objetivo, Descripción)
exports.updateRoutine = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const routineId = req.params.id;
        const { nombre, objetivo, descripcion } = req.body;
        const userId = req.user.id;

        if (!nombre || nombre.trim().length === 0) {
            connection.release();
            return res.status(400).json({ error: "El nombre no puede estar vacío" });
        }
        if (nombre.length > 50) return res.status(400).json({ error: "El nombre es demasiado largo" });
        if (objetivo && objetivo.length > 30) return res.status(400).json({ error: "El objetivo es demasiado largo" });
        if (descripcion && descripcion.length > 500) return res.status(400).json({ error: "La descripción es demasiado larga" });

        const [routineCheck] = await connection.query(
            "SELECT idRutina FROM rutinas WHERE idRutina = ? AND usuario_id = ?",
            [routineId, userId]
        );

        if (routineCheck.length === 0) {
            connection.release();
            return res.status(403).json({ error: "No tienes permiso para editar esta rutina" });
        }

        await connection.query(
            "UPDATE rutinas SET nombre = ?, objetivo = ?, descripcion = ? WHERE idRutina = ?",
            [nombre, objetivo, descripcion, routineId]
        );

        connection.release();
        res.json({ message: "Rutina actualizada correctamente", rutina: { nombre, objetivo, descripcion } });

    } catch (err) {
        connection.release();
        console.error(err);
        res.status(500).json({ error: "Error al actualizar la rutina" });
    }
};