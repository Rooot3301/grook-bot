import express from 'express';

/**
 * Démarre un serveur de health check simple pour le monitoring
 * @param {Object} options Configuration
 * @param {number} options.port Port d'écoute
 * @param {import('discord.js').Client} options.client Client Discord
 * @returns {import('http').Server}
 */
export function startHealthServer({ port = 3001, client }) {
  const app = express();
  
  // Endpoint de health check
  app.get('/health', (req, res) => {
    const isReady = !!client?.user;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: isReady ? 'healthy' : 'starting',
      bot: {
        ready: isReady,
        user: client?.user?.tag || null,
        guilds: client?.guilds?.cache?.size || 0
      },
      system: {
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Endpoint de métriques basiques
  app.get('/metrics', (req, res) => {
    const metrics = {
      commands_total: client?.commands?.size || 0,
      guilds_total: client?.guilds?.cache?.size || 0,
      users_total: client?.guilds?.cache?.reduce((acc, guild) => acc + guild.memberCount, 0) || 0,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
    
    res.json(metrics);
  });
  
  const server = app.listen(port, () => {
    console.log(`[Health] 🏥 Serveur de monitoring démarré sur le port ${port}`);
  });
  
  return server;
}