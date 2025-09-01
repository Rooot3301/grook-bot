/**
 * Gestionnaire d'erreurs centralisé pour améliorer la robustesse
 */

import { logger } from './logger.js';
import { notifyEmbed } from './notifier.js';
import { Colors } from './theme.js';

/**
 * Gère les erreurs de commandes de manière uniforme
 * @param {Error} error 
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {string} context 
 */
export async function handleCommandError(error, interaction, context = 'command') {
  logger.error({ error: error.message, stack: error.stack, context }, 'Command error');
  
  // Notifier les erreurs critiques
  if (error.name === 'DiscordAPIError' && error.code === 50013) {
    // Permissions insuffisantes
    const content = '❌ Je n\'ai pas les permissions nécessaires pour cette action.';
    await safeReply(interaction, content);
  } else if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    // Erreurs de code
    await notifyEmbed({
      title: 'Erreur de code détectée',
      description: `${error.name}: ${error.message}`,
      color: Colors.error,
      fields: [
        { name: 'Contexte', value: context, inline: true },
        { name: 'Commande', value: interaction.commandName || 'N/A', inline: true }
      ]
    }).catch(() => {});
    
    const content = '❌ Une erreur technique est survenue. L\'équipe a été notifiée.';
    await safeReply(interaction, content);
  } else {
    // Autres erreurs
    const content = '❌ Une erreur inattendue s\'est produite.';
    await safeReply(interaction, content);
  }
}

/**
 * Répond de manière sécurisée à une interaction
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {string} content 
 */
async function safeReply(interaction, content) {
  try {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content, ephemeral: true });
    } else {
      await interaction.followUp({ content, ephemeral: true });
    }
  } catch (err) {
    logger.error({ error: err.message }, 'Failed to send error response');
  }
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur automatique
 * @param {Function} fn 
 * @returns {Function}
 */
export function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error({ error: error.message, stack: error.stack }, 'Wrapped function error');
      throw error;
    }
  };
}