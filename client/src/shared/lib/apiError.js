/**
 * Преобразует ответ axios в структуру для rejectWithValue и форм.
 *
 * @param {Error} error - Ошибка axios.
 * @param {string} fallback - Сообщение ошибки по умолчанию.
 * @returns {Object} - Объект с сообщением ошибки и полями ошибки.
 */
export const parseApiError = (error, fallback = 'Ошибка запроса') => {
  if (!error) {
    return { message: fallback };
  }

  // Ошибка уже нормализована
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
 * Получает текст ошибки для toast / Alert.
 *
 * @param {Error} error - Ошибка axios.
 * @param {string} fallback - Сообщение ошибки по умолчанию.
 * @returns {string} - Текст ошибки.
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
 * Сообщение для Redux state.error из payload thunk.
 *
 * @param {Object} payload - payload thunk.
 * @param {string} fallback - Сообщение ошибки по умолчанию.
 * @returns {string} - Текст ошибки.
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
