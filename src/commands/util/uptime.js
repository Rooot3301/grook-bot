import { SlashCommandBuilder, time } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
export const data = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('Durée depuis le dernier démarrage.');
async function run(interaction) {
  const started = Math.floor((Date.now() - process.uptime()*1000)/1000);
  return interaction.editReply(`⏱️ Démarré ${time(started, 'R')}`);
}
export const execute = withGuard(run, { ephemeralByDefault: true });
