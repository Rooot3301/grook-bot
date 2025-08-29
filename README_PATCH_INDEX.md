## À intégrer dans `src/index.js` (extrait recommandé)

```js
import { logger, wireGlobalErrorHandlers } from './utils/logger.js';
wireGlobalErrorHandlers();

logger.info('Grook starting…');

// après le login:
client.once('ready', () => {
  logger.info({ user: client.user.tag }, 'Bot ready');
});
```

Et remplacer `console.log/error` par `logger.info/warn/error` progressivement.
```)

