# Hotfix ZIP (déploiement commandes)

Ce patch corrige l'erreur **APPLICATION_COMMANDS_DUPLICATE_NAME** en :
- Ajoutant **/settings** (remplace l'ancienne /config)
- Filtrant **config** lors du déploiement
- Dédupliquant automatiquement les commandes portant le même nom

## Installation
1. Décompresse ce zip **à la racine du repo**.
2. (Optionnel) Supprime `src/commands/admin/config.js` si présent.
3. Déploie en guilde (nettoyage) puis en global :
```bash
WIPE_BEFORE_DEPLOY=true GUILD_ID=TON_GUILD_ID npm run deploy
WIPE_BEFORE_DEPLOY=true npm run deploy
```
