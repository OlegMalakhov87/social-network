/**
 * Преобразует ошибку Axios в сообщение и ошибки полей.
 *
 * @param {Error|Object|null|undefined} error - Ошибка Axios или уже разобранный объект
 * @param {string} [fallback='Ошибка запроса'] - Запасное сообщение
 * @returns {{ message: string, fieldErrors?: Object }} Сообщение и ошибки полей, если они есть.
 */
export const parseApiError = (error, fallback = 'Ошибка запроса') => {
  if (!error) {
    return { message: fallback };
  }

  // Возвращает прежнее сообщение, если ошибка уже разобрана.
  if (
    typeof error === 'object' &&
    error !== null &&
    typeof error.message === 'string' &&
    !error.response
  ) {
    return {
      message: error.message || fallback,
      ...(error.fieldErrors && {
        fieldErrors: error.fieldErrors,
      }),
    };
  }

  const data = error.response?.data;
  const message = data?.error || data?.message || error.message || fallback;

  const fieldErrors = {};

  if (Array.isArray(data?.details)) {
    for (const item of data.details) {
      const field = item?.field;
      const fieldMessage = item?.message;

      if (field && fieldMessage) {
        fieldErrors[field] = fieldMessage;
      }
    }
  }

  return Object.keys(fieldErrors).length > 0
    ? { message, fieldErrors }
    : { message };
};

/**
 * Возвращает текст ошибки для уведомления.
 *
 * @param {Error|Object|string|null|undefined} error - Ошибка Axios, объект или строка
 * @param {string} [fallback='Неизвестная ошибка'] - Запасное сообщение
 * @returns {string} Текст ошибки.
 */
export const getApiErrorDisplay = (error, fallback = 'Неизвестная ошибка') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return error.message || fallback;
  }
  return fallback;
};

/**
 * Возвращает сообщение ошибки из данных Redux.
 *
 * @param {Object|string|null|undefined} payload - Данные результата
 * @param {string} [fallback='Неизвестная ошибка'] - Запасное сообщение
 * @returns {string} Текст ошибки.
 */
export const apiErrorMessageFromPayload = (
  payload,
  fallback = 'Неизвестная ошибка'
) => {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    return payload.message || fallback;
  }
  return fallback;
};
