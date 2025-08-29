import { SlashCommandBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
import { stripMassMentions, clampLength } from '../../utils/inputFilters.js';

// Définition de la structure de commande
export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Répète un message en toute sécurité.')
  .addStringOption(o => o
    .setName('text')
    .setDescription('Message')
    .setRequired(true)
  );

// Fonction qui exécute la logique de /say
async function run(interaction) {
  const raw = interaction.options.getString('text', true);
  const safe = clampLength(stripMassMentions(raw), 1800);
  // Confirme la commande avec une réaction éphémère
  await interaction.editReply('✅');
  return interaction.channel.send(safe || '...');
}

// Préparation de la fonction protégée avec garde et cooldown
const _guarded = withGuard(run, {
  perms: ['ManageMessages'],
  ephemeralByDefault: true,
  cooldownMs: 1500
});

// Export de la fonction execute sous forme de fonction (pour passer le test)
export async function execute(interaction, client) {
  return _guarded(interaction, client);
}