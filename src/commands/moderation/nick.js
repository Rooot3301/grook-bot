import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Modifie le pseudo d'un membre sur le serveur. Cette commande est utile pour
 * troller légèrement vos amis ou corriger un pseudo inapproprié.
 */
export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription('Changer le pseudo d’un membre.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption(o => o
    .setName('user')
    .setDescription('Utilisateur dont modifier le pseudo')
    .setRequired(true))
  .addStringOption(o => o
    .setName('pseudo')
    .setDescription('Nouveau pseudo')
    .setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const newNick = interaction.options.getString('pseudo', true);
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: `Je ne trouve pas cet utilisateur sur ce serveur.`, ephemeral: true });
  }
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de modifier les pseudos.`, ephemeral: true });
  }
  try {
    await member.setNickname(newNick);
    await interaction.reply({ content: `${target} a maintenant pour pseudo : **${newNick}**`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de changer le pseudo de ${target}.`, ephemeral: true });
  }
}