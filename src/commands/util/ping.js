import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/theme.js';

/**
 * Commande de latence.
 * Répond avec l'aller‑retour (latence API) et le ping WebSocket du bot.
 */
export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Vérifier la latence du bot et de l’API Discord.');

export async function execute(interaction) {
  // Envoie un message temporaire pour calculer la latence aller‑retour
  const reply = await interaction.reply({ content: '🏓 Pong...', fetchReply: true, allowedMentions: { users: [] } });
  // Latence API : différence entre le timestamp du message et celui de l'interaction
  const roundTrip = reply.createdTimestamp - interaction.createdTimestamp;
  // Latence WebSocket : ping actuel du client
  const wsPing = Math.round(interaction.client.ws.ping);
  const embed = new EmbedBuilder()
    .setTitle('🏓 Ping')
    .setColor(Colors.info)
    .addFields(
      { name: 'Latence API', value: `${roundTrip} ms`, inline: true },
      { name: 'Latence WebSocket', value: `${wsPing} ms`, inline: true }
    );
  await interaction.editReply({ content: '', embeds: [embed] });
}