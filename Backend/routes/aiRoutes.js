// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// --- Controllers ---
const aiController = require('../controllers/aiController');

// --- Middlewares ---
const authMiddleware = require('../middlewares/authMiddleware');
const proMiddleware = require('../middlewares/proMiddleware');

// 
// CONFIGURACIÓN MULTER (Memoria — Sin disco por GDPR)
// 
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB por foto

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 2 // Máximo 2 archivos (frente + espalda)
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 
                `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan JPEG, PNG y WebP.`
            ));
        }
    }
});

// 
// MIDDLEWARE: Manejo de errores de Multer
// 
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(413).json({ 
                    error: 'FILE_TOO_LARGE', 
                    message: 'El archivo es demasiado grande. Máximo 5MB por foto.' 
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ 
                    error: 'TOO_MANY_FILES', 
                    message: 'Solo se permiten 2 fotos (frente y espalda).' 
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ 
                    error: 'INVALID_FILE_TYPE', 
                    message: err.field || 'Tipo de archivo no permitido. Solo JPEG, PNG y WebP.' 
                });
            default:
                return res.status(400).json({ 
                    error: 'UPLOAD_ERROR', 
                    message: 'Error al procesar los archivos.' 
                });
        }
    }
    next(err);
};

// 
// RUTAS
// 

// POST /api/ai/analyze-physique
// Cadena de middlewares: Auth → PRO Check → Multer Upload → Error Handler → Controller
router.post(
    '/analyze-physique',
    authMiddleware,
    proMiddleware,
    (req, res, next) => {
        // Wrapper para capturar errores de multer y pasarlos al handler
        upload.fields([
            { name: 'front', maxCount: 1 },
            { name: 'back', maxCount: 1 }
        ])(req, res, (err) => {
            if (err) return handleMulterErrors(err, req, res, next);
            next();
        });
    },
    aiController.analyzePhysique
);

module.exports = router;
