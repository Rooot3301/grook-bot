import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Affiche des informations sur le serveur courant : nombre de membres, date de création, propriétaire.
export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Afficher des informations sur le serveur.');

export async function execute(interaction) {
  const { guild } = interaction;
  const owner = await guild.fetchOwner();
  const embed = new EmbedBuilder()
    .setTitle(`Informations sur ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor(0x00bfff)
    .addFields(
      { name: 'ID', value: guild.id, inline: true },
      { name: 'Propriétaire', value: `${owner.user.tag}`, inline: true },
      { name: 'Membres', value: `${guild.memberCount}`, inline: true },
      { name: 'Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
    );
  await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
}