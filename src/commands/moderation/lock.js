import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Verrouille un salon (empêche les messages).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(o => o.setName('channel').setDescription('Salon à verrouiller').addChannelTypes(0).setRequired(true));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de gérer les salons.`, ephemeral: true });
  }
  try {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({ content: `${channel} est maintenant verrouillé.`, ephemeral: false });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de verrouiller ${channel}.`, ephemeral: true });
  }
}