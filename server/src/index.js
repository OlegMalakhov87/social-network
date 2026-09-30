const http = require('http');
const app = require('./app');
const { redis } = require('./lib/redis');
require('dotenv').config();
const { setupWebSocket } = require('./websocket');
const startMediaCleanupJob = require('../jobs/mediaCleanupJob');

// Cоздание сервера
const server = http.createServer(app);

// Настройка WebSocket
setupWebSocket(server);

// Порт сервера
const PORT = process.env.PORT || 5000;

// Проверка Redis подключения при старте
redis
  .ping()
  .then(() => console.log('[Redis] PONG — всё ок'))
  .catch((err) =>
    console.error('[Redis] Не удалось подключиться:', err.message)
  );

// Запуск задачи очистки медиафайлов
startMediaCleanupJob();

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(` Сервер запущен!`);
  console.log(` Локально: http://localhost:${PORT}`);
  console.log(` В сети: http://${require('os').hostname()}:${PORT}`);
  console.log(` Время: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});
