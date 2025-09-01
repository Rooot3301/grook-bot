#!/bin/bash
# Script de mise à jour rapide en production
# Usage: ./scripts/update-prod.sh

set -e

echo "🔄 MISE À JOUR GROOK BOT"
echo "========================"

# 1. Vérifier les changements Git
echo "📡 Vérification des mises à jour..."
git fetch origin

if git diff HEAD origin/main --quiet; then
    echo "✅ Aucune mise à jour disponible"
    exit 0
fi

echo "📥 Nouvelles modifications détectées"

# 2. Backup avant mise à jour
echo "💾 Backup de sécurité..."
npm run backup

# 3. Pull des changements
echo "📥 Récupération des modifications..."
git pull origin main

# 4. Vérifier si package.json a changé
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 package.json modifié, mise à jour des dépendances..."
    npm ci --only=production
fi

# 5. Vérifier si des commandes ont changé
if git diff HEAD~1 HEAD --name-only | grep -q "src/commands/"; then
    echo "⚡ Commandes modifiées, redéploiement..."
    npm run deploy
fi

# 6. Redémarrer le bot
echo "🔄 Redémarrage du bot..."
pm2 restart 2

# 7. Vérification
echo "✅ Vérification du statut..."
sleep 3
pm2 show 2

echo "🎉 Mise à jour terminée avec succès!"