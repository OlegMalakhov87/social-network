const cron = require('node-cron');
const mediaCleanupService = require('../src/services/mediaCleanupService');
const temporaryMediaService = require('../src/services/temporaryMediaService');

/**
 * Запускает периодическую очистку orphan-медиафайлов.
 *
 * Запуск каждый день в 18:00.
 */

// Флаг для предотвращения одновременного запуска нескольких очисток
let isRunning = false;

const startMediaCleanupJob = () => {
  cron.schedule('00 18 * * *', async () => {
    if (isRunning) {
      console.warn('[MediaCleanup] Предыдущая очистка ещё выполняется');
      return;
    }
    isRunning = true;

    try {
      console.log('='.repeat(50));
      console.log('Система очистки медиа файлов запущена');
      console.log(` Время запуска: ${new Date().toLocaleString()}`);

      await temporaryMediaService.cleanupExpired();
      console.log(`Система очистки временных записей завершена`);
      console.log(` Время завершения: ${new Date().toLocaleString()}`);

      await mediaCleanupService.cleanup();
      console.log('Система очистки медиа файлов завершена');
      console.log(` Время завершения: ${new Date().toLocaleString()}`);
      console.log('='.repeat(50));
    } catch (error) {
      console.error('Система очистки медиа файлов завершена с ошибкой:', error);
    } finally {
      isRunning = false;
    }
  });
};
module.exports = startMediaCleanupJob;
