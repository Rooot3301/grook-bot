import fs from 'fs';
import path from 'path';

/**
 * Charge tous les events de src/events et attache les listeners au client.
 * Chaque event doit exporter un objet { name, once?, execute } (default export ou named).
 */
export async function loadEvents(client) {
  const eventsDir = path.join(path.resolve(), 'src', 'events');
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js')).sort((a,b)=>a.localeCompare(b));
  for (const file of files) {
    try {
      const mod = await import(`../events/${file}`);
      const evt = mod?.default ?? mod;
      if (!evt?.name || typeof evt.execute !== 'function') {
        console.warn(`⛔ Ignoré: event ${file} n'exporte pas { name, execute }`);
        continue;
      }
      const once = Boolean(evt.once);
      console.log(`[events] load ${file} -> ${evt.name} (once=${once})`);
      if (once) client.once(evt.name, (...args) => evt.execute(...args, client));
      else client.on(evt.name, (...args) => evt.execute(...args, client));
    } catch (e) {
      console.error(`❌ Erreur de chargement event ${file}:`, e);
    }
  }
}
