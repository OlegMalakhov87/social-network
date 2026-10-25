/**
 * Хранит имя канала авторизации между вкладками.
 */
const AUTH_CHANNEL_NAME = 'socialnet:auth-session';

/**
 * Создаёт канал сообщений об авторизации между вкладками.
 *
 * @returns {{
 *   publish: (message: Object) => void,
 *   subscribe: (callback: Function) => Function,
 *   close: () => void
 * }} Публикация, подписка и закрытие канала.
 */
export const createAuthRefreshChannel = () => {
  if (typeof BroadcastChannel === 'undefined') {
    throw new Error('BroadcastChannel API недоступен');
  }

  const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);

  /**
   * Публикует сообщение в канал.
   *
   * @param {Object} message - Сообщение для других вкладок
   * @returns {void}
   */
  const publish = (message) => {
    channel.postMessage(message);
  };

  /**
   * Подписывается на сообщения канала.
   *
   * @param {Function} callback - Получает данные сообщения
   * @returns {Function} Отменяет подписку.
   */
  const subscribe = (callback) => {
    /**
     * Передаёт данные сообщения подписчику.
     *
     * @param {MessageEvent} event - Событие канала
     * @returns {void}
     */
    const handler = (event) => {
      callback(event.data);
    };

    channel.addEventListener('message', handler);

    return () => {
      channel.removeEventListener('message', handler);
    };
  };

  /**
   * Закрывает канал.
   *
   * @returns {void}
   */
  const close = () => {
    channel.close();
  };

  return {
    publish,
    subscribe,
    close,
  };
};
