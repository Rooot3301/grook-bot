import { Client, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import { config as loadEnv } from 'dotenv';
import { loadCommands } from './loader/commands.js';
import { loadEvents } from './loader/events.js';
import { startRichPresenceRotation } from './features/richPresence.js';

// Charge les variables d'environnement depuis .env
loadEnv();

// Crée une nouvelle instance du client Discord avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message]
});


// --- verbose logs injected ---
client.on('debug', (m) => console.log('[djs:debug]', m));
client.on('warn', (m) => console.warn('[djs:warn]', m));
client.on('error', (e) => console.error('[djs:error]', e));
if (client.rest?.on) {
  client.rest.on('rateLimited', (info) => {
    console.warn('[REST:rateLimited]', { route: info.route, timeoutMs: info.timeToReset, limit: info.limit });
  });
}
console.log('[boot] intents:', Array.from(client.options.intents || []));
console.log('[boot] partials:', client.options.partials);
// --- end verbose logs injected ---
// Initialiser une map pour les gestionnaires d’interactions (boutons, modals, etc.)
client.interactionHandlers = new Map();

// Charge les commandes et les événements
await loadCommands(client);
await loadEvents(client);

// Connecte le bot
client.login(process.env.DISCORD_TOKEN);

// Lorsque le bot est prêt, démarre la rotation du statut riche
client.once('ready', () => {
  console.log(`🤖 ${client.user.tag} est connecté et prêt.`);
  console.log(`[ready] ID: ${client.user.id}`);
  startRichPresenceRotation(client);
});