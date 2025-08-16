import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { incrementWin } from '../../features/stats.js';

// Mini‑jeu « Deux vérités, un mensonge ». L'hôte fournit trois affirmations
// via un modal, en précisant laquelle est fausse. Les autres joueurs doivent
// voter pour identifier la fausse affirmation. Les gagnants (ceux qui votent
// pour la bonne affirmation) voient leurs statistiques incrémentées.

const activeLiars = new Map();

export const data = new SlashCommandBuilder()
  .setName('liar')
  .setDescription('Lancer un jeu Deux vérités, un mensonge.');

export async function execute(interaction, client) {
  const channelId = interaction.channel.id;
  // Vérifier qu'il n'y a pas déjà une partie en cours
  if (activeLiars.has(channelId)) {
    return interaction.reply({ content: 'Une partie de Deux vérités, un mensonge est déjà en cours dans ce salon.', ephemeral: true });
  }
  // Créer un identifiant unique pour le modal
  const modalId = `liar_modal_${Date.now()}`;
  // Préparer l'état du jeu
  const state = {
    hostId: interaction.user.id,
    statements: [],
    lieIndex: null,
    votePrefix: null,
    votes: new Map(),
    messageId: null
  };
  activeLiars.set(channelId, state);
  // Construire le modal avec trois champs de texte et un champ pour indiquer la fausse affirmation
  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle('Deux vérités, un mensonge');
  const q1 = new TextInputBuilder()
    .setCustomId('statement1')
    .setLabel('Affirmation 1')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);
  const q2 = new TextInputBuilder()
    .setCustomId('statement2')
    .setLabel('Affirmation 2')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);
  const q3 = new TextInputBuilder()
    .setCustomId('statement3')
    .setLabel('Affirmation 3')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);
  const liarField = new TextInputBuilder()
    .setCustomId('lieIndex')
    .setLabel('Numéro de la fausse affirmation (1, 2 ou 3)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(1);
  modal.addComponents(
    new ActionRowBuilder().addComponents(q1),
    new ActionRowBuilder().addComponents(q2),
    new ActionRowBuilder().addComponents(q3),
    new ActionRowBuilder().addComponents(liarField)
  );
  // Enregistrer le handler pour le modal
  client.interactionHandlers.set(modalId, async (submit) => {
    // S'assurer que c'est l'hôte qui répond
    if (submit.user.id !== state.hostId) {
      return submit.reply({ content: 'Seul l’organisateur peut envoyer les affirmations.', ephemeral: true });
    }
    const s1 = submit.fields.getTextInputValue('statement1').trim();
    const s2 = submit.fields.getTextInputValue('statement2').trim();
    const s3 = submit.fields.getTextInputValue('statement3').trim();
    let idx = parseInt(submit.fields.getTextInputValue('lieIndex').trim(), 10);
    if (isNaN(idx) || idx < 1 || idx > 3) {
      // Si l'index est invalide, choisir au hasard
      idx = Math.floor(Math.random() * 3) + 1;
    }
    // Stocker les données
    state.statements = [s1, s2, s3];
    state.lieIndex = idx - 1; // convertir en 0‑based
    // Supprimer le handler modal pour éviter des appels multiples
    client.interactionHandlers.delete(modalId);
    // Construire l’embed de vote
    const embed = new EmbedBuilder()
      .setTitle('Deux vérités, un mensonge')
      .setDescription('Votez pour l’affirmation que vous pensez fausse.')
      .setColor(0x00bfae);
    const labels = ['A', 'B', 'C'];
    for (let i = 0; i < 3; i++) {
      embed.addFields({ name: `${labels[i]} — ${state.statements[i]}`, value: '\u200B' });
    }
    // Créer les boutons de vote
    const votePrefix = `liar_vote_${Date.now()}`;
    state.votePrefix = votePrefix;
    const row = new ActionRowBuilder();
    for (let i = 0; i < 3; i++) {
      row.addComponents(new ButtonBuilder()
        .setCustomId(`${votePrefix}_${i}`)
        .setLabel(labels[i])
        .setStyle(ButtonStyle.Secondary));
    }
    // Envoyer le message de vote
    const sent = await submit.reply({ embeds: [embed], components: [row], fetchReply: true });
    state.messageId = sent.id;
    // Handler des votes
    for (let i = 0; i < 3; i++) {
      const buttonId = `${votePrefix}_${i}`;
      client.interactionHandlers.set(buttonId, async (btn) => {
        const st = activeLiars.get(channelId);
        if (!st || st.messageId !== sent.id) return btn.reply({ content: 'Le vote est terminé ou invalide.', ephemeral: true });
        // On empêche l’organisateur de voter
        if (btn.user.id === st.hostId) return btn.reply({ content: 'L’organisateur ne participe pas au vote.', ephemeral: true });
        // Un seul vote par utilisateur
        if (st.votes.has(btn.user.id)) {
          return btn.reply({ content: 'Tu as déjà voté.', ephemeral: true });
        }
        st.votes.set(btn.user.id, i);
        await btn.reply({ content: `Ton vote pour l’affirmation ${labels[i]} a été enregistré.`, ephemeral: true });
      });
    }
    // Fin du vote après 45 secondes
    setTimeout(() => concludeLiar(submit, client, channelId), 45000);
  });
  // Afficher le modal à l'hôte
  await interaction.showModal(modal);
}

async function concludeLiar(interaction, client, channelId) {
  const state = activeLiars.get(channelId);
  if (!state) return;
  // Marquer la partie comme terminée pour éviter de nouvelles interactions
  activeLiars.delete(channelId);
  // Nettoyer les handlers de vote
  if (state.votePrefix) {
    for (let i = 0; i < 3; i++) {
      client.interactionHandlers.delete(`${state.votePrefix}_${i}`);
    }
  }
  // Compter les votes
  const winners = [];
  const losers = [];
  for (const [userId, choice] of state.votes.entries()) {
    if (choice === state.lieIndex) {
      winners.push(userId);
    } else {
      losers.push(userId);
    }
  }
  // Incrémenter les victoires des gagnants
  for (const id of winners) {
    incrementWin(interaction.guild.id, id, 'liar');
  }
  // Préparer le message final
  const falseStatement = state.statements[state.lieIndex];
  const embed = new EmbedBuilder()
    .setTitle('Résultat : Deux vérités, un mensonge')
    .setColor(0x00bfae)
    .setDescription(`La fausse affirmation était : **${falseStatement}**`);
  if (winners.length > 0) {
    embed.addFields({ name: 'Gagnants', value: winners.map(id => `<@${id}>`).join(', '), inline: true });
  } else {
    embed.addFields({ name: 'Gagnants', value: 'Personne n’a trouvé la fausse affirmation.', inline: true });
  }
  if (losers.length > 0) {
    embed.addFields({ name: 'Perdants', value: losers.map(id => `<@${id}>`).join(', '), inline: true });
  }
  // Envoyer le message final dans le salon
  await interaction.followUp({ embeds: [embed] });
}