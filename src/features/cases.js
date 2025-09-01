import fs from 'fs';
import path from 'path';
import { readJSON, writeJSON } from '../utils/jsonStore.js';

// Chemin vers le fichier JSON stockant les cas disciplinaires
const casesFile = path.join(path.resolve(), 'src', 'data', 'cases.json');

/**
 * Charge les cas depuis le fichier JSON. Initialise le fichier s'il n'existe pas.
 * @returns {Object<string, Array>} Cas par identifiant de serveur
 */
async function loadCases() {
  return await readJSON(casesFile, {});
}

/**
 * Sauvegarde les cas dans le fichier JSON.
 * @param {Object<string, Array>} casesObj
 */
async function saveCases(casesObj) {
  await writeJSON(casesFile, casesObj);
}

/**
 * Génère un identifiant unique de cas pour un serveur.
 * Format : GRC-YYYYMMDD-NNNNN
 * @param {string} guildId
 * @returns {string}
 */
async function generateCaseId(guildId) {
  const allCases = await loadCases();
  const guildCases = allCases[guildId] || [];
  const nextNumber = guildCases.length + 1;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `GRC-${dateStr}-${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Crée un nouveau cas disciplinaire et le sauvegarde.
 * @param {string} guildId ID du serveur
 * @param {string} userId ID de l'utilisateur ciblé
 * @param {string} type Type d'action (BAN, KICK, MUTE, WARN, etc.)
 * @param {string} reason Raison de la sanction
 * @param {string} moderatorId ID de la personne qui effectue la sanction
 * @param {Date|null} expiresAt Date d'expiration pour les sanctions temporaires
 * @param {Object} meta Métadonnées supplémentaires
 * @returns {Object} Le cas créé
 */
async function createCase(guildId, userId, type, reason, moderatorId, expiresAt = null, meta = {}) {
  const allCases = await loadCases();
  const id = await generateCaseId(guildId);
  const newCase = {
    id,
    userId,
    type,
    reason: reason || 'Aucune raison',
    moderatorId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    meta
  };
  if (!allCases[guildId]) allCases[guildId] = [];
  allCases[guildId].push(newCase);
  await saveCases(allCases);
  return newCase;
}

/**
 * Supprime un cas dans un serveur.
 * @param {string} guildId ID du serveur
 * @param {string} caseId ID du cas à supprimer
 * @returns {Object|null} Le cas supprimé ou null s'il n'existait pas
 */
async function removeCase(guildId, caseId) {
  const allCases = await loadCases();
  const guildCases = allCases[guildId] || [];
  const index = guildCases.findIndex(c => c.id === caseId);
  if (index === -1) return null;
  const [removed] = guildCases.splice(index, 1);
  await saveCases(allCases);
  return removed;
}

/**
 * Récupère tous les cas pour un utilisateur dans un serveur.
 * @param {string} guildId
 * @param {string} userId
 * @returns {Array}
 */
async function getCasesForUser(guildId, userId) {
  const allCases = await loadCases();
  return (allCases[guildId] || []).filter(c => c.userId === userId);
}

/**
 * Récupère tous les cas d'un serveur.
 * @param {string} guildId
 * @returns {Array}
 */
async function getAllCases(guildId) {
  const allCases = await loadCases();
  return allCases[guildId] || [];
}

export { createCase, removeCase, getCasesForUser, getAllCases };