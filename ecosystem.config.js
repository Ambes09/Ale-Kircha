module.exports = {
  apps: [
    {
      name: 'ale-kircha-api',
      script: 'apps/api/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'ale-kircha-customer-bot',
      script: 'apps/customer-bot/dist/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'ale-kircha-admin-bot',
      script: 'apps/admin-bot/dist/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
