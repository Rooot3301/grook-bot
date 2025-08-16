import { EmbedBuilder, Colors } from 'discord.js';
import { URL as NodeURL } from 'node:url';

// Carte pour le cache : { urlId: { verdict, stats, fetchedAt } }
const cache = new Map();

/**
 * Analyse un lien via l'API VirusTotal. Utilise un cache pour réduire les requêtes.
 *
 * @param {string} rawUrl Lien brut
 * @param {number} cacheTtlSec Temps de validité du cache en secondes
 * @returns {Promise<Object|null>} Verdict et statistiques ou null si non disponible
 */
async function analyzeUrl(rawUrl, cacheTtlSec = 21600) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;
  // Nettoie l'URL (supprime les paramètres de tracking courants)
  const url = sanitizeUrl(rawUrl);
  const urlId = toBase64Url(url);
  const now = Date.now();
  const cached = cache.get(urlId);
  if (cached && now - cached.fetchedAt < cacheTtlSec * 1000) {
    return cached;
  }
  try {
    // Récupère un rapport existant via l'ID de l'URL
    const report = await vtGet(`/urls/${urlId}`, apiKey);
    const stats = report?.data?.attributes?.last_analysis_stats;
    const verdict = decideVerdict(stats);
    const result = { verdict, stats: stats || {}, fetchedAt: now, finalUrl: url };
    cache.set(urlId, result);
    return result;
  } catch (error) {
    // En cas d’erreur (rapport inexistant ou dépassement de quota), ignore
    return null;
  }
}

/**
 * Sanitize l'URL en supprimant certains paramètres de tracking.
 * @param {string} u
 * @returns {string}
 */
function sanitizeUrl(u) {
  try {
    const url = new NodeURL(u);
    // paramètres à supprimer
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','ref','si'].forEach(p => url.searchParams.delete(p));
    url.hash = '';
    return url.toString();
  } catch {
    return u;
  }
}

/**
 * Convertit une chaîne en base64 URL safe (sans padding, remplace + et /).
 * @param {string} str
 */
function toBase64Url(str) {
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Appelle l'API VirusTotal GET.
 */
async function vtGet(path, apiKey) {
  const res = await fetch(`https://www.virustotal.com/api/v3${path}`, {
    headers: { 'x-apikey': apiKey, 'accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`VT GET ${path} => ${res.status}`);
  return res.json();
}

/**
 * Décide le verdict selon les statistiques VirusTotal.
 * @param {Object} stats
 */
function decideVerdict(stats) {
  if (!stats) return 'UNKNOWN';
  if ((stats.malicious || 0) > 0) return 'DANGEROUS';
  if ((stats.suspicious || 0) > 0) return 'SUSPICIOUS';
  if ((stats.harmless || 0) > 0 || (stats.undetected || 0) > 0) return 'SAFE';
  return 'UNKNOWN';
}

/**
 * Extrait la première URL d'un texte.
 * @param {string} text
 * @returns {string|null}
 */
function extractUrl(text) {
  const regex = /https?:\/\/[^\s<>()\[\]{}|^`"']+/i;
  const match = regex.exec(text);
  return match ? match[0] : null;
}

/**
 * Traite un message pour effectuer une analyse VirusTotal et envoyer un embed si nécessaire.
 * @param {import('discord.js').Message} message
 * @param {Object} cfg Configuration du scanner
 * @param {import('discord.js').TextBasedChannel|null} modlogsChannel Canal de log
 */
export async function handleLinkScan(message, cfg, modlogsChannel) {
  if (!cfg?.features?.vtScanner) return;
  if (message.author.bot) return;
  const url = extractUrl(message.content);
  if (!url) return;
  // cooldown simple : une seule analyse par message, et par salon toutes les 5 secondes
  const now = Date.now();
  const last = handleLinkScan.lastTime || 0;
  if (now - last < (cfg.vtScanner?.cooldownChannelSec ?? 5) * 1000) return;
  handleLinkScan.lastTime = now;
  const report = await analyzeUrl(url, cfg.vtScanner?.cacheTtlSec ?? 21600);
  if (!report) return;
  const { verdict, stats, finalUrl } = report;
  const colorMap = { DANGEROUS: Colors.Red, SUSPICIOUS: Colors.Orange, SAFE: Colors.Green, UNKNOWN: Colors.Greyple };
  const embed = new EmbedBuilder()
    .setTitle(`Analyse de lien (${verdict})`)
    .setDescription(`[${finalUrl}](${finalUrl})`)
    .setColor(colorMap[verdict] || Colors.Blurple)
    .addFields(
      { name: 'Malveillants', value: String(stats.malicious || 0), inline: true },
      { name: 'Suspects', value: String(stats.suspicious || 0), inline: true },
      { name: 'Inoffensifs', value: String(stats.harmless || 0), inline: true }
    )
    .setFooter({ text: 'Propulsé par VirusTotal' })
    .setTimestamp();
  const target = (cfg.vtScanner?.logToModlogs && modlogsChannel) ? modlogsChannel : message.channel;
  try {
    await target.send({ embeds: [embed] });
  } catch {
    // ignorer les erreurs d'envoi
  }
}