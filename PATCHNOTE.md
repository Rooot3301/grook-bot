# Grook Bot – Patchnote (proposé) – v1.6.0

## Nouveau
- **Logger structuré** (pino) + **gestion globale des erreurs**.
- **Middleware commandes**: permissions, cooldowns, defer auto, erreurs uniformisées.
- **Commandes**: `/ping`, `/uptime`, `/help`, `/config`, `/warn add|list`.
- **CI GitHub Actions** (Node 20, test, audit).
- **.nvmrc** (Node 20.15.0).

## Changements
- **Easter eggs** beaucoup plus sobres: lazy 0.5%, rickroll 0.05%, prophecy 0.02%.
- Ajout de **cooldowns** (user/guilde) + **plafonds/heure & /jour** + options de blacklist/whitelist.
- Ajout utilitaires **jsonStore** (écritures atomiques & asynchrones) et **sqlite** (optionnel).

## Conseils de migration
- Remplacer progressivement `fs.*Sync` par `jsonStore` ou par SQLite.
- Ajouter validation `.env` (envalid) si souhaité.
- Ajouter `engines` dans `package.json` et scripts lint/format.

## Notes
- Version proposée: **1.6.0** (à appliquer via `npm version minor`).
