const cron = require('node-cron');

const newsAutomationService = require('../src/services/newsAutomationService');
const { NEWS_AUTOMATION_CONFIG } = require('../config/newsAutomationConfig');

/**
 * Запрещает пересечение запусков автоматизации внутри одного процесса.
 * Для нескольких экземпляров сервера нужна отдельная распределенная блокировка.
 */
let isRunning = false;

/**
 * Запускает расписание автоматизированного сбора и обработки новостей.
 *
 * @returns {void} Ничего не возвращает.
 */
const startNewsAutomationCron = () => {
  cron.schedule(NEWS_AUTOMATION_CONFIG.cronSchedule, async () => {
    if (isRunning) {
      console.warn('[NewsAutomationCron] Предыдущий запуск еще выполняется.');

      return;
    }

    isRunning = true;

    const startedAt = Date.now();

    console.log('='.repeat(50));

    console.log(
      '[NewsAutomationCron] Запуск автоматизированного получения и обработки новостей'
    );

    try {
      const result = await newsAutomationService.run();

      console.log(
        '[NewsAutomationCron] Автоматизированное получение и обработка новостей завершено успешно',
        result
      );
    } catch (error) {
      console.error(
        '[NewsAutomationCron] Ошибка автоматизированного получения и обработки новостей:',
        error.message
      );
    } finally {
      console.log(
        `[NewsAutomationCron] Время выполнения: ${Date.now() - startedAt} ms`
      );
      console.log('='.repeat(50));
      isRunning = false;
    }
  });
};

module.exports = {
  startNewsAutomationCron,
};
