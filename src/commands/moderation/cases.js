import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getAllCases } from '../../features/cases.js';

// Liste tous les cas disciplinaires du serveur avec un résumé.
export const data = new SlashCommandBuilder()
  .setName('cases')
  .setDescription('Lister tous les cas disciplinaires du serveur (optionnel).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de consulter les cas.`, ephemeral: true });
  }
  const list = getAllCases(interaction.guild.id);
  if (!list || list.length === 0) {
    return interaction.reply({ content: `Aucun cas n’a été enregistré sur ce serveur.`, allowedMentions: { users: [] } });
  }
  // On limite l'affichage aux 10 plus récents pour éviter les embeds énormes
  const recent = list.slice(-10).reverse();
  const embed = new EmbedBuilder()
    .setTitle(`Liste des derniers cas disciplinaires`)
    .setColor(0xff5555);
  for (const c of recent) {
    embed.addFields({ name: `#${c.id} – ${c.type} – <@${c.userId}>`, value: `Raison : ${c.reason}\nModérateur : <@${c.moderatorId}>\nDate : <t:${Math.floor(new Date(c.createdAt).getTime()/1000)}:F>`, inline: false });
  }
  await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
}