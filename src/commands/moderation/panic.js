import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

// Mode panique : verrouille ou déverrouille tous les salons texte et applique un slowmode global.
export const data = new SlashCommandBuilder()
  .setName('panic')
  .setDescription('Activer ou désactiver le mode panique (anti-raid).')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(o => o
    .setName('mode')
    .setDescription('on pour activer, off pour désactiver')
    .setRequired(false)
    .addChoices(
      { name: 'on', value: 'on' },
      { name: 'off', value: 'off' }
    ));

export async function execute(interaction) {
  const mode = interaction.options.getString('mode') || 'on';
  const guild = interaction.guild;
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: `Seuls les administrateurs peuvent utiliser le mode panique.`, ephemeral: true });
  }
  // Récupérer tous les salons texte
  const channels = guild.channels.cache.filter(c => c.isTextBased());
  try {
    for (const channel of channels.values()) {
      // Modifier les permissions pour @everyone
      if (mode === 'on') {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
        // Appliquer un slowmode de 120 secondes (2 minutes)
        if (channel.rateLimitPerUser !== undefined) {
          await channel.setRateLimitPerUser(120, 'Mode panique activé');
        }
      } else {
        // Rétablir les permissions
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
        // Retirer le slowmode
        if (channel.rateLimitPerUser !== undefined) {
          await channel.setRateLimitPerUser(0, 'Mode panique désactivé');
        }
      }
    }
    if (mode === 'on') {
      await interaction.reply({ content: `Mode panique activé : tous les salons sont verrouillés et un slowmode a été appliqué.`, allowedMentions: { users: [] } });
    } else {
      await interaction.reply({ content: `Mode panique désactivé : les salons ont retrouvé leurs permissions normales.`, allowedMentions: { users: [] } });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Erreur lors de la modification des salons.`, ephemeral: true });
  }
}