const cron = require('node-cron');
const newsAutomationService = require('../src/services/newsAutomationService');
const { NEWS_AUTOMATION_CONFIG } = require('../config/newsAutomationConfig');

/**
 * Флаг, указывающий, выполняется ли автоматизация новостей в данный момент.
 * Защищает от пересечения cron-запусков внутри одного Node-процесса.
 * Для нескольких экземпляров backend потребуется распределённая блокировка.
 */
let isRunning = false;

/**
 * Запускает cron-задачу автоматизированного получения и обработки новостей.
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
