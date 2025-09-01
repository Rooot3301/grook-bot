import { ActivityType } from 'discord.js';
import fs from 'fs';
import path from 'path';

/**
 * 🎭 Rich Presence Premium - Statuts dynamiques et professionnels
 * Rotation intelligente avec contexte temps réel et métriques du bot
 */

let currentIndex = 0;
let botStats = {
  guilds: 0,
  users: 0,
  commands: 0,
  uptime: 0
};

/**
 * Met à jour les statistiques du bot pour les statuts dynamiques
 * @param {import('discord.js').Client} client 
 */
function updateBotStats(client) {
  botStats = {
    guilds: client.guilds.cache.size,
    users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    commands: client.commands?.size || 0,
    uptime: Math.floor(process.uptime() / 3600) // heures
  };
}

/**
 * Génère des statuts contextuels selon l'heure et les stats
 * @param {string} version Version du bot
 * @returns {Array} Liste des statuts possibles
 */
function generateContextualStatuses(version) {
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour <= 6;
  const isMorning = hour >= 6 && hour <= 11;
  const isAfternoon = hour >= 12 && hour <= 17;
  const isEvening = hour >= 18 && hour <= 21;

  const baseStatuses = [
    // 🎯 Statuts de marque et version
    { type: ActivityType.Playing, text: `Grook v${version}` },
    { type: ActivityType.Watching, text: 'Créé par Root3301' },
    
    // 📊 Métriques temps réel
    { type: ActivityType.Watching, text: `${botStats.guilds} serveur${botStats.guilds > 1 ? 's' : ''}` },
    { type: ActivityType.Listening, text: `${botStats.users.toLocaleString()} utilisateurs` },
    { type: ActivityType.Playing, text: `${botStats.commands} commandes disponibles` },
    
    // 🎮 Jeux et fonctionnalités
    { type: ActivityType.Competing, text: 'au GrookSpy Undercover' },
    { type: ActivityType.Playing, text: 'à la roulette russe' },
    { type: ActivityType.Watching, text: 'les mini-jeux' },
    
    // 🛡️ Modération et sécurité
    { type: ActivityType.Watching, text: 'la modération' },
    { type: ActivityType.Listening, text: 'les rapports de sécurité' },
    { type: ActivityType.Playing, text: 'le gardien du serveur' },
    
    // 🎭 Personnalité et humour (selon contexte)
    ...(isNight ? [
      { type: ActivityType.Playing, text: 'en mode nuit 🌙' },
      { type: ActivityType.Listening, text: 'le silence nocturne' },
      { type: ActivityType.Watching, text: 'les insomniaques' }
    ] : []),
    
    ...(isMorning ? [
      { type: ActivityType.Playing, text: 'le réveil matinal ☀️' },
      { type: ActivityType.Listening, text: 'les premiers messages' },
      { type: ActivityType.Watching, text: 'le café se préparer' }
    ] : []),
    
    ...(isAfternoon ? [
      { type: ActivityType.Playing, text: 'l\'après-midi productive' },
      { type: ActivityType.Competing, text: 'contre la procrastination' },
      { type: ActivityType.Watching, text: 'l\'activité du serveur' }
    ] : []),
    
    ...(isEvening ? [
      { type: ActivityType.Playing, text: 'la soirée détente' },
      { type: ActivityType.Listening, text: 'les discussions du soir' },
      { type: ActivityType.Watching, text: 'les gamers se connecter' }
    ] : [])
  ];

  // 🏆 Statuts spéciaux selon les métriques
  if (botStats.guilds >= 10) {
    baseStatuses.push({ type: ActivityType.Competing, text: 'dans la cour des grands' });
  }
  
  if (botStats.users >= 1000) {
    baseStatuses.push({ type: ActivityType.Watching, text: 'une communauté grandissante' });
  }
  
  if (botStats.uptime >= 24) {
    baseStatuses.push({ type: ActivityType.Playing, text: `${botStats.uptime}h d'uptime` });
  }

  // 🎲 Statuts humoristiques rares (10% de chance)
  if (Math.random() < 0.1) {
    const funnyStatuses = [
      { type: ActivityType.Playing, text: 'à cache-cache avec les bugs' },
      { type: ActivityType.Listening, text: 'les plaintes des développeurs' },
      { type: ActivityType.Watching, text: 'Netflix (en secret)' },
      { type: ActivityType.Competing, text: 'au concours de dad jokes' },
      { type: ActivityType.Playing, text: 'le psychologue du serveur' },
      { type: ActivityType.Listening, text: 'vos secrets les plus sombres' },
      { type: ActivityType.Watching, text: 'l\'évolution de l\'humanité' },
      { type: ActivityType.Playing, text: 'à être mystérieux' }
    ];
    baseStatuses.push(...funnyStatuses);
  }

  return baseStatuses;
}

/**
 * Démarre la rotation intelligente du Rich Presence
 * @param {import('discord.js').Client} client 
 */
export function startRichPresenceRotation(client) {
  // Lire la version depuis package.json
  let version = '3.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(path.resolve(), 'package.json'), 'utf8'));
    version = pkg.version || version;
  } catch (error) {
    console.warn('[RichPresence] Impossible de lire la version:', error.message);
  }

  const rotate = () => {
    try {
      // Mettre à jour les stats du bot
      updateBotStats(client);
      
      // Générer les statuts contextuels
      const statuses = generateContextualStatuses(version);
      
      // Sélection intelligente (pas complètement aléatoire)
      const status = statuses[currentIndex % statuses.length];
      currentIndex++;
      
      // Appliquer le statut avec gestion d'erreur
      client.user?.setPresence({
        activities: [{
          name: status.text,
          type: status.type
        }],
        status: 'online'
      });
      
      console.log(`[RichPresence] 🎭 ${ActivityType[status.type]}: "${status.text}"`);
      
    } catch (error) {
      console.error('[RichPresence] Erreur lors de la rotation:', error.message);
    }
  };

  // 🚀 Démarrage immédiat
  console.log('[RichPresence] 🎭 Démarrage de la rotation intelligente...');
  rotate();
  
  // 🔄 Rotation toutes les 12 minutes (plus fréquent pour plus de dynamisme)
  const interval = setInterval(rotate, 12 * 60 * 1000);
  
  // 🧹 Cleanup au shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('[RichPresence] 🛑 Rotation arrêtée');
  });
  
  process.on('SIGTERM', () => {
    clearInterval(interval);
    console.log('[RichPresence] 🛑 Rotation arrêtée');
  });
  
  console.log('[RichPresence] ✅ Rotation configurée (12min)');
}