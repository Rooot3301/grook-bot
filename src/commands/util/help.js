import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Afficher la liste des commandes disponibles.');

export async function execute(interaction, client) {
  const embed = new EmbedBuilder()
    .setTitle('Aide de Grook')
    .setDescription('Liste des commandes disponibles par catégorie')
    .setColor(0x00bfff);

  const sortedCats = Array.from(client.commandCategories.keys()).sort((a, b) => a.localeCompare(b));
  for (const cat of sortedCats) {
    const commands = (client.commandCategories.get(cat) || []).slice().sort((a, b) => a.localeCompare(b));
    const list = commands.map(cmd => `• \`/${cmd}\``).join('\\n') || '_Aucune_';
    const title = cat.charAt(0).toUpperCase() + cat.slice(1);
    embed.addFields({ name: title, value: list });
  }
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
