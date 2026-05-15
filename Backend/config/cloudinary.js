const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configurar Cloudinary con tus claves
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configurar dónde y cómo se guardan los archivos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'oxyra_perfiles', // Nombre de la carpeta en tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Opcional: redimensionar aquí mismo para ahorrar espacio
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

module.exports = upload;