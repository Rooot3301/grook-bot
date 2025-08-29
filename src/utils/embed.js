import { EmbedBuilder } from 'discord.js';
import { Colors } from './theme.js';

/*
 * embed.js
 *
 * Fournit des helpers pour générer des embeds cohérents à travers le bot.
 * Chaque embed est créé avec une couleur par défaut définie dans theme.js
 * et peut être personnalisé via des paramètres optionnels. Ces helpers
 * permettent d'uniformiser la direction artistique des réponses de slash
 * commands tout en conservant la flexibilité des embeds Discord.js.
 */

/**
 * Construit un embed basique avec des options standards. Les options
 * acceptent un titre, une description, une couleur, un tableau de champs,
 * un pied de page et un indicateur timestamp. Si aucune couleur n'est
 * spécifiée, la couleur neutre définie dans Colors est utilisée.
 *
 * @param {Object} options Options pour personnaliser l'embed
 * @param {string} [options.title] Titre de l'embed
 * @param {string} [options.description] Description de l'embed
 * @param {number} [options.color] Couleur de l'embed (entier hexadécimal)
 * @param {Array<Object>} [options.fields] Champs à ajouter à l'embed
 * @param {Object|string} [options.footer] Objet ou texte pour le pied de page
 * @param {boolean} [options.timestamp] Inclure un timestamp (par défaut true)
 * @returns {EmbedBuilder}
 */
export function buildEmbed({
  title,
  description,
  color = Colors.neutral,
  fields = [],
  footer,
  timestamp = true,
} = {}) {
  const embed = new EmbedBuilder().setColor(color);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (Array.isArray(fields) && fields.length) embed.addFields(...fields);
  if (footer) {
    if (typeof footer === 'string') {
      embed.setFooter({ text: footer });
    } else {
      embed.setFooter(footer);
    }
  }
  if (timestamp) embed.setTimestamp();
  return embed;
}

/**
 * Construit un embed de succès à partir des options fournies.
 *
 * @param {Object} options Options identiques à buildEmbed
 * @returns {EmbedBuilder}
 */
export function successEmbed(options = {}) {
  return buildEmbed({ ...options, color: Colors.success });
}

/**
 * Construit un embed d'erreur à partir des options fournies.
 *
 * @param {Object} options Options identiques à buildEmbed
 * @returns {EmbedBuilder}
 */
export function errorEmbed(options = {}) {
  return buildEmbed({ ...options, color: Colors.error });
}

/**
 * Construit un embed d'information à partir des options fournies.
 *
 * @param {Object} options Options identiques à buildEmbed
 * @returns {EmbedBuilder}
 */
export function infoEmbed(options = {}) {
  return buildEmbed({ ...options, color: Colors.info });
}

/**
 * Construit un embed d'avertissement à partir des options fournies.
 *
 * @param {Object} options Options identiques à buildEmbed
 * @returns {EmbedBuilder}
 */
export function warnEmbed(options = {}) {
  return buildEmbed({ ...options, color: Colors.warn });
}