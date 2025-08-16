import fs from 'fs';
import path from 'path';

/**
 * Charge tous les fichiers de commandes dans src/commands et les enregistre auprès de Discord.
 * Chaque fichier de commande doit exporter `data` (SlashCommandBuilder) et `execute`.
 */
export async function loadCommands(client) {
  const commandsDir = path.join(path.resolve(), 'src', 'commands');

  /** @type {Array<ReturnType<import('discord.js').SlashCommandBuilder['toJSON']>>} */
  const commands = [];
  client.commands = new Map();
  client.commandCategories = new Map();

  const folders = fs.readdirSync(commandsDir)
    .filter((f) => fs.statSync(path.join(commandsDir, f)).isDirectory())
    .sort((a, b) => a.localeCompare(b));

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    const files = fs.readdirSync(folderPath)
      .filter((f) => f.endsWith('.js'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const mod = await import(`../commands/${folder}/${file}`);
      const data = mod.data;
      const execute = mod.execute;
      if (!data || typeof execute !== 'function') {
        console.warn(`⛔ Ignoré: ${folder}/${file} n'exporte pas { data, execute }`);
        continue;
      }
      client.commands.set(data.name, { data, execute, category: folder });
      if (!client.commandCategories.has(folder)) client.commandCategories.set(folder, []);
      client.commandCategories.get(folder).push(data.name);

      commands.push(data.toJSON());
      console.log(`[commands] loaded ${folder}/${file} -> /${data.name}`);
    }
  }

  // rendre l'affichage /help stable
  for (const [category, list] of client.commandCategories) {
    client.commandCategories.set(category, list.slice().sort((a, b) => a.localeCompare(b)));
  }

  client.once('ready', async () => {
    try {
      console.log(`[commands] registering ${commands.length} command(s) globally...`);
      await client.application.commands.set(commands);
      console.log(`✔️ ${commands.length} commandes enregistrées.`);
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des commandes :', error);
    }
  });
}
