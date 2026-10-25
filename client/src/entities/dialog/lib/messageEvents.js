const listeners = new Set();

/**
 * Подписывает обработчик на новое сообщение.
 *
 * @param {Function} listener - Обработчик нового сообщения
 * @returns {Function} Обработчик отписки
 */
export const subscribeNewMessage = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

/**
 * Передаёт новое сообщение подписчикам.
 *
 * @param {Object} message - Сообщение
 * @returns {void}
 */
export const publishNewMessage = (message) => {
  for (const listener of listeners) {
    try {
      listener(message);
    } catch (error) {
      console.error('Ошибка обработчика нового сообщения:', error);
    }
  }
};
