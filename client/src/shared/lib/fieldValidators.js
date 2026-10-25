/**
 * Возвращает null при успехе или строку с ошибкой.
 */

/**
 * Проверяет, что значение непустое.
 *
 * @param {string} [message='Обязательное поле'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const required =
  (message = 'Обязательное поле') =>
  (value) =>
    value?.toString().trim() ? null : message;

/**
 * Проверяет минимальную длину значения.
 *
 * @param {number} length - Минимальная длина
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const minLength = (length, message) => (value) => {
  if (value == null || value === '') {
    return null;
  }
  return value?.length >= length
    ? null
    : message || `Минимум ${length} символов`;
};

/**
 * Проверяет максимальную длину значения.
 *
 * @param {number} length - Максимальная длина
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const maxLength = (length, message) => (value) => {
  if (value == null || value === '') {
    return null;
  }
  return value?.length <= length
    ? null
    : message || `Максимум ${length} символов`;
};

/**
 * Проверяет адрес URL.
 *
 * @param {string} [message='Некорректный URL'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
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
 * Проверяет адрес электронной почты.
 *
 * @param {string} [message='Некорректный email'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const email =
  (message = 'Некорректный email') =>
  (value) => {
    if (!value) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;
  };

/**
 * Проверяет совпадение значения с другим полем.
 *
 * @param {string} field - Имя поля для сравнения
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает значение и все значения формы и возвращает текст ошибки или null.
 */
export const match = (field, message) => (value, values) =>
  value === values[field] ? null : message || 'Значения не совпадают';

/**
 * Проверяет, что значение является целым числом в заданных границах.
 *
 * @param {number|null} [min=null] - Минимальное значение
 * @param {number|null} [max=null] - Максимальное значение
 * @param {string} [message='Должно быть целым числом'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
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
 * Проверяет номер телефона.
 *
 * @param {string} [message='Введите корректный номер телефона'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
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
 * Проверяет, что строка содержит только латиницу, цифры, дефис и подчёркивание.
 *
 * @param {string} [message='Только латиница, цифры, дефис и подчёркивание'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const slug =
  (message = 'Только латиница, цифры, дефис и подчёркивание') =>
  (value) => {
    if (!value) return null;
    return /^[a-zA-Z0-9-_]+$/.test(value) ? null : message;
  };

/**
 * Проверяет календарную дату не из будущего.
 *
 * @param {string} [message='Введите корректную дату'] - Текст ошибки
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const date =
  (message = 'Введите корректную дату') =>
  (value) => {
    if (!value) return null;

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value)) return message;

    const [year, month, day] = value.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return message;
    }

    const now = new Date();
    if (d > now) return message;

    return null;
  };

/**
 * Проверяет, что значение начинается с заданного начала.
 *
 * @param {string} prefix - Обязательное начало строки
 * @param {string} [message] - Текст ошибки, по умолчанию с требуемым началом
 * @returns {Function} Принимает значение и возвращает текст ошибки или null.
 */
export const startsWith =
  (prefix, message = `Должно начинаться с "${prefix}"`) =>
  (value) => {
    if (!value) return null;
    return value.startsWith(prefix) ? null : message;
  };

/**
 * Проверяет значение переданным условием.
 *
 * @param {Function} fn - Возвращает true для допустимого значения
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает значение и все значения формы и возвращает текст ошибки или null.
 */
export const custom = (fn, message) => (value, values) =>
  fn(value, values) ? null : message || 'Некорректное значение';
