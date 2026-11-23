const http = require('node:http');
require('dotenv').config();
const { sequelize } = require('../db/models');

const app = require('./app');
const { redis } = require('./lib/redis');
const { setupWebSocket } = require('./websocket');
const {
  startMaintenanceAndCleanupJob,
} = require('../jobs/maintenanceCleanupJob');
const { startNewsAutomationCron } = require('../jobs/newsAutomationCron');

const server = http.createServer(app);

const { wss } = setupWebSocket(server);

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

let isShuttingDown = false; // Флаг для предотвращения повторного завершения

/**
 * Корректно завершает работу сервера при получении сигналов остановки.
 * Даёт активным запросам 60 секунд на завершение.
 *
 * @param {string} signal - Название сигнала (SIGTERM или SIGINT)
 */
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(
    `\n[Server] Получен ${signal}. Начинаем корректное завершение работы сервера...`
  );

  // Если что-то зависнет — принудительно убьём процесс через 60 секунд.
  const forceExitTimeout = setTimeout(() => {
    console.error('[Server] Таймаут завершения (60с). Принудительный выход.');
    process.exit(1);
  }, 60000);

  // Не позволяем таймауту держать процесс живым, если всё закрылось быстро
  forceExitTimeout.unref();

  try {
    // Закрываем WebSocket-сервер и принудительно отключаем клиентов.
    if (wss) {
      for (const client of wss.clients) {
        client.terminate();
      }
      await new Promise((resolve) => wss.close(resolve));
      console.log('[Server] WebSocket-сервер остановлен.');
    }

    // Перестаем принимать новые HTTP-запросы.
    const closeServerPromise = new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }

    await closeServerPromise;
    console.log('[Server] HTTP-сервер остановлен.');

    // Закрываем пул соединений с PostgreSQL.
    await sequelize.close();
    console.log('[Server] Подключение к PostgreSQL закрыто.');

    // Закрываем Redis.
    await redis.quit();
    console.log('[Server] Подключение к Redis закрыто.');

    console.log('[Server] Работа сервера успешно завершена.');
    process.exit(0);
  } catch (error) {
    console.error('[Server] Ошибка при завершении работы сервера:', error);
    process.exit(1);
  }
};

// Слушаем сигналы ОС
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
