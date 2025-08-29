// Initialisation SQLite (optionnel) pour remplacer les fichiers JSON.
// npm i sqlite3 sqlite
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
export async function openDb(dbFile = path.join(process.cwd(), 'data', 'grook.db')) {
  const db = await open({ filename: dbFile, driver: sqlite3.Database });
  await db.exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cases_guild_user ON cases(guild_id, user_id);
    CREATE TABLE IF NOT EXISTS warns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_warns_guild_user ON warns(guild_id, user_id);
    CREATE TABLE IF NOT EXISTS stats (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}
