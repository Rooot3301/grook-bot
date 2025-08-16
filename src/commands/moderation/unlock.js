import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Déverrouille un salon textuel en rétablissant l'autorisation d'envoyer des messages
 * pour le rôle @everyone. Cette commande inverse l'effet de `/lock`.
 */
export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Déverrouille un salon (permet l’envoi de messages).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(o => o
    .setName('channel')
    .setDescription('Salon à déverrouiller')
    .addChannelTypes(0)
    .setRequired(true));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel', true);
  // Vérifie que la personne a la permission de gérer les salons
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de gérer les salons.`, ephemeral: true });
  }
  try {
    // Pour annuler un overwrite, on met l'option à null (Discord remet l'héritage)
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({ content: `${channel} est maintenant déverrouillé.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de déverrouiller ${channel}.`, ephemeral: true });
  }
}