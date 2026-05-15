const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check, validationResult } = require('express-validator');

// Middleware para procesar errores de validación
const validar = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Ruta de Registro con Validaciones (Paso 1: enviar código)
router.post('/register', [
    check('email', 'El email no es válido').isEmail(),
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    validar
], authController.register);

// Verificación de registro (Paso 2: verificar código + crear usuario + auto-login)
router.post('/verify-registration', authController.verifyRegistration);

// Reenviar código de verificación de registro
router.post('/resend-verification', authController.resendVerification);

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/check-username/:username', authController.checkUsername);
router.get('/check-email/:email', authController.checkEmail);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);

// Deletion
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/send-deletion-code', authMiddleware, authController.sendDeletionCode);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

module.exports = router;
