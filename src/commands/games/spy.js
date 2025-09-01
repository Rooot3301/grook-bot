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

/**
 * 🕵️ GrookSpy - Le vrai jeu Undercover
 * 
 * VRAIES RÈGLES:
 * - Tous les joueurs ont le MÊME mot... sauf UN qui a un mot SIMILAIRE
 * - Chacun donne des indices sur SON mot sans le révéler
 * - Le but: identifier qui a le mot différent
 * - L'undercover gagne s'il survit, les citoyens gagnent s'ils l'éliminent
 */

// 🎯 Banque de mots PREMIUM - Paires soigneusement équilibrées
const WORD_PAIRS = [
  // 🍕 Nourriture - Niveau facile
  { citizen: 'Pizza', undercover: 'Quiche', difficulty: 'facile' },
  { citizen: 'Hamburger', undercover: 'Sandwich', difficulty: 'facile' },
  { citizen: 'Sushi', undercover: 'Sashimi', difficulty: 'moyen' },
  { citizen: 'Croissant', undercover: 'Pain au chocolat', difficulty: 'difficile' },
  { citizen: 'Crêpe', undercover: 'Gaufre', difficulty: 'moyen' },
  { citizen: 'Chocolat', undercover: 'Nutella', difficulty: 'moyen' },
  { citizen: 'Café', undercover: 'Thé', difficulty: 'facile' },
  { citizen: 'Bière', undercover: 'Cidre', difficulty: 'moyen' },
  { citizen: 'Fromage', undercover: 'Beurre', difficulty: 'moyen' },
  { citizen: 'Salade', undercover: 'Soupe', difficulty: 'facile' },

  // 🐾 Animaux - Niveau varié
  { citizen: 'Chat', undercover: 'Lynx', difficulty: 'moyen' },
  { citizen: 'Chien', undercover: 'Loup', difficulty: 'facile' },
  { citizen: 'Poisson', undercover: 'Dauphin', difficulty: 'moyen' },
  { citizen: 'Oiseau', undercover: 'Chauve-souris', difficulty: 'difficile' },
  { citizen: 'Serpent', undercover: 'Anguille', difficulty: 'difficile' },
  { citizen: 'Éléphant', undercover: 'Hippopotame', difficulty: 'moyen' },
  { citizen: 'Tigre', undercover: 'Léopard', difficulty: 'difficile' },
  { citizen: 'Requin', undercover: 'Baleine', difficulty: 'moyen' },
  { citizen: 'Papillon', undercover: 'Libellule', difficulty: 'difficile' },
  { citizen: 'Araignée', undercover: 'Scorpion', difficulty: 'moyen' },

  // 🚗 Transport - Niveau varié
  { citizen: 'Voiture', undercover: 'Camion', difficulty: 'facile' },
  { citizen: 'Vélo', undercover: 'Trottinette', difficulty: 'moyen' },
  { citizen: 'Avion', undercover: 'Hélicoptère', difficulty: 'moyen' },
  { citizen: 'Bateau', undercover: 'Sous-marin', difficulty: 'moyen' },
  { citizen: 'Train', undercover: 'Métro', difficulty: 'difficile' },
  { citizen: 'Moto', undercover: 'Scooter', difficulty: 'difficile' },

  // 🏠 Objets du quotidien
  { citizen: 'Téléphone', undercover: 'Tablette', difficulty: 'moyen' },
  { citizen: 'Livre', undercover: 'Magazine', difficulty: 'moyen' },
  { citizen: 'Chaise', undercover: 'Fauteuil', difficulty: 'facile' },
  { citizen: 'Lit', undercover: 'Canapé', difficulty: 'moyen' },
  { citizen: 'Montre', undercover: 'Bracelet', difficulty: 'difficile' },
  { citizen: 'Miroir', undercover: 'Fenêtre', difficulty: 'difficile' },
  { citizen: 'Lampe', undercover: 'Bougie', difficulty: 'moyen' },
  { citizen: 'Clé', undercover: 'Cadenas', difficulty: 'difficile' },

  // 👔 Métiers
  { citizen: 'Médecin', undercover: 'Vétérinaire', difficulty: 'moyen' },
  { citizen: 'Professeur', undercover: 'Formateur', difficulty: 'difficile' },
  { citizen: 'Policier', undercover: 'Garde', difficulty: 'moyen' },
  { citizen: 'Cuisinier', undercover: 'Pâtissier', difficulty: 'moyen' },
  { citizen: 'Pilote', undercover: 'Capitaine', difficulty: 'difficile' },
  { citizen: 'Avocat', undercover: 'Juge', difficulty: 'moyen' },
  { citizen: 'Architecte', undercover: 'Ingénieur', difficulty: 'difficile' },

  // ⚽ Sports & Loisirs
  { citizen: 'Football', undercover: 'Rugby', difficulty: 'facile' },
  { citizen: 'Tennis', undercover: 'Ping-pong', difficulty: 'moyen' },
  { citizen: 'Natation', undercover: 'Plongée', difficulty: 'moyen' },
  { citizen: 'Cinéma', undercover: 'Théâtre', difficulty: 'moyen' },
  { citizen: 'Musique', undercover: 'Chant', difficulty: 'difficile' },
  { citizen: 'Danse', undercover: 'Gymnastique', difficulty: 'moyen' },
  { citizen: 'Échecs', undercover: 'Dames', difficulty: 'difficile' },

  // 🌍 Lieux
  { citizen: 'Plage', undercover: 'Lac', difficulty: 'moyen' },
  { citizen: 'Montagne', undercover: 'Volcan', difficulty: 'moyen' },
  { citizen: 'Forêt', undercover: 'Jungle', difficulty: 'difficile' },
  { citizen: 'Ville', undercover: 'Métropole', difficulty: 'difficile' },
  { citizen: 'Maison', undercover: 'Villa', difficulty: 'moyen' },
  { citizen: 'École', undercover: 'Université', difficulty: 'moyen' },
  { citizen: 'Hôpital', undercover: 'Clinique', difficulty: 'difficile' },

  // 💻 Technologie
  { citizen: 'Ordinateur', undercover: 'Console', difficulty: 'moyen' },
  { citizen: 'Internet', undercover: 'Wifi', difficulty: 'difficile' },
  { citizen: 'Jeu vidéo', undercover: 'Application', difficulty: 'moyen' },
  { citizen: 'Robot', undercover: 'Cyborg', difficulty: 'difficile' },
  { citizen: 'Email', undercover: 'SMS', difficulty: 'moyen' },

  // 👕 Vêtements
  { citizen: 'Pantalon', undercover: 'Short', difficulty: 'facile' },
  { citizen: 'Chemise', undercover: 'Polo', difficulty: 'moyen' },
  { citizen: 'Chaussures', undercover: 'Sandales', difficulty: 'moyen' },
  { citizen: 'Chapeau', undercover: 'Béret', difficulty: 'difficile' },
  { citizen: 'Manteau', undercover: 'Veste', difficulty: 'moyen' },

  // 🎨 Couleurs & Formes
  { citizen: 'Rouge', undercover: 'Bordeaux', difficulty: 'difficile' },
  { citizen: 'Bleu', undercover: 'Turquoise', difficulty: 'moyen' },
  { citizen: 'Carré', undercover: 'Losange', difficulty: 'moyen' },
  { citizen: 'Cercle', undercover: 'Ellipse', difficulty: 'difficile' },

  // 💭 Émotions & Concepts
  { citizen: 'Bonheur', undercover: 'Euphorie', difficulty: 'difficile' },
  { citizen: 'Peur', undercover: 'Terreur', difficulty: 'moyen' },
  { citizen: 'Amour', undercover: 'Passion', difficulty: 'difficile' },
  { citizen: 'Rêve', undercover: 'Fantasme', difficulty: 'difficile' },
  { citizen: 'Liberté', undercover: 'Indépendance', difficulty: 'difficile' },

  // 🌤️ Saisons & Temps
  { citizen: 'Été', undercover: 'Canicule', difficulty: 'moyen' },
  { citizen: 'Hiver', undercover: 'Blizzard', difficulty: 'moyen' },
  { citizen: 'Jour', undercover: 'Aube', difficulty: 'difficile' },
  { citizen: 'Nuit', undercover: 'Crépuscule', difficulty: 'difficile' },

  // 🎵 Arts & Culture
  { citizen: 'Peinture', undercover: 'Dessin', difficulty: 'moyen' },
  { citizen: 'Sculpture', undercover: 'Statue', difficulty: 'difficile' },
  { citizen: 'Roman', undercover: 'Nouvelle', difficulty: 'difficile' },
  { citizen: 'Opéra', undercover: 'Comédie musicale', difficulty: 'difficile' },

  // 🔬 Sciences
  { citizen: 'Chimie', undercover: 'Physique', difficulty: 'moyen' },
  { citizen: 'Biologie', undercover: 'Anatomie', difficulty: 'difficile' },
  { citizen: 'Mathématiques', undercover: 'Géométrie', difficulty: 'difficile' },
  { citizen: 'Astronomie', undercover: 'Astrologie', difficulty: 'difficile' }
];

const activeSpies = new Map();

export const data = new SlashCommandBuilder()
  .setName('grookspy')
  .setDescription('🕵️ Jeu Undercover premium : qui a le mot différent ?');

export async function execute(interaction, client) {
  const channelId = interaction.channel.id;
  
  if (activeSpies.has(channelId)) {
    return interaction.reply({ 
      content: `🕵️ Une partie d'Undercover est déjà en cours dans ce salon.`, 
      ephemeral: true 
    });
  }

  // Sélection intelligente des mots selon la difficulté
  const difficulties = ['facile', 'moyen', 'difficile'];
  const selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const wordsOfDifficulty = WORD_PAIRS.filter(pair => pair.difficulty === selectedDifficulty);
  const wordPair = wordsOfDifficulty[Math.floor(Math.random() * wordsOfDifficulty.length)];

  const joinId = `grookspy_join_${Date.now()}`;
  
  const state = {
    players: new Set(),
    joinId,
    stage: 'join',
    timer: null,
    words: wordPair,
    undercover: null,
    clues: new Map(),
    voteIdPrefix: null,
    votes: new Map(),
    difficulty: selectedDifficulty,
    startTime: Date.now()
  };
  
  activeSpies.set(channelId, state);

  // 🎨 Interface premium avec règles intégrées
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(joinId)
      .setLabel('🕵️ Rejoindre la partie')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎯')
  );

  const rulesEmbed = new EmbedBuilder()
    .setTitle('🕵️ GrookSpy - Undercover Premium')
    .setDescription(`
**🎯 PRINCIPE DU JEU**
Tous les joueurs ont le **même mot**... sauf UN qui a un **mot similaire** !

**📋 DÉROULEMENT**
1️⃣ Chacun reçoit son mot en privé
2️⃣ Donnez des **indices** sur votre mot (sans le dire !)
3️⃣ Votez pour éliminer l'**undercover**
4️⃣ L'undercover gagne s'il survit !

**🎲 Difficulté :** \`${selectedDifficulty.toUpperCase()}\`
**⏱️ Temps limite :** 30 secondes pour rejoindre
**👥 Joueurs requis :** 3 minimum, 8 maximum
    `)
    .setColor(0x9146FF)
    .addFields(
      {
        name: '🎯 Conseils pour les CITOYENS',
        value: '• Donnez des indices **précis** mais pas évidents\n• Observez qui donne des indices **vagues**\n• Coordonnez-vous discrètement',
        inline: true
      },
      {
        name: '🎭 Conseils pour l\'UNDERCOVER',
        value: '• Restez **cohérent** avec les autres\n• Ni trop précis, ni trop vague\n• Adaptez-vous aux indices des autres',
        inline: true
      }
    )
    .setFooter({ 
      text: '🏆 Créé par Root3301 • Cliquez pour rejoindre !', 
      iconURL: client.user?.displayAvatarURL() 
    })
    .setTimestamp();

  await interaction.reply({ embeds: [rulesEmbed], components: [row] });

  // 🎮 Handler d'inscription avec validation
  client.interactionHandlers.set(joinId, async (btn) => {
    const s = activeSpies.get(channelId);
    if (!s || s.stage !== 'join') {
      return btn.reply({ 
        content: `⏰ La partie a déjà commencé ou est terminée.`, 
        ephemeral: true 
      });
    }
    
    if (s.players.has(btn.user.id)) {
      return btn.reply({ 
        content: `✅ Tu es déjà inscrit dans cette partie !`, 
        ephemeral: true 
      });
    }

    if (s.players.size >= 8) {
      return btn.reply({ 
        content: `🚫 Partie complète ! (8 joueurs maximum)`, 
        ephemeral: true 
      });
    }
    
    s.players.add(btn.user.id);
    const playerCount = s.players.size;
    
    await btn.reply({ 
      content: `🎯 **Inscription confirmée !** (${playerCount}/8 joueurs)\n${playerCount >= 3 ? '✅ Prêt à démarrer !' : `⏳ ${3 - playerCount} joueur(s) manquant(s)`}`, 
      ephemeral: true 
    });

    // Auto-start si 8 joueurs
    if (playerCount === 8) {
      clearTimeout(s.timer);
      setTimeout(() => startSpy(interaction, client, channelId), 2000);
    }
  });

  // ⏰ Démarrage automatique après 30s
  state.timer = setTimeout(() => startSpy(interaction, client, channelId), 30000);
}

async function startSpy(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state) return;

  state.stage = 'clue';
  const players = Array.from(state.players);
  
  if (players.length < 3) {
    cleanup(client, channelId, state);
    return interaction.followUp({ 
      content: `❌ **Partie annulée** - Pas assez de joueurs (minimum 3)`, 
      allowedMentions: { users: [] } 
    });
  }

  // 🎲 Sélection aléatoire de l'undercover
  const undercover = players[Math.floor(Math.random() * players.length)];
  state.undercover = undercover;

  // 📨 Envoi des mots en DM avec interface premium
  const dmPromises = players.map(async (id) => {
    try {
      const user = await client.users.fetch(id);
      const isUndercover = id === undercover;
      const word = isUndercover ? state.words.undercover : state.words.citizen;
      
      const dmEmbed = new EmbedBuilder()
        .setTitle(isUndercover ? '🎭 TU ES L\'UNDERCOVER !' : '🛡️ TU ES UN CITOYEN')
        .setDescription(`**🎯 Ton mot secret :** \`${word}\``)
        .setColor(isUndercover ? 0xFF4444 : 0x44FF88)
        .addFields({
          name: isUndercover ? '🎭 Ta mission d\'infiltration' : '🔍 Ta mission de détection',
          value: isUndercover 
            ? `• Fais-toi passer pour un citoyen\n• Donne des indices qui marchent pour **les deux mots**\n• Survie = Victoire !`
            : `• Trouve l'undercover parmi vous\n• Donne des indices **précis** sur "${word}"\n• Éliminez l'imposteur !`
        })
        .setFooter({ 
          text: `Difficulté: ${state.difficulty} • Bonne chance !`,
          iconURL: user.displayAvatarURL()
        })
        .setTimestamp();
        
      await user.send({ embeds: [dmEmbed] });
      return { success: true, userId: id };
    } catch (error) {
      console.warn(`❌ DM impossible pour ${id}:`, error.message);
      return { success: false, userId: id };
    }
  });

  const dmResults = await Promise.allSettled(dmPromises);
  const failedDMs = dmResults
    .filter(result => result.status === 'fulfilled' && !result.value.success)
    .map(result => result.value.userId);

  // 🎬 Retirer le bouton et annoncer le début
  try {
    await interaction.editReply({ components: [] });
  } catch {}

  const startEmbed = new EmbedBuilder()
    .setTitle('🎬 LA PARTIE COMMENCE !')
    .setDescription(`
**👥 ${players.length} joueurs** en lice
**🎲 Difficulté :** \`${state.difficulty.toUpperCase()}\`
**⏱️ Phase :** Indices (90 secondes)

${failedDMs.length > 0 ? `⚠️ **Attention :** ${failedDMs.length} joueur(s) n'ont pas reçu leur mot en DM` : '✅ Tous les mots ont été distribués'}

**🎯 À vous de jouer !** Donnez chacun **UN indice** sur votre mot dans ce salon.
*Soyez subtils mais pas trop vagues...*
    `)
    .setColor(0x9146FF)
    .addFields({
      name: '📋 Règles des indices',
      value: '• **1 indice par joueur** maximum\n• **Pas le mot exact** ou synonyme direct\n• **Soyez créatifs** mais cohérents',
      inline: false
    })
    .setFooter({ text: '🕵️ Que le meilleur espion gagne !' })
    .setTimestamp();

  await interaction.followUp({ 
    embeds: [startEmbed], 
    content: players.map(id => `<@${id}>`).join(' '),
    allowedMentions: { users: players } 
  });

  // 🎯 Lancement de la collecte d'indices
  collectClues(interaction, client, channelId);
}

function collectClues(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state) return;

  // 🎯 Filtre intelligent pour les indices
  const filter = m => {
    if (m.author.bot) return false;
    if (!state.players.has(m.author.id)) return false;
    if (state.clues.has(m.author.id)) return false;
    
    const content = m.content.trim();
    if (content.length < 2 || content.length > 150) return false;
    
    // Vérifier que ce n'est pas le mot exact
    const citizenWord = state.words.citizen.toLowerCase();
    const undercoverWord = state.words.undercover.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes(citizenWord) || lowerContent.includes(undercoverWord)) {
      m.reply('🚫 Tu ne peux pas utiliser le mot exact ou ses variantes !').catch(() => {});
      return false;
    }
    
    return true;
  };

  const collector = interaction.channel.createMessageCollector({ 
    filter, 
    time: 90000 // 90 secondes
  });

  collector.on('collect', async (m) => {
    const clue = m.content.trim().slice(0, 150);
    state.clues.set(m.author.id, clue);
    
    try {
      await m.react('✅');
    } catch {}

    const remaining = state.players.size - state.clues.size;
    
    if (remaining === 0) {
      collector.stop('all_clues');
    } else if (remaining <= 2) {
      // Encouragement pour les derniers
      setTimeout(() => {
        interaction.followUp({ 
          content: `⏰ Plus que **${remaining}** indice(s) attendu(s) !`,
          allowedMentions: { users: [] }
        }).catch(() => {});
      }, 1000);
    }
  });

  collector.on('end', async (collected, reason) => {
    if (state.clues.size === 0) {
      cleanup(client, channelId, state);
      return interaction.followUp({ 
        content: '⏰ **Partie annulée** - Aucun indice donné dans les temps.', 
        allowedMentions: { users: [] } 
      });
    }
    
    await launchVote(interaction, client, channelId);
  });
}

async function launchVote(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state) return;

  state.stage = 'vote';
  const players = Array.from(state.players);

  // 🎨 Création de l'embed de vote premium
  const voteEmbed = new EmbedBuilder()
    .setTitle('🗳️ PHASE DE VOTE')
    .setDescription('**📝 Récapitulatif des indices donnés :**')
    .setColor(0xFF6B35);

  // 🎲 Mélange aléatoire pour plus de suspense
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  
  for (const [index, id] of shuffledPlayers.entries()) {
    const clue = state.clues.get(id) || '*(aucun indice donné)*';
    const member = interaction.guild.members.cache.get(id);
    const username = member?.displayName || member?.user.username || `Joueur ${id.slice(-4)}`;
    
    const emoji = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪'][index % 8];
    
    voteEmbed.addFields({
      name: `${emoji} ${username}`,
      value: `*"${clue}"*`,
      inline: true
    });
  }

  voteEmbed.addFields({
    name: '🎯 VOTEZ MAINTENANT !',
    value: `Cliquez sur le bouton du joueur que vous soupçonnez d'être l'**undercover**\n⏰ **60 secondes** pour voter`,
    inline: false
  });

  // 🎮 Création des boutons de vote (max 5 par ligne)
  const rows = [];
  const votePrefix = `grookspy_vote_${Date.now()}`;
  state.voteIdPrefix = votePrefix;

  for (let i = 0; i < players.length; i += 5) {
    const row = new ActionRowBuilder();
    const chunk = players.slice(i, i + 5);
    
    for (const id of chunk) {
      const member = interaction.guild.members.cache.get(id);
      const label = (member?.displayName || member?.user.username || `Joueur ${id.slice(-4)}`).slice(0, 20);
      
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${votePrefix}_${id}`)
          .setLabel(label)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎯')
      );
    }
    rows.push(row);
  }

  await interaction.followUp({ 
    embeds: [voteEmbed], 
    components: rows 
  });

  // 🎯 Handlers de vote avec validation
  for (const id of players) {
    const customId = `${votePrefix}_${id}`;
    client.interactionHandlers.set(customId, async (btn) => {
      const s = activeSpies.get(channelId);
      if (!s || s.stage !== 'vote') {
        return btn.reply({ 
          content: `⏰ Le vote est terminé ou la partie n'existe plus.`, 
          ephemeral: true 
        });
      }

      if (!players.includes(btn.user.id)) {
        return btn.reply({ 
          content: `🚫 Tu ne participes pas à cette partie.`, 
          ephemeral: true 
        });
      }

      if (s.votes.has(btn.user.id)) {
        return btn.reply({ 
          content: `✅ Tu as déjà voté ! Patience...`, 
          ephemeral: true 
        });
      }

      s.votes.set(btn.user.id, id);
      const targetMember = interaction.guild.members.cache.get(id);
      const targetName = targetMember?.displayName || targetMember?.user.username || 'ce joueur';
      
      await btn.reply({ 
        content: `🗳️ **Vote enregistré** pour **${targetName}** !`, 
        ephemeral: true 
      });

      // ⚡ Vérification si tout le monde a voté
      const remaining = players.length - s.votes.size;
      if (remaining === 0) {
        setTimeout(() => concludeSpy(interaction, client, channelId), 1500);
      } else if (remaining <= 2) {
        setTimeout(() => {
          interaction.followUp({ 
            content: `⏰ Plus que **${remaining}** vote(s) attendu(s) !`,
            allowedMentions: { users: [] }
          }).catch(() => {});
        }, 500);
      }
    });
  }

  // ⏰ Fin automatique du vote après 60 secondes
  setTimeout(() => concludeSpy(interaction, client, channelId), 60000);
}

async function concludeSpy(interaction, client, channelId) {
  const state = activeSpies.get(channelId);
  if (!state || state.stage === 'ended') return;

  state.stage = 'ended';
  const players = Array.from(state.players);
  const gameTime = Math.round((Date.now() - state.startTime) / 1000);

  // 📊 Décompte des votes
  const tally = {};
  for (const vote of state.votes.values()) {
    tally[vote] = (tally[vote] || 0) + 1;
  }

  // 🎯 Détermination du joueur le plus voté
  let votedOut = null;
  let maxVotes = 0;
  let tie = false;

  const sortedVotes = Object.entries(tally).sort(([,a], [,b]) => b - a);
  if (sortedVotes.length > 0) {
    maxVotes = sortedVotes[0][1];
    const topVoted = sortedVotes.filter(([,votes]) => votes === maxVotes);
    
    if (topVoted.length > 1) {
      tie = true;
      votedOut = topVoted[Math.floor(Math.random() * topVoted.length)][0]; // Tirage au sort en cas d'égalité
    } else {
      votedOut = topVoted[0][0];
    }
  }

  // 🧹 Nettoyage des handlers
  cleanup(client, channelId, state);

  // 🎭 Récupération des informations des joueurs
  const undercoverMember = interaction.guild.members.cache.get(state.undercover);
  const undercoverName = undercoverMember?.displayName || undercoverMember?.user.username || 'L\'Undercover';
  
  const votedMember = votedOut ? interaction.guild.members.cache.get(votedOut) : null;
  const votedName = votedMember?.displayName || votedMember?.user.username || 'Personne';

  // 🏆 Création de l'embed de résultat
  const resultEmbed = new EmbedBuilder()
    .setTimestamp()
    .addFields({
      name: '📝 Révélation des mots',
      value: `**👥 Citoyens :** \`${state.words.citizen}\`\n**🎭 Undercover :** \`${state.words.undercover}\``,
      inline: false
    });

  // 🎉 Détermination du gagnant
  if (votedOut === state.undercover) {
    // 🛡️ Victoire des citoyens
    resultEmbed
      .setTitle('🛡️ VICTOIRE DES CITOYENS !')
      .setColor(0x44FF88)
      .setDescription(`
🎉 **Félicitations aux détectives !**

**🎭 ${undercoverName}** était bien l'undercover et a été démasqué !
${tie ? '⚖️ *Égalité résolue par tirage au sort*' : ''}

Les citoyens ont su identifier l'imposteur grâce à leurs indices précis !
      `);
    
    // 📈 Incrémentation des victoires pour les citoyens
    for (const id of players) {
      if (id !== state.undercover) {
        incrementWin(interaction.guild.id, id, 'spy');
      }
    }
  } else {
    // 🎭 Victoire de l'undercover
    resultEmbed
      .setTitle('🎭 VICTOIRE DE L\'UNDERCOVER !')
      .setColor(0xFF4444)
      .setDescription(`
😈 **Infiltration réussie !**

**🎭 ${undercoverName}** a brillamment trompé tout le monde !
**❌ ${votedName}** a été éliminé à tort.
${tie ? '⚖️ *Égalité résolue par tirage au sort*' : ''}

L'undercover a su adapter ses indices pour passer inaperçu !
      `);
    
    // 📈 Incrémentation de la victoire pour l'undercover
    incrementWin(interaction.guild.id, state.undercover, 'spy');
  }

  // 📊 Affichage détaillé des votes
  if (Object.keys(tally).length > 0) {
    const voteLines = sortedVotes.map(([id, votes], index) => {
      const member = interaction.guild.members.cache.get(id);
      const name = member?.displayName || member?.user.username || 'Joueur inconnu';
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
      const percentage = Math.round((votes / state.votes.size) * 100);
      return `${emoji} **${name}** : ${votes} vote${votes > 1 ? 's' : ''} (${percentage}%)`;
    });
    
    resultEmbed.addFields({
      name: '🗳️ Résultats détaillés du vote',
      value: voteLines.join('\n') || 'Aucun vote enregistré',
      inline: false
    });
  }

  // 📊 Statistiques de la partie
  resultEmbed.addFields({
    name: '📊 Statistiques de la partie',
    value: `⏱️ **Durée :** ${gameTime}s\n🎲 **Difficulté :** ${state.difficulty}\n👥 **Participants :** ${players.length}\n💬 **Indices donnés :** ${state.clues.size}`,
    inline: true
  });

  resultEmbed.setFooter({ 
    text: `🏆 Partie terminée • Merci d'avoir joué !`,
    iconURL: client.user?.displayAvatarURL()
  });

  await interaction.followUp({ 
    embeds: [resultEmbed], 
    allowedMentions: { users: players } 
  });
}

function cleanup(client, channelId, state) {
  // 🧹 Suppression de tous les handlers d'interaction
  if (state.joinId) {
    client.interactionHandlers.delete(state.joinId);
  }
  
  if (state.voteIdPrefix) {
    const players = Array.from(state.players);
    for (const id of players) {
      client.interactionHandlers.delete(`${state.voteIdPrefix}_${id}`);
    }
  }
  
  // ⏰ Nettoyage des timers
  if (state.timer) {
    clearTimeout(state.timer);
  }
  
  // 🗑️ Suppression de l'état de la partie
  activeSpies.delete(channelId);
  
  console.log(`🧹 [GrookSpy] Partie nettoyée pour le salon ${channelId}`);
}