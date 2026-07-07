/**
 * Валидатор обязательного поля
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const required =
  (message = 'Обязательное поле') =>
  (value) =>
    value?.toString().trim() ? null : message;

/**
 * Валидатор минимальной длины
 * @param {number} length - минимальная длина
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const minLength = (length, message) => (value) =>
  value?.length >= length ? null : message || `Минимум ${length} символов`;

/**
 * Валидатор максимальной длины
 * @param {number} length - максимальная длина
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const maxLength = (length, message) => (value) =>
  value?.length <= length ? null : message || `Максимум ${length} символов`;

/**
 * Валидатор URL
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const url =
  (message = 'Некорректный URL') =>
  (value) => {
    if (!value) return null;

    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  };

/**
 * Валидатор email
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const email =
  (message = 'Некорректный email') =>
  (value) => {
    if (!value) return null;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;
  };

/**
 * Валидатор совпадения значений
 * @param {string} field - поле для сравнения
 * @param {string} message - сообщение об ошибке
 * @returns {Function} - функция валидации
 */

export const match = (field, message) => (value, values) =>
  value === values[field] ? null : message || `Значения не совпадают`;

/**
 * Валидатор пользовательской функции
 * @param {Function} fn - пользовательская функция валидации
 * @returns {Function} - функция валидации
 */

export const custom = (fn, message) => (value, values) => fn(value, values) || message || `Некорректное значение`;
