// Logger structuré avec fallback console (pino recommandé).
// npm i pino --save
let pino = null;
try { pino = (await import('pino')).default; } catch {}
const level = process.env.LOG_LEVEL || 'info';
export const logger = pino ? pino({ level }) : {
  info: (...a) => console.log('[info]', ...a),
  warn: (...a) => console.warn('[warn]', ...a),
  error: (...a) => console.error('[error]', ...a),
  debug: (...a) => { if (level === 'debug') console.log('[debug]', ...a); }
};
export function wireGlobalErrorHandlers() {
  process.on('unhandledRejection', (reason) => { logger.error({ reason }, 'UnhandledPromiseRejection'); });
  process.on('uncaughtException', (err) => { logger.error({ err }, 'UncaughtException'); });
}
