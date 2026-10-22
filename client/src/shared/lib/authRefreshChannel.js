/**
 * Название канала для обмена сообщениями между вкладками.
 */
const AUTH_CHANNEL_NAME = 'socialnet:auth-session';

/**
 * Создаёт канал обмена сообщениями между вкладками.
 *
 * @returns {{
 *   publish: (message: object) => void,
 *   subscribe: (callback: Function) => Function,
 *   close: () => void
 * }}
 */
export const createAuthRefreshChannel = () => {
  if (typeof BroadcastChannel === 'undefined') {
    throw new Error('BroadcastChannel API недоступен');
  }

  const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);

  /** Публикация сообщения в канал. */
  const publish = (message) => {
    channel.postMessage(message);
  };

  /** Подписка на сообщения в канале. */
  const subscribe = (callback) => {
    const handler = (event) => {
      callback(event.data);
    };

    channel.addEventListener('message', handler);

    // Возвращаем функцию отписки.
    return () => {
      channel.removeEventListener('message', handler);
    };
  };

  /** Закрытие канала. */
  const close = () => {
    channel.close();
  };

  return {
    publish,
    subscribe,
    close,
  };
};
