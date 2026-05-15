const db = require('../config/db');
const today = () => new Date().toISOString().slice(0, 10);

//  HELPER: Actualiza el resumen diario (caché) 
async function syncResumenDiario(userId, fechaDia) {
    const sql = `
        INSERT INTO nutricion_resumen_diario
            (usuario_id, fecha_dia, kcal_total, proteinas_g, carbos_g, grasas_g, num_ingestas, objetivo_kcal)
        SELECT
            r.usuario_id,
            r.fecha_dia,
            COALESCE(SUM(r.kcal), 0),
            COALESCE(SUM(r.proteinas_g), 0),
            COALESCE(SUM(r.carbos_g), 0),
            COALESCE(SUM(r.grasas_g), 0),
            COUNT(*),
            COALESCE((SELECT o.calorias_dia FROM nutricion_objetivos o WHERE o.usuario_id = r.usuario_id LIMIT 1), 2000)
        FROM nutricion_registros r
        WHERE r.usuario_id = ? AND r.fecha_dia = ?
        ON DUPLICATE KEY UPDATE
            kcal_total    = VALUES(kcal_total),
            proteinas_g   = VALUES(proteinas_g),
            carbos_g      = VALUES(carbos_g),
            grasas_g      = VALUES(grasas_g),
            num_ingestas  = VALUES(num_ingestas),
            objetivo_kcal = VALUES(objetivo_kcal)
    `;
    await db.query(sql, [userId, fechaDia]);
}

/** GET /api/nutrition/goals → devuelve los objetivos del usuario */
exports.getGoals = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM nutricion_objetivos WHERE usuario_id = ?',
            [req.user.id]
        );
        // Si no tiene objetivos aún, devolver los defaults
        if (rows.length === 0) {
            return res.json({
                objetivo: 'mantener',
                calorias_dia: 2000,
                proteinas_g: 150,
                carbos_g: 200,
                grasas_g: 70,
                agua_ml: 2500,
            });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** PUT /api/nutrition/goals → crea o actualiza los objetivos */
exports.upsertGoals = async (req, res) => {
    const { objetivo, calorias_dia, proteinas_g, carbos_g, grasas_g, agua_ml } = req.body;
    try {
        await db.query(`
            INSERT INTO nutricion_objetivos (usuario_id, objetivo, calorias_dia, proteinas_g, carbos_g, grasas_g, agua_ml)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                objetivo      = VALUES(objetivo),
                calorias_dia  = VALUES(calorias_dia),
                proteinas_g   = VALUES(proteinas_g),
                carbos_g      = VALUES(carbos_g),
                grasas_g      = VALUES(grasas_g),
                agua_ml       = VALUES(agua_ml)
        `, [req.user.id, objetivo, calorias_dia, proteinas_g, carbos_g, grasas_g, agua_ml]);
        res.json({ message: 'Objetivos actualizados correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


//  REGISTROS DIARIOS (INGESTAS)


/** GET /api/nutrition/today → todas las ingestas del día de HOY */
exports.getToday = async (req, res) => {
    try {
        const fecha = today();
        const [[objetivos], [registros], [agua]] = await Promise.all([
            db.query(
                'SELECT * FROM nutricion_objetivos WHERE usuario_id = ?',
                [req.user.id]
            ),
            db.query(
                'SELECT * FROM nutricion_registros WHERE usuario_id = ? AND fecha_dia = ? ORDER BY created_at ASC',
                [req.user.id, fecha]
            ),
            db.query(
                'SELECT COALESCE(SUM(cantidad_ml), 0) AS agua_ml FROM nutricion_agua WHERE usuario_id = ? AND fecha_dia = ?',
                [req.user.id, fecha]
            ),
        ]);

        res.json({
            fecha,
            registros,
            agua_ml: agua[0].agua_ml,
            objetivos: objetivos[0] || { calorias_dia: 2000, proteinas_g: 150, carbos_g: 200, grasas_g: 70, agua_ml: 2500 },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** POST /api/nutrition/log → añade una ingesta al día de hoy */
exports.addEntry = async (req, res) => {
    const {
        comida, nombre, marca, imagen_url, barcode, gramos,
        kcal_100g, proteinas_100g, carbos_100g, grasas_100g,
        fibra_100g, sal_100g
    } = req.body;

    if (!comida || !nombre || !gramos) {
        return res.status(400).json({ error: 'comida, nombre y gramos son obligatorios' });
    }

    const factor = Number(gramos) / 100;
    const fecha  = today();

    const kcal        = parseFloat(((kcal_100g        || 0) * factor).toFixed(2));
    const proteinas_g = parseFloat(((proteinas_100g   || 0) * factor).toFixed(2));
    const carbos_g    = parseFloat(((carbos_100g      || 0) * factor).toFixed(2));
    const grasas_g    = parseFloat(((grasas_100g      || 0) * factor).toFixed(2));
    const fibra_g     = parseFloat(((fibra_100g       || 0) * factor).toFixed(2));
    const sal_g       = parseFloat(((sal_100g         || 0) * factor).toFixed(2));

    try {
        const [result] = await db.query(`
            INSERT INTO nutricion_registros
                (usuario_id, fecha_dia, comida, nombre, marca, imagen_url, barcode, gramos,
                 kcal, proteinas_g, carbos_g, grasas_g, fibra_g, sal_g,
                 kcal_100g, proteinas_100g, carbos_100g, grasas_100g)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.id, fecha, comida, nombre, marca || null, imagen_url || null, barcode || null, gramos,
            kcal, proteinas_g, carbos_g, grasas_g, fibra_g, sal_g,
            kcal_100g || null, proteinas_100g || null, carbos_100g || null, grasas_100g || null
        ]);

        await syncResumenDiario(req.user.id, fecha);
        res.status(201).json({ idRegistro: result.insertId, message: 'Ingesta añadida' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** DELETE /api/nutrition/log/:id → elimina una ingesta */
exports.deleteEntry = async (req, res) => {
    try {
        const [check] = await db.query(
            'SELECT fecha_dia FROM nutricion_registros WHERE idRegistro = ? AND usuario_id = ?',
            [req.params.id, req.user.id]
        );
        if (check.length === 0) return res.status(404).json({ error: 'Ingesta no encontrada' });

        const fecha = check[0].fecha_dia;
        await db.query('DELETE FROM nutricion_registros WHERE idRegistro = ?', [req.params.id]);
        await syncResumenDiario(req.user.id, fecha);
        res.json({ message: 'Ingesta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


//  HIDRATACIÓN


/** POST /api/nutrition/water → añade ml de agua del día de hoy */
exports.addWater = async (req, res) => {
    const { cantidad_ml = 250 } = req.body;
    const fecha = today();
    try {
        await db.query(
            'INSERT INTO nutricion_agua (usuario_id, fecha_dia, cantidad_ml) VALUES (?, ?, ?)',
            [req.user.id, fecha, cantidad_ml]
        );
        // Actualizar el resumen de agua
        await db.query(`
            INSERT INTO nutricion_resumen_diario (usuario_id, fecha_dia, agua_ml)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE agua_ml = agua_ml + VALUES(agua_ml)
        `, [req.user.id, fecha, cantidad_ml]);
        res.status(201).json({ message: `${cantidad_ml}ml de agua registrados` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** DELETE /api/nutrition/water → resta un vaso (último añadido hoy) */
exports.removeWater = async (req, res) => {
    const fecha = today();
    try {
        const [last] = await db.query(
            'SELECT idAgua, cantidad_ml FROM nutricion_agua WHERE usuario_id = ? AND fecha_dia = ? ORDER BY hora DESC LIMIT 1',
            [req.user.id, fecha]
        );
        if (last.length === 0) return res.status(404).json({ error: 'No hay registros de agua hoy' });

        await db.query('DELETE FROM nutricion_agua WHERE idAgua = ?', [last[0].idAgua]);
        await db.query(`
            UPDATE nutricion_resumen_diario
            SET agua_ml = GREATEST(0, agua_ml - ?)
            WHERE usuario_id = ? AND fecha_dia = ?
        `, [last[0].cantidad_ml, req.user.id, fecha]);
        res.json({ message: 'Vaso eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


//  HISTORIAL (últimos 30 días)


/** GET /api/nutrition/history → resumen de los últimos días */
exports.getHistory = async (req, res) => {
    const days = Math.min(Number(req.query.days) || 7, 90);
    try {
        const [rows] = await db.query(`
            SELECT fecha_dia, kcal_total, proteinas_g, carbos_g, grasas_g, agua_ml, num_ingestas, objetivo_kcal
            FROM nutricion_resumen_diario
            WHERE usuario_id = ? AND fecha_dia >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ORDER BY fecha_dia DESC
        `, [req.user.id, days]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


//  ALIMENTOS PERSONALIZADOS


/** GET /api/nutrition/custom-foods → lista los alimentos del usuario */
exports.getCustomFoods = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM nutricion_alimentos_custom WHERE usuario_id = ? ORDER BY nombre ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** POST /api/nutrition/custom-foods → crea un alimento personalizado */
exports.createCustomFood = async (req, res) => {
    const { nombre, marca, barcode, kcal_100g, proteinas_100g, carbos_100g, grasas_100g, fibra_100g } = req.body;
    if (!nombre || kcal_100g === undefined) {
        return res.status(400).json({ error: 'nombre y kcal_100g son obligatorios' });
    }
    try {
        const [result] = await db.query(`
            INSERT INTO nutricion_alimentos_custom
                (usuario_id, nombre, marca, barcode, kcal_100g, proteinas_100g, carbos_100g, grasas_100g, fibra_100g)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [req.user.id, nombre, marca || null, barcode || null, kcal_100g, proteinas_100g || 0, carbos_100g || 0, grasas_100g || 0, fibra_100g || 0]);
        res.status(201).json({ idAlimento: result.insertId, message: 'Alimento creado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un alimento con ese código de barras' });
        res.status(500).json({ error: err.message });
    }
};

/** DELETE /api/nutrition/custom-foods/:id → elimina un alimento personalizado */
exports.deleteCustomFood = async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM nutricion_alimentos_custom WHERE idAlimento = ? AND usuario_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alimento no encontrado' });
        res.json({ message: 'Alimento eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//  PROXY PARA OPENFOODFACTS (Evitar CORS)


const https = require('https');
const http  = require('http');

function fetchJson(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Request timeout')), 15000);

        function doRequest(currentUrl, redirectsLeft) {
            const lib = currentUrl.startsWith('https') ? https : http;
            const opts = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OxyraApp/1.0; +https://oxyra.app)',
                    'Accept':     'application/json',
                    'Accept-Language': 'es,en;q=0.9',
                }
            };

            lib.get(currentUrl, opts, (res) => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                    if (redirectsLeft <= 0) {
                        clearTimeout(timer);
                        return reject(new Error('Too many redirects'));
                    }
                    const next = res.headers.location.startsWith('http')
                        ? res.headers.location
                        : new URL(res.headers.location, currentUrl).href;
                    res.resume(); // drain the body
                    return doRequest(next, redirectsLeft - 1);
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    clearTimeout(timer);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error('Invalid JSON response from OFF'));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
                res.on('error', (e) => { clearTimeout(timer); reject(e); });
            }).on('error', (e) => { clearTimeout(timer); reject(e); });
        }

        doRequest(url, maxRedirects);
    });
}

exports.proxyOpenFoodFacts = async (req, res) => {
    const { terms } = req.query;
    if (!terms) return res.json({ products: [] });

    try {
        // Use the OFF v2 search API which is more stable and returns cleaner data
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(terms)}&search_simple=1&action=process&json=1&page_size=20&sort_by=unique_scans_n&fields=product_name,abbreviated_product_name,brands,nutriments,image_front_small_url,image_url,code`;
        const data = await fetchJson(url);
        res.json(data);
    } catch (err) {
        console.error('[OFF Proxy] Error:', err.message);
        res.status(500).json({ error: err.message, products: [] });
    }
};

exports.proxyOpenFoodFactsBarcode = async (req, res) => {
    const { code } = req.params;
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json?fields=product_name,brands,nutriments,image_front_small_url,image_url`;
        const data = await fetchJson(url);
        res.json(data);
    } catch (err) {
        console.error('[OFF Barcode Proxy] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
