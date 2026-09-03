const path = require('path');

/**
 * Преобразует путь к файлу в публичный URL.
 *
 * @param {string} filePath - Путь к файлу
 * @returns {string} Публичный URL
 */
const toPublicUrl = (filePath) => {
  if (!filePath) {
    return null;
  }

  return `/${path.relative(process.cwd(), filePath).replaceAll(path.sep, '/')}`;
};

module.exports = toPublicUrl;
