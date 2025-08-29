import { SlashCommandBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
import { readJSON, writeJSON } from '../../utils/jsonStore.js';
const FILE = 'src/data/config.json';
export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configurer Grook pour cette guilde')
  .addStringOption(o => o.setName('key').setDescription('ex: LINK_RISK_THRESHOLD').setRequired(true))
  .addStringOption(o => o.setName('value').setDescription('valeur').setRequired(true));
async function run(interaction) {
  const key = interaction.options.getString('key', true);
  const value = interaction.options.getString('value', true);
  const cfg = await readJSON(FILE, { guilds: {} });
  cfg.guilds[interaction.guildId] ||= {};
  cfg.guilds[interaction.guildId][key] = value;
  await writeJSON(FILE, cfg);
  return interaction.editReply(`✅ \`${key}\` = \`${value}\``);
}
export const execute = withGuard(run, { perms: ['ManageGuild'], ephemeralByDefault: true });
