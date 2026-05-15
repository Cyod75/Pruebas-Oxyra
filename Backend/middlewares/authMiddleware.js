const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Acceso denegado, falta token" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Contiene id, username, es_pro
        next();
    } catch (error) {
        res.status(400).json({ error: "Token no válido" });
    }
};