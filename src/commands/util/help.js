import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Commande d'aide avancée.
 *
 * Utilisations :
 *  • `/help` — liste toutes les commandes par catégorie (en filtrant selon les permissions de l'utilisateur).
 *  • `/help commande:<nom>` — affiche l'aide détaillée pour une commande spécifique.
 */
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Afficher l’aide générale ou l’aide détaillée d’une commande.')
  .addStringOption(opt =>
    opt
      .setName('commande')
      .setDescription('Nom de la commande pour obtenir de l’aide détaillée.')
      .setRequired(false)
  );

/**
 * Construit une chaîne d'exemple d'utilisation pour une commande à partir de sa définition.
 * Ex: <nom> <requises> [facultatives]
 * @param {import('discord.js').SlashCommandBuilder} slashCommand
 */
function buildUsage(slashCommand) {
  const options = slashCommand.options?.map?.(o => {
    const name = o.name;
    return o.required ? `<${name}>` : `[${name}]`;
  }) || [];
  return `/${slashCommand.name} ${options.join(' ')}`.trim();
}

/**
 * Convertit un champ DefaultMemberPermissions en une liste de noms lisibles.
 * @param {bigint|string|number|null} perms
 * @returns {string[]} noms des permissions ou tableau vide si aucune.
 */
function permsToNames(perms) {
  if (!perms) return [];
  const bitfield = BigInt(perms);
  const names = [];
  for (const [name, bit] of Object.entries(PermissionFlagsBits)) {
    const flag = typeof bit === 'bigint' ? bit : BigInt(bit);
    if ((bitfield & flag) === flag) names.push(name);
  }
  return names;
}

// Limite de caractères par champ dans un embed Discord (1024)
const MAX_FIELD_LENGTH = 1024;

/**
 * Ajoute un ou plusieurs fields dans l'embed en respectant la limite de longueur.
 * Si la valeur dépasse 1024 caractères, elle est découpée en plusieurs fields supplémentaires.
 *
 * @param {EmbedBuilder} embed L'embed à enrichir
 * @param {string} name Le nom du champ
 * @param {string} value Le texte à insérer
 */
function addChunkedField(embed, name, value) {
  if (!value) return;
  if (value.length <= MAX_FIELD_LENGTH) {
    embed.addFields({ name, value });
    return;
  }
  const lines = value.split('\n');
  let buffer = '';
  let index = 0;
  for (const line of lines) {
    // Vérifie si l'ajout d'une ligne dépasse la limite ; si oui, on pousse le buffer actuel
    const candidate = buffer ? `${buffer}\n${line}` : line;
    if (candidate.length > MAX_FIELD_LENGTH) {
      embed.addFields({ name: index === 0 ? name : `${name} (suite ${index})`, value: buffer });
      buffer = line;
      index++;
    } else {
      buffer = candidate;
    }
  }
  if (buffer) {
    embed.addFields({ name: index === 0 ? name : `${name} (suite ${index})`, value: buffer });
  }
}

export async function execute(interaction, client) {
  const cmdName = interaction.options.getString('commande');

  // Si un nom de commande est fourni, afficher l'aide détaillée
  if (cmdName) {
    const entry = client.commands.get(cmdName);
    if (!entry) {
      return interaction.reply({ content: `❌ La commande \`/${cmdName}\` est introuvable.`, ephemeral: true });
    }
    // Vérifie les permissions requises
    const requiredPerms = entry.data.defaultMemberPermissions;
    if (requiredPerms && !interaction.member.permissions.has(requiredPerms)) {
      return interaction.reply({ content: `⚠️ Vous n’avez pas la permission d’utiliser cette commande.`, ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle(`Aide pour /${entry.data.name}`)
      .setDescription(entry.data.description || 'Pas de description fournie.')
      .setColor(0x00bfff);

    // Usage et options
    embed.addFields({ name: 'Usage', value: `\`${buildUsage(entry.data)}\`` });
    if (entry.data.options && entry.data.options.length > 0) {
      const opts = entry.data.options.map(opt => {
        const req = opt.required ? '**(obligatoire)**' : '(facultatif)';
        const desc = opt.description || '';
        return `• \`${opt.name}\` ${req} – ${desc}`;
      }).join('\n');
      embed.addFields({ name: 'Options', value: opts });
    }

    // Permissions nécessaires
    const names = permsToNames(requiredPerms);
    if (names.length > 0) {
      embed.addFields({ name: 'Permissions requises', value: names.map(n => `\`${n}\``).join(', ') });
    }

    // Suggestion d'autres commandes de la même catégorie
    const category = entry.category || null;
    if (category) {
      const suggestions = (client.commandCategories.get(category) || []).filter(n => n !== entry.data.name);
      if (suggestions.length > 0) {
        const sug = suggestions.slice(0, 5).map(n => `\`/${n}\``).join(', ');
        embed.addFields({ name: 'Commandes connexes', value: sug });
      }
    }

    // Version du bot
    if (client.version) {
      embed.setFooter({ text: `Version ${client.version}` });
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Sinon, liste toutes les commandes disponibles par catégorie
  const embed = new EmbedBuilder()
    .setTitle(`Aide de ${client.user?.username || 'Grook'}`)
    .setDescription('Liste des commandes disponibles (filtrées selon vos permissions).')
    .setColor(0x00bfff);

  const categories = Array.from(client.commandCategories.keys()).sort((a, b) => a.localeCompare(b));
  for (const cat of categories) {
    // Pour chaque commande de la catégorie, vérifier si l'utilisateur a la permission
    const names = client.commandCategories.get(cat) || [];
    const visibles = [];
    for (const name of names) {
      const entry = client.commands.get(name);
      if (!entry) continue;
      const required = entry.data.defaultMemberPermissions;
      if (required && !interaction.member.permissions.has(required)) {
        continue;
      }
      const desc = entry.data.description || '';
      visibles.push(`• \`/${name}\` – ${desc}`);
    }
    if (visibles.length === 0) continue;
    const title = `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${visibles.length})`;
    const text = visibles.join('\n');
    // Utilise un découpage pour ne pas dépasser 1024 caractères par field
    addChunkedField(embed, title, text);
  }

  if (client.version) {
    embed.setFooter({ text: `Version ${client.version}` });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}