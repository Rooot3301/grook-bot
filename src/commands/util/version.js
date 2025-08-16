import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Commande utilitaire permettant d'afficher la version courante du bot.
// La version est lue depuis le fichier package.json à la racine du
// projet.  Cette commande est utile pour vérifier rapidement si la
// version déployée correspond à celle du code source.

export const data = new SlashCommandBuilder()
  .setName('version')
  .setDescription('Affiche la version actuelle du bot.');

export async function execute(interaction) {
  try {
    // Déterminer le chemin absolu vers package.json
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pkgPath = path.resolve(__dirname, '../../../package.json');
    const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const version = pkg.version || '0.0.0';
    await interaction.reply({ content: `🤖 **Version du bot :** v${version}`, allowedMentions: { repliedUser: false } });
  } catch (error) {
    console.error('Erreur lors de la lecture de la version :', error);
    await interaction.reply({ content: 'Impossible de déterminer la version du bot.', allowedMentions: { repliedUser: false }, ephemeral: true });
  }
}