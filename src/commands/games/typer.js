import { SlashCommandBuilder } from 'discord.js';
import { incrementWin } from '../../features/stats.js';

// Jeu de vitesse de frappe : le premier à retaper la phrase gagne.
export const data = new SlashCommandBuilder()
  .setName('grooktyper')
  .setDescription('Testez votre vitesse de frappe contre les autres.');

const phrases = [
  'La vie est un jeu, et Grook triche.',
  'Un canard en plastique peut te sauver la vie.',
  'Javascript est parfois bizarre.',
  'Never gonna give you up, never gonna let you down.',
  'Grook regarde vos DM en secret (ou pas).'
];

export async function execute(interaction) {
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  await interaction.reply({ content: `⌨️ Premier à écrire exactement :
\n> ${phrase}
\na 30 secondes pour gagner !`, allowedMentions: { users: [] } });
  const filter = msg => !msg.author.bot && msg.content.trim() === phrase;
  try {
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const winnerMsg = collected.first();
    incrementWin(interaction.guild.id, winnerMsg.author.id, 'typer');
    await interaction.followUp({ content: `🎉 Bravo ${winnerMsg.author}, tu as gagné !`, allowedMentions: { users: [winnerMsg.author.id] } });
  } catch {
    await interaction.followUp({ content: `Personne n'a réussi à taper la phrase à temps.`, allowedMentions: { users: [] } });
  }
}