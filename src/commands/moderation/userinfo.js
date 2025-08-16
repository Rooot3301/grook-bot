import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Affiche des informations sur un utilisateur : date de création du compte, arrivée sur le serveur, rôles, etc.
export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Afficher des informations sur un utilisateur.')
  .addUserOption(o => o
    .setName('user')
    .setDescription('Utilisateur ciblé (optionnel)')
    .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild.members.cache.get(user.id);
  const embed = new EmbedBuilder()
    .setTitle(`Informations sur ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setColor(0x00bfff)
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
    );
  if (member) {
    embed.addFields(
      { name: 'Rejoint le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
      { name: 'Rôles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(' ') || 'Aucun', inline: false }
    );
  }
  await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
}