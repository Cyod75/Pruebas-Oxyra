const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear un intento de pago (Payment Intent)
router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);

// Información de la suscripción activa (para la página de gestión)
router.get('/subscription-info', authMiddleware, paymentController.getSubscriptionInfo);

// Endpoint de webhook para Stripe (debe ir ANTES del express.json() en server.js o usar expres.raw())
// Pero router se usa después. Así que en server.js haremos express.raw() solo para esta ruta.

module.exports = router;
