import fs from 'fs';
import path from 'path';

/**
 * Charge tous les fichiers de commandes dans src/commands et les enregistre auprès de Discord.
 * Chaque fichier de commande doit exporter un objet `data` (SlashCommandBuilder) et une fonction `execute`.
 * Les commandes sont regroupées par dossier (catégorie) pour l'affichage du /help.
 *
 * @param {import('discord.js').Client} client Client Discord
 */
export async function loadCommands(client) {
  const commandsDir = path.join(path.resolve(), 'src', 'commands');

  /** @type {Array<ReturnType<import('discord.js').SlashCommandBuilder['toJSON']>>} */
  const commands = [];
  client.commands = new Map();
  client.commandCategories = new Map();

  const folders = fs.readdirSync(commandsDir).filter((f) => fs.statSync(path.join(commandsDir, f)).isDirectory());
  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const mod = await import(`../commands/${folder}/${file}`);
      const data = mod.data;
      const execute = mod.execute;
      if (!data || typeof execute !== 'function') {
        console.warn(`⛔ Ignoré: ${folder}/${file} n'exporte pas { data, execute }`);
        continue;
      }
      // Enregistrement local
      client.commands.set(data.name, { data, execute, category: folder });
      if (!client.commandCategories.has(folder)) client.commandCategories.set(folder, []);
      client.commandCategories.get(folder).push(data.name);
      // Pour l'API
      commands.push(data.toJSON());
    }
  }

  // Enregistrement auprès de l'API au démarrage
  client.once('ready', async () => {
    try {
      await client.application.commands.set(commands);
      console.log(`✔️ ${commands.length} commandes enregistrées.`);
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des commandes :', error);
    }
  });
}
