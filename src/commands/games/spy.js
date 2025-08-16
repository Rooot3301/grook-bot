import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { incrementWin } from '../../features/stats.js';

// Jeu Undercover (GrookSpy) : un joueur reçoit un mot différent et doit passer inaperçu.

const activeSpies = new Map();

export const data = new SlashCommandBuilder()
  .setName('grookspy')
  .setDescription('Lancer un jeu Undercover : trouvez l’espion.');

export async function execute(interaction, client) {
  const channelId = interaction.channel.id;
  if (activeSpies.has(channelId)) {
    return interaction.reply({ content: `Une partie d’Undercover est déjà en cours ici.`, ephemeral: true });
  }
  const joinId = `grookspy_join_${Date.now()}`;
  const state = {
    players: new Set(),
    joinId,
    stage: 'join',
    timer: null,
    words: { base: 'Pizza', undercover: 'Burger' },
    undercover: null,
    clues: new Map(),
    voteIdPrefix: null
  };
  activeSpies.set(channelId, state);
  // Envoyer message de participation
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(joinId).setLabel('Rejoindre').setStyle(ButtonStyle.Primary)
  );
  const embed = new EmbedBuilder()
    .setTitle('🕵️ GrookSpy (Undercover)')
    .setDescription('Cliquez sur **Rejoindre** pour participer. Début dans 30 secondes.')
    .setColor(0x8844ff);
  await interaction.reply({ embeds: [embed], components: [row] });
  // Handler d’inscription
  client.interactionHandlers.set(joinId, async (btn) => {
    const s = activeSpies.get(channelId);
    if (!s || s.stage !== 'join') return btn.reply({ content: `La partie a déjà commencé.`, ephemeral: true });
    s.players.add(btn.user.id);
    await btn.reply({ content: `Tu es inscrit à l’Undercover !`, ephemeral: true });
  });
  // Démarrer après 30s
  state.timer = setTimeout(() => startSpy(interaction, client, channelId), 30000);
}

async function startSpy(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state) return;
  state.stage = 'clue';
  // Choisir undercover au hasard
  const players = Array.from(state.players);
  if (players.length < 3) {
    activeSpies.delete(channelId);
    client.interactionHandlers.delete(state.joinId);
    return interaction.followUp({ content: `Pas assez de joueurs pour jouer à Undercover (minimum 3).`, allowedMentions: { users: [] } });
  }
  const undercover = players[Math.floor(Math.random() * players.length)];
  state.undercover = undercover;
  // Envoyer le mot à chacun en DM
  for (const id of players) {
    try {
      const user = await client.users.fetch(id);
      const word = id === undercover ? state.words.undercover : state.words.base;
      await user.send(`🎯 Ton mot est : **${word}**. Donne un indice (synonyme ou description) sans le révéler !`);
    } catch {
      // ignore DM failure
    }
  }
  // Fin inscription : retirer bouton
  try {
    await interaction.editReply({ components: [] });
  } catch {}
  await interaction.followUp({ content: `Les mots ont été distribués en DM. Chaque joueur doit maintenant donner un indice en **un mot** dans ce salon.`, allowedMentions: { users: players } });
  // Collecte des indices
  const filter = m => !m.author.bot && state.players.has(m.author.id) && !state.clues.has(m.author.id);
  const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
  collector.on('collect', m => {
    state.clues.set(m.author.id, m.content.trim());
    m.react('✅');
    // Si tout le monde a envoyé son indice
    if (state.clues.size === state.players.size) collector.stop('all');
  });
  collector.on('end', async () => {
    await launchVote(interaction, client, channelId);
  });
}

async function launchVote(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state) return;
  state.stage = 'vote';
  const players = Array.from(state.players);
  // Créer embed avec indices
  const embed = new EmbedBuilder()
    .setTitle('Vote : qui est l’Undercover ?')
    .setColor(0x8844ff);
  for (const id of players) {
    const clue = state.clues.get(id) || '(aucun indice)';
    embed.addFields({ name: interaction.guild.members.cache.get(id)?.user.tag || id, value: clue, inline: false });
  }
  // Créer boutons de vote
  const row = new ActionRowBuilder();
  const votePrefix = `grookspy_vote_${Date.now()}`;
  state.voteIdPrefix = votePrefix;
  for (const id of players) {
    row.addComponents(new ButtonBuilder().setCustomId(`${votePrefix}_${id}`).setLabel(interaction.guild.members.cache.get(id)?.user.username || id).setStyle(ButtonStyle.Secondary));
  }
  await interaction.followUp({ embeds: [embed], components: [row] });
  // Préparer votes
  state.votes = new Map();
  // Handler de votes
  for (const id of players) {
    const customId = `${votePrefix}_${id}`;
    client.interactionHandlers.set(customId, async (btn) => {
      const s = activeSpies.get(channelId);
      if (!s || s.stage !== 'vote') return btn.reply({ content: `Le vote est terminé.`, ephemeral: true });
      // chaque joueur ne peut voter qu'une fois
      if (!players.includes(btn.user.id)) return btn.reply({ content: `Tu ne participes pas à cette partie.`, ephemeral: true });
      if (s.votes.has(btn.user.id)) {
        return btn.reply({ content: `Tu as déjà voté.`, ephemeral: true });
      }
      s.votes.set(btn.user.id, id);
      await btn.reply({ content: `Ton vote pour <@${id}> a été pris en compte.`, ephemeral: true });
      // Si tout le monde a voté
      if (s.votes.size === players.length) {
        await concludeSpy(interaction, client, channelId);
      }
    });
  }
  // Fin du vote automatique après 30 secondes
  setTimeout(() => concludeSpy(interaction, client, channelId), 30000);
}

async function concludeSpy(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state || state.stage === 'ended') return;
  state.stage = 'ended';
  const players = Array.from(state.players);
  // Compter les votes
  const tally = {};
  for (const v of state.votes.values()) {
    tally[v] = (tally[v] || 0) + 1;
  }
  let votedOut = null;
  let maxVotes = 0;
  for (const id of players) {
    if ((tally[id] || 0) > maxVotes) {
      votedOut = id;
      maxVotes = tally[id];
    }
  }
  // Retirer handlers
  client.interactionHandlers.delete(state.joinId);
  if (state.voteIdPrefix) {
    for (const id of players) {
      client.interactionHandlers.delete(`${state.voteIdPrefix}_${id}`);
    }
  }
  let resultMsg;
  if (votedOut === state.undercover) {
    // Les citoyens gagnent
    for (const id of players) {
      if (id !== state.undercover) incrementWin(interaction.guild.id, id, 'spy');
    }
    resultMsg = `🔍 L’Undercover <@${state.undercover}> a été découvert ! Les citoyens remportent la partie.`;
  } else {
    // Undercover gagne
    incrementWin(interaction.guild.id, state.undercover, 'spy');
    resultMsg = `😈 L’Undercover <@${state.undercover}> a trompé tout le monde et remporte la partie ! (La cible éliminée était <@${votedOut}>)`;
  }
  await interaction.followUp({ content: resultMsg, allowedMentions: { users: players } });
  activeSpies.delete(channelId);
}