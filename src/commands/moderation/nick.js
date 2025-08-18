import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Modifie le pseudo d'un membre sur le serveur. Cette commande est utile pour
 * troller légèrement vos amis ou corriger un pseudo inapproprié.
 */
export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription('Changer le pseudo d’un membre.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption(o => o
    .setName('user')
    .setDescription('Utilisateur dont modifier le pseudo')
    .setRequired(true))
  .addStringOption(o => o
    .setName('pseudo')
    .setDescription('Nouveau pseudo')
    .setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const newNick = interaction.options.getString('pseudo', true).trim();
  const member = interaction.guild.members.cache.get(target.id);
  // Vérifier que le membre existe et est modifiable
  if (!member) {
    return interaction.reply({ content: `Je ne trouve pas cet utilisateur sur ce serveur.`, ephemeral: true });
  }
  // Vérifier la permission de l'appelant
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
    return interaction.reply({ content: `Vous n'avez pas la permission de modifier les pseudos.`, ephemeral: true });
  }
  // Vérifier que le bot peut modifier le pseudo (rôle supérieur)
  const botMember = interaction.guild.members.me;
  if (!botMember) {
    return interaction.reply({ content: `Je ne peux pas vérifier mes permissions sur ce serveur.`, ephemeral: true });
  }
  // Le bot doit avoir un rôle plus élevé que la cible et la cible ne doit pas être le propriétaire
  const targetHighest = member.roles.highest;
  const botHighest = botMember.roles.highest;
  if (botHighest.comparePositionTo(targetHighest) <= 0 || member.id === interaction.guild.ownerId) {
    return interaction.reply({ content: `Je ne peux pas changer le pseudo de cette personne (rôle trop élevé ou propriétaire).`, ephemeral: true });
  }
  // Valider la longueur du nouveau pseudo (Discord autorise entre 1 et 32 caractères)
  if (newNick.length < 1 || newNick.length > 32) {
    return interaction.reply({ content: `Le pseudo doit contenir entre 1 et 32 caractères.`, ephemeral: true });
  }
  try {
    await member.setNickname(newNick, `Changement demandé par ${interaction.user.tag}`);
    await interaction.reply({ content: `${member} a maintenant pour pseudo : **${newNick}**`, allowedMentions: { users: [] } });
  } catch (error) {
    console.error('Erreur dans la commande nick :', error);
    await interaction.reply({ content: `Impossible de changer le pseudo de ${member}.`, ephemeral: true });
  }
}