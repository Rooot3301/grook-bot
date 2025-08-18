import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { parseDuration } from '../../utils/time.js';
import { createCase } from '../../features/cases.js';
import { logCase } from '../../features/modlogs.js';
import { canModerate } from '../../utils/permissions.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute un utilisateur pendant une durée donnée.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Utilisateur à mute').setRequired(true))
  .addStringOption(o => o.setName('duration').setDescription('Durée (ex: 10m, 2h, 1d)').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Raison du mute').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const durationStr = interaction.options.getString('duration', true);
  const ms = parseDuration(durationStr);
  if (!ms) {
    return interaction.reply({ content: `Durée invalide. Utilisez s, m, h, d (ex: 10m).`, ephemeral: true });
  }
  const reason = interaction.options.getString('reason') || 'Aucune raison';
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Utilisateur introuvable.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de mute.`, ephemeral: true });
  }
  // Vérifier que le bot peut mute cette personne (rôle supérieur et pas propriétaire)
  if (!canModerate(member)) {
    return interaction.reply({ content: `Je ne peux pas mute cette personne (rôle trop élevé ou propriétaire).`, ephemeral: true });
  }
  try {
    await member.timeout(ms, reason);
    const expiresAt = new Date(Date.now() + ms);
    const caseData = createCase(interaction.guild.id, target.id, 'MUTE', reason, interaction.user.id, expiresAt);
    await logCase(interaction.client, interaction.guild, caseData);
    await interaction.reply({ content: `${target.tag} a été mute pendant ${durationStr}.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de mute ${target.tag}.`, ephemeral: true });
  }
}