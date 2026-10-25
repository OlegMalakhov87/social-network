/**
 * Задает параметры автоматической обработки новостей.
 */
const NEWS_AUTOMATION_CONFIG = {
  botNickname: 'news_bot',

  maxCandidatesPerSourcePerRun: 5, // Защищает один источник от монополизации запуска.

  maxCandidatesPerRun: 10, // Ограничивает суммарное число запросов к модели за один запуск.

  maxAttempts: 3, // После этого числа технических ошибок кандидат получает конечный статус.

  cronSchedule: '0 * * * *', // Запускает задачу каждый час.
};

module.exports = {
  NEWS_AUTOMATION_CONFIG,
};
