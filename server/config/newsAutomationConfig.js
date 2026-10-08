/**
 * Конфигурация новостного бота.
 *
 * @type {Object}
 */
const NEWS_AUTOMATION_CONFIG = {
  botNickname: 'news_bot',

  maxCandidatesPerSourcePerRun: 5, // Защищает один источник от монополизации запуска.

  maxCandidatesPerRun: 10, // Ограничивает суммарное число LLM-запросов за один запуск.

  maxAttempts: 3, // После этого числа технических ошибок кандидат становится terminal.

  cronSchedule: '0 * * * *', // Каждый час.
};

module.exports = {
  NEWS_AUTOMATION_CONFIG,
};
