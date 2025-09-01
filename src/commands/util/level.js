import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserLevel, getLeaderboard, getLevelStats } from '../../features/levelSystem.js';
import { Colors } from '../../utils/theme.js';

export const data = new SlashCommandBuilder()
  .setName('level')
  .setDescription('🎯 Système de niveaux et classements')
  .addSubcommand(sub =>
    sub.setName('me')
       .setDescription('Voir ton niveau actuel')
  )
  .addSubcommand(sub =>
    sub.setName('user')
       .setDescription('Voir le niveau d\'un autre membre')
       .addUserOption(opt => opt.setName('membre').setDescription('Membre à consulter').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('leaderboard')
       .setDescription('Classement du serveur')
       .addIntegerOption(opt => opt.setName('limite').setDescription('Nombre de membres à afficher').setMinValue(5).setMaxValue(25))
  )
  .addSubcommand(sub =>
    sub.setName('stats')
       .setDescription('Statistiques globales du serveur')
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  
  if (!guildId) {
    return interaction.reply({ content: '❌ Cette commande ne fonctionne qu\'en serveur.', ephemeral: true });
  }
  
  switch (subcommand) {
    case 'me':
      return handleUserLevel(interaction, interaction.user.id);
    case 'user':
      const targetUser = interaction.options.getUser('membre', true);
      return handleUserLevel(interaction, targetUser.id, targetUser);
    case 'leaderboard':
      return handleLeaderboard(interaction);
    case 'stats':
      return handleStats(interaction);
    default:
      return interaction.reply({ content: '❌ Sous-commande non reconnue.', ephemeral: true });
  }
}

async function handleUserLevel(interaction, userId, targetUser = null) {
  const user = targetUser || interaction.user;
  const member = interaction.guild.members.cache.get(userId);
  const displayName = member?.displayName || user.username;
  
  const levelData = await getUserLevel(interaction.guildId, userId);
  
  const embed = new EmbedBuilder()
    .setTitle(`🎯 Niveau de ${displayName}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setColor(Colors.info)
    .addFields(
      { name: '📊 Niveau', value: `**${levelData.level}**`, inline: true },
      { name: '⭐ XP Total', value: `**${levelData.xp.toLocaleString()}**`, inline: true },
      { name: '🏆 Rang', value: levelData.rank ? `**#${levelData.rank}**` : 'Non classé', inline: true },
      { name: '💬 Messages', value: `**${levelData.totalMessages.toLocaleString()}**`, inline: true },
      { name: '🎯 Prochain niveau', value: levelData.xpForNext > 0 ? `**${levelData.xpForNext.toLocaleString()}** XP` : '**MAX**', inline: true },
      { name: '📈 Progression', value: createProgressBar(levelData), inline: false }
    );
  
  // Ajouter le palier spécial si disponible
  if (levelData.milestone) {
    embed.addFields({
      name: '🏅 Titre actuel',
      value: `**${levelData.milestone.title}**\n*${levelData.milestone.message}*`,
      inline: false
    });
  }
  
  embed.setFooter({ text: '💡 Gagne de l\'XP en envoyant des messages !' });
  
  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction) {
  const limit = interaction.options.getInteger('limite') || 10;
  const leaderboard = await getLeaderboard(interaction.guildId, limit);
  
  if (leaderboard.length === 0) {
    return interaction.reply({ 
      content: '📊 Aucune donnée de niveau disponible pour ce serveur.', 
      ephemeral: true 
    });
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🏆 Classement du Serveur')
    .setColor(Colors.success)
    .setDescription('*Top des membres les plus actifs*');
  
  const leaderboardText = await Promise.all(
    leaderboard.map(async (userData, index) => {
      const member = interaction.guild.members.cache.get(userData.userId);
      const displayName = member?.displayName || member?.user?.username || 'Membre inconnu';
      
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[index] || `**${index + 1}.**`;
      
      const milestone = userData.milestone ? ` • ${userData.milestone.title}` : '';
      
      return `${medal} **${displayName}**\n` +
             `└ Niveau ${userData.level} • ${userData.xp.toLocaleString()} XP${milestone}`;
    })
  );
  
  embed.addFields({
    name: '📊 Classement',
    value: leaderboardText.join('\n\n'),
    inline: false
  });
  
  embed.setFooter({ text: `Affichage des ${leaderboard.length} premiers membres` });
  
  await interaction.reply({ embeds: [embed] });
}

async function handleStats(interaction) {
  const stats = await getLevelStats(interaction.guildId);
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Statistiques du Serveur')
    .setColor(Colors.info)
    .addFields(
      { name: '👥 Membres actifs', value: `**${stats.totalUsers.toLocaleString()}**`, inline: true },
      { name: '💬 Messages totaux', value: `**${stats.totalMessages.toLocaleString()}**`, inline: true },
      { name: '⭐ XP total', value: `**${stats.totalXp.toLocaleString()}**`, inline: true },
      { name: '📈 Niveau moyen', value: `**${stats.averageLevel}**`, inline: true },
      { name: '🏆 Plus haut niveau', value: `**${stats.highestLevel}**`, inline: true },
      { name: '💡 Activité', value: stats.totalMessages > 0 ? '**Serveur actif**' : '**Serveur calme**', inline: true }
    )
    .setFooter({ text: '🎯 Continuez à discuter pour faire grandir la communauté !' });
  
  await interaction.reply({ embeds: [embed] });
}

/**
 * Crée une barre de progression visuelle
 * @param {Object} levelData 
 * @returns {string}
 */
function createProgressBar(levelData) {
  if (levelData.xpForNext <= 0) return '🌟 **NIVEAU MAX ATTEINT !**';
  
  const currentLevelXp = levelData.xp - (levelData.level > 0 ? getXpRequiredForLevel(levelData.level) : 0);
  const nextLevelXp = getXpRequiredForLevel(levelData.level + 1) - getXpRequiredForLevel(levelData.level);
  
  const progress = Math.min(1, currentLevelXp / nextLevelXp);
  const filledBars = Math.round(progress * 10);
  const emptyBars = 10 - filledBars;
  
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
  const percentage = Math.round(progress * 100);
  
  return `\`${progressBar}\` ${percentage}%`;
}

/**
 * Calcule l'XP requis pour un niveau (copie de la fonction du levelSystem)
 * @param {number} level 
 * @returns {number}
 */
function getXpRequiredForLevel(level) {
  if (level <= 0) return 0;
  let totalXp = 0;
  const baseXp = 100;
  const multiplier = 1.2;
  for (let i = 1; i <= level; i++) {
    totalXp += Math.floor(baseXp * Math.pow(multiplier, i - 1));
  }
  return totalXp;
}