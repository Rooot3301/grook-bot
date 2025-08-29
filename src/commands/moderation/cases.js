import { SlashCommandBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
import { readJSON } from '../../utils/jsonStore.js';
import { paginate } from '../../utils/pagination.js';

const FILE = 'src/data/cases.json';

// Définition de la commande
export const data = new SlashCommandBuilder()
  .setName('cases')
  .setDescription('Consulter les cas modération')
  .addUserOption(o => o.setName('user').setDescription('Membre'));

// Fonction qui récupère et affiche les cas modération
async function run(interaction) {
  const user = interaction.options.getUser('user');
  const guildId = interaction.guildId;
  const db = await readJSON(FILE, {});
  const entries = user ? (db[guildId]?.[user.id] || []) : [];
  const lines = entries.map((e, i) => `#${i + 1} — ${e.type ?? 'case'} — ${e.reason ?? '—'} (${new Date(e.at ?? Date.now()).toLocaleString()})`);
  if (lines.length === 0) return interaction.editReply('Aucun cas.');
  return paginate(interaction, { title: `Cases de ${user.tag}`, lines, perPage: 10 });
}

// Préparer la fonction avec garde
const _guarded = withGuard(run, { perms: ['ModerateMembers'], ephemeralByDefault: true });

// Exporter la fonction execute sous forme attendue
export async function execute(interaction, client) {
  return _guarded(interaction, client);
}