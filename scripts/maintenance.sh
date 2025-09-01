#!/bin/bash
# Script de maintenance pour Grook Bot
# Usage: ./scripts/maintenance.sh

echo "🔧 MAINTENANCE GROOK BOT"
echo "========================"

# 1. Backup automatique
echo "💾 Création d'un backup..."
npm run backup

# 2. Nettoyage des logs anciens
echo "🧹 Nettoyage des logs..."
find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || echo "Pas de logs anciens à supprimer"

# 3. Rotation des logs PM2
echo "🔄 Rotation des logs PM2..."
pm2 flush 2

# 4. Vérification de l'espace disque
echo "💽 Vérification espace disque..."
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  ATTENTION: Espace disque faible ($DISK_USAGE%)"
else
    echo "✅ Espace disque OK ($DISK_USAGE%)"
fi

# 5. Vérification mémoire
echo "🧠 Vérification mémoire..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "⚠️  ATTENTION: Utilisation mémoire élevée ($MEMORY_USAGE%)"
else
    echo "✅ Utilisation mémoire OK ($MEMORY_USAGE%)"
fi

# 6. Redémarrage si nécessaire
if [ $DISK_USAGE -gt 90 ] || [ $MEMORY_USAGE -gt 90 ]; then
    echo "🔄 Redémarrage préventif du bot..."
    pm2 restart 2
fi

echo "✅ Maintenance terminée"