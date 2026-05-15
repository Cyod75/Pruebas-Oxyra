const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas las rutas de admin requieren autenticación + rol admin/superadmin
router.use(authMiddleware);
router.use(adminMiddleware);

// --- STATS ---
router.get('/stats', adminController.getStats);

// --- USUARIOS ---
router.get('/users', adminController.getAllUsers);

// Ruta directa para crear usuarios
router.post('/users', adminController.createUser);

router.delete('/users/:id', adminController.deleteUser);

// --- EJERCICIOS ---
router.get('/exercises', adminController.getAllExercises);
router.post('/exercises', adminController.createExercise);
router.put('/exercises/:id', adminController.updateExercise);
router.delete('/exercises/:id', adminController.deleteExercise);

// --- LOGS ---
router.get('/logs', adminController.getLogs);
router.delete('/logs', adminController.clearLogs);

module.exports = router;
