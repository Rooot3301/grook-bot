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
  await interaction.reply({ 
    content: `🎯 **Roulette Russe !**\n*Grook charge le barillet... Qui sera éliminé ?*\n\n⏰ **10 secondes** pour écrire "BANG" et participer !`, 
    allowedMentions: { users: [] } 
  });
  
  const participants = new Set();
  const collector = interaction.channel.createMessageCollector({ 
    filter: m => !m.author.bot && m.content.toLowerCase().includes('bang'), 
    time: 10000 
  });
  
  collector.on('collect', msg => {
    participants.add(msg.author.id);
    msg.react('🎯').catch(() => {});
  });
  
  collector.on('end', async () => {
    const players = Array.from(participants);
    
    if (players.length < 2) {
      return interaction.followUp({ 
        content: `😅 **Pas assez de participants !** Il faut au moins 2 joueurs pour la roulette.`, 
        allowedMentions: { users: [] } 
      });
    }
    
    // Élimination aléatoire
    const eliminated = players[Math.floor(Math.random() * players.length)];
    const survivors = players.filter(id => id !== eliminated);
    
    // Incrémenter les victoires des survivants
    for (const id of survivors) {
      incrementWin(interaction.guild.id, id, 'roulette');
    }
    
    await interaction.followUp({ 
      content: `💥 **BANG !**\n\n🔫 <@${eliminated}> a été éliminé !\n🏆 **Survivants :** ${survivors.map(id => `<@${id}>`).join(', ')}\n\n*La chance sourit aux audacieux... sauf à un !*`, 
      allowedMentions: { users: [...survivors, eliminated] } 
    });
  });
}