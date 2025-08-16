import { tryLazyResponse } from '../features/easterEggs.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      console.log(`[interaction] ${interaction.user.tag} -> /${interaction.commandName} in #${interaction.channel?.name} (${interaction.guild?.name})`);
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.warn(`[interaction] missing handler for /${interaction.commandName}`);
        return;
      }
      const lazy = await tryLazyResponse(interaction, {});
      if (lazy) {
        console.log(`[interaction] lazy-abort /${interaction.commandName}`);
        return;
      }
      try {
        await command.execute(interaction, client);
        console.log(`[interaction] OK /${interaction.commandName}`);
      } catch (error) {
        console.error(`[interaction] FAIL /${interaction.commandName}:`, error);
        const content = '❌ Une erreur est survenue lors de l’exécution de la commande.';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }

    if (interaction.isButton() || interaction.isModalSubmit()) {
      console.log(`[interaction] UI ${interaction.customId} by ${interaction.user.tag}`);
      const handler = client.interactionHandlers?.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction, client);
        } catch (error) {
          console.error('Erreur dans un gestionnaire d’interface :', error);
        }
      } else {
        console.warn(`[interaction] no handler for ${interaction.customId}`);
      }
    }
  }
};
