const cron = require('node-cron');
const mediaCleanupService = require('../src/services/mediaCleanupService');

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
      await mediaCleanupService.cleanup();
      console.log('Очистка медиа завершена');
    } catch (error) {
      console.error('Ошибка очистки медиа:', error);
    } finally {
      isRunning = false;
    }
  });
};
module.exports = startMediaCleanupJob;
