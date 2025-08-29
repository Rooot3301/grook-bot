import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { withGuard } from '../../utils/commandGuard.js';
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Liste les commandes disponibles.');
async function run(interaction, client) {
  const byCat = new Map();
  for (const [name, cmd] of client.commands) {
    const cat = cmd.category || 'autres';
    const desc = cmd.data?.description || '—';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push({ name, desc });
  }
  const embed = new EmbedBuilder().setTitle('📖 Aide').setColor(0x5865F2);
  for (const [cat, list] of byCat) {
    const chunk = list.map(c => `\`/${c.name}\` — ${c.desc}`).join('\n').slice(0, 1024) || '—';
    embed.addFields({ name: `• ${cat}`, value: chunk });
  }
  return interaction.editReply({ embeds: [embed], ephemeral: true });
}
export const execute = withGuard(run, { ephemeralByDefault: true });
