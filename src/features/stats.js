import fs from 'fs';
import path from 'path';

const statsFile = path.join(path.resolve(), 'src', 'data', 'stats.json');

function loadStats() {
  if (!fs.existsSync(statsFile)) {
    fs.writeFileSync(statsFile, JSON.stringify({}), 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveStats(statsObj) {
  fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8');
}

/**
 * Incrémente une victoire pour un membre à un jeu donné.
 * @param {string} guildId
 * @param {string} userId
 * @param {string} game Nom du jeu
 */
function incrementWin(guildId, userId, game) {
  const allStats = loadStats();
  if (!allStats[guildId]) allStats[guildId] = {};
  const guildStats = allStats[guildId];
  if (!guildStats[userId]) guildStats[userId] = {};
  const userStats = guildStats[userId];
  userStats[game] = (userStats[game] || 0) + 1;
  saveStats(allStats);
}

/**
 * Récupère les statistiques d'un serveur.
 * @param {string} guildId
 */
function getStats(guildId) {
  const allStats = loadStats();
  return allStats[guildId] || {};
}

export { incrementWin, getStats };