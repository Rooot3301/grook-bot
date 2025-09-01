import { readJSON, writeJSON } from '../utils/jsonStore.js';

const LEVELS_FILE = 'src/data/levels.json';

// Configuration du système de niveaux
const CONFIG = {
  xpPerMessage: 15,        // XP de base par message
  xpVariance: 10,          // Variance aléatoire (+/- 10 XP)
  cooldownMs: 60000,       // 1 minute entre les gains d'XP
  baseXpRequired: 100,     // XP requis pour le niveau 1
  xpMultiplier: 1.2        // Multiplicateur par niveau
};

// Paliers spéciaux avec messages personnalisés
const LEVEL_MILESTONES = {
  1: { title: '🌱 Nouveau Membre', message: 'Bienvenue dans l\'aventure !' },
  5: { title: '💬 Bavard', message: 'Tu commences à te faire entendre !' },
  10: { title: '🎯 Actif', message: 'Tu es maintenant un membre actif !' },
  15: { title: '⭐ Régulier', message: 'On peut compter sur toi !' },
  20: { title: '🔥 Passionné', message: 'Ta passion se ressent !' },
  25: { title: '💎 Précieux', message: 'Tu es précieux pour cette communauté !' },
  30: { title: '🏆 Champion', message: 'Un vrai champion parmi nous !' },
  40: { title: '👑 Elite', message: 'Tu fais partie de l\'élite !' },
  50: { title: '🌟 Légende', message: 'Tu es devenu une légende vivante !' },
  75: { title: '🚀 Maître', message: 'Maître de la discussion !' },
  100: { title: '🎭 Sage', message: 'Ta sagesse n\'a plus de limites !' }
};

/**
 * Calcule l'XP requis pour atteindre un niveau donné
 * @param {number} level 
 * @returns {number}
 */
function getXpRequiredForLevel(level) {
  if (level <= 0) return 0;
  let totalXp = 0;
  for (let i = 1; i <= level; i++) {
    totalXp += Math.floor(CONFIG.baseXpRequired * Math.pow(CONFIG.xpMultiplier, i - 1));
  }
  return totalXp;
}

/**
 * Calcule le niveau actuel basé sur l'XP total
 * @param {number} totalXp 
 * @returns {number}
 */
function getLevelFromXp(totalXp) {
  let level = 0;
  while (getXpRequiredForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/**
 * Charge les données de niveaux
 * @returns {Promise<Object>}
 */
async function loadLevels() {
  return await readJSON(LEVELS_FILE, {});
}

/**
 * Sauvegarde les données de niveaux
 * @param {Object} data 
 */
async function saveLevels(data) {
  await writeJSON(LEVELS_FILE, data);
}

/**
 * Ajoute de l'XP à un utilisateur et vérifie les montées de niveau
 * @param {string} guildId 
 * @param {string} userId 
 * @param {import('discord.js').Message} message 
 * @returns {Promise<Object|null>} Informations de montée de niveau ou null
 */
export async function addXp(guildId, userId, message) {
  const data = await loadLevels();
  
  // Initialiser la structure si nécessaire
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = {
      xp: 0,
      level: 0,
      lastXpGain: 0,
      totalMessages: 0
    };
  }
  
  const user = data[guildId][userId];
  const now = Date.now();
  
  // Vérifier le cooldown
  if (now - user.lastXpGain < CONFIG.cooldownMs) {
    return null;
  }
  
  // Calculer l'XP gagné (avec variance aléatoire)
  const baseXp = CONFIG.xpPerMessage;
  const variance = Math.floor(Math.random() * (CONFIG.xpVariance * 2 + 1)) - CONFIG.xpVariance;
  const xpGained = Math.max(1, baseXp + variance);
  
  // Bonus pour les messages longs (max +50%)
  const lengthBonus = Math.min(0.5, message.content.length / 200);
  const finalXp = Math.floor(xpGained * (1 + lengthBonus));
  
  // Mettre à jour les données
  const oldLevel = user.level;
  user.xp += finalXp;
  user.totalMessages++;
  user.lastXpGain = now;
  user.level = getLevelFromXp(user.xp);
  
  await saveLevels(data);
  
  // Vérifier si montée de niveau
  if (user.level > oldLevel) {
    const milestone = LEVEL_MILESTONES[user.level];
    return {
      levelUp: true,
      oldLevel,
      newLevel: user.level,
      totalXp: user.xp,
      xpForNext: getXpRequiredForLevel(user.level + 1) - user.xp,
      milestone: milestone || null,
      xpGained: finalXp
    };
  }
  
  return {
    levelUp: false,
    xpGained: finalXp,
    totalXp: user.xp,
    level: user.level,
    xpForNext: getXpRequiredForLevel(user.level + 1) - user.xp
  };
}

/**
 * Récupère les informations de niveau d'un utilisateur
 * @param {string} guildId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export async function getUserLevel(guildId, userId) {
  const data = await loadLevels();
  const user = data[guildId]?.[userId];
  
  if (!user) {
    return {
      xp: 0,
      level: 0,
      totalMessages: 0,
      xpForNext: CONFIG.baseXpRequired,
      rank: null
    };
  }
  
  // Calculer le rang dans le serveur
  const guildUsers = Object.entries(data[guildId] || {})
    .map(([id, userData]) => ({ id, ...userData }))
    .sort((a, b) => b.xp - a.xp);
  
  const rank = guildUsers.findIndex(u => u.id === userId) + 1;
  
  return {
    xp: user.xp,
    level: user.level,
    totalMessages: user.totalMessages,
    xpForNext: getXpRequiredForLevel(user.level + 1) - user.xp,
    rank: rank || null,
    milestone: LEVEL_MILESTONES[user.level] || null
  };
}

/**
 * Récupère le leaderboard d'un serveur
 * @param {string} guildId 
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export async function getLeaderboard(guildId, limit = 10) {
  const data = await loadLevels();
  const guildData = data[guildId] || {};
  
  return Object.entries(guildData)
    .map(([userId, userData]) => ({
      userId,
      ...userData,
      milestone: LEVEL_MILESTONES[userData.level] || null
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

/**
 * Statistiques globales du système de niveaux
 * @param {string} guildId 
 * @returns {Promise<Object>}
 */
export async function getLevelStats(guildId) {
  const data = await loadLevels();
  const guildData = data[guildId] || {};
  const users = Object.values(guildData);
  
  if (users.length === 0) {
    return {
      totalUsers: 0,
      totalMessages: 0,
      totalXp: 0,
      averageLevel: 0,
      highestLevel: 0
    };
  }
  
  return {
    totalUsers: users.length,
    totalMessages: users.reduce((sum, u) => sum + u.totalMessages, 0),
    totalXp: users.reduce((sum, u) => sum + u.xp, 0),
    averageLevel: Math.round(users.reduce((sum, u) => sum + u.level, 0) / users.length),
    highestLevel: Math.max(...users.map(u => u.level))
  };
}