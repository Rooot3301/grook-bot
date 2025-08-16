import { tryLazyResponse } from '../features/easterEggs.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Commandes slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      // Easter egg paresseux : peut interrompre la commande
      const lazy = await tryLazyResponse(interaction, {});
      if (lazy) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Erreur dans la commande ${interaction.commandName}:`, error);
        const content = '❌ Une erreur est survenue lors de l’exécution de la commande.';
        if (interaction.replied || interaction.deferred) {
          // Répondre discrètement en cas d'erreur après une première réponse
          await interaction.followUp({ content, ephemeral: true });
        } else {
          // Première réponse en cas d'erreur
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
    // Gestion des interactions par bouton ou modal
    // Les commandes de jeux peuvent définir leurs propres gestionnaires dans client.interactionHandlers
    if (interaction.isButton() || interaction.isModalSubmit()) {
      const handler = client.interactionHandlers?.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction, client);
        } catch (error) {
          console.error('Erreur dans un gestionnaire d’interface :', error);
        }
      }
    }
  }
};