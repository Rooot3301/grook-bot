#!/bin/bash
# Script de monitoring pour Grook Bot
# Usage: ./scripts/monitor.sh

echo "🔍 MONITORING GROOK BOT"
echo "======================="

# Statut PM2
echo "📊 Statut PM2:"
pm2 show 2

echo ""
echo "💾 Utilisation mémoire:"
pm2 show 2 | grep -E "(memory|cpu)"

echo ""
echo "🏥 Health Check:"
curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health

echo ""
echo "📈 Métriques:"
curl -s http://localhost:3001/metrics | jq '.' 2>/dev/null || curl -s http://localhost:3001/metrics

echo ""
echo "📋 Logs récents (10 dernières lignes):"
pm2 logs 2 --lines 10 --nostream

echo ""
echo "🔄 Uptime système:"
uptime

echo ""
echo "💽 Espace disque:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "🎯 Processus Node.js:"
ps aux | grep -E "(node|PID)" | grep -v grep