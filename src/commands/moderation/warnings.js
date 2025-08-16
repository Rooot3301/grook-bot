import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getWarnsForUser } from '../../features/warns.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('Affiche les avertissements d’un membre.')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o => o.setName('user').setDescription('Membre ciblé').setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    // Réponse privée si l'utilisateur n'a pas les permissions nécessaires
    return interaction.reply({ content: `Vous n'avez pas la permission de voir les avertissements.`, 
      
ephemeral: true });
  }
  const warns = getWarnsForUser(interaction.guild.id, target.id);
  if (!warns || warns.length === 0) {
    // Aucune avertissement trouvé : message privé
    return interaction.reply({ content: `${target.tag} n’a pas d’avertissement.`, 
      
ephemeral: true });
  }
  const embed = new EmbedBuilder()
    .setTitle(`Avertissements de ${target.tag}`)
    .setColor(0xffcc00)
    .setTimestamp();
  warns.forEach((w, idx) => {
    embed.addFields({
      name: `#${idx + 1}`,
      value: `Raison: ${w.reason}\nModérateur: <@${w.moderatorId}>\nDate: ${new Date(w.createdAt).toLocaleString()}`
    });
  });
  // Afficher les avertissements en message public par défaut
  await interaction.reply({ embeds: [embed], 
    
ephemeral: false });
}