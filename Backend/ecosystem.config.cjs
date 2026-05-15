/**
 * PM2 ecosystem — Oxyra API
 * Usage on VPS:
 *   cd /var/www/html/Oxyra/Backend
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'oxyra-api',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
