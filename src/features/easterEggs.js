import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Configuration par défaut des easter eggs
const defaultConfig = {
  rickrollChance: 0.0001,    // 0,01% des messages (ultra rare)
  lazyChance: 0.001          // 0,1% des commandes (ultra rare)
};

/**
 * Vérifie et envoie un easter egg Rickroll aléatoire sur un message.
 * @param {import('discord.js').Message} message
 * @param {Object} cfg Configuration des easter eggs
 */
export async function tryRickroll(message, cfg = {}) {
  const chance = cfg.rickrollChance ?? defaultConfig.rickrollChance;
  if (Math.random() >= chance) return false;
  
  // 🎲 Chance supplémentaire de ne rien faire (50% même si déclenché)
  if (Math.random() < 0.5) return false;
  
  // Crée un bouton menant vers la vidéo
  const links = [
    'https://youtu.be/xvFZjo5PgG0',
    'https://youtu.be/oHg5SJYRHA0',
    'https://youtu.be/j5a0jTc9S10'
  ];
  const link = links[Math.floor(Math.random() * links.length)];
  
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🎁 Cadeau spécial')
      .setStyle(ButtonStyle.Link)
      .setURL(link)
  );
  
  const altResponses = [
    'Non, pas aujourd\'hui 😏',
    'Hmm... peut-être plus tard 🤔',
    'J\'ai changé d\'avis 😌',
    'Trop facile ! 😎'
  ];
  
  const useAlt = Math.random() < 0.3; // 30% de chance de troll
  if (useAlt) {
    const response = altResponses[Math.floor(Math.random() * altResponses.length)];
    await message.reply({ content: response });
  } else {
    const messages = [
      'GG, voilà ta récompense 🎁',
      'Tu as débloqué quelque chose de spécial... 🎉',
      'Félicitations ! Voici ton prix 🏆',
      'Un petit cadeau pour toi 🎈'
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    await message.reply({ content: msg, components: [row] });
  }
  
  console.log(`🎲 [EasterEgg] Rickroll déclenché par ${message.author.tag} dans ${message.guild?.name}`);
  return true;
}

/**
 * Répond parfois paresseusement à une commande slash. Retourne vrai si la commande ne doit pas s’exécuter.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {Object} cfg
 */
export async function tryLazyResponse(interaction, cfg = {}) {
  const chance = cfg.lazyChance ?? defaultConfig.lazyChance;
  if (Math.random() >= chance) return false;
  
  const messages = [
    '😴 Zzz... Laisse-moi dormir...',
    '🤖 Erreur 418 : Je suis une théière',
    '🎯 Commande non trouvée. Essaie `/help` !',
    '⚡ Batterie faible... Recharge en cours...',
    '🎲 Pas de chance cette fois !',
    '🔄 Redémarrage en cours... Veuillez patienter.',
    '🎭 Je fais semblant de ne pas avoir vu.',
    '🌙 Mode nuit activé. Réessaie demain !',
    '🎪 Service temporairement indisponible.',
    '🎨 Je peins actuellement. Pas le temps !'
  ];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await interaction.reply({ content: msg, ephemeral: true });
  
  console.log(`😴 [EasterEgg] Lazy response pour /${interaction.commandName} par ${interaction.user.tag}`);
  return true;
}