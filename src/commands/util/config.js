import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { loadConfig, saveConfig } from '../../features/modlogs.js';

/**
 * Commande de gestion de la configuration par serveur.
 * Permet de consulter ou modifier des paramètres persistants sans toucher aux fichiers.
 */
export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Afficher ou modifier les paramètres du serveur.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sc =>
    sc
      .setName('get')
      .setDescription('Obtenir la valeur d’un paramètre.')
      .addStringOption(opt => opt.setName('clé').setDescription('Nom du paramètre').setRequired(true))
  )
  .addSubcommand(sc =>
    sc
      .setName('set')
      .setDescription('Définir la valeur d’un paramètre.')
      .addStringOption(opt => opt.setName('clé').setDescription('Nom du paramètre').setRequired(true))
      .addStringOption(opt => opt.setName('valeur').setDescription('Nouvelle valeur').setRequired(true))
  )
  .addSubcommand(sc =>
    sc
      .setName('list')
      .setDescription('Lister tous les paramètres configurés pour ce serveur.')
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  if (!guildId) {
    return interaction.reply({ content: 'Cette commande ne peut être utilisée qu’en serveur.', ephemeral: true });
  }
  const cfg = loadConfig();
  if (!cfg.guilds) cfg.guilds = {};
  if (!cfg.guilds[guildId]) cfg.guilds[guildId] = {};
  const guildCfg = cfg.guilds[guildId];
  if (sub === 'get') {
    const key = interaction.options.getString('clé', true);
    const value = guildCfg[key];
    if (value === undefined) {
      return interaction.reply({ content: `⚙️ Le paramètre \`${key}\` n’est pas configuré.`, ephemeral: true });
    }
    return interaction.reply({ content: `⚙️ **${key}** = \`${value}\``, ephemeral: true });
  } else if (sub === 'set') {
    const key = interaction.options.getString('clé', true);
    const value = interaction.options.getString('valeur', true);
    guildCfg[key] = value;
    saveConfig(cfg);
    return interaction.reply({ content: `✅ Paramètre \`${key}\` défini sur \`${value}\``, ephemeral: true });
  } else if (sub === 'list') {
    const entries = Object.entries(guildCfg);
    if (entries.length === 0) {
      return interaction.reply({ content: 'Aucun paramètre n’est configuré pour ce serveur.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('Configuration du serveur')
      .setColor(0x00bfff)
      .setDescription(entries.map(([k, v]) => `• **${k}** = \`${v}\``).join('\n'));
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}