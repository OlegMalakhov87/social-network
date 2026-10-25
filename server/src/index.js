const http = require('node:http');

const app = require('./app');
const { redis } = require('./lib/redis');
require('dotenv').config();
const { setupWebSocket } = require('./websocket');
const {
  startMaintenanceAndCleanupJob,
} = require('../jobs/maintenanceCleanupJob');
const { startNewsAutomationCron } = require('../jobs/newsAutomationCron');

const server = http.createServer(app);

setupWebSocket(server);

const PORT = process.env.PORT || 5000;

redis
  .ping()
  .then(() => console.log('[Redis] Подключение установлено'))
  .catch((err) => console.error('[Redis] Ошибка:', err.message));

startMaintenanceAndCleanupJob();

startNewsAutomationCron();

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(` Сервер запущен!`);
  console.log(` Локально: http://localhost:${PORT}`);
  console.log(` В сети: http://${require('os').hostname()}:${PORT}`);
  console.log(` Время: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});
