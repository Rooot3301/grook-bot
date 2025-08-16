import { SlashCommandBuilder } from 'discord.js';

// Pile ou face avec une chance de triche. 90 % des cas, Grook est honnête, sinon il surprend !
export const data = new SlashCommandBuilder()
  .setName('grookflip')
  .setDescription('Pile ou face (mais Grook peut tricher).');

export async function execute(interaction) {
  const roll = Math.random();
  let result;
  if (roll < 0.45) result = 'Pile';
  else if (roll < 0.9) result = 'Face';
  else result = 'La pièce est tombée sur la tranche !';
  await interaction.reply({ content: `🪙 Résultat : **${result}**`, allowedMentions: { users: [] } });
}