/**
 * 🎯 Réponses contextuelles ultra rares
 * 
 * Ce module analyse le contenu des messages et répond de manière contextuelle
 * avec une probabilité extrêmement faible (1 sur 1 million).
 * 
 * Les réponses sont adaptées au contenu du message pour créer des moments
 * magiques et mémorables sur le serveur.
 */

// 🎲 Probabilité LÉGENDAIRE : 0.00001% (1 chance sur 10 millions)
const CONTEXTUAL_CHANCE = 0.0000001;

// 🎯 Patterns contextuels avec leurs réponses
const CONTEXTUAL_PATTERNS = [
  // 🍕 Nourriture
  {
    patterns: [/pizza/i, /manger/i, /faim/i, /bouffe/i, /restaurant/i],
    replies: [
      "🍕 Quelqu'un a dit pizza ? J'ai une faim de loup maintenant...",
      "🤤 Ça me donne envie de commander quelque chose...",
      "🍽️ Bon appétit ! (même si je ne peux pas manger)",
      "👨‍🍳 Un chef étoilé parmi nous ?"
    ]
  },

  // 🎮 Gaming
  {
    patterns: [/jeu/i, /gaming/i, /jouer/i, /game/i, /gamer/i],
    replies: [
      "🎮 Un gamer sauvage apparaît !",
      "🕹️ Prêt pour une partie épique ?",
      "🏆 Que le meilleur joueur gagne !",
      "🎯 GG d'avance !"
    ]
  },

  // 😴 Sommeil/Fatigue
  {
    patterns: [/dodo/i, /dormir/i, /fatigue/i, /sommeil/i, /nuit/i],
    replies: [
      "😴 Zzz... Moi aussi j'ai sommeil...",
      "🌙 Bonne nuit ! Rêve de moi 😉",
      "💤 Dors bien, je veille sur le serveur",
      "🛏️ Un petit somme ne fait jamais de mal"
    ]
  },

  // 🎵 Musique
  {
    patterns: [/musique/i, /chanson/i, /écoute/i, /son/i, /beat/i],
    replies: [
      "🎵 La musique adoucit les mœurs !",
      "🎧 Bon goût musical détecté !",
      "🎤 Tu chantes sous la douche ?",
      "🎶 Cette mélodie me rappelle quelque chose..."
    ]
  },

  // 💻 Code/Tech
  {
    patterns: [/code/i, /bug/i, /javascript/i, /python/i, /dev/i, /programmer/i],
    replies: [
      "💻 Un développeur ! Mes respects 🫡",
      "🐛 Les bugs, mes meilleurs ennemis...",
      "⚡ Le code, c'est de la poésie !",
      "🔧 Ctrl+Z est ton meilleur ami ?"
    ]
  },

  // ☀️ Météo
  {
    patterns: [/soleil/i, /pluie/i, /temps/i, /météo/i, /chaud/i, /froid/i],
    replies: [
      "🌤️ Quel temps fait-il dehors ?",
      "☔ J'espère que tu as un parapluie !",
      "☀️ Un peu de soleil fait du bien !",
      "🌡️ La météo, éternel sujet de conversation"
    ]
  },

  // 🐱 Animaux
  {
    patterns: [/chat/i, /chien/i, /animal/i, /mignon/i, /pet/i],
    replies: [
      "🐱 Les animaux sont les meilleurs !",
      "🐕 Woof ! (je parle chien aussi)",
      "🦆 Coin coin ! (et canard)",
      "🐾 Photo de ton animal ? 👀"
    ]
  },

  // 🎂 Anniversaire/Fête
  {
    patterns: [/anniversaire/i, /fête/i, /birthday/i, /party/i, /célébrer/i],
    replies: [
      "🎉 Joyeux anniversaire ! 🎂",
      "🥳 C'est la fête !",
      "🎈 Que la fête commence !",
      "🍰 J'apporte le gâteau virtuel !"
    ]
  },

  // 😂 Humour/Rire
  {
    patterns: [/lol/i, /mdr/i, /drôle/i, /rire/i, /blague/i, /😂/, /🤣/],
    replies: [
      "😂 Excellent sens de l'humour !",
      "🤣 Tu me fais rire !",
      "😄 L'humour, meilleur remède !",
      "🎭 Un comédien parmi nous ?"
    ]
  },

  // 💔 Tristesse/Problèmes
  {
    patterns: [/triste/i, /déprime/i, /problème/i, /difficile/i, /😢/, /😭/],
    replies: [
      "🤗 Courage, ça va aller !",
      "💪 Tu es plus fort que tu ne le penses",
      "🌈 Après la pluie, le beau temps",
      "❤️ On est là pour toi !"
    ]
  },

  // 🎨 Art/Créativité
  {
    patterns: [/art/i, /dessin/i, /créatif/i, /peinture/i, /design/i],
    replies: [
      "🎨 Un artiste ! Respect 🎭",
      "🖌️ L'art, c'est l'âme qui s'exprime",
      "🌟 La créativité n'a pas de limites",
      "🖼️ Picasso serait fier !"
    ]
  },

  // 🏃 Sport/Fitness
  {
    patterns: [/sport/i, /fitness/i, /courir/i, /musculation/i, /gym/i],
    replies: [
      "💪 Un sportif ! Impressionnant",
      "🏃‍♂️ Moi je cours... des programmes",
      "🏋️ No pain, no gain !",
      "⚡ L'énergie, c'est la vie !"
    ]
  },

  // 📚 Études/École
  {
    patterns: [/école/i, /étude/i, /exam/i, /cours/i, /prof/i, /université/i],
    replies: [
      "📚 Bon courage pour les études !",
      "🎓 L'éducation, c'est l'avenir",
      "✏️ Apprendre, c'est grandir",
      "🧠 Le savoir, c'est le pouvoir !"
    ]
  },

  // 🌍 Voyage/Vacances
  {
    patterns: [/voyage/i, /vacances/i, /partir/i, /destination/i, /avion/i],
    replies: [
      "✈️ Bon voyage ! Envoie des photos",
      "🗺️ L'aventure t'attend !",
      "🏖️ Profite bien de tes vacances",
      "🌍 Le monde est à toi !"
    ]
  },

  // 💰 Argent/Travail
  {
    patterns: [/travail/i, /boulot/i, /argent/i, /salaire/i, /job/i],
    replies: [
      "💼 Le travail, c'est la santé !",
      "💰 L'argent ne fait pas le bonheur... mais il aide",
      "⚡ Courage pour le boulot !",
      "🎯 Success is coming !"
    ]
  }
];

/**
 * Tente de répondre de manière contextuelle à un message
 * @param {import('discord.js').Message} message 
 * @returns {Promise<boolean>} true si une réponse a été envoyée
 */
export async function tryContextualReply(message) {
  // Vérifications de base
  if (!message.content || message.content.length < 3) return false;
  if (message.mentions?.everyone) return false;
  if (message.author.bot) return false;
  
  // 🎲 Première chance ultra rare
  if (Math.random() >= CONTEXTUAL_CHANCE) return false;
  
  // 🎲 Double sécurité : encore une chance sur 10
  if (Math.random() >= 0.1) return false;
  
  const content = message.content.toLowerCase();
  
  // 🔍 Recherche de patterns correspondants
  const matchingPatterns = CONTEXTUAL_PATTERNS.filter(item =>
    item.patterns.some(pattern => pattern.test(content))
  );
  
  if (matchingPatterns.length === 0) return false;
  
  // 🎯 Sélection aléatoire d'un pattern et d'une réponse
  const selectedPattern = matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
  const reply = selectedPattern.replies[Math.floor(Math.random() * selectedPattern.replies.length)];
  
  try {
    // 🎭 Envoi de la réponse contextuelle
    await message.reply({ 
      content: reply,
      allowedMentions: { users: [message.author.id] }
    });
    
    // 📊 Log pour tracking (très rare donc intéressant à suivre)
    console.log(`🎯 [ContextualReply] ULTRA RARE! ${message.author.tag} in ${message.guild?.name}: "${content.slice(0, 50)}" -> "${reply}"`);
    
    return true;
  } catch (error) {
    console.error('[ContextualReply] Erreur envoi:', error);
    return false;
  }
}

/**
 * Statistiques des réponses contextuelles (pour debug)
 */
export function getContextualStats() {
  return {
    totalPatterns: CONTEXTUAL_PATTERNS.length,
    totalReplies: CONTEXTUAL_PATTERNS.reduce((sum, item) => sum + item.replies.length, 0),
    chance: CONTEXTUAL_CHANCE,
    chanceReadable: `1 sur ${Math.round(1 / CONTEXTUAL_CHANCE).toLocaleString()}`
  };
}