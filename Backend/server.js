require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const paymentController = require('./controllers/paymentController');

const app = express();

const MI_IP_LOCAL = 'http://192.168.1.145:5173'; 

// Middlewares de Seguridad y Utilidades
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Configuración CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        MI_IP_LOCAL,
        'capacitor://localhost', // iOS
        'https://localhost',      // Android
        'https://jordi.informaticamajada.es',
        'http://jordi.informaticamajada.es'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// --- STRIPE WEBHOOK ---
// IMPORTANTE: Stripe webhooks necesita el body en crudo (raw buffer), no en JSON.
// Así que esta ruta debe declararse ANTES de app.use(express.json());
app.post(
    '/api/payments/webhook', 
    express.raw({ type: 'application/json' }), 
    paymentController.stripeWebhook
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
      status: 429,
      error: "Demasiadas peticiones. Por favor, espera un momento." 
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
      status: 429,
      error: "Demasiados intentos de inicio de sesión, intenta más tarde."
  }
});

app.use(limiter);
app.use('/api/auth', authLimiter);

// 4. Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Health check — sin autenticación, para detectar conexión desde el frontend
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ██████╗ ██╗  ██╗██╗   ██╗██████╗  █████╗ 
    ██╔══██╗╚██╗██╔╝╚██╗ ██╔╝██╔══██╗██╔══██╗
    ██║  ██║ ╚███╔╝  ╚████╔╝ ██████╔╝███████║
    ██║  ██║ ██╔██╗   ╚██╔╝  ██╔══██╗██╔══██║
    ██████╔╝██╔╝ ██╗   ██║   ██║  ██║██║  ██║
    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
    🚀 Backend corriendo en http://localhost:${PORT}
    `);
});