import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
import { Colors } from '../../utils/theme.js';
import { localizeCommand } from '../../utils/i18n.js';

// Définition du constructeur de commande
let builder = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Liste les commandes disponibles.');
// Ajout des localisations pour le français et l’anglais
builder = localizeCommand(builder, {
  fr: { name: 'aide', description: 'Liste des commandes' },
  en: { name: 'help', description: 'List commands' }
});
// Export de la définition de commande
export const data = builder;

// Fonction métier exécutant la logique de /help
async function run(interaction, client) {
  const byCat = new Map();
  // Regroupement des commandes par catégorie
  for (const [name, cmd] of client.commands) {
    const cat = cmd.category || 'autres';
    const desc = cmd.data?.description || '—';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push({ name, desc });
  }
  // Création de l’embed
  const emb = new EmbedBuilder().setTitle('📖 Aide').setColor(Colors.info);
  for (const [cat, list] of byCat) {
    const lines = list.map((c, i) => `${i + 1}. \`/${c.name}\` — ${c.desc}`);
    emb.addFields({
      name: `• ${cat}`,
      value: (lines.join('\n').slice(0, 1024) || '—')
    });
  }
  return interaction.editReply({ embeds: [emb], ephemeral: true });
}

// Préparer la version protégée de run via le guard
const _guarded = withGuard(run, { ephemeralByDefault: true });

// Exporter la fonction execute selon la signature attendue par les tests
export async function execute(interaction, client) {
  return _guarded(interaction, client);
}