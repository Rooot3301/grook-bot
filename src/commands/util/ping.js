import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Retourne Pong! + latence.');

export async function execute(interaction) {
  const sentAt = Date.now();
  await interaction.reply({ content: 'Pong!', ephemeral: true });
  const latency = Date.now() - sentAt;
  console.log(`[ping] replied in ~${latency}ms for ${interaction.user.tag}`);
}
