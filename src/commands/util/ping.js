import { SlashCommandBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Latence du bot et du WebSocket.');
async function run(interaction, client) {
  const ws = Math.round(client.ws.ping);
  const sent = await interaction.editReply({ content: 'Pong…' });
  const api = sent.createdTimestamp - interaction.createdTimestamp;
  return interaction.editReply(`🏓 API: ${api} ms | WS: ${ws} ms`);
}
export const execute = withGuard(run, { ephemeralByDefault: true, cooldownMs: 2000 });
