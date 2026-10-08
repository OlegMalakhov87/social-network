const cron = require('node-cron');
const mediaCleanupService = require('../src/services/mediaCleanupService');
const temporaryMediaService = require('../src/services/temporaryMediaService');
const messageService = require('../src/services/messageService');
const newsService = require('../src/services/newsService');

/** Флаг для предотвращения одновременного запуска нескольких очисток - false */
let isRunning = false;

/** Обёртка с изоляцией ошибок
 * @param {string} name - Название задачи
 * @param {function} task - Функция задачи
 * @returns {Promise<{name: string, success: boolean, result?: any, error?: string}>} - Результат выполнения задачи
 */
const runTask = async (name, task) => {
  const start = Date.now();
  console.log(`[Maintenance] ${name} — старт`);

  try {
    const result = await task();
    console.log(`[Maintenance] ${name} — завершено за ${Date.now() - start}мс`);
    return { name, success: true, result };
  } catch (error) {
    console.error(`[Maintenance] ${name} — ошибка:`, error.message);
    return { name, success: false, error: error.message };
  }
};

const startMaintenanceAndCleanupJob = () => {
  cron.schedule('00 18 * * *', async () => {
    if (isRunning) {
      console.warn('[Maintenance] Предыдущая очистка ещё выполняется');
      return;
    }

    // Блокируем параллельный запуск очистки
    isRunning = true;

    console.log('='.repeat(50));
    console.log('[Maintenance] Запуск');
    console.log(`[Maintenance] Время: ${new Date().toLocaleString()}`);

    try {
      const results = [];

      results.push(
        await runTask('Временные медиа', () =>
          temporaryMediaService.cleanupExpired()
        )
      );
      results.push(
        await runTask('Удалённые сообщения', () =>
          messageService.cleanupDeletedMessages()
        )
      );
      results.push(
        await runTask('Архивация новостей', () => newsService.archiveOldNews())
      );
      results.push(
        await runTask('Медиа-файлы', () => mediaCleanupService.cleanup())
      );

      const succeeded = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log('='.repeat(50));
      console.log(`[Maintenance] Успешно: ${succeeded}, Ошибок: ${failed}`);
      console.log(`[Maintenance] Завершено: ${new Date().toLocaleString()}`);
      console.log('='.repeat(50));
    } finally {
      // Разрешаем следующий запуск независимо от результата текущего
      isRunning = false;
    }
  });
};

module.exports = { startMaintenanceAndCleanupJob };
