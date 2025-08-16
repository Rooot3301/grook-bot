import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Commande d'aide : liste toutes les commandes disponibles par catégorie.
// Utilise client.commandCategories rempli lors du chargement des commandes.
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Afficher la liste des commandes disponibles.');

export async function execute(interaction, client) {
  const embed = new EmbedBuilder()
    .setTitle('Aide de Grook')
    .setDescription('Liste des commandes disponibles par catégorie')
    .setColor(0x00bfff);
  for (const [category, commands] of client.commandCategories) {
    const list = commands.map(cmd => `• \`/${cmd}\``).join('\n');
    embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: list });
  }
  await interaction.reply({ embeds: [embed], ephemeral: true });
}