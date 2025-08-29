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
 *   (Optionnel) WIPE_BEFORE_DEPLOY=true pour vider avant de pousser.
 */

// Localiser .env à la racine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.resolve(__dirname, '..', '.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const wipe = String(process.env.WIPE_BEFORE_DEPLOY || '').toLowerCase() === 'true';

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN et CLIENT_ID doivent être définis.');
  process.exit(1);
}

function walkCommands(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkCommands(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

async function loadAllCommands() {
  const commandsDir = path.resolve(__dirname, 'commands');
  const files = walkCommands(commandsDir).sort((a, b) => a.localeCompare(b));
  const payload = [];
  for (const file of files) {
    const relFromSrc = path.relative(path.resolve(__dirname), file).replace(/\\/g, '/');
    const mod = await import(`./${relFromSrc}`);
    if (!mod.data) {
      console.warn(`(skip) ${relFromSrc} n'exporte pas 'data'.`);
      continue;
    }
    payload.push(mod.data.toJSON());
  }
  // Éliminer les doublons de noms de commande pour éviter les 400 "duplicate name"
  const unique = new Map();
  for (const cmd of payload) {
    if (unique.has(cmd.name)) {
      console.warn(`[deploy] duplicate command name detected: ${cmd.name} — skipping later duplicate`);
      continue;
    }
    unique.set(cmd.name, cmd);
  }
  return [...unique.values()];
}

async function deploy() {
  const rest = new REST({ version: '10' }).setToken(token);
  const commands = await loadAllCommands();
  console.log('[deploy] payload:', commands.map(c => c.name));

  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  console.log('[deploy] route:', guildId ? 'applicationGuildCommands' : 'applicationCommands');

  try {
    if (wipe) {
      await rest.put(route, { body: [] });
      console.log('[deploy] cleared existing commands');
    }
    await rest.put(route, { body: commands });
    console.log(guildId ? '✅ Commandes enregistrées sur le serveur.' : '✅ Commandes globales enregistrées.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
    process.exitCode = 1;
  }
}

deploy();
