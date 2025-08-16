import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';
import { config as loadEnv } from 'dotenv';

// Déploiement hors ligne des commandes slash.
//
// Ce script permet d'enregistrer ou de mettre à jour l'ensemble des
// commandes slash disponibles dans le répertoire `src/commands` sans
// démarrer le bot en entier.  Il peut être lancé via la commande
// `npm run deploy` après avoir défini les variables d'environnement
// `DISCORD_TOKEN` et `CLIENT_ID`.  Pour enregistrer les commandes
// uniquement dans un serveur spécifique (mode développement), ajoutez
// également `GUILD_ID` à votre fichier `.env` ou à votre session.

// Chargement du fichier .env situé à la racine du projet
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.resolve(__dirname, '..', '.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('❌ Les variables DISCORD_TOKEN et CLIENT_ID doivent être définies pour déployer les commandes.');
  process.exit(1);
}

// Fonction utilitaire pour parcourir récursivement le dossier de commandes
function walkCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkCommands(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

async function buildCommandData() {
  const commands = [];
  const commandsDir = path.join(__dirname, 'commands');
  const files = walkCommands(commandsDir);
  for (const file of files) {
    const modulePath = `file://${file}`;
    const cmd = await import(modulePath);
    if (cmd?.data && typeof cmd.data.toJSON === 'function') {
      commands.push(cmd.data.toJSON());
    }
  }
  return commands;
}

async function deploy() {
  const commands = await buildCommandData();
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    if (guildId) {
      console.log(`📦 Déploiement des ${commands.length} commandes sur le serveur ${guildId}…`);
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log('✅ Commandes enregistrées sur le serveur.');
    } else {
      console.log(`📦 Déploiement des ${commands.length} commandes globales…`);
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log('✅ Commandes globales enregistrées.');
    }
  } catch (error) {
    console.error('❌ Une erreur est survenue lors du déploiement des commandes :', error);
  }
}

deploy();