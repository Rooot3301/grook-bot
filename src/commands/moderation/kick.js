import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createCase } from '../../features/cases.js';
import { logCase } from '../../features/modlogs.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Expulser un utilisateur du serveur.')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o => o.setName('user').setDescription('Utilisateur à expulser').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Raison de l’expulsion').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || 'Aucune raison';
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Je ne trouve pas cet utilisateur.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return interaction.reply({ content: `Vous n'avez pas la permission d’expulser.`, ephemeral: true });
  }
  try {
    await member.kick(reason);
    const caseData = createCase(interaction.guild.id, target.id, 'KICK', reason, interaction.user.id);
    await logCase(interaction.client, interaction.guild, caseData);
    await interaction.reply({ content: `${target.tag} a été expulsé.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible d’expulser ${target.tag}.`, ephemeral: true });
  }
}