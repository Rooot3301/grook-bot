import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Configuration par défaut des easter eggs
const defaultConfig = {
  rickrollChance: 0.005, // 0,5 % des messages
  lazyChance: 0.04,      // 4 % des commandes
  prophecyChance: 0.001, // 0,1 % des messages
  prophecyCooldownMs: 1000 * 60 * 60 * 6 // 6 heures entre deux prophéties
};

// Suivi du dernier envoi de prophétie par serveur
const lastProphecyTimes = new Map();

/**
 * Vérifie et envoie un easter egg Rickroll aléatoire sur un message.
 * @param {import('discord.js').Message} message
 * @param {Object} cfg Configuration des easter eggs
 */
export async function tryRickroll(message, cfg = {}) {
  const chance = cfg.rickrollChance ?? defaultConfig.rickrollChance;
  if (Math.random() >= chance) return false;
  // Crée un bouton menant vers la vidéo
  const link = 'https://youtu.be/xvFZjo5PgG0?si=V5vVoWMNqiVBHczB';
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Récompense 🎁')
      .setStyle(ButtonStyle.Link)
      .setURL(link)
  );
  const altResponses = ['Non, pas aujourd\'hui 😏'];
  const useAlt = Math.random() < 0.1;
  if (useAlt) {
    await message.reply({ content: altResponses[0] });
  } else {
    await message.reply({ content: 'GG, voilà ta récompense 🎁', components: [row] });
  }
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
    '😴 Laisse‑moi dormir zebi…',
    'Demande à Google frère.',
    'J’ai la flemme, reviens plus tard.'
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  // Remarque : option "ephemeral" détermine si le message est visible uniquement par l'utilisateur déclencheur.
  await interaction.reply({ content: msg, ephemeral: true });
  return true;
}

/**
 * Envoie une prophétie mystérieuse occasionnelle dans un salon.
 * @param {import('discord.js').Message} message
 * @param {Object} cfg
 */
export async function tryProphecy(message, cfg = {}) {
  const chance = cfg.prophecyChance ?? defaultConfig.prophecyChance;
  const cooldown = cfg.prophecyCooldownMs ?? defaultConfig.prophecyCooldownMs;
  const guildId = message.guild?.id;
  if (!guildId) return false;
  const lastTime = lastProphecyTimes.get(guildId) || 0;
  if (Date.now() - lastTime < cooldown) return false;
  if (Math.random() >= chance) return false;
  // Liste de prophéties absurdes
  const props = [
    '🌑 Quand le centième message tombera, un modérateur trébuchera.',
    '⚡ Bientôt, un membre sera modéré par son propre mute.',
    '📜 La prophétie annonce la fin… mais pas aujourd’hui.',
    '👁️ Le serveur survivra tant que personne ne prononcera mon nom trois fois.'
  ];
  const content = props[Math.floor(Math.random() * props.length)];
  const embed = new EmbedBuilder()
    .setTitle('Prophétie de Grook')
    .setDescription(content)
    .setColor(0x8800ff)
    .setFooter({ text: 'Les étoiles sont capricieuses' })
    .setTimestamp();
  await message.channel.send({ embeds: [embed] });
  lastProphecyTimes.set(guildId, Date.now());
  return true;
}