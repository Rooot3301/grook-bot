import { EmbedBuilder } from 'discord.js';
// Default config (sobre)
const defaultConfig = {
  rickrollChance: 0.0005,   // 0.05 %
  lazyChance: 0.005,        // 0.5 %
  prophecyChance: 0.0002,   // 0.02 %
  prophecyCooldownMs: 1000 * 60 * 60 * 6,
  rickrollCooldownMs: 1000 * 60 * 60, // 60 min / guilde
  lazyUserCooldownMs: 1000 * 60 * 30, // 30 min / user
  perGuildMaxPerHour: 2,
  perGuildMaxPerDay: 8,
  channelBlacklist: [],
  roleWhitelist: [],
};
const lastProphecyTimes = new Map();
const lastRickrollTimes = new Map();
const lastLazyUserTimes = new Map();
const hourlyCounters = new Map();
const dailyCounters = new Map();
function nowHourKey() { const d = new Date(); return `${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}`; }
function nowDayKey()  { const d = new Date(); return `${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}`; }
function incCounters(guildId) {
  const hKey = nowHourKey(), dKey = nowDayKey();
  const h = hourlyCounters.get(guildId) || { hourKey: hKey, count: 0 };
  const d = dailyCounters.get(guildId)  || { dayKey: dKey, count: 0 };
  if (h.hourKey !== hKey) { h.hourKey = hKey; h.count = 0; }
  if (d.dayKey !== dKey)  { d.dayKey  = dKey; d.count = 0; }
  h.count++; d.count++;
  hourlyCounters.set(guildId, h);
  dailyCounters.set(guildId, d);
}
function underCaps(guildId, cfg) {
  const hKey = nowHourKey(), dKey = nowDayKey();
  const h = hourlyCounters.get(guildId);
  const d = dailyCounters.get(guildId);
  const hc = (!h || h.hourKey !== hKey) ? 0 : h.count;
  const dc = (!d || d.dayKey  !== dKey)  ? 0 : d.count;
  return hc < (cfg.perGuildMaxPerHour ?? 2) && dc < (cfg.perGuildMaxPerDay ?? 8);
}
function allowedInChannel(message, cfg) {
  if (!message?.guild) return false;
  if (cfg.channelBlacklist?.length && cfg.channelBlacklist.includes(message.channelId)) return false;
  if (cfg.roleWhitelist?.length) {
    const member = message.member;
    if (!member?.roles?.cache?.some(r => cfg.roleWhitelist.includes(r.id))) return false;
  }
  return underCaps(message.guild.id, cfg);
}
function getGuildConfig(/* guildId */) { return { ...defaultConfig }; }
// Rickroll
export async function tryRickroll(message) {
  if (!message?.guild || message.author.bot) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!allowedInChannel(message, cfg)) return false;
  const last = lastRickrollTimes.get(message.guild.id) || 0;
  if (Date.now() - last < (cfg.rickrollCooldownMs ?? 3600000)) return false;
  if (Math.random() < (cfg.rickrollChance ?? 0)) {
    incCounters(message.guild.id);
    lastRickrollTimes.set(message.guild.id, Date.now());
    await message.channel.send('https://youtu.be/dQw4w9WgXcQ');
    return true;
  }
  return false;
}
// Lazy
export async function tryLazyResponse(interaction) {
  if (!interaction?.inGuild?.() || interaction.user?.bot) return false;
  const cfg = getGuildConfig(interaction.guildId);
  const key = `${interaction.guildId}:${interaction.user.id}`;
  const last = lastLazyUserTimes.get(key) || 0;
  if (Date.now() - last < (cfg.lazyUserCooldownMs ?? 1800000)) return false;
  if (!underCaps(interaction.guildId, cfg)) return false;
  if (Math.random() < (cfg.lazyChance ?? 0)) {
    incCounters(interaction.guildId);
    lastLazyUserTimes.set(key, Date.now());
    await interaction.editReply('🦥 *…hmm… plus tard peut-être.*');
    return true;
  }
  return false;
}
// Prophecy
export async function tryProphecy(message) {
  if (!message?.guild || message.author.bot) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!allowedInChannel(message, cfg)) return false;
  const guildId = message.guild.id;
  const last = lastProphecyTimes.get(guildId) || 0;
  if (Date.now() - last < (cfg.prophecyCooldownMs ?? 21600000)) return false;
  if (Math.random() < (cfg.prophecyChance ?? 0)) {
    incCounters(guildId);
    const props = [
      '🔮 Une prophétie tombera au bon moment.',
      '🌕 Quand la lune sera haute, Grook dansera.',
      '🧿 Un ancien message deviendra pertinent.',
      '🌀 Tu éviteras le spam sans le savoir.',
      '⚡ Bientôt, un membre sera modéré par son propre mute.',
      '📜 La prophétie annonce la fin… mais pas aujourd’hui.',
      '👁️ Le serveur survivra tant que personne ne prononcera mon nom trois fois.'
    ];
    const content = props[Math.floor(Math.random() * props.length)];
    const embed = new EmbedBuilder()
      .setTitle('Prophétie de Grook')
      .setDescription(content)
      .setColor(0x8800ff)
      .setFooter({ text: 'Les étoiles sont capricieuses' })
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
    lastProphecyTimes.set(guildId, Date.now());
    return true;
  }
  return false;
}
