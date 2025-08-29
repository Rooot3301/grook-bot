import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildConfig, setGuildKey } from '../../services/configService.js';
import { infoEmbed, successEmbed } from '../../utils/embed.js';

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
  const guildCfg = await getGuildConfig(guildId);
  if (sub === 'get') {
    const key = interaction.options.getString('clé', true);
    const value = guildCfg[key];
    if (value === undefined) {
      return interaction.reply({ content: `⚙️ Le paramètre \`${key}\` n’est pas configuré.`, ephemeral: true });
    }
    // Utiliser un embed d'information pour afficher la valeur
    const embed = infoEmbed({
      title: 'Paramètre',
      fields: [
        { name: 'Clé', value: key, inline: true },
        { name: 'Valeur', value: String(value), inline: true },
      ],
    });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  } else if (sub === 'set') {
    const key = interaction.options.getString('clé', true);
    const value = interaction.options.getString('valeur', true);
    await setGuildKey(guildId, key, value);
    const embed = successEmbed({ title: 'Paramètre mis à jour', description: `\`${key}\` = \`${value}\`` });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  } else if (sub === 'list') {
    const entries = Object.entries(guildCfg);
    if (entries.length === 0) {
      return interaction.reply({ content: 'Aucun paramètre n’est configuré pour ce serveur.', ephemeral: true });
    }
    const lines = entries.map(([k, v]) => `• **${k}** = \`${v}\``).join('\n');
    const embed = infoEmbed({ title: 'Configuration du serveur', description: lines });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}