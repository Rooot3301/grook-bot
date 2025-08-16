import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';
import { config as loadEnv } from 'dotenv';

/**
 * Script de déploiement des commandes slash sans démarrer le bot.
 * Utilisation:
 *   DISCORD_TOKEN=... CLIENT_ID=... node src/deploy-commands.js
 *   (Optionnel) GUILD_ID=... pour déployer uniquement sur un serveur de dev.
 */

// Localiser .env à la racine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.resolve(__dirname, '..', '.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN et CLIENT_ID doivent être définis.');
  process.exit(1);
}

/** Récupère la liste des fichiers de commandes */
function walkCommands(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkCommands(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

async function loadAllCommands() {
  const commandsDir = path.resolve(__dirname, 'commands');
  const files = walkCommands(commandsDir);
  /** @type {any[]} */
  const payload = [];
  for (const file of files) {
    // Construire l'import relatif à src
    const relFromSrc = path.relative(path.resolve(__dirname), file).replace(/\\/g, '/');
    const mod = await import(`./${relFromSrc}`);
    if (!mod.data) {
      console.warn(`(skip) ${relFromSrc} n'exporte pas 'data'.`);
      continue;
    }
    payload.push(mod.data.toJSON());
  }
  return payload;
}

async function deploy() {
  const rest = new REST({ version: '10' }).setToken(token);
  const commands = await loadAllCommands();

  try {
    if (guildId) {
      console.log(`📦 Déploiement de ${commands.length} commande(s) sur le serveur ${guildId}…`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('✅ Commandes enregistrées sur le serveur.');
    } else {
      console.log(`📦 Déploiement de ${commands.length} commande(s) globales…`);
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ Commandes globales enregistrées.');
    }
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
    process.exitCode = 1;
  }
}

deploy();
