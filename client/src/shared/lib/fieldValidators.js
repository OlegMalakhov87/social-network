/**
 * Все валидаторы возвращают null при успехе или строку с ошибкой.
 */

/**
 * Валидатор обязательного поля.
 * @param {string} [message]
 * @returns {Function}
 */
export const required =
  (message = 'Обязательное поле') =>
  (value) =>
    value?.toString().trim() ? null : message;

/**
 * Валидатор минимальной длины.
 * @param {number} length
 * @param {string} [message]
 * @returns {Function}
 */
export const minLength = (length, message) => (value) =>
  value?.length >= length ? null : message || `Минимум ${length} символов`;

/**
 * Валидатор максимальной длины.
 * @param {number} length
 * @param {string} [message]
 * @returns {Function}
 */
export const maxLength = (length, message) => (value) =>
  value?.length <= length ? null : message || `Максимум ${length} символов`;

/**
 * Валидатор URL.
 * @param {string} [message]
 * @returns {Function}
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
 * Валидатор email.
 * @param {string} [message]
 * @returns {Function}
 */
export const email =
  (message = 'Некорректный email') =>
  (value) => {
    if (!value) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;
  };

/**
 * Валидатор совпадения значений двух полей.
 * @param {string} field - имя поля для сравнения
 * @param {string} [message]
 * @returns {Function}
 */
export const match = (field, message) => (value, values) =>
  value === values[field] ? null : message || 'Значения не совпадают';

/**
 * Пользовательский валидатор.
 * fn — предикат: возвращает true если значение валидно, false иначе.
 *
 * @param {Function} fn - (value, values) => boolean
 * @param {string} [message]
 * @returns {Function}
 */
export const custom = (fn, message) => (value, values) =>
  fn(value, values) ? null : message || 'Некорректное значение';
