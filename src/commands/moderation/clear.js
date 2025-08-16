import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Supprime un nombre de messages du salon courant.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(o => o.setName('nombre').setDescription('Nombre de messages à supprimer (1‑100)').setRequired(true));

export async function execute(interaction) {
  const amount = interaction.options.getInteger('nombre', true);
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de gérer les messages.`, ephemeral: true });
  }
  if (amount < 1 || amount > 100) {
    return interaction.reply({ content: `Vous devez spécifier entre 1 et 100 messages.`, ephemeral: true });
  }
  try {
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `✅ ${deleted.size} messages supprimés.`, ephemeral: true });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Impossible de supprimer les messages : ${error}`, ephemeral: true });
  }
}