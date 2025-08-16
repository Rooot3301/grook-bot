import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setModlogsChannel } from '../../features/modlogs.js';

/**
 * Configure le salon où les actions de modération seront journalisées.
 * Le salon sélectionné recevra les embeds générés lors des sanctions.
 */
export const data = new SlashCommandBuilder()
  .setName('modlogs')
  .setDescription('Définir le salon des logs de modération.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o => o
    .setName('channel')
    .setDescription('Salon où envoyer les logs')
    .addChannelTypes(0)
    .setRequired(true));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel', true);
  // Vérification des permissions
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de gérer ce serveur.`, ephemeral: true });
  }
  try {
    setModlogsChannel(interaction.guild.id, channel.id);
    await interaction.reply({ content: `Les logs de modération seront envoyés dans ${channel}.`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de configurer le salon des logs.`, ephemeral: true });
  }
}