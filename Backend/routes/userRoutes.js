const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const routineController = require('../controllers/routineController');
const notifController = require('../controllers/notificationController');
const aiController = require('../controllers/aiController'); 
const workoutController = require('../controllers/workoutController'); 
const productController = require('../controllers/productController');
const leaderboardController = require('../controllers/leaderboardController');

// --- MIDDLEWARES ---
const authMiddleware = require('../middlewares/authMiddleware');
const proMiddleware = require('../middlewares/proMiddleware');
const upload = require('../config/cloudinary');


//RUTAS DE PERFIL Y USUARIO
router.get('/me', authMiddleware, userController.getProfile);
router.put('/update', authMiddleware, upload.single('foto'), userController.updateProfile);
router.get('/search', authMiddleware, userController.searchUsers);
router.put('/change-password', authMiddleware, userController.changePassword);
router.post('/subscribe', authMiddleware, userController.subscribePro);
router.post('/cancel-subscription', authMiddleware, userController.cancelPro);
router.post('/complete-onboarding', authMiddleware, userController.completeOnboarding);

// Gestión de Notificaciones
router.get('/notifications/status', authMiddleware, notifController.getNotificationStatus);
router.post('/notifications/toggle', authMiddleware, notifController.toggleNotifications);

// Generación IA (AUTH + PRO)
router.post('/generate-routine', authMiddleware, proMiddleware, aiController.generateRoutine);
router.post('/generate-routine/onboarding', authMiddleware, aiController.generateRoutine);

// Gestión Manual y Visualización
router.get('/routines', authMiddleware, routineController.getMyRoutines);
router.get('/exercises', authMiddleware, routineController.getAllExercises);
router.post('/routine/manual', authMiddleware, routineController.createManualRoutine);
router.get('/routine/:id', authMiddleware, routineController.getRoutineDetail); 
router.put('/routine/:id', authMiddleware, routineController.updateRoutine);
router.delete('/routine/:id', authMiddleware, routineController.deleteRoutine);

// RUTAS DE ENTRENAMIENTO
router.post('/workout/save', authMiddleware, workoutController.saveWorkoutSession);
router.get('/workout/volume-chart', authMiddleware, workoutController.getVolumeChart);

// RUTAS DE PRODUCTOS
router.get('/', authMiddleware, productController.getAllProducts);

// BÚSQUEDA Y SOCIAL
router.get('/leaderboard', authMiddleware, leaderboardController.getLeaderboard);
router.get('/search', authMiddleware, userController.searchUsers);
router.post('/follow', authMiddleware, userController.followUser);
router.post('/unfollow', authMiddleware, userController.unfollowUser);
router.get('/requests', authMiddleware, userController.getFollowActivity); // Solicitudes + Actividad
router.post('/requests/accept', authMiddleware, userController.acceptFollowRequest); // NUEVO
router.post('/requests/reject', authMiddleware, userController.rejectFollowRequest); // NUEVO
router.get('/:username/followers', authMiddleware, userController.getFollowers);
router.get('/:username/following', authMiddleware, userController.getFollowing);
router.get('/profile/:username', authMiddleware, userController.getPublicProfile);

module.exports = router;