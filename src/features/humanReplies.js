// Réponses personnalisées lorsqu'un utilisateur mentionne le bot.
// Ces phrases sont destinées à donner une impression plus "humaine" et amicale.

const mentionReplies = [
  // Salutations amicales
  'Salut ! Comment puis‑je t’aider aujourd’hui ?',
  'Hey ! Je suis là, que puis‑je faire pour toi ?',
  'Coucou ! Tu as besoin d’un coup de main ?',
  // Humour et personnalité
  'Grook est à ton service 🤖. Pose ta question !',
  'Je t’écoute attentivement… même si je suis un bot.',
  'On m’a appelé ? J’espère que ce n’est pas pour un raid 🙀',
  // Invitation à consulter l’aide
  'Besoin d’une commande ? Tu peux essayer `/help` pour voir tout ce que je sais faire.',
  'Je connais plein de commandes sympas. Tape `/help` pour les découvrir !',
  'Si tu cherches quelque chose, ma liste de commandes est là pour ça : `/help` !'
];

/**
 * Retourne une réponse aléatoire parmi les phrases définies ci‑dessus.
 * @param {import('discord.js').User} author
 */
export function getRandomMentionReply(author) {
  // On pourrait personnaliser la réponse avec le nom de l’auteur si besoin
  const reply = mentionReplies[Math.floor(Math.random() * mentionReplies.length)];
  return reply;
}