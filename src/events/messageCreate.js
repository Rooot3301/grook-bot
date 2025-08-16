import { handleLinkScan } from '../features/vtLinkScanner.js';
import { tryRickroll, tryProphecy } from '../features/easterEggs.js';
import { loadConfig, getModlogsChannel } from '../features/modlogs.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    // Ne pas traiter les messages du bot
    if (message.author.bot) return;
    const cfg = loadConfig();
    const guildCfg = cfg.guilds?.[message.guild?.id] || {};
    // Analyse VirusTotal
    const modlogsChannel = guildCfg.modlogs ? message.guild.channels.cache.get(guildCfg.modlogs) : null;
    await handleLinkScan(message, {
      features: { vtScanner: true },
      vtScanner: {
        cooldownChannelSec: 5,
        cacheTtlSec: 21600,
        logToModlogs: true
      }
    }, modlogsChannel);
    // Easter eggs : Rickroll et prophéties
    await tryRickroll(message, {});
    await tryProphecy(message, {});
  }
};