import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Citation d'un message à partir de son lien ou de son identifiant.
export const data = new SlashCommandBuilder()
  .setName('grookquote')
  .setDescription('Citer un message de façon stylée.')
  .addStringOption(o => o
    .setName('message')
    .setDescription('Lien ou ID du message à citer')
    .setRequired(true));

export async function execute(interaction) {
  const input = interaction.options.getString('message', true).trim();
  let channelId;
  let messageId;
  // Si c'est un lien complet
  if (input.includes('discord.com/channels/')) {
    try {
      const parts = input.split('/');
      messageId = parts.pop();
      channelId = parts.pop();
      // const guildId = parts.pop(); // On peut vérifier l'ID de serveur si nécessaire
    } catch {
      return interaction.reply({ content: `Format du lien invalide.`, ephemeral: true });
    }
  } else {
    // Suppose ID dans le salon courant
    messageId = input;
    channelId = interaction.channel.id;
  }
  try {
    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) throw new Error('Channel invalide');
    const message = await channel.messages.fetch(messageId);
    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(message.content || '*(Message sans texte)*')
      .setFooter({ text: `Dans #${channel.name}` })
      .setTimestamp(message.createdTimestamp);
    await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de récupérer le message. Assure-toi que je peux y accéder.`, ephemeral: true });
  }
}