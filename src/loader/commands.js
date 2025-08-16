import fs from 'fs';
import path from 'path';

/**
 * Charge tous les fichiers de commandes dans src/commands et les enregistre auprès de Discord.
 * Chaque fichier de commande doit exporter un objet `data` (SlashCommandBuilder) et une fonction `execute`.
 * Les commandes sont regroupées par dossier (catégorie) pour l'affichage du help.
 *
 * @param {import('discord.js').Client} client Client Discord
 */
export async function loadCommands(client) {
  const commandsDir = path.join(path.resolve(), 'src', 'commands');
  const commandFolders = fs.readdirSync(commandsDir);
  const commands = [];
  client.commands = new Map();
  client.commandCategories = new Map();

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const { data, execute } = await import(`../commands/${folder}/${file}`);
      if (!data || !execute) continue;
      const command = { data, execute, category: folder };
      commands.push(data.toJSON());
      client.commands.set(data.name, command);
      // Ajoute la commande à sa catégorie
      if (!client.commandCategories.has(folder)) client.commandCategories.set(folder, []);
      client.commandCategories.get(folder).push(data.name);
    }
  }

  // Enregistre toutes les commandes globalement lors de l'événement ready
  client.once('ready', async () => {
    try {
      await client.application.commands.set(commands);
      console.log(`✔️ ${commands.length} commandes enregistrées.`);
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des commandes :', error);
    }
  });
}