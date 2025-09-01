import { SlashCommandBuilder } from 'discord.js';
import { incrementWin } from '../../features/stats.js';

/**
 * 🎮 Mini-jeux rapides regroupés en une seule commande
 * Plus propre et plus facile à maintenir
 */

export const data = new SlashCommandBuilder()
  .setName('grookgames')
  .setDescription('🎮 Collection de mini-jeux rapides')
  .addSubcommand(sub => 
    sub.setName('guess')
       .setDescription('🔢 Devinez le nombre (avec un soupçon de mensonge)')
  )
  .addSubcommand(sub => 
    sub.setName('typer')
       .setDescription('⌨️ Course de frappe - le plus rapide gagne')
  )
  .addSubcommand(sub => 
    sub.setName('flip')
       .setDescription('🪙 Pile ou face (Grook peut tricher)')
  )
  .addSubcommand(sub => 
    sub.setName('roulette')
       .setDescription('🎯 Roulette russe virtuelle')
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  switch (subcommand) {
    case 'guess':
      return executeGuess(interaction);
    case 'typer':
      return executeTyper(interaction);
    case 'flip':
      return executeFlip(interaction);
    case 'roulette':
      return executeRoulette(interaction);
    default:
      return interaction.reply({ content: '❌ Jeu non reconnu.', ephemeral: true });
  }
}

// 🔢 Jeu de devinettes avec mensonges occasionnels
async function executeGuess(interaction) {
  const target = Math.floor(Math.random() * 100) + 1;
  
  await interaction.reply({ 
    content: `🔢 **Grook pense à un nombre entre 1 et 100...**\nVous avez **60 secondes** pour deviner !\n*Attention : Grook peut parfois mentir... 😏*`, 
    allowedMentions: { users: [] } 
  });
  
  let found = false;
  const collector = interaction.channel.createMessageCollector({ 
    filter: m => !m.author.bot && !isNaN(parseInt(m.content.trim())), 
    time: 60000 
  });
  
  collector.on('collect', async msg => {
    const guess = parseInt(msg.content.trim(), 10);
    
    if (guess === target) {
      found = true;
      incrementWin(interaction.guild.id, msg.author.id, 'guess');
      await msg.reply({ 
        content: `🎉 **Bravo ${msg.author} !** Le nombre était bien **${target}** !`, 
        allowedMentions: { users: [msg.author.id] } 
      });
      collector.stop('found');
    } else {
      // 85% de sincérité, 15% de mensonge
      const truthful = Math.random() > 0.15;
      let hint;
      
      if (truthful) {
        hint = guess < target ? '📈 Plus haut !' : '📉 Plus bas !';
      } else {
        hint = guess < target ? '📉 Plus bas ! 😈' : '📈 Plus haut ! 😈';
      }
      
      await msg.reply({ content: hint, allowedMentions: { users: [] } });
    }
  });
  
  collector.on('end', async (_, reason) => {
    if (!found) {
      await interaction.followUp({ 
        content: `⏱️ **Temps écoulé !** Le nombre était **${target}**.`, 
        allowedMentions: { users: [] } 
      });
    }
  });
}

// ⌨️ Course de frappe
async function executeTyper(interaction) {
  const phrases = [
    'La programmation est un art, le débogage est un mystère.',
    'Un bot sans bugs est comme une licorne : mythique.',
    'JavaScript : le langage qui fait pleurer les développeurs.',
    'Discord.js rend tout possible, même l\'impossible.',
    'Grook surveille vos messages... avec bienveillance.',
    'Les easter eggs sont la cerise sur le gâteau du code.',
    'Un serveur Discord sans modération, c\'est l\'anarchie.',
    'Les memes sont le langage universel d\'Internet.',
    'Coder la nuit donne des super-pouvoirs... ou des bugs.',
    'La documentation parfaite n\'existe que dans les rêves.'
  ];
  
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  await interaction.reply({ 
    content: `⌨️ **Course de frappe !**\n\nPremier à écrire exactement :\n\`\`\`\n${phrase}\n\`\`\`\n**30 secondes** pour gagner !`, 
    allowedMentions: { users: [] } 
  });
  
  const filter = msg => !msg.author.bot && msg.content.trim() === phrase;
  
  try {
    const collected = await interaction.channel.awaitMessages({ 
      filter, 
      max: 1, 
      time: 30000, 
      errors: ['time'] 
    });
    
    const winnerMsg = collected.first();
    incrementWin(interaction.guild.id, winnerMsg.author.id, 'typer');
    
    await interaction.followUp({ 
      content: `🏆 **${winnerMsg.author} remporte la course !**\n*Vitesse de frappe impressionnante !*`, 
      allowedMentions: { users: [winnerMsg.author.id] } 
    });
  } catch {
    await interaction.followUp({ 
      content: `⏱️ **Personne n'a réussi à temps !**\n*La phrase était trop difficile... ou vous tapez trop lentement ! 😄*`, 
      allowedMentions: { users: [] } 
    });
  }
}

// 🪙 Pile ou face avec triche
async function executeFlip(interaction) {
  const roll = Math.random();
  let result;
  
  if (roll < 0.45) {
    result = '🪙 **Pile** !';
  } else if (roll < 0.9) {
    result = '🪙 **Face** !';
  } else {
    result = '🪙 **La pièce est tombée sur la tranche !** 😱\n*Grook a des pouvoirs mystérieux...*';
  }
  
  await interaction.reply({ 
    content: `🎲 **Lancer de pièce...**\n\n${result}`, 
    allowedMentions: { users: [] } 
  });
}

// 🎯 Roulette russe simplifiée
async function executeRoulette(interaction) {
  const participants = new Set();
  const bullets = Math.floor(Math.random() * 3) + 1; // 1 à 3 balles
  const chambers = 6;
  
  await interaction.reply({ 
    content: `🎯 **ROULETTE RUSSE PREMIUM !**\n\n🔫 *Grook charge ${bullets} balle${bullets > 1 ? 's' : ''} dans le barillet...*\n💀 *${chambers} chambres, ${bullets} mort${bullets > 1 ? 's' : ''} possible${bullets > 1 ? 's' : ''}*\n\n⏰ **15 secondes** pour écrire "BANG" et jouer avec la mort !`, 
    allowedMentions: { users: [] } 
  });
  
  const collector = interaction.channel.createMessageCollector({ 
    filter: m => !m.author.bot && m.content.toLowerCase().includes('bang'), 
    time: 15000 
  });
  
  collector.on('collect', msg => {
    participants.add(msg.author.id);
    const reactions = ['🎯', '💀', '🔫', '⚡', '💥'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    msg.react(reaction).catch(() => {});
  });
  
  collector.on('end', async () => {
    const players = Array.from(participants);
    
    if (players.length < 2) {
      return interaction.followUp({ 
        content: `😅 **Trop peu de courageux !**\n*Il faut au moins 2 joueurs pour défier la mort...*`, 
        allowedMentions: { users: [] } 
      });
    }
    
    // Simulation dramatique
    await interaction.followUp({
      content: `🎭 **${players.length} joueurs** se préparent...\n*Le barillet tourne... Click... Click...*`,
      allowedMentions: { users: [] }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Déterminer les victimes selon le nombre de balles
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const victims = shuffled.slice(0, Math.min(bullets, players.length - 1));
    const survivors = players.filter(id => !victims.includes(id));
    
    // Messages dramatiques selon le nombre de victimes
    let resultMessage;
    if (victims.length === 1) {
      resultMessage = `💥 **BANG !**\n\n💀 <@${victims[0]}> a tiré la balle fatale !\n🏆 **Survivants :** ${survivors.map(id => `<@${id}>`).join(', ')}\n\n*La chance sourit aux audacieux... sauf à un !*`;
    } else if (victims.length === 2) {
      resultMessage = `💥💥 **DOUBLE BANG !**\n\n💀 <@${victims[0]}> et <@${victims[1]}> ont tiré les balles fatales !\n🏆 **Survivants :** ${survivors.map(id => `<@${id}>`).join(', ')}\n\n*Deux âmes perdues dans cette roulette infernale...*`;
    } else {
      resultMessage = `💥💥💥 **MASSACRE !**\n\n💀 **Victimes :** ${victims.map(id => `<@${id}>`).join(', ')}\n🏆 **Survivants :** ${survivors.map(id => `<@${id}>`).join(', ')}\n\n*Un bain de sang ! Grook n'avait pas prévu ça...*`;
    }
    
    // Easter egg ultra rare : personne ne meurt
    if (Math.random() < 0.001) { // 0.1% de chance
      resultMessage = `✨ **MIRACLE !**\n\n🙏 *Le barillet était vide ! Grook vous a tous épargnés...*\n🏆 **Tout le monde survit :** ${players.map(id => `<@${id}>`).join(', ')}\n\n*Parfois, la chance sourit à tous les fous...*`;
      // Tout le monde gagne dans ce cas
      for (const id of players) {
        incrementWin(interaction.guild.id, id, 'roulette');
      }
    } else {
      // Incrémenter les victoires des survivants
      for (const id of survivors) {
        incrementWin(interaction.guild.id, id, 'roulette');
      }
    }
    
    // Statistiques de la partie
    const stats = `\n\n📊 **Stats :** ${players.length} joueurs • ${bullets} balle${bullets > 1 ? 's' : ''} • ${victims.length || 0} victime${victims.length > 1 ? 's' : ''}`;
    
    await interaction.followUp({ 
      content: resultMessage + stats,
      allowedMentions: { users: players } 
    });
    
    // Message final dramatique
    setTimeout(() => {
      const endings = [
        '*Le silence retombe sur le salon...*',
        '*Grook range son arme avec un sourire mystérieux...*',
        '*Une nouvelle légende vient de naître...*',
        '*Les survivants se souviendront de ce jour...*'
      ];
      const ending = endings[Math.floor(Math.random() * endings.length)];
      interaction.followUp({ content: ending, allowedMentions: { users: [] } }).catch(() => {});
    }, 3000);
  });
}