// backend/controllers/productController.js
const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        // Hacemos JOIN para sacar el nombre y logo de la empresa
        // Renombramos los campos (AS) para que coincidan con tu frontend React
        const [products] = await db.query(`
            SELECT 
                p.idProducto as id,
                p.nombre,
                e.nombre as empresa,
                e.logo_url as empresa_logo,
                p.precio_visual as precio,
                p.categoria,
                p.imagen_url as imagen,
                p.descripcion,
                p.codigo_descuento as codigo,
                p.enlace_afiliado as url,
                p.es_destacado as destacado
            FROM productos p
            JOIN empresas e ON p.empresa_id = e.idEmpresa
            ORDER BY p.es_destacado DESC, p.idProducto DESC
        `);

        // Convertimos 'destacado' de 1/0 a true/false para React
        const formattedProducts = products.map(p => ({
            ...p,
            destacado: p.destacado === 1,
            // Aseguramos que el precio sea número para evitar errores
            precio: parseFloat(p.precio) 
        }));

        res.json(formattedProducts);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Error al cargar productos" });
    }
};