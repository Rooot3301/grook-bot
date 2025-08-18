import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createCase } from '../../features/cases.js';
import { logCase } from '../../features/modlogs.js';
import { canModerate } from '../../utils/permissions.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bannir un utilisateur définitivement.')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(o => o.setName('user').setDescription('Utilisateur à bannir').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Raison du bannissement').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || 'Aucune raison';
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Je ne trouve pas cet utilisateur sur ce serveur.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de bannir.`, ephemeral: true });
  }
  // Vérifier que le bot peut bannir cette personne (rôle supérieur et pas propriétaire)
  if (!canModerate(member)) {
    return interaction.reply({ content: `Je ne peux pas bannir cette personne (rôle trop élevé ou propriétaire).`, ephemeral: true });
  }
  try {
    await member.ban({ reason });
    const caseData = createCase(interaction.guild.id, target.id, 'BAN', reason, interaction.user.id);
    await logCase(interaction.client, interaction.guild, caseData);
    await interaction.reply({ content: `${target.tag} a été banni.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de bannir ${target.tag}.`, ephemeral: true });
  }
}