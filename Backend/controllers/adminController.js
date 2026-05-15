const db = require('../config/db');
const bcrypt = require('bcryptjs');
const notifController = require('./notificationController');

// 
//  LOG STORE EN MEMORIA (funciona sin BD adicional)
// 
const MAX_LOGS = 200;
const actionLogs = [];

function addLog(level, category, message, user = 'system', meta = {}) {
    actionLogs.unshift({
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        level,       // 'info' | 'warning' | 'error' | 'success'
        category,    // 'users' | 'exercises' | 'auth' | 'system'
        message,
        user,
        meta
    });
    if (actionLogs.length > MAX_LOGS) actionLogs.pop();
}



// 
//  STATS GENERALES (Overview Dashboard)
// 
exports.getStats = async (req, res) => {
    try {
        const [[{ totalUsers }]]  = await db.query("SELECT COUNT(*) AS totalUsers FROM usuarios");
        const [[{ totalAdmins }]] = await db.query("SELECT COUNT(*) AS totalAdmins FROM usuarios WHERE rol IN ('admin','superadmin')");
        const [[{ totalExercises }]] = await db.query("SELECT COUNT(*) AS totalExercises FROM ejercicios");
        const [[{ totalWorkouts }]] = await db.query("SELECT COUNT(*) AS totalWorkouts FROM historial_workouts");
        const [[{ workoutsToday }]] = await db.query("SELECT COUNT(*) AS workoutsToday FROM historial_workouts WHERE DATE(fecha_fin) = CURDATE()");
        const [[{ newUsersThisWeek }]] = await db.query("SELECT COUNT(*) AS newUsersThisWeek FROM usuarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");

        // Usuarios más activos (top 5)
        const [topUsers] = await db.query(`
            SELECT u.username, u.foto_perfil, COUNT(hw.idWorkout) AS total_workouts
            FROM usuarios u
            LEFT JOIN historial_workouts hw ON u.idUsuario = hw.usuario_id
            GROUP BY u.idUsuario
            ORDER BY total_workouts DESC
            LIMIT 5
        `);

        // Últimos usuarios registrados
        const [recentUsers] = await db.query(`
            SELECT username, rol, created_at FROM usuarios ORDER BY created_at DESC LIMIT 5
        `);

        res.json({
            totalUsers,
            totalAdmins,
            totalExercises,
            totalWorkouts,
            workoutsToday,
            newUsersThisWeek,
            topUsers,
            recentUsers
        });
    } catch (err) {
        addLog('error', 'system', `Error cargando stats: ${err.message}`, req.user?.username);
        res.status(500).json({ error: err.message });
    }
};

// 
//  GESTIÓN DE USUARIOS
// 
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT idUsuario, username, email, nombre_completo, foto_perfil, rol, rango_global, created_at FROM usuarios ORDER BY created_at DESC"
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { nombre_completo, username, email, password, rol } = req.body;
    try {
        if (!nombre_completo || !username || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        const [exists] = await db.query("SELECT idUsuario FROM usuarios WHERE email = ? OR username = ?", [email, username]);
        if (exists.length > 0) return res.status(400).json({ error: "Email o Username ya registrados" });

        const hash = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO usuarios (nombre_completo, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre_completo, username, email, hash, rol || 'usuario']
        );
        addLog('success', 'users', `Usuario "${username}" creado con rol "${rol || 'usuario'}"`, req.user?.username);
        res.status(201).json({ message: "Usuario creado correctamente por el administrador" });
    } catch (err) {
        addLog('error', 'users', `Error al crear usuario: ${err.message}`, req.user?.username);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.rol;

    try {
        if (parseInt(id) === requesterId) {
            return res.status(400).json({ error: "No puedes eliminar tu propia cuenta desde el panel de admin." });
        }

        const [targetUsers] = await db.query("SELECT rol, username FROM usuarios WHERE idUsuario = ?", [id]);
        if (targetUsers.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const { rol: targetRole, username: targetUsername } = targetUsers[0];

        if (targetRole === 'superadmin') return res.status(403).json({ error: "No se puede eliminar a un Super Administrador." });
        if (requesterRole === 'admin' && targetRole === 'admin') return res.status(403).json({ error: "Un administrador no puede eliminar a otro administrador." });

        await db.query("DELETE FROM usuarios WHERE idUsuario = ?", [id]);
        addLog('warning', 'users', `Usuario "${targetUsername}" (${targetRole}) eliminado`, req.user?.username);
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
        addLog('error', 'users', `Error al eliminar usuario ID ${id}: ${err.message}`, req.user?.username);
        res.status(500).json({ error: err.message });
    }
};

// 
//  GESTIÓN DE EJERCICIOS
// 
const VALID_MUSCLES = [
    'Pecho', 'Espalda Alta', 'Espalda Media', 'Espalda Baja', 'Hombro',
    'Cuadriceps', 'Femoral', 'Gluteo', 'Gemelo', 'Aductores',
    'Bíceps', 'Tríceps', 'Antebrazo', 'Trapecio', 'Abdomen', 'General'
];

exports.getAllExercises = async (req, res) => {
    try {
        const [exercises] = await db.query("SELECT * FROM ejercicios ORDER BY grupo_muscular, nombre");
        res.json({ exercises, validMuscles: VALID_MUSCLES });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createExercise = async (req, res) => {
    const { nombre, grupo_muscular, descripcion, equipamiento } = req.body;
    if (!nombre || !grupo_muscular) return res.status(400).json({ error: "Nombre y grupo muscular son obligatorios." });
    if (!VALID_MUSCLES.includes(grupo_muscular)) return res.status(400).json({ error: "Grupo muscular no válido." });

    try {
        const [exists] = await db.query("SELECT idEjercicio FROM ejercicios WHERE nombre = ?", [nombre]);
        if (exists.length > 0) return res.status(400).json({ error: "Ya existe un ejercicio con ese nombre." });

        const [result] = await db.query(
            "INSERT INTO ejercicios (nombre, grupo_muscular, descripcion, equipamiento) VALUES (?, ?, ?, ?)",
            [nombre, grupo_muscular, descripcion || null, equipamiento || null]
        );
        addLog('success', 'exercises', `Ejercicio "${nombre}" (${grupo_muscular}) añadido al catálogo`, req.user?.username);
        res.status(201).json({ message: "Ejercicio creado", id: result.insertId });
    } catch (err) {
        addLog('error', 'exercises', `Error al crear ejercicio: ${err.message}`, req.user?.username);
        res.status(500).json({ error: err.message });
    }
};

exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { nombre, grupo_muscular, descripcion, equipamiento } = req.body;
    if (!nombre || !grupo_muscular) return res.status(400).json({ error: "Nombre y grupo muscular son obligatorios." });
    if (!VALID_MUSCLES.includes(grupo_muscular)) return res.status(400).json({ error: "Grupo muscular no válido." });

    try {
        await db.query(
            "UPDATE ejercicios SET nombre = ?, grupo_muscular = ?, descripcion = ?, equipamiento = ? WHERE idEjercicio = ?",
            [nombre, grupo_muscular, descripcion || null, equipamiento || null, id]
        );
        addLog('info', 'exercises', `Ejercicio ID ${id} actualizado: "${nombre}"`, req.user?.username);
        res.json({ message: "Ejercicio actualizado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExercise = async (req, res) => {
    const { id } = req.params;
    try {
        const [ex] = await db.query("SELECT nombre FROM ejercicios WHERE idEjercicio = ?", [id]);
        if (ex.length === 0) return res.status(404).json({ error: "Ejercicio no encontrado" });

        await db.query("DELETE FROM ejercicios WHERE idEjercicio = ?", [id]);
        addLog('warning', 'exercises', `Ejercicio "${ex[0].nombre}" eliminado del catálogo`, req.user?.username);
        res.json({ message: "Ejercicio eliminado" });
    } catch (err) {
        addLog('error', 'exercises', `Error al eliminar ejercicio ID ${id}: ${err.message}`, req.user?.username);
        res.status(500).json({ error: err.message });
    }
};

// 
//  LOGS DE SISTEMA
// 
exports.getLogs = async (req, res) => {
    const { level, category, limit = 100 } = req.query;
    let filtered = [...actionLogs];
    if (level) filtered = filtered.filter(l => l.level === level);
    if (category) filtered = filtered.filter(l => l.category === category);
    res.json(filtered.slice(0, parseInt(limit)));
};

exports.clearLogs = async (req, res) => {
    if (req.user?.rol !== 'superadmin') return res.status(403).json({ error: "Solo un superadmin puede limpiar los logs." });
    actionLogs.length = 0;
    addLog('info', 'system', 'Logs del sistema limpiados', req.user?.username);
    res.json({ message: "Logs limpiados" });
};
