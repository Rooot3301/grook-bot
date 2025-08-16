import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getStats } from '../../features/stats.js';

// Affiche les statistiques de victoire des mini-jeux pour ce serveur.
export const data = new SlashCommandBuilder()
  .setName('grookstats')
  .setDescription('Voir les statistiques de victoires aux mini-jeux.');

export async function execute(interaction) {
  const stats = getStats(interaction.guild.id);
  const embed = new EmbedBuilder()
    .setTitle('Statistiques des mini-jeux')
    .setColor(0x00bfff);
  if (Object.keys(stats).length === 0) {
    embed.setDescription('Aucune statistique enregistrée pour l’instant.');
  } else {
    // Construire un classement global par nombre total de victoires
    const totals = [];
    for (const userId of Object.keys(stats)) {
      const games = stats[userId];
      const totalWins = Object.values(games).reduce((a, b) => a + b, 0);
      totals.push({ userId, totalWins, games });
    }
    totals.sort((a, b) => b.totalWins - a.totalWins);
    const lines = [];
    for (const entry of totals.slice(0, 10)) {
      const userTag = (interaction.guild.members.cache.get(entry.userId)?.user.tag) || `<@${entry.userId}>`;
      const gameList = Object.entries(entry.games).map(([game, wins]) => `${game}:${wins}`).join(' | ');
      lines.push(`**${userTag}** – ${entry.totalWins} victoires (${gameList})`);
    }
    embed.setDescription(lines.join('\n'));
  }
  await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
}