import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/theme.js';

// Cette commande fournit un résumé de l'état du bot : uptime, latences, serveurs, utilisateurs, mémoire et version.

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription("Afficher l'état et les performances actuelles du bot.");

/**
 * Formate une durée (en millisecondes) en chaîne lisible.
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts = [];
  if (days) parts.push(`${days} j`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} m`);
  parts.push(`${seconds} s`);
  return parts.join(' ');
}

/**
 * Exécute la commande /status.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('discord.js').Client} client
 */
export async function execute(interaction, client) {
  try {
    const uptimeMs = client.uptime ?? 0;
    const uptime = formatDuration(uptimeMs);
    const apiLatency = Date.now() - interaction.createdTimestamp;
    const wsLatency = Math.round(client.ws.ping);
    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount ?? 0), 0);
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const version = client.version || 'N/A';

    const embed = new EmbedBuilder()
      .setTitle('Statut de Grook')
      .setColor(Colors.info)
      .addFields(
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Latence API', value: `${apiLatency} ms`, inline: true },
        { name: 'Latence WebSocket', value: `${wsLatency} ms`, inline: true },
        { name: 'Serveurs', value: `${guildCount}`, inline: true },
        { name: 'Utilisateurs', value: `${memberCount}`, inline: true },
        { name: 'Mémoire utilisée', value: `${memory} MB`, inline: true },
        { name: 'Version', value: `v${version}`, inline: true }
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Erreur dans la commande status :', error);
    const content = '❌ Impossible d\'obtenir le statut actuellement.';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content, allowedMentions: { repliedUser: false }, ephemeral: true });
    } else {
      await interaction.followUp({ content, allowedMentions: { repliedUser: false }, ephemeral: true });
    }
  }
}