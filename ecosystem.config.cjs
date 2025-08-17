// PM2 configuration for Grook Bot
// Ce fichier permet de démarrer le bot via PM2 avec une configuration personnalisée.

module.exports = {
  apps: [
    {
      // Nom de l'application dans PM2
      name: 'grook-bot',
      // Répertoire de travail (racine du projet)
      cwd: __dirname,
      // Script à exécuter (point d’entrée du bot)
      script: 'src/index.js',
      // Interpréteur à utiliser
      interpreter: 'node',
      args: [],

      // Options d'exécution
      instances: 1, // passer à 'max' pour utiliser tous les cœurs en mode cluster
      exec_mode: 'fork', // ou 'cluster' pour plusieurs instances
      watch: false, // activer en développement pour recharger au changement
      autorestart: true,
      restart_delay: 5000,
      min_uptime: '10s',
      max_restarts: 10,
      max_memory_restart: '300M',

      // Variables d’environnement
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Paris',
      },

      // Fichiers de logs
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};