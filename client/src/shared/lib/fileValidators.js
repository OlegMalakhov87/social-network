import { formatSize } from '../utils';

/**
 * Возвращает null при успехе или строку с ошибкой.
 * Проверка может быть синхронной или возвращать промис.
 */

/**
 * Проверяет размер файла.
 *
 * @param {number} maxBytes - Максимальный размер в байтах
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает текст ошибки или null.
 */
export const maxFileSize = (maxBytes, message) => (file) => {
  if (!file) return null;
  const isValid = file.size <= maxBytes;
  return isValid
    ? null
    : message || `Файл слишком большой (макс. ${formatSize(maxBytes)})`;
};

/**
 * Проверяет тип файла.
 *
 * @param {string[]} allowedTypes - Допустимые типы
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает текст ошибки или null.
 */
export const fileType = (allowedTypes, message) => (file) => {
  if (!file) return null;
  const isValid = allowedTypes.includes(file.type);
  return isValid ? null : message || 'Неподдерживаемый формат файла';
};

/**
 * Проверяет расширение файла.
 *
 * @param {string[]} allowedExtensions - Допустимые расширения
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает текст ошибки или null.
 */
export const fileExtension = (allowedExtensions, message) => (file) => {
  if (!file) return null;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const isValid = allowedExtensions.includes(ext);
  return isValid ? null : message || 'Недопустимое расширение файла';
};

/**
 * Применяет проверки файла по порядку и останавливается на первой ошибке.
 *
 * @param {Function[]} validators - Проверки файла
 * @returns {Function} Принимает файл и возвращает промис с текстом ошибки или null.
 */
export const composeValidators = (validators) => async (file) => {
  for (const validator of validators) {
    const error = await validator(file);
    if (error) return error;
  }
  return null;
};
