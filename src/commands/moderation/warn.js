import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createWarn } from '../../features/warns.js';
import { createCase } from '../../features/cases.js';
import { logCase } from '../../features/modlogs.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Donne un avertissement à un membre.')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o => o.setName('user').setDescription('Utilisateur à avertir').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Raison de l’avertissement').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || 'Aucune raison';
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Je ne trouve pas cet utilisateur.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de warn.`, ephemeral: true });
  }
  try {
    createWarn(interaction.guild.id, target.id, reason, interaction.user.id);
    const caseData = createCase(interaction.guild.id, target.id, 'WARN', reason, interaction.user.id);
    await logCase(interaction.client, interaction.guild, caseData);
    await interaction.reply({ content: `${target.tag} a reçu un avertissement.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible d’avertir ${target.tag}.`, ephemeral: true });
  }
}