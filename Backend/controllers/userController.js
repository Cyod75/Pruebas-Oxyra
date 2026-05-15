const db = require('../config/db');
const bcrypt = require('bcryptjs');
const notifController = require('./notificationController');

// PERFIL DE USUARIO
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Datos básicos del usuario
        // CORRECCIÓN: Añadidos peso_kg, estatura_cm, genero y email a la selección
        const [user] = await db.query(
            "SELECT idUsuario, username, email, nombre_completo, foto_perfil, biografia, rango_global, es_pro, es_privada, peso_kg, estatura_cm, genero FROM usuarios WHERE idUsuario = ?", 
            [userId]
        );
        
        if (user.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        // 2. CONTADORES REALES (Seguidores, Seguidos, Entrenos)
        const [counts] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?) as seguidores,
                (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?) as seguidos,
                (SELECT COUNT(*) FROM historial_workouts WHERE usuario_id = ?) as entrenos
        `, [userId, userId, userId]);

        // 3. Stats Musculares (Oxyra)
        const [muscularStats] = await db.query(
            "SELECT grupo_muscular, rango_actual, fuerza_teorica_max FROM stats_musculares WHERE usuario_id = ?",
            [userId]
        );

        // Combinamos todo en la respuesta
        res.json({ 
            ...user[0], 
            stats: counts[0], // Aquí van los números reales
            muscularStats 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ACTUALIZAR PERFIL
exports.updateProfile = async (req, res) => {
    const { nombre_completo, username, biografia, peso_kg, estatura_cm, genero, es_privada } = req.body;
    let foto_perfil_url;

    try {
        if (req.file) {
            foto_perfil_url = req.file.path;
        } else {
            const [currentUser] = await db.query("SELECT foto_perfil FROM usuarios WHERE idUsuario = ?", [req.user.id]);
            foto_perfil_url = currentUser[0].foto_perfil;
        }

        // Convertir es_privada a booleano (0 o 1) si viene como string
        const isPrivate = es_privada === 'true' || es_privada === true || es_privada === 1 ? 1 : 0;

        await db.query(
            `UPDATE usuarios 
             SET nombre_completo = ?, username = ?, biografia = ?, foto_perfil = ?, peso_kg = ?, estatura_cm = ?, genero = ?, es_privada = ? 
             WHERE idUsuario = ?`,
            [nombre_completo, username, biografia, foto_perfil_url, peso_kg || null, estatura_cm || null, genero || null, isPrivate, req.user.id]
        );

        res.json({ message: "Perfil actualizado", foto_perfil: foto_perfil_url });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso." });
        }
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR USUARIOS
exports.searchUsers = async (req, res) => {
    const { query } = req.query;
    const myId = req.user.id;

    try {
        // SQL: Busca usuarios por nombre Y comprueba estado de seguimiento
        const sql = `
            SELECT 
                u.idUsuario, 
                u.username, 
                u.nombre_completo, 
                u.foto_perfil, 
                u.rango_global,
                u.es_privada,
                s.estado as follow_status
            FROM usuarios u
            LEFT JOIN seguidores s ON s.seguidor_id = ? AND s.seguido_id = u.idUsuario
            WHERE u.username LIKE ? AND u.idUsuario != ?
            LIMIT 20
        `;

        const [users] = await db.query(sql, [myId, `%${query}%`, myId]);
        
        const formatted = users.map(u => ({
            ...u,
            lo_sigo: u.follow_status === 'aceptado',
            pendiente: u.follow_status === 'pendiente'
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SEGUIR USUARIO
exports.followUser = async (req, res) => {
    const { idUsuarioASequir } = req.body;
    const myId = req.user.id;

    if (parseInt(idUsuarioASequir) === myId) return res.status(400).json({ error: "No te puedes seguir a ti mismo" });

    try {
        // Verificar si el usuario destino es privado
        const [targetUser] = await db.query("SELECT es_privada, email, nombre_completo, username FROM usuarios WHERE idUsuario = ?", [idUsuarioASequir]);
        
        if (targetUser.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const isPrivate = targetUser[0].es_privada === 1;
        const estadoInicial = isPrivate ? 'pendiente' : 'aceptado';

        await db.query(
            "INSERT IGNORE INTO seguidores (seguidor_id, seguido_id, estado) VALUES (?, ?, ?)",
            [myId, idUsuarioASequir, estadoInicial]
        );

        // Notificación si es privado (Solicitud) o público (Seguido)
        if (isPrivate) {
            // Aquí podríamos enviar una notificación de "Solicitud de seguimiento"
             try {
                // await notifController.sendPush... (cuando se implemente)
            } catch (e) {}
             res.json({ message: "Solicitud enviada", lo_sigo: false, pendiente: true });
        } else {
             try {
                await notifController.sendEmailNotification(
                    targetUser[0].email,
                    `¡Nuevo seguidor en Oxyra! 🚀`,
                    `Hola <b>${targetUser[0].nombre_completo || targetUser[0].username}</b>,<br>Alguien ha comenzado a seguirte.`
                );
            } catch (emailErr) { console.error("Error email follow:", emailErr); }
            res.json({ message: "Usuario seguido", lo_sigo: true, pendiente: false });
        }

    } catch (err) {
        res.status(500).json({ error: "Error al seguir" });
    }
};

// DEJAR DE SEGUIR
exports.unfollowUser = async (req, res) => {
    const { idUsuarioADejar } = req.body;
    const myId = req.user.id;

    try {
        await db.query(
            "DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
            [myId, idUsuarioADejar]
        );
        res.json({ message: "Dejado de seguir", lo_sigo: false, pendiente: false });
    } catch (err) {
        res.status(500).json({ error: "Error al dejar de seguir" });
    }
};

exports.getPublicProfile = async (req, res) => {
    const { username } = req.params;
    const myId = req.user.id;

    try {
        // 1. Buscar al usuario y verificar estado de seguimiento
        const [users] = await db.query(`
            SELECT 
                u.idUsuario, u.username, u.nombre_completo, u.foto_perfil, u.biografia, u.rango_global, u.es_pro, u.es_privada,
                s.estado as follow_status
            FROM usuarios u
            LEFT JOIN seguidores s ON s.seguidor_id = ? AND s.seguido_id = u.idUsuario
            WHERE u.username = ?`, 
            [myId, username]
        );

        if (users.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const targetUser = users[0];
        const targetId = targetUser.idUsuario;
        const isMe = targetId === myId;
        const isFollower = targetUser.follow_status === 'aceptado';
        const isPrivate = targetUser.es_privada === 1;

        // Lógica de privacidad: Si es privada, no soy yo, y no lo sigo -> RESTRINGIDO
        const isRestricted = isPrivate && !isFollower && !isMe;

        // 2. CONTADORES (Siempre visibles, estilo Instagram)
        const [counts] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM seguidores WHERE seguido_id = ? AND estado = 'aceptado') as seguidores,
                (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ? AND estado = 'aceptado') as seguidos,
                (SELECT COUNT(*) FROM historial_workouts WHERE usuario_id = ?) as entrenos
        `, [targetId, targetId, targetId]);

        let muscularStats = [];
        let recentWorkouts = [];

        // Solo cargamos detalles si NO está restringido
        if (!isRestricted) {
            // 3. Stats Musculares
            const [ms] = await db.query(
                "SELECT grupo_muscular, rango_actual FROM stats_musculares WHERE usuario_id = ?",
                [targetId]
            );
            muscularStats = ms;

            // 4. Activity History
            const [rw] = await db.query(
                "SELECT nombre_sesion, fecha_fin, duracion_minutos FROM historial_workouts WHERE usuario_id = ? ORDER BY fecha_fin DESC LIMIT 10",
                [targetId]
            );
            recentWorkouts = rw;
        }

        res.json({ 
            ...targetUser, 
            lo_sigo: isFollower,
            pendiente: targetUser.follow_status === 'pendiente',
            is_private_restricted: isRestricted,
            stats: counts[0],
            muscularStats,
            recentWorkouts
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- LISTAR SEGUIDORES / SEGUIDOS ---

// GET /api/users/:username/followers
exports.getFollowers = async (req, res) => {
    const { username } = req.params;
    const myId = req.user.id;

    try {
        // Buscar el ID del usuario por username
        const [target] = await db.query("SELECT idUsuario FROM usuarios WHERE username = ?", [username]);
        if (target.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const targetId = target[0].idUsuario;

        // Obtener seguidores (quienes siguen a este usuario)
        const [followers] = await db.query(`
            SELECT 
                u.idUsuario, u.username, u.nombre_completo, u.foto_perfil,
                CASE WHEN my_follow.estado = 'aceptado' THEN 1 ELSE 0 END as lo_sigo
            FROM seguidores s
            JOIN usuarios u ON s.seguidor_id = u.idUsuario
            LEFT JOIN seguidores my_follow ON my_follow.seguidor_id = ? AND my_follow.seguido_id = u.idUsuario AND my_follow.estado = 'aceptado'
            WHERE s.seguido_id = ? AND s.estado = 'aceptado'
            ORDER BY s.fecha_seguimiento DESC
        `, [myId, targetId]);

        const formatted = followers.map(u => ({
            ...u,
            lo_sigo: u.idUsuario === myId ? false : !!u.lo_sigo // No mostrar "seguir" a mí mismo
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/:username/following
exports.getFollowing = async (req, res) => {
    const { username } = req.params;
    const myId = req.user.id;

    try {
        const [target] = await db.query("SELECT idUsuario FROM usuarios WHERE username = ?", [username]);
        if (target.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const targetId = target[0].idUsuario;

        // Obtener seguidos (a quienes sigue este usuario)
        const [following] = await db.query(`
            SELECT 
                u.idUsuario, u.username, u.nombre_completo, u.foto_perfil,
                CASE WHEN my_follow.estado = 'aceptado' THEN 1 ELSE 0 END as lo_sigo
            FROM seguidores s
            JOIN usuarios u ON s.seguido_id = u.idUsuario
            LEFT JOIN seguidores my_follow ON my_follow.seguidor_id = ? AND my_follow.seguido_id = u.idUsuario AND my_follow.estado = 'aceptado'
            WHERE s.seguidor_id = ? AND s.estado = 'aceptado'
            ORDER BY s.fecha_seguimiento DESC
        `, [myId, targetId]);

        const formatted = following.map(u => ({
            ...u,
            lo_sigo: u.idUsuario === myId ? false : !!u.lo_sigo
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- GESTIÓN DE SOLICITUDES (NUEVO) ---

// Obtener solicitudes pendientes
// Obtener actividad (Solicitudes + Nuevos Seguidores)
exports.getFollowActivity = async (req, res) => {
    try {
        // Traemos pendientes (prioridad) y aceptados recientes (últimos 7 días)
        const [activity] = await db.query(`
            SELECT u.idUsuario, u.username, u.nombre_completo, u.foto_perfil, s.estado, s.fecha_seguimiento
            FROM seguidores s
            JOIN usuarios u ON s.seguidor_id = u.idUsuario
            WHERE s.seguido_id = ?
            AND (s.estado = 'pendiente' OR (s.estado = 'aceptado' AND s.fecha_seguimiento >= DATE_SUB(NOW(), INTERVAL 7 DAY)))
            ORDER BY s.estado = 'pendiente' DESC, s.fecha_seguimiento DESC
        `, [req.user.id]);
        
        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Aceptar solicitud
exports.acceptFollowRequest = async (req, res) => {
    const { seguidorId } = req.body; // ID del usuario que quiere seguirme
    const myId = req.user.id;
    
    try {
        await db.query(`
            UPDATE seguidores SET estado = 'aceptado' 
            WHERE seguidor_id = ? AND seguido_id = ?
        `, [seguidorId, myId]);
        
        res.json({ message: "Solicitud aceptada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Rechazar solicitud
exports.rejectFollowRequest = async (req, res) => {
    const { seguidorId } = req.body;
    const myId = req.user.id;

    try {
        await db.query(`
            DELETE FROM seguidores 
            WHERE seguidor_id = ? AND seguido_id = ?
        `, [seguidorId, myId]);

        res.json({ message: "Solicitud rechazada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CAMBIAR CONTRASEÑA
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Faltan datos" });

    try {
        const [users] = await db.query("SELECT password_hash, email, nombre_completo FROM usuarios WHERE idUsuario = ?", [req.user.id]);
        const user = users[0];

        if (!user.password_hash) return res.status(400).json({ error: "Tu cuenta usa Google Login." });

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: "La contraseña actual es incorrecta" });

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE usuarios SET password_hash = ? WHERE idUsuario = ?", [newHash, req.user.id]);

        try {
            await notifController.sendEmailNotification(
                user.email,
                "Alerta de Seguridad: Tu contraseña ha cambiado 🔐",
                `Hola <b>${user.nombre_completo}</b>,<br>La contraseña de tu cuenta Oxyra ha sido modificada.`
            );
        } catch (emailErr) { console.error("Error email pass:", emailErr); }

        res.json({ message: "Contraseña actualizada correctamente" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// SUSCRIPCIÓN PRO
exports.subscribePro = async (req, res) => {
    try {
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);

        await db.query("UPDATE usuarios SET es_pro = 1, fecha_fin_suscripcion = ? WHERE idUsuario = ?", [fechaFin, req.user.id]);

        const [u] = await db.query("SELECT email, nombre_completo FROM usuarios WHERE idUsuario = ?", [req.user.id]);
        if (u.length > 0) {
            await notifController.sendEmailNotification(
                u[0].email, 
                "¡Bienvenido a Oxyra PRO! 🚀", 
                `¡Enhorabuena, <b>${u[0].nombre_completo}</b>! Has desbloqueado todo el potencial de Oxyra.`
            );
        }
        res.json({ message: "Suscripción activada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CANCELAR PRO
exports.cancelPro = async (req, res) => {
    try {
        await db.query("UPDATE usuarios SET es_pro = 0, fecha_fin_suscripcion = NULL WHERE idUsuario = ?", [req.user.id]);
        res.json({ message: "Suscripción cancelada correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al cancelar" });
    }
};

// COMPLETAR ONBOARDING
// Guarda los datos físicos recopilados (peso, estatura, género) y marca el onboarding como completado.
exports.completeOnboarding = async (req, res) => {
    const { peso_kg, estatura_cm, genero } = req.body;
    try {
        await db.query(
            `UPDATE usuarios SET peso_kg = ?, estatura_cm = ?, genero = ?, onboarding_completed = 1 WHERE idUsuario = ?`,
            [peso_kg || null, estatura_cm || null, genero || null, req.user.id]
        );
        res.json({ message: "Onboarding completado correctamente", onboarding_completed: true });
    } catch (err) {
        console.error("Error completando onboarding:", err);
        res.status(500).json({ error: err.message });
    }
};