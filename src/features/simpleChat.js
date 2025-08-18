// src/features/simpleChat.js
// Réponses conversationnelles basées sur de simples règles.
// Ce module fournit un fallback sans appel à un modèle LLM.

/**
 * Analyse un message mentionnant le bot et retourne une réponse simple
 * basée sur des expressions régulières. Si aucun motif ne correspond,
 * retourne null pour laisser la main à d’autres modules (easter eggs, humanReplies, etc.).
 *
 * @param {string} cleanedContent Le contenu du message sans la mention du bot
 * @returns {string|null}
 */
export function getSimpleReply(cleanedContent) {
  if (!cleanedContent) return null;
  const text = cleanedContent.toLowerCase();
  const rules = [
    {
      test: /(bonjour|salut|hello|hey)/,
      reply: 'Salut ! Comment ça va ?'
    },
    {
      test: /comment (ça va|vas-tu)/,
      reply: 'Je vais bien, merci de demander ! Et toi ?'
    },
    {
      test: /merci|thank you|thx/,
      reply: 'De rien !'
    },
    {
      test: /qui es-tu|qui tu es|t'es qui/,
      reply: 'Je suis Grook, un bot multifonction. Utilise `/help` pour découvrir mes commandes.'
    },
    {
      test: /aide|help|cmd|commandes/,
      reply: 'Si tu as besoin d’aide, tape `/help` pour afficher la liste de mes commandes.'
    },
    {
      test: /(?:quoi de neuf|quoi de nouveau|what's up)/,
      reply: 'Pas grand‑chose, je veille sur le serveur et je m’améliore chaque jour !'
    }
  ];
  for (const rule of rules) {
    if (rule.test.test(text)) return rule.reply;
  }
  return null;
}