import { SlashCommandBuilder } from 'discord.js';

// Note de 0 à 10 un élément donné avec un commentaire sarcastique.
export const data = new SlashCommandBuilder()
  .setName('grookrate')
  .setDescription('Évaluer quelque chose de 0 à 10, avec le flair de Grook.')
  .addStringOption(o => o
    .setName('truc')
    .setDescription('Ce que tu veux que je note')
    .setRequired(true));

export async function execute(interaction) {
  const thing = interaction.options.getString('truc', true);
  const score = Math.floor(Math.random() * 11); // 0 à 10
  let comment;
  if (score === 0) comment = `Même un bug est plus utile que **${thing}**.`;
  else if (score <= 3) comment = `Ouch, **${thing}** mérite un ${score}/10… courage.`;
  else if (score <= 7) comment = `Pas mal, **${thing}** obtient ${score}/10.`;
  else if (score < 10) comment = `Wow ! **${thing}** vaut ${score}/10, impressionnant.`;
  else comment = `Parfait ! **${thing}** mérite un 10/10. Est-ce payé ?`;
  await interaction.reply({ content: comment, allowedMentions: { users: [] } });
}