import fs from 'fs';
import path from 'path';

/**
 * Charge tous les événements du dossier src/events et les attache au client Discord.
 * Chaque fichier doit exporter `name`, `execute` et facultativement `once`.
 *
 * @param {import('discord.js').Client} client Client Discord
 */
export async function loadEvents(client) {
  const eventsDir = path.join(path.resolve(), 'src', 'events');
  if (!fs.existsSync(eventsDir)) return;
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(eventsDir, file);
    const event = await import(`../events/${file}`);
    if (!event || !event.name || !event.execute) continue;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}