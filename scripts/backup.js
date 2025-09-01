#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(projectRoot, 'backups', `backup-${timestamp}`);
    
    // Créer le dossier de backup
    await fs.mkdir(backupDir, { recursive: true });
    
    // Copier les données
    const dataDir = path.join(projectRoot, 'src', 'data');
    const files = await fs.readdir(dataDir).catch(() => []);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const src = path.join(dataDir, file);
        const dest = path.join(backupDir, file);
        await fs.copyFile(src, dest);
        console.log(`✅ Sauvegardé: ${file}`);
      }
    }
    
    // Nettoyer les anciens backups (garder les 10 derniers)
    const backupsDir = path.join(projectRoot, 'backups');
    const backups = await fs.readdir(backupsDir).catch(() => []);
    const sortedBackups = backups
      .filter(name => name.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (sortedBackups.length > 10) {
      for (const oldBackup of sortedBackups.slice(10)) {
        await fs.rm(path.join(backupsDir, oldBackup), { recursive: true });
        console.log(`🗑️ Supprimé: ${oldBackup}`);
      }
    }
    
    console.log(`🎉 Backup créé: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Erreur backup:', error.message);
    process.exit(1);
  }
}

createBackup();