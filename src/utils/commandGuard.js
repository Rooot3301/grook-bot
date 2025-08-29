import { PermissionsBitField } from 'discord.js';
const cooldowns = new Map(); // `${cmd}:${userId}` -> ts
export function withGuard(handler, {
  perms = [],
  cooldownMs = 3000,
  ephemeralByDefault = false,
} = {}) {
  return async (interaction, client) => {
    try {
      if (!interaction.isChatInputCommand()) return;
      const key = `${interaction.commandName}:${interaction.user.id}`;
      const last = cooldowns.get(key) || 0;
      if (Date.now() - last < cooldownMs) {
        return interaction.reply({ content: '⏳ Patience…', ephemeral: true });
      }
      cooldowns.set(key, Date.now());
      if (interaction.inGuild() && perms.length) {
        const member = interaction.member;
        if (!member?.permissions?.has(new PermissionsBitField(perms))) {
          return interaction.reply({ content: '⛔ Permission insuffisante.', ephemeral: true });
        }
      }
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: ephemeralByDefault });
      }
      return await handler(interaction, client);
    } catch (err) {
      const msg = '❌ Erreur inattendue.';
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
      } else {
        await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
      }
      console.error('[commandGuard]', err);
    }
  };
}
