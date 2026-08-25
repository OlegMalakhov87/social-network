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
 * Валидатор целого числа.
 * @param {number} [min] - минимальное значение
 * @param {number} [max] - максимальное значение
 * @param {string} [message]
 * @returns {Function}
 */
export const integer =
  (min = null, max = null, message = 'Должно быть целым числом') =>
  (value) => {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isInteger(num)) {
      return message;
    }
    if (min !== null && num < min) {
      return `Минимум ${min}`;
    }
    if (max !== null && num > max) {
      return `Максимум ${max}`;
    }
    return null;
  };

/**
 * Валидатор номера телефона.
 * @param {string} [message]
 * @returns {Function}
 */
export const phone =
  (message = 'Введите корректный номер телефона') =>
  (value) => {
    if (!value) return null;
    const cleaned = value.replace(/[\s\-()]/g, '');
    const isValid =
      /^\+7\d{10}$/.test(cleaned) ||
      /^8\d{10}$/.test(cleaned) ||
      /^\d{10}$/.test(cleaned);

    return isValid ? null : message;
  };

/**
 * Вализатор slug.
 * @param {string} [message]
 * @returns {Function}
 */
export const slug =
  (message = 'Только латиница, цифры, дефис и подчёркивание') =>
  (value) => {
    if (!value) return null;
    return /^[a-zA-Z0-9-_]+$/.test(value) ? null : message;
  };

/**
 * Валидатор даты.
 * @param {string} [message]
 * @returns {Function}
 */
export const date =
  (message = 'Введите корректную дату') =>
  (value) => {
    if (!value) return null;
    const regex = /^\d{4}\.\d{2}\.\d{2}$/;
    if (!regex.test(value)) return message;

    const [day, month, year] = value.split('.').map(Number);
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
      ? null
      : message;
  };

/**
 * Валидатор проверки префикса.
 * @param {string} prefix - префикс
 * @param {string} [message] - сообщение об ошибке
 * @returns {Function}
 */
export const startsWith =
  (prefix, message = `Должно начинаться с "${prefix}"`) =>
  (value) => {
    if (!value) return null;
    return value.startsWith(prefix) ? null : message;
  };

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
