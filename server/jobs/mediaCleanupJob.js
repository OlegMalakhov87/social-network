const cron = require('node-cron');
const mediaCleanupService = require('../src/services/mediaCleanupService');

/**
 * Запускает периодическую очистку orphan-медиафайлов.
 *
 * Запуск каждый день в 03:00.
 */
const startMediaCleanupJob = () => {
  cron.schedule('19 23 * * *', async () => {
    try {
      await mediaCleanupService.cleanup();
      console.log('Очистка медиа завершена');
    } catch (error) {
      console.error('Ошибка очистки медиа:', error);
    }
  });
};
module.exports = startMediaCleanupJob;
