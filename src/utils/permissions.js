// Utility functions to centralize permission checks.
// These helpers ensure the bot can perform moderation actions on a target member.

/**
 * Returns true if the bot is allowed to perform a moderation action on the target.
 * It checks that the bot has a role higher than the target and that the target
 * is not the guild owner. If the bot member cannot be resolved, it returns false.
 *
 * @param {import('discord.js').GuildMember} target The member to be moderated
 * @returns {boolean}
 */
export function canModerate(target) {
  const guild = target.guild;
  const botMember = guild.members.me;
  if (!botMember) return false;
  // Never allow actions on the owner
  if (target.id === guild.ownerId) return false;
  const botHighest = botMember.roles.highest;
  const targetHighest = target.roles.highest;
  // The bot must have a strictly higher role than the target
  return botHighest.comparePositionTo(targetHighest) > 0;
}