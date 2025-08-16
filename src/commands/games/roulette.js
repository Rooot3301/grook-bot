import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { incrementWin } from '../../features/stats.js';

// Carte mémoire pour stocker les parties en cours par salon
const activeGames = new Map();

export const data = new SlashCommandBuilder()
  .setName('grookroulette')
  .setDescription('Lancer une partie de roulette russe (risk game).');

export async function execute(interaction, client) {
  const channelId = interaction.channel.id;
  if (activeGames.has(channelId)) {
    return interaction.reply({ content: `Une partie de roulette est déjà en cours dans ce salon.`, ephemeral: true });
  }
  // Créer l'état de la partie
  const joinId = `grookroulette_join_${Date.now()}`;
  const state = {
    players: new Set(),
    joinId,
    started: false,
    timeout: null
  };
  activeGames.set(channelId, state);
  // Bouton de participation
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(joinId)
      .setLabel('Participer')
      .setStyle(ButtonStyle.Primary)
  );
  const embed = new EmbedBuilder()
    .setTitle('💥 GrookRoulette')
    .setDescription('Cliquez sur **Participer** pour rejoindre la partie. Début dans 20 secondes !')
    .setColor(0xff0000);
  await interaction.reply({ embeds: [embed], components: [row] });
  // Handler pour le bouton
  client.interactionHandlers.set(joinId, async (btnInteraction) => {
    const s = activeGames.get(channelId);
    if (!s || s.started) {
      return btnInteraction.reply({ content: `La partie a déjà commencé ou est terminée.`, ephemeral: true });
    }
    s.players.add(btnInteraction.user.id);
    await btnInteraction.reply({ content: `Tu as rejoint la roulette, bonne chance !`, ephemeral: true });
  });
  // Démarre la partie après 20 secondes
  state.timeout = setTimeout(() => startGame(interaction, client, channelId), 20000);
}

async function startGame(interaction, client, channelId) {
  const state = activeGames.get(channelId);
  if (!state) return;
  state.started = true;
  // Récupérer les joueurs; si moins de 2 joueurs, annuler
  const players = Array.from(state.players);
  if (players.length < 2) {
    activeGames.delete(channelId);
    client.interactionHandlers.delete(state.joinId);
    return interaction.followUp({ content: `Pas assez de joueurs ont rejoint la roulette. Partie annulée.`, allowedMentions: { users: [] } });
  }
  // Désactive le bouton de participation
  try {
    await interaction.editReply({ components: [] });
  } catch {}
  let remaining = players.slice();
  await interaction.followUp({ content: `La partie commence avec ${remaining.length} joueurs : ${remaining.map(id => `<@${id}>`).join(', ')}`, allowedMentions: { users: remaining } });
  while (remaining.length > 1) {
    // Attendre une seconde entre les éliminations
    // eslint-disable-next-line no-await-in-loop
    await new Promise(res => setTimeout(res, 2000));
    // Choisir un joueur au hasard à éliminer
    const index = Math.floor(Math.random() * remaining.length);
    const eliminated = remaining.splice(index, 1)[0];
    // Annonce
    // eslint-disable-next-line no-await-in-loop
    await interaction.followUp({ content: `🔫 <@${eliminated}> a tiré… **BOOM 💥** !`, allowedMentions: { users: [eliminated] } });
  }
  const winner = remaining[0];
  // Enregistrer la victoire
  incrementWin(interaction.guild.id, winner, 'roulette');
  await interaction.followUp({ content: `🎉 <@${winner}> survit et remporte la roulette !`, allowedMentions: { users: [winner] } });
  // Nettoyage
  activeGames.delete(channelId);
  client.interactionHandlers.delete(state.joinId);
}