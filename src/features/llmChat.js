// src/features/llmChat.js
// Réponses conversationnelles via un LLM local (Ollama).
// Ce module permet au bot de répondre de manière plus naturelle lorsque quelqu’un le mentionne.
// Il fonctionne sans API payante : il suffit d’installer et de lancer Ollama en local.

// Paramètres récupérés depuis .env. Voir README pour les détails d'installation.
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '256', 10);
const TEMPERATURE = Number(process.env.LLM_TEMPERATURE || '0.4');
const SYSTEM_PROMPT = process.env.LLM_SYSTEM_PROMPT ||
  'Tu es Grook, un bot Discord utile et concis. Réponds toujours en français, avec humour quand c’est approprié.';
const ENABLED = String(process.env.LLM_ON_MENTION || 'true').toLowerCase() === 'true';

// Mémoire courte par utilisateur pour garder un minimum de contexte sur la conversation.
// Chaque entrée : { role: 'user' | 'assistant', content: string, at: timestamp }
const memory = new Map();
const TTL_MS = 10 * 60 * 1000; // On garde 10 minutes d’historique
const MAX_TURNS = 6; // On ne garde que les 6 derniers échanges

function pushHistory(key, role, content) {
  const now = Date.now();
  const list = memory.get(key) || [];
  const next = list
    // Ne conserver que les messages récents
    .filter((m) => now - m.at < TTL_MS)
    // Ajouter le nouveau message
    .concat([{ role, content: content.slice(0, 1200), at: now }])
    // Limiter le nombre de messages conservés
    .slice(-MAX_TURNS);
  memory.set(key, next);
  return next;
}

function buildPrompt(history) {
  const header = `SYSTEM:\n${SYSTEM_PROMPT}\n\n`;
  const turns = history
    .map((msg) => {
      const prefix = msg.role === 'user' ? 'USER' : 'ASSISTANT';
      return `${prefix}: ${msg.content}`;
    })
    .join('\n');
  return `${header}${turns}\nASSISTANT:`;
}

async function callOllama(prompt) {
  const body = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: TEMPERATURE,
      num_predict: MAX_TOKENS,
    },
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20 s max
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return (data.response || '').trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Tente de gérer une mention avec le LLM. Retourne true si une réponse a été envoyée.
 * @param {import('discord.js').Message} message
 * @param {import('discord.js').Client} client
 */
export async function handleMentionLLM(message, client) {
  if (!ENABLED) return false;
  // Vérification basique pour ignorer certaines mentions
  if (!message.guild || !message.content) return false;
  if (!message.mentions || !message.mentions.users) return false;
  // Le bot est-il mentionné ?
  if (!message.mentions.users.has(client.user.id)) return false;
  // Ignorer les messages @everyone ou @here
  if (message.mentions.everyone) return false;
  // Ignorer si trop de mentions pour ne pas spammer
  if (message.mentions.users.size > 5) return false;
  // Extraire le contenu hors mention
  const cleaned = message.content
    .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
    .trim();
  if (!cleaned) return false;
  // Historique (contexte) par utilisateur/guilde
  const key = `${message.guild.id}:${message.author.id}`;
  const hist = pushHistory(key, 'user', cleaned);
  const prompt = buildPrompt(hist);
  try {
    // Indique à Discord que le bot est en train de composer une réponse
    await message.channel.sendTyping();
    const response = await callOllama(prompt);
    if (!response) return false;
    // Ajouter la réponse dans l’historique
    pushHistory(key, 'assistant', response);
    // Discord limite à 2000 caractères, on découpe si besoin
    const chunks = response.match(/.{1,1800}/gs) || [response];
    for (const [i, chunk] of chunks.entries()) {
      if (i >= 3) break; // Ne pas envoyer plus de 3 messages d’un coup
      await message.reply({ content: chunk });
    }
    return true;
  } catch (err) {
    console.error('[llmChat] erreur :', err);
    try { await message.react('💤'); } catch {} // Réaction discrète en cas d'échec
    return false;
  }
}