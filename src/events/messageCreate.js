import { tryRickroll } from '../features/easterEggs.js';
import { loadConfig } from '../features/modlogs.js';
// Import du nouvel analyseur de liens (heuristiques) et du LLM pour les mentions
import { analyzeLinksInMessage } from '../features/linkGuardianLite.js';
import { tryContextualReply } from '../features/contextualReplies.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    // Ne pas traiter les messages du bot
    if (message.author.bot) return;

    // 1) Analyse heuristique des liens (LinkGuardianLite)
    try {
      await analyzeLinksInMessage(message);
    } catch (err) {
      console.error('[linkGuardianLite] erreur :', err);
    }

    // 2) Réponses contextuelles ultra rares (1 sur 1 million)
    try {
      const replied = await tryContextualReply(message);
      if (replied) return; // Si réponse contextuelle, on s'arrête là
    } catch (err) {
      console.error('[contextualReplies] erreur :', err);
    }

    // 3) Répondre de manière conversationnelle lorsque le bot est mentionné
    try {
      if (message.mentions?.users?.has(client.user?.id)) {
        console.log(`[mention] ${message.author.tag} mentionné: ${message.content}`);
        // Réponse aléatoire « humaine » directement
        const { getRandomMentionReply } = await import('../features/humanReplies.js');
        const reply = getRandomMentionReply(message.author);
        await message.reply({ content: reply });
        // Après avoir répondu à la mention, on laisse les easter eggs se déclencher (pas de return)
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la mention :', error);
    }

    // Récupérer la configuration pour d'éventuels easter eggs
    const cfg = loadConfig();
    const guildCfg = cfg.guilds?.[message.guild?.id] || {};
    // Easter eggs : Rickroll uniquement
    await tryRickroll(message, {});
  }
};