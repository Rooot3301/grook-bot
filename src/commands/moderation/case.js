import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getCasesForUser } from '../../features/cases.js';

// Affiche l'historique disciplinaire d'un membre sur le serveur.
export const data = new SlashCommandBuilder()
  .setName('case')
  .setDescription('Afficher les sanctions d’un utilisateur.')
  .addUserOption(o => o
    .setName('user')
    .setDescription('Utilisateur à consulter')
    .setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de consulter les cas.`, ephemeral: true });
  }
  const cases = getCasesForUser(interaction.guild.id, target.id);
  if (!cases || cases.length === 0) {
    return interaction.reply({ content: `${target.tag} n’a aucun cas enregistré.`, allowedMentions: { users: [] } });
  }
  const embed = new EmbedBuilder()
    .setTitle(`Casier disciplinaire de ${target.tag}`)
    .setColor(0xff5555);
  for (const c of cases) {
    embed.addFields({ name: `#${c.id} – ${c.type}`, value: `Raison : ${c.reason}\nModérateur : <@${c.moderatorId}>\nDate : <t:${Math.floor(new Date(c.createdAt).getTime()/1000)}:F>`, inline: false });
  }
  await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
}