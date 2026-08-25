/**
 * Преобразует ответ axios в структуру для rejectWithValue и форм.
 */
export const parseApiError = (error) => {
  const data = error.response?.data;
  const message = data?.error || error.message || 'Ошибка запроса';

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

  if (Object.keys(fieldErrors).length > 0) {
    return { message, fieldErrors };
  }
  return { message };
};

/**
 * Текст ошибки для toast / Alert.
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
 */
export const apiErrorMessageFromPayload = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    return payload.message || fallback;
  }
  return fallback;
};
