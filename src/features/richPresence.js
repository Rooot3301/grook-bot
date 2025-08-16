import { ActivityType } from 'discord.js';
import fs from 'fs';
import path from 'path';

/**
 * Démarre une rotation de statut riche (presence) pour le bot.
 * Cette fonction lit le numéro de version depuis package.json et alterne entre des messages sérieux et humoristiques.
 *
 * @param {import('discord.js').Client} client
 */
export function startRichPresenceRotation(client) {
  // Lire la version depuis package.json
  let version = '1.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(path.resolve(), 'package.json'), 'utf8'));
    version = pkg.version || version;
  } catch {
    // ignore
  }
  const statuses = [
    { type: ActivityType.Watching, text: 'Créé par Root3301' },
    { type: ActivityType.Playing, text: `Grook v${version}` },
    { type: ActivityType.Listening, text: 'les larmes des bannis' },
    { type: ActivityType.Playing, text: 'Minecraft 2 (early access)' },
    { type: ActivityType.Playing, text: 'GTA 6 bêta fermée' },
    { type: ActivityType.Competing, text: 'au championnat du spam mondial' },
    { type: ActivityType.Watching, text: 'vos destins 📜' }
  ];
  let index = 0;
  const rotate = () => {
    const status = statuses[index % statuses.length];
    client.user?.setPresence({ activities: [{ name: status.text, type: status.type }], status: 'online' });
    index++;
  };
  // Démarrer immédiatement puis toutes les 15 minutes
  rotate();
  setInterval(rotate, 1000 * 60 * 15);
}