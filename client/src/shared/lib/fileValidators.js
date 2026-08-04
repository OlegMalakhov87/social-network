import { formatSize } from '../utils';

/**
 * Универсальные валидаторы для загрузки файлов.
 * Все валидаторы возвращают null при успехе или строку с ошибкой.
 * Могут быть как синхронными, так и асинхронными (возвращать Promise).
 */

/**
 * Валидатор размера файла.
 * @param {number} maxBytes - максимальный размер в байтах
 * @param {string} [message] - кастомное сообщение об ошибке
 * @returns {Function} - (file) => string|null
 */
export const maxFileSize = (maxBytes, message) => (file) => {
  if (!file) return null;
  const isValid = file.size <= maxBytes;
  return isValid
    ? null
    : message || `Файл слишком большой (макс. ${formatSize(maxBytes)})`;
};

/**
 * Валидатор MIME-типа файла.
 * @param {string[]} allowedTypes - массив допустимых MIME-типов
 * @param {string} [message]
 * @returns {Function} - (file) => string|null
 */
export const fileType = (allowedTypes, message) => (file) => {
  if (!file) return null;
  const isValid = allowedTypes.includes(file.type);
  return isValid ? null : message || 'Неподдерживаемый формат файла';
};

/**
 * Валидатор расширения файла (дополнительная проверка поверх MIME).
 * @param {string[]} allowedExtensions - массив расширений ['.jpg', '.png']
 * @param {string} [message]
 * @returns {Function} - (file) => string|null
 */
export const fileExtension = (allowedExtensions, message) => (file) => {
  if (!file) return null;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const isValid = allowedExtensions.includes(ext);
  return isValid ? null : message || 'Недопустимое расширение файла';
};

/**
 * Композиция валидаторов: применяет массив валидаторов к файлу последовательно.
 * Поддерживает как синхронные, так и асинхронные валидаторы.
 * @param {Array<Function>} validators - массив валидаторов
 * @returns {Function} - (file) => Promise<string|null>
 */
export const composeValidators = (validators) => async (file) => {
  for (const validator of validators) {
    const error = await validator(file);
    if (error) return error;
  }
  return null;
};
