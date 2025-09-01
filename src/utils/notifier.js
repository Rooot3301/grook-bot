/*
 * notifier.js
 *
 * Ce module encapsule l'envoi de notifications via un webhook Discord.
 * Il permet au bot de signaler des événements importants (démarrage,
 * déploiements de commandes, erreurs, mises à jour) sans polluer la
 * console. L'URL du webhook est lue depuis la variable d'environnement
 * WEBHOOK_URL si elle est définie, sinon la valeur de repli définie
 * ci-dessous sera utilisée. Pour désactiver complètement les envois,
 * laisser WEBHOOK_URL vide ou fixer SKIP_WEBHOOK=true.
 */

const DEFAULT_WEBHOOK = ''; // SÉCURITÉ: Pas de webhook par défaut

/**
 * Envoie un message brut au webhook. Si SKIP_WEBHOOK est définie à
 * true, l'appel est ignoré. Les erreurs réseau ne sont pas remontées.
 *
 * @param {string|Object} content Contenu du message ou payload déjà formé
 * @returns {Promise<void>}
 */
export async function sendWebhook(content) {
  const skip = String(process.env.SKIP_WEBHOOK || '').toLowerCase() === 'true';
  if (skip) return;
  const url = process.env.WEBHOOK_URL || DEFAULT_WEBHOOK;
  if (!url) return;
  
  // Validation basique de l'URL webhook
  if (!url.startsWith('https://discord.com/api/webhooks/')) {
    console.warn('[notifier] URL webhook invalide');
    return;
  }
  
  const payload =
    typeof content === 'string'
      ? { content }
      : content;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Ne pas faire échouer l'appel en cas d'erreur réseau
    console.warn('[notifier] Webhook non envoyé:', err.message);
  }
}

/**
 * Construit et envoie un embed standard au webhook. Les couleurs par
 * défaut s'appuient sur les valeurs d'embed.js. Le titre et la
 * description sont recommandés pour contextualiser le message.
 *
 * @param {Object} options Options de l'embed: title, description, color, fields, footer
 * @returns {Promise<void>}
 */
export async function notifyEmbed(options = {}) {
  const { buildEmbed } = await import('./embed.js');
  const embed = buildEmbed(options);
  return sendWebhook({ embeds: [embed.toJSON()] });
}