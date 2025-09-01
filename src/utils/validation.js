/**
 * Utilitaires de validation pour sécuriser les entrées utilisateur
 */

/**
 * Valide qu'une chaîne ne contient que des caractères alphanumériques et quelques symboles sûrs
 * @param {string} input 
 * @param {number} maxLength 
 * @returns {boolean}
 */
export function isValidInput(input, maxLength = 100) {
  if (typeof input !== 'string') return false;
  if (input.length === 0 || input.length > maxLength) return false;
  // Autorise lettres, chiffres, espaces, tirets, underscores, points
  return /^[a-zA-Z0-9\s\-_.àâäéèêëïîôöùûüÿç]+$/.test(input);
}

/**
 * Nettoie une chaîne pour éviter les injections
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Supprime les balises HTML
    .replace(/javascript:/gi, '') // Supprime les URLs javascript
    .trim()
    .slice(0, 1000); // Limite la longueur
}

/**
 * Valide un ID Discord (snowflake)
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidDiscordId(id) {
  return /^\d{17,19}$/.test(id);
}

/**
 * Valide une URL
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}