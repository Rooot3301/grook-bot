import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { removeCase } from '../../features/cases.js';

// Supprime un cas disciplinaire à partir de son identifiant.
export const data = new SlashCommandBuilder()
  .setName('case-remove')
  .setDescription('Supprimer un cas disciplinaire (admins seulement).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption(o => o
    .setName('id')
    .setDescription('ID du cas à supprimer (ex : GRC-20250101-00001)')
    .setRequired(true));

export async function execute(interaction) {
  const caseId = interaction.options.getString('id', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de supprimer des cas.`, ephemeral: true });
  }
  const removed = removeCase(interaction.guild.id, caseId);
  if (!removed) {
    return interaction.reply({ content: `Aucun cas avec l’ID ${caseId} n’a été trouvé.`, allowedMentions: { users: [] } });
  }
  await interaction.reply({ content: `Le cas ${caseId} a été supprimé.`, allowedMentions: { users: [] } });
}