import { SlashCommandBuilder } from 'discord.js';

// Donne une prédiction aléatoire façon cookie chinois pour un membre.
export const data = new SlashCommandBuilder()
  .setName('grookfortune')
  .setDescription('Recevoir une prédiction (troll) façon cookie chinois.')
  .addUserOption(o => o
    .setName('user')
    .setDescription('Membre ciblé (optionnel)')
    .setRequired(false));

const fortunes = [
  '{user}, évite les liens suspects aujourd’hui… ou pas.',
  '{user}, un grand destin t’attend… dans un jeu vidéo.',
  'Le sort est jeté : {user} deviendra modérateur malgré lui.',
  '{user}, tu vas recevoir un message mystérieux bientôt.',
  '{user}, tes talents seront enfin reconnus (par moi).',
  '{user}, quelqu’un va te poser une question étrange.',
  '{user}, attention aux canards en plastique géants.',
  '{user}, tu découvriras un easter egg par hasard.',
  'Aujourd’hui, {user} aura 42 comme réponse à tout.',
  '{user}, un ban inattendu t’évitera un fiasco.'
];

export async function execute(interaction) {
  const target = interaction.options.getUser('user') || interaction.user;
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)].replace('{user}', `<@${target.id}>`);
  await interaction.reply({ content: `🔮 ${fortune}`, allowedMentions: { users: [target.id] } });
}