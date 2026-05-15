const db = require('../config/db');
const nodemailer = require('nodemailer');

// 1. CONFIGURACIÓN DEL TRANSPORTE
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'oxyra.gym@gmail.com',
        pass: 'oqbf shzo sqgm essa'
    }
});

// DATOS REALES
const LOGO_URL = "https://res.cloudinary.com/duxvze8we/image/upload/v1775152308/oxyra-white_k4ttyc.png"; 
const APP_URL = "https://jordi.informaticamajada.es/";

// 2. FUNCIÓN DE ENVÍO
exports.sendEmailNotification = async (to, subject, messageText) => {
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
            table { border-collapse: collapse; }
            
            /* Estilos de respaldo para clientes que soporten CSS */
            .btn-gradient {
                background: linear-gradient(90deg, #3b82f6, #06b6d4);
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #121212; border-radius: 16px; overflow: hidden; border: 1px solid #1f1f1f; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                        
                        <tr>
                            <td align="center" style="padding: 40px 40px 20px 40px;">
                                <div style="display: inline-block; padding: 12px; border-radius: 50%; background-color: #0a0a0a; border: 1px solid #333; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);">
                                    <img src="${LOGO_URL}" alt="Oxyra" width="50" height="50" style="display: block; width: 50px; height: 50px; object-fit: contain;">
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td align="center" style="padding: 0 40px 50px 40px; color: #d4d4d8; font-size: 16px; line-height: 1.6;">
                                
                                <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 25px 0; text-align: center;">
                                    ${subject}
                                </h1>
                                
                                <div style="color: #a1a1aa; font-size: 16px; line-height: 26px; text-align: left;">
                                    ${messageText}
                                </div>
                                
                                <div style="height: 40px; font-size: 40px; line-height: 40px;">&nbsp;</div>
                                
                                <table border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center" style="border-radius: 8px;" bgcolor="#3b82f6">
                                            <a href="${APP_URL}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff !important; text-decoration: none; text-decoration: none; border-radius: 8px; padding: 14px 32px; border: 1px solid #3b82f6; display: inline-block; font-weight: bold; background: linear-gradient(90deg, #3b82f6, #06b6d4);">
                                                <span style="color: #ffffff !important;">Entrar en Oxyra</span>
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td align="center" style="padding: 30px 20px; font-size: 12px; color: #52525b; font-family: Helvetica, Arial, sans-serif;">
                                <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Oxyra App. Todos los derechos reservados.</p>
                                <p style="margin: 0;">
                                    <a href="${APP_URL}settings" style="color: #71717a; text-decoration: underline;">Gestionar notificaciones</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: '"Oxyra Team" <oxyra.gym@gmail.com>', 
            to,
            subject: `${subject}`, 
            text: messageText, 
            html: htmlTemplate 
        });
        console.log("📨 Email enviado a:", to);
    } catch (error) {
        console.error("❌ Error enviando email:", error);
    }
};

// 3. OBTENER ESTADO
exports.getNotificationStatus = async (req, res) => {
    try {
        const [user] = await db.query("SELECT notificaciones_activas FROM usuarios WHERE idUsuario = ?", [req.user.id]);
        res.json({ enabled: user[0].notificaciones_activas === 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. TOGGLE
exports.toggleNotifications = async (req, res) => {
    const { enabled } = req.body;
    try {
        await db.query("UPDATE usuarios SET notificaciones_activas = ? WHERE idUsuario = ?", [enabled, req.user.id]);
        
        if (enabled) {
            const [u] = await db.query("SELECT email, nombre_completo FROM usuarios WHERE idUsuario = ?", [req.user.id]);
            
            await exports.sendEmailNotification(
                u[0].email, 
                "Notificaciones Activadas", 
                `Hola <b>${u[0].nombre_completo}</b>,<br><br>
                Has activado correctamente las alertas de Oxyra. A partir de ahora, te mantendremos informado sobre:<br><br>
                • Nuevos récords personales<br>
                • Actualizaciones de tu rango Oxyra<br>
                • Novedades de la comunidad<br><br>
                Estamos encantados de acompañarte en tu progreso.`
            );
        }

        res.json({ message: "Preferencia actualizada", enabled });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};