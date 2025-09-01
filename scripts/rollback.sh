#!/bin/bash
# Script de rollback en cas de problème
# Usage: ./scripts/rollback.sh

set -e

echo "🔄 Rollback en cours..."

# 1. Arrêter le processus actuel
pm2 stop 2

# 2. Revenir à la version précédente (git)
git checkout HEAD~1

# 3. Réinstaller les dépendances de l'ancienne version
npm ci --only=production

# 4. Redéployer les anciennes commandes
npm run deploy

# 5. Redémarrer
pm2 restart 2

echo "✅ Rollback terminé"
pm2 show 2