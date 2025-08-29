// Accès JSON asynchrone avec écriture atomique et sérialisation.
import fs from 'fs/promises';
import path from 'path';
const queues = new Map(); // filePath -> promise
async function ensureDir(file) { await fs.mkdir(path.dirname(file), { recursive: true }); }
export async function readJSON(file, fallback = {}) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    if (e.code === 'ENOENT') {
      await ensureDir(file);
      await fs.writeFile(file, JSON.stringify(fallback, null, 2), 'utf8');
      return fallback;
    }
    throw e;
  }
}
export async function writeJSON(file, data) {
  const prev = queues.get(file) || Promise.resolve();
  const next = prev.then(async () => {
    await ensureDir(file);
    const tmp = file + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, file); // atomic
  }).catch((e) => { console.error('[jsonStore] write failed:', e); });
  queues.set(file, next);
  await next;
}
