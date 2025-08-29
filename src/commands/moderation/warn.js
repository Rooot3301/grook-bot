import { SlashCommandBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
import { readJSON, writeJSON } from '../../utils/jsonStore.js';
const FILE = 'src/data/warns.json';
export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Gérer les avertissements')
  .addSubcommand(s => s.setName('add')
    .setDescription('Avertir un membre')
    .addUserOption(o => o.setName('user').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Raison').setRequired(true)))
  .addSubcommand(s => s.setName('list')
    .setDescription('Lister les avertissements')
    .addUserOption(o => o.setName('user').setDescription('Membre')));
async function run(interaction) {
  const sub = interaction.options.getSubcommand(true);
  const guildId = interaction.guildId;
  if (sub === 'add') {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const db = await readJSON(FILE, {});
    db[guildId] ||= {};
    db[guildId][user.id] ||= [];
    db[guildId][user.id].push({ reason, by: interaction.user.id, at: Date.now() });
    await writeJSON(FILE, db);
    return interaction.editReply(`✅ Averti **${user.tag}** : *${reason}*`);
  }
  if (sub === 'list') {
    const user = interaction.options.getUser('user');
    const db = await readJSON(FILE, {});
    const entries = user ? (db[guildId]?.[user.id] || []) : [];
    if (entries.length === 0) return interaction.editReply('Aucun avertissement.');
    const lines = entries.slice(0, 10).map((e, i) => `#${i+1} ${user.tag} — ${e.reason} (${new Date(e.at).toLocaleString()})`);
    return interaction.editReply(lines.join('\n'));
  }
}
export const execute = withGuard(run, { perms: ['ModerateMembers'], ephemeralByDefault: true, cooldownMs: 1500 });
