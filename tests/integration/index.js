#!/usr/bin/env node
/**
 * Tests d'intégration pour vérifier les interactions entre modules
 */
import assert from 'assert';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔗 Lancement des tests d\'intégration...\n');
)

// Test chargement des commandes
async function testCommandLoading() {
  console.log('⚙️ Test chargement des commandes...');
  
  const commandsDir = path.resolve(__dirname, '../../src/commands');
  const { loadCommands } = await import('../../src/loader/commands.js');
  
  // Mock client
  const mockClient = {
    commands: new Map(),
    commandCategories: new Map(),
    once: () => {},
    application: { commands: { set: () => {} } }
  };
  
  await loadCommands(mockClient);
  
  assert(mockClient.commands.size > 0, 'Aucune commande chargée');
  assert(mockClient.commands.has('grookspy'), 'Commande grookspy manquante');
  
  console.log(`✅ ${mockClient.commands.size} commandes chargées`);
}

// Test configuration
async function testConfig() {
  console.log('⚙️ Test configuration...');
  
  const { getGuildConfig, setGuildKey } = await import('../../src/services/configService.js');
  
  const testGuild = 'test_guild_integration';
  await setGuildKey(testGuild, 'test_key', 'test_value');
  
  const config = await getGuildConfig(testGuild);
  assert.equal(config.test_key, 'test_value', 'Configuration non sauvegardée');
  
  console.log('✅ Configuration OK');
}

async function runIntegrationTests() {
  try {
    await testCommandLoading();
    await testConfig();
    console.log('\n🎉 Tous les tests d\'intégration sont passés !');
  } catch (error) {
    console.error('\n❌ Échec des tests d\'intégration:', error.message);
    process.exit(1);
  }
}

runIntegrationTests();