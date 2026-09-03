const path = require('path');

/**
 * Преобразует публичный URL в путь к файлу.
 *
 * @param {string} url - Публичный URL
 * @returns {string} Путь к файлу
 */
const fromPublicUrl = (url) => {
  if (!url) return null;

  return path.join(process.cwd(), url.replace(/^\/+/, ''));
};

module.exports = fromPublicUrl;
