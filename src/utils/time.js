/**
 * Convertit une chaîne de durée en millisecondes.
 * Exemples : "10s" = 10000, "5m" = 300000, "2h" = 7200000, "1d" = 86400000.
 * Retourne null si la chaîne est invalide ou si la valeur est nulle.
 *
 * @param {string} str Durée au format nombre + unité (s, m, h, d)
 * @returns {number|null} Nombre de millisecondes ou null
 */
export function parseDuration(str) {
  if (!str) return null;
  const match = /^([0-9]+)\s*([smhdw])$/i.exec(str.trim());
  if (!match) return null;
  const value = parseInt(match[1], 10);
  if (isNaN(value) || value <= 0) return null;
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  return value * multipliers[unit];
}