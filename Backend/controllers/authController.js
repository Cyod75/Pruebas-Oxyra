const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const notifController = require('./notificationController');

// 
//  PENDING REGISTRATIONS (in-memory, auto-cleanup)
// 
const pendingRegistrations = new Map();

// Limpieza automática de registros expirados cada 5 min
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of pendingRegistrations) {
        if (now > entry.expiresAt) {
            pendingRegistrations.delete(key);
        }
    }
}, 5 * 60 * 1000);

// 
//  PENDING CODES (Password Reset & Account Deletion)
// 
const pendingCodes = new Map();

// Limpieza de códigos expirados
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of pendingCodes) {
        if (now > entry.expiresAt) {
            pendingCodes.delete(key);
        }
    }
}, 5 * 60 * 1000);

// 
//  REGISTRO — Paso 1: Crear pending + enviar código
// 
exports.register = async (req, res) => {
    const { nombre_completo, username, email, password } = req.body;
    try {
        // Comprobar si ya existe en BD
        const [exists] = await db.query(
            "SELECT idUsuario FROM usuarios WHERE email = ? OR username = ?",
            [email, username]
        );
        if (exists.length > 0) {
            return res.status(400).json({ error: "Email o Username ya registrados" });
        }

        // Generar código y hash de password
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await bcrypt.hash(password, 10);

        // Guardar en memoria (15 min de expiración)
        pendingRegistrations.set(email.toLowerCase(), {
            nombre_completo,
            username,
            email,
            password_hash: hash,
            code,
            expiresAt: Date.now() + 15 * 60 * 1000,
            attempts: 0
        });

        // Enviar email con código
        await notifController.sendEmailNotification(
            email,
            "Verifica tu cuenta de Oxyra ✉️",
            `Hola <b>${nombre_completo}</b>,<br><br>
            ¡Gracias por registrarte en Oxyra! Para completar tu cuenta, introduce el siguiente código de verificación:<br><br>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; letter-spacing: 8px; color: #ffffff; font-weight: 900; background: linear-gradient(90deg, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${code}</span>
            </div>
            <br>Este código expirará en <b>15 minutos</b>.<br><br>
            Si no has solicitado esta cuenta, puedes ignorar este mensaje.`
        );

        res.status(200).json({
            message: "Código de verificación enviado",
            email: email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 
//  REGISTRO — Paso 2: Verificar código + crear usuario + auto-login
// 
exports.verifyRegistration = async (req, res) => {
    const { email, code } = req.body;
    const key = email.toLowerCase();

    try {
        const pending = pendingRegistrations.get(key);

        if (!pending) {
            return res.status(400).json({
                error: "No hay registro pendiente para este email. Inténtalo de nuevo."
            });
        }

        // Verificar expiración
        if (Date.now() > pending.expiresAt) {
            pendingRegistrations.delete(key);
            return res.status(400).json({
                error: "El código ha expirado. Por favor, regístrate de nuevo."
            });
        }

        // Máximo 5 intentos
        if (pending.attempts >= 5) {
            pendingRegistrations.delete(key);
            return res.status(429).json({
                error: "Demasiados intentos fallidos. Por favor, regístrate de nuevo."
            });
        }

        // Verificar código
        if (pending.code !== code) {
            pending.attempts++;
            return res.status(400).json({
                error: "Código incorrecto. Inténtalo de nuevo.",
                attemptsLeft: 5 - pending.attempts
            });
        }

        // Código correcto → Crear usuario en BD
        const [exists] = await db.query(
            "SELECT idUsuario FROM usuarios WHERE email = ? OR username = ?",
            [pending.email, pending.username]
        );
        if (exists.length > 0) {
            pendingRegistrations.delete(key);
            return res.status(400).json({ error: "Email o Username ya registrados" });
        }

        const [result] = await db.query(
            "INSERT INTO usuarios (nombre_completo, username, email, password_hash) VALUES (?, ?, ?, ?)",
            [pending.nombre_completo, pending.username, pending.email, pending.password_hash]
        );

        // Limpiar pending
        pendingRegistrations.delete(key);

        // Obtener el usuario creado
        const [newUsers] = await db.query("SELECT * FROM usuarios WHERE idUsuario = ?", [result.insertId]);
        const user = newUsers[0];

        // Auto-login: generar token
        const token = jwt.sign(
            { id: user.idUsuario, username: user.username, es_pro: user.es_pro, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: "Cuenta verificada y creada correctamente",
            token,
            user: {
                id: user.idUsuario,
                username: user.username,
                nombre: user.nombre_completo,
                foto: user.foto_perfil,
                rango: user.rango_global,
                rol: user.rol,
                onboarding_completed: !!user.onboarding_completed
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 
//  REGISTRO — Reenviar código de verificación
// 
exports.resendVerification = async (req, res) => {
    const { email } = req.body;
    const key = email.toLowerCase();

    try {
        const pending = pendingRegistrations.get(key);

        if (!pending) {
            return res.status(400).json({
                error: "No hay registro pendiente para este email."
            });
        }

        // Generar nuevo código
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        pending.code = newCode;
        pending.expiresAt = Date.now() + 15 * 60 * 1000;
        pending.attempts = 0;

        // Enviar email
        await notifController.sendEmailNotification(
            email,
            "Nuevo código de verificación 🔄",
            `Hola <b>${pending.nombre_completo}</b>,<br><br>
            Se ha generado un nuevo código de verificación para tu cuenta de Oxyra:<br><br>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; letter-spacing: 8px; color: #ffffff; font-weight: 900; background: linear-gradient(90deg, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${newCode}</span>
            </div>
            <br>Este código expirará en <b>15 minutos</b>.`
        );

        res.json({ message: "Nuevo código enviado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 
//  LOGIN
// 
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // PERMITIR LOGIN CON EMAIL O USERNAME
        const [users] = await db.query("SELECT * FROM usuarios WHERE email = ? OR username = ?", [email, email]);
        if (users.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const user = users[0];
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id: user.idUsuario, username: user.username, es_pro: user.es_pro, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user.idUsuario, username: user.username, nombre: user.nombre_completo, foto: user.foto_perfil, rango: user.rango_global, rol: user.rol, onboarding_completed: !!user.onboarding_completed } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const [users] = await db.query("SELECT idUsuario FROM usuarios WHERE username = ?", [username]);
        if (users.length > 0) {
            return res.json({ available: false });
        }
        res.json({ available: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const [users] = await db.query("SELECT idUsuario FROM usuarios WHERE email = ?", [email]);
        if (users.length > 0) {
            return res.json({ available: false });
        }
        res.json({ available: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- PASSWORD RESET ---

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query("SELECT idUsuario, nombre_completo FROM usuarios WHERE email = ?", [email]);
        if (users.length === 0) return res.status(404).json({ error: "Este correo no está registrado en Oxyra." });
        
        const user = users[0];
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

        pendingCodes.set(email.toLowerCase(), {
            code,
            expiresAt,
            idUsuario: user.idUsuario
        });

        await notifController.sendEmailNotification(
            email,
            "Código de Recuperación de Cuenta 🔐",
            `Hola <b>${user.nombre_completo}</b>,<br><br>
            Hemos recibido una solicitud para restablecer tu contraseña.<br>
            Tu código de verificación es:<br><br>
            <b style="font-size: 24px; letter-spacing: 4px; color: #ffffff;">${code}</b><br><br>
            Este código expirará en 15 minutos.`
        );

        res.json({ message: "Código enviado a tu correo" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al procesar solicitud" });
    }
};

exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        const pending = pendingCodes.get(email.toLowerCase());

        if (!pending) return res.status(400).json({ error: "Código inválido o expirado" });
        if (Date.now() > pending.expiresAt) {
            pendingCodes.delete(email.toLowerCase());
            return res.status(400).json({ error: "El código ha expirado" });
        }
        if (pending.code !== code) {
            return res.status(400).json({ error: "Código inválido" });
        }

        res.json({ message: "Código verificado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const pending = pendingCodes.get(email.toLowerCase());

        if (!pending || pending.code !== code) return res.status(400).json({ error: "Solicitud inválida o código incorrecto" });
        if (Date.now() > pending.expiresAt) {
            pendingCodes.delete(email.toLowerCase());
            return res.status(400).json({ error: "El código ha expirado" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE usuarios SET password_hash = ? WHERE idUsuario = ?", [hash, pending.idUsuario]);
        
        pendingCodes.delete(email.toLowerCase());

        res.json({ message: "Contraseña restablecida correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Añadir esto a authController.js
exports.googleLogin = async (req, res) => {
    const { email, name, sub, picture } = req.body;
    try {
        // 1. Buscar si el usuario ya existe por email
        let [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        let user;

        if (users.length === 0) {
            // 2. Si no existe, lo creamos (Registro automático)
            // Usamos el 'sub' de google como una clave o generamos un username
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            const [result] = await db.query(
                "INSERT INTO usuarios (nombre_completo, username, email, foto_perfil) VALUES (?, ?, ?, ?)",
                [name, username, email, picture]
            );
            
            const [newUser] = await db.query("SELECT * FROM usuarios WHERE idUsuario = ?", [result.insertId]);
            user = newUser[0];
        } else {
            user = users[0];
        }

        // 3. Generar el Token (IMPORTANTE: Mismo formato que el login normal)
        const token = jwt.sign(
            { id: user.idUsuario, username: user.username, es_pro: user.es_pro, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user.idUsuario, username: user.username, nombre: user.nombre_completo, foto: user.foto_perfil, rango: user.rango_global, rol: user.rol, onboarding_completed: !!user.onboarding_completed } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en Google Login" });
    }
};

exports.sendDeletionCode = async (req, res) => {
    const idUsuario = req.user.id;
    try {
        const [users] = await db.query("SELECT email, nombre_completo FROM usuarios WHERE idUsuario = ?", [idUsuario]);
        if (users.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
        
        const user = users[0];
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

        pendingCodes.set(idUsuario.toString(), {
            code,
            expiresAt
        });

        await notifController.sendEmailNotification(
            user.email,
            "Confirmación de eliminación de cuenta ⚠️",
            `Hola <b>${user.nombre_completo}</b>,<br><br>
            Hemos recibido una solicitud para eliminar permanentemente tu cuenta de Oxyra.<br>
            Tu código de confirmación es:<br><br>
            <b style="font-size: 24px; letter-spacing: 4px; color: #ff3333;">${code}</b><br><br>
            Este código expirará en 15 minutos. Si no has solicitado esto, ignora este mensaje.`
        );

        res.json({ message: "Código de eliminación enviado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al procesar la solicitud de eliminación" });
    }
};

exports.deleteAccount = async (req, res) => {
    const idUsuario = req.user.id;
    const { code } = req.body;
    try {
        const pending = pendingCodes.get(idUsuario.toString());
        
        if (!pending) return res.status(400).json({ error: "Código de verificación expirado o no solicitado" });
        
        if (pending.code !== code) {
            return res.status(400).json({ error: "Código de verificación incorrecto" });
        }
        
        if (Date.now() > pending.expiresAt) {
            pendingCodes.delete(idUsuario.toString());
            return res.status(400).json({ error: "El código ha expirado" });
        }

        // Proceder a la eliminación
        await db.query("DELETE FROM usuarios WHERE idUsuario = ?", [idUsuario]);
        pendingCodes.delete(idUsuario.toString());

        res.json({ message: "Cuenta eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
