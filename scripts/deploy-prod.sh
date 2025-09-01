#!/bin/bash
# Script de déploiement en production pour Grook Bot
# Usage: ./scripts/deploy-prod.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement Grook Bot v3.0.0 en production..."

# 1. Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi

# 2. Backup des données actuelles
echo "💾 Sauvegarde des données..."
node scripts/backup.js

# 3. Arrêter l'ancienne version (ID 2)
echo "🛑 Arrêt de l'ancienne version..."
pm2 stop 2 || echo "⚠️  Processus 2 déjà arrêté"

# 4. Installer les nouvelles dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# 5. Déployer les nouvelles commandes Discord
echo "⚡ Déploiement des commandes Discord..."
npm run deploy

# 6. Redémarrer avec la nouvelle version
echo "🔄 Redémarrage du bot..."
pm2 restart 2

# 7. Vérifier le statut
echo "✅ Vérification du statut..."
pm2 show 2

# 8. Afficher les logs récents
echo "📋 Logs récents:"
pm2 logs 2 --lines 10

echo "🎉 Déploiement terminé avec succès!"
echo "📊 Monitoring: pm2 monit"
echo "📋 Logs: pm2 logs 2"
echo "🏥 Health check: curl http://localhost:3001/health"