import { SlashCommandBuilder } from 'discord.js';
import { incrementWin } from '../../features/stats.js';

// Jeu de devinettes : Grook pense à un nombre entre 1 et 100.
export const data = new SlashCommandBuilder()
  .setName('grookguess')
  .setDescription('Devinez le nombre auquel pense Grook (avec un soupçon de mensonge).');

export async function execute(interaction) {
  const target = Math.floor(Math.random() * 100) + 1;
  await interaction.reply({ content: `🔢 Je pense à un nombre entre 1 et 100… devinez ! Vous avez 60 secondes.`, allowedMentions: { users: [] } });
  let found = false;
  const collector = interaction.channel.createMessageCollector({ filter: m => !m.author.bot, time: 60000 });
  collector.on('collect', msg => {
    const guess = parseInt(msg.content.trim(), 10);
    if (Number.isNaN(guess)) return;
    // Vérifier la réponse
    if (guess === target) {
      found = true;
      incrementWin(interaction.guild.id, msg.author.id, 'guess');
      msg.reply({ content: `🎉 Bravo ${msg.author}, le nombre était bien ${target} !`, allowedMentions: { users: [msg.author.id] } });
      collector.stop('found');
    } else {
      // Réponse plus haut/bas avec chance de mentir
      const truthful = Math.random() > 0.1; // 90 % de sincérité
      let hint;
      if (truthful) {
        hint = guess < target ? 'Plus haut !' : 'Plus bas !';
      } else {
        hint = guess < target ? 'Plus bas !' : 'Plus haut !';
      }
      msg.reply({ content: hint, allowedMentions: { users: [msg.author.id] } });
    }
  });
  collector.on('end', (_, reason) => {
    if (!found) {
      interaction.followUp({ content: `⏱️ Fin du temps ! Le nombre était ${target}.`, allowedMentions: { users: [] } });
    }
  });
}