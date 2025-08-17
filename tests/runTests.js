import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Résoudre __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Teste toutes les commandes sans exécuter de code dépendant des modules externes.
 * On lit le contenu de chaque fichier et on vérifie qu'il exporte `data` et `execute`.
 */
function testCommands() {
  const commandsDir = path.resolve(__dirname, '../src/commands');
  function walk(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files = files.concat(walk(full));
      else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
    }
    return files;
  }
  const files = walk(commandsDir);
  assert(files.length > 0, 'Aucune commande trouvée');
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    assert(/export const data/.test(source), `La commande ${file} n’exporte pas 'data'`);
    assert(/export (async )?function execute/.test(source), `La commande ${file} n’exporte pas 'execute'`);
  }
  console.log(`✓ ${files.length} commandes vérifiées (signature)`);
}

/**
 * Teste la lecture et l'écriture du fichier de configuration directement.
 */
function testConfig() {
  const configPath = path.resolve(__dirname, '../src/data/config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  const cfg = JSON.parse(raw || '{}');
  // Utilise un guildId temporaire
  const gid = 'test_guild';
  if (!cfg.guilds) cfg.guilds = {};
  if (!cfg.guilds[gid]) cfg.guilds[gid] = {};
  cfg.guilds[gid].testKey = 'foo';
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  const after = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert(after.guilds?.[gid]?.testKey === 'foo', 'Écriture ou lecture du config.json échouée');
  // Nettoyage
  delete after.guilds[gid].testKey;
  fs.writeFileSync(configPath, JSON.stringify(after, null, 2), 'utf8');
  console.log('✓ Config fichier lecture/écriture OK');
}

function run() {
  testCommands();
  testConfig();
  console.log('Tous les tests sont passés avec succès');
}

try {
  run();
} catch (err) {
  console.error(err);
  process.exit(1);
}