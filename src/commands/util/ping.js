import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Mesure la latence du bot et renvoie un embed avec les valeurs API et WebSocket.

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Mesurer la latence du bot (API et WebSocket).');

export async function execute(interaction) {
  // Calcul des latences
  const apiLatency = Date.now() - interaction.createdTimestamp;
  const wsLatency = Math.round(interaction.client.ws.ping);

  const embed = new EmbedBuilder()
    .setTitle('🏓 Pong !')
    .setColor(0x00bfff)
    .addFields(
      { name: 'Latence API', value: `${apiLatency} ms`, inline: true },
      { name: 'Latence WebSocket', value: `${wsLatency} ms`, inline: true }
    );

  await interaction.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, ephemeral: true });
  // Log dans la console pour diagnostics
  console.log(`[ping] API: ${apiLatency}ms | WS: ${wsLatency}ms pour ${interaction.user.tag}`);
}
