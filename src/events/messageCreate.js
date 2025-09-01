import { tryRickroll } from '../features/easterEggs.js';
import { loadConfig } from '../features/modlogs.js';
// Import du nouvel analyseur de liens (heuristiques) et du LLM pour les mentions
import { analyzeLinksInMessage } from '../features/linkGuardianLite.js';
import { tryContextualReply } from '../features/contextualReplies.js';
import { addXp } from '../features/levelSystem.js';
import { EmbedBuilder } from 'discord.js';
import { Colors } from '../utils/theme.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    // Ne pas traiter les messages du bot
    if (message.author.bot) return;

    // 🎯 Système de niveaux (gain d'XP)
    if (message.guild && message.content.length > 0) {
      try {
        const levelResult = await addXp(message.guild.id, message.author.id, message);
        
        // 🎉 Célébration de montée de niveau
        if (levelResult?.levelUp) {
          const embed = new EmbedBuilder()
            .setTitle('🎉 NIVEAU SUPÉRIEUR !')
            .setDescription(`**${message.author}** vient d'atteindre le **niveau ${levelResult.newLevel}** !`)
            .setColor(Colors.success)
            .addFields(
              { name: '⭐ XP Total', value: `${levelResult.totalXp.toLocaleString()}`, inline: true },
              { name: '🎯 Prochain niveau', value: `${levelResult.xpForNext.toLocaleString()} XP`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
          
          // Ajouter le palier spécial si disponible
          if (levelResult.milestone) {
            embed.addFields({
              name: '🏅 Nouveau Titre Débloqué !',
              value: `**${levelResult.milestone.title}**\n*${levelResult.milestone.message}*`,
              inline: false
            });
          }
          
          embed.setFooter({ text: '🎯 Continue comme ça !' });
          
          // Envoyer la célébration dans le même salon
          await message.channel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error('[LevelSystem] Erreur lors du gain d\'XP:', error);
      }
    }

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