// Hotfix deploy script with duplicate-name guard and legacy filter
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { REST, Routes } from 'discord.js';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.resolve(__dirname, '..', '.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const wipe = String(process.env.WIPE_BEFORE_DEPLOY || 'false').toLowerCase() === 'true';

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN et/ou CLIENT_ID manquants. Vérifie ton .env');
  process.exit(1);
}

const commandsDir = path.join(path.resolve(), 'src', 'commands');
const all = [];
async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && e.name.endsWith('.js')) {
      try {
        const mod = await import(pathToFileURL(p));
        const data = mod?.data?.toJSON?.() ?? mod?.data;
        const execute = mod?.execute;
        if (data?.name && typeof execute === 'function') all.push({ name: data.name, data });
      } catch (err) {
        console.warn('[deploy] Ignored file (load error):', p, err?.message);
      }
    }
  }
}
await walk(commandsDir);

// HOTFIX region
const LEGACY_BLOCKLIST = new Set(['config']); // we now ship /settings instead
const unique = new Map();
for (const c of all) {
  if (LEGACY_BLOCKLIST.has(c.name)) {
    console.warn(`[deploy] filtered legacy command: ${c.name}`);
    continue;
  }
  if (unique.has(c.name)) {
    console.warn(`[deploy] duplicate command detected: ${c.name} — keeping the first, skipping the rest`);
    continue;
  }
  unique.set(c.name, c.data);
}
const payload = Array.from(unique.entries()).map(([k, v]) => v);
console.log('[deploy] payload:', Array.from(unique.keys()));

const rest = new REST({ version: '10' }).setToken(token);
async function deploy() {
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);
  console.log('[deploy] route:', guildId ? 'applicationGuildCommands' : 'applicationCommands');
  try {
    if (wipe) {
      await rest.put(route, { body: [] });
      console.log('[deploy] cleared existing commands');
    }
    await rest.put(route, { body: payload });
    console.log(guildId ? '✅ Commandes enregistrées sur le serveur.' : '✅ Commandes globales enregistrées.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
    process.exitCode = 1;
  }
}
deploy();