import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

// Cette commande permet à un administrateur d'envoyer un message en tant que Grook.
// Elle est volontairement réservée aux administrateurs pour éviter les abus.

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Envoyer un message via le bot (administrateur uniquement).')
  // Réserve la commande aux administrateurs du serveur
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('Le message à envoyer dans le salon actuel')
      .setRequired(true)
      .setMaxLength(2000)
  );

/**
 * Exécute la commande /say.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const content = interaction.options.getString('message', true);
  try {
    // Confirme à l'utilisateur que sa demande est prise en compte (message privé)
    await interaction.reply({ content: '✅ Message envoyé.', allowedMentions: { repliedUser: false }, ephemeral: true });
    // Envoie réellement le message dans le salon courant
    await interaction.channel.send({ content });
  } catch (error) {
    console.error('Erreur dans la commande say:', error);
    // Notifie l'utilisateur en cas d'échec (en message privé)
    const errorMsg = '❌ Impossible d\'envoyer le message.';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: errorMsg, allowedMentions: { repliedUser: false }, ephemeral: true });
    } else {
      await interaction.followUp({ content: errorMsg, allowedMentions: { repliedUser: false }, ephemeral: true });
    }
  }
}