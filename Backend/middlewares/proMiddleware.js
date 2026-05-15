// backend/middlewares/proMiddleware.js
const db = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        // 1. Verificación rápida vía Token (si confías en el token)
        if (req.user && req.user.es_pro) {
            return next();
        }

        // 2. Verificación estricta vía Base de Datos (Más seguro, evita tokens viejos)
        const [rows] = await db.query("SELECT es_pro FROM usuarios WHERE idUsuario = ?", [req.user.id]);
        
        if (rows.length > 0 && rows[0].es_pro === 1) {
            next();
        } else {
            return res.status(403).json({ 
                error: "REQUIRES_PRO", 
                message: "Esta función es exclusiva para usuarios Oxyra Pro." 
            });
        }
    } catch (error) {
        console.error("Error en middleware Pro:", error);
        res.status(500).json({ error: "Error verificando suscripción." });
    }
};