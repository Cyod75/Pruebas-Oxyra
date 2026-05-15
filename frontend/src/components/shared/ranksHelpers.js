/**
 * Helpers para el sistema de rangos Oxyra
 * Mapeo de rango → valor numérico y utilidades de cálculo
 */

import rankIron from '../../assets/assets/icons/ranking/base/rank=iron.svg';
import rankBronze from '../../assets/assets/icons/ranking/base/rank=bronze.svg';
import rankSilver from '../../assets/assets/icons/ranking/base/rank=silver.svg';
import rankGold from '../../assets/assets/icons/ranking/base/rank=gold.svg';
import rankPlatinum from '../../assets/assets/icons/ranking/base/rank=platinum.svg';
import rankEmerald from '../../assets/assets/icons/ranking/base/rank=emerald.svg';
import rankDiamond from '../../assets/assets/icons/ranking/base/rank=diamond.svg';
import rankChampion from '../../assets/assets/icons/ranking/base/rank=champion.svg';
import rankOxyra from '../../assets/assets/icons/ranking/base/rank=oxyra.svg';
import rankNoRank from '../../assets/assets/icons/ranking/unranked_icon.svg';

export const RANK_ICONS = {
  'Sin Rango': rankNoRank,
  'Hierro': rankIron,
  'Bronce': rankBronze,
  'Plata': rankSilver,
  'Oro': rankGold,
  'Platino': rankPlatinum,
  'Esmeralda': rankEmerald,
  'Diamante': rankDiamond,
  'Campeón': rankChampion,
  'Campeon': rankChampion,
  'Oxyra': rankOxyra
};

export const RANK_SCORE_MAP = {
  'Sin Rango': 0,
  'Hierro': 10,
  'Bronce': 20,
  'Plata': 30,
  'Oro': 40,
  'Platino': 50,
  'Esmeralda': 60,
  'Diamante': 70,
  'Campeón': 85,
  'Campeon': 85,
  'Oxyra': 100
};

const RANK_THRESHOLDS = [
  { min: 100, label: 'Oxyra' },
  { min: 85, label: 'Campeón' },
  { min: 70, label: 'Diamante' },
  { min: 60, label: 'Esmeralda' },
  { min: 50, label: 'Platino' },
  { min: 40, label: 'Oro' },
  { min: 30, label: 'Plata' },
  { min: 20, label: 'Bronce' },
  { min: 10, label: 'Hierro' },
  { min: 0,  label: 'Sin Rango' }
];

/**
 * Dado un Oxyra Score numérico, devuelve el nombre de rango correspondiente.
 * @param {number} score
 * @returns {string} Nombre del rango
 */
export const getRankLabel = (score) => {
  for (const tier of RANK_THRESHOLDS) {
    if (score >= tier.min) return tier.label;
  }
  return 'Sin Rango';
};

/**
 * Colores para bordes del podio (posición 1, 2, 3)
 */
export const PODIUM_COLORS = {
  1: { border: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)', bg: 'rgba(251, 191, 36, 0.1)' },   // Oro
  2: { border: '#e4e4e7', glow: 'rgba(228, 228, 231, 0.3)', bg: 'rgba(228, 228, 231, 0.08)' }, // Plata
  3: { border: '#cd7f32', glow: 'rgba(205, 127, 50, 0.3)', bg: 'rgba(205, 127, 50, 0.08)' }    // Bronce
};
