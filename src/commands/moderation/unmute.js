import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createCase } from '../../features/cases.js';
import { logCase } from '../../features/modlogs.js';
import { canModerate } from '../../utils/permissions.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Dé‑mute un utilisateur (retire son timeout).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Utilisateur à démute').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Raison (optionnelle)').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || 'Aucune raison';
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Utilisateur introuvable.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de démute.`, ephemeral: true });
  }
  // Vérifier que le bot peut démute cette personne (rôle supérieur et pas propriétaire)
  if (!canModerate(member)) {
    return interaction.reply({ content: `Je ne peux pas démute cette personne (rôle trop élevé ou propriétaire).`, ephemeral: true });
  }
  try {
    await member.timeout(null, reason);
    const caseData = createCase(interaction.guild.id, target.id, 'UNMUTE', reason, interaction.user.id);
    await logCase(interaction.client, interaction.guild, caseData);
    await interaction.reply({ content: `${target.tag} a été démute.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de démute ${target.tag}.`, ephemeral: true });
  }
}