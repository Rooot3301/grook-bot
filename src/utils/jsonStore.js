import fs from 'fs/promises';
import path from 'path';

// Simple asynchronous JSON store with basic read/write helpers.
// Reads a JSON file and returns the parsed object or a default value on error.
export async function readJSON(file, defaultValue = {}) {
  try {
    const data = await fs.readFile(file, 'utf8');
    if (!data) return defaultValue;
    return JSON.parse(data);
  } catch (err) {
    // If the file does not exist or JSON is invalid, return the default
    return defaultValue;
  }
}

// Writes a JavaScript object to a JSON file atomically.
export async function writeJSON(file, obj) {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const data = JSON.stringify(obj, null, 2);
  await fs.writeFile(file, data, 'utf8');
}