import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Afficher la liste des commandes disponibles.');

export async function execute(interaction, client) {
  const embed = new EmbedBuilder()
    .setTitle(`Aide de ${client.user?.username || 'Grook'}`)
    .setDescription(
      'Voici la liste des commandes disponibles, groupées par catégorie. Utilise `/commande` pour plus de détails.'
    )
    .setColor(0x00bfff);

  // Trier les catégories et leurs commandes
  const categories = Array.from(client.commandCategories.keys()).sort((a, b) => a.localeCompare(b));
  for (const cat of categories) {
    const cmds = (client.commandCategories.get(cat) || []).slice().sort((a, b) => a.localeCompare(b));
    const title = `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${cmds.length})`;
    const value = cmds.length
      ? cmds.map((cmd) => `• \`/${cmd}\``).join('\n')
      : '_Aucune commande trouvée_';
    embed.addFields({ name: title, value: value, inline: false });
  }

  // Ajouter la version en pied de page
  if (client.version) {
    embed.setFooter({ text: `Version ${client.version}` });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}