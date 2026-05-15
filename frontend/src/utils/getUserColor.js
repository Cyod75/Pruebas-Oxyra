/**
 * Sistema de color de avatar para Oxyra.
 *
 * Estrategia principal:
 *  1. Si el usuario tiene stats musculares → color del rango medio.
 *  2. Si no hay stats o su rango es 'Sin Rango' → Color plano y neutral (gris).
 */

import { RANK_COLORS } from '@/config/ranksColors';

const RANK_SCORES = [
  { label: 'Sin Rango', score: 0  },
  { label: 'Hierro',    score: 10 },
  { label: 'Bronce',    score: 20 },
  { label: 'Plata',     score: 30 },
  { label: 'Oro',       score: 40 },
  { label: 'Esmeralda', score: 50 },
  { label: 'Diamante',  score: 70 },
  { label: 'Campeon',   score: 85 },
  { label: 'Oxyra',     score: 100 },
];

/**
 * Devuelve el color oficial del rango correspondiente.
 * Si no hay, devuelve color neutral.
 */
export function getColorFromMuscularStats(muscularStats) {
  if (!muscularStats || !Array.isArray(muscularStats) || muscularStats.length === 0) {
    return {
      color: RANK_COLORS['Sin Rango'],
      rankLabel: 'Sin Rango',
    };
  }

  const scores = muscularStats.map(s => {
    const entry = RANK_SCORES.find(r => r.label === s.rango_actual);
    return entry ? entry.score : 0;
  });

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  let matchedRank = RANK_SCORES[0];
  for (let i = RANK_SCORES.length - 1; i >= 0; i--) {
    if (avg >= RANK_SCORES[i].score) {
      matchedRank = RANK_SCORES[i];
      break;
    }
  }

  return {
    color: RANK_COLORS[matchedRank.label] ?? RANK_COLORS['Sin Rango'],
    rankLabel: matchedRank.label,
  };
}


