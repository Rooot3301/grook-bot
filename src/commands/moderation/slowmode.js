import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Active un mode lent dans un salon.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(o => o.setName('channel').setDescription('Salon cible').addChannelTypes(0).setRequired(true))
  .addIntegerOption(o => o.setName('secondes').setDescription('Nombre de secondes').setMinValue(0).setMaxValue(21600).setRequired(true));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel', true);
  const seconds = interaction.options.getInteger('secondes', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de gérer les salons.`, ephermal: true });
  }
  try {
    await channel.setRateLimitPerUser(seconds);
    if (seconds === 0) {
      await interaction.reply({ content: `Le slowmode est désactivé dans ${channel}.`, ephermal: false });
    } else {
      await interaction.reply({ content: `Slowmode défini à ${seconds}s dans ${channel}.`, ephermal: false });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de définir le slowmode.`, ephermal: true });
  }
}