const db = require('../config/db');

// Mapa de valor numérico por rango (Oxyra Score)
const RANK_SCORE_MAP = {
  'Sin Rango': 0,
  'Hierro': 10,
  'Bronce': 20,
  'Plata': 30,
  'Oro': 40,
  'Platino': 50,
  'Esmeralda': 60,
  'Diamante': 70,
  'Campeon': 85,
  'Oxyra': 100
};

const TOTAL_MUSCLES = 15;

/**
 * GET /api/users/leaderboard
 * Devuelve el ranking de amigos mutuos + el propio usuario,
 * ordenado por Oxyra Score descendente.
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Obtener IDs de amigos mutuos (bidireccional, ambos aceptados)
    const [mutualRows] = await db.query(`
      SELECT s1.seguido_id AS friend_id
      FROM seguidores s1
      INNER JOIN seguidores s2
        ON s1.seguidor_id = s2.seguido_id
       AND s1.seguido_id  = s2.seguidor_id
      WHERE s1.seguidor_id = ?
        AND s1.estado = 'aceptado'
        AND s2.estado = 'aceptado'
    `, [userId]);

    // Lista de IDs: amigos mutuos + yo mismo
    const friendIds = mutualRows.map(r => r.friend_id);
    const allIds = [...new Set([userId, ...friendIds])];

    // 2. Obtener datos de usuario para todos los IDs
    const [users] = await db.query(`
      SELECT idUsuario, username, nombre_completo, foto_perfil, rango_global
      FROM usuarios
      WHERE idUsuario IN (?)
    `, [allIds]);

    // 3. Obtener stats musculares para todos los IDs
    const [allStats] = await db.query(`
      SELECT usuario_id, grupo_muscular, rango_actual
      FROM stats_musculares
      WHERE usuario_id IN (?)
    `, [allIds]);

    // Agrupar stats por usuario
    const statsByUser = {};
    for (const stat of allStats) {
      if (!statsByUser[stat.usuario_id]) {
        statsByUser[stat.usuario_id] = [];
      }
      statsByUser[stat.usuario_id].push(stat);
    }

    // 4. Calcular Oxyra Score para cada usuario
    const leaderboard = users.map(user => {
      const userStats = statsByUser[user.idUsuario] || [];
      let totalPoints = 0;

      for (const stat of userStats) {
        const rankName = stat.rango_actual || 'Sin Rango';
        totalPoints += RANK_SCORE_MAP[rankName] || 0;
      }

      // Dividir SIEMPRE por 15 (penalización por músculos sin datos)
      const score = parseFloat((totalPoints / TOTAL_MUSCLES).toFixed(1));

      return {
        idUsuario: user.idUsuario,
        username: user.username,
        nombre_completo: user.nombre_completo,
        foto_perfil: user.foto_perfil,
        rango_global: user.rango_global,
        score
      };
    });

    // 5. Ordenar por score descendente
    leaderboard.sort((a, b) => b.score - a.score);

    res.json(leaderboard);

  } catch (err) {
    console.error('Error en getLeaderboard:', err);
    res.status(500).json({ error: err.message });
  }
};
