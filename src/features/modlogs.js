import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const configFile = path.join(path.resolve(), 'src', 'data', 'config.json');

function loadConfig() {
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({ guilds: {} }, null, 2), 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch {
    return { guilds: {} };
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2), 'utf8');
}

function setModlogsChannel(guildId, channelId) {
  const cfg = loadConfig();
  if (!cfg.guilds) cfg.guilds = {};
  if (!cfg.guilds[guildId]) cfg.guilds[guildId] = {};
  cfg.guilds[guildId].modlogs = channelId;
  saveConfig(cfg);
}

function getModlogsChannel(guildId) {
  const cfg = loadConfig();
  return cfg.guilds?.[guildId]?.modlogs || null;
}

/**
 * Envoie un embed de log dans le salon de modlogs configuré.
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Guild} guild
 * @param {Object} caseData Données du cas à journaliser
 */
export async function logCase(client, guild, caseData) {
  const channelId = getModlogsChannel(guild.id);
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor(0xff5555)
    .setTitle(`Cas ${caseData.type}`)
    .addFields(
      { name: 'ID', value: caseData.id, inline: true },
      { name: 'Utilisateur', value: `<@${caseData.userId}>`, inline: true },
      { name: 'Modérateur', value: `<@${caseData.moderatorId}>`, inline: true },
      { name: 'Raison', value: caseData.reason || 'Aucune raison' }
    )
    .setTimestamp();
  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur lors de l’envoi du log :', error);
  }
}

export { loadConfig, saveConfig, setModlogsChannel, getModlogsChannel };